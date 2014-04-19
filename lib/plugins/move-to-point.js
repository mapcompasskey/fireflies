/*
    This plugin moves the targeted entity to a defined x/y coordinate.
    Based on the example outlined in "Html5 Game Development with Impactjs By Arno Meysman Davy Ciele"
    
    Example:
    
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            ig.input.bind( ig.KEY.MOUSE1, 'click' );
        },
        
        update: function() {
            if ( this.movingtopoint ) {
                this.vel = this.MoveToPoint.getVelocity(100, this);
                if ( this.vel.x == 0 && this.vel.y == 0 ) {
                    this.movingtopoint = false;
                }
            }
            
            if ( ig.input.pressed('click') ) {
                this.movingtopoint = true;
                var destination = {
                    x: ( ig.input.mouse.x + ig.game.screen.x ),
                    y: ( ig.input.mouse.y + ig.game.screen.y )
                };
                this.MoveToPoint.setDestination( destination );
            }
            
            this.parent();
        }
*/
ig.module( 
	'plugins.move-to-point'
)
.requires(
	'impact.game'
)
.defines(function(){
    MoveToPoint = ig.Class.extend({
        
        speed: 0,
        destination: {x: 0, y: 0},
        
        init: function() {
            
        },
        
        setDestination: function( destination ) {
            this.destination.x = destination.x;
            this.destination.y = destination.y;
        },
        
        getVelocity: function( speed, source ) {
            
            var vel = {x: 0, y: 0};
            
            if ( isNaN( speed ) ) {
                return vel;
            }
            if ( source.pos == undefined ) {
                return vel;
            }
            if ( isNaN( source.pos.x ) || isNaN( source.pos.x ) ) {
                return vel;
            }
            if ( source.size == undefined ) {
                return vel;
            }
            if ( isNaN( source.size.x ) || isNaN( source.size.x ) ) {
                return vel;
            }
            
            var distance = {x: 0, y: 0};
            distance.x = ( this.destination.x - source.pos.x - ( source.size.x / 2 ) );
            distance.y = ( this.destination.y - source.pos.y - ( source.size.y / 2 ) );
            
            if ( Math.abs( distance.x ) > 5 || Math.abs( distance.y ) > 5 ) {
                if ( Math.abs( distance.x ) > Math.abs( distance.y ) ) {
                    if ( distance.x > 0 ) {
                        vel.x = speed;
                        vel.y = ( ( distance.y / distance.x ) * speed );
                        // right
                    } else {
                        vel.x = -speed;
                        vel.y = ( ( distance.y / Math.abs( distance.x ) ) * speed );
                        // left
                    }
                } else {
                    if ( distance.y > 0 ) {
                        vel.y = speed;
                        vel.x = ( ( distance.x / distance.y ) * speed );
                        // down
                    } else {
                        vel.y = -speed;
                        vel.x = ( ( distance.x / Math.abs( distance.y ) ) * speed );
                        // down
                    }
                }
            } else {
                vel.y = 0;
                vel.x = 0;
            }
            
            return vel;
        }
        
        /*
        getVelocity: function( speed, source, destination ) {
            
            var vel = {x: 0, y: 0};
            
            if ( isNaN( speed ) ) {
                return vel;
            }
            if ( isNaN( source.pos.x ) || isNaN( source.pos.x ) ) {
                return vel;
            }
            if ( isNaN( source.size.x ) || isNaN( source.size.x ) ) {
                return vel;
            }
            if ( isNaN( destination.x ) || isNaN( destination.y ) ) {
                return vel;
            }
            
            var distance = {x: 0, y: 0};
            distance.x = ( destination.x - source.pos.x - ( source.size.x / 2 ) );
            distance.y = ( destination.y - source.pos.y - ( source.size.y / 2 ) );
            
            if ( Math.abs( distance.x ) > 5 || Math.abs( distance.y ) > 5 ) {
                if ( Math.abs( distance.x ) > Math.abs( distance.y ) ) {
                    if ( distance.x > 0 ) {
                        vel.x = speed;
                        vel.y = ( ( distance.y / distance.x ) * speed );
                        // right
                    } else {
                        vel.x = -speed;
                        vel.y = ( ( distance.y / Math.abs( distance.x ) ) * speed );
                        // left
                    }
                } else {
                    if ( distance.y > 0 ) {
                        vel.y = speed;
                        vel.x = ( ( distance.x / distance.y ) * speed );
                        // down
                    } else {
                        vel.y = -speed;
                        vel.x = ( ( distance.x / Math.abs( distance.y ) ) * speed );
                        // down
                    }
                }
            } else {
                vel.y = 0;
                vel.x = 0;
            }
            
            return vel;
        }
        */
        
    });
});