// http://localhost:8000/

console.log("✅ main.js chargé !");

// ➡️ Cette partie démarre Phaser et prépare les scènes.
const config = {
    type: Phaser.AUTO,  // Auto sélectionne WebGL ou Canvas
    width: 1600,         // Largeur du jeu
    height: 1200,        // Hauteur du jeu
    scene: {
        preload: preload,  // Charger les assets
        create: create,    // Construire la scène
        update: update     // Boucle de mise à jour
    }
};

let game = new Phaser.Game(config); // Création du jeu


let player;
const tileSize = 50; // Taille d'une tuile hexagonale

const tileSizeX = 50; // Taille d'une tuile hexagonale
const tileSizeY = 43; // Taille d'une tuile hexagonale

const originX = 50; // Point de départ X
const originY = 50; // Point de départ Y
const originCenter = 0.5 ; // Point d'origine pour le centre

const cols = 12;
const rows = 12;

let grid = [];          // Les tuiles sur la Grille
let fogGrid = [];       // Les tuiles de brouillard sur la Grille

let playerRow = 7;  // Position initiale du joueur (ligne)
let playerCol = 2;  // Position initiale du joueur (colonne)

let bgMusic;        // Musique de fond
let moveSound;      // Son de déplacement

let musicEnabled = true;
let soundEnabled = true;

// User informations
let user_is_logged = false ;
let user_name = "" ;


let gridValues = [
    [1, 1, 1, 2, 2, 2, 2, 2, 2, 5, 5, 5],
    [1, 1, 1, 1, 7, 1, 1, 8, 8, 8, 2, 2],
    [2, 4, 1, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [8, 2, 1, 2, 5, 2, 7, 3, 8, 8, 5, 5],
    [6, 3, 1, 1, 6, 2, 2, 2, 8, 8, 4, 4],
    [8, 8, 8, 2, 3, 2, 7, 4, 1, 4, 4, 1],
    [8, 8, 8, 8, 7, 2, 2, 2, 1, 5, 7, 1],
    [8, 8, 7, 8, 8, 5, 2, 5, 8, 4, 1, 4],
    [8, 8, 2, 5, 8, 8, 1, 1, 2, 2, 1, 5],
    [1, 1, 1, 1, 7, 5, 7, 8, 8, 8, 8, 5],
    [1, 1, 7, 4, 6, 5, 2, 8, 8, 8, 8, 6],
    [8, 4, 4, 4, 2, 2, 8, 8, 8, 8, 8, 8]
];


// ➡️ this.load.image() charge les fichiers avant l'affichage.

function preload() {
    this.load.image('hex1', 'assets/hexR50.png'); // Image de tuile hexagonale
    this.load.image('hex2', 'assets/hexG50.png'); // Image de tuile hexagonale
    this.load.image('hex3', 'assets/hexB50.png'); // Image de tuile hexagonale
    this.load.image('hex4', 'assets/hexW50.png'); // Image de tuile hexagonale
    this.load.image('hex5', 'assets/hexa4-50.png'); // Image de tuile hexagonale
    this.load.image('hex6', 'assets/hexa5-50.png'); // Image de tuile hexagonale
    this.load.image('hex7', 'assets/hexa6-50.png'); // Image de tuile hexagonale
    this.load.image('hex8', 'assets/hexa7-50.png'); // Image de tuile hexagonale
    this.load.image('hexMyst', 'assets/hexMyst50.png'); // Image de tuile hexagonale
    this.load.image('player', 'assets/player.png'); // Image du joueur
    this.load.audio('moveSound', 'assets/move.wav');  // Son de déplacement
    this.load.audio('bgMusic', 'assets/background.mp3');  // Musique de fond

}

// ➡️ Return True si les coordonnées passées en paramètres sont dans le champ de vision du pion
function inSight(row,col) {
    if (col > playerCol + 1) return false
    if (col < playerCol - 1) return false
    if (row > playerRow + 1) return false
    if (row < playerRow -1) return false

    if (playerCol % 2 !== 0) {
        if (row == playerRow -1 && col == playerCol-1) return false
        if (row == playerRow -1 && col == playerCol+1) return false
    }
    else {
        if (row == playerRow +1 && col == playerCol-1) return false
        if (row == playerRow +1 && col == playerCol+1) return false
    }
    return true;
}


window.showLogin = function() {
    document.getElementById("login-container").style.display = "block";
    document.getElementById("register-container").style.display = "none";
    document.getElementById("login-tab").style.background = "#444";
    document.getElementById("register-tab").style.background = "#333";
}

window.showRegister = function() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("register-container").style.display = "block";
    document.getElementById("login-tab").style.background = "#333";
    document.getElementById("register-tab").style.background = "#444";
}

