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
let playerSpaceship; // Objet Phaser representatif du vaisseau
let playerSpaceshipInfos = { // Objet representatif des caracteristiques du vaisseau du joueur
    spriteIdle: "upgradeLvl1New", // le sprite utilise en position normale
    spriteLeft: "upgradeLvl1LeftNew", // le sprite utilise en position mouvement gauche
    spriteRight: "upgradeLvl1RightNew", // // le sprite utilise en position mouvement droit
    height: 0, // la taille du sprite en cours, initialement a 0, recalculee par la suite
    spaceBottom: 75, // espace entre le vaisseau et le bas de l'ecran
    lifePoints: 3 // le nombre de points de vie du vaisseau (lvl1 => 3,  lvl2 => 4, lvl3 => 5, lvl4 => 6)
};
let playerScore = 0; // le score du joueur
let bulletsGroup;
let speed;
let lastFired = 0;
let bulletObject;
let initialMoveSpeed = 2.5 + (gameWidth * 0.003); // vitesse de reference utilisee notamment pour reinitialiser la vitesse apres un dash
let moveSpeed = initialMoveSpeed; // vitesse du vaisseau du joueur generale, initialement a la vitesse de reference
let moveSpeedDash = initialMoveSpeed + 5; // vitesse du vaisseau du joueur lors d'un dash (acceleration)
let shootRate = 500; // temps entre deux tirs du vaisseau
let starfield;
let scrollSpeed = 0.5; // vitesse de defilement du fond
let marginTopEnemies = 110; // espacement vertical entre le haut de la fenetre de jeu et la premiere ligne d'ennemis
let bonusesGroup; // le groupe physique (collisions) contenant tous les bonus actuellement affiches dans le jeu
let enemiesGroup; // le groupe physique (collisions) contenant tous les ennemis des lignes quel que soit leur type
let gameEnemies = [ // tableau representatif des differents ennemis du jeu et des parametres qui leurs sont associes
    {
        spriteName: "ennemi4", // le nom du sprite de l'ennemi
        enemyWidth: 0, // sa largeur en pixel, initialement a 0, recalculee par la suite
        spaceBetweenEnemiesWidth: 50, // espacement initial souhaite entre les ennemis de la ligne, recalcule ensuite
        possiblePerRow: 0, // le nombre maximal d'ennemi de ce type possible sur une seule ligne
        life: 3 // le nombre de points de vie de l'ennemi
    },
    {
        spriteName: "ennemi2",
        enemyWidth: 0,
        spaceBetweenEnemiesWidth: 40,
        possiblePerRow: 0,
        life: 2
    },
    {
        spriteName: "ennemi3",
        enemyWidth: 0,
        spaceBetweenEnemiesWidth: 45,
        possiblePerRow: 0,
        life: 1
    },
    {
        spriteName: "ennemi1",
        enemyWidth: 0,
        spaceBetweenEnemiesWidth: 30,
        possiblePerRow: 0,
        life: 1
    }
];
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
let verticalSpacing = 70; // espacement vertical entre chaque ligne d'ennemi
let timerEvent;
let timeBetweenBonuses = 100000; // temps entre deux arrivees de bonus (en millisecondes)
let scoreText;

