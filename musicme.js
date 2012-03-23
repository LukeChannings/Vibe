/**
 * MusicMe
 * @description Official MusicMe Web App.
 */
require(['modules/domReady','modules/settings','modules/EventEmitter','modules/socket.io'], function (domReady,Settings,EventEmitter) {

	domReady(function(){
		
		// make a global EventEmitter object.
		window.ee = new EventEmitter();
		
		// make a global settings object.
		window.settings = new Settings();
		
		// get audio API.
		require(['modules/audio/audio'],function(MMAudio){
		
			// wait for SM2 to load...
			ee.on('audioReady',function(){
			
				// make an audio instance.
				var audio = new MMAudio();
				
				document.querySelector("#play").addEventListener("click",function(){
				
					var id = document.querySelector("#track_id").value;
				
					audio.addAndPlay(id);
				
				},false);
				
				document.querySelector('#stop').addEventListener('click',function(){
				
					audio.getCurrent().stop();
				
				},false);
				
			});
			
		});
		
		if ( !! settings.get('host') && !! settings.get('port') )
		{
			var socket = io.connect('http://' + settings.get('host') + ':' + settings.get('port'));
		}
		else
		{
		
			require(['modules/modalDialogue/modal'],function(ModalDialogue){
			
				var modalDialogue = new ModalDialogue();
			
				var defaults = {
					"host" : "localhost",
					"port" : "6232"
				};
			
				modalDialogue.createDialogue({
					"title" : "Welcome to MusicMe.",
					"body" : [
						"<p>It looks like this is the first time you've run MusicMe. Before you can get started you need to fill out some basic information that will allow this app to run.</p>",
						"<p>This part is fairly simple, just type in the name of the host that you run your MusicMe daemon from, and if you've changed the port fill out your own. (Otherwise use the default port.)</p>"	
					],
					"form" : {
						"name" : "settings",
						"inputs" : [
							{
								"title" : "Host:",
								"type" : "text",
								"name" : "host",
								"default" : defaults.host
							},
							{
								"title" : "Port:",
								"type" : "text",
								"name" : "port",
								"default" : defaults.port
							}
						]
					},
					"buttons" : {
						"Begin" : function(){
							
							// get the form.
							var form = document.forms["settings"];
							
							// get the host.
							var host = form["host"].value || defaults.host;
							
							// get the port.
							var port = parseInt(form["port"].value) || defaults.port;
							
							// save the settings.
							settings.set('port', port);
							settings.set('host', host);
							
							// close the dialogue.
							this.destroy();
						
						}
					}
				});
			
			});
		
		}
		
	});

});