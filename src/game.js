//Creation des params de la partie
let config = {
    type: Phaser.AUTO,
    width: 700,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
};

let game = new Phaser.Game(config);

let cursor;
let spaceship;
let bulletsGroup;
let speed;
let lastFired = 0;
let bulletObject;
let moveSpeed = 5;
let shootRate = 200;

//Method where I can load my assets
function preload() {
    this.load.spritesheet('spaceship', './assets/spaceship.png', {frameWidth: 32, frameHeight: 48});
    //this.load.image('ennemis', './assets/ennemis.png', {frameWidth: 32, frameHeight: 48});
    bulletObject = this.load.image('bullet', './assets/bullet.png');
}

//Méthode exécutée juste après preload
function create() {
    //Mise en place du vaisseau et de l'annimation
    spaceship = this.add.sprite(340, 650, 'spaceship');
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('spaceship', {start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{key: 'spaceship', frame: 5}],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('spaceship', {start: 8, end: 11}),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

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

    speed = Phaser.Math.GetSpeed(300, 1);
}

function update(time, delta) {

    if (cursors.left.isDown) {
        if (spaceship.x < 0) {
            spaceship.x = 700;
        }
        spaceship.anims.play('left', true);
        spaceship.x -= moveSpeed;
    } else if (cursors.right.isDown) {
        if (spaceship.x > 700) {
            spaceship.x = 0;
        }
        spaceship.anims.play('right', true);
        spaceship.x += moveSpeed;
    } else {
        spaceship.anims.play('turn');
    }

    if (cursors.up.isDown && time > lastFired) {
        let bullet = bulletsGroup.get();

        if (bullet) {
            bullet.fire(spaceship.x, spaceship.y);
            lastFired = time + shootRate;
        }
    }

}
