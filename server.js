const fs = require("fs");
const path = require("path");
const express = require("express");
require("dotenv").config();
const sendTemplateAllRoute = require("./routes/sendTemplateAll");
const app = express();

app.use(express.json());

// ROUTES
const webhookRoute = require("./routes/webhook");
const sendMessageRoute = require("./routes/sendMessage");
const sendTemplateRoute = require("./routes/sendTemplate");

app.use("/webhook", webhookRoute);
app.use("/send-message", sendMessageRoute);
app.use("/send-template", sendTemplateRoute);
app.use("/send-template-all", sendTemplateAllRoute);
// HOME
app.get("/", (req, res) => {
  res.send("WhatsApp Bot Running");
});
app.get("/clear-messages", (req, res) => {

  const messagesFilePath = path.join(
    __dirname,
    "data/messages.json"
  );

  fs.writeFileSync(
    messagesFilePath,
    "[]"
  );

  res.send("Messages cleared");
});
app.get("/messages", (req, res) => {

  const messagesFilePath = path.join(
    __dirname,
    "data/messages.json"
  );

  if (!fs.existsSync(messagesFilePath)) {
    return res.json([]);
  }

  const data = fs.readFileSync(
    messagesFilePath,
    "utf8"
  );

  res.json(JSON.parse(data || "[]"));
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});