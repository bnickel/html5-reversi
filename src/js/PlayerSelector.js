var PlayerMode = {
    HUMAN:  0,
    EASY:   1,
    MEDIUM: 2,
    HARD:   3,
    EXPERT: 4,

    count:  5
};

(function (window) {
    'use strict';

    function PlayerSelector(selector, player) {

        var BUTTONS = [
            'Human',
            'Easy',
            'Medium',
            'Hard',
            'Expert'
        ],
            self = this,
            container = document.querySelector(selector),
            header = document.createElement('h2'),
            list = document.createElement('ul');

        header.textContent = player;

        BUTTONS.forEach(function (name, mode) {

            var listItem = document.createElement('li'),
                button = document.createElement('button');

            button.textContent = name;

            button.addEventListener('click', function () {
                self.setMode(mode);
            });

            if (mode === self.mode) {
                button.className = 'checked';
            }

            listItem.appendChild(button);
            list.appendChild(listItem);
        });

        container.appendChild(header);
        container.appendChild(list);

        self.buttons = list.querySelectorAll('button');
    }

    PlayerSelector.enableEventsOnPrototype();

    PlayerSelector.prototype.mode = PlayerMode.HUMAN;

    PlayerSelector.prototype.buttons = null;

    /** @depreciated */
    PlayerSelector.prototype.getMode = function () {
        return this.mode;
    };

    PlayerSelector.prototype.setMode = function (mode) {

        var oldMode = this.mode;

        if (oldMode === mode) {
            return;
        }

        this.mode = mode;

        Array.prototype.forEach.call(this.buttons, function (button, buttonMode) {
            button.className = (buttonMode === mode) ? 'checked' : '';
        });

        this.onModeChanged({
            newMode: mode,
            oldMode: oldMode
        });
    };

    PlayerSelector.prototype.onModeChanged = function (eventArgs) {
        this.evokeEvent('modechanged', eventArgs);
    };

    window.PlayerSelector = PlayerSelector;

}(window));