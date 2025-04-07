const app = express();

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
 
const port = process.env.PORT || 8080;
 app.listen(port, () => {
   console.log(`✅ Pushserver draait op poort ${port}`);
