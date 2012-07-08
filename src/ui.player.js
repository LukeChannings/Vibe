define(function(require) {

	var util = require('util'),
		PlayerControls = require('ui.player.controls'),
		PlayerSlider = require('ui.player.slider')

	/**
	 * constructs a player interface instance.
	 * @param options {object} configure the instance.
	 */
	function UIPlayer(options) {
	
		var options = typeof options == 'object' ? options : {},

		node = this.node = util.createElement({
			'tag' : 'div',
			'id' : 'UIPlayer'
		}),
		
		self = this
	
		if ( typeof options.onseek == 'function' ) {
			this.onseek = options.onseek
		}
		
		if ( typeof options.onplaytoggle == 'function' ) {
			this.onplaytoggle = options.onplaytoggle
		}
		
		if ( typeof options.onskip == 'functions' ) {
			this.onskip = options.onskip
		}
	
		util.registerStylesheet('./stylesheets/ui.player.css', function() {

			var controls = self.controls = new PlayerControls({
				appendTo : node,
				onprevious : function() {
				
					self.onskip(-1)
				},
				onnext : function() {
				
					self.onskip(1)
				},
				onplaytoggle : function(button) {
				
					self.onplaytoggle(button)
				}
			})

			// delay the UIPlayerSlider instantiation by 150ms to allow for the styles to be computed.
			setTimeout(function() {
			
				var playerSlider = self.playerSlider = new PlayerSlider({
					appendTo : node,
					onseek : self.onseek
				})
			
			}, 150)

			options.onload && options.onload(self)
		})
	}
	
	return UIPlayer
})