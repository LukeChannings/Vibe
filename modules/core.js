/**
 * MusicMe
 * @description Official MusicMe Web App.
 */

// requirejs configuration.
require.config({
	baseUrl: './modules/',
	paths: {
		'dep' : './dependencies'
	}
});

require(['dep/domReady','settings','player'], function (domReady,Settings,Player) {

	domReady(function(){
	
		// settings.
		window.settings = new Settings();

		player = new Player();

		// begin UI initialisation.
		require(['UI/Collection','UI/Player','UI/Playlist'],function(UICollection,UIPlayer,UIPlaylist){
		
			collection = new UICollection({
				'rootType' : 'Artist'
			});

			collection.on('addTrackToPlaylist',function(id){
			
				player.add(id);
			
			});

		});

	});

});