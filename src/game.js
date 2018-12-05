//Creation des params de la partie
let config = {
    type: Phaser.AUTO,
    width: 700,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 10},
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

let cursor;
let spaceship;
let ennemi;
let bulletsGroup;

//Method where I can load my assets
function preload() {
    this.load.spritesheet('spaceship', './assets/spaceship.png', {frameWidth: 32, frameHeight: 48});
    this.load.image('ennemi', './assets/ennemis.png', {frameWidth: 32, frameHeight: 48});
}


//Méthode exécutée juste après preload
function create() {
    //Mise en place du vaisseau et de l'annimation
    spaceship = this.add.sprite(340, 650, 'spaceship');

    console.log(game);
    console.log(this);

    //this.add.group();

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

    ennemis = this.physics.add.group({
        key: 'ennemi',
        repeat: 20,
        setXY: { x: 50, y: 20, stepX: 30 },
        setScale: {x:0.05,y:0.05,stepX:0,stepY:0}
    });

    ennemis = this.physics.add.group({
        key: 'ennemi',
        repeat: 20,
        setXY: { x: 50, y: 50, stepX: 30 },
        setScale: {x:0.05,y:0.05,stepX:0,stepY:0}
    });

    ennemis = this.physics.add.group({
        key: 'ennemi',
        repeat: 20,
        setXY: { x: 50, y: 80, stepX: 30 },
        setScale: {x:0.05,y:0.05,stepX:0,stepY:0}
    });
}

function move() {

    ennemis.j += 0.4;

}

function update() {

    if (cursors.left.isDown) {
        if (spaceship.x < 0) {
            spaceship.x = 700;
        }
        spaceship.anims.play('left', true);
        spaceship.x -= 1;
    }
    else if (cursors.right.isDown) {
        if (spaceship.x > 700) {
            spaceship.x = 0;
        }
        spaceship.anims.play('right', true);
        spaceship.x += 1;
    } else if (cursors.up.isDown) {
        if (spaceship.y < 0) {
            spaceship.y = 700;
        }
        spaceship.y -= 1;
    } else if (cursors.down.isDown) {
        if (spaceship.y > 700) {
            spaceship.y = 0;
        }
        spaceship.y += 1;
    } else {
        spaceship.anims.play('turn');
    }
}