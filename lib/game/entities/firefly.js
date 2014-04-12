ig.module(
    'game.entities.firefly'
)
.requires(
    'impact.entity',
    'impact.entity-pool'
)
.defines(function() {
    EntityFirefly = ig.Entity.extend({
        
        size: {x: 1, y: 1},
        maxVel: {x: 0, y: 0},
        flip: false,
        speed: 0,
        gravityFactor: 0,
        movementTimer: null,
        animationTimer: null,
        animSheet: new ig.AnimationSheet( 'media/firefly.png', 1, 1 ),
        
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NEVER,
        _wmIgnore: true,
        
        init: function( x, y, settings ) {
            this.parent( x, ( y - this.size.y ), settings );
            
            // add the animations
            this.addAnim( 'on', 1, [0], true );
            this.addAnim( 'off', 1, [1], true );
            
            this.prepareEntity();
        },
        
        // resurrect this entity from the entity pool
        reset: function( x, y, settings ) {
            this.parent( x, ( y - this.size.y ), settings );
            this.prepareEntity();
        },
              
        // reset parameters
        prepareEntity: function() {
            
            // random walk speed
            //var rand = Math.floor( ( Math.random() * 30 ) + 1 );
            //this.speed = (50 + rand);
            
            // reset parameters
            this.maxVel = {x: 100, y: 100};
            
            // stay within this area
            this.boundary = {
                x: {
                    min: ( this.pos.x - 25 ),
                    max: ( this.pos.x + 25 )
                },
                y: {
                    min: ( this.pos.y - 15 ),
                    max: ( this.pos.y + 15 )
                }
            };
            
            // set entity action
            this.updateMovement();
            this.updateAnimation();
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
        
            // update entity movement
            if ( this.movementTimer ) {
                if ( this.movementTimer.delta() > 0 ) {
                    this.updateMovement();
                }
            }
            
            // update entity animation
            if ( this.animationTimer ) {
                if ( this.animationTimer.delta() > 0 ) {
                    this.updateAnimation();
                }
            }
        },
        
        checkPosition: function() {
        
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
        
        // update entity movement
        updateMovement: function() {
            var num_x = Math.floor( ( Math.random() * 50 ) - 25 );
            var num_y = Math.floor( ( Math.random() * 20 ) - 10 );
            this.vel = {x: num_x, y: num_y};
            
            // reset timer: 0 - 2 seconds
            var timer = ( Math.random() * 2 );
            this.movementTimer = new ig.Timer( timer );
        },
        
        // update entity animation
        updateAnimation: function() {
            var num = Math.floor( Math.random() * 2 ) + 1;
            switch ( num ) {
                case 1:
                    this.currentAnim = this.anims.on;
                    break;
                
                case 2:
                default:
                    this.currentAnim = this.anims.off;
            }
            
            // reset timer: 0.1 or 0.1 - 1.1 seconds
            var timer = ( num == 1 ? 0 : Math.random() ) + 0.1;
            this.animationTimer = new ig.Timer( timer );
        },
        
        // opt out of collision
        handleMovementTrace: function( res ) {
            var mx = ( this.vel.x * ig.system.tick );
            var my = ( this.vel.y * ig.system.tick );
            this.pos.x += mx;
            this.pos.y += my;
        }
        
    });
    
    ig.EntityPool.enableFor( EntityFirefly );
});