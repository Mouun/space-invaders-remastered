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
**Le développement des deux versions va se poursuivre, si d'autres complications surviennent pendant le développement de la version avec phaser, nous l'abandonnerons au profit de la version en JS Pure**

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



# Informations complémentaires

Deux versions du jeu sont en développement et il est nécessaire de cloner le dépôt pour y accéder :

- Une première version réalisée avec la librairie [phaser.io](http://phaser.io/) qui est consultable sur la branche master dans le répertoire src/

  - Pour le lancer, il est nécessaire d'avoir [yarn](https://yarnpkg.com/lang/fr/) d'installer et d'utiliser la commande à la racine

    ```javascript
    npm run server
    ```

- Une seconde version réalisée en Javascript pur qui est consultable sur la branche feature-assets-v-jspure dans le répertoire src/

  - Pour le lancer, il suffit d'ouvrir le fichier index.html dans un navigateur

