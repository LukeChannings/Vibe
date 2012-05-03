/**
 * ModelPlaylist
 * @description contains the playlist data and performs Api interactions.
 */
define(['util','Model/UndoManager'],function(util,UndoManager){

	// constructor.
	var ModelPlaylist = function(options) {
	
		if ( typeof options !== 'object' )
		{
			throw util.error("ModelPlaylist was called without an options parameter.");
			
			return;
		}
		
		if ( typeof options.withApi == 'undefined' )
		{
			throw util.error("ModelPlaylist was called without an Api instance.");
			
			return;
		}
	
		if ( typeof options.withUI == 'undefined' )
		{
			throw util.error("ModelPlaylist was called without a UI instance.");
			
			return;
		}
	
		// model stores the complete playlist items that construct a PlaylistItem.
		var model = this.model = new UndoManager('ModelPlaylist');
	
		// set the Api instance.
		var api = this.api = options.withApi;
	
		// set the UI instance.
		var ui = this.ui = options.withUI;

		// redraw the UI with the persistent storage.
		ui.redraw(model.value(), this.info);

	}
	
	/**
	 * add
	 * @description add an item to the Playlist model.
	 * @param type (string) - the type of item to be added. (e.g. genre, artist, album, etc.)
	 * @param id (string) - the unique identifier for the item. (Usually an MD5 hash.)
	 * @param callback (function) - call the function when done.
	 */
	ModelPlaylist.prototype.add = function(type, id, callback) {
	
		var self = this;
	
		getItems.call(this,type,id,function(items){
		
			self.model.push.apply(this,items);
			
			self.ui.redraw(self.model.value());
			
			callback();
			
		});
	
	}
	
	/**
	 * undo
	 * @description reverse the last addition to the playlist.
	 */
	ModelPlaylist.prototype.undo = function(n) {
	
		this.model.undo(n);
		
		this.ui.redraw(this.model.value());
	
	}
	
	/**
	 * redo
	 * @description redo an undone change to the playlist.
	 */
	ModelPlaylist.prototype.redo = function(n) {
	
		this.model.redo(n);
		
		this.ui.redraw(this.model.value());
	
	}
	
	/**
	 * clear
	 * @description flushes the model, localStorage and clears the UI.
	 */
	ModelPlaylist.prototype.clear = function() {
	
		this.model.clear();
		
		this.ui.list.removeChildren();
	
	}

	/**
	 * getItems
	 * @description fetches the items for the corresponding type and id.
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
				if ( typeof callback == 'function' ) callback(tracks);
			
			});
		
		}
		
		else throw util.error("Invalid type used in getItems.","REF_ERR");
	}
	
	return ModelPlaylist;

});