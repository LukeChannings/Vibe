define(['util','require'],function(util, require){

	util.registerStylesheet(require.toUrl('./Player.css'))

	/**
	 * constructs a player interface instance.
	 * @param options {object} configure the instance.
	 */
	function UIPlayer(options) {
	
		var options = typeof options == 'object' ? options : {}
	
		var node = this.node = util.createElement({
			'tag' : 'div',
			'id' : 'UIPlayer',
			'appendTo' : options.appendTo
		})
	
		if ( options.withControls instanceof Array ) {
		
			require(['UI/Player/PlayerControls'], function(UIPlayerControls) {
			
				var controls = this.controls = new UIPlayerControls({'appendTo' : node})
			
			})
		
		}
	
	}
	
	
	return UIPlayer;

});