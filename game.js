//Creation des params de la partie

let sprites = new Howl({
    src: ['assets/spritesound.mp3'],
    sprite: {
        playerDeath: [0, 1840],
        ennemyDeath: [1938, 443],
        gunUpgrade: [2846, 789],
        shieldUpgrade: [3709, 882],
        laser: [4689, 5759],
        missile: [10516, 729],
        shot: [11327, 221],
        fastShot: [11625, 259],
        ennemyShot: [11978, 150],
    }
});

let music = new Howl({
    src: ['assets/soundtrack.mp3'],
    autoplay: true,
    loop: true,
    volume: 0.2,
    onend: function() {
        console.log('Finished!');
        // On  peu refaire play d'ici
        // Puis on fait un stop quand on veut
    }
});

let config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 175 },
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

let timeBetweenBonuses = 30000;
let gameWidth = game.config.width;
let gameHeight = game.config.height;
let playerScore = 0; // le score du joueur
let bulletsGroup;
let speed;
let lastFired = 0;
let bulletObject;
let initialMoveSpeed = 2.5 + (gameWidth * 0.003); // vitesse de reference utilisee notamment pour reinitialiser la vitesse apres un dash
let moveSpeed = initialMoveSpeed; // vitesse du vaisseau du joueur generale, initialement a la vitesse de reference
let moveSpeedDash = initialMoveSpeed + 5; // vitesse du vaisseau du joueur lors d'un dash (acceleration)
let starfield;
let scrollSpeed = 0.5; // vitesse de defilement du fond
let marginTopEnemies = 110; // espacement vertical entre le haut de la fenetre de jeu et la premiere ligne d'ennemis
let bonusesGroup; // le groupe physique (collisions) contenant tous les bonus actuellement affiches dans le jeu
let upgradesGroup; // le groupe physique (collisions) contenant toutes les ameliorations actuellement affichees dans le jeu
let enemiesGroup; // le groupe physique (collisions) contenant tous les ennemis des lignes quel que soit leur type
let gameEnemies = [ // tableau representatif des differents ennemis du jeu et des parametres qui leurs sont associes
    {
        spriteName: "ennemi4", // le nom du sprite de l'ennemi
        enemyWidth: 0, // sa largeur en pixel, initialement a 0, recalculee par la suite
        spaceBetweenEnemiesWidth: 50, // espacement initial souhaite entre les ennemis de la ligne, recalcule ensuite
        possiblePerRow: 0, // le nombre maximal d'ennemi de ce type possible sur une seule ligne
        life: 3, // le nombre de points de vie de l'ennemi
        nbPoints: 3 // le nombre de points obtenus par le joueur lors de l'elimination de cet ennemi
    },
    {
        spriteName: "ennemi2",
        enemyWidth: 0,
        spaceBetweenEnemiesWidth: 40,
        possiblePerRow: 0,
        life: 2,
        nbPoints: 2
    },
    {
        spriteName: "ennemi3",
        enemyWidth: 0,
        spaceBetweenEnemiesWidth: 45,
        possiblePerRow: 0,
        life: 1,
        nbPoints: 1
    },
    {
        spriteName: "ennemi1",
        enemyWidth: 0,
        spaceBetweenEnemiesWidth: 30,
        possiblePerRow: 0,
        life: 1,
        nbPoints: 1
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
        sprite: "upgrade1",
        level: 1,
        nbPointsRequired: 10
    },
    {
        sprite: "upgrade2",
        level: 2,
        nbPointsRequired: 20,
    },
    {
        sprite: "upgrade3",
        level: 3,
        nbPointsRequired: 30,
    }
];
let verticalSpacing = 70; // espacement vertical entre chaque ligne d'ennemi
let timerEvent;
let scoreText;
let cursors; // Objet Phaser representatif du clavier (pour les touches)
let level = 0; // le niveau du vaisseau du joueur
let playerSpaceship; // Objet Phaser representatif du vaisseau
let possibleSpaceships = [ // Objet representatif des caracteristiques du vaisseau du joueur qu'il peut obtenir (niveaux de vaisseau)
    {
        level: 0,
        spritesShieldFull: {
            idle: "upgradeLvl0ShieldFull",
            left: "upgradeLvl0LeftShieldFull",
            right: "upgradeLvl0RightShieldFull",
        },
        spritesShieldHalf: {
            idle: "upgradeLvl0ShieldHalf",
            left: "upgradeLvl0LeftShieldHalf",
            right: "upgradeLvl0RightShieldHalf",
        },
        spritesNoShield: {
            idle: "upgradeLvl0NoShield",
            left: "upgradeLvl0LeftNoShield",
            right: "upgradeLvl0RightNoShield",
        },
        spaceBottom: 75,
        lifePoints: 3,
        scaleCoefficient: 1,
        shootRate: 500
    },
    {
        level: 1,
        spritesShieldFull: {
            idle: "upgradeLvl1ShieldFull",
            left: "upgradeLvl1LeftShieldFull",
            right: "upgradeLvl1RightShieldFull",
        },
        spritesShieldHalf: {
            idle: "upgradeLvl1ShieldHalf",
            left: "upgradeLvl1LeftShieldHalf",
            right: "upgradeLvl1RightShieldHalf",
        },
        spritesNoShield: {
            idle: "upgradeLvl1NoShield",
            left: "upgradeLvl1LeftNoShield",
            right: "upgradeLvl1RightNoShield",
        },
        spaceBottom: 75,
        lifePoints: 4,
        scaleCoefficient: 1,
        shootRate: 450
    },
    {
        level: 2,
        spritesShieldFull: {
            idle: "upgradeLvl2ShieldFull",
            left: "upgradeLvl2LeftShieldFull",
            right: "upgradeLvl2RightShieldFull",
        },
        spritesShieldHalf: {
            idle: "upgradeLvl2ShieldHalf",
            left: "upgradeLvl2LeftShieldHalf",
            right: "upgradeLvl2RightShieldHalf",
        },
        spritesNoShield: {
            idle: "upgradeLvl2NoShield",
            left: "upgradeLvl2LeftNoShield",
            right: "upgradeLvl2RightNoShield",
        },
        spaceBottom: 75,
        lifePoints: 5,
        scaleCoefficient: 1,
        shootRate: 400
    },
    {
        level: 3,
        spritesShieldFull: {
            idle: "upgradeLvl3ShieldFull",
            left: "upgradeLvl3LeftShieldFull",
            right: "upgradeLvl3RightShieldFull",
        },
        spritesShieldHalf: {
            idle: "upgradeLvl3ShieldHalf",
            left: "upgradeLvl3LeftShieldHalf",
            right: "upgradeLvl3RightShieldHalf",
        },
        spritesNoShield: {
            idle: "upgradeLvl3NoShield",
            left: "upgradeLvl3LeftNoShield",
            right: "upgradeLvl3RightNoShield",
        },
        spaceBottom: 75,
        lifePoints: 6,
        scaleCoefficient: 1,
        shootRate: 350
    }
];
let playerSpaceshipInfos = { // Objet representatif des caracteristiques du vaisseau du joueur en temps reel
    sprites: {
        idle: possibleSpaceships[level].spritesNoShield.idle, // le sprite utilise en position normale sans bouclier
        left: possibleSpaceships[level].spritesNoShield.left, // le sprite utilise en position mouvement gauche sans bouclier
        right: possibleSpaceships[level].spritesNoShield.right, // le sprite utilise en position mouvement droit sans bouclier
    },
    spaceBottom: possibleSpaceships[level].spaceBottom, // espace entre le vaisseau et le bas de l'ecran
    lifePoints: possibleSpaceships[level].lifePoints, // le nombre de points de vie du vaisseau (lvl0 => 3,  lvl1 => 4, lvl2 => 5, lvl3 => 6)
    scaleCoefficient: possibleSpaceships[level].scaleCoefficient, // le coefficient de redimensionnement du sprite
    shield: "none", // permet de determiner si le vaisseau dispose d'un bonus bouclier ou pas (none => pas de bouclier, half => bouclier a 50% de capacite, full => bouclier a 100% de capacite
    shootRate: 50 // temps entre deux tirs du vaisseau
};
let vaisseau;

