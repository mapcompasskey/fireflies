ig.module(
    'game.entities.hornet'
)
.requires(
    'impact.entity',
    'impact.entity-pool'
)
.defines(function() {
    EntityHornet = ig.Entity.extend({
        
        size: {x: 14, y: 16},
        offset: {x: 11, y: 12},
        maxVel: {x: 100, y: 100},
        flip: false,
        speed: 20,
        gravityFactor: 0,
        health: 2,
        maxHealth: 2,
        movementTimer: null,
        animSheet: new ig.AnimationSheet( 'media/hornet.png', 30, 30 ),
        
        start: {x: 0, y: 0},
        proximity: {
            range: 80,
            distance: 0
        },
        
        walking: false,
        hurting: false,
        dying: false,
        attacking: false,
        pursuing: false,
        returning: false,
        
        type: ig.Entity.TYPE.B, // add to enemy group
        checkAgainst: ig.Entity.TYPE.A, // check collisions against friendly group
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        init: function( x, y, settings ) {
            this.parent( x, ( y - this.size.y ), settings );
            ig.input.bind( ig.KEY.MOUSE1, 'click' );
            
            // add the animations
            this.addAnim( 'walk', 0.1, [0, 1] );
            this.prepareEntity();
        },
        
        // resurrect this entity from the entity pool (pooling enabled below)
        reset: function( x, y, settings ) {
            this.parent( x, ( y - this.size.y ), settings );
            this.prepareEntity();
        },
              
        // reset parameters
        prepareEntity: function() {
            
            // include MoveToPoint plugin
            this.MoveToPoint = new MoveToPoint();
            
            // reset parameters
            this.maxVel = {x: 100, y: 100};
            this.health = this.maxHealth;
            this.walking = true;
            this.hurting = false;
            this.dying = false;
            this.attacking = false;
            
            // stay within this area
            /*
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
            */
            
            // store starting position
            this.start = {
                x: this.pos.x,
                y: this.pos.y
            }
            
            // set entity action
            //this.updateAction();
            //this.updateMovement();
        },
        
        update: function() {
        
            if ( ig.game.isPaused ) {
                return;
            }
            
            this.checkStatus();
            //this.checkPosition();
            this.parent();
        },
        
        checkStatus: function() {
        
            // update entity movement
            //if ( this.movementTimer ) {
                //if ( this.movementTimer.delta() > 0 ) {
                    //this.updateMovement();
                //}
            //}
            
            if ( ig.game.player ) {
                
                // determine the distance to the player entity
                var a = ( ig.game.player.pos.x - this.pos.x );
                var b = ( ig.game.player.pos.y - this.pos.y );
                var hypotenuse = ( a * a ) + ( b * b );
                this.proximity.distance = Math.round( Math.sqrt(hypotenuse) );
                
                // if the player is within range, move towards the player
                if ( this.proximity.distance < this.proximity.range ) {
                    this.MoveToPoint.setDestination( ig.game.player.pos );
                    this.attacking = true;
                }
                // else, if the player is now outside the range, move towards the starting position
                else if ( this.attacking ) {
                    this.MoveToPoint.setDestination( this.start );
                    this.returning = true;
                    this.attacking = false;
                }
            }
            
            // check entity status
            //this.isHurting();
            this.isAttacking();
            this.isReturning();
            //this.isMoving();
            this.animate();
        },
        
        // check if hurting
        /*
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
        */
        
        // check if attacking
        isAttacking: function() {
                        
            /*
            if ( ig.input.pressed('click') ) {
                this.attacking = true;
                var destination = {
                    x: ( ig.input.mouse.x + ig.game.screen.x ),
                    y: ( ig.input.mouse.y + ig.game.screen.y )
                };
                this.MoveToPoint.setDestination( destination );
            }
            */
            
            // if attacking, move towards the destination
            if ( this.attacking ) {
                this.vel = this.MoveToPoint.getVelocity( this.speed, this );
                if ( this.vel.x == 0 && this.vel.y == 0 ) {
                    this.attacking = false;
                }
            }
            
        },
        
        // check if returning
        isReturning: function() {
            
            if ( this.attacking ) {
                return;
            }
            
            // if returning to starting position
            if ( this.returning ) {
                this.vel = this.MoveToPoint.getVelocity( this.speed, this );
                if ( this.vel.x == 0 && this.vel.y == 0 ) {
                    this.returning = false;
                }
            }
            
        },
        
        // checking if idle or moving left/right
        /*
        isMoving: function() {
            if ( this.hurting || this.dying ) {
                return;
            }
            
            if ( this.walking ) {
                this.vel.x = this.speed * (this.flip ? -1 : 1);
            }
            else {
                this.vel.x = 0;
            }
        },
        */
        
        // update entity animation
        animate: function() {
            
            if ( this.currentAnim != this.anims.walk ) {
                this.currentAnim = this.anims.walk.rewind();
            }
            
            // update facing direction
            this.currentAnim.flip.x = this.flip;
        },
        
        /*
        checkPosition: function() {
        
            if ( this.pursuing ) {
                return;
            }
            
            // reverse horizontal direction
            if ( this.pos.x < this.boundary.x.min ) {
                if ( this.vel.x > -5 ) {
                    this.vel.x = -5;
                }
                this.vel.x = -this.vel.x;
            }
            else if ( this.pos.x > this.boundary.x.max ) {
                if ( this.vel.x < 5 ) {
                    this.vel.x = 5;
                }
                this.vel.x = -this.vel.x;
            }
            
            // reverse vertical direction
            if ( this.pos.y < this.boundary.y.min ) {
                if ( this.vel.y > -5 ) {
                    this.vel.y = -5;
                }
                this.vel.y = -this.vel.y;
            }
            else if ( this.pos.y > this.boundary.y.max ) {
                if ( this.vel.y < 5 ) {
                    this.vel.y = 5;
                }
                this.vel.y = -this.vel.y;
            }
        },
        */
        
        // update entity action
        /*
        updateAction: function() {
            
            if ( this.hurting || this.dying || ig.game.isZombiePaused ) {
                return;
            }
            
            this.walking = true;
            return;
            
            // get a random number 1 - 5
            var num = Math.floor( ( Math.random() * 5 ) + 1 );
            switch ( num ) {
                // walk right
                case 5:
                case 4:
                    this.flip = false;
                    this.walking = true;
                    break;
                
                // walk left
                case 3:
                case 2:
                    this.flip = true;
                    this.walking = true;
                    break;
                
                // stand still
                default:
                    this.walking = false;
            }
            
            // reset action timer to 1 - 5 seconds
            var timer = Math.floor( ( Math.random() * 5 ) + 1 );
            this.actionTimer = new ig.Timer( timer );
        },
        */
        
        // update entity movement
        /*
        updateMovement: function() {
            this.vel = {x: 20, y: 10};
            return;
            
            var num_x = Math.floor( ( Math.random() * 20 ) - 10 );
            var num_y = Math.floor( ( Math.random() * 20 ) - 10 );
            this.vel = {x: num_x, y: num_y};
            
            // reset timer: 0 - 2 seconds
            var timer = ( Math.random() * 2 );
            this.movementTimer = new ig.Timer( timer );
        },
        */
        
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
        // called when overlapping with an entity whose .checkAgainst property matches this entity
        // return true/false so the caller knows whether it caused damage
        receiveDamage: function( amount, from ) {
            /*
            if ( this.hurting || this.dying || this.ghosting || ig.game.isZombiePaused ) {
                return false;
            }
            
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
            this.vel.x = ( from.pos.x > this.pos.x ) ? -150 : 150;
            this.vel.y = -150;
            
            return true;
            */
        }
    });
    
    ig.EntityPool.enableFor( EntityHornet );
});