define(['util/methods','require', 'dependencies/EventEmitter', 'UI/Player/PlayerControls', 'UI/Player/PlayerSlider'], function(util, require, EventEmitter, UIPlayerControls, UIPlayerSlider){

	/**
	 * constructs a player interface instance.
	 * @param options {object} configure the instance.
	 */
	function UIPlayer(options) {
	
		var options = typeof options == 'object' ? options : {},

			self = this,

			node = this.node = util.createElement({
				'tag' : 'div',
				'id' : 'UIPlayer'
			})
	
		util.registerStylesheet(require.toUrl('./Player.css'), function() {
		
			if ( options.withControls instanceof Array ) {
			
				var controls = self.controls = new UIPlayerControls({
					'appendTo' : node
				})
			
				controls.on('playtoggle', function(button) {

					self.emit('playtoggle', button)
				
				})
			
				controls.on('skip', function(direction) {
				
					self.emit('skip', direction)
				
				})
			
			}
			
			if ( options.withSlider ) {
			
				// delay the UIPlayerSlider instantiation by 40ms to allow for the styles to be computed.
				setTimeout(function() {
				
					// instantiate.
					var playerSlider = self.playerSlider = new UIPlayerSlider({
						'appendTo' : node
					})
					
					// listen for the seek event.
					playerSlider.on('seek', function(position) {
						
						// pass the event to super.
						self.emit('seek', position)
						
					})
				
				}, 50)
			
			}

			// work around IE bug.
			setTimeout(function() {
			
				self.emit('loaded')
			
			}, 0)
		
		})
	
	}

	EventEmitter.augment(UIPlayer.prototype)	
	
	return UIPlayer;

});