# space-invaders-remastered

Nous sommes trois dans le groupe:

- Nadaud Sörel
- Marion Poesy
- Filipe Doutel Silva

Space Invaders Remastered est une version revisitée du jeu original Space Invaders.
Celle-ci aura pour but d'améliorer le jeu duquel il s'inspire, en ajoutant par exemple:

- Des graphismes améliorés (forme des ennemis à tuer)
- Des modes de jeu en plus
- De nouveaux types d'ennemis

**Nous avons choisi de commencer le développement d'une deuxième version de notre jeu**
**Une version en JS pure, pour l'instant nous n'avons pas abandonné la version avec phaser**
**Le développement des deux versions va se poursuivre, si d'autres complications surviennent pendant le développement de la version avec phaser, nous l'abandonnerons au profit de la version en JS Pure**

Nous comptons utiliser du JS pur ou des librairies si besoin (exemple: [phaser.io](http://phaser.io/) / [melon.JS](http://melonjs.org/))

Nous avons déjà un [site](http://www.classicgaming.cc/classics/space-invaders/sounds) qui nous permet de récupérer des images et des sons fidèles au jeu classique.



Nous allons utiliser l'architecture du projet que Filipe a rendu en cours pour commencer

Nous voulons implémenter plusieurs types de tirs, que le joueur pourra utiliser en fonction des "upgrade" qu'il récuperera
pendant la partie. Les différents types de tirs seront les suivants:

- Le tir basique (en début de partie)
- Le tir basique plus rapide (une amélioration du tir avec une cadences plus élevé) dure une trentaine de secondes
- Le tir en "bataille" (un tir ou l'angle de départ varie légèrement), dure une trentaine de secondes
- Le tir qui ne s'arrête pas au premier ennemi (ne dure que quelques secondes)

Concernant les "upgrades" que nous voulont mettre en place sont les suivantes:

- Une "upgrade" pour chaque type de tir
- Une "upgrade" pour changer la vitesse de déplacement du vaisseau
- Une "upgrade" pour augmenter le nombre de vies du vaisseau
- Une "upgrade" pour tuer le joueur (une sorte de malus)
