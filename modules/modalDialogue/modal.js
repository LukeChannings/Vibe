define(function(){

	/**
	 * modalDialogue
	 * @description Creates a dialogue box and overlays it.
	 * @param MDO (object) - Modal Dialogue Object, used to define the dialogue.
	 */
	function ModalDialogue()
	{
		/** Append Stylesheet. **/
		var stylesheet = document.createElement('link');
		
		stylesheet.setAttribute('rel','stylesheet');
		
		stylesheet.setAttribute('type','text/css');
		
		stylesheet.setAttribute('href','modules/modalDialogue/modal.css');
		
		document.head.appendChild(stylesheet);
		
		/** Append overlay element. **/
		this.overlay = document.createElement('div');
		
		this.overlay.setAttribute('id','ModalDialogueOverlay');
		
		document.body.appendChild(this.overlay);
		
		// current dialogue.
		this.currentDialogue;
		
	}
	
	/**
	 * createDialogueElement
	 * @description Creates a dialogue element from an MDO.
	 * @param MDO (object) - The Modal Dialogue Object.
	 */
	function createDialogueElement(MDO,overlay)
	{
	
		// usual lark.
		var self = this;
	
		// check for an overlay element.
		if ( overlay ) this.overlay = overlay;
	
		// check for a dialogue specification.
		if ( MDO )
		{
		
			// set the definition.
			this.definition = MDO;
		
			// create the dialogue element.
			var dialogue = this.dialogue = document.createElement("div");
			
			// determine the id for the dialogue.
			var dialogueId = ( MDO.customId ) ? MDO.customId : "ModalDialogue";
			
			// set the id.
			dialogue.setAttribute("id",dialogueId);
		
			// keep dialogue classes here.
			var classes = ['visible'];
		
			// check if this is an error dialogue
			if ( MDO.errorDialogue ) classes.push('error');
		
			// check for custom alignment specification.
			if ( MDO.alignment && /^(center|right)$/.test(MDO.alignment) )
			{
				// set centre or right alignment.
				classes.push(MDO.alignment);
			}
		
			/* DIALOGUE HEADER */
			if ( MDO.title )
			{
				// create header element.
				var title = document.createElement('h1');
				
				// put the MDO title into the header.
				title.innerHTML = MDO.title;
				
				// append the header to the dialogue.
				dialogue.appendChild(title);
			}
		
			/* DIALOGUE BODY */
			if ( MDO.body )
			{
				// check if the element is not an array.
				if ( !(MDO.body instanceof Array) )
				{
					// if not, just put the element into an array to keep compatibility.
					MDO.body = [MDO.body];
				}
			
				// loop through body elements.
				for ( var i = 0; i < MDO.body.length; i++ )
				{
					
					// check if the item is an HTMLElement.
					if ( MDO.body[i] instanceof HTMLElement )
					{
						// if it is, append the element to the dialogue.
						dialogue.appendChild(MDO.body[i]);
					}
					
					// otherwise check if the element is a string.
					else if ( typeof MDO.body[i] == "string" )
					{
						// if the element is a string then add it directly.
						dialogue.innerHTML += MDO.body[i];
					}
				}
			}
			
			/* DIALOGUE FORM */
			if ( MDO.form )
			{
				// add form to the classes.
				classes.push('form');
				
				// make a new form.
				var form = document.createElement('form');
				
				// set the form name.
				form.setAttribute('name',MDO.form.name);
				
				// set a default method. (For semantics.)
				form.setAttribute('method','post');
				
				for ( var i = 0; i < MDO.form.inputs.length; i++ )
				{
					if ( MDO.form.inputs[i].title )
					{ 
						// make a new label.
						var label = document.createElement('label');
					
						// give the label some text.
						label.innerHTML = MDO.form.inputs[i].title;
					}
					
					// make a new input.
					var input = document.createElement('input');
					
					// check for the form name.
					if ( MDO.form.inputs[i].name )
					{
						input.setAttribute("name", MDO.form.inputs[i].name);
					}
					else
					{
						input.setAttribute("name" + "input" + (i + 1));
					}
					
					// check for a type.
					if ( MDO.form.inputs[i].type )
					{
						input.setAttribute("type",MDO.form.inputs[i].type);
					}
					else
					{
						// if no type was specified default to "text"
						input.setAttribute("type","text");
					}
					
					// check for a default value.
					if ( MDO.form.inputs[i].default )
					{
						// set the default value.
						input.value = MDO.form.inputs[i].default;
					}
					
					// if the MDO specified an input title..
					if ( label )
					{
						// append the input to the label
						label.appendChild(input);
						
						// and then the label to the form.
						form.appendChild(label);
						
					}
					
					// if the MDO specified no title for the input, append the input to the form.
					else form.appendChild(input);
				}
				
				// append the form.
				dialogue.appendChild(form);
				
			}
		
			/* DIALOGUE BUTTONS */
			if ( MDO.buttons )
			{
				// create the button container.
				var buttonContainer = document.createElement('div');
			
				// set the class.
				buttonContainer.setAttribute('class','buttons');
			
				// loop through the buttons.
				for ( var i in MDO.buttons )
				{
					// make a button.
					var button = document.createElement('button');
					
					// if a close button is specified, create a close button.
					if ( /close/i.test(i) && ! ( typeof MDO.buttons[i] == "function") )
					{
						// give it a title.
						button.innerHTML = 'Close';
						
						if ( typeof MDO.buttons[i] == "function" )
						{
							
							addListener(button,'click',function(){
							
								// yes, that means what it says.
								MDO.buttons[i].call(self);
							
							});
							
						}
						else
						{
							// close the dialogue when it's pressed.
							addListener(button,'click',function(){
							
								// yes, that means what it says.
								self.destroy();
							
							});
						}
					}
					else if ( typeof MDO.buttons[i] == "object" )
					{
					
						button.innerHTML = MDO.buttons[i].title || i;
					
						if ( typeof MDO.buttons[i].callback == "function" )
						{
						
							if ( MDO.isPartial )
							{
								var index = parseInt(MDO.customId.match(/\d/)[0]);
								
								if ( i == "next" )
								{
									addListener(button,'click',function(e){
									
										MDO.buttons.next.callback.call(MDO.buttons.next.callbackContext,e,index);
									
									});
								}
								if ( i == "prev" ) {
								
								addListener(button,'click',function(e){
								
									MDO.buttons.prev.callback.call(MDO.buttons.prev.callbackContext,e,index);
								
								});
								
								}
								
							}
							else
							{
								addListener(button,'click',MDO.buttons[i].callback);
							}
						}
					
					}
					// check if it has a callback.
					else if ( typeof MDO.buttons[i] == 'function' )
					{
					
						// if there's a generic button, let it title itself.
						button.innerHTML = i;
					
						// if it does then listen for a click.
						addListener(button,'click',function(){
						
							MDO.buttons[i].call(self);
						
						});
						
					}
					
					// if it doesn't.. screw it.
					else continue;
					
					// add the button to the dialogue.
					buttonContainer.appendChild(button);
				}
				
				// if there are actually buttons...
				if ( buttonContainer.children.length != 0 )
				{
					// append the container.
					dialogue.appendChild(buttonContainer);
				}
				
				// if there are no buttons, destroy the container.
				else buttonContainer = null;
			}
		
			/* DIALOGUE CLASSES */
			if ( MDO.class )
			{
				// check for an array of classes.
				if ( MDO.class instanceof Array )
				{
					classes = MDO.class.concat(classes);
				}
				
				else if ( typeof MDO.class == "string" )
				{
					classes.push(MDO.class);
				}
				
			}
			
			// set the dialogue classes.
			dialogue.setAttribute('class', classes.join(' '));
		
			// return the constructed dialogue.
			return dialogue;
		}
		
		// if there is no dialogue specification return nothing.
		return false;
	}
	
	createDialogueElement.prototype.destroy = function()
	{
		
		// check for the absence of closeKeepsOverlay setting.
		if ( !(this.definition.closeKeepsOverlay) && this.overlay )
		{
			// remove the overlay.
			removeNode(this.overlay);
		}
		else
		{
			// remove the dialogue.
			removeNode(this.dialogue);
		}
	}
	
	/**
	 * createDialogue
	 * @description Creates a simple single-view dialogue box.
	 * @param MDO (object) - The Modal Dialogue Object defines the content of the dialogue.
	 */
	ModalDialogue.prototype.createDialogue = function(MDO)
	{
	
		// check that there is actually an MDO.
		if ( MDO )
		{
		
			var dialogue = new createDialogueElement(MDO,this.overlay);
		
			this.overlay.appendChild(dialogue);
		
			this.overlay.setAttribute('class','visible');
		
		}
		
		// if there's no MDO, log an error.
		else console.error('ModalDialogue::createDialogue - No MDO!');
	
	}
	
	ModalDialogue.prototype.createWizard = function(MDOArray){
	
		// store the MDOs.
		var mdos = MDOArray;
	
		if ( MDOArray instanceof Array )
		{
			
			var dialogues = this.dialogues = [];
			
			var wizard = this.wizard = document.createElement('div');
			
			wizard.setAttribute('id','ModalDialogue');
			
			for ( var i = 0; i < MDOArray.length; i++ )
			{
				MDOArray[i].customId = "WizardDialogue" + (i + 1);
				
				MDOArray[i].isPartial = true;
				
				if ( MDOArray[i].buttons.next )
				{
					MDOArray[i].buttons.next = {
						"title" : "Next",
						"callback" : function(e,i){
							
							removeNode(this.wizard.children[0]);
							
							this.wizard.appendChild(this.dialogues[i]);
							
						},
						"callbackContext" : this
					}
				}
			
				if ( MDOArray[i].buttons.prev )
				{
					MDOArray[i].buttons.prev = {
						"title" : "Previous",
						"callback" : function(e,i){
						
							removeNode(this.wizard.children[0]);
							
							this.wizard.appendChild(this.dialogues[i - 2]);
						
						},
						"callbackContext" : this
					}
				}
				
				var dialogue = new createDialogueElement(MDOArray[i],this.overlay);
				
				dialogues.push(dialogue);
			}
			
			// put the first dialogue in the wizard.
			wizard.appendChild(dialogues[0]);
			
			this.overlay.appendChild(wizard);
			
			this.overlay.setAttribute('class','visible');
			
		}
		
		else return false;
	
	}
	
	ModalDialogue.prototype.createDialogueWithNavigation = function(MDO){}
	
	// export the module.
	return ModalDialogue;

});