//Method where I can load my assets
function preload() {
    this.load.image('starfield', './assets/game_background.png');

    this.load.image('upgradeLvl0NoShield', './assets/player_level0_without_shield.png');
    this.load.image('upgradeLvl0LeftNoShield', './assets/player_level0_left_without_shield.png');
    this.load.image('upgradeLvl0RightNoShield', './assets/player_level0_right_without_shield.png');
    this.load.image('upgradeLvl0ShieldFull', './assets/player_level0_with_shield_full.png');
    this.load.image('upgradeLvl0LeftShieldFull', './assets/player_level0_left_with_shield_full.png');
    this.load.image('upgradeLvl0RightShieldFull', './assets/player_level0_right_with_shield_full.png');
    this.load.image('upgradeLvl0ShieldHalf', './assets/player_level0_with_shield_half.png');
    this.load.image('upgradeLvl0LeftShieldHalf', './assets/player_level0_left_with_shield_half.png');
    this.load.image('upgradeLvl0RightShieldHalf', './assets/player_level0_right_with_shield_half.png');

    this.load.image('upgradeLvl1NoShield', './assets/player_level1_without_shield.png');
    this.load.image('upgradeLvl1LeftNoShield', './assets/player_level1_left_without_shield.png');
    this.load.image('upgradeLvl1RightNoShield', './assets/player_level1_right_without_shield.png');
    this.load.image('upgradeLvl1ShieldFull', './assets/player_level1_with_shield_full.png');
    this.load.image('upgradeLvl1LeftShieldFull', './assets/player_level1_left_with_shield_full.png');
    this.load.image('upgradeLvl1RightShieldFull', './assets/player_level1_right_with_shield_full.png');
    this.load.image('upgradeLvl1ShieldHalf', './assets/player_level1_with_shield_half.png');
    this.load.image('upgradeLvl1LeftShieldHalf', './assets/player_level1_left_with_shield_half.png');
    this.load.image('upgradeLvl1RightShieldHalf', './assets/player_level1_right_with_shield_half.png');

    this.load.image('upgradeLvl2NoShield', './assets/player_level2_without_shield.png');
    this.load.image('upgradeLvl2LeftNoShield', './assets/player_level2_left_without_shield.png');
    this.load.image('upgradeLvl2RightNoShield', './assets/player_level2_right_without_shield.png');
    this.load.image('upgradeLvl2ShieldFull', './assets/player_level2_with_shield_full.png');
    this.load.image('upgradeLvl2LeftShieldFull', './assets/player_level2_left_with_shield_full.png');
    this.load.image('upgradeLvl2RightShieldFull', './assets/player_level2_right_with_shield_full.png');
    this.load.image('upgradeLvl2ShieldHalf', './assets/player_level2_with_shield_half.png');
    this.load.image('upgradeLvl2LeftShieldHalf', './assets/player_level2_left_with_shield_half.png');
    this.load.image('upgradeLvl2RightShieldHalf', './assets/player_level2_right_with_shield_half.png');

    this.load.image('upgradeLvl3NoShield', './assets/player_level3_without_shield.png');
    this.load.image('upgradeLvl3LeftNoShield', './assets/player_level3_left_without_shield.png');
    this.load.image('upgradeLvl3RightNoShield', './assets/player_level3_right_without_shield.png');
    this.load.image('upgradeLvl3ShieldFull', './assets/player_level3_with_shield_full.png');
    this.load.image('upgradeLvl3LeftShieldFull', './assets/player_level3_left_with_shield_full.png');
    this.load.image('upgradeLvl3RightShieldFull', './assets/player_level3_right_with_shield_full.png');
    this.load.image('upgradeLvl3ShieldHalf', './assets/player_level3_with_shield_half.png');
    this.load.image('upgradeLvl3LeftShieldHalf', './assets/player_level3_left_with_shield_half.png');
    this.load.image('upgradeLvl3RightShieldHalf', './assets/player_level3_right_with_shield_half.png');

    this.load.image('bullet', './assets/round_laser_blue.png');
    this.load.image('ennemi1', './assets/ennemi_1@0.75x.png');
    this.load.image('ennemi2', './assets/ennemi_2@0.75x.png');
    this.load.image('ennemi3', './assets/ennemi_3@0.75x.png');
    this.load.image('ennemi4', './assets/ennemi_4@0.75x.png');
    this.load.image('bonus1', './assets/star_laser_blue.png');
    this.load.image('bonus2', './assets/star_laser_green.png');
    this.load.image('bonus3', './assets/star_laser_pink.png');
    this.load.image('bonus4', './assets/star_laser_yellow.png');

    this.load.image('upgrade1', './assets/laser_blue.png');
    this.load.image('upgrade2', './assets/laser_green.png');
    this.load.image('upgrade3', './assets/laser_pink.png');
}

