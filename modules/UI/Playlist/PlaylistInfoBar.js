define(['util'], function(util) {

	var UIPlaylistInfoBar = function() {
	
		var infoBar = this.infoBar = util.createElement({
			'tag' : 'div',
			'customClass' : 'infoBar',
			'appendTo' : this.node
		})
		
		util.disableUserSelect(infoBar)
		
		this.node.addClass('usingInfoBar')
	
		this.on('updateInfo', function(info) {
		
			if ( typeof info == 'string' ) {
			
				this.infoBar.removeChildren()
			
				var info = util.createElement({'tag' : 'span', 'inner' : info, 'appendTo' : infoBar})
			
				util.disableUserSelect(info)
			
			}
		
		})
	
		this.emit('infoBarLoaded')
	
	}
	
	return UIPlaylistInfoBar

})