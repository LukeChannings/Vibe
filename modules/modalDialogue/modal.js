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
	 * createDialogue
	 * @description Creates a simple single-view dialogue box.
	 * @param MDO (object) - The Modal Dialogue Object defines the content of the dialogue.
	 */
	ModalDialogue.prototype.createDialogue = function(MDO){
	
		var self = this;
	
		// make an array to keep a list of classes.
		var classes = ['visible'];
	
		// check that there is actually an MDO.
		if ( MDO )
		{
		
			// if there's not title or body then it's a pretty broken dialogue.
			if ( ! MDO.title && ! MDO.body )
			{
				// don't continue.
				return;
			}
		
			// make a dialogue element.
			var dialogue = this.currentDialogue = document.createElement('div');
	
			// check for alignment specification.
			if ( MDO.alignment && /^(center|right)$/.test(MDO.alignment) )
			{
				// set left, center or right alignment.
				classes.push(MDO.alignment);
			}
	
			// give it the ID.
			dialogue.setAttribute('id','ModalDialogue');
			
			/* create a header. */
			var title = document.createElement('h1');
			
			// put the MDO title into the header.
			title.innerHTML = MDO.title;
			
			// append the header to the dialogue.
			dialogue.appendChild(title);
			
			/** check for the body. **/
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
			
			/* check for a form definition. */
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
					
					// check for a default value.
					if ( MDO.form.inputs[i].default )
					{
						input.value = MDO.form.inputs[i].default;
					}
					
					// append the input.
					if ( label )
					{
					
						label.appendChild(input);
						
						form.appendChild(label);
						
					}
					
					else form.appendChild(input);
				}
				
				// append the form.
				dialogue.appendChild(form);
				
			}
			
			// check for button definitions.
			if ( MDO.buttons )
			{
				// create the button container.
				var buttonContainer = document.createElement('div');
			
				// set the id.
				buttonContainer.setAttribute('id','buttons');
			
				// loop through the buttons.
				for ( var i in MDO.buttons )
				{
					// make a button.
					var button = document.createElement('button');
					
					// if the member is a close button then create a close template.
					if ( i == 'close' )
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

					else
					{
						// if there's a generic button, let it title itself.
						button.innerHTML = i;
						
						// check if it has a callback.
						if ( typeof MDO.buttons[i] == 'function' )
						{
							// if it does then listen for a click.
							addListener(button,'click',function(){
							
								MDO.buttons[i].call(self);
							
							});
						}
						
						// if it doesn't.. screw it.
						else continue;
					
					}
					
					// add the button to the dialogue.
					buttonContainer.appendChild(button);
				}
				
				dialogue.appendChild(buttonContainer);
				
			}
			
			if ( MDO.errorDialogue ) classes.push('error');
			
			self.overlay.appendChild(dialogue);
			
			self.overlay.setAttribute('class','visible');
			
			
			// check for classes.
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
			
			dialogue.setAttribute('class', classes.join(' '));
		
		}
		
		// if there's no MDO, log an error.
		else console.error('ModalDialogue::createDialogue - No MDO!');
	
	}
	
	ModalDialogue.prototype.createDialogueWithNavigation = function(MDO){}

	/**
	 * destroy
	 * @description Closes the dialogue.
	 */
	ModalDialogue.prototype.destroy = function(){
	
		// destroy the dialogue.
		removeNode(this.currentDialogue);
		
		// hide the overlay.
		this.overlay.removeAttribute('class');
	
	}
	
	// export the module.
	return ModalDialogue;

});