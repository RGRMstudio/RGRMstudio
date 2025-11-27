 // server/printful.ts

import { config } from "dotenv";
config();

import fetch from "node-fetch";
import * as db from "./db";

// Make sure this env var is set in Vercel: PRINTFUL_API_KEY
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY ?? "";
if (!PRINTFUL_API_KEY) {
  console.warn("WARNING: PRINTFUL_API_KEY is not set");
}

/**
 * Low-level helper to call Printful API with correct headers.
 */
async function callPrintful(path: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.printful.com${path}`, {
    ...options,
    headers: {
      Authorization:
        "Basic " + Buffer.from(PRINTFUL_API_KEY + ":").toString("base64"),
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Printful error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Fetch raw products from Printful store.
 * Useful for debugging and admin views.
 */
export async function getStoreProducts() {
  // Returns object with { result: [ { id, main_variant_id, ... } ] }
  const data = await callPrintful("/store/products");
  return data;
}

/**
 * Sync products from Printful into local DB "products" table.
 * Assumes db has helpers like upsertProductFromPrintful; adjust as needed.
 */
export async function syncPrintfulProducts() {
  const  any = await callPrintful("/store/products");

  const items = data.result || [];

  for (const item of items) {
    const productId = item.id; // Printful sync product id
    const mainVariantId = item.main_variant_id;

    // Get full product + variant details so we have name, price, image
    const syncItem = await callPrintful(`/store/products/${productId}`);

    const productData = syncItem.result;
    const product = productData.product;
    const variants = productData.variants;

    const mainVariant =
      variants.find((v: any) => v.id === mainVariantId) || variants[0];

    const name = product.name as string;
    const description = product.description as string | undefined;
    const imageUrl = mainVariant.files?.[0]?.preview_url || product.thumbnail;
    const priceCents = Math.round(parseFloat(mainVariant.retail_price) * 100);

    // You already have a products table with printfulId, name, description, imageUrl, price, etc.[attached_file:2]
    await db.upsertProductFromPrintful({
      printfulId: String(productId),
      name,
      description,
      imageUrl,
      price: priceCents,
      isActive: 1,
    });
  }

  return items.length;
}

/**
 * Create a Printful order for a local order.
 * Expects your db functions to return order + items with product info.
 */
export async function createPrintfulOrder(orderId: number) {
  const order = await db.getOrderById(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  const orderItems = await db.getOrderItemsByOrderId(order.id);

  const itemsForPrintful: any[] = [];

  for (const item of orderItems) {
    const product = await db.getProductById(item.productId);
    if (!product || !product.printfulId) continue;

    // Here we send quantity and retail_price; you can also include variant_id if stored.[web:63][web:66]
    itemsForPrintful.push({
      sync_product_id: Number(product.printfulId),
      quantity: item.quantity,
      retail_price: (item.price / 100).toFixed(2),
    });
  }

  const payload = {
    external_id: order.id.toString(),
    recipient: {
      name: order.shippingName || "",
      address1: order.shippingAddress || "",
      city: order.shippingCity || "",
      state_code: order.shippingState || "",
      country_code:
        order.shippingCountry === "United States"
          ? "US"
          : order.shippingCountry || "US",
      zip: order.shippingZip || "",
    },
    items: itemsForPrintful,
  };

  const printfulOrder = await callPrintful("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Save Printful order id on local order so you can track status later.
  await db.updateOrderPrintfulId(order.id, String(printfulOrder.result.id));

  return printfulOrder;
}
