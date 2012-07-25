define(['util', 'ui.widget.buttonBar'], function(util, UIButtonBarWidget) {

	var PlaylistControlBar = function(buttons) {
	
		if ( ! buttons ) {
			throw new Error("Playlist Control Bar does not have any buttons configured.")
		}
		
		var node = util.createElement({
			'tag' : 'div',
			'className' : 'controlBar',
			'appendTo' : this.header
		})
		
		var buttons = this.buttons = new UIButtonBarWidget({
			appendTo : node,
			buttons : buttons,
			noClass : true
		})
	}
	
	return PlaylistControlBar
})