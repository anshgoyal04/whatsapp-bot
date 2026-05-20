const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const { sendWhatsAppMessage } = require("../utils/whatsapp");

// FILE PATH
const messagesFilePath = path.join(
  __dirname,
  "../data/messages.json"
);

// VERIFY WEBHOOK
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === process.env.VERIFY_TOKEN) {
    console.log("Webhook verified");

    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// RECEIVE MESSAGES
router.post("/", async (req, res) => {
  try {

    console.log("FULL WEBHOOK:");
    console.log(JSON.stringify(req.body, null, 2));

    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      console.log("No message object found");

      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body || "";

    console.log("Incoming:", text);

    // READ OLD DATA
    let messages = [];

    if (fs.existsSync(messagesFilePath)) {
      const data = fs.readFileSync(
        messagesFilePath,
        "utf8"
      );

      messages = JSON.parse(data || "[]");
    }

    // SAVE INCOMING
    messages.push({
      type: "incoming",
      from,
      text,
      time: new Date(),
    });

    fs.writeFileSync(
      messagesFilePath,
      JSON.stringify(messages, null, 2)
    );

    console.log("Incoming message saved");

    // AUTO REPLY
    let reply = "";

    if (text === "1") {
      reply = "Please visit our product catalog ✨";
    }
    else if (text === "2") {
      reply =
        "Shipping usually takes 3-5 business days 🚚";
    }
    else if (text === "3") {
      reply =
        "Our support team will contact you shortly ❤️";
    }
    else {
      reply =
        "Welcome to Navnoor ✨\n\nHow can we help you today?\n\n1️⃣ Products\n2️⃣ Shipping\n3️⃣ Support";
    }

    // SEND WHATSAPP MESSAGE
    const response = await sendWhatsAppMessage(
      from,
      reply
    );

    console.log("WhatsApp API Response:");
    console.log(response);

    // SAVE OUTGOING
    messages.push({
      type: "outgoing",
      to: from,
      text: reply,
      time: new Date(),
    });

    fs.writeFileSync(
      messagesFilePath,
      JSON.stringify(messages, null, 2)
    );

    console.log("Outgoing message saved");

    console.log("Reply sent");

    return res.sendStatus(200);

  } catch (err) {

    console.log("ERROR:");
    console.log(
      err.response?.data || err.message || err
    );

    return res.sendStatus(500);
  }
});

module.exports = router;