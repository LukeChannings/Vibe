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
		
		if ( settings.get('host') )
		{
			var socket = io.connect('http://' + settings.get('host') + ':' + settings.get('port'));
		}
		else
		{
		
			require(['modules/modalDialogue/modal'],function(ModalDialogue){
			
				var modalDialogue = new ModalDialogue();
			
				modalDialogue.createDialogue({
					"title" : "First Time?",
					"body" : [
						"<p>It looks like this is the first time you've run MusicMe,</p>",
						"<p>in order for you to get started we'll just need you to enter</p>",
						"<p>the details of your MusicMe server. Thank You!</p>"	
					],
					"form" : {
						"name" : "settings",
						"inputs" : [
							{
								"title" : "Host",
								"type" : "text",
								"name" : "host",
								"placeholder" : "example.com"
							},
							{
								"title" : "Port",
								"type" : "text",
								"name" : "port",
								"placeholder" : "6232"
							}
						]
					},
					"buttons" : {
						"submit" : function(){
							
							// get the form.
							var form = document.forms["settings"];
							
							// get the host.
							var host = form["host"].value || form["host"].getAttribute("placeholder");
							
							// get the port.
							var port = parseInt(form["port"].value) || parseInt(form["port"].getAttribute("placeholder"));
							
							// save the settings.
							settings.set('port',port);
							settings.set('host',host);
						}
					}
				});
			
			});
		
		}
		
	});

});