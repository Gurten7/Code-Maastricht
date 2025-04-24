const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const ONESIGNAL_APP_ID = "0c55e75a-a7cc-4829-8359-3171d4f456d0";
const ONESIGNAL_API_KEY = "os_v2_app_brk6owvhzrecta2zgfy5j5cw2b5qo73qy3bu74vrzeuzkiz52oqmq4ne6qzvp4u7a6a5lg64r4qg3gkxrmgp5yac3polbaa6mpo7ota";

app.post("/push", async (req, res) => {
  const { title, message, tags } = req.body;

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    headings: { en: title },
    contents: { en: message },
    included_segments: ["Subscribed Users"],
    filters: tags?.length ? tags.flatMap((tag, i) => [
      ...(i > 0 ? [{ operator: "OR" }] : []),
      { field: "tag", key: "team", relation: "=", value: tag }
    ]) : undefined,
  };

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Fout bij verzenden melding:", error);
    res.status(500).json({ error: "Mislukt" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Pushserver draait op poort ${PORT}`);
});
