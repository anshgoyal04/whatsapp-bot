const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { number } = req.body;

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
          name: "welcome_template",
          language: {
            code: "en",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);

  } catch (err) {
    console.log(err.response?.data || err.message);

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;