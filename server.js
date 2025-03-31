const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');

const app = express();

// ✅ Alleen je frontend domein toestaan
const corsOptions = {
  origin: 'https://gurten7.github.io/puzzeltochtmaastricht',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

// ✅ Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight CORS support
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// ✅ Firebase service account via Fly.io secret
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'puzzeltocht-maastricht.appspot.com'
});

const bucket = admin.storage().bucket();

// ✅ Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const path = req.body.path;

  if (!file || !path) {
    return res.status(400).json({ error: 'Bestand of pad ontbreekt' });
  }

  try {
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
      res.setHeader('Access-Control-Allow-Origin', 'https://gurten7.github.io'); // ✅ Cruciale extra CORS header
      res.status(200).json({ url: publicUrl });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload mislukt' });
  }
});

// ✅ Fly.io gebruikt standaard poort 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
