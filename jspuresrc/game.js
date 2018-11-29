let canvas, ctx, lc, hc, vaisseau;
let playerLevel1 = new Image();
let SPRITE_WIDTH = 28;
let SPRITE_HEIGHT = 54;

window.onload = function init() {
    let game = new GF();
    game.start();
    playerLevel1.src= "../src/assets/player_level1_spritesheet.png";
};

let GF = function () {
    let tableauEnnemis = [];
    let tableauBalles = [];
    let tableauQueue = {};
    let score = 0;
    let estSurchaufee = false;
    let estPerdu = false;
    let estGagne = false;
    let estMusicPause = false;

    /* ---------------   NEW VARIABLES  -------------------*/

    let LEFT = {
        x: 0,
        y: 0,
    };

    let RIGHT = {
        x: 56,
        y: 0,
    };

    let NEUTRAL = {
        x: 28,
        y: 0,
    };

    let inputs = {};

    function mainLoop() {

        ctx.clearRect(0, 0, lc, hc);

        if (inputs.left) {
            vaisseau.draw(ctx, LEFT);
            if(vaisseau.x > -10) {
                vaisseau.left();
            }

        } else if (inputs.right) {
            vaisseau.draw(ctx, RIGHT);
            if(vaisseau.x+16 < canvas.width) {
                vaisseau.right();
            }
        } else {
            vaisseau.draw(ctx, NEUTRAL);
        }

        //Ennemis affichés
        tableauEnnemis.forEach((r) => {
            r.draw(ctx);
        });

        //Affichage des balles
        tableauBalles.forEach((r) => {
            r.tirer(ctx);
        });

        //Suppression de la balle dans le cas ou elle sort de l'écran
        tableauBalles.forEach((r) => {
            if (r.y < 0) {
                tableauBalles.splice(tableauBalles.indexOf(r), 1);
            } else {
                r.bougerBalle(ctx);
            }
        });

        //Perdu !
        tableauEnnemis.forEach((r) => {
            if (r.y > 270 && !estPerdu) {
                sound.play('explosion');
                estPerdu = true;
            }
        });

        if (tableauEnnemis.length == 0) {
            estGagne = true;
        }

        //Vérification de la colision entre une balle et un ennemi
        tableauBalles.forEach((b) => {
            tableauEnnemis.forEach((e) => {
                if ((e.x < b.x &&
                    b.x < e.x + 10) && (e.y < b.y && b.y < e.y + 10) ||
                    (e.x < b.x + 4 &&
                        b.x + 4 < e.x + 10) && (e.y < b.y && b.y < e.y + 10)
                ) {
                    sound.play('invaderkill');
                    tableauEnnemis.splice(tableauEnnemis.indexOf(e), 1);
                    tableauBalles.splice(tableauBalles.indexOf(b), 1);
                    score++;
                }
            });
        });

        //Affichage du score et des messages de victoire ou de perte
        if (!estPerdu) {
            if (estGagne) {
                ctx.fillStyle = "#000";
                ctx.font = "20px Georgia";
                ctx.fillText("Congrats ! ", canvas.width / 2 - 100, canvas.height / 2);
                ctx.fillText("Score: " + score, canvas.width / 2 - 100, canvas.height / 1.6);
                ctx.fillText("Press R to play again", canvas.width / 2 - 100, canvas.height / 1.2);
            } else {
                ctx.fillStyle = "#000";
                ctx.font = "20px Georgia";
                ctx.fillText("Score: " + score, canvas.width / 3, canvas.height / 2);
            }
        } else {
            ctx.fillStyle = "#000";
            ctx.font = "20px Georgia";
            ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
            ctx.fillText("Press R to retry", canvas.width / 2 - 100, canvas.height / 1.6);
        }
        requestAnimationFrame(mainLoop);
    }

    function startGame() {

        canvas = document.querySelector("#myCanvas");
        lc = canvas.width;
        hc = canvas.height;

        ctx = canvas.getContext("2d");

        initiateGame();

        window.addEventListener('keydown', function (event) {
            if (event.keyCode === 37) {
                inputs.left = true;
            } else if (event.keyCode === 38) {
                inputs.up = true;
            } else if (event.keyCode === 39) {
                inputs.right = true;
            } else if (event.keyCode === 40) {
                inputs.down = true;
            } else if (event.keyCode === 32) {
                inputs.space = true;
            }
        }, false);

        //if the key will be released, change the states object
        window.addEventListener('keyup', function (event) {
            if (event.keyCode === 37) {
                inputs.left = false;
            } else if (event.keyCode === 38) {
                inputs.up = false;
            } else if (event.keyCode === 39) {
                inputs.right = false;
            } else if (event.keyCode === 40) {
                inputs.down = false;
            } else if (event.keyCode === 32) {
                inputs.space = false;
            }
        }, false);

        requestAnimationFrame(mainLoop);
    }

    function initiateGame() {
        vaisseau = new Vaisseau();
        creerFlote();
    }

    function setSurchauffe() {
        estSurchaufee = false;
    }

    function moveEnnemies() {
        tableauEnnemis.forEach((e) => {
            e.move(ctx);
        });
    }

    function creerFlote() {
        for (let j = 0; j < canvas.height / 4; j += 20) {
            for (let i = 0; i < canvas.width; i += 20) {
                let ennemi = new Ennemi(i, j);
                tableauEnnemis.push(ennemi);
            }
        }

    }

    return {
        start: startGame
    };
};

class Vaisseau {
    constructor() {
        // on définit les propriétés qu'on veut avoir à la construction
        this.x = canvas.width / 2;
        this.y = 200;
        this.vx = 5;
    }

    draw(ctx, state) {
        ctx.drawImage(playerLevel1, state.x, state.y, SPRITE_WIDTH, SPRITE_HEIGHT, this.x, this.y, SPRITE_WIDTH, SPRITE_HEIGHT);
    }

    left() {
        this.x -= this.vx;
    }

    right() {
        this.x += this.vx;
    }
}

class Ennemi {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(this.x, this.y, 10, 10);
    }

    move() {
        this.y += 0.4;
    }
}

class Balle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    tirer() {
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(this.x, this.y, 4, 10);
    }

    bougerBalle() {
        this.y--;
    }
}

