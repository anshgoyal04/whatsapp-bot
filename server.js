const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

// ROUTES
const webhookRoute = require("./routes/webhook");
const sendMessageRoute = require("./routes/sendMessage");
const sendTemplateRoute = require("./routes/sendTemplate");

app.use("/webhook", webhookRoute);
app.use("/send-message", sendMessageRoute);
app.use("/send-template", sendTemplateRoute);

// HOME
app.get("/", (req, res) => {
  res.send("WhatsApp Bot Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});