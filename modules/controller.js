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
	
		// make an Api instance.
		api = new Api();
		
		// get the musicme element.
		var musicme = document.getElementById('MusicMe');
		
		var initUI = function(){
			
			// check for a previous collection.
			if ( document.getElementById('UICollection') ) document.getElementById('UICollection').removeNode();
			
			// check for a previous playlist.
			if ( document.getElementById('UIPlaylist') ) document.getElementById('UIPlaylist').removeNode();
			
			if ( document.getElementById('ModalDialogueOverlay') ) document.getElementById('ModalDialogueOverlay').removeNode();
			
			// require the UI partials.
			require(['UI/Collection/Collection','UI/Playlist/Playlist'],function(UICollection,UIPlaylist){
			
				var playlist = new UIPlaylist({withApi : api, appendTo : musicme});
			
				var collection = new UICollection({withApi : api, appendTo : musicme, usingSearch : true, usingInfoBar : true, dragAndDropElement: playlist.element});
			
				collection.on('itemSelected',function(item){
				
					playlist.add(item.type,item.id);
				
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
				var host = document.forms['gettingstarted']['host'].value || 'localhost';
				var port = parseInt(document.forms['gettingstarted']['port'].value) || 6232
			
				// set the settings.
				settings.set('host', host);
				settings.set('port', port);
			
				// close the form.
				this.close();
				
				// reconnect the Api.
				api.connect();
			
			}};
		
			// require the modal dialogue component.
			require(['UI/ModalDialogue/ModalDialogue'],function(dialogue){
			
				dialogue.createSingle(MDD);
			
			});
		
			arguments.callee.done = true;
		
		}
		
		var disconnected = function(){}
		
		// listen for connection.
		api.once('connected', initUI);
		
		// listen for error.
		api.on('error', promptConnectionString);
	
		// listen for disconnection.
		api.on('disconnected',function(){
		
			console.log("Api lost connection.");
		
		});
	
	});

});