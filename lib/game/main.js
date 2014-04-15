ig.module( 
	'game.main' 
)
.requires(
    //'impact.debug.debug',
	'impact.game',
	'impact.font',
    'plugins.simple-camera',
    'plugins.touch-button',
    'game.entities.player',
    'game.entities.firefly',
    'game.levels.area1'
)
.defines(function() {
    
    //
    // --------------------------------------------------------------------------
    // The Game Stage
    // --------------------------------------------------------------------------
    //
    GameStage = ig.Game.extend({
        
        clearColor: '#000000',
        isPaused: false,
        tileSize: 5,
        gravity: 600,
        
        // initialize your game here
        init: function() {
            
            // bind keys
            ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
            ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
            ig.input.bind( ig.KEY.UP_ARROW, 'up' );
            ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
            ig.input.bind( ig.KEY.X, 'jump' );
            ig.input.bind( ig.KEY.Z, 'attack' );
            ig.input.bind( ig.KEY.C, 'invincible' );
            ig.input.bind( ig.KEY.P, 'pause' );
            
            this.loadLevel( LevelArea1 );
            
            // show collision boxes
            //ig.Entity._debugShowBoxes = true;
            
            // if fullscreen mode
            if ( fullscreen || ig.ua.mobile ) {
                
                // add a resize event listener to the browser
                this.resizeGame();
                
                // add and align touch buttons
                this.buttons = new ig.TouchButtonCollection([
                    new ig.TouchButton( 'left', {left: 0, bottom: 0}, 120, 120, new ig.Image( 'media/buttons/arrow-left.png' ) ),
                    new ig.TouchButton( 'right', {left: 128, bottom: 0}, 120, 120, new ig.Image( 'media/buttons/arrow-right.png' ) ),
                    new ig.TouchButton( 'shoot', {right: 128, bottom: 0}, 120, 120, new ig.Image( 'media/buttons/button-a.png' ) ),
                    new ig.TouchButton( 'jump', {right: 0, bottom: 0}, 120, 120, new ig.Image( 'media/buttons/button-b.png' ) )
                ]);
            }
            
            // position everyting
            this.resizeGame();
        },
        
        update: function() {
            this.parent();
            
            if ( ig.input.pressed('pause') ) {
                this.isPaused = !this.isPaused;
            }
            
            if ( ig.game.isPaused ) {
                return;
            }
            
            // update camera
            if ( this.camera ) {
                // camera follows the player
                this.camera.follow( this.player );
            } else {
                // center screen on the player
                this.screen.x = ( this.player.pos.x - ( ig.system.width / 2 ) );
                this.screen.y = ( this.player.pos.y - ( ig.system.height / 2 ) );
            }
        },
        
        draw: function() {
            this.parent();
            
            // draw touch buttons 
            if ( fullscreen || ig.ua.mobile ) {
                if ( this.buttons ) {
                    this.buttons.draw(); 
                }
            }
        },
        
        loadLevel: function( data ) {
            // remember the currently loaded level, so we can reload when the player dies.
            this.currentLevel = data;
            
            // call the parent implemenation. this creates the background maps and entities.
            this.parent( data );
            
            // setup camera plugin
            this.camera = new ig.SimpleCamera();
            this.camera.offset.x.min = 0;
            this.camera.offset.x.max = 0;
            this.camera.getMinMax();
            
            // spawn fireflies
            var pos_x = 0;
            var pos_y = 0;
            for ( var i = 0; i < 30; i++ ) {
                //pos_x = Math.floor( 30 + ( ( Math.random() * 20 ) - 10 ) );
                pos_x = Math.floor( 20 + ( 2 * i ) );
                pos_y = Math.floor( 20 + ( ( Math.random() * 6 ) - 3 ) );
                ig.game.spawnEntity( EntityFirefly, ( pos_x * this.tileSize ), ( pos_y * this.tileSize ) );
            }
        },
        
        // size the game to the browser
        resizeGame: function() {
            
            // has the game started
            if ( ! ig.system ) {
                return;
            }
            
            // resize the canvas
            if ( canvas ) {
                canvas.style.width = window.innerWidth + 'px';
                canvas.style.height = window.innerHeight + 'px';
                ig.system.resize( window.innerWidth * scale, window.innerHeight * scale );
            }
            
            // repositon the buttons
            if ( this.buttons ) {
                this.buttons.align();
            }
            
            if ( this.camera ) {
                this.camera.getMinMax();
            }
        }
    });
    
    
    
    //
    // --------------------------------------------------------------------------
    // ImpactJS Overrides
    // --------------------------------------------------------------------------
    //
    /*
    // override default parallax effect to force y-axis positiong from certain layers
    ig.BackgroundMap.inject({
        setScreenPos: function( x, y ) {
            this.scroll.x = x / this.distance;
            //this.scroll.y = y / this.distance;
            
            switch ( this.name ) {
                case 'sky':
                    this.scroll.y = y + 200;
                    break
                    
                case 'buildings':
                    this.scroll.y = y + 60;
                    break;
                    
                default:
                    this.scroll.y = y / this.distance;
            }
        }
    });
    */
    
    
    
    //
    // --------------------------------------------------------------------------
    // Fullscreen / Mobile mode
    // --------------------------------------------------------------------------
    //
    
    // If our screen is smaller than 640px in width (that's CSS pixels), we scale the 
    // internal resolution of the canvas by 2. This gives us a larger viewport and
    // also essentially enables retina resolution on the iPhone and other devices 
    // with small screens.
    var scale = 1;//(window.innerWidth < 640) ? 2 : 1;
    
    if ( fullscreen || ig.ua.mobile ) {
        // We want to run the game in "fullscreen", so let's use the window's size directly as the canvas' style size.
        var canvas = document.getElementById('canvas');
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
            
        // Listen to the window's 'resize' event and set the canvas' size each time it changes.
        window.addEventListener('resize', function(){
            if ( ! ig.system ) { return; }
            ig.game.resizeGame();
        }, false);
    }
    
    
    
    //
    // --------------------------------------------------------------------------
    // Initialize the Game
    // --------------------------------------------------------------------------
    //
    var width = window.innerWidth * scale
    var height = window.innerHeight * scale;
    ig.main( '#canvas', GameStage, 1, 200, 120, 3 );
});
