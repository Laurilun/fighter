import { Scene } from 'phaser';

enum PlayerState {
    Idle,
    Walking,
    Jumping,
    InAir,
    SmallAttack,
    BigAttack,
    AirAttack
}

export class Game extends Scene
{
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private attackKey!: Phaser.Input.Keyboard.Key;
    private bigAttackKey!: Phaser.Input.Keyboard.Key;
    private platform!: Phaser.Physics.Arcade.StaticGroup;
    private dummy!: Phaser.Physics.Arcade.Sprite;

    // Constants
    private readonly FRAME_SIZE = 96;
    private readonly BODY_W = 22;
    private readonly BODY_H_GROUND = 55;
    private readonly BODY_H_AIR = 35;
    private readonly WALK_SPEED = 100;
    private readonly JUMP_VELOCITY = -420;
    private readonly SMALL_ATTACK_CD = 200;
    private readonly AIR_ATTACK_CD = 300;

    // State
    private state: PlayerState = PlayerState.Idle;
    private hasHitThisAttack = false;
    private smallAttackCooldown = 0;
    private airAttackCooldown = 0;

    constructor()
    {
        super('Game');
    }

    create()
    {
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        // Ground
        this.platform = this.physics.add.staticGroup();
        const gfx = this.add.graphics();
        gfx.fillStyle(0x4a4a5e, 1);
        gfx.fillRect(0, 0, 480, 32);
        gfx.generateTexture('ground', 480, 32);
        gfx.destroy();
        const ground = this.platform.create(240, 254, 'ground') as Phaser.Physics.Arcade.Sprite;
        ground.refreshBody();

        // Player - origin at bottom-center so feet = sprite position
        this.player = this.physics.add.sprite(240, 238, 'player-idle');
        this.player.setOrigin(0.5, 1);
        this.player.setCollideWorldBounds(true);

        // Fixed physics body
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setSize(this.BODY_W, this.BODY_H_GROUND);
        body.setOffset((this.FRAME_SIZE - this.BODY_W) / 2, this.FRAME_SIZE - this.BODY_H_GROUND);

        this.player.play('idle');
        this.physics.add.collider(this.player, this.platform);

        // Test dummy - a bouncy ball
        const dGfx = this.add.graphics();
        dGfx.fillStyle(0xcc3333, 1);
        dGfx.fillCircle(16, 16, 16);
        dGfx.generateTexture('ball', 32, 32);
        dGfx.destroy();
        this.dummy = this.physics.add.sprite(380, 200, 'ball');
        this.dummy.setCircle(16);
        this.dummy.setBounce(0.8);
        this.dummy.setCollideWorldBounds(true);
        this.dummy.setDragX(50);
        this.physics.add.collider(this.dummy, this.platform);
        this.physics.add.collider(this.player, this.dummy);

        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.bigAttackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Animation complete callbacks
        this.player.on('animationcomplete-small-attack', () => {
            this.state = PlayerState.Idle;
        });
        this.player.on('animationcomplete-big-attack', () => {
            this.state = PlayerState.Idle;
        });
        this.player.on('animationcomplete-air-attack', () => {
            const body = this.player.body as Phaser.Physics.Arcade.Body;
            this.state = body.blocked.down ? PlayerState.Idle : PlayerState.InAir;
        });
    }

    update()
    {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const onGround = body.blocked.down;
        const delta = this.game.loop.delta;

        // Update physics body size based on air/ground
        const currentBodyH = onGround ? this.BODY_H_GROUND : this.BODY_H_AIR;
        body.setSize(this.BODY_W, currentBodyH);
        body.setOffset((this.FRAME_SIZE - this.BODY_W) / 2, this.FRAME_SIZE - currentBodyH);

        // Update cooldowns
        if (this.smallAttackCooldown > 0) this.smallAttackCooldown -= delta;
        if (this.airAttackCooldown > 0) this.airAttackCooldown -= delta;

        // Check hits during attack states
        if (this.isAttacking() && !this.hasHitThisAttack)
        {
            this.checkAttackHit();
        }

        // Input
        const zPressed = Phaser.Input.Keyboard.JustDown(this.attackKey);
        const xPressed = Phaser.Input.Keyboard.JustDown(this.bigAttackKey);

        // State machine
        switch (this.state)
        {
            case PlayerState.Idle:
            case PlayerState.Walking:
                // Can attack, jump, or move
                if (zPressed && this.smallAttackCooldown <= 0)
                {
                    this.startSmallAttack();
                    return;
                }
                if (xPressed)
                {
                    this.startBigAttack();
                    return;
                }
                if (this.cursors.up.isDown)
                {
                    this.startJump();
                    return;
                }
                this.handleGroundMovement();
                break;

            case PlayerState.Jumping:
            case PlayerState.InAir:
                // Can air attack or move horizontally
                if (zPressed && this.airAttackCooldown <= 0)
                {
                    this.startAirAttack();
                    return;
                }
                this.handleAirMovement();
                // Check if landed
                if (onGround)
                {
                    this.state = PlayerState.Idle;
                }
                break;

            case PlayerState.SmallAttack:
            case PlayerState.BigAttack:
                // Locked in attack animation, no movement
                this.player.setVelocityX(0);
                break;

            case PlayerState.AirAttack:
                // Can still move horizontally during air attack
                this.handleAirMovement();
                break;
        }
    }

