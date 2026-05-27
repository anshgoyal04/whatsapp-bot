const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const number = req.query.number;

        // CHECK NUMBER
        if (!number) {

            return res.send(
                "Please provide WhatsApp number"
            );
        }

        const response = await axios.post(

            `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,

            {
                messaging_product: "whatsapp",

                to: number,

                type: "template",

                template: {

                    name: "navnoor_lead_flow",

                    language: {
                        code: "en"
                    },
                    components: [
                        {
                            type: "button",

                            sub_type: "flow",

                            index: "0",

                            parameters: []
                        }
                    ]
                    //   components: [
                    //     {
                    //       type: "header",

                    //       parameters: [
                    //         {
                    //           type: "image",

                    //           image: {
                    //             link: "https://www.navnoor.co/assets/img3.jpeg"
                    //           }
                    //         }
                    //       ]
                    //     }
                    //   ]
                }
            },

            {
                headers: {
                    Authorization: `Bearer ${process.env.TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Template sent");

        console.log(response.data);

        res.send("Template sent successfully");

    } catch (err) {

        console.log(
            err.response?.data || err.message
        );

        res.status(500).send(
            "Error sending template"
        );
    }
});

module.exports = router;