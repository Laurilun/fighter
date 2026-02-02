import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        // Simple loading text for our low-res game
        this.add.text(240, 135, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    preload ()
    {
        this.load.setPath('assets');

        // Load the player sprite sheet (3 frames: idle, walk1, walk2 - each 64x64)
        this.load.spritesheet('player', 'sprites/spritesheet01.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create ()
    {
        // Create player animations
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // Go straight to game (skip menu for now)
        this.scene.start('Game');
    }
}
