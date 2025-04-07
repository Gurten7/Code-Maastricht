const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

// ✅ Serveer alle bestanden (HTML, CSS, JS, icons)
app.use(express.static(path.join(__dirname)));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Frontend draait op poort ${port}`);
});