    private isAttacking(): boolean
    {
        return this.state === PlayerState.SmallAttack ||
               this.state === PlayerState.BigAttack ||
               this.state === PlayerState.AirAttack;
    }

    private startSmallAttack(): void
    {
        this.state = PlayerState.SmallAttack;
        this.hasHitThisAttack = false;
        this.smallAttackCooldown = this.SMALL_ATTACK_CD;
        this.player.setVelocityX(0);
        this.player.play('small-attack');
    }

    private startBigAttack(): void
    {
        this.state = PlayerState.BigAttack;
        this.hasHitThisAttack = false;
        this.player.setVelocityX(0);
        this.player.play('big-attack');
    }

    private startAirAttack(): void
    {
        this.state = PlayerState.AirAttack;
        this.hasHitThisAttack = false;
        this.airAttackCooldown = this.AIR_ATTACK_CD;
        this.player.play('air-attack');
    }

    private startJump(): void
    {
        this.state = PlayerState.Jumping;
        this.player.setVelocityY(this.JUMP_VELOCITY);
    }

    private handleGroundMovement(): void
    {
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-this.WALK_SPEED);
            this.player.setFlipX(true);
            this.state = PlayerState.Walking;
            this.player.play('walk', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(this.WALK_SPEED);
            this.player.setFlipX(false);
            this.state = PlayerState.Walking;
            this.player.play('walk', true);
        }
        else
        {
            this.player.setVelocityX(0);
            this.state = PlayerState.Idle;
            this.player.play('idle', true);
        }
    }

    private handleAirMovement(): void
    {
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-this.WALK_SPEED);
            this.player.setFlipX(true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(this.WALK_SPEED);
            this.player.setFlipX(false);
        }

        // Only play in-air animation if not attacking
        if (this.state !== PlayerState.AirAttack)
        {
            this.state = PlayerState.InAir;
            this.player.play('in-air', true);
        }
    }

    private checkAttackHit(): void
    {
        const right = !this.player.flipX;
        const px = this.player.x;
        const py = this.player.y;
        const dx = this.dummy.x;
        const dy = this.dummy.y;

        const relX = dx - px;
        const relY = dy - py;

        let hit = false;

        if (this.state === PlayerState.SmallAttack)
        {
            const REACH = 55;
            const TOP = -50;
            const BOTTOM = -10;
            const inFrontX = right ? (relX >= -5 && relX <= REACH) : (relX <= 5 && relX >= -REACH);
            const inRangeY = relY >= TOP && relY <= BOTTOM;
            hit = inFrontX && inRangeY;
        }
        else if (this.state === PlayerState.BigAttack)
        {
            const RADIUS = 65;
            const centerY = py - 30;
            const distX = relX;
            const distY = dy - centerY;
            const dist = Math.sqrt(distX * distX + distY * distY);
            const inFront = right ? (relX >= -10) : (relX <= 10);
            hit = dist <= RADIUS && inFront;
        }
        else if (this.state === PlayerState.AirAttack)
        {
            const RADIUS = 50;
            const centerY = py - 18;
            const distX = relX;
            const distY = dy - centerY;
            const dist = Math.sqrt(distX * distX + distY * distY);
            const inFront = right ? (relX >= -10) : (relX <= 10);
            hit = dist <= RADIUS && inFront;
        }

        if (hit)
        {
            this.hasHitThisAttack = true;
            const knockX = right ? 500 : -500;
            this.dummy.setVelocity(knockX, -350);

            let count = 0;
            this.time.addEvent({
                delay: 50,
                repeat: 9,
                callback: () => {
                    count++;
                    if (count % 2 === 0)
                        this.dummy.setTint(0xff0000);
                    else
                        this.dummy.clearTint();
                }
            });
        }
    }
}
