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
let playerSpaceship;
let bulletsGroup;

//Method where I can load my assets
function preload() {
    this.load.image('upgradeLvl1', './assets/player_level1.png', {frameWidth: 28, frameHeight: 54});
    this.load.image('upgradeLvl1Left', './assets/player_level1_left.png', {frameWidth: 28, frameHeight: 54});
    this.load.image('upgradeLvl1Right', './assets/player_level1_right.png', {frameWidth: 28, frameHeight: 54});
    this.load.image('upgradeLvl2', './assets/player_level2.png', {frameWidth: 59, frameHeight: 67});
    this.load.image('upgradeLvl2Left', './assets/player_level2_left.png', {frameWidth: 59, frameHeight: 67});
    this.load.image('upgradeLvl2Right', './assets/player_level2_right.png', {frameWidth: 59, frameHeight: 67});
    this.load.image('upgradeLvl3', './assets/player_level3.png', {frameWidth: 65, frameHeight: 79});
    this.load.image('upgradeLvl3Left', './assets/player_level3_left.png', {frameWidth: 65, frameHeight: 79});
    this.load.image('upgradeLvl3Right', './assets/player_level3_right.png', {frameWidth: 65, frameHeight: 79});
    this.load.image('upgradeLvl4', './assets/player_level4.png', {frameWidth: 69, frameHeight: 110});
    this.load.image('upgradeLvl4Left', './assets/player_level4_left.png', {frameWidth: 69, frameHeight: 110});
    this.load.image('upgradeLvl4Right', './assets/player_level4_right.png', {frameWidth: 69, frameHeight: 110});
    this.load.image('enemy', './assets/ennemis.png', {frameWidth: 512, frameHeight: 512});
}

//Méthode exécutée juste après preload
function create() {
    //Mise en place du vaisseau et de l'annimation
    playerSpaceship = this.add.sprite(340, 650, 'upgradeLvl1');

    console.log(game);
    console.log(this);

    //this.add.group();

    this.anims.create({
        key: 'left',
        frames: [ {key: "upgradeLvl1Left", frame: 1}],
        frameRate: 60
    });
    this.anims.create({
        key: 'turn',
        frames: [{key: 'upgradeLvl1', frame: 1}],
        frameRate: 60
    });
    this.anims.create({
        key: 'right',
        frames: [ {key: "upgradeLvl1Right", frame: 1}],
        frameRate: 60
    });

    cursors = this.input.keyboard.createCursorKeys();

    for(let j = 0; j < 700/4; j+=20) {
        for(let i = 0; i < 700; i +=20) {
            ennemis = this.add.sprite(i, j, 'ennemis');
            ennemis.setScale(2);
        }
    }
}

function update() {
    
    if (cursors.left.isDown) {
        if (playerSpaceship.x < 0) {
            playerSpaceship.x = 700;
        }
        playerSpaceship.anims.play('left', true);
        playerSpaceship.x -= 1;
    }
    else if (cursors.right.isDown) {
        if (playerSpaceship.x > 700) {
            playerSpaceship.x = 0;
        }
        playerSpaceship.anims.play('right', true);
        playerSpaceship.x += 1;
    } else if (cursors.up.isDown) {
        if (playerSpaceship.y < 0) {
            playerSpaceship.y = 700;
        }
        playerSpaceship.y -= 1;
    } else if (cursors.down.isDown) {
        if (playerSpaceship.y > 700) {
            playerSpaceship.y = 0;
        }
        playerSpaceship.y += 1;
    } else {
        playerSpaceship.anims.play('turn');
    }

}
