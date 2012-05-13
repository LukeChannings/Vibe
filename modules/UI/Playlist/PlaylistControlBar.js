define(['util', 'UI/Widget/ButtonBar/ButtonBar'], function(util, UIButtonBarWidget) {

	var PlaylistControllerBar = function(buttons) {
	
		var self = this
	
		var node = util.createElement({
			'tag' : 'div',
			'customClass' : 'controlBar',
			'appendTo' : this.header
		})
		
		var buttons = new UIButtonBarWidget({
			appendTo : node,
			buttons : buttons
		})
	
		this.emit('controlBarLoaded')
	
		return node
	
	}
	
	return PlaylistControllerBar

})