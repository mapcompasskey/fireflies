ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityPlayer = ig.Entity.extend({
        
        size: {x: 4, y: 16},
        offset: {x: 18, y: 8},
        maxVel: {x: 400, y: 500},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 150,
        jump: 220,
        health: 6,
        isInvincible: false,
        //canAttack: true,
        //attackTimer: new ig.Timer( 0.5 ),
        animSheet: new ig.AnimationSheet( 'media/player.png', 40, 24 ),
        
        walking: false,
        jumping: false,
        falling: false,
        hurting: false,
        dying: false,
        attacking: false,
        
        type: ig.Entity.TYPE.A, // add to friendly group
        checkAgainst: ig.Entity.TYPE.NONE, // check collisions against nothing
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        init: function( x, y, settings ) {
            this.parent( x, ( y - this.size.y ), settings );
            
            // add the animations
            this.addAnim( 'idle', 1, [0], true );
            this.addAnim( 'walk', 0.2, [1,0,2,0] );
            this.addAnim( 'jump', 1, [3], true );
            this.addAnim( 'fall', 1, [3], true );
            this.addAnim( 'hurt', 0.3, [3], true );
            this.addAnim( 'dead', 0.5, [0], true );
            this.addAnim( 'attack1', 0.1, [6, 7, 8, 9, 10, 11], true );
            this.addAnim( 'jump_attack', 0.1, [6, 7, 8], true );
            
            // game instance of this entity
            ig.game.player = this;
        },
        
        update: function() {
            
            if ( ig.game.isPaused ) {
                return;
            }
            
            this.checkStatus();
            this.checkPosition();
            this.parent();
        },
        
        checkStatus: function() {
        
            // update direction facing
            if ( ! this.hurting && ! this.dying ) {
                if ( ig.input.state('left') ) {
                    this.flip = true;
                }
                else if ( ig.input.state('right') ) {
                    this.flip = false;
                }
            }
            
            // toggle invincibility
            if ( ig.input.pressed('invincible') ) {
                this.isInvincible = this.isInvincible ? false : true;
            }
            
            if ( ig.game.playerHealth ) {
                ig.game.playerHealth.setState( this.health );
            }
            
            // check entity status
            this.isHurting();
            this.isAttacking();
            this.isJumping();
            this.isMoving();
            this.animate();
        },
        
        // check if hurting
        isHurting: function() {
            
            // if dying, kill this entity when the annimation ends
            if ( this.dying ) {
                if ( this.currentAnim == this.anims.dead ) {
                    if ( this.currentAnim.loopCount ) {
                        this.kill();
                    }
                }
            }
            
            // if hurting, stop hurting when the animation ends
            if ( this.hurting ) {
                if ( this.currentAnim == this.anims.hurt ) {
                    if ( this.currentAnim.loopCount ) {
                        this.hurting = false;
                    }
                }
            }
        },
        
        // check if attacking
        isAttacking: function() {
            
            if ( this.hurting || this.dying ) {
                this.attacking = false;
                return;
            }
            
            // update state if attack animation has ended
            if ( this.attacking ) {
                if ( this.currentAnim == this.anims.attack1 || this.currentAnim == this.anims.jump_attack ) {
                    if ( this.currentAnim.loopCount ) {
                        this.attacking = false;
                    }
                }
            }
            
            /*
            // if player can attack
            if ( this.canAttack ) {
                // is attack button pressed
                if ( ig.input.state('attack') ) {
                    this.attackTimer.reset();
                    this.attacking = true;
                    this.canAttack = false;
                }
            }
            // player can't attack again for a moment
            else {
                if ( this.attackTimer.delta() > 0 ) {
                    this.canAttack = true;
                }
            }
            */
            
            // is attack button pressed
            if ( ig.input.pressed('attack') ) {
                this.attacking = true;
            }
        },
        
        // check if jumping
        isJumping: function() {
            
            if ( this.hurting || this.dying ) {
                this.jumping = false;
                this.falling = false;
                return;
            }
            
            // if standing on something and just pressed "JUMP" button
            if ( this.standing && ig.input.pressed('jump') ) {
                this.jumping = true;
                this.vel.y = -this.jump;
                return;
            }
            
            // reduce jumping height
            if ( this.jumping && ig.input.released('jump') ) {
                this.vel.y = ( this.vel.y / 2 );
            }
            
            // if falling
            if ( this.vel.y > 0 && ! this.standing ) {
                this.falling = true;
                return;
            }
            
            // if standing on something while jumping/falling
            if ( ( this.jumping || this.falling ) && this.standing ) {
                this.jumping = false;
                this.falling = false;
            }
        },
        
        // checking if idle or moving left/right
        isMoving: function() {
        
            if ( this.hurting || this.dying ) {
                this.walking = false;
                return;
            }
            
            // can't walk if attacking
            if ( this.attacking ) {
                if ( ! this.jumping && ! this.falling) {
                    this.walking = false;
                    this.vel.x = 0;
                    return;
                }
            }
            
            if ( ig.input.state('left') ) {
                this.walking = true;
                this.vel.x = -this.speed;
            }
            else if ( ig.input.state('right') ) {
                this.walking = true;
                this.vel.x = this.speed;
            }
            else {
                this.walking = false;
                this.vel.x = 0;
            }
        },
        
        // update entity animation
        animate: function() {
            
            // update facing direction
            this.currentAnim.flip.x = this.flip;
            
            // update entitiy alpha
            if ( this.hurting || this.isInvincible ) {
                this.currentAnim.alpha = 0.5;
            }
            else if ( this.currentAnim.alpha < 1 ) {
                this.currentAnim.alpha = 1;
            }
            
            // update animation state
            if ( this.dying ) {
                if ( this.currentAnim != this.anims.dead ) {
                    this.currentAnim = this.anims.dead.rewind();
                }
            }
            else if ( this.hurting ) {
                if ( this.currentAnim != this.anims.hurt ) {
                    this.currentAnim = this.anims.hurt.rewind();
                }
            }
            else if ( this.attacking ) {
                if ( this.jumping ) {
                    if ( this.currentAnim != this.anims.jump_attack ) {
                        this.currentAnim = this.anims.jump_attack.rewind();
                    }
                } else {
                    if ( this.currentAnim != this.anims.jump_attack ) {
                        if ( this.currentAnim != this.anims.attack1 ) {
                            this.currentAnim = this.anims.attack1.rewind();
                        }
                    }
                }
            }
            else if ( this.jumping ) {
                if ( this.currentAnim != this.anims.jump ) {
                    this.currentAnim = this.anims.jump.rewind();
                }
            }
            else if ( this.falling ) {
                if ( this.currentAnim != this.anims.fall ) {
                    this.currentAnim = this.anims.fall.rewind();
                }
            }
            else if ( this.walking ) {
                if ( this.currentAnim != this.anims.walk ) {
                    this.currentAnim = this.anims.walk.rewind();
                }
            }
            else {
                if ( this.currentAnim != this.anims.idle ) {
                    this.currentAnim = this.anims.idle.rewind();
                }
            }
        },
        
        // check if this entity needs repositioned
        checkPosition: function() {
            
            // if this entity has moved off the map
            if ( this.pos.x < ig.game.camera.offset.x.min ) {
                this.pos.x = ( ig.game.collisionMap.pxWidth - ig.game.camera.offset.x.max - ( this.size.x * 2 ) );
            }
            else if ( ( this.pos.x + this.size.x ) > ( ig.game.collisionMap.pxWidth - ig.game.camera.offset.x.max ) ) {
                this.pos.x = ( ig.game.camera.offset.x.min + this.size.x );
            }
            
            // if this entity has fallen off the map
            if ( this.pos.y > ig.game.collisionMap.pxHeight ) {
                this.pos.y = 0;
            }
        },
        
        // called when overlapping with an entity whose .checkAgainst property matches this entity
        receiveDamage: function( amount, from ) {
        
            if ( this.hurting || this.dying || this.isInvincible ) {
                return;
            }
            
            /*
            // reduce health
            this.health -= amount;
            
            // if dead
            if ( this.health <= 0 ) {
                this.vel.x = 0;
                this.vel.y = 0;
                this.maxVel.x = 0;
                this.maxVel.y = 0;
                this.dying = true;
                return true;
            }
            
            // update state
            this.hurting = true;
            
            // apply knockback
            this.vel.x = ( from.pos.x > this.pos.x ) ? -200 : 200;
            this.vel.y = -150;
            */
            
            return true;
        }
    });
});