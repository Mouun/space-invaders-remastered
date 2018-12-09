//Creation des params de la partie
let config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
};

let game = new Phaser.Game(config);

let gameWidth = game.config.width;
let gameHeight = game.config.height;
let cursor;
let playerSpaceship;
let bulletsGroup;
let speed;
let lastFired = 0;
let bulletObject;
let moveSpeed = 5;
let shootRate = 200;
let starfield;
let scrollSpeed = 3;
let possiblePerRow = 0;
let enemyWidth;
let espaceBetweenEnemiesWidth = 50;
let marginTopEnemies = 50;
let nbRow = 4;
let enemies;

//Method where I can load my assets
function preload() {
    this.load.image('starfield', './assets/game_background.png', { frameWidth: gameWidth, frameHeight: gameHeight });
    this.load.image('upgradeLvl1', './assets/player_level1.png', { frameWidth: 28, frameHeight: 54 });
    this.load.image('upgradeLvl1Left', './assets/player_level1_left.png', { frameWidth: 28, frameHeight: 54 });
    this.load.image('upgradeLvl1Right', './assets/player_level1_right.png', { frameWidth: 28, frameHeight: 54 });
    this.load.image('upgradeLvl2', './assets/player_level2.png', { frameWidth: 59, frameHeight: 67 });
    this.load.image('upgradeLvl2Left', './assets/player_level2_left.png', { frameWidth: 59, frameHeight: 67 });
    this.load.image('upgradeLvl2Right', './assets/player_level2_right.png', { frameWidth: 59, frameHeight: 67 });
    this.load.image('upgradeLvl3', './assets/player_level3.png', { frameWidth: 65, frameHeight: 79 });
    this.load.image('upgradeLvl3Left', './assets/player_level3_left.png', { frameWidth: 65, frameHeight: 79 });
    this.load.image('upgradeLvl3Right', './assets/player_level3_right.png', { frameWidth: 65, frameHeight: 79 });
    this.load.image('upgradeLvl4', './assets/player_level4.png', { frameWidth: 69, frameHeight: 110 });
    this.load.image('upgradeLvl4Left', './assets/player_level4_left.png', { frameWidth: 69, frameHeight: 110 });
    this.load.image('upgradeLvl4Right', './assets/player_level4_right.png', { frameWidth: 69, frameHeight: 110 });
    this.load.image('bullet', './assets/round_laser_blue.png');
    this.load.image('ennemi1', './assets/ennemi_1@0.75x.png', { frameWidth: 64, frameHeight: 48 });
    this.load.image('ennemi2', './assets/ennemi_2@0.75x.png', { frameWidth: 70, frameHeight: 48 });
    this.load.image('ennemi3', './assets/ennemi_3@0.75x.png', { frameWidth: 51, frameHeight: 49 });
    this.load.image('ennemi4', './assets/ennemi_4@0.75x.png', { frameWidth: 93, frameHeight: 39 });
}

//Méthode exécutée juste après preload
function create() {

    enemyWidth = this.textures.list.ennemi1.source[0].width;

    calculateMaxEnnemiesPerRow();
    starfield = this.add.tileSprite(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, "starfield");

    let Bullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize: function Bullet(scene) {
            bulletObject = Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

            this.speed = Phaser.Math.GetSpeed(400, 1);
        },

        fire: function (x, y) {
            this.setPosition(x, y - 50);

            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta) {
            this.y -= this.speed * delta;

            if (this.y < -50) {
                this.setActive(false);
                this.setVisible(false);
            }
        }
    });

    enemies = this.physics.add.group();
    generateEnemies();

    bulletsGroup = this.physics.add.group({
        classType: Bullet,
        maxSize: 10,
        runChildUpdate: true
    });

    //Mlise en place du vaisseau et de l'annimation
    playerSpaceship = this.add.sprite(gameWidth / 2, gameHeight - 45, 'upgradeLvl1');

    this.anims.create({
        key: 'left',
        frames: [{ key: "upgradeLvl1Left", frame: 1 }],
        frameRate: 60
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'upgradeLvl1', frame: 1 }],
        frameRate: 60
    });
    this.anims.create({
        key: 'right',
        frames: [{ key: "upgradeLvl1Right", frame: 1 }],
        frameRate: 60
    });

    cursors = this.input.keyboard.createCursorKeys();

    speed = Phaser.Math.GetSpeed(300, 1);

    this.physics.add.overlap(enemies, bulletsGroup, (enemy, bullet) => {
        enemy.destroy();
        bullet.destroy();
    }, null, this);
}

function update(time, delta) {

    starfield.tilePositionY -= scrollSpeed;
    if (cursors.left.isDown) {
        if (playerSpaceship.x < 0) {
            playerSpaceship.x = gameWidth;
        }
        playerSpaceship.anims.play('left', true);
        playerSpaceship.x -= moveSpeed;
    } else if (cursors.right.isDown) {
        if (playerSpaceship.x > gameWidth) {
            playerSpaceship.x = 0;
        }
        playerSpaceship.anims.play('right', true);
        playerSpaceship.x += moveSpeed;
    } else {
        playerSpaceship.anims.play('turn');
    }

    if (cursors.up.isDown && time > lastFired) {
        let bullet = bulletsGroup.get();

        if (bullet) {
            bullet.fire(playerSpaceship.x, playerSpaceship.y);
            lastFired = time + shootRate;
        }
    }
}

/**
 * Fonction permettant de calculer le nombre maximum d'ennemis pouvant etre places sur une seule ligne
 * ======== DETAIL DU CALCUL ========
 * 1) Division de la largeur du canvas par la dimension d'un sprite d'ennemi pour connaitre le nombre d'ennemis
 * que l'on peut placer sans les espacer (sans la partie décimale)
 * ---> Math.trunc(gameWidth / enemyWidth)
 *
 * 2) Calcul du nombre de pixels necessaires pour afficher le nombre "division" d'ennemis si on considere une largeur de
 * canvas infinie
 * ---> Math.trunc(gameWidth / enemyWidth) * enemyWidth
 *
 * 3) Calcul du nombre d'espaces nécessaires (entre les ennemis et egalement a gauche et a droite de la ligne) toujours en
 * considerant un canvas de largeur infinie
 * ---> Math.trunc(gameWidth / enemyWidth) + 1
 *
 * 4) Calcul du nombre de pixels necessaires pour afficher le nombre "nbEspacesInitial" d'espaces si on considere une
 * largeur de canvas infinie
 * ---> Math.trunc(gameWidth / enemyWidth) + 1) * (espaceBetweenEnemiesWidth)
 *
 * 5) Calcul du nombre de pixels necessaires pour afficher une ligne entiere basee sur les resultats de
 * "tailleTotaleEnnemisInitial" et "tailleTotaleEspacesInitial" en considerant une largeur infinie de canvas
 * ---> ((Math.trunc(gameWidth / enemyWidth) * enemyWidth) + (Math.trunc(gameWidth / enemyWidth) + 1)) * (espaceBetweenEnemiesWidth))
 *
 * 6) Tant que le nombre de pixels d'une ligne (largeur de canvas infinie) est supérieur à la largeur de canvas
 * definie, on soustrait la taille d'un ennemi + d'un espace a la taille d'une ligne avec largeur de canvas
 * ininfie
 *
 * 7) Le nombre final est donc la taille totale d'une ligne initialement reduite divisee par la taille en pixels d'un
 * ennemi additionnee a la taille en pixels d'un espace
 *
 * 8) On recalcule également l'espace entre chaque ennemi
 * ==================================
 */
function calculateMaxEnnemiesPerRow() {
    let tailleTotaleLigne = ((Math.trunc(gameWidth / enemyWidth) * enemyWidth) + (Math.trunc(gameWidth / enemyWidth) + 1)) * (espaceBetweenEnemiesWidth);

    while (tailleTotaleLigne >= gameWidth) {
        tailleTotaleLigne -= (enemyWidth + espaceBetweenEnemiesWidth);
    }

    possiblePerRow = Math.trunc(tailleTotaleLigne / (enemyWidth + espaceBetweenEnemiesWidth));
    espaceBetweenEnemiesWidth = (gameWidth - (enemyWidth * possiblePerRow)) / (possiblePerRow + 1);
}

function generateEnemies() {
    let espacementHorizontal = (enemyWidth / 2) + espaceBetweenEnemiesWidth;
    for (let i = 0; i < nbRow; i++) {
        for (let j = 0; j < possiblePerRow; j++) {
            enemies.create(espacementHorizontal, marginTopEnemies, "ennemi1");
            espacementHorizontal += enemyWidth + espaceBetweenEnemiesWidth;
        }
        espacementHorizontal = (enemyWidth / 2) + espaceBetweenEnemiesWidth;
        marginTopEnemies += 80;
    }
}
