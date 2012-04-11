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

require(['dep/domReady','settings','util'], function (domReady,Settings,util) {

	domReady(function(){
	
		// make a global settings instance.
		window.settings = new Settings();
	
		if ( util.Browser.HasSupport.svg() )
		{
			document.body.setAttribute('class','svg');
		}
	
		function gettingStarted()
		{
			require(['UI/ModalDialogue/ModalDialogue'],function(modal){
			
				modal.createSingle({
					'title' : 'Welcome to MusicMe.',
					'body' : 'It looks like this is your first time using MusicMe on this computer. Before we can get started, we need the details of your MusicMe server. Please enter the details in the form below and press "Go."',
					'animateIn' : 'slideTop',
					'form' : {
						'name' : 'gettingstarted',
						'inputs' : [{
							'title' : 'Host',
							'name' : 'host',
							'placeholder' : 'localhost'
						},{
							'title' : 'Port',
							'name' : 'port',
							'placeholder' : '6232'
						}]
					},
					'buttons' : { 'Go' : function(){
					
						var host = document.forms['gettingstarted']['host'].value;
						
						var port = parseInt(document.forms['gettingstarted']['port'].value);
					
						if ( ! host )
						{
							host = document.forms['gettingstarted']['host'].getAttribute('placeholder');
							console.warn('Using default host.');
						}
						
						if ( ! port )
						{
							port = parseInt(document.forms['gettingstarted']['port'].getAttribute('placeholder'));
						}
						
						// set.
						settings.set('host', host);
						settings.set('port', port);
						
						this.close();
						
					}}
				});
			
			});
		}
	
		if ( typeof settings.get('host') !== 'undefined' && typeof settings.get('port') !== 'undefined' )
		{
	
			// fetch UICollection.
			require(['UI/Collection/CollectionRefactored','UI/Playlist/Playlist','api/musicme'],function(UICollection,UIPlaylist,Api){
			
				// make an api instance.
				api = new Api(settings.get('host'),settings.get('port'));
			
				api.on('error',function(){
				
					gettingStarted(1);
				
				});
			
				var musicme = document.getElementById('MusicMe');
				
				api.on('ready',function(){
				
					// make a UIPlaylist instance.
					playlist = new UIPlaylist(musicme,api);
					
					// make a UICollection instance.
					var collection = new UICollection('genre', musicme, api, playlist.element, true, true);
					
					collection.on('itemSelected',function(collectionItem){
						
						// add the item to the collection.
						playlist.add(collectionItem.type,collectionItem.id);
						
					});
				
				});
			
			});
		
		}
		else
		{
			gettingStarted();
		}
		
	});

});