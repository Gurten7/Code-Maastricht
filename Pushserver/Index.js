@@ -5,8 +5,14 @@ const fetch = require("node-fetch");
 
 const app = express();
 
 // ✅ Sta alle origins toe
 app.use(cors());
 // ✅ CORS correct ingesteld
 app.use(cors({
   origin: "*",
   methods: ["GET", "POST", "OPTIONS"],
   allowedHeaders: ["Content-Type"],
 }));
 app.options("/push", cors()); // Preflight requests
 
 app.use(bodyParser.json());
 
 const SIGNAL_API_KEY = "Basic 5wpbbdzw5ugb4w2mghacxol4e";
 @@ -38,7 +44,6 @@ app.post("/push", async (req, res) => {
   }
 });
 
 // ✅ Luister op poort (Fly.io)
 const port = process.env.PORT || 8080;
 app.listen(port, () => {
   console.log(`✅ Pushserver draait op poort ${port}`);
