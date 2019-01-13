# Projet : space-invaders-remastered

## Table des matières
**[Equipe](#equipe)**<br>
**[Le jeu](#le-jeu)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Les différents types de tir](#les-différents-types-de-tir)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Les différents vaisseaux](#les-différents-vaisseaux)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Les différents bonus](#les-différents-bonus)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Génération des bonus](#génération-des-bonus)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Caractéristiques des bonus](#caractéristiques-des-bonus)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Les ennemis](#les-ennemis)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Attaques ennemies](#attaques-ennemies)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Déplacements des ennemis](#déplacements-des-ennemis)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Informations complémentaires](#informations-complémentaires)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Par rapport au jeu](#par-rapport-au-jeu)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Contrôles du jeu](#contrôles-du-jeu)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Autre](#autre)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Les difficultés rencontrées](#les-difficultés-rencontrées)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Les points forts du jeu](#les-points-forts-du-jeu)**<br>
**&nbsp;&nbsp;&nbsp;&nbsp;[Les points à améliorer](#les-points-à-améliorer)**<br>

## Equipe

Groupe de 3 étudiants en parcours MIAGE (Méthodes Informatiques Appliquées à la Gestion des Entreprises)

- Sörel NADAUD
- Marion POESY
- Filipe DOUTEL SILVA

## Le jeu

Space Invaders Remastered est une version **revisitée** du jeu original Space Invaders.
Notre version sera une amélioration du jeu original, dont nous nous inspirons, en ajoutant par exemple :

- Des améliorations graphiques (effet de particules pour le vaisseau du joueur par exemple),
- Un système de difficulté croissante
- Différents vaisseaux pour le joueur
- Différents bonus

**Nous avons choisi de développer notre jeu avec la librairie Phaser** ([phaser.io](http://phaser.io/))

Nous avons ce [site](http://www.classicgaming.cc/classics/space-invaders/sounds) qui nous permettra de récupérer des images et des sons fidèles au jeu classique.
Pour commencer nous nous inspirerons du premier rendu de Filipe.

Nous voulons implémenter plusieurs types de tirs que le joueur pourra obtenir de façon temporaire grâce à des bonus qu'il récupèrera pendant la partie.

### Les différents types de tir

- Le tir basique :
  - vitesse de tir définie en fonction du vaisseau (voir les vaisseaux en dessous)
  - inflige 1 point de dégâts
- Le tir basique plus rapide :
  - vitesse de tir plus élevée par rapport à la vitesse de tir actuelle du joueur
  - dure 5 secondes
  - inflige 1 point de dégâts
  - le joueur peut l'obtenir grâce au bonus suivant ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/fast_shoot.png)
- Le tir avancé :
  - vitesse de tir encore plus élevée
  - dure 3 secondes
  - inflige 2 points de dégâts
  - le joueur peut l'obtenir grâce au bonus suivant ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/laserShoot.png)

### Les différents vaisseaux

Le vaisseau du joueur peut évoluer au sein d'une même manche (celui-ci est cependant réinitialiser au niveau 1 au début d'une nouvelle manche).

Il existe 4 niveaux différents pour le vaisseau:

- Niveau 1 :



  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/player_level0_without_shield.png)

  - 3 points de vie
  - 800ms de délai entre chaque tir
  - obtenu dès le lancement de la partie ou au début d'une nouvelle manche

- Niveau 2 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/player_level1_without_shield.png)

  - 4 points de vie
  - 700ms de délai entre chaque tir
  - obtenu pour un score de 10

- Niveau 3 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/player_level2_without_shield.png)

  - 5 points de vie
  - 600ms de délai entre chaque tir
  - obtenu pour un score de 20

- Niveau 4 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/player_level3_without_shield.png)

  - 6 points de vie
  - 500ms de délai entre chaque tir
  - obtenu pour un score de 35

### Les différents bonus

#### Génération des bonus

Suivant le temps défini à la manche active, un bonus (ou malus) est généré aléatoirement parmi la liste de tous les bonus disponibles.

Le temps de génération a été géré comme suit :

- Manche 1 = 1 bonus toutes les 45 secondes

  Ce temps est décrémenté de 3.5 secondes au début de chaque nouvelle manche jusqu'à la manche 10.

- Manche 10 = 1 bonus toutes les 13.5 secondes

#### Caractéristiques des bonus

- Bonus 1 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/heal.png)

  - Regain d'un point de santé

