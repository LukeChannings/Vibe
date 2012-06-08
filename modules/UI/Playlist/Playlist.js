/**
 * MusicMe Playlist
 * @description Provides the Playlist view and mutator methods.
 */
define( [
	'require',
	'util',
	'dependencies/EventEmitter',
	'UI/Playlist/PlaylistRow',
	'UI/Playlist/PlaylistLegend',
	'UI/Widget/RearrangeableList/RearrangeableList'

], function(require, util, EventEmitter, PlaylistRow, UIPlaylistLegend, RearrangeableList) {

	/**
	 * constructs a UIPlaylist instance.
	 * @param options {object} options with which to instantiate the playlist.
	 */
	var UIPlaylist = function(options) {

		var self = this,
			options = self.options = ( typeof options == 'object' ) ? options : {}

		util.registerStylesheet(require.toUrl('./Playlist.css'), function() {

			// define columns to use.
			self.useColumns = options.hasOwnProperty('useColumns') ? options.useColumns : ['trackno','trackname','albumname','artistname','tracklength']
			
			// create the root playlist element node.
			var node = self.node = util.createElement({
				tag : 'div',
				id : 'UIPlaylist'
			})
			
			var header = self.header = util.createElement({'tag' : 'div', 'appendTo' : node})
			
			// we're using the control bar.
			if ( typeof options.useControlBar !== 'undefined' && options.useControlBar instanceof Array ) {
			
				// fetch the control bar module.
				require(['UI/Playlist/PlaylistControlBar'], function(UIPlaylistControlBar) {
				
					var control = self.control = UIPlaylistControlBar.call(self, options.useControlBar, function() {
					
						self.emit('loaded')
					})
				
					var legend = new UIPlaylistLegend(header).withColumns(self.useColumns)
				
					node.addClass('usingControlBar')
				})
			}
			
			else {
			
				var legend = new UIPlaylistLegend(header).withColumns(self.useColumns)
				
				setTimeout(function() {
				
					self.emit('loaded')
				}, 0)
			}
			
			var listContainer = self.listContainer = util.createElement({
				'tag' : 'div',
				'customClass' : 'listContainer',
				'appendTo' : node
			})
			
			var list = self.list = new RearrangeableList({appendTo : listContainer})
			
			// check if we're using the info bar.
			if ( typeof options.useInfoBar == 'boolean' && options.useInfoBar ) {
			
				// fetch the info bar module.
				require(['UI/Playlist/PlaylistInfoBar'], function(UIPlaylistInfoBar) {
				
					// make an info bar instance.
					self.infoBar = new UIPlaylistInfoBar(self.node)
					
					// set the class on #UIPlaylist.
					self.node.addClass('usingInfoBar')
				
					// tell any listeners that the info bar module is loaded.
					self.emit('infoBarLoaded')
				})
			}
		})
	}

	/**
	 * adds item rows to the playlist.
	 * @param items {array} playlist items to be appended.
	 * @param afterItem {Element} (optional) insert new rows after current row.
	 */
	UIPlaylist.prototype.addRows = function(items, afterItem) {
	
		var self = this
	
		var rows = items.map(function(item) {
		
			return new PlaylistRow(item).withColumns(self.useColumns).row
		})
	
		this.emit('change')
	
		this.list.addNodes(rows, afterItem)
	}

	UIPlaylist.prototype.playItem = function(e, item) {
	
		this.emit('playItem', item.id, item.row)
	}
	
	/**
	 * adds the rows but also clears the playlist.
	 * @param items {array} list of playlist items.
	 */
	UIPlaylist.prototype.redraw = function(items) {
	
		// empty playlist UI.
		this.list.removeChildren()
		
		// add the items.
		this.addRows(items)
		
		this.emit('change')
	}
	
	// use EventEmitter.
	EventEmitter.augment(UIPlaylist.prototype)
		
	// define UIPlaylist module.
	return UIPlaylist

})