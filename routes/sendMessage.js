const express = require("express");
const router = express.Router();

const { sendWhatsAppMessage } = require("../utils/whatsapp");

router.post("/", async (req, res) => {
  try {
    const { number, message } = req.body;

    const response = await sendWhatsAppMessage(
      number,
      message
    );

    res.json(response);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;