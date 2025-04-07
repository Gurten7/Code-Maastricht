const express = require("express");
const path = require("path");
const fetch = require("node-fetch"); // Alleen nodig bij Node <18
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 8080;

// === Tokens ===
const CLIENT_TOKEN = "geheimvoorclient"; // Alleen frontend mag hiermee pushverzoeken doen
const ONESIGNAL_TOKEN = "os_v2_app_brk6owvhzrecta2zgfy5j5cw2dhv5ple2ycelse2g6xnjq7rdvrybny7uhjsvuxlrbcqoe6iw3kyod3hywgehbwt33ugi745uoler6q";
// ✅ CORS correct ingesteld voor je frontend
app.use(cors({
  origin: "*", // Of specifieker: "https://puzzeltochtmaastricht.fly.dev"
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("/push", cors()); // Preflight requests

// === Alleen jouw frontend mag CORS-verzoeken doen ===
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://puzzeltochtmaastricht.fly.dev");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(bodyParser.json());

// === JSON-body parsing ===
app.use(express.json());
// ✅ OneSignal instellingen
const APP_ID = "0c55e75a-a7cc-4829-8359-3171d4f456d0";
const SIGNAL_API_KEY = "Basic hv5ple2ycelse2
