# Projet : space-invaders-remastered

Groupe de 3 étudiants en parcours MIAGE (Méthodes Informatiques Appliquées à la Gestion des Entreprises)
- Sörel NADAUD
- Marion POESY
- Filipe DOUTEL SILVA

Space Invaders Remastered est une version revisitée du jeu original Space Invaders.
Ntre version sera une amélioration du jeu original, dont nous nous inspirons, en ajoutant par exemple :

- Des graphismes améliorés (forme des ennemis à tuer)
- Des modes de jeu en plus
- De nouveaux types d'ennemis

**Nous avons choisi de développer notre jeu avec la librairie Phaser** ([phaser.io](http://phaser.io/))

Nous avons ce [site](http://www.classicgaming.cc/classics/space-invaders/sounds) qui nous permet de récupérer des images et des sons fidèles au jeu classique.
Pour commencer nous nous inspirerons du premier rendu de Filipe.

Nous voulons implémenter plusieurs types de tirs, que le joueur pourra utiliser en fonction des "upgrades" qu'il récuperera pendant la partie. Les différents types de tirs seront les suivants:

- Le tir basique (en début de partie et inflige un point de dégât sur les ennemis)
- Le tir basique plus rapide (une amélioration du tir avec une cadence plus élevé et inflige toujours un point de dégât sur les ennemis) dure 5 secondes
- Le tir avancé (encore plus rapide, le sprite change et inflige deux points de dégât sur les ennemis) dure 3 secondes

Concernant les "upgrades" que nous voulons mettre en place, nous avons gérer le temps de génération comme suit :

Niveau 1 toutes les 30 secondes
Ce temps décrémente de 1.5 secondes.
Niveau 10 toutes les 15 secondes.

Nos "upgrades" sont les suivantes : 

- Une "upgrade" pour chaque type de vaisseau (4 types de vaisseau)
	Vaisseau 1 : 3 points de vie et une vitesse de tir très faible (au début du jeu par défaut)
	Vaisseau 2 : 4 points de vie et une vitesse de tir faible (au bout de 10 points obtenus)
	Vaisseau 3 : 5 points de vie et une vitesse de tir correcte (au bout de 30 points obtenus)
	Vaisseau 4 : 6 points de vie et une vitesse de tir rapide (au bout de 50 points obtenus)
- Une "upgrade" pour changer la vitesse de déplacement du vaisseau (en fonction du vaisseau obtenu, voir liste ci-dessus)
- Une "upgrade" pour obtenir un bouclier qui donne 2 points de vie supplémentaires

- Un malus pour le joueur (qui tombe et qui enlève un point de vie)
- Un bonus pour le joueur (qui tombe et qui donne un point de vie)

Le jeu est hébergé [ici](https://mouun.github.io/space-invaders-remastered/).

Présentation du projet en classe le Vendredi 11 Janvier 2019 à l'aide d'un Prezi ([prezi.com](https://prezi.com/p/pm8udgrcgxvr/)).

Nos points forts et nos points faibles, les diffcultés que nous avons rencontrées : 
- Utilisation d'une librairie avec de nombreuses fonctionnalités