//Method where I can load my assets
function preload() {
    this.load.image('starfield', './assets/game_background2.png');
    this.load.image('upgradeLvl1', './assets/player_level1.png');
    this.load.image('upgradeLvl1Left', './assets/player_level1_left.png');
    this.load.image('upgradeLvl1Right', './assets/player_level1_right.png');
    this.load.image('upgradeLvl1New', './assets/player_level1_new.png');
    this.load.image('upgradeLvl1LeftNew', './assets/player_level1_left_new.png');
    this.load.image('upgradeLvl1RightNew', './assets/player_level1_right_new.png');
    this.load.image('upgradeLvl2New', './assets/player_level2_new.png');
    this.load.image('upgradeLvl2LeftNew', './assets/player_level2_left_new.png');
    this.load.image('upgradeLvl2RightNew', './assets/player_level2_right_new.png');
    this.load.image('upgradeLvl3New', './assets/player_level3_new.png');
    this.load.image('upgradeLvl3LeftNew', './assets/player_level3_left_new.png');
    this.load.image('upgradeLvl3RightNew', './assets/player_level3_right_new.png');
    this.load.image('upgradeLvl2', './assets/player_level2.png');
    this.load.image('upgradeLvl2Left', './assets/player_level2_left.png');
    this.load.image('upgradeLvl2Right', './assets/player_level2_right.png');
    this.load.image('upgradeLvl3', './assets/player_level3.png');
    this.load.image('upgradeLvl3Left', './assets/player_level3_left.png');
    this.load.image('upgradeLvl3Right', './assets/player_level3_right.png');
    this.load.image('upgradeLvl4', './assets/player_level4.png');
    this.load.image('upgradeLvl4Left', './assets/player_level4_left.png');
    this.load.image('upgradeLvl4Right', './assets/player_level4_right.png');
    this.load.image('bullet', './assets/round_laser_blue.png');
    this.load.image('ennemi1', './assets/ennemi_1@0.75x.png');
    this.load.image('ennemi2', './assets/ennemi_2@0.75x.png');
    this.load.image('ennemi3', './assets/ennemi_3@0.75x.png');
    this.load.image('ennemi4', './assets/ennemi_4@0.75x.png');
    this.load.image('bonus1', './assets/star_laser_blue.png');
    this.load.image('bonus2', './assets/star_laser_green.png');
    this.load.image('bonus3', './assets/star_laser_pink.png');
    this.load.image('bonus4', './assets/star_laser_yellow.png');
}

//Methode executee juste apres preload
function create() {
    timerEvent = this.time.addEvent({ delay: timeBetweenBonuses, callback: drawNewBonus, loop: true });
    setEnemiesWidths(this);
    setPlayerSpaceshipCurrentHeight(this);
    gameEnemies.forEach((enemy) => {
        calculateMaxEnnemiesPerRow(enemy);
    });

    starfield = this.add.tileSprite(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, "starfield");

    scoreText = this.add.text(20, 20, "Score : " + playerScore, { fontFamily: 'Segoe UI', fontSize: 48, color: '#ffffff' });
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
    bulletsGroup.defaults.setAllowGravity = false;

    //Mlise en place du vaisseau et de l'annimation
    // playerSpaceship = this.add.sprite(gameWidth / 2, gameHeight - playerSpaceshipInfos.spaceBottom, playerSpaceshipInfos.spriteIdle);
    this.anims.create({
        key: 'left',
        frames: [{ key: playerSpaceshipInfos.spriteLeft, frame: 1 }],
        frameRate: 60
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: playerSpaceshipInfos.spriteIdle, frame: 1 }],
        frameRate: 60
    });
    this.anims.create({
        key: 'right',
        frames: [{ key: playerSpaceshipInfos.spriteRight, frame: 1 }],
        frameRate: 60
    });

    playerSpaceship = this.physics.add.group().create(gameWidth / 2, gameHeight - playerSpaceshipInfos.spaceBottom, playerSpaceshipInfos.spriteIdle);
    playerSpaceship.body.allowGravity = false;

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.overlap(enemiesGroup, bulletsGroup, (enemy, bullet) => {
        enemy.setData("life", enemy.getData("life") - 1);
        if (enemy.getData("life") === 0) {
            enemy.destroy();
            playerScore++;
            scoreText.setText("Score : " + playerScore);
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

    if (cursors.space.isDown && time > lastFired) {
        let bullet = bulletsGroup.get();

        if (bullet) {
            bullet.fire(playerSpaceship.x, playerSpaceship.y);
            lastFired = time + shootRate;
        }
    }

    if (cursors.shift._justDown) {
        moveSpeed = moveSpeedDash;
    }

    if (cursors.shift.isUp) {
        moveSpeed = initialMoveSpeed;
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
        let created = enemiesGroup.create(espacementHorizontal, marginTopEnemies, enemy.spriteName);
        created.setData("life", enemy.life);
        created.body.allowGravity = false;
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
 * Permet de recuperer la bonne hauteur du sprite parmi les textures du jeu pour le vaisseau du joueur
 * @param ctx Le contexte du jeu
 */
function setPlayerSpaceshipCurrentHeight(ctx) {
    for (let key in ctx.textures.list) {
        if (ctx.textures.list.hasOwnProperty(key)) {
            if (key === playerSpaceshipInfos.spriteIdle) {
                playerSpaceshipInfos.height = ctx.textures.list[key].source[0].height;
            }
        }
    }
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
