const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {

  try {

    console.log("FLOW DATA:");
    console.log(
      JSON.stringify(req.body, null, 2)
    );

    const inquiriesPath = path.join(
      __dirname,
      "../data/inquiries.json"
    );

    let inquiries = [];

    if (fs.existsSync(inquiriesPath)) {

      inquiries = JSON.parse(
        fs.readFileSync(inquiriesPath)
      );
    }

    inquiries.push({
      data: req.body,
      time: new Date()
    });

    fs.writeFileSync(
      inquiriesPath,
      JSON.stringify(inquiries, null, 2)
    );

    console.log(
      "Inquiry saved"
    );

    res.sendStatus(200);

  } catch (err) {

    console.log(err);

    res.sendStatus(500);
  }
});

module.exports = router;