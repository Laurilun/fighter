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

        // Load the player idle sprite (96x96)
        this.load.spritesheet('player-idle', 'sprites/idle-Sheet.png', {
            frameWidth: 96,
            frameHeight: 96
        });

        // Load the player walk sprite sheet (96x96 each)
        this.load.spritesheet('player-walk', 'sprites/walk-Sheet.png', {
            frameWidth: 96,
            frameHeight: 96
        });

        // Load the player small attack sprite sheet (2 frames, 96x96 - faster attack)
        this.load.spritesheet('player-small-attack', 'sprites/small_attack-Sheet.png', {
            frameWidth: 96,
            frameHeight: 96
        });

        // Load the player big attack sprite sheet (3 frames, 96x96 - slower attack)
        this.load.spritesheet('player-big-attack', 'sprites/big_attack-Sheet.png', {
            frameWidth: 96,
            frameHeight: 96
        });

        // Load the player in-air sprite sheet (96x96)
        this.load.spritesheet('player-air', 'sprites/in_air-Sheet.png', {
            frameWidth: 96,
            frameHeight: 96
        });

        // Load the player air attack sprite sheet (2 frames, 96x96)
        this.load.spritesheet('player-air-attack', 'sprites/attack_air-Sheet.png', {
            frameWidth: 96,
            frameHeight: 96
        });
    }

    create ()
    {
        // Create player idle animation
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        // Create player walk animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        // Create player small attack animation (2 frames, fast)
        this.anims.create({
            key: 'small-attack',
            frames: this.anims.generateFrameNumbers('player-small-attack', { start: 0, end: 1 }),
            frameRate: 16,
            repeat: 0
        });

        // Create player big attack animation (3 frames, slower)
        this.anims.create({
            key: 'big-attack',
            frames: this.anims.generateFrameNumbers('player-big-attack', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: 0
        });

        // Create player in-air animation
        this.anims.create({
            key: 'in-air',
            frames: this.anims.generateFrameNumbers('player-air', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        // Create player air attack animation (2 frames, fast)
        this.anims.create({
            key: 'air-attack',
            frames: this.anims.generateFrameNumbers('player-air-attack', { start: 0, end: 1 }),
            frameRate: 16,
            repeat: 0
        });

        // Go straight to game
        this.scene.start('Game');
    }
}
