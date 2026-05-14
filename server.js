const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

// Webhook verification
app.get("/webhook", (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === verify_token) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Incoming WhatsApp messages
app.post("/webhook", async (req, res) => {
  try {
    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

if (!message.from || !message.text?.body) {
  console.log("Non-user message event skipped");
  return res.sendStatus(200);
}

const from = message.from;
const text = message.text.body.toLowerCase();

    console.log("Message:", text);

    let reply = "";

    // Menu options
    if (text === "1") {
      reply = "Please visit our product catalog ✨";
    } 
    else if (text === "2") {
      reply = "Shipping usually takes 3-5 business days 🚚";
    } 
    else if (text === "3") {
      reply = "Our support team will contact you shortly ❤️";
    } 
    
    // Default welcome message
    else {
      reply =
        "Welcome to Navnoor ✨\n\nHow can we help you today?\n\n1️⃣ Products\n2️⃣ Shipping\n3️⃣ Support";
    }

    // Send WhatsApp reply
    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: from,
        type: "text",
        text: {
          body: reply,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Reply sent");

    return res.sendStatus(200);

  } catch (err) {
    console.log("ERROR:");
    console.log(err.response?.data || err.message);

    return res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});