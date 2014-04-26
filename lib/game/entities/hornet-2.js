ig.module(
    'game.entities.hornet-2'
)
.requires(
    'impact.entity',
    'impact.entity-pool',
    'game.entities.hornet-2-stinger',
    'plugins.move-to-point'
)
.defines(function() {
    EntityHornet2 = ig.Entity.extend({
        
        size: {x: 12, y: 12},
        offset: {x: 8, y: 14},
        maxVel: {x: 100, y: 100},
        flip: false,
        speed: 40,
        gravityFactor: 0,
        health: 4,
        maxHealth: 4,
        animSheet: new ig.AnimationSheet( 'media/hornet-2.png', 30, 30 ),
        
        start: {x: 0, y: 0},
        proximity: 200,//80,
        
        canAttack: false,
        attackTime: 0.5,
        timerAttack: new ig.Timer( 0.5 ),
        
        idling: false,
        hurting: false,
        dying: false,
        attacking: false,
        returning: false,
        
        type: ig.Entity.TYPE.B, // add to enemy group
        checkAgainst: ig.Entity.TYPE.A, // check collisions against friendly group
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        init: function( x, y, settings ) {
            this.parent( x, ( y - this.size.y ), settings );
            
            // add the animations
            this.addAnim( 'idle', 0.1, [0, 1] );
            this.addAnim( 'hurt', 0.1, [0, 0, 0] );
            this.addAnim( 'dead', 0.1, [2, 2, 2] );
            this.prepareEntity();
        },
        
        // resurrect this entity from the entity pool (pooling enabled below)
        reset: function( x, y, settings ) {
            this.parent( x, ( y - this.size.y ), settings );
            this.prepareEntity();
        },
              
        // reset parameters
        prepareEntity: function() {
            
            // include movement class
            this.moveToPoint = new MoveToPoint();
            
            // reset parameters
            this.maxVel = {x: 100, y: 100};
            this.health = this.maxHealth;
            this.canAttack = false;
            
            this.idling = false;
            this.hurting = false;
            this.dying = false;
            this.attacking = false;
            this.returning = false;
            
            // stay within this area
            this.boundary = {
                x: {
                    min: ( this.pos.x - 25 ),
                    max: ( this.pos.x + 25 )
                },
                y: {
                    min: ( this.pos.y - 25 ),
                    max: ( this.pos.y + 25 )
                }
            };
            
            // store starting position
            this.start = {
                x: this.pos.x,
                y: this.pos.y
            }
        },
        
        update: function() {
        
            if ( ig.game.isPaused ) {
                return;
            }
            
            this.checkStatus();
            this.parent();
        },
        
        checkStatus: function() {
            
            if ( ig.game.player ) {
                
                // determine the distance to the player entity
                var a = ( ig.game.player.pos.x - this.pos.x );
                var b = ( ig.game.player.pos.y - this.pos.y );
                var hypotenuse = ( a * a ) + ( b * b );
                hypotenuse = Math.round( Math.sqrt(hypotenuse) );
                
                // if the player is within range
                if ( hypotenuse < this.proximity ) {
                    
                    // move to just above the player
                    var pos = {};
                    pos.x = ig.game.player.pos.x;
                    pos.x += ( ( pos.x < this.pos.x ) ? 20 : -20 );
                    pos.y = ig.game.player.pos.y - 20;
                    this.moveToPoint.setDestination( pos );
                    
                    this.attacking = true;
                }
                // else, if the player is now outside the range
                else if ( this.attacking ) {
                    this.moveToPoint.setDestination( this.start );
                    this.returning = true;
                    this.attacking = false;
                }
            }
            
            // check entity status
            this.isHurting();
            this.isAttacking();
            this.isReturning();
            this.isIdling();
            this.isMoving();
            this.animate();
        },
        
        // check if hurting
        isHurting: function() {
            
            // if dying, kill this entity when the animation ends
            if ( this.dying ) {
                if ( this.currentAnim == this.anims.dead ) {
                    if ( this.currentAnim.loopCount ) {
                        this.kill();
                    }
                }
            }
            
            // stop hurting when the animation ends
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
                return;
            }
            
            // if attacking, move towards the destination
            if ( this.attacking ) {
                //this.vel = this.moveToPoint.getVelocity( this.speed, this );
            }
            
            // if entity can attack
            if ( this.canAttack ) {
                if ( this.attacking ) {
                    this.canAttack = false;
                    this.timerAttack = new ig.Timer( this.attackTime ); // resetting the timer affects all entities
                    
                    // create stinger entity
                    var xPos = this.pos.x + (this.flip ? 5 : 0);
                    var yPos = this.pos.y + 12;
                    ig.game.spawnEntity( EntityHornet2Stinger, xPos, yPos );
                }
            }
            // else, entity can't attack again for a moment
            else {
                if ( this.timerAttack.delta() > 0 ) {
                    this.canAttack = true;
                }
            }
            
        },
        
        // check if returning
        isReturning: function() {
            
            if ( this.attacking || this.hurting || this.dying ) {
                return;
            }
            
            // if returning, move towards the starting position
            if ( this.returning ) {
                this.vel = this.moveToPoint.getVelocity( 10, this );
                if ( this.vel.x == 0 && this.vel.y == 0 ) {
                    this.returning = false;
                }
            }
            
        },
        
        // check if idling
        isIdling: function() {
            
            if ( this.attacking || this.returning || this.hurting || this.dying ) {
                return;
            }
            
            // if idling, just move around within boundary
            if ( this.idling ) {
                this.vel = this.moveToPoint.getVelocity( 10, this );
                if ( this.vel.x == 0 && this.vel.y == 0 ) {
                    this.idling = false;
                }
            }
            else {
                destination = {x: 0, y: 0}
                destination.x = Math.round( Math.random() * ( this.boundary.x.max - this.boundary.x.min ) ) + this.boundary.x.min
                destination.y = Math.round( Math.random() * ( this.boundary.y.max - this.boundary.y.min ) ) + this.boundary.y.min;
                this.moveToPoint.setDestination( destination );
                this.idling = true;
            }
            
        },
        
        // check if moving
        isMoving: function() {
            
            if ( this.hurting || this.dying ) {
                return;
            }
            
            /*
            // update facing direction
            if ( this.vel.x != 0 ) {
                
                // if moving left
                if ( this.vel.x < 0 ) {
                    this.flip = true;
                }
                // else, if moving right
                else {
                    this.flip = false;
                }
                
            }
            */
            
            // if attacking, face the player
            if ( this.attacking && ig.game.player ) {
                if ( ig.game.player.pos.x < this.pos.x ) {
                    this.flip = true; // face left
                } else {
                    this.flip = false; // face right
                }
                return;
            }
            
            // if returning, face that right direction
            if ( this.returning && this.vel.x != 0 ) {
                if ( this.vel.x < 0 ) {
                    this.flip = true; // face left
                } else {
                    this.flip = false; // face right
                }
            }
            
        },
        
        // update entity animation
        animate: function() {
            
            // update entitiy opacity
            if ( this.hurting || this.dying ) {
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
            else {
                if ( this.currentAnim != this.anims.idle ) {
                    this.currentAnim = this.anims.idle.rewind();
                }
            }
            
            // update facing direction
            this.currentAnim.flip.x = this.flip;
        },
        
        // opt out of collision
        handleMovementTrace: function( res ) {
            var mx = ( this.vel.x * ig.system.tick );
            var my = ( this.vel.y * ig.system.tick );
            this.pos.x += mx;
            this.pos.y += my;
        },
        
        /*
        // called when this entity overlaps with an entity matching the .checkAgainst property
        check: function( other ) {
            
            if ( this.hurting || this.dying || this.ghosting ) {
                return;
            }
            
            other.receiveDamage( 1, this );
        },
        */
        
        // called by attacking entity
        receiveDamage: function( amount, from ) {
        
            if ( this.hurting || this.dying ) {
                return false;
            }
            
            // reduce health
            this.health -= amount;
            
            // if dead
            if ( this.health <= 0 ) {
                this.vel.x = 0;
                this.vel.y = 0;
                this.dying = true;
                return true;
            }
            
            // update state
            this.hurting = true;
            
            // apply knockback
            this.vel.x = ( from.flip ? -80 : 80 );
            this.vel.y = -10;
            
            return true;
        }
        
    });
    
    ig.EntityPool.enableFor( EntityHornet2 );
});