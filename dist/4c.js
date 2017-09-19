(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.fourcorners = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],3:[function(require,module,exports){
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

},{}],4:[function(require,module,exports){
'use strict';

var pug_has_own_property = Object.prototype.hasOwnProperty;

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = pug_merge;
function pug_merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = pug_merge(attrs, a[i]);
    }
    return attrs;
  }

  for (var key in b) {
    if (key === 'class') {
      var valA = a[key] || [];
      a[key] = (Array.isArray(valA) ? valA : [valA]).concat(b[key] || []);
    } else if (key === 'style') {
      var valA = pug_style(a[key]);
      var valB = pug_style(b[key]);
      a[key] = valA + valB;
    } else {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Process array, object, or string as a string of classes delimited by a space.
 *
 * If `val` is an array, all members of it and its subarrays are counted as
 * classes. If `escaping` is an array, then whether or not the item in `val` is
 * escaped depends on the corresponding item in `escaping`. If `escaping` is
 * not an array, no escaping is done.
 *
 * If `val` is an object, all the keys whose value is truthy are counted as
 * classes. No escaping is done.
 *
 * If `val` is a string, it is counted as a class. No escaping is done.
 *
 * @param {(Array.<string>|Object.<string, boolean>|string)} val
 * @param {?Array.<string>} escaping
 * @return {String}
 */
exports.classes = pug_classes;
function pug_classes_array(val, escaping) {
  var classString = '', className, padding = '', escapeEnabled = Array.isArray(escaping);
  for (var i = 0; i < val.length; i++) {
    className = pug_classes(val[i]);
    if (!className) continue;
    escapeEnabled && escaping[i] && (className = pug_escape(className));
    classString = classString + padding + className;
    padding = ' ';
  }
  return classString;
}
function pug_classes_object(val) {
  var classString = '', padding = '';
  for (var key in val) {
    if (key && val[key] && pug_has_own_property.call(val, key)) {
      classString = classString + padding + key;
      padding = ' ';
    }
  }
  return classString;
}
function pug_classes(val, escaping) {
  if (Array.isArray(val)) {
    return pug_classes_array(val, escaping);
  } else if (val && typeof val === 'object') {
    return pug_classes_object(val);
  } else {
    return val || '';
  }
}

/**
 * Convert object or string to a string of CSS styles delimited by a semicolon.
 *
 * @param {(Object.<string, string>|string)} val
 * @return {String}
 */

exports.style = pug_style;
function pug_style(val) {
  if (!val) return '';
  if (typeof val === 'object') {
    var out = '';
    for (var style in val) {
      /* istanbul ignore else */
      if (pug_has_own_property.call(val, style)) {
        out = out + style + ':' + val[style] + ';';
      }
    }
    return out;
  } else {
    val += '';
    if (val[val.length - 1] !== ';') 
      return val + ';';
    return val;
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = pug_attr;
function pug_attr(key, val, escaped, terse) {
  if (val === false || val == null || !val && (key === 'class' || key === 'style')) {
    return '';
  }
  if (val === true) {
    return ' ' + (terse ? key : key + '="' + key + '"');
  }
  if (typeof val.toJSON === 'function') {
    val = val.toJSON();
  }
  if (typeof val !== 'string') {
    val = JSON.stringify(val);
    if (!escaped && val.indexOf('"') !== -1) {
      return ' ' + key + '=\'' + val.replace(/'/g, '&#39;') + '\'';
    }
  }
  if (escaped) val = pug_escape(val);
  return ' ' + key + '="' + val + '"';
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} terse whether to use HTML5 terse boolean attributes
 * @return {String}
 */
exports.attrs = pug_attrs;
function pug_attrs(obj, terse){
  var attrs = '';

  for (var key in obj) {
    if (pug_has_own_property.call(obj, key)) {
      var val = obj[key];

      if ('class' === key) {
        val = pug_classes(val);
        attrs = pug_attr(key, val, false, terse) + attrs;
        continue;
      }
      if ('style' === key) {
        val = pug_style(val);
      }
      attrs += pug_attr(key, val, false, terse);
    }
  }

  return attrs;
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

var pug_match_html = /["&<>]/;
exports.escape = pug_escape;
function pug_escape(_html){
  var html = '' + _html;
  var regexResult = pug_match_html.exec(html);
  if (!regexResult) return _html;

  var result = '';
  var i, lastIndex, escape;
  for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
    switch (html.charCodeAt(i)) {
      case 34: escape = '&quot;'; break;
      case 38: escape = '&amp;'; break;
      case 60: escape = '&lt;'; break;
      case 62: escape = '&gt;'; break;
      default: continue;
    }
    if (lastIndex !== i) result += html.substring(lastIndex, i);
    lastIndex = i + 1;
    result += escape;
  }
  if (lastIndex !== i) return result + html.substring(lastIndex, i);
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the pug in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @param {String} str original source
 * @api private
 */

exports.rethrow = pug_rethrow;
function pug_rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    pug_rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Pug') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":1}],5:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 08/09/2016.
 */

'use strict';

var shortenText = require('./helpers/shorten-text'),
    MAX_CONTEXT_CREDIT_LENGTH = 50,
    MAX_LINKS_TITLE_LENGTH = 50,
    MAX_BACKSTORY_AUTHOR_LENGTH = 50,
    MAX_BACKSTORY_publication_LENGTH = 50;

module.exports = function (data) {
    shortenDataText(data);
};

function shortenDataText(data) {
    shortenContextText(data.context);
    shortenLinksText(data.links);
    shortenBackstory(data.backStory);
    formatCreativeCommons(data.creativeCommons);
}

function formatCreativeCommons(creativeCommons) {
    if (!creativeCommons) {
        return;
    }
    var parts = [];
    if (creativeCommons.credit) {
        parts.push(creativeCommons.credit);
    }
    if (creativeCommons.year) {
        parts.push(creativeCommons.year);
    }
    if (creativeCommons.copyright) {
        parts.push(creativeCommons.copyright);
    }
    creativeCommons.formattedCopyright = parts.length ? "© " + parts.join(", ") : "";
}

function shortenContextText(contextList) {
    if (!contextList) {
        return;
    }
    contextList.forEach(function (context) {
        if (context.credit) {
            context.credit = shortenText(context.credit, MAX_CONTEXT_CREDIT_LENGTH);
        }
    });
}

function shortenLinksText(linksList) {
    if (!linksList) {
        return;
    }
    linksList.forEach(function (link) {
        if (link.title) {
            link.title = shortenText(link.title, MAX_LINKS_TITLE_LENGTH);
        } else {
            link.title = shortenText(link.url, MAX_LINKS_TITLE_LENGTH);
        }
    });
}

function shortenBackstory(backStory) {
    if (!backStory) {
        return;
    }
    if (backStory.author) {
        backStory.author = shortenText(backStory.author, MAX_BACKSTORY_AUTHOR_LENGTH);
    }
    if (backStory.publication) {
        backStory.publication = shortenText(backStory.publication, MAX_BACKSTORY_publication_LENGTH);
    }
}
},{"./helpers/shorten-text":17}],6:[function(require,module,exports){
var pug = require('pug-runtime');
module.exports=template;function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;
;var locals_for_with = (locals || {});(function (shortSrc) {
pug_html = pug_html + "\u003C!--";

pug_html = pug_html + "Created by Tim Osadchiy on 06\u002F09\u002F2016.";

pug_html = pug_html + "\n";

pug_html = pug_html + "--\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-gallery-failed-image\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-gallery-failed-image-caption\" title=\"Failed to load image from: #{fullSrc}\"\u003E";

pug_html = pug_html + "\u003Cspan class=\"fc-image-typo\"\u003E";

pug_html = pug_html + "Failed to load image from: ";

pug_html = pug_html + (pug_escape(null == (pug_interp = shortSrc) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";}.call(this,"shortSrc" in locals_for_with?locals_for_with.shortSrc:typeof shortSrc!=="undefined"?shortSrc:undefined));return pug_html;}

},{"fs":2,"pug-runtime":4}],7:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var getAllElementsWithAttribute = require("./helpers/get-all-elements-with-attribute"),
    // Might be used in future for parsing XMP
    xmlToJson = require("./helpers/xml-to-json"),
    baseAttr = "data-4c";

var META_TAG = baseAttr + "-meta";

module.exports = function (onSuccess, onFailure) {
    tryGetMeta(this, onSuccess, onFailure);
};

function tryGetMeta(img, onSuccess, onFailure) {
    var q = [tryGetFromScript, tryLoadFileByAttribute, tryLoadJsonBySrc, tryLoadYamlBySrc],
        exec = function () {
            var fn = q.shift();
            if (!fn) {
                if (onFailure) {
                    onFailure();
                }
            } else {
                fn(img, function (data) {
                    if (!data) {
                        exec();
                    } else {
                        onSuccess(data);
                    }
                })
            }
        };
        exec();
}

function tryGetFromScript(img, onFinish) {
    var path = img.getAttribute(baseAttr) || img.src,
        els = getAllElementsWithAttribute(META_TAG);
    if (els.length == 0) {
        onFinish();
    } else {
        for (var i = 0, l = els.length; i < l; i++) {
            var el = els[i],
                dummyImg = document.createElement("img"),
                attr = el.getAttribute(META_TAG);
            // We create dummy img and verify that it's src transformed by browser to the same as in target img
            // Causes GET 404 as sets src to non existing images
            dummyImg.src = attr;
            if (attr == path || dummyImg.src == path) {
                var data = parseMeta(el.innerHTML, el.type.replace("text/", ""));
                onFinish(data);
                return;
            }
        }
        onFinish();
    }
}

function tryLoadFileByAttribute(img, onFinish) {
    var path = img.getAttribute(baseAttr),
        extL = path.match(/\.(yaml|json)$/),
        ext = extL ? extL[1] : extL;
    if (!ext) {
        onFinish();
        return;
    }
    tryToLoadFile(path, ext, onFinish);
}

function tryLoadYamlBySrc(img, onFinish) {
    var ext = "yaml",
        path = img.src.substr(0, img.src.lastIndexOf(".")) + "." + ext;
    tryToLoadFile(path, ext, onFinish);
}

function tryLoadJsonBySrc(img, onFinish) {
    var ext = "json",
        path = img.src.substr(0, img.src.lastIndexOf(".")) + "." + ext;
    tryToLoadFile(path, ext, onFinish);
}

function tryToLoadFile(path, ext, onFinish) {
    loadFile(path, function (xhr) {
        var data = parseMeta(xhr.responseText, ext);
        onFinish(data);
    }, function () {
        onFinish();
    });
}

function parseMeta(rawText, format) {
    if (format == "json") {
        return JSON.parse(rawText);
    } else if (format == "yaml") {
        console.warn("Four Corners:",
            "YAML files are deprecated.",
            "You can create new meta data files on",
            "https://digitalinteraction.github.io/fourcorners-editor/");
        return;
    }
}

function loadFile(path, success, error) {
    error = error || function () {
        };
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                success(xhr, path);
            } else {
                error(xhr, path);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}
},{"./helpers/get-all-elements-with-attribute":12,"./helpers/xml-to-json":18}],8:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (el, cls) {
    if (el.classList) {
        el.classList.add(cls);
    } else {
        el.className += ' ' + cls;
    }
};
},{}],9:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (el, eventName, handler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, handler, false);
    } else if (el.attachEvent) {
        el.attachEvent("on" + eventName, handler);
    } else {
        el["on" + eventName] = handler;
    }
};
},{}],10:[function(require,module,exports){
// http://stackoverflow.com/questions/17567344/detect-left-right-swipe-on-touch-devices-but-allow-up-down-scrolling

'use strict';

module.exports = function () {
    var swipeLeftName = 'swipeLeft',
        swipeRightName = 'swipeRight',
        swipeUpName = 'swipeUp',
        swipeDownName = 'swipeDown';

    (function (d) {
        var ce = function (e, n) {
                var a = document.createEvent("CustomEvent");
                a.initCustomEvent(n, true, true, e.target);
                e.target.dispatchEvent(a);
                a = null;
                return false
            },
            nm = true,
            sp = {x: 0, y: 0},
            ep = {x: 0, y: 0},
            touch = {
                touchstart: function (e) {
                    sp = {x: e.touches[0].pageX, y: e.touches[0].pageY};
                },
                touchmove: function (e) {
                    nm = false;
                    ep = {x: e.touches[0].pageX, y: e.touches[0].pageY};
                },
                touchend: function (e) {
                    if (nm) {
                        ce(e, 'fc');
                    } else {
                        var x = ep.x - sp.x,
                            xr = Math.abs(x),
                            y = ep.y - sp.y,
                            yr = Math.abs(y);
                        if (Math.max(xr, yr) > 20) {
                            ce(e, (xr > yr ? (x < 0 ? swipeLeftName : swipeRightName) : (y < 0 ? swipeUpName : swipeDownName)));
                        }
                    }
                    nm = true;
                },
                touchcancel: function (e) {
                    nm = false;
                }
            };

        for (var a in touch) {
            d.addEventListener(a, touch[a], false);
        }

    })(document);
};
},{}],11:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var getElementStyles = require('./get-element-style');

module.exports = function (fromDom, toDom) {
    var styles = getElementStyles(fromDom);
    for (var i in styles) {
        if (styles.hasOwnProperty(i)) {
            toDom.style[i] = styles[i];
        }
    }
};
},{"./get-element-style":13}],12:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function getAllElementsWithAttribute(attribute, el) {
    if (el == undefined) {
        el = document;
    }
    var matchingElements = [];
    var allElements = el.getElementsByTagName('*');
    Array.prototype.forEach.call(allElements, function(element) {
        if (element.getAttribute(attribute) !== null) {
            // Element exists with attribute. Add to array.
            matchingElements.push(element);
        }
    });
    return matchingElements;
};
},{}],13:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (dom) {
    return getComputedStyle(dom);
};

function getComputedStyle(dom) {
    var style, returns, margins;
    if (window.getComputedStyle) {
        style = window.getComputedStyle(dom, null);
        returns = {};
        for (var i = 0, l = style.length; i < l; i++) {
            var prop = style[i],
                camel = camelize(prop),
                val = style.getPropertyValue(prop);
            returns[camel] = val;
        }
    } else if (style = dom.currentStyle) {
        returns = {};
        for (var prop in style) {
            returns[prop] = style[prop];
        }
    }
    if (returns) {
        // In Chrome instead of 'auto' a static value is returned, in Firefox - 0.
        // To solve that we get margins from style sheets and style tag.
        margins = getStyleSheetMargins(dom);
        for (var i in margins) {
            returns[i] = margins[i];
        }
    }
    return returns;
}

function getStyleSheetMargins(dom) {
    // Get all stylesheets and element' style attribute
    var sheets = document.styleSheets, o = [], style = dom.getAttribute('style'),
        margin = {};
    // Get element's browser specific css rules match method
    dom.matches = dom.matches || dom.webkitMatchesSelector || dom.mozMatchesSelector || dom.msMatchesSelector || dom.oMatchesSelector;
    for (var i in sheets) {
        try {
            // Firefox throws error when reading stylesheets from external resources
            var rules = sheets[i].rules || sheets[i].cssRules;
        } catch (e) {
            continue;
        }
        for (var r in rules) {
            var selector = rules[r].selectorText,
                rule = rules[r].cssText;
            try {
                // To avoid Uncaught SyntaxError: Failed to execute 'matches' on 'Element': '[ng:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak, .ng-hide:not(.ng-hide-animate)' is not a valid selector.
                // Occurs when using with angular
                if (!dom.matches(selector) || rule.match("margin") == null) {
                    continue;
                }
            } catch (e) {
                continue;
            }
            var styleRules = splitCssRule(rule);
            applyStylesToMargin(margin, styleRules);
        }
    }
    if (style) {
        var styleRules = splitStyleRule(style);
        applyStylesToMargin(margin, styleRules);
    }
    return margin;
}

function applyStylesToMargin(margin, styleRules) {
    styleRules.forEach(function (el) {
        if (el[0].match("margin")) {
            var m = {};
            if (el[0] == "margin") {
                m = splitMargin(el[1]);
            } else {
                m[el[0]] = el[1];
            }
            for (var k in m) {
                margin[k] = m[k];
            }
        }
    });
}

function splitCssRule(rule) {
    var cleanedRule = cleanCssRule(rule);
    return splitStyleRule(cleanedRule);
}

function splitStyleRule(rule) {
    var rules = rule.split(/;/g);
    rules = rules.filter(function (el) {
        return el && el.replace(/\s+/g, '');
    });
    return rules.map(function (el) {
        var s = el.split(':');
        s[0] = camelize(s[0].replace(/\s+/g, ''));
        s[1] = s[1].replace(/\s\s+/g, ' ').replace(/(^\s+|\s+$)/g, '');
        return s;
    });
}

function cleanCssRule(rule) {
    var cleanedRule = rule.match(/{(.*?)}/g);
    return cleanedRule.map(function (val) {
        return val.replace(/({|}|\s+)/g, '');
    })[0];
}

function splitMargin(marginRule) {
    var margins = marginRule.split(' ');
    if (margins.length == 1) {
        margins.concat([margins[0], margins[0], margins[0]]);
    }
    if (margins.length == 2) {
        margins.concat(margins);
    }
    if (margins.length == 3) {
        margins.push(margins[1]);
    }
    return {
        marginTop: margins[0],
        marginRight: margins[1],
        marginBottom: margins[2],
        marginLeft: margins[3]
    };
}

function camelize(str) {
    return str.replace(/\-([a-z])/g, function (a, b) {
        return b.toUpperCase();
    });
}
},{}],14:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 17/09/2016.
 */

'use strict';

module.exports = function() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
};
},{}],15:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (el, cls) {
    if (el.classList) {
        el.classList.remove(cls);
    } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
};
},{}],16:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 09/08/2017.
 */

"use strict";

module.exports = function (element, eventName, handler) {
    if (element.removeEventListener) {
        element.removeEventListener(eventName, handler, false);
    } else if (element.detachEvent) {
        element.detachEvent("on" + eventName, handler);
    } else {
        element["on" + eventName] = null;
    }
};
},{}],17:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 01/09/2016.
 */

'use strict';

module.exports = function (str, len, cutFromStart) {
    if (str.length < len) {
        return str;
    } else if (!cutFromStart) {
        return str.substr(0, len).replace(/\s+$/, '') + '...';
    } else {
        return '...' + str.substr(str.length - len, str.length).replace(/^\s+/, '');
    }
};
},{}],18:[function(require,module,exports){
"use strict";

module.exports = function (str) {
    var xmlDoc = parseXML(str);
    return xmlToJson(xmlDoc);
};

function xmlToJson(xml, tab) {
    var obj = {};
    if (xml.nodeType == 1) {
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) {
        obj = xml.nodeValue;
    }
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

function parseXML(val) {
    if (document.implementation && document.implementation.createDocument) {
        var xmlDoc = new DOMParser().parseFromString(val, 'text/xml');
    }
    else if (window.ActiveXObject) {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.loadXML(val);
    }
    else {
        return null;
    }
    return xmlDoc;
}

},{}],19:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 08/09/2016.
 */

'use strict';

module.exports = function (path, data) {
    return contextIsValid(path, data) &&
        linksAreValid(path, data) &&
        backStoryIsValid(path, data) &&
        creativeCommonsAreValid(path, data);
};

function contextIsValid(path, data) {
    if (!data.context) {
        console.warn(path, ': \'context\' is not defined');
    }
    if (data.context && Object.prototype.toString.call(data.context) != '[object Array]') {
        throw path + ': \'context\' must be a list';
    } else if (data.context) {
        var toDelete = [];
        data.context.forEach(function (el, i) {
            if (!el.src && !el.youtube_id && !el.vimeo_id) {
                console.warn(path, ': \'context\', element number', String(i + 1),
                    ' - one of \'src\', \'youtube_id\' or \'vimeo_id\' are not defined');
                toDelete.push(el);
            }
        });
        
        toDelete.forEach(function (el) {
            var j = data.context.indexOf(el);
            data.context.splice(j, 1);
        });
    }
    return true;
}

function linksAreValid(path, data) {
    if (!data.links) {
        console.warn(path, ': \'links\' are not defined');
    }
    if (data.links && Object.prototype.toString.call(data.links) != '[object Array]') {
        throw path + ': \'links\' must be a list';
    } else if (data.links) {
        var toDelete = [];
        data.links.forEach(function (el, i) {
            if (!el.url) {
                console.warn(path, ': \'links\', element number', String(i + 1),
                    ' - \'url\' is not defined');
                toDelete.push(el);
            }
        });
        toDelete.forEach(function (el) {
            var j = data.links.indexOf(el);
            data.links.splice(j, 1);
        });
    }
    return true;
}

function backStoryIsValid(path, data) {
    if (!data.backStory) {
        console.warn(path, ': \'backStory\' is not defined');
    }
    if (data.backStory && !data.backStory.text) {
        console.warn(path, ': \'backStory\' has no text');
        return true;
    }
    return true;
}

function creativeCommonsAreValid(path, data) {
    if (!data.creativeCommons) {
        console.warn(path, ': \'rights\' are not defined');
    }
    if (data.creativeCommons && !data.creativeCommons.credit) {
        console.warn(path, ': \'rights\' - credit is not defined');
        return true;
    }
    return true;
}

},{}],20:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var baseAttr = "data-4c",
    getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    addClass = require('./helpers/add-class'),
    getIsTouch = require("./helpers/is-touch-screen"),
    removeClass = require('./helpers/remove-class');

module.exports = function (dom) {

    return new ImageModel(dom);

};

function ImageModel(dom) {
    this.touched = false;
    this.topLeftCorner = GalleryCornerModelFactory(dom);
    this.topRightCorner = new CornerModel();
    this.bottomLeftCorner = new CornerModel();
    this.bottomRightCorner = new CreativeCommonsCorner();
}

ImageModel.prototype.toolsHidden = function () {
    return this.topLeftCorner.visible ||
        this.topRightCorner.visible ||
        this.bottomLeftCorner.visible ||
        this.bottomRightCorner.visible;
};

ImageModel.prototype.showTools = function () {
    this.touched = getIsTouch();
};

ImageModel.prototype.hideTools = function () {
    this.touched = false;
};

function CornerModel() {
    this.visible = false;
    this.pinned = false;
}

CornerModel.prototype.show = function (e) {
    if (e) {
        this.stopEventPropagation(e);
    }
    this.visible = true;
};
CornerModel.prototype.hide = function () {
    if (this.pinned) {
        return;
    }
    this.visible = false;
};
CornerModel.prototype.stopEventPropagation = function (e) {
    // Retreive function from MouseEvent or HammerJS srcEvent
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.srcEvent.stopPropagation();
    }
};
CornerModel.prototype.forceHide = function (e) {
    this.stopEventPropagation(e);
    this.pin(false);
};
CornerModel.prototype.pin = function (pinned) {
    if (pinned != null) {
        this.pinned = pinned;
    } else {
        this.pinned = !this.pinned;
    }
    if (this.pinned) {
        this.show();
    } else {
        this.hide();
    }
};

function GalleryCornerModelFactory(dom) {
    var galleryDom = getAllElementsWithAttribute(baseAttr + '-gallery-list', dom)[0],
        galleryItemDoms = getAllElementsWithAttribute(baseAttr + '-gallery-item', galleryDom),
        youTubeIframes = getAllElementsWithAttribute(baseAttr + '-gallery-yt', galleryDom),
        captionDoms = getAllElementsWithAttribute(baseAttr + '-gallery-caption', dom);

    function GalleryCornerModel() {
        CornerModel.call(this);
        this.selectedIndex = 0;
        this.preselectedItem = undefined;

        gotToIndex.call(this);
    }

    GalleryCornerModel.prototype = Object.create(CornerModel.prototype);

    GalleryCornerModel.prototype.hide = function () {
        CornerModel.prototype.hide.call(this);
        youTubeIframes.forEach(pauseYouTubeVideo);
    };
    GalleryCornerModel.prototype.selectItem = function (event, el) {
        this.selectedIndex = galleryItemDoms.indexOf(el);
        gotToIndex.call(this);
    };
    GalleryCornerModel.prototype.selectNext = function () {
        if (this.selectedIndex < galleryItemDoms.length - 1) {
            this.selectedIndex++;
            gotToIndex.call(this);
        }
    };
    GalleryCornerModel.prototype.selectPrevious = function () {
        if (this.selectedIndex == 0) {
            return;
        }
        this.selectedIndex--;
        gotToIndex.call(this);
    };
    GalleryCornerModel.prototype.preselectPrevious = function () {
        this.preselectedItem = galleryItemDoms[this.selectedIndex - 1];
    };
    GalleryCornerModel.prototype.preselectNext = function () {
        this.preselectedItem = galleryItemDoms[this.selectedIndex + 1];
    };
    GalleryCornerModel.prototype.clearPreselect = function () {
        this.preselectedItem = undefined;
    };
    GalleryCornerModel.prototype.getPrevControllerHidden = function () {
        return this.selectedIndex <= 0;
    };
    GalleryCornerModel.prototype.getNextControllerHidden = function () {
        return this.selectedIndex >= galleryItemDoms.length - 1;
    };
    GalleryCornerModel.prototype.getItemIsPreselected = function (domElement) {
        return domElement == this.preselectedItem;
    };
    GalleryCornerModel.prototype.getCaptionVisible = function (domElement) {
        return domElement == captionDoms[this.selectedIndex];
    };

    function getImageOffsets(elements) {
        var offsets = [];
        elements.forEach(function (el) {
            offsets.push(el.offsetLeft);
        });
        return offsets;
    }

    function gotToIndex() {
        if (!galleryDom) {
            return;
        }
        var index = this.selectedIndex,
            scaleConstant = 0.8,
            imageOffsets = getImageOffsets(galleryItemDoms);
        galleryItemDoms.forEach(function (dom, i) {
            if (i == index) {
                addClass(dom, 'selected');
            } else {
                removeClass(dom, 'selected');
            }
        });
        galleryDom.style.marginLeft = -imageOffsets[index] * scaleConstant + 'px';
    }

    return new GalleryCornerModel();
}

function CreativeCommonsCorner() {
    CornerModel.call(this);
}

CreativeCommonsCorner.prototype = Object.create(CornerModel.prototype);

function pauseYouTubeVideo(iframe) {
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
}
},{"./helpers/add-class":8,"./helpers/get-all-elements-with-attribute":12,"./helpers/is-touch-screen":14,"./helpers/remove-class":15}],21:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 02/08/2017.
 *
 * Script that is used for importing the project in external projects
 *
 */

"use strict";

// ToDo: YouTube links often cause a delay when hover on any of corners before opening it

"use strict";

require("./polyfills/index")();
require("./helpers/add-swipe-events")();

exports.init = require("./wrap-all-img-elements-on-page");
exports.wrapImgElementWithJson = require("./wrap-img-element-with-json");
exports.wrapImgElement = require("./wrap-img-element");

},{"./helpers/add-swipe-events":10,"./polyfills/index":26,"./wrap-all-img-elements-on-page":30,"./wrap-img-element":33,"./wrap-img-element-with-json":32}],22:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

"use strict";

var init = require("./wrap-all-img-elements-on-page");

window.FourCorners = require("./index-npm");

window.addEventListener("load", function load(event) {
    window.removeEventListener("load", load, false);
    init();
}, false);
},{"./index-npm":21,"./wrap-all-img-elements-on-page":30}],23:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 04/09/2016.
 */

'use strict';

module.exports = function () {
    if (!Event.prototype.preventDefault) {
        Event.prototype.preventDefault = function () {
            this.returnValue = false;
        };
    }
    if (!Event.prototype.stopPropagation) {
        Event.prototype.stopPropagation = function () {
            this.cancelBubble = true;
        };
    }
    if (!Element.prototype.addEventListener) {
        var eventListeners = [];

        var addEventListener = function (type, listener /*, useCapture (will be ignored) */) {
            var self = this;
            var wrapper = function (e) {
                e.target = e.srcElement;
                e.currentTarget = self;
                if (typeof listener.handleEvent != 'undefined') {
                    listener.handleEvent(e);
                } else {
                    listener.call(self, e);
                }
            };
            if (type == "DOMContentLoaded") {
                var wrapper2 = function (e) {
                    if (document.readyState == "complete") {
                        wrapper(e);
                    }
                };
                document.attachEvent("onreadystatechange", wrapper2);
                eventListeners.push({object: this, type: type, listener: listener, wrapper: wrapper2});

                if (document.readyState == "complete") {
                    var e = new Event();
                    e.srcElement = window;
                    wrapper2(e);
                }
            } else {
                this.attachEvent("on" + type, wrapper);
                eventListeners.push({object: this, type: type, listener: listener, wrapper: wrapper});
            }
        };
        var removeEventListener = function (type, listener /*, useCapture (will be ignored) */) {
            var counter = 0;
            while (counter < eventListeners.length) {
                var eventListener = eventListeners[counter];
                if (eventListener.object == this && eventListener.type == type && eventListener.listener == listener) {
                    if (type == "DOMContentLoaded") {
                        this.detachEvent("onreadystatechange", eventListener.wrapper);
                    } else {
                        this.detachEvent("on" + type, eventListener.wrapper);
                    }
                    eventListeners.splice(counter, 1);
                    break;
                }
                ++counter;
            }
        };
        Element.prototype.addEventListener = addEventListener;
        Element.prototype.removeEventListener = removeEventListener;
        if (HTMLDocument) {
            HTMLDocument.prototype.addEventListener = addEventListener;
            HTMLDocument.prototype.removeEventListener = removeEventListener;
        }
        if (Window) {
            Window.prototype.addEventListener = addEventListener;
            Window.prototype.removeEventListener = removeEventListener;
        }
    }
};

},{}],24:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 03/09/2016.
 */

'use strict';

module.exports = function () {
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (fun/*, thisArg*/) {
            'use strict';

            if (this === void 0 || this === null) {
                throw new TypeError();
            }

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== 'function') {
                throw new TypeError();
            }

            var res = [];
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i];

                    // NOTE: Technically this should Object.defineProperty at
                    //       the next index, as push can be affected by
                    //       properties on Object.prototype and Array.prototype.
                    //       But that method's new, and collisions should be
                    //       rare, so use the more-compatible alternative.
                    if (fun.call(thisArg, val, i, t)) {
                        res.push(val);
                    }
                }
            }

            return res;
        };
    }
};

},{}],25:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 03/09/2016.
 */

'use strict';

module.exports = function () {
    // Production steps of ECMA-262, Edition 5, 15.4.4.18
    // Reference: http://es5.github.io/#x15.4.4.18
    if (!Array.prototype.forEach) {

        Array.prototype.forEach = function (callback, thisArg) {

            var T, k;

            if (this === null) {
                throw new TypeError(' this is null or not defined');
            }

            // 1. Let O be the result of calling toObject() passing the
            // |this| value as the argument.
            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get() internal
            // method of O with the argument "length".
            // 3. Let len be toUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If isCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== "function") {
                throw new TypeError(callback + ' is not a function');
            }

            // 5. If thisArg was supplied, let T be thisArg; else let
            // T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }

            // 6. Let k be 0
            k = 0;

            // 7. Repeat, while k < len
            while (k < len) {

                var kValue;

                // a. Let Pk be ToString(k).
                //    This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty
                //    internal method of O with argument Pk.
                //    This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal
                    // method of O with argument Pk.
                    kValue = O[k];

                    // ii. Call the Call internal method of callback with T as
                    // the this value and argument list containing kValue, k, and O.
                    callback.call(T, kValue, k, O);
                }
                // d. Increase k by 1.
                k++;
            }
            // 8. return undefined
        };
    }
};

},{}],26:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 03/09/2016.
 */

'use strict';

module.exports = function() {
    require('./for-each')();
    require('./filter')();
    require('./map')();
    require('./add-event-listener')();
};

},{"./add-event-listener":23,"./filter":24,"./for-each":25,"./map":27}],27:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 03/09/2016.
 */

'use strict';

module.exports = function () {
    // Production steps of ECMA-262, Edition 5, 15.4.4.19
    // Reference: http://es5.github.io/#x15.4.4.19
    if (!Array.prototype.map) {

        Array.prototype.map = function (callback, thisArg) {

            var T, A, k;

            if (this == null) {
                throw new TypeError(' this is null or not defined');
            }

            // 1. Let O be the result of calling ToObject passing the |this|
            //    value as the argument.
            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get internal
            //    method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }

            // 6. Let A be a new array created as if by the expression new Array(len)
            //    where Array is the standard built-in constructor with that name and
            //    len is the value of len.
            A = new Array(len);

            // 7. Let k be 0
            k = 0;

            // 8. Repeat, while k < len
            while (k < len) {

                var kValue, mappedValue;

                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal
                //    method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal
                    //    method of O with argument Pk.
                    kValue = O[k];

                    // ii. Let mappedValue be the result of calling the Call internal
                    //     method of callback with T as the this value and argument
                    //     list containing kValue, k, and O.
                    mappedValue = callback.call(T, kValue, k, O);

                    // iii. Call the DefineOwnProperty internal method of A with arguments
                    // Pk, Property Descriptor
                    // { Value: mappedValue,
                    //   Writable: true,
                    //   Enumerable: true,
                    //   Configurable: true },
                    // and false.

                    // In browsers that support Object.defineProperty, use the following:
                    // Object.defineProperty(A, k, {
                    //   value: mappedValue,
                    //   writable: true,
                    //   enumerable: true,
                    //   configurable: true
                    // });

                    // For best browser support, use the following:
                    A[k] = mappedValue;
                }
                // d. Increase k by 1.
                k++;
            }

            // 9. return A
            return A;
        };
    }
};
},{}],28:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */


'use strict';

var baseAttr = "data-4c",
    getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    addClass = require('./helpers/add-class'),
    removeClass = require('./helpers/remove-class'),
    addEventListener = require('./helpers/add-event-listener'),
    removeEventListener = require("./helpers/remove-event-listener"),
    Hammer = require('hammerjs');

module.exports = function (domContainer, model) {

    var watchers = [],
        destroyers = [],
        isTouch = require('./helpers/is-touch-screen')();

    init();

    function init() {
        setClassWatchers();
        setTextWatchers();
        setEventListeners();
        executeWatchers();
    }

    function setEventListeners() {
        var attr = baseAttr + '-on',
            doms = getAllElementsWithAttribute(attr, domContainer);
        destroyers = doms.map(function (dom) {
            return setEventListenersFromExpression(dom, dom.getAttribute(attr));
        });
    }

    function setEventListenersFromExpression(el, expression) {
        var eventMap = parseAttribute(expression);
        var destroyers = [];
        for (var eventName in eventMap) {
            var eventListener = getEventListener(el, model, eventMap[eventName]);
            var destroyer = function () {
            };
            if (isTouch) {
                if (['click', 'mouseover'].indexOf(eventName) > -1) {
                    var hammertime = new Hammer(el);
                    hammertime.on('tap', eventListener);
                    destroyer = function () {
                        hammertime.destroy();
                    };
                } else if (eventName == 'clickOutside') {
                    var hammertime = new Hammer(document);
                    hammertime.on('tap', wrapEventListenerToOutsideClick(el, eventListener));
                    destroyer = function () {
                        hammertime.destroy();
                    };
                } else {
                    addEventListener(el, eventName, eventListener);
                    destroyer = function () {
                        removeEventListener(el, eventName, eventListener);
                    };
                }
            } else if (eventName == 'clickOutside') {
                var listener = wrapEventListenerToOutsideClick(el, eventListener);
                var evName = 'click';
                addEventListener(document, evName, listener);
                destroyer = function () {
                    removeEventListener(document, evName, listener);
                };
            } else {
                addEventListener(el, eventName, eventListener);
                destroyer = function () {
                    removeEventListener(document, eventName, eventListener);
                };
            }
            destroyers.push(destroyer);
        }
        /**
         * Return remove all event listeners function
         */
        return function () {
            destroyers.forEach(function (fn) {
                fn();
            });
        }
    }

    function setClassWatchers() {
        var attr = baseAttr + '-class',
            doms = getAllElementsWithAttribute(attr, domContainer);
        doms.forEach(function (dom) {
            var classWatchers = getClassWatchersForElement(dom, dom.getAttribute(attr));
            watchers.push.apply(watchers, classWatchers);
        });
    }

    function setTextWatchers() {
        var attr = baseAttr + '-text',
            doms = getAllElementsWithAttribute(attr, domContainer);
        doms.forEach(function (dom) {
            var textWatcher = getTextWatcherForElement(dom, dom.getAttribute(attr));
            watchers.push(textWatcher);
        });
    }

    function getClassWatchersForElement(el, expression) {
        var result = [],
            classExpressionMap = parseAttribute(expression);
        for (var className in classExpressionMap) {
            result.push(getClassWatcher(el, className, classExpressionMap[className]));
        }
        return result;
    }

    function getClassWatcher(el, className, expression) {
        return function () {
            if (getClassExpressionValue(el, model, expression)) {
                addClass(el, className);
            } else {
                removeClass(el, className);
            }
        }
    }

    function getTextWatcherForElement(el, expression) {
        return function () {
            el.textContent = getTextExpressionValue(el, model, expression);
        }
    }

    function parseAttribute(str) {
        var keyValStrs = str.split(/,\s*/),
            keyVal = {};
        keyValStrs.forEach(function (el) {
            var kv = el.split(/:\s*/);
            keyVal[kv[0]] = kv[1];
        });
        return keyVal;
    }

    function parseClassExpression(str) {
        return {
            opposite: str.match(/^!/) != null,
            properties: str.replace(/^!/g, '').split('.')
        }
    }

    function getClassExpressionValue(el, model, expression) {
        var parsedExpression = parseClassExpression(expression),
            properties = parsedExpression.properties,
            opposite = parsedExpression.opposite,
            subModel = model,
            targetProperty = properties.pop(),
            subModelName = properties.shift(),
            value;
        while (subModelName != undefined) {
            subModel = subModel[subModelName];
            subModelName = properties.shift();
        }
        if (typeof subModel[targetProperty] == "function") {
            value = subModel[targetProperty].call(subModel, el);
        } else {
            value = subModel[targetProperty];
        }
        return opposite ? !value : value;
    }

    function getTextExpressionValue(el, model, expression) {
        var properties = expression.split('.'),
            subModel = model,
            targetProperty = properties.pop(),
            subModelName = properties.shift(),
            value;
        while (subModelName != undefined) {
            subModel = subModel[subModelName];
            subModelName = properties.shift();
        }
        if (typeof subModel[targetProperty] == "function") {
            value = subModel[targetProperty].call(subModel, el);
        } else {
            value = subModel[targetProperty];
        }
        return value;
    }

    function getEventListener(el, model, expression) {
        var properties = expression.split('.'),
            subModel = model,
            funName = properties.pop(),
            subModelName = properties.shift();
        while (subModelName != undefined) {
            subModel = subModel[subModelName];
            subModelName = properties.shift();
        }
        return function (event) {
            event.preventDefault();
            // Timeout is for preventing events firing on elements
            // standing one behind another (e.g. open and close button)
            setTimeout(function () {
                subModel[funName].call(subModel, event, el);
                executeWatchers();
            }, 100);
        }
    }

    function wrapEventListenerToOutsideClick(el, eventListener) {
        return function outsideClickEventListener(event) {
            var isClickInside = el.contains(event.target);
            if (!isClickInside) {
                eventListener(event);
            }
        }
    }

    function executeWatchers() {
        watchers.forEach(function (watcher) {
            watcher();
        });
    }

    function destroy() {
        watchers = null;
        destroyers.forEach(function (fn) {
            fn();
        })
    }

    return {
        executeWatchers: executeWatchers,
        destroy: destroy
    }

};
},{"./helpers/add-class":8,"./helpers/add-event-listener":9,"./helpers/get-all-elements-with-attribute":12,"./helpers/is-touch-screen":14,"./helpers/remove-class":15,"./helpers/remove-event-listener":16,"hammerjs":3}],29:[function(require,module,exports){
var pug = require('pug-runtime');
module.exports=template;function pug_attr(t,e,n,f){return e!==!1&&null!=e&&(e||"class"!==t&&"style"!==t)?e===!0?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||e.indexOf('"')===-1)?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;
;var locals_for_with = (locals || {});(function (backStory, context, creativeCommons, links, src) {
pug_html = pug_html + "\u003Cdiv class=\"fc-image\" data-4c-class=\"touch-screen: touched\" data-4c-on=\"click: showTools, clickOutside: hideTools\"\u003E";

pug_html = pug_html + "\u003Cimg" + (pug_attr("src", src, true, false)) + "\u002F\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-tools\" data-4c-class=\"collapsed: toolsHidden\"\u003E";

if (context && context.length) {

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-corner fc-btn-top-left\" data-4c-on=\"click: topLeftCorner.show\"\u003E";

pug_html = pug_html + "\u003Ci class=\"fc-icon fc-icon-context\"\u003E\u003C\u002Fi\u003E\u003C\u002Fbutton\u003E";
}

if (links && links.length) {

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-corner fc-btn-top-right\" data-4c-on=\"click: topRightCorner.show\"\u003E";

pug_html = pug_html + "\u003Ci class=\"fc-icon fc-icon-links\"\u003E\u003C\u002Fi\u003E\u003C\u002Fbutton\u003E";
}

if (backStory && backStory.text) {

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-corner fc-btn-bottom-left\" data-4c-on=\"click: bottomLeftCorner.show\"\u003E";

pug_html = pug_html + "\u003Ci class=\"fc-icon fc-icon-info\"\u003E\u003C\u002Fi\u003E\u003C\u002Fbutton\u003E";
}

if (creativeCommons && creativeCommons.formattedCopyright) {

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-corner fc-btn-bottom-right\" data-4c-on=\"click: bottomRightCorner.show\"\u003E";

pug_html = pug_html + "\u003Ci class=\"fc-icon fc-icon-copyright\"\u003E\u003C\u002Fi\u003E\u003C\u002Fbutton\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content\"\u003E";

if (context && context.length) {

pug_html = pug_html + "\u003Cdiv class=\"fc-content-container fc-content-fill\" data-4c-on=\"swipeLeft: topLeftCorner.selectNext, swipeRight: topLeftCorner.selectPrevious\" data-4c-class=\"visible: topLeftCorner.visible, pinned: topLeftCorner.pinned\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-gallery\" data-4c-class=\"expanded: !topLeftCorner.visible\"\u003E";

if (context.length > 1) {

pug_html = pug_html + "\u003Ca class=\"fc-gallery-controls fc-gallery-prev\" data-4c-on=\"click: topLeftCorner.selectPrevious, mouseover: topLeftCorner.preselectPrevious, mouseleave: topLeftCorner.clearPreselect\" data-4c-class=\"transparent: getPrevControllerHidden\"\u003E";

pug_html = pug_html + "\u003Ci class=\"fc-icon fc-icon-angle-left\"\u003E\u003C\u002Fi\u003E\u003C\u002Fa\u003E";
}

pug_html = pug_html + "\u003Cul data-4c-gallery-list=\"data-4c-gallery-list\"\u003E";

// iterate context
;(function(){
  var $$obj = context;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var item = $$obj[pug_index0];

pug_html = pug_html + "\u003Cli data-4c-on=\"click: topLeftCorner.selectItem\" data-4c-class=\"hover: topLeftCorner.getItemIsPreselected\" data-4c-gallery-item=\"data-4c-gallery-item\"\u003E";

pug_html = pug_html + "\u003Cspan class=\"fc-center-helper\"\u003E\u003C\u002Fspan\u003E";

if (item.src) {

pug_html = pug_html + "\u003Cimg" + (pug_attr("src", item.src, true, false)) + "\u002F\u003E";
}

if (item.youtube_id) {

pug_html = pug_html + "\u003Ciframe" + (" width=\"100%\" height=\"100%\""+pug_attr("src", "//www.youtube.com/embed/" + item.youtube_id + "?enablejsapi=1", true, false)+" data-4c-gallery-yt=\"data-4c-gallery-yt\" style=\"border:none;\"") + "\u003E\u003C\u002Fiframe\u003E";
}

if (item.vimeo_id) {

pug_html = pug_html + "\u003Ciframe" + (" width=\"100%\" height=\"100%\""+pug_attr("src", "//player.vimeo.com/video/" + item.vimeo_id, true, false)+" data-4c-gallery-yt=\"data-4c-gallery-yt\" style=\"border:none;\"") + "\u003E\u003C\u002Fiframe\u003E";
}
pug_html = pug_html + "\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var item = $$obj[pug_index0];

pug_html = pug_html + "\u003Cli data-4c-on=\"click: topLeftCorner.selectItem\" data-4c-class=\"hover: topLeftCorner.getItemIsPreselected\" data-4c-gallery-item=\"data-4c-gallery-item\"\u003E";

pug_html = pug_html + "\u003Cspan class=\"fc-center-helper\"\u003E\u003C\u002Fspan\u003E";

if (item.src) {

pug_html = pug_html + "\u003Cimg" + (pug_attr("src", item.src, true, false)) + "\u002F\u003E";
}

if (item.youtube_id) {

pug_html = pug_html + "\u003Ciframe" + (" width=\"100%\" height=\"100%\""+pug_attr("src", "//www.youtube.com/embed/" + item.youtube_id + "?enablejsapi=1", true, false)+" data-4c-gallery-yt=\"data-4c-gallery-yt\" style=\"border:none;\"") + "\u003E\u003C\u002Fiframe\u003E";
}

if (item.vimeo_id) {

pug_html = pug_html + "\u003Ciframe" + (" width=\"100%\" height=\"100%\""+pug_attr("src", "//player.vimeo.com/video/" + item.vimeo_id, true, false)+" data-4c-gallery-yt=\"data-4c-gallery-yt\" style=\"border:none;\"") + "\u003E\u003C\u002Fiframe\u003E";
}
pug_html = pug_html + "\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ful\u003E";

if (context.length > 1) {

pug_html = pug_html + "\u003Ca class=\"fc-gallery-controls fc-gallery-next\" data-4c-on=\"click: topLeftCorner.selectNext, mouseover: topLeftCorner.preselectNext, mouseleave: topLeftCorner.clearPreselect\" data-4c-class=\"transparent: getNextControllerHidden\"\u003E";

pug_html = pug_html + "\u003Ci class=\"fc-icon fc-icon-angle-right\"\u003E\u003C\u002Fi\u003E\u003C\u002Fa\u003E";
}

// iterate context
;(function(){
  var $$obj = context;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var item = $$obj[pug_index1];

if (item.credit) {

pug_html = pug_html + "\u003Cdiv class=\"fc-gallery-caption\" data-4c-gallery-caption=\"data-4c-gallery-caption\" data-4c-class=\"visible: topLeftCorner.getCaptionVisible\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-gallery-caption-text\"\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = item.credit) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
}
else {

pug_html = pug_html + "\u003Cdiv data-4c-gallery-caption=\"data-4c-gallery-caption\" data-4c-class=\"visible: topLeftCorner.getCaptionVisible\"\u003E\u003C\u002Fdiv\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index1 in $$obj) {
      $$l++;
      var item = $$obj[pug_index1];

if (item.credit) {

pug_html = pug_html + "\u003Cdiv class=\"fc-gallery-caption\" data-4c-gallery-caption=\"data-4c-gallery-caption\" data-4c-class=\"visible: topLeftCorner.getCaptionVisible\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-gallery-caption-text\"\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = item.credit) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
}
else {

pug_html = pug_html + "\u003Cdiv data-4c-gallery-caption=\"data-4c-gallery-caption\" data-4c-class=\"visible: topLeftCorner.getCaptionVisible\"\u003E\u003C\u002Fdiv\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fdiv\u003E";

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-corner fc-btn-top-right fc-gallery-close fc-btn-close\" data-4c-on=\"click: topLeftCorner.forceHide\" data-4c-class=\"visible: topLeftCorner.visible\"\u003E";

pug_html = pug_html + "&times;\u003C\u002Fbutton\u003E\u003C\u002Fdiv\u003E";
}

if (links && links.length) {

pug_html = pug_html + "\u003Cdiv class=\"fc-content-container fc-content-top-right\" data-4c-class=\"visible: topRightCorner.visible\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-body\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-text\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-header\"\u003E";

pug_html = pug_html + "\u003Ch1 class=\"fc-content-header-cell fc-content-header-title\"\u003E";

pug_html = pug_html + "Links\u003C\u002Fh1\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-header-cell\"\u003E";

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-close\" data-4c-on=\"click: topRightCorner.forceHide\" data-4c-class=\"visible: topRightCorner.visible\"\u003E";

pug_html = pug_html + "&times;\u003C\u002Fbutton\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";

// iterate links
;(function(){
  var $$obj = links;
  if ('number' == typeof $$obj.length) {
      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
        var item = $$obj[pug_index2];

pug_html = pug_html + "\u003Cp\u003E";

pug_html = pug_html + "\u003Ca" + (" class=\"fc-image-a\""+pug_attr("href", item.url, true, false)+" target=\"_blank\"") + "\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = item.title) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fp\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index2 in $$obj) {
      $$l++;
      var item = $$obj[pug_index2];

pug_html = pug_html + "\u003Cp\u003E";

pug_html = pug_html + "\u003Ca" + (" class=\"fc-image-a\""+pug_attr("href", item.url, true, false)+" target=\"_blank\"") + "\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = item.title) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fp\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
}

if (backStory && backStory.text) {

pug_html = pug_html + "\u003Cdiv class=\"fc-content-container fc-content-bottom-left\" data-4c-class=\"visible: bottomLeftCorner.visible\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-body\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-text\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-header\"\u003E";

pug_html = pug_html + "\u003Ch1 class=\"fc-content-header-cell fc-content-header-title\"\u003E";

pug_html = pug_html + "Backstory\u003C\u002Fh1\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-header-cell\"\u003E";

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-close\" data-4c-on=\"click: bottomLeftCorner.forceHide\" data-4c-class=\"visible: bottomLeftCorner.visible\"\u003E";

pug_html = pug_html + "&times;\u003C\u002Fbutton\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";

pug_html = pug_html + "\u003Cp\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = backStory.text) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";

pug_html = pug_html + "\u003Cp class=\"fc-content-subtitle\"\u003E";

if (backStory.author) {

pug_html = pug_html + (pug_escape(null == (pug_interp = backStory.author + (backStory.publication || backStory.date ? ', ' : '')) ? "" : pug_interp));
}

if (backStory.publication) {

if (backStory.publicationUrl) {

pug_html = pug_html + "\u003Ca" + (" class=\"fc-image-a\""+pug_attr("href", backStory.publicationUrl, true, false)+" target=\"_blank\"") + "\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = backStory.publication) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
}
else {

pug_html = pug_html + (pug_escape(null == (pug_interp = backStory.publication) ? "" : pug_interp));
}

pug_html = pug_html + (pug_escape(null == (pug_interp = backStory.date ? ', ' : '') ? "" : pug_interp));
}

if (backStory.date) {

pug_html = pug_html + (pug_escape(null == (pug_interp = backStory.date) ? "" : pug_interp));
}
pug_html = pug_html + "\u003C\u002Fp\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
}

if (creativeCommons && creativeCommons.formattedCopyright) {

pug_html = pug_html + "\u003Cdiv class=\"fc-content-container fc-content-bottom-right\" data-4c-class=\"visible: bottomRightCorner.visible\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-body\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-text\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-header\"\u003E";

pug_html = pug_html + "\u003Ch1 class=\"fc-content-header-cell fc-content-header-title\"\u003E";

pug_html = pug_html + "Information\u003C\u002Fh1\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-header-cell\"\u003E";

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-close\" data-4c-on=\"click: bottomRightCorner.forceHide\" data-4c-class=\"visible: bottomRightCorner.visible\"\u003E";

pug_html = pug_html + "&times;\u003C\u002Fbutton\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";

pug_html = pug_html + "\u003Cp\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = creativeCommons.description) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";

pug_html = pug_html + "\u003Cp class=\"fc-content-copyright\"\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = creativeCommons.formattedCopyright) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";

if (creativeCommons.codeOfEthics) {

pug_html = pug_html + "\u003C!--p.fc-code-of-ethics--\u003E";

pug_html = pug_html + "\u003Cp class=\"fc-content-header-cell fc-content-coe\"\u003E";

pug_html = pug_html + "\u003Cspan class=\"fc-content-header-cell fc-content-coetitle\"\u003E";

pug_html = pug_html + "Code of Ethics: \u003C\u002Fspan\u003E";

pug_html = pug_html + "\u003Cspan\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = creativeCommons.codeOfEthics) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E\u003C\u002Fp\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-footer\" data-4c-footer=\"data-4c-footer\"\u003E";

pug_html = pug_html + "\u003Ca href=\"https:\u002F\u002Ffourcorners.io\u002F\" target=\"_blank\"\u003E";

pug_html = pug_html + "\u003Ci class=\"fc-icon fc-icon-brand\"\u003E\u003C\u002Fi\u003E\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E";}.call(this,"backStory" in locals_for_with?locals_for_with.backStory:typeof backStory!=="undefined"?backStory:undefined,"context" in locals_for_with?locals_for_with.context:typeof context!=="undefined"?context:undefined,"creativeCommons" in locals_for_with?locals_for_with.creativeCommons:typeof creativeCommons!=="undefined"?creativeCommons:undefined,"links" in locals_for_with?locals_for_with.links:typeof links!=="undefined"?links:undefined,"src" in locals_for_with?locals_for_with.src:typeof src!=="undefined"?src:undefined));return pug_html;}

},{"fs":2,"pug-runtime":4}],30:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 02/08/2017.
 */

"use strict";

var getAllElementsWithAttribute = require("./helpers/get-all-elements-with-attribute"),
    wrapImgElement = require("./wrap-img-element"),
    baseAttr = "data-4c";

function wrapAllImgElementsOnPage() {
    var imgs = getAllElementsWithAttribute(baseAttr);
    imgs.forEach(function (el) {
        if (el.complete) {
            wrapImgElement(el);
        } else {
            el.onload = function () {
                wrapImgElement(el);
            }
        }
    });
}

module.exports = wrapAllImgElementsOnPage;
},{"./helpers/get-all-elements-with-attribute":12,"./wrap-img-element":33}],31:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

"use strict";

var template = require("./template.pug"),
    failedImageTemplate = require("./failed-image.pug"),
    copyStyle = require("./helpers/copy-style"),
    baseAttr = "data-4c",
    getAllElementsWithAttribute = require("./helpers/get-all-elements-with-attribute"),
    shortenText = require("./helpers/shorten-text"),
    addEventListener = require("./helpers/add-event-listener"),
    removeEventListener = require("./helpers/remove-event-listener"),
    css = require('../scss/main.scss');

module.exports = function (imageData) {
    var wrapperDiv = document.createElement("div"),
        iframe = document.createElement("iframe"),
        parentNode = this.parentNode,
        imgDom = this;

    styleWrapperDiv(imgDom, wrapperDiv);
    styleIframe(iframe);
    wrapperDiv.appendChild(iframe);
    if (wrapperDiv.style.getPropertyValue("display") === "inline") {
        wrapperDiv.style.display = "inline-block";
    }
    parentNode.replaceChild(wrapperDiv, imgDom);

    var iframeDocument = iframe.contentWindow.document;

    iframeDocument.open();
    // Set image src in data to render it in template
    imageData.src = this.src;
    iframeDocument.write(template(imageData));
    iframeDocument.head.appendChild(makeStyle());
    iframeDocument.close();

    treatFaultyImages(iframeDocument.body);
    adjustIframeHeightToFooter(iframe, wrapperDiv);
    var destroyListeners = listenToResize(imgDom, wrapperDiv, iframe);
    return {
        element: iframeDocument.body,
        destroy: function () {
            destroyListeners();
            if (wrapperDiv.parentNode == parentNode) {
                parentNode.replaceChild(imgDom, wrapperDiv);
            }
        }
    };
};

function listenToResize(imgDom, wrapperDiv, iframe) {
    var parentNode = wrapperDiv.parentNode, timeout;
    var resizeListener = function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            parentNode.appendChild(imgDom);
            styleWrapperDiv(imgDom, wrapperDiv);
            parentNode.removeChild(imgDom);
            adjustIframeHeightToFooter(iframe, wrapperDiv);
        }, 500);
    };
    addEventListener(window, "resize", resizeListener);
    /**
     * Return destroy event listener function
     */
    return function () {
        removeEventListener(window, "resize", resizeListener);
    };
}

function makeStyle() {
    var style = document.createElement("style");
    style.type = 'text/css';
    style.innerHTML = css;
    return style;
}

function adjustIframeHeightToFooter(iframe, wrapperDiv) {
    var footer = getAllElementsWithAttribute(baseAttr + "-footer", iframe.contentWindow.document)[0];
    wrapperDiv.style.height = wrapperDiv.offsetHeight + footer.offsetHeight + "px";
}

function styleIframe(iframe) {
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
}

function styleWrapperDiv(imgDom, div) {
    copyStyle(imgDom, div);
    // To support image border-radius
    div.style.overflow = "hidden";
    div.style.border = "1px solid #ddd";
}

function treatFaultyImages(div) {
    var galleryDom = getAllElementsWithAttribute(baseAttr + "-gallery-list", div)[0],
        galleryItemDoms = getAllElementsWithAttribute(baseAttr + "-gallery-item", galleryDom);
    galleryItemDoms.forEach(function (el) {
        var img = el.getElementsByTagName("img")[0];
        if (img) {
            img.onerror = function (e) {
                var html = failedImageTemplate({
                    shortSrc: shortenText(e.srcElement.currentSrc, 30, true),
                    fullSrc: e.srcElement.currentSrc
                });
                el.innerHTML = html;
            }
        }
    });
}
},{"../scss/main.scss":34,"./failed-image.pug":6,"./helpers/add-event-listener":9,"./helpers/copy-style":11,"./helpers/get-all-elements-with-attribute":12,"./helpers/remove-event-listener":16,"./helpers/shorten-text":17,"./template.pug":29}],32:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 02/08/2017.
 */

"use strict";

var dataIsValid = require("./image-data-is-valid"),
    wrapImage = require("./wrap-image"),
    imageModelFactory = require("./image-model"),
    setMainController = require("./set-main-controller"),
    amendImageData = require("./amend-image-data");


function wrapImgElementWithJson(imgDom, json, filePath) {
    if (!dataIsValid(filePath || "Four Corners - JSON", json)) {
        return;
    }
    amendImageData(json);

    var wrapped = wrapImage.call(imgDom, json),
        destroyContainer = wrapped.destroy,
        domContainer = wrapped.element,
        model = imageModelFactory(domContainer),
        controller = setMainController(domContainer, model),
        destroy = function () {
            controller.destroy();
            destroyContainer();
        };

    return FcInterfaceFactory(model, controller, destroy);
}

function FcInterfaceFactory(model, controller, fullDestroyFn) {
    var controller = controller,
        model = model;

    return {
        topLeft: new FcCornerInterface(model.topLeftCorner, controller),
        topRight: new FcCornerInterface(model.topRightCorner, controller),
        bottomLeft: new FcCornerInterface(model.bottomLeftCorner, controller),
        bottomRight: new CodeOfEthicsCornerInterface(model.bottomRightCorner, controller),
        destroy: fullDestroyFn
    };

}

function FcCornerInterface(cornerModel, controller) {

    var controller = controller,
        cornerModel = cornerModel;

    this.pin = function (pinned) {
        cornerModel.pin(pinned);
        controller.executeWatchers();
    };

}

function CodeOfEthicsCornerInterface(cornerModel, controller) {
    var controller = controller,
        cornerModel = cornerModel;

    this.pin = function (pinned) {
        cornerModel.pin(pinned);
        controller.executeWatchers();
    };

}

module.exports = wrapImgElementWithJson;

},{"./amend-image-data":5,"./image-data-is-valid":19,"./image-model":20,"./set-main-controller":28,"./wrap-image":31}],33:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 02/08/2017.
 */

"use strict";

var getImageData = require("./get-image-data"),
    getImageData = require("./get-image-data"),
    wrapImgElementWithJson = require("./wrap-img-element-with-json");

function wrapImgElement(imgDom) {
    getImageData.call(imgDom, function (imageData, filePath) {
        /**
         * Timeout is to let Internet Explorer to render the image first and calculate its' height
         */
        setTimeout(function () {
            wrapImgElementWithJson(imgDom, imageData, filePath);
        });
    });
}

module.exports = wrapImgElement;

},{"./get-image-data":7,"./wrap-img-element-with-json":32}],34:[function(require,module,exports){
module.exports = "body {\n  margin: 0;\n  overflow: hidden; }\n\nul {\n  margin-top: 0; }\n\n.fc-image {\n  position: relative;\n  overflow: hidden;\n  height: auto; }\n  .fc-image * {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box; }\n  .fc-image > img {\n    display: block;\n    width: 100%; }\n  .fc-image a {\n    color: #666666; }\n  .fc-image a:hover {\n    color: black; }\n\n.fc-footer {\n  text-align: right;\n  padding: 6px; }\n\n.fc-center-helper {\n  display: inline-block;\n  height: 100%;\n  vertical-align: middle; }\n\nbody {\n  font-size: 13px;\n  font-weight: 400;\n  line-height: 1.5;\n  -webkit-text-emphasis: initial;\n  -webkit-text-fill-color: initial;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif; }\n\nh1 {\n  font-size: 20px;\n  font-weight: 300;\n  margin: 0 0 4px 0; }\n\np {\n  margin: 0 0 4px;\n  text-align: justify; }\n\na {\n  color: #333;\n  opacity: 1;\n  -webkit-transition: opacity 0.1s linear;\n  -moz-transition: opacity 0.1s linear;\n  -ms-transition: opacity 0.1s linear;\n  -o-transition: opacity 0.1s linear;\n  transition: opacity 0.1s linear; }\n  a:hover, a:active, a:focus {\n    opacity: 1; }\n\n.fc-image {\n  color: #333; }\n\n.text-right {\n  text-align: right; }\n\n.fc-tools {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 1;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-transform: scale(1.5);\n  -moz-transform: scale(1.5);\n  -ms-transform: scale(1.5);\n  transform: scale(1.5);\n  opacity: 0;\n  -webkit-transition: opacity 0.3s linear, transform 0.2s linear;\n  -moz-transition: opacity 0.3s linear, transform 0.2s linear;\n  -ms-transition: opacity 0.3s linear, transform 0.2s linear;\n  -o-transition: opacity 0.3s linear, transform 0.2s linear;\n  transition: opacity 0.3s linear, transform 0.2s linear; }\n  .fc-tools:hover {\n    -webkit-transform: scale(1);\n    -moz-transform: scale(1);\n    -ms-transform: scale(1);\n    transform: scale(1);\n    opacity: 1; }\n  .touch-screen .fc-tools {\n    -webkit-transform: scale(1);\n    -moz-transform: scale(1);\n    -ms-transform: scale(1);\n    transform: scale(1);\n    opacity: 1; }\n  .fc-tools.collapsed {\n    -webkit-transform: scale(1.5);\n    -moz-transform: scale(1.5);\n    -ms-transform: scale(1.5);\n    transform: scale(1.5);\n    opacity: 0; }\n\n.fc-btn {\n  display: inline-block;\n  margin: 0;\n  text-align: center;\n  white-space: nowrap;\n  cursor: pointer;\n  color: #333;\n  background: #fff;\n  border: 1px solid transparent;\n  box-sizing: border-box;\n  border-radius: 50%;\n  font-size: 22px;\n  height: 35px;\n  width: 35px;\n  outline: none;\n  padding: 0;\n  opacity: 1;\n  -webkit-transition: opacity 0.1s linear;\n  -moz-transition: opacity 0.1s linear;\n  -ms-transition: opacity 0.1s linear;\n  -o-transition: opacity 0.1s linear;\n  transition: opacity 0.1s linear; }\n  .fc-btn:hover, .fc-btn:active, .fc-btn:focus {\n    opacity: 1; }\n  .fc-btn-corner {\n    z-index: 2;\n    position: absolute; }\n  .fc-btn-top-left {\n    top: 10px;\n    left: 10px; }\n  .fc-btn-top-right {\n    top: 10px;\n    right: 10px; }\n  .fc-btn-bottom-left {\n    bottom: 10px;\n    left: 10px; }\n  .fc-btn-bottom-right {\n    bottom: 10px;\n    right: 10px; }\n  .fc-btn-close {\n    z-index: 2;\n    border: none;\n    background: transparent;\n    font-size: 30px;\n    padding: 0 0 5px;\n    line-height: 1em;\n    vertical-align: top;\n    position: relative;\n    top: -5px;\n    right: -5px; }\n\n.fc-content {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 100%; }\n  .fc-content ::-webkit-scrollbar {\n    width: 0.5em;\n    height: 0.5em; }\n  .fc-content ::-webkit-scrollbar-thumb {\n    background: silver;\n    border-radius: 0.25em; }\n  .fc-content ::-webkit-scrollbar-track {\n    background: #e0e0e0; }\n  .fc-content body {\n    scrollbar-face-color: silver;\n    scrollbar-track-color: #e0e0e0; }\n  .fc-content-container {\n    position: absolute;\n    width: 100%;\n    max-width: 260px;\n    max-height: 100%;\n    opacity: 0;\n    color: #333;\n    overflow-y: auto;\n    overflow-x: hidden;\n    background: white;\n    -webkit-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    -ms-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .fc-content-container.visible, .fc-content-container.pinned {\n      opacity: 1;\n      z-index: 2; }\n  .fc-content-subtitle {\n    margin-top: 10px;\n    color: #888888; }\n  .fc-content-header {\n    display: table;\n    width: 100%;\n    border-bottom: 1px solid #efefef;\n    margin-bottom: 8px;\n    clear: both; }\n    .fc-content-header h1 {\n      float: left;\n      margin-top: -6px; }\n    .fc-content-header button {\n      float: right;\n      margin-bottom: -6px; }\n  .fc-content-body {\n    height: 100%;\n    width: 100%;\n    position: relative; }\n  .fc-content-text {\n    padding: 15px 15px 15px 10px;\n    position: relative;\n    z-index: 2;\n    text-align: left;\n    word-wrap: break-word; }\n  .fc-content-fill {\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    max-width: 100%; }\n  .fc-content-top-right {\n    top: 0;\n    right: 0; }\n  .fc-content-bottom-left {\n    bottom: 0;\n    left: 0; }\n  .fc-content-bottom-right {\n    bottom: 0;\n    right: 0; }\n  .fc-content-copyright {\n    display: inline-block;\n    color: #888888; }\n  .fc-content-coetitle {\n    font-variant: small-caps;\n    display: inline;\n    font-size: 13px; }\n  .fc-content-coe {\n    color: #888888; }\n\n.fc-tools {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 1;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-transform: scale(1.5);\n  -moz-transform: scale(1.5);\n  -ms-transform: scale(1.5);\n  transform: scale(1.5);\n  opacity: 0;\n  -webkit-transition: opacity 0.3s linear, transform 0.2s linear;\n  -moz-transition: opacity 0.3s linear, transform 0.2s linear;\n  -ms-transition: opacity 0.3s linear, transform 0.2s linear;\n  -o-transition: opacity 0.3s linear, transform 0.2s linear;\n  transition: opacity 0.3s linear, transform 0.2s linear; }\n  .fc-tools:hover {\n    -webkit-transform: scale(1);\n    -moz-transform: scale(1);\n    -ms-transform: scale(1);\n    transform: scale(1);\n    opacity: 1; }\n  .touch-screen .fc-tools {\n    -webkit-transform: scale(1);\n    -moz-transform: scale(1);\n    -ms-transform: scale(1);\n    transform: scale(1);\n    opacity: 1; }\n  .fc-tools.collapsed {\n    -webkit-transform: scale(1.5);\n    -moz-transform: scale(1.5);\n    -ms-transform: scale(1.5);\n    transform: scale(1.5);\n    opacity: 0; }\n\n.fc-btn {\n  display: inline-block;\n  margin: 0;\n  text-align: center;\n  white-space: nowrap;\n  cursor: pointer;\n  color: #333;\n  background: #fff;\n  border: 1px solid transparent;\n  box-sizing: border-box;\n  border-radius: 50%;\n  font-size: 22px;\n  height: 35px;\n  width: 35px;\n  outline: none;\n  padding: 0;\n  opacity: 1;\n  -webkit-transition: opacity 0.1s linear;\n  -moz-transition: opacity 0.1s linear;\n  -ms-transition: opacity 0.1s linear;\n  -o-transition: opacity 0.1s linear;\n  transition: opacity 0.1s linear; }\n  .fc-btn:hover, .fc-btn:active, .fc-btn:focus {\n    opacity: 1; }\n  .fc-btn-corner {\n    z-index: 2;\n    position: absolute; }\n  .fc-btn-top-left {\n    top: 10px;\n    left: 10px; }\n  .fc-btn-top-right {\n    top: 10px;\n    right: 10px; }\n  .fc-btn-bottom-left {\n    bottom: 10px;\n    left: 10px; }\n  .fc-btn-bottom-right {\n    bottom: 10px;\n    right: 10px; }\n  .fc-btn-close {\n    z-index: 2;\n    border: none;\n    background: transparent;\n    font-size: 30px;\n    padding: 0 0 5px;\n    line-height: 1em;\n    vertical-align: top;\n    position: relative;\n    top: -5px;\n    right: -5px; }\n\n.fc-gallery {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow: hidden; }\n  .fc-gallery-failed-image {\n    width: 100%;\n    height: 100%;\n    background: #000;\n    position: relative;\n    display: table; }\n    .fc-gallery-failed-image-caption {\n      display: table-cell;\n      vertical-align: middle;\n      font-size: 16px;\n      white-space: normal;\n      padding: 10px; }\n  .fc-gallery ul {\n    position: relative;\n    width: 100%;\n    height: 100%;\n    white-space: nowrap;\n    display: block;\n    margin: 0;\n    padding: 0;\n    -webkit-transform: scale(0.8);\n    -moz-transform: scale(0.8);\n    -ms-transform: scale(0.8);\n    transform: scale(0.8);\n    -webkit-transition: margin-left 0.15s linear;\n    -moz-transition: margin-left 0.15s linear;\n    -ms-transition: margin-left 0.15s linear;\n    -o-transition: margin-left 0.15s linear;\n    transition: margin-left 0.15s linear; }\n    .fc-gallery ul li {\n      display: inline-block;\n      vertical-align: middle;\n      cursor: pointer;\n      width: 100%;\n      height: 100%;\n      text-align: center; }\n      .fc-gallery ul li img,\n      .fc-gallery ul li iframe,\n      .fc-gallery ul li .fc-gallery-failed-image {\n        vertical-align: middle;\n        opacity: 0.7;\n        -webkit-transform: scale(0.9);\n        -moz-transform: scale(0.9);\n        -ms-transform: scale(0.9);\n        transform: scale(0.9);\n        -webkit-transition: transform 0.15s linear, opacity 0.15s linear;\n        -moz-transition: transform 0.15s linear, opacity 0.15s linear;\n        -ms-transition: transform 0.15s linear, opacity 0.15s linear;\n        -o-transition: transform 0.15s linear, opacity 0.15s linear;\n        transition: transform 0.15s linear, opacity 0.15s linear; }\n      .fc-gallery ul li img {\n        max-width: 100%;\n        max-height: 100%;\n        vertical-align: middle; }\n      .fc-gallery ul li.hover img,\n      .fc-gallery ul li.hover iframe,\n      .fc-gallery ul li.hover .fc-gallery-failed-image, .fc-gallery ul li:hover img,\n      .fc-gallery ul li:hover iframe,\n      .fc-gallery ul li:hover .fc-gallery-failed-image {\n        opacity: 0.85;\n        -webkit-transform: scale(0.92);\n        -moz-transform: scale(0.92);\n        -ms-transform: scale(0.92);\n        transform: scale(0.92); }\n      .fc-gallery ul li.hover .fc-gallery-failed-image, .fc-gallery ul li:hover .fc-gallery-failed-image {\n        opacity: 0.7; }\n      .fc-gallery ul li.selected {\n        cursor: default; }\n        .fc-gallery ul li.selected img,\n        .fc-gallery ul li.selected iframe,\n        .fc-gallery ul li.selected .fc-gallery-failed-image {\n          opacity: 1;\n          -webkit-transform: scale(1);\n          -moz-transform: scale(1);\n          -ms-transform: scale(1);\n          transform: scale(1); }\n      .fc-gallery ul li.selected .fc-gallery-failed-image {\n        opacity: 0.7; }\n  .fc-gallery.expanded ul li img,\n  .fc-gallery.expanded ul li iframe {\n    -webkit-transform: scale(1.25);\n    -moz-transform: scale(1.25);\n    -ms-transform: scale(1.25);\n    transform: scale(1.25); }\n  .fc-gallery-caption {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    text-align: center;\n    width: 100%;\n    display: none;\n    -webkit-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    -ms-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .fc-gallery-caption.visible {\n      display: block; }\n    .fc-gallery-caption-background {\n      width: 100%;\n      height: 100%;\n      position: absolute;\n      top: 0;\n      left: 0;\n      background: #fff;\n      opacity: 0.4; }\n    .fc-gallery-caption-text {\n      position: relative;\n      height: 100%;\n      width: 100%;\n      font-variant: small-caps; }\n  .fc-gallery-close {\n    display: none;\n    top: 0;\n    right: 0;\n    position: absolute; }\n    .fc-gallery-close.visible {\n      display: inline-block; }\n\na.fc-gallery-controls {\n  height: 100%;\n  width: 35px;\n  position: absolute;\n  top: 0;\n  z-index: 1;\n  display: block;\n  cursor: pointer;\n  color: #333;\n  opacity: 0.5;\n  -webkit-transition: opacity 0.1s linear;\n  -moz-transition: opacity 0.1s linear;\n  -ms-transition: opacity 0.1s linear;\n  -o-transition: opacity 0.1s linear;\n  transition: opacity 0.1s linear; }\n  a.fc-gallery-controls:hover, a.fc-gallery-controls:active, a.fc-gallery-controls:focus {\n    opacity: 0.8; }\n  a.fc-gallery-controls.transparent {\n    opacity: 0; }\n  a.fc-gallery-controls i {\n    position: absolute;\n    top: 50%;\n    left: 0;\n    margin-top: -35px;\n    font-size: 70px; }\n\na.fc-gallery-prev {\n  left: 0; }\n\na.fc-gallery-next {\n  right: 0; }\n\n.fc-image .fc-code-of-ethics {\n  background: #fff;\n  padding: 5px 10px; }\n  .fc-image .fc-code-of-ethics.visible {\n    display: block; }\n  .fc-image .fc-code-of-ethics-show {\n    text-decoration: none;\n    border-bottom: 1px dashed;\n    cursor: pointer;\n    -webkit-transition: color 0.1s linear;\n    -moz-transition: color 0.1s linear;\n    -ms-transition: color 0.1s linear;\n    -o-transition: color 0.1s linear;\n    transition: color 0.1s linear; }\n    .fc-image .fc-code-of-ethics-show.fc-image-a {\n      text-decoration: none; }\n\n.fc-icon {\n  vertical-align: middle;\n  display: inline-block;\n  height: 1em;\n  width: 1em;\n  background-repeat: no-repeat;\n  background-position: center; }\n  .fc-icon-brand {\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDYuMzYgODUuMzMiPjx0aXRsZT5CcmFuZCBJY29uIGZvciB3ZWI8L3RpdGxlPjxwb2x5bGluZSBwb2ludHM9IjYwMi44NyA0OS4wOCA2MDIuODcgODEuODUgNTcwLjA5IDgxLjg1IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojM2ZhOWY1O3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDo2Ljk3MzUzMzE1MzUzMzkzNTVweCIvPjxwb2x5bGluZSBwb2ludHM9IjU3MC4wOSAzLjQ5IDYwMi44NyAzLjQ5IDYwMi44NyAzNi4yNiIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6Ni45NzM1MzMxNTM1MzM5MzU1cHgiLz48cG9seWxpbmUgcG9pbnRzPSI1NTcuNDEgODEuODUgNTI0LjYzIDgxLjg1IDUyNC42MyA0OS4wOCIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6Ni45NzM1MzMxNTM1MzM5MzU1cHgiLz48cG9seWxpbmUgcG9pbnRzPSI1MjQuNjMgMzYuMjYgNTI0LjYzIDMuNDkgNTU3LjQxIDMuNDkiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOjYuOTczNTMzMTUzNTMzOTM1NXB4Ii8+PHBhdGggZD0iTTU0LjU2LDM4Ljd2NC43MkgzMi40OHYxMy40SDUxLjg0djQuNzJIMzIuNDhWODAuODZIMjYuODdWMzguN0g1NC41NloiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yNi44NyAtMTcuMDgpIi8+PHBhdGggZD0iTTY1LjU3LDUxLjQ4YTIwLjksMjAuOSwwLDAsMSwzLjgxLTcuMDYsMTguNiwxOC42LDAsMCwxLDYuMzItNC45LDIwLDIwLDAsMCwxLDguOC0xLjgzLDIwLDIwLDAsMCwxLDguOCwxLjgzLDE4LjYxLDE4LjYxLDAsMCwxLDYuMzIsNC45LDIwLjk0LDIwLjk0LDAsMCwxLDMuODEsNy4wNiwyNy43NCwyNy43NCwwLDAsMSwwLDE2LjU5LDIwLjkzLDIwLjkzLDAsMCwxLTMuODEsNy4wNkExOC4yOCwxOC4yOCwwLDAsMSw5My4zLDgwYTIwLjI0LDIwLjI0LDAsMCwxLTguOCwxLjhBMjAuMjQsMjAuMjQsMCwwLDEsNzUuNyw4MGExOC4yNiwxOC4yNiwwLDAsMS02LjMyLTQuODcsMjAuOSwyMC45LDAsMCwxLTMuODEtNy4wNkEyNy43NCwyNy43NCwwLDAsMSw2NS41Nyw1MS40OFptNS4xNywxNC41OWExNy4wNywxNy4wNywwLDAsMCwyLjYsNS41OCwxMy4yOCwxMy4yOCwwLDAsMCw0LjU1LDQsMTUuMjgsMTUuMjgsMCwwLDAsMTMuMjMsMCwxMy4yOSwxMy4yOSwwLDAsMCw0LjU1LTQsMTcuMDksMTcuMDksMCwwLDAsMi42LTUuNTgsMjQuMzMsMjQuMzMsMCwwLDAsMC0xMi41OCwxNy4wOSwxNy4wOSwwLDAsMC0yLjYtNS41OCwxMy4yOSwxMy4yOSwwLDAsMC00LjU1LTQsMTUuMjgsMTUuMjgsMCwwLDAtMTMuMjMsMCwxMy4yOCwxMy4yOCwwLDAsMC00LjU1LDQsMTcuMDcsMTcuMDcsMCwwLDAtMi42LDUuNThBMjQuMzMsMjQuMzMsMCwwLDAsNzAuNzQsNjYuMDdaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjYuODcgLTE3LjA4KSIvPjxwYXRoIGQ9Ik0xNDYuOCw3Ny43NnEtNC4zMSw0LTEyLjI4LDQtOC4xNSwwLTEyLjczLTMuODd0LTQuNTgtMTIuMzFWMzguN2g1LjYxVjY1LjYzcTAsNS42NywzLDguNTl0OC42OCwyLjkycTUuMzcsMCw4LjE4LTIuOTJ0Mi44MS04LjU5VjM4LjdoNS42MVY2NS42M1ExNTEuMTEsNzMuNzIsMTQ2LjgsNzcuNzZaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjYuODcgLTE3LjA4KSIvPjxwYXRoIGQ9Ik0xODUuODMsMzguN3E2LDAsOS40MiwzYTEwLjE2LDEwLjE2LDAsMCwxLDMuNCw4LjA5LDEyLjgsMTIuOCwwLDAsMS0xLjc0LDYuNzMsOSw5LDAsMCwxLTUuNTgsNHYwLjEyYTcuNTEsNy41MSwwLDAsMSwzLDEuMTgsNi40OSw2LjQ5LDAsMCwxLDEuODMsMiw5LDksMCwwLDEsMSwyLjU3LDI3LjM0LDI3LjM0LDAsMCwxLC41LDNxMC4xMiwxLjU0LjE4LDMuMTNhMjYuODUsMjYuODUsMCwwLDAsLjMsMy4xMywxOS4xMiwxOS4xMiwwLDAsMCwuNjgsMi45MkE3LjIsNy4yLDAsMCwwLDIwMC4xNSw4MWgtNi4yNmEzLjUxLDMuNTEsMCwwLDEtLjgtMS43NywxOCwxOCwwLDAsMS0uMjctMi41MXEtMC4wNi0xLjM5LS4xMi0zYTIwLjY5LDIwLjY5LDAsMCwwLS4zNS0zLjEzcS0wLjI0LTEuNTMtLjU5LTIuOTJhNi44Nyw2Ljg3LDAsMCwwLTEuMTItMi40Miw1LjU1LDUuNTUsMCwwLDAtMi0xLjY1LDcuNDUsNy40NSwwLDAsMC0zLjMxLS42MkgxNzEuNlY4MUgxNjZWMzguN2gxOS44M1pNMTg3LDU3LjgzYTguMTEsOC4xMSwwLDAsMCwzLjEtMS4xNSw2LjI5LDYuMjksMCwwLDAsMi4xMy0yLjMsNy43Myw3LjczLDAsMCwwLC44LTMuNzUsNy41Niw3LjU2LDAsMCwwLTEuNzctNS4ycS0xLjc3LTItNS43My0ySDE3MS42djE0LjdoMTEuNjlBMjIuNTcsMjIuNTcsMCwwLDAsMTg3LDU3LjgzWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI2Ljg3IC0xNy4wOCkiLz48cGF0aCBkPSJNMjM3LjgyLDQ0LjY2YTEzLDEzLDAsMCwwLTcuNjUtMi4yNCwxMy43LDEzLjcsMCwwLDAtNi40NywxLjQyLDEyLjc0LDEyLjc0LDAsMCwwLTQuNDMsMy44MSwxNi40MiwxNi40MiwwLDAsMC0yLjU3LDUuNDYsMjQuNCwyNC40LDAsMCwwLS44Myw2LjM4LDI3LjI5LDI3LjI5LDAsMCwwLC44Myw2LjgyLDE2LjI5LDE2LjI5LDAsMCwwLDIuNTcsNS42MSwxMi42NywxMi42NywwLDAsMCw0LjQ2LDMuODEsMTMuODgsMTMuODgsMCwwLDAsNi41LDEuNDIsMTIuNTEsMTIuNTEsMCwwLDAsNC45My0uOTIsMTEuMTUsMTEuMTUsMCwwLDAsMy43Mi0yLjU0LDExLjY3LDExLjY3LDAsMCwwLDIuNDUtMy44N0ExNi4wNywxNi4wNywwLDAsMCwyNDIuNCw2NUgyNDhxLTAuODMsOC01LjQ5LDEyLjR0LTEyLjc2LDQuNDNhMjAuMzIsMjAuMzIsMCwwLDEtOC41Ni0xLjY4LDE2LjgsMTYuOCwwLDAsMS02LjA4LTQuNjQsMTkuODgsMTkuODgsMCwwLDEtMy42My03LDI5LjcxLDI5LjcxLDAsMCwxLTEuMjEtOC42MiwyOC4xMywyOC4xMywwLDAsMSwxLjMtOC42NSwyMC44MywyMC44MywwLDAsMSwzLjgxLTcuMDYsMTcuNzUsMTcuNzUsMCwwLDEsNi4yNi00Ljc1LDIwLjE5LDIwLjE5LDAsMCwxLDguNTktMS43NCwyMS42OCwyMS42OCwwLDAsMSw2LjI2Ljg5LDE2Ljg1LDE2Ljg1LDAsMCwxLDUuMjYsMi42LDE0LjYzLDE0LjYzLDAsMCwxLDMuODQsNC4yOCwxNS43MiwxNS43MiwwLDAsMSwyLDUuOTRIMjQyQTEwLjQ0LDEwLjQ0LDAsMCwwLDIzNy44Miw0NC42NloiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yNi44NyAtMTcuMDgpIi8+PHBhdGggZD0iTTI1OS43OSw1MS40OGEyMC44OSwyMC44OSwwLDAsMSwzLjgxLTcuMDYsMTguNiwxOC42LDAsMCwxLDYuMzItNC45LDIyLjA2LDIyLjA2LDAsMCwxLDE3LjYsMCwxOC42MiwxOC42MiwwLDAsMSw2LjMyLDQuOSwyMC45MiwyMC45MiwwLDAsMSwzLjgxLDcuMDYsMjcuNzQsMjcuNzQsMCwwLDEsMCwxNi41OSwyMC45MSwyMC45MSwwLDAsMS0zLjgxLDcuMDZBMTguMjgsMTguMjgsMCwwLDEsMjg3LjUyLDgwYTIyLjM5LDIyLjM5LDAsMCwxLTE3LjYsMCwxOC4yNiwxOC4yNiwwLDAsMS02LjMyLTQuODcsMjAuODgsMjAuODgsMCwwLDEtMy44MS03LjA2QTI3LjcyLDI3LjcyLDAsMCwxLDI1OS43OSw1MS40OFpNMjY1LDY2LjA3YTE3LjA4LDE3LjA4LDAsMCwwLDIuNiw1LjU4LDEzLjI4LDEzLjI4LDAsMCwwLDQuNTUsNCwxNS4yNywxNS4yNywwLDAsMCwxMy4yMywwLDEzLjI4LDEzLjI4LDAsMCwwLDQuNTUtNCwxNy4wOCwxNy4wOCwwLDAsMCwyLjYtNS41OCwyNC4zMiwyNC4zMiwwLDAsMCwwLTEyLjU4LDE3LjA4LDE3LjA4LDAsMCwwLTIuNi01LjU4LDEzLjI4LDEzLjI4LDAsMCwwLTQuNTUtNCwxNS4yNywxNS4yNywwLDAsMC0xMy4yMywwLDEzLjI4LDEzLjI4LDAsMCwwLTQuNTUsNCwxNy4wOCwxNy4wOCwwLDAsMC0yLjYsNS41OEEyNC4zMiwyNC4zMiwwLDAsMCwyNjUsNjYuMDdaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjYuODcgLTE3LjA4KSIvPjxwYXRoIGQ9Ik0zMzEuNTEsMzguN3E2LDAsOS40MiwzYTEwLjE3LDEwLjE3LDAsMCwxLDMuNCw4LjA5LDEyLjgsMTIuOCwwLDAsMS0xLjc0LDYuNzMsOSw5LDAsMCwxLTUuNTgsNHYwLjEyYTcuNTIsNy41MiwwLDAsMSwzLDEuMTgsNi40OSw2LjQ5LDAsMCwxLDEuODMsMiw5LDksMCwwLDEsMSwyLjU3LDI3LjM0LDI3LjM0LDAsMCwxLC41LDNxMC4xMiwxLjU0LjE4LDMuMTNhMjcuMTcsMjcuMTcsMCwwLDAsLjI5LDMuMTMsMTkuMDcsMTkuMDcsMCwwLDAsLjY4LDIuOTJBNy4yMSw3LjIxLDAsMCwwLDM0NS44Miw4MWgtNi4yNmEzLjUxLDMuNTEsMCwwLDEtLjgtMS43NywxOC4xNiwxOC4xNiwwLDAsMS0uMjctMi41MXEtMC4wNi0xLjM5LS4xMi0zYTIwLjUsMjAuNSwwLDAsMC0uMzUtMy4xM3EtMC4yNC0xLjUzLS41OS0yLjkyYTYuODgsNi44OCwwLDAsMC0xLjEyLTIuNDIsNS41Niw1LjU2LDAsMCwwLTItMS42NUE3LjQ1LDcuNDUsMCwwLDAsMzMxLDYzSDMxNy4zVjgxaC01LjYxVjM4LjdoMTkuODJabTEuMTgsMTkuMTNhOC4xMSw4LjExLDAsMCwwLDMuMS0xLjE1LDYuMyw2LjMsMCwwLDAsMi4xMy0yLjMsNy43NCw3Ljc0LDAsMCwwLC44LTMuNzUsNy41Nyw3LjU3LDAsMCwwLTEuNzctNS4ycS0xLjc3LTItNS43My0ySDMxNy4yOHYxNC43SDMyOUEyMi41NiwyMi41NiwwLDAsMCwzMzIuNjksNTcuODNaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjYuODcgLTE3LjA4KSIvPjxwYXRoIGQ9Ik0zNjMuOTMsMzguN2wyMi4yLDM0LjE5aDAuMTJWMzguN2g1LjMyVjgwLjg2aC02LjE0TDM2My40LDQ3aC0wLjEyVjgwLjg2SDM1OFYzOC43aDUuOTNaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjYuODcgLTE3LjA4KSIvPjxwYXRoIGQ9Ik00MzUuNjcsMzguN3Y0LjcyaC0yMy41djEzLjRoMjEuOTF2NC43Mkg0MTIuMTd2MTQuNmgyMy42OHY0LjcySDQwNi41NlYzOC43aDI5LjExWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI2Ljg3IC0xNy4wOCkiLz48cGF0aCBkPSJNNDY4LjM5LDM4LjdxNiwwLDkuNDIsM2ExMC4xNywxMC4xNywwLDAsMSwzLjQsOC4wOSwxMi44LDEyLjgsMCwwLDEtMS43NCw2LjczLDksOSwwLDAsMS01LjU4LDR2MC4xMmE3LjUyLDcuNTIsMCwwLDEsMywxLjE4LDYuNDksNi40OSwwLDAsMSwxLjgzLDIsOSw5LDAsMCwxLDEsMi41NywyNy4zNCwyNy4zNCwwLDAsMSwuNSwzcTAuMTIsMS41NC4xOCwzLjEzYTI3LjE3LDI3LjE3LDAsMCwwLC4yOSwzLjEzLDE5LjA3LDE5LjA3LDAsMCwwLC42OCwyLjkyQTcuMjEsNy4yMSwwLDAsMCw0ODIuNyw4MWgtNi4yNmEzLjUxLDMuNTEsMCwwLDEtLjgtMS43NywxOC4xNiwxOC4xNiwwLDAsMS0uMjctMi41MXEtMC4wNi0xLjM5LS4xMi0zYTIwLjUsMjAuNSwwLDAsMC0uMzUtMy4xM3EtMC4yNC0xLjUzLS41OS0yLjkyYTYuODgsNi44OCwwLDAsMC0xLjEyLTIuNDIsNS41Niw1LjU2LDAsMCwwLTItMS42NSw3LjQ1LDcuNDUsMCwwLDAtMy4zMS0uNjJoLTEzLjdWODFoLTUuNjFWMzguN2gxOS44MlptMS4xOCwxOS4xM2E4LjExLDguMTEsMCwwLDAsMy4xLTEuMTUsNi4zLDYuMywwLDAsMCwyLjEzLTIuMyw3Ljc0LDcuNzQsMCwwLDAsLjgtMy43NSw3LjU3LDcuNTcsMCwwLDAtMS43Ny01LjJxLTEuNzctMi01LjczLTJINDU0LjE2djE0LjdoMTEuNjlBMjIuNTYsMjIuNTYsMCwwLDAsNDY5LjU3LDU3LjgzWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI2Ljg3IC0xNy4wOCkiLz48cGF0aCBkPSJNNTE2LDQ0LjQ2YTExLjksMTEuOSwwLDAsMC03LjE3LTIsMTcuMTUsMTcuMTUsMCwwLDAtMy40OC4zNSw5LjI1LDkuMjUsMCwwLDAtMywxLjE4LDYuMjEsNi4yMSwwLDAsMC0yLjEzLDIuMjEsNi44NSw2Ljg1LDAsMCwwLS44LDMuNDUsNC4zOSw0LjM5LDAsMCwwLDEuMTUsMy4xNiw4LjUyLDguNTIsMCwwLDAsMy4wNywyQTI1LjY4LDI1LjY4LDAsMCwwLDUwOCw1NnEyLjQyLDAuNSw0LjkzLDEuMDl0NC45MywxLjM5YTE2LjI5LDE2LjI5LDAsMCwxLDQuMzQsMi4xNiwxMC4yNywxMC4yNywwLDAsMSwzLjA3LDMuNDIsMTIsMTIsMCwwLDEtLjM1LDExLDEyLjQxLDEyLjQxLDAsMCwxLTMuODcsMy45LDE2Ljg0LDE2Ljg0LDAsMCwxLTUuMjksMi4xOCwyNS42OCwyNS42OCwwLDAsMS01LjgyLjY4LDI0LjczLDI0LjczLDAsMCwxLTYuNy0uODksMTYuNTMsMTYuNTMsMCwwLDEtNS41NS0yLjY5LDEyLjczLDEyLjczLDAsMCwxLTMuNzgtNC42MUExNC44MywxNC44MywwLDAsMSw0OTIuNDgsNjdoNS4zMWE5LjUxLDkuNTEsMCwwLDAsMSw0LjU4LDkuMzksOS4zOSwwLDAsMCwyLjcyLDMuMTYsMTEuNDUsMTEuNDUsMCwwLDAsMy45MywxLjgzLDE4LDE4LDAsMCwwLDQuNjEuNTksMjAuOTMsMjAuOTMsMCwwLDAsMy44MS0uMzUsMTEuMiwxMS4yLDAsMCwwLDMuNDUtMS4yMSw2LjQ4LDYuNDgsMCwwLDAsMy40My02LjExQTUuMjksNS4yOSwwLDAsMCw1MTkuNTksNjZhOC40OCw4LjQ4LDAsMCwwLTMuMDctMi4yMSwyMi41NCwyMi41NCwwLDAsMC00LjM0LTEuMzlsLTQuOTMtMS4wOXEtMi41MS0uNTYtNC45My0xLjNBMTcuODEsMTcuODEsMCwwLDEsNDk4LDU4YTkuMzIsOS4zMiwwLDAsMS0zLjA3LTMuMTNBOS4yMiw5LjIyLDAsMCwxLDQ5My43OCw1MGExMS4xNywxMS4xNywwLDAsMSwxLjMtNS41MiwxMS4zNCwxMS4zNCwwLDAsMSwzLjQ1LTMuODQsMTUuNTIsMTUuNTIsMCwwLDEsNC45LTIuMjQsMjEuNjUsMjEuNjUsMCwwLDEsNS42NC0uNzQsMjIuNTksMjIuNTksMCwwLDEsNiwuNzdBMTMuNjYsMTMuNjYsMCwwLDEsNTIwLDQwLjg4LDExLjY5LDExLjY5LDAsMCwxLDUyMy4yOCw0NWExNC45LDE0LjksMCwwLDEsMS4zMyw2SDUxOS4zUTUxOC44Miw0Ni40OSw1MTYsNDQuNDZaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjYuODcgLTE3LjA4KSIvPjwvc3ZnPg==);\n    width: 121px;\n    height: 17px; }\n  .fc-icon-context {\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48dGl0bGU+ZmMtaWNvbi1jb250ZXh0PC90aXRsZT48cGF0aCBkPSJNMTAuMjYsNzB2NjBILTE1LjFWNzBIMTAuMjZtMTAtMTBILTI1LjF2ODBIMjAuMjZWNjBoMFoiLz48cGF0aCBkPSJNMjE1LjE2LDY5Ljk0djYwLjEySDE4OS42OFY2OS45NGgyNS40OE0yMjUuMSw2MEgxNzkuNzR2ODBIMjI1LjFWNjBoMFoiLz48cGF0aCBkPSJNMTU4Ljc0LDU3djg2SDQxLjI4VjU3SDE1OC43NG0xMi0xMkgyOS4yOFYxNTVIMTcwLjc0VjQ1aDBaIi8+PGNpcmNsZSBjeD0iNjUuNjkiIGN5PSI4My4wMyIgcj0iMTEuMTgiLz48cG9seWdvbiBwb2ludHM9IjU0LjUxIDEzMyAxNDUuNTEgMTMzIDEzMy4xOCA5Mi4zMyAxMjQuNjggOTUuMzMgMTE2LjAxIDgwLjE3IDkwLjM0IDExNi4zMyA3Ni42IDEwOC44MyA1NC41MSAxMzMiLz48L3N2Zz4=); }\n  .fc-icon-info {\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NyAxMzYuMzIiPjx0aXRsZT5Db250ZXh0IGljb24gZm9yIHdlYjwvdGl0bGU+PHBhdGggZD0iTTExNC4zMSwxNTMuMzdjLTAuMiwyLjMtLjQsNC43NC0wLjY0LDcuMTZhMS4xLDEuMSwwLDAsMS0uNDQuNjljLTYuNDUsNC40Mi0xMy40Myw3LjMyLTIxLjQxLDcuMDlhMTUuNzIsMTUuNzIsMCwwLDEtMTAuMjYtMy43M2MtMy4zMS0yLjkxLTQuNjktNi43NC01LTExLTAuNDYtNi43OSwxLjIyLTEzLjIsMy44NC0xOS4zN3M1LjYtMTIuMzksOC4zMy0xOC42MkE3Mi44LDcyLjgsMCwwLDAsOTQsOTkuNGEyMy43MSwyMy43MSwwLDAsMCwuMDktOS4zMmMtMC45Mi00LjI5LTMuODctNi40NS04LjI0LTUuOUE0OC4yNiw0OC4yNiwwLDAsMCw4MSw4NS4yNGMtMC4yNS4wNi0uNDksMC4xNC0wLjg4LDAuMjZsMC4zNy00LjE0YTIuNTEsMi41MSwwLDAsMCwuMDYtMC40OGMtMC4yNC0yLjA2LjktMy4yLDIuNTEtNC4yNkM4OCw3My40OCw5Myw3MSw5OC43Nyw3MC4wOUEyMCwyMCwwLDAsMSwxMTAsNzEuMzRhMTMuNTgsMTMuNTgsMCwwLDEsOC40NSwxMS4xMmMwLjgyLDUuMzIsMCwxMC41Mi0xLjI4LDE1LjY3LTIuMjgsOS4yNy02LDE4LTkuOTQsMjYuNjYtMS45NSw0LjMzLTQuMjMsOC41Mi01LjQ2LDEzLjE0YTI1LjY4LDI1LjY4LDAsMCwwLTEuMTMsOS4zNWMwLjQzLDQuMTksMy4wOCw2Ljc5LDcuMjcsNi43N0E2Mi4wOSw2Mi4wOSwwLDAsMCwxMTQuMzEsMTUzLjM3WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTc2LjQ4IC0zMikiLz48cGF0aCBkPSJNMTIzLjQ4LDQ0Ljg0QTEyLjgxLDEyLjgxLDAsMSwxLDExMC43LDMyaDAuMDZhMTIuNzUsMTIuNzUsMCwwLDEsMTIuNzIsMTIuNzh2MC4wNloiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC03Ni40OCAtMzIpIi8+PC9zdmc+); }\n  .fc-icon-links {\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMzYuMzQgMTM2LjM2Ij48dGl0bGU+ZmMtaWNvbi1saW5rczwvdGl0bGU+PHBhdGggZD0iTTg4LjI2LDUyLjlsNy4xNiw3LjE2YTIxLjE5LDIxLjE5LDAsMCwxLDAsMjkuODhMNTQuNTksMTMwLjc3YTIxLjE5LDIxLjE5LDAsMCwxLTI5Ljg4LDBsLTUuNDctNS40N2EyMS4xOSwyMS4xOSwwLDAsMSwwLTI5Ljg4TDMwLjgyLDgzLjg0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNi44MyAtNi44MikiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOjEyLjQ5NjAwMDI4OTkxNjk5MnB4Ii8+PHBhdGggZD0iTTYxLjc0LDk3LjFsLTcuMTYtNy4xNmEyMS4xOSwyMS4xOSwwLDAsMSwwLTI5Ljg4TDk1LjQxLDE5LjIzYTIxLjE5LDIxLjE5LDAsMCwxLDI5Ljg4LDBsNS40Nyw1LjQ3YTIxLjE5LDIxLjE5LDAsMCwxLDAsMjkuODhMMTE5LjE5LDY2LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNi44MyAtNi44MikiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOjEyLjQ5NjAwMDI4OTkxNjk5MnB4Ii8+PC9zdmc+); }\n  .fc-icon-copyright {\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTIgMTUyIj48dGl0bGU+ZmMtaWNvbi1jb3B5cmlnaHQ8L3RpdGxlPjxjaXJjbGUgY3g9Ijc2IiBjeT0iNzYiIHI9IjcwIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDoxMnB4Ii8+PHBhdGggZD0iTTExOC4zNyw4Mi41M2ExNi43NCwxNi43NCwwLDAsMC02LjE3LTQuNjksMjAuNTMsMjAuNTMsMCwwLDAtOC40Ni0xLjY0LDIxLjE3LDIxLjE3LDAsMCwwLTE2LDcsMjQuMTcsMjQuMTcsMCwwLDAtNC43NCw4LDMwLjE3LDMwLjE3LDAsMCwwLDAsMTkuOTIsMjQuNzksMjQuNzksMCwwLDAsNC42NCw3Ljg2LDIxLDIxLDAsMCwwLDYuOTMsNS4xOSwyMCwyMCwwLDAsMCw4LjU3LDEuODYsMTkuMiwxOS4yLDAsMCwwLDkuMjgtMi4xOCwxOC40OCwxOC40OCwwLDAsMCw2LjY2LTYuMTFsMTQuMTksMTAuNTlhMjkuNTUsMjkuNTUsMCwwLDEtMTIuNDUsMTAuMTUsMzguNTIsMzguNTIsMCwwLDEtMTUuNSwzLjI4LDQ3LjYyLDQ3LjYyLDAsMCwxLTE2LjctMi44NCwzOC4yLDM4LjIsMCwwLDEtMTMuMjEtOC4xMywzNi44NywzNi44NywwLDAsMS04LjY4LTEyLjgzLDQzLjY2LDQzLjY2LDAsMCwxLTMuMTEtMTYuODFBNDMuNjYsNDMuNjYsMCwwLDEsNjYuNzMsODQuM2EzNi44OCwzNi44OCwwLDAsMSw4LjY4LTEyLjgzLDM4LjI2LDM4LjI2LDAsMCwxLDEzLjIxLTguMTMsNDcuNjIsNDcuNjIsMCwwLDEsMTYuNy0yLjg0LDQxLDQxLDAsMCwxLDYuODIuNiwzNi45MywzNi45MywwLDAsMSw3LDEuOTEsMzEuMjEsMzEuMjEsMCwwLDEsNi42MSwzLjQ5LDI2LjMzLDI2LjMzLDAsMCwxLDUuNjgsNS4zNVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yNCAtMjQpIi8+PC9zdmc+); }\n  .fc-icon-angle-right {\n    width: 0.5em;\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5MS4zIDI5NS44OCI+PHRpdGxlPkNoZXZyb24gcmlnaHQgaWNvbiBmb3Igd2ViPC90aXRsZT48cG9seWxpbmUgcG9pbnRzPSI4LjUzIDQuMjggODAuNjMgMTQ3Ljk0IDguNTMgMjkxLjYiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOjE5LjA4MzgzNzUwOTE1NTI3M3B4Ii8+PC9zdmc+); }\n  .fc-icon-angle-left {\n    width: 0.5em;\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5MS4zIDI5NS44OCI+PHRpdGxlPkNoZXZyb24gbGVmdCBpY29uIGZvciB3ZWI8L3RpdGxlPjxwb2x5bGluZSBwb2ludHM9IjgyLjc4IDI5MS42IDEwLjY4IDE0Ny45NCA4Mi43OCA0LjI4IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDoxOS4wODM4Mzc1MDkxNTUyNzNweCIvPjwvc3ZnPg==); }\n\n/*# sourceMappingURL=main.scss.map */";
},{}]},{},[22])(22)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2hhbW1lcmpzL2hhbW1lci5qcyIsIm5vZGVfbW9kdWxlcy9wdWctcnVudGltZS9pbmRleC5qcyIsInNyYy9qcy9hbWVuZC1pbWFnZS1kYXRhLmpzIiwiRDpcXFxcUmVzZWFyY2hcXFxcNGMtbGliXFxcXGZvdXJjb3JuZXJzXFxcXHNyY1xcXFxqc1xcXFxmYWlsZWQtaW1hZ2UucHVnIiwic3JjL2pzL2dldC1pbWFnZS1kYXRhLmpzIiwic3JjL2pzL2hlbHBlcnMvYWRkLWNsYXNzLmpzIiwic3JjL2pzL2hlbHBlcnMvYWRkLWV2ZW50LWxpc3RlbmVyLmpzIiwic3JjL2pzL2hlbHBlcnMvYWRkLXN3aXBlLWV2ZW50cy5qcyIsInNyYy9qcy9oZWxwZXJzL2NvcHktc3R5bGUuanMiLCJzcmMvanMvaGVscGVycy9nZXQtYWxsLWVsZW1lbnRzLXdpdGgtYXR0cmlidXRlLmpzIiwic3JjL2pzL2hlbHBlcnMvZ2V0LWVsZW1lbnQtc3R5bGUuanMiLCJzcmMvanMvaGVscGVycy9pcy10b3VjaC1zY3JlZW4uanMiLCJzcmMvanMvaGVscGVycy9yZW1vdmUtY2xhc3MuanMiLCJzcmMvanMvaGVscGVycy9yZW1vdmUtZXZlbnQtbGlzdGVuZXIuanMiLCJzcmMvanMvaGVscGVycy9zaG9ydGVuLXRleHQuanMiLCJzcmMvanMvaGVscGVycy94bWwtdG8tanNvbi5qcyIsInNyYy9qcy9pbWFnZS1kYXRhLWlzLXZhbGlkLmpzIiwic3JjL2pzL2ltYWdlLW1vZGVsLmpzIiwic3JjL2pzL2luZGV4LW5wbS5qcyIsInNyYy9qcy9pbmRleC5qcyIsInNyYy9qcy9wb2x5ZmlsbHMvYWRkLWV2ZW50LWxpc3RlbmVyLmpzIiwic3JjL2pzL3BvbHlmaWxscy9maWx0ZXIuanMiLCJzcmMvanMvcG9seWZpbGxzL2Zvci1lYWNoLmpzIiwic3JjL2pzL3BvbHlmaWxscy9pbmRleC5qcyIsInNyYy9qcy9wb2x5ZmlsbHMvbWFwLmpzIiwic3JjL2pzL3NldC1tYWluLWNvbnRyb2xsZXIuanMiLCJEOlxcXFxSZXNlYXJjaFxcXFw0Yy1saWJcXFxcZm91cmNvcm5lcnNcXFxcc3JjXFxcXGpzXFxcXHRlbXBsYXRlLnB1ZyIsInNyYy9qcy93cmFwLWFsbC1pbWctZWxlbWVudHMtb24tcGFnZS5qcyIsInNyYy9qcy93cmFwLWltYWdlLmpzIiwic3JjL2pzL3dyYXAtaW1nLWVsZW1lbnQtd2l0aC1qc29uLmpzIiwic3JjL2pzL3dyYXAtaW1nLWVsZW1lbnQuanMiLCJzcmMvc2Nzcy9tYWluLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25sRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMxRUE7O0FBQ0E7O0FBQ0E7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQUE7O0FBQUE7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUMxT0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7OztBQUNBOztBQUNBOztBQUNBOzs7QUFDQTs7QUFDQTs7QUFDQTs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7O0FBQ0E7O0FBQ0E7Ozs7Ozs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7O0FBQ0E7O0FBQ0E7OztBQUlBOztBQUNBOzs7Ozs7Ozs7O0FBWkE7O0FBR0E7O0FBQ0E7O0FBQ0E7OztBQUNBOztBQUNBOzs7QUFJQTs7QUFDQTs7Ozs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7OztBQUNBOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTs7Ozs7Ozs7O0FBTEE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTs7Ozs7Ozs7QUFDQTs7QUFDQTs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFBQTs7Ozs7Ozs7QUFEQTs7QUFDQTs7QUFBQTs7Ozs7Ozs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQUE7Ozs7QUFFQTs7O0FBQ0E7OztBQUNBOztBQUNBOzs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUFBOztBQUNBOztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUFBOztBQUNBOztBQUFBOzs7Ozs7QUFFQTs7QUFDQTs7QUFDQTs7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIiLCIvKiEgSGFtbWVyLkpTIC0gdjIuMC43IC0gMjAxNi0wNC0yMlxuICogaHR0cDovL2hhbW1lcmpzLmdpdGh1Yi5pby9cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgSm9yaWsgVGFuZ2VsZGVyO1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgZXhwb3J0TmFtZSwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxudmFyIFZFTkRPUl9QUkVGSVhFUyA9IFsnJywgJ3dlYmtpdCcsICdNb3onLCAnTVMnLCAnbXMnLCAnbyddO1xudmFyIFRFU1RfRUxFTUVOVCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG52YXIgVFlQRV9GVU5DVElPTiA9ICdmdW5jdGlvbic7XG5cbnZhciByb3VuZCA9IE1hdGgucm91bmQ7XG52YXIgYWJzID0gTWF0aC5hYnM7XG52YXIgbm93ID0gRGF0ZS5ub3c7XG5cbi8qKlxuICogc2V0IGEgdGltZW91dCB3aXRoIGEgZ2l2ZW4gc2NvcGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZW91dFxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIHNldFRpbWVvdXRDb250ZXh0KGZuLCB0aW1lb3V0LCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoYmluZEZuKGZuLCBjb250ZXh0KSwgdGltZW91dCk7XG59XG5cbi8qKlxuICogaWYgdGhlIGFyZ3VtZW50IGlzIGFuIGFycmF5LCB3ZSB3YW50IHRvIGV4ZWN1dGUgdGhlIGZuIG9uIGVhY2ggZW50cnlcbiAqIGlmIGl0IGFpbnQgYW4gYXJyYXkgd2UgZG9uJ3Qgd2FudCB0byBkbyBhIHRoaW5nLlxuICogdGhpcyBpcyB1c2VkIGJ5IGFsbCB0aGUgbWV0aG9kcyB0aGF0IGFjY2VwdCBhIHNpbmdsZSBhbmQgYXJyYXkgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp8QXJyYXl9IGFyZ1xuICogQHBhcmFtIHtTdHJpbmd9IGZuXG4gKiBAcGFyYW0ge09iamVjdH0gW2NvbnRleHRdXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaW52b2tlQXJyYXlBcmcoYXJnLCBmbiwgY29udGV4dCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcbiAgICAgICAgZWFjaChhcmcsIGNvbnRleHRbZm5dLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiB3YWxrIG9iamVjdHMgYW5kIGFycmF5c1xuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKi9cbmZ1bmN0aW9uIGVhY2gob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciBpO1xuXG4gICAgaWYgKCFvYmopIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChvYmouZm9yRWFjaCkge1xuICAgICAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmIChvYmoubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgb2JqLmxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaik7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgaW4gb2JqKSB7XG4gICAgICAgICAgICBvYmouaGFzT3duUHJvcGVydHkoaSkgJiYgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogd3JhcCBhIG1ldGhvZCB3aXRoIGEgZGVwcmVjYXRpb24gd2FybmluZyBhbmQgc3RhY2sgdHJhY2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uIHdyYXBwaW5nIHRoZSBzdXBwbGllZCBtZXRob2QuXG4gKi9cbmZ1bmN0aW9uIGRlcHJlY2F0ZShtZXRob2QsIG5hbWUsIG1lc3NhZ2UpIHtcbiAgICB2YXIgZGVwcmVjYXRpb25NZXNzYWdlID0gJ0RFUFJFQ0FURUQgTUVUSE9EOiAnICsgbmFtZSArICdcXG4nICsgbWVzc2FnZSArICcgQVQgXFxuJztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlID0gbmV3IEVycm9yKCdnZXQtc3RhY2stdHJhY2UnKTtcbiAgICAgICAgdmFyIHN0YWNrID0gZSAmJiBlLnN0YWNrID8gZS5zdGFjay5yZXBsYWNlKC9eW15cXChdKz9bXFxuJF0vZ20sICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL15cXHMrYXRcXHMrL2dtLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eT2JqZWN0Ljxhbm9ueW1vdXM+XFxzKlxcKC9nbSwgJ3thbm9ueW1vdXN9KClAJykgOiAnVW5rbm93biBTdGFjayBUcmFjZSc7XG5cbiAgICAgICAgdmFyIGxvZyA9IHdpbmRvdy5jb25zb2xlICYmICh3aW5kb3cuY29uc29sZS53YXJuIHx8IHdpbmRvdy5jb25zb2xlLmxvZyk7XG4gICAgICAgIGlmIChsb2cpIHtcbiAgICAgICAgICAgIGxvZy5jYWxsKHdpbmRvdy5jb25zb2xlLCBkZXByZWNhdGlvbk1lc3NhZ2UsIHN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBleHRlbmQgb2JqZWN0LlxuICogbWVhbnMgdGhhdCBwcm9wZXJ0aWVzIGluIGRlc3Qgd2lsbCBiZSBvdmVyd3JpdHRlbiBieSB0aGUgb25lcyBpbiBzcmMuXG4gKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0XG4gKiBAcGFyYW0gey4uLk9iamVjdH0gb2JqZWN0c190b19hc3NpZ25cbiAqIEByZXR1cm5zIHtPYmplY3R9IHRhcmdldFxuICovXG52YXIgYXNzaWduO1xuaWYgKHR5cGVvZiBPYmplY3QuYXNzaWduICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgYXNzaWduID0gZnVuY3Rpb24gYXNzaWduKHRhcmdldCkge1xuICAgICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvdXRwdXQgPSBPYmplY3QodGFyZ2V0KTtcbiAgICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKHNvdXJjZSAhPT0gdW5kZWZpbmVkICYmIHNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5leHRLZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkobmV4dEtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFtuZXh0S2V5XSA9IHNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH07XG59IGVsc2Uge1xuICAgIGFzc2lnbiA9IE9iamVjdC5hc3NpZ247XG59XG5cbi8qKlxuICogZXh0ZW5kIG9iamVjdC5cbiAqIG1lYW5zIHRoYXQgcHJvcGVydGllcyBpbiBkZXN0IHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgdGhlIG9uZXMgaW4gc3JjLlxuICogQHBhcmFtIHtPYmplY3R9IGRlc3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBzcmNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW21lcmdlPWZhbHNlXVxuICogQHJldHVybnMge09iamVjdH0gZGVzdFxuICovXG52YXIgZXh0ZW5kID0gZGVwcmVjYXRlKGZ1bmN0aW9uIGV4dGVuZChkZXN0LCBzcmMsIG1lcmdlKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhzcmMpO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IGtleXMubGVuZ3RoKSB7XG4gICAgICAgIGlmICghbWVyZ2UgfHwgKG1lcmdlICYmIGRlc3Rba2V5c1tpXV0gPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIGRlc3Rba2V5c1tpXV0gPSBzcmNba2V5c1tpXV07XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICByZXR1cm4gZGVzdDtcbn0sICdleHRlbmQnLCAnVXNlIGBhc3NpZ25gLicpO1xuXG4vKipcbiAqIG1lcmdlIHRoZSB2YWx1ZXMgZnJvbSBzcmMgaW4gdGhlIGRlc3QuXG4gKiBtZWFucyB0aGF0IHByb3BlcnRpZXMgdGhhdCBleGlzdCBpbiBkZXN0IHdpbGwgbm90IGJlIG92ZXJ3cml0dGVuIGJ5IHNyY1xuICogQHBhcmFtIHtPYmplY3R9IGRlc3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBzcmNcbiAqIEByZXR1cm5zIHtPYmplY3R9IGRlc3RcbiAqL1xudmFyIG1lcmdlID0gZGVwcmVjYXRlKGZ1bmN0aW9uIG1lcmdlKGRlc3QsIHNyYykge1xuICAgIHJldHVybiBleHRlbmQoZGVzdCwgc3JjLCB0cnVlKTtcbn0sICdtZXJnZScsICdVc2UgYGFzc2lnbmAuJyk7XG5cbi8qKlxuICogc2ltcGxlIGNsYXNzIGluaGVyaXRhbmNlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjaGlsZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gYmFzZVxuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzXVxuICovXG5mdW5jdGlvbiBpbmhlcml0KGNoaWxkLCBiYXNlLCBwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIGJhc2VQID0gYmFzZS5wcm90b3R5cGUsXG4gICAgICAgIGNoaWxkUDtcblxuICAgIGNoaWxkUCA9IGNoaWxkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoYmFzZVApO1xuICAgIGNoaWxkUC5jb25zdHJ1Y3RvciA9IGNoaWxkO1xuICAgIGNoaWxkUC5fc3VwZXIgPSBiYXNlUDtcblxuICAgIGlmIChwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGFzc2lnbihjaGlsZFAsIHByb3BlcnRpZXMpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBzaW1wbGUgZnVuY3Rpb24gYmluZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGJpbmRGbihmbiwgY29udGV4dCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBib3VuZEZuKCkge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIGxldCBhIGJvb2xlYW4gdmFsdWUgYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgbXVzdCByZXR1cm4gYSBib29sZWFuXG4gKiB0aGlzIGZpcnN0IGl0ZW0gaW4gYXJncyB3aWxsIGJlIHVzZWQgYXMgdGhlIGNvbnRleHRcbiAqIEBwYXJhbSB7Qm9vbGVhbnxGdW5jdGlvbn0gdmFsXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJnc11cbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICovXG5mdW5jdGlvbiBib29sT3JGbih2YWwsIGFyZ3MpIHtcbiAgICBpZiAodHlwZW9mIHZhbCA9PSBUWVBFX0ZVTkNUSU9OKSB7XG4gICAgICAgIHJldHVybiB2YWwuYXBwbHkoYXJncyA/IGFyZ3NbMF0gfHwgdW5kZWZpbmVkIDogdW5kZWZpbmVkLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbn1cblxuLyoqXG4gKiB1c2UgdGhlIHZhbDIgd2hlbiB2YWwxIGlzIHVuZGVmaW5lZFxuICogQHBhcmFtIHsqfSB2YWwxXG4gKiBAcGFyYW0geyp9IHZhbDJcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBpZlVuZGVmaW5lZCh2YWwxLCB2YWwyKSB7XG4gICAgcmV0dXJuICh2YWwxID09PSB1bmRlZmluZWQpID8gdmFsMiA6IHZhbDE7XG59XG5cbi8qKlxuICogYWRkRXZlbnRMaXN0ZW5lciB3aXRoIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlXG4gKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSB0YXJnZXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICovXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyh0YXJnZXQsIHR5cGVzLCBoYW5kbGVyKSB7XG4gICAgZWFjaChzcGxpdFN0cih0eXBlcyksIGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIHJlbW92ZUV2ZW50TGlzdGVuZXIgd2l0aCBtdWx0aXBsZSBldmVudHMgYXQgb25jZVxuICogQHBhcmFtIHtFdmVudFRhcmdldH0gdGFyZ2V0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZXNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGFyZ2V0LCB0eXBlcywgaGFuZGxlcikge1xuICAgIGVhY2goc3BsaXRTdHIodHlwZXMpLCBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBmaW5kIGlmIGEgbm9kZSBpcyBpbiB0aGUgZ2l2ZW4gcGFyZW50XG4gKiBAbWV0aG9kIGhhc1BhcmVudFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gbm9kZVxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufSBmb3VuZFxuICovXG5mdW5jdGlvbiBoYXNQYXJlbnQobm9kZSwgcGFyZW50KSB7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUgPT0gcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogc21hbGwgaW5kZXhPZiB3cmFwcGVyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmluZFxuICogQHJldHVybnMge0Jvb2xlYW59IGZvdW5kXG4gKi9cbmZ1bmN0aW9uIGluU3RyKHN0ciwgZmluZCkge1xuICAgIHJldHVybiBzdHIuaW5kZXhPZihmaW5kKSA+IC0xO1xufVxuXG4vKipcbiAqIHNwbGl0IHN0cmluZyBvbiB3aGl0ZXNwYWNlXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7QXJyYXl9IHdvcmRzXG4gKi9cbmZ1bmN0aW9uIHNwbGl0U3RyKHN0cikge1xuICAgIHJldHVybiBzdHIudHJpbSgpLnNwbGl0KC9cXHMrL2cpO1xufVxuXG4vKipcbiAqIGZpbmQgaWYgYSBhcnJheSBjb250YWlucyB0aGUgb2JqZWN0IHVzaW5nIGluZGV4T2Ygb3IgYSBzaW1wbGUgcG9seUZpbGxcbiAqIEBwYXJhbSB7QXJyYXl9IHNyY1xuICogQHBhcmFtIHtTdHJpbmd9IGZpbmRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbZmluZEJ5S2V5XVxuICogQHJldHVybiB7Qm9vbGVhbnxOdW1iZXJ9IGZhbHNlIHdoZW4gbm90IGZvdW5kLCBvciB0aGUgaW5kZXhcbiAqL1xuZnVuY3Rpb24gaW5BcnJheShzcmMsIGZpbmQsIGZpbmRCeUtleSkge1xuICAgIGlmIChzcmMuaW5kZXhPZiAmJiAhZmluZEJ5S2V5KSB7XG4gICAgICAgIHJldHVybiBzcmMuaW5kZXhPZihmaW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgc3JjLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKChmaW5kQnlLZXkgJiYgc3JjW2ldW2ZpbmRCeUtleV0gPT0gZmluZCkgfHwgKCFmaW5kQnlLZXkgJiYgc3JjW2ldID09PSBmaW5kKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG59XG5cbi8qKlxuICogY29udmVydCBhcnJheS1saWtlIG9iamVjdHMgdG8gcmVhbCBhcnJheXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gdG9BcnJheShvYmopIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwob2JqLCAwKTtcbn1cblxuLyoqXG4gKiB1bmlxdWUgYXJyYXkgd2l0aCBvYmplY3RzIGJhc2VkIG9uIGEga2V5IChsaWtlICdpZCcpIG9yIGp1c3QgYnkgdGhlIGFycmF5J3MgdmFsdWVcbiAqIEBwYXJhbSB7QXJyYXl9IHNyYyBbe2lkOjF9LHtpZDoyfSx7aWQ6MX1dXG4gKiBAcGFyYW0ge1N0cmluZ30gW2tleV1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3NvcnQ9RmFsc2VdXG4gKiBAcmV0dXJucyB7QXJyYXl9IFt7aWQ6MX0se2lkOjJ9XVxuICovXG5mdW5jdGlvbiB1bmlxdWVBcnJheShzcmMsIGtleSwgc29ydCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIHZhciBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgc3JjLmxlbmd0aCkge1xuICAgICAgICB2YXIgdmFsID0ga2V5ID8gc3JjW2ldW2tleV0gOiBzcmNbaV07XG4gICAgICAgIGlmIChpbkFycmF5KHZhbHVlcywgdmFsKSA8IDApIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChzcmNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlc1tpXSA9IHZhbDtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIGlmIChzb3J0KSB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5zb3J0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5zb3J0KGZ1bmN0aW9uIHNvcnRVbmlxdWVBcnJheShhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFba2V5XSA+IGJba2V5XTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8qKlxuICogZ2V0IHRoZSBwcmVmaXhlZCBwcm9wZXJ0eVxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7U3RyaW5nfFVuZGVmaW5lZH0gcHJlZml4ZWRcbiAqL1xuZnVuY3Rpb24gcHJlZml4ZWQob2JqLCBwcm9wZXJ0eSkge1xuICAgIHZhciBwcmVmaXgsIHByb3A7XG4gICAgdmFyIGNhbWVsUHJvcCA9IHByb3BlcnR5WzBdLnRvVXBwZXJDYXNlKCkgKyBwcm9wZXJ0eS5zbGljZSgxKTtcblxuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IFZFTkRPUl9QUkVGSVhFUy5sZW5ndGgpIHtcbiAgICAgICAgcHJlZml4ID0gVkVORE9SX1BSRUZJWEVTW2ldO1xuICAgICAgICBwcm9wID0gKHByZWZpeCkgPyBwcmVmaXggKyBjYW1lbFByb3AgOiBwcm9wZXJ0eTtcblxuICAgICAgICBpZiAocHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBnZXQgYSB1bmlxdWUgaWRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHVuaXF1ZUlkXG4gKi9cbnZhciBfdW5pcXVlSWQgPSAxO1xuZnVuY3Rpb24gdW5pcXVlSWQoKSB7XG4gICAgcmV0dXJuIF91bmlxdWVJZCsrO1xufVxuXG4vKipcbiAqIGdldCB0aGUgd2luZG93IG9iamVjdCBvZiBhbiBlbGVtZW50XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7RG9jdW1lbnRWaWV3fFdpbmRvd31cbiAqL1xuZnVuY3Rpb24gZ2V0V2luZG93Rm9yRWxlbWVudChlbGVtZW50KSB7XG4gICAgdmFyIGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCB8fCBlbGVtZW50O1xuICAgIHJldHVybiAoZG9jLmRlZmF1bHRWaWV3IHx8IGRvYy5wYXJlbnRXaW5kb3cgfHwgd2luZG93KTtcbn1cblxudmFyIE1PQklMRV9SRUdFWCA9IC9tb2JpbGV8dGFibGV0fGlwKGFkfGhvbmV8b2QpfGFuZHJvaWQvaTtcblxudmFyIFNVUFBPUlRfVE9VQ0ggPSAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KTtcbnZhciBTVVBQT1JUX1BPSU5URVJfRVZFTlRTID0gcHJlZml4ZWQod2luZG93LCAnUG9pbnRlckV2ZW50JykgIT09IHVuZGVmaW5lZDtcbnZhciBTVVBQT1JUX09OTFlfVE9VQ0ggPSBTVVBQT1JUX1RPVUNIICYmIE1PQklMRV9SRUdFWC50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG52YXIgSU5QVVRfVFlQRV9UT1VDSCA9ICd0b3VjaCc7XG52YXIgSU5QVVRfVFlQRV9QRU4gPSAncGVuJztcbnZhciBJTlBVVF9UWVBFX01PVVNFID0gJ21vdXNlJztcbnZhciBJTlBVVF9UWVBFX0tJTkVDVCA9ICdraW5lY3QnO1xuXG52YXIgQ09NUFVURV9JTlRFUlZBTCA9IDI1O1xuXG52YXIgSU5QVVRfU1RBUlQgPSAxO1xudmFyIElOUFVUX01PVkUgPSAyO1xudmFyIElOUFVUX0VORCA9IDQ7XG52YXIgSU5QVVRfQ0FOQ0VMID0gODtcblxudmFyIERJUkVDVElPTl9OT05FID0gMTtcbnZhciBESVJFQ1RJT05fTEVGVCA9IDI7XG52YXIgRElSRUNUSU9OX1JJR0hUID0gNDtcbnZhciBESVJFQ1RJT05fVVAgPSA4O1xudmFyIERJUkVDVElPTl9ET1dOID0gMTY7XG5cbnZhciBESVJFQ1RJT05fSE9SSVpPTlRBTCA9IERJUkVDVElPTl9MRUZUIHwgRElSRUNUSU9OX1JJR0hUO1xudmFyIERJUkVDVElPTl9WRVJUSUNBTCA9IERJUkVDVElPTl9VUCB8IERJUkVDVElPTl9ET1dOO1xudmFyIERJUkVDVElPTl9BTEwgPSBESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTDtcblxudmFyIFBST1BTX1hZID0gWyd4JywgJ3knXTtcbnZhciBQUk9QU19DTElFTlRfWFkgPSBbJ2NsaWVudFgnLCAnY2xpZW50WSddO1xuXG4vKipcbiAqIGNyZWF0ZSBuZXcgaW5wdXQgdHlwZSBtYW5hZ2VyXG4gKiBAcGFyYW0ge01hbmFnZXJ9IG1hbmFnZXJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7SW5wdXR9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gSW5wdXQobWFuYWdlciwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5tYW5hZ2VyID0gbWFuYWdlcjtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5lbGVtZW50ID0gbWFuYWdlci5lbGVtZW50O1xuICAgIHRoaXMudGFyZ2V0ID0gbWFuYWdlci5vcHRpb25zLmlucHV0VGFyZ2V0O1xuXG4gICAgLy8gc21hbGxlciB3cmFwcGVyIGFyb3VuZCB0aGUgaGFuZGxlciwgZm9yIHRoZSBzY29wZSBhbmQgdGhlIGVuYWJsZWQgc3RhdGUgb2YgdGhlIG1hbmFnZXIsXG4gICAgLy8gc28gd2hlbiBkaXNhYmxlZCB0aGUgaW5wdXQgZXZlbnRzIGFyZSBjb21wbGV0ZWx5IGJ5cGFzc2VkLlxuICAgIHRoaXMuZG9tSGFuZGxlciA9IGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgIGlmIChib29sT3JGbihtYW5hZ2VyLm9wdGlvbnMuZW5hYmxlLCBbbWFuYWdlcl0pKSB7XG4gICAgICAgICAgICBzZWxmLmhhbmRsZXIoZXYpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuaW5pdCgpO1xuXG59XG5cbklucHV0LnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBzaG91bGQgaGFuZGxlIHRoZSBpbnB1dEV2ZW50IGRhdGEgYW5kIHRyaWdnZXIgdGhlIGNhbGxiYWNrXG4gICAgICogQHZpcnR1YWxcbiAgICAgKi9cbiAgICBoYW5kbGVyOiBmdW5jdGlvbigpIHsgfSxcblxuICAgIC8qKlxuICAgICAqIGJpbmQgdGhlIGV2ZW50c1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmV2RWwgJiYgYWRkRXZlbnRMaXN0ZW5lcnModGhpcy5lbGVtZW50LCB0aGlzLmV2RWwsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZUYXJnZXQgJiYgYWRkRXZlbnRMaXN0ZW5lcnModGhpcy50YXJnZXQsIHRoaXMuZXZUYXJnZXQsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZXaW4gJiYgYWRkRXZlbnRMaXN0ZW5lcnMoZ2V0V2luZG93Rm9yRWxlbWVudCh0aGlzLmVsZW1lbnQpLCB0aGlzLmV2V2luLCB0aGlzLmRvbUhhbmRsZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB1bmJpbmQgdGhlIGV2ZW50c1xuICAgICAqL1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmV2RWwgJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGhpcy5lbGVtZW50LCB0aGlzLmV2RWwsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZUYXJnZXQgJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGhpcy50YXJnZXQsIHRoaXMuZXZUYXJnZXQsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZXaW4gJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoZ2V0V2luZG93Rm9yRWxlbWVudCh0aGlzLmVsZW1lbnQpLCB0aGlzLmV2V2luLCB0aGlzLmRvbUhhbmRsZXIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogY3JlYXRlIG5ldyBpbnB1dCB0eXBlIG1hbmFnZXJcbiAqIGNhbGxlZCBieSB0aGUgTWFuYWdlciBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtIYW1tZXJ9IG1hbmFnZXJcbiAqIEByZXR1cm5zIHtJbnB1dH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5wdXRJbnN0YW5jZShtYW5hZ2VyKSB7XG4gICAgdmFyIFR5cGU7XG4gICAgdmFyIGlucHV0Q2xhc3MgPSBtYW5hZ2VyLm9wdGlvbnMuaW5wdXRDbGFzcztcblxuICAgIGlmIChpbnB1dENsYXNzKSB7XG4gICAgICAgIFR5cGUgPSBpbnB1dENsYXNzO1xuICAgIH0gZWxzZSBpZiAoU1VQUE9SVF9QT0lOVEVSX0VWRU5UUykge1xuICAgICAgICBUeXBlID0gUG9pbnRlckV2ZW50SW5wdXQ7XG4gICAgfSBlbHNlIGlmIChTVVBQT1JUX09OTFlfVE9VQ0gpIHtcbiAgICAgICAgVHlwZSA9IFRvdWNoSW5wdXQ7XG4gICAgfSBlbHNlIGlmICghU1VQUE9SVF9UT1VDSCkge1xuICAgICAgICBUeXBlID0gTW91c2VJbnB1dDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBUeXBlID0gVG91Y2hNb3VzZUlucHV0O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IChUeXBlKShtYW5hZ2VyLCBpbnB1dEhhbmRsZXIpO1xufVxuXG4vKipcbiAqIGhhbmRsZSBpbnB1dCBldmVudHNcbiAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZVxuICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gKi9cbmZ1bmN0aW9uIGlucHV0SGFuZGxlcihtYW5hZ2VyLCBldmVudFR5cGUsIGlucHV0KSB7XG4gICAgdmFyIHBvaW50ZXJzTGVuID0gaW5wdXQucG9pbnRlcnMubGVuZ3RoO1xuICAgIHZhciBjaGFuZ2VkUG9pbnRlcnNMZW4gPSBpbnB1dC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoO1xuICAgIHZhciBpc0ZpcnN0ID0gKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUICYmIChwb2ludGVyc0xlbiAtIGNoYW5nZWRQb2ludGVyc0xlbiA9PT0gMCkpO1xuICAgIHZhciBpc0ZpbmFsID0gKGV2ZW50VHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpICYmIChwb2ludGVyc0xlbiAtIGNoYW5nZWRQb2ludGVyc0xlbiA9PT0gMCkpO1xuXG4gICAgaW5wdXQuaXNGaXJzdCA9ICEhaXNGaXJzdDtcbiAgICBpbnB1dC5pc0ZpbmFsID0gISFpc0ZpbmFsO1xuXG4gICAgaWYgKGlzRmlyc3QpIHtcbiAgICAgICAgbWFuYWdlci5zZXNzaW9uID0ge307XG4gICAgfVxuXG4gICAgLy8gc291cmNlIGV2ZW50IGlzIHRoZSBub3JtYWxpemVkIHZhbHVlIG9mIHRoZSBkb21FdmVudHNcbiAgICAvLyBsaWtlICd0b3VjaHN0YXJ0LCBtb3VzZXVwLCBwb2ludGVyZG93bidcbiAgICBpbnB1dC5ldmVudFR5cGUgPSBldmVudFR5cGU7XG5cbiAgICAvLyBjb21wdXRlIHNjYWxlLCByb3RhdGlvbiBldGNcbiAgICBjb21wdXRlSW5wdXREYXRhKG1hbmFnZXIsIGlucHV0KTtcblxuICAgIC8vIGVtaXQgc2VjcmV0IGV2ZW50XG4gICAgbWFuYWdlci5lbWl0KCdoYW1tZXIuaW5wdXQnLCBpbnB1dCk7XG5cbiAgICBtYW5hZ2VyLnJlY29nbml6ZShpbnB1dCk7XG4gICAgbWFuYWdlci5zZXNzaW9uLnByZXZJbnB1dCA9IGlucHV0O1xufVxuXG4vKipcbiAqIGV4dGVuZCB0aGUgZGF0YSB3aXRoIHNvbWUgdXNhYmxlIHByb3BlcnRpZXMgbGlrZSBzY2FsZSwgcm90YXRlLCB2ZWxvY2l0eSBldGNcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYW5hZ2VyXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAqL1xuZnVuY3Rpb24gY29tcHV0ZUlucHV0RGF0YShtYW5hZ2VyLCBpbnB1dCkge1xuICAgIHZhciBzZXNzaW9uID0gbWFuYWdlci5zZXNzaW9uO1xuICAgIHZhciBwb2ludGVycyA9IGlucHV0LnBvaW50ZXJzO1xuICAgIHZhciBwb2ludGVyc0xlbmd0aCA9IHBvaW50ZXJzLmxlbmd0aDtcblxuICAgIC8vIHN0b3JlIHRoZSBmaXJzdCBpbnB1dCB0byBjYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGFuZCBkaXJlY3Rpb25cbiAgICBpZiAoIXNlc3Npb24uZmlyc3RJbnB1dCkge1xuICAgICAgICBzZXNzaW9uLmZpcnN0SW5wdXQgPSBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCk7XG4gICAgfVxuXG4gICAgLy8gdG8gY29tcHV0ZSBzY2FsZSBhbmQgcm90YXRpb24gd2UgbmVlZCB0byBzdG9yZSB0aGUgbXVsdGlwbGUgdG91Y2hlc1xuICAgIGlmIChwb2ludGVyc0xlbmd0aCA+IDEgJiYgIXNlc3Npb24uZmlyc3RNdWx0aXBsZSkge1xuICAgICAgICBzZXNzaW9uLmZpcnN0TXVsdGlwbGUgPSBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCk7XG4gICAgfSBlbHNlIGlmIChwb2ludGVyc0xlbmd0aCA9PT0gMSkge1xuICAgICAgICBzZXNzaW9uLmZpcnN0TXVsdGlwbGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZmlyc3RJbnB1dCA9IHNlc3Npb24uZmlyc3RJbnB1dDtcbiAgICB2YXIgZmlyc3RNdWx0aXBsZSA9IHNlc3Npb24uZmlyc3RNdWx0aXBsZTtcbiAgICB2YXIgb2Zmc2V0Q2VudGVyID0gZmlyc3RNdWx0aXBsZSA/IGZpcnN0TXVsdGlwbGUuY2VudGVyIDogZmlyc3RJbnB1dC5jZW50ZXI7XG5cbiAgICB2YXIgY2VudGVyID0gaW5wdXQuY2VudGVyID0gZ2V0Q2VudGVyKHBvaW50ZXJzKTtcbiAgICBpbnB1dC50aW1lU3RhbXAgPSBub3coKTtcbiAgICBpbnB1dC5kZWx0YVRpbWUgPSBpbnB1dC50aW1lU3RhbXAgLSBmaXJzdElucHV0LnRpbWVTdGFtcDtcblxuICAgIGlucHV0LmFuZ2xlID0gZ2V0QW5nbGUob2Zmc2V0Q2VudGVyLCBjZW50ZXIpO1xuICAgIGlucHV0LmRpc3RhbmNlID0gZ2V0RGlzdGFuY2Uob2Zmc2V0Q2VudGVyLCBjZW50ZXIpO1xuXG4gICAgY29tcHV0ZURlbHRhWFkoc2Vzc2lvbiwgaW5wdXQpO1xuICAgIGlucHV0Lm9mZnNldERpcmVjdGlvbiA9IGdldERpcmVjdGlvbihpbnB1dC5kZWx0YVgsIGlucHV0LmRlbHRhWSk7XG5cbiAgICB2YXIgb3ZlcmFsbFZlbG9jaXR5ID0gZ2V0VmVsb2NpdHkoaW5wdXQuZGVsdGFUaW1lLCBpbnB1dC5kZWx0YVgsIGlucHV0LmRlbHRhWSk7XG4gICAgaW5wdXQub3ZlcmFsbFZlbG9jaXR5WCA9IG92ZXJhbGxWZWxvY2l0eS54O1xuICAgIGlucHV0Lm92ZXJhbGxWZWxvY2l0eVkgPSBvdmVyYWxsVmVsb2NpdHkueTtcbiAgICBpbnB1dC5vdmVyYWxsVmVsb2NpdHkgPSAoYWJzKG92ZXJhbGxWZWxvY2l0eS54KSA+IGFicyhvdmVyYWxsVmVsb2NpdHkueSkpID8gb3ZlcmFsbFZlbG9jaXR5LnggOiBvdmVyYWxsVmVsb2NpdHkueTtcblxuICAgIGlucHV0LnNjYWxlID0gZmlyc3RNdWx0aXBsZSA/IGdldFNjYWxlKGZpcnN0TXVsdGlwbGUucG9pbnRlcnMsIHBvaW50ZXJzKSA6IDE7XG4gICAgaW5wdXQucm90YXRpb24gPSBmaXJzdE11bHRpcGxlID8gZ2V0Um90YXRpb24oZmlyc3RNdWx0aXBsZS5wb2ludGVycywgcG9pbnRlcnMpIDogMDtcblxuICAgIGlucHV0Lm1heFBvaW50ZXJzID0gIXNlc3Npb24ucHJldklucHV0ID8gaW5wdXQucG9pbnRlcnMubGVuZ3RoIDogKChpbnB1dC5wb2ludGVycy5sZW5ndGggPlxuICAgICAgICBzZXNzaW9uLnByZXZJbnB1dC5tYXhQb2ludGVycykgPyBpbnB1dC5wb2ludGVycy5sZW5ndGggOiBzZXNzaW9uLnByZXZJbnB1dC5tYXhQb2ludGVycyk7XG5cbiAgICBjb21wdXRlSW50ZXJ2YWxJbnB1dERhdGEoc2Vzc2lvbiwgaW5wdXQpO1xuXG4gICAgLy8gZmluZCB0aGUgY29ycmVjdCB0YXJnZXRcbiAgICB2YXIgdGFyZ2V0ID0gbWFuYWdlci5lbGVtZW50O1xuICAgIGlmIChoYXNQYXJlbnQoaW5wdXQuc3JjRXZlbnQudGFyZ2V0LCB0YXJnZXQpKSB7XG4gICAgICAgIHRhcmdldCA9IGlucHV0LnNyY0V2ZW50LnRhcmdldDtcbiAgICB9XG4gICAgaW5wdXQudGFyZ2V0ID0gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBjb21wdXRlRGVsdGFYWShzZXNzaW9uLCBpbnB1dCkge1xuICAgIHZhciBjZW50ZXIgPSBpbnB1dC5jZW50ZXI7XG4gICAgdmFyIG9mZnNldCA9IHNlc3Npb24ub2Zmc2V0RGVsdGEgfHwge307XG4gICAgdmFyIHByZXZEZWx0YSA9IHNlc3Npb24ucHJldkRlbHRhIHx8IHt9O1xuICAgIHZhciBwcmV2SW5wdXQgPSBzZXNzaW9uLnByZXZJbnB1dCB8fCB7fTtcblxuICAgIGlmIChpbnB1dC5ldmVudFR5cGUgPT09IElOUFVUX1NUQVJUIHx8IHByZXZJbnB1dC5ldmVudFR5cGUgPT09IElOUFVUX0VORCkge1xuICAgICAgICBwcmV2RGVsdGEgPSBzZXNzaW9uLnByZXZEZWx0YSA9IHtcbiAgICAgICAgICAgIHg6IHByZXZJbnB1dC5kZWx0YVggfHwgMCxcbiAgICAgICAgICAgIHk6IHByZXZJbnB1dC5kZWx0YVkgfHwgMFxuICAgICAgICB9O1xuXG4gICAgICAgIG9mZnNldCA9IHNlc3Npb24ub2Zmc2V0RGVsdGEgPSB7XG4gICAgICAgICAgICB4OiBjZW50ZXIueCxcbiAgICAgICAgICAgIHk6IGNlbnRlci55XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaW5wdXQuZGVsdGFYID0gcHJldkRlbHRhLnggKyAoY2VudGVyLnggLSBvZmZzZXQueCk7XG4gICAgaW5wdXQuZGVsdGFZID0gcHJldkRlbHRhLnkgKyAoY2VudGVyLnkgLSBvZmZzZXQueSk7XG59XG5cbi8qKlxuICogdmVsb2NpdHkgaXMgY2FsY3VsYXRlZCBldmVyeSB4IG1zXG4gKiBAcGFyYW0ge09iamVjdH0gc2Vzc2lvblxuICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVJbnRlcnZhbElucHV0RGF0YShzZXNzaW9uLCBpbnB1dCkge1xuICAgIHZhciBsYXN0ID0gc2Vzc2lvbi5sYXN0SW50ZXJ2YWwgfHwgaW5wdXQsXG4gICAgICAgIGRlbHRhVGltZSA9IGlucHV0LnRpbWVTdGFtcCAtIGxhc3QudGltZVN0YW1wLFxuICAgICAgICB2ZWxvY2l0eSwgdmVsb2NpdHlYLCB2ZWxvY2l0eVksIGRpcmVjdGlvbjtcblxuICAgIGlmIChpbnB1dC5ldmVudFR5cGUgIT0gSU5QVVRfQ0FOQ0VMICYmIChkZWx0YVRpbWUgPiBDT01QVVRFX0lOVEVSVkFMIHx8IGxhc3QudmVsb2NpdHkgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgdmFyIGRlbHRhWCA9IGlucHV0LmRlbHRhWCAtIGxhc3QuZGVsdGFYO1xuICAgICAgICB2YXIgZGVsdGFZID0gaW5wdXQuZGVsdGFZIC0gbGFzdC5kZWx0YVk7XG5cbiAgICAgICAgdmFyIHYgPSBnZXRWZWxvY2l0eShkZWx0YVRpbWUsIGRlbHRhWCwgZGVsdGFZKTtcbiAgICAgICAgdmVsb2NpdHlYID0gdi54O1xuICAgICAgICB2ZWxvY2l0eVkgPSB2Lnk7XG4gICAgICAgIHZlbG9jaXR5ID0gKGFicyh2LngpID4gYWJzKHYueSkpID8gdi54IDogdi55O1xuICAgICAgICBkaXJlY3Rpb24gPSBnZXREaXJlY3Rpb24oZGVsdGFYLCBkZWx0YVkpO1xuXG4gICAgICAgIHNlc3Npb24ubGFzdEludGVydmFsID0gaW5wdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdXNlIGxhdGVzdCB2ZWxvY2l0eSBpbmZvIGlmIGl0IGRvZXNuJ3Qgb3ZlcnRha2UgYSBtaW5pbXVtIHBlcmlvZFxuICAgICAgICB2ZWxvY2l0eSA9IGxhc3QudmVsb2NpdHk7XG4gICAgICAgIHZlbG9jaXR5WCA9IGxhc3QudmVsb2NpdHlYO1xuICAgICAgICB2ZWxvY2l0eVkgPSBsYXN0LnZlbG9jaXR5WTtcbiAgICAgICAgZGlyZWN0aW9uID0gbGFzdC5kaXJlY3Rpb247XG4gICAgfVxuXG4gICAgaW5wdXQudmVsb2NpdHkgPSB2ZWxvY2l0eTtcbiAgICBpbnB1dC52ZWxvY2l0eVggPSB2ZWxvY2l0eVg7XG4gICAgaW5wdXQudmVsb2NpdHlZID0gdmVsb2NpdHlZO1xuICAgIGlucHV0LmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbn1cblxuLyoqXG4gKiBjcmVhdGUgYSBzaW1wbGUgY2xvbmUgZnJvbSB0aGUgaW5wdXQgdXNlZCBmb3Igc3RvcmFnZSBvZiBmaXJzdElucHV0IGFuZCBmaXJzdE11bHRpcGxlXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAqIEByZXR1cm5zIHtPYmplY3R9IGNsb25lZElucHV0RGF0YVxuICovXG5mdW5jdGlvbiBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCkge1xuICAgIC8vIG1ha2UgYSBzaW1wbGUgY29weSBvZiB0aGUgcG9pbnRlcnMgYmVjYXVzZSB3ZSB3aWxsIGdldCBhIHJlZmVyZW5jZSBpZiB3ZSBkb24ndFxuICAgIC8vIHdlIG9ubHkgbmVlZCBjbGllbnRYWSBmb3IgdGhlIGNhbGN1bGF0aW9uc1xuICAgIHZhciBwb2ludGVycyA9IFtdO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IGlucHV0LnBvaW50ZXJzLmxlbmd0aCkge1xuICAgICAgICBwb2ludGVyc1tpXSA9IHtcbiAgICAgICAgICAgIGNsaWVudFg6IHJvdW5kKGlucHV0LnBvaW50ZXJzW2ldLmNsaWVudFgpLFxuICAgICAgICAgICAgY2xpZW50WTogcm91bmQoaW5wdXQucG9pbnRlcnNbaV0uY2xpZW50WSlcbiAgICAgICAgfTtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRpbWVTdGFtcDogbm93KCksXG4gICAgICAgIHBvaW50ZXJzOiBwb2ludGVycyxcbiAgICAgICAgY2VudGVyOiBnZXRDZW50ZXIocG9pbnRlcnMpLFxuICAgICAgICBkZWx0YVg6IGlucHV0LmRlbHRhWCxcbiAgICAgICAgZGVsdGFZOiBpbnB1dC5kZWx0YVlcbiAgICB9O1xufVxuXG4vKipcbiAqIGdldCB0aGUgY2VudGVyIG9mIGFsbCB0aGUgcG9pbnRlcnNcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ZXJzXG4gKiBAcmV0dXJuIHtPYmplY3R9IGNlbnRlciBjb250YWlucyBgeGAgYW5kIGB5YCBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIGdldENlbnRlcihwb2ludGVycykge1xuICAgIHZhciBwb2ludGVyc0xlbmd0aCA9IHBvaW50ZXJzLmxlbmd0aDtcblxuICAgIC8vIG5vIG5lZWQgdG8gbG9vcCB3aGVuIG9ubHkgb25lIHRvdWNoXG4gICAgaWYgKHBvaW50ZXJzTGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiByb3VuZChwb2ludGVyc1swXS5jbGllbnRYKSxcbiAgICAgICAgICAgIHk6IHJvdW5kKHBvaW50ZXJzWzBdLmNsaWVudFkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHggPSAwLCB5ID0gMCwgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBwb2ludGVyc0xlbmd0aCkge1xuICAgICAgICB4ICs9IHBvaW50ZXJzW2ldLmNsaWVudFg7XG4gICAgICAgIHkgKz0gcG9pbnRlcnNbaV0uY2xpZW50WTtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHJvdW5kKHggLyBwb2ludGVyc0xlbmd0aCksXG4gICAgICAgIHk6IHJvdW5kKHkgLyBwb2ludGVyc0xlbmd0aClcbiAgICB9O1xufVxuXG4vKipcbiAqIGNhbGN1bGF0ZSB0aGUgdmVsb2NpdHkgYmV0d2VlbiB0d28gcG9pbnRzLiB1bml0IGlzIGluIHB4IHBlciBtcy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBkZWx0YVRpbWVcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiBAcGFyYW0ge051bWJlcn0geVxuICogQHJldHVybiB7T2JqZWN0fSB2ZWxvY2l0eSBgeGAgYW5kIGB5YFxuICovXG5mdW5jdGlvbiBnZXRWZWxvY2l0eShkZWx0YVRpbWUsIHgsIHkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiB4IC8gZGVsdGFUaW1lIHx8IDAsXG4gICAgICAgIHk6IHkgLyBkZWx0YVRpbWUgfHwgMFxuICAgIH07XG59XG5cbi8qKlxuICogZ2V0IHRoZSBkaXJlY3Rpb24gYmV0d2VlbiB0d28gcG9pbnRzXG4gKiBAcGFyYW0ge051bWJlcn0geFxuICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAqIEByZXR1cm4ge051bWJlcn0gZGlyZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldERpcmVjdGlvbih4LCB5KSB7XG4gICAgaWYgKHggPT09IHkpIHtcbiAgICAgICAgcmV0dXJuIERJUkVDVElPTl9OT05FO1xuICAgIH1cblxuICAgIGlmIChhYnMoeCkgPj0gYWJzKHkpKSB7XG4gICAgICAgIHJldHVybiB4IDwgMCA/IERJUkVDVElPTl9MRUZUIDogRElSRUNUSU9OX1JJR0hUO1xuICAgIH1cbiAgICByZXR1cm4geSA8IDAgPyBESVJFQ1RJT05fVVAgOiBESVJFQ1RJT05fRE9XTjtcbn1cblxuLyoqXG4gKiBjYWxjdWxhdGUgdGhlIGFic29sdXRlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuICogQHBhcmFtIHtPYmplY3R9IHAxIHt4LCB5fVxuICogQHBhcmFtIHtPYmplY3R9IHAyIHt4LCB5fVxuICogQHBhcmFtIHtBcnJheX0gW3Byb3BzXSBjb250YWluaW5nIHggYW5kIHkga2V5c1xuICogQHJldHVybiB7TnVtYmVyfSBkaXN0YW5jZVxuICovXG5mdW5jdGlvbiBnZXREaXN0YW5jZShwMSwgcDIsIHByb3BzKSB7XG4gICAgaWYgKCFwcm9wcykge1xuICAgICAgICBwcm9wcyA9IFBST1BTX1hZO1xuICAgIH1cbiAgICB2YXIgeCA9IHAyW3Byb3BzWzBdXSAtIHAxW3Byb3BzWzBdXSxcbiAgICAgICAgeSA9IHAyW3Byb3BzWzFdXSAtIHAxW3Byb3BzWzFdXTtcblxuICAgIHJldHVybiBNYXRoLnNxcnQoKHggKiB4KSArICh5ICogeSkpO1xufVxuXG4vKipcbiAqIGNhbGN1bGF0ZSB0aGUgYW5nbGUgYmV0d2VlbiB0d28gY29vcmRpbmF0ZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBwMVxuICogQHBhcmFtIHtPYmplY3R9IHAyXG4gKiBAcGFyYW0ge0FycmF5fSBbcHJvcHNdIGNvbnRhaW5pbmcgeCBhbmQgeSBrZXlzXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IGFuZ2xlXG4gKi9cbmZ1bmN0aW9uIGdldEFuZ2xlKHAxLCBwMiwgcHJvcHMpIHtcbiAgICBpZiAoIXByb3BzKSB7XG4gICAgICAgIHByb3BzID0gUFJPUFNfWFk7XG4gICAgfVxuICAgIHZhciB4ID0gcDJbcHJvcHNbMF1dIC0gcDFbcHJvcHNbMF1dLFxuICAgICAgICB5ID0gcDJbcHJvcHNbMV1dIC0gcDFbcHJvcHNbMV1dO1xuICAgIHJldHVybiBNYXRoLmF0YW4yKHksIHgpICogMTgwIC8gTWF0aC5QSTtcbn1cblxuLyoqXG4gKiBjYWxjdWxhdGUgdGhlIHJvdGF0aW9uIGRlZ3JlZXMgYmV0d2VlbiB0d28gcG9pbnRlcnNldHNcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0IGFycmF5IG9mIHBvaW50ZXJzXG4gKiBAcGFyYW0ge0FycmF5fSBlbmQgYXJyYXkgb2YgcG9pbnRlcnNcbiAqIEByZXR1cm4ge051bWJlcn0gcm90YXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0Um90YXRpb24oc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBnZXRBbmdsZShlbmRbMV0sIGVuZFswXSwgUFJPUFNfQ0xJRU5UX1hZKSArIGdldEFuZ2xlKHN0YXJ0WzFdLCBzdGFydFswXSwgUFJPUFNfQ0xJRU5UX1hZKTtcbn1cblxuLyoqXG4gKiBjYWxjdWxhdGUgdGhlIHNjYWxlIGZhY3RvciBiZXR3ZWVuIHR3byBwb2ludGVyc2V0c1xuICogbm8gc2NhbGUgaXMgMSwgYW5kIGdvZXMgZG93biB0byAwIHdoZW4gcGluY2hlZCB0b2dldGhlciwgYW5kIGJpZ2dlciB3aGVuIHBpbmNoZWQgb3V0XG4gKiBAcGFyYW0ge0FycmF5fSBzdGFydCBhcnJheSBvZiBwb2ludGVyc1xuICogQHBhcmFtIHtBcnJheX0gZW5kIGFycmF5IG9mIHBvaW50ZXJzXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IHNjYWxlXG4gKi9cbmZ1bmN0aW9uIGdldFNjYWxlKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gZ2V0RGlzdGFuY2UoZW5kWzBdLCBlbmRbMV0sIFBST1BTX0NMSUVOVF9YWSkgLyBnZXREaXN0YW5jZShzdGFydFswXSwgc3RhcnRbMV0sIFBST1BTX0NMSUVOVF9YWSk7XG59XG5cbnZhciBNT1VTRV9JTlBVVF9NQVAgPSB7XG4gICAgbW91c2Vkb3duOiBJTlBVVF9TVEFSVCxcbiAgICBtb3VzZW1vdmU6IElOUFVUX01PVkUsXG4gICAgbW91c2V1cDogSU5QVVRfRU5EXG59O1xuXG52YXIgTU9VU0VfRUxFTUVOVF9FVkVOVFMgPSAnbW91c2Vkb3duJztcbnZhciBNT1VTRV9XSU5ET1dfRVZFTlRTID0gJ21vdXNlbW92ZSBtb3VzZXVwJztcblxuLyoqXG4gKiBNb3VzZSBldmVudHMgaW5wdXRcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuZnVuY3Rpb24gTW91c2VJbnB1dCgpIHtcbiAgICB0aGlzLmV2RWwgPSBNT1VTRV9FTEVNRU5UX0VWRU5UUztcbiAgICB0aGlzLmV2V2luID0gTU9VU0VfV0lORE9XX0VWRU5UUztcblxuICAgIHRoaXMucHJlc3NlZCA9IGZhbHNlOyAvLyBtb3VzZWRvd24gc3RhdGVcblxuICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmluaGVyaXQoTW91c2VJbnB1dCwgSW5wdXQsIHtcbiAgICAvKipcbiAgICAgKiBoYW5kbGUgbW91c2UgZXZlbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2XG4gICAgICovXG4gICAgaGFuZGxlcjogZnVuY3Rpb24gTUVoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSBNT1VTRV9JTlBVVF9NQVBbZXYudHlwZV07XG5cbiAgICAgICAgLy8gb24gc3RhcnQgd2Ugd2FudCB0byBoYXZlIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBkb3duXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCAmJiBldi5idXR0b24gPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfTU9WRSAmJiBldi53aGljaCAhPT0gMSkge1xuICAgICAgICAgICAgZXZlbnRUeXBlID0gSU5QVVRfRU5EO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbW91c2UgbXVzdCBiZSBkb3duXG4gICAgICAgIGlmICghdGhpcy5wcmVzc2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5tYW5hZ2VyLCBldmVudFR5cGUsIHtcbiAgICAgICAgICAgIHBvaW50ZXJzOiBbZXZdLFxuICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiBbZXZdLFxuICAgICAgICAgICAgcG9pbnRlclR5cGU6IElOUFVUX1RZUEVfTU9VU0UsXG4gICAgICAgICAgICBzcmNFdmVudDogZXZcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbnZhciBQT0lOVEVSX0lOUFVUX01BUCA9IHtcbiAgICBwb2ludGVyZG93bjogSU5QVVRfU1RBUlQsXG4gICAgcG9pbnRlcm1vdmU6IElOUFVUX01PVkUsXG4gICAgcG9pbnRlcnVwOiBJTlBVVF9FTkQsXG4gICAgcG9pbnRlcmNhbmNlbDogSU5QVVRfQ0FOQ0VMLFxuICAgIHBvaW50ZXJvdXQ6IElOUFVUX0NBTkNFTFxufTtcblxuLy8gaW4gSUUxMCB0aGUgcG9pbnRlciB0eXBlcyBpcyBkZWZpbmVkIGFzIGFuIGVudW1cbnZhciBJRTEwX1BPSU5URVJfVFlQRV9FTlVNID0ge1xuICAgIDI6IElOUFVUX1RZUEVfVE9VQ0gsXG4gICAgMzogSU5QVVRfVFlQRV9QRU4sXG4gICAgNDogSU5QVVRfVFlQRV9NT1VTRSxcbiAgICA1OiBJTlBVVF9UWVBFX0tJTkVDVCAvLyBzZWUgaHR0cHM6Ly90d2l0dGVyLmNvbS9qYWNvYnJvc3NpL3N0YXR1cy80ODA1OTY0Mzg0ODk4OTA4MTZcbn07XG5cbnZhciBQT0lOVEVSX0VMRU1FTlRfRVZFTlRTID0gJ3BvaW50ZXJkb3duJztcbnZhciBQT0lOVEVSX1dJTkRPV19FVkVOVFMgPSAncG9pbnRlcm1vdmUgcG9pbnRlcnVwIHBvaW50ZXJjYW5jZWwnO1xuXG4vLyBJRTEwIGhhcyBwcmVmaXhlZCBzdXBwb3J0LCBhbmQgY2FzZS1zZW5zaXRpdmVcbmlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQgJiYgIXdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcbiAgICBQT0lOVEVSX0VMRU1FTlRfRVZFTlRTID0gJ01TUG9pbnRlckRvd24nO1xuICAgIFBPSU5URVJfV0lORE9XX0VWRU5UUyA9ICdNU1BvaW50ZXJNb3ZlIE1TUG9pbnRlclVwIE1TUG9pbnRlckNhbmNlbCc7XG59XG5cbi8qKlxuICogUG9pbnRlciBldmVudHMgaW5wdXRcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuZnVuY3Rpb24gUG9pbnRlckV2ZW50SW5wdXQoKSB7XG4gICAgdGhpcy5ldkVsID0gUE9JTlRFUl9FTEVNRU5UX0VWRU5UUztcbiAgICB0aGlzLmV2V2luID0gUE9JTlRFUl9XSU5ET1dfRVZFTlRTO1xuXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRoaXMuc3RvcmUgPSAodGhpcy5tYW5hZ2VyLnNlc3Npb24ucG9pbnRlckV2ZW50cyA9IFtdKTtcbn1cblxuaW5oZXJpdChQb2ludGVyRXZlbnRJbnB1dCwgSW5wdXQsIHtcbiAgICAvKipcbiAgICAgKiBoYW5kbGUgbW91c2UgZXZlbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2XG4gICAgICovXG4gICAgaGFuZGxlcjogZnVuY3Rpb24gUEVoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmU7XG4gICAgICAgIHZhciByZW1vdmVQb2ludGVyID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGV2ZW50VHlwZU5vcm1hbGl6ZWQgPSBldi50eXBlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnbXMnLCAnJyk7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSBQT0lOVEVSX0lOUFVUX01BUFtldmVudFR5cGVOb3JtYWxpemVkXTtcbiAgICAgICAgdmFyIHBvaW50ZXJUeXBlID0gSUUxMF9QT0lOVEVSX1RZUEVfRU5VTVtldi5wb2ludGVyVHlwZV0gfHwgZXYucG9pbnRlclR5cGU7XG5cbiAgICAgICAgdmFyIGlzVG91Y2ggPSAocG9pbnRlclR5cGUgPT0gSU5QVVRfVFlQRV9UT1VDSCk7XG5cbiAgICAgICAgLy8gZ2V0IGluZGV4IG9mIHRoZSBldmVudCBpbiB0aGUgc3RvcmVcbiAgICAgICAgdmFyIHN0b3JlSW5kZXggPSBpbkFycmF5KHN0b3JlLCBldi5wb2ludGVySWQsICdwb2ludGVySWQnKTtcblxuICAgICAgICAvLyBzdGFydCBhbmQgbW91c2UgbXVzdCBiZSBkb3duXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCAmJiAoZXYuYnV0dG9uID09PSAwIHx8IGlzVG91Y2gpKSB7XG4gICAgICAgICAgICBpZiAoc3RvcmVJbmRleCA8IDApIHtcbiAgICAgICAgICAgICAgICBzdG9yZS5wdXNoKGV2KTtcbiAgICAgICAgICAgICAgICBzdG9yZUluZGV4ID0gc3RvcmUubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldmVudFR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSkge1xuICAgICAgICAgICAgcmVtb3ZlUG9pbnRlciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpdCBub3QgZm91bmQsIHNvIHRoZSBwb2ludGVyIGhhc24ndCBiZWVuIGRvd24gKHNvIGl0J3MgcHJvYmFibHkgYSBob3ZlcilcbiAgICAgICAgaWYgKHN0b3JlSW5kZXggPCAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgdGhlIGV2ZW50IGluIHRoZSBzdG9yZVxuICAgICAgICBzdG9yZVtzdG9yZUluZGV4XSA9IGV2O1xuXG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5tYW5hZ2VyLCBldmVudFR5cGUsIHtcbiAgICAgICAgICAgIHBvaW50ZXJzOiBzdG9yZSxcbiAgICAgICAgICAgIGNoYW5nZWRQb2ludGVyczogW2V2XSxcbiAgICAgICAgICAgIHBvaW50ZXJUeXBlOiBwb2ludGVyVHlwZSxcbiAgICAgICAgICAgIHNyY0V2ZW50OiBldlxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVtb3ZlUG9pbnRlcikge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIGZyb20gdGhlIHN0b3JlXG4gICAgICAgICAgICBzdG9yZS5zcGxpY2Uoc3RvcmVJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxudmFyIFNJTkdMRV9UT1VDSF9JTlBVVF9NQVAgPSB7XG4gICAgdG91Y2hzdGFydDogSU5QVVRfU1RBUlQsXG4gICAgdG91Y2htb3ZlOiBJTlBVVF9NT1ZFLFxuICAgIHRvdWNoZW5kOiBJTlBVVF9FTkQsXG4gICAgdG91Y2hjYW5jZWw6IElOUFVUX0NBTkNFTFxufTtcblxudmFyIFNJTkdMRV9UT1VDSF9UQVJHRVRfRVZFTlRTID0gJ3RvdWNoc3RhcnQnO1xudmFyIFNJTkdMRV9UT1VDSF9XSU5ET1dfRVZFTlRTID0gJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJztcblxuLyoqXG4gKiBUb3VjaCBldmVudHMgaW5wdXRcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuZnVuY3Rpb24gU2luZ2xlVG91Y2hJbnB1dCgpIHtcbiAgICB0aGlzLmV2VGFyZ2V0ID0gU0lOR0xFX1RPVUNIX1RBUkdFVF9FVkVOVFM7XG4gICAgdGhpcy5ldldpbiA9IFNJTkdMRV9UT1VDSF9XSU5ET1dfRVZFTlRTO1xuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChTaW5nbGVUb3VjaElucHV0LCBJbnB1dCwge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uIFRFaGFuZGxlcihldikge1xuICAgICAgICB2YXIgdHlwZSA9IFNJTkdMRV9UT1VDSF9JTlBVVF9NQVBbZXYudHlwZV07XG5cbiAgICAgICAgLy8gc2hvdWxkIHdlIGhhbmRsZSB0aGUgdG91Y2ggZXZlbnRzP1xuICAgICAgICBpZiAodHlwZSA9PT0gSU5QVVRfU1RBUlQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc3RhcnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRvdWNoZXMgPSBub3JtYWxpemVTaW5nbGVUb3VjaGVzLmNhbGwodGhpcywgZXYsIHR5cGUpO1xuXG4gICAgICAgIC8vIHdoZW4gZG9uZSwgcmVzZXQgdGhlIHN0YXJ0ZWQgc3RhdGVcbiAgICAgICAgaWYgKHR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSAmJiB0b3VjaGVzWzBdLmxlbmd0aCAtIHRvdWNoZXNbMV0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5tYW5hZ2VyLCB0eXBlLCB7XG4gICAgICAgICAgICBwb2ludGVyczogdG91Y2hlc1swXSxcbiAgICAgICAgICAgIGNoYW5nZWRQb2ludGVyczogdG91Y2hlc1sxXSxcbiAgICAgICAgICAgIHBvaW50ZXJUeXBlOiBJTlBVVF9UWVBFX1RPVUNILFxuICAgICAgICAgICAgc3JjRXZlbnQ6IGV2XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIEB0aGlzIHtUb3VjaElucHV0fVxuICogQHBhcmFtIHtPYmplY3R9IGV2XG4gKiBAcGFyYW0ge051bWJlcn0gdHlwZSBmbGFnXG4gKiBAcmV0dXJucyB7dW5kZWZpbmVkfEFycmF5fSBbYWxsLCBjaGFuZ2VkXVxuICovXG5mdW5jdGlvbiBub3JtYWxpemVTaW5nbGVUb3VjaGVzKGV2LCB0eXBlKSB7XG4gICAgdmFyIGFsbCA9IHRvQXJyYXkoZXYudG91Y2hlcyk7XG4gICAgdmFyIGNoYW5nZWQgPSB0b0FycmF5KGV2LmNoYW5nZWRUb3VjaGVzKTtcblxuICAgIGlmICh0eXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkpIHtcbiAgICAgICAgYWxsID0gdW5pcXVlQXJyYXkoYWxsLmNvbmNhdChjaGFuZ2VkKSwgJ2lkZW50aWZpZXInLCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW2FsbCwgY2hhbmdlZF07XG59XG5cbnZhciBUT1VDSF9JTlBVVF9NQVAgPSB7XG4gICAgdG91Y2hzdGFydDogSU5QVVRfU1RBUlQsXG4gICAgdG91Y2htb3ZlOiBJTlBVVF9NT1ZFLFxuICAgIHRvdWNoZW5kOiBJTlBVVF9FTkQsXG4gICAgdG91Y2hjYW5jZWw6IElOUFVUX0NBTkNFTFxufTtcblxudmFyIFRPVUNIX1RBUkdFVF9FVkVOVFMgPSAndG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWwnO1xuXG4vKipcbiAqIE11bHRpLXVzZXIgdG91Y2ggZXZlbnRzIGlucHV0XG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIElucHV0XG4gKi9cbmZ1bmN0aW9uIFRvdWNoSW5wdXQoKSB7XG4gICAgdGhpcy5ldlRhcmdldCA9IFRPVUNIX1RBUkdFVF9FVkVOVFM7XG4gICAgdGhpcy50YXJnZXRJZHMgPSB7fTtcblxuICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmluaGVyaXQoVG91Y2hJbnB1dCwgSW5wdXQsIHtcbiAgICBoYW5kbGVyOiBmdW5jdGlvbiBNVEVoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciB0eXBlID0gVE9VQ0hfSU5QVVRfTUFQW2V2LnR5cGVdO1xuICAgICAgICB2YXIgdG91Y2hlcyA9IGdldFRvdWNoZXMuY2FsbCh0aGlzLCBldiwgdHlwZSk7XG4gICAgICAgIGlmICghdG91Y2hlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLm1hbmFnZXIsIHR5cGUsIHtcbiAgICAgICAgICAgIHBvaW50ZXJzOiB0b3VjaGVzWzBdLFxuICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiB0b3VjaGVzWzFdLFxuICAgICAgICAgICAgcG9pbnRlclR5cGU6IElOUFVUX1RZUEVfVE9VQ0gsXG4gICAgICAgICAgICBzcmNFdmVudDogZXZcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQHRoaXMge1RvdWNoSW5wdXR9XG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqIEBwYXJhbSB7TnVtYmVyfSB0eXBlIGZsYWdcbiAqIEByZXR1cm5zIHt1bmRlZmluZWR8QXJyYXl9IFthbGwsIGNoYW5nZWRdXG4gKi9cbmZ1bmN0aW9uIGdldFRvdWNoZXMoZXYsIHR5cGUpIHtcbiAgICB2YXIgYWxsVG91Y2hlcyA9IHRvQXJyYXkoZXYudG91Y2hlcyk7XG4gICAgdmFyIHRhcmdldElkcyA9IHRoaXMudGFyZ2V0SWRzO1xuXG4gICAgLy8gd2hlbiB0aGVyZSBpcyBvbmx5IG9uZSB0b3VjaCwgdGhlIHByb2Nlc3MgY2FuIGJlIHNpbXBsaWZpZWRcbiAgICBpZiAodHlwZSAmIChJTlBVVF9TVEFSVCB8IElOUFVUX01PVkUpICYmIGFsbFRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHRhcmdldElkc1thbGxUb3VjaGVzWzBdLmlkZW50aWZpZXJdID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIFthbGxUb3VjaGVzLCBhbGxUb3VjaGVzXTtcbiAgICB9XG5cbiAgICB2YXIgaSxcbiAgICAgICAgdGFyZ2V0VG91Y2hlcyxcbiAgICAgICAgY2hhbmdlZFRvdWNoZXMgPSB0b0FycmF5KGV2LmNoYW5nZWRUb3VjaGVzKSxcbiAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXMgPSBbXSxcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy50YXJnZXQ7XG5cbiAgICAvLyBnZXQgdGFyZ2V0IHRvdWNoZXMgZnJvbSB0b3VjaGVzXG4gICAgdGFyZ2V0VG91Y2hlcyA9IGFsbFRvdWNoZXMuZmlsdGVyKGZ1bmN0aW9uKHRvdWNoKSB7XG4gICAgICAgIHJldHVybiBoYXNQYXJlbnQodG91Y2gudGFyZ2V0LCB0YXJnZXQpO1xuICAgIH0pO1xuXG4gICAgLy8gY29sbGVjdCB0b3VjaGVzXG4gICAgaWYgKHR5cGUgPT09IElOUFVUX1NUQVJUKSB7XG4gICAgICAgIGkgPSAwO1xuICAgICAgICB3aGlsZSAoaSA8IHRhcmdldFRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0YXJnZXRJZHNbdGFyZ2V0VG91Y2hlc1tpXS5pZGVudGlmaWVyXSA9IHRydWU7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmaWx0ZXIgY2hhbmdlZCB0b3VjaGVzIHRvIG9ubHkgY29udGFpbiB0b3VjaGVzIHRoYXQgZXhpc3QgaW4gdGhlIGNvbGxlY3RlZCB0YXJnZXQgaWRzXG4gICAgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBjaGFuZ2VkVG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHRhcmdldElkc1tjaGFuZ2VkVG91Y2hlc1tpXS5pZGVudGlmaWVyXSkge1xuICAgICAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXMucHVzaChjaGFuZ2VkVG91Y2hlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbGVhbnVwIHJlbW92ZWQgdG91Y2hlc1xuICAgICAgICBpZiAodHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpKSB7XG4gICAgICAgICAgICBkZWxldGUgdGFyZ2V0SWRzW2NoYW5nZWRUb3VjaGVzW2ldLmlkZW50aWZpZXJdO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICB9XG5cbiAgICBpZiAoIWNoYW5nZWRUYXJnZXRUb3VjaGVzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgLy8gbWVyZ2UgdGFyZ2V0VG91Y2hlcyB3aXRoIGNoYW5nZWRUYXJnZXRUb3VjaGVzIHNvIGl0IGNvbnRhaW5zIEFMTCB0b3VjaGVzLCBpbmNsdWRpbmcgJ2VuZCcgYW5kICdjYW5jZWwnXG4gICAgICAgIHVuaXF1ZUFycmF5KHRhcmdldFRvdWNoZXMuY29uY2F0KGNoYW5nZWRUYXJnZXRUb3VjaGVzKSwgJ2lkZW50aWZpZXInLCB0cnVlKSxcbiAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXNcbiAgICBdO1xufVxuXG4vKipcbiAqIENvbWJpbmVkIHRvdWNoIGFuZCBtb3VzZSBpbnB1dFxuICpcbiAqIFRvdWNoIGhhcyBhIGhpZ2hlciBwcmlvcml0eSB0aGVuIG1vdXNlLCBhbmQgd2hpbGUgdG91Y2hpbmcgbm8gbW91c2UgZXZlbnRzIGFyZSBhbGxvd2VkLlxuICogVGhpcyBiZWNhdXNlIHRvdWNoIGRldmljZXMgYWxzbyBlbWl0IG1vdXNlIGV2ZW50cyB3aGlsZSBkb2luZyBhIHRvdWNoLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuXG52YXIgREVEVVBfVElNRU9VVCA9IDI1MDA7XG52YXIgREVEVVBfRElTVEFOQ0UgPSAyNTtcblxuZnVuY3Rpb24gVG91Y2hNb3VzZUlucHV0KCkge1xuICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB2YXIgaGFuZGxlciA9IGJpbmRGbih0aGlzLmhhbmRsZXIsIHRoaXMpO1xuICAgIHRoaXMudG91Y2ggPSBuZXcgVG91Y2hJbnB1dCh0aGlzLm1hbmFnZXIsIGhhbmRsZXIpO1xuICAgIHRoaXMubW91c2UgPSBuZXcgTW91c2VJbnB1dCh0aGlzLm1hbmFnZXIsIGhhbmRsZXIpO1xuXG4gICAgdGhpcy5wcmltYXJ5VG91Y2ggPSBudWxsO1xuICAgIHRoaXMubGFzdFRvdWNoZXMgPSBbXTtcbn1cblxuaW5oZXJpdChUb3VjaE1vdXNlSW5wdXQsIElucHV0LCB7XG4gICAgLyoqXG4gICAgICogaGFuZGxlIG1vdXNlIGFuZCB0b3VjaCBldmVudHNcbiAgICAgKiBAcGFyYW0ge0hhbW1lcn0gbWFuYWdlclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dEV2ZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0RGF0YVxuICAgICAqL1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uIFRNRWhhbmRsZXIobWFuYWdlciwgaW5wdXRFdmVudCwgaW5wdXREYXRhKSB7XG4gICAgICAgIHZhciBpc1RvdWNoID0gKGlucHV0RGF0YS5wb2ludGVyVHlwZSA9PSBJTlBVVF9UWVBFX1RPVUNIKSxcbiAgICAgICAgICAgIGlzTW91c2UgPSAoaW5wdXREYXRhLnBvaW50ZXJUeXBlID09IElOUFVUX1RZUEVfTU9VU0UpO1xuXG4gICAgICAgIGlmIChpc01vdXNlICYmIGlucHV0RGF0YS5zb3VyY2VDYXBhYmlsaXRpZXMgJiYgaW5wdXREYXRhLnNvdXJjZUNhcGFiaWxpdGllcy5maXJlc1RvdWNoRXZlbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3aGVuIHdlJ3JlIGluIGEgdG91Y2ggZXZlbnQsIHJlY29yZCB0b3VjaGVzIHRvICBkZS1kdXBlIHN5bnRoZXRpYyBtb3VzZSBldmVudFxuICAgICAgICBpZiAoaXNUb3VjaCkge1xuICAgICAgICAgICAgcmVjb3JkVG91Y2hlcy5jYWxsKHRoaXMsIGlucHV0RXZlbnQsIGlucHV0RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNNb3VzZSAmJiBpc1N5bnRoZXRpY0V2ZW50LmNhbGwodGhpcywgaW5wdXREYXRhKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWxsYmFjayhtYW5hZ2VyLCBpbnB1dEV2ZW50LCBpbnB1dERhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqL1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMudG91Y2guZGVzdHJveSgpO1xuICAgICAgICB0aGlzLm1vdXNlLmRlc3Ryb3koKTtcbiAgICB9XG59KTtcblxuZnVuY3Rpb24gcmVjb3JkVG91Y2hlcyhldmVudFR5cGUsIGV2ZW50RGF0YSkge1xuICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCkge1xuICAgICAgICB0aGlzLnByaW1hcnlUb3VjaCA9IGV2ZW50RGF0YS5jaGFuZ2VkUG9pbnRlcnNbMF0uaWRlbnRpZmllcjtcbiAgICAgICAgc2V0TGFzdFRvdWNoLmNhbGwodGhpcywgZXZlbnREYXRhKTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50VHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpKSB7XG4gICAgICAgIHNldExhc3RUb3VjaC5jYWxsKHRoaXMsIGV2ZW50RGF0YSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRMYXN0VG91Y2goZXZlbnREYXRhKSB7XG4gICAgdmFyIHRvdWNoID0gZXZlbnREYXRhLmNoYW5nZWRQb2ludGVyc1swXTtcblxuICAgIGlmICh0b3VjaC5pZGVudGlmaWVyID09PSB0aGlzLnByaW1hcnlUb3VjaCkge1xuICAgICAgICB2YXIgbGFzdFRvdWNoID0ge3g6IHRvdWNoLmNsaWVudFgsIHk6IHRvdWNoLmNsaWVudFl9O1xuICAgICAgICB0aGlzLmxhc3RUb3VjaGVzLnB1c2gobGFzdFRvdWNoKTtcbiAgICAgICAgdmFyIGx0cyA9IHRoaXMubGFzdFRvdWNoZXM7XG4gICAgICAgIHZhciByZW1vdmVMYXN0VG91Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpID0gbHRzLmluZGV4T2YobGFzdFRvdWNoKTtcbiAgICAgICAgICAgIGlmIChpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBsdHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBzZXRUaW1lb3V0KHJlbW92ZUxhc3RUb3VjaCwgREVEVVBfVElNRU9VVCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc1N5bnRoZXRpY0V2ZW50KGV2ZW50RGF0YSkge1xuICAgIHZhciB4ID0gZXZlbnREYXRhLnNyY0V2ZW50LmNsaWVudFgsIHkgPSBldmVudERhdGEuc3JjRXZlbnQuY2xpZW50WTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGFzdFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzLmxhc3RUb3VjaGVzW2ldO1xuICAgICAgICB2YXIgZHggPSBNYXRoLmFicyh4IC0gdC54KSwgZHkgPSBNYXRoLmFicyh5IC0gdC55KTtcbiAgICAgICAgaWYgKGR4IDw9IERFRFVQX0RJU1RBTkNFICYmIGR5IDw9IERFRFVQX0RJU1RBTkNFKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbnZhciBQUkVGSVhFRF9UT1VDSF9BQ1RJT04gPSBwcmVmaXhlZChURVNUX0VMRU1FTlQuc3R5bGUsICd0b3VjaEFjdGlvbicpO1xudmFyIE5BVElWRV9UT1VDSF9BQ1RJT04gPSBQUkVGSVhFRF9UT1VDSF9BQ1RJT04gIT09IHVuZGVmaW5lZDtcblxuLy8gbWFnaWNhbCB0b3VjaEFjdGlvbiB2YWx1ZVxudmFyIFRPVUNIX0FDVElPTl9DT01QVVRFID0gJ2NvbXB1dGUnO1xudmFyIFRPVUNIX0FDVElPTl9BVVRPID0gJ2F1dG8nO1xudmFyIFRPVUNIX0FDVElPTl9NQU5JUFVMQVRJT04gPSAnbWFuaXB1bGF0aW9uJzsgLy8gbm90IGltcGxlbWVudGVkXG52YXIgVE9VQ0hfQUNUSU9OX05PTkUgPSAnbm9uZSc7XG52YXIgVE9VQ0hfQUNUSU9OX1BBTl9YID0gJ3Bhbi14JztcbnZhciBUT1VDSF9BQ1RJT05fUEFOX1kgPSAncGFuLXknO1xudmFyIFRPVUNIX0FDVElPTl9NQVAgPSBnZXRUb3VjaEFjdGlvblByb3BzKCk7XG5cbi8qKlxuICogVG91Y2ggQWN0aW9uXG4gKiBzZXRzIHRoZSB0b3VjaEFjdGlvbiBwcm9wZXJ0eSBvciB1c2VzIHRoZSBqcyBhbHRlcm5hdGl2ZVxuICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUb3VjaEFjdGlvbihtYW5hZ2VyLCB2YWx1ZSkge1xuICAgIHRoaXMubWFuYWdlciA9IG1hbmFnZXI7XG4gICAgdGhpcy5zZXQodmFsdWUpO1xufVxuXG5Ub3VjaEFjdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogc2V0IHRoZSB0b3VjaEFjdGlvbiB2YWx1ZSBvbiB0aGUgZWxlbWVudCBvciBlbmFibGUgdGhlIHBvbHlmaWxsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyBmaW5kIG91dCB0aGUgdG91Y2gtYWN0aW9uIGJ5IHRoZSBldmVudCBoYW5kbGVyc1xuICAgICAgICBpZiAodmFsdWUgPT0gVE9VQ0hfQUNUSU9OX0NPTVBVVEUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5jb21wdXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoTkFUSVZFX1RPVUNIX0FDVElPTiAmJiB0aGlzLm1hbmFnZXIuZWxlbWVudC5zdHlsZSAmJiBUT1VDSF9BQ1RJT05fTUFQW3ZhbHVlXSkge1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVsZW1lbnQuc3R5bGVbUFJFRklYRURfVE9VQ0hfQUNUSU9OXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IHZhbHVlLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBqdXN0IHJlLXNldCB0aGUgdG91Y2hBY3Rpb24gdmFsdWVcbiAgICAgKi9cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldCh0aGlzLm1hbmFnZXIub3B0aW9ucy50b3VjaEFjdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNvbXB1dGUgdGhlIHZhbHVlIGZvciB0aGUgdG91Y2hBY3Rpb24gcHJvcGVydHkgYmFzZWQgb24gdGhlIHJlY29nbml6ZXIncyBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IHZhbHVlXG4gICAgICovXG4gICAgY29tcHV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgICAgIGVhY2godGhpcy5tYW5hZ2VyLnJlY29nbml6ZXJzLCBmdW5jdGlvbihyZWNvZ25pemVyKSB7XG4gICAgICAgICAgICBpZiAoYm9vbE9yRm4ocmVjb2duaXplci5vcHRpb25zLmVuYWJsZSwgW3JlY29nbml6ZXJdKSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMgPSBhY3Rpb25zLmNvbmNhdChyZWNvZ25pemVyLmdldFRvdWNoQWN0aW9uKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNsZWFuVG91Y2hBY3Rpb25zKGFjdGlvbnMuam9pbignICcpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogdGhpcyBtZXRob2QgaXMgY2FsbGVkIG9uIGVhY2ggaW5wdXQgY3ljbGUgYW5kIHByb3ZpZGVzIHRoZSBwcmV2ZW50aW5nIG9mIHRoZSBicm93c2VyIGJlaGF2aW9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gICAgICovXG4gICAgcHJldmVudERlZmF1bHRzOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgc3JjRXZlbnQgPSBpbnB1dC5zcmNFdmVudDtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IGlucHV0Lm9mZnNldERpcmVjdGlvbjtcblxuICAgICAgICAvLyBpZiB0aGUgdG91Y2ggYWN0aW9uIGRpZCBwcmV2ZW50ZWQgb25jZSB0aGlzIHNlc3Npb25cbiAgICAgICAgaWYgKHRoaXMubWFuYWdlci5zZXNzaW9uLnByZXZlbnRlZCkge1xuICAgICAgICAgICAgc3JjRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhY3Rpb25zID0gdGhpcy5hY3Rpb25zO1xuICAgICAgICB2YXIgaGFzTm9uZSA9IGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9OT05FKSAmJiAhVE9VQ0hfQUNUSU9OX01BUFtUT1VDSF9BQ1RJT05fTk9ORV07XG4gICAgICAgIHZhciBoYXNQYW5ZID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9ZKSAmJiAhVE9VQ0hfQUNUSU9OX01BUFtUT1VDSF9BQ1RJT05fUEFOX1ldO1xuICAgICAgICB2YXIgaGFzUGFuWCA9IGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9QQU5fWCkgJiYgIVRPVUNIX0FDVElPTl9NQVBbVE9VQ0hfQUNUSU9OX1BBTl9YXTtcblxuICAgICAgICBpZiAoaGFzTm9uZSkge1xuICAgICAgICAgICAgLy9kbyBub3QgcHJldmVudCBkZWZhdWx0cyBpZiB0aGlzIGlzIGEgdGFwIGdlc3R1cmVcblxuICAgICAgICAgICAgdmFyIGlzVGFwUG9pbnRlciA9IGlucHV0LnBvaW50ZXJzLmxlbmd0aCA9PT0gMTtcbiAgICAgICAgICAgIHZhciBpc1RhcE1vdmVtZW50ID0gaW5wdXQuZGlzdGFuY2UgPCAyO1xuICAgICAgICAgICAgdmFyIGlzVGFwVG91Y2hUaW1lID0gaW5wdXQuZGVsdGFUaW1lIDwgMjUwO1xuXG4gICAgICAgICAgICBpZiAoaXNUYXBQb2ludGVyICYmIGlzVGFwTW92ZW1lbnQgJiYgaXNUYXBUb3VjaFRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzUGFuWCAmJiBoYXNQYW5ZKSB7XG4gICAgICAgICAgICAvLyBgcGFuLXggcGFuLXlgIG1lYW5zIGJyb3dzZXIgaGFuZGxlcyBhbGwgc2Nyb2xsaW5nL3Bhbm5pbmcsIGRvIG5vdCBwcmV2ZW50XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzTm9uZSB8fFxuICAgICAgICAgICAgKGhhc1BhblkgJiYgZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHx8XG4gICAgICAgICAgICAoaGFzUGFuWCAmJiBkaXJlY3Rpb24gJiBESVJFQ1RJT05fVkVSVElDQUwpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcmV2ZW50U3JjKHNyY0V2ZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjYWxsIHByZXZlbnREZWZhdWx0IHRvIHByZXZlbnQgdGhlIGJyb3dzZXIncyBkZWZhdWx0IGJlaGF2aW9yIChzY3JvbGxpbmcgaW4gbW9zdCBjYXNlcylcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3JjRXZlbnRcbiAgICAgKi9cbiAgICBwcmV2ZW50U3JjOiBmdW5jdGlvbihzcmNFdmVudCkge1xuICAgICAgICB0aGlzLm1hbmFnZXIuc2Vzc2lvbi5wcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICBzcmNFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn07XG5cbi8qKlxuICogd2hlbiB0aGUgdG91Y2hBY3Rpb25zIGFyZSBjb2xsZWN0ZWQgdGhleSBhcmUgbm90IGEgdmFsaWQgdmFsdWUsIHNvIHdlIG5lZWQgdG8gY2xlYW4gdGhpbmdzIHVwLiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uc1xuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIGNsZWFuVG91Y2hBY3Rpb25zKGFjdGlvbnMpIHtcbiAgICAvLyBub25lXG4gICAgaWYgKGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9OT05FKSkge1xuICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX05PTkU7XG4gICAgfVxuXG4gICAgdmFyIGhhc1BhblggPSBpblN0cihhY3Rpb25zLCBUT1VDSF9BQ1RJT05fUEFOX1gpO1xuICAgIHZhciBoYXNQYW5ZID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9ZKTtcblxuICAgIC8vIGlmIGJvdGggcGFuLXggYW5kIHBhbi15IGFyZSBzZXQgKGRpZmZlcmVudCByZWNvZ25pemVyc1xuICAgIC8vIGZvciBkaWZmZXJlbnQgZGlyZWN0aW9ucywgZS5nLiBob3Jpem9udGFsIHBhbiBidXQgdmVydGljYWwgc3dpcGU/KVxuICAgIC8vIHdlIG5lZWQgbm9uZSAoYXMgb3RoZXJ3aXNlIHdpdGggcGFuLXggcGFuLXkgY29tYmluZWQgbm9uZSBvZiB0aGVzZVxuICAgIC8vIHJlY29nbml6ZXJzIHdpbGwgd29yaywgc2luY2UgdGhlIGJyb3dzZXIgd291bGQgaGFuZGxlIGFsbCBwYW5uaW5nXG4gICAgaWYgKGhhc1BhblggJiYgaGFzUGFuWSkge1xuICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX05PTkU7XG4gICAgfVxuXG4gICAgLy8gcGFuLXggT1IgcGFuLXlcbiAgICBpZiAoaGFzUGFuWCB8fCBoYXNQYW5ZKSB7XG4gICAgICAgIHJldHVybiBoYXNQYW5YID8gVE9VQ0hfQUNUSU9OX1BBTl9YIDogVE9VQ0hfQUNUSU9OX1BBTl9ZO1xuICAgIH1cblxuICAgIC8vIG1hbmlwdWxhdGlvblxuICAgIGlmIChpblN0cihhY3Rpb25zLCBUT1VDSF9BQ1RJT05fTUFOSVBVTEFUSU9OKSkge1xuICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX01BTklQVUxBVElPTjtcbiAgICB9XG5cbiAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX0FVVE87XG59XG5cbmZ1bmN0aW9uIGdldFRvdWNoQWN0aW9uUHJvcHMoKSB7XG4gICAgaWYgKCFOQVRJVkVfVE9VQ0hfQUNUSU9OKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHRvdWNoTWFwID0ge307XG4gICAgdmFyIGNzc1N1cHBvcnRzID0gd2luZG93LkNTUyAmJiB3aW5kb3cuQ1NTLnN1cHBvcnRzO1xuICAgIFsnYXV0bycsICdtYW5pcHVsYXRpb24nLCAncGFuLXknLCAncGFuLXgnLCAncGFuLXggcGFuLXknLCAnbm9uZSddLmZvckVhY2goZnVuY3Rpb24odmFsKSB7XG5cbiAgICAgICAgLy8gSWYgY3NzLnN1cHBvcnRzIGlzIG5vdCBzdXBwb3J0ZWQgYnV0IHRoZXJlIGlzIG5hdGl2ZSB0b3VjaC1hY3Rpb24gYXNzdW1lIGl0IHN1cHBvcnRzXG4gICAgICAgIC8vIGFsbCB2YWx1ZXMuIFRoaXMgaXMgdGhlIGNhc2UgZm9yIElFIDEwIGFuZCAxMS5cbiAgICAgICAgdG91Y2hNYXBbdmFsXSA9IGNzc1N1cHBvcnRzID8gd2luZG93LkNTUy5zdXBwb3J0cygndG91Y2gtYWN0aW9uJywgdmFsKSA6IHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRvdWNoTWFwO1xufVxuXG4vKipcbiAqIFJlY29nbml6ZXIgZmxvdyBleHBsYWluZWQ7ICpcbiAqIEFsbCByZWNvZ25pemVycyBoYXZlIHRoZSBpbml0aWFsIHN0YXRlIG9mIFBPU1NJQkxFIHdoZW4gYSBpbnB1dCBzZXNzaW9uIHN0YXJ0cy5cbiAqIFRoZSBkZWZpbml0aW9uIG9mIGEgaW5wdXQgc2Vzc2lvbiBpcyBmcm9tIHRoZSBmaXJzdCBpbnB1dCB1bnRpbCB0aGUgbGFzdCBpbnB1dCwgd2l0aCBhbGwgaXQncyBtb3ZlbWVudCBpbiBpdC4gKlxuICogRXhhbXBsZSBzZXNzaW9uIGZvciBtb3VzZS1pbnB1dDogbW91c2Vkb3duIC0+IG1vdXNlbW92ZSAtPiBtb3VzZXVwXG4gKlxuICogT24gZWFjaCByZWNvZ25pemluZyBjeWNsZSAoc2VlIE1hbmFnZXIucmVjb2duaXplKSB0aGUgLnJlY29nbml6ZSgpIG1ldGhvZCBpcyBleGVjdXRlZFxuICogd2hpY2ggZGV0ZXJtaW5lcyB3aXRoIHN0YXRlIGl0IHNob3VsZCBiZS5cbiAqXG4gKiBJZiB0aGUgcmVjb2duaXplciBoYXMgdGhlIHN0YXRlIEZBSUxFRCwgQ0FOQ0VMTEVEIG9yIFJFQ09HTklaRUQgKGVxdWFscyBFTkRFRCksIGl0IGlzIHJlc2V0IHRvXG4gKiBQT1NTSUJMRSB0byBnaXZlIGl0IGFub3RoZXIgY2hhbmdlIG9uIHRoZSBuZXh0IGN5Y2xlLlxuICpcbiAqICAgICAgICAgICAgICAgUG9zc2libGVcbiAqICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICArLS0tLS0rLS0tLS0tLS0tLS0tLS0tK1xuICogICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICArLS0tLS0rLS0tLS0rICAgICAgICAgICAgICAgfFxuICogICAgICB8ICAgICAgICAgICB8ICAgICAgICAgICAgICAgfFxuICogICBGYWlsZWQgICAgICBDYW5jZWxsZWQgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICstLS0tLS0tKy0tLS0tLStcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICBSZWNvZ25pemVkICAgICAgIEJlZ2FuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENoYW5nZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFbmRlZC9SZWNvZ25pemVkXG4gKi9cbnZhciBTVEFURV9QT1NTSUJMRSA9IDE7XG52YXIgU1RBVEVfQkVHQU4gPSAyO1xudmFyIFNUQVRFX0NIQU5HRUQgPSA0O1xudmFyIFNUQVRFX0VOREVEID0gODtcbnZhciBTVEFURV9SRUNPR05JWkVEID0gU1RBVEVfRU5ERUQ7XG52YXIgU1RBVEVfQ0FOQ0VMTEVEID0gMTY7XG52YXIgU1RBVEVfRkFJTEVEID0gMzI7XG5cbi8qKlxuICogUmVjb2duaXplclxuICogRXZlcnkgcmVjb2duaXplciBuZWVkcyB0byBleHRlbmQgZnJvbSB0aGlzIGNsYXNzLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5mdW5jdGlvbiBSZWNvZ25pemVyKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBhc3NpZ24oe30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMgfHwge30pO1xuXG4gICAgdGhpcy5pZCA9IHVuaXF1ZUlkKCk7XG5cbiAgICB0aGlzLm1hbmFnZXIgPSBudWxsO1xuXG4gICAgLy8gZGVmYXVsdCBpcyBlbmFibGUgdHJ1ZVxuICAgIHRoaXMub3B0aW9ucy5lbmFibGUgPSBpZlVuZGVmaW5lZCh0aGlzLm9wdGlvbnMuZW5hYmxlLCB0cnVlKTtcblxuICAgIHRoaXMuc3RhdGUgPSBTVEFURV9QT1NTSUJMRTtcblxuICAgIHRoaXMuc2ltdWx0YW5lb3VzID0ge307XG4gICAgdGhpcy5yZXF1aXJlRmFpbCA9IFtdO1xufVxuXG5SZWNvZ25pemVyLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBAdmlydHVhbFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdHM6IHt9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge1JlY29nbml6ZXJ9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIGFsc28gdXBkYXRlIHRoZSB0b3VjaEFjdGlvbiwgaW4gY2FzZSBzb21ldGhpbmcgY2hhbmdlZCBhYm91dCB0aGUgZGlyZWN0aW9ucy9lbmFibGVkIHN0YXRlXG4gICAgICAgIHRoaXMubWFuYWdlciAmJiB0aGlzLm1hbmFnZXIudG91Y2hBY3Rpb24udXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWNvZ25pemUgc2ltdWx0YW5lb3VzIHdpdGggYW4gb3RoZXIgcmVjb2duaXplci5cbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IG90aGVyUmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfSB0aGlzXG4gICAgICovXG4gICAgcmVjb2duaXplV2l0aDogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdyZWNvZ25pemVXaXRoJywgdGhpcykpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNpbXVsdGFuZW91cyA9IHRoaXMuc2ltdWx0YW5lb3VzO1xuICAgICAgICBvdGhlclJlY29nbml6ZXIgPSBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgdGhpcyk7XG4gICAgICAgIGlmICghc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF0pIHtcbiAgICAgICAgICAgIHNpbXVsdGFuZW91c1tvdGhlclJlY29nbml6ZXIuaWRdID0gb3RoZXJSZWNvZ25pemVyO1xuICAgICAgICAgICAgb3RoZXJSZWNvZ25pemVyLnJlY29nbml6ZVdpdGgodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGRyb3AgdGhlIHNpbXVsdGFuZW91cyBsaW5rLiBpdCBkb2VzbnQgcmVtb3ZlIHRoZSBsaW5rIG9uIHRoZSBvdGhlciByZWNvZ25pemVyLlxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gb3RoZXJSZWNvZ25pemVyXG4gICAgICogQHJldHVybnMge1JlY29nbml6ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICBkcm9wUmVjb2duaXplV2l0aDogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdkcm9wUmVjb2duaXplV2l0aCcsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIG90aGVyUmVjb2duaXplciA9IGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCB0aGlzKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWNvZ25pemVyIGNhbiBvbmx5IHJ1biB3aGVuIGFuIG90aGVyIGlzIGZhaWxpbmdcbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IG90aGVyUmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfSB0aGlzXG4gICAgICovXG4gICAgcmVxdWlyZUZhaWx1cmU6IGZ1bmN0aW9uKG90aGVyUmVjb2duaXplcikge1xuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcob3RoZXJSZWNvZ25pemVyLCAncmVxdWlyZUZhaWx1cmUnLCB0aGlzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVxdWlyZUZhaWwgPSB0aGlzLnJlcXVpcmVGYWlsO1xuICAgICAgICBvdGhlclJlY29nbml6ZXIgPSBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgdGhpcyk7XG4gICAgICAgIGlmIChpbkFycmF5KHJlcXVpcmVGYWlsLCBvdGhlclJlY29nbml6ZXIpID09PSAtMSkge1xuICAgICAgICAgICAgcmVxdWlyZUZhaWwucHVzaChvdGhlclJlY29nbml6ZXIpO1xuICAgICAgICAgICAgb3RoZXJSZWNvZ25pemVyLnJlcXVpcmVGYWlsdXJlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBkcm9wIHRoZSByZXF1aXJlRmFpbHVyZSBsaW5rLiBpdCBkb2VzIG5vdCByZW1vdmUgdGhlIGxpbmsgb24gdGhlIG90aGVyIHJlY29nbml6ZXIuXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcn0gdGhpc1xuICAgICAqL1xuICAgIGRyb3BSZXF1aXJlRmFpbHVyZTogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdkcm9wUmVxdWlyZUZhaWx1cmUnLCB0aGlzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBvdGhlclJlY29nbml6ZXIgPSBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgdGhpcyk7XG4gICAgICAgIHZhciBpbmRleCA9IGluQXJyYXkodGhpcy5yZXF1aXJlRmFpbCwgb3RoZXJSZWNvZ25pemVyKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWlyZUZhaWwuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaGFzIHJlcXVpcmUgZmFpbHVyZXMgYm9vbGVhblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGhhc1JlcXVpcmVGYWlsdXJlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVpcmVGYWlsLmxlbmd0aCA+IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlmIHRoZSByZWNvZ25pemVyIGNhbiByZWNvZ25pemUgc2ltdWx0YW5lb3VzIHdpdGggYW4gb3RoZXIgcmVjb2duaXplclxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gb3RoZXJSZWNvZ25pemVyXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgY2FuUmVjb2duaXplV2l0aDogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFlvdSBzaG91bGQgdXNlIGB0cnlFbWl0YCBpbnN0ZWFkIG9mIGBlbWl0YCBkaXJlY3RseSB0byBjaGVja1xuICAgICAqIHRoYXQgYWxsIHRoZSBuZWVkZWQgcmVjb2duaXplcnMgaGFzIGZhaWxlZCBiZWZvcmUgZW1pdHRpbmcuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gICAgICovXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGZ1bmN0aW9uIGVtaXQoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYubWFuYWdlci5lbWl0KGV2ZW50LCBpbnB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAncGFuc3RhcnQnIGFuZCAncGFubW92ZSdcbiAgICAgICAgaWYgKHN0YXRlIDwgU1RBVEVfRU5ERUQpIHtcbiAgICAgICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50ICsgc3RhdGVTdHIoc3RhdGUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50KTsgLy8gc2ltcGxlICdldmVudE5hbWUnIGV2ZW50c1xuXG4gICAgICAgIGlmIChpbnB1dC5hZGRpdGlvbmFsRXZlbnQpIHsgLy8gYWRkaXRpb25hbCBldmVudChwYW5sZWZ0LCBwYW5yaWdodCwgcGluY2hpbiwgcGluY2hvdXQuLi4pXG4gICAgICAgICAgICBlbWl0KGlucHV0LmFkZGl0aW9uYWxFdmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwYW5lbmQgYW5kIHBhbmNhbmNlbFxuICAgICAgICBpZiAoc3RhdGUgPj0gU1RBVEVfRU5ERUQpIHtcbiAgICAgICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50ICsgc3RhdGVTdHIoc3RhdGUpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB0aGF0IGFsbCB0aGUgcmVxdWlyZSBmYWlsdXJlIHJlY29nbml6ZXJzIGhhcyBmYWlsZWQsXG4gICAgICogaWYgdHJ1ZSwgaXQgZW1pdHMgYSBnZXN0dXJlIGV2ZW50LFxuICAgICAqIG90aGVyd2lzZSwgc2V0dXAgdGhlIHN0YXRlIHRvIEZBSUxFRC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKi9cbiAgICB0cnlFbWl0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5jYW5FbWl0KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVtaXQoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGl0J3MgZmFpbGluZyBhbnl3YXlcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX0ZBSUxFRDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2FuIHdlIGVtaXQ/XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgY2FuRW1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLnJlcXVpcmVGYWlsLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKCEodGhpcy5yZXF1aXJlRmFpbFtpXS5zdGF0ZSAmIChTVEFURV9GQUlMRUQgfCBTVEFURV9QT1NTSUJMRSkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB1cGRhdGUgdGhlIHJlY29nbml6ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXG4gICAgICovXG4gICAgcmVjb2duaXplOiBmdW5jdGlvbihpbnB1dERhdGEpIHtcbiAgICAgICAgLy8gbWFrZSBhIG5ldyBjb3B5IG9mIHRoZSBpbnB1dERhdGFcbiAgICAgICAgLy8gc28gd2UgY2FuIGNoYW5nZSB0aGUgaW5wdXREYXRhIHdpdGhvdXQgbWVzc2luZyB1cCB0aGUgb3RoZXIgcmVjb2duaXplcnNcbiAgICAgICAgdmFyIGlucHV0RGF0YUNsb25lID0gYXNzaWduKHt9LCBpbnB1dERhdGEpO1xuXG4gICAgICAgIC8vIGlzIGlzIGVuYWJsZWQgYW5kIGFsbG93IHJlY29nbml6aW5nP1xuICAgICAgICBpZiAoIWJvb2xPckZuKHRoaXMub3B0aW9ucy5lbmFibGUsIFt0aGlzLCBpbnB1dERhdGFDbG9uZV0pKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfRkFJTEVEO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVzZXQgd2hlbiB3ZSd2ZSByZWFjaGVkIHRoZSBlbmRcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiAoU1RBVEVfUkVDT0dOSVpFRCB8IFNUQVRFX0NBTkNFTExFRCB8IFNUQVRFX0ZBSUxFRCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURV9QT1NTSUJMRTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnByb2Nlc3MoaW5wdXREYXRhQ2xvbmUpO1xuXG4gICAgICAgIC8vIHRoZSByZWNvZ25pemVyIGhhcyByZWNvZ25pemVkIGEgZ2VzdHVyZVxuICAgICAgICAvLyBzbyB0cmlnZ2VyIGFuIGV2ZW50XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYgKFNUQVRFX0JFR0FOIHwgU1RBVEVfQ0hBTkdFRCB8IFNUQVRFX0VOREVEIHwgU1RBVEVfQ0FOQ0VMTEVEKSkge1xuICAgICAgICAgICAgdGhpcy50cnlFbWl0KGlucHV0RGF0YUNsb25lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gdGhlIHN0YXRlIG9mIHRoZSByZWNvZ25pemVyXG4gICAgICogdGhlIGFjdHVhbCByZWNvZ25pemluZyBoYXBwZW5zIGluIHRoaXMgbWV0aG9kXG4gICAgICogQHZpcnR1YWxcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXG4gICAgICogQHJldHVybnMge0NvbnN0fSBTVEFURVxuICAgICAqL1xuICAgIHByb2Nlc3M6IGZ1bmN0aW9uKGlucHV0RGF0YSkgeyB9LCAvLyBqc2hpbnQgaWdub3JlOmxpbmVcblxuICAgIC8qKlxuICAgICAqIHJldHVybiB0aGUgcHJlZmVycmVkIHRvdWNoLWFjdGlvblxuICAgICAqIEB2aXJ0dWFsXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqL1xuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHsgfSxcblxuICAgIC8qKlxuICAgICAqIGNhbGxlZCB3aGVuIHRoZSBnZXN0dXJlIGlzbid0IGFsbG93ZWQgdG8gcmVjb2duaXplXG4gICAgICogbGlrZSB3aGVuIGFub3RoZXIgaXMgYmVpbmcgcmVjb2duaXplZCBvciBpdCBpcyBkaXNhYmxlZFxuICAgICAqIEB2aXJ0dWFsXG4gICAgICovXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkgeyB9XG59O1xuXG4vKipcbiAqIGdldCBhIHVzYWJsZSBzdHJpbmcsIHVzZWQgYXMgZXZlbnQgcG9zdGZpeFxuICogQHBhcmFtIHtDb25zdH0gc3RhdGVcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0YXRlXG4gKi9cbmZ1bmN0aW9uIHN0YXRlU3RyKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlICYgU1RBVEVfQ0FOQ0VMTEVEKSB7XG4gICAgICAgIHJldHVybiAnY2FuY2VsJztcbiAgICB9IGVsc2UgaWYgKHN0YXRlICYgU1RBVEVfRU5ERUQpIHtcbiAgICAgICAgcmV0dXJuICdlbmQnO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgJiBTVEFURV9DSEFOR0VEKSB7XG4gICAgICAgIHJldHVybiAnbW92ZSc7XG4gICAgfSBlbHNlIGlmIChzdGF0ZSAmIFNUQVRFX0JFR0FOKSB7XG4gICAgICAgIHJldHVybiAnc3RhcnQnO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogZGlyZWN0aW9uIGNvbnMgdG8gc3RyaW5nXG4gKiBAcGFyYW0ge0NvbnN0fSBkaXJlY3Rpb25cbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGRpcmVjdGlvblN0cihkaXJlY3Rpb24pIHtcbiAgICBpZiAoZGlyZWN0aW9uID09IERJUkVDVElPTl9ET1dOKSB7XG4gICAgICAgIHJldHVybiAnZG93bic7XG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX1VQKSB7XG4gICAgICAgIHJldHVybiAndXAnO1xuICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09IERJUkVDVElPTl9MRUZUKSB7XG4gICAgICAgIHJldHVybiAnbGVmdCc7XG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX1JJR0hUKSB7XG4gICAgICAgIHJldHVybiAncmlnaHQnO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogZ2V0IGEgcmVjb2duaXplciBieSBuYW1lIGlmIGl0IGlzIGJvdW5kIHRvIGEgbWFuYWdlclxuICogQHBhcmFtIHtSZWNvZ25pemVyfFN0cmluZ30gb3RoZXJSZWNvZ25pemVyXG4gKiBAcGFyYW0ge1JlY29nbml6ZXJ9IHJlY29nbml6ZXJcbiAqIEByZXR1cm5zIHtSZWNvZ25pemVyfVxuICovXG5mdW5jdGlvbiBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgcmVjb2duaXplcikge1xuICAgIHZhciBtYW5hZ2VyID0gcmVjb2duaXplci5tYW5hZ2VyO1xuICAgIGlmIChtYW5hZ2VyKSB7XG4gICAgICAgIHJldHVybiBtYW5hZ2VyLmdldChvdGhlclJlY29nbml6ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gb3RoZXJSZWNvZ25pemVyO1xufVxuXG4vKipcbiAqIFRoaXMgcmVjb2duaXplciBpcyBqdXN0IHVzZWQgYXMgYSBiYXNlIGZvciB0aGUgc2ltcGxlIGF0dHJpYnV0ZSByZWNvZ25pemVycy5cbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBBdHRyUmVjb2duaXplcigpIHtcbiAgICBSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmluaGVyaXQoQXR0clJlY29nbml6ZXIsIFJlY29nbml6ZXIsIHtcbiAgICAvKipcbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICogQG1lbWJlcm9mIEF0dHJSZWNvZ25pemVyXG4gICAgICovXG4gICAgZGVmYXVsdHM6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqIEBkZWZhdWx0IDFcbiAgICAgICAgICovXG4gICAgICAgIHBvaW50ZXJzOiAxXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gY2hlY2sgaWYgaXQgdGhlIHJlY29nbml6ZXIgcmVjZWl2ZXMgdmFsaWQgaW5wdXQsIGxpa2UgaW5wdXQuZGlzdGFuY2UgPiAxMC5cbiAgICAgKiBAbWVtYmVyb2YgQXR0clJlY29nbml6ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gcmVjb2duaXplZFxuICAgICAqL1xuICAgIGF0dHJUZXN0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgb3B0aW9uUG9pbnRlcnMgPSB0aGlzLm9wdGlvbnMucG9pbnRlcnM7XG4gICAgICAgIHJldHVybiBvcHRpb25Qb2ludGVycyA9PT0gMCB8fCBpbnB1dC5wb2ludGVycy5sZW5ndGggPT09IG9wdGlvblBvaW50ZXJzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIHRoZSBpbnB1dCBhbmQgcmV0dXJuIHRoZSBzdGF0ZSBmb3IgdGhlIHJlY29nbml6ZXJcbiAgICAgKiBAbWVtYmVyb2YgQXR0clJlY29nbml6ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKiBAcmV0dXJucyB7Kn0gU3RhdGVcbiAgICAgKi9cbiAgICBwcm9jZXNzOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgZXZlbnRUeXBlID0gaW5wdXQuZXZlbnRUeXBlO1xuXG4gICAgICAgIHZhciBpc1JlY29nbml6ZWQgPSBzdGF0ZSAmIChTVEFURV9CRUdBTiB8IFNUQVRFX0NIQU5HRUQpO1xuICAgICAgICB2YXIgaXNWYWxpZCA9IHRoaXMuYXR0clRlc3QoaW5wdXQpO1xuXG4gICAgICAgIC8vIG9uIGNhbmNlbCBpbnB1dCBhbmQgd2UndmUgcmVjb2duaXplZCBiZWZvcmUsIHJldHVybiBTVEFURV9DQU5DRUxMRURcbiAgICAgICAgaWYgKGlzUmVjb2duaXplZCAmJiAoZXZlbnRUeXBlICYgSU5QVVRfQ0FOQ0VMIHx8ICFpc1ZhbGlkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlIHwgU1RBVEVfQ0FOQ0VMTEVEO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUmVjb2duaXplZCB8fCBpc1ZhbGlkKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlIHwgU1RBVEVfRU5ERUQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCEoc3RhdGUgJiBTVEFURV9CRUdBTikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfQkVHQU47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUgfCBTVEFURV9DSEFOR0VEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBTVEFURV9GQUlMRUQ7XG4gICAgfVxufSk7XG5cbi8qKlxuICogUGFuXG4gKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgZG93biBhbmQgbW92ZWQgaW4gdGhlIGFsbG93ZWQgZGlyZWN0aW9uLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBQYW5SZWNvZ25pemVyKCkge1xuICAgIEF0dHJSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLnBYID0gbnVsbDtcbiAgICB0aGlzLnBZID0gbnVsbDtcbn1cblxuaW5oZXJpdChQYW5SZWNvZ25pemVyLCBBdHRyUmVjb2duaXplciwge1xuICAgIC8qKlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKiBAbWVtYmVyb2YgUGFuUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAncGFuJyxcbiAgICAgICAgdGhyZXNob2xkOiAxMCxcbiAgICAgICAgcG9pbnRlcnM6IDEsXG4gICAgICAgIGRpcmVjdGlvbjogRElSRUNUSU9OX0FMTFxuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uO1xuICAgICAgICB2YXIgYWN0aW9ucyA9IFtdO1xuICAgICAgICBpZiAoZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChUT1VDSF9BQ1RJT05fUEFOX1kpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkaXJlY3Rpb24gJiBESVJFQ1RJT05fVkVSVElDQUwpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChUT1VDSF9BQ1RJT05fUEFOX1gpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3Rpb25zO1xuICAgIH0sXG5cbiAgICBkaXJlY3Rpb25UZXN0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgdmFyIGhhc01vdmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gaW5wdXQuZGlzdGFuY2U7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBpbnB1dC5kaXJlY3Rpb247XG4gICAgICAgIHZhciB4ID0gaW5wdXQuZGVsdGFYO1xuICAgICAgICB2YXIgeSA9IGlucHV0LmRlbHRhWTtcblxuICAgICAgICAvLyBsb2NrIHRvIGF4aXM/XG4gICAgICAgIGlmICghKGRpcmVjdGlvbiAmIG9wdGlvbnMuZGlyZWN0aW9uKSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSAoeCA9PT0gMCkgPyBESVJFQ1RJT05fTk9ORSA6ICh4IDwgMCkgPyBESVJFQ1RJT05fTEVGVCA6IERJUkVDVElPTl9SSUdIVDtcbiAgICAgICAgICAgICAgICBoYXNNb3ZlZCA9IHggIT0gdGhpcy5wWDtcbiAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IE1hdGguYWJzKGlucHV0LmRlbHRhWCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9ICh5ID09PSAwKSA/IERJUkVDVElPTl9OT05FIDogKHkgPCAwKSA/IERJUkVDVElPTl9VUCA6IERJUkVDVElPTl9ET1dOO1xuICAgICAgICAgICAgICAgIGhhc01vdmVkID0geSAhPSB0aGlzLnBZO1xuICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoaW5wdXQuZGVsdGFZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpbnB1dC5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgICAgIHJldHVybiBoYXNNb3ZlZCAmJiBkaXN0YW5jZSA+IG9wdGlvbnMudGhyZXNob2xkICYmIGRpcmVjdGlvbiAmIG9wdGlvbnMuZGlyZWN0aW9uO1xuICAgIH0sXG5cbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIEF0dHJSZWNvZ25pemVyLnByb3RvdHlwZS5hdHRyVGVzdC5jYWxsKHRoaXMsIGlucHV0KSAmJlxuICAgICAgICAgICAgKHRoaXMuc3RhdGUgJiBTVEFURV9CRUdBTiB8fCAoISh0aGlzLnN0YXRlICYgU1RBVEVfQkVHQU4pICYmIHRoaXMuZGlyZWN0aW9uVGVzdChpbnB1dCkpKTtcbiAgICB9LFxuXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgICAgICB0aGlzLnBYID0gaW5wdXQuZGVsdGFYO1xuICAgICAgICB0aGlzLnBZID0gaW5wdXQuZGVsdGFZO1xuXG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBkaXJlY3Rpb25TdHIoaW5wdXQuZGlyZWN0aW9uKTtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICBpbnB1dC5hZGRpdGlvbmFsRXZlbnQgPSB0aGlzLm9wdGlvbnMuZXZlbnQgKyBkaXJlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc3VwZXIuZW1pdC5jYWxsKHRoaXMsIGlucHV0KTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBQaW5jaFxuICogUmVjb2duaXplZCB3aGVuIHR3byBvciBtb3JlIHBvaW50ZXJzIGFyZSBtb3ZpbmcgdG93YXJkICh6b29tLWluKSBvciBhd2F5IGZyb20gZWFjaCBvdGhlciAoem9vbS1vdXQpLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBQaW5jaFJlY29nbml6ZXIoKSB7XG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChQaW5jaFJlY29nbml6ZXIsIEF0dHJSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBQaW5jaFJlY29nbml6ZXJcbiAgICAgKi9cbiAgICBkZWZhdWx0czoge1xuICAgICAgICBldmVudDogJ3BpbmNoJyxcbiAgICAgICAgdGhyZXNob2xkOiAwLFxuICAgICAgICBwb2ludGVyczogMlxuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBbVE9VQ0hfQUNUSU9OX05PTkVdO1xuICAgIH0sXG5cbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXG4gICAgICAgICAgICAoTWF0aC5hYnMoaW5wdXQuc2NhbGUgLSAxKSA+IHRoaXMub3B0aW9ucy50aHJlc2hvbGQgfHwgdGhpcy5zdGF0ZSAmIFNUQVRFX0JFR0FOKTtcbiAgICB9LFxuXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0LnNjYWxlICE9PSAxKSB7XG4gICAgICAgICAgICB2YXIgaW5PdXQgPSBpbnB1dC5zY2FsZSA8IDEgPyAnaW4nIDogJ291dCc7XG4gICAgICAgICAgICBpbnB1dC5hZGRpdGlvbmFsRXZlbnQgPSB0aGlzLm9wdGlvbnMuZXZlbnQgKyBpbk91dDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zdXBlci5lbWl0LmNhbGwodGhpcywgaW5wdXQpO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIFByZXNzXG4gKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgZG93biBmb3IgeCBtcyB3aXRob3V0IGFueSBtb3ZlbWVudC5cbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBQcmVzc1JlY29nbml6ZXIoKSB7XG4gICAgUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICAgIHRoaXMuX2lucHV0ID0gbnVsbDtcbn1cblxuaW5oZXJpdChQcmVzc1JlY29nbml6ZXIsIFJlY29nbml6ZXIsIHtcbiAgICAvKipcbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICogQG1lbWJlcm9mIFByZXNzUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAncHJlc3MnLFxuICAgICAgICBwb2ludGVyczogMSxcbiAgICAgICAgdGltZTogMjUxLCAvLyBtaW5pbWFsIHRpbWUgb2YgdGhlIHBvaW50ZXIgdG8gYmUgcHJlc3NlZFxuICAgICAgICB0aHJlc2hvbGQ6IDkgLy8gYSBtaW5pbWFsIG1vdmVtZW50IGlzIG9rLCBidXQga2VlcCBpdCBsb3dcbiAgICB9LFxuXG4gICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gW1RPVUNIX0FDVElPTl9BVVRPXTtcbiAgICB9LFxuXG4gICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgIHZhciB2YWxpZFBvaW50ZXJzID0gaW5wdXQucG9pbnRlcnMubGVuZ3RoID09PSBvcHRpb25zLnBvaW50ZXJzO1xuICAgICAgICB2YXIgdmFsaWRNb3ZlbWVudCA9IGlucHV0LmRpc3RhbmNlIDwgb3B0aW9ucy50aHJlc2hvbGQ7XG4gICAgICAgIHZhciB2YWxpZFRpbWUgPSBpbnB1dC5kZWx0YVRpbWUgPiBvcHRpb25zLnRpbWU7XG5cbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcblxuICAgICAgICAvLyB3ZSBvbmx5IGFsbG93IGxpdHRsZSBtb3ZlbWVudFxuICAgICAgICAvLyBhbmQgd2UndmUgcmVhY2hlZCBhbiBlbmQgZXZlbnQsIHNvIGEgdGFwIGlzIHBvc3NpYmxlXG4gICAgICAgIGlmICghdmFsaWRNb3ZlbWVudCB8fCAhdmFsaWRQb2ludGVycyB8fCAoaW5wdXQuZXZlbnRUeXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkgJiYgIXZhbGlkVGltZSkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5ldmVudFR5cGUgJiBJTlBVVF9TVEFSVCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0Q29udGV4dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfUkVDT0dOSVpFRDtcbiAgICAgICAgICAgICAgICB0aGlzLnRyeUVtaXQoKTtcbiAgICAgICAgICAgIH0sIG9wdGlvbnMudGltZSwgdGhpcyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICByZXR1cm4gU1RBVEVfUkVDT0dOSVpFRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gU1RBVEVfRkFJTEVEO1xuICAgIH0sXG5cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gICAgfSxcblxuICAgIGVtaXQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICE9PSBTVEFURV9SRUNPR05JWkVEKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5wdXQgJiYgKGlucHV0LmV2ZW50VHlwZSAmIElOUFVUX0VORCkpIHtcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCArICd1cCcsIGlucHV0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2lucHV0LnRpbWVTdGFtcCA9IG5vdygpO1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50LCB0aGlzLl9pbnB1dCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuLyoqXG4gKiBSb3RhdGVcbiAqIFJlY29nbml6ZWQgd2hlbiB0d28gb3IgbW9yZSBwb2ludGVyIGFyZSBtb3ZpbmcgaW4gYSBjaXJjdWxhciBtb3Rpb24uXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIEF0dHJSZWNvZ25pemVyXG4gKi9cbmZ1bmN0aW9uIFJvdGF0ZVJlY29nbml6ZXIoKSB7XG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChSb3RhdGVSZWNvZ25pemVyLCBBdHRyUmVjb2duaXplciwge1xuICAgIC8qKlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKiBAbWVtYmVyb2YgUm90YXRlUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAncm90YXRlJyxcbiAgICAgICAgdGhyZXNob2xkOiAwLFxuICAgICAgICBwb2ludGVyczogMlxuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBbVE9VQ0hfQUNUSU9OX05PTkVdO1xuICAgIH0sXG5cbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXG4gICAgICAgICAgICAoTWF0aC5hYnMoaW5wdXQucm90YXRpb24pID4gdGhpcy5vcHRpb25zLnRocmVzaG9sZCB8fCB0aGlzLnN0YXRlICYgU1RBVEVfQkVHQU4pO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIFN3aXBlXG4gKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgbW92aW5nIGZhc3QgKHZlbG9jaXR5KSwgd2l0aCBlbm91Z2ggZGlzdGFuY2UgaW4gdGhlIGFsbG93ZWQgZGlyZWN0aW9uLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBTd2lwZVJlY29nbml6ZXIoKSB7XG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChTd2lwZVJlY29nbml6ZXIsIEF0dHJSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBTd2lwZVJlY29nbml6ZXJcbiAgICAgKi9cbiAgICBkZWZhdWx0czoge1xuICAgICAgICBldmVudDogJ3N3aXBlJyxcbiAgICAgICAgdGhyZXNob2xkOiAxMCxcbiAgICAgICAgdmVsb2NpdHk6IDAuMyxcbiAgICAgICAgZGlyZWN0aW9uOiBESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTCxcbiAgICAgICAgcG9pbnRlcnM6IDFcbiAgICB9LFxuXG4gICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gUGFuUmVjb2duaXplci5wcm90b3R5cGUuZ2V0VG91Y2hBY3Rpb24uY2FsbCh0aGlzKTtcbiAgICB9LFxuXG4gICAgYXR0clRlc3Q6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uO1xuICAgICAgICB2YXIgdmVsb2NpdHk7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiAmIChESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTCkpIHtcbiAgICAgICAgICAgIHZlbG9jaXR5ID0gaW5wdXQub3ZlcmFsbFZlbG9jaXR5O1xuICAgICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiAmIERJUkVDVElPTl9IT1JJWk9OVEFMKSB7XG4gICAgICAgICAgICB2ZWxvY2l0eSA9IGlucHV0Lm92ZXJhbGxWZWxvY2l0eVg7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uICYgRElSRUNUSU9OX1ZFUlRJQ0FMKSB7XG4gICAgICAgICAgICB2ZWxvY2l0eSA9IGlucHV0Lm92ZXJhbGxWZWxvY2l0eVk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3VwZXIuYXR0clRlc3QuY2FsbCh0aGlzLCBpbnB1dCkgJiZcbiAgICAgICAgICAgIGRpcmVjdGlvbiAmIGlucHV0Lm9mZnNldERpcmVjdGlvbiAmJlxuICAgICAgICAgICAgaW5wdXQuZGlzdGFuY2UgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkICYmXG4gICAgICAgICAgICBpbnB1dC5tYXhQb2ludGVycyA9PSB0aGlzLm9wdGlvbnMucG9pbnRlcnMgJiZcbiAgICAgICAgICAgIGFicyh2ZWxvY2l0eSkgPiB0aGlzLm9wdGlvbnMudmVsb2NpdHkgJiYgaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfRU5EO1xuICAgIH0sXG5cbiAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gZGlyZWN0aW9uU3RyKGlucHV0Lm9mZnNldERpcmVjdGlvbik7XG4gICAgICAgIGlmIChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCArIGRpcmVjdGlvbiwgaW5wdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50LCBpbnB1dCk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQSB0YXAgaXMgZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgZG9pbmcgYSBzbWFsbCB0YXAvY2xpY2suIE11bHRpcGxlIHRhcHMgYXJlIHJlY29nbml6ZWQgaWYgdGhleSBvY2N1clxuICogYmV0d2VlbiB0aGUgZ2l2ZW4gaW50ZXJ2YWwgYW5kIHBvc2l0aW9uLiBUaGUgZGVsYXkgb3B0aW9uIGNhbiBiZSB1c2VkIHRvIHJlY29nbml6ZSBtdWx0aS10YXBzIHdpdGhvdXQgZmlyaW5nXG4gKiBhIHNpbmdsZSB0YXAuXG4gKlxuICogVGhlIGV2ZW50RGF0YSBmcm9tIHRoZSBlbWl0dGVkIGV2ZW50IGNvbnRhaW5zIHRoZSBwcm9wZXJ0eSBgdGFwQ291bnRgLCB3aGljaCBjb250YWlucyB0aGUgYW1vdW50IG9mXG4gKiBtdWx0aS10YXBzIGJlaW5nIHJlY29nbml6ZWQuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIFJlY29nbml6ZXJcbiAqL1xuZnVuY3Rpb24gVGFwUmVjb2duaXplcigpIHtcbiAgICBSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAvLyBwcmV2aW91cyB0aW1lIGFuZCBjZW50ZXIsXG4gICAgLy8gdXNlZCBmb3IgdGFwIGNvdW50aW5nXG4gICAgdGhpcy5wVGltZSA9IGZhbHNlO1xuICAgIHRoaXMucENlbnRlciA9IGZhbHNlO1xuXG4gICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICAgIHRoaXMuX2lucHV0ID0gbnVsbDtcbiAgICB0aGlzLmNvdW50ID0gMDtcbn1cblxuaW5oZXJpdChUYXBSZWNvZ25pemVyLCBSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBQaW5jaFJlY29nbml6ZXJcbiAgICAgKi9cbiAgICBkZWZhdWx0czoge1xuICAgICAgICBldmVudDogJ3RhcCcsXG4gICAgICAgIHBvaW50ZXJzOiAxLFxuICAgICAgICB0YXBzOiAxLFxuICAgICAgICBpbnRlcnZhbDogMzAwLCAvLyBtYXggdGltZSBiZXR3ZWVuIHRoZSBtdWx0aS10YXAgdGFwc1xuICAgICAgICB0aW1lOiAyNTAsIC8vIG1heCB0aW1lIG9mIHRoZSBwb2ludGVyIHRvIGJlIGRvd24gKGxpa2UgZmluZ2VyIG9uIHRoZSBzY3JlZW4pXG4gICAgICAgIHRocmVzaG9sZDogOSwgLy8gYSBtaW5pbWFsIG1vdmVtZW50IGlzIG9rLCBidXQga2VlcCBpdCBsb3dcbiAgICAgICAgcG9zVGhyZXNob2xkOiAxMCAvLyBhIG11bHRpLXRhcCBjYW4gYmUgYSBiaXQgb2ZmIHRoZSBpbml0aWFsIHBvc2l0aW9uXG4gICAgfSxcblxuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFtUT1VDSF9BQ1RJT05fTUFOSVBVTEFUSU9OXTtcbiAgICB9LFxuXG4gICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgdmFyIHZhbGlkUG9pbnRlcnMgPSBpbnB1dC5wb2ludGVycy5sZW5ndGggPT09IG9wdGlvbnMucG9pbnRlcnM7XG4gICAgICAgIHZhciB2YWxpZE1vdmVtZW50ID0gaW5wdXQuZGlzdGFuY2UgPCBvcHRpb25zLnRocmVzaG9sZDtcbiAgICAgICAgdmFyIHZhbGlkVG91Y2hUaW1lID0gaW5wdXQuZGVsdGFUaW1lIDwgb3B0aW9ucy50aW1lO1xuXG4gICAgICAgIHRoaXMucmVzZXQoKTtcblxuICAgICAgICBpZiAoKGlucHV0LmV2ZW50VHlwZSAmIElOUFVUX1NUQVJUKSAmJiAodGhpcy5jb3VudCA9PT0gMCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZhaWxUaW1lb3V0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBvbmx5IGFsbG93IGxpdHRsZSBtb3ZlbWVudFxuICAgICAgICAvLyBhbmQgd2UndmUgcmVhY2hlZCBhbiBlbmQgZXZlbnQsIHNvIGEgdGFwIGlzIHBvc3NpYmxlXG4gICAgICAgIGlmICh2YWxpZE1vdmVtZW50ICYmIHZhbGlkVG91Y2hUaW1lICYmIHZhbGlkUG9pbnRlcnMpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC5ldmVudFR5cGUgIT0gSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbFRpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZhbGlkSW50ZXJ2YWwgPSB0aGlzLnBUaW1lID8gKGlucHV0LnRpbWVTdGFtcCAtIHRoaXMucFRpbWUgPCBvcHRpb25zLmludGVydmFsKSA6IHRydWU7XG4gICAgICAgICAgICB2YXIgdmFsaWRNdWx0aVRhcCA9ICF0aGlzLnBDZW50ZXIgfHwgZ2V0RGlzdGFuY2UodGhpcy5wQ2VudGVyLCBpbnB1dC5jZW50ZXIpIDwgb3B0aW9ucy5wb3NUaHJlc2hvbGQ7XG5cbiAgICAgICAgICAgIHRoaXMucFRpbWUgPSBpbnB1dC50aW1lU3RhbXA7XG4gICAgICAgICAgICB0aGlzLnBDZW50ZXIgPSBpbnB1dC5jZW50ZXI7XG5cbiAgICAgICAgICAgIGlmICghdmFsaWRNdWx0aVRhcCB8fCAhdmFsaWRJbnRlcnZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY291bnQgPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvdW50ICs9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XG5cbiAgICAgICAgICAgIC8vIGlmIHRhcCBjb3VudCBtYXRjaGVzIHdlIGhhdmUgcmVjb2duaXplZCBpdCxcbiAgICAgICAgICAgIC8vIGVsc2UgaXQgaGFzIGJlZ2FuIHJlY29nbml6aW5nLi4uXG4gICAgICAgICAgICB2YXIgdGFwQ291bnQgPSB0aGlzLmNvdW50ICUgb3B0aW9ucy50YXBzO1xuICAgICAgICAgICAgaWYgKHRhcENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gZmFpbGluZyByZXF1aXJlbWVudHMsIGltbWVkaWF0ZWx5IHRyaWdnZXIgdGhlIHRhcCBldmVudFxuICAgICAgICAgICAgICAgIC8vIG9yIHdhaXQgYXMgbG9uZyBhcyB0aGUgbXVsdGl0YXAgaW50ZXJ2YWwgdG8gdHJpZ2dlclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5oYXNSZXF1aXJlRmFpbHVyZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfUkVDT0dOSVpFRDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXRDb250ZXh0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX1JFQ09HTklaRUQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyeUVtaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgb3B0aW9ucy5pbnRlcnZhbCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9CRUdBTjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFNUQVRFX0ZBSUxFRDtcbiAgICB9LFxuXG4gICAgZmFpbFRpbWVvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXRDb250ZXh0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX0ZBSUxFRDtcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zLmludGVydmFsLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIFNUQVRFX0ZBSUxFRDtcbiAgICB9LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICAgIH0sXG5cbiAgICBlbWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT0gU1RBVEVfUkVDT0dOSVpFRCkge1xuICAgICAgICAgICAgdGhpcy5faW5wdXQudGFwQ291bnQgPSB0aGlzLmNvdW50O1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50LCB0aGlzLl9pbnB1dCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuLyoqXG4gKiBTaW1wbGUgd2F5IHRvIGNyZWF0ZSBhIG1hbmFnZXIgd2l0aCBhIGRlZmF1bHQgc2V0IG9mIHJlY29nbml6ZXJzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEhhbW1lcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5yZWNvZ25pemVycyA9IGlmVW5kZWZpbmVkKG9wdGlvbnMucmVjb2duaXplcnMsIEhhbW1lci5kZWZhdWx0cy5wcmVzZXQpO1xuICAgIHJldHVybiBuZXcgTWFuYWdlcihlbGVtZW50LCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuSGFtbWVyLlZFUlNJT04gPSAnMi4wLjcnO1xuXG4vKipcbiAqIGRlZmF1bHQgc2V0dGluZ3NcbiAqIEBuYW1lc3BhY2VcbiAqL1xuSGFtbWVyLmRlZmF1bHRzID0ge1xuICAgIC8qKlxuICAgICAqIHNldCBpZiBET00gZXZlbnRzIGFyZSBiZWluZyB0cmlnZ2VyZWQuXG4gICAgICogQnV0IHRoaXMgaXMgc2xvd2VyIGFuZCB1bnVzZWQgYnkgc2ltcGxlIGltcGxlbWVudGF0aW9ucywgc28gZGlzYWJsZWQgYnkgZGVmYXVsdC5cbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIGRvbUV2ZW50czogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgdmFsdWUgZm9yIHRoZSB0b3VjaEFjdGlvbiBwcm9wZXJ0eS9mYWxsYmFjay5cbiAgICAgKiBXaGVuIHNldCB0byBgY29tcHV0ZWAgaXQgd2lsbCBtYWdpY2FsbHkgc2V0IHRoZSBjb3JyZWN0IHZhbHVlIGJhc2VkIG9uIHRoZSBhZGRlZCByZWNvZ25pemVycy5cbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IGNvbXB1dGVcbiAgICAgKi9cbiAgICB0b3VjaEFjdGlvbjogVE9VQ0hfQUNUSU9OX0NPTVBVVEUsXG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgZW5hYmxlOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogRVhQRVJJTUVOVEFMIEZFQVRVUkUgLS0gY2FuIGJlIHJlbW92ZWQvY2hhbmdlZFxuICAgICAqIENoYW5nZSB0aGUgcGFyZW50IGlucHV0IHRhcmdldCBlbGVtZW50LlxuICAgICAqIElmIE51bGwsIHRoZW4gaXQgaXMgYmVpbmcgc2V0IHRoZSB0byBtYWluIGVsZW1lbnQuXG4gICAgICogQHR5cGUge051bGx8RXZlbnRUYXJnZXR9XG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuICAgIGlucHV0VGFyZ2V0OiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogZm9yY2UgYW4gaW5wdXQgY2xhc3NcbiAgICAgKiBAdHlwZSB7TnVsbHxGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgaW5wdXRDbGFzczogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgcmVjb2duaXplciBzZXR1cCB3aGVuIGNhbGxpbmcgYEhhbW1lcigpYFxuICAgICAqIFdoZW4gY3JlYXRpbmcgYSBuZXcgTWFuYWdlciB0aGVzZSB3aWxsIGJlIHNraXBwZWQuXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqL1xuICAgIHByZXNldDogW1xuICAgICAgICAvLyBSZWNvZ25pemVyQ2xhc3MsIG9wdGlvbnMsIFtyZWNvZ25pemVXaXRoLCAuLi5dLCBbcmVxdWlyZUZhaWx1cmUsIC4uLl1cbiAgICAgICAgW1JvdGF0ZVJlY29nbml6ZXIsIHtlbmFibGU6IGZhbHNlfV0sXG4gICAgICAgIFtQaW5jaFJlY29nbml6ZXIsIHtlbmFibGU6IGZhbHNlfSwgWydyb3RhdGUnXV0sXG4gICAgICAgIFtTd2lwZVJlY29nbml6ZXIsIHtkaXJlY3Rpb246IERJUkVDVElPTl9IT1JJWk9OVEFMfV0sXG4gICAgICAgIFtQYW5SZWNvZ25pemVyLCB7ZGlyZWN0aW9uOiBESVJFQ1RJT05fSE9SSVpPTlRBTH0sIFsnc3dpcGUnXV0sXG4gICAgICAgIFtUYXBSZWNvZ25pemVyXSxcbiAgICAgICAgW1RhcFJlY29nbml6ZXIsIHtldmVudDogJ2RvdWJsZXRhcCcsIHRhcHM6IDJ9LCBbJ3RhcCddXSxcbiAgICAgICAgW1ByZXNzUmVjb2duaXplcl1cbiAgICBdLFxuXG4gICAgLyoqXG4gICAgICogU29tZSBDU1MgcHJvcGVydGllcyBjYW4gYmUgdXNlZCB0byBpbXByb3ZlIHRoZSB3b3JraW5nIG9mIEhhbW1lci5cbiAgICAgKiBBZGQgdGhlbSB0byB0aGlzIG1ldGhvZCBhbmQgdGhleSB3aWxsIGJlIHNldCB3aGVuIGNyZWF0aW5nIGEgbmV3IE1hbmFnZXIuXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqL1xuICAgIGNzc1Byb3BzOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlcyB0ZXh0IHNlbGVjdGlvbiB0byBpbXByb3ZlIHRoZSBkcmFnZ2luZyBnZXN0dXJlLiBNYWlubHkgZm9yIGRlc2t0b3AgYnJvd3NlcnMuXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xuICAgICAgICAgKi9cbiAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlIHRoZSBXaW5kb3dzIFBob25lIGdyaXBwZXJzIHdoZW4gcHJlc3NpbmcgYW4gZWxlbWVudC5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXG4gICAgICAgICAqL1xuICAgICAgICB0b3VjaFNlbGVjdDogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlcyB0aGUgZGVmYXVsdCBjYWxsb3V0IHNob3duIHdoZW4geW91IHRvdWNoIGFuZCBob2xkIGEgdG91Y2ggdGFyZ2V0LlxuICAgICAgICAgKiBPbiBpT1MsIHdoZW4geW91IHRvdWNoIGFuZCBob2xkIGEgdG91Y2ggdGFyZ2V0IHN1Y2ggYXMgYSBsaW5rLCBTYWZhcmkgZGlzcGxheXNcbiAgICAgICAgICogYSBjYWxsb3V0IGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGxpbmsuIFRoaXMgcHJvcGVydHkgYWxsb3dzIHlvdSB0byBkaXNhYmxlIHRoYXQgY2FsbG91dC5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXG4gICAgICAgICAqL1xuICAgICAgICB0b3VjaENhbGxvdXQ6ICdub25lJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3BlY2lmaWVzIHdoZXRoZXIgem9vbWluZyBpcyBlbmFibGVkLiBVc2VkIGJ5IElFMTA+XG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xuICAgICAgICAgKi9cbiAgICAgICAgY29udGVudFpvb21pbmc6ICdub25lJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3BlY2lmaWVzIHRoYXQgYW4gZW50aXJlIGVsZW1lbnQgc2hvdWxkIGJlIGRyYWdnYWJsZSBpbnN0ZWFkIG9mIGl0cyBjb250ZW50cy4gTWFpbmx5IGZvciBkZXNrdG9wIGJyb3dzZXJzLlxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAgICAgKiBAZGVmYXVsdCAnbm9uZSdcbiAgICAgICAgICovXG4gICAgICAgIHVzZXJEcmFnOiAnbm9uZScsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE92ZXJyaWRlcyB0aGUgaGlnaGxpZ2h0IGNvbG9yIHNob3duIHdoZW4gdGhlIHVzZXIgdGFwcyBhIGxpbmsgb3IgYSBKYXZhU2NyaXB0XG4gICAgICAgICAqIGNsaWNrYWJsZSBlbGVtZW50IGluIGlPUy4gVGhpcyBwcm9wZXJ0eSBvYmV5cyB0aGUgYWxwaGEgdmFsdWUsIGlmIHNwZWNpZmllZC5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ3JnYmEoMCwwLDAsMCknXG4gICAgICAgICAqL1xuICAgICAgICB0YXBIaWdobGlnaHRDb2xvcjogJ3JnYmEoMCwwLDAsMCknXG4gICAgfVxufTtcblxudmFyIFNUT1AgPSAxO1xudmFyIEZPUkNFRF9TVE9QID0gMjtcblxuLyoqXG4gKiBNYW5hZ2VyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gTWFuYWdlcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gYXNzaWduKHt9LCBIYW1tZXIuZGVmYXVsdHMsIG9wdGlvbnMgfHwge30pO1xuXG4gICAgdGhpcy5vcHRpb25zLmlucHV0VGFyZ2V0ID0gdGhpcy5vcHRpb25zLmlucHV0VGFyZ2V0IHx8IGVsZW1lbnQ7XG5cbiAgICB0aGlzLmhhbmRsZXJzID0ge307XG4gICAgdGhpcy5zZXNzaW9uID0ge307XG4gICAgdGhpcy5yZWNvZ25pemVycyA9IFtdO1xuICAgIHRoaXMub2xkQ3NzUHJvcHMgPSB7fTtcblxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5pbnB1dCA9IGNyZWF0ZUlucHV0SW5zdGFuY2UodGhpcyk7XG4gICAgdGhpcy50b3VjaEFjdGlvbiA9IG5ldyBUb3VjaEFjdGlvbih0aGlzLCB0aGlzLm9wdGlvbnMudG91Y2hBY3Rpb24pO1xuXG4gICAgdG9nZ2xlQ3NzUHJvcHModGhpcywgdHJ1ZSk7XG5cbiAgICBlYWNoKHRoaXMub3B0aW9ucy5yZWNvZ25pemVycywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgcmVjb2duaXplciA9IHRoaXMuYWRkKG5ldyAoaXRlbVswXSkoaXRlbVsxXSkpO1xuICAgICAgICBpdGVtWzJdICYmIHJlY29nbml6ZXIucmVjb2duaXplV2l0aChpdGVtWzJdKTtcbiAgICAgICAgaXRlbVszXSAmJiByZWNvZ25pemVyLnJlcXVpcmVGYWlsdXJlKGl0ZW1bM10pO1xuICAgIH0sIHRoaXMpO1xufVxuXG5NYW5hZ2VyLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZXQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybnMge01hbmFnZXJ9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIE9wdGlvbnMgdGhhdCBuZWVkIGEgbGl0dGxlIG1vcmUgc2V0dXBcbiAgICAgICAgaWYgKG9wdGlvbnMudG91Y2hBY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMudG91Y2hBY3Rpb24udXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuaW5wdXRUYXJnZXQpIHtcbiAgICAgICAgICAgIC8vIENsZWFuIHVwIGV4aXN0aW5nIGV2ZW50IGxpc3RlbmVycyBhbmQgcmVpbml0aWFsaXplXG4gICAgICAgICAgICB0aGlzLmlucHV0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudGFyZ2V0ID0gb3B0aW9ucy5pbnB1dFRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuaW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzdG9wIHJlY29nbml6aW5nIGZvciB0aGlzIHNlc3Npb24uXG4gICAgICogVGhpcyBzZXNzaW9uIHdpbGwgYmUgZGlzY2FyZGVkLCB3aGVuIGEgbmV3IFtpbnB1dF1zdGFydCBldmVudCBpcyBmaXJlZC5cbiAgICAgKiBXaGVuIGZvcmNlZCwgdGhlIHJlY29nbml6ZXIgY3ljbGUgaXMgc3RvcHBlZCBpbW1lZGlhdGVseS5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZV1cbiAgICAgKi9cbiAgICBzdG9wOiBmdW5jdGlvbihmb3JjZSkge1xuICAgICAgICB0aGlzLnNlc3Npb24uc3RvcHBlZCA9IGZvcmNlID8gRk9SQ0VEX1NUT1AgOiBTVE9QO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBydW4gdGhlIHJlY29nbml6ZXJzIVxuICAgICAqIGNhbGxlZCBieSB0aGUgaW5wdXRIYW5kbGVyIGZ1bmN0aW9uIG9uIGV2ZXJ5IG1vdmVtZW50IG9mIHRoZSBwb2ludGVycyAodG91Y2hlcylcbiAgICAgKiBpdCB3YWxrcyB0aHJvdWdoIGFsbCB0aGUgcmVjb2duaXplcnMgYW5kIHRyaWVzIHRvIGRldGVjdCB0aGUgZ2VzdHVyZSB0aGF0IGlzIGJlaW5nIG1hZGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXG4gICAgICovXG4gICAgcmVjb2duaXplOiBmdW5jdGlvbihpbnB1dERhdGEpIHtcbiAgICAgICAgdmFyIHNlc3Npb24gPSB0aGlzLnNlc3Npb247XG4gICAgICAgIGlmIChzZXNzaW9uLnN0b3BwZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJ1biB0aGUgdG91Y2gtYWN0aW9uIHBvbHlmaWxsXG4gICAgICAgIHRoaXMudG91Y2hBY3Rpb24ucHJldmVudERlZmF1bHRzKGlucHV0RGF0YSk7XG5cbiAgICAgICAgdmFyIHJlY29nbml6ZXI7XG4gICAgICAgIHZhciByZWNvZ25pemVycyA9IHRoaXMucmVjb2duaXplcnM7XG5cbiAgICAgICAgLy8gdGhpcyBob2xkcyB0aGUgcmVjb2duaXplciB0aGF0IGlzIGJlaW5nIHJlY29nbml6ZWQuXG4gICAgICAgIC8vIHNvIHRoZSByZWNvZ25pemVyJ3Mgc3RhdGUgbmVlZHMgdG8gYmUgQkVHQU4sIENIQU5HRUQsIEVOREVEIG9yIFJFQ09HTklaRURcbiAgICAgICAgLy8gaWYgbm8gcmVjb2duaXplciBpcyBkZXRlY3RpbmcgYSB0aGluZywgaXQgaXMgc2V0IHRvIGBudWxsYFxuICAgICAgICB2YXIgY3VyUmVjb2duaXplciA9IHNlc3Npb24uY3VyUmVjb2duaXplcjtcblxuICAgICAgICAvLyByZXNldCB3aGVuIHRoZSBsYXN0IHJlY29nbml6ZXIgaXMgcmVjb2duaXplZFxuICAgICAgICAvLyBvciB3aGVuIHdlJ3JlIGluIGEgbmV3IHNlc3Npb25cbiAgICAgICAgaWYgKCFjdXJSZWNvZ25pemVyIHx8IChjdXJSZWNvZ25pemVyICYmIGN1clJlY29nbml6ZXIuc3RhdGUgJiBTVEFURV9SRUNPR05JWkVEKSkge1xuICAgICAgICAgICAgY3VyUmVjb2duaXplciA9IHNlc3Npb24uY3VyUmVjb2duaXplciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgcmVjb2duaXplcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZWNvZ25pemVyID0gcmVjb2duaXplcnNbaV07XG5cbiAgICAgICAgICAgIC8vIGZpbmQgb3V0IGlmIHdlIGFyZSBhbGxvd2VkIHRyeSB0byByZWNvZ25pemUgdGhlIGlucHV0IGZvciB0aGlzIG9uZS5cbiAgICAgICAgICAgIC8vIDEuICAgYWxsb3cgaWYgdGhlIHNlc3Npb24gaXMgTk9UIGZvcmNlZCBzdG9wcGVkIChzZWUgdGhlIC5zdG9wKCkgbWV0aG9kKVxuICAgICAgICAgICAgLy8gMi4gICBhbGxvdyBpZiB3ZSBzdGlsbCBoYXZlbid0IHJlY29nbml6ZWQgYSBnZXN0dXJlIGluIHRoaXMgc2Vzc2lvbiwgb3IgdGhlIHRoaXMgcmVjb2duaXplciBpcyB0aGUgb25lXG4gICAgICAgICAgICAvLyAgICAgIHRoYXQgaXMgYmVpbmcgcmVjb2duaXplZC5cbiAgICAgICAgICAgIC8vIDMuICAgYWxsb3cgaWYgdGhlIHJlY29nbml6ZXIgaXMgYWxsb3dlZCB0byBydW4gc2ltdWx0YW5lb3VzIHdpdGggdGhlIGN1cnJlbnQgcmVjb2duaXplZCByZWNvZ25pemVyLlxuICAgICAgICAgICAgLy8gICAgICB0aGlzIGNhbiBiZSBzZXR1cCB3aXRoIHRoZSBgcmVjb2duaXplV2l0aCgpYCBtZXRob2Qgb24gdGhlIHJlY29nbml6ZXIuXG4gICAgICAgICAgICBpZiAoc2Vzc2lvbi5zdG9wcGVkICE9PSBGT1JDRURfU1RPUCAmJiAoIC8vIDFcbiAgICAgICAgICAgICAgICAgICAgIWN1clJlY29nbml6ZXIgfHwgcmVjb2duaXplciA9PSBjdXJSZWNvZ25pemVyIHx8IC8vIDJcbiAgICAgICAgICAgICAgICAgICAgcmVjb2duaXplci5jYW5SZWNvZ25pemVXaXRoKGN1clJlY29nbml6ZXIpKSkgeyAvLyAzXG4gICAgICAgICAgICAgICAgcmVjb2duaXplci5yZWNvZ25pemUoaW5wdXREYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVjb2duaXplci5yZXNldCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiB0aGUgcmVjb2duaXplciBoYXMgYmVlbiByZWNvZ25pemluZyB0aGUgaW5wdXQgYXMgYSB2YWxpZCBnZXN0dXJlLCB3ZSB3YW50IHRvIHN0b3JlIHRoaXMgb25lIGFzIHRoZVxuICAgICAgICAgICAgLy8gY3VycmVudCBhY3RpdmUgcmVjb2duaXplci4gYnV0IG9ubHkgaWYgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIGFuIGFjdGl2ZSByZWNvZ25pemVyXG4gICAgICAgICAgICBpZiAoIWN1clJlY29nbml6ZXIgJiYgcmVjb2duaXplci5zdGF0ZSAmIChTVEFURV9CRUdBTiB8IFNUQVRFX0NIQU5HRUQgfCBTVEFURV9FTkRFRCkpIHtcbiAgICAgICAgICAgICAgICBjdXJSZWNvZ25pemVyID0gc2Vzc2lvbi5jdXJSZWNvZ25pemVyID0gcmVjb2duaXplcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgYSByZWNvZ25pemVyIGJ5IGl0cyBldmVudCBuYW1lLlxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcnxTdHJpbmd9IHJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcnxOdWxsfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24ocmVjb2duaXplcikge1xuICAgICAgICBpZiAocmVjb2duaXplciBpbnN0YW5jZW9mIFJlY29nbml6ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWNvZ25pemVyO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlY29nbml6ZXJzID0gdGhpcy5yZWNvZ25pemVycztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWNvZ25pemVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHJlY29nbml6ZXJzW2ldLm9wdGlvbnMuZXZlbnQgPT0gcmVjb2duaXplcikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWNvZ25pemVyc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYWRkIGEgcmVjb2duaXplciB0byB0aGUgbWFuYWdlclxuICAgICAqIGV4aXN0aW5nIHJlY29nbml6ZXJzIHdpdGggdGhlIHNhbWUgZXZlbnQgbmFtZSB3aWxsIGJlIHJlbW92ZWRcbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IHJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcnxNYW5hZ2VyfVxuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24ocmVjb2duaXplcikge1xuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcocmVjb2duaXplciwgJ2FkZCcsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbW92ZSBleGlzdGluZ1xuICAgICAgICB2YXIgZXhpc3RpbmcgPSB0aGlzLmdldChyZWNvZ25pemVyLm9wdGlvbnMuZXZlbnQpO1xuICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKGV4aXN0aW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVjb2duaXplcnMucHVzaChyZWNvZ25pemVyKTtcbiAgICAgICAgcmVjb2duaXplci5tYW5hZ2VyID0gdGhpcztcblxuICAgICAgICB0aGlzLnRvdWNoQWN0aW9uLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gcmVjb2duaXplcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVtb3ZlIGEgcmVjb2duaXplciBieSBuYW1lIG9yIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfFN0cmluZ30gcmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtNYW5hZ2VyfVxuICAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24ocmVjb2duaXplcikge1xuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcocmVjb2duaXplciwgJ3JlbW92ZScsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlY29nbml6ZXIgPSB0aGlzLmdldChyZWNvZ25pemVyKTtcblxuICAgICAgICAvLyBsZXQncyBtYWtlIHN1cmUgdGhpcyByZWNvZ25pemVyIGV4aXN0c1xuICAgICAgICBpZiAocmVjb2duaXplcikge1xuICAgICAgICAgICAgdmFyIHJlY29nbml6ZXJzID0gdGhpcy5yZWNvZ25pemVycztcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGluQXJyYXkocmVjb2duaXplcnMsIHJlY29nbml6ZXIpO1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVjb2duaXplcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRvdWNoQWN0aW9uLnVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGJpbmQgZXZlbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRzXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICBvbjogZnVuY3Rpb24oZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnM7XG4gICAgICAgIGVhY2goc3BsaXRTdHIoZXZlbnRzKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XSA9IGhhbmRsZXJzW2V2ZW50XSB8fCBbXTtcbiAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHVuYmluZCBldmVudCwgbGVhdmUgZW1pdCBibGFuayB0byByZW1vdmUgYWxsIGhhbmRsZXJzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50c1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtoYW5kbGVyXVxuICAgICAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50cywgaGFuZGxlcikge1xuICAgICAgICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnM7XG4gICAgICAgIGVhY2goc3BsaXRTdHIoZXZlbnRzKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBoYW5kbGVyc1tldmVudF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XSAmJiBoYW5kbGVyc1tldmVudF0uc3BsaWNlKGluQXJyYXkoaGFuZGxlcnNbZXZlbnRdLCBoYW5kbGVyKSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZW1pdCBldmVudCB0byB0aGUgbGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAgICAgKi9cbiAgICBlbWl0OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAvLyB3ZSBhbHNvIHdhbnQgdG8gdHJpZ2dlciBkb20gZXZlbnRzXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZG9tRXZlbnRzKSB7XG4gICAgICAgICAgICB0cmlnZ2VyRG9tRXZlbnQoZXZlbnQsIGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbm8gaGFuZGxlcnMsIHNvIHNraXAgaXQgYWxsXG4gICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnNbZXZlbnRdICYmIHRoaXMuaGFuZGxlcnNbZXZlbnRdLnNsaWNlKCk7XG4gICAgICAgIGlmICghaGFuZGxlcnMgfHwgIWhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS50eXBlID0gZXZlbnQ7XG4gICAgICAgIGRhdGEucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRhdGEuc3JjRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBoYW5kbGVyc1tpXShkYXRhKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBkZXN0cm95IHRoZSBtYW5hZ2VyIGFuZCB1bmJpbmRzIGFsbCBldmVudHNcbiAgICAgKiBpdCBkb2Vzbid0IHVuYmluZCBkb20gZXZlbnRzLCB0aGF0IGlzIHRoZSB1c2VyIG93biByZXNwb25zaWJpbGl0eVxuICAgICAqL1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgJiYgdG9nZ2xlQ3NzUHJvcHModGhpcywgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSB7fTtcbiAgICAgICAgdGhpcy5zZXNzaW9uID0ge307XG4gICAgICAgIHRoaXMuaW5wdXQuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgIH1cbn07XG5cbi8qKlxuICogYWRkL3JlbW92ZSB0aGUgY3NzIHByb3BlcnRpZXMgYXMgZGVmaW5lZCBpbiBtYW5hZ2VyLm9wdGlvbnMuY3NzUHJvcHNcbiAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlclxuICogQHBhcmFtIHtCb29sZWFufSBhZGRcbiAqL1xuZnVuY3Rpb24gdG9nZ2xlQ3NzUHJvcHMobWFuYWdlciwgYWRkKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBtYW5hZ2VyLmVsZW1lbnQ7XG4gICAgaWYgKCFlbGVtZW50LnN0eWxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHByb3A7XG4gICAgZWFjaChtYW5hZ2VyLm9wdGlvbnMuY3NzUHJvcHMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHByb3AgPSBwcmVmaXhlZChlbGVtZW50LnN0eWxlLCBuYW1lKTtcbiAgICAgICAgaWYgKGFkZCkge1xuICAgICAgICAgICAgbWFuYWdlci5vbGRDc3NQcm9wc1twcm9wXSA9IGVsZW1lbnQuc3R5bGVbcHJvcF07XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3Byb3BdID0gbWFuYWdlci5vbGRDc3NQcm9wc1twcm9wXSB8fCAnJztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghYWRkKSB7XG4gICAgICAgIG1hbmFnZXIub2xkQ3NzUHJvcHMgPSB7fTtcbiAgICB9XG59XG5cbi8qKlxuICogdHJpZ2dlciBkb20gZXZlbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAqL1xuZnVuY3Rpb24gdHJpZ2dlckRvbUV2ZW50KGV2ZW50LCBkYXRhKSB7XG4gICAgdmFyIGdlc3R1cmVFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgIGdlc3R1cmVFdmVudC5pbml0RXZlbnQoZXZlbnQsIHRydWUsIHRydWUpO1xuICAgIGdlc3R1cmVFdmVudC5nZXN0dXJlID0gZGF0YTtcbiAgICBkYXRhLnRhcmdldC5kaXNwYXRjaEV2ZW50KGdlc3R1cmVFdmVudCk7XG59XG5cbmFzc2lnbihIYW1tZXIsIHtcbiAgICBJTlBVVF9TVEFSVDogSU5QVVRfU1RBUlQsXG4gICAgSU5QVVRfTU9WRTogSU5QVVRfTU9WRSxcbiAgICBJTlBVVF9FTkQ6IElOUFVUX0VORCxcbiAgICBJTlBVVF9DQU5DRUw6IElOUFVUX0NBTkNFTCxcblxuICAgIFNUQVRFX1BPU1NJQkxFOiBTVEFURV9QT1NTSUJMRSxcbiAgICBTVEFURV9CRUdBTjogU1RBVEVfQkVHQU4sXG4gICAgU1RBVEVfQ0hBTkdFRDogU1RBVEVfQ0hBTkdFRCxcbiAgICBTVEFURV9FTkRFRDogU1RBVEVfRU5ERUQsXG4gICAgU1RBVEVfUkVDT0dOSVpFRDogU1RBVEVfUkVDT0dOSVpFRCxcbiAgICBTVEFURV9DQU5DRUxMRUQ6IFNUQVRFX0NBTkNFTExFRCxcbiAgICBTVEFURV9GQUlMRUQ6IFNUQVRFX0ZBSUxFRCxcblxuICAgIERJUkVDVElPTl9OT05FOiBESVJFQ1RJT05fTk9ORSxcbiAgICBESVJFQ1RJT05fTEVGVDogRElSRUNUSU9OX0xFRlQsXG4gICAgRElSRUNUSU9OX1JJR0hUOiBESVJFQ1RJT05fUklHSFQsXG4gICAgRElSRUNUSU9OX1VQOiBESVJFQ1RJT05fVVAsXG4gICAgRElSRUNUSU9OX0RPV046IERJUkVDVElPTl9ET1dOLFxuICAgIERJUkVDVElPTl9IT1JJWk9OVEFMOiBESVJFQ1RJT05fSE9SSVpPTlRBTCxcbiAgICBESVJFQ1RJT05fVkVSVElDQUw6IERJUkVDVElPTl9WRVJUSUNBTCxcbiAgICBESVJFQ1RJT05fQUxMOiBESVJFQ1RJT05fQUxMLFxuXG4gICAgTWFuYWdlcjogTWFuYWdlcixcbiAgICBJbnB1dDogSW5wdXQsXG4gICAgVG91Y2hBY3Rpb246IFRvdWNoQWN0aW9uLFxuXG4gICAgVG91Y2hJbnB1dDogVG91Y2hJbnB1dCxcbiAgICBNb3VzZUlucHV0OiBNb3VzZUlucHV0LFxuICAgIFBvaW50ZXJFdmVudElucHV0OiBQb2ludGVyRXZlbnRJbnB1dCxcbiAgICBUb3VjaE1vdXNlSW5wdXQ6IFRvdWNoTW91c2VJbnB1dCxcbiAgICBTaW5nbGVUb3VjaElucHV0OiBTaW5nbGVUb3VjaElucHV0LFxuXG4gICAgUmVjb2duaXplcjogUmVjb2duaXplcixcbiAgICBBdHRyUmVjb2duaXplcjogQXR0clJlY29nbml6ZXIsXG4gICAgVGFwOiBUYXBSZWNvZ25pemVyLFxuICAgIFBhbjogUGFuUmVjb2duaXplcixcbiAgICBTd2lwZTogU3dpcGVSZWNvZ25pemVyLFxuICAgIFBpbmNoOiBQaW5jaFJlY29nbml6ZXIsXG4gICAgUm90YXRlOiBSb3RhdGVSZWNvZ25pemVyLFxuICAgIFByZXNzOiBQcmVzc1JlY29nbml6ZXIsXG5cbiAgICBvbjogYWRkRXZlbnRMaXN0ZW5lcnMsXG4gICAgb2ZmOiByZW1vdmVFdmVudExpc3RlbmVycyxcbiAgICBlYWNoOiBlYWNoLFxuICAgIG1lcmdlOiBtZXJnZSxcbiAgICBleHRlbmQ6IGV4dGVuZCxcbiAgICBhc3NpZ246IGFzc2lnbixcbiAgICBpbmhlcml0OiBpbmhlcml0LFxuICAgIGJpbmRGbjogYmluZEZuLFxuICAgIHByZWZpeGVkOiBwcmVmaXhlZFxufSk7XG5cbi8vIHRoaXMgcHJldmVudHMgZXJyb3JzIHdoZW4gSGFtbWVyIGlzIGxvYWRlZCBpbiB0aGUgcHJlc2VuY2Ugb2YgYW4gQU1EXG4vLyAgc3R5bGUgbG9hZGVyIGJ1dCBieSBzY3JpcHQgdGFnLCBub3QgYnkgdGhlIGxvYWRlci5cbnZhciBmcmVlR2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB7fSkpOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbmZyZWVHbG9iYWwuSGFtbWVyID0gSGFtbWVyO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gSGFtbWVyO1xuICAgIH0pO1xufSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBIYW1tZXI7XG59IGVsc2Uge1xuICAgIHdpbmRvd1tleHBvcnROYW1lXSA9IEhhbW1lcjtcbn1cblxufSkod2luZG93LCBkb2N1bWVudCwgJ0hhbW1lcicpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHVnX2hhc19vd25fcHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIE1lcmdlIHR3byBhdHRyaWJ1dGUgb2JqZWN0cyBnaXZpbmcgcHJlY2VkZW5jZVxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XG4gKiByZXN1bHRpbmcgaW4gYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBwdWdfbWVyZ2U7XG5mdW5jdGlvbiBwdWdfbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IHB1Z19tZXJnZShhdHRycywgYVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBhdHRycztcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSA9PT0gJ2NsYXNzJykge1xuICAgICAgdmFyIHZhbEEgPSBhW2tleV0gfHwgW107XG4gICAgICBhW2tleV0gPSAoQXJyYXkuaXNBcnJheSh2YWxBKSA/IHZhbEEgOiBbdmFsQV0pLmNvbmNhdChiW2tleV0gfHwgW10pO1xuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgICB2YXIgdmFsQSA9IHB1Z19zdHlsZShhW2tleV0pO1xuICAgICAgdmFyIHZhbEIgPSBwdWdfc3R5bGUoYltrZXldKTtcbiAgICAgIGFba2V5XSA9IHZhbEEgKyB2YWxCO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIFByb2Nlc3MgYXJyYXksIG9iamVjdCwgb3Igc3RyaW5nIGFzIGEgc3RyaW5nIG9mIGNsYXNzZXMgZGVsaW1pdGVkIGJ5IGEgc3BhY2UuXG4gKlxuICogSWYgYHZhbGAgaXMgYW4gYXJyYXksIGFsbCBtZW1iZXJzIG9mIGl0IGFuZCBpdHMgc3ViYXJyYXlzIGFyZSBjb3VudGVkIGFzXG4gKiBjbGFzc2VzLiBJZiBgZXNjYXBpbmdgIGlzIGFuIGFycmF5LCB0aGVuIHdoZXRoZXIgb3Igbm90IHRoZSBpdGVtIGluIGB2YWxgIGlzXG4gKiBlc2NhcGVkIGRlcGVuZHMgb24gdGhlIGNvcnJlc3BvbmRpbmcgaXRlbSBpbiBgZXNjYXBpbmdgLiBJZiBgZXNjYXBpbmdgIGlzXG4gKiBub3QgYW4gYXJyYXksIG5vIGVzY2FwaW5nIGlzIGRvbmUuXG4gKlxuICogSWYgYHZhbGAgaXMgYW4gb2JqZWN0LCBhbGwgdGhlIGtleXMgd2hvc2UgdmFsdWUgaXMgdHJ1dGh5IGFyZSBjb3VudGVkIGFzXG4gKiBjbGFzc2VzLiBObyBlc2NhcGluZyBpcyBkb25lLlxuICpcbiAqIElmIGB2YWxgIGlzIGEgc3RyaW5nLCBpdCBpcyBjb3VudGVkIGFzIGEgY2xhc3MuIE5vIGVzY2FwaW5nIGlzIGRvbmUuXG4gKlxuICogQHBhcmFtIHsoQXJyYXkuPHN0cmluZz58T2JqZWN0LjxzdHJpbmcsIGJvb2xlYW4+fHN0cmluZyl9IHZhbFxuICogQHBhcmFtIHs/QXJyYXkuPHN0cmluZz59IGVzY2FwaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xhc3NlcyA9IHB1Z19jbGFzc2VzO1xuZnVuY3Rpb24gcHVnX2NsYXNzZXNfYXJyYXkodmFsLCBlc2NhcGluZykge1xuICB2YXIgY2xhc3NTdHJpbmcgPSAnJywgY2xhc3NOYW1lLCBwYWRkaW5nID0gJycsIGVzY2FwZUVuYWJsZWQgPSBBcnJheS5pc0FycmF5KGVzY2FwaW5nKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICBjbGFzc05hbWUgPSBwdWdfY2xhc3Nlcyh2YWxbaV0pO1xuICAgIGlmICghY2xhc3NOYW1lKSBjb250aW51ZTtcbiAgICBlc2NhcGVFbmFibGVkICYmIGVzY2FwaW5nW2ldICYmIChjbGFzc05hbWUgPSBwdWdfZXNjYXBlKGNsYXNzTmFtZSkpO1xuICAgIGNsYXNzU3RyaW5nID0gY2xhc3NTdHJpbmcgKyBwYWRkaW5nICsgY2xhc3NOYW1lO1xuICAgIHBhZGRpbmcgPSAnICc7XG4gIH1cbiAgcmV0dXJuIGNsYXNzU3RyaW5nO1xufVxuZnVuY3Rpb24gcHVnX2NsYXNzZXNfb2JqZWN0KHZhbCkge1xuICB2YXIgY2xhc3NTdHJpbmcgPSAnJywgcGFkZGluZyA9ICcnO1xuICBmb3IgKHZhciBrZXkgaW4gdmFsKSB7XG4gICAgaWYgKGtleSAmJiB2YWxba2V5XSAmJiBwdWdfaGFzX293bl9wcm9wZXJ0eS5jYWxsKHZhbCwga2V5KSkge1xuICAgICAgY2xhc3NTdHJpbmcgPSBjbGFzc1N0cmluZyArIHBhZGRpbmcgKyBrZXk7XG4gICAgICBwYWRkaW5nID0gJyAnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY2xhc3NTdHJpbmc7XG59XG5mdW5jdGlvbiBwdWdfY2xhc3Nlcyh2YWwsIGVzY2FwaW5nKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICByZXR1cm4gcHVnX2NsYXNzZXNfYXJyYXkodmFsLCBlc2NhcGluZyk7XG4gIH0gZWxzZSBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHB1Z19jbGFzc2VzX29iamVjdCh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWwgfHwgJyc7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IG9iamVjdCBvciBzdHJpbmcgdG8gYSBzdHJpbmcgb2YgQ1NTIHN0eWxlcyBkZWxpbWl0ZWQgYnkgYSBzZW1pY29sb24uXG4gKlxuICogQHBhcmFtIHsoT2JqZWN0LjxzdHJpbmcsIHN0cmluZz58c3RyaW5nKX0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZXhwb3J0cy5zdHlsZSA9IHB1Z19zdHlsZTtcbmZ1bmN0aW9uIHB1Z19zdHlsZSh2YWwpIHtcbiAgaWYgKCF2YWwpIHJldHVybiAnJztcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgdmFyIG91dCA9ICcnO1xuICAgIGZvciAodmFyIHN0eWxlIGluIHZhbCkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmIChwdWdfaGFzX293bl9wcm9wZXJ0eS5jYWxsKHZhbCwgc3R5bGUpKSB7XG4gICAgICAgIG91dCA9IG91dCArIHN0eWxlICsgJzonICsgdmFsW3N0eWxlXSArICc7JztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfSBlbHNlIHtcbiAgICB2YWwgKz0gJyc7XG4gICAgaWYgKHZhbFt2YWwubGVuZ3RoIC0gMV0gIT09ICc7JykgXG4gICAgICByZXR1cm4gdmFsICsgJzsnO1xuICAgIHJldHVybiB2YWw7XG4gIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHBhcmFtIHtCb29sZWFufSBlc2NhcGVkXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRlcnNlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0ciA9IHB1Z19hdHRyO1xuZnVuY3Rpb24gcHVnX2F0dHIoa2V5LCB2YWwsIGVzY2FwZWQsIHRlcnNlKSB7XG4gIGlmICh2YWwgPT09IGZhbHNlIHx8IHZhbCA9PSBudWxsIHx8ICF2YWwgJiYgKGtleSA9PT0gJ2NsYXNzJyB8fCBrZXkgPT09ICdzdHlsZScpKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIGlmICh2YWwgPT09IHRydWUpIHtcbiAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbC50b0pTT04gPT09ICdmdW5jdGlvbicpIHtcbiAgICB2YWwgPSB2YWwudG9KU09OKCk7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWwgIT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gSlNPTi5zdHJpbmdpZnkodmFsKTtcbiAgICBpZiAoIWVzY2FwZWQgJiYgdmFsLmluZGV4T2YoJ1wiJykgIT09IC0xKSB7XG4gICAgICByZXR1cm4gJyAnICsga2V5ICsgJz1cXCcnICsgdmFsLnJlcGxhY2UoLycvZywgJyYjMzk7JykgKyAnXFwnJztcbiAgICB9XG4gIH1cbiAgaWYgKGVzY2FwZWQpIHZhbCA9IHB1Z19lc2NhcGUodmFsKTtcbiAgcmV0dXJuICcgJyArIGtleSArICc9XCInICsgdmFsICsgJ1wiJztcbn07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge09iamVjdH0gdGVyc2Ugd2hldGhlciB0byB1c2UgSFRNTDUgdGVyc2UgYm9vbGVhbiBhdHRyaWJ1dGVzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuYXR0cnMgPSBwdWdfYXR0cnM7XG5mdW5jdGlvbiBwdWdfYXR0cnMob2JqLCB0ZXJzZSl7XG4gIHZhciBhdHRycyA9ICcnO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAocHVnX2hhc19vd25fcHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgIHZhciB2YWwgPSBvYmpba2V5XTtcblxuICAgICAgaWYgKCdjbGFzcycgPT09IGtleSkge1xuICAgICAgICB2YWwgPSBwdWdfY2xhc3Nlcyh2YWwpO1xuICAgICAgICBhdHRycyA9IHB1Z19hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpICsgYXR0cnM7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKCdzdHlsZScgPT09IGtleSkge1xuICAgICAgICB2YWwgPSBwdWdfc3R5bGUodmFsKTtcbiAgICAgIH1cbiAgICAgIGF0dHJzICs9IHB1Z19hdHRyKGtleSwgdmFsLCBmYWxzZSwgdGVyc2UpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdHRycztcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBzdHJpbmcgb2YgYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgcHVnX21hdGNoX2h0bWwgPSAvW1wiJjw+XS87XG5leHBvcnRzLmVzY2FwZSA9IHB1Z19lc2NhcGU7XG5mdW5jdGlvbiBwdWdfZXNjYXBlKF9odG1sKXtcbiAgdmFyIGh0bWwgPSAnJyArIF9odG1sO1xuICB2YXIgcmVnZXhSZXN1bHQgPSBwdWdfbWF0Y2hfaHRtbC5leGVjKGh0bWwpO1xuICBpZiAoIXJlZ2V4UmVzdWx0KSByZXR1cm4gX2h0bWw7XG5cbiAgdmFyIHJlc3VsdCA9ICcnO1xuICB2YXIgaSwgbGFzdEluZGV4LCBlc2NhcGU7XG4gIGZvciAoaSA9IHJlZ2V4UmVzdWx0LmluZGV4LCBsYXN0SW5kZXggPSAwOyBpIDwgaHRtbC5sZW5ndGg7IGkrKykge1xuICAgIHN3aXRjaCAoaHRtbC5jaGFyQ29kZUF0KGkpKSB7XG4gICAgICBjYXNlIDM0OiBlc2NhcGUgPSAnJnF1b3Q7JzsgYnJlYWs7XG4gICAgICBjYXNlIDM4OiBlc2NhcGUgPSAnJmFtcDsnOyBicmVhaztcbiAgICAgIGNhc2UgNjA6IGVzY2FwZSA9ICcmbHQ7JzsgYnJlYWs7XG4gICAgICBjYXNlIDYyOiBlc2NhcGUgPSAnJmd0Oyc7IGJyZWFrO1xuICAgICAgZGVmYXVsdDogY29udGludWU7XG4gICAgfVxuICAgIGlmIChsYXN0SW5kZXggIT09IGkpIHJlc3VsdCArPSBodG1sLnN1YnN0cmluZyhsYXN0SW5kZXgsIGkpO1xuICAgIGxhc3RJbmRleCA9IGkgKyAxO1xuICAgIHJlc3VsdCArPSBlc2NhcGU7XG4gIH1cbiAgaWYgKGxhc3RJbmRleCAhPT0gaSkgcmV0dXJuIHJlc3VsdCArIGh0bWwuc3Vic3RyaW5nKGxhc3RJbmRleCwgaSk7XG4gIGVsc2UgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogUmUtdGhyb3cgdGhlIGdpdmVuIGBlcnJgIGluIGNvbnRleHQgdG8gdGhlXG4gKiB0aGUgcHVnIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIG9yaWdpbmFsIHNvdXJjZVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5yZXRocm93ID0gcHVnX3JldGhyb3c7XG5mdW5jdGlvbiBwdWdfcmV0aHJvdyhlcnIsIGZpbGVuYW1lLCBsaW5lbm8sIHN0cil7XG4gIGlmICghKGVyciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgZXJyO1xuICBpZiAoKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgfHwgIWZpbGVuYW1lKSAmJiAhc3RyKSB7XG4gICAgZXJyLm1lc3NhZ2UgKz0gJyBvbiBsaW5lICcgKyBsaW5lbm87XG4gICAgdGhyb3cgZXJyO1xuICB9XG4gIHRyeSB7XG4gICAgc3RyID0gc3RyIHx8IHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcHVnX3JldGhyb3coZXJyLCBudWxsLCBsaW5lbm8pXG4gIH1cbiAgdmFyIGNvbnRleHQgPSAzXG4gICAgLCBsaW5lcyA9IHN0ci5zcGxpdCgnXFxuJylcbiAgICAsIHN0YXJ0ID0gTWF0aC5tYXgobGluZW5vIC0gY29udGV4dCwgMClcbiAgICAsIGVuZCA9IE1hdGgubWluKGxpbmVzLmxlbmd0aCwgbGluZW5vICsgY29udGV4dCk7XG5cbiAgLy8gRXJyb3IgY29udGV4dFxuICB2YXIgY29udGV4dCA9IGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcChmdW5jdGlvbihsaW5lLCBpKXtcbiAgICB2YXIgY3VyciA9IGkgKyBzdGFydCArIDE7XG4gICAgcmV0dXJuIChjdXJyID09IGxpbmVubyA/ICcgID4gJyA6ICcgICAgJylcbiAgICAgICsgY3VyclxuICAgICAgKyAnfCAnXG4gICAgICArIGxpbmU7XG4gIH0pLmpvaW4oJ1xcbicpO1xuXG4gIC8vIEFsdGVyIGV4Y2VwdGlvbiBtZXNzYWdlXG4gIGVyci5wYXRoID0gZmlsZW5hbWU7XG4gIGVyci5tZXNzYWdlID0gKGZpbGVuYW1lIHx8ICdQdWcnKSArICc6JyArIGxpbmVub1xuICAgICsgJ1xcbicgKyBjb250ZXh0ICsgJ1xcblxcbicgKyBlcnIubWVzc2FnZTtcbiAgdGhyb3cgZXJyO1xufTtcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwOC8wOS8yMDE2LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBzaG9ydGVuVGV4dCA9IHJlcXVpcmUoJy4vaGVscGVycy9zaG9ydGVuLXRleHQnKSxcclxuICAgIE1BWF9DT05URVhUX0NSRURJVF9MRU5HVEggPSA1MCxcclxuICAgIE1BWF9MSU5LU19USVRMRV9MRU5HVEggPSA1MCxcclxuICAgIE1BWF9CQUNLU1RPUllfQVVUSE9SX0xFTkdUSCA9IDUwLFxyXG4gICAgTUFYX0JBQ0tTVE9SWV9wdWJsaWNhdGlvbl9MRU5HVEggPSA1MDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgIHNob3J0ZW5EYXRhVGV4dChkYXRhKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIHNob3J0ZW5EYXRhVGV4dChkYXRhKSB7XHJcbiAgICBzaG9ydGVuQ29udGV4dFRleHQoZGF0YS5jb250ZXh0KTtcclxuICAgIHNob3J0ZW5MaW5rc1RleHQoZGF0YS5saW5rcyk7XHJcbiAgICBzaG9ydGVuQmFja3N0b3J5KGRhdGEuYmFja1N0b3J5KTtcclxuICAgIGZvcm1hdENyZWF0aXZlQ29tbW9ucyhkYXRhLmNyZWF0aXZlQ29tbW9ucyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZvcm1hdENyZWF0aXZlQ29tbW9ucyhjcmVhdGl2ZUNvbW1vbnMpIHtcclxuICAgIGlmICghY3JlYXRpdmVDb21tb25zKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdmFyIHBhcnRzID0gW107XHJcbiAgICBpZiAoY3JlYXRpdmVDb21tb25zLmNyZWRpdCkge1xyXG4gICAgICAgIHBhcnRzLnB1c2goY3JlYXRpdmVDb21tb25zLmNyZWRpdCk7XHJcbiAgICB9XHJcbiAgICBpZiAoY3JlYXRpdmVDb21tb25zLnllYXIpIHtcclxuICAgICAgICBwYXJ0cy5wdXNoKGNyZWF0aXZlQ29tbW9ucy55ZWFyKTtcclxuICAgIH1cclxuICAgIGlmIChjcmVhdGl2ZUNvbW1vbnMuY29weXJpZ2h0KSB7XHJcbiAgICAgICAgcGFydHMucHVzaChjcmVhdGl2ZUNvbW1vbnMuY29weXJpZ2h0KTtcclxuICAgIH1cclxuICAgIGNyZWF0aXZlQ29tbW9ucy5mb3JtYXR0ZWRDb3B5cmlnaHQgPSBwYXJ0cy5sZW5ndGggPyBcIsKpIFwiICsgcGFydHMuam9pbihcIiwgXCIpIDogXCJcIjtcclxufVxyXG5cclxuZnVuY3Rpb24gc2hvcnRlbkNvbnRleHRUZXh0KGNvbnRleHRMaXN0KSB7XHJcbiAgICBpZiAoIWNvbnRleHRMaXN0KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29udGV4dExpc3QuZm9yRWFjaChmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgICAgIGlmIChjb250ZXh0LmNyZWRpdCkge1xyXG4gICAgICAgICAgICBjb250ZXh0LmNyZWRpdCA9IHNob3J0ZW5UZXh0KGNvbnRleHQuY3JlZGl0LCBNQVhfQ09OVEVYVF9DUkVESVRfTEVOR1RIKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2hvcnRlbkxpbmtzVGV4dChsaW5rc0xpc3QpIHtcclxuICAgIGlmICghbGlua3NMaXN0KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbGlua3NMaXN0LmZvckVhY2goZnVuY3Rpb24gKGxpbmspIHtcclxuICAgICAgICBpZiAobGluay50aXRsZSkge1xyXG4gICAgICAgICAgICBsaW5rLnRpdGxlID0gc2hvcnRlblRleHQobGluay50aXRsZSwgTUFYX0xJTktTX1RJVExFX0xFTkdUSCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGluay50aXRsZSA9IHNob3J0ZW5UZXh0KGxpbmsudXJsLCBNQVhfTElOS1NfVElUTEVfTEVOR1RIKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2hvcnRlbkJhY2tzdG9yeShiYWNrU3RvcnkpIHtcclxuICAgIGlmICghYmFja1N0b3J5KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKGJhY2tTdG9yeS5hdXRob3IpIHtcclxuICAgICAgICBiYWNrU3RvcnkuYXV0aG9yID0gc2hvcnRlblRleHQoYmFja1N0b3J5LmF1dGhvciwgTUFYX0JBQ0tTVE9SWV9BVVRIT1JfTEVOR1RIKTtcclxuICAgIH1cclxuICAgIGlmIChiYWNrU3RvcnkucHVibGljYXRpb24pIHtcclxuICAgICAgICBiYWNrU3RvcnkucHVibGljYXRpb24gPSBzaG9ydGVuVGV4dChiYWNrU3RvcnkucHVibGljYXRpb24sIE1BWF9CQUNLU1RPUllfcHVibGljYXRpb25fTEVOR1RIKTtcclxuICAgIH1cclxufSIsbnVsbCwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZSA9IHJlcXVpcmUoXCIuL2hlbHBlcnMvZ2V0LWFsbC1lbGVtZW50cy13aXRoLWF0dHJpYnV0ZVwiKSxcclxuICAgIC8vIE1pZ2h0IGJlIHVzZWQgaW4gZnV0dXJlIGZvciBwYXJzaW5nIFhNUFxyXG4gICAgeG1sVG9Kc29uID0gcmVxdWlyZShcIi4vaGVscGVycy94bWwtdG8tanNvblwiKSxcclxuICAgIGJhc2VBdHRyID0gXCJkYXRhLTRjXCI7XHJcblxyXG52YXIgTUVUQV9UQUcgPSBiYXNlQXR0ciArIFwiLW1ldGFcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9uU3VjY2Vzcywgb25GYWlsdXJlKSB7XHJcbiAgICB0cnlHZXRNZXRhKHRoaXMsIG9uU3VjY2Vzcywgb25GYWlsdXJlKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIHRyeUdldE1ldGEoaW1nLCBvblN1Y2Nlc3MsIG9uRmFpbHVyZSkge1xyXG4gICAgdmFyIHEgPSBbdHJ5R2V0RnJvbVNjcmlwdCwgdHJ5TG9hZEZpbGVCeUF0dHJpYnV0ZSwgdHJ5TG9hZEpzb25CeVNyYywgdHJ5TG9hZFlhbWxCeVNyY10sXHJcbiAgICAgICAgZXhlYyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGZuID0gcS5zaGlmdCgpO1xyXG4gICAgICAgICAgICBpZiAoIWZuKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob25GYWlsdXJlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25GYWlsdXJlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmbihpbWcsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3MoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZXhlYygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cnlHZXRGcm9tU2NyaXB0KGltZywgb25GaW5pc2gpIHtcclxuICAgIHZhciBwYXRoID0gaW1nLmdldEF0dHJpYnV0ZShiYXNlQXR0cikgfHwgaW1nLnNyYyxcclxuICAgICAgICBlbHMgPSBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUoTUVUQV9UQUcpO1xyXG4gICAgaWYgKGVscy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIG9uRmluaXNoKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZWxzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgZWwgPSBlbHNbaV0sXHJcbiAgICAgICAgICAgICAgICBkdW1teUltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiksXHJcbiAgICAgICAgICAgICAgICBhdHRyID0gZWwuZ2V0QXR0cmlidXRlKE1FVEFfVEFHKTtcclxuICAgICAgICAgICAgLy8gV2UgY3JlYXRlIGR1bW15IGltZyBhbmQgdmVyaWZ5IHRoYXQgaXQncyBzcmMgdHJhbnNmb3JtZWQgYnkgYnJvd3NlciB0byB0aGUgc2FtZSBhcyBpbiB0YXJnZXQgaW1nXHJcbiAgICAgICAgICAgIC8vIENhdXNlcyBHRVQgNDA0IGFzIHNldHMgc3JjIHRvIG5vbiBleGlzdGluZyBpbWFnZXNcclxuICAgICAgICAgICAgZHVtbXlJbWcuc3JjID0gYXR0cjtcclxuICAgICAgICAgICAgaWYgKGF0dHIgPT0gcGF0aCB8fCBkdW1teUltZy5zcmMgPT0gcGF0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBwYXJzZU1ldGEoZWwuaW5uZXJIVE1MLCBlbC50eXBlLnJlcGxhY2UoXCJ0ZXh0L1wiLCBcIlwiKSk7XHJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaChkYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBvbkZpbmlzaCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB0cnlMb2FkRmlsZUJ5QXR0cmlidXRlKGltZywgb25GaW5pc2gpIHtcclxuICAgIHZhciBwYXRoID0gaW1nLmdldEF0dHJpYnV0ZShiYXNlQXR0ciksXHJcbiAgICAgICAgZXh0TCA9IHBhdGgubWF0Y2goL1xcLih5YW1sfGpzb24pJC8pLFxyXG4gICAgICAgIGV4dCA9IGV4dEwgPyBleHRMWzFdIDogZXh0TDtcclxuICAgIGlmICghZXh0KSB7XHJcbiAgICAgICAgb25GaW5pc2goKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0cnlUb0xvYWRGaWxlKHBhdGgsIGV4dCwgb25GaW5pc2gpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cnlMb2FkWWFtbEJ5U3JjKGltZywgb25GaW5pc2gpIHtcclxuICAgIHZhciBleHQgPSBcInlhbWxcIixcclxuICAgICAgICBwYXRoID0gaW1nLnNyYy5zdWJzdHIoMCwgaW1nLnNyYy5sYXN0SW5kZXhPZihcIi5cIikpICsgXCIuXCIgKyBleHQ7XHJcbiAgICB0cnlUb0xvYWRGaWxlKHBhdGgsIGV4dCwgb25GaW5pc2gpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cnlMb2FkSnNvbkJ5U3JjKGltZywgb25GaW5pc2gpIHtcclxuICAgIHZhciBleHQgPSBcImpzb25cIixcclxuICAgICAgICBwYXRoID0gaW1nLnNyYy5zdWJzdHIoMCwgaW1nLnNyYy5sYXN0SW5kZXhPZihcIi5cIikpICsgXCIuXCIgKyBleHQ7XHJcbiAgICB0cnlUb0xvYWRGaWxlKHBhdGgsIGV4dCwgb25GaW5pc2gpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cnlUb0xvYWRGaWxlKHBhdGgsIGV4dCwgb25GaW5pc2gpIHtcclxuICAgIGxvYWRGaWxlKHBhdGgsIGZ1bmN0aW9uICh4aHIpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHBhcnNlTWV0YSh4aHIucmVzcG9uc2VUZXh0LCBleHQpO1xyXG4gICAgICAgIG9uRmluaXNoKGRhdGEpO1xyXG4gICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIG9uRmluaXNoKCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VNZXRhKHJhd1RleHQsIGZvcm1hdCkge1xyXG4gICAgaWYgKGZvcm1hdCA9PSBcImpzb25cIikge1xyXG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHJhd1RleHQpO1xyXG4gICAgfSBlbHNlIGlmIChmb3JtYXQgPT0gXCJ5YW1sXCIpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXCJGb3VyIENvcm5lcnM6XCIsXHJcbiAgICAgICAgICAgIFwiWUFNTCBmaWxlcyBhcmUgZGVwcmVjYXRlZC5cIixcclxuICAgICAgICAgICAgXCJZb3UgY2FuIGNyZWF0ZSBuZXcgbWV0YSBkYXRhIGZpbGVzIG9uXCIsXHJcbiAgICAgICAgICAgIFwiaHR0cHM6Ly9kaWdpdGFsaW50ZXJhY3Rpb24uZ2l0aHViLmlvL2ZvdXJjb3JuZXJzLWVkaXRvci9cIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBsb2FkRmlsZShwYXRoLCBzdWNjZXNzLCBlcnJvcikge1xyXG4gICAgZXJyb3IgPSBlcnJvciB8fCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfTtcclxuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XHJcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MoeGhyLCBwYXRoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVycm9yKHhociwgcGF0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgeGhyLm9wZW4oXCJHRVRcIiwgcGF0aCwgdHJ1ZSk7XHJcbiAgICB4aHIuc2VuZCgpO1xyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWwsIGNscykge1xyXG4gICAgaWYgKGVsLmNsYXNzTGlzdCkge1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoY2xzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNscztcclxuICAgIH1cclxufTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoZWwuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSk7XHJcbiAgICB9IGVsc2UgaWYgKGVsLmF0dGFjaEV2ZW50KSB7XHJcbiAgICAgICAgZWwuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxbXCJvblwiICsgZXZlbnROYW1lXSA9IGhhbmRsZXI7XHJcbiAgICB9XHJcbn07IiwiLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNzU2NzM0NC9kZXRlY3QtbGVmdC1yaWdodC1zd2lwZS1vbi10b3VjaC1kZXZpY2VzLWJ1dC1hbGxvdy11cC1kb3duLXNjcm9sbGluZ1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc3dpcGVMZWZ0TmFtZSA9ICdzd2lwZUxlZnQnLFxyXG4gICAgICAgIHN3aXBlUmlnaHROYW1lID0gJ3N3aXBlUmlnaHQnLFxyXG4gICAgICAgIHN3aXBlVXBOYW1lID0gJ3N3aXBlVXAnLFxyXG4gICAgICAgIHN3aXBlRG93bk5hbWUgPSAnc3dpcGVEb3duJztcclxuXHJcbiAgICAoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICB2YXIgY2UgPSBmdW5jdGlvbiAoZSwgbikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xyXG4gICAgICAgICAgICAgICAgYS5pbml0Q3VzdG9tRXZlbnQobiwgdHJ1ZSwgdHJ1ZSwgZS50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgZS50YXJnZXQuZGlzcGF0Y2hFdmVudChhKTtcclxuICAgICAgICAgICAgICAgIGEgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG5tID0gdHJ1ZSxcclxuICAgICAgICAgICAgc3AgPSB7eDogMCwgeTogMH0sXHJcbiAgICAgICAgICAgIGVwID0ge3g6IDAsIHk6IDB9LFxyXG4gICAgICAgICAgICB0b3VjaCA9IHtcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3AgPSB7eDogZS50b3VjaGVzWzBdLnBhZ2VYLCB5OiBlLnRvdWNoZXNbMF0ucGFnZVl9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvdWNobW92ZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBubSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGVwID0ge3g6IGUudG91Y2hlc1swXS5wYWdlWCwgeTogZS50b3VjaGVzWzBdLnBhZ2VZfTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0b3VjaGVuZDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2UoZSwgJ2ZjJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHggPSBlcC54IC0gc3AueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhyID0gTWF0aC5hYnMoeCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0gZXAueSAtIHNwLnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ciA9IE1hdGguYWJzKHkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5tYXgoeHIsIHlyKSA+IDIwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZShlLCAoeHIgPiB5ciA/ICh4IDwgMCA/IHN3aXBlTGVmdE5hbWUgOiBzd2lwZVJpZ2h0TmFtZSkgOiAoeSA8IDAgPyBzd2lwZVVwTmFtZSA6IHN3aXBlRG93bk5hbWUpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbm0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvdWNoY2FuY2VsOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5tID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAodmFyIGEgaW4gdG91Y2gpIHtcclxuICAgICAgICAgICAgZC5hZGRFdmVudExpc3RlbmVyKGEsIHRvdWNoW2FdLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0pKGRvY3VtZW50KTtcclxufTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgZ2V0RWxlbWVudFN0eWxlcyA9IHJlcXVpcmUoJy4vZ2V0LWVsZW1lbnQtc3R5bGUnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZyb21Eb20sIHRvRG9tKSB7XHJcbiAgICB2YXIgc3R5bGVzID0gZ2V0RWxlbWVudFN0eWxlcyhmcm9tRG9tKTtcclxuICAgIGZvciAodmFyIGkgaW4gc3R5bGVzKSB7XHJcbiAgICAgICAgaWYgKHN0eWxlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG4gICAgICAgICAgICB0b0RvbS5zdHlsZVtpXSA9IHN0eWxlc1tpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUoYXR0cmlidXRlLCBlbCkge1xyXG4gICAgaWYgKGVsID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGVsID0gZG9jdW1lbnQ7XHJcbiAgICB9XHJcbiAgICB2YXIgbWF0Y2hpbmdFbGVtZW50cyA9IFtdO1xyXG4gICAgdmFyIGFsbEVsZW1lbnRzID0gZWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJyonKTtcclxuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoYWxsRWxlbWVudHMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICBpZiAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBFbGVtZW50IGV4aXN0cyB3aXRoIGF0dHJpYnV0ZS4gQWRkIHRvIGFycmF5LlxyXG4gICAgICAgICAgICBtYXRjaGluZ0VsZW1lbnRzLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbWF0Y2hpbmdFbGVtZW50cztcclxufTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkb20pIHtcclxuICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKGRvbSk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBnZXRDb21wdXRlZFN0eWxlKGRvbSkge1xyXG4gICAgdmFyIHN0eWxlLCByZXR1cm5zLCBtYXJnaW5zO1xyXG4gICAgaWYgKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKSB7XHJcbiAgICAgICAgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb20sIG51bGwpO1xyXG4gICAgICAgIHJldHVybnMgPSB7fTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN0eWxlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcHJvcCA9IHN0eWxlW2ldLFxyXG4gICAgICAgICAgICAgICAgY2FtZWwgPSBjYW1lbGl6ZShwcm9wKSxcclxuICAgICAgICAgICAgICAgIHZhbCA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUocHJvcCk7XHJcbiAgICAgICAgICAgIHJldHVybnNbY2FtZWxdID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoc3R5bGUgPSBkb20uY3VycmVudFN0eWxlKSB7XHJcbiAgICAgICAgcmV0dXJucyA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gc3R5bGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuc1twcm9wXSA9IHN0eWxlW3Byb3BdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChyZXR1cm5zKSB7XHJcbiAgICAgICAgLy8gSW4gQ2hyb21lIGluc3RlYWQgb2YgJ2F1dG8nIGEgc3RhdGljIHZhbHVlIGlzIHJldHVybmVkLCBpbiBGaXJlZm94IC0gMC5cclxuICAgICAgICAvLyBUbyBzb2x2ZSB0aGF0IHdlIGdldCBtYXJnaW5zIGZyb20gc3R5bGUgc2hlZXRzIGFuZCBzdHlsZSB0YWcuXHJcbiAgICAgICAgbWFyZ2lucyA9IGdldFN0eWxlU2hlZXRNYXJnaW5zKGRvbSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSBpbiBtYXJnaW5zKSB7XHJcbiAgICAgICAgICAgIHJldHVybnNbaV0gPSBtYXJnaW5zW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXR1cm5zO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTdHlsZVNoZWV0TWFyZ2lucyhkb20pIHtcclxuICAgIC8vIEdldCBhbGwgc3R5bGVzaGVldHMgYW5kIGVsZW1lbnQnIHN0eWxlIGF0dHJpYnV0ZVxyXG4gICAgdmFyIHNoZWV0cyA9IGRvY3VtZW50LnN0eWxlU2hlZXRzLCBvID0gW10sIHN0eWxlID0gZG9tLmdldEF0dHJpYnV0ZSgnc3R5bGUnKSxcclxuICAgICAgICBtYXJnaW4gPSB7fTtcclxuICAgIC8vIEdldCBlbGVtZW50J3MgYnJvd3NlciBzcGVjaWZpYyBjc3MgcnVsZXMgbWF0Y2ggbWV0aG9kXHJcbiAgICBkb20ubWF0Y2hlcyA9IGRvbS5tYXRjaGVzIHx8IGRvbS53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHwgZG9tLm1vek1hdGNoZXNTZWxlY3RvciB8fCBkb20ubXNNYXRjaGVzU2VsZWN0b3IgfHwgZG9tLm9NYXRjaGVzU2VsZWN0b3I7XHJcbiAgICBmb3IgKHZhciBpIGluIHNoZWV0cykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIEZpcmVmb3ggdGhyb3dzIGVycm9yIHdoZW4gcmVhZGluZyBzdHlsZXNoZWV0cyBmcm9tIGV4dGVybmFsIHJlc291cmNlc1xyXG4gICAgICAgICAgICB2YXIgcnVsZXMgPSBzaGVldHNbaV0ucnVsZXMgfHwgc2hlZXRzW2ldLmNzc1J1bGVzO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIHIgaW4gcnVsZXMpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gcnVsZXNbcl0uc2VsZWN0b3JUZXh0LFxyXG4gICAgICAgICAgICAgICAgcnVsZSA9IHJ1bGVzW3JdLmNzc1RleHQ7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUbyBhdm9pZCBVbmNhdWdodCBTeW50YXhFcnJvcjogRmFpbGVkIHRvIGV4ZWN1dGUgJ21hdGNoZXMnIG9uICdFbGVtZW50JzogJ1tuZzpjbG9ha10sIFtuZy1jbG9ha10sIFtkYXRhLW5nLWNsb2FrXSwgW3gtbmctY2xvYWtdLCAubmctY2xvYWssIC54LW5nLWNsb2FrLCAubmctaGlkZTpub3QoLm5nLWhpZGUtYW5pbWF0ZSknIGlzIG5vdCBhIHZhbGlkIHNlbGVjdG9yLlxyXG4gICAgICAgICAgICAgICAgLy8gT2NjdXJzIHdoZW4gdXNpbmcgd2l0aCBhbmd1bGFyXHJcbiAgICAgICAgICAgICAgICBpZiAoIWRvbS5tYXRjaGVzKHNlbGVjdG9yKSB8fCBydWxlLm1hdGNoKFwibWFyZ2luXCIpID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHN0eWxlUnVsZXMgPSBzcGxpdENzc1J1bGUocnVsZSk7XHJcbiAgICAgICAgICAgIGFwcGx5U3R5bGVzVG9NYXJnaW4obWFyZ2luLCBzdHlsZVJ1bGVzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoc3R5bGUpIHtcclxuICAgICAgICB2YXIgc3R5bGVSdWxlcyA9IHNwbGl0U3R5bGVSdWxlKHN0eWxlKTtcclxuICAgICAgICBhcHBseVN0eWxlc1RvTWFyZ2luKG1hcmdpbiwgc3R5bGVSdWxlcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWFyZ2luO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseVN0eWxlc1RvTWFyZ2luKG1hcmdpbiwgc3R5bGVSdWxlcykge1xyXG4gICAgc3R5bGVSdWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIGlmIChlbFswXS5tYXRjaChcIm1hcmdpblwiKSkge1xyXG4gICAgICAgICAgICB2YXIgbSA9IHt9O1xyXG4gICAgICAgICAgICBpZiAoZWxbMF0gPT0gXCJtYXJnaW5cIikge1xyXG4gICAgICAgICAgICAgICAgbSA9IHNwbGl0TWFyZ2luKGVsWzFdKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1bZWxbMF1dID0gZWxbMV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBtKSB7XHJcbiAgICAgICAgICAgICAgICBtYXJnaW5ba10gPSBtW2tdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNwbGl0Q3NzUnVsZShydWxlKSB7XHJcbiAgICB2YXIgY2xlYW5lZFJ1bGUgPSBjbGVhbkNzc1J1bGUocnVsZSk7XHJcbiAgICByZXR1cm4gc3BsaXRTdHlsZVJ1bGUoY2xlYW5lZFJ1bGUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzcGxpdFN0eWxlUnVsZShydWxlKSB7XHJcbiAgICB2YXIgcnVsZXMgPSBydWxlLnNwbGl0KC87L2cpO1xyXG4gICAgcnVsZXMgPSBydWxlcy5maWx0ZXIoZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgcmV0dXJuIGVsICYmIGVsLnJlcGxhY2UoL1xccysvZywgJycpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcnVsZXMubWFwKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIHZhciBzID0gZWwuc3BsaXQoJzonKTtcclxuICAgICAgICBzWzBdID0gY2FtZWxpemUoc1swXS5yZXBsYWNlKC9cXHMrL2csICcnKSk7XHJcbiAgICAgICAgc1sxXSA9IHNbMV0ucmVwbGFjZSgvXFxzXFxzKy9nLCAnICcpLnJlcGxhY2UoLyheXFxzK3xcXHMrJCkvZywgJycpO1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFuQ3NzUnVsZShydWxlKSB7XHJcbiAgICB2YXIgY2xlYW5lZFJ1bGUgPSBydWxlLm1hdGNoKC97KC4qPyl9L2cpO1xyXG4gICAgcmV0dXJuIGNsZWFuZWRSdWxlLm1hcChmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbC5yZXBsYWNlKC8oe3x9fFxccyspL2csICcnKTtcclxuICAgIH0pWzBdO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzcGxpdE1hcmdpbihtYXJnaW5SdWxlKSB7XHJcbiAgICB2YXIgbWFyZ2lucyA9IG1hcmdpblJ1bGUuc3BsaXQoJyAnKTtcclxuICAgIGlmIChtYXJnaW5zLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgbWFyZ2lucy5jb25jYXQoW21hcmdpbnNbMF0sIG1hcmdpbnNbMF0sIG1hcmdpbnNbMF1dKTtcclxuICAgIH1cclxuICAgIGlmIChtYXJnaW5zLmxlbmd0aCA9PSAyKSB7XHJcbiAgICAgICAgbWFyZ2lucy5jb25jYXQobWFyZ2lucyk7XHJcbiAgICB9XHJcbiAgICBpZiAobWFyZ2lucy5sZW5ndGggPT0gMykge1xyXG4gICAgICAgIG1hcmdpbnMucHVzaChtYXJnaW5zWzFdKTtcclxuICAgIH1cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbWFyZ2luVG9wOiBtYXJnaW5zWzBdLFxyXG4gICAgICAgIG1hcmdpblJpZ2h0OiBtYXJnaW5zWzFdLFxyXG4gICAgICAgIG1hcmdpbkJvdHRvbTogbWFyZ2luc1syXSxcclxuICAgICAgICBtYXJnaW5MZWZ0OiBtYXJnaW5zWzNdXHJcbiAgICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYW1lbGl6ZShzdHIpIHtcclxuICAgIHJldHVybiBzdHIucmVwbGFjZSgvXFwtKFthLXpdKS9nLCBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIHJldHVybiBiLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB9KTtcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAxNy8wOS8yMDE2LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJ29udG91Y2hzdGFydCcgaW4gd2luZG93IHx8IG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cztcclxufTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbCwgY2xzKSB7XHJcbiAgICBpZiAoZWwuY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKCcoXnxcXFxcYiknICsgY2xzLnNwbGl0KCcgJykuam9pbignfCcpICsgJyhcXFxcYnwkKScsICdnaScpLCAnICcpO1xyXG4gICAgfVxyXG59OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwOS8wOC8yMDE3LlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XHJcbiAgICBpZiAoZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpO1xyXG4gICAgfSBlbHNlIGlmIChlbGVtZW50LmRldGFjaEV2ZW50KSB7XHJcbiAgICAgICAgZWxlbWVudC5kZXRhY2hFdmVudChcIm9uXCIgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50W1wib25cIiArIGV2ZW50TmFtZV0gPSBudWxsO1xyXG4gICAgfVxyXG59OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwMS8wOS8yMDE2LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0ciwgbGVuLCBjdXRGcm9tU3RhcnQpIHtcclxuICAgIGlmIChzdHIubGVuZ3RoIDwgbGVuKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH0gZWxzZSBpZiAoIWN1dEZyb21TdGFydCkge1xyXG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKDAsIGxlbikucmVwbGFjZSgvXFxzKyQvLCAnJykgKyAnLi4uJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICcuLi4nICsgc3RyLnN1YnN0cihzdHIubGVuZ3RoIC0gbGVuLCBzdHIubGVuZ3RoKS5yZXBsYWNlKC9eXFxzKy8sICcnKTtcclxuICAgIH1cclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xyXG4gICAgdmFyIHhtbERvYyA9IHBhcnNlWE1MKHN0cik7XHJcbiAgICByZXR1cm4geG1sVG9Kc29uKHhtbERvYyk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiB4bWxUb0pzb24oeG1sLCB0YWIpIHtcclxuICAgIHZhciBvYmogPSB7fTtcclxuICAgIGlmICh4bWwubm9kZVR5cGUgPT0gMSkge1xyXG4gICAgICAgIGlmICh4bWwuYXR0cmlidXRlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIG9ialtcIkBhdHRyaWJ1dGVzXCJdID0ge307XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgeG1sLmF0dHJpYnV0ZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBhdHRyaWJ1dGUgPSB4bWwuYXR0cmlidXRlcy5pdGVtKGopO1xyXG4gICAgICAgICAgICAgICAgb2JqW1wiQGF0dHJpYnV0ZXNcIl1bYXR0cmlidXRlLm5vZGVOYW1lXSA9IGF0dHJpYnV0ZS5ub2RlVmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHhtbC5ub2RlVHlwZSA9PSAzKSB7XHJcbiAgICAgICAgb2JqID0geG1sLm5vZGVWYWx1ZTtcclxuICAgIH1cclxuICAgIGlmICh4bWwuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4bWwuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgaXRlbSA9IHhtbC5jaGlsZE5vZGVzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIHZhciBub2RlTmFtZSA9IGl0ZW0ubm9kZU5hbWU7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgKG9ialtub2RlTmFtZV0pID09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIG9ialtub2RlTmFtZV0gPSB4bWxUb0pzb24oaXRlbSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChvYmpbbm9kZU5hbWVdLnB1c2gpID09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgb2xkID0gb2JqW25vZGVOYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICBvYmpbbm9kZU5hbWVdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqW25vZGVOYW1lXS5wdXNoKG9sZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBvYmpbbm9kZU5hbWVdLnB1c2goeG1sVG9Kc29uKGl0ZW0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvYmo7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlWE1MKHZhbCkge1xyXG4gICAgaWYgKGRvY3VtZW50LmltcGxlbWVudGF0aW9uICYmIGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZURvY3VtZW50KSB7XHJcbiAgICAgICAgdmFyIHhtbERvYyA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcodmFsLCAndGV4dC94bWwnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHdpbmRvdy5BY3RpdmVYT2JqZWN0KSB7XHJcbiAgICAgICAgdmFyIHhtbERvYyA9IG5ldyBBY3RpdmVYT2JqZWN0KFwiTWljcm9zb2Z0LlhNTERPTVwiKTtcclxuICAgICAgICB4bWxEb2MubG9hZFhNTCh2YWwpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geG1sRG9jO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwOC8wOS8yMDE2LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBhdGgsIGRhdGEpIHtcclxuICAgIHJldHVybiBjb250ZXh0SXNWYWxpZChwYXRoLCBkYXRhKSAmJlxyXG4gICAgICAgIGxpbmtzQXJlVmFsaWQocGF0aCwgZGF0YSkgJiZcclxuICAgICAgICBiYWNrU3RvcnlJc1ZhbGlkKHBhdGgsIGRhdGEpICYmXHJcbiAgICAgICAgY3JlYXRpdmVDb21tb25zQXJlVmFsaWQocGF0aCwgZGF0YSk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBjb250ZXh0SXNWYWxpZChwYXRoLCBkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEuY29udGV4dCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdjb250ZXh0XFwnIGlzIG5vdCBkZWZpbmVkJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoZGF0YS5jb250ZXh0ICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhLmNvbnRleHQpICE9ICdbb2JqZWN0IEFycmF5XScpIHtcclxuICAgICAgICB0aHJvdyBwYXRoICsgJzogXFwnY29udGV4dFxcJyBtdXN0IGJlIGEgbGlzdCc7XHJcbiAgICB9IGVsc2UgaWYgKGRhdGEuY29udGV4dCkge1xyXG4gICAgICAgIHZhciB0b0RlbGV0ZSA9IFtdO1xyXG4gICAgICAgIGRhdGEuY29udGV4dC5mb3JFYWNoKGZ1bmN0aW9uIChlbCwgaSkge1xyXG4gICAgICAgICAgICBpZiAoIWVsLnNyYyAmJiAhZWwueW91dHViZV9pZCAmJiAhZWwudmltZW9faWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdjb250ZXh0XFwnLCBlbGVtZW50IG51bWJlcicsIFN0cmluZyhpICsgMSksXHJcbiAgICAgICAgICAgICAgICAgICAgJyAtIG9uZSBvZiBcXCdzcmNcXCcsIFxcJ3lvdXR1YmVfaWRcXCcgb3IgXFwndmltZW9faWRcXCcgYXJlIG5vdCBkZWZpbmVkJyk7XHJcbiAgICAgICAgICAgICAgICB0b0RlbGV0ZS5wdXNoKGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRvRGVsZXRlLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBqID0gZGF0YS5jb250ZXh0LmluZGV4T2YoZWwpO1xyXG4gICAgICAgICAgICBkYXRhLmNvbnRleHQuc3BsaWNlKGosIDEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxpbmtzQXJlVmFsaWQocGF0aCwgZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhLmxpbmtzKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKHBhdGgsICc6IFxcJ2xpbmtzXFwnIGFyZSBub3QgZGVmaW5lZCcpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRhdGEubGlua3MgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEubGlua3MpICE9ICdbb2JqZWN0IEFycmF5XScpIHtcclxuICAgICAgICB0aHJvdyBwYXRoICsgJzogXFwnbGlua3NcXCcgbXVzdCBiZSBhIGxpc3QnO1xyXG4gICAgfSBlbHNlIGlmIChkYXRhLmxpbmtzKSB7XHJcbiAgICAgICAgdmFyIHRvRGVsZXRlID0gW107XHJcbiAgICAgICAgZGF0YS5saW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCwgaSkge1xyXG4gICAgICAgICAgICBpZiAoIWVsLnVybCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHBhdGgsICc6IFxcJ2xpbmtzXFwnLCBlbGVtZW50IG51bWJlcicsIFN0cmluZyhpICsgMSksXHJcbiAgICAgICAgICAgICAgICAgICAgJyAtIFxcJ3VybFxcJyBpcyBub3QgZGVmaW5lZCcpO1xyXG4gICAgICAgICAgICAgICAgdG9EZWxldGUucHVzaChlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0b0RlbGV0ZS5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgICB2YXIgaiA9IGRhdGEubGlua3MuaW5kZXhPZihlbCk7XHJcbiAgICAgICAgICAgIGRhdGEubGlua3Muc3BsaWNlKGosIDEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJhY2tTdG9yeUlzVmFsaWQocGF0aCwgZGF0YSkge1xyXG4gICAgaWYgKCFkYXRhLmJhY2tTdG9yeSkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdiYWNrU3RvcnlcXCcgaXMgbm90IGRlZmluZWQnKTtcclxuICAgIH1cclxuICAgIGlmIChkYXRhLmJhY2tTdG9yeSAmJiAhZGF0YS5iYWNrU3RvcnkudGV4dCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdiYWNrU3RvcnlcXCcgaGFzIG5vIHRleHQnKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGl2ZUNvbW1vbnNBcmVWYWxpZChwYXRoLCBkYXRhKSB7XHJcbiAgICBpZiAoIWRhdGEuY3JlYXRpdmVDb21tb25zKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKHBhdGgsICc6IFxcJ3JpZ2h0c1xcJyBhcmUgbm90IGRlZmluZWQnKTtcclxuICAgIH1cclxuICAgIGlmIChkYXRhLmNyZWF0aXZlQ29tbW9ucyAmJiAhZGF0YS5jcmVhdGl2ZUNvbW1vbnMuY3JlZGl0KSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKHBhdGgsICc6IFxcJ3JpZ2h0c1xcJyAtIGNyZWRpdCBpcyBub3QgZGVmaW5lZCcpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGJhc2VBdHRyID0gXCJkYXRhLTRjXCIsXHJcbiAgICBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUgPSByZXF1aXJlKCcuL2hlbHBlcnMvZ2V0LWFsbC1lbGVtZW50cy13aXRoLWF0dHJpYnV0ZScpLFxyXG4gICAgYWRkQ2xhc3MgPSByZXF1aXJlKCcuL2hlbHBlcnMvYWRkLWNsYXNzJyksXHJcbiAgICBnZXRJc1RvdWNoID0gcmVxdWlyZShcIi4vaGVscGVycy9pcy10b3VjaC1zY3JlZW5cIiksXHJcbiAgICByZW1vdmVDbGFzcyA9IHJlcXVpcmUoJy4vaGVscGVycy9yZW1vdmUtY2xhc3MnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRvbSkge1xyXG5cclxuICAgIHJldHVybiBuZXcgSW1hZ2VNb2RlbChkb20pO1xyXG5cclxufTtcclxuXHJcbmZ1bmN0aW9uIEltYWdlTW9kZWwoZG9tKSB7XHJcbiAgICB0aGlzLnRvdWNoZWQgPSBmYWxzZTtcclxuICAgIHRoaXMudG9wTGVmdENvcm5lciA9IEdhbGxlcnlDb3JuZXJNb2RlbEZhY3RvcnkoZG9tKTtcclxuICAgIHRoaXMudG9wUmlnaHRDb3JuZXIgPSBuZXcgQ29ybmVyTW9kZWwoKTtcclxuICAgIHRoaXMuYm90dG9tTGVmdENvcm5lciA9IG5ldyBDb3JuZXJNb2RlbCgpO1xyXG4gICAgdGhpcy5ib3R0b21SaWdodENvcm5lciA9IG5ldyBDcmVhdGl2ZUNvbW1vbnNDb3JuZXIoKTtcclxufVxyXG5cclxuSW1hZ2VNb2RlbC5wcm90b3R5cGUudG9vbHNIaWRkZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b3BMZWZ0Q29ybmVyLnZpc2libGUgfHxcclxuICAgICAgICB0aGlzLnRvcFJpZ2h0Q29ybmVyLnZpc2libGUgfHxcclxuICAgICAgICB0aGlzLmJvdHRvbUxlZnRDb3JuZXIudmlzaWJsZSB8fFxyXG4gICAgICAgIHRoaXMuYm90dG9tUmlnaHRDb3JuZXIudmlzaWJsZTtcclxufTtcclxuXHJcbkltYWdlTW9kZWwucHJvdG90eXBlLnNob3dUb29scyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMudG91Y2hlZCA9IGdldElzVG91Y2goKTtcclxufTtcclxuXHJcbkltYWdlTW9kZWwucHJvdG90eXBlLmhpZGVUb29scyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMudG91Y2hlZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gQ29ybmVyTW9kZWwoKSB7XHJcbiAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMucGlubmVkID0gZmFsc2U7XHJcbn1cclxuXHJcbkNvcm5lck1vZGVsLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmIChlKSB7XHJcbiAgICAgICAgdGhpcy5zdG9wRXZlbnRQcm9wYWdhdGlvbihlKTtcclxuICAgIH1cclxuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XHJcbn07XHJcbkNvcm5lck1vZGVsLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMucGlubmVkKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbn07XHJcbkNvcm5lck1vZGVsLnByb3RvdHlwZS5zdG9wRXZlbnRQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAvLyBSZXRyZWl2ZSBmdW5jdGlvbiBmcm9tIE1vdXNlRXZlbnQgb3IgSGFtbWVySlMgc3JjRXZlbnRcclxuICAgIGlmIChlLnN0b3BQcm9wYWdhdGlvbikge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGUuc3JjRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9XHJcbn07XHJcbkNvcm5lck1vZGVsLnByb3RvdHlwZS5mb3JjZUhpZGUgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdGhpcy5zdG9wRXZlbnRQcm9wYWdhdGlvbihlKTtcclxuICAgIHRoaXMucGluKGZhbHNlKTtcclxufTtcclxuQ29ybmVyTW9kZWwucHJvdG90eXBlLnBpbiA9IGZ1bmN0aW9uIChwaW5uZWQpIHtcclxuICAgIGlmIChwaW5uZWQgIT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMucGlubmVkID0gcGlubmVkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnBpbm5lZCA9ICF0aGlzLnBpbm5lZDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBpbm5lZCkge1xyXG4gICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgIH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIEdhbGxlcnlDb3JuZXJNb2RlbEZhY3RvcnkoZG9tKSB7XHJcbiAgICB2YXIgZ2FsbGVyeURvbSA9IGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZShiYXNlQXR0ciArICctZ2FsbGVyeS1saXN0JywgZG9tKVswXSxcclxuICAgICAgICBnYWxsZXJ5SXRlbURvbXMgPSBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUoYmFzZUF0dHIgKyAnLWdhbGxlcnktaXRlbScsIGdhbGxlcnlEb20pLFxyXG4gICAgICAgIHlvdVR1YmVJZnJhbWVzID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGJhc2VBdHRyICsgJy1nYWxsZXJ5LXl0JywgZ2FsbGVyeURvbSksXHJcbiAgICAgICAgY2FwdGlvbkRvbXMgPSBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUoYmFzZUF0dHIgKyAnLWdhbGxlcnktY2FwdGlvbicsIGRvbSk7XHJcblxyXG4gICAgZnVuY3Rpb24gR2FsbGVyeUNvcm5lck1vZGVsKCkge1xyXG4gICAgICAgIENvcm5lck1vZGVsLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gMDtcclxuICAgICAgICB0aGlzLnByZXNlbGVjdGVkSXRlbSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgZ290VG9JbmRleC5jYWxsKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIEdhbGxlcnlDb3JuZXJNb2RlbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvcm5lck1vZGVsLnByb3RvdHlwZSk7XHJcblxyXG4gICAgR2FsbGVyeUNvcm5lck1vZGVsLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIENvcm5lck1vZGVsLnByb3RvdHlwZS5oaWRlLmNhbGwodGhpcyk7XHJcbiAgICAgICAgeW91VHViZUlmcmFtZXMuZm9yRWFjaChwYXVzZVlvdVR1YmVWaWRlbyk7XHJcbiAgICB9O1xyXG4gICAgR2FsbGVyeUNvcm5lck1vZGVsLnByb3RvdHlwZS5zZWxlY3RJdGVtID0gZnVuY3Rpb24gKGV2ZW50LCBlbCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IGdhbGxlcnlJdGVtRG9tcy5pbmRleE9mKGVsKTtcclxuICAgICAgICBnb3RUb0luZGV4LmNhbGwodGhpcyk7XHJcbiAgICB9O1xyXG4gICAgR2FsbGVyeUNvcm5lck1vZGVsLnByb3RvdHlwZS5zZWxlY3ROZXh0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSW5kZXggPCBnYWxsZXJ5SXRlbURvbXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXgrKztcclxuICAgICAgICAgICAgZ290VG9JbmRleC5jYWxsKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBHYWxsZXJ5Q29ybmVyTW9kZWwucHJvdG90eXBlLnNlbGVjdFByZXZpb3VzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSW5kZXggPT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleC0tO1xyXG4gICAgICAgIGdvdFRvSW5kZXguY2FsbCh0aGlzKTtcclxuICAgIH07XHJcbiAgICBHYWxsZXJ5Q29ybmVyTW9kZWwucHJvdG90eXBlLnByZXNlbGVjdFByZXZpb3VzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMucHJlc2VsZWN0ZWRJdGVtID0gZ2FsbGVyeUl0ZW1Eb21zW3RoaXMuc2VsZWN0ZWRJbmRleCAtIDFdO1xyXG4gICAgfTtcclxuICAgIEdhbGxlcnlDb3JuZXJNb2RlbC5wcm90b3R5cGUucHJlc2VsZWN0TmV4dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnByZXNlbGVjdGVkSXRlbSA9IGdhbGxlcnlJdGVtRG9tc1t0aGlzLnNlbGVjdGVkSW5kZXggKyAxXTtcclxuICAgIH07XHJcbiAgICBHYWxsZXJ5Q29ybmVyTW9kZWwucHJvdG90eXBlLmNsZWFyUHJlc2VsZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMucHJlc2VsZWN0ZWRJdGVtID0gdW5kZWZpbmVkO1xyXG4gICAgfTtcclxuICAgIEdhbGxlcnlDb3JuZXJNb2RlbC5wcm90b3R5cGUuZ2V0UHJldkNvbnRyb2xsZXJIaWRkZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJbmRleCA8PSAwO1xyXG4gICAgfTtcclxuICAgIEdhbGxlcnlDb3JuZXJNb2RlbC5wcm90b3R5cGUuZ2V0TmV4dENvbnRyb2xsZXJIaWRkZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJbmRleCA+PSBnYWxsZXJ5SXRlbURvbXMubGVuZ3RoIC0gMTtcclxuICAgIH07XHJcbiAgICBHYWxsZXJ5Q29ybmVyTW9kZWwucHJvdG90eXBlLmdldEl0ZW1Jc1ByZXNlbGVjdGVkID0gZnVuY3Rpb24gKGRvbUVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gZG9tRWxlbWVudCA9PSB0aGlzLnByZXNlbGVjdGVkSXRlbTtcclxuICAgIH07XHJcbiAgICBHYWxsZXJ5Q29ybmVyTW9kZWwucHJvdG90eXBlLmdldENhcHRpb25WaXNpYmxlID0gZnVuY3Rpb24gKGRvbUVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gZG9tRWxlbWVudCA9PSBjYXB0aW9uRG9tc1t0aGlzLnNlbGVjdGVkSW5kZXhdO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRJbWFnZU9mZnNldHMoZWxlbWVudHMpIHtcclxuICAgICAgICB2YXIgb2Zmc2V0cyA9IFtdO1xyXG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIG9mZnNldHMucHVzaChlbC5vZmZzZXRMZWZ0KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gb2Zmc2V0cztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnb3RUb0luZGV4KCkge1xyXG4gICAgICAgIGlmICghZ2FsbGVyeURvbSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuc2VsZWN0ZWRJbmRleCxcclxuICAgICAgICAgICAgc2NhbGVDb25zdGFudCA9IDAuOCxcclxuICAgICAgICAgICAgaW1hZ2VPZmZzZXRzID0gZ2V0SW1hZ2VPZmZzZXRzKGdhbGxlcnlJdGVtRG9tcyk7XHJcbiAgICAgICAgZ2FsbGVyeUl0ZW1Eb21zLmZvckVhY2goZnVuY3Rpb24gKGRvbSwgaSkge1xyXG4gICAgICAgICAgICBpZiAoaSA9PSBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3MoZG9tLCAnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlbW92ZUNsYXNzKGRvbSwgJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBnYWxsZXJ5RG9tLnN0eWxlLm1hcmdpbkxlZnQgPSAtaW1hZ2VPZmZzZXRzW2luZGV4XSAqIHNjYWxlQ29uc3RhbnQgKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgR2FsbGVyeUNvcm5lck1vZGVsKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIENyZWF0aXZlQ29tbW9uc0Nvcm5lcigpIHtcclxuICAgIENvcm5lck1vZGVsLmNhbGwodGhpcyk7XHJcbn1cclxuXHJcbkNyZWF0aXZlQ29tbW9uc0Nvcm5lci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvcm5lck1vZGVsLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBwYXVzZVlvdVR1YmVWaWRlbyhpZnJhbWUpIHtcclxuICAgIGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKCd7XCJldmVudFwiOlwiY29tbWFuZFwiLFwiZnVuY1wiOlwicGF1c2VWaWRlb1wiLFwiYXJnc1wiOlwiXCJ9JywgJyonKTtcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwMi8wOC8yMDE3LlxyXG4gKlxyXG4gKiBTY3JpcHQgdGhhdCBpcyB1c2VkIGZvciBpbXBvcnRpbmcgdGhlIHByb2plY3QgaW4gZXh0ZXJuYWwgcHJvamVjdHNcclxuICpcclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbi8vIFRvRG86IFlvdVR1YmUgbGlua3Mgb2Z0ZW4gY2F1c2UgYSBkZWxheSB3aGVuIGhvdmVyIG9uIGFueSBvZiBjb3JuZXJzIGJlZm9yZSBvcGVuaW5nIGl0XHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnJlcXVpcmUoXCIuL3BvbHlmaWxscy9pbmRleFwiKSgpO1xyXG5yZXF1aXJlKFwiLi9oZWxwZXJzL2FkZC1zd2lwZS1ldmVudHNcIikoKTtcclxuXHJcbmV4cG9ydHMuaW5pdCA9IHJlcXVpcmUoXCIuL3dyYXAtYWxsLWltZy1lbGVtZW50cy1vbi1wYWdlXCIpO1xyXG5leHBvcnRzLndyYXBJbWdFbGVtZW50V2l0aEpzb24gPSByZXF1aXJlKFwiLi93cmFwLWltZy1lbGVtZW50LXdpdGgtanNvblwiKTtcclxuZXhwb3J0cy53cmFwSW1nRWxlbWVudCA9IHJlcXVpcmUoXCIuL3dyYXAtaW1nLWVsZW1lbnRcIik7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAxNS8wOC8yMDE2LlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGluaXQgPSByZXF1aXJlKFwiLi93cmFwLWFsbC1pbWctZWxlbWVudHMtb24tcGFnZVwiKTtcclxuXHJcbndpbmRvdy5Gb3VyQ29ybmVycyA9IHJlcXVpcmUoXCIuL2luZGV4LW5wbVwiKTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiBsb2FkKGV2ZW50KSB7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbG9hZCwgZmFsc2UpO1xyXG4gICAgaW5pdCgpO1xyXG59LCBmYWxzZSk7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDA0LzA5LzIwMTYuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIUV2ZW50LnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdCkge1xyXG4gICAgICAgIEV2ZW50LnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpZiAoIUV2ZW50LnByb3RvdHlwZS5zdG9wUHJvcGFnYXRpb24pIHtcclxuICAgICAgICBFdmVudC5wcm90b3R5cGUuc3RvcFByb3BhZ2F0aW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmICghRWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICAgIHZhciBldmVudExpc3RlbmVycyA9IFtdO1xyXG5cclxuICAgICAgICB2YXIgYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lciAvKiwgdXNlQ2FwdHVyZSAod2lsbCBiZSBpZ25vcmVkKSAqLykge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHZhciB3cmFwcGVyID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGUudGFyZ2V0ID0gZS5zcmNFbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0ID0gc2VsZjtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIuaGFuZGxlRXZlbnQgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5oYW5kbGVFdmVudChlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbChzZWxmLCBlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJET01Db250ZW50TG9hZGVkXCIpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3cmFwcGVyMiA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gXCJjb21wbGV0ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZXIoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50KFwib25yZWFkeXN0YXRlY2hhbmdlXCIsIHdyYXBwZXIyKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJzLnB1c2goe29iamVjdDogdGhpcywgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyLCB3cmFwcGVyOiB3cmFwcGVyMn0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiY29tcGxldGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlID0gbmV3IEV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5zcmNFbGVtZW50ID0gd2luZG93O1xyXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXIyKGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hFdmVudChcIm9uXCIgKyB0eXBlLCB3cmFwcGVyKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJzLnB1c2goe29iamVjdDogdGhpcywgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyLCB3cmFwcGVyOiB3cmFwcGVyfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciByZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyIC8qLCB1c2VDYXB0dXJlICh3aWxsIGJlIGlnbm9yZWQpICovKSB7XHJcbiAgICAgICAgICAgIHZhciBjb3VudGVyID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKGNvdW50ZXIgPCBldmVudExpc3RlbmVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBldmVudExpc3RlbmVyID0gZXZlbnRMaXN0ZW5lcnNbY291bnRlcl07XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRMaXN0ZW5lci5vYmplY3QgPT0gdGhpcyAmJiBldmVudExpc3RlbmVyLnR5cGUgPT0gdHlwZSAmJiBldmVudExpc3RlbmVyLmxpc3RlbmVyID09IGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJET01Db250ZW50TG9hZGVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXRhY2hFdmVudChcIm9ucmVhZHlzdGF0ZWNoYW5nZVwiLCBldmVudExpc3RlbmVyLndyYXBwZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGV0YWNoRXZlbnQoXCJvblwiICsgdHlwZSwgZXZlbnRMaXN0ZW5lci53cmFwcGVyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcnMuc3BsaWNlKGNvdW50ZXIsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKytjb3VudGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lcjtcclxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcclxuICAgICAgICBpZiAoSFRNTERvY3VtZW50KSB7XHJcbiAgICAgICAgICAgIEhUTUxEb2N1bWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGFkZEV2ZW50TGlzdGVuZXI7XHJcbiAgICAgICAgICAgIEhUTUxEb2N1bWVudC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50TGlzdGVuZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChXaW5kb3cpIHtcclxuICAgICAgICAgICAgV2luZG93LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lcjtcclxuICAgICAgICAgICAgV2luZG93LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwMy8wOS8yMDE2LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKCFBcnJheS5wcm90b3R5cGUuZmlsdGVyKSB7XHJcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uIChmdW4vKiwgdGhpc0FyZyovKSB7XHJcbiAgICAgICAgICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzID09PSB2b2lkIDAgfHwgdGhpcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcclxuICAgICAgICAgICAgdmFyIGxlbiA9IHQubGVuZ3RoID4+PiAwO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGZ1biAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzID0gW107XHJcbiAgICAgICAgICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzLmxlbmd0aCA+PSAyID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSBpbiB0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IHRbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IFRlY2huaWNhbGx5IHRoaXMgc2hvdWxkIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBhdFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgIHRoZSBuZXh0IGluZGV4LCBhcyBwdXNoIGNhbiBiZSBhZmZlY3RlZCBieVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgIHByb3BlcnRpZXMgb24gT2JqZWN0LnByb3RvdHlwZSBhbmQgQXJyYXkucHJvdG90eXBlLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgIEJ1dCB0aGF0IG1ldGhvZCdzIG5ldywgYW5kIGNvbGxpc2lvbnMgc2hvdWxkIGJlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgcmFyZSwgc28gdXNlIHRoZSBtb3JlLWNvbXBhdGlibGUgYWx0ZXJuYXRpdmUuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZ1bi5jYWxsKHRoaXNBcmcsIHZhbCwgaSwgdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnB1c2godmFsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDAzLzA5LzIwMTYuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDUsIDE1LjQuNC4xOFxyXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjQuNC4xOFxyXG4gICAgaWYgKCFBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkge1xyXG5cclxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc0FyZykge1xyXG5cclxuICAgICAgICAgICAgdmFyIFQsIGs7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignIHRoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAxLiBMZXQgTyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdG9PYmplY3QoKSBwYXNzaW5nIHRoZVxyXG4gICAgICAgICAgICAvLyB8dGhpc3wgdmFsdWUgYXMgdGhlIGFyZ3VtZW50LlxyXG4gICAgICAgICAgICB2YXIgTyA9IE9iamVjdCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIDIuIExldCBsZW5WYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCgpIGludGVybmFsXHJcbiAgICAgICAgICAgIC8vIG1ldGhvZCBvZiBPIHdpdGggdGhlIGFyZ3VtZW50IFwibGVuZ3RoXCIuXHJcbiAgICAgICAgICAgIC8vIDMuIExldCBsZW4gYmUgdG9VaW50MzIobGVuVmFsdWUpLlxyXG4gICAgICAgICAgICB2YXIgbGVuID0gTy5sZW5ndGggPj4+IDA7XHJcblxyXG4gICAgICAgICAgICAvLyA0LiBJZiBpc0NhbGxhYmxlKGNhbGxiYWNrKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxyXG4gICAgICAgICAgICAvLyBTZWU6IGh0dHA6Ly9lczUuZ2l0aHViLmNvbS8jeDkuMTFcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGNhbGxiYWNrICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyA1LiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXRcclxuICAgICAgICAgICAgLy8gVCBiZSB1bmRlZmluZWQuXHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgVCA9IHRoaXNBcmc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIDYuIExldCBrIGJlIDBcclxuICAgICAgICAgICAgayA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyA3LiBSZXBlYXQsIHdoaWxlIGsgPCBsZW5cclxuICAgICAgICAgICAgd2hpbGUgKGsgPCBsZW4pIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIga1ZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGEuIExldCBQayBiZSBUb1N0cmluZyhrKS5cclxuICAgICAgICAgICAgICAgIC8vICAgIFRoaXMgaXMgaW1wbGljaXQgZm9yIExIUyBvcGVyYW5kcyBvZiB0aGUgaW4gb3BlcmF0b3JcclxuICAgICAgICAgICAgICAgIC8vIGIuIExldCBrUHJlc2VudCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEhhc1Byb3BlcnR5XHJcbiAgICAgICAgICAgICAgICAvLyAgICBpbnRlcm5hbCBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxyXG4gICAgICAgICAgICAgICAgLy8gICAgVGhpcyBzdGVwIGNhbiBiZSBjb21iaW5lZCB3aXRoIGNcclxuICAgICAgICAgICAgICAgIC8vIGMuIElmIGtQcmVzZW50IGlzIHRydWUsIHRoZW5cclxuICAgICAgICAgICAgICAgIGlmIChrIGluIE8pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaS4gTGV0IGtWYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXHJcbiAgICAgICAgICAgICAgICAgICAga1ZhbHVlID0gT1trXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWkuIENhbGwgdGhlIENhbGwgaW50ZXJuYWwgbWV0aG9kIG9mIGNhbGxiYWNrIHdpdGggVCBhc1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSB0aGlzIHZhbHVlIGFuZCBhcmd1bWVudCBsaXN0IGNvbnRhaW5pbmcga1ZhbHVlLCBrLCBhbmQgTy5cclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKFQsIGtWYWx1ZSwgaywgTyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBkLiBJbmNyZWFzZSBrIGJ5IDEuXHJcbiAgICAgICAgICAgICAgICBrKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gOC4gcmV0dXJuIHVuZGVmaW5lZFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwMy8wOS8yMDE2LlxyXG4gKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXF1aXJlKCcuL2Zvci1lYWNoJykoKTtcclxuICAgIHJlcXVpcmUoJy4vZmlsdGVyJykoKTtcclxuICAgIHJlcXVpcmUoJy4vbWFwJykoKTtcclxuICAgIHJlcXVpcmUoJy4vYWRkLWV2ZW50LWxpc3RlbmVyJykoKTtcclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDAzLzA5LzIwMTYuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDUsIDE1LjQuNC4xOVxyXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjQuNC4xOVxyXG4gICAgaWYgKCFBcnJheS5wcm90b3R5cGUubWFwKSB7XHJcblxyXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNBcmcpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBULCBBLCBrO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignIHRoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAxLiBMZXQgTyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgVG9PYmplY3QgcGFzc2luZyB0aGUgfHRoaXN8XHJcbiAgICAgICAgICAgIC8vICAgIHZhbHVlIGFzIHRoZSBhcmd1bWVudC5cclxuICAgICAgICAgICAgdmFyIE8gPSBPYmplY3QodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAvLyAyLiBMZXQgbGVuVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWxcclxuICAgICAgICAgICAgLy8gICAgbWV0aG9kIG9mIE8gd2l0aCB0aGUgYXJndW1lbnQgXCJsZW5ndGhcIi5cclxuICAgICAgICAgICAgLy8gMy4gTGV0IGxlbiBiZSBUb1VpbnQzMihsZW5WYWx1ZSkuXHJcbiAgICAgICAgICAgIHZhciBsZW4gPSBPLmxlbmd0aCA+Pj4gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIDQuIElmIElzQ2FsbGFibGUoY2FsbGJhY2spIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXHJcbiAgICAgICAgICAgIC8vIFNlZTogaHR0cDovL2VzNS5naXRodWIuY29tLyN4OS4xMVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGNhbGxiYWNrICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyA1LiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgVCA9IHRoaXNBcmc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIDYuIExldCBBIGJlIGEgbmV3IGFycmF5IGNyZWF0ZWQgYXMgaWYgYnkgdGhlIGV4cHJlc3Npb24gbmV3IEFycmF5KGxlbilcclxuICAgICAgICAgICAgLy8gICAgd2hlcmUgQXJyYXkgaXMgdGhlIHN0YW5kYXJkIGJ1aWx0LWluIGNvbnN0cnVjdG9yIHdpdGggdGhhdCBuYW1lIGFuZFxyXG4gICAgICAgICAgICAvLyAgICBsZW4gaXMgdGhlIHZhbHVlIG9mIGxlbi5cclxuICAgICAgICAgICAgQSA9IG5ldyBBcnJheShsZW4pO1xyXG5cclxuICAgICAgICAgICAgLy8gNy4gTGV0IGsgYmUgMFxyXG4gICAgICAgICAgICBrID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIDguIFJlcGVhdCwgd2hpbGUgayA8IGxlblxyXG4gICAgICAgICAgICB3aGlsZSAoayA8IGxlbikge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBrVmFsdWUsIG1hcHBlZFZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGEuIExldCBQayBiZSBUb1N0cmluZyhrKS5cclxuICAgICAgICAgICAgICAgIC8vICAgVGhpcyBpcyBpbXBsaWNpdCBmb3IgTEhTIG9wZXJhbmRzIG9mIHRoZSBpbiBvcGVyYXRvclxyXG4gICAgICAgICAgICAgICAgLy8gYi4gTGV0IGtQcmVzZW50IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgSGFzUHJvcGVydHkgaW50ZXJuYWxcclxuICAgICAgICAgICAgICAgIC8vICAgIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXHJcbiAgICAgICAgICAgICAgICAvLyAgIFRoaXMgc3RlcCBjYW4gYmUgY29tYmluZWQgd2l0aCBjXHJcbiAgICAgICAgICAgICAgICAvLyBjLiBJZiBrUHJlc2VudCBpcyB0cnVlLCB0aGVuXHJcbiAgICAgICAgICAgICAgICBpZiAoayBpbiBPKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuIExldCBrVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWxcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxyXG4gICAgICAgICAgICAgICAgICAgIGtWYWx1ZSA9IE9ba107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlpLiBMZXQgbWFwcGVkVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBDYWxsIGludGVybmFsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIG1ldGhvZCBvZiBjYWxsYmFjayB3aXRoIFQgYXMgdGhlIHRoaXMgdmFsdWUgYW5kIGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGxpc3QgY29udGFpbmluZyBrVmFsdWUsIGssIGFuZCBPLlxyXG4gICAgICAgICAgICAgICAgICAgIG1hcHBlZFZhbHVlID0gY2FsbGJhY2suY2FsbChULCBrVmFsdWUsIGssIE8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBpaWkuIENhbGwgdGhlIERlZmluZU93blByb3BlcnR5IGludGVybmFsIG1ldGhvZCBvZiBBIHdpdGggYXJndW1lbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUGssIFByb3BlcnR5IERlc2NyaXB0b3JcclxuICAgICAgICAgICAgICAgICAgICAvLyB7IFZhbHVlOiBtYXBwZWRWYWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAvLyAgIFdyaXRhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgRW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAvLyAgIENvbmZpZ3VyYWJsZTogdHJ1ZSB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuZCBmYWxzZS5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSwgdXNlIHRoZSBmb2xsb3dpbmc6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT2JqZWN0LmRlZmluZVByb3BlcnR5KEEsIGssIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgIHZhbHVlOiBtYXBwZWRWYWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAvLyAgIHdyaXRhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAvLyAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgYmVzdCBicm93c2VyIHN1cHBvcnQsIHVzZSB0aGUgZm9sbG93aW5nOlxyXG4gICAgICAgICAgICAgICAgICAgIEFba10gPSBtYXBwZWRWYWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGQuIEluY3JlYXNlIGsgYnkgMS5cclxuICAgICAgICAgICAgICAgIGsrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gOS4gcmV0dXJuIEFcclxuICAgICAgICAgICAgcmV0dXJuIEE7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cclxuICovXHJcblxyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGJhc2VBdHRyID0gXCJkYXRhLTRjXCIsXHJcbiAgICBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUgPSByZXF1aXJlKCcuL2hlbHBlcnMvZ2V0LWFsbC1lbGVtZW50cy13aXRoLWF0dHJpYnV0ZScpLFxyXG4gICAgYWRkQ2xhc3MgPSByZXF1aXJlKCcuL2hlbHBlcnMvYWRkLWNsYXNzJyksXHJcbiAgICByZW1vdmVDbGFzcyA9IHJlcXVpcmUoJy4vaGVscGVycy9yZW1vdmUtY2xhc3MnKSxcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIgPSByZXF1aXJlKCcuL2hlbHBlcnMvYWRkLWV2ZW50LWxpc3RlbmVyJyksXHJcbiAgICByZW1vdmVFdmVudExpc3RlbmVyID0gcmVxdWlyZShcIi4vaGVscGVycy9yZW1vdmUtZXZlbnQtbGlzdGVuZXJcIiksXHJcbiAgICBIYW1tZXIgPSByZXF1aXJlKCdoYW1tZXJqcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZG9tQ29udGFpbmVyLCBtb2RlbCkge1xyXG5cclxuICAgIHZhciB3YXRjaGVycyA9IFtdLFxyXG4gICAgICAgIGRlc3Ryb3llcnMgPSBbXSxcclxuICAgICAgICBpc1RvdWNoID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzLXRvdWNoLXNjcmVlbicpKCk7XHJcblxyXG4gICAgaW5pdCgpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgc2V0Q2xhc3NXYXRjaGVycygpO1xyXG4gICAgICAgIHNldFRleHRXYXRjaGVycygpO1xyXG4gICAgICAgIHNldEV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgICAgICAgZXhlY3V0ZVdhdGNoZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0RXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgdmFyIGF0dHIgPSBiYXNlQXR0ciArICctb24nLFxyXG4gICAgICAgICAgICBkb21zID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGF0dHIsIGRvbUNvbnRhaW5lcik7XHJcbiAgICAgICAgZGVzdHJveWVycyA9IGRvbXMubWFwKGZ1bmN0aW9uIChkb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNldEV2ZW50TGlzdGVuZXJzRnJvbUV4cHJlc3Npb24oZG9tLCBkb20uZ2V0QXR0cmlidXRlKGF0dHIpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRFdmVudExpc3RlbmVyc0Zyb21FeHByZXNzaW9uKGVsLCBleHByZXNzaW9uKSB7XHJcbiAgICAgICAgdmFyIGV2ZW50TWFwID0gcGFyc2VBdHRyaWJ1dGUoZXhwcmVzc2lvbik7XHJcbiAgICAgICAgdmFyIGRlc3Ryb3llcnMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBldmVudE5hbWUgaW4gZXZlbnRNYXApIHtcclxuICAgICAgICAgICAgdmFyIGV2ZW50TGlzdGVuZXIgPSBnZXRFdmVudExpc3RlbmVyKGVsLCBtb2RlbCwgZXZlbnRNYXBbZXZlbnROYW1lXSk7XHJcbiAgICAgICAgICAgIHZhciBkZXN0cm95ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChpc1RvdWNoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoWydjbGljaycsICdtb3VzZW92ZXInXS5pbmRleE9mKGV2ZW50TmFtZSkgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBoYW1tZXJ0aW1lID0gbmV3IEhhbW1lcihlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFtbWVydGltZS5vbigndGFwJywgZXZlbnRMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVzdHJveWVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW1tZXJ0aW1lLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudE5hbWUgPT0gJ2NsaWNrT3V0c2lkZScpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaGFtbWVydGltZSA9IG5ldyBIYW1tZXIoZG9jdW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbW1lcnRpbWUub24oJ3RhcCcsIHdyYXBFdmVudExpc3RlbmVyVG9PdXRzaWRlQ2xpY2soZWwsIGV2ZW50TGlzdGVuZXIpKTtcclxuICAgICAgICAgICAgICAgICAgICBkZXN0cm95ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbW1lcnRpbWUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoZWwsIGV2ZW50TmFtZSwgZXZlbnRMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVzdHJveWVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKGVsLCBldmVudE5hbWUsIGV2ZW50TGlzdGVuZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnROYW1lID09ICdjbGlja091dHNpZGUnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSB3cmFwRXZlbnRMaXN0ZW5lclRvT3V0c2lkZUNsaWNrKGVsLCBldmVudExpc3RlbmVyKTtcclxuICAgICAgICAgICAgICAgIHZhciBldk5hbWUgPSAnY2xpY2snO1xyXG4gICAgICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcihkb2N1bWVudCwgZXZOYW1lLCBsaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICBkZXN0cm95ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihkb2N1bWVudCwgZXZOYW1lLCBsaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcihlbCwgZXZlbnROYW1lLCBldmVudExpc3RlbmVyKTtcclxuICAgICAgICAgICAgICAgIGRlc3Ryb3llciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKGRvY3VtZW50LCBldmVudE5hbWUsIGV2ZW50TGlzdGVuZXIpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZXN0cm95ZXJzLnB1c2goZGVzdHJveWVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJuIHJlbW92ZSBhbGwgZXZlbnQgbGlzdGVuZXJzIGZ1bmN0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZGVzdHJveWVycy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xyXG4gICAgICAgICAgICAgICAgZm4oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldENsYXNzV2F0Y2hlcnMoKSB7XHJcbiAgICAgICAgdmFyIGF0dHIgPSBiYXNlQXR0ciArICctY2xhc3MnLFxyXG4gICAgICAgICAgICBkb21zID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGF0dHIsIGRvbUNvbnRhaW5lcik7XHJcbiAgICAgICAgZG9tcy5mb3JFYWNoKGZ1bmN0aW9uIChkb20pIHtcclxuICAgICAgICAgICAgdmFyIGNsYXNzV2F0Y2hlcnMgPSBnZXRDbGFzc1dhdGNoZXJzRm9yRWxlbWVudChkb20sIGRvbS5nZXRBdHRyaWJ1dGUoYXR0cikpO1xyXG4gICAgICAgICAgICB3YXRjaGVycy5wdXNoLmFwcGx5KHdhdGNoZXJzLCBjbGFzc1dhdGNoZXJzKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRUZXh0V2F0Y2hlcnMoKSB7XHJcbiAgICAgICAgdmFyIGF0dHIgPSBiYXNlQXR0ciArICctdGV4dCcsXHJcbiAgICAgICAgICAgIGRvbXMgPSBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUoYXR0ciwgZG9tQ29udGFpbmVyKTtcclxuICAgICAgICBkb21zLmZvckVhY2goZnVuY3Rpb24gKGRvbSkge1xyXG4gICAgICAgICAgICB2YXIgdGV4dFdhdGNoZXIgPSBnZXRUZXh0V2F0Y2hlckZvckVsZW1lbnQoZG9tLCBkb20uZ2V0QXR0cmlidXRlKGF0dHIpKTtcclxuICAgICAgICAgICAgd2F0Y2hlcnMucHVzaCh0ZXh0V2F0Y2hlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Q2xhc3NXYXRjaGVyc0ZvckVsZW1lbnQoZWwsIGV4cHJlc3Npb24pIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW10sXHJcbiAgICAgICAgICAgIGNsYXNzRXhwcmVzc2lvbk1hcCA9IHBhcnNlQXR0cmlidXRlKGV4cHJlc3Npb24pO1xyXG4gICAgICAgIGZvciAodmFyIGNsYXNzTmFtZSBpbiBjbGFzc0V4cHJlc3Npb25NYXApIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goZ2V0Q2xhc3NXYXRjaGVyKGVsLCBjbGFzc05hbWUsIGNsYXNzRXhwcmVzc2lvbk1hcFtjbGFzc05hbWVdKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Q2xhc3NXYXRjaGVyKGVsLCBjbGFzc05hbWUsIGV4cHJlc3Npb24pIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoZ2V0Q2xhc3NFeHByZXNzaW9uVmFsdWUoZWwsIG1vZGVsLCBleHByZXNzaW9uKSkge1xyXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3MoZWwsIGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVDbGFzcyhlbCwgY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRUZXh0V2F0Y2hlckZvckVsZW1lbnQoZWwsIGV4cHJlc3Npb24pIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBlbC50ZXh0Q29udGVudCA9IGdldFRleHRFeHByZXNzaW9uVmFsdWUoZWwsIG1vZGVsLCBleHByZXNzaW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGFyc2VBdHRyaWJ1dGUoc3RyKSB7XHJcbiAgICAgICAgdmFyIGtleVZhbFN0cnMgPSBzdHIuc3BsaXQoLyxcXHMqLyksXHJcbiAgICAgICAgICAgIGtleVZhbCA9IHt9O1xyXG4gICAgICAgIGtleVZhbFN0cnMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgdmFyIGt2ID0gZWwuc3BsaXQoLzpcXHMqLyk7XHJcbiAgICAgICAgICAgIGtleVZhbFtrdlswXV0gPSBrdlsxXTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4ga2V5VmFsO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlQ2xhc3NFeHByZXNzaW9uKHN0cikge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9wcG9zaXRlOiBzdHIubWF0Y2goL14hLykgIT0gbnVsbCxcclxuICAgICAgICAgICAgcHJvcGVydGllczogc3RyLnJlcGxhY2UoL14hL2csICcnKS5zcGxpdCgnLicpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldENsYXNzRXhwcmVzc2lvblZhbHVlKGVsLCBtb2RlbCwgZXhwcmVzc2lvbikge1xyXG4gICAgICAgIHZhciBwYXJzZWRFeHByZXNzaW9uID0gcGFyc2VDbGFzc0V4cHJlc3Npb24oZXhwcmVzc2lvbiksXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSBwYXJzZWRFeHByZXNzaW9uLnByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgIG9wcG9zaXRlID0gcGFyc2VkRXhwcmVzc2lvbi5vcHBvc2l0ZSxcclxuICAgICAgICAgICAgc3ViTW9kZWwgPSBtb2RlbCxcclxuICAgICAgICAgICAgdGFyZ2V0UHJvcGVydHkgPSBwcm9wZXJ0aWVzLnBvcCgpLFxyXG4gICAgICAgICAgICBzdWJNb2RlbE5hbWUgPSBwcm9wZXJ0aWVzLnNoaWZ0KCksXHJcbiAgICAgICAgICAgIHZhbHVlO1xyXG4gICAgICAgIHdoaWxlIChzdWJNb2RlbE5hbWUgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHN1Yk1vZGVsID0gc3ViTW9kZWxbc3ViTW9kZWxOYW1lXTtcclxuICAgICAgICAgICAgc3ViTW9kZWxOYW1lID0gcHJvcGVydGllcy5zaGlmdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIHN1Yk1vZGVsW3RhcmdldFByb3BlcnR5XSA9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBzdWJNb2RlbFt0YXJnZXRQcm9wZXJ0eV0uY2FsbChzdWJNb2RlbCwgZWwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gc3ViTW9kZWxbdGFyZ2V0UHJvcGVydHldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3Bwb3NpdGUgPyAhdmFsdWUgOiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRUZXh0RXhwcmVzc2lvblZhbHVlKGVsLCBtb2RlbCwgZXhwcmVzc2lvbikge1xyXG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gZXhwcmVzc2lvbi5zcGxpdCgnLicpLFxyXG4gICAgICAgICAgICBzdWJNb2RlbCA9IG1vZGVsLFxyXG4gICAgICAgICAgICB0YXJnZXRQcm9wZXJ0eSA9IHByb3BlcnRpZXMucG9wKCksXHJcbiAgICAgICAgICAgIHN1Yk1vZGVsTmFtZSA9IHByb3BlcnRpZXMuc2hpZnQoKSxcclxuICAgICAgICAgICAgdmFsdWU7XHJcbiAgICAgICAgd2hpbGUgKHN1Yk1vZGVsTmFtZSAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgc3ViTW9kZWwgPSBzdWJNb2RlbFtzdWJNb2RlbE5hbWVdO1xyXG4gICAgICAgICAgICBzdWJNb2RlbE5hbWUgPSBwcm9wZXJ0aWVzLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygc3ViTW9kZWxbdGFyZ2V0UHJvcGVydHldID09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHN1Yk1vZGVsW3RhcmdldFByb3BlcnR5XS5jYWxsKHN1Yk1vZGVsLCBlbCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBzdWJNb2RlbFt0YXJnZXRQcm9wZXJ0eV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRFdmVudExpc3RlbmVyKGVsLCBtb2RlbCwgZXhwcmVzc2lvbikge1xyXG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gZXhwcmVzc2lvbi5zcGxpdCgnLicpLFxyXG4gICAgICAgICAgICBzdWJNb2RlbCA9IG1vZGVsLFxyXG4gICAgICAgICAgICBmdW5OYW1lID0gcHJvcGVydGllcy5wb3AoKSxcclxuICAgICAgICAgICAgc3ViTW9kZWxOYW1lID0gcHJvcGVydGllcy5zaGlmdCgpO1xyXG4gICAgICAgIHdoaWxlIChzdWJNb2RlbE5hbWUgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHN1Yk1vZGVsID0gc3ViTW9kZWxbc3ViTW9kZWxOYW1lXTtcclxuICAgICAgICAgICAgc3ViTW9kZWxOYW1lID0gcHJvcGVydGllcy5zaGlmdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIC8vIFRpbWVvdXQgaXMgZm9yIHByZXZlbnRpbmcgZXZlbnRzIGZpcmluZyBvbiBlbGVtZW50c1xyXG4gICAgICAgICAgICAvLyBzdGFuZGluZyBvbmUgYmVoaW5kIGFub3RoZXIgKGUuZy4gb3BlbiBhbmQgY2xvc2UgYnV0dG9uKVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHN1Yk1vZGVsW2Z1bk5hbWVdLmNhbGwoc3ViTW9kZWwsIGV2ZW50LCBlbCk7XHJcbiAgICAgICAgICAgICAgICBleGVjdXRlV2F0Y2hlcnMoKTtcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gd3JhcEV2ZW50TGlzdGVuZXJUb091dHNpZGVDbGljayhlbCwgZXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBvdXRzaWRlQ2xpY2tFdmVudExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBpc0NsaWNrSW5zaWRlID0gZWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KTtcclxuICAgICAgICAgICAgaWYgKCFpc0NsaWNrSW5zaWRlKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVyKGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleGVjdXRlV2F0Y2hlcnMoKSB7XHJcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaChmdW5jdGlvbiAod2F0Y2hlcikge1xyXG4gICAgICAgICAgICB3YXRjaGVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzdHJveSgpIHtcclxuICAgICAgICB3YXRjaGVycyA9IG51bGw7XHJcbiAgICAgICAgZGVzdHJveWVycy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xyXG4gICAgICAgICAgICBmbigpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBleGVjdXRlV2F0Y2hlcnM6IGV4ZWN1dGVXYXRjaGVycyxcclxuICAgICAgICBkZXN0cm95OiBkZXN0cm95XHJcbiAgICB9XHJcblxyXG59OyIsbnVsbCwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDAyLzA4LzIwMTcuXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlID0gcmVxdWlyZShcIi4vaGVscGVycy9nZXQtYWxsLWVsZW1lbnRzLXdpdGgtYXR0cmlidXRlXCIpLFxyXG4gICAgd3JhcEltZ0VsZW1lbnQgPSByZXF1aXJlKFwiLi93cmFwLWltZy1lbGVtZW50XCIpLFxyXG4gICAgYmFzZUF0dHIgPSBcImRhdGEtNGNcIjtcclxuXHJcbmZ1bmN0aW9uIHdyYXBBbGxJbWdFbGVtZW50c09uUGFnZSgpIHtcclxuICAgIHZhciBpbWdzID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGJhc2VBdHRyKTtcclxuICAgIGltZ3MuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICBpZiAoZWwuY29tcGxldGUpIHtcclxuICAgICAgICAgICAgd3JhcEltZ0VsZW1lbnQoZWwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHdyYXBJbWdFbGVtZW50KGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdyYXBBbGxJbWdFbGVtZW50c09uUGFnZTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlLnB1Z1wiKSxcclxuICAgIGZhaWxlZEltYWdlVGVtcGxhdGUgPSByZXF1aXJlKFwiLi9mYWlsZWQtaW1hZ2UucHVnXCIpLFxyXG4gICAgY29weVN0eWxlID0gcmVxdWlyZShcIi4vaGVscGVycy9jb3B5LXN0eWxlXCIpLFxyXG4gICAgYmFzZUF0dHIgPSBcImRhdGEtNGNcIixcclxuICAgIGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZSA9IHJlcXVpcmUoXCIuL2hlbHBlcnMvZ2V0LWFsbC1lbGVtZW50cy13aXRoLWF0dHJpYnV0ZVwiKSxcclxuICAgIHNob3J0ZW5UZXh0ID0gcmVxdWlyZShcIi4vaGVscGVycy9zaG9ydGVuLXRleHRcIiksXHJcbiAgICBhZGRFdmVudExpc3RlbmVyID0gcmVxdWlyZShcIi4vaGVscGVycy9hZGQtZXZlbnQtbGlzdGVuZXJcIiksXHJcbiAgICByZW1vdmVFdmVudExpc3RlbmVyID0gcmVxdWlyZShcIi4vaGVscGVycy9yZW1vdmUtZXZlbnQtbGlzdGVuZXJcIiksXHJcbiAgICBjc3MgPSByZXF1aXJlKCcuLi9zY3NzL21haW4uc2NzcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW1hZ2VEYXRhKSB7XHJcbiAgICB2YXIgd3JhcHBlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXHJcbiAgICAgICAgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKSxcclxuICAgICAgICBwYXJlbnROb2RlID0gdGhpcy5wYXJlbnROb2RlLFxyXG4gICAgICAgIGltZ0RvbSA9IHRoaXM7XHJcblxyXG4gICAgc3R5bGVXcmFwcGVyRGl2KGltZ0RvbSwgd3JhcHBlckRpdik7XHJcbiAgICBzdHlsZUlmcmFtZShpZnJhbWUpO1xyXG4gICAgd3JhcHBlckRpdi5hcHBlbmRDaGlsZChpZnJhbWUpO1xyXG4gICAgaWYgKHdyYXBwZXJEaXYuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShcImRpc3BsYXlcIikgPT09IFwiaW5saW5lXCIpIHtcclxuICAgICAgICB3cmFwcGVyRGl2LnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiO1xyXG4gICAgfVxyXG4gICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQod3JhcHBlckRpdiwgaW1nRG9tKTtcclxuXHJcbiAgICB2YXIgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcclxuXHJcbiAgICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XHJcbiAgICAvLyBTZXQgaW1hZ2Ugc3JjIGluIGRhdGEgdG8gcmVuZGVyIGl0IGluIHRlbXBsYXRlXHJcbiAgICBpbWFnZURhdGEuc3JjID0gdGhpcy5zcmM7XHJcbiAgICBpZnJhbWVEb2N1bWVudC53cml0ZSh0ZW1wbGF0ZShpbWFnZURhdGEpKTtcclxuICAgIGlmcmFtZURvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobWFrZVN0eWxlKCkpO1xyXG4gICAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcclxuXHJcbiAgICB0cmVhdEZhdWx0eUltYWdlcyhpZnJhbWVEb2N1bWVudC5ib2R5KTtcclxuICAgIGFkanVzdElmcmFtZUhlaWdodFRvRm9vdGVyKGlmcmFtZSwgd3JhcHBlckRpdik7XHJcbiAgICB2YXIgZGVzdHJveUxpc3RlbmVycyA9IGxpc3RlblRvUmVzaXplKGltZ0RvbSwgd3JhcHBlckRpdiwgaWZyYW1lKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZWxlbWVudDogaWZyYW1lRG9jdW1lbnQuYm9keSxcclxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGRlc3Ryb3lMaXN0ZW5lcnMoKTtcclxuICAgICAgICAgICAgaWYgKHdyYXBwZXJEaXYucGFyZW50Tm9kZSA9PSBwYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChpbWdEb20sIHdyYXBwZXJEaXYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGxpc3RlblRvUmVzaXplKGltZ0RvbSwgd3JhcHBlckRpdiwgaWZyYW1lKSB7XHJcbiAgICB2YXIgcGFyZW50Tm9kZSA9IHdyYXBwZXJEaXYucGFyZW50Tm9kZSwgdGltZW91dDtcclxuICAgIHZhciByZXNpemVMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwYXJlbnROb2RlLmFwcGVuZENoaWxkKGltZ0RvbSk7XHJcbiAgICAgICAgICAgIHN0eWxlV3JhcHBlckRpdihpbWdEb20sIHdyYXBwZXJEaXYpO1xyXG4gICAgICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKGltZ0RvbSk7XHJcbiAgICAgICAgICAgIGFkanVzdElmcmFtZUhlaWdodFRvRm9vdGVyKGlmcmFtZSwgd3JhcHBlckRpdik7XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgIH07XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKHdpbmRvdywgXCJyZXNpemVcIiwgcmVzaXplTGlzdGVuZXIpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gZGVzdHJveSBldmVudCBsaXN0ZW5lciBmdW5jdGlvblxyXG4gICAgICovXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIod2luZG93LCBcInJlc2l6ZVwiLCByZXNpemVMaXN0ZW5lcik7XHJcbiAgICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYWtlU3R5bGUoKSB7XHJcbiAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XHJcbiAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcclxuICAgIHN0eWxlLmlubmVySFRNTCA9IGNzcztcclxuICAgIHJldHVybiBzdHlsZTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRqdXN0SWZyYW1lSGVpZ2h0VG9Gb290ZXIoaWZyYW1lLCB3cmFwcGVyRGl2KSB7XHJcbiAgICB2YXIgZm9vdGVyID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGJhc2VBdHRyICsgXCItZm9vdGVyXCIsIGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50KVswXTtcclxuICAgIHdyYXBwZXJEaXYuc3R5bGUuaGVpZ2h0ID0gd3JhcHBlckRpdi5vZmZzZXRIZWlnaHQgKyBmb290ZXIub2Zmc2V0SGVpZ2h0ICsgXCJweFwiO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdHlsZUlmcmFtZShpZnJhbWUpIHtcclxuICAgIGlmcmFtZS5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xyXG4gICAgaWZyYW1lLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG4gICAgaWZyYW1lLnN0eWxlLmJvcmRlciA9IFwibm9uZVwiO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdHlsZVdyYXBwZXJEaXYoaW1nRG9tLCBkaXYpIHtcclxuICAgIGNvcHlTdHlsZShpbWdEb20sIGRpdik7XHJcbiAgICAvLyBUbyBzdXBwb3J0IGltYWdlIGJvcmRlci1yYWRpdXNcclxuICAgIGRpdi5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XHJcbiAgICBkaXYuc3R5bGUuYm9yZGVyID0gXCIxcHggc29saWQgI2RkZFwiO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cmVhdEZhdWx0eUltYWdlcyhkaXYpIHtcclxuICAgIHZhciBnYWxsZXJ5RG9tID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGJhc2VBdHRyICsgXCItZ2FsbGVyeS1saXN0XCIsIGRpdilbMF0sXHJcbiAgICAgICAgZ2FsbGVyeUl0ZW1Eb21zID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGJhc2VBdHRyICsgXCItZ2FsbGVyeS1pdGVtXCIsIGdhbGxlcnlEb20pO1xyXG4gICAgZ2FsbGVyeUl0ZW1Eb21zLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgdmFyIGltZyA9IGVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW1nXCIpWzBdO1xyXG4gICAgICAgIGlmIChpbWcpIHtcclxuICAgICAgICAgICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBmYWlsZWRJbWFnZVRlbXBsYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBzaG9ydFNyYzogc2hvcnRlblRleHQoZS5zcmNFbGVtZW50LmN1cnJlbnRTcmMsIDMwLCB0cnVlKSxcclxuICAgICAgICAgICAgICAgICAgICBmdWxsU3JjOiBlLnNyY0VsZW1lbnQuY3VycmVudFNyY1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBlbC5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMDIvMDgvMjAxNy5cclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBkYXRhSXNWYWxpZCA9IHJlcXVpcmUoXCIuL2ltYWdlLWRhdGEtaXMtdmFsaWRcIiksXHJcbiAgICB3cmFwSW1hZ2UgPSByZXF1aXJlKFwiLi93cmFwLWltYWdlXCIpLFxyXG4gICAgaW1hZ2VNb2RlbEZhY3RvcnkgPSByZXF1aXJlKFwiLi9pbWFnZS1tb2RlbFwiKSxcclxuICAgIHNldE1haW5Db250cm9sbGVyID0gcmVxdWlyZShcIi4vc2V0LW1haW4tY29udHJvbGxlclwiKSxcclxuICAgIGFtZW5kSW1hZ2VEYXRhID0gcmVxdWlyZShcIi4vYW1lbmQtaW1hZ2UtZGF0YVwiKTtcclxuXHJcblxyXG5mdW5jdGlvbiB3cmFwSW1nRWxlbWVudFdpdGhKc29uKGltZ0RvbSwganNvbiwgZmlsZVBhdGgpIHtcclxuICAgIGlmICghZGF0YUlzVmFsaWQoZmlsZVBhdGggfHwgXCJGb3VyIENvcm5lcnMgLSBKU09OXCIsIGpzb24pKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgYW1lbmRJbWFnZURhdGEoanNvbik7XHJcblxyXG4gICAgdmFyIHdyYXBwZWQgPSB3cmFwSW1hZ2UuY2FsbChpbWdEb20sIGpzb24pLFxyXG4gICAgICAgIGRlc3Ryb3lDb250YWluZXIgPSB3cmFwcGVkLmRlc3Ryb3ksXHJcbiAgICAgICAgZG9tQ29udGFpbmVyID0gd3JhcHBlZC5lbGVtZW50LFxyXG4gICAgICAgIG1vZGVsID0gaW1hZ2VNb2RlbEZhY3RvcnkoZG9tQ29udGFpbmVyKSxcclxuICAgICAgICBjb250cm9sbGVyID0gc2V0TWFpbkNvbnRyb2xsZXIoZG9tQ29udGFpbmVyLCBtb2RlbCksXHJcbiAgICAgICAgZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY29udHJvbGxlci5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIGRlc3Ryb3lDb250YWluZXIoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIHJldHVybiBGY0ludGVyZmFjZUZhY3RvcnkobW9kZWwsIGNvbnRyb2xsZXIsIGRlc3Ryb3kpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBGY0ludGVyZmFjZUZhY3RvcnkobW9kZWwsIGNvbnRyb2xsZXIsIGZ1bGxEZXN0cm95Rm4pIHtcclxuICAgIHZhciBjb250cm9sbGVyID0gY29udHJvbGxlcixcclxuICAgICAgICBtb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdG9wTGVmdDogbmV3IEZjQ29ybmVySW50ZXJmYWNlKG1vZGVsLnRvcExlZnRDb3JuZXIsIGNvbnRyb2xsZXIpLFxyXG4gICAgICAgIHRvcFJpZ2h0OiBuZXcgRmNDb3JuZXJJbnRlcmZhY2UobW9kZWwudG9wUmlnaHRDb3JuZXIsIGNvbnRyb2xsZXIpLFxyXG4gICAgICAgIGJvdHRvbUxlZnQ6IG5ldyBGY0Nvcm5lckludGVyZmFjZShtb2RlbC5ib3R0b21MZWZ0Q29ybmVyLCBjb250cm9sbGVyKSxcclxuICAgICAgICBib3R0b21SaWdodDogbmV3IENvZGVPZkV0aGljc0Nvcm5lckludGVyZmFjZShtb2RlbC5ib3R0b21SaWdodENvcm5lciwgY29udHJvbGxlciksXHJcbiAgICAgICAgZGVzdHJveTogZnVsbERlc3Ryb3lGblxyXG4gICAgfTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIEZjQ29ybmVySW50ZXJmYWNlKGNvcm5lck1vZGVsLCBjb250cm9sbGVyKSB7XHJcblxyXG4gICAgdmFyIGNvbnRyb2xsZXIgPSBjb250cm9sbGVyLFxyXG4gICAgICAgIGNvcm5lck1vZGVsID0gY29ybmVyTW9kZWw7XHJcblxyXG4gICAgdGhpcy5waW4gPSBmdW5jdGlvbiAocGlubmVkKSB7XHJcbiAgICAgICAgY29ybmVyTW9kZWwucGluKHBpbm5lZCk7XHJcbiAgICAgICAgY29udHJvbGxlci5leGVjdXRlV2F0Y2hlcnMoKTtcclxuICAgIH07XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBDb2RlT2ZFdGhpY3NDb3JuZXJJbnRlcmZhY2UoY29ybmVyTW9kZWwsIGNvbnRyb2xsZXIpIHtcclxuICAgIHZhciBjb250cm9sbGVyID0gY29udHJvbGxlcixcclxuICAgICAgICBjb3JuZXJNb2RlbCA9IGNvcm5lck1vZGVsO1xyXG5cclxuICAgIHRoaXMucGluID0gZnVuY3Rpb24gKHBpbm5lZCkge1xyXG4gICAgICAgIGNvcm5lck1vZGVsLnBpbihwaW5uZWQpO1xyXG4gICAgICAgIGNvbnRyb2xsZXIuZXhlY3V0ZVdhdGNoZXJzKCk7XHJcbiAgICB9O1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB3cmFwSW1nRWxlbWVudFdpdGhKc29uO1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMDIvMDgvMjAxNy5cclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBnZXRJbWFnZURhdGEgPSByZXF1aXJlKFwiLi9nZXQtaW1hZ2UtZGF0YVwiKSxcclxuICAgIGdldEltYWdlRGF0YSA9IHJlcXVpcmUoXCIuL2dldC1pbWFnZS1kYXRhXCIpLFxyXG4gICAgd3JhcEltZ0VsZW1lbnRXaXRoSnNvbiA9IHJlcXVpcmUoXCIuL3dyYXAtaW1nLWVsZW1lbnQtd2l0aC1qc29uXCIpO1xyXG5cclxuZnVuY3Rpb24gd3JhcEltZ0VsZW1lbnQoaW1nRG9tKSB7XHJcbiAgICBnZXRJbWFnZURhdGEuY2FsbChpbWdEb20sIGZ1bmN0aW9uIChpbWFnZURhdGEsIGZpbGVQYXRoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGltZW91dCBpcyB0byBsZXQgSW50ZXJuZXQgRXhwbG9yZXIgdG8gcmVuZGVyIHRoZSBpbWFnZSBmaXJzdCBhbmQgY2FsY3VsYXRlIGl0cycgaGVpZ2h0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHdyYXBJbWdFbGVtZW50V2l0aEpzb24oaW1nRG9tLCBpbWFnZURhdGEsIGZpbGVQYXRoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdyYXBJbWdFbGVtZW50O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiYm9keSB7XFxuICBtYXJnaW46IDA7XFxuICBvdmVyZmxvdzogaGlkZGVuOyB9XFxuXFxudWwge1xcbiAgbWFyZ2luLXRvcDogMDsgfVxcblxcbi5mYy1pbWFnZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgaGVpZ2h0OiBhdXRvOyB9XFxuICAuZmMtaW1hZ2UgKiB7XFxuICAgIC13ZWJraXQtYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gICAgLW1vei1ib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94OyB9XFxuICAuZmMtaW1hZ2UgPiBpbWcge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gICAgd2lkdGg6IDEwMCU7IH1cXG4gIC5mYy1pbWFnZSBhIHtcXG4gICAgY29sb3I6ICM2NjY2NjY7IH1cXG4gIC5mYy1pbWFnZSBhOmhvdmVyIHtcXG4gICAgY29sb3I6IGJsYWNrOyB9XFxuXFxuLmZjLWZvb3RlciB7XFxuICB0ZXh0LWFsaWduOiByaWdodDtcXG4gIHBhZGRpbmc6IDZweDsgfVxcblxcbi5mYy1jZW50ZXItaGVscGVyIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIGhlaWdodDogMTAwJTtcXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IH1cXG5cXG5ib2R5IHtcXG4gIGZvbnQtc2l6ZTogMTNweDtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBsaW5lLWhlaWdodDogMS41O1xcbiAgLXdlYmtpdC10ZXh0LWVtcGhhc2lzOiBpbml0aWFsO1xcbiAgLXdlYmtpdC10ZXh0LWZpbGwtY29sb3I6IGluaXRpYWw7XFxuICBmb250LWZhbWlseTogXFxcIkhlbHZldGljYSBOZXVlXFxcIiwgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjsgfVxcblxcbmgxIHtcXG4gIGZvbnQtc2l6ZTogMjBweDtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBtYXJnaW46IDAgMCA0cHggMDsgfVxcblxcbnAge1xcbiAgbWFyZ2luOiAwIDAgNHB4O1xcbiAgdGV4dC1hbGlnbjoganVzdGlmeTsgfVxcblxcbmEge1xcbiAgY29sb3I6ICMzMzM7XFxuICBvcGFjaXR5OiAxO1xcbiAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgLW1vei10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgLW1zLXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICAtby10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjsgfVxcbiAgYTpob3ZlciwgYTphY3RpdmUsIGE6Zm9jdXMge1xcbiAgICBvcGFjaXR5OiAxOyB9XFxuXFxuLmZjLWltYWdlIHtcXG4gIGNvbG9yOiAjMzMzOyB9XFxuXFxuLnRleHQtcmlnaHQge1xcbiAgdGV4dC1hbGlnbjogcmlnaHQ7IH1cXG5cXG4uZmMtdG9vbHMge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgei1pbmRleDogMTtcXG4gIC13ZWJraXQtYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIC1tb3otYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gIC1tb3otdHJhbnNmb3JtOiBzY2FsZSgxLjUpO1xcbiAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gIG9wYWNpdHk6IDA7XFxuICAtd2Via2l0LXRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBsaW5lYXIsIHRyYW5zZm9ybSAwLjJzIGxpbmVhcjtcXG4gIC1tb3otdHJhbnNpdGlvbjogb3BhY2l0eSAwLjNzIGxpbmVhciwgdHJhbnNmb3JtIDAuMnMgbGluZWFyO1xcbiAgLW1zLXRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBsaW5lYXIsIHRyYW5zZm9ybSAwLjJzIGxpbmVhcjtcXG4gIC1vLXRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBsaW5lYXIsIHRyYW5zZm9ybSAwLjJzIGxpbmVhcjtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBsaW5lYXIsIHRyYW5zZm9ybSAwLjJzIGxpbmVhcjsgfVxcbiAgLmZjLXRvb2xzOmhvdmVyIHtcXG4gICAgLXdlYmtpdC10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICAtbW96LXRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIC1tcy10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICBvcGFjaXR5OiAxOyB9XFxuICAudG91Y2gtc2NyZWVuIC5mYy10b29scyB7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICAtbXMtdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgb3BhY2l0eTogMTsgfVxcbiAgLmZjLXRvb2xzLmNvbGxhcHNlZCB7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgxLjUpO1xcbiAgICAtbW96LXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjUpO1xcbiAgICBvcGFjaXR5OiAwOyB9XFxuXFxuLmZjLWJ0biB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBtYXJnaW46IDA7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgY29sb3I6ICMzMzM7XFxuICBiYWNrZ3JvdW5kOiAjZmZmO1xcbiAgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgZm9udC1zaXplOiAyMnB4O1xcbiAgaGVpZ2h0OiAzNXB4O1xcbiAgd2lkdGg6IDM1cHg7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgcGFkZGluZzogMDtcXG4gIG9wYWNpdHk6IDE7XFxuICAtd2Via2l0LXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICAtbW96LXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICAtbXMtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIC1vLXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyOyB9XFxuICAuZmMtYnRuOmhvdmVyLCAuZmMtYnRuOmFjdGl2ZSwgLmZjLWJ0bjpmb2N1cyB7XFxuICAgIG9wYWNpdHk6IDE7IH1cXG4gIC5mYy1idG4tY29ybmVyIHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgcG9zaXRpb246IGFic29sdXRlOyB9XFxuICAuZmMtYnRuLXRvcC1sZWZ0IHtcXG4gICAgdG9wOiAxMHB4O1xcbiAgICBsZWZ0OiAxMHB4OyB9XFxuICAuZmMtYnRuLXRvcC1yaWdodCB7XFxuICAgIHRvcDogMTBweDtcXG4gICAgcmlnaHQ6IDEwcHg7IH1cXG4gIC5mYy1idG4tYm90dG9tLWxlZnQge1xcbiAgICBib3R0b206IDEwcHg7XFxuICAgIGxlZnQ6IDEwcHg7IH1cXG4gIC5mYy1idG4tYm90dG9tLXJpZ2h0IHtcXG4gICAgYm90dG9tOiAxMHB4O1xcbiAgICByaWdodDogMTBweDsgfVxcbiAgLmZjLWJ0bi1jbG9zZSB7XFxuICAgIHotaW5kZXg6IDI7XFxuICAgIGJvcmRlcjogbm9uZTtcXG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxuICAgIGZvbnQtc2l6ZTogMzBweDtcXG4gICAgcGFkZGluZzogMCAwIDVweDtcXG4gICAgbGluZS1oZWlnaHQ6IDFlbTtcXG4gICAgdmVydGljYWwtYWxpZ246IHRvcDtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB0b3A6IC01cHg7XFxuICAgIHJpZ2h0OiAtNXB4OyB9XFxuXFxuLmZjLWNvbnRlbnQge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlOyB9XFxuICAuZmMtY29udGVudCA6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcXG4gICAgd2lkdGg6IDAuNWVtO1xcbiAgICBoZWlnaHQ6IDAuNWVtOyB9XFxuICAuZmMtY29udGVudCA6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcXG4gICAgYmFja2dyb3VuZDogc2lsdmVyO1xcbiAgICBib3JkZXItcmFkaXVzOiAwLjI1ZW07IH1cXG4gIC5mYy1jb250ZW50IDo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2sge1xcbiAgICBiYWNrZ3JvdW5kOiAjZTBlMGUwOyB9XFxuICAuZmMtY29udGVudCBib2R5IHtcXG4gICAgc2Nyb2xsYmFyLWZhY2UtY29sb3I6IHNpbHZlcjtcXG4gICAgc2Nyb2xsYmFyLXRyYWNrLWNvbG9yOiAjZTBlMGUwOyB9XFxuICAuZmMtY29udGVudC1jb250YWluZXIge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBtYXgtd2lkdGg6IDI2MHB4O1xcbiAgICBtYXgtaGVpZ2h0OiAxMDAlO1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgICBjb2xvcjogIzMzMztcXG4gICAgb3ZlcmZsb3cteTogYXV0bztcXG4gICAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgICBiYWNrZ3JvdW5kOiB3aGl0ZTtcXG4gICAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgICAtbW96LXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICAgIC1tcy10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgICAtby10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyOyB9XFxuICAgIC5mYy1jb250ZW50LWNvbnRhaW5lci52aXNpYmxlLCAuZmMtY29udGVudC1jb250YWluZXIucGlubmVkIHtcXG4gICAgICBvcGFjaXR5OiAxO1xcbiAgICAgIHotaW5kZXg6IDI7IH1cXG4gIC5mYy1jb250ZW50LXN1YnRpdGxlIHtcXG4gICAgbWFyZ2luLXRvcDogMTBweDtcXG4gICAgY29sb3I6ICM4ODg4ODg7IH1cXG4gIC5mYy1jb250ZW50LWhlYWRlciB7XFxuICAgIGRpc3BsYXk6IHRhYmxlO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlZmVmZWY7XFxuICAgIG1hcmdpbi1ib3R0b206IDhweDtcXG4gICAgY2xlYXI6IGJvdGg7IH1cXG4gICAgLmZjLWNvbnRlbnQtaGVhZGVyIGgxIHtcXG4gICAgICBmbG9hdDogbGVmdDtcXG4gICAgICBtYXJnaW4tdG9wOiAtNnB4OyB9XFxuICAgIC5mYy1jb250ZW50LWhlYWRlciBidXR0b24ge1xcbiAgICAgIGZsb2F0OiByaWdodDtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAtNnB4OyB9XFxuICAuZmMtY29udGVudC1ib2R5IHtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuZmMtY29udGVudC10ZXh0IHtcXG4gICAgcGFkZGluZzogMTVweCAxNXB4IDE1cHggMTBweDtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xcbiAgICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7IH1cXG4gIC5mYy1jb250ZW50LWZpbGwge1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIG1heC13aWR0aDogMTAwJTsgfVxcbiAgLmZjLWNvbnRlbnQtdG9wLXJpZ2h0IHtcXG4gICAgdG9wOiAwO1xcbiAgICByaWdodDogMDsgfVxcbiAgLmZjLWNvbnRlbnQtYm90dG9tLWxlZnQge1xcbiAgICBib3R0b206IDA7XFxuICAgIGxlZnQ6IDA7IH1cXG4gIC5mYy1jb250ZW50LWJvdHRvbS1yaWdodCB7XFxuICAgIGJvdHRvbTogMDtcXG4gICAgcmlnaHQ6IDA7IH1cXG4gIC5mYy1jb250ZW50LWNvcHlyaWdodCB7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgY29sb3I6ICM4ODg4ODg7IH1cXG4gIC5mYy1jb250ZW50LWNvZXRpdGxlIHtcXG4gICAgZm9udC12YXJpYW50OiBzbWFsbC1jYXBzO1xcbiAgICBkaXNwbGF5OiBpbmxpbmU7XFxuICAgIGZvbnQtc2l6ZTogMTNweDsgfVxcbiAgLmZjLWNvbnRlbnQtY29lIHtcXG4gICAgY29sb3I6ICM4ODg4ODg7IH1cXG5cXG4uZmMtdG9vbHMge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgei1pbmRleDogMTtcXG4gIC13ZWJraXQtYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIC1tb3otYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gIC1tb3otdHJhbnNmb3JtOiBzY2FsZSgxLjUpO1xcbiAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gIG9wYWNpdHk6IDA7XFxuICAtd2Via2l0LXRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBsaW5lYXIsIHRyYW5zZm9ybSAwLjJzIGxpbmVhcjtcXG4gIC1tb3otdHJhbnNpdGlvbjogb3BhY2l0eSAwLjNzIGxpbmVhciwgdHJhbnNmb3JtIDAuMnMgbGluZWFyO1xcbiAgLW1zLXRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBsaW5lYXIsIHRyYW5zZm9ybSAwLjJzIGxpbmVhcjtcXG4gIC1vLXRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBsaW5lYXIsIHRyYW5zZm9ybSAwLjJzIGxpbmVhcjtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBsaW5lYXIsIHRyYW5zZm9ybSAwLjJzIGxpbmVhcjsgfVxcbiAgLmZjLXRvb2xzOmhvdmVyIHtcXG4gICAgLXdlYmtpdC10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICAtbW96LXRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIC1tcy10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICBvcGFjaXR5OiAxOyB9XFxuICAudG91Y2gtc2NyZWVuIC5mYy10b29scyB7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICAtbXMtdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgb3BhY2l0eTogMTsgfVxcbiAgLmZjLXRvb2xzLmNvbGxhcHNlZCB7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgxLjUpO1xcbiAgICAtbW96LXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjUpO1xcbiAgICBvcGFjaXR5OiAwOyB9XFxuXFxuLmZjLWJ0biB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBtYXJnaW46IDA7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgY29sb3I6ICMzMzM7XFxuICBiYWNrZ3JvdW5kOiAjZmZmO1xcbiAgYm9yZGVyOiAxcHggc29saWQgdHJhbnNwYXJlbnQ7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgZm9udC1zaXplOiAyMnB4O1xcbiAgaGVpZ2h0OiAzNXB4O1xcbiAgd2lkdGg6IDM1cHg7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgcGFkZGluZzogMDtcXG4gIG9wYWNpdHk6IDE7XFxuICAtd2Via2l0LXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICAtbW96LXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICAtbXMtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIC1vLXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyOyB9XFxuICAuZmMtYnRuOmhvdmVyLCAuZmMtYnRuOmFjdGl2ZSwgLmZjLWJ0bjpmb2N1cyB7XFxuICAgIG9wYWNpdHk6IDE7IH1cXG4gIC5mYy1idG4tY29ybmVyIHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgcG9zaXRpb246IGFic29sdXRlOyB9XFxuICAuZmMtYnRuLXRvcC1sZWZ0IHtcXG4gICAgdG9wOiAxMHB4O1xcbiAgICBsZWZ0OiAxMHB4OyB9XFxuICAuZmMtYnRuLXRvcC1yaWdodCB7XFxuICAgIHRvcDogMTBweDtcXG4gICAgcmlnaHQ6IDEwcHg7IH1cXG4gIC5mYy1idG4tYm90dG9tLWxlZnQge1xcbiAgICBib3R0b206IDEwcHg7XFxuICAgIGxlZnQ6IDEwcHg7IH1cXG4gIC5mYy1idG4tYm90dG9tLXJpZ2h0IHtcXG4gICAgYm90dG9tOiAxMHB4O1xcbiAgICByaWdodDogMTBweDsgfVxcbiAgLmZjLWJ0bi1jbG9zZSB7XFxuICAgIHotaW5kZXg6IDI7XFxuICAgIGJvcmRlcjogbm9uZTtcXG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxuICAgIGZvbnQtc2l6ZTogMzBweDtcXG4gICAgcGFkZGluZzogMCAwIDVweDtcXG4gICAgbGluZS1oZWlnaHQ6IDFlbTtcXG4gICAgdmVydGljYWwtYWxpZ246IHRvcDtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB0b3A6IC01cHg7XFxuICAgIHJpZ2h0OiAtNXB4OyB9XFxuXFxuLmZjLWdhbGxlcnkge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBvdmVyZmxvdzogaGlkZGVuOyB9XFxuICAuZmMtZ2FsbGVyeS1mYWlsZWQtaW1hZ2Uge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBiYWNrZ3JvdW5kOiAjMDAwO1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGRpc3BsYXk6IHRhYmxlOyB9XFxuICAgIC5mYy1nYWxsZXJ5LWZhaWxlZC1pbWFnZS1jYXB0aW9uIHtcXG4gICAgICBkaXNwbGF5OiB0YWJsZS1jZWxsO1xcbiAgICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XFxuICAgICAgZm9udC1zaXplOiAxNnB4O1xcbiAgICAgIHdoaXRlLXNwYWNlOiBub3JtYWw7XFxuICAgICAgcGFkZGluZzogMTBweDsgfVxcbiAgLmZjLWdhbGxlcnkgdWwge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICBtYXJnaW46IDA7XFxuICAgIHBhZGRpbmc6IDA7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgwLjgpO1xcbiAgICAtbW96LXRyYW5zZm9ybTogc2NhbGUoMC44KTtcXG4gICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMC44KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjgpO1xcbiAgICAtd2Via2l0LXRyYW5zaXRpb246IG1hcmdpbi1sZWZ0IDAuMTVzIGxpbmVhcjtcXG4gICAgLW1vei10cmFuc2l0aW9uOiBtYXJnaW4tbGVmdCAwLjE1cyBsaW5lYXI7XFxuICAgIC1tcy10cmFuc2l0aW9uOiBtYXJnaW4tbGVmdCAwLjE1cyBsaW5lYXI7XFxuICAgIC1vLXRyYW5zaXRpb246IG1hcmdpbi1sZWZ0IDAuMTVzIGxpbmVhcjtcXG4gICAgdHJhbnNpdGlvbjogbWFyZ2luLWxlZnQgMC4xNXMgbGluZWFyOyB9XFxuICAgIC5mYy1nYWxsZXJ5IHVsIGxpIHtcXG4gICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgd2lkdGg6IDEwMCU7XFxuICAgICAgaGVpZ2h0OiAxMDAlO1xcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgfVxcbiAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpIGltZyxcXG4gICAgICAuZmMtZ2FsbGVyeSB1bCBsaSBpZnJhbWUsXFxuICAgICAgLmZjLWdhbGxlcnkgdWwgbGkgLmZjLWdhbGxlcnktZmFpbGVkLWltYWdlIHtcXG4gICAgICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XFxuICAgICAgICBvcGFjaXR5OiAwLjc7XFxuICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMC45KTtcXG4gICAgICAgIC1tb3otdHJhbnNmb3JtOiBzY2FsZSgwLjkpO1xcbiAgICAgICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMC45KTtcXG4gICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMC45KTtcXG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMTVzIGxpbmVhciwgb3BhY2l0eSAwLjE1cyBsaW5lYXI7XFxuICAgICAgICAtbW96LXRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjE1cyBsaW5lYXIsIG9wYWNpdHkgMC4xNXMgbGluZWFyO1xcbiAgICAgICAgLW1zLXRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjE1cyBsaW5lYXIsIG9wYWNpdHkgMC4xNXMgbGluZWFyO1xcbiAgICAgICAgLW8tdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMTVzIGxpbmVhciwgb3BhY2l0eSAwLjE1cyBsaW5lYXI7XFxuICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4xNXMgbGluZWFyLCBvcGFjaXR5IDAuMTVzIGxpbmVhcjsgfVxcbiAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpIGltZyB7XFxuICAgICAgICBtYXgtd2lkdGg6IDEwMCU7XFxuICAgICAgICBtYXgtaGVpZ2h0OiAxMDAlO1xcbiAgICAgICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTsgfVxcbiAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpLmhvdmVyIGltZyxcXG4gICAgICAuZmMtZ2FsbGVyeSB1bCBsaS5ob3ZlciBpZnJhbWUsXFxuICAgICAgLmZjLWdhbGxlcnkgdWwgbGkuaG92ZXIgLmZjLWdhbGxlcnktZmFpbGVkLWltYWdlLCAuZmMtZ2FsbGVyeSB1bCBsaTpob3ZlciBpbWcsXFxuICAgICAgLmZjLWdhbGxlcnkgdWwgbGk6aG92ZXIgaWZyYW1lLFxcbiAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpOmhvdmVyIC5mYy1nYWxsZXJ5LWZhaWxlZC1pbWFnZSB7XFxuICAgICAgICBvcGFjaXR5OiAwLjg1O1xcbiAgICAgICAgLXdlYmtpdC10cmFuc2Zvcm06IHNjYWxlKDAuOTIpO1xcbiAgICAgICAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDAuOTIpO1xcbiAgICAgICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMC45Mik7XFxuICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOTIpOyB9XFxuICAgICAgLmZjLWdhbGxlcnkgdWwgbGkuaG92ZXIgLmZjLWdhbGxlcnktZmFpbGVkLWltYWdlLCAuZmMtZ2FsbGVyeSB1bCBsaTpob3ZlciAuZmMtZ2FsbGVyeS1mYWlsZWQtaW1hZ2Uge1xcbiAgICAgICAgb3BhY2l0eTogMC43OyB9XFxuICAgICAgLmZjLWdhbGxlcnkgdWwgbGkuc2VsZWN0ZWQge1xcbiAgICAgICAgY3Vyc29yOiBkZWZhdWx0OyB9XFxuICAgICAgICAuZmMtZ2FsbGVyeSB1bCBsaS5zZWxlY3RlZCBpbWcsXFxuICAgICAgICAuZmMtZ2FsbGVyeSB1bCBsaS5zZWxlY3RlZCBpZnJhbWUsXFxuICAgICAgICAuZmMtZ2FsbGVyeSB1bCBsaS5zZWxlY3RlZCAuZmMtZ2FsbGVyeS1mYWlsZWQtaW1hZ2Uge1xcbiAgICAgICAgICBvcGFjaXR5OiAxO1xcbiAgICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgICAgICAgIC1tb3otdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgICAgICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7IH1cXG4gICAgICAuZmMtZ2FsbGVyeSB1bCBsaS5zZWxlY3RlZCAuZmMtZ2FsbGVyeS1mYWlsZWQtaW1hZ2Uge1xcbiAgICAgICAgb3BhY2l0eTogMC43OyB9XFxuICAuZmMtZ2FsbGVyeS5leHBhbmRlZCB1bCBsaSBpbWcsXFxuICAuZmMtZ2FsbGVyeS5leHBhbmRlZCB1bCBsaSBpZnJhbWUge1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMS4yNSk7XFxuICAgIC1tb3otdHJhbnNmb3JtOiBzY2FsZSgxLjI1KTtcXG4gICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMS4yNSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4yNSk7IH1cXG4gIC5mYy1nYWxsZXJ5LWNhcHRpb24ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvdHRvbTogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gICAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgICAtbW96LXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICAgIC1tcy10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgICAtby10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyOyB9XFxuICAgIC5mYy1nYWxsZXJ5LWNhcHRpb24udmlzaWJsZSB7XFxuICAgICAgZGlzcGxheTogYmxvY2s7IH1cXG4gICAgLmZjLWdhbGxlcnktY2FwdGlvbi1iYWNrZ3JvdW5kIHtcXG4gICAgICB3aWR0aDogMTAwJTtcXG4gICAgICBoZWlnaHQ6IDEwMCU7XFxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgIHRvcDogMDtcXG4gICAgICBsZWZ0OiAwO1xcbiAgICAgIGJhY2tncm91bmQ6ICNmZmY7XFxuICAgICAgb3BhY2l0eTogMC40OyB9XFxuICAgIC5mYy1nYWxsZXJ5LWNhcHRpb24tdGV4dCB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgIGhlaWdodDogMTAwJTtcXG4gICAgICB3aWR0aDogMTAwJTtcXG4gICAgICBmb250LXZhcmlhbnQ6IHNtYWxsLWNhcHM7IH1cXG4gIC5mYy1nYWxsZXJ5LWNsb3NlIHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gICAgdG9wOiAwO1xcbiAgICByaWdodDogMDtcXG4gICAgcG9zaXRpb246IGFic29sdXRlOyB9XFxuICAgIC5mYy1nYWxsZXJ5LWNsb3NlLnZpc2libGUge1xcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcblxcbmEuZmMtZ2FsbGVyeS1jb250cm9scyB7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMzVweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIHotaW5kZXg6IDE7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGNvbG9yOiAjMzMzO1xcbiAgb3BhY2l0eTogMC41O1xcbiAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgLW1vei10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgLW1zLXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICAtby10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjsgfVxcbiAgYS5mYy1nYWxsZXJ5LWNvbnRyb2xzOmhvdmVyLCBhLmZjLWdhbGxlcnktY29udHJvbHM6YWN0aXZlLCBhLmZjLWdhbGxlcnktY29udHJvbHM6Zm9jdXMge1xcbiAgICBvcGFjaXR5OiAwLjg7IH1cXG4gIGEuZmMtZ2FsbGVyeS1jb250cm9scy50cmFuc3BhcmVudCB7XFxuICAgIG9wYWNpdHk6IDA7IH1cXG4gIGEuZmMtZ2FsbGVyeS1jb250cm9scyBpIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDUwJTtcXG4gICAgbGVmdDogMDtcXG4gICAgbWFyZ2luLXRvcDogLTM1cHg7XFxuICAgIGZvbnQtc2l6ZTogNzBweDsgfVxcblxcbmEuZmMtZ2FsbGVyeS1wcmV2IHtcXG4gIGxlZnQ6IDA7IH1cXG5cXG5hLmZjLWdhbGxlcnktbmV4dCB7XFxuICByaWdodDogMDsgfVxcblxcbi5mYy1pbWFnZSAuZmMtY29kZS1vZi1ldGhpY3Mge1xcbiAgYmFja2dyb3VuZDogI2ZmZjtcXG4gIHBhZGRpbmc6IDVweCAxMHB4OyB9XFxuICAuZmMtaW1hZ2UgLmZjLWNvZGUtb2YtZXRoaWNzLnZpc2libGUge1xcbiAgICBkaXNwbGF5OiBibG9jazsgfVxcbiAgLmZjLWltYWdlIC5mYy1jb2RlLW9mLWV0aGljcy1zaG93IHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggZGFzaGVkO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIC13ZWJraXQtdHJhbnNpdGlvbjogY29sb3IgMC4xcyBsaW5lYXI7XFxuICAgIC1tb3otdHJhbnNpdGlvbjogY29sb3IgMC4xcyBsaW5lYXI7XFxuICAgIC1tcy10cmFuc2l0aW9uOiBjb2xvciAwLjFzIGxpbmVhcjtcXG4gICAgLW8tdHJhbnNpdGlvbjogY29sb3IgMC4xcyBsaW5lYXI7XFxuICAgIHRyYW5zaXRpb246IGNvbG9yIDAuMXMgbGluZWFyOyB9XFxuICAgIC5mYy1pbWFnZSAuZmMtY29kZS1vZi1ldGhpY3Mtc2hvdy5mYy1pbWFnZS1hIHtcXG4gICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7IH1cXG5cXG4uZmMtaWNvbiB7XFxuICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgaGVpZ2h0OiAxZW07XFxuICB3aWR0aDogMWVtO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGJhY2tncm91bmQtcG9zaXRpb246IGNlbnRlcjsgfVxcbiAgLmZjLWljb24tYnJhbmQge1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCcFpEMGlUR0Y1WlhKZk1TSWdaR0YwWVMxdVlXMWxQU0pNWVhsbGNpQXhJaUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSFpwWlhkQ2IzZzlJakFnTUNBMk1EWXVNellnT0RVdU16TWlQangwYVhSc1pUNUNjbUZ1WkNCSlkyOXVJR1p2Y2lCM1pXSThMM1JwZEd4bFBqeHdiMng1YkdsdVpTQndiMmx1ZEhNOUlqWXdNaTQ0TnlBME9TNHdPQ0EyTURJdU9EY2dPREV1T0RVZ05UY3dMakE1SURneExqZzFJaUJ6ZEhsc1pUMGlabWxzYkRwdWIyNWxPM04wY205clpUb2pNMlpoT1dZMU8zTjBjbTlyWlMxdGFYUmxjbXhwYldsME9qRXdPM04wY205clpTMTNhV1IwYURvMkxqazNNelV6TXpFMU16VXpNemt6TlRWd2VDSXZQanh3YjJ4NWJHbHVaU0J3YjJsdWRITTlJalUzTUM0d09TQXpMalE1SURZd01pNDROeUF6TGpRNUlEWXdNaTQ0TnlBek5pNHlOaUlnYzNSNWJHVTlJbVpwYkd3NmJtOXVaVHR6ZEhKdmEyVTZJekF3TUR0emRISnZhMlV0YldsMFpYSnNhVzFwZERveE1EdHpkSEp2YTJVdGQybGtkR2c2Tmk0NU56TTFNek14TlRNMU16TTVNelUxY0hnaUx6NDhjRzlzZVd4cGJtVWdjRzlwYm5SelBTSTFOVGN1TkRFZ09ERXVPRFVnTlRJMExqWXpJRGd4TGpnMUlEVXlOQzQyTXlBME9TNHdPQ0lnYzNSNWJHVTlJbVpwYkd3NmJtOXVaVHR6ZEhKdmEyVTZJekF3TUR0emRISnZhMlV0YldsMFpYSnNhVzFwZERveE1EdHpkSEp2YTJVdGQybGtkR2c2Tmk0NU56TTFNek14TlRNMU16TTVNelUxY0hnaUx6NDhjRzlzZVd4cGJtVWdjRzlwYm5SelBTSTFNalF1TmpNZ016WXVNallnTlRJMExqWXpJRE11TkRrZ05UVTNMalF4SURNdU5Ea2lJSE4wZVd4bFBTSm1hV3hzT201dmJtVTdjM1J5YjJ0bE9pTXdNREE3YzNSeWIydGxMVzFwZEdWeWJHbHRhWFE2TVRBN2MzUnliMnRsTFhkcFpIUm9Pall1T1Rjek5UTXpNVFV6TlRNek9UTTFOWEI0SWk4K1BIQmhkR2dnWkQwaVRUVTBMalUyTERNNExqZDJOQzQzTWtnek1pNDBPSFl4TXk0MFNEVXhMamcwZGpRdU56SklNekl1TkRoV09EQXVPRFpJTWpZdU9EZFdNemd1TjBnMU5DNDFObG9pSUhSeVlXNXpabTl5YlQwaWRISmhibk5zWVhSbEtDMHlOaTQ0TnlBdE1UY3VNRGdwSWk4K1BIQmhkR2dnWkQwaVRUWTFMalUzTERVeExqUTRZVEl3TGprc01qQXVPU3d3TERBc01Td3pMamd4TFRjdU1EWXNNVGd1Tml3eE9DNDJMREFzTUN3eExEWXVNekl0TkM0NUxESXdMREl3TERBc01Dd3hMRGd1T0MweExqZ3pMREl3TERJd0xEQXNNQ3d4TERndU9Dd3hMamd6TERFNExqWXhMREU0TGpZeExEQXNNQ3d4TERZdU16SXNOQzQ1TERJd0xqazBMREl3TGprMExEQXNNQ3d4TERNdU9ERXNOeTR3Tml3eU55NDNOQ3d5Tnk0M05Dd3dMREFzTVN3d0xERTJMalU1TERJd0xqa3pMREl3TGprekxEQXNNQ3d4TFRNdU9ERXNOeTR3TmtFeE9DNHlPQ3d4T0M0eU9Dd3dMREFzTVN3NU15NHpMRGd3WVRJd0xqSTBMREl3TGpJMExEQXNNQ3d4TFRndU9Dd3hMamhCTWpBdU1qUXNNakF1TWpRc01Dd3dMREVzTnpVdU55dzRNR0V4T0M0eU5pd3hPQzR5Tml3d0xEQXNNUzAyTGpNeUxUUXVPRGNzTWpBdU9Td3lNQzQ1TERBc01Dd3hMVE11T0RFdE55NHdOa0V5Tnk0M05Dd3lOeTQzTkN3d0xEQXNNU3cyTlM0MU55dzFNUzQwT0ZwdE5TNHhOeXd4TkM0MU9XRXhOeTR3Tnl3eE55NHdOeXd3TERBc01Dd3lMallzTlM0MU9Dd3hNeTR5T0N3eE15NHlPQ3d3TERBc01DdzBMalUxTERRc01UVXVNamdzTVRVdU1qZ3NNQ3d3TERBc01UTXVNak1zTUN3eE15NHlPU3d4TXk0eU9Td3dMREFzTUN3MExqVTFMVFFzTVRjdU1Ea3NNVGN1TURrc01Dd3dMREFzTWk0MkxUVXVOVGdzTWpRdU16TXNNalF1TXpNc01Dd3dMREFzTUMweE1pNDFPQ3d4Tnk0d09Td3hOeTR3T1N3d0xEQXNNQzB5TGpZdE5TNDFPQ3d4TXk0eU9Td3hNeTR5T1N3d0xEQXNNQzAwTGpVMUxUUXNNVFV1TWpnc01UVXVNamdzTUN3d0xEQXRNVE11TWpNc01Dd3hNeTR5T0N3eE15NHlPQ3d3TERBc01DMDBMalUxTERRc01UY3VNRGNzTVRjdU1EY3NNQ3d3TERBdE1pNDJMRFV1TlRoQk1qUXVNek1zTWpRdU16TXNNQ3d3TERBc056QXVOelFzTmpZdU1EZGFJaUIwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNndE1qWXVPRGNnTFRFM0xqQTRLU0l2UGp4d1lYUm9JR1E5SWsweE5EWXVPQ3czTnk0M05uRXROQzR6TVN3MExURXlMakk0TERRdE9DNHhOU3d3TFRFeUxqY3pMVE11T0RkMExUUXVOVGd0TVRJdU16RldNemd1TjJnMUxqWXhWalkxTGpZemNUQXNOUzQyTnl3ekxEZ3VOVGwwT0M0Mk9Dd3lMamt5Y1RVdU16Y3NNQ3c0TGpFNExUSXVPVEowTWk0NE1TMDRMalU1VmpNNExqZG9OUzQyTVZZMk5TNDJNMUV4TlRFdU1URXNOek11TnpJc01UUTJMamdzTnpjdU56WmFJaUIwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNndE1qWXVPRGNnTFRFM0xqQTRLU0l2UGp4d1lYUm9JR1E5SWsweE9EVXVPRE1zTXpndU4zRTJMREFzT1M0ME1pd3pZVEV3TGpFMkxERXdMakUyTERBc01Dd3hMRE11TkN3NExqQTVMREV5TGpnc01USXVPQ3d3TERBc01TMHhMamMwTERZdU56TXNPU3c1TERBc01Dd3hMVFV1TlRnc05IWXdMakV5WVRjdU5URXNOeTQxTVN3d0xEQXNNU3d6TERFdU1UZ3NOaTQwT1N3MkxqUTVMREFzTUN3eExERXVPRE1zTWl3NUxEa3NNQ3d3TERFc01Td3lMalUzTERJM0xqTTBMREkzTGpNMExEQXNNQ3d4TEM0MUxETnhNQzR4TWl3eExqVTBMakU0TERNdU1UTmhNall1T0RVc01qWXVPRFVzTUN3d0xEQXNMak1zTXk0eE15d3hPUzR4TWl3eE9TNHhNaXd3TERBc01Dd3VOamdzTWk0NU1rRTNMaklzTnk0eUxEQXNNQ3d3TERJd01DNHhOU3c0TVdndE5pNHlObUV6TGpVeExETXVOVEVzTUN3d0xERXRMamd0TVM0M055d3hPQ3d4T0N3d0xEQXNNUzB1TWpjdE1pNDFNWEV0TUM0d05pMHhMak01TFM0eE1pMHpZVEl3TGpZNUxESXdMalk1TERBc01Dd3dMUzR6TlMwekxqRXpjUzB3TGpJMExURXVOVE10TGpVNUxUSXVPVEpoTmk0NE55dzJMamczTERBc01Dd3dMVEV1TVRJdE1pNDBNaXcxTGpVMUxEVXVOVFVzTUN3d0xEQXRNaTB4TGpZMUxEY3VORFVzTnk0ME5Td3dMREFzTUMwekxqTXhMUzQyTWtneE56RXVObFk0TVVneE5qWldNemd1TjJneE9TNDRNMXBOTVRnM0xEVTNMamd6WVRndU1URXNPQzR4TVN3d0xEQXNNQ3d6TGpFdE1TNHhOU3cyTGpJNUxEWXVNamtzTUN3d0xEQXNNaTR4TXkweUxqTXNOeTQzTXl3M0xqY3pMREFzTUN3d0xDNDRMVE11TnpVc055NDFOaXczTGpVMkxEQXNNQ3d3TFRFdU56Y3ROUzR5Y1MweExqYzNMVEl0TlM0M015MHlTREUzTVM0MmRqRTBMamRvTVRFdU5qbEJNakl1TlRjc01qSXVOVGNzTUN3d0xEQXNNVGczTERVM0xqZ3pXaUlnZEhKaGJuTm1iM0p0UFNKMGNtRnVjMnhoZEdVb0xUSTJMamczSUMweE55NHdPQ2tpTHo0OGNHRjBhQ0JrUFNKTk1qTTNMamd5TERRMExqWTJZVEV6TERFekxEQXNNQ3d3TFRjdU5qVXRNaTR5TkN3eE15NDNMREV6TGpjc01Dd3dMREF0Tmk0ME55d3hMalF5TERFeUxqYzBMREV5TGpjMExEQXNNQ3d3TFRRdU5ETXNNeTQ0TVN3eE5pNDBNaXd4Tmk0ME1pd3dMREFzTUMweUxqVTNMRFV1TkRZc01qUXVOQ3d5TkM0MExEQXNNQ3d3TFM0NE15dzJMak00TERJM0xqSTVMREkzTGpJNUxEQXNNQ3d3TEM0NE15dzJMamd5TERFMkxqSTVMREUyTGpJNUxEQXNNQ3d3TERJdU5UY3NOUzQyTVN3eE1pNDJOeXd4TWk0Mk55d3dMREFzTUN3MExqUTJMRE11T0RFc01UTXVPRGdzTVRNdU9EZ3NNQ3d3TERBc05pNDFMREV1TkRJc01USXVOVEVzTVRJdU5URXNNQ3d3TERBc05DNDVNeTB1T1RJc01URXVNVFVzTVRFdU1UVXNNQ3d3TERBc015NDNNaTB5TGpVMExERXhMalkzTERFeExqWTNMREFzTUN3d0xESXVORFV0TXk0NE4wRXhOaTR3Tnl3eE5pNHdOeXd3TERBc01Dd3lOREl1TkN3Mk5VZ3lORGh4TFRBdU9ETXNPQzAxTGpRNUxERXlMalIwTFRFeUxqYzJMRFF1TkROaE1qQXVNeklzTWpBdU16SXNNQ3d3TERFdE9DNDFOaTB4TGpZNExERTJMamdzTVRZdU9Dd3dMREFzTVMwMkxqQTRMVFF1TmpRc01Ua3VPRGdzTVRrdU9EZ3NNQ3d3TERFdE15NDJNeTAzTERJNUxqY3hMREk1TGpjeExEQXNNQ3d4TFRFdU1qRXRPQzQyTWl3eU9DNHhNeXd5T0M0eE15d3dMREFzTVN3eExqTXRPQzQyTlN3eU1DNDRNeXd5TUM0NE15d3dMREFzTVN3ekxqZ3hMVGN1TURZc01UY3VOelVzTVRjdU56VXNNQ3d3TERFc05pNHlOaTAwTGpjMUxESXdMakU1TERJd0xqRTVMREFzTUN3eExEZ3VOVGt0TVM0M05Dd3lNUzQyT0N3eU1TNDJPQ3d3TERBc01TdzJMakkyTGpnNUxERTJMamcxTERFMkxqZzFMREFzTUN3eExEVXVNallzTWk0MkxERTBMall6TERFMExqWXpMREFzTUN3eExETXVPRFFzTkM0eU9Dd3hOUzQzTWl3eE5TNDNNaXd3TERBc01Td3lMRFV1T1RSSU1qUXlRVEV3TGpRMExERXdMalEwTERBc01Dd3dMREl6Tnk0NE1pdzBOQzQyTmxvaUlIUnlZVzV6Wm05eWJUMGlkSEpoYm5Oc1lYUmxLQzB5Tmk0NE55QXRNVGN1TURncElpOCtQSEJoZEdnZ1pEMGlUVEkxT1M0M09TdzFNUzQwT0dFeU1DNDRPU3d5TUM0NE9Td3dMREFzTVN3ekxqZ3hMVGN1TURZc01UZ3VOaXd4T0M0MkxEQXNNQ3d4TERZdU16SXROQzQ1TERJeUxqQTJMREl5TGpBMkxEQXNNQ3d4TERFM0xqWXNNQ3d4T0M0Mk1pd3hPQzQyTWl3d0xEQXNNU3cyTGpNeUxEUXVPU3d5TUM0NU1pd3lNQzQ1TWl3d0xEQXNNU3d6TGpneExEY3VNRFlzTWpjdU56UXNNamN1TnpRc01Dd3dMREVzTUN3eE5pNDFPU3d5TUM0NU1Td3lNQzQ1TVN3d0xEQXNNUzB6TGpneExEY3VNRFpCTVRndU1qZ3NNVGd1TWpnc01Dd3dMREVzTWpnM0xqVXlMRGd3WVRJeUxqTTVMREl5TGpNNUxEQXNNQ3d4TFRFM0xqWXNNQ3d4T0M0eU5pd3hPQzR5Tml3d0xEQXNNUzAyTGpNeUxUUXVPRGNzTWpBdU9EZ3NNakF1T0Rnc01Dd3dMREV0TXk0NE1TMDNMakEyUVRJM0xqY3lMREkzTGpjeUxEQXNNQ3d4TERJMU9TNDNPU3cxTVM0ME9GcE5NalkxTERZMkxqQTNZVEUzTGpBNExERTNMakE0TERBc01Dd3dMREl1Tml3MUxqVTRMREV6TGpJNExERXpMakk0TERBc01Dd3dMRFF1TlRVc05Dd3hOUzR5Tnl3eE5TNHlOeXd3TERBc01Dd3hNeTR5TXl3d0xERXpMakk0TERFekxqSTRMREFzTUN3d0xEUXVOVFV0TkN3eE55NHdPQ3d4Tnk0d09Dd3dMREFzTUN3eUxqWXROUzQxT0N3eU5DNHpNaXd5TkM0ek1pd3dMREFzTUN3d0xURXlMalU0TERFM0xqQTRMREUzTGpBNExEQXNNQ3d3TFRJdU5pMDFMalU0TERFekxqSTRMREV6TGpJNExEQXNNQ3d3TFRRdU5UVXROQ3d4TlM0eU55d3hOUzR5Tnl3d0xEQXNNQzB4TXk0eU15d3dMREV6TGpJNExERXpMakk0TERBc01Dd3dMVFF1TlRVc05Dd3hOeTR3T0N3eE55NHdPQ3d3TERBc01DMHlMallzTlM0MU9FRXlOQzR6TWl3eU5DNHpNaXd3TERBc01Dd3lOalVzTmpZdU1EZGFJaUIwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNndE1qWXVPRGNnTFRFM0xqQTRLU0l2UGp4d1lYUm9JR1E5SWswek16RXVOVEVzTXpndU4zRTJMREFzT1M0ME1pd3pZVEV3TGpFM0xERXdMakUzTERBc01Dd3hMRE11TkN3NExqQTVMREV5TGpnc01USXVPQ3d3TERBc01TMHhMamMwTERZdU56TXNPU3c1TERBc01Dd3hMVFV1TlRnc05IWXdMakV5WVRjdU5USXNOeTQxTWl3d0xEQXNNU3d6TERFdU1UZ3NOaTQwT1N3MkxqUTVMREFzTUN3eExERXVPRE1zTWl3NUxEa3NNQ3d3TERFc01Td3lMalUzTERJM0xqTTBMREkzTGpNMExEQXNNQ3d4TEM0MUxETnhNQzR4TWl3eExqVTBMakU0TERNdU1UTmhNamN1TVRjc01qY3VNVGNzTUN3d0xEQXNMakk1TERNdU1UTXNNVGt1TURjc01Ua3VNRGNzTUN3d0xEQXNMalk0TERJdU9USkJOeTR5TVN3M0xqSXhMREFzTUN3d0xETTBOUzQ0TWl3NE1XZ3ROaTR5Tm1FekxqVXhMRE11TlRFc01Dd3dMREV0TGpndE1TNDNOeXd4T0M0eE5pd3hPQzR4Tml3d0xEQXNNUzB1TWpjdE1pNDFNWEV0TUM0d05pMHhMak01TFM0eE1pMHpZVEl3TGpVc01qQXVOU3d3TERBc01DMHVNelV0TXk0eE0zRXRNQzR5TkMweExqVXpMUzQxT1MweUxqa3lZVFl1T0Rnc05pNDRPQ3d3TERBc01DMHhMakV5TFRJdU5ESXNOUzQxTml3MUxqVTJMREFzTUN3d0xUSXRNUzQyTlVFM0xqUTFMRGN1TkRVc01Dd3dMREFzTXpNeExEWXpTRE14Tnk0elZqZ3hhQzAxTGpZeFZqTTRMamRvTVRrdU9ESmFiVEV1TVRnc01Ua3VNVE5oT0M0eE1TdzRMakV4TERBc01Dd3dMRE11TVMweExqRTFMRFl1TXl3MkxqTXNNQ3d3TERBc01pNHhNeTB5TGpNc055NDNOQ3czTGpjMExEQXNNQ3d3TEM0NExUTXVOelVzTnk0MU55dzNMalUzTERBc01Dd3dMVEV1TnpjdE5TNHljUzB4TGpjM0xUSXROUzQzTXkweVNETXhOeTR5T0hZeE5DNDNTRE15T1VFeU1pNDFOaXd5TWk0MU5pd3dMREFzTUN3ek16SXVOamtzTlRjdU9ETmFJaUIwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNndE1qWXVPRGNnTFRFM0xqQTRLU0l2UGp4d1lYUm9JR1E5SWswek5qTXVPVE1zTXpndU4yd3lNaTR5TERNMExqRTVhREF1TVRKV016Z3VOMmcxTGpNeVZqZ3dMamcyYUMwMkxqRTBURE0yTXk0MExEUTNhQzB3TGpFeVZqZ3dMamcyU0RNMU9GWXpPQzQzYURVdU9UTmFJaUIwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNndE1qWXVPRGNnTFRFM0xqQTRLU0l2UGp4d1lYUm9JR1E5SWswME16VXVOamNzTXpndU4zWTBMamN5YUMweU15NDFkakV6TGpSb01qRXVPVEYyTkM0M01rZzBNVEl1TVRkMk1UUXVObWd5TXk0Mk9IWTBMamN5U0RRd05pNDFObFl6T0M0M2FESTVMakV4V2lJZ2RISmhibk5tYjNKdFBTSjBjbUZ1YzJ4aGRHVW9MVEkyTGpnM0lDMHhOeTR3T0NraUx6NDhjR0YwYUNCa1BTSk5ORFk0TGpNNUxETTRMamR4Tml3d0xEa3VORElzTTJFeE1DNHhOeXd4TUM0eE55d3dMREFzTVN3ekxqUXNPQzR3T1N3eE1pNDRMREV5TGpnc01Dd3dMREV0TVM0M05DdzJMamN6TERrc09Td3dMREFzTVMwMUxqVTRMRFIyTUM0eE1tRTNMalV5TERjdU5USXNNQ3d3TERFc015d3hMakU0TERZdU5Ea3NOaTQwT1N3d0xEQXNNU3d4TGpnekxESXNPU3c1TERBc01Dd3hMREVzTWk0MU55d3lOeTR6TkN3eU55NHpOQ3d3TERBc01Td3VOU3d6Y1RBdU1USXNNUzQxTkM0eE9Dd3pMakV6WVRJM0xqRTNMREkzTGpFM0xEQXNNQ3d3TEM0eU9Td3pMakV6TERFNUxqQTNMREU1TGpBM0xEQXNNQ3d3TEM0Mk9Dd3lMamt5UVRjdU1qRXNOeTR5TVN3d0xEQXNNQ3cwT0RJdU55dzRNV2d0Tmk0eU5tRXpMalV4TERNdU5URXNNQ3d3TERFdExqZ3RNUzQzTnl3eE9DNHhOaXd4T0M0eE5pd3dMREFzTVMwdU1qY3RNaTQxTVhFdE1DNHdOaTB4TGpNNUxTNHhNaTB6WVRJd0xqVXNNakF1TlN3d0xEQXNNQzB1TXpVdE15NHhNM0V0TUM0eU5DMHhMalV6TFM0MU9TMHlMamt5WVRZdU9EZ3NOaTQ0T0N3d0xEQXNNQzB4TGpFeUxUSXVORElzTlM0MU5pdzFMalUyTERBc01Dd3dMVEl0TVM0Mk5TdzNMalExTERjdU5EVXNNQ3d3TERBdE15NHpNUzB1TmpKb0xURXpMamRXT0RGb0xUVXVOakZXTXpndU4yZ3hPUzQ0TWxwdE1TNHhPQ3d4T1M0eE0yRTRMakV4TERndU1URXNNQ3d3TERBc015NHhMVEV1TVRVc05pNHpMRFl1TXl3d0xEQXNNQ3d5TGpFekxUSXVNeXczTGpjMExEY3VOelFzTUN3d0xEQXNMamd0TXk0M05TdzNMalUzTERjdU5UY3NNQ3d3TERBdE1TNDNOeTAxTGpKeExURXVOemN0TWkwMUxqY3pMVEpJTkRVMExqRTJkakUwTGpkb01URXVOamxCTWpJdU5UWXNNakl1TlRZc01Dd3dMREFzTkRZNUxqVTNMRFUzTGpneldpSWdkSEpoYm5ObWIzSnRQU0owY21GdWMyeGhkR1VvTFRJMkxqZzNJQzB4Tnk0d09Da2lMejQ4Y0dGMGFDQmtQU0pOTlRFMkxEUTBMalEyWVRFeExqa3NNVEV1T1N3d0xEQXNNQzAzTGpFM0xUSXNNVGN1TVRVc01UY3VNVFVzTUN3d0xEQXRNeTQwT0M0ek5TdzVMakkxTERrdU1qVXNNQ3d3TERBdE15d3hMakU0TERZdU1qRXNOaTR5TVN3d0xEQXNNQzB5TGpFekxESXVNakVzTmk0NE5TdzJMamcxTERBc01Dd3dMUzQ0TERNdU5EVXNOQzR6T1N3MExqTTVMREFzTUN3d0xERXVNVFVzTXk0eE5pdzRMalV5TERndU5USXNNQ3d3TERBc015NHdOeXd5UVRJMUxqWTRMREkxTGpZNExEQXNNQ3d3TERVd09DdzFObkV5TGpReUxEQXVOU3cwTGprekxERXVNRGwwTkM0NU15d3hMak01WVRFMkxqSTVMREUyTGpJNUxEQXNNQ3d4TERRdU16UXNNaTR4Tml3eE1DNHlOeXd4TUM0eU55d3dMREFzTVN3ekxqQTNMRE11TkRJc01USXNNVElzTUN3d0xERXRMak0xTERFeExERXlMalF4TERFeUxqUXhMREFzTUN3eExUTXVPRGNzTXk0NUxERTJMamcwTERFMkxqZzBMREFzTUN3eExUVXVNamtzTWk0eE9Dd3lOUzQyT0N3eU5TNDJPQ3d3TERBc01TMDFMamd5TGpZNExESTBMamN6TERJMExqY3pMREFzTUN3eExUWXVOeTB1T0Rrc01UWXVOVE1zTVRZdU5UTXNNQ3d3TERFdE5TNDFOUzB5TGpZNUxERXlMamN6TERFeUxqY3pMREFzTUN3eExUTXVOemd0TkM0Mk1VRXhOQzQ0TXl3eE5DNDRNeXd3TERBc01TdzBPVEl1TkRnc05qZG9OUzR6TVdFNUxqVXhMRGt1TlRFc01Dd3dMREFzTVN3MExqVTRMRGt1TXprc09TNHpPU3d3TERBc01Dd3lMamN5TERNdU1UWXNNVEV1TkRVc01URXVORFVzTUN3d0xEQXNNeTQ1TXl3eExqZ3pMREU0TERFNExEQXNNQ3d3TERRdU5qRXVOVGtzTWpBdU9UTXNNakF1T1RNc01Dd3dMREFzTXk0NE1TMHVNelVzTVRFdU1pd3hNUzR5TERBc01Dd3dMRE11TkRVdE1TNHlNU3cyTGpRNExEWXVORGdzTUN3d0xEQXNNeTQwTXkwMkxqRXhRVFV1TWprc05TNHlPU3d3TERBc01DdzFNVGt1TlRrc05qWmhPQzQwT0N3NExqUTRMREFzTUN3d0xUTXVNRGN0TWk0eU1Td3lNaTQxTkN3eU1pNDFOQ3d3TERBc01DMDBMak0wTFRFdU16bHNMVFF1T1RNdE1TNHdPWEV0TWk0MU1TMHVOVFl0TkM0NU15MHhMak5CTVRjdU9ERXNNVGN1T0RFc01Dd3dMREVzTkRrNExEVTRZVGt1TXpJc09TNHpNaXd3TERBc01TMHpMakEzTFRNdU1UTkJPUzR5TWl3NUxqSXlMREFzTUN3eExEUTVNeTQzT0N3MU1HRXhNUzR4Tnl3eE1TNHhOeXd3TERBc01Td3hMak10TlM0MU1pd3hNUzR6TkN3eE1TNHpOQ3d3TERBc01Td3pMalExTFRNdU9EUXNNVFV1TlRJc01UVXVOVElzTUN3d0xERXNOQzQ1TFRJdU1qUXNNakV1TmpVc01qRXVOalVzTUN3d0xERXNOUzQyTkMwdU56UXNNakl1TlRrc01qSXVOVGtzTUN3d0xERXNOaXd1TnpkQk1UTXVOallzTVRNdU5qWXNNQ3d3TERFc05USXdMRFF3TGpnNExERXhMalk1TERFeExqWTVMREFzTUN3eExEVXlNeTR5T0N3ME5XRXhOQzQ1TERFMExqa3NNQ3d3TERFc01TNHpNeXcyU0RVeE9TNHpVVFV4T0M0NE1pdzBOaTQwT1N3MU1UWXNORFF1TkRaYUlpQjBjbUZ1YzJadmNtMDlJblJ5WVc1emJHRjBaU2d0TWpZdU9EY2dMVEUzTGpBNEtTSXZQand2YzNablBnPT0pO1xcbiAgICB3aWR0aDogMTIxcHg7XFxuICAgIGhlaWdodDogMTdweDsgfVxcbiAgLmZjLWljb24tY29udGV4dCB7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybChkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUJwWkQwaVRHRjVaWEpmTVNJZ1pHRjBZUzF1WVcxbFBTSk1ZWGxsY2lBeElpQjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaUlIWnBaWGRDYjNnOUlqQWdNQ0F5TURBZ01qQXdJajQ4ZEdsMGJHVStabU10YVdOdmJpMWpiMjUwWlhoMFBDOTBhWFJzWlQ0OGNHRjBhQ0JrUFNKTk1UQXVNallzTnpCMk5qQklMVEUxTGpGV056QklNVEF1TWpadE1UQXRNVEJJTFRJMUxqRjJPREJJTWpBdU1qWldOakJvTUZvaUx6NDhjR0YwYUNCa1BTSk5NakUxTGpFMkxEWTVMamswZGpZd0xqRXlTREU0T1M0Mk9GWTJPUzQ1TkdneU5TNDBPRTB5TWpVdU1TdzJNRWd4TnprdU56UjJPREJJTWpJMUxqRldOakJvTUZvaUx6NDhjR0YwYUNCa1BTSk5NVFU0TGpjMExEVTNkamcyU0RReExqSTRWalUzU0RFMU9DNDNORzB4TWkweE1rZ3lPUzR5T0ZZeE5UVklNVGN3TGpjMFZqUTFhREJhSWk4K1BHTnBjbU5zWlNCamVEMGlOalV1TmpraUlHTjVQU0k0TXk0d015SWdjajBpTVRFdU1UZ2lMejQ4Y0c5c2VXZHZiaUJ3YjJsdWRITTlJalUwTGpVeElERXpNeUF4TkRVdU5URWdNVE16SURFek15NHhPQ0E1TWk0ek15QXhNalF1TmpnZ09UVXVNek1nTVRFMkxqQXhJRGd3TGpFM0lEa3dMak0wSURFeE5pNHpNeUEzTmk0MklERXdPQzQ0TXlBMU5DNDFNU0F4TXpNaUx6NDhMM04yWno0PSk7IH1cXG4gIC5mYy1pY29uLWluZm8ge1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCcFpEMGlUR0Y1WlhKZk1TSWdaR0YwWVMxdVlXMWxQU0pNWVhsbGNpQXhJaUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSFpwWlhkQ2IzZzlJakFnTUNBME55QXhNell1TXpJaVBqeDBhWFJzWlQ1RGIyNTBaWGgwSUdsamIyNGdabTl5SUhkbFlqd3ZkR2wwYkdVK1BIQmhkR2dnWkQwaVRURXhOQzR6TVN3eE5UTXVNemRqTFRBdU1pd3lMak10TGpRc05DNDNOQzB3TGpZMExEY3VNVFpoTVM0eExERXVNU3d3TERBc01TMHVORFF1TmpsakxUWXVORFVzTkM0ME1pMHhNeTQwTXl3M0xqTXlMVEl4TGpReExEY3VNRGxoTVRVdU56SXNNVFV1TnpJc01Dd3dMREV0TVRBdU1qWXRNeTQzTTJNdE15NHpNUzB5TGpreExUUXVOamt0Tmk0M05DMDFMVEV4TFRBdU5EWXROaTQzT1N3eExqSXlMVEV6TGpJc015NDROQzB4T1M0ek4zTTFMall0TVRJdU16a3NPQzR6TXkweE9DNDJNa0UzTWk0NExEY3lMamdzTUN3d0xEQXNPVFFzT1RrdU5HRXlNeTQzTVN3eU15NDNNU3d3TERBc01Dd3VNRGt0T1M0ek1tTXRNQzQ1TWkwMExqSTVMVE11T0RjdE5pNDBOUzA0TGpJMExUVXVPVUUwT0M0eU5pdzBPQzR5Tml3d0xEQXNNQ3c0TVN3NE5TNHlOR010TUM0eU5TNHdOaTB1TkRrc01DNHhOQzB3TGpnNExEQXVNalpzTUM0ek55MDBMakUwWVRJdU5URXNNaTQxTVN3d0xEQXNNQ3d1TURZdE1DNDBPR010TUM0eU5DMHlMakEyTGprdE15NHlMREl1TlRFdE5DNHlOa000T0N3M015NDBPQ3c1TXl3M01TdzVPQzQzTnl3M01DNHdPVUV5TUN3eU1Dd3dMREFzTVN3eE1UQXNOekV1TXpSaE1UTXVOVGdzTVRNdU5UZ3NNQ3d3TERFc09DNDBOU3d4TVM0eE1tTXdMamd5TERVdU16SXNNQ3d4TUM0MU1pMHhMakk0TERFMUxqWTNMVEl1TWpnc09TNHlOeTAyTERFNExUa3VPVFFzTWpZdU5qWXRNUzQ1TlN3MExqTXpMVFF1TWpNc09DNDFNaTAxTGpRMkxERXpMakUwWVRJMUxqWTRMREkxTGpZNExEQXNNQ3d3TFRFdU1UTXNPUzR6TldNd0xqUXpMRFF1TVRrc015NHdPQ3cyTGpjNUxEY3VNamNzTmk0M04wRTJNaTR3T1N3Mk1pNHdPU3d3TERBc01Dd3hNVFF1TXpFc01UVXpMak0zV2lJZ2RISmhibk5tYjNKdFBTSjBjbUZ1YzJ4aGRHVW9MVGMyTGpRNElDMHpNaWtpTHo0OGNHRjBhQ0JrUFNKTk1USXpMalE0TERRMExqZzBRVEV5TGpneExERXlMamd4TERBc01Td3hMREV4TUM0M0xETXlhREF1TURaaE1USXVOelVzTVRJdU56VXNNQ3d3TERFc01USXVOeklzTVRJdU56aDJNQzR3TmxvaUlIUnlZVzV6Wm05eWJUMGlkSEpoYm5Oc1lYUmxLQzAzTmk0ME9DQXRNeklwSWk4K1BDOXpkbWMrKTsgfVxcbiAgLmZjLWljb24tbGlua3Mge1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCcFpEMGlUR0Y1WlhKZk1TSWdaR0YwWVMxdVlXMWxQU0pNWVhsbGNpQXhJaUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSFpwWlhkQ2IzZzlJakFnTUNBeE16WXVNelFnTVRNMkxqTTJJajQ4ZEdsMGJHVStabU10YVdOdmJpMXNhVzVyY3p3dmRHbDBiR1UrUEhCaGRHZ2daRDBpVFRnNExqSTJMRFV5TGpsc055NHhOaXczTGpFMllUSXhMakU1TERJeExqRTVMREFzTUN3eExEQXNNamt1T0RoTU5UUXVOVGtzTVRNd0xqYzNZVEl4TGpFNUxESXhMakU1TERBc01Dd3hMVEk1TGpnNExEQnNMVFV1TkRjdE5TNDBOMkV5TVM0eE9Td3lNUzR4T1N3d0xEQXNNU3d3TFRJNUxqZzRURE13TGpneUxEZ3pMamcwSWlCMGNtRnVjMlp2Y20wOUluUnlZVzV6YkdGMFpTZ3ROaTQ0TXlBdE5pNDRNaWtpSUhOMGVXeGxQU0ptYVd4c09tNXZibVU3YzNSeWIydGxPaU13TURBN2MzUnliMnRsTFd4cGJtVmpZWEE2Y205MWJtUTdjM1J5YjJ0bExXMXBkR1Z5YkdsdGFYUTZNVEE3YzNSeWIydGxMWGRwWkhSb09qRXlMalE1TmpBd01ESTRPVGt4TmprNU1uQjRJaTgrUEhCaGRHZ2daRDBpVFRZeExqYzBMRGszTGpGc0xUY3VNVFl0Tnk0eE5tRXlNUzR4T1N3eU1TNHhPU3d3TERBc01Td3dMVEk1TGpnNFREazFMalF4TERFNUxqSXpZVEl4TGpFNUxESXhMakU1TERBc01Dd3hMREk1TGpnNExEQnNOUzQwTnl3MUxqUTNZVEl4TGpFNUxESXhMakU1TERBc01Dd3hMREFzTWprdU9EaE1NVEU1TGpFNUxEWTJMakUySWlCMGNtRnVjMlp2Y20wOUluUnlZVzV6YkdGMFpTZ3ROaTQ0TXlBdE5pNDRNaWtpSUhOMGVXeGxQU0ptYVd4c09tNXZibVU3YzNSeWIydGxPaU13TURBN2MzUnliMnRsTFd4cGJtVmpZWEE2Y205MWJtUTdjM1J5YjJ0bExXMXBkR1Z5YkdsdGFYUTZNVEE3YzNSeWIydGxMWGRwWkhSb09qRXlMalE1TmpBd01ESTRPVGt4TmprNU1uQjRJaTgrUEM5emRtYyspOyB9XFxuICAuZmMtaWNvbi1jb3B5cmlnaHQge1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCcFpEMGlUR0Y1WlhKZk1TSWdaR0YwWVMxdVlXMWxQU0pNWVhsbGNpQXhJaUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSFpwWlhkQ2IzZzlJakFnTUNBeE5USWdNVFV5SWo0OGRHbDBiR1UrWm1NdGFXTnZiaTFqYjNCNWNtbG5hSFE4TDNScGRHeGxQanhqYVhKamJHVWdZM2c5SWpjMklpQmplVDBpTnpZaUlISTlJamN3SWlCemRIbHNaVDBpWm1sc2JEcHViMjVsTzNOMGNtOXJaVG9qTURBd08zTjBjbTlyWlMxdGFYUmxjbXhwYldsME9qRXdPM04wY205clpTMTNhV1IwYURveE1uQjRJaTgrUEhCaGRHZ2daRDBpVFRFeE9DNHpOeXc0TWk0MU0yRXhOaTQzTkN3eE5pNDNOQ3d3TERBc01DMDJMakUzTFRRdU5qa3NNakF1TlRNc01qQXVOVE1zTUN3d0xEQXRPQzQwTmkweExqWTBMREl4TGpFM0xESXhMakUzTERBc01Dd3dMVEUyTERjc01qUXVNVGNzTWpRdU1UY3NNQ3d3TERBdE5DNDNOQ3c0TERNd0xqRTNMRE13TGpFM0xEQXNNQ3d3TERBc01Ua3VPVElzTWpRdU56a3NNalF1Tnprc01Dd3dMREFzTkM0Mk5DdzNMamcyTERJeExESXhMREFzTUN3d0xEWXVPVE1zTlM0eE9Td3lNQ3d5TUN3d0xEQXNNQ3c0TGpVM0xERXVPRFlzTVRrdU1pd3hPUzR5TERBc01Dd3dMRGt1TWpndE1pNHhPQ3d4T0M0ME9Dd3hPQzQwT0N3d0xEQXNNQ3cyTGpZMkxUWXVNVEZzTVRRdU1Ua3NNVEF1TlRsaE1qa3VOVFVzTWprdU5UVXNNQ3d3TERFdE1USXVORFVzTVRBdU1UVXNNemd1TlRJc016Z3VOVElzTUN3d0xERXRNVFV1TlN3ekxqSTRMRFEzTGpZeUxEUTNMall5TERBc01Dd3hMVEUyTGpjdE1pNDROQ3d6T0M0eUxETTRMaklzTUN3d0xERXRNVE11TWpFdE9DNHhNeXd6Tmk0NE55d3pOaTQ0Tnl3d0xEQXNNUzA0TGpZNExURXlMamd6TERRekxqWTJMRFF6TGpZMkxEQXNNQ3d4TFRNdU1URXRNVFl1T0RGQk5ETXVOallzTkRNdU5qWXNNQ3d3TERFc05qWXVOek1zT0RRdU0yRXpOaTQ0T0N3ek5pNDRPQ3d3TERBc01TdzRMalk0TFRFeUxqZ3pMRE00TGpJMkxETTRMakkyTERBc01Dd3hMREV6TGpJeExUZ3VNVE1zTkRjdU5qSXNORGN1TmpJc01Dd3dMREVzTVRZdU55MHlMamcwTERReExEUXhMREFzTUN3eExEWXVPREl1Tml3ek5pNDVNeXd6Tmk0NU15d3dMREFzTVN3M0xERXVPVEVzTXpFdU1qRXNNekV1TWpFc01Dd3dMREVzTmk0Mk1Td3pMalE1TERJMkxqTXpMREkyTGpNekxEQXNNQ3d4TERVdU5qZ3NOUzR6TlZvaUlIUnlZVzV6Wm05eWJUMGlkSEpoYm5Oc1lYUmxLQzB5TkNBdE1qUXBJaTgrUEM5emRtYyspOyB9XFxuICAuZmMtaWNvbi1hbmdsZS1yaWdodCB7XFxuICAgIHdpZHRoOiAwLjVlbTtcXG4gICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QnBaRDBpVEdGNVpYSmZNU0lnWkdGMFlTMXVZVzFsUFNKTVlYbGxjaUF4SWlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhacFpYZENiM2c5SWpBZ01DQTVNUzR6SURJNU5TNDRPQ0krUEhScGRHeGxQa05vWlhaeWIyNGdjbWxuYUhRZ2FXTnZiaUJtYjNJZ2QyVmlQQzkwYVhSc1pUNDhjRzlzZVd4cGJtVWdjRzlwYm5SelBTSTRMalV6SURRdU1qZ2dPREF1TmpNZ01UUTNMamswSURndU5UTWdNamt4TGpZaUlITjBlV3hsUFNKbWFXeHNPbTV2Ym1VN2MzUnliMnRsT2lNd01EQTdjM1J5YjJ0bExXMXBkR1Z5YkdsdGFYUTZNVEE3YzNSeWIydGxMWGRwWkhSb09qRTVMakE0TXpnek56VXdPVEUxTlRJM00zQjRJaTgrUEM5emRtYyspOyB9XFxuICAuZmMtaWNvbi1hbmdsZS1sZWZ0IHtcXG4gICAgd2lkdGg6IDAuNWVtO1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCcFpEMGlUR0Y1WlhKZk1TSWdaR0YwWVMxdVlXMWxQU0pNWVhsbGNpQXhJaUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSFpwWlhkQ2IzZzlJakFnTUNBNU1TNHpJREk1TlM0NE9DSStQSFJwZEd4bFBrTm9aWFp5YjI0Z2JHVm1kQ0JwWTI5dUlHWnZjaUIzWldJOEwzUnBkR3hsUGp4d2IyeDViR2x1WlNCd2IybHVkSE05SWpneUxqYzRJREk1TVM0MklERXdMalk0SURFME55NDVOQ0E0TWk0M09DQTBMakk0SWlCemRIbHNaVDBpWm1sc2JEcHViMjVsTzNOMGNtOXJaVG9qTURBd08zTjBjbTlyWlMxdGFYUmxjbXhwYldsME9qRXdPM04wY205clpTMTNhV1IwYURveE9TNHdPRE00TXpjMU1Ea3hOVFV5TnpOd2VDSXZQand2YzNablBnPT0pOyB9XFxuXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9bWFpbi5zY3NzLm1hcCAqL1wiOyJdfQ==
