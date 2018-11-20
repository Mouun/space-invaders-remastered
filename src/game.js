/**
 * Designed with <3 by Filipe Doutel Silva and Sörel Nadaud
 * Under Licence MIT
 **/

//Method where I can load my assets
function preload () {
    this.load.image('background', 'background.png');

}

//Method executed once just after preload
function create (){
    let bg = this.add.sprite(0, 0, 'background');
    bg.setOrigin(0,0);
}

function update () {

}

let config = {
    type: Phaser.AUTO,
    width: 770,
    height: 800,
    scene:  {
        preload: preload,
        create: create,
        update: update,
    },
};

let game = new Phaser.Game(config);
