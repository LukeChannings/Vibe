define(function(require) {

	// dependencies.
	var util = require('util'),
		ButtonBarWidget = require('ui.widget.buttonBar')

	var UIPlayerControls = function(options) {
	
		var options = typeof options == 'object' ? options : {},
			self = this
	
		var node = this.node = util.createElement({
			'tag' : 'div',
			'id' : 'UIPlayerControls',
			'appendTo' : options.appendTo
		})

		var buttons = this.buttons = new ButtonBarWidget({
			'appendTo' : node,
			'buttons' : [{
				isIcon : true,
				customClass : 'prev',
				titleText : "Previous Track",
				callback : options.onprevious
			},{
				isIcon : true,
				customClass : 'play_pause',
				titleText : "Play or Pause Track",
				callback : options.onplaytoggle
			},{
				isIcon : true,
				customClass : 'next',
				titleText : "Next Track",
				callback : options.onnext
			}]
		})
	}
	
	return UIPlayerControls
})