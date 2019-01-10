//Creation des params de la partie

let sprites = new Howl({
    src: ['assets/spritesound.mp3'],
    sprite: {
        playerDeath: [0, 1840],
        ennemyDeath: [1938, 443],
        gunUpgrade: [2846, 789],
        shieldUpgrade: [3709, 882],
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
    onend: function () {
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

let timeBetweenBonuses = 30000;
let timeBetweenMovement = 1500; // Temps entre chaque mouvement des ennemis
let timeBetweenEnnemyShot = 5000;
let gameWidth = game.config.width;
let gameHeight = game.config.height;
let playerScore = 0; // le score du joueur
let bulletsGroup;
let ennemisBulletsGroup;
let speed;
let lastFired = 0;
let bulletObject;
let initialMoveSpeed = 2.5 + (gameWidth * 0.003); // vitesse de reference utilisee notamment pour reinitialiser la vitesse apres un dash
let moveSpeed = initialMoveSpeed; // vitesse du vaisseau du joueur generale, initialement a la vitesse de reference
let moveSpeedDash = initialMoveSpeed + 5; // vitesse du vaisseau du joueur lors d'un dash (acceleration)
let starfield;
let oldShootRate;
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
        action: () => { // acceleration de la vitesse de tir
            let oldShootRate = playerSpaceshipInfos.shootRate;
            playerSpaceshipInfos.shootRate -= 400;
            setTimeout(() => {
                playerSpaceshipInfos.shootRate = oldShootRate;
            }, 3000);
        }
    },
    {
        sprite: "bonus2",
        action: () => { // regain d'un point de sante
            if (playerSpaceshipInfos.lifePoints < playerSpaceshipInfos.maxLifePoints) {
                playerSpaceshipInfos.lifePoints++;
            }
        }
    },
    {
        sprite: "bonus3",
        action: () => { // ajout un bouclier au joueur
            if (playerSpaceshipInfos.shield === "none") {
                playerSpaceshipInfos.shield = "full";
                shieldInfos.lifePoints = 2;
                playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesShieldFull.idle;
            }
        }
    },
    {
        sprite: "bonus4",
        action: () => {
            console.log("random shoot");
        }
    },
    {
        sprite: "malus",
        action: () => {
            if (playerSpaceshipInfos.lifePoints === 1 && shieldInfos.lifePoints === 0) {
                playerSpaceshipInfos.lifePoints--;
                game.scene.pause("default");
            } else {
                if (playerSpaceshipInfos.shield === "full") {
                    playerSpaceshipInfos.shield = "half";
                    playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesShieldHalf.idle;
                    shieldInfos.lifePoints--;
                } else if (playerSpaceshipInfos.shield === "half") {
                    playerSpaceshipInfos.shield = "none";
                    playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesNoShield.idle;
                    shieldInfos.lifePoints--;
                } else {
                    playerSpaceshipInfos.lifePoints--;
                }
            }
            console.log("malus");
        }
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
let timerEventEnnemis; // Le timer qui va lancer le trigger de déplacement de chaque ennemis
let timerEventTirEnnemis; // Le timer qui va lancer le trigger de déplacement de chaque ennemis
let scoreText;
let touchBorderRight = false;
let touchBorderLeft = false;
let travelDownOnce = false; // Variable levier qui va servir au déplacement vers le bas lors qu'un des bords à été atteind
let lateralMovementSize = 30;
let downMovementSize = 10;
let lifeText;
let cursors; // Objet Phaser representatif du clavier (pour les touches)
let level = 0; // le niveau du vaisseau du joueur
let playerSpaceship; // Objet Phaser representatif du vaisseau
let possibleSpaceships = [ // Objet representatif des caracteristiques du vaisseau du joueur qu'il peut obtenir (niveaux de vaisseau)
    {
        level: 0,
        spritesShieldFull: {
            idle: "upgradeLvl0ShieldFull",
        },
        spritesShieldHalf: {
            idle: "upgradeLvl0ShieldHalf",
        },
        spritesNoShield: {
            idle: "upgradeLvl0NoShield",
        },
        spaceBottom: 75,
        maxLifePoints: 3,
        lifePoints: 3,
        scaleCoefficient: 1,
        shootRate: 800
    },
    {
        level: 1,
        spritesShieldFull: {
            idle: "upgradeLvl1ShieldFull",
        },
        spritesShieldHalf: {
            idle: "upgradeLvl1ShieldHalf",
        },
        spritesNoShield: {
            idle: "upgradeLvl1NoShield",
        },
        spaceBottom: 75,
        maxLifePoints: 4,
        lifePoints: 4,
        scaleCoefficient: 1,
        shootRate: 700
    },
    {
        level: 2,
        spritesShieldFull: {
            idle: "upgradeLvl2ShieldFull",
        },
        spritesShieldHalf: {
            idle: "upgradeLvl2ShieldHalf",
        },
        spritesNoShield: {
            idle: "upgradeLvl2NoShield",
        },
        spaceBottom: 75,
        maxLifePoints: 5,
        lifePoints: 5,
        scaleCoefficient: 1,
        shootRate: 600
    },
    {
        level: 3,
        spritesShieldFull: {
            idle: "upgradeLvl3ShieldFull",
        },
        spritesShieldHalf: {
            idle: "upgradeLvl3ShieldHalf",
        },
        spritesNoShield: {
            idle: "upgradeLvl3NoShield",
        },
        spaceBottom: 75,
        maxLifePoints: 6,
        lifePoints: 6,
        scaleCoefficient: 1,
        shootRate: 500
    }
];
let shieldInfos = {
    lifePoints: 0 // le nombre de points de vie du bouclier (si celui-ci est obtenu par le joueur)
};
let playerSpaceshipInfos = { // Objet representatif des caracteristiques du vaisseau du joueur en temps reel
    sprites: {
        idle: possibleSpaceships[level].spritesNoShield.idle, // le sprite utilise en position normale sans bouclier
    },
    spaceBottom: possibleSpaceships[level].spaceBottom, // espace entre le vaisseau et le bas de l'ecran
    maxLifePoints: possibleSpaceships[level].maxLifePoints, // le nombre maximum de points de vie du vaisseau
    lifePoints: possibleSpaceships[level].lifePoints, // le nombre de points de vie du vaisseau (lvl0 => 3,  lvl1 => 4, lvl2 => 5, lvl3 => 6)
    scaleCoefficient: possibleSpaceships[level].scaleCoefficient, // le coefficient de redimensionnement du sprite
    shield: "none", // permet de determiner si le vaisseau dispose d'un bonus bouclier ou pas (none => pas de bouclier, half => bouclier a 50% de capacite, full => bouclier a 100% de capacite
    shootRate: possibleSpaceships[level].shootRate // temps entre deux tirs du vaisseau
};
let restartButton;

//Method where I can load my assets
function preload() {
    this.load.image('starfield', './assets/game_background.png');

    this.load.image('upgradeLvl0NoShield', './assets/player_level0_without_shield.png');
    this.load.image('upgradeLvl0ShieldFull', './assets/player_level0_with_shield_full.png');
    this.load.image('upgradeLvl0ShieldHalf', './assets/player_level0_with_shield_half.png');

    this.load.image('upgradeLvl1NoShield', './assets/player_level1_without_shield.png');
    this.load.image('upgradeLvl1ShieldFull', './assets/player_level1_with_shield_full.png');
    this.load.image('upgradeLvl1ShieldHalf', './assets/player_level1_with_shield_half.png');

    this.load.image('upgradeLvl2NoShield', './assets/player_level2_without_shield.png');
    this.load.image('upgradeLvl2ShieldFull', './assets/player_level2_with_shield_full.png');
    this.load.image('upgradeLvl2ShieldHalf', './assets/player_level2_with_shield_half.png');

    this.load.image('upgradeLvl3NoShield', './assets/player_level3_without_shield.png');
    this.load.image('upgradeLvl3ShieldFull', './assets/player_level3_with_shield_full.png');
    this.load.image('upgradeLvl3ShieldHalf', './assets/player_level3_with_shield_half.png');

    this.load.image('bullet', './assets/round_laser_blue.png');
    this.load.image('ennemi1', './assets/ennemi_1@0.75x.png');
    this.load.image('ennemi2', './assets/ennemi_2@0.75x.png');
    this.load.image('ennemi3', './assets/ennemi_3@0.75x.png');
    this.load.image('ennemi4', './assets/ennemi_4@0.75x.png');
    this.load.image('bonus1', './assets/star_laser_blue.png');
    this.load.image('bonus2', './assets/star_laser_green.png');
    this.load.image('bonus3', './assets/star_laser_pink.png');
    this.load.image('bonus4', './assets/star_laser_yellow.png');

    this.load.image('malus', './assets/long_laser_green.png');

    this.load.image('upgrade1', './assets/laser_blue.png');
    this.load.image('upgrade2', './assets/laser_green.png');
    this.load.image('upgrade3', './assets/laser_pink.png');
}

//Methode executee juste apres preload
function create() {
    marginTopEnemies = 110;
    level = 0;
    playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesNoShield.idle;
    playerSpaceshipInfos.spaceBottom = possibleSpaceships[level].spaceBottom;
    playerSpaceshipInfos.maxLifePoints = possibleSpaceships[level].maxLifePoints;
    playerSpaceshipInfos.lifePoints = possibleSpaceships[level].lifePoints;
    playerSpaceshipInfos.scaleCoefficient = possibleSpaceships[level].scaleCoefficient;
    playerSpaceshipInfos.shield = "none";
    playerSpaceshipInfos.shootRate = possibleSpaceships[level].shootRate;
    playerScore = 0;
    restartButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    timerEvent = this.time.addEvent({ delay: timeBetweenBonuses, callback: drawNewBonus, loop: true });
    timerEventEnnemis = this.time.addEvent({delay: timeBetweenMovement, callback: checkBeforeMoveEnnemis, loop: true});
    timerEventTirEnnemis = this.time.addEvent({delay: timeBetweenEnnemyShot, callback: makeEnnemisFire, loop: true});
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

    lifeText = this.add.text(300, 20, "Vies : " + playerSpaceshipInfos.lifePoints, {
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

    let ennemyBullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize: function Bullet(scene) {
            bulletObject = Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
            this.speed = Phaser.Math.GetSpeed(400, 1);
        },

        fire: function (x, y) {
            this.setPosition(x, y + 50);

            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta) {
            this.y += this.speed * delta;

            if (this.y > gameHeight) {
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

    ennemisBulletsGroup = this.physics.add.group({
        classType: ennemyBullet,
        maxSize: 100,
        runChildUpdate: true
    });
    ennemisBulletsGroup.defaults.setAllowGravity = false;

    this.anims.create({
        key: 'turn',
        frames: [{ key: playerSpaceshipInfos.sprites.idle, frame: 1 }],
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

    this.physics.add.overlap(playerSpaceship, ennemisBulletsGroup, (playerSpaceship, bullet) => {
        console.log("touché tes nul");
        bullet.destroy();
    }, null, this);

    this.physics.add.overlap(playerSpaceship, bonusesGroup, (playerSpaceship, bonus) => {
        bonus.data.values.action();
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
        bonus.destroy();
    }, null, this);
}


function update(time, delta) {
    starfield.tilePositionY -= scrollSpeed;

    if (cursors.left.isDown) {
        if (playerSpaceship.x < 0) {
            playerSpaceship.x = gameWidth;
        }
        playerSpaceship.x -= moveSpeed;
    } else if (cursors.right.isDown) {
        if (playerSpaceship.x > gameWidth) {
            playerSpaceship.x = 0;
        }
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

    if (restartButton._justDown) {
        this.scene.restart();
    }


    updateSpaceship(this);
    drawNewBonus(timerEvent);
}

function makeEnnemisFire() {

    enemiesGroup.getChildren().forEach((current) => {
        let bullet = ennemisBulletsGroup.get();

        if (bullet) {
            bullet.fire(current.x, current.y);
            // sprites.play("shot");
            // lastFired = time + playerSpaceshipInfos.shootRate;
        }
    });
}

/**
 *
 * Cette fonction permet de vérifier si les invaders on atteind un des deux bords
 * Si c'est le cas il bouge une fois vers le bas et se déplace dans le sens opposé et tout recommence.
 *
 **/

function checkBeforeMoveEnnemis() {
    enemiesGroup.getChildren().forEach((current) => {
        if (current.x + current.width/2 >= gameWidth) {
            touchBorderRight = true;
            touchBorderLeft = false;
            travelDownOnce = !travelDownOnce;
        } else if (current.x - current.width/2 <= 0) {
            touchBorderLeft = true;
            touchBorderRight = false;
            travelDownOnce = !travelDownOnce;
        }
    });

    if ((touchBorderRight || touchBorderLeft) && travelDownOnce) {
        moveEnnemis(null, true);
    } else if (!touchBorderRight) {
        moveEnnemis(lateralMovementSize, false);

    } else if (!touchBorderLeft) {
        moveEnnemis(-lateralMovementSize, false);

    }
}

/**
 * Simple fonction utilitaire qui permet de déplacer les invaders
 * @param movement
 * @param down
 */
function moveEnnemis(movement, down) {
    enemiesGroup.getChildren().forEach((current) => {
        if (down) {
            current.y += downMovementSize;
        } else {
            current.x = current.x + movement;
        }
    });
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

function updateSpaceship(ctx) {
    playerSpaceship.setTexture(playerSpaceshipInfos.sprites.idle);
    for (let key in ctx.textures.list) {
        if (ctx.textures.list.hasOwnProperty(key)) {
            if (key === playerSpaceshipInfos.sprites.idle) {
                playerSpaceship.setSize(ctx.textures.list[key].source[0].width, ctx.textures.list[key].source[0].height);
            }
        }
    }
    if (playerSpaceshipInfos.shield === "full" || playerSpaceshipInfos.shield === "half") {
        lifeText.setText("Vies : " + playerSpaceshipInfos.lifePoints + " + " + shieldInfos.lifePoints + "pts de bouclier");
    } else {
        lifeText.setText("Vies : " + playerSpaceshipInfos.lifePoints);
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

function drawUpgradeBonus(level) {
    let rand = getRandomX();
    let created = upgradesGroup.create(rand, -50, possibleUpgradeBonuses[level].sprite);
    created.setData("level", possibleUpgradeBonuses[level].level);
}

function drawNewBonus() {
    if (timerEvent.getProgress() === 1) {
        let rand = getRandomX();
        let bonusDatas = possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)];
        let created = bonusesGroup.create(rand, -50, bonusDatas.sprite);
        created.setData(bonusDatas);
    }
}

function switchInfos(mode, level) {
    switch (mode) {
        case "none":
            playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesNoShield.idle;
            playerSpaceshipInfos.spaceBottom = possibleSpaceships[level].spaceBottom;
            playerSpaceshipInfos.maxLifePoints = possibleSpaceships[level].maxLifePoints;
            playerSpaceshipInfos.lifePoints = possibleSpaceships[level].lifePoints;
            playerSpaceshipInfos.scaleCoefficient = possibleSpaceships[level].scaleCoefficient;
            playerSpaceshipInfos.shootRate = possibleSpaceships[level].shootRate;
            break;
        case "half":
            playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesShieldHalf.idle;
            playerSpaceshipInfos.spaceBottom = possibleSpaceships[level].spaceBottom;
            playerSpaceshipInfos.maxLifePoints = possibleSpaceships[level].maxLifePoints;
            playerSpaceshipInfos.lifePoints = possibleSpaceships[level].lifePoints;
            playerSpaceshipInfos.scaleCoefficient = possibleSpaceships[level].scaleCoefficient;
            playerSpaceshipInfos.shootRate = possibleSpaceships[level].shootRate;
            break;
        case "full":
            playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesShieldFull.idle;
            playerSpaceshipInfos.spaceBottom = possibleSpaceships[level].spaceBottom;
            playerSpaceshipInfos.maxLifePoints = possibleSpaceships[level].maxLifePoints;
            playerSpaceshipInfos.lifePoints = possibleSpaceships[level].lifePoints;
            playerSpaceshipInfos.scaleCoefficient = possibleSpaceships[level].scaleCoefficient;
            playerSpaceshipInfos.shootRate = possibleSpaceships[level].shootRate;
            break;
    }
}