- Bonus 2 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/shield.png)

  - Octroie un bouclier au joueur lui conférant 2 points de vie supplémentaires
    - Le bonus 1 ne peut cependant pas régénéré un bouclier (seulement les points de vie du vaisseau)

- Bonus 3 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/fast_shoot.png)

  - Réduit le délai entre chaque tir du vaisseau actif de 400ms

- Bonus 4 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/laserShoot.png)

  - Réduit le délai entre chaque tir du vaisseau actif à 75ms quelle que soit la vitesse de tir actuelle
  - Inflige 2 points de dégâts aux ennemis au lieu d'1

- Bonus 5 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/malus.png)

  - Perte d'un point de santé

### Les ennemis

- Ennemis 1 et 2 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/ennemi_1%400.5x.png)

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/ennemi_2%400.5x.png)

  - Possède 1 point de vie

- Ennemi 3 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/ennemi_3%400.5x.png)

  - Possède 2 points de vie

- Ennemi 4 :

  ![](https://github.com/Mouun/space-invaders-remastered/blob/master/assets/ennemi_4%400.5x.png)

  - Possède 3 points de vie

#### Attaques ennemies

Les ennemis peuvent attaquer le joueur. Leurs attaques sont directement dirigées vers le joueur.

Ils vont d'abord attaquer avec une salve (autant d'ennemis aléatoires que défini à la manche actuelle tirent) puis autant d'ennemis aléatoires que défini à la manche actuelle vont tirer chacun l'un après l'autre avec un délai de 300ms.

Elles sont gérées comme suit :

- Manche 1 = 1 seul ennemi aléatoire attaque toutes les 5 secondes

  A chaque nouvelle manche, 1 ennemi supplémentaire aléatoire peut attaquer. De plus, le temps entre chaque attaque (5 secondes initialement) est réduit de 200ms.

- Manche 10 = 10 ennemis aléatoires attaquent toutes les 3.2 secondes

#### Déplacements des ennemis

Les ennemis se déplacent en groupe latéralement vers la droite jusqu'à heurter le bord de l'écran. A ce moment là, ils descendent de 15 pixels vers le bas puis se déplacent latéralement vers la gauche jusqu'à heurter le bord de l'écran et ainsi de suite.

Leur vitesse de déplacement latérale augmente de 0.1 pixel par ms à la manche 1 jusqu'à 0.55 pixels par ms à la manche 10.

### Informations complémentaires

#### Par rapport au jeu

- Lorsqu'il arrive sur la page du jeu, le joueur est invité à entrer un pseudonyme qui sera utilisé pour comptabiliser son score dans un historique local

- Lorsque le joueur est touché par une attaque ennemie, il dispose d'un temps d'invulnérabilité de 1.5 secondes
- Lorsque le joueur perd, il est directement redirigé vers la page des scores

#### Contrôles du jeu

- Le joueur peut déplacer son vaisseau de gauche à droite avec les flèches du clavier.
- Le joueur peut tirer en appuyant (ou en restant appuyé) sur la flèche du haut ou sur la barre espace.
- Le joueur peut accélérer son déplacement latéral en restant appuyant sur shift.
- La touche R du clavier permet de relancer le jeu.
- La touche O du clavier permet d'éliminer progressivement une partie des ennemis (utilisée surtout pour des tests et pour progresser dans les manches plus rapidement).

#### Autre

Le jeu est hébergé [ici](https://mouun.github.io/space-invaders-remastered/).

Présentation du projet en classe le Vendredi 11 Janvier 2019 à l'aide d'un Prezi ([prezi.com](https://prezi.com/p/pm8udgrcgxvr/)).

### Les difficultés rencontrées

- Difficulté de prise en main de la librairie Phaser principalement

### Les points forts du jeu

- Difficulté croissante
- Amélioration d'un jeu de base grâce à l'ajout de nouvelles mécaniques de jeu (bonus, niveaux de vaisseau, ...)
- Un code qui permet d'ajouter très facilement de nouveaux bonus/malus, vaisseaux et ennemis et qui permet également d'ajouter des nouvelles lignes d'ennemis par exemple
- Sauvegarde des scores locaux

### Les points à améliorer

- Graphismes pouvant être encore améliorés
- Ajout de nouveaux bonus et malus (bien que ceci puisse être fait très facilement grâce à la façon dont est fait le code du jeu)
- Ajout de nouveaux vaisseaux (bien que ceci puisse être fait très facilement grâce à la façon dont est fait le code du jeu)
- Ajout de nouveaux ennemis (bien que ceci puisse être fait très facilement grâce à la façon dont est fait le code du jeu)
