define(['util', 'dependencies/EventEmitter'], function(util, EventEmitter) {

	/**
	 * represents a playlist row.
	 * @param definition {object} defines a playlist row.
	 * @param id {string} MD5 hash for the definition.
	 */
	var UIPlaylistRow = function(definition) {
	
		if ( isValidDefinition(definition) ) {
	
			var self = this
			
			// set the identifier.
			this.id = definition.trackid
		
			// define the playlist row.
			var row = this.row = util.createElement({ 'tag' : 'li', 'appendTo' : definition.appendTo })
		
			// define a container for the columns.
			var columnContainer = this.columnContainer = util.createElement({'tag' : 'ol', 'appendTo' : row})
			
			// create an array to contain the columns.
			var columns = this.columns = {}
		
			// create columns.
			for ( var i in definition ) {
			
				if ( definition.hasOwnProperty(i) ) {
				
					var column = document.createElement('li')
					
					util.disableUserSelect(column)
					
					column.innerHTML = ( i == 'tracklength' ) ? util.formatTime(definition[i]) : definition[i]
					
					column.className = i
					
					columns[i] = column
				}
			}
			
			util.addListener(row, 'dblclick', function(e) {
			
				self.emit('playItem', e, self)
			})
		}
		
		else {
		
			throw {
				name : "DEF_ERR",
				message : "Invalid definition - " + definition
			}
		}
	}
	
	EventEmitter.augment(UIPlaylistRow.prototype)
	
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
	 * checks that an object defines the minimum properties to conform to a UIPlaylistRow specification.
	 * @param definition {object} the definition of the row.
	 */
	function isValidDefinition(definition) {
	
		if ( typeof definition == 'object' ) {
			
			if ( typeof definition.albumname != 'string' || typeof definition.artistname != 'string' ) return false;
				
			else if ( typeof definition.trackid !== 'string' || typeof definition.trackname !== 'string' ) return false;
				
		}
			
		else return false
		
		return true
	
	}
	
	return UIPlaylistRow
})