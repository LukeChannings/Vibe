define(['util','dependencies/EventEmitter','UI/Widget/ButtonBar/ButtonBar'], function(util, EventEmitter, UIButtonBarWidget) {

	var UIPlayerControls = function(options) {
	
		var options = typeof options == 'object' ? options : {},
			self = this
	
		var node = this.node = util.createElement({
			'tag' : 'div',
			'id' : 'UIPlayerControls',
			'appendTo' : options.appendTo
		})

		new UIButtonBarWidget({
			'appendTo' : node,
			'buttons' : [{
				'title' : "Play",
				'callback' : function() {
				
					self.emit('play')
				
				}
			},{
				'title' : "Pause",
				'callback' : function() {
					
					self.emit('pause')
					
				}
			}]
		})

	}
	
	EventEmitter.augment(UIPlayerControls.prototype)
	
	return UIPlayerControls

})