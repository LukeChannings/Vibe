define(['util','require', 'dependencies/EventEmitter', 'UI/Player/PlayerControls', 'UI/Player/PlayerSlider'], function(util, require, EventEmitter, UIPlayerControls, UIPlayerSlider){

	util.registerStylesheet(require.toUrl('./Player.css'))

	/**
	 * constructs a player interface instance.
	 * @param options {object} configure the instance.
	 */
	function UIPlayer(options) {
	
		var options = typeof options == 'object' ? options : {},

			self = this,

			node = this.node = util.createElement({
				'tag' : 'div',
				'id' : 'UIPlayer',
				'appendTo' : options.appendTo
			})
	
		if ( options.withControls instanceof Array ) {
		
			var controls = this.controls = new UIPlayerControls({
				'appendTo' : node
			})
		
			controls.on('playtoggle', function(button) {
			
				self.emit('playtoggle', button)
			
			})
		
		}
		
		if ( options.withSlider ) {
		
			setTimeout(function() {
			
				var slider = self.slider = new UIPlayerSlider({
					'appendTo' : node
				})
			
				slider.on('seek', function(position) {
				
					self.emit('seek', position)
				
				})
			
			}, 10)
		
		}
	
		this.on('playstatechanged', function(state) {
		
			if ( state == 'play' ) {
			
				controls.buttons.buttons.play_pause.node.addClass('pause')
			
			}
			
			else if ( state == 'pause' ) {
			
				controls.buttons.buttons.play_pause.node.removeClass('pause')
			
			}
		
		})
		
		this.on('bufferupdate', function(progress) {
		
			self.slider.update({
				'bufferPosition' : progress
			})
		
		})
		
		this.on('trackupdate', function(progress) {
		
			self.slider.update({
				'trackPosition' : progress
			})
		
		})
	
	}

	EventEmitter.augment(UIPlayer.prototype)	
	
	return UIPlayer;

});