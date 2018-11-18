let canvas, ctx;
let lc, hc, vaisseau;
let tableauEnnemis = [];
let tableauBalles = [];
let tableauQueue = {};
let score = 0;
let estSurchaufee = false;
let estPerdu = false;
let estGagne = false;
let estMusicPause = false;



//Sons et image trouvés sur le site http://www.classicgaming.cc/classics/space-invaders/sounds
let music = new Audio('https://od.lk/d/MTBfNjU1MTYwODdf/spaceinvaders1.mpeg');
let shoot = new Audio('https://od.lk/d/MTBfNjU1MTY3NTBf/shoot.mp3');
let death = new Audio('https://od.lk/d/MTBfNjU1MTY5MDBf/explosion.mp3');
let ennemiDeath = new Audio('https://od.lk/d/MTBfNjU1MTY4OTVf/invaderkilled.mp3');

window.onload = function () {
    canvas = document.querySelector("#myCanvas");
    lc = canvas.width;
    hc = canvas.height;

    ctx = canvas.getContext("2d");
    //document.onkeydown = checkKey;

    document.addEventListener("keydown", checkKey);
    document.addEventListener("keyup", checkKey);

    initiateGame();
    requestAnimationFrame(dessinerJeu);
    setInterval(moveEnnemies, 100);
    setInterval(setSurchauffe, 300);
    music.play();
};

function setSurchauffe () {
    estSurchaufee = false;
}
function moveEnnemies() {
    tableauEnnemis.forEach((e) => {
        e.move(ctx);
    });
}

function initiateGame() {
    vaisseau = new Vaisseau();
    creerFlote()
}

function creerFlote() {
    for(let j = 0; j < canvas.height/4; j+=20) {
        for(let i = 0; i < canvas.width; i +=20) {
            let ennemi = new Ennemi(i, j);
            tableauEnnemis.push(ennemi);
        }
    }
    
}


function dessinerJeu() {
    ctx.clearRect(0, 0, lc, hc);

    // Vaisseau affiché
    vaisseau.draw(ctx);

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
        if(r.y<0) {
            tableauBalles.splice(tableauBalles.indexOf(r), 1);
        } else {
            r.bougerBalle(ctx);
        }
    });

    //Perdu !
    tableauEnnemis.forEach((r) => {
        if(r.y>270 && !estPerdu) {
            death.play();
            estPerdu = true;
        }
    });

    if(tableauEnnemis.length == 0) {
        estGagne = true;
    }

    //Vérification de la colision entre une balle et un ennemi
    tableauBalles.forEach((b) => {
        tableauEnnemis.forEach((e) => {
            if ((e.x < b.x && 
                b.x < e.x+10) && (e.y < b.y && b.y < e.y+10) || 
                (e.x < b.x+4 && 
                b.x+4 < e.x+10) && (e.y < b.y && b.y < e.y+10) 
                ) {
                ennemiDeath.play();
                tableauEnnemis.splice(tableauEnnemis.indexOf(e), 1);
                tableauBalles.splice(tableauBalles.indexOf(b), 1);
                score++;
            }
        });
    });

    //Affichage du score et des messages de victoire ou de perte
    if(!estPerdu) {
        if (estGagne) {
            ctx.fillStyle = "#000";
            ctx.font="20px Georgia";
            ctx.fillText("Congrats ! ",canvas.width/2-100,canvas.height/2);
            ctx.fillText("Score: " + score,canvas.width/2-100,canvas.height/1.6);
            ctx.fillText("Press R to play again",canvas.width/2-100,canvas.height/1.2);
            } else {
                ctx.fillStyle = "#000";
                ctx.font="20px Georgia";
                ctx.fillText("Score: " + score,canvas.width/3,canvas.height/2);
            }
    } else {
        ctx.fillStyle = "#000";
        ctx.font="20px Georgia";
        ctx.fillText("Game Over",canvas.width/2-100,canvas.height/2);
        ctx.fillText("Press R to retry",canvas.width/2-100,canvas.height/1.6);
    }

    requestAnimationFrame(dessinerJeu);
}

// Traitement des inputs (supporte plusieurs touches appuyées)
function checkKey(e) {
    e = e || window.event;

    tableauQueue[e.keyCode] = e.type == "keydown";

    if (tableauQueue["37"]) {
        if(vaisseau.x > 0) {
            vaisseau.left();
        }
    }
    
    if (tableauQueue["39"]) {
        if(vaisseau.x+10 < canvas.width) {
            vaisseau.right();
        }
    }
    if (tableauQueue["32"]) {
        if (!estSurchaufee) {
            shoot.play();
            tableauBalles.push(new Balle(vaisseau.x+3, vaisseau.y-10));
            estSurchaufee = true;
        }
    }
    if (tableauQueue["82"]) {
        if (estPerdu || estGagne) {
            location.reload();
        }
    }
    if (tableauQueue["77"]) {
        if(estMusicPause) {
            music.play();
            estMusicPause = false;
        }else {
            music.pause();
            estMusicPause = true;
        }
    }
    if (tableauQueue["80"]) {
        if(estPause) {
            music.play();
            estPause = false;
        }else {
            music.pause();
            estPause = true;
        }
    }

}


class Vaisseau {
    constructor() {
        // on définit les propriétés qu'on veut avoir à la construction
        this.x = canvas.width/2;
        this.y = 280;
        this.vx = 5;
    }

    draw(ctx) {
        ctx.fillStyle = "#fbe50f";
        ctx.fillRect(this.x, this.y, 10, 10);
    }


    left() {
        this.x -= this.vx;
        this.draw(ctx);
    }

    right() {
        this.x += this.vx;
        this.draw(ctx);
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
        this.y+= 0.4;
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
