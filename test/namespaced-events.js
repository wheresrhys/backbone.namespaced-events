/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global $:false, Backbone:true, _:false, document: false */

  

/*
======== A Handy Little QUnit Reference ========
http://docs.jquery.com/QUnit


Test methods:
    expect(numAssertions)
    stop(increment)
    start(decrement)
Test assertions:
    ok(value, [message])
    equal(actual, expected, [message])
    notEqual(actual, expected, [message])
    deepEqual(actual, expected, [message])
    notDeepEqual(actual, expected, [message])
    strictEqual(actual, expected, [message])
    notStrictEqual(actual, expected, [message])
    raises(block, [expected], [message])
*/


$(document).ready(function() {


    module("Backbone.NamespacedEvents");


    //TODO: write a test for overwriteNativeEvents


    test("overwrite Backbone Native Events", function() {
        var nse = Backbone.NamespacedEvents;
        
        Backbone.NamespacedEvents.overwriteNativeEvents();

 
        ok(Backbone.NativeEvents && 
            Backbone.Events === nse && 
            Backbone.on === nse.on && 
            Backbone.Model.prototype.on === nse.on && 
            Backbone.Collection.prototype.on === nse.on && 
            Backbone.Router.prototype.on === nse.on && 
            Backbone.History.prototype.on === nse.on
        );
    });






    test("on and trigger ", 2, function() {
        var obj = { counter: 0 };
        _.extend(obj,Backbone.Events);
        obj.on('event.namespace', function() { obj.counter += 1; });
        obj.trigger('event');
        equal(obj.counter,1,'counter should be incremented.');
        obj.trigger('event.namespace');
        equal(obj.counter,2,'counter should be incremented.');
    });


    test("on and trigger - multi tier", 5, function() {
        var obj = { counter: 0 };
        _.extend(obj,Backbone.Events);
        obj.on('event.namespace.subnamespace', function() { obj.counter += 1; });
        obj.trigger('event.namespace.subnamespace');
        equal(obj.counter,1,'counter should be incremented.');
        obj.trigger('event.namespace');
        equal(obj.counter,2,'counter should be incremented.');
        obj.trigger('event');
        equal(obj.counter,3,'counter should be incremented.');
        obj.trigger('event.namespace.nosubnamespace');
        equal(obj.counter,3,'counter should not be incremented.');
        obj.trigger('event.nonamespace');
        equal(obj.counter,3,'counter should not be incremented.');
    });




    test("trigger all for each namespaced event", 2, function() {
        var a, b, obj = { counter: 0 };
        _.extend(obj, Backbone.Events);
        obj.on('all', function(event) {
            obj.counter++;
        })
        .trigger('a.namespace b.namespace');
        equal(obj.counter, 2);
        obj.trigger('a b');
        equal(obj.counter, 4);
    });


    test("on, then unbind all functions", 7, function() {
        var obj = { counter: 0 };
        _.extend(obj,Backbone.Events);
        var callback = function() { obj.counter += 1; };
        obj.on('event.namespace1', callback);
        obj.on('event.namespace2', callback);
        obj.trigger('event');
        equal(obj.counter, 2, 'counter should be incremented twice.');


        obj.trigger('event.namespace1');
        equal(obj.counter, 3, 'counter should be incremented once.');


        obj.off('event.namespace1');
        obj.trigger('event');
        equal(obj.counter, 4, 'counter should be incremented once.');


        obj.trigger('event.namespace1');
        equal(obj.counter, 4, 'counter should bot be incremented.');


        obj.trigger('event.namespace2');
        equal(obj.counter, 5, 'counter should be incremented once.');


        obj.off('event');
        obj.trigger('event');
        equal(obj.counter, 5, 'counter should bot be incremented.');


        obj.trigger('event.namespace2');
        equal(obj.counter, 5, 'counter should bot be incremented.');


  });


    test("bind two callbacks, unbind only one", 2, function() {
        var obj = { counterA: 0, counterB: 0 };
        _.extend(obj,Backbone.Events);
        var callback = function() { obj.counterA += 1; };
        obj.on('event.name', callback);
        obj.on('event.name', function() { obj.counterB += 1; });
        obj.trigger('event');
        obj.trigger('event.name');
        obj.off('event.name', callback);
        obj.trigger('event');
        equal(obj.counterA, 2, 'counterA should have only been incremented twice.');
        equal(obj.counterB, 3, 'counterB should have been incremented thrice.');
    });






    test("bind a callback with a supplied context", 1, function () {
        var TestClass = function () {
            return this;
        };
        TestClass.prototype.assertTrue = function () {
            ok(true, '`this` was bound to the callback');
        };


        var obj = _.extend({},Backbone.Events);
        
        obj.on('event.namespace', function () { this.assertTrue(); }, (new TestClass()));
        obj.trigger('event');
    });






    test("remove all events for a specific context", 4, function() {
        var obj = _.extend({}, Backbone.Events);
        obj.on('x.n y all', function() { ok(true); });
        obj.on('x.n y all', function() { ok(false); }, obj);
        obj.off(null, null, obj);
        obj.trigger('x y');
    });


    test("remove all events for a specific callback", 4, function() {
        var obj = _.extend({}, Backbone.Events);
        var success = function() { ok(true); };
        var fail = function() { ok(false); };
        obj.on('x.n y all', success);
        obj.on('x.n y all', fail);
        obj.off(null, fail);
        obj.trigger('x y');
    });




});
