import { Scene } from 'phaser';

export class Game extends Scene
{
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private platform!: Phaser.Physics.Arcade.StaticGroup;

    private readonly WALK_SPEED = 100;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        // Set dark background color (Castlevania vibes)
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        // Create the ground platform (a simple rectangle for now)
        this.platform = this.physics.add.staticGroup();
        
        // Create a solid ground that spans the bottom of the screen
        // Using a graphics-generated texture for the platform
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x4a4a5e, 1); // Dark gray/purple stone color
        groundGraphics.fillRect(0, 0, 480, 32);
        groundGraphics.generateTexture('ground', 480, 32);
        groundGraphics.destroy();

        // Add the ground at the bottom of the screen
        const ground = this.platform.create(240, 254, 'ground') as Phaser.Physics.Arcade.Sprite;
        ground.refreshBody();

        // Create the player sprite at native 64x64 size
        this.player = this.physics.add.sprite(240, 150, 'player');
        this.player.setCollideWorldBounds(true);

        // Play idle animation by default
        this.player.play('idle');

        // Enable collision between player and platform
        this.physics.add.collider(this.player, this.platform);

        // Set up keyboard input
        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    update ()
    {
        // Handle horizontal movement
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-this.WALK_SPEED);
            this.player.setFlipX(true); // Mirror sprite to face left
            this.player.play('walk', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(this.WALK_SPEED);
            this.player.setFlipX(false); // Normal orientation (facing right)
            this.player.play('walk', true);
        }
        else
        {
            this.player.setVelocityX(0);
            this.player.play('idle', true);
        }
    }
}
