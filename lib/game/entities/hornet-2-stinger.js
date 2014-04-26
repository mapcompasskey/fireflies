ig.module(
	'game.entities.hornet-2-stinger'
)
.requires(
	'impact.entity',
    'impact.entity-pool'
)
.defines(function() {
    EntityHornet2Stinger = ig.Entity.extend({
        
        size: {x: 10, y: 10},
        offset: {x: 0, y: 0},
        maxVel: {x: 100, y: 100},
        flip: false,
        speed: 40,
        gravityFactor: 0,
        canDamage: false,
        timerDecay: new ig.Timer( 3.0 ),
        animSheet: new ig.AnimationSheet( 'media/hornet-2-stinger.png', 8, 8 ),
        
        type: ig.Entity.TYPE.B, // add to enemy group
        checkAgainst: ig.Entity.TYPE.A, // check collisions against friendly group
        collides: ig.Entity.COLLIDES.PASSIVE,
        _wmIgnore: true,
        
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.prepareEntity();
            
            // add the animations
            this.addAnim( 'idle', 1, [0], true );
        },
        
        // resurrect this entity from the entity pool
        reset: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.prepareEntity();
        },
              
        // reset parameters
        prepareEntity: function() {
        
            // reset parameters
            this.canDamage = true;
            this.timerDecay = new ig.Timer( 3.0 );
            
            // move towards player entity
            if ( ig.game.player ) {
            
                // get angle from entity to player in radians
                var mx = ( ig.game.player.pos.x - this.pos.x );
                var my = ( ig.game.player.pos.y - this.pos.y );
                var radians = Math.atan2( my, mx );
                
                var xVel = ( Math.cos( radians ) * this.speed );
                var yVel = ( Math.sin( radians ) * this.speed );
                
                this.maxVel.x = this.vel.x = this.accel.x = xVel;
                this.maxVel.y = this.vel.y = this.accel.y = yVel;
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
        
            // if decayed
            if ( this.timerDecay.delta() > 0 ) {
                this.kill();
            }
            
        },
        
        // opt out of collision
        handleMovementTrace: function( res ) {
            var mx = ( this.vel.x * ig.system.tick );
            var my = ( this.vel.y * ig.system.tick );
            this.pos.x += mx;
            this.pos.y += my;
        },
        
        // when overlapping with .checkAgainst entities
        check: function( other ) {
            if ( this.canDamage ) {
                other.receiveDamage( 1, this );
            }
        }	
    });
    
    ig.EntityPool.enableFor( EntityHornet2Stinger );
});