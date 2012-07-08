define(['util'], function(util) {

	/**
	 * represents a playlist row.
	 * @param definition {object} defines a playlist row.
	 * @param id {string} MD5 hash for the definition.
	 */
	var PlaylistRow = function(definition) {
	
		if ( isValidDefinition(definition) ) {
	
			var self = this
			
			// set the identifier.
			this.id = definition.trackid
		
			// define the playlist row.
			var row = this.node = util.createElement({
				tag : 'li'
			})
		
			// define a container for the columns.
			var columnContainer = this.columnContainer = util.createElement({
				tag : 'ol',
				appendTo : row
			})
			
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
			
				self.onplayitem && self.onplayitem(e, self)
			})
	
		} else {
		
			throw new Error("Invalid definition - " + definition)
		}
	}

	/**
	 * uses the specified columns by order of name. clears the row before appending.
	 * @param columns {array} list of column names.
	 */
	PlaylistRow.prototype.withColumns = function(columns) {
	
		var self = this
	
		if ( columns instanceof Array ) {
		
			util.removeChildren(self.columnContainer)
		
			util.forEach(columns, function(columnName) {
			
				if ( self.columns[columnName] instanceof Element ) {
			
					self.columnContainer.appendChild(self.columns[columnName])
				}
			})
		} else {

			return false
		}
	
		return this
	}
	
	/**
	 * checks that an object defines the minimum properties to conform to a PlaylistRow specification.
	 * @param definition {object} the definition of the row.
	 */
	function isValidDefinition(definition) {
	
		if ( !util.hasProperties(definition, ['albumname', 'artistname', 'trackid', 'trackname']) ) {
			return false
		} else {
			return true
		}
	}
	
	return PlaylistRow
})