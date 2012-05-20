/**
 * ModelPlaylist
 * @description contains the playlist data and performs Api interactions.
 */
define(['util','Model/UndoManager'], function(util,UndoManager){

	// constructor.
	var ModelPlaylist = function(options) {
	
		if ( typeof options !== 'object' )
		{
			throw util.error("ModelPlaylist was called without an options parameter.")
			
			return
		}
		
		if ( typeof options.withApi == 'undefined' )
		{
			throw util.error("ModelPlaylist was called without an Api instance.")
			
			return
		}
	
		if ( typeof options.withUI == 'undefined' )
		{
			throw util.error("ModelPlaylist was called without a UI instance.")
			
			return
		}
	
		var self = this
	
		// model stores the complete playlist items that construct a PlaylistItem.
		var model = this.model = new UndoManager('ModelPlaylist')
	
		this.playlistDuration = 0
	
		this.index = 0
	
		this.playingNode = null
	
		// set the Api instance.
		var api = this.api = options.withApi
	
		// set the UI instance.
		var ui = this.ui = options.withUI

		// redraw the UI from persistent storage.
		ui.redraw(model.value())

		ui.on('infoBarLoaded', function() {

			self.updateInfo()
		
		})

	}
	
	/**
	 * updates the playlist duration in the playlist's info bar.
	 */
	ModelPlaylist.prototype.updateInfo = function() {
	
		var self = this
	
		// reset the playlist to zero seconds.
		this.playlistDuration = 0
	
		// iterate the playlist items.
		this.model.value().forEach(function(track) {
		
			// increment the playlist by the duration of the current playlist item.
			self.playlistDuration += track.tracklength
		
		})
	
		// determine the units of time to describe the playlist duration.
		var seconds = Math.ceil(this.playlistDuration) % 60,
			minutes = Math.ceil(this.playlistDuration / 60),
			hours = Math.floor(minutes / 60),
			info = '' // string to contain the human-readable duration.
		
		if ( hours > 0 ) minutes = minutes % 60
		
		// determine the presentation of hours.
		if ( hours !== 0 ) {
			hours = ( hours == 1 ) ? hours + ' hour, ' : hours + ' hours, '
		} else hours = ''
		
		// determine the presentation of minutes.
		if ( minutes !== 0 ) {
			minutes = ( minutes == 1 ) ? minutes + ' minute and ' : minutes + ' minutes and '
		} else minutes = ''
		
		// determine the presentation of seconds.
		if ( seconds !== 0 ) {
			seconds = ( seconds == 1) ? seconds + ' second.' : seconds + ' seconds.'
		} else seconds = ( hours == '' && minutes == '' ) ? 'No tracks.' : '0 seconds.'
		
		// concatenate the playlist durations.
		var info = hours + minutes + seconds
		
		// update the info bar.
		this.ui.infoBar.update(info)

	}
	
	/**
	 * add an item to the Playlist model.
	 * @param type (string) - the type of item to be added. (e.g. genre, artist, album, etc.)
	 * @param id (string) - the unique identifier for the item. (Usually an MD5 hash.)
	 * @param callback (function) - call the function when done.
	 */
	ModelPlaylist.prototype.add = function(type, id, callback) {
	
		var self = this
	
		getItems.call(this, type, id, function(items) {

			self.model.push.apply(this, items)
			
			self.ui.addRows(items)
			
			self.updateInfo()
			
			if ( typeof callback == 'function' ) callback()
			
		})
	
	}
	
	/**
	 * reverse the last addition to the playlist.
	 */
	ModelPlaylist.prototype.undo = function(n) {
	
		this.model.undo(n)
		
		this.updateInfo()
		
		this.ui.redraw(this.model.value())
	
	}
	
	/**
	 *  redo an undone change to the playlist.
	 */
	ModelPlaylist.prototype.redo = function(n) {
	
		this.model.redo(n)
		
		this.updateInfo()
		
		this.ui.redraw(this.model.value())
	
	}
	
	/**
	 * clear
	 * @description flushes the model, localStorage and clears the UI.
	 */
	ModelPlaylist.prototype.clear = function() {
	
		this.model.clear()
	
		this.updateInfo()
		
		this.ui.list.removeChildren()
	
		this.ui.selectedPlaylistItems = []
	
		this.index = 0
	
		this.ui.playingNode = null
	
	}

	/**
	 * sets the playlist index.
	 */
	ModelPlaylist.prototype.setIndex = function(n, node) {
	
		this.index = n
	
		if ( this.ui.playingNode ) this.ui.playingNode.removeClass('playing')
		
		node.addClass('playing')
		
		this.ui.playingNode = node
	
	}
	
	/**
	 * return the current playlist object or the object at index n.
	 * @param n - index for the object. (optional, defaults to the current index.)
	 */
	ModelPlaylist.prototype.getItem = function(n) {
	
		return this.model.getItemAtIndex(this.index)
	
	}

	/**
	 * return the index playlist index of the given track id.
	 * @param trackid {string} MD5 hash to identify the track.
	 */
	ModelPlaylist.prototype.indexOfTrackId = function(trackid) {
	
		var tracks = this.model.value()
	
		for ( var i = 0; i < tracks.length; i++ ) {
		
			if ( tracks[i].trackid == trackid ) return i
		
		}
	
		return -1
	
	}

	/**
	 * fetche the items for the corresponding type and id.
	 * @param type (string) - The type of items to get.
	 * @param id (string) - The unique identifier for the type.
	 */
	var getItems = function(type,id,callback) {
	
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
			this.api[types[type]](id,function(tracks){
			
				// return the results to the callback.
				if ( typeof callback == 'function' ) callback(tracks)
			
			})
		
		}
		
		else throw util.error("Invalid type used in getItems.","REF_ERR")
	}
	
	return ModelPlaylist

})