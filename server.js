const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');

const app = express();

// Alleen requests van jouw GitHub Pages site toestaan:
app.use(cors({
  origin: 'https://gurten7.github.io',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));
app.options('/upload', cors()); // Voor preflight (OPTIONS) requests

app.use(express.json());

// Multer voor het uploaden in geheugen
const upload = multer({ storage: multer.memoryStorage() });

// Firebase admin initialiseren met credentials uit secret
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'puzzeltocht-maastricht.appspot.com'
});

const bucket = admin.storage().bucket();

// Upload endpoint
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

// Server starten
app.listen(process.env.PORT || 3000, () => {
  console.log('Server draait');
});
