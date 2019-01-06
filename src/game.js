//Creation des params de la partie
let config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 175 },
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
let scrollSpeed = 3; // vitesse de defilement du fond
let marginTopEnemies = 50; // espacement vertical entre le haut de la fenetre de jeu et la premiere ligne d'ennemis
let bonusesGroup; // le groupe physique (collisions) contenant tous les bonus actuellement affiches dans le jeu
let enemiesGroup; // le groupe physique (collisions) contenant tous les ennemis des lignes quel que soit leur type
let gameEnemies = [ // tableau representatif des differents ennemis du jeu et des parametres qui leurs sont associes
    {
        spriteName: "ennemi1", // le nom du sprite de l'ennemi
        enemyWidth: 0, // sa largeur en pixel, initialement a 0, recalculee par la suite
        spaceBetweenEnemiesWidth: 30, // espacement initial souhaite entre les ennemis de la ligne, recalcule ensuite
        possiblePerRow: 0 // le nombre maximal d'ennemi de ce type possible sur une seule ligne
    },
    {
        spriteName: "ennemi2",
        enemyWidth: 0,
        spaceBetweenEnemiesWidth: 40,
        possiblePerRow: 0
    },
    {
        spriteName: "ennemi3",
        enemyWidth: 0,
        spaceBetweenEnemiesWidth: 45,
        possiblePerRow: 0
    },
    {
        spriteName: "ennemi4",
        enemyWidth: 0,
        spaceBetweenEnemiesWidth: 50,
        possiblePerRow: 0
let possibleBonuses = [
    {
        sprite: "bonus1",
        nbPoints: 10
    },
    {
        sprite: "bonus2",
        nbPoints: 10
    },
    {
        sprite: "bonus3",
        nbPoints: 10
    },
    {
        sprite: "bonus4",
        nbPoints: 10
    }
];
let possibleUpgradeBonuses = [
    {
        sprite: "upgradeLvl2New",
        nbPointsRequired: 30
    },
    {
        sprite: "upgradeLvl3New",
        nbPointsRequired: 60,
    },
    {
        sprite: "upgradeLvl4",
        nbPointsRequired: 100,
    }

];
let verticalSpacing = 70; // Espacement vertical entre chaque ligne d'ennemi
let timerEvent;
let timeBetweenBonuses = 100000; // temps entre deux arrivees de bonus (en millisecondes)

//Method where I can load my assets
function preload() {
    this.load.image('starfield', './assets/game_background2.png', { frameWidth: gameWidth, frameHeight: gameHeight });
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
    this.load.image('bonus1', './assets/star_laser_blue.png');
    this.load.image('bonus2', './assets/star_laser_green.png');
    this.load.image('bonus3', './assets/star_laser_pink.png');
    this.load.image('bonus4', './assets/star_laser_yellow.png');
}

//Methode executee juste apres preload
function create() {
    timerEvent = this.time.addEvent({ delay: timeBetweenBonuses, callback: drawNewBonus, loop: true });
    setEnemiesWidths(this);
    gameEnemies.forEach((enemy) => {
        calculateMaxEnnemiesPerRow(enemy);
    });

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

    bonusesGroup = this.physics.add.group();
    enemiesGroup = this.physics.add.group();
    gameEnemies.forEach((enemy) => {
        generateEnemies(enemy);
    });

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

    this.physics.add.overlap(enemiesGroup, bulletsGroup, (enemy, bullet) => {
        enemy.destroy();
            possibleUpgradeBonuses.forEach((bonus) => {
                if (playerScore === bonus.nbPointsRequired) {
                    drawUpgradeBonus();
                }
            });
        }
        bullet.destroy();
    }, null, this);

    this.physics.add.overlap(playerSpaceship, bonusesGroup, (playerSpaceship, bonus) => {
        bonus.destroy();
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
    drawNewBonus(timerEvent);
}

/**
 * Permet de calculer le nombre maximum d'ennemis pouvant etre places sur une seule ligne ainsi que l'espace optimal
 * et le plus proche de celui renseigne dans l'attribut spaceBetweenEnemiesWidth de l'ennemi
 * ======== DETAIL DU CALCUL ========
 * 1) Division de la largeur du canvas par la dimension d'un sprite d'ennemi pour connaitre le nombre d'ennemis
 * que l'on peut placer sans les espacer (sans la partie decimale)
 * ---> Math.trunc(gameWidth / enemyWidth)
 *
 * 2) Calcul du nombre de pixels necessaires pour afficher le nombre "division" d'ennemis si on considere une largeur
 * de canvas infinie
 * ---> Math.trunc(gameWidth / enemyWidth) * enemyWidth
 *
 * 3) Calcul du nombre d'espaces necessaires (entre les ennemis et egalement a gauche et a droite de la ligne) toujours en
 * considerant un canvas de largeur infinie
 * ---> Math.trunc(gameWidth / enemyWidth) + 1
 *
 * 4) Calcul du nombre de pixels necessaires pour afficher le nombre "nbEspacesInitial" d'espaces si on considere une
 * largeur de canvas infinie
 * ---> Math.trunc(gameWidth / enemyWidth) + 1) * (spaceBetweenEnemiesWidth)
 *
 * 5) Calcul du nombre de pixels necessaires pour afficher une ligne entiere basee sur les resultats de
 * "tailleTotaleEnnemisInitial" et "tailleTotaleEspacesInitial" en considerant une largeur infinie de canvas
 * ---> ((Math.trunc(gameWidth / enemyWidth) * enemyWidth) + (Math.trunc(gameWidth / enemyWidth) + 1)) * (spaceBetweenEnemiesWidth))
 *
 * 6) Tant que le nombre de pixels d'une ligne (largeur de canvas infinie) est superieur a la largeur de canvas
 * definie, on soustrait la taille d'un ennemi + d'un espace a la taille d'une ligne avec largeur de canvas
 * ininfie
 *
 * 7) Le nombre final est donc la taille totale d'une ligne initialement reduite divisee par la taille en pixels d'un
 * ennemi additionnee a la taille en pixels d'un espace
 *
 * 8) On recalcule egalement l'espace entre chaque ennemi
 * ==================================
 * @param enemy L'ennemi a partir duquel on veut effectuer les calculs
 */
function calculateMaxEnnemiesPerRow(enemy) {
    let tailleTotaleLigne = ((Math.trunc(gameWidth / enemy.enemyWidth) * enemy.enemyWidth) + (Math.trunc(gameWidth / enemy.enemyWidth) + 1)) * (enemy.spaceBetweenEnemiesWidth);

    while (tailleTotaleLigne >= gameWidth) {
        tailleTotaleLigne -= (enemy.enemyWidth + enemy.spaceBetweenEnemiesWidth);
    }

    enemy.possiblePerRow = Math.trunc(tailleTotaleLigne / (enemy.enemyWidth + enemy.spaceBetweenEnemiesWidth));
    enemy.spaceBetweenEnemiesWidth = (gameWidth - (enemy.enemyWidth * enemy.possiblePerRow)) / (enemy.possiblePerRow + 1);
}

/**
 * Permet de generer une ligne d'ennemi en prenant en compte ses parametres (enemyWidth, spaceBetweenEnemiesWidth, ..)
 * @param enemy L'ennemi sur lequel on veut baser la generation de la ligne
 */
function generateEnemies(enemy) {
    let espacementHorizontal = (enemy.enemyWidth / 2) + enemy.spaceBetweenEnemiesWidth;
    for (let i = 0; i < enemy.possiblePerRow; i++) {
        enemiesGroup.create(espacementHorizontal, marginTopEnemies, enemy.spriteName);
        espacementHorizontal += enemy.enemyWidth + enemy.spaceBetweenEnemiesWidth;
    }
    marginTopEnemies += verticalSpacing;
}

/**
 * Permet de recuperer la bonne dimension du sprite parmi les textures du jeu pour chaque ennemi de l'array gameEnemies
 * @param ctx Le contexte du jeu
 */
function setEnemiesWidths(ctx) {
    gameEnemies.forEach((enemy) => {
        for (let key in ctx.textures.list) {
            if (ctx.textures.list.hasOwnProperty(key)) {
                if (key === enemy.spriteName) {
                    enemy.enemyWidth = ctx.textures.list[key].source[0].width;
                }
            }
        }
    });
}
/**
 * Permet de generer une coordonnee X pour les bonus
 */
function getRandomX() {
    let min = 50;
    let max = gameWidth - 50;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawUpgradeBonus() {
    console.log("draw upgrade bonus");
    let rand = getRandomX();
    console.log(rand);
    bonusesGroup.create(rand, -50, possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)].sprite);
}

function drawNewBonus() {
    if (timerEvent.getProgress() === 1) {
        console.log("Bonus");
        let rand = getRandomX();
        console.log(rand);
        bonusesGroup.create(rand, -50, possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)].sprite);
    }
}
