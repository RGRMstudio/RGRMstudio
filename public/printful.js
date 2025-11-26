// netlify/functions/printful.js
export async function handler(event, context) {
  const apiKey = process.env.PRINTFUL_API_KEY;

  const response = await fetch('https://api.printful.com/store/products', {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data, null, 2),
  };
}