function register() {
    let username = document.getElementById("register-username").value;
    let password = document.getElementById("register-password").value;

    if (username.length < 3 || password.length < 6) {
        document.getElementById("register-error").textContent = "Nom min. 3 caractères, mot de passe min. 6 caractères.";
        document.getElementById("register-error").style.display = "block";
        return;
    }

    fetch('https://127.0.0.1:443/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log("✅ Inscription réussie ! Auto-login...");
                login(username, password); // Auto-login après inscription
            } else {
                document.getElementById("register-error").textContent = "Erreur : " + data.error;
                document.getElementById("register-error").style.display = "block";
            }
        })
        .catch(error => console.error("Erreur lors de l'inscription :", error));
}


let global_scene = null ;

function logged() {
    user_is_logged = true ;
    global_scene?.loginButton?.setText('🔒');
    global_scene.infoText?.setVisible(true);
    global_scene?.usersurname?.setText(user_name);
    loadGame();
}

function login(username = null, password = null) {
    if (!username || !password) {
        username = document.getElementById("login-username").value;
        password = document.getElementById("login-password").value;
    }

    fetch("https://127.0.0.1:443/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                console.log("🔐 Connexion réussie !");
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("playerId", data.playerId);
                document.getElementById("auth-container").style.display = "none";
                // loadGame();
                logged();
                user_name = username;
            } else {
                document.getElementById("login-error").style.display = "block";
            }
        })
        .catch(error => console.error("Erreur d’authentification :", error));
}



function logout() {
    localStorage.removeItem("authToken"); // Supprimer le token
    console.log("Déconnexion réussie !");
    alert("Vous avez été déconnecté.");
    window.location.reload(); // Recharger la page pour revenir à la connexion

    user_is_logged = false ;
    global_scene?.loginButton?.setText('🔓');
    global_scene.infoText?.setVisible(false);
    bgMusic.stop();
    user_name = "";
    global_scene?.usersurname?.setText("disconnected");
}




