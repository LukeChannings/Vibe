define(function(){

	/**
	 * Util
	 * @description series of important utility methods.
	 */
	var Util = {
		addListener : function(element,listenFor,callback){
		
			if ( document.addEventListener )
			{
				element.addEventListener(listenFor,callback,false);
			}
			else
			{
				element.attachEvent('on' + listenFor, callback);
			}
		
		},
		removeListener : function(element,listenFor,dispatch){
		
			if ( document.removeEventListener )
			{
				element.removeEventListener(listenFor,dispatch,false);
			}
			else
			{
				element.detachEvent(listenFor,dispatch);
			}
		
		},
		removeNode : function(node){
		
			// mercilessly destroy the bitch.
			node.parentNode.removeChild(node);
		
		},
		BrowserHasSupport : {
			dragAndDrop : function() {
				
				if ( 'draggable' in document.createElement('div') ) return true;

				else return false;
			},
			svg : function() {
			
				return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
			}
		},
		connectAPI : function(host,port,callback) {
		
			var self = this;
		
			require(['modules/api/api'],function(API){
			
				api = new API(settings.get('host'),settings.get('port'));
			
				ee.on('API_CONNECTED',function(){
				
					console.log("API connected.");
				
					if ( callback ) callback();
				
				});
				
				ee.on('API_CONNECTION_FAILED',function(){
				
					self.Dialogue.firstRun("Connection Failed. Please try again.");
				
				});
			
			});
		},
		Dialogue : {
			firstRun : function(title,body,callback)
			{
				dialogue.createDialogue({
					"title" : title || "Welcome to MusicMe",
					"body" : body || "Before we can get started some basic information about your MusicMe server is required.",
					"alignment" : "justify",
					"form" : {
						"name" : "getting_started",
						"inputs" : [{
							"name" : "host",
							"title" : "Host",
							"placeholder" : "localhost"
						},{
							"name" : "port",
							"title" : "Port",
							"placeholder" : 6232,
							"type" : "number"
						}]
					},
					"buttons" : {"Connect" : function(){
						
						var host = document.forms['getting_started']['host'].value;
						var port = parseInt(document.forms['getting_started']['port'].value);
						
						// check that the host and port are defined.
						if ( host && port )
						{
							// set the host and port.
							settings.set('host',host);
							settings.set('port',port);
							
							// connect to the API.
							api = connectAPI(host,port);
							
							// close the dialogue.
							this.destroy();
							
						}
						else
						{
							alert("A host and port need to be specified.");
						}
						
					}}
				});
			}
		},
		Construct : {
			collection : function(){
				
				// fetch the UICollection module.
				require(['modules/UI/Collection'],function(UICollection){
				
					// make an instance.
					UI.Collection = new UICollection(api);
				
					UI.MusicMe.appendChild(UI.Collection.element);
				
				});
				
			},
			playlist : function(){},
			player : function(){}
		}
	}

	return Util;

});