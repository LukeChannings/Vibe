/**
 * MusicMe Playlist
 * @description Provides the Playlist view and mutator methods.
 */
define(['require','util','dependencies/EventEmitter','UI/Widget/ButtonBar/ButtonBar'], function(require, util, EventEmitter, ButtonBar) {

	// register the view stylesheet.
	util.registerStylesheet(require.toUrl('./Playlist.css'))
	
	/**
	 * constructs a UIPlaylist instance.
	 * @param options {object} options with which to instantiate the playlist.
	 */
	var UIPlaylist = function(options) {

		// ensure options is an object.
		var options = this.options = ( typeof options == 'object' ) ? options : {}
		
		// define columns to use.
		this.useColumns = options.hasOwnProperty('useColumns') ? options.useColumns : ['trackno','trackname','albumname','artistname','tracklength']
		
		// create the root playlist element node.
		var node = this.node = util.createElement({
			tag : 'div',
			id : 'UIPlaylist',
			appendTo : ( options.appendTo instanceof Element ) ? options.appendTo : document.body
		})
			
		var header = this.header = util.createElement({'tag' : 'div', 'appendTo' : node})
			
		// define an array to contain the rows.
		var rows = this.rows = {}
		
		var listContainer = this.listContainer = util.createElement({
			'tag' : 'div',
			'customClass' : 'listContainer',
			'appendTo' : node
		})
			
		var list = this.list = util.createElement({'tag' : 'ol', 'appendTo' : listContainer})
		
	}
	
	/**
	 * adds item rows to the playlist.
	 * @param items {array} playlist items to be appended.
	 */
	UIPlaylist.prototype.addRows = function(items) {
	
		var self = this
	
		items.forEach(function(item, index) {
		
			if ( isValidRowDefinition(item) ) {
			
				if ( self.rows[item.trackid] instanceof UIPlaylistRow ) {
				
					self.list.appendChild(self.rows[item.trackid].row)
				
				}
				else {
				
					var playlistRow = new UIPlaylistRow(item).withColumns(self.useColumns)
					
					console.log(playlistRow)
					
					self.rows[item.trackid] = playlistRow
					
					self.list.appendChild(playlistRow.row)
				
				}
			
			}
			
			else { console.warn('Cannot add item ' + index + ' to the playlist. It is not a valid playlist row.')
			
				console.log(item)
			}
		})
	
	}
	
	/**
	 * redraws the entire playlist from an array of UIPlaylistRow objects.
	 */
	UIPlaylist.prototype.redraw = function(items) {
	
		// empty playlist UI.
		this.list.removeChildren()
	
		var self = this
	
		items.forEach(function(item) {
		
			if ( self.rows[item.trackid] instanceof UIPlaylistRow ) {
			
				self.list.appendChild(self.rows[item.trackid].row)
			
			}
			
			else if ( isValidRowDefinition(item) ) {
			
				var playlistRow = new UIPlaylistRow(item).withColumns(self.useColumns)
			
				self.rows[item.trackid] = playlistRow
			
				self.list.appendChild(playlistRow.row)
			
			}
			
			else return false
		
		})
	
	}
	
	/**
	 * represents a playlist row.
	 * @param definition {object} defines a playlist row.
	 */
	var UIPlaylistRow = function(definition) {
	
		var self = this
	
		// define the playlist row.
		var row = this.row = util.createElement({ 'tag' : 'li', 'appendTo' : definition.appendTo })
	
		// define a container for the columns.
		var columnContainer = this.columnContainer = util.createElement({'tag' : 'ol', 'appendTo' : row})
		
		// create an array to contain the columns.
		var columns = this.columns = {}
	
		this.id = definition.trackid
		
		// create columns.
		for ( var i in definition ) {
		
			if ( definition.hasOwnProperty(i) ) {
			
				var column = document.createElement('li')
				
				util.disableUserSelect(column)
				
				column.innerHTML = definition[i]
				
				column.className = i
				
				columns[i] = column
			
			}
		
		}
		
		util.addListener(columnContainer, 'click', (function(instance) {
	
			return function(e) {
			
				self.click(e, instance)
			
			}
		
		})(this))
	
	}
	
	/**
	 * uses the specified columns by order of name. clears the row before appending.
	 * @param columns {array} list of column names.
	 */
	UIPlaylistRow.prototype.withColumns = function(columns) {
	
		var self = this
	
		if ( columns instanceof Array ) {
		
			self.columnContainer.removeChildren()
		
			columns.forEach(function(columnName) {
			
				if ( self.columns[columnName] instanceof Element ) {
			
					self.columnContainer.appendChild(self.columns[columnName])
				}
			
			})
		
		}
		
		else return false
	
		return this
	
	}
	
	
	/**
	 * handles the click event on a playlist row.
	 * @param e {object} the event object.
	 * @param item {object} the UIPlaylistRow instance associated with this row.
	 */
	UIPlaylistRow.prototype.click = function(e, item) {
	
		item.row.addClass('selected')
	
	}
	
	/**
	 * checks that the object defines a playlist row according to the Vibe Api.
	 * @param definition {object} defines a playlist row.
	 */
	var isValidRowDefinition = function(definition) {
	
		if ( typeof definition == 'object' ) {
		
			if ( typeof definition.albumname != 'string' || typeof definition.artistname != 'string' ) return false;
			
			else if ( typeof definition.trackid !== 'string' || typeof definition.trackname !== 'string' ) return false;
			
		}
		
		else return false
	
		return true
	
	}
	
	// use EventEmitter.
	EventEmitter.augment(UIPlaylist.prototype)
		
	// define UIPlaylist module.
	return UIPlaylist

})