// ➡️ Cette boucle génère une grille hexagonale en respectant l’alignement.
function create() {

    global_scene = this;




    this.fadeOutFog = function (row, col) {
        this.tweens.add({
            targets: fogGrid[row][col], // Cible : la tuile du brouillard
            alpha: 0, // Disparition complète
            duration: 500, // Durée de l'effet en millisecondes
            ease: 'Power2' // Adoucissement du mouvement
        });
    }

    this.revealTiles=function() {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (true == inSight(row,col)) {
                    if (fogGrid[row][col] != null) {
                        //fogGrid[row][col].setAlpha(0); // Rendre transparent
                        this.fadeOutFog(row,col);
                    }
                }
            }
        }
    }


    this.movePlayer = function (x, y) {
        // Déplacement en douceur
        if (x>player.x+tileSizeX || x<player.x-tileSizeX) return;
        if (y>player.y+tileSizeY || y<player.y-tileSizeY) return;


        let col = (x - originX) / (tileSizeX-12) ;
        let delta = 0;
        if (col % 2 !== 0) delta = 21 ;
        let row = (y - originY - delta ) / tileSizeY ;
        console.log("movePlayer",x,y,col,row);

        playerRow=row;
        playerCol=col;

        player.x = x;
        player.y = y;
        this.revealTiles();  // Mise à jour du brouillard
        this.updateDashboardInfo();
        if (soundEnabled)
            moveSound.play();  // Joue le son de déplacement
    }

    this.toggleMusic = function () {
        musicEnabled = !musicEnabled;

        if (musicEnabled) {
            if (user_is_logged == true)
                bgMusic.play();
            this.musicButton.setText('🎵');
        } else {
            bgMusic.stop();
            this.musicButton.setText('🔕');
        }
    }

    this.toggleSound = function () {
        soundEnabled = !soundEnabled;
        this.soundButton.setText(soundEnabled ? '🔊' : '🔇');
    }

    this.toggleLogin  = function () {
        if (true == user_is_logged) {
            logout();
        }
        else {
            document.getElementById("login-container").style.display = "block";
        }

    }

    bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
    moveSound = this.sound.add('moveSound'); // Préparation du son

    this.updateDashboardInfo=function () {
        this.dashboard.infoText.setText(`Infos :\n- Position : (${playerRow}, ${playerCol})\n- Ressources : ${gridValues[playerRow][playerCol]}`);
    }

    let scene = this;

    // Création du tableau de bord à droite
    let dashboardWidth = 250;
    let dashboard = scene.add.rectangle(800 - dashboardWidth / 2, 300, dashboardWidth, 600, 0x222222, 0.8);
    dashboard.setOrigin(0.5);

    // Ajout d'un titre
    let title = scene.add.text(800 - dashboardWidth + 20, 20, "Tableau de Bord", { fontSize: "20px", fill: "#FFF" });

    // Placeholder pour les informations diverses
    this.infoText = scene.add.text(800 - dashboardWidth + 20, 60, "Infos :\n- Position : (x, y)\n- Ressources : 0", { fontSize: "16px", fill: "#FFF" });
    this.infoText.setVisible (false);

    // Placeholder pour les boutons d'actions
    this.musicButton = scene.add.text(800 - dashboardWidth + 20, 500, "🎵", { fontSize: "18px", fill: "#FFF", backgroundColor: "#444" })
        .setInteractive()
        .on('pointerdown', this.toggleMusic.bind(this));

    this.soundButton = scene.add.text(800 - dashboardWidth + 60, 500, "🔊", { fontSize: "18px", fill: "#FFF", backgroundColor: "#444" })
        .setInteractive()
        .on('pointerdown', this.toggleSound.bind(this));

    this.loginButton = scene.add.text(800 - dashboardWidth + 100, 500, "🔓", { fontSize: "18px", fill: "#FFF", backgroundColor: "#444" })
        .setInteractive()
        .on('pointerdown', this.toggleLogin.bind(this));

    // Placeholder pour les informations diverses
    this.usersurname = scene.add.text(800 - dashboardWidth + 20, 530, "disconnected", { fontSize: "12px", fill: "#FFF" });

    // Stocker les éléments pour mise à jour future
    scene.dashboard = {
        infoText: this.infoText,
        usersurname: this.usersurname,
        musicButton: this.musicButton,
        soundButton: this.soundButton,
        loginButton: this.loginButton
    };

    let token = localStorage.getItem("authToken");

    if (!token) {
        console.log("Utilisateur non connecté");
        document.getElementById("login-container").style.display = "block";
    } else {
        console.log("Utilisateur déjà connecté, chargement du jeu...");
        document.getElementById("auth-container").style.display = "none";

        try {
            let payload = JSON.parse(atob(token.split(".")[1])); // Décodage du token
            user_name = payload.username; // Récupérer le username
            console.log("👤 Utilisateur connecté :", user_name);
        } catch (err) {
            console.error("❌ Erreur lors du décodage du token :", err);
        }

        logged();
    }


}

function loadGame() {

    bgMusic.play();

    // Génération de la grille hexagonale
    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        fogGrid[row] = [];
        for (let col = 0; col < cols; col++) {
            let y = originY + row * tileSizeY ;
            let x = originX + col * (tileSizeX-12)  ;

            if (col % 2 !== 0) y += 21 ; //tileSizeX * Math.sqrt(3) / 2;

            hex = 'hex' + gridValues[row][col];

            let tile = global_scene.add.image(x, y, hex).setOrigin(originCenter);
            tile.setInteractive();
            tile.on('pointerdown', () => global_scene.movePlayer(x, y)); // Déplacement au clic
            grid[row][col] = tile;

            let fog = global_scene.add.image(x, y, 'hexMyst').setOrigin(originCenter);
            fogGrid[row][col] = fog;

            if (true == inSight(row,col)) {
                fogGrid[row][col].setAlpha(0); // Rendre transparent
            }
        }
    }

    // Placement du joueur sur une case initiale
    player = global_scene.add.image(grid[playerRow][playerCol].x, grid[playerRow][playerCol].y, 'player').setOrigin(originCenter);

}

function update() {
    // Logique de mise à jour si nécessaire
}


