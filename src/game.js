// Initialisation
let config = 
{
    type: Phaser.AUTO,
    width: 700,
    height: 700,
    scene: 
    { 
        preload: preload, 
        create: create, 
        update: update 
    },
};

let game = new Phaser.Game(config);

let scene = new Phaser.Scene('backgroundScene');
let cursor;
let spaceship;
let ennemis;

function preload() 
{
    this.load.spritesheet('spaceship', './assets/spaceship.png', {frameWidth: 32, frameHeight: 48});
    this.load.image('ennemis', './assets/ennemis.png', {frameWidth: 32, frameHeight: 48});
}

function create() 
{
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

    ennemi = this.physics.add.group
    ({
        key: 'ennemis',
        repeat: 10,
        setXY: {x:12, y :50, stepX: 70}
    });

}

function update() 
{
    
    if (cursors.left.isDown) {
        spaceship.anims.play('left', true);
        spaceship.x -= 1;
    }
    else if (cursors.right.isDown) {
        spaceship.anims.play('right', true);
        spaceship.x += 1;
    } else if (cursors.up.isDown) {
        spaceship.y -= 1;
    } else if (cursors.down.isDown) {
        spaceship.y += 1;
    }else {
        spaceship.anims.play('turn');
    }

}
