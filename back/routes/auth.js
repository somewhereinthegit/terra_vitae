const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

// Inscription
router.post("/register", async (req, res) => {
    try {
        // ➡️ Cette ligne extrait username et password de la requête POST envoyée par le client (fetch en front-end).
        const { username, password } = req.body;

        // ➡️ Le mot de passe est transformé en un hachage sécurisé avant d’être enregistré en base.
        const hashedPassword = await bcrypt.hash(password, 10);

        // ➡️ User est un modèle Mongoose, ce qui signifie que cette ligne crée un nouvel objet utilisateur, mais ne l’enregistre pas encore en base.
        const user = new User({ username, password: hashedPassword });

        // ➡️ Cette ligne enregistre effectivement l'utilisateur dans MongoDB.
        await user.save();

        // ➡️ Si tout se passe bien, le serveur renvoie un statut 201 (Created) et un message de confirmation.
        res.status(201).json({ message: "Utilisateur créé !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

/*
    Vérifier les users en bdd

    # mongo (ou App MondDB Compass | >_ Open MongoDB Shell)
    # use terra_vitae
    # db.users.find().pretty()

*/


// Connexion
router.post("/login", async (req, res) => {
    try {

        const { username, password } = req.body;
        console.log("🔍 Tentative de connexion pour :", username);

        const user = await User.findOne({ username });
        console.log("🔍 Utilisateur trouvé :", user);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Identifiants incorrects" });
        }

        console.log("🔐 Génération du stoken...");
        console.log("SECRET_KEY =", SECRET_KEY);
        // const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "24h" });

        const token = jwt.sign(
            { userId: user._id, username: user.username }, // Ajout de `username`
            SECRET_KEY,
            { expiresIn: "24h" }
        );


        console.log("✅ Connexion réussie !");
        res.json({ token });
    } catch (err) {
        
        console.error("❌ Erreur serveur :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Déconnexion (optionnel car le JWT est stocké côté client)
router.post("/logout", (req, res) => {
    res.json({ message: "Déconnexion réussie !" });
});

module.exports = router;
