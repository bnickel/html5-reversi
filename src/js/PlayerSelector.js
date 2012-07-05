var PlayerMode = {
        HUMAN:  0,
        EASY:   1,
        MEDIUM: 2,
        HARD:   3,
        EXPERT: 4,
        
        count:  5
    };
    
function PlayerSelector(selector, player) {
    
    var BUTTONS = [
            'Human',
            'Easy',
            'Medium',
            'Hard',
            'Expert'
        ];
    
    var self = this;
    
	self.__mode = PlayerMode.HUMAN;
    
    var container = document.querySelector(selector);
    
    var header = document.createElement('h2');
    header.textContent = player;
    
    var list = document.createElement('ul');
    
    BUTTONS.forEach(function(name, mode) {
            
            var listItem = document.createElement('li');
            var button = document.createElement('button');
            
            button.textContent = name;
            
            button.addEventListener('click', function() {
                    self.setMode(mode);
                });
            
            if(mode == self.__mode) {
                button.className = 'checked';
            }
            
            listItem.appendChild(button);
            list.appendChild(listItem);
        });
    
    container.appendChild(header);
    container.appendChild(list);
    
    self.__buttons = list.querySelectorAll('button');
}

PlayerSelector.prototype = {
        
        /**
         * Gets the current mode of the 
         */
        getMode: function() {
                return this.__mode;
            },
        
        setMode: function(mode) {
                
                var oldMode = this.__mode;
                
                if(oldMode == mode) {
                    return;
                }
                
                this.__mode = mode;
                
                Array.prototype.forEach.call(this.__buttons, function(button, buttonMode) {
                        button.className = (buttonMode == mode) ? 'checked' : '';
                    });
                
                this.onModeChanged({
                        newMode: mode,
                        oldMode: oldMode
                    });
            },
        
        onModeChanged: function(eventArgs) {
                this.evokeEvent('modechanged', eventArgs);
            }
    };

PlayerSelector.enableEventsOnPrototype();
