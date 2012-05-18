define(['util', 'UI/Widget/DragDealer/DragDealer', 'dependencies/EventEmitter'], function(util, DragDealer, EventEmitter) {

	var UIPlayerSlider = function(options) {
	
		var options = typeof options == 'object' ? options : {},
			self = this,
			node = this.node,
			slider = this.slider,
			trackTime = this.trackTime,
			trackDuration = this.trackDuration

			// construct the UIPlayerSlider node.
			node = util.createElement({
				'tag' : 'div',
				'id' : 'UIPlayerSlider',
				'appendTo' : options.appendTo || document.body
			})
			
			slider = util.createElement({
				'tag' : 'div',
				'customClass' : 'dragdealer',
				'appendTo' : node,
				'children' : [{
					'tag' : 'div',
					'customClass' : 'handle red-bar'
				}]
			})
			
			window.slider = new DragDealer(slider, {
				'slide' : false,
				'speed' : 100
			})

	}
	
	UIPlayerSlider.prototype.update = function(update) {
	
		if ( typeof update == 'object' ) {
		
			if ( update.trackPosition ) {
			
				// update position.
			
			}
		
			if ( update.bufferPosition ) {
			
				// update the time.
			
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