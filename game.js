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

let nbWavesCleared = 1; // le nombre de vagues d'ennemis que le joueur a éliminées
let timeBetweenBonuses = 45000; // temps entre l'arrivée de chaque bonus (réduit au fur et à mesure que les vagues avancent)
let timeBetweenMovement = 1500; // Temps entre chaque mouvement des ennemis (réduit au fur et à mesure que les vagues avancent)
let timeBetweenEnnemyShot = 5000; /// temps entre chaque tir des ennemis (réduit au fur et à mesure que les vagues avancent)
let gameWidth = game.config.width; // largeur de la surface de jeu
let gameHeight = game.config.height; // hauteur de la surface de jeu
let playerScore = 0; // le score du joueur
let upgradesPoints = 0; // le compteur de points pour les améliorations
let bulletsGroup; // groupe Phaser représentant les balles tirées par le joueur
let ennemisBulletsGroup; // groupe Phaser représentant les balles tirées par les ennemis
let lastFired = 0; // marqueur temporel du moment où le joueur a tiré en dernier (utilisé pour imposer un délai entre les tirs)
let laserShoot = false; // indique si le bonus tir rapide + dégâts augmentés est activé pour le joueur
let bulletObject; // objet Phaser représentant une balle du joueur
let initialMoveSpeed = 2.5 + (gameWidth * 0.003); // vitesse de reference utilisee notamment pour reinitialiser la vitesse apres un dash
let moveSpeed = initialMoveSpeed; // vitesse du vaisseau du joueur generale, initialement a la vitesse de reference
let moveSpeedDash = initialMoveSpeed + 5; // vitesse du vaisseau du joueur lors d'un dash (acceleration)
let starfield; // le fond du jeu (ciel étoilé)
let scrollSpeed = 0.5; // vitesse de défilement du fond
let marginTopEnemies = 110; // espacement vertical entre le haut de la fenêtre de jeu et la première ligne d'ennemis
let bonusesGroup; // le groupe physique (collisions) contenant tous les bonus actuellement affichés dans le jeu
let upgradesGroup; // le groupe physique (collisions) contenant toutes les améliorations actuellement affichées dans le jeu
let enemiesGroup; // le groupe physique (collisions) contenant tous les ennemis des lignes quel que soit leur type
let gameEnemies = [ // tableau représentatif des différents ennemis du jeu et des paramètres qui leurs sont associés
    {
        spriteName: "ennemi4", // le nom du sprite de l'ennemi
        enemyWidth: 0, // sa largeur en pixel, initialement à 0, recalculée par la suite
        spaceBetweenEnemiesWidth: 50, // espacement initial souhaité entre les ennemis de la ligne, recalculé ensuite
        possiblePerRow: 0, // le nombre maximal d'ennemi de ce type possible sur une seule ligne
        life: 3, // le nombre de points de vie de l'ennemi
        nbPoints: 3 // le nombre de points obtenus par le joueur lors de l'élimination de cet ennemi
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
        action: () => { // accéleration de la vitesse de tir
            if (playerSpaceshipInfos.shootRate >= 400) {
                let oldShootRate = playerSpaceshipInfos.shootRate;
                playerSpaceshipInfos.shootRate -= 400;
                setTimeout(() => {
                    playerSpaceshipInfos.shootRate = oldShootRate;
                }, 5000);
            }
        }
    },
    {
        sprite: "bonus2",
        action: () => { // regain d'un point de santé
            if (playerSpaceshipInfos.lifePoints < playerSpaceshipInfos.maxLifePoints) {
                playerSpaceshipInfos.lifePoints++;
            }
        }
    },
    {
        sprite: "bonus3",
        action: () => { // ajout un bouclier au joueur
            if (playerSpaceshipInfos.shield === "none") {
                sprites.play("shieldUpgrade");
                playerSpaceshipInfos.shield = "full";
                shieldInfos.lifePoints = 2;
                playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesShieldFull.idle;
            }
        }
    },
    {
        sprite: "bonus4",
        action: () => { // tir très rapide qui enlève deux points de vie à l'ennemi au lieu d'un
            let oldShootRate = playerSpaceshipInfos.shootRate;
            let oldDamage = playerSpaceshipInfos.damage;
            laserShoot = true;
            playerSpaceshipInfos.shootRate = 75;
            playerSpaceshipInfos.damage = 2;
            setTimeout(() => {
                playerSpaceshipInfos.shootRate = oldShootRate;
                laserShoot = false;
                playerSpaceshipInfos.damage = oldDamage;
            }, 3000);
        }
    },
    {
        sprite: "malus",
        action: () => { // perte d'un point de vie
            if (playerSpaceshipInfos.lifePoints === 1 && shieldInfos.lifePoints === 0) {
                playerSpaceshipInfos.lifePoints--;
                sprites.play("playerDeath");
                game.scene.pause("default");
                let scores;
                scores = JSON.parse(localStorage.getItem("scores"));
                scores.push({name: localStorage.getItem("actualPlayer"), score: playerScore});
                localStorage.setItem("scores", JSON.stringify(scores));
                window.location.replace("https://mouun.github.io/space-invaders-remastered/score.html");
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
        }
    }
];
let possibleUpgradeBonuses = [ // tableau qui décrit les différentes améliorations de vaisseau qui peuvent être obtenues par le joueur
    {
        sprite: "upgrade1", // le sprite utilisé pour représenter cette amélioration
        level: 1, // le niveau du joueur requis pour débloquer cette amélioration
        nbPointsRequired: 10 // le nombre de points du joueur requis pour débloquer cette amélioration
    },
    {
        sprite: "upgrade2",
        level: 2,
        nbPointsRequired: 20,
    },
    {
        sprite: "upgrade3",
        level: 3,
        nbPointsRequired: 35,
    }
];
let invulnerable = false; // indique si le joueur est invulnérable ou non (utilisé pour donner un léger temps d'invincibilité au joueur après avoir été touché par une balle ennemie)
let nbEnemiesShooting = 1; // défini combien d'ennemis peuvent tirer en même temps
let verticalSpacing = 70; // espacement vertical entre chaque ligne d'ennemis
let timerEvent; // le timer qui va lancer le trigger de génération d'un bonus
let timerEventEnnemis; // Le timer qui va lancer le trigger de déplacement de chaque ennemi
let timerEventTirEnnemis; // Le timer qui va lancer le trigger de déplacement de chaque ennemi
let scoreText; // le texte permettant d'afficher le score du joueur
let touchBorderRight = false; // indique si un ennemi vient de toucher le bord droit de l'écran
let touchBorderLeft = false; // indique si un ennemi vient de toucher le bord gauche de l'écran
let travelDownOnce = false; // Variable levier qui va servir au déplacement vers le bas lorsqu'un des bords à été atteind
let lateralMovementSize = 0.1; // la taille du déplacement latéral des ennemis (en pixel)
let downMovementSize = 15; // la taille du déplacement horizontal des ennemis (en pixel)
let lifeText; // le texte permettant d'afficher la santé du joueur
let wavesText; // le texte permettant d'afficher le numéro de la vague actuellement jouée par le joueur
let cursors; // Objet Phaser représentatif du clavier (pour les touches)
let level = 0; // le niveau du vaisseau du joueur
let playerSpaceship; // Objet Phaser représentatif du vaisseau
let possibleSpaceships = [ // Objet représentatif des caractéristiques du vaisseau du joueur qu'il peut obtenir (niveaux de vaisseau)
    {
        level: 0, // le niveau du vaisseau décrit
        spritesShieldFull: { // catégorie de sprite bouclier plein
            idle: "upgradeLvl0ShieldFull", // le sprite en question
        },
        spritesShieldHalf: { // catégorie de sprite bouclier à moitié de capacité
            idle: "upgradeLvl0ShieldHalf", // le sprite en question
        },
        spritesNoShield: { // catégorie de sprite sans bouclier
            idle: "upgradeLvl0NoShield", // le sprite en question
        },
        spaceBottom: 75, // l'espacement entre le bas de l'écran et le vaisseau
        maxLifePoints: 3, // le nombre de points de vie maximal pour ce vaisseau
        lifePoints: 3, // le nombre de points de vie initial pour ce vaisseau
        scaleCoefficient: 1, // coefficient utilisé pour le redimensionnement du vaisseau
        shootRate: 800 // le temps entre chaque tirs de ce vaisseau
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
let shieldInfos = { // informations liées au bouclier
    lifePoints: 0 // le nombre de points de vie du bouclier (si celui-ci est obtenu par le joueur)
};
let playerSpaceshipInfos = { // Objet représentatif des caractéristiques du vaisseau du joueur en temps réel (ces informations sont prises dans le tableau "possibleSpaceships" en fonction du niveau du joueur
    sprites: {
        idle: possibleSpaceships[level].spritesNoShield.idle, // le sprite utilisé en position normale sans bouclier
    },
    spaceBottom: possibleSpaceships[level].spaceBottom, // espace entre le vaisseau et le bas de l'écran
    maxLifePoints: possibleSpaceships[level].maxLifePoints, // le nombre maximum de points de vie du vaisseau
    lifePoints: possibleSpaceships[level].lifePoints, // le nombre de points de vie du vaisseau (lvl0 => 3,  lvl1 => 4, lvl2 => 5, lvl3 => 6)
    scaleCoefficient: possibleSpaceships[level].scaleCoefficient, // le coéfficient de redimensionnement du sprite
    shield: "none", // permet de déterminer si le vaisseau dispose d'un bonus bouclier ou pas (none => pas de bouclier, half => bouclier à 50% de capacité, full => bouclier à 100% de capacité
    shootRate: possibleSpaceships[level].shootRate, // temps entre deux tirs du vaisseau
    damage: 1 // les dégâts infligés par le joueur
};
let restartButton;
let enemiesBulletsCollider;

function preload() {
    // tous les sprites utilisés dans le jeu
    this.load.image('starfield', './assets/game_background.png'); // fond du jeu

    this.load.image('upgradeLvl0NoShield', './assets/player_level0_without_shield.png'); // vaisseau niveau 1 sans bouclier
    this.load.image('upgradeLvl0ShieldFull', './assets/player_level0_with_shield_full.png'); // vaisseau niveau 1 avec bouclier plein
    this.load.image('upgradeLvl0ShieldHalf', './assets/player_level0_with_shield_half.png'); // vaisseau niveau 1 avec bouclier à moitié

    this.load.image('upgradeLvl1NoShield', './assets/player_level1_without_shield.png'); // vaisseau niveau 2 sans bouclier
    this.load.image('upgradeLvl1ShieldFull', './assets/player_level1_with_shield_full.png'); // vaisseau niveau 2 avec bouclier plein
    this.load.image('upgradeLvl1ShieldHalf', './assets/player_level1_with_shield_half.png'); // vaisseau niveau 2 avec bouclier à moitié

    this.load.image('upgradeLvl2NoShield', './assets/player_level2_without_shield.png'); // vaisseau niveau 3 sans bouclier
    this.load.image('upgradeLvl2ShieldFull', './assets/player_level2_with_shield_full.png'); // vaisseau niveau 3 avec bouclier plein
    this.load.image('upgradeLvl2ShieldHalf', './assets/player_level2_with_shield_half.png'); // vaisseau niveau 3 avec bouclier à moitié

    this.load.image('upgradeLvl3NoShield', './assets/player_level3_without_shield.png'); // vaisseau niveau 4 sans bouclier
    this.load.image('upgradeLvl3ShieldFull', './assets/player_level3_with_shield_full.png'); // vaisseau niveau 4 avec bouclier plein
    this.load.image('upgradeLvl3ShieldHalf', './assets/player_level3_with_shield_half.png'); // vaisseau niveau 4 avec bouclier à moitié

    this.load.image('bullet', './assets/round_laser_blue.png'); // balle d'un joueur (hors mode tir très rapide)
    this.load.image('bulletLaser', './assets/long_laser_blue.png'); // balle d'un joueur (mode tir très rapide)
    this.load.image('bulletEnemies', './assets/round_laser_pink.png'); // balle d'un ennemi
    this.load.image('ennemi1', './assets/ennemi_1@0.75x.png'); // type d'ennemi 1
    this.load.image('ennemi2', './assets/ennemi_2@0.75x.png'); // type d'ennemi 2
    this.load.image('ennemi3', './assets/ennemi_3@0.75x.png'); // type d'ennemi 3
    this.load.image('ennemi4', './assets/ennemi_4@0.75x.png'); // type d'ennemi 4
    this.load.image('bonus1', './assets/fast_shoot.png'); // type de bonus 1
    this.load.image('bonus2', './assets/heal.png'); // type de bonus 2
    this.load.image('bonus3', './assets/shield.png'); // type de bonus 3
    this.load.image('bonus4', './assets/laserShoot.png'); // type de bonus 4

    this.load.image('malus', './assets/malus.png'); // malus

    this.load.image('upgrade1', './assets/upgrade1.png'); // amélioration de vaisseau 1
    this.load.image('upgrade2', './assets/upgrade2.png'); // amélioration de vaisseau 2
    this.load.image('upgrade3', './assets/upgrade3.png'); // amélioration de vaisseau 3

    this.load.image('blue_spark', './assets/blue_spark.png'); // particules bleues pour les niveaux de vaisseau 1 et 3
    this.load.image('red_spark', './assets/red_spark.png'); // particules rouges pour le niveau de vaisseau 2
    this.load.image('purple_spark', './assets/purple_spark.png'); // particules violettes pour le niveau de vaisseau 4
}
let playerParticles; // objet Phaser représentant des particules
let playerEmitter; // objet Phaser permettant d'émettre des particules

//Methode executee juste apres preload
function create() {
    resetPlayerSpaceship();
    marginTopEnemies = 110;
    nbWavesCleared = 1;
    timeBetweenMovement = 1500;
    playerScore = 0;
    upgradesPoints = 0;
    restartButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    timerEvent = this.time.addEvent({ delay: timeBetweenBonuses, callback: drawNewBonus, loop: true });
    timerEventEnnemis = this.time.addEvent({delay: 1, callback: checkBeforeMoveEnnemis, loop: true});
    timerEventTirEnnemis = this.time.addEvent({delay: timeBetweenEnnemyShot, callback: makeEnnemisFire, loop: true});
    setEnemiesWidths(this);
    gameEnemies.forEach((enemy) => {
        calculateMaxEnnemiesPerRow(enemy);
    });

    starfield = this.add.tileSprite(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, "starfield");

    playerParticles = this.add.particles('blue_spark');

    playerEmitter = playerParticles.createEmitter({
        angle: { min: 85, max: 95 },
        speed: 150,
        lifespan: { min: 100, max: 500 },
        blendMode: "ADD"
    });

    scoreText = this.add.text(20, 20, "Score : " + playerScore, {
        fontFamily: 'Segoe UI',
        fontSize: 36,
        color: '#ffffff'
    });

    lifeText = this.add.text(300, 20, "Vies : " + playerSpaceshipInfos.lifePoints, {
        fontFamily: 'Segoe UI',
        fontSize:  36,
        color: '#ffffff'
    });

    wavesText = this.add.text(800, 20, "Manche : " + nbWavesCleared, {
        fontFamily: 'Segoe UI',
        fontSize: 36,
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

    let EnemyBullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize: function EnemyBullet (scene) {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bulletEnemies');
            this.speed = 1;
            this.direction = 0;
            this.xSpeed = 0;
            this.ySpeed = 0;
        },

        fire: function (enemy, playerSpaceship) {
            this.setPosition(enemy.x, enemy.y + (enemy.width / 2));
            this.direction = Math.atan((playerSpaceship.x - this.x) / (playerSpaceship.y - this.y));

            if (playerSpaceship.y >= this.y) {
                this.xSpeed = this.speed * Math.sin(this.direction);
                this.ySpeed = this.speed * Math.cos(this.direction);
            } else {
                this.xSpeed = -this.speed * Math.sin(this.direction);
                this.ySpeed = -this.speed * Math.cos(this.direction);
            }

            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta) {
            this.x += this.xSpeed * delta;
            this.y += this.ySpeed * delta;
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
        classType: EnemyBullet,
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

    playerEmitter.startFollow(playerSpaceship, 0, 20);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.overlap(enemiesGroup, bulletsGroup, (enemy, bullet) => {
        enemy.setData("life", enemy.getData("life") - playerSpaceshipInfos.damage);
        if (enemy.getData("life") <= 0) {
            for (let i = 0; i < enemy.data.values.nbPoints; i++) {
                upgradesPoints++;
                playerScore++;
                possibleUpgradeBonuses.forEach((upgrade) => {
                    if (upgradesPoints === upgrade.nbPointsRequired) {
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

    enemiesBulletsCollider = this.physics.add.overlap(playerSpaceship, ennemisBulletsGroup, (playerSpaceship, bullet) => {
        invulnerable = true;
        if (playerSpaceshipInfos.lifePoints === 1 && shieldInfos.lifePoints === 0) {
            playerSpaceshipInfos.lifePoints--;
            sprites.play("playerDeath");
            game.scene.pause("default");


            let scores;

            scores = JSON.parse(localStorage.getItem("scores"));

            scores.push({name: localStorage.getItem("actualPlayer"), score: playerScore});
            localStorage.setItem("scores", JSON.stringify(scores));
            window.location.replace("https://mouun.github.io/space-invaders-remastered/score.html");
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
        setTimeout(() => {
            enemiesBulletsCollider.active = true;
            invulnerable = false;
        }, 1500);

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
        sprites.play("gunUpgrade");
        bonus.destroy();
    }, null, this);

    this.input.keyboard.on('keydown_O', () => {
        enemiesGroup.getChildren().forEach((enemy) => enemy.destroy());
    });
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

    switch (level) {
        case 1:
            playerParticles.setTexture("red_spark");
            break;
        case 2:
            playerParticles.setTexture("blue_spark");
            break;
        case 3:
            playerParticles.setTexture("purple_spark");
    }

    if (enemiesGroup.getChildren().length === 0) {
        if (nbWavesCleared < 10) {
            timerEvent.delay -= 3500;
            timerEventTirEnnemis.delay -= 200;
            lateralMovementSize += 0.05;
            nbEnemiesShooting++;
        }

        console.log(lateralMovementSize);

        resetPlayerSpaceship();
        playerParticles.setTexture("blue_spark");
        touchBorderRight = false;
        touchBorderLeft = false;
        travelDownOnce = false;
        downMovementSize = 10;
        marginTopEnemies = 110;
        nbWavesCleared++;
        gameEnemies.forEach((enemy) => {
            generateEnemies(enemy);
        });
        wavesText.setText("Manche : " + nbWavesCleared);
    }

    if (laserShoot === true) {
        let bullet = bulletsGroup.get();
        if (bullet) {
            bullet.setTexture("bulletLaser");
        }
    } else {
        let bullet = bulletsGroup.get();
        if (bullet) {
            bullet.setTexture("bullet");
        }
    }

    if (invulnerable === true) {
        enemiesBulletsCollider.active = false;
    }

    updateSpaceship(this);
    drawNewBonus(timerEvent);
}

/**
 * Permet de faire tirer les ennemis
 */
function makeEnnemisFire() {
    // chaque ennemi tir l'un après l'autre avec un délai de 300ms
    // les tirs sont dirigés vers le joueur
    for (let i = 0; i < nbEnemiesShooting - 1; i++) {
        setTimeout(() => {
            let bullet = ennemisBulletsGroup.get();
            if (bullet) {

                bullet.fire(enemiesGroup.getChildren()[Math.floor(Math.random() * possibleBonuses.length)], playerSpaceship);
                sprites.play("ennemyShot");
            }
        }, 300 * i);
    }

    // envoi une salve de balles ennemies
    getNRandoms(nbEnemiesShooting).forEach((enemy) => {
        let bullet = ennemisBulletsGroup.get();

        if (bullet) {

            bullet.fire(enemy, playerSpaceship);
            sprites.play("ennemyShot");
        }
    });
}

/**
 * Permet de générer un tableau contenant n ennemis pris aléatoirement dans la liste de tous les ennemis présent dans le jeu actuellement
 * @param n Le nombre d'ennemis aléatoires à trouver
 * @returns {T[]} un tableau contenant n ennemis pris aléatoirement dans la liste de tous les ennemis présent dans le jeu actuellement
 */
function getNRandoms(n) {
    const shuffled = enemiesGroup.getChildren().sort(() => 0.4 - Math.random());
    return shuffled.slice(0, n);
}

/**
 * Cette fonction permet de vérifier si les invaders on atteind un des deux bords
 * Si c'est le cas il bouge une fois vers le bas et se déplace dans le sens opposé et tout recommence.
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

/**
 * Permet la mise a jour de la texture du vaisseau (utile notamment lorsque le joueur recupere une amelioration pour son vaisseau)
 * @param ctx Le contexte
 */
function updateSpaceship(ctx) {
    playerSpaceship.setTexture(playerSpaceshipInfos.sprites.idle);
    for (let key in ctx.textures.list) {
        if (ctx.textures.list.hasOwnProperty(key)) {
            if (key === playerSpaceshipInfos.sprites.idle) {
                playerSpaceship.setSize(ctx.textures.list[key].source[0].width - 15, ctx.textures.list[key].source[0].height - 15);
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

/**
 * Permet de generer un bonus d'amelioration en fonction du niveau du joueur
 * @param level Le niveau actuel du joueur (qui determine le bonus d'amelioration qui va etre genere)
 */
function drawUpgradeBonus(level) {
    let rand = getRandomX();
    let created = upgradesGroup.create(rand, -50, possibleUpgradeBonuses[level].sprite);
    created.setData("level", possibleUpgradeBonuses[level].level);
}

/**
 * Permet de generer un bonus aleatoire parmi tous les bonus definis dans le tableau "possibleBonuses"
 */
function drawNewBonus() {
    if (timerEvent.getProgress() === 1) {
        let rand = getRandomX();
        let bonusDatas = possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)];
        let created = bonusesGroup.create(rand, -50, bonusDatas.sprite);
        created.setData(bonusDatas);
    }
}

/**
 * Permet de basculer les informations du vaisseau du joueur entre les états sans bouclier, avec bouclier plein ou avec bouclier à moitié
 * @param mode Le mode qui va être activé (sans bouclier, bouclier plein, bouclier à moitié)
 * @param level Le niveau actuel du joueur qui va permettre de fixer les informations du vaisseau en fonction de ce même niveau
 */
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

/**
 * Permet de réinitialiser les paramètres du vaisseau au niveau 1
 */
function resetPlayerSpaceship() {
    level = 0;
    upgradesPoints = 0;
    playerSpaceshipInfos.sprites.idle = possibleSpaceships[level].spritesNoShield.idle;
    playerSpaceshipInfos.spaceBottom = possibleSpaceships[level].spaceBottom;
    playerSpaceshipInfos.maxLifePoints = possibleSpaceships[level].maxLifePoints;
    playerSpaceshipInfos.lifePoints = possibleSpaceships[level].lifePoints;
    playerSpaceshipInfos.scaleCoefficient = possibleSpaceships[level].scaleCoefficient;
    playerSpaceshipInfos.shield = "none";
    playerSpaceshipInfos.shootRate = possibleSpaceships[level].shootRate;
}
