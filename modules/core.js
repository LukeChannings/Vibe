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
	
		settings.set('host','channings.me');
		settings.set('port', 6232);
	
		if ( util.Browser.HasSupport.svg() )
		{
			document.body.setAttribute('class','svg');
		}
	
		// fetch UICollection.
		require(['UI/Collection'],function(UICollection){
		
			// make a UICollection instance.
			collection = new UICollection({
				appendTo : document.getElementById('MusicMe'),
				rootType : 'artist',
				dropTarget : document.getElementById('dropTarget')
			});
			
			collection.on('trackClicked',function(id){
			
				console.log(id);
			
			});
		
			collection.on('drop',function(collectionItem){
			
				console.log(collectionItem.type + ' : ' + collectionItem.id);
			
			});
		
		});
			
	});

});