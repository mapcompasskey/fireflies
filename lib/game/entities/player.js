ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity',
    'game.entities.player-sword'
)
.defines(function() {
    EntityPlayer = ig.Entity.extend({
        
        size: {x: 4, y: 16},
        offset: {x: 18, y: 8},
        maxVel: {x: 110, y: 220},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 110,
        jump: 220,
        health: 6,
        isInvincible: false,
        animSheet: new ig.AnimationSheet( 'media/player.png', 40, 24 ),
        
        walking: false,
        jumping: false,
        falling: false,
        hurting: false,
        crouching: false,
        dying: false,
        attacking: false,
        attacking1: false,
        attacking2: false,
        
        type: ig.Entity.TYPE.A, // add to friendly group
        checkAgainst: ig.Entity.TYPE.NONE, // check collisions against nothing
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        init: function( x, y, settings ) {
            this.parent( x, ( y - this.size.y ), settings );
            
            // add the animations
            this.addAnim( 'idle', 1, [0], true );
            this.addAnim( 'crouch', 1, [1], true );
            this.addAnim( 'walk', 0.15, [10, 11, 12, 13, 14, 15, 8, 9] );
            this.addAnim( 'jump', 1, [2], true );
            this.addAnim( 'fall', 1, [2], true );
            this.addAnim( 'hurt', 0.3, [3], true );
            this.addAnim( 'dead', 0.5, [0], true );
            //this.addAnim( 'attack1', 0.1, [16, 17, 18], true );
            //this.addAnim( 'attack2', 0.1, [19, 20, 21], true );
            //this.addAnim( 'attack1', 0.1, [24, 25, 26], true );
            //this.addAnim( 'attack2', 0.1, [27, 28, 29], true );
            //this.addAnim( 'jump_attack', 0.1, [24, 25, 26], true );
            this.addAnim( 'attack1', 0.1, [4, 4, 4], true );
            this.addAnim( 'attack2', 0.1, [5, 5, 5], true );
            this.addAnim( 'jump_attack', 0.1, [4, 4, 4,], true );
            
            // game instance of this entity
            ig.game.player = this;
            
            // add the player's sword
            //this.sword = ig.game.spawnEntity( EntityPlayerSword, 0, 0 );
        },
        
        update: function() {
            
            if ( ig.game.isPaused ) {
                return;
            }
            
            this.checkStatus();
            this.checkPosition();
            this.parent();
            
            // update sword position
            if ( this.attacking ) {
                if ( this.sword ) {
                    // facing left
                    if ( this.flip ) {
                        this.sword.pos.x = this.pos.x - this.sword.size.x + this.size.x;
                        this.sword.pos.y = this.pos.y - this.sword.size.y + this.size.y;
                        this.sword.offset.x = 10 + 2;
                    }
                    // else, facing right
                    else {
                        this.sword.pos.x = this.pos.x;
                        this.sword.pos.y = this.pos.y - this.sword.size.y + this.size.y;
                        this.sword.offset.x = 10 - 2;
                    }
                    this.sword.flip = this.flip;
                }
            }
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
            this.isCrouching();
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
        
        // check if crouching
        isCrouching: function() {
            
            if ( this.hurting || this.dying || this.jumping || this.falling || this.attacking ) {
                return;
            }
            
            // if standing on something and just pressed "DOWN" button
            if ( ! this.crouching ) {
                if ( this.standing && ig.input.state('down') ) {
                    this.crouching = true;
                    this.vel.x = 0;
                    this.updateCollisionBox();
                    return;
                }
            }
            // else, if crouching and no longer pressing "DOWN" button
            else {
                if ( ! ig.input.state('down') ) {
                    this.crouching = false;
                    this.updateCollisionBox();
                }
            }
            
        },
        
        // check if attacking
        isAttacking: function() {
            
            if ( this.hurting || this.dying || this.crouching ) {
                this.attacking = false;
                return;
            }
            
            // if attacking 1
            if ( this.attacking && this.attacking1 ) {
                if ( this.currentAnim == this.anims.attack1 || this.currentAnim == this.anims.jump_attack ) {
                    // if the animation has ended
                    if ( this.currentAnim.loopCount ) {
                        this.attacking1 = false;
                        this.sword.attacking1 = false;
                        
                        if ( ! this.attacking2 ) {
                            this.attacking = false;
                            this.sword.kill();
                        }
                    }
                }
            }
            
            // if attacking 2
            if ( this.attacking && this.attacking2 ) {
                if ( this.currentAnim == this.anims.attack2 ) {
                    // if the animation has ended
                    if ( this.currentAnim.loopCount ) {
                        this.attacking2 = false;
                        this.sword.attacking2 = false;
                        
                        this.attacking = false;
                        this.sword.kill();
                    }
                }
            }
            
            // is attack button pressed
            if ( ig.input.pressed('attack') ) {
                
                if ( this.attacking ) {
                    // if pressed during attack 1
                    if ( this.currentAnim == this.anims.attack1 ) {
                        this.attacking2 = true;
                        this.sword.attacking2 = true;
                    }
                } else {
                    this.attacking = true;
                    this.attacking1 = true;
                    
                    this.sword = ig.game.spawnEntity( EntityPlayerSword, 0, 0 );
                    this.sword.attacking1 = true;
                }
            }
        },
        
        // check if jumping
        isJumping: function() {
            
            if ( this.hurting || this.dying || this.crouching ) {
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
        
            if ( this.hurting || this.dying || this.crouching ) {
                this.walking = false;
                return;
            }
            
            // can't walk if attacking
            /** /
            if ( this.attacking ) {
                if ( ! this.jumping && ! this.falling) {
                    this.walking = false;
                    this.vel.x = 0;
                    return;
                }
            }
            /**/
            
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
            
            /**/
            // reduce walk speed if attacking
            if ( this.attacking ) {
                if ( ! this.jumping && ! this.falling) {
                    if ( this.vel.x < 0 ) {
                        this.vel.x = ( this.speed / -2 );
                    }
                    else if ( this.vel.x > 0 ) {
                        this.vel.x = ( this.speed / 2 );
                    }
                    return;
                }
            }
            /**/
            
        },
        
        // update entity animation
        animate: function() {
            
            // update entitiy opacity
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
            else if ( this.crouching ) {
                if ( this.currentAnim != this.anims.crouch ) {
                    this.currentAnim = this.anims.crouch.rewind();
                }
            }
            else if ( this.attacking ) {
                if ( this.attacking1 ) {
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
                else if ( this.attacking2 ) {
                    if ( this.currentAnim != this.anims.attack2 ) {
                        this.currentAnim = this.anims.attack2.rewind();
                    }
                }
            }
            else if ( this.jumping || this.falling ) {
                if ( this.currentAnim != this.anims.jump ) {
                    this.currentAnim = this.anims.jump.rewind();
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
            
            // update facing direction
            this.currentAnim.flip.x = this.flip;
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
        },
        
        // update the size of the collision box
        updateCollisionBox: function() {
            if ( this.crouching ) {
                this.size.x = 4;
                this.size.y = 10;
                this.offset.x = 18;
                this.offset.y = 14;
                this.pos.y += 6;
            } else {
                this.size.x = 4;
                this.size.y = 16;
                this.offset.x = 18;
                this.offset.y = 8;
                this.pos.y -= 6;
            }
        }
        
    });
});