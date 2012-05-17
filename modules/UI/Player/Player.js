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
		
			controls.on('play', function() {
			
				self.emit('play')
			
			})
		
			controls.on('pause', function() {
			
				self.emit('pause')
			
			})
		
		}
		
		if ( options.withSlider ) {
		
			slider = new UIPlayerSlider({
				'appendTo' : node
			})
		
		}
	
	}

	EventEmitter.augment(UIPlayer.prototype)	
	
	return UIPlayer;

});