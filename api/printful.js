// api/printful.js  (Vercel serverless function)

export default async function handler(req, res) {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "PRINTFUL_API_KEY is not set" });
  }

  const response = await fetch("https://api.printful.com/store/products", {
    headers: {
      Authorization:
        "Basic " + Buffer.from(apiKey + ":").toString("base64"),
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  // Just forward Printful's data to the browser
  res.status(response.status).json(data);
}
