Function.prototype.enableEventsOnPrototype = function () {
    'use strict';

    function getEvents(target, name) {
        var eventTypes = target.boundEvents = target.boundEvents || {},
            events = eventTypes[name] = eventTypes[name] || [];

        return events;
    }

    this.prototype.addEventListener = function (name, callback) {
        getEvents(this, name).push(callback);
    };

    this.prototype.evokeEvent = function (name, eventArgs) {
        getEvents(this, name).forEach(function (callback) {
            callback.call(this, callback);
        });
    };
};