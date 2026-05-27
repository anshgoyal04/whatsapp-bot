const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/", async (req, res) => {

  try {

    const contactsPath = path.join(
      __dirname,
      "../data/contacts.json"
    );

    const contacts = JSON.parse(
      fs.readFileSync(contactsPath)
    );

    let results = [];

    for (const number of contacts) {

      try {

        const response = await axios.post(

          `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,

          {
            messaging_product: "whatsapp",

            to: number,

            type: "template",

            template: {

              name: "my_first_temp",

              language: {
                code: "en_US"
              },

              components: [
                {
                  type: "header",

                  parameters: [
                    {
                      type: "image",

                      image: {
                        link: "https://www.navnoor.co/assets/img3.jpeg"
                      }
                    }
                  ]
                }
              ]
            }
          },

          {
            headers: {
              Authorization: `Bearer ${process.env.TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );

        console.log(
          `Template sent to ${number}`
        );

        results.push({
          number,
          status: "success"
        });

      } catch (err) {

        console.log(
          `Failed for ${number}`
        );

        results.push({
          number,
          status: "failed"
        });
      }
    }

    res.json(results);

  } catch (err) {

    console.log(err);

    res.status(500).send(
      "Bulk sending failed"
    );
  }
});

module.exports = router;