ig.module(
	'game.entities.player-sword'
)
.requires(
	'impact.entity',
    'impact.entity-pool'
)
.defines(function() {
    EntityPlayerSword = ig.Entity.extend({
        
        size: {x: 20, y: 24},
        offset: {x: 8, y: 0},
        maxVel: {x: 0, y: 0},
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet( 'media/player-sword.png', 40, 24 ),
        
        attacking1: false,
        attacking2: false,
        
        type: ig.Entity.TYPE.NONE, // don't add to any groups
        checkAgainst: ig.Entity.TYPE.B, // check collisions against enemy group
        collides: ig.Entity.COLLIDES.PASSIVE,
        _wmIgnore: true,
        
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            
            // add the animations
            this.addAnim( 'idle', 1, [0], true );
            this.addAnim( 'attack1', 0.1, [0, 1, 2], true );
            this.addAnim( 'attack2', 0.1, [3, 4, 5], true );
            
            this.prepareEntity();
        },
        
        // resurrect this entity from the entity pool
        reset: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.prepareEntity();
        },
              
        // reset parameters
        prepareEntity: function() {
            this.attacking1 = false;
            this.attacking2 = false;
            this.currentAnim = this.anims.idle;
        },
        
        update: function() {
        
            if ( ig.game.isPaused ) {
                return;
            }
            
            this.parent();
            this.animate();
        },
        
        // update entity animation
        animate: function() {
            
            // update animation state
            if ( this.attacking1 ) {
                if ( this.currentAnim != this.anims.attack1 ) {
                    this.currentAnim = this.anims.attack1.rewind();
                }
            }
            else if ( this.attacking2 ) {
                if ( this.currentAnim != this.anims.attack2 ) {
                    this.currentAnim = this.anims.attack2.rewind();
                }
            }
            
            // update facing direction
            this.currentAnim.flip.x = this.flip;
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