/**
 * PlaylistModel
 * @description contains the playlist data and performs Api interactions.
 */
define(['util'],function(){

	// constructor.
	var PlaylistModel = function(options){
	
		if ( typeof options !== 'object' )
		{
			throw util.error("PlaylistModel was called without an options parameter.");
			
			return;
		}
		
		if ( typeof options.withApi == 'undefined' )
		{
			throw util.error("PlaylistModel was called without an Api instance.");
			
			return;
		}
	
		if ( typeof options.withUI == 'undefined' )
		{
			throw util.error("PlaylistModel was called without a UI instance.");
			
			return;
		}
	
		// model stores the complete playlist items that construct a PlaylistItem.
		var model = this.model = load();
	
		// set the Api instance.
		var api = this.api = options.withApi;
	
		// set the UI instance.
		var ui = this.ui = options.withUI;
	
		if ( model.length !== 0 ) ui.redraw(model);
	
	}
	
	/**
	 * add
	 * @description add an item to the Playlist model.
	 * @param type (string) - the type of item to be added. (e.g. genre, artist, album, etc.)
	 * @param id (string) - the unique identifier for the item. (Usually an MD5 hash.)
	 */
	PlaylistModel.prototype.add = function(type, id){
	
		var self = this;
	
		getItems.call(this,type,id,function(items){
		
			items.forEach(function(item){
		
				self.model.push(item);
			
				self.ui.add(item);
			
			});
		
			save.call(self);
		
		});
	
	}
	
	/**
	 * clear
	 * @description flushes the model, localStorage and clears the UI.
	 */
	PlaylistModel.prototype.clear = function(){
	
		this.model = [];
		
		save.call(this);
	
		this.ui.node.removeChildren();
	
	}
	
	/**
	 * getItem
	 * @description returns a playlist item object.
	 * @param n (int) - the playlist item index.
	 */
	PlaylistModel.prototype.getItem = function(n){}
	
	/**
	 * getItems
	 * @description fetches the items for the corresponding type and id.
	 * @param type (string) - The type of items to get.
	 * @param id (string) - The unique identifier for the type.
	 */
	var getItems = function(type,id,callback)
	{
		if ( type == 'genre' )
		{
			this.api.getTracksInGenre(id,function(tracks){

				callback(tracks);

			});
		}
		else if ( type == 'artist' )
		{
			this.api.getTracksByArtist(id,function(tracks){

				callback(tracks);

			});
		}
		else if ( type == 'album' )
		{
			this.api.getTracksInAlbum(id,function(tracks){

				callback(tracks);

			});
		}
		else if ( type == 'track' )
		{
			this.api.getTrack(id,function(tracks){

				callback(tracks);

			});
		}
	}
	
	/**
	 * load.
	 * @description load the playlist from localStorage if it exists. (otherwise returns an empty array.)	 */
	function load(){
	
		if ( localStorage.musicmePlaylist )
		{
			try
			{
				return JSON.parse(localStorage.musicmePlaylist);
			}
			catch(ex){
			
				console.warn("localStorage.musicmePlaylist is corrupt.");
				
				return [];
			}
		}
		else
		{
			return [];
		}
	}
	
	/**
	 * save.
	 * @param save the playlist model to localStorage.
	 */
	function save(){
	
		if ( localStorage )
		{
			localStorage.musicmePlaylist = JSON.stringify(this.model);
		}
	
	}
	
	return PlaylistModel;

});