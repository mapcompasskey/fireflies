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
        offset: {x: 28, y: 24},
        maxVel: {x: 110, y: 220},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 110,
        jump: 220,
        health: 6,
        isInvincible: false,
        animSheet: new ig.AnimationSheet( 'media/player.png', 60, 40 ),
        
        walking: false,
        jumping: false,
        falling: false,
        hurting: false,
        crouching: false,
        dying: false,
        attacking: false,
        attack_1: false,
        attack_2: false,
        attack_3: false,
        attack_4: false,
        attack_up: false,
        attack_jump: false,
        
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
            
            this.addAnim( 'attack1', 0.1, [16, 17, 18], true );
            this.addAnim( 'attack2', 0.1, [19, 20, 21], true );
            this.addAnim( 'attack3', 0.1, [24, 25, 26], true );
            this.addAnim( 'attack4', 0.1, [4, 5, 6], true );
            this.addAnim( 'attackUp', 0.1, [27, 28, 29], true );
            this.addAnim( 'attackJump', 0.1, [4, 5, 6], true );
            
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
            
            // update sword
            this.updatePlayerSword();
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
            if ( this.attacking && this.attack_1 ) {
                if ( this.currentAnim == this.anims.attack1 ) {
                    if ( this.sword ) {
                        if ( this.currentAnim.frame > 1 ) {
                            this.sword.canDamage = true;
                        } else {
                            this.sword.canDamage = false;
                        }
                    }
                    
                    if ( this.currentAnim.loopCount ) {
                        this.attack_1 = false;
                        if ( this.sword ) {
                            this.sword.attack_1 = false;
                            this.sword.updateCollisionBox();
                        }
                        if ( ! this.attack_2 ) {
                            this.attacking = false;
                        }
                    }
                }
            }
            
            // if attacking 2
            if ( this.attacking && this.attack_2 ) {
                if ( this.currentAnim == this.anims.attack2 ) {
                    if ( this.sword ) {
                        if ( this.currentAnim.frame > 1 ) {
                            this.sword.canDamage = true;
                        } else {
                            this.sword.canDamage = false;
                        }
                    }
                    
                    if ( this.currentAnim.loopCount ) {
                        this.attack_2 = false;
                        if ( this.sword ) {
                            this.sword.attack_2 = false;
                            this.sword.updateCollisionBox();
                        }
                        if ( ! this.attack_3 ) {
                            this.attacking = false;
                        }
                    }
                }
            }
            
            // if attacking 3
            if ( this.attacking && this.attack_3 ) {
                if ( this.currentAnim == this.anims.attack3 ) {
                    if ( this.sword ) {
                        if ( this.currentAnim.frame > 1 ) {
                            this.sword.canDamage = true;
                        } else {
                            this.sword.canDamage = false;
                        }
                    }
                    
                    if ( this.currentAnim.loopCount ) {
                        this.attack_3 = false;
                        if ( this.sword ) {
                            this.sword.attack_3 = false;
                            this.sword.updateCollisionBox();
                        }
                        if ( ! this.attack_4 ) {
                            this.attacking = false;
                        }
                    }
                }
            }
            
            // if attacking 4
            if ( this.attacking && this.attack_4 ) {
                if ( this.currentAnim == this.anims.attack4 ) {
                    if ( this.sword ) {
                        if ( this.currentAnim.frame > 1 ) {
                            this.sword.canDamage = true;
                        } else {
                            this.sword.canDamage = false;
                        }
                    }
                    
                    if ( this.currentAnim.loopCount ) {
                        this.attack_4 = false;
                        if ( this.sword ) {
                            this.sword.attack_4 = false;
                            this.sword.updateCollisionBox();
                        }
                        this.attacking = false;
                    }
                }
            }
            
            // if up attack
            if ( this.attacking && this.attack_up ) {
                if ( this.currentAnim == this.anims.attackUp ) {
                    if ( this.sword ) {
                        if ( this.currentAnim.frame > 1 ) {
                            this.sword.canDamage = true;
                        } else {
                            this.sword.canDamage = false;
                        }
                    }
                    
                    if ( this.currentAnim.loopCount ) {
                        this.attack_up = false;
                        if ( this.sword ) {
                            this.sword.attack_up = false;
                            this.sword.updateCollisionBox();
                        }
                        this.attacking = false;
                    }
                }
            }
            
            // if jump attack
            if ( this.attacking && this.attack_jump ) {
                if ( this.currentAnim == this.anims.attackJump ) {
                    if ( this.sword ) {
                        if ( this.currentAnim.frame > 1 ) {
                            this.sword.canDamage = true;
                        } else {
                            this.sword.canDamage = false;
                        }
                    }
                    
                    if ( this.currentAnim.loopCount ) {
                        this.attack_jump = false;
                        if ( this.sword ) {
                            this.sword.attack_jump = false;
                            this.sword.updateCollisionBox();
                        }
                        this.attacking = false;
                    }
                }
            }
            
            // is attack button pressed
            if ( ig.input.pressed('attack') ) {
                
                // if attacking, ready next attack
                if ( this.attacking ) {
                    // if pressed during attack 1
                    if ( this.currentAnim == this.anims.attack1 ) {
                        this.attack_2 = true;
                        if ( this.sword ) {
                            this.sword.attack_2 = true;
                        }
                    }
                    // if pressed during attack 2
                    else if ( this.currentAnim == this.anims.attack2 ) {
                        this.attack_3 = true;
                        if ( this.sword ) {
                            this.sword.attack_3 = true;
                        }
                    }
                    // if pressed during attack 3
                    else if ( this.currentAnim == this.anims.attack3 ) {
                        this.attack_4 = true;
                        if ( this.sword ) {
                            this.sword.attack_4 = true;
                        }
                    }
                }
                
                // else, start attacking
                else {
                    // add player sword entity
                    this.sword = ig.game.spawnEntity( EntityPlayerSword, 0, 0 );
                    
                    // if jumping/falling
                    if ( this.jumping || this.falling ) {
                        this.attacking = true;
                        this.attack_jump = true;
                        if ( this.sword ) {
                            this.sword.attack_jump = true;
                        }
                    }
                    // else, if pressing up button
                    else if ( ig.input.state('up') ) {
                        this.attacking = true;
                        this.attack_up = true;
                        if ( this.sword ) {
                            this.sword.attack_up = true;
                        }
                    }
                    // else, normal attack
                    else {
                        this.attacking = true;
                        this.attack_1 = true;
                        if ( this.sword ) {
                            this.sword.attack_1 = true;
                        }
                    }
                    
                    if ( this.sword ) {
                        this.sword.updateCollisionBox();
                    }
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
            
            // if attacking
            if ( this.attacking && ! this.jumping && ! this.falling) {
            
                // can't walk if attacking up
                if ( this.attack_up ) {
                    if ( ! this.jumping && ! this.falling) {
                        this.walking = false;
                        this.vel.x = 0;
                    }
                }
                // else, reduce walk speed
                else {
                    if ( this.vel.x < 0 ) {
                        this.vel.x = ( this.speed / -2 );
                    }
                    else if ( this.vel.x > 0 ) {
                        this.vel.x = ( this.speed / 2 );
                    }
                }
            }
            
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
                if ( this.attack_up ) {
                    if ( this.currentAnim != this.anims.attackUp ) {
                        this.currentAnim = this.anims.attackUp.rewind();
                    }
                }
                else if ( this.attack_jump ) {
                    if ( this.currentAnim != this.anims.attackJump ) {
                        this.currentAnim = this.anims.attackJump.rewind();
                    }
                }
                else if ( this.attack_1 ) {
                    if ( this.currentAnim != this.anims.attack1 ) {
                        this.currentAnim = this.anims.attack1.rewind();
                    }
                }
                else if ( this.attack_2 ) {
                    if ( this.currentAnim != this.anims.attack2 ) {
                        this.currentAnim = this.anims.attack2.rewind();
                    }
                }
                else if ( this.attack_3 ) {
                    if ( this.currentAnim != this.anims.attack3 ) {
                        this.currentAnim = this.anims.attack3.rewind();
                    }
                }
                else if ( this.attack_4 ) {
                    if ( this.currentAnim != this.anims.attack4 ) {
                        this.currentAnim = this.anims.attack4.rewind();
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
        
        // update player sword
        updatePlayerSword: function() {
            
            if ( this.sword ) {
            
                // update sword position
                if ( this.attacking ) {
                
                    /*
                    // if player is facing left
                    if ( this.flip ) {
                        this.sword.pos.x = this.pos.x - this.sword.size.x + this.size.x;
                        this.sword.pos.y = this.pos.y - this.sword.size.y + this.size.y;
                        this.sword.offset.x = 10 + 2;
                    }
                    // else, player is facing right
                    else {
                        this.sword.pos.x = this.pos.x;
                        this.sword.pos.y = this.pos.y - this.sword.size.y + this.size.y;
                        this.sword.offset.x = 10 - 2;
                    }
                    
                    this.sword.flip = this.flip;
                    */
                    this.sword.updatePosition( this );
                }
                // else, remove the sword
                else {
                    this.sword.kill();
                    this.sword = null;
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
        
        // update the size of the collision box
        updateCollisionBox: function() {
            if ( this.crouching ) {
                this.size.x = 4;
                this.size.y = 10;
                //this.offset.x = 18;
                //this.offset.y = 14;
                this.offset.x = 28;
                this.offset.y = 30;
                this.pos.y += 6;
            } else {
                this.size.x = 4;
                this.size.y = 16;
                //this.offset.x = 18;
                //this.offset.y = 8;
                this.offset.x = 28;
                this.offset.y = 24;
                this.pos.y -= 6;
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