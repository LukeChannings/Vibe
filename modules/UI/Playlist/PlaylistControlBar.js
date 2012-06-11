define(['util/methods', 'UI/Widget/ButtonBar/ButtonBar'], function(util, UIButtonBarWidget) {

	var PlaylistControllerBar = function(buttons) {
	
		var self = this
	
		var node = util.createElement({
			'tag' : 'div',
			'customClass' : 'controlBar',
			'appendTo' : this.header
		})
		
		var buttons = this.buttons = new UIButtonBarWidget({
			appendTo : node,
			buttons : buttons
		})
	}
	
	return PlaylistControllerBar
})