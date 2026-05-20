const express = require("express");
const fs = require("fs");
const router = express.Router();

const { sendWhatsAppMessage } = require("../utils/whatsapp");

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
    const message =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    if (!message.from || !message.text?.body) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text.body.toLowerCase();

    console.log("Incoming:", text);

    // SAVE MESSAGE
    const messages = JSON.parse(
      fs.readFileSync("./data/messages.json")
    );

    messages.push({
      type: "incoming",
      from,
      text,
      time: new Date(),
    });

    fs.writeFileSync(
      "./data/messages.json",
      JSON.stringify(messages, null, 2)
    );

    // AUTO REPLY
    let reply = "";

    if (text === "1") {
      reply = "Please visit our product catalog ✨";
    }
    else if (text === "2") {
      reply = "Shipping usually takes 3-5 business days 🚚";
    }
    else if (text === "3") {
      reply = "Our support team will contact you shortly ❤️";
    }
    else {
      reply =
        "Welcome to Navnoor ✨\n\nHow can we help you today?\n\n1️⃣ Products\n2️⃣ Shipping\n3️⃣ Support";
    }

    await sendWhatsAppMessage(from, reply);

    // SAVE OUTGOING
    messages.push({
      type: "outgoing",
      to: from,
      text: reply,
      time: new Date(),
    });

    fs.writeFileSync(
      "./data/messages.json",
      JSON.stringify(messages, null, 2)
    );

    console.log("Reply sent");

    return res.sendStatus(200);

  } catch (err) {
    console.log(err.response?.data || err.message);

    return res.sendStatus(500);
  }
});

module.exports = router;