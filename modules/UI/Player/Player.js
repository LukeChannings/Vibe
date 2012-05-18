define(['util','require', 'dependencies/EventEmitter', 'UI/Player/PlayerControls', 'UI/Player/PlayerSlider'], function(util, require, EventEmitter, UIPlayerControls, UIPlayerSlider){

	util.registerStylesheet(require.toUrl('./Player.css'))

	/**
	 * constructs a player interface instance.
	 * @param options {object} configure the instance.
	 */
	function UIPlayer(options) {
	
		var options = typeof options == 'object' ? options : {},
		
			controls = this.controls = null,
			
			self = this,
			
			slider = this.slider = null,
	
			node = this.node = util.createElement({
				'tag' : 'div',
				'id' : 'UIPlayer',
				'appendTo' : options.appendTo
			})
	
		if ( options.withControls instanceof Array ) {
		
			controls = new UIPlayerControls({
				'appendTo' : node
			})
		
			controls.on('playtoggle', function(button) {
			
				self.emit('playtoggle', button)
			
			})
		
		}
		
		if ( options.withSlider ) {
		
			slider = new UIPlayerSlider({
				'appendTo' : node
			})
		
		}
	
		this.on('playstatechanged', function(state) {
		
			if ( state == 'play' ) {
			
				controls.buttons.buttons.Play.node.innerHTML = 'Pause'
			
			}
			
			else if ( state == 'pause' ) {
			
				controls.buttons.buttons.Play.node.innerHTML = 'Play'
			
			}
		
		})
	
	}

	EventEmitter.augment(UIPlayer.prototype)	
	
	return UIPlayer;

});