//Methode executee juste apres preload
function create() {
    timerEvent = this.time.addEvent({ delay: timeBetweenBonuses, callback: drawNewBonus, loop: true });
    setEnemiesWidths(this);
    gameEnemies.forEach((enemy) => {
        calculateMaxEnnemiesPerRow(enemy);
    });

    starfield = this.add.tileSprite(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, "starfield");

    scoreText = this.add.text(20, 20, "Score : " + playerScore, {
        fontFamily: 'Segoe UI',
        fontSize: 48,
        color: '#ffffff'
    });
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
    upgradesGroup = this.physics.add.group();
    enemiesGroup = this.physics.add.group();
    gameEnemies.forEach((enemy) => {
        generateEnemies(enemy);
    });

    bulletsGroup = this.physics.add.group({
        classType: Bullet,
        maxSize: 100,
        runChildUpdate: true
    });
    bulletsGroup.defaults.setAllowGravity = false;

    this.anims.create({
        key: 'left',
        frames: [{ key: playerSpaceshipInfos.sprites.left, frame: 1 }],
        frameRate: 60
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: playerSpaceshipInfos.sprites.idle, frame: 1 }],
        frameRate: 60
    });
    this.anims.create({
        key: 'right',
        frames: [{ key: playerSpaceshipInfos.sprites.right, frame: 1 }],
        frameRate: 60
    });


    playerSpaceship = this.physics.add.group().create(gameWidth / 2, gameHeight - playerSpaceshipInfos.spaceBottom, playerSpaceshipInfos.sprites.idle);
    playerSpaceship.setData(playerSpaceshipInfos);
    playerSpaceship.body.allowGravity = false;
    playerSpaceship.scaleX = playerSpaceshipInfos.scaleCoefficient;
    playerSpaceship.scaleY = playerSpaceshipInfos.scaleCoefficient;

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.overlap(enemiesGroup, bulletsGroup, (enemy, bullet) => {
        enemy.setData("life", enemy.getData("life") - 1);
        if (enemy.getData("life") === 0) {
            for (let i = 0; i < enemy.data.values.nbPoints; i++) {
                playerScore++;
                possibleUpgradeBonuses.forEach((upgrade) => {
                    if (playerScore === upgrade.nbPointsRequired) {
                        drawUpgradeBonus(upgrade.level - 1);
                    }
                });
                scoreText.setText("Score : " + playerScore);
            }
            enemy.destroy();
            sprites.play("ennemyDeath");
        }
        bullet.destroy();
    }, null, this);

    this.physics.add.overlap(playerSpaceship, bonusesGroup, (playerSpaceship, bonus) => {
        bonus.destroy();
    }, null, this);

    this.physics.add.overlap(playerSpaceship, upgradesGroup, (spaceShip, bonus) => {
        level = bonus.getData("level");
        if (playerSpaceshipInfos.shield === "none") {
            switchInfos("none", bonus.getData("level"));
        } else if (playerSpaceshipInfos.shield === "half") {
            switchInfos("half", bonus.getData("level"));
        } else if (playerSpaceshipInfos.shield === "full") {
            switchInfos("full", bonus.getData("level"));
        }
        console.log("space-bottom = " + playerSpaceshipInfos.spaceBottom);
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

    if ((cursors.space.isDown || cursors.up.isDown) && time > lastFired) {
        let bullet = bulletsGroup.get();

        if (bullet) {
            bullet.fire(playerSpaceship.x, playerSpaceship.y);
            sprites.play("shot");
            lastFired = time + playerSpaceshipInfos.shootRate;
        }
    }

    if (cursors.shift._justDown) {
        moveSpeed = moveSpeedDash;
    }

    if (cursors.shift.isUp) {
        moveSpeed = initialMoveSpeed;
    }


    updateSpaceship(this);

    moveEnnemis(time, delta);
    drawNewBonus(timerEvent);
}


/**
 *
 * Cette fonction permet de déplacer les ennemis de façon random (dans un premier).
 *
 *
 **/

function moveEnnemis(time, delta) {

    if (Math.trunc(time) % 200 === 0) {
        console.log("Houra");
    }
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
        created.setData("nbPoints", enemy.nbPoints);
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
 * Permet de generer une coordonnee X pour les bonus
 */
function getRandomX() {
    let min = 50;
    let max = gameWidth - 50;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawUpgradeBonus(level) {
    let rand = getRandomX();
    let created = upgradesGroup.create(rand, -50, possibleUpgradeBonuses[level].sprite);
    created.setData("level", possibleUpgradeBonuses[level].level);
}

function drawNewBonus() {
    if (timerEvent.getProgress() === 1) {
        console.log("Bonus");
        let rand = getRandomX();
        console.log(rand);
        bonusesGroup.create(rand, -50, possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)].sprite);
    }
}

function switchInfos(mode, level) {
    switch (mode) {
        case "none":
            playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesNoShield.idle;
            playerSpaceshipInfos.sprites.left = possibleSpaceships[level].spritesNoShield.left;
            playerSpaceshipInfos.sprites.right = possibleSpaceships[level].spritesNoShield.right;
            playerSpaceshipInfos.spaceBottom = possibleSpaceships[level].spaceBottom;
            playerSpaceshipInfos.lifePoints = possibleSpaceships[level].lifePoints;
            playerSpaceshipInfos.scaleCoefficient = possibleSpaceships[level].scaleCoefficient;
            playerSpaceshipInfos.shootRate = possibleSpaceships[level].shootRate;
            break;
        case "half":
            playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesShieldHalf.idle;
            playerSpaceshipInfos.sprites.left = possibleSpaceships[level].spritesShieldHalf.left;
            playerSpaceshipInfos.sprites.right = possibleSpaceships[level].spritesShieldHalf.right;
            playerSpaceshipInfos.spaceBottom = possibleSpaceships[level].spaceBottom;
            playerSpaceshipInfos.lifePoints = possibleSpaceships[level].lifePoints;
            playerSpaceshipInfos.scaleCoefficient = possibleSpaceships[level].scaleCoefficient;
            playerSpaceshipInfos.shootRate = possibleSpaceships[level].shootRate;
            break;
        case "full":
            playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesShieldFull.idle;
            playerSpaceshipInfos.sprites.left = possibleSpaceships[level].spritesShieldFull.left;
            playerSpaceshipInfos.sprites.right = possibleSpaceships[level].spritesShieldFull.right;
            playerSpaceshipInfos.spaceBottom = possibleSpaceships[level].spaceBottom;
            playerSpaceshipInfos.lifePoints = possibleSpaceships[level].lifePoints;
            playerSpaceshipInfos.scaleCoefficient = possibleSpaceships[level].scaleCoefficient;
            playerSpaceshipInfos.shootRate = possibleSpaceships[level].shootRate;
            break;
    }
    console.log(playerSpaceshipInfos);
}
