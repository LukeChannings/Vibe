define(['util', 'UI/Widget/DragDealer/DragDealer', 'dependencies/EventEmitter'], function(util, DragDealer, EventEmitter) {

	var UIPlayerSlider = function(options) {
	
		var options = typeof options == 'object' ? options : {},
			self = this,
			node = this.node,
			trackTime = this.trackTime,
			trackDuration = this.trackDuration

			// construct the UIPlayerSlider node.
			node = util.createElement({
				'tag' : 'div',
				'id' : 'UIPlayerSlider',
				'appendTo' : options.appendTo || document.body
			})
			
			var slider = util.createElement({
				'tag' : 'div',
				'customClass' : 'dragdealer',
				'appendTo' : node,
				'children' : [{
					'tag' : 'div',
					'customClass' : 'handle red-bar'
				}]
			})
			
			var buffer = this.buffer = util.createElement({
				'tag' : 'div',
				'customClass' : 'buffer',
				'appendTo' : slider
			})
			
			window.slider = new DragDealer(slider, {
				'slide' : false,
				'speed' : 100,
				'callback' : function(x, y) {
				
					self.emit('seek', x)
				
				}
			})

	}
	
	UIPlayerSlider.prototype.update = function(update) {
	
		if ( typeof update == 'object' ) {
		
			if ( update.trackPosition ) {
			
				window.slider.setValue(update.trackPosition)
			
			}
		
			if ( update.bufferPosition ) {
			
				this.buffer.style.width = update.bufferPosition + '%'
			
			}
			
			if ( update.trackDuration ) {
			
				// update the track duration.
			
			}
		
			if ( update.trackProgress ) {
			
				// update the track progress.
			
			}
		
		}
	
	}

	EventEmitter.augment(UIPlayerSlider.prototype)

	return UIPlayerSlider

})