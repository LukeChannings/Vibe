define(['util','dependencies/EventEmitter','UI/Widget/ButtonBar/ButtonBar'], function(util, EventEmitter, UIButtonBarWidget) {

	var UIPlayerControls = function(options) {
	
		var options = typeof options == 'object' ? options : {},
			self = this
	
		var node = this.node = util.createElement({
			'tag' : 'div',
			'id' : 'UIPlayerControls',
			'appendTo' : options.appendTo
		})

		var buttons = this.buttons = new UIButtonBarWidget({
			'appendTo' : node,
			'buttons' : [{
				'title' : "Play",
				'callback' : function(button) {
				
					self.emit('playtoggle', button)
				
				}
			}]
		})

	}
	
	EventEmitter.augment(UIPlayerControls.prototype)
	
	return UIPlayerControls

})