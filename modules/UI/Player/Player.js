define(['util','require', 'dependencies/EventEmitter', 'UI/Player/PlayerControls', 'UI/Player/PlayerSlider'], function(util, require, EventEmitter, UIPlayerControls, UIPlayerSlider){

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
			
				setTimeout(function() {
				
					var playerslider = self.playerslider = new UIPlayerSlider({
						'appendTo' : node
					})
				
					playerslider.on('seek', function(position) {
					
						self.emit('seek', position)
					
					})
				
				}, 50)
			
			}
		
			self.on('playstatechanged', function(state) {
			
				if ( state == 'play' ) {
				
					controls.buttons.buttons.play_pause.node.addClass('pause')
				
					self.playerslider.slider.enable()
				
				}
				
				else if ( state == 'pause' ) {
				
					controls.buttons.buttons.play_pause.node.removeClass('pause')
				
					self.playerslider.slider.disable()
				
				}
			
			})
			
			self.on('bufferupdate', function(progress) {
			
				self.playerslider.update({
					'bufferPosition' : progress
				})
			
			})
			
			self.on('trackupdate', function(progress) {
			
				self.playerslider.update({
					'trackPosition' : progress
				})
			
			})
		
			// work around IE bug.
			setTimeout(function() {
			
				self.emit('loaded')
			
			}, 0)
		
		})
	
	}

	EventEmitter.augment(UIPlayer.prototype)	
	
	return UIPlayer;

});