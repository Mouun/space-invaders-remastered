//Creation des params de la partie
let config = {
    type: Phaser.AUTO,
    width: 700,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
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
let nbEnemies = 10;
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
    this.load.image('enemy', './assets/ennemis.png', { frameWidth: 61, frameHeight: 64 });
    this.load.image('bullet', './assets/laser_green.png');
}

//Méthode exécutée juste après preload
function create() {
    window.addEventListener('resize', resize);
    resize();

    let self = this;

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

    bulletsGroup = this.add.group({
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

    // this.matter.add.mouseSpring({ length: 1, stiffness: 0.6, collisionFilter: { group: canDrag } });
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

function resize() {
    let canvas = game.canvas;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let wratio = width / height, ratio = canvas.width / canvas.height;

    if (wratio < ratio) {
        canvas.style.width = width + "px";
        canvas.style.height = (width / ratio) + "px";
    } else {
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
    }
}

function createEnemies(nbEnemies) {
    for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 10; x++) {
            let enemy = enemies.create(x * 100, y * 120, 'enemy');
        }
    }

    enemies.x = 100;
    enemies.y = 50;
}
