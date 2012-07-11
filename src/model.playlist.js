/**
 * ModelPlaylist
 * @description contains the playlist data and performs Api interactions.
 */
define(['util','model.undoManager'], function(util, UndoManager) {

	/**
	 * creates an instance of ModalPlaylist.
	 * @param options {object} options to configure the instance with.
	 */
	var ModelPlaylist = function(options) {
	
		if ( !util.hasProperties(options, ['withApi', 'withUI']) ) {
			throw new Error("The playlist model was not properly configured.")
		}

		// reference to current object.
		var self = this,
		
		// model stores the complete playlist items that construct a PlaylistItem.
		model = this.model = new UndoManager().withPersistence('ModelPlaylist'),
		
		// api property stores the Vibe Api instance.
		api = this.api = options.withApi,
		
		// ui property stores the UIPlaylist instance.
		ui = this.ui = options.withUI,
		
		// duration stores the duration of all items in the playlist in seconds.
		duration = this.duration = 0,
		
		// index stores the index of the currently playing item.
		index = this.index = 0
		
		// redraw the UI from persistent storage.
		ui.redraw(model)

		if ( typeof options.onload == 'function' ) {
			options.onload(self)
		}
	}
	
	/**
	 * updates the playlist duration in the playlist's info bar.
	 */
	ModelPlaylist.prototype.updateInfo = function() {
	
		var self = this
	
		// reset the playlist to zero seconds.
		this.duration = 0
	
		// iterate the playlist items.
		util.forEach(this.model, function(track) {
		
			// increment the playlist by the duration of the current playlist item.
			self.duration += track.tracklength
		})
		
		// update the info bar.
		if ( this.model.length == 0 ) {
			this.ui.infoBar.update("No tracks.")
		} else {
			this.ui.infoBar.update(this.model.length + " tracks (" + util.expandTime(this.duration) + ")")
		}
	}
	
	/**
	 * updates the user feedback for the undo and redo buttons.
	 * if it is not possible to perform an operation, the button
	 * will become disabled.
	 */
	ModelPlaylist.prototype.updateButtons = function() {
	
		if ( this.model.canUndo() ) {
		
			util.removeClass(
				this.ui.buttons.buttons.undo.node,
				'disabled'
			)

		} else {

			util.addClass(
				this.ui.buttons.buttons.undo.node,
				'disabled'
			)
		}

		if ( this.model.canRedo() ) {
		
			util.removeClass(
				this.ui.buttons.buttons.redo.node,
				'disabled'
			)
		} else {

			util.addClass(
				this.ui.buttons.buttons.redo.node,
				'disabled'
			)
		}
		
		if ( this.model.length == 0 ) {
		
			util.addClass(
				this.ui.buttons.buttons.clear.node,
				'disabled'
			)
		} else {
			util.removeClass(
				this.ui.buttons.buttons.clear.node,
				'disabled'
			)
		}
		
		if ( this.model.length == 0 ) {
		
			util.addClass(
				this.ui.listContainer,
				"noItems"
			)
		} else {
			util.removeClass(
				this.ui.listContainer,
				"noItems"
			)
		}
	}
	
	/**
	 * add an item to the Playlist model.
	 * @param type (string) - the type of item to be added. (e.g. genre, artist, album, etc.)
	 * @param id (string) - the unique identifier for the item. (Usually an MD5 hash.)
	 * @param callback (function) - call the function when done.
	 */
	ModelPlaylist.prototype.add = function(type, id, callback) {
	
		var self = this,
			index = window.dropIndex,
			insertAfter = this.ui.list.node.childNodes[index]
	
		getItems.call(this, type, id, function(items) {

			if ( typeof index == 'number' ) {
			
				items.unshift(index, 0)
				
				self.model.splice.apply(self.model, items)
				
				items.splice(0,2)
				
			}
			else {
			
				self.model.push.apply(self.model, items)
			}
			
			self.ui.addRows(items, insertAfter)
			
			if ( typeof callback == 'function' ) {
				callback()
			}
		})
	}
	
	/**
	 * reverse the last addition to the playlist.
	 */
	ModelPlaylist.prototype.undo = function(n) {
	
		this.model.undo(n)
		
		this.ui.redraw(this.model)
	}
	
	/**
	 *  redo an undone change to the playlist.
	 */
	ModelPlaylist.prototype.redo = function(n) {
	
		this.model.redo(n)
		
		this.ui.redraw(this.model)
	}
	
	/**
	 * clear
	 * @description flushes the model, localStorage and clears the UI.
	 */
	ModelPlaylist.prototype.clear = function() {
	
		this.model.clear()
	
		this.ui.redraw(this.model)
	
		this.ui.selectedPlaylistItems = []
	
		this.index = 0
	
		this.ui.playingNode = null
	}

	/**
	 * sets a new item index. Configures a new playing node.
	 */
	ModelPlaylist.prototype.setIndex = function(n, node) {
	
		if ( n < 0 || n > this.model.length ) {
		
			n = 0
			
			node = null
		}
	
		// set the index.
		this.index = n
		
		// remove the playing class on the current node.
		if ( this.ui.playingNode !== null && typeof this.ui.playingNode == 'object' ) {
			util.removeClass(this.ui.playingNode, 'playing')
		}
		
		// add the playing class on the new item.
		if ( node && typeof node == 'object' ) {
			util.addClass(node, 'playing')
		}
		// set the new node.
		this.ui.playingNode = node
	}

	/**
	 * return the index playlist index of the given track id.
	 * @param trackid {string} MD5 hash to identify the track.
	 */
	ModelPlaylist.prototype.indexOfTrackId = function(trackid) {
	
		// fetch an array of all tracks in the playlist.
		var tracks = this.model
	
		// iterate.
		for ( var i = 0; i < tracks.length; i++ ) {
		
			// compare the current item's trackid with the trackid sent.
			// if the trackids match, return the index at which they match.
			if ( tracks[i].trackid == trackid ) return i
		}
	
		// if no trackids match, return -1 to signal the item is not in the playlist.
		return -1
	}

	/**
	 * return the current playlist object or the object at index n.
	 * @param n - index for the object. (optional, defaults to the current index.)
	 */
	ModelPlaylist.prototype.getItem = function(n) {
	
		var index = ( typeof n == 'number' ) ? n : this.index
	
		return this.model[index]
	}

	/**
	 * fetches the items for the corresponding type and id.
	 * @param type (string) - The type of items to get.
	 * @param id (string) - The unique identifier for the type.
	 */
	var getItems = function(type, id, callback) {
	
		// map the type to the Api method.
		var types = {
			'genre' : 'getTracksInGenre',
			'artist' : 'getTracksByArtist',
			'album' : 'getTracksInAlbum',
			'track' : 'getTrack'
		}
	
		// check that there is a corresponding method to the specified type.
		if ( types[type] ) {
		
			// call the Api method.
			this.api[types[type]](id,function(tracks) {
			
				// return the results to the callback.
				if ( typeof callback == 'function' ) callback(tracks)
			})
		}
		
		else throw new Error("Invalid type used in getItems.","REF_ERR")
	}
	
	return ModelPlaylist
})