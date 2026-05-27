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

        // console.log("FULL WEBHOOK:");
        // console.log(JSON.stringify(req.body, null, 2));
        // const rawLogsPath = path.join(
        //     __dirname,
        //     "../logs/raw-webhooks.txt"
        // );

        // // Separator
        // fs.appendFileSync(
        //     rawLogsPath,
        //     "\n\n====================\n\n"
        // );

        // // Save full webhook payload
        // fs.appendFileSync(
        //     rawLogsPath,
        //     JSON.stringify(req.body, null, 2)
        // );
        const message =
            req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (!message) {
            console.log("No message object found");

            return res.sendStatus(200);
        }

        const from = message.from;
        const text =
  message.type === "text"
    ? message.text?.body || ""
    : "";
        const usersFilePath = path.join(
            __dirname,
            "../data/users.json"
        );
        const blockedNumbers = [
            "917387003336"
        ];

        if (blockedNumbers.includes(from)) {
            return res.sendStatus(200);
        }
        
        console.log("FULL WEBHOOK:");
        console.log(JSON.stringify(req.body, null, 2));
        const rawLogsPath = path.join(
            __dirname,
            "../logs/raw-webhooks.txt"
        );

        // Separator
        fs.appendFileSync(
            rawLogsPath,
            "\n\n====================\n\n"
        );

        // Save full webhook payload
        fs.appendFileSync(
            rawLogsPath,
            JSON.stringify(req.body, null, 2)
        );
        let users = [];

        if (fs.existsSync(usersFilePath)) {
            users = JSON.parse(
                fs.readFileSync(usersFilePath)
            );
        }

        let user = users.find(
            (u) => u.number === from
        );

        if (!user) {

            user = {
                number: from,
                welcomed: false,
                selectedOptions: []
            };

            users.push(user);
        }

        let reply = "";

        // FIRST MESSAGE ONLY
        if (!user.welcomed) {

            reply =
  "Welcome to Navnoor ✨\n\nWe’re delighted to have you here!\nExplore our premium collection crafted with quality and trust.\n\nPlease choose an option below to continue:\n\n1️⃣ Contact Us\n2️⃣ Product Catalog\n3️⃣ Order Now\n\nThank you for connecting with Navnoor ❤️";
            user.welcomed = true;
        }

        // OPTION 1
        // else if (
        //     text === "1" &&
        //     !user.selectedOptions.includes("1")
        // ) {

        //     reply =
        //         "Please visit our product catalog ✨";

        //     user.selectedOptions.push("1");
        // }

        // // OPTION 2
        // else if (
        //     text === "2" &&
        //     !user.selectedOptions.includes("2")
        // ) {

        //     reply =
        //         "Shipping usually takes 3-5 business days 🚚";

        //     user.selectedOptions.push("2");
        // }

        // // OPTION 3
        // else if (
        //     text === "3" &&
        //     !user.selectedOptions.includes("3")
        // ) {

        //     reply =
        //         "Our support team will contact you shortly ❤️";

        //     user.selectedOptions.push("3");
        // }
// CONTACT OPTION
else if (
  text === "1" &&
  !user.selectedOptions.includes("1")
) {

  reply =
    "📧 Contact Us\n\nEmail: navnoor.official@gmail.com\n\n🌐 Website:\nhttps://www.navnoor.co";

  user.selectedOptions.push("1");
}

// CATALOG OPTION
else if (
  text === "2" &&
  !user.selectedOptions.includes("2")
) {

  reply =
    "📦 Product Catalog:\n\nhttps://www.navnoor.co/";

  user.selectedOptions.push("2");
}

// ORDER OPTION
else if (
  text === "3" &&
  !user.selectedOptions.includes("3")
) {

  reply =
    "🛒 Order Now:\n\nhttps://tinyurl.com/Aloe-Face-cleanser";

  user.selectedOptions.push("3");
}
        // SAVE USERS
        fs.writeFileSync(
            usersFilePath,
            JSON.stringify(users, null, 2)
        );

        // STOP IF NO REPLY
        if (!reply) {

            console.log(
                "No reply needed"
            );

            return res.sendStatus(200);
        }
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
        // let reply = "";

        // if (text === "1") {
        //   reply = "Please visit our product catalog ✨";
        // }
        // else if (text === "2") {
        //   reply =
        //     "Shipping usually takes 3-5 business days 🚚";
        // }
        // else if (text === "3") {
        //   reply =
        //     "Our support team will contact you shortly ❤️";
        // }
        // else {
        //   reply =
        //     "Welcome to Navnoor ✨\n\nHow can we help you today?\n\n1️⃣ Products\n2️⃣ Shipping\n3️⃣ Support";
        // }

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