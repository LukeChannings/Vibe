/**
 * MusicMe
 * @description Official MusicMe Web App.
 */

// requirejs configuration.
require.config({baseUrl: './modules/'});

require(['dependencies/domReady','Model/Settings','util','Api/MusicMe'], function (domReady, Settings, util, Api) {

	domReady(function(){
	
		// make a global settings instance.
		window.settings = new Settings();
	
		// get the musicme element.
		var musicme = document.getElementById('MusicMe'),
			api;
		
		var init = function()
		{
			if ( settings.get('host') && settings.get('port') )
			{
				// make an Api instance.
				api = new Api();
			
				// listen for connection.
				api.once('connected', initUI);
					
				// listen for error.
				api.on('error', promptConnectionString);
				
				// listen for disconnection.
				api.on('disconnected',function(){
					
					console.log("Api lost connection.");
					
				});
			}
			else
			{
				promptConnectionString();
			}
			
		}
		
		var initUI = function(){
			
			// fetch previous node.
			var collection = document.getElementById('UICollection'),
				playlist = document.getElementById('UIPlaylist'),
				overlay = document.getElementById('ModalDialogueOverlay');
			
			// check for previous nodes and remove them.
			if ( collection ) collection.removeNode();
			if ( playlist ) playlist.removeNode();
			if ( overlay ) overlay.removeNode();
			
			// require the UI partials.
			require(['UI/Collection/Collection','UI/Playlist/Playlist','Model/Playlist'],function(UICollection,UIPlaylist,ModelPlaylist){
			
				var playlist = new UIPlaylist({appendTo : musicme, useControlBar : true, useInfoBar : true});
			
				playlistModel = new ModelPlaylist({withUI : playlist, withApi : api});
			
				var collection = new UICollection({withApi : api, appendTo : musicme, usingSearch : true, usingInfoBar : true, dragAndDropElement: playlist.node, withRootType : 'genre'});
			
				collection.on('itemSelected',function(item){
				
					playlistModel.add(item.type,item.id);
				
				});
			
			});
			
		}
		
		var promptConnectionString = function(){
		
			var MDD = {};
			
			if ( arguments.callee.done )
			{
				MDD.title = "Unable to connect.";
				
				MDD.body = "MusicMe was unable to establish a connection to " + settings.get('host') + ':' + settings.get('port') + ". If the specified Url is incorrect feel free to change it below, otherwise please troubleshoot your MusicMe server.";
				
			}
			else
			{
				MDD.title = "Welcome to MusicMe";
				
				MDD.body = "It looks like this is your first time using MusicMe on this computer. Before we can get started, we need the details of your MusicMe server. Please enter the details in the form below and press 'Go.'";
			}
			
			MDD.form = {
				'name' : 'gettingstarted',
				'inputs' : [{
					'title' : "Host:",
					'name' : 'host',
					'placeholder' : settings.get('host') || 'localhost'
				},{
					'title' : "Port:",
					'name' : 'port',
					'placeholder' : settings.get('port') || 6232
				}]
			};
		
			MDD.buttons = {'Go' : function(){
			
				// get the settings from the form.
				var host = document.forms['gettingstarted']['host'].value || document.forms['gettingstarted']['host'].placeholder || 'localhost';
				var port = parseInt(document.forms['gettingstarted']['port'].value) || document.forms['gettingstarted']['port'].placeholder ||6232
			
				// set the settings.
				settings.set('host', host);
				settings.set('port', port);
			
				// close the form.
				this.close();
				
				// reconnect the Api.
				if ( api ) api.connect();
				else init();

			}};
		
			// require the modal dialogue component.
			require(['UI/ModalDialogue/ModalDialogue'],function(dialogue){
			
				dialogue.createSingle(MDD);
			
			});
		
			arguments.callee.done = true;
		
		}
		
		var disconnected = function(){}
		
		init();
		
	});

});