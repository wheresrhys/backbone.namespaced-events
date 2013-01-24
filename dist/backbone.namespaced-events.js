/*! Backbone namespaced events - v0.1.0 - 2013-01-24
* https://github.com/wheresrhys/backbone.namespaced-events
* Copyright (c) 2013 Rhys Evans; Licensed MIT */

/**
 * Backbone-namespaced-events.js 0.1
 * (c) 2012 Rhys Evans
 * 
 * Backbone-namespaced-events may be freely distributed under the MIT license; see the accompanying LICENSE.txt.
 * For details and documentation: https://github.com/PaulUithol/Backbone-relational.
 * Depends on Backbone (and thus on Underscore as well): https://github.com/documentcloud/backbone.
 */
( function( undefined ) {
  "use strict";

    /**
    * CommonJS shim
    **/
    var _, Backbone, exports;
    if ( typeof window === 'undefined' ) {
        _ = require( 'underscore' );
        Backbone = require( 'backbone' );
        exports = module.exports = Backbone;
    }
    else {
        _ = window._;
        Backbone = window.Backbone;
        exports = window;
    }

    // Create a local reference to array methods.
    var array = [];
    var push = array.push;
    var slice = array.slice;
    var splice = array.splice;

    


    // Implement fancy features of the Events API such as multiple event
    // names `"change blur"` and jQuery-style event maps `{change: action}`
    // in terms of the existing API.
    var eventsApi = function(obj, action, name, rest) {
        if (!name) return true;
        if (typeof name === 'object') {
            for (var key in name) {
               obj[action].apply(obj, [key, name[key]].concat(rest));
            }
        } else if (eventSplitter.test(name)) {
            var names = name.split(eventSplitter);
            for (var i = 0, l = names.length; i < l; i++) {
                obj[action].apply(obj, [names[i]].concat(rest));
            }
        } else {
            return true;
        }
    };

    // Optimized internal dispatch function for triggering events. Tries to
    // keep the usual cases speedy (most Backbone events have 3 arguments).
    var triggerEvents = function(events, args) {
        var ev, i = -1, l = events.length;
        switch (args.length) {
            case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx);
                return;
            case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0]);
                return;
            case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0], args[1]);
                return;
            case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0], args[1], args[2]);
                return;
            default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
        }
    };

    // Fetch all the callbacks for an event and any namespaced events in the same tree
    // Called recursively to traverse the event tree
    var fetchCallbacks = function (events) {
        if (!events) return [];

        var callbacks = events.__callbacks__.slice(),
            key;

        for (key in events) {
            if (events.hasOwnProperty(key) && key !== '__callbacks__') {
                callbacks = callbacks.concat(fetchCallbacks(events[key]));
            }
        }
        return callbacks;
    };

    // Remove callbacks for a given event and any namespaced events in the same tree
    // Removes all callbacks unless a callback or context given, in which case called recursively to traverse the event tree
    var removeCallbacks = function (events, callback, context) {
        var list, ev, j, k,
            callbacks = events.__callbacks__,
            newEvents = [];
        
        for (j = 0, k = callbacks.length; j < k; j++) {
            ev = callbacks[j];
            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                (context && context !== ev.context)) {
                newEvents.push(ev);
            }
        }
        events.__callbacks__ = newEvents;
        for (var key in events) {
            if (events.hasOwnProperty(key) && key !== '__callbacks__') {
                removeCallbacks(events[key], callback, context);
            }
        }
    };



    // Regular expression used to split event strings
    var eventSplitter = /\s+/,
        namespaceSplitter = '.';

    // Backbone.NamespacedEvents
    // -----------------
    // A module that can be mixed in to *any object* in order to provide it with
    // custom events. You may bind with `on` or remove with `off` callback functions
    // to an event; trigger`-ing an event fires all callbacks in succession.
    //
    //     var object = {};
    //     _.extend(object, Backbone.Events);
    //     object.on('expand', function(){ alert('expanded'); });
    //     object.trigger('expand');
    //
    var nativeEvents = Backbone.Events,
        Events = Backbone.NamespacedEvents = {

        // Bind one or more space separated events, or an events map,
        // to a `callback` function. Passing `"all"` will bind the callback to
        // all events fired.
        on: function(name, callback, context) {
            if (!(eventsApi(this, 'on', name, [callback, context]) && callback)) return this;

            var list = this._events|| (this._events = {}),
                eventComponents = name.indexOf(namespaceSplitter) > 0 ? name.split(namespaceSplitter) : [name];
            while (name = eventComponents.shift()) {
                list = list[name] || (list[name] = {__callbacks__: []});
            }

            list.__callbacks__.push({callback: callback, context: context, ctx: context || this});
            return this;
        },



        // Remove one or many callbacks. If `context` is null, removes all
        // callbacks with that function. If `callback` is null, removes all
        // callbacks for the event. If `name` is null, removes all bound
        // callbacks for all events.
        off: function(name, callback, context) {
            var list, ev, events, newEvents, names, i, il, eventComponents, listParent;
            if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
            
            if (!name && !callback && !context) {
                this._events = {};
                return this;
            }

            names = name ? [name] : _.keys(this._events);
            
            for (i = 0, il = names.length; i < il; i++) {
                
                name = names[i];

                if (name === '__callbacks__') continue;

                eventComponents = name.indexOf(namespaceSplitter) > 0 ? name.split(namespaceSplitter) : [name];
                list = this._events;

                while (name = eventComponents.shift()) {
                    listParent = {list: list, name: name};
                    if (!(list = list[name])) {
                        return this;
                    }
                }


                if (callback || context) {
                    removeCallbacks(list, callback, context);
                } else {
                    delete listParent.list[listParent.name];
                }

            }

            return this;
        },


        // Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` is, apart from the event name
        // (unless you're listening on `"all"`, which will cause your callback to
        // receive the true name of the event as the first argument).
        trigger: function(name) {
            if (!this._events) return this;
            var args = slice.call(arguments, 1);
            if (!eventsApi(this, 'trigger', name, args)) return this;
            
            var events = this._events,
                eventComponents = name.indexOf(namespaceSplitter) > 0 ? name.split(namespaceSplitter) : [name];
            
            while (name = eventComponents.shift()) {

                if (!(events = events[name])) {
                    events = null;
                    break;
                }

            }

            events = fetchCallbacks(events);

            var allEvents = this._events.all && this._events.all.__callbacks__.slice();

            if (events) triggerEvents(events, args);
            if (allEvents) triggerEvents(allEvents, arguments);

            return this;
        },



        // These three methods, in the native implementation, do some preprocessing before applying
        // on, off and trigger, and as this preprocessing is not affected by the namespacing we don't
        // need to reimplement
        once: nativeEvents.once,
        listenTo: nativeEvents.listenTo,
        stopListening: nativeEvents.stopListening,

        // Overwrites the native Backbone.Events implementation with namespaced events for all future instances of Backbone classes
        overwriteNativeEvents: function () {
            if (!Backbone.NativeEvents) {
                Backbone.NativeEvents = Backbone.Events;
                Backbone.Events = Events;
                _.extend(Backbone, Events);
                
                _.extend(Backbone.Model.prototype, Events);
                _.extend(Backbone.Collection.prototype, Events);
                _.extend(Backbone.Router.prototype, Events);
                _.extend(Backbone.History.prototype, Events);
            }
        }
    };

    // Aliases for backwards compatibility.
    Events.bind   = Events.on;
    Events.unbind = Events.off;

    
})();