
/* -------------------- NPM
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv cors helmet morgan https fs
*/

/* -------------------- SSL
mkdir certs
openssl req -newkey rsa:2048 -nodes -keyout certs/private.key -x509 -days 365 -out certs/certificate.crt
*/

/* -------------------- MONGODB
sudo systemctl start mongod # Linux
brew services start mongodb-community # macOS
mongo
*/

require("dotenv").config();
console.log("MONGO_URI =", process.env.MONGO_URI);

const fs = require("fs");
const https = require("https");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");

// const gameRoutes = require("./routes/game");
// const mapRoutes = require("./routes/map");
// const tileRoutes = require("./routes/tile");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// ➡️ Ici, le nom de la base de données  ( terra_vitae )
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("❌ Erreur : MONGO_URI n'est pas défini !");
    process.exit(1); // Arrête l’application
}

// Connexion MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connecté"))
    .catch(err => console.error("Erreur MongoDB :", err));

// Routes API
app.use("/api/auth", authRoutes);
// app.use("/api/game", gameRoutes);
// app.use("/api/map", mapRoutes);
// app.use("/api/tile", tileRoutes);

// Démarrer le serveur HTTPS avec certificat SSL
const sslOptions = {
    key: fs.readFileSync("certs/private.key"),
    cert: fs.readFileSync("certs/certificate.crt")
};

https.createServer(sslOptions, app).listen(443, () => {
    console.log("Serveur HTTPS sécurisé lancé sur le port 443");
});
