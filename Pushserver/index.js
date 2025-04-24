// pushserver/index.js

const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

const ONESIGNAL_APP_ID = "VUL_HIER_JE_APP_ID_IN";
const API_KEY = "VUL_HIER_JE_REST_API_KEY_IN";

app.post("/push", async (req, res) => {
  const { title, message, tags } = req.body;

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: message },
        filters: tags.map(tag => ({
          field: "tag",
          key: "team",
          relation: "=",
          value: tag
        }))
      })
    });

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pushserver draait op poort ${PORT}`);
});
