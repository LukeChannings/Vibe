define(['util', 'UI/Widget/DragDealer/DragDealer', 'dependencies/EventEmitter'], function(util, DragDealer, EventEmitter) {

	var UIPlayerSlider = function(options) {
	
		var options = typeof options == 'object' ? options : {},
			self = this,
			node = this.node
			
			// construct the UIPlayerSlider node.
			node = util.createElement({
				'tag' : 'div',
				'id' : 'UIPlayerSlider',
				'appendTo' : options.appendTo || document.body,
				'children' : [{
					'tag' : 'li',
					'customClass' : 'current_time'},{
					'tag' : 'li',
					'customClass' : 'slider'},{
					'tag' : 'li',
					'customClass' : 'total_time'
				}]
			})
			
			var currentTime = this.currentTime = util.createElement({
				'tag' : 'span',
				'inner' : '00:00',
				'appendTo' : node.getElementsByTagName('li')[0]
			})
			
			var totalTime = this.totalTime = util.createElement({
				'tag' : 'span',
				'inner' : '00:00',
				'appendTo' : node.getElementsByTagName('li')[2]
			})
			
			var sliderNode = this.sliderNode = util.createElement({
				'tag' : 'div',
				'customClass' : 'dragdealer',
				'appendTo' : node.getElementsByTagName('li')[1],
				'children' : [{
					'tag' : 'div',
					'customClass' : 'handle'
				}]
			})
			
			var progress = this.progress = util.createElement({
				'tag' : 'div',
				'customClass' : 'progress',
				'appendTo' : sliderNode
			})
			
			var buffer = this.buffer = util.createElement({
				'tag' : 'div',
				'customClass' : 'buffer',
				'appendTo' : sliderNode
			})
			
			var slider = this.slider = new DragDealer(sliderNode, {
				'slide' : false,
				'speed' : 100,
				'callback' : function(x, y) {
				
					self.emit('seek', x)
				
				}
			})
			
			this.update = function(update) {
			
				if ( typeof update == 'object' ) {
				
					if ( update.trackPosition ) {
					
						this.slider.setValue(update.trackPosition)
					
						this.progress.style.width = parseInt(this.slider.handle.style.left.replace('px', '')) + 4 + 'px'
					
					}
				
					if ( update.bufferPosition ) {
					
						this.buffer.style.width = update.bufferPosition + '%'
					
					}
					
					if ( update.currentTime ) {
					
						currentTime.innerHTML = update.currentTime
					
					}
				
					if ( update.totalTime ) {
					
						console.log(totalTime.innerHTML)
					
						totalTime.innerHTML = update.totalTime
					
						console.log(totalTime.innerHTML)
					
					}
				
				}
				
			
			}
			
			slider.disable()

	}

	EventEmitter.augment(UIPlayerSlider.prototype)

	return UIPlayerSlider

})