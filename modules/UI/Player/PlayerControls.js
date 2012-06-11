define(['util/methods','dependencies/EventEmitter','UI/Widget/ButtonBar/ButtonBar'], function(util, EventEmitter, UIButtonBarWidget) {

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
				'isIcon' : true,
				'customClass' : 'prev',
				'callback' : function() {
				
					self.emit('skip', true)
				
				}
			},{
				'isIcon' : true,
				'customClass' : 'play_pause',
				'callback' : function(button) {
				
					self.emit('playtoggle', button)
				
				}
			},{
				'isIcon' : true,
				'customClass' : 'next',
				'callback' : function() {
				
					self.emit('skip', false)
				
				}
			}]
		})

	}
	
	EventEmitter.augment(UIPlayerControls.prototype)
	
	return UIPlayerControls

})