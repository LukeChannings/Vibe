/**
 * MusicMe Collection
 * @description Provides an interface for representing the MusicMe collection.
 */
define(['util','require','dependencies/EventEmitter','api/musicme','UI/Widget/TreeList/TreeList'],function(util, require, EventEmitter, Api, TreeList){

	// include stylesheet.
	util.registerStylesheet(require.toUrl('./Collection.css'));
	
	// constructor.
	function Collection(options){
	
		// usual lark.
		var self = this;
	
		// make sure that options exists to prevent reference errors.
		var options = this.options = options || {};
	
		// make an Api instance.
		var api = this.api = new Api(settings.get('host'),settings.get('port'));
	
		// create the UICollection element.
		var element = this.element = document.createElement('div');
	
		if ( typeof self.options.dropTarget !== 'undefined' &&  self.options.dropTarget instanceof Element )
		{
			self.useDragAndDrop = true;
		}
		else
		{
			self.useDragAndDrop = false;
		}
	
		// set the Id.
		element.setAttribute('id','UICollection');
	
		// append the element.
		(options.appendTo || document.body).appendChild(element);
	
		// set loading class.
		element.setAttribute('class','loading');
	
		// wait for the API to connect.
		api.once('ready',function(){
			
			element.removeAttribute('class');
			
			// determine the Api method.
			var method = ( /(artist|album|genre|track)/i.test(options.rootType) ) ? options.rootType : 'artist';
			
			self.populate(method);
			
		});
		
		// if the Api couldn't connect.
		api.once('error',function(){
		
			// log the error.
			console.log("UICollection failed to create an Api instance. Cannot continue.");
		
			// emit the error.
			self.emit('error','ERR_CONNECT');
		
		});
	
		// Drag And Drop
		// If data from outside the browser is dropped the event 'dataDrop' is emitted
		// with the mime type of the data and the base64-encoded binary data.
		// If a collection item is dragged to the drop target the regular itemSelected event
		// is fired with the regular collectionItem object.
		if ( self.useDragAndDrop )
		{
		
			// dragstart.
			// triggered when a draggable item is dragged.
			self.dragStart = function(e){
			
				// set dnd mode.
				e.dataTransfer.dropEffect = 'copy';
			
				// determine the target node.
				var target = e.target || e.srcElement;
			
				// get the collection type.
				var type = target.parentNode.getAttribute('class').match(/(genre|artist|album|track)/)[0];
				
				// get the id of the collection type.
				var id = target.getAttribute('data-id');
			
				e.dataTransfer.setData('Text', JSON.stringify({
					'id' : id,
					'type' : type
				}));
			
			}
		
			// dragover
			// triggered when the dragged item enters the drop target.
			util.addListener(options.dropTarget,'dragover',function(e){
				
				if (e.preventDefault) e.preventDefault();
				
				e.dataTransfer.effectAllowed = 'all';
				
				return false;
				
			});
			
			// dragenter
			// triggered when the item enters the drop target.
			util.addListener(options.dropTarget,'dragenter',function(e){
			
				(e.target || e.srcElement).setAttribute('class','dragentered');
			
				return false;
			
			});
			
			// dragleave
			// triggered when the dragged item leaves the drop target.
			util.addListener(options.dropTarget,'dragleave',function(e){
				
				(e.target || e.srcElement).removeAttribute('class');
				
			});
			
			// drop
			// triggered when the dragged item is dropped within the drop target.
			util.addListener(options.dropTarget,'drop',function(e){
				
				var target = e.target || e.srcElement;
				
				target.removeAttribute('class');
				
				if ( e.dataTransfer.getData('Text') )
				{
					self.emit('itemSelected',JSON.parse(e.dataTransfer.getData('Text')));
				}
				else
				{
				
					var reader = new FileReader();
				
					for ( var i = 0; i < e.dataTransfer.files.length; i++ )
					{
					
						var type = e.dataTransfer.files[i].type;
					
						reader.readAsDataURL(e.dataTransfer.files[i]);
					
						reader.onloadend = function(e){
						
							var data = e.currentTarget.result.replace('data:' + type + ';base64,','');
						
							self.emit('dataDrop',type,data);
						
						}
						
					}
					
				}
				
				if ( e.preventDefault ) e.preventDefault();
				
			});
			
		}
	
	}
	
	Collection.prototype.populate = function(method)
	{
		
		var self = this;
		
		// get the top level data..
		this.api['get' + method[0].toUpperCase() + method.slice(1) + 's'](function(data){
		
			// remap genre.
			if ( method == 'genre' )
			{
				data.forEach(function(genre){
					
					genre.name = genre.genre;
					
					genre.id = encodeURIComponent(genre.genre);
					
				});
			}
		
			if ( self.options.appendTo.getElementsByTagName('ol')[0] )
			{
				self.options.appendTo.getElementsByTagName('ol')[0].removeNode();
			}
			
			var options = {
				'appendTo' : self.element,
				'isRootNode' : true,
				'customClass' : method,
				'setAttributes' : []
			}
			
			if ( self.useDragAndDrop )
			{
				options.setAttributes.push(['draggable','true']);
				options.dragStartMethod = self.dragStart;
			}
			
			// create the tree list.
			var list = new TreeList(data,options);
			
			// itemClicked
			// handles populating sub-items.
			list.on('itemClicked',function(item,isPopulated){
			
				if ( ! isPopulated )
				{
					// get the item id.
					var id = item.getAttribute('data-id');
				
					// get the parent class.
					var type = item.parentNode.getAttribute('class').match(/(genre|artist|album|track)/);
				
					// determine the method.
					type = ( type[0] ) ? type[0] : 'artist';
				
					var options = {
						'appendTo' : item,
						'customClass' : self.api.getSubtype(type),
						'setAttributes' : []
					};
				
					if ( self.useDragAndDrop )
					{
						options.setAttributes.push(['draggable','true']);
						options.dragStartMethod = self.dragStart;
					}
					
					if ( self.api.getMethodFor(type) )
					{
						self.api[self.api.getMethodFor(type)](id,function(items){
						
							new TreeList(items,options);
						
						});
					}
					else
					{
						self.emit('itemSelected',{
							'type' : type,
							'id' : id
						});
					}
				
				}
			
			});
		
			// itemDoubleClicked
			// handles a double click event on a treelist item.
			list.on('itemDoubleClicked',function(item){
			
				self.emit('itemSelected',{
					'id' : item.getAttribute('data-id'),
					'type' : item.parentNode.getAttribute('class').match(/(genre|artist|album|track)/)[0]
				});
			
			});
		
		});
		
	}
	
	// mixin EventEmitter.
	EventEmitter.augment(Collection.prototype);
	
	return Collection;

});