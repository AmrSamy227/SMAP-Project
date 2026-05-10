const fetch = require('node-fetch'); // or use built-in fetch if node 18+

async function testWebhook() {
  try {
    const response = await fetch("https://joelolo.app.n8n.cloud/webhook/f91bbaec-770a-4977-a774-85a1efd864dddd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "عندي صداع وحرارة",
        chat_id: "user_id"
      })
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response text:", text);
  } catch (error) {
    console.error("Error:", error);
  }
}

testWebhook();
