ig.module(
	'game.entities.player-sword'
)
.requires(
	'impact.entity',
    'impact.entity-pool'
)
.defines(function() {
    EntityPlayerSword = ig.Entity.extend({
        
        size: {x: 10, y: 10},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        gravityFactor: 0,
        
        attack_1: false,
        attack_2: false,
        attack_3: false,
        attack_4: false,
        attack_up: false,
        attack_jump: false,
        
        type: ig.Entity.TYPE.NONE, // don't add to any groups
        checkAgainst: ig.Entity.TYPE.B, // check collisions against enemy group
        collides: ig.Entity.COLLIDES.PASSIVE,
        _wmIgnore: true,
        
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.prepareEntity();
        },
        
        // resurrect this entity from the entity pool
        reset: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.prepareEntity();
        },
              
        // reset parameters
        prepareEntity: function() {
            this.attack_1 = false;
            this.attack_2 = false;
            this.attack_3 = false;
            this.attack_4 = false;
            this.attack_up = false;
            this.attack_jump = false;
        },
        
        update: function() {
        
            if ( ig.game.isPaused ) {
                return;
            }
            
            this.parent();
        },
        
        // called by player.js after it's updated
        updatePosition: function( entity ) {
        
            // if entity is facing left
            if ( entity.flip ) {
                this.pos.x = entity.pos.x - this.size.x + entity.size.x;
                this.pos.y = entity.pos.y - this.size.y + entity.size.y;
                //this.offset.x = 10 + 2;
            }
            // else, entity is facing right
            else {
                this.pos.x = entity.pos.x;
                this.pos.y = entity.pos.y - this.size.y + entity.size.y;
                //this.offset.x = 10 - 2;
            }
            
        },
        
        // update the size of the collision box
        updateCollisionBox: function() {
            if ( this.attack_up ) {
                this.size.x = 20;
                this.size.y = 24;
                this.offset.x = 0;
                this.offset.y = 0;
            }
            else if ( this.attack_jump ) {
                this.size.x = 20;
                this.size.y = 24;
                this.offset.x = 0;
                this.offset.y = 0;
            }
            else if ( this.attack_3 || this.attack_4 ) {
                this.size.x = 30;
                this.size.y = 24;
                this.offset.x = 0;
                this.offset.y = 0;
            }
            else {
                this.size.x = 30;
                this.size.y = 24;
                this.offset.x = 0;
                this.offset.y = 0;
            }
        },
        
        // opt out of collision
        handleMovementTrace: function( res ) {
            //this.pos.x = ig.game.player.pos.x - 20;
            //this.pos.y = ig.game.player.pos.y - 12;
        },
        
        // called when this entity overlaps with an entity matching the .checkAgainst property
        check: function( other ) {
            /*
            // damage entity that collided with this entity
            var hit = other.receiveDamage( 1, this );
            if ( hit ) {
                // create ricochet effect
                this.ricocheting = true;
                this.ricochetTimer.reset();
                this.maxVel.y = 600;
                this.vel.x = -( this.vel.x / 4 );
                this.vel.y = -200;
                this.currentAnim.alpha = 0.5;
                //this.kill();
            }
            */
        }	
    });
    
    ig.EntityPool.enableFor( EntityPlayerSword );
});