const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Sta CORS toe vanuit je frontend
const allowedOrigins = ['https://gurten7.github.io'];
app.use(cors({
  origin: allowedOrigins,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Firebase credentials via secret
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'puzzeltocht-maastricht.appspot.com'
});

const bucket = admin.storage().bucket();

// Preflight support
app.options('/upload', cors());

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const path = req.body.path;

  if (!file || !path) {
    return res.status(400).json({ error: 'Bestand of pad ontbreekt' });
  }

  const blob = bucket.file(path);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype
    }
  });

  blobStream.on('error', (err) => {
    console.error(err);
    res.status(500).json({ error: 'Fout bij uploaden' });
  });

  blobStream.on('finish', () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    res.status(200).json({ url: publicUrl });
  });

  blobStream.end(file.buffer);
});

// Start de server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server draait op poort ${port}`);
});
