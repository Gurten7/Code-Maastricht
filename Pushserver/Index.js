const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SIGNAL_API_KEY = "Basic 5wpbbdzw5ugb4w2mghacxol4e";
const APP_ID = "0c55e75a-a7cc-4829-8359-3171d4f456d0";

app.post("/push", async (req, res) => {
  const { title, message, tag } = req.body;

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": SIGNAL_API_KEY,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        headings: { en: title },
        contents: { en: message },
        filters: [
          { field: "tag", key: "team", relation: "=", value: tag }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OneSignal fout:", data);
      return res.status(500).json({ error: "Pushmelding mislukt", details: data });
    }

    res.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Netwerkfout:", err);
    res.status(500).json({ error: "Netwerkfout bij push", details: err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pushserver draait op poort ${PORT}`);
});
