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
      a[key] = valA + (valA && valB && ';') + valB;
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
    var out = '', delim = '';
    for (var style in val) {
      /* istanbul ignore else */
      if (pug_has_own_property.call(val, style)) {
        out = out + delim + style + ':' + val[style];
        delim = ';';
      }
    }
    return out;
  } else {
    val = '' + val;
    if (val[val.length - 1] === ';') return val.slice(0, -1);
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
    addLinkTypes(data.links);
    shortenDataText(data);
};

function addLinkTypes(linksList) {
    if (!linksList) {
        return;
    }
    linksList.forEach(function (link) {
        var a = document.createElement('a');
        a.href = link.url;
        link.type = a.hostname.match('wikipedia') != null ? 'wikipedia-w' : 'link';
    });
}

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
},{"./helpers/shorten-text":18}],6:[function(require,module,exports){
var pug = require('pug-runtime');
module.exports=template;function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;
;var locals_for_with = (locals || {});(function (shortSrc) {
pug_html = pug_html + "\u003C!--";
;pug_debug_line = 2;
pug_html = pug_html + "Created by Tim Osadchiy on 06\u002F09\u002F2016.";
;pug_debug_line = 3;
pug_html = pug_html + "\n";
;pug_debug_line = 3;
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
},{"./helpers/get-all-elements-with-attribute":12,"./helpers/xml-to-json":19}],8:[function(require,module,exports){
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
 * Created by Tim Osadchiy on 27/08/2016.
 */

'use strict';

module.exports = function (fileName, targetDocument) {
    var script = targetDocument.createElement('script');
    script.src = fileName;
    targetDocument.body.appendChild(script)
};

},{}],15:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 17/09/2016.
 */

'use strict';

module.exports = function() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
};
},{}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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
            if (!el.src && !el.youtube_id) {
                console.warn(path, ': \'context\', element number', String(i + 1),
                    ' - \'src\' and \'youtube_id\' are not defined');
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
        console.warn(path, ': \'creativeCommons\' are not defined');
    }
    if (data.creativeCommons && !data.creativeCommons.copyright) {
        console.warn(path, ': \'creativeCommons\' - author is not defined');
        return true;
    }
    return true;
}

},{}],21:[function(require,module,exports){
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
},{"./helpers/add-class":8,"./helpers/get-all-elements-with-attribute":12,"./helpers/is-touch-screen":15,"./helpers/remove-class":16}],22:[function(require,module,exports){
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

},{"./helpers/add-swipe-events":10,"./polyfills/index":26,"./wrap-all-img-elements-on-page":30,"./wrap-img-element":33,"./wrap-img-element-with-json":32}],23:[function(require,module,exports){
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
},{"./helpers/add-class":8,"./helpers/add-event-listener":9,"./helpers/get-all-elements-with-attribute":12,"./helpers/is-touch-screen":15,"./helpers/remove-class":16,"./helpers/remove-event-listener":17,"hammerjs":3}],29:[function(require,module,exports){
var pug = require('pug-runtime');
module.exports=template;function pug_attr(t,e,n,f){return e!==!1&&null!=e&&(e||"class"!==t&&"style"!==t)?e===!0?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||e.indexOf('"')===-1)?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)s=pug_classes(r[g]),s&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
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

pug_html = pug_html + "\u003Cdiv class=\"fc-gallery-controls fc-gallery-prev\" data-4c-class=\"transparent: getPrevControllerHidden\"\u003E";

pug_html = pug_html + "\u003Ca data-4c-on=\"click: topLeftCorner.selectPrevious, mouseover: topLeftCorner.preselectPrevious, mouseleave: topLeftCorner.clearPreselect\"\u003E";

pug_html = pug_html + "\u003Ci class=\"fa fa-angle-left\"\u003E\u003C\u002Fi\u003E\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E";
}

pug_html = pug_html + "\u003Cul data-4c-gallery-list=\"data-4c-gallery-list\"\u003E";

// iterate context
;(function(){
  var $$obj = context;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var item = $$obj[pug_index0];

pug_html = pug_html + "\u003Cli data-4c-on=\"click: topLeftCorner.selectItem\" data-4c-class=\"hover: topLeftCorner.getItemIsPreselected\" data-4c-gallery-item=\"data-4c-gallery-item\"\u003E";

if (item.src) {

pug_html = pug_html + "\u003Cimg" + (pug_attr("src", item.src, true, false)) + "\u002F\u003E";
}

if (item.youtube_id) {

pug_html = pug_html + "\u003Ciframe" + (" width=\"100%\" height=\"100%\""+pug_attr("src", "//www.youtube.com/embed/" + item.youtube_id + "?enablejsapi=1", true, false)+" data-4c-gallery-yt=\"data-4c-gallery-yt\" style=\"border:none\"") + "\u003E\u003C\u002Fiframe\u003E";
}
pug_html = pug_html + "\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var item = $$obj[pug_index0];

pug_html = pug_html + "\u003Cli data-4c-on=\"click: topLeftCorner.selectItem\" data-4c-class=\"hover: topLeftCorner.getItemIsPreselected\" data-4c-gallery-item=\"data-4c-gallery-item\"\u003E";

if (item.src) {

pug_html = pug_html + "\u003Cimg" + (pug_attr("src", item.src, true, false)) + "\u002F\u003E";
}

if (item.youtube_id) {

pug_html = pug_html + "\u003Ciframe" + (" width=\"100%\" height=\"100%\""+pug_attr("src", "//www.youtube.com/embed/" + item.youtube_id + "?enablejsapi=1", true, false)+" data-4c-gallery-yt=\"data-4c-gallery-yt\" style=\"border:none\"") + "\u003E\u003C\u002Fiframe\u003E";
}
pug_html = pug_html + "\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ful\u003E";

if (context.length > 1) {

pug_html = pug_html + "\u003Cdiv class=\"fc-gallery-controls fc-gallery-next\" data-4c-class=\"transparent: getNextControllerHidden\"\u003E";

pug_html = pug_html + "\u003Ca data-4c-on=\"click: topLeftCorner.selectNext, mouseover: topLeftCorner.preselectNext, mouseleave: topLeftCorner.clearPreselect\"\u003E";

pug_html = pug_html + "\u003Ci class=\"fa fa-angle-right\"\u003E\u003C\u002Fi\u003E\u003C\u002Fa\u003E\u003C\u002Fdiv\u003E";
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

pug_html = pug_html + "\u003Cdiv class=\"text-right\"\u003E";

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-close\" data-4c-on=\"click: topRightCorner.forceHide\" data-4c-class=\"visible: topRightCorner.visible\"\u003E";

pug_html = pug_html + "&times;\u003C\u002Fbutton\u003E\u003C\u002Fdiv\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-text\"\u003E";

pug_html = pug_html + "\u003Ch1\u003E";

pug_html = pug_html + "Links\u003C\u002Fh1\u003E";

pug_html = pug_html + "\u003Cul class=\"fa-ul\"\u003E";

// iterate links
;(function(){
  var $$obj = links;
  if ('number' == typeof $$obj.length) {
      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
        var item = $$obj[pug_index2];

pug_html = pug_html + "\u003Cli\u003E";

pug_html = pug_html + "\u003Ci" + (pug_attr("class", pug_classes(["fa","fa-li","fa-" + item.type], [false,false,true]), false, false)) + "\u003E\u003C\u002Fi\u003E";

pug_html = pug_html + "\u003Ca" + (" class=\"fc-image-a\""+pug_attr("href", item.url, true, false)) + "\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = item.title) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
      }
  } else {
    var $$l = 0;
    for (var pug_index2 in $$obj) {
      $$l++;
      var item = $$obj[pug_index2];

pug_html = pug_html + "\u003Cli\u003E";

pug_html = pug_html + "\u003Ci" + (pug_attr("class", pug_classes(["fa","fa-li","fa-" + item.type], [false,false,true]), false, false)) + "\u003E\u003C\u002Fi\u003E";

pug_html = pug_html + "\u003Ca" + (" class=\"fc-image-a\""+pug_attr("href", item.url, true, false)) + "\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = item.title) ? "" : pug_interp)) + "\u003C\u002Fa\u003E\u003C\u002Fli\u003E";
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Ful\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
}

if (backStory && backStory.text) {

pug_html = pug_html + "\u003Cdiv class=\"fc-content-container fc-content-bottom-left\" data-4c-class=\"visible: bottomLeftCorner.visible\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-body\"\u003E";

pug_html = pug_html + "\u003Cdiv class=\"text-right\"\u003E";

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-close\" data-4c-on=\"click: bottomLeftCorner.forceHide\" data-4c-class=\"visible: bottomLeftCorner.visible\"\u003E";

pug_html = pug_html + "&times;\u003C\u002Fbutton\u003E\u003C\u002Fdiv\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-text\"\u003E";

pug_html = pug_html + "\u003Ch1\u003E";

pug_html = pug_html + "Backstory\u003C\u002Fh1\u003E";

pug_html = pug_html + "\u003Cp\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = backStory.text) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";

pug_html = pug_html + "\u003Cp\u003E";

if (backStory.author) {

pug_html = pug_html + (pug_escape(null == (pug_interp = backStory.author + (backStory.publication || backStory.date ? ', ' : '')) ? "" : pug_interp));
}

if (backStory.publication) {

if (backStory.publicationUrl) {

pug_html = pug_html + "\u003Ca" + (" class=\"fc-image-a\""+pug_attr("href", backStory.publicationUrl, true, false)) + "\u003E";

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

pug_html = pug_html + "\u003Cdiv class=\"text-right\"\u003E";

pug_html = pug_html + "\u003Cbutton class=\"fc-btn fc-btn-close\" data-4c-on=\"click: bottomRightCorner.forceHide\" data-4c-class=\"visible: bottomRightCorner.visible\"\u003E";

pug_html = pug_html + "&times;\u003C\u002Fbutton\u003E\u003C\u002Fdiv\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-content-text\"\u003E";

pug_html = pug_html + "\u003Cp class=\"fc-content-copyright\"\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = creativeCommons.formattedCopyright) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";

if (creativeCommons.codeOfEthics) {

pug_html = pug_html + "\u003Cp class=\"fc-code-of-ethics\"\u003E";

pug_html = pug_html + "CODE OF ETHICS:  ";

pug_html = pug_html + (pug_escape(null == (pug_interp = creativeCommons.codeOfEthics) ? "" : pug_interp)) + "\u003C\u002Fp\u003E";
}

pug_html = pug_html + "\u003Cp\u003E";

pug_html = pug_html + (pug_escape(null == (pug_interp = creativeCommons.description) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";

pug_html = pug_html + "\u003Cdiv class=\"fc-footer\" data-4c-footer=\"data-4c-footer\"\u003E";

pug_html = pug_html + "Four Corners&nbsp;";

pug_html = pug_html + "\u003Ci class=\"fc-icon fc-icon-brand\"\u003E\u003C\u002Fi\u003E\u003C\u002Fdiv\u003E";}.call(this,"backStory" in locals_for_with?locals_for_with.backStory:typeof backStory!=="undefined"?backStory:undefined,"context" in locals_for_with?locals_for_with.context:typeof context!=="undefined"?context:undefined,"creativeCommons" in locals_for_with?locals_for_with.creativeCommons:typeof creativeCommons!=="undefined"?creativeCommons:undefined,"links" in locals_for_with?locals_for_with.links:typeof links!=="undefined"?links:undefined,"src" in locals_for_with?locals_for_with.src:typeof src!=="undefined"?src:undefined));return pug_html;}

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
    insertScript = require('./helpers/insert-script'),
    addEventListener = require("./helpers/add-event-listener"),
    removeEventListener = require("./helpers/remove-event-listener"),
    css = require('../scss/main.scss');

module.exports = function (imageData) {
    var wrapperDiv = document.createElement("div"),
        iframe = document.createElement("iframe"),
        parentNode = this.parentNode,
        imgDom = this;

    copyStyle(imgDom, wrapperDiv);
    styleWrapperDiv(wrapperDiv);
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
    insertScript("https://use.fontawesome.com/dcbd51b54b.js", iframeDocument);
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
            copyStyle(imgDom, wrapperDiv);
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

function styleWrapperDiv(div) {
    // To support image border-radius
    div.style.overflow = "hidden";
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
},{"../scss/main.scss":34,"./failed-image.pug":6,"./helpers/add-event-listener":9,"./helpers/copy-style":11,"./helpers/get-all-elements-with-attribute":12,"./helpers/insert-script":14,"./helpers/remove-event-listener":17,"./helpers/shorten-text":18,"./template.pug":29}],32:[function(require,module,exports){
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

},{"./amend-image-data":5,"./image-data-is-valid":20,"./image-model":21,"./set-main-controller":28,"./wrap-image":31}],33:[function(require,module,exports){
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
module.exports = "body {\n  margin: 0;\n  overflow: hidden; }\n\nul {\n  margin-top: 0; }\n\n.fc-image {\n  position: relative;\n  overflow: hidden;\n  height: auto; }\n  .fc-image * {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box; }\n  .fc-image > img {\n    display: block;\n    max-width: 100%; }\n\n.fc-corner-icon {\n  width: 50px;\n  height: 50px;\n  position: absolute;\n  bottom: 10px;\n  right: 10px;\n  border-right: 10px solid #fff;\n  border-bottom: 10px solid #fff;\n  opacity: .5;\n  -webkit-transition: opacity 0.2s linear, transform 0.1s linear;\n  -moz-transition: opacity 0.2s linear, transform 0.1s linear;\n  -ms-transition: opacity 0.2s linear, transform 0.1s linear;\n  -o-transition: opacity 0.2s linear, transform 0.1s linear;\n  transition: opacity 0.2s linear, transform 0.1s linear; }\n  .fc-corner-icon.hover,\n  .fc-image:hover .fc-corner-icon {\n    -webkit-transform: translate(20px, 20px);\n    -moz-transform: translate(20px, 20px);\n    -ms-transform: translate(20px, 20px);\n    transform: translate(20px, 20px);\n    opacity: 0; }\n\nbody {\n  font-size: 13px;\n  font-weight: 400;\n  line-height: 1.5;\n  -webkit-text-emphasis: initial;\n  -webkit-text-fill-color: initial;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif; }\n\nh1 {\n  font-size: 20px;\n  font-weight: 300;\n  margin: 0 0 0px 0; }\n\np {\n  margin: 0 0 10px; }\n\na {\n  color: #333;\n  -webkit-transition: opacity 0.1s linear;\n  -moz-transition: opacity 0.1s linear;\n  -ms-transition: opacity 0.1s linear;\n  -o-transition: opacity 0.1s linear;\n  transition: opacity 0.1s linear; }\n  a:hover, a:active, a:focus {\n    text-decoration: underline;\n    opacity: 0.8; }\n\n.fc-image {\n  color: #333; }\n\n.fc-footer {\n  text-align: right;\n  padding: 4px 0 4px 0; }\n\n.fc-icon {\n  vertical-align: middle;\n  display: inline-block;\n  height: 1em;\n  width: 1em; }\n  .fc-icon-brand {\n    background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNjQwIj48dGl0bGU+ZmMtaWNvbi0wMi0wMTwvdGl0bGU+PHJlY3QgeD0iLTEuNTQiIHdpZHRoPSI3MCIgaGVpZ2h0PSIyNjkuMyIvPjxyZWN0IHk9IjM3MC43IiB3aWR0aD0iNzAiIGhlaWdodD0iMjY5LjMiLz48cmVjdCB4PSI1NjkuODUiIHdpZHRoPSI3MCIgaGVpZ2h0PSIyNjkuMyIvPjxyZWN0IHg9Ijk3LjY1IiB5PSItOTkuNjUiIHdpZHRoPSI3MCIgaGVpZ2h0PSIyNjkuMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTY3LjY1IC05Ny42NSkgcm90YXRlKDkwKSIvPjxyZWN0IHg9Ijk4LjExIiB5PSI0NzAuMzUiIHdpZHRoPSI3MCIgaGVpZ2h0PSIyNjkuMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzM4LjExIDQ3MS44OSkgcm90YXRlKDkwKSIvPjxyZWN0IHg9IjQ3MC4zNSIgeT0iLTk5LjY1IiB3aWR0aD0iNzAiIGhlaWdodD0iMjY5LjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDU0MC4zNSAtNDcwLjM1KSByb3RhdGUoOTApIi8+PHJlY3QgeD0iNTY5Ljg1IiB5PSIzNzAuNyIgd2lkdGg9IjcwLjAyIiBoZWlnaHQ9IjI2OS4zIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjA5LjcyIDEwMTAuNykgcm90YXRlKDE4MCkiIHN0eWxlPSJmaWxsOiMyZmJkZWMiLz48cmVjdCB4PSI0NzAuMzUiIHk9IjQ3MC4zNSIgd2lkdGg9IjcwIiBoZWlnaHQ9IjI2OS4zIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtOTkuNjUgMTExMC4zNSkgcm90YXRlKC05MCkiIHN0eWxlPSJmaWxsOiMyZmJkZWMiLz48L3N2Zz4=); }\n  .fc-icon-context {\n    background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48dGl0bGU+ZmMtaWNvbi1jb250ZXh0PC90aXRsZT48cGF0aCBkPSJNMTAuMjYsNzB2NjBILTE1LjFWNzBIMTAuMjZtMTAtMTBILTI1LjF2ODBIMjAuMjZWNjBoMFoiLz48cGF0aCBkPSJNMjE1LjE2LDY5Ljk0djYwLjEySDE4OS42OFY2OS45NGgyNS40OE0yMjUuMSw2MEgxNzkuNzR2ODBIMjI1LjFWNjBoMFoiLz48cGF0aCBkPSJNMTU4Ljc0LDU3djg2SDQxLjI4VjU3SDE1OC43NG0xMi0xMkgyOS4yOFYxNTVIMTcwLjc0VjQ1aDBaIi8+PGNpcmNsZSBjeD0iNjUuNjkiIGN5PSI4My4wMyIgcj0iMTEuMTgiLz48cG9seWdvbiBwb2ludHM9IjU0LjUxIDEzMyAxNDUuNTEgMTMzIDEzMy4xOCA5Mi4zMyAxMjQuNjggOTUuMzMgMTE2LjAxIDgwLjE3IDkwLjM0IDExNi4zMyA3Ni42IDEwOC44MyA1NC41MSAxMzMiLz48L3N2Zz4=); }\n  .fc-icon-info {\n    background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTIgMTUyIj48dGl0bGU+ZmMtaWNvbi1pbmZvPC90aXRsZT48Y2lyY2xlIGN4PSI3NiIgY3k9Ijc2IiByPSI3MCIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MTJweCIvPjxwYXRoIGQ9Ik0xMDguNSwxMzguNTJjLTAuMTUsMS43Ni0uMywzLjYxLTAuNDgsNS40NmEwLjg0LDAuODQsMCwwLDEtLjM0LjUzYy00LjkyLDMuMzctMTAuMjMsNS41OC0xNi4zMSw1LjQxYTEyLDEyLDAsMCwxLTcuODItMi44NCwxMS42NCwxMS42NCwwLDAsMS0zLjc5LTguMzksMzIsMzIsMCwwLDEsMi45My0xNC43NmMyLTQuNzcsNC4yNy05LjQ0LDYuMzUtMTQuMTlBNTUuNDcsNTUuNDcsMCwwLDAsOTMsOTcuNGExOC4wNywxOC4wNywwLDAsMCwuMDctNy4xYy0wLjctMy4yNy0zLTQuOTEtNi4yOC00LjUtMS4yNS4xNi0yLjQ2LDAuNTMtMy42OSwwLjgxYTIuOTMsMi45MywwLDAsMC0uNjcuMmMwLjEtMS4xMS4xOS0yLjEzLDAuMjgtMy4xNmExLjkxLDEuOTEsMCwwLDAsMC0uMzdjLTAuMTgtMS41Ny42OC0yLjQ0LDEuOTItMy4yNWEzMC4yNSwzMC4yNSwwLDAsMSwxMS45Mi01LDE1LjI0LDE1LjI0LDAsMCwxLDguNTQsMSwxMC4zNSwxMC4zNSwwLDAsMSw2LjQ0LDguNDcsMzAuMjQsMzAuMjQsMCwwLDEtMSwxMS45NGMtMS43NCw3LjA2LTQuNiwxMy43MS03LjU4LDIwLjMyLTEuNDgsMy4zLTMuMjIsNi40OS00LjE2LDEwYTE5LjU3LDE5LjU3LDAsMCwwLS44Niw3LjEyYzAuMzMsMy4xOSwyLjM1LDUuMTcsNS41NCw1LjE2QTQ3LjMxLDQ3LjMxLDAsMCwwLDEwOC41LDEzOC41MloiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yNCAtMjQpIi8+PHBhdGggZD0iTTExNS40OSw1NS44M0E5Ljc2LDkuNzYsMCwxLDEsMTA1Ljc2LDQ2aDBhOS43MSw5LjcxLDAsMCwxLDkuNyw5LjcydjAuMDdaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjQgLTI0KSIvPjwvc3ZnPg==); }\n  .fc-icon-links {\n    background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMzYuMzQgMTM2LjM2Ij48dGl0bGU+ZmMtaWNvbi1saW5rczwvdGl0bGU+PHBhdGggZD0iTTg4LjI2LDUyLjlsNy4xNiw3LjE2YTIxLjE5LDIxLjE5LDAsMCwxLDAsMjkuODhMNTQuNTksMTMwLjc3YTIxLjE5LDIxLjE5LDAsMCwxLTI5Ljg4LDBsLTUuNDctNS40N2EyMS4xOSwyMS4xOSwwLDAsMSwwLTI5Ljg4TDMwLjgyLDgzLjg0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNi44MyAtNi44MikiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOjEyLjQ5NjAwMDI4OTkxNjk5MnB4Ii8+PHBhdGggZD0iTTYxLjc0LDk3LjFsLTcuMTYtNy4xNmEyMS4xOSwyMS4xOSwwLDAsMSwwLTI5Ljg4TDk1LjQxLDE5LjIzYTIxLjE5LDIxLjE5LDAsMCwxLDI5Ljg4LDBsNS40Nyw1LjQ3YTIxLjE5LDIxLjE5LDAsMCwxLDAsMjkuODhMMTE5LjE5LDY2LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNi44MyAtNi44MikiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOjEyLjQ5NjAwMDI4OTkxNjk5MnB4Ii8+PC9zdmc+); }\n  .fc-icon-copyright {\n    background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTIgMTUyIj48dGl0bGU+ZmMtaWNvbi1jb3B5cmlnaHQ8L3RpdGxlPjxjaXJjbGUgY3g9Ijc2IiBjeT0iNzYiIHI9IjcwIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDoxMnB4Ii8+PHBhdGggZD0iTTExOC4zNyw4Mi41M2ExNi43NCwxNi43NCwwLDAsMC02LjE3LTQuNjksMjAuNTMsMjAuNTMsMCwwLDAtOC40Ni0xLjY0LDIxLjE3LDIxLjE3LDAsMCwwLTE2LDcsMjQuMTcsMjQuMTcsMCwwLDAtNC43NCw4LDMwLjE3LDMwLjE3LDAsMCwwLDAsMTkuOTIsMjQuNzksMjQuNzksMCwwLDAsNC42NCw3Ljg2LDIxLDIxLDAsMCwwLDYuOTMsNS4xOSwyMCwyMCwwLDAsMCw4LjU3LDEuODYsMTkuMiwxOS4yLDAsMCwwLDkuMjgtMi4xOCwxOC40OCwxOC40OCwwLDAsMCw2LjY2LTYuMTFsMTQuMTksMTAuNTlhMjkuNTUsMjkuNTUsMCwwLDEtMTIuNDUsMTAuMTUsMzguNTIsMzguNTIsMCwwLDEtMTUuNSwzLjI4LDQ3LjYyLDQ3LjYyLDAsMCwxLTE2LjctMi44NCwzOC4yLDM4LjIsMCwwLDEtMTMuMjEtOC4xMywzNi44NywzNi44NywwLDAsMS04LjY4LTEyLjgzLDQzLjY2LDQzLjY2LDAsMCwxLTMuMTEtMTYuODFBNDMuNjYsNDMuNjYsMCwwLDEsNjYuNzMsODQuM2EzNi44OCwzNi44OCwwLDAsMSw4LjY4LTEyLjgzLDM4LjI2LDM4LjI2LDAsMCwxLDEzLjIxLTguMTMsNDcuNjIsNDcuNjIsMCwwLDEsMTYuNy0yLjg0LDQxLDQxLDAsMCwxLDYuODIuNiwzNi45MywzNi45MywwLDAsMSw3LDEuOTEsMzEuMjEsMzEuMjEsMCwwLDEsNi42MSwzLjQ5LDI2LjMzLDI2LjMzLDAsMCwxLDUuNjgsNS4zNVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yNCAtMjQpIi8+PC9zdmc+); }\n\n.text-right {\n  text-align: right; }\n\n.fc-content {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 100%; }\n  .fc-content-container {\n    position: absolute;\n    width: 100%;\n    max-width: 260px;\n    max-height: 100%;\n    opacity: 0;\n    color: #333;\n    overflow-y: auto;\n    overflow-x: hidden;\n    background: rgba(255, 255, 255, 0.8);\n    border: 1px solid #dedede;\n    -webkit-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    -ms-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .fc-content-container.visible, .fc-content-container.pinned {\n      opacity: 1;\n      z-index: 2; }\n  .fc-content-body {\n    height: 100%;\n    width: 100%;\n    position: relative; }\n  .fc-content-text {\n    padding: 0px 15px 15px 10px;\n    position: relative;\n    z-index: 2;\n    text-align: left;\n    word-wrap: break-word; }\n  .fc-content-fill {\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    max-width: 100%; }\n  .fc-content-top-right {\n    top: 0;\n    right: 0; }\n  .fc-content-bottom-left {\n    bottom: 0;\n    left: 0; }\n  .fc-content-bottom-right {\n    bottom: 0;\n    right: 0; }\n  .fc-content-copyright {\n    display: inline-block; }\n\n.fc-tools {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 1;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-transform: scale(1.5);\n  -moz-transform: scale(1.5);\n  -ms-transform: scale(1.5);\n  transform: scale(1.5);\n  opacity: 0;\n  -webkit-transition: opacity 0.3s linear, transform 0.2s linear;\n  -moz-transition: opacity 0.3s linear, transform 0.2s linear;\n  -ms-transition: opacity 0.3s linear, transform 0.2s linear;\n  -o-transition: opacity 0.3s linear, transform 0.2s linear;\n  transition: opacity 0.3s linear, transform 0.2s linear; }\n  .fc-tools:hover {\n    -webkit-transform: scale(1);\n    -moz-transform: scale(1);\n    -ms-transform: scale(1);\n    transform: scale(1);\n    opacity: 1; }\n  .touch-screen .fc-tools {\n    -webkit-transform: scale(1);\n    -moz-transform: scale(1);\n    -ms-transform: scale(1);\n    transform: scale(1);\n    opacity: 1; }\n  .fc-tools.collapsed {\n    -webkit-transform: scale(1.5);\n    -moz-transform: scale(1.5);\n    -ms-transform: scale(1.5);\n    transform: scale(1.5);\n    opacity: 0; }\n\n.fc-btn {\n  display: inline-block;\n  margin: 0;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: middle;\n  color: #333;\n  background: #fff;\n  border: 1px solid #dedede;\n  border-radius: 50%;\n  font-size: 22px;\n  height: 35px;\n  width: 35px;\n  opacity: 0.8;\n  outline: none;\n  padding: 0;\n  -webkit-transition: opacity 0.1s linear;\n  -moz-transition: opacity 0.1s linear;\n  -ms-transition: opacity 0.1s linear;\n  -o-transition: opacity 0.1s linear;\n  transition: opacity 0.1s linear; }\n  .fc-btn:hover, .fc-btn:active, .fc-btn:focus {\n    opacity: 1; }\n  .fc-btn-corner {\n    z-index: 2;\n    position: absolute; }\n  .fc-btn-top-left {\n    top: 10px;\n    left: 10px; }\n  .fc-btn-top-right {\n    top: 10px;\n    right: 10px; }\n  .fc-btn-bottom-left {\n    bottom: 10px;\n    left: 10px; }\n  .fc-btn-bottom-right {\n    bottom: 10px;\n    right: 10px; }\n  .fc-btn-close {\n    z-index: 2;\n    border: none;\n    background: transparent;\n    font-size: 30px;\n    padding: 0 0 5px;\n    line-height: 1em; }\n\n.fc-tools {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 1;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-transform: scale(1.5);\n  -moz-transform: scale(1.5);\n  -ms-transform: scale(1.5);\n  transform: scale(1.5);\n  opacity: 0;\n  -webkit-transition: opacity 0.3s linear, transform 0.2s linear;\n  -moz-transition: opacity 0.3s linear, transform 0.2s linear;\n  -ms-transition: opacity 0.3s linear, transform 0.2s linear;\n  -o-transition: opacity 0.3s linear, transform 0.2s linear;\n  transition: opacity 0.3s linear, transform 0.2s linear; }\n  .fc-tools:hover {\n    -webkit-transform: scale(1);\n    -moz-transform: scale(1);\n    -ms-transform: scale(1);\n    transform: scale(1);\n    opacity: 1; }\n  .touch-screen .fc-tools {\n    -webkit-transform: scale(1);\n    -moz-transform: scale(1);\n    -ms-transform: scale(1);\n    transform: scale(1);\n    opacity: 1; }\n  .fc-tools.collapsed {\n    -webkit-transform: scale(1.5);\n    -moz-transform: scale(1.5);\n    -ms-transform: scale(1.5);\n    transform: scale(1.5);\n    opacity: 0; }\n\n.fc-btn {\n  display: inline-block;\n  margin: 0;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: middle;\n  color: #333;\n  background: #fff;\n  border: 1px solid #dedede;\n  border-radius: 50%;\n  font-size: 22px;\n  height: 35px;\n  width: 35px;\n  opacity: 0.8;\n  outline: none;\n  padding: 0;\n  -webkit-transition: opacity 0.1s linear;\n  -moz-transition: opacity 0.1s linear;\n  -ms-transition: opacity 0.1s linear;\n  -o-transition: opacity 0.1s linear;\n  transition: opacity 0.1s linear; }\n  .fc-btn:hover, .fc-btn:active, .fc-btn:focus {\n    opacity: 1; }\n  .fc-btn-corner {\n    z-index: 2;\n    position: absolute; }\n  .fc-btn-top-left {\n    top: 10px;\n    left: 10px; }\n  .fc-btn-top-right {\n    top: 10px;\n    right: 10px; }\n  .fc-btn-bottom-left {\n    bottom: 10px;\n    left: 10px; }\n  .fc-btn-bottom-right {\n    bottom: 10px;\n    right: 10px; }\n  .fc-btn-close {\n    z-index: 2;\n    border: none;\n    background: transparent;\n    font-size: 30px;\n    padding: 0 0 5px;\n    line-height: 1em; }\n\n.fc-gallery {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow: hidden; }\n  .fc-gallery-failed-image {\n    width: 100%;\n    height: 100%;\n    background: #000;\n    position: relative;\n    display: table; }\n    .fc-gallery-failed-image-caption {\n      display: table-cell;\n      vertical-align: middle;\n      font-size: 16px;\n      white-space: normal;\n      padding: 10px; }\n  .fc-gallery ul {\n    position: relative;\n    width: 100%;\n    height: 100%;\n    white-space: nowrap;\n    display: block;\n    margin: 0;\n    padding: 0;\n    -webkit-transform: scale(0.8);\n    -moz-transform: scale(0.8);\n    -ms-transform: scale(0.8);\n    transform: scale(0.8);\n    -webkit-transition: margin-left 0.15s linear;\n    -moz-transition: margin-left 0.15s linear;\n    -ms-transition: margin-left 0.15s linear;\n    -o-transition: margin-left 0.15s linear;\n    transition: margin-left 0.15s linear; }\n    .fc-gallery ul li {\n      display: inline-block;\n      vertical-align: middle;\n      cursor: pointer;\n      width: 100%;\n      height: 100%;\n      text-align: center; }\n      .fc-gallery ul li img,\n      .fc-gallery ul li iframe,\n      .fc-gallery ul li .fc-gallery-failed-image {\n        vertical-align: middle;\n        opacity: 0.7;\n        -webkit-transform: scale(0.9);\n        -moz-transform: scale(0.9);\n        -ms-transform: scale(0.9);\n        transform: scale(0.9);\n        -webkit-transition: transform 0.15s linear, opacity 0.15s linear;\n        -moz-transition: transform 0.15s linear, opacity 0.15s linear;\n        -ms-transition: transform 0.15s linear, opacity 0.15s linear;\n        -o-transition: transform 0.15s linear, opacity 0.15s linear;\n        transition: transform 0.15s linear, opacity 0.15s linear; }\n      .fc-gallery ul li img {\n        max-width: 100%;\n        max-height: 100%; }\n      .fc-gallery ul li.hover img,\n      .fc-gallery ul li.hover iframe,\n      .fc-gallery ul li.hover .fc-gallery-failed-image, .fc-gallery ul li:hover img,\n      .fc-gallery ul li:hover iframe,\n      .fc-gallery ul li:hover .fc-gallery-failed-image {\n        opacity: 0.85;\n        -webkit-transform: scale(0.92);\n        -moz-transform: scale(0.92);\n        -ms-transform: scale(0.92);\n        transform: scale(0.92); }\n      .fc-gallery ul li.hover .fc-gallery-failed-image, .fc-gallery ul li:hover .fc-gallery-failed-image {\n        opacity: 0.7; }\n      .fc-gallery ul li.selected {\n        cursor: default; }\n        .fc-gallery ul li.selected img,\n        .fc-gallery ul li.selected iframe,\n        .fc-gallery ul li.selected .fc-gallery-failed-image {\n          opacity: 1;\n          -webkit-transform: scale(1);\n          -moz-transform: scale(1);\n          -ms-transform: scale(1);\n          transform: scale(1); }\n      .fc-gallery ul li.selected .fc-gallery-failed-image {\n        opacity: 0.7; }\n  .fc-gallery.expanded ul li img,\n  .fc-gallery.expanded ul li iframe {\n    -webkit-transform: scale(1.25);\n    -moz-transform: scale(1.25);\n    -ms-transform: scale(1.25);\n    transform: scale(1.25); }\n  .fc-gallery-caption {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    text-align: center;\n    padding: 5px;\n    font-size: 12px;\n    width: 100%;\n    display: none;\n    -webkit-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    -ms-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .fc-gallery-caption.visible {\n      display: block; }\n    .fc-gallery-caption-background {\n      width: 100%;\n      height: 100%;\n      position: absolute;\n      top: 0;\n      left: 0;\n      background: #fff;\n      opacity: 0.4; }\n    .fc-gallery-caption-text {\n      position: relative;\n      height: 100%;\n      width: 100%; }\n  .fc-gallery-controls {\n    background: transparent;\n    height: 100%;\n    width: 40px;\n    position: absolute;\n    top: 0;\n    z-index: 1;\n    opacity: 0.5;\n    -webkit-transition: opacity 0.15s linear;\n    -moz-transition: opacity 0.15s linear;\n    -ms-transition: opacity 0.15s linear;\n    -o-transition: opacity 0.15s linear;\n    transition: opacity 0.15s linear; }\n    .fc-gallery-controls.transparent {\n      opacity: 0; }\n    .fc-gallery-controls a {\n      display: block;\n      cursor: pointer;\n      width: 100%;\n      height: 100%;\n      color: #333; }\n      .fc-gallery-controls a:hover, .fc-gallery-controls a:active, .fc-gallery-controls a:focus {\n        color: black; }\n      .fc-gallery-controls a i {\n        position: absolute;\n        top: 50%;\n        left: 5px;\n        margin-top: -35px;\n        font-size: 70px; }\n  .fc-gallery-prev {\n    left: 0; }\n  .fc-gallery-next {\n    right: 0; }\n  .fc-gallery-close {\n    display: none;\n    top: 0;\n    right: 0; }\n    .fc-gallery-close.visible {\n      display: inline-block; }\n\n.fc-image .fc-code-of-ethics {\n  border: 1px solid #36bcea;\n  background: #fff;\n  padding: 5px 10px; }\n  .fc-image .fc-code-of-ethics.visible {\n    display: block; }\n  .fc-image .fc-code-of-ethics-show {\n    text-decoration: none;\n    border-bottom: 1px dashed;\n    cursor: pointer;\n    -webkit-transition: color 0.1s linear;\n    -moz-transition: color 0.1s linear;\n    -ms-transition: color 0.1s linear;\n    -o-transition: color 0.1s linear;\n    transition: color 0.1s linear; }\n    .fc-image .fc-code-of-ethics-show.fc-image-a {\n      text-decoration: none; }\n\n/*# sourceMappingURL=main.scss.map */";
},{}]},{},[22])(22)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2hhbW1lcmpzL2hhbW1lci5qcyIsIm5vZGVfbW9kdWxlcy9wdWctcnVudGltZS9pbmRleC5qcyIsInNyYy9qcy9hbWVuZC1pbWFnZS1kYXRhLmpzIiwiL1VzZXJzL2IwOTE1MjE4L1B5Y2hhcm1Qcm9qZWN0cy80Q29ybmVycy1wcm9qZWN0cy9mb3VyY29ybmVycy9zcmMvanMvZmFpbGVkLWltYWdlLnB1ZyIsInNyYy9qcy9nZXQtaW1hZ2UtZGF0YS5qcyIsInNyYy9qcy9oZWxwZXJzL2FkZC1jbGFzcy5qcyIsInNyYy9qcy9oZWxwZXJzL2FkZC1ldmVudC1saXN0ZW5lci5qcyIsInNyYy9qcy9oZWxwZXJzL2FkZC1zd2lwZS1ldmVudHMuanMiLCJzcmMvanMvaGVscGVycy9jb3B5LXN0eWxlLmpzIiwic3JjL2pzL2hlbHBlcnMvZ2V0LWFsbC1lbGVtZW50cy13aXRoLWF0dHJpYnV0ZS5qcyIsInNyYy9qcy9oZWxwZXJzL2dldC1lbGVtZW50LXN0eWxlLmpzIiwic3JjL2pzL2hlbHBlcnMvaW5zZXJ0LXNjcmlwdC5qcyIsInNyYy9qcy9oZWxwZXJzL2lzLXRvdWNoLXNjcmVlbi5qcyIsInNyYy9qcy9oZWxwZXJzL3JlbW92ZS1jbGFzcy5qcyIsInNyYy9qcy9oZWxwZXJzL3JlbW92ZS1ldmVudC1saXN0ZW5lci5qcyIsInNyYy9qcy9oZWxwZXJzL3Nob3J0ZW4tdGV4dC5qcyIsInNyYy9qcy9oZWxwZXJzL3htbC10by1qc29uLmpzIiwic3JjL2pzL2ltYWdlLWRhdGEtaXMtdmFsaWQuanMiLCJzcmMvanMvaW1hZ2UtbW9kZWwuanMiLCJzcmMvanMvaW5kZXgtbnBtLmpzIiwic3JjL2pzL3BvbHlmaWxscy9hZGQtZXZlbnQtbGlzdGVuZXIuanMiLCJzcmMvanMvcG9seWZpbGxzL2ZpbHRlci5qcyIsInNyYy9qcy9wb2x5ZmlsbHMvZm9yLWVhY2guanMiLCJzcmMvanMvcG9seWZpbGxzL2luZGV4LmpzIiwic3JjL2pzL3BvbHlmaWxscy9tYXAuanMiLCJzcmMvanMvc2V0LW1haW4tY29udHJvbGxlci5qcyIsIi9Vc2Vycy9iMDkxNTIxOC9QeWNoYXJtUHJvamVjdHMvNENvcm5lcnMtcHJvamVjdHMvZm91cmNvcm5lcnMvc3JjL2pzL3RlbXBsYXRlLnB1ZyIsInNyYy9qcy93cmFwLWFsbC1pbWctZWxlbWVudHMtb24tcGFnZS5qcyIsInNyYy9qcy93cmFwLWltYWdlLmpzIiwic3JjL2pzL3dyYXAtaW1nLWVsZW1lbnQtd2l0aC1qc29uLmpzIiwic3JjL2pzL3dyYXAtaW1nLWVsZW1lbnQuanMiLCJzcmMvc2Nzcy9tYWluLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25sRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUN0RkE7O0FBQ0E7O0FBQ0E7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQUE7O0FBQUE7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDMU9BOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7QUFDQTs7QUFDQTs7QUFDQTs7O0FBQ0E7O0FBQ0E7O0FBQ0E7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7OztBQUNBOztBQUNBOzs7Ozs7O0FBQ0E7O0FBR0E7O0FBQ0E7OztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBTkE7O0FBR0E7O0FBQ0E7OztBQUNBOztBQUNBOzs7Ozs7Ozs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7O0FBQ0E7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBOzs7Ozs7Ozs7QUFMQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBOzs7Ozs7OztBQUNBOztBQUNBOzs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFBQTs7QUFDQTs7QUFDQTs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUFBOzs7Ozs7OztBQUZBOztBQUNBOztBQUNBOztBQUFBOzs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUFBOztBQUNBOztBQUFBOztBQUNBOztBQUNBOztBQUNBOzs7QUFDQTs7QUFDQTs7QUFDQTs7QUFBQTs7OztBQUVBOzs7QUFDQTs7O0FBQ0E7O0FBQ0E7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQUE7OztBQUNBOztBQUFBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7OztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIiLCIvKiEgSGFtbWVyLkpTIC0gdjIuMC43IC0gMjAxNi0wNC0yMlxuICogaHR0cDovL2hhbW1lcmpzLmdpdGh1Yi5pby9cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgSm9yaWsgVGFuZ2VsZGVyO1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgZXhwb3J0TmFtZSwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxudmFyIFZFTkRPUl9QUkVGSVhFUyA9IFsnJywgJ3dlYmtpdCcsICdNb3onLCAnTVMnLCAnbXMnLCAnbyddO1xudmFyIFRFU1RfRUxFTUVOVCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG52YXIgVFlQRV9GVU5DVElPTiA9ICdmdW5jdGlvbic7XG5cbnZhciByb3VuZCA9IE1hdGgucm91bmQ7XG52YXIgYWJzID0gTWF0aC5hYnM7XG52YXIgbm93ID0gRGF0ZS5ub3c7XG5cbi8qKlxuICogc2V0IGEgdGltZW91dCB3aXRoIGEgZ2l2ZW4gc2NvcGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZW91dFxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIHNldFRpbWVvdXRDb250ZXh0KGZuLCB0aW1lb3V0LCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoYmluZEZuKGZuLCBjb250ZXh0KSwgdGltZW91dCk7XG59XG5cbi8qKlxuICogaWYgdGhlIGFyZ3VtZW50IGlzIGFuIGFycmF5LCB3ZSB3YW50IHRvIGV4ZWN1dGUgdGhlIGZuIG9uIGVhY2ggZW50cnlcbiAqIGlmIGl0IGFpbnQgYW4gYXJyYXkgd2UgZG9uJ3Qgd2FudCB0byBkbyBhIHRoaW5nLlxuICogdGhpcyBpcyB1c2VkIGJ5IGFsbCB0aGUgbWV0aG9kcyB0aGF0IGFjY2VwdCBhIHNpbmdsZSBhbmQgYXJyYXkgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp8QXJyYXl9IGFyZ1xuICogQHBhcmFtIHtTdHJpbmd9IGZuXG4gKiBAcGFyYW0ge09iamVjdH0gW2NvbnRleHRdXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaW52b2tlQXJyYXlBcmcoYXJnLCBmbiwgY29udGV4dCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcbiAgICAgICAgZWFjaChhcmcsIGNvbnRleHRbZm5dLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiB3YWxrIG9iamVjdHMgYW5kIGFycmF5c1xuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKi9cbmZ1bmN0aW9uIGVhY2gob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciBpO1xuXG4gICAgaWYgKCFvYmopIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChvYmouZm9yRWFjaCkge1xuICAgICAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmIChvYmoubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgb2JqLmxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaik7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgaW4gb2JqKSB7XG4gICAgICAgICAgICBvYmouaGFzT3duUHJvcGVydHkoaSkgJiYgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogd3JhcCBhIG1ldGhvZCB3aXRoIGEgZGVwcmVjYXRpb24gd2FybmluZyBhbmQgc3RhY2sgdHJhY2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uIHdyYXBwaW5nIHRoZSBzdXBwbGllZCBtZXRob2QuXG4gKi9cbmZ1bmN0aW9uIGRlcHJlY2F0ZShtZXRob2QsIG5hbWUsIG1lc3NhZ2UpIHtcbiAgICB2YXIgZGVwcmVjYXRpb25NZXNzYWdlID0gJ0RFUFJFQ0FURUQgTUVUSE9EOiAnICsgbmFtZSArICdcXG4nICsgbWVzc2FnZSArICcgQVQgXFxuJztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlID0gbmV3IEVycm9yKCdnZXQtc3RhY2stdHJhY2UnKTtcbiAgICAgICAgdmFyIHN0YWNrID0gZSAmJiBlLnN0YWNrID8gZS5zdGFjay5yZXBsYWNlKC9eW15cXChdKz9bXFxuJF0vZ20sICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL15cXHMrYXRcXHMrL2dtLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eT2JqZWN0Ljxhbm9ueW1vdXM+XFxzKlxcKC9nbSwgJ3thbm9ueW1vdXN9KClAJykgOiAnVW5rbm93biBTdGFjayBUcmFjZSc7XG5cbiAgICAgICAgdmFyIGxvZyA9IHdpbmRvdy5jb25zb2xlICYmICh3aW5kb3cuY29uc29sZS53YXJuIHx8IHdpbmRvdy5jb25zb2xlLmxvZyk7XG4gICAgICAgIGlmIChsb2cpIHtcbiAgICAgICAgICAgIGxvZy5jYWxsKHdpbmRvdy5jb25zb2xlLCBkZXByZWNhdGlvbk1lc3NhZ2UsIHN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBleHRlbmQgb2JqZWN0LlxuICogbWVhbnMgdGhhdCBwcm9wZXJ0aWVzIGluIGRlc3Qgd2lsbCBiZSBvdmVyd3JpdHRlbiBieSB0aGUgb25lcyBpbiBzcmMuXG4gKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0XG4gKiBAcGFyYW0gey4uLk9iamVjdH0gb2JqZWN0c190b19hc3NpZ25cbiAqIEByZXR1cm5zIHtPYmplY3R9IHRhcmdldFxuICovXG52YXIgYXNzaWduO1xuaWYgKHR5cGVvZiBPYmplY3QuYXNzaWduICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgYXNzaWduID0gZnVuY3Rpb24gYXNzaWduKHRhcmdldCkge1xuICAgICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvdXRwdXQgPSBPYmplY3QodGFyZ2V0KTtcbiAgICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKHNvdXJjZSAhPT0gdW5kZWZpbmVkICYmIHNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5leHRLZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkobmV4dEtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFtuZXh0S2V5XSA9IHNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH07XG59IGVsc2Uge1xuICAgIGFzc2lnbiA9IE9iamVjdC5hc3NpZ247XG59XG5cbi8qKlxuICogZXh0ZW5kIG9iamVjdC5cbiAqIG1lYW5zIHRoYXQgcHJvcGVydGllcyBpbiBkZXN0IHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgdGhlIG9uZXMgaW4gc3JjLlxuICogQHBhcmFtIHtPYmplY3R9IGRlc3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBzcmNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW21lcmdlPWZhbHNlXVxuICogQHJldHVybnMge09iamVjdH0gZGVzdFxuICovXG52YXIgZXh0ZW5kID0gZGVwcmVjYXRlKGZ1bmN0aW9uIGV4dGVuZChkZXN0LCBzcmMsIG1lcmdlKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhzcmMpO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IGtleXMubGVuZ3RoKSB7XG4gICAgICAgIGlmICghbWVyZ2UgfHwgKG1lcmdlICYmIGRlc3Rba2V5c1tpXV0gPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIGRlc3Rba2V5c1tpXV0gPSBzcmNba2V5c1tpXV07XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICByZXR1cm4gZGVzdDtcbn0sICdleHRlbmQnLCAnVXNlIGBhc3NpZ25gLicpO1xuXG4vKipcbiAqIG1lcmdlIHRoZSB2YWx1ZXMgZnJvbSBzcmMgaW4gdGhlIGRlc3QuXG4gKiBtZWFucyB0aGF0IHByb3BlcnRpZXMgdGhhdCBleGlzdCBpbiBkZXN0IHdpbGwgbm90IGJlIG92ZXJ3cml0dGVuIGJ5IHNyY1xuICogQHBhcmFtIHtPYmplY3R9IGRlc3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBzcmNcbiAqIEByZXR1cm5zIHtPYmplY3R9IGRlc3RcbiAqL1xudmFyIG1lcmdlID0gZGVwcmVjYXRlKGZ1bmN0aW9uIG1lcmdlKGRlc3QsIHNyYykge1xuICAgIHJldHVybiBleHRlbmQoZGVzdCwgc3JjLCB0cnVlKTtcbn0sICdtZXJnZScsICdVc2UgYGFzc2lnbmAuJyk7XG5cbi8qKlxuICogc2ltcGxlIGNsYXNzIGluaGVyaXRhbmNlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjaGlsZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gYmFzZVxuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzXVxuICovXG5mdW5jdGlvbiBpbmhlcml0KGNoaWxkLCBiYXNlLCBwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIGJhc2VQID0gYmFzZS5wcm90b3R5cGUsXG4gICAgICAgIGNoaWxkUDtcblxuICAgIGNoaWxkUCA9IGNoaWxkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoYmFzZVApO1xuICAgIGNoaWxkUC5jb25zdHJ1Y3RvciA9IGNoaWxkO1xuICAgIGNoaWxkUC5fc3VwZXIgPSBiYXNlUDtcblxuICAgIGlmIChwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGFzc2lnbihjaGlsZFAsIHByb3BlcnRpZXMpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBzaW1wbGUgZnVuY3Rpb24gYmluZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGJpbmRGbihmbiwgY29udGV4dCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBib3VuZEZuKCkge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIGxldCBhIGJvb2xlYW4gdmFsdWUgYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgbXVzdCByZXR1cm4gYSBib29sZWFuXG4gKiB0aGlzIGZpcnN0IGl0ZW0gaW4gYXJncyB3aWxsIGJlIHVzZWQgYXMgdGhlIGNvbnRleHRcbiAqIEBwYXJhbSB7Qm9vbGVhbnxGdW5jdGlvbn0gdmFsXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJnc11cbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICovXG5mdW5jdGlvbiBib29sT3JGbih2YWwsIGFyZ3MpIHtcbiAgICBpZiAodHlwZW9mIHZhbCA9PSBUWVBFX0ZVTkNUSU9OKSB7XG4gICAgICAgIHJldHVybiB2YWwuYXBwbHkoYXJncyA/IGFyZ3NbMF0gfHwgdW5kZWZpbmVkIDogdW5kZWZpbmVkLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbn1cblxuLyoqXG4gKiB1c2UgdGhlIHZhbDIgd2hlbiB2YWwxIGlzIHVuZGVmaW5lZFxuICogQHBhcmFtIHsqfSB2YWwxXG4gKiBAcGFyYW0geyp9IHZhbDJcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBpZlVuZGVmaW5lZCh2YWwxLCB2YWwyKSB7XG4gICAgcmV0dXJuICh2YWwxID09PSB1bmRlZmluZWQpID8gdmFsMiA6IHZhbDE7XG59XG5cbi8qKlxuICogYWRkRXZlbnRMaXN0ZW5lciB3aXRoIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlXG4gKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSB0YXJnZXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICovXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyh0YXJnZXQsIHR5cGVzLCBoYW5kbGVyKSB7XG4gICAgZWFjaChzcGxpdFN0cih0eXBlcyksIGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIHJlbW92ZUV2ZW50TGlzdGVuZXIgd2l0aCBtdWx0aXBsZSBldmVudHMgYXQgb25jZVxuICogQHBhcmFtIHtFdmVudFRhcmdldH0gdGFyZ2V0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZXNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGFyZ2V0LCB0eXBlcywgaGFuZGxlcikge1xuICAgIGVhY2goc3BsaXRTdHIodHlwZXMpLCBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBmaW5kIGlmIGEgbm9kZSBpcyBpbiB0aGUgZ2l2ZW4gcGFyZW50XG4gKiBAbWV0aG9kIGhhc1BhcmVudFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gbm9kZVxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufSBmb3VuZFxuICovXG5mdW5jdGlvbiBoYXNQYXJlbnQobm9kZSwgcGFyZW50KSB7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUgPT0gcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogc21hbGwgaW5kZXhPZiB3cmFwcGVyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmluZFxuICogQHJldHVybnMge0Jvb2xlYW59IGZvdW5kXG4gKi9cbmZ1bmN0aW9uIGluU3RyKHN0ciwgZmluZCkge1xuICAgIHJldHVybiBzdHIuaW5kZXhPZihmaW5kKSA+IC0xO1xufVxuXG4vKipcbiAqIHNwbGl0IHN0cmluZyBvbiB3aGl0ZXNwYWNlXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7QXJyYXl9IHdvcmRzXG4gKi9cbmZ1bmN0aW9uIHNwbGl0U3RyKHN0cikge1xuICAgIHJldHVybiBzdHIudHJpbSgpLnNwbGl0KC9cXHMrL2cpO1xufVxuXG4vKipcbiAqIGZpbmQgaWYgYSBhcnJheSBjb250YWlucyB0aGUgb2JqZWN0IHVzaW5nIGluZGV4T2Ygb3IgYSBzaW1wbGUgcG9seUZpbGxcbiAqIEBwYXJhbSB7QXJyYXl9IHNyY1xuICogQHBhcmFtIHtTdHJpbmd9IGZpbmRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbZmluZEJ5S2V5XVxuICogQHJldHVybiB7Qm9vbGVhbnxOdW1iZXJ9IGZhbHNlIHdoZW4gbm90IGZvdW5kLCBvciB0aGUgaW5kZXhcbiAqL1xuZnVuY3Rpb24gaW5BcnJheShzcmMsIGZpbmQsIGZpbmRCeUtleSkge1xuICAgIGlmIChzcmMuaW5kZXhPZiAmJiAhZmluZEJ5S2V5KSB7XG4gICAgICAgIHJldHVybiBzcmMuaW5kZXhPZihmaW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgc3JjLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKChmaW5kQnlLZXkgJiYgc3JjW2ldW2ZpbmRCeUtleV0gPT0gZmluZCkgfHwgKCFmaW5kQnlLZXkgJiYgc3JjW2ldID09PSBmaW5kKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG59XG5cbi8qKlxuICogY29udmVydCBhcnJheS1saWtlIG9iamVjdHMgdG8gcmVhbCBhcnJheXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gdG9BcnJheShvYmopIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwob2JqLCAwKTtcbn1cblxuLyoqXG4gKiB1bmlxdWUgYXJyYXkgd2l0aCBvYmplY3RzIGJhc2VkIG9uIGEga2V5IChsaWtlICdpZCcpIG9yIGp1c3QgYnkgdGhlIGFycmF5J3MgdmFsdWVcbiAqIEBwYXJhbSB7QXJyYXl9IHNyYyBbe2lkOjF9LHtpZDoyfSx7aWQ6MX1dXG4gKiBAcGFyYW0ge1N0cmluZ30gW2tleV1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3NvcnQ9RmFsc2VdXG4gKiBAcmV0dXJucyB7QXJyYXl9IFt7aWQ6MX0se2lkOjJ9XVxuICovXG5mdW5jdGlvbiB1bmlxdWVBcnJheShzcmMsIGtleSwgc29ydCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIHZhciBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgc3JjLmxlbmd0aCkge1xuICAgICAgICB2YXIgdmFsID0ga2V5ID8gc3JjW2ldW2tleV0gOiBzcmNbaV07XG4gICAgICAgIGlmIChpbkFycmF5KHZhbHVlcywgdmFsKSA8IDApIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChzcmNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlc1tpXSA9IHZhbDtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIGlmIChzb3J0KSB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5zb3J0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5zb3J0KGZ1bmN0aW9uIHNvcnRVbmlxdWVBcnJheShhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFba2V5XSA+IGJba2V5XTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8qKlxuICogZ2V0IHRoZSBwcmVmaXhlZCBwcm9wZXJ0eVxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7U3RyaW5nfFVuZGVmaW5lZH0gcHJlZml4ZWRcbiAqL1xuZnVuY3Rpb24gcHJlZml4ZWQob2JqLCBwcm9wZXJ0eSkge1xuICAgIHZhciBwcmVmaXgsIHByb3A7XG4gICAgdmFyIGNhbWVsUHJvcCA9IHByb3BlcnR5WzBdLnRvVXBwZXJDYXNlKCkgKyBwcm9wZXJ0eS5zbGljZSgxKTtcblxuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IFZFTkRPUl9QUkVGSVhFUy5sZW5ndGgpIHtcbiAgICAgICAgcHJlZml4ID0gVkVORE9SX1BSRUZJWEVTW2ldO1xuICAgICAgICBwcm9wID0gKHByZWZpeCkgPyBwcmVmaXggKyBjYW1lbFByb3AgOiBwcm9wZXJ0eTtcblxuICAgICAgICBpZiAocHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBnZXQgYSB1bmlxdWUgaWRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHVuaXF1ZUlkXG4gKi9cbnZhciBfdW5pcXVlSWQgPSAxO1xuZnVuY3Rpb24gdW5pcXVlSWQoKSB7XG4gICAgcmV0dXJuIF91bmlxdWVJZCsrO1xufVxuXG4vKipcbiAqIGdldCB0aGUgd2luZG93IG9iamVjdCBvZiBhbiBlbGVtZW50XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7RG9jdW1lbnRWaWV3fFdpbmRvd31cbiAqL1xuZnVuY3Rpb24gZ2V0V2luZG93Rm9yRWxlbWVudChlbGVtZW50KSB7XG4gICAgdmFyIGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCB8fCBlbGVtZW50O1xuICAgIHJldHVybiAoZG9jLmRlZmF1bHRWaWV3IHx8IGRvYy5wYXJlbnRXaW5kb3cgfHwgd2luZG93KTtcbn1cblxudmFyIE1PQklMRV9SRUdFWCA9IC9tb2JpbGV8dGFibGV0fGlwKGFkfGhvbmV8b2QpfGFuZHJvaWQvaTtcblxudmFyIFNVUFBPUlRfVE9VQ0ggPSAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KTtcbnZhciBTVVBQT1JUX1BPSU5URVJfRVZFTlRTID0gcHJlZml4ZWQod2luZG93LCAnUG9pbnRlckV2ZW50JykgIT09IHVuZGVmaW5lZDtcbnZhciBTVVBQT1JUX09OTFlfVE9VQ0ggPSBTVVBQT1JUX1RPVUNIICYmIE1PQklMRV9SRUdFWC50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG52YXIgSU5QVVRfVFlQRV9UT1VDSCA9ICd0b3VjaCc7XG52YXIgSU5QVVRfVFlQRV9QRU4gPSAncGVuJztcbnZhciBJTlBVVF9UWVBFX01PVVNFID0gJ21vdXNlJztcbnZhciBJTlBVVF9UWVBFX0tJTkVDVCA9ICdraW5lY3QnO1xuXG52YXIgQ09NUFVURV9JTlRFUlZBTCA9IDI1O1xuXG52YXIgSU5QVVRfU1RBUlQgPSAxO1xudmFyIElOUFVUX01PVkUgPSAyO1xudmFyIElOUFVUX0VORCA9IDQ7XG52YXIgSU5QVVRfQ0FOQ0VMID0gODtcblxudmFyIERJUkVDVElPTl9OT05FID0gMTtcbnZhciBESVJFQ1RJT05fTEVGVCA9IDI7XG52YXIgRElSRUNUSU9OX1JJR0hUID0gNDtcbnZhciBESVJFQ1RJT05fVVAgPSA4O1xudmFyIERJUkVDVElPTl9ET1dOID0gMTY7XG5cbnZhciBESVJFQ1RJT05fSE9SSVpPTlRBTCA9IERJUkVDVElPTl9MRUZUIHwgRElSRUNUSU9OX1JJR0hUO1xudmFyIERJUkVDVElPTl9WRVJUSUNBTCA9IERJUkVDVElPTl9VUCB8IERJUkVDVElPTl9ET1dOO1xudmFyIERJUkVDVElPTl9BTEwgPSBESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTDtcblxudmFyIFBST1BTX1hZID0gWyd4JywgJ3knXTtcbnZhciBQUk9QU19DTElFTlRfWFkgPSBbJ2NsaWVudFgnLCAnY2xpZW50WSddO1xuXG4vKipcbiAqIGNyZWF0ZSBuZXcgaW5wdXQgdHlwZSBtYW5hZ2VyXG4gKiBAcGFyYW0ge01hbmFnZXJ9IG1hbmFnZXJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7SW5wdXR9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gSW5wdXQobWFuYWdlciwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5tYW5hZ2VyID0gbWFuYWdlcjtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5lbGVtZW50ID0gbWFuYWdlci5lbGVtZW50O1xuICAgIHRoaXMudGFyZ2V0ID0gbWFuYWdlci5vcHRpb25zLmlucHV0VGFyZ2V0O1xuXG4gICAgLy8gc21hbGxlciB3cmFwcGVyIGFyb3VuZCB0aGUgaGFuZGxlciwgZm9yIHRoZSBzY29wZSBhbmQgdGhlIGVuYWJsZWQgc3RhdGUgb2YgdGhlIG1hbmFnZXIsXG4gICAgLy8gc28gd2hlbiBkaXNhYmxlZCB0aGUgaW5wdXQgZXZlbnRzIGFyZSBjb21wbGV0ZWx5IGJ5cGFzc2VkLlxuICAgIHRoaXMuZG9tSGFuZGxlciA9IGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgIGlmIChib29sT3JGbihtYW5hZ2VyLm9wdGlvbnMuZW5hYmxlLCBbbWFuYWdlcl0pKSB7XG4gICAgICAgICAgICBzZWxmLmhhbmRsZXIoZXYpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuaW5pdCgpO1xuXG59XG5cbklucHV0LnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBzaG91bGQgaGFuZGxlIHRoZSBpbnB1dEV2ZW50IGRhdGEgYW5kIHRyaWdnZXIgdGhlIGNhbGxiYWNrXG4gICAgICogQHZpcnR1YWxcbiAgICAgKi9cbiAgICBoYW5kbGVyOiBmdW5jdGlvbigpIHsgfSxcblxuICAgIC8qKlxuICAgICAqIGJpbmQgdGhlIGV2ZW50c1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmV2RWwgJiYgYWRkRXZlbnRMaXN0ZW5lcnModGhpcy5lbGVtZW50LCB0aGlzLmV2RWwsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZUYXJnZXQgJiYgYWRkRXZlbnRMaXN0ZW5lcnModGhpcy50YXJnZXQsIHRoaXMuZXZUYXJnZXQsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZXaW4gJiYgYWRkRXZlbnRMaXN0ZW5lcnMoZ2V0V2luZG93Rm9yRWxlbWVudCh0aGlzLmVsZW1lbnQpLCB0aGlzLmV2V2luLCB0aGlzLmRvbUhhbmRsZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB1bmJpbmQgdGhlIGV2ZW50c1xuICAgICAqL1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmV2RWwgJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGhpcy5lbGVtZW50LCB0aGlzLmV2RWwsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZUYXJnZXQgJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGhpcy50YXJnZXQsIHRoaXMuZXZUYXJnZXQsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZXaW4gJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoZ2V0V2luZG93Rm9yRWxlbWVudCh0aGlzLmVsZW1lbnQpLCB0aGlzLmV2V2luLCB0aGlzLmRvbUhhbmRsZXIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogY3JlYXRlIG5ldyBpbnB1dCB0eXBlIG1hbmFnZXJcbiAqIGNhbGxlZCBieSB0aGUgTWFuYWdlciBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtIYW1tZXJ9IG1hbmFnZXJcbiAqIEByZXR1cm5zIHtJbnB1dH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5wdXRJbnN0YW5jZShtYW5hZ2VyKSB7XG4gICAgdmFyIFR5cGU7XG4gICAgdmFyIGlucHV0Q2xhc3MgPSBtYW5hZ2VyLm9wdGlvbnMuaW5wdXRDbGFzcztcblxuICAgIGlmIChpbnB1dENsYXNzKSB7XG4gICAgICAgIFR5cGUgPSBpbnB1dENsYXNzO1xuICAgIH0gZWxzZSBpZiAoU1VQUE9SVF9QT0lOVEVSX0VWRU5UUykge1xuICAgICAgICBUeXBlID0gUG9pbnRlckV2ZW50SW5wdXQ7XG4gICAgfSBlbHNlIGlmIChTVVBQT1JUX09OTFlfVE9VQ0gpIHtcbiAgICAgICAgVHlwZSA9IFRvdWNoSW5wdXQ7XG4gICAgfSBlbHNlIGlmICghU1VQUE9SVF9UT1VDSCkge1xuICAgICAgICBUeXBlID0gTW91c2VJbnB1dDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBUeXBlID0gVG91Y2hNb3VzZUlucHV0O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IChUeXBlKShtYW5hZ2VyLCBpbnB1dEhhbmRsZXIpO1xufVxuXG4vKipcbiAqIGhhbmRsZSBpbnB1dCBldmVudHNcbiAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZVxuICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gKi9cbmZ1bmN0aW9uIGlucHV0SGFuZGxlcihtYW5hZ2VyLCBldmVudFR5cGUsIGlucHV0KSB7XG4gICAgdmFyIHBvaW50ZXJzTGVuID0gaW5wdXQucG9pbnRlcnMubGVuZ3RoO1xuICAgIHZhciBjaGFuZ2VkUG9pbnRlcnNMZW4gPSBpbnB1dC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoO1xuICAgIHZhciBpc0ZpcnN0ID0gKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUICYmIChwb2ludGVyc0xlbiAtIGNoYW5nZWRQb2ludGVyc0xlbiA9PT0gMCkpO1xuICAgIHZhciBpc0ZpbmFsID0gKGV2ZW50VHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpICYmIChwb2ludGVyc0xlbiAtIGNoYW5nZWRQb2ludGVyc0xlbiA9PT0gMCkpO1xuXG4gICAgaW5wdXQuaXNGaXJzdCA9ICEhaXNGaXJzdDtcbiAgICBpbnB1dC5pc0ZpbmFsID0gISFpc0ZpbmFsO1xuXG4gICAgaWYgKGlzRmlyc3QpIHtcbiAgICAgICAgbWFuYWdlci5zZXNzaW9uID0ge307XG4gICAgfVxuXG4gICAgLy8gc291cmNlIGV2ZW50IGlzIHRoZSBub3JtYWxpemVkIHZhbHVlIG9mIHRoZSBkb21FdmVudHNcbiAgICAvLyBsaWtlICd0b3VjaHN0YXJ0LCBtb3VzZXVwLCBwb2ludGVyZG93bidcbiAgICBpbnB1dC5ldmVudFR5cGUgPSBldmVudFR5cGU7XG5cbiAgICAvLyBjb21wdXRlIHNjYWxlLCByb3RhdGlvbiBldGNcbiAgICBjb21wdXRlSW5wdXREYXRhKG1hbmFnZXIsIGlucHV0KTtcblxuICAgIC8vIGVtaXQgc2VjcmV0IGV2ZW50XG4gICAgbWFuYWdlci5lbWl0KCdoYW1tZXIuaW5wdXQnLCBpbnB1dCk7XG5cbiAgICBtYW5hZ2VyLnJlY29nbml6ZShpbnB1dCk7XG4gICAgbWFuYWdlci5zZXNzaW9uLnByZXZJbnB1dCA9IGlucHV0O1xufVxuXG4vKipcbiAqIGV4dGVuZCB0aGUgZGF0YSB3aXRoIHNvbWUgdXNhYmxlIHByb3BlcnRpZXMgbGlrZSBzY2FsZSwgcm90YXRlLCB2ZWxvY2l0eSBldGNcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYW5hZ2VyXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAqL1xuZnVuY3Rpb24gY29tcHV0ZUlucHV0RGF0YShtYW5hZ2VyLCBpbnB1dCkge1xuICAgIHZhciBzZXNzaW9uID0gbWFuYWdlci5zZXNzaW9uO1xuICAgIHZhciBwb2ludGVycyA9IGlucHV0LnBvaW50ZXJzO1xuICAgIHZhciBwb2ludGVyc0xlbmd0aCA9IHBvaW50ZXJzLmxlbmd0aDtcblxuICAgIC8vIHN0b3JlIHRoZSBmaXJzdCBpbnB1dCB0byBjYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGFuZCBkaXJlY3Rpb25cbiAgICBpZiAoIXNlc3Npb24uZmlyc3RJbnB1dCkge1xuICAgICAgICBzZXNzaW9uLmZpcnN0SW5wdXQgPSBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCk7XG4gICAgfVxuXG4gICAgLy8gdG8gY29tcHV0ZSBzY2FsZSBhbmQgcm90YXRpb24gd2UgbmVlZCB0byBzdG9yZSB0aGUgbXVsdGlwbGUgdG91Y2hlc1xuICAgIGlmIChwb2ludGVyc0xlbmd0aCA+IDEgJiYgIXNlc3Npb24uZmlyc3RNdWx0aXBsZSkge1xuICAgICAgICBzZXNzaW9uLmZpcnN0TXVsdGlwbGUgPSBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCk7XG4gICAgfSBlbHNlIGlmIChwb2ludGVyc0xlbmd0aCA9PT0gMSkge1xuICAgICAgICBzZXNzaW9uLmZpcnN0TXVsdGlwbGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZmlyc3RJbnB1dCA9IHNlc3Npb24uZmlyc3RJbnB1dDtcbiAgICB2YXIgZmlyc3RNdWx0aXBsZSA9IHNlc3Npb24uZmlyc3RNdWx0aXBsZTtcbiAgICB2YXIgb2Zmc2V0Q2VudGVyID0gZmlyc3RNdWx0aXBsZSA/IGZpcnN0TXVsdGlwbGUuY2VudGVyIDogZmlyc3RJbnB1dC5jZW50ZXI7XG5cbiAgICB2YXIgY2VudGVyID0gaW5wdXQuY2VudGVyID0gZ2V0Q2VudGVyKHBvaW50ZXJzKTtcbiAgICBpbnB1dC50aW1lU3RhbXAgPSBub3coKTtcbiAgICBpbnB1dC5kZWx0YVRpbWUgPSBpbnB1dC50aW1lU3RhbXAgLSBmaXJzdElucHV0LnRpbWVTdGFtcDtcblxuICAgIGlucHV0LmFuZ2xlID0gZ2V0QW5nbGUob2Zmc2V0Q2VudGVyLCBjZW50ZXIpO1xuICAgIGlucHV0LmRpc3RhbmNlID0gZ2V0RGlzdGFuY2Uob2Zmc2V0Q2VudGVyLCBjZW50ZXIpO1xuXG4gICAgY29tcHV0ZURlbHRhWFkoc2Vzc2lvbiwgaW5wdXQpO1xuICAgIGlucHV0Lm9mZnNldERpcmVjdGlvbiA9IGdldERpcmVjdGlvbihpbnB1dC5kZWx0YVgsIGlucHV0LmRlbHRhWSk7XG5cbiAgICB2YXIgb3ZlcmFsbFZlbG9jaXR5ID0gZ2V0VmVsb2NpdHkoaW5wdXQuZGVsdGFUaW1lLCBpbnB1dC5kZWx0YVgsIGlucHV0LmRlbHRhWSk7XG4gICAgaW5wdXQub3ZlcmFsbFZlbG9jaXR5WCA9IG92ZXJhbGxWZWxvY2l0eS54O1xuICAgIGlucHV0Lm92ZXJhbGxWZWxvY2l0eVkgPSBvdmVyYWxsVmVsb2NpdHkueTtcbiAgICBpbnB1dC5vdmVyYWxsVmVsb2NpdHkgPSAoYWJzKG92ZXJhbGxWZWxvY2l0eS54KSA+IGFicyhvdmVyYWxsVmVsb2NpdHkueSkpID8gb3ZlcmFsbFZlbG9jaXR5LnggOiBvdmVyYWxsVmVsb2NpdHkueTtcblxuICAgIGlucHV0LnNjYWxlID0gZmlyc3RNdWx0aXBsZSA/IGdldFNjYWxlKGZpcnN0TXVsdGlwbGUucG9pbnRlcnMsIHBvaW50ZXJzKSA6IDE7XG4gICAgaW5wdXQucm90YXRpb24gPSBmaXJzdE11bHRpcGxlID8gZ2V0Um90YXRpb24oZmlyc3RNdWx0aXBsZS5wb2ludGVycywgcG9pbnRlcnMpIDogMDtcblxuICAgIGlucHV0Lm1heFBvaW50ZXJzID0gIXNlc3Npb24ucHJldklucHV0ID8gaW5wdXQucG9pbnRlcnMubGVuZ3RoIDogKChpbnB1dC5wb2ludGVycy5sZW5ndGggPlxuICAgICAgICBzZXNzaW9uLnByZXZJbnB1dC5tYXhQb2ludGVycykgPyBpbnB1dC5wb2ludGVycy5sZW5ndGggOiBzZXNzaW9uLnByZXZJbnB1dC5tYXhQb2ludGVycyk7XG5cbiAgICBjb21wdXRlSW50ZXJ2YWxJbnB1dERhdGEoc2Vzc2lvbiwgaW5wdXQpO1xuXG4gICAgLy8gZmluZCB0aGUgY29ycmVjdCB0YXJnZXRcbiAgICB2YXIgdGFyZ2V0ID0gbWFuYWdlci5lbGVtZW50O1xuICAgIGlmIChoYXNQYXJlbnQoaW5wdXQuc3JjRXZlbnQudGFyZ2V0LCB0YXJnZXQpKSB7XG4gICAgICAgIHRhcmdldCA9IGlucHV0LnNyY0V2ZW50LnRhcmdldDtcbiAgICB9XG4gICAgaW5wdXQudGFyZ2V0ID0gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBjb21wdXRlRGVsdGFYWShzZXNzaW9uLCBpbnB1dCkge1xuICAgIHZhciBjZW50ZXIgPSBpbnB1dC5jZW50ZXI7XG4gICAgdmFyIG9mZnNldCA9IHNlc3Npb24ub2Zmc2V0RGVsdGEgfHwge307XG4gICAgdmFyIHByZXZEZWx0YSA9IHNlc3Npb24ucHJldkRlbHRhIHx8IHt9O1xuICAgIHZhciBwcmV2SW5wdXQgPSBzZXNzaW9uLnByZXZJbnB1dCB8fCB7fTtcblxuICAgIGlmIChpbnB1dC5ldmVudFR5cGUgPT09IElOUFVUX1NUQVJUIHx8IHByZXZJbnB1dC5ldmVudFR5cGUgPT09IElOUFVUX0VORCkge1xuICAgICAgICBwcmV2RGVsdGEgPSBzZXNzaW9uLnByZXZEZWx0YSA9IHtcbiAgICAgICAgICAgIHg6IHByZXZJbnB1dC5kZWx0YVggfHwgMCxcbiAgICAgICAgICAgIHk6IHByZXZJbnB1dC5kZWx0YVkgfHwgMFxuICAgICAgICB9O1xuXG4gICAgICAgIG9mZnNldCA9IHNlc3Npb24ub2Zmc2V0RGVsdGEgPSB7XG4gICAgICAgICAgICB4OiBjZW50ZXIueCxcbiAgICAgICAgICAgIHk6IGNlbnRlci55XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaW5wdXQuZGVsdGFYID0gcHJldkRlbHRhLnggKyAoY2VudGVyLnggLSBvZmZzZXQueCk7XG4gICAgaW5wdXQuZGVsdGFZID0gcHJldkRlbHRhLnkgKyAoY2VudGVyLnkgLSBvZmZzZXQueSk7XG59XG5cbi8qKlxuICogdmVsb2NpdHkgaXMgY2FsY3VsYXRlZCBldmVyeSB4IG1zXG4gKiBAcGFyYW0ge09iamVjdH0gc2Vzc2lvblxuICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVJbnRlcnZhbElucHV0RGF0YShzZXNzaW9uLCBpbnB1dCkge1xuICAgIHZhciBsYXN0ID0gc2Vzc2lvbi5sYXN0SW50ZXJ2YWwgfHwgaW5wdXQsXG4gICAgICAgIGRlbHRhVGltZSA9IGlucHV0LnRpbWVTdGFtcCAtIGxhc3QudGltZVN0YW1wLFxuICAgICAgICB2ZWxvY2l0eSwgdmVsb2NpdHlYLCB2ZWxvY2l0eVksIGRpcmVjdGlvbjtcblxuICAgIGlmIChpbnB1dC5ldmVudFR5cGUgIT0gSU5QVVRfQ0FOQ0VMICYmIChkZWx0YVRpbWUgPiBDT01QVVRFX0lOVEVSVkFMIHx8IGxhc3QudmVsb2NpdHkgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgdmFyIGRlbHRhWCA9IGlucHV0LmRlbHRhWCAtIGxhc3QuZGVsdGFYO1xuICAgICAgICB2YXIgZGVsdGFZID0gaW5wdXQuZGVsdGFZIC0gbGFzdC5kZWx0YVk7XG5cbiAgICAgICAgdmFyIHYgPSBnZXRWZWxvY2l0eShkZWx0YVRpbWUsIGRlbHRhWCwgZGVsdGFZKTtcbiAgICAgICAgdmVsb2NpdHlYID0gdi54O1xuICAgICAgICB2ZWxvY2l0eVkgPSB2Lnk7XG4gICAgICAgIHZlbG9jaXR5ID0gKGFicyh2LngpID4gYWJzKHYueSkpID8gdi54IDogdi55O1xuICAgICAgICBkaXJlY3Rpb24gPSBnZXREaXJlY3Rpb24oZGVsdGFYLCBkZWx0YVkpO1xuXG4gICAgICAgIHNlc3Npb24ubGFzdEludGVydmFsID0gaW5wdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdXNlIGxhdGVzdCB2ZWxvY2l0eSBpbmZvIGlmIGl0IGRvZXNuJ3Qgb3ZlcnRha2UgYSBtaW5pbXVtIHBlcmlvZFxuICAgICAgICB2ZWxvY2l0eSA9IGxhc3QudmVsb2NpdHk7XG4gICAgICAgIHZlbG9jaXR5WCA9IGxhc3QudmVsb2NpdHlYO1xuICAgICAgICB2ZWxvY2l0eVkgPSBsYXN0LnZlbG9jaXR5WTtcbiAgICAgICAgZGlyZWN0aW9uID0gbGFzdC5kaXJlY3Rpb247XG4gICAgfVxuXG4gICAgaW5wdXQudmVsb2NpdHkgPSB2ZWxvY2l0eTtcbiAgICBpbnB1dC52ZWxvY2l0eVggPSB2ZWxvY2l0eVg7XG4gICAgaW5wdXQudmVsb2NpdHlZID0gdmVsb2NpdHlZO1xuICAgIGlucHV0LmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbn1cblxuLyoqXG4gKiBjcmVhdGUgYSBzaW1wbGUgY2xvbmUgZnJvbSB0aGUgaW5wdXQgdXNlZCBmb3Igc3RvcmFnZSBvZiBmaXJzdElucHV0IGFuZCBmaXJzdE11bHRpcGxlXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAqIEByZXR1cm5zIHtPYmplY3R9IGNsb25lZElucHV0RGF0YVxuICovXG5mdW5jdGlvbiBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCkge1xuICAgIC8vIG1ha2UgYSBzaW1wbGUgY29weSBvZiB0aGUgcG9pbnRlcnMgYmVjYXVzZSB3ZSB3aWxsIGdldCBhIHJlZmVyZW5jZSBpZiB3ZSBkb24ndFxuICAgIC8vIHdlIG9ubHkgbmVlZCBjbGllbnRYWSBmb3IgdGhlIGNhbGN1bGF0aW9uc1xuICAgIHZhciBwb2ludGVycyA9IFtdO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IGlucHV0LnBvaW50ZXJzLmxlbmd0aCkge1xuICAgICAgICBwb2ludGVyc1tpXSA9IHtcbiAgICAgICAgICAgIGNsaWVudFg6IHJvdW5kKGlucHV0LnBvaW50ZXJzW2ldLmNsaWVudFgpLFxuICAgICAgICAgICAgY2xpZW50WTogcm91bmQoaW5wdXQucG9pbnRlcnNbaV0uY2xpZW50WSlcbiAgICAgICAgfTtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRpbWVTdGFtcDogbm93KCksXG4gICAgICAgIHBvaW50ZXJzOiBwb2ludGVycyxcbiAgICAgICAgY2VudGVyOiBnZXRDZW50ZXIocG9pbnRlcnMpLFxuICAgICAgICBkZWx0YVg6IGlucHV0LmRlbHRhWCxcbiAgICAgICAgZGVsdGFZOiBpbnB1dC5kZWx0YVlcbiAgICB9O1xufVxuXG4vKipcbiAqIGdldCB0aGUgY2VudGVyIG9mIGFsbCB0aGUgcG9pbnRlcnNcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ZXJzXG4gKiBAcmV0dXJuIHtPYmplY3R9IGNlbnRlciBjb250YWlucyBgeGAgYW5kIGB5YCBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIGdldENlbnRlcihwb2ludGVycykge1xuICAgIHZhciBwb2ludGVyc0xlbmd0aCA9IHBvaW50ZXJzLmxlbmd0aDtcblxuICAgIC8vIG5vIG5lZWQgdG8gbG9vcCB3aGVuIG9ubHkgb25lIHRvdWNoXG4gICAgaWYgKHBvaW50ZXJzTGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiByb3VuZChwb2ludGVyc1swXS5jbGllbnRYKSxcbiAgICAgICAgICAgIHk6IHJvdW5kKHBvaW50ZXJzWzBdLmNsaWVudFkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHggPSAwLCB5ID0gMCwgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBwb2ludGVyc0xlbmd0aCkge1xuICAgICAgICB4ICs9IHBvaW50ZXJzW2ldLmNsaWVudFg7XG4gICAgICAgIHkgKz0gcG9pbnRlcnNbaV0uY2xpZW50WTtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHJvdW5kKHggLyBwb2ludGVyc0xlbmd0aCksXG4gICAgICAgIHk6IHJvdW5kKHkgLyBwb2ludGVyc0xlbmd0aClcbiAgICB9O1xufVxuXG4vKipcbiAqIGNhbGN1bGF0ZSB0aGUgdmVsb2NpdHkgYmV0d2VlbiB0d28gcG9pbnRzLiB1bml0IGlzIGluIHB4IHBlciBtcy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBkZWx0YVRpbWVcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiBAcGFyYW0ge051bWJlcn0geVxuICogQHJldHVybiB7T2JqZWN0fSB2ZWxvY2l0eSBgeGAgYW5kIGB5YFxuICovXG5mdW5jdGlvbiBnZXRWZWxvY2l0eShkZWx0YVRpbWUsIHgsIHkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiB4IC8gZGVsdGFUaW1lIHx8IDAsXG4gICAgICAgIHk6IHkgLyBkZWx0YVRpbWUgfHwgMFxuICAgIH07XG59XG5cbi8qKlxuICogZ2V0IHRoZSBkaXJlY3Rpb24gYmV0d2VlbiB0d28gcG9pbnRzXG4gKiBAcGFyYW0ge051bWJlcn0geFxuICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAqIEByZXR1cm4ge051bWJlcn0gZGlyZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldERpcmVjdGlvbih4LCB5KSB7XG4gICAgaWYgKHggPT09IHkpIHtcbiAgICAgICAgcmV0dXJuIERJUkVDVElPTl9OT05FO1xuICAgIH1cblxuICAgIGlmIChhYnMoeCkgPj0gYWJzKHkpKSB7XG4gICAgICAgIHJldHVybiB4IDwgMCA/IERJUkVDVElPTl9MRUZUIDogRElSRUNUSU9OX1JJR0hUO1xuICAgIH1cbiAgICByZXR1cm4geSA8IDAgPyBESVJFQ1RJT05fVVAgOiBESVJFQ1RJT05fRE9XTjtcbn1cblxuLyoqXG4gKiBjYWxjdWxhdGUgdGhlIGFic29sdXRlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuICogQHBhcmFtIHtPYmplY3R9IHAxIHt4LCB5fVxuICogQHBhcmFtIHtPYmplY3R9IHAyIHt4LCB5fVxuICogQHBhcmFtIHtBcnJheX0gW3Byb3BzXSBjb250YWluaW5nIHggYW5kIHkga2V5c1xuICogQHJldHVybiB7TnVtYmVyfSBkaXN0YW5jZVxuICovXG5mdW5jdGlvbiBnZXREaXN0YW5jZShwMSwgcDIsIHByb3BzKSB7XG4gICAgaWYgKCFwcm9wcykge1xuICAgICAgICBwcm9wcyA9IFBST1BTX1hZO1xuICAgIH1cbiAgICB2YXIgeCA9IHAyW3Byb3BzWzBdXSAtIHAxW3Byb3BzWzBdXSxcbiAgICAgICAgeSA9IHAyW3Byb3BzWzFdXSAtIHAxW3Byb3BzWzFdXTtcblxuICAgIHJldHVybiBNYXRoLnNxcnQoKHggKiB4KSArICh5ICogeSkpO1xufVxuXG4vKipcbiAqIGNhbGN1bGF0ZSB0aGUgYW5nbGUgYmV0d2VlbiB0d28gY29vcmRpbmF0ZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBwMVxuICogQHBhcmFtIHtPYmplY3R9IHAyXG4gKiBAcGFyYW0ge0FycmF5fSBbcHJvcHNdIGNvbnRhaW5pbmcgeCBhbmQgeSBrZXlzXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IGFuZ2xlXG4gKi9cbmZ1bmN0aW9uIGdldEFuZ2xlKHAxLCBwMiwgcHJvcHMpIHtcbiAgICBpZiAoIXByb3BzKSB7XG4gICAgICAgIHByb3BzID0gUFJPUFNfWFk7XG4gICAgfVxuICAgIHZhciB4ID0gcDJbcHJvcHNbMF1dIC0gcDFbcHJvcHNbMF1dLFxuICAgICAgICB5ID0gcDJbcHJvcHNbMV1dIC0gcDFbcHJvcHNbMV1dO1xuICAgIHJldHVybiBNYXRoLmF0YW4yKHksIHgpICogMTgwIC8gTWF0aC5QSTtcbn1cblxuLyoqXG4gKiBjYWxjdWxhdGUgdGhlIHJvdGF0aW9uIGRlZ3JlZXMgYmV0d2VlbiB0d28gcG9pbnRlcnNldHNcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0IGFycmF5IG9mIHBvaW50ZXJzXG4gKiBAcGFyYW0ge0FycmF5fSBlbmQgYXJyYXkgb2YgcG9pbnRlcnNcbiAqIEByZXR1cm4ge051bWJlcn0gcm90YXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0Um90YXRpb24oc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBnZXRBbmdsZShlbmRbMV0sIGVuZFswXSwgUFJPUFNfQ0xJRU5UX1hZKSArIGdldEFuZ2xlKHN0YXJ0WzFdLCBzdGFydFswXSwgUFJPUFNfQ0xJRU5UX1hZKTtcbn1cblxuLyoqXG4gKiBjYWxjdWxhdGUgdGhlIHNjYWxlIGZhY3RvciBiZXR3ZWVuIHR3byBwb2ludGVyc2V0c1xuICogbm8gc2NhbGUgaXMgMSwgYW5kIGdvZXMgZG93biB0byAwIHdoZW4gcGluY2hlZCB0b2dldGhlciwgYW5kIGJpZ2dlciB3aGVuIHBpbmNoZWQgb3V0XG4gKiBAcGFyYW0ge0FycmF5fSBzdGFydCBhcnJheSBvZiBwb2ludGVyc1xuICogQHBhcmFtIHtBcnJheX0gZW5kIGFycmF5IG9mIHBvaW50ZXJzXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IHNjYWxlXG4gKi9cbmZ1bmN0aW9uIGdldFNjYWxlKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gZ2V0RGlzdGFuY2UoZW5kWzBdLCBlbmRbMV0sIFBST1BTX0NMSUVOVF9YWSkgLyBnZXREaXN0YW5jZShzdGFydFswXSwgc3RhcnRbMV0sIFBST1BTX0NMSUVOVF9YWSk7XG59XG5cbnZhciBNT1VTRV9JTlBVVF9NQVAgPSB7XG4gICAgbW91c2Vkb3duOiBJTlBVVF9TVEFSVCxcbiAgICBtb3VzZW1vdmU6IElOUFVUX01PVkUsXG4gICAgbW91c2V1cDogSU5QVVRfRU5EXG59O1xuXG52YXIgTU9VU0VfRUxFTUVOVF9FVkVOVFMgPSAnbW91c2Vkb3duJztcbnZhciBNT1VTRV9XSU5ET1dfRVZFTlRTID0gJ21vdXNlbW92ZSBtb3VzZXVwJztcblxuLyoqXG4gKiBNb3VzZSBldmVudHMgaW5wdXRcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuZnVuY3Rpb24gTW91c2VJbnB1dCgpIHtcbiAgICB0aGlzLmV2RWwgPSBNT1VTRV9FTEVNRU5UX0VWRU5UUztcbiAgICB0aGlzLmV2V2luID0gTU9VU0VfV0lORE9XX0VWRU5UUztcblxuICAgIHRoaXMucHJlc3NlZCA9IGZhbHNlOyAvLyBtb3VzZWRvd24gc3RhdGVcblxuICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmluaGVyaXQoTW91c2VJbnB1dCwgSW5wdXQsIHtcbiAgICAvKipcbiAgICAgKiBoYW5kbGUgbW91c2UgZXZlbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2XG4gICAgICovXG4gICAgaGFuZGxlcjogZnVuY3Rpb24gTUVoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSBNT1VTRV9JTlBVVF9NQVBbZXYudHlwZV07XG5cbiAgICAgICAgLy8gb24gc3RhcnQgd2Ugd2FudCB0byBoYXZlIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBkb3duXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCAmJiBldi5idXR0b24gPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfTU9WRSAmJiBldi53aGljaCAhPT0gMSkge1xuICAgICAgICAgICAgZXZlbnRUeXBlID0gSU5QVVRfRU5EO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbW91c2UgbXVzdCBiZSBkb3duXG4gICAgICAgIGlmICghdGhpcy5wcmVzc2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5tYW5hZ2VyLCBldmVudFR5cGUsIHtcbiAgICAgICAgICAgIHBvaW50ZXJzOiBbZXZdLFxuICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiBbZXZdLFxuICAgICAgICAgICAgcG9pbnRlclR5cGU6IElOUFVUX1RZUEVfTU9VU0UsXG4gICAgICAgICAgICBzcmNFdmVudDogZXZcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbnZhciBQT0lOVEVSX0lOUFVUX01BUCA9IHtcbiAgICBwb2ludGVyZG93bjogSU5QVVRfU1RBUlQsXG4gICAgcG9pbnRlcm1vdmU6IElOUFVUX01PVkUsXG4gICAgcG9pbnRlcnVwOiBJTlBVVF9FTkQsXG4gICAgcG9pbnRlcmNhbmNlbDogSU5QVVRfQ0FOQ0VMLFxuICAgIHBvaW50ZXJvdXQ6IElOUFVUX0NBTkNFTFxufTtcblxuLy8gaW4gSUUxMCB0aGUgcG9pbnRlciB0eXBlcyBpcyBkZWZpbmVkIGFzIGFuIGVudW1cbnZhciBJRTEwX1BPSU5URVJfVFlQRV9FTlVNID0ge1xuICAgIDI6IElOUFVUX1RZUEVfVE9VQ0gsXG4gICAgMzogSU5QVVRfVFlQRV9QRU4sXG4gICAgNDogSU5QVVRfVFlQRV9NT1VTRSxcbiAgICA1OiBJTlBVVF9UWVBFX0tJTkVDVCAvLyBzZWUgaHR0cHM6Ly90d2l0dGVyLmNvbS9qYWNvYnJvc3NpL3N0YXR1cy80ODA1OTY0Mzg0ODk4OTA4MTZcbn07XG5cbnZhciBQT0lOVEVSX0VMRU1FTlRfRVZFTlRTID0gJ3BvaW50ZXJkb3duJztcbnZhciBQT0lOVEVSX1dJTkRPV19FVkVOVFMgPSAncG9pbnRlcm1vdmUgcG9pbnRlcnVwIHBvaW50ZXJjYW5jZWwnO1xuXG4vLyBJRTEwIGhhcyBwcmVmaXhlZCBzdXBwb3J0LCBhbmQgY2FzZS1zZW5zaXRpdmVcbmlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQgJiYgIXdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcbiAgICBQT0lOVEVSX0VMRU1FTlRfRVZFTlRTID0gJ01TUG9pbnRlckRvd24nO1xuICAgIFBPSU5URVJfV0lORE9XX0VWRU5UUyA9ICdNU1BvaW50ZXJNb3ZlIE1TUG9pbnRlclVwIE1TUG9pbnRlckNhbmNlbCc7XG59XG5cbi8qKlxuICogUG9pbnRlciBldmVudHMgaW5wdXRcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuZnVuY3Rpb24gUG9pbnRlckV2ZW50SW5wdXQoKSB7XG4gICAgdGhpcy5ldkVsID0gUE9JTlRFUl9FTEVNRU5UX0VWRU5UUztcbiAgICB0aGlzLmV2V2luID0gUE9JTlRFUl9XSU5ET1dfRVZFTlRTO1xuXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRoaXMuc3RvcmUgPSAodGhpcy5tYW5hZ2VyLnNlc3Npb24ucG9pbnRlckV2ZW50cyA9IFtdKTtcbn1cblxuaW5oZXJpdChQb2ludGVyRXZlbnRJbnB1dCwgSW5wdXQsIHtcbiAgICAvKipcbiAgICAgKiBoYW5kbGUgbW91c2UgZXZlbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2XG4gICAgICovXG4gICAgaGFuZGxlcjogZnVuY3Rpb24gUEVoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmU7XG4gICAgICAgIHZhciByZW1vdmVQb2ludGVyID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGV2ZW50VHlwZU5vcm1hbGl6ZWQgPSBldi50eXBlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnbXMnLCAnJyk7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSBQT0lOVEVSX0lOUFVUX01BUFtldmVudFR5cGVOb3JtYWxpemVkXTtcbiAgICAgICAgdmFyIHBvaW50ZXJUeXBlID0gSUUxMF9QT0lOVEVSX1RZUEVfRU5VTVtldi5wb2ludGVyVHlwZV0gfHwgZXYucG9pbnRlclR5cGU7XG5cbiAgICAgICAgdmFyIGlzVG91Y2ggPSAocG9pbnRlclR5cGUgPT0gSU5QVVRfVFlQRV9UT1VDSCk7XG5cbiAgICAgICAgLy8gZ2V0IGluZGV4IG9mIHRoZSBldmVudCBpbiB0aGUgc3RvcmVcbiAgICAgICAgdmFyIHN0b3JlSW5kZXggPSBpbkFycmF5KHN0b3JlLCBldi5wb2ludGVySWQsICdwb2ludGVySWQnKTtcblxuICAgICAgICAvLyBzdGFydCBhbmQgbW91c2UgbXVzdCBiZSBkb3duXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCAmJiAoZXYuYnV0dG9uID09PSAwIHx8IGlzVG91Y2gpKSB7XG4gICAgICAgICAgICBpZiAoc3RvcmVJbmRleCA8IDApIHtcbiAgICAgICAgICAgICAgICBzdG9yZS5wdXNoKGV2KTtcbiAgICAgICAgICAgICAgICBzdG9yZUluZGV4ID0gc3RvcmUubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldmVudFR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSkge1xuICAgICAgICAgICAgcmVtb3ZlUG9pbnRlciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpdCBub3QgZm91bmQsIHNvIHRoZSBwb2ludGVyIGhhc24ndCBiZWVuIGRvd24gKHNvIGl0J3MgcHJvYmFibHkgYSBob3ZlcilcbiAgICAgICAgaWYgKHN0b3JlSW5kZXggPCAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgdGhlIGV2ZW50IGluIHRoZSBzdG9yZVxuICAgICAgICBzdG9yZVtzdG9yZUluZGV4XSA9IGV2O1xuXG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5tYW5hZ2VyLCBldmVudFR5cGUsIHtcbiAgICAgICAgICAgIHBvaW50ZXJzOiBzdG9yZSxcbiAgICAgICAgICAgIGNoYW5nZWRQb2ludGVyczogW2V2XSxcbiAgICAgICAgICAgIHBvaW50ZXJUeXBlOiBwb2ludGVyVHlwZSxcbiAgICAgICAgICAgIHNyY0V2ZW50OiBldlxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVtb3ZlUG9pbnRlcikge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIGZyb20gdGhlIHN0b3JlXG4gICAgICAgICAgICBzdG9yZS5zcGxpY2Uoc3RvcmVJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxudmFyIFNJTkdMRV9UT1VDSF9JTlBVVF9NQVAgPSB7XG4gICAgdG91Y2hzdGFydDogSU5QVVRfU1RBUlQsXG4gICAgdG91Y2htb3ZlOiBJTlBVVF9NT1ZFLFxuICAgIHRvdWNoZW5kOiBJTlBVVF9FTkQsXG4gICAgdG91Y2hjYW5jZWw6IElOUFVUX0NBTkNFTFxufTtcblxudmFyIFNJTkdMRV9UT1VDSF9UQVJHRVRfRVZFTlRTID0gJ3RvdWNoc3RhcnQnO1xudmFyIFNJTkdMRV9UT1VDSF9XSU5ET1dfRVZFTlRTID0gJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJztcblxuLyoqXG4gKiBUb3VjaCBldmVudHMgaW5wdXRcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuZnVuY3Rpb24gU2luZ2xlVG91Y2hJbnB1dCgpIHtcbiAgICB0aGlzLmV2VGFyZ2V0ID0gU0lOR0xFX1RPVUNIX1RBUkdFVF9FVkVOVFM7XG4gICAgdGhpcy5ldldpbiA9IFNJTkdMRV9UT1VDSF9XSU5ET1dfRVZFTlRTO1xuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChTaW5nbGVUb3VjaElucHV0LCBJbnB1dCwge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uIFRFaGFuZGxlcihldikge1xuICAgICAgICB2YXIgdHlwZSA9IFNJTkdMRV9UT1VDSF9JTlBVVF9NQVBbZXYudHlwZV07XG5cbiAgICAgICAgLy8gc2hvdWxkIHdlIGhhbmRsZSB0aGUgdG91Y2ggZXZlbnRzP1xuICAgICAgICBpZiAodHlwZSA9PT0gSU5QVVRfU1RBUlQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc3RhcnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRvdWNoZXMgPSBub3JtYWxpemVTaW5nbGVUb3VjaGVzLmNhbGwodGhpcywgZXYsIHR5cGUpO1xuXG4gICAgICAgIC8vIHdoZW4gZG9uZSwgcmVzZXQgdGhlIHN0YXJ0ZWQgc3RhdGVcbiAgICAgICAgaWYgKHR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSAmJiB0b3VjaGVzWzBdLmxlbmd0aCAtIHRvdWNoZXNbMV0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5tYW5hZ2VyLCB0eXBlLCB7XG4gICAgICAgICAgICBwb2ludGVyczogdG91Y2hlc1swXSxcbiAgICAgICAgICAgIGNoYW5nZWRQb2ludGVyczogdG91Y2hlc1sxXSxcbiAgICAgICAgICAgIHBvaW50ZXJUeXBlOiBJTlBVVF9UWVBFX1RPVUNILFxuICAgICAgICAgICAgc3JjRXZlbnQ6IGV2XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIEB0aGlzIHtUb3VjaElucHV0fVxuICogQHBhcmFtIHtPYmplY3R9IGV2XG4gKiBAcGFyYW0ge051bWJlcn0gdHlwZSBmbGFnXG4gKiBAcmV0dXJucyB7dW5kZWZpbmVkfEFycmF5fSBbYWxsLCBjaGFuZ2VkXVxuICovXG5mdW5jdGlvbiBub3JtYWxpemVTaW5nbGVUb3VjaGVzKGV2LCB0eXBlKSB7XG4gICAgdmFyIGFsbCA9IHRvQXJyYXkoZXYudG91Y2hlcyk7XG4gICAgdmFyIGNoYW5nZWQgPSB0b0FycmF5KGV2LmNoYW5nZWRUb3VjaGVzKTtcblxuICAgIGlmICh0eXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkpIHtcbiAgICAgICAgYWxsID0gdW5pcXVlQXJyYXkoYWxsLmNvbmNhdChjaGFuZ2VkKSwgJ2lkZW50aWZpZXInLCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW2FsbCwgY2hhbmdlZF07XG59XG5cbnZhciBUT1VDSF9JTlBVVF9NQVAgPSB7XG4gICAgdG91Y2hzdGFydDogSU5QVVRfU1RBUlQsXG4gICAgdG91Y2htb3ZlOiBJTlBVVF9NT1ZFLFxuICAgIHRvdWNoZW5kOiBJTlBVVF9FTkQsXG4gICAgdG91Y2hjYW5jZWw6IElOUFVUX0NBTkNFTFxufTtcblxudmFyIFRPVUNIX1RBUkdFVF9FVkVOVFMgPSAndG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWwnO1xuXG4vKipcbiAqIE11bHRpLXVzZXIgdG91Y2ggZXZlbnRzIGlucHV0XG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIElucHV0XG4gKi9cbmZ1bmN0aW9uIFRvdWNoSW5wdXQoKSB7XG4gICAgdGhpcy5ldlRhcmdldCA9IFRPVUNIX1RBUkdFVF9FVkVOVFM7XG4gICAgdGhpcy50YXJnZXRJZHMgPSB7fTtcblxuICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmluaGVyaXQoVG91Y2hJbnB1dCwgSW5wdXQsIHtcbiAgICBoYW5kbGVyOiBmdW5jdGlvbiBNVEVoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciB0eXBlID0gVE9VQ0hfSU5QVVRfTUFQW2V2LnR5cGVdO1xuICAgICAgICB2YXIgdG91Y2hlcyA9IGdldFRvdWNoZXMuY2FsbCh0aGlzLCBldiwgdHlwZSk7XG4gICAgICAgIGlmICghdG91Y2hlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLm1hbmFnZXIsIHR5cGUsIHtcbiAgICAgICAgICAgIHBvaW50ZXJzOiB0b3VjaGVzWzBdLFxuICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiB0b3VjaGVzWzFdLFxuICAgICAgICAgICAgcG9pbnRlclR5cGU6IElOUFVUX1RZUEVfVE9VQ0gsXG4gICAgICAgICAgICBzcmNFdmVudDogZXZcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQHRoaXMge1RvdWNoSW5wdXR9XG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqIEBwYXJhbSB7TnVtYmVyfSB0eXBlIGZsYWdcbiAqIEByZXR1cm5zIHt1bmRlZmluZWR8QXJyYXl9IFthbGwsIGNoYW5nZWRdXG4gKi9cbmZ1bmN0aW9uIGdldFRvdWNoZXMoZXYsIHR5cGUpIHtcbiAgICB2YXIgYWxsVG91Y2hlcyA9IHRvQXJyYXkoZXYudG91Y2hlcyk7XG4gICAgdmFyIHRhcmdldElkcyA9IHRoaXMudGFyZ2V0SWRzO1xuXG4gICAgLy8gd2hlbiB0aGVyZSBpcyBvbmx5IG9uZSB0b3VjaCwgdGhlIHByb2Nlc3MgY2FuIGJlIHNpbXBsaWZpZWRcbiAgICBpZiAodHlwZSAmIChJTlBVVF9TVEFSVCB8IElOUFVUX01PVkUpICYmIGFsbFRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHRhcmdldElkc1thbGxUb3VjaGVzWzBdLmlkZW50aWZpZXJdID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIFthbGxUb3VjaGVzLCBhbGxUb3VjaGVzXTtcbiAgICB9XG5cbiAgICB2YXIgaSxcbiAgICAgICAgdGFyZ2V0VG91Y2hlcyxcbiAgICAgICAgY2hhbmdlZFRvdWNoZXMgPSB0b0FycmF5KGV2LmNoYW5nZWRUb3VjaGVzKSxcbiAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXMgPSBbXSxcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy50YXJnZXQ7XG5cbiAgICAvLyBnZXQgdGFyZ2V0IHRvdWNoZXMgZnJvbSB0b3VjaGVzXG4gICAgdGFyZ2V0VG91Y2hlcyA9IGFsbFRvdWNoZXMuZmlsdGVyKGZ1bmN0aW9uKHRvdWNoKSB7XG4gICAgICAgIHJldHVybiBoYXNQYXJlbnQodG91Y2gudGFyZ2V0LCB0YXJnZXQpO1xuICAgIH0pO1xuXG4gICAgLy8gY29sbGVjdCB0b3VjaGVzXG4gICAgaWYgKHR5cGUgPT09IElOUFVUX1NUQVJUKSB7XG4gICAgICAgIGkgPSAwO1xuICAgICAgICB3aGlsZSAoaSA8IHRhcmdldFRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0YXJnZXRJZHNbdGFyZ2V0VG91Y2hlc1tpXS5pZGVudGlmaWVyXSA9IHRydWU7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmaWx0ZXIgY2hhbmdlZCB0b3VjaGVzIHRvIG9ubHkgY29udGFpbiB0b3VjaGVzIHRoYXQgZXhpc3QgaW4gdGhlIGNvbGxlY3RlZCB0YXJnZXQgaWRzXG4gICAgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBjaGFuZ2VkVG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHRhcmdldElkc1tjaGFuZ2VkVG91Y2hlc1tpXS5pZGVudGlmaWVyXSkge1xuICAgICAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXMucHVzaChjaGFuZ2VkVG91Y2hlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbGVhbnVwIHJlbW92ZWQgdG91Y2hlc1xuICAgICAgICBpZiAodHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpKSB7XG4gICAgICAgICAgICBkZWxldGUgdGFyZ2V0SWRzW2NoYW5nZWRUb3VjaGVzW2ldLmlkZW50aWZpZXJdO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICB9XG5cbiAgICBpZiAoIWNoYW5nZWRUYXJnZXRUb3VjaGVzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgLy8gbWVyZ2UgdGFyZ2V0VG91Y2hlcyB3aXRoIGNoYW5nZWRUYXJnZXRUb3VjaGVzIHNvIGl0IGNvbnRhaW5zIEFMTCB0b3VjaGVzLCBpbmNsdWRpbmcgJ2VuZCcgYW5kICdjYW5jZWwnXG4gICAgICAgIHVuaXF1ZUFycmF5KHRhcmdldFRvdWNoZXMuY29uY2F0KGNoYW5nZWRUYXJnZXRUb3VjaGVzKSwgJ2lkZW50aWZpZXInLCB0cnVlKSxcbiAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXNcbiAgICBdO1xufVxuXG4vKipcbiAqIENvbWJpbmVkIHRvdWNoIGFuZCBtb3VzZSBpbnB1dFxuICpcbiAqIFRvdWNoIGhhcyBhIGhpZ2hlciBwcmlvcml0eSB0aGVuIG1vdXNlLCBhbmQgd2hpbGUgdG91Y2hpbmcgbm8gbW91c2UgZXZlbnRzIGFyZSBhbGxvd2VkLlxuICogVGhpcyBiZWNhdXNlIHRvdWNoIGRldmljZXMgYWxzbyBlbWl0IG1vdXNlIGV2ZW50cyB3aGlsZSBkb2luZyBhIHRvdWNoLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuXG52YXIgREVEVVBfVElNRU9VVCA9IDI1MDA7XG52YXIgREVEVVBfRElTVEFOQ0UgPSAyNTtcblxuZnVuY3Rpb24gVG91Y2hNb3VzZUlucHV0KCkge1xuICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB2YXIgaGFuZGxlciA9IGJpbmRGbih0aGlzLmhhbmRsZXIsIHRoaXMpO1xuICAgIHRoaXMudG91Y2ggPSBuZXcgVG91Y2hJbnB1dCh0aGlzLm1hbmFnZXIsIGhhbmRsZXIpO1xuICAgIHRoaXMubW91c2UgPSBuZXcgTW91c2VJbnB1dCh0aGlzLm1hbmFnZXIsIGhhbmRsZXIpO1xuXG4gICAgdGhpcy5wcmltYXJ5VG91Y2ggPSBudWxsO1xuICAgIHRoaXMubGFzdFRvdWNoZXMgPSBbXTtcbn1cblxuaW5oZXJpdChUb3VjaE1vdXNlSW5wdXQsIElucHV0LCB7XG4gICAgLyoqXG4gICAgICogaGFuZGxlIG1vdXNlIGFuZCB0b3VjaCBldmVudHNcbiAgICAgKiBAcGFyYW0ge0hhbW1lcn0gbWFuYWdlclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dEV2ZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0RGF0YVxuICAgICAqL1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uIFRNRWhhbmRsZXIobWFuYWdlciwgaW5wdXRFdmVudCwgaW5wdXREYXRhKSB7XG4gICAgICAgIHZhciBpc1RvdWNoID0gKGlucHV0RGF0YS5wb2ludGVyVHlwZSA9PSBJTlBVVF9UWVBFX1RPVUNIKSxcbiAgICAgICAgICAgIGlzTW91c2UgPSAoaW5wdXREYXRhLnBvaW50ZXJUeXBlID09IElOUFVUX1RZUEVfTU9VU0UpO1xuXG4gICAgICAgIGlmIChpc01vdXNlICYmIGlucHV0RGF0YS5zb3VyY2VDYXBhYmlsaXRpZXMgJiYgaW5wdXREYXRhLnNvdXJjZUNhcGFiaWxpdGllcy5maXJlc1RvdWNoRXZlbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3aGVuIHdlJ3JlIGluIGEgdG91Y2ggZXZlbnQsIHJlY29yZCB0b3VjaGVzIHRvICBkZS1kdXBlIHN5bnRoZXRpYyBtb3VzZSBldmVudFxuICAgICAgICBpZiAoaXNUb3VjaCkge1xuICAgICAgICAgICAgcmVjb3JkVG91Y2hlcy5jYWxsKHRoaXMsIGlucHV0RXZlbnQsIGlucHV0RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNNb3VzZSAmJiBpc1N5bnRoZXRpY0V2ZW50LmNhbGwodGhpcywgaW5wdXREYXRhKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWxsYmFjayhtYW5hZ2VyLCBpbnB1dEV2ZW50LCBpbnB1dERhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqL1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMudG91Y2guZGVzdHJveSgpO1xuICAgICAgICB0aGlzLm1vdXNlLmRlc3Ryb3koKTtcbiAgICB9XG59KTtcblxuZnVuY3Rpb24gcmVjb3JkVG91Y2hlcyhldmVudFR5cGUsIGV2ZW50RGF0YSkge1xuICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCkge1xuICAgICAgICB0aGlzLnByaW1hcnlUb3VjaCA9IGV2ZW50RGF0YS5jaGFuZ2VkUG9pbnRlcnNbMF0uaWRlbnRpZmllcjtcbiAgICAgICAgc2V0TGFzdFRvdWNoLmNhbGwodGhpcywgZXZlbnREYXRhKTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50VHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpKSB7XG4gICAgICAgIHNldExhc3RUb3VjaC5jYWxsKHRoaXMsIGV2ZW50RGF0YSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRMYXN0VG91Y2goZXZlbnREYXRhKSB7XG4gICAgdmFyIHRvdWNoID0gZXZlbnREYXRhLmNoYW5nZWRQb2ludGVyc1swXTtcblxuICAgIGlmICh0b3VjaC5pZGVudGlmaWVyID09PSB0aGlzLnByaW1hcnlUb3VjaCkge1xuICAgICAgICB2YXIgbGFzdFRvdWNoID0ge3g6IHRvdWNoLmNsaWVudFgsIHk6IHRvdWNoLmNsaWVudFl9O1xuICAgICAgICB0aGlzLmxhc3RUb3VjaGVzLnB1c2gobGFzdFRvdWNoKTtcbiAgICAgICAgdmFyIGx0cyA9IHRoaXMubGFzdFRvdWNoZXM7XG4gICAgICAgIHZhciByZW1vdmVMYXN0VG91Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpID0gbHRzLmluZGV4T2YobGFzdFRvdWNoKTtcbiAgICAgICAgICAgIGlmIChpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBsdHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBzZXRUaW1lb3V0KHJlbW92ZUxhc3RUb3VjaCwgREVEVVBfVElNRU9VVCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc1N5bnRoZXRpY0V2ZW50KGV2ZW50RGF0YSkge1xuICAgIHZhciB4ID0gZXZlbnREYXRhLnNyY0V2ZW50LmNsaWVudFgsIHkgPSBldmVudERhdGEuc3JjRXZlbnQuY2xpZW50WTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGFzdFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzLmxhc3RUb3VjaGVzW2ldO1xuICAgICAgICB2YXIgZHggPSBNYXRoLmFicyh4IC0gdC54KSwgZHkgPSBNYXRoLmFicyh5IC0gdC55KTtcbiAgICAgICAgaWYgKGR4IDw9IERFRFVQX0RJU1RBTkNFICYmIGR5IDw9IERFRFVQX0RJU1RBTkNFKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbnZhciBQUkVGSVhFRF9UT1VDSF9BQ1RJT04gPSBwcmVmaXhlZChURVNUX0VMRU1FTlQuc3R5bGUsICd0b3VjaEFjdGlvbicpO1xudmFyIE5BVElWRV9UT1VDSF9BQ1RJT04gPSBQUkVGSVhFRF9UT1VDSF9BQ1RJT04gIT09IHVuZGVmaW5lZDtcblxuLy8gbWFnaWNhbCB0b3VjaEFjdGlvbiB2YWx1ZVxudmFyIFRPVUNIX0FDVElPTl9DT01QVVRFID0gJ2NvbXB1dGUnO1xudmFyIFRPVUNIX0FDVElPTl9BVVRPID0gJ2F1dG8nO1xudmFyIFRPVUNIX0FDVElPTl9NQU5JUFVMQVRJT04gPSAnbWFuaXB1bGF0aW9uJzsgLy8gbm90IGltcGxlbWVudGVkXG52YXIgVE9VQ0hfQUNUSU9OX05PTkUgPSAnbm9uZSc7XG52YXIgVE9VQ0hfQUNUSU9OX1BBTl9YID0gJ3Bhbi14JztcbnZhciBUT1VDSF9BQ1RJT05fUEFOX1kgPSAncGFuLXknO1xudmFyIFRPVUNIX0FDVElPTl9NQVAgPSBnZXRUb3VjaEFjdGlvblByb3BzKCk7XG5cbi8qKlxuICogVG91Y2ggQWN0aW9uXG4gKiBzZXRzIHRoZSB0b3VjaEFjdGlvbiBwcm9wZXJ0eSBvciB1c2VzIHRoZSBqcyBhbHRlcm5hdGl2ZVxuICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUb3VjaEFjdGlvbihtYW5hZ2VyLCB2YWx1ZSkge1xuICAgIHRoaXMubWFuYWdlciA9IG1hbmFnZXI7XG4gICAgdGhpcy5zZXQodmFsdWUpO1xufVxuXG5Ub3VjaEFjdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogc2V0IHRoZSB0b3VjaEFjdGlvbiB2YWx1ZSBvbiB0aGUgZWxlbWVudCBvciBlbmFibGUgdGhlIHBvbHlmaWxsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyBmaW5kIG91dCB0aGUgdG91Y2gtYWN0aW9uIGJ5IHRoZSBldmVudCBoYW5kbGVyc1xuICAgICAgICBpZiAodmFsdWUgPT0gVE9VQ0hfQUNUSU9OX0NPTVBVVEUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5jb21wdXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoTkFUSVZFX1RPVUNIX0FDVElPTiAmJiB0aGlzLm1hbmFnZXIuZWxlbWVudC5zdHlsZSAmJiBUT1VDSF9BQ1RJT05fTUFQW3ZhbHVlXSkge1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVsZW1lbnQuc3R5bGVbUFJFRklYRURfVE9VQ0hfQUNUSU9OXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IHZhbHVlLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBqdXN0IHJlLXNldCB0aGUgdG91Y2hBY3Rpb24gdmFsdWVcbiAgICAgKi9cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldCh0aGlzLm1hbmFnZXIub3B0aW9ucy50b3VjaEFjdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNvbXB1dGUgdGhlIHZhbHVlIGZvciB0aGUgdG91Y2hBY3Rpb24gcHJvcGVydHkgYmFzZWQgb24gdGhlIHJlY29nbml6ZXIncyBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IHZhbHVlXG4gICAgICovXG4gICAgY29tcHV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgICAgIGVhY2godGhpcy5tYW5hZ2VyLnJlY29nbml6ZXJzLCBmdW5jdGlvbihyZWNvZ25pemVyKSB7XG4gICAgICAgICAgICBpZiAoYm9vbE9yRm4ocmVjb2duaXplci5vcHRpb25zLmVuYWJsZSwgW3JlY29nbml6ZXJdKSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMgPSBhY3Rpb25zLmNvbmNhdChyZWNvZ25pemVyLmdldFRvdWNoQWN0aW9uKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNsZWFuVG91Y2hBY3Rpb25zKGFjdGlvbnMuam9pbignICcpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogdGhpcyBtZXRob2QgaXMgY2FsbGVkIG9uIGVhY2ggaW5wdXQgY3ljbGUgYW5kIHByb3ZpZGVzIHRoZSBwcmV2ZW50aW5nIG9mIHRoZSBicm93c2VyIGJlaGF2aW9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gICAgICovXG4gICAgcHJldmVudERlZmF1bHRzOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgc3JjRXZlbnQgPSBpbnB1dC5zcmNFdmVudDtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IGlucHV0Lm9mZnNldERpcmVjdGlvbjtcblxuICAgICAgICAvLyBpZiB0aGUgdG91Y2ggYWN0aW9uIGRpZCBwcmV2ZW50ZWQgb25jZSB0aGlzIHNlc3Npb25cbiAgICAgICAgaWYgKHRoaXMubWFuYWdlci5zZXNzaW9uLnByZXZlbnRlZCkge1xuICAgICAgICAgICAgc3JjRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhY3Rpb25zID0gdGhpcy5hY3Rpb25zO1xuICAgICAgICB2YXIgaGFzTm9uZSA9IGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9OT05FKSAmJiAhVE9VQ0hfQUNUSU9OX01BUFtUT1VDSF9BQ1RJT05fTk9ORV07XG4gICAgICAgIHZhciBoYXNQYW5ZID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9ZKSAmJiAhVE9VQ0hfQUNUSU9OX01BUFtUT1VDSF9BQ1RJT05fUEFOX1ldO1xuICAgICAgICB2YXIgaGFzUGFuWCA9IGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9QQU5fWCkgJiYgIVRPVUNIX0FDVElPTl9NQVBbVE9VQ0hfQUNUSU9OX1BBTl9YXTtcblxuICAgICAgICBpZiAoaGFzTm9uZSkge1xuICAgICAgICAgICAgLy9kbyBub3QgcHJldmVudCBkZWZhdWx0cyBpZiB0aGlzIGlzIGEgdGFwIGdlc3R1cmVcblxuICAgICAgICAgICAgdmFyIGlzVGFwUG9pbnRlciA9IGlucHV0LnBvaW50ZXJzLmxlbmd0aCA9PT0gMTtcbiAgICAgICAgICAgIHZhciBpc1RhcE1vdmVtZW50ID0gaW5wdXQuZGlzdGFuY2UgPCAyO1xuICAgICAgICAgICAgdmFyIGlzVGFwVG91Y2hUaW1lID0gaW5wdXQuZGVsdGFUaW1lIDwgMjUwO1xuXG4gICAgICAgICAgICBpZiAoaXNUYXBQb2ludGVyICYmIGlzVGFwTW92ZW1lbnQgJiYgaXNUYXBUb3VjaFRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzUGFuWCAmJiBoYXNQYW5ZKSB7XG4gICAgICAgICAgICAvLyBgcGFuLXggcGFuLXlgIG1lYW5zIGJyb3dzZXIgaGFuZGxlcyBhbGwgc2Nyb2xsaW5nL3Bhbm5pbmcsIGRvIG5vdCBwcmV2ZW50XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzTm9uZSB8fFxuICAgICAgICAgICAgKGhhc1BhblkgJiYgZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHx8XG4gICAgICAgICAgICAoaGFzUGFuWCAmJiBkaXJlY3Rpb24gJiBESVJFQ1RJT05fVkVSVElDQUwpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcmV2ZW50U3JjKHNyY0V2ZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjYWxsIHByZXZlbnREZWZhdWx0IHRvIHByZXZlbnQgdGhlIGJyb3dzZXIncyBkZWZhdWx0IGJlaGF2aW9yIChzY3JvbGxpbmcgaW4gbW9zdCBjYXNlcylcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3JjRXZlbnRcbiAgICAgKi9cbiAgICBwcmV2ZW50U3JjOiBmdW5jdGlvbihzcmNFdmVudCkge1xuICAgICAgICB0aGlzLm1hbmFnZXIuc2Vzc2lvbi5wcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICBzcmNFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn07XG5cbi8qKlxuICogd2hlbiB0aGUgdG91Y2hBY3Rpb25zIGFyZSBjb2xsZWN0ZWQgdGhleSBhcmUgbm90IGEgdmFsaWQgdmFsdWUsIHNvIHdlIG5lZWQgdG8gY2xlYW4gdGhpbmdzIHVwLiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uc1xuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIGNsZWFuVG91Y2hBY3Rpb25zKGFjdGlvbnMpIHtcbiAgICAvLyBub25lXG4gICAgaWYgKGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9OT05FKSkge1xuICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX05PTkU7XG4gICAgfVxuXG4gICAgdmFyIGhhc1BhblggPSBpblN0cihhY3Rpb25zLCBUT1VDSF9BQ1RJT05fUEFOX1gpO1xuICAgIHZhciBoYXNQYW5ZID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9ZKTtcblxuICAgIC8vIGlmIGJvdGggcGFuLXggYW5kIHBhbi15IGFyZSBzZXQgKGRpZmZlcmVudCByZWNvZ25pemVyc1xuICAgIC8vIGZvciBkaWZmZXJlbnQgZGlyZWN0aW9ucywgZS5nLiBob3Jpem9udGFsIHBhbiBidXQgdmVydGljYWwgc3dpcGU/KVxuICAgIC8vIHdlIG5lZWQgbm9uZSAoYXMgb3RoZXJ3aXNlIHdpdGggcGFuLXggcGFuLXkgY29tYmluZWQgbm9uZSBvZiB0aGVzZVxuICAgIC8vIHJlY29nbml6ZXJzIHdpbGwgd29yaywgc2luY2UgdGhlIGJyb3dzZXIgd291bGQgaGFuZGxlIGFsbCBwYW5uaW5nXG4gICAgaWYgKGhhc1BhblggJiYgaGFzUGFuWSkge1xuICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX05PTkU7XG4gICAgfVxuXG4gICAgLy8gcGFuLXggT1IgcGFuLXlcbiAgICBpZiAoaGFzUGFuWCB8fCBoYXNQYW5ZKSB7XG4gICAgICAgIHJldHVybiBoYXNQYW5YID8gVE9VQ0hfQUNUSU9OX1BBTl9YIDogVE9VQ0hfQUNUSU9OX1BBTl9ZO1xuICAgIH1cblxuICAgIC8vIG1hbmlwdWxhdGlvblxuICAgIGlmIChpblN0cihhY3Rpb25zLCBUT1VDSF9BQ1RJT05fTUFOSVBVTEFUSU9OKSkge1xuICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX01BTklQVUxBVElPTjtcbiAgICB9XG5cbiAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX0FVVE87XG59XG5cbmZ1bmN0aW9uIGdldFRvdWNoQWN0aW9uUHJvcHMoKSB7XG4gICAgaWYgKCFOQVRJVkVfVE9VQ0hfQUNUSU9OKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHRvdWNoTWFwID0ge307XG4gICAgdmFyIGNzc1N1cHBvcnRzID0gd2luZG93LkNTUyAmJiB3aW5kb3cuQ1NTLnN1cHBvcnRzO1xuICAgIFsnYXV0bycsICdtYW5pcHVsYXRpb24nLCAncGFuLXknLCAncGFuLXgnLCAncGFuLXggcGFuLXknLCAnbm9uZSddLmZvckVhY2goZnVuY3Rpb24odmFsKSB7XG5cbiAgICAgICAgLy8gSWYgY3NzLnN1cHBvcnRzIGlzIG5vdCBzdXBwb3J0ZWQgYnV0IHRoZXJlIGlzIG5hdGl2ZSB0b3VjaC1hY3Rpb24gYXNzdW1lIGl0IHN1cHBvcnRzXG4gICAgICAgIC8vIGFsbCB2YWx1ZXMuIFRoaXMgaXMgdGhlIGNhc2UgZm9yIElFIDEwIGFuZCAxMS5cbiAgICAgICAgdG91Y2hNYXBbdmFsXSA9IGNzc1N1cHBvcnRzID8gd2luZG93LkNTUy5zdXBwb3J0cygndG91Y2gtYWN0aW9uJywgdmFsKSA6IHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRvdWNoTWFwO1xufVxuXG4vKipcbiAqIFJlY29nbml6ZXIgZmxvdyBleHBsYWluZWQ7ICpcbiAqIEFsbCByZWNvZ25pemVycyBoYXZlIHRoZSBpbml0aWFsIHN0YXRlIG9mIFBPU1NJQkxFIHdoZW4gYSBpbnB1dCBzZXNzaW9uIHN0YXJ0cy5cbiAqIFRoZSBkZWZpbml0aW9uIG9mIGEgaW5wdXQgc2Vzc2lvbiBpcyBmcm9tIHRoZSBmaXJzdCBpbnB1dCB1bnRpbCB0aGUgbGFzdCBpbnB1dCwgd2l0aCBhbGwgaXQncyBtb3ZlbWVudCBpbiBpdC4gKlxuICogRXhhbXBsZSBzZXNzaW9uIGZvciBtb3VzZS1pbnB1dDogbW91c2Vkb3duIC0+IG1vdXNlbW92ZSAtPiBtb3VzZXVwXG4gKlxuICogT24gZWFjaCByZWNvZ25pemluZyBjeWNsZSAoc2VlIE1hbmFnZXIucmVjb2duaXplKSB0aGUgLnJlY29nbml6ZSgpIG1ldGhvZCBpcyBleGVjdXRlZFxuICogd2hpY2ggZGV0ZXJtaW5lcyB3aXRoIHN0YXRlIGl0IHNob3VsZCBiZS5cbiAqXG4gKiBJZiB0aGUgcmVjb2duaXplciBoYXMgdGhlIHN0YXRlIEZBSUxFRCwgQ0FOQ0VMTEVEIG9yIFJFQ09HTklaRUQgKGVxdWFscyBFTkRFRCksIGl0IGlzIHJlc2V0IHRvXG4gKiBQT1NTSUJMRSB0byBnaXZlIGl0IGFub3RoZXIgY2hhbmdlIG9uIHRoZSBuZXh0IGN5Y2xlLlxuICpcbiAqICAgICAgICAgICAgICAgUG9zc2libGVcbiAqICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICArLS0tLS0rLS0tLS0tLS0tLS0tLS0tK1xuICogICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICArLS0tLS0rLS0tLS0rICAgICAgICAgICAgICAgfFxuICogICAgICB8ICAgICAgICAgICB8ICAgICAgICAgICAgICAgfFxuICogICBGYWlsZWQgICAgICBDYW5jZWxsZWQgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICstLS0tLS0tKy0tLS0tLStcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICBSZWNvZ25pemVkICAgICAgIEJlZ2FuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENoYW5nZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFbmRlZC9SZWNvZ25pemVkXG4gKi9cbnZhciBTVEFURV9QT1NTSUJMRSA9IDE7XG52YXIgU1RBVEVfQkVHQU4gPSAyO1xudmFyIFNUQVRFX0NIQU5HRUQgPSA0O1xudmFyIFNUQVRFX0VOREVEID0gODtcbnZhciBTVEFURV9SRUNPR05JWkVEID0gU1RBVEVfRU5ERUQ7XG52YXIgU1RBVEVfQ0FOQ0VMTEVEID0gMTY7XG52YXIgU1RBVEVfRkFJTEVEID0gMzI7XG5cbi8qKlxuICogUmVjb2duaXplclxuICogRXZlcnkgcmVjb2duaXplciBuZWVkcyB0byBleHRlbmQgZnJvbSB0aGlzIGNsYXNzLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5mdW5jdGlvbiBSZWNvZ25pemVyKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBhc3NpZ24oe30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMgfHwge30pO1xuXG4gICAgdGhpcy5pZCA9IHVuaXF1ZUlkKCk7XG5cbiAgICB0aGlzLm1hbmFnZXIgPSBudWxsO1xuXG4gICAgLy8gZGVmYXVsdCBpcyBlbmFibGUgdHJ1ZVxuICAgIHRoaXMub3B0aW9ucy5lbmFibGUgPSBpZlVuZGVmaW5lZCh0aGlzLm9wdGlvbnMuZW5hYmxlLCB0cnVlKTtcblxuICAgIHRoaXMuc3RhdGUgPSBTVEFURV9QT1NTSUJMRTtcblxuICAgIHRoaXMuc2ltdWx0YW5lb3VzID0ge307XG4gICAgdGhpcy5yZXF1aXJlRmFpbCA9IFtdO1xufVxuXG5SZWNvZ25pemVyLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBAdmlydHVhbFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdHM6IHt9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge1JlY29nbml6ZXJ9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIGFsc28gdXBkYXRlIHRoZSB0b3VjaEFjdGlvbiwgaW4gY2FzZSBzb21ldGhpbmcgY2hhbmdlZCBhYm91dCB0aGUgZGlyZWN0aW9ucy9lbmFibGVkIHN0YXRlXG4gICAgICAgIHRoaXMubWFuYWdlciAmJiB0aGlzLm1hbmFnZXIudG91Y2hBY3Rpb24udXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWNvZ25pemUgc2ltdWx0YW5lb3VzIHdpdGggYW4gb3RoZXIgcmVjb2duaXplci5cbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IG90aGVyUmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfSB0aGlzXG4gICAgICovXG4gICAgcmVjb2duaXplV2l0aDogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdyZWNvZ25pemVXaXRoJywgdGhpcykpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNpbXVsdGFuZW91cyA9IHRoaXMuc2ltdWx0YW5lb3VzO1xuICAgICAgICBvdGhlclJlY29nbml6ZXIgPSBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgdGhpcyk7XG4gICAgICAgIGlmICghc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF0pIHtcbiAgICAgICAgICAgIHNpbXVsdGFuZW91c1tvdGhlclJlY29nbml6ZXIuaWRdID0gb3RoZXJSZWNvZ25pemVyO1xuICAgICAgICAgICAgb3RoZXJSZWNvZ25pemVyLnJlY29nbml6ZVdpdGgodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGRyb3AgdGhlIHNpbXVsdGFuZW91cyBsaW5rLiBpdCBkb2VzbnQgcmVtb3ZlIHRoZSBsaW5rIG9uIHRoZSBvdGhlciByZWNvZ25pemVyLlxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gb3RoZXJSZWNvZ25pemVyXG4gICAgICogQHJldHVybnMge1JlY29nbml6ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICBkcm9wUmVjb2duaXplV2l0aDogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdkcm9wUmVjb2duaXplV2l0aCcsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIG90aGVyUmVjb2duaXplciA9IGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCB0aGlzKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWNvZ25pemVyIGNhbiBvbmx5IHJ1biB3aGVuIGFuIG90aGVyIGlzIGZhaWxpbmdcbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IG90aGVyUmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfSB0aGlzXG4gICAgICovXG4gICAgcmVxdWlyZUZhaWx1cmU6IGZ1bmN0aW9uKG90aGVyUmVjb2duaXplcikge1xuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcob3RoZXJSZWNvZ25pemVyLCAncmVxdWlyZUZhaWx1cmUnLCB0aGlzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVxdWlyZUZhaWwgPSB0aGlzLnJlcXVpcmVGYWlsO1xuICAgICAgICBvdGhlclJlY29nbml6ZXIgPSBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgdGhpcyk7XG4gICAgICAgIGlmIChpbkFycmF5KHJlcXVpcmVGYWlsLCBvdGhlclJlY29nbml6ZXIpID09PSAtMSkge1xuICAgICAgICAgICAgcmVxdWlyZUZhaWwucHVzaChvdGhlclJlY29nbml6ZXIpO1xuICAgICAgICAgICAgb3RoZXJSZWNvZ25pemVyLnJlcXVpcmVGYWlsdXJlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBkcm9wIHRoZSByZXF1aXJlRmFpbHVyZSBsaW5rLiBpdCBkb2VzIG5vdCByZW1vdmUgdGhlIGxpbmsgb24gdGhlIG90aGVyIHJlY29nbml6ZXIuXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcn0gdGhpc1xuICAgICAqL1xuICAgIGRyb3BSZXF1aXJlRmFpbHVyZTogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdkcm9wUmVxdWlyZUZhaWx1cmUnLCB0aGlzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBvdGhlclJlY29nbml6ZXIgPSBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgdGhpcyk7XG4gICAgICAgIHZhciBpbmRleCA9IGluQXJyYXkodGhpcy5yZXF1aXJlRmFpbCwgb3RoZXJSZWNvZ25pemVyKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWlyZUZhaWwuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaGFzIHJlcXVpcmUgZmFpbHVyZXMgYm9vbGVhblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGhhc1JlcXVpcmVGYWlsdXJlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVpcmVGYWlsLmxlbmd0aCA+IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlmIHRoZSByZWNvZ25pemVyIGNhbiByZWNvZ25pemUgc2ltdWx0YW5lb3VzIHdpdGggYW4gb3RoZXIgcmVjb2duaXplclxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gb3RoZXJSZWNvZ25pemVyXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgY2FuUmVjb2duaXplV2l0aDogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFlvdSBzaG91bGQgdXNlIGB0cnlFbWl0YCBpbnN0ZWFkIG9mIGBlbWl0YCBkaXJlY3RseSB0byBjaGVja1xuICAgICAqIHRoYXQgYWxsIHRoZSBuZWVkZWQgcmVjb2duaXplcnMgaGFzIGZhaWxlZCBiZWZvcmUgZW1pdHRpbmcuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gICAgICovXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGZ1bmN0aW9uIGVtaXQoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYubWFuYWdlci5lbWl0KGV2ZW50LCBpbnB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAncGFuc3RhcnQnIGFuZCAncGFubW92ZSdcbiAgICAgICAgaWYgKHN0YXRlIDwgU1RBVEVfRU5ERUQpIHtcbiAgICAgICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50ICsgc3RhdGVTdHIoc3RhdGUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50KTsgLy8gc2ltcGxlICdldmVudE5hbWUnIGV2ZW50c1xuXG4gICAgICAgIGlmIChpbnB1dC5hZGRpdGlvbmFsRXZlbnQpIHsgLy8gYWRkaXRpb25hbCBldmVudChwYW5sZWZ0LCBwYW5yaWdodCwgcGluY2hpbiwgcGluY2hvdXQuLi4pXG4gICAgICAgICAgICBlbWl0KGlucHV0LmFkZGl0aW9uYWxFdmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwYW5lbmQgYW5kIHBhbmNhbmNlbFxuICAgICAgICBpZiAoc3RhdGUgPj0gU1RBVEVfRU5ERUQpIHtcbiAgICAgICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50ICsgc3RhdGVTdHIoc3RhdGUpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB0aGF0IGFsbCB0aGUgcmVxdWlyZSBmYWlsdXJlIHJlY29nbml6ZXJzIGhhcyBmYWlsZWQsXG4gICAgICogaWYgdHJ1ZSwgaXQgZW1pdHMgYSBnZXN0dXJlIGV2ZW50LFxuICAgICAqIG90aGVyd2lzZSwgc2V0dXAgdGhlIHN0YXRlIHRvIEZBSUxFRC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKi9cbiAgICB0cnlFbWl0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5jYW5FbWl0KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVtaXQoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGl0J3MgZmFpbGluZyBhbnl3YXlcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX0ZBSUxFRDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2FuIHdlIGVtaXQ/XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgY2FuRW1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLnJlcXVpcmVGYWlsLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKCEodGhpcy5yZXF1aXJlRmFpbFtpXS5zdGF0ZSAmIChTVEFURV9GQUlMRUQgfCBTVEFURV9QT1NTSUJMRSkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB1cGRhdGUgdGhlIHJlY29nbml6ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXG4gICAgICovXG4gICAgcmVjb2duaXplOiBmdW5jdGlvbihpbnB1dERhdGEpIHtcbiAgICAgICAgLy8gbWFrZSBhIG5ldyBjb3B5IG9mIHRoZSBpbnB1dERhdGFcbiAgICAgICAgLy8gc28gd2UgY2FuIGNoYW5nZSB0aGUgaW5wdXREYXRhIHdpdGhvdXQgbWVzc2luZyB1cCB0aGUgb3RoZXIgcmVjb2duaXplcnNcbiAgICAgICAgdmFyIGlucHV0RGF0YUNsb25lID0gYXNzaWduKHt9LCBpbnB1dERhdGEpO1xuXG4gICAgICAgIC8vIGlzIGlzIGVuYWJsZWQgYW5kIGFsbG93IHJlY29nbml6aW5nP1xuICAgICAgICBpZiAoIWJvb2xPckZuKHRoaXMub3B0aW9ucy5lbmFibGUsIFt0aGlzLCBpbnB1dERhdGFDbG9uZV0pKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfRkFJTEVEO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVzZXQgd2hlbiB3ZSd2ZSByZWFjaGVkIHRoZSBlbmRcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiAoU1RBVEVfUkVDT0dOSVpFRCB8IFNUQVRFX0NBTkNFTExFRCB8IFNUQVRFX0ZBSUxFRCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURV9QT1NTSUJMRTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnByb2Nlc3MoaW5wdXREYXRhQ2xvbmUpO1xuXG4gICAgICAgIC8vIHRoZSByZWNvZ25pemVyIGhhcyByZWNvZ25pemVkIGEgZ2VzdHVyZVxuICAgICAgICAvLyBzbyB0cmlnZ2VyIGFuIGV2ZW50XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYgKFNUQVRFX0JFR0FOIHwgU1RBVEVfQ0hBTkdFRCB8IFNUQVRFX0VOREVEIHwgU1RBVEVfQ0FOQ0VMTEVEKSkge1xuICAgICAgICAgICAgdGhpcy50cnlFbWl0KGlucHV0RGF0YUNsb25lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gdGhlIHN0YXRlIG9mIHRoZSByZWNvZ25pemVyXG4gICAgICogdGhlIGFjdHVhbCByZWNvZ25pemluZyBoYXBwZW5zIGluIHRoaXMgbWV0aG9kXG4gICAgICogQHZpcnR1YWxcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXG4gICAgICogQHJldHVybnMge0NvbnN0fSBTVEFURVxuICAgICAqL1xuICAgIHByb2Nlc3M6IGZ1bmN0aW9uKGlucHV0RGF0YSkgeyB9LCAvLyBqc2hpbnQgaWdub3JlOmxpbmVcblxuICAgIC8qKlxuICAgICAqIHJldHVybiB0aGUgcHJlZmVycmVkIHRvdWNoLWFjdGlvblxuICAgICAqIEB2aXJ0dWFsXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqL1xuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHsgfSxcblxuICAgIC8qKlxuICAgICAqIGNhbGxlZCB3aGVuIHRoZSBnZXN0dXJlIGlzbid0IGFsbG93ZWQgdG8gcmVjb2duaXplXG4gICAgICogbGlrZSB3aGVuIGFub3RoZXIgaXMgYmVpbmcgcmVjb2duaXplZCBvciBpdCBpcyBkaXNhYmxlZFxuICAgICAqIEB2aXJ0dWFsXG4gICAgICovXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkgeyB9XG59O1xuXG4vKipcbiAqIGdldCBhIHVzYWJsZSBzdHJpbmcsIHVzZWQgYXMgZXZlbnQgcG9zdGZpeFxuICogQHBhcmFtIHtDb25zdH0gc3RhdGVcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0YXRlXG4gKi9cbmZ1bmN0aW9uIHN0YXRlU3RyKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlICYgU1RBVEVfQ0FOQ0VMTEVEKSB7XG4gICAgICAgIHJldHVybiAnY2FuY2VsJztcbiAgICB9IGVsc2UgaWYgKHN0YXRlICYgU1RBVEVfRU5ERUQpIHtcbiAgICAgICAgcmV0dXJuICdlbmQnO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgJiBTVEFURV9DSEFOR0VEKSB7XG4gICAgICAgIHJldHVybiAnbW92ZSc7XG4gICAgfSBlbHNlIGlmIChzdGF0ZSAmIFNUQVRFX0JFR0FOKSB7XG4gICAgICAgIHJldHVybiAnc3RhcnQnO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogZGlyZWN0aW9uIGNvbnMgdG8gc3RyaW5nXG4gKiBAcGFyYW0ge0NvbnN0fSBkaXJlY3Rpb25cbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGRpcmVjdGlvblN0cihkaXJlY3Rpb24pIHtcbiAgICBpZiAoZGlyZWN0aW9uID09IERJUkVDVElPTl9ET1dOKSB7XG4gICAgICAgIHJldHVybiAnZG93bic7XG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX1VQKSB7XG4gICAgICAgIHJldHVybiAndXAnO1xuICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09IERJUkVDVElPTl9MRUZUKSB7XG4gICAgICAgIHJldHVybiAnbGVmdCc7XG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX1JJR0hUKSB7XG4gICAgICAgIHJldHVybiAncmlnaHQnO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogZ2V0IGEgcmVjb2duaXplciBieSBuYW1lIGlmIGl0IGlzIGJvdW5kIHRvIGEgbWFuYWdlclxuICogQHBhcmFtIHtSZWNvZ25pemVyfFN0cmluZ30gb3RoZXJSZWNvZ25pemVyXG4gKiBAcGFyYW0ge1JlY29nbml6ZXJ9IHJlY29nbml6ZXJcbiAqIEByZXR1cm5zIHtSZWNvZ25pemVyfVxuICovXG5mdW5jdGlvbiBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgcmVjb2duaXplcikge1xuICAgIHZhciBtYW5hZ2VyID0gcmVjb2duaXplci5tYW5hZ2VyO1xuICAgIGlmIChtYW5hZ2VyKSB7XG4gICAgICAgIHJldHVybiBtYW5hZ2VyLmdldChvdGhlclJlY29nbml6ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gb3RoZXJSZWNvZ25pemVyO1xufVxuXG4vKipcbiAqIFRoaXMgcmVjb2duaXplciBpcyBqdXN0IHVzZWQgYXMgYSBiYXNlIGZvciB0aGUgc2ltcGxlIGF0dHJpYnV0ZSByZWNvZ25pemVycy5cbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBBdHRyUmVjb2duaXplcigpIHtcbiAgICBSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmluaGVyaXQoQXR0clJlY29nbml6ZXIsIFJlY29nbml6ZXIsIHtcbiAgICAvKipcbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICogQG1lbWJlcm9mIEF0dHJSZWNvZ25pemVyXG4gICAgICovXG4gICAgZGVmYXVsdHM6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqIEBkZWZhdWx0IDFcbiAgICAgICAgICovXG4gICAgICAgIHBvaW50ZXJzOiAxXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gY2hlY2sgaWYgaXQgdGhlIHJlY29nbml6ZXIgcmVjZWl2ZXMgdmFsaWQgaW5wdXQsIGxpa2UgaW5wdXQuZGlzdGFuY2UgPiAxMC5cbiAgICAgKiBAbWVtYmVyb2YgQXR0clJlY29nbml6ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gcmVjb2duaXplZFxuICAgICAqL1xuICAgIGF0dHJUZXN0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgb3B0aW9uUG9pbnRlcnMgPSB0aGlzLm9wdGlvbnMucG9pbnRlcnM7XG4gICAgICAgIHJldHVybiBvcHRpb25Qb2ludGVycyA9PT0gMCB8fCBpbnB1dC5wb2ludGVycy5sZW5ndGggPT09IG9wdGlvblBvaW50ZXJzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIHRoZSBpbnB1dCBhbmQgcmV0dXJuIHRoZSBzdGF0ZSBmb3IgdGhlIHJlY29nbml6ZXJcbiAgICAgKiBAbWVtYmVyb2YgQXR0clJlY29nbml6ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKiBAcmV0dXJucyB7Kn0gU3RhdGVcbiAgICAgKi9cbiAgICBwcm9jZXNzOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgZXZlbnRUeXBlID0gaW5wdXQuZXZlbnRUeXBlO1xuXG4gICAgICAgIHZhciBpc1JlY29nbml6ZWQgPSBzdGF0ZSAmIChTVEFURV9CRUdBTiB8IFNUQVRFX0NIQU5HRUQpO1xuICAgICAgICB2YXIgaXNWYWxpZCA9IHRoaXMuYXR0clRlc3QoaW5wdXQpO1xuXG4gICAgICAgIC8vIG9uIGNhbmNlbCBpbnB1dCBhbmQgd2UndmUgcmVjb2duaXplZCBiZWZvcmUsIHJldHVybiBTVEFURV9DQU5DRUxMRURcbiAgICAgICAgaWYgKGlzUmVjb2duaXplZCAmJiAoZXZlbnRUeXBlICYgSU5QVVRfQ0FOQ0VMIHx8ICFpc1ZhbGlkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlIHwgU1RBVEVfQ0FOQ0VMTEVEO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUmVjb2duaXplZCB8fCBpc1ZhbGlkKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlIHwgU1RBVEVfRU5ERUQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCEoc3RhdGUgJiBTVEFURV9CRUdBTikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfQkVHQU47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUgfCBTVEFURV9DSEFOR0VEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBTVEFURV9GQUlMRUQ7XG4gICAgfVxufSk7XG5cbi8qKlxuICogUGFuXG4gKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgZG93biBhbmQgbW92ZWQgaW4gdGhlIGFsbG93ZWQgZGlyZWN0aW9uLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBQYW5SZWNvZ25pemVyKCkge1xuICAgIEF0dHJSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLnBYID0gbnVsbDtcbiAgICB0aGlzLnBZID0gbnVsbDtcbn1cblxuaW5oZXJpdChQYW5SZWNvZ25pemVyLCBBdHRyUmVjb2duaXplciwge1xuICAgIC8qKlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKiBAbWVtYmVyb2YgUGFuUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAncGFuJyxcbiAgICAgICAgdGhyZXNob2xkOiAxMCxcbiAgICAgICAgcG9pbnRlcnM6IDEsXG4gICAgICAgIGRpcmVjdGlvbjogRElSRUNUSU9OX0FMTFxuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uO1xuICAgICAgICB2YXIgYWN0aW9ucyA9IFtdO1xuICAgICAgICBpZiAoZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChUT1VDSF9BQ1RJT05fUEFOX1kpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkaXJlY3Rpb24gJiBESVJFQ1RJT05fVkVSVElDQUwpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChUT1VDSF9BQ1RJT05fUEFOX1gpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3Rpb25zO1xuICAgIH0sXG5cbiAgICBkaXJlY3Rpb25UZXN0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgdmFyIGhhc01vdmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gaW5wdXQuZGlzdGFuY2U7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBpbnB1dC5kaXJlY3Rpb247XG4gICAgICAgIHZhciB4ID0gaW5wdXQuZGVsdGFYO1xuICAgICAgICB2YXIgeSA9IGlucHV0LmRlbHRhWTtcblxuICAgICAgICAvLyBsb2NrIHRvIGF4aXM/XG4gICAgICAgIGlmICghKGRpcmVjdGlvbiAmIG9wdGlvbnMuZGlyZWN0aW9uKSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSAoeCA9PT0gMCkgPyBESVJFQ1RJT05fTk9ORSA6ICh4IDwgMCkgPyBESVJFQ1RJT05fTEVGVCA6IERJUkVDVElPTl9SSUdIVDtcbiAgICAgICAgICAgICAgICBoYXNNb3ZlZCA9IHggIT0gdGhpcy5wWDtcbiAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IE1hdGguYWJzKGlucHV0LmRlbHRhWCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9ICh5ID09PSAwKSA/IERJUkVDVElPTl9OT05FIDogKHkgPCAwKSA/IERJUkVDVElPTl9VUCA6IERJUkVDVElPTl9ET1dOO1xuICAgICAgICAgICAgICAgIGhhc01vdmVkID0geSAhPSB0aGlzLnBZO1xuICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoaW5wdXQuZGVsdGFZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpbnB1dC5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgICAgIHJldHVybiBoYXNNb3ZlZCAmJiBkaXN0YW5jZSA+IG9wdGlvbnMudGhyZXNob2xkICYmIGRpcmVjdGlvbiAmIG9wdGlvbnMuZGlyZWN0aW9uO1xuICAgIH0sXG5cbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIEF0dHJSZWNvZ25pemVyLnByb3RvdHlwZS5hdHRyVGVzdC5jYWxsKHRoaXMsIGlucHV0KSAmJlxuICAgICAgICAgICAgKHRoaXMuc3RhdGUgJiBTVEFURV9CRUdBTiB8fCAoISh0aGlzLnN0YXRlICYgU1RBVEVfQkVHQU4pICYmIHRoaXMuZGlyZWN0aW9uVGVzdChpbnB1dCkpKTtcbiAgICB9LFxuXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgICAgICB0aGlzLnBYID0gaW5wdXQuZGVsdGFYO1xuICAgICAgICB0aGlzLnBZID0gaW5wdXQuZGVsdGFZO1xuXG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBkaXJlY3Rpb25TdHIoaW5wdXQuZGlyZWN0aW9uKTtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICBpbnB1dC5hZGRpdGlvbmFsRXZlbnQgPSB0aGlzLm9wdGlvbnMuZXZlbnQgKyBkaXJlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc3VwZXIuZW1pdC5jYWxsKHRoaXMsIGlucHV0KTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBQaW5jaFxuICogUmVjb2duaXplZCB3aGVuIHR3byBvciBtb3JlIHBvaW50ZXJzIGFyZSBtb3ZpbmcgdG93YXJkICh6b29tLWluKSBvciBhd2F5IGZyb20gZWFjaCBvdGhlciAoem9vbS1vdXQpLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBQaW5jaFJlY29nbml6ZXIoKSB7XG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChQaW5jaFJlY29nbml6ZXIsIEF0dHJSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBQaW5jaFJlY29nbml6ZXJcbiAgICAgKi9cbiAgICBkZWZhdWx0czoge1xuICAgICAgICBldmVudDogJ3BpbmNoJyxcbiAgICAgICAgdGhyZXNob2xkOiAwLFxuICAgICAgICBwb2ludGVyczogMlxuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBbVE9VQ0hfQUNUSU9OX05PTkVdO1xuICAgIH0sXG5cbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXG4gICAgICAgICAgICAoTWF0aC5hYnMoaW5wdXQuc2NhbGUgLSAxKSA+IHRoaXMub3B0aW9ucy50aHJlc2hvbGQgfHwgdGhpcy5zdGF0ZSAmIFNUQVRFX0JFR0FOKTtcbiAgICB9LFxuXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0LnNjYWxlICE9PSAxKSB7XG4gICAgICAgICAgICB2YXIgaW5PdXQgPSBpbnB1dC5zY2FsZSA8IDEgPyAnaW4nIDogJ291dCc7XG4gICAgICAgICAgICBpbnB1dC5hZGRpdGlvbmFsRXZlbnQgPSB0aGlzLm9wdGlvbnMuZXZlbnQgKyBpbk91dDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zdXBlci5lbWl0LmNhbGwodGhpcywgaW5wdXQpO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIFByZXNzXG4gKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgZG93biBmb3IgeCBtcyB3aXRob3V0IGFueSBtb3ZlbWVudC5cbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBQcmVzc1JlY29nbml6ZXIoKSB7XG4gICAgUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICAgIHRoaXMuX2lucHV0ID0gbnVsbDtcbn1cblxuaW5oZXJpdChQcmVzc1JlY29nbml6ZXIsIFJlY29nbml6ZXIsIHtcbiAgICAvKipcbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICogQG1lbWJlcm9mIFByZXNzUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAncHJlc3MnLFxuICAgICAgICBwb2ludGVyczogMSxcbiAgICAgICAgdGltZTogMjUxLCAvLyBtaW5pbWFsIHRpbWUgb2YgdGhlIHBvaW50ZXIgdG8gYmUgcHJlc3NlZFxuICAgICAgICB0aHJlc2hvbGQ6IDkgLy8gYSBtaW5pbWFsIG1vdmVtZW50IGlzIG9rLCBidXQga2VlcCBpdCBsb3dcbiAgICB9LFxuXG4gICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gW1RPVUNIX0FDVElPTl9BVVRPXTtcbiAgICB9LFxuXG4gICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgIHZhciB2YWxpZFBvaW50ZXJzID0gaW5wdXQucG9pbnRlcnMubGVuZ3RoID09PSBvcHRpb25zLnBvaW50ZXJzO1xuICAgICAgICB2YXIgdmFsaWRNb3ZlbWVudCA9IGlucHV0LmRpc3RhbmNlIDwgb3B0aW9ucy50aHJlc2hvbGQ7XG4gICAgICAgIHZhciB2YWxpZFRpbWUgPSBpbnB1dC5kZWx0YVRpbWUgPiBvcHRpb25zLnRpbWU7XG5cbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcblxuICAgICAgICAvLyB3ZSBvbmx5IGFsbG93IGxpdHRsZSBtb3ZlbWVudFxuICAgICAgICAvLyBhbmQgd2UndmUgcmVhY2hlZCBhbiBlbmQgZXZlbnQsIHNvIGEgdGFwIGlzIHBvc3NpYmxlXG4gICAgICAgIGlmICghdmFsaWRNb3ZlbWVudCB8fCAhdmFsaWRQb2ludGVycyB8fCAoaW5wdXQuZXZlbnRUeXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkgJiYgIXZhbGlkVGltZSkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5ldmVudFR5cGUgJiBJTlBVVF9TVEFSVCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0Q29udGV4dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfUkVDT0dOSVpFRDtcbiAgICAgICAgICAgICAgICB0aGlzLnRyeUVtaXQoKTtcbiAgICAgICAgICAgIH0sIG9wdGlvbnMudGltZSwgdGhpcyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICByZXR1cm4gU1RBVEVfUkVDT0dOSVpFRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gU1RBVEVfRkFJTEVEO1xuICAgIH0sXG5cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gICAgfSxcblxuICAgIGVtaXQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICE9PSBTVEFURV9SRUNPR05JWkVEKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5wdXQgJiYgKGlucHV0LmV2ZW50VHlwZSAmIElOUFVUX0VORCkpIHtcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCArICd1cCcsIGlucHV0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2lucHV0LnRpbWVTdGFtcCA9IG5vdygpO1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50LCB0aGlzLl9pbnB1dCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuLyoqXG4gKiBSb3RhdGVcbiAqIFJlY29nbml6ZWQgd2hlbiB0d28gb3IgbW9yZSBwb2ludGVyIGFyZSBtb3ZpbmcgaW4gYSBjaXJjdWxhciBtb3Rpb24uXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIEF0dHJSZWNvZ25pemVyXG4gKi9cbmZ1bmN0aW9uIFJvdGF0ZVJlY29nbml6ZXIoKSB7XG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChSb3RhdGVSZWNvZ25pemVyLCBBdHRyUmVjb2duaXplciwge1xuICAgIC8qKlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKiBAbWVtYmVyb2YgUm90YXRlUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAncm90YXRlJyxcbiAgICAgICAgdGhyZXNob2xkOiAwLFxuICAgICAgICBwb2ludGVyczogMlxuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBbVE9VQ0hfQUNUSU9OX05PTkVdO1xuICAgIH0sXG5cbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXG4gICAgICAgICAgICAoTWF0aC5hYnMoaW5wdXQucm90YXRpb24pID4gdGhpcy5vcHRpb25zLnRocmVzaG9sZCB8fCB0aGlzLnN0YXRlICYgU1RBVEVfQkVHQU4pO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIFN3aXBlXG4gKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgbW92aW5nIGZhc3QgKHZlbG9jaXR5KSwgd2l0aCBlbm91Z2ggZGlzdGFuY2UgaW4gdGhlIGFsbG93ZWQgZGlyZWN0aW9uLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBTd2lwZVJlY29nbml6ZXIoKSB7XG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChTd2lwZVJlY29nbml6ZXIsIEF0dHJSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBTd2lwZVJlY29nbml6ZXJcbiAgICAgKi9cbiAgICBkZWZhdWx0czoge1xuICAgICAgICBldmVudDogJ3N3aXBlJyxcbiAgICAgICAgdGhyZXNob2xkOiAxMCxcbiAgICAgICAgdmVsb2NpdHk6IDAuMyxcbiAgICAgICAgZGlyZWN0aW9uOiBESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTCxcbiAgICAgICAgcG9pbnRlcnM6IDFcbiAgICB9LFxuXG4gICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gUGFuUmVjb2duaXplci5wcm90b3R5cGUuZ2V0VG91Y2hBY3Rpb24uY2FsbCh0aGlzKTtcbiAgICB9LFxuXG4gICAgYXR0clRlc3Q6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uO1xuICAgICAgICB2YXIgdmVsb2NpdHk7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiAmIChESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTCkpIHtcbiAgICAgICAgICAgIHZlbG9jaXR5ID0gaW5wdXQub3ZlcmFsbFZlbG9jaXR5O1xuICAgICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiAmIERJUkVDVElPTl9IT1JJWk9OVEFMKSB7XG4gICAgICAgICAgICB2ZWxvY2l0eSA9IGlucHV0Lm92ZXJhbGxWZWxvY2l0eVg7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uICYgRElSRUNUSU9OX1ZFUlRJQ0FMKSB7XG4gICAgICAgICAgICB2ZWxvY2l0eSA9IGlucHV0Lm92ZXJhbGxWZWxvY2l0eVk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3VwZXIuYXR0clRlc3QuY2FsbCh0aGlzLCBpbnB1dCkgJiZcbiAgICAgICAgICAgIGRpcmVjdGlvbiAmIGlucHV0Lm9mZnNldERpcmVjdGlvbiAmJlxuICAgICAgICAgICAgaW5wdXQuZGlzdGFuY2UgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkICYmXG4gICAgICAgICAgICBpbnB1dC5tYXhQb2ludGVycyA9PSB0aGlzLm9wdGlvbnMucG9pbnRlcnMgJiZcbiAgICAgICAgICAgIGFicyh2ZWxvY2l0eSkgPiB0aGlzLm9wdGlvbnMudmVsb2NpdHkgJiYgaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfRU5EO1xuICAgIH0sXG5cbiAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gZGlyZWN0aW9uU3RyKGlucHV0Lm9mZnNldERpcmVjdGlvbik7XG4gICAgICAgIGlmIChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCArIGRpcmVjdGlvbiwgaW5wdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50LCBpbnB1dCk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQSB0YXAgaXMgZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgZG9pbmcgYSBzbWFsbCB0YXAvY2xpY2suIE11bHRpcGxlIHRhcHMgYXJlIHJlY29nbml6ZWQgaWYgdGhleSBvY2N1clxuICogYmV0d2VlbiB0aGUgZ2l2ZW4gaW50ZXJ2YWwgYW5kIHBvc2l0aW9uLiBUaGUgZGVsYXkgb3B0aW9uIGNhbiBiZSB1c2VkIHRvIHJlY29nbml6ZSBtdWx0aS10YXBzIHdpdGhvdXQgZmlyaW5nXG4gKiBhIHNpbmdsZSB0YXAuXG4gKlxuICogVGhlIGV2ZW50RGF0YSBmcm9tIHRoZSBlbWl0dGVkIGV2ZW50IGNvbnRhaW5zIHRoZSBwcm9wZXJ0eSBgdGFwQ291bnRgLCB3aGljaCBjb250YWlucyB0aGUgYW1vdW50IG9mXG4gKiBtdWx0aS10YXBzIGJlaW5nIHJlY29nbml6ZWQuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIFJlY29nbml6ZXJcbiAqL1xuZnVuY3Rpb24gVGFwUmVjb2duaXplcigpIHtcbiAgICBSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAvLyBwcmV2aW91cyB0aW1lIGFuZCBjZW50ZXIsXG4gICAgLy8gdXNlZCBmb3IgdGFwIGNvdW50aW5nXG4gICAgdGhpcy5wVGltZSA9IGZhbHNlO1xuICAgIHRoaXMucENlbnRlciA9IGZhbHNlO1xuXG4gICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICAgIHRoaXMuX2lucHV0ID0gbnVsbDtcbiAgICB0aGlzLmNvdW50ID0gMDtcbn1cblxuaW5oZXJpdChUYXBSZWNvZ25pemVyLCBSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBQaW5jaFJlY29nbml6ZXJcbiAgICAgKi9cbiAgICBkZWZhdWx0czoge1xuICAgICAgICBldmVudDogJ3RhcCcsXG4gICAgICAgIHBvaW50ZXJzOiAxLFxuICAgICAgICB0YXBzOiAxLFxuICAgICAgICBpbnRlcnZhbDogMzAwLCAvLyBtYXggdGltZSBiZXR3ZWVuIHRoZSBtdWx0aS10YXAgdGFwc1xuICAgICAgICB0aW1lOiAyNTAsIC8vIG1heCB0aW1lIG9mIHRoZSBwb2ludGVyIHRvIGJlIGRvd24gKGxpa2UgZmluZ2VyIG9uIHRoZSBzY3JlZW4pXG4gICAgICAgIHRocmVzaG9sZDogOSwgLy8gYSBtaW5pbWFsIG1vdmVtZW50IGlzIG9rLCBidXQga2VlcCBpdCBsb3dcbiAgICAgICAgcG9zVGhyZXNob2xkOiAxMCAvLyBhIG11bHRpLXRhcCBjYW4gYmUgYSBiaXQgb2ZmIHRoZSBpbml0aWFsIHBvc2l0aW9uXG4gICAgfSxcblxuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFtUT1VDSF9BQ1RJT05fTUFOSVBVTEFUSU9OXTtcbiAgICB9LFxuXG4gICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgdmFyIHZhbGlkUG9pbnRlcnMgPSBpbnB1dC5wb2ludGVycy5sZW5ndGggPT09IG9wdGlvbnMucG9pbnRlcnM7XG4gICAgICAgIHZhciB2YWxpZE1vdmVtZW50ID0gaW5wdXQuZGlzdGFuY2UgPCBvcHRpb25zLnRocmVzaG9sZDtcbiAgICAgICAgdmFyIHZhbGlkVG91Y2hUaW1lID0gaW5wdXQuZGVsdGFUaW1lIDwgb3B0aW9ucy50aW1lO1xuXG4gICAgICAgIHRoaXMucmVzZXQoKTtcblxuICAgICAgICBpZiAoKGlucHV0LmV2ZW50VHlwZSAmIElOUFVUX1NUQVJUKSAmJiAodGhpcy5jb3VudCA9PT0gMCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZhaWxUaW1lb3V0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBvbmx5IGFsbG93IGxpdHRsZSBtb3ZlbWVudFxuICAgICAgICAvLyBhbmQgd2UndmUgcmVhY2hlZCBhbiBlbmQgZXZlbnQsIHNvIGEgdGFwIGlzIHBvc3NpYmxlXG4gICAgICAgIGlmICh2YWxpZE1vdmVtZW50ICYmIHZhbGlkVG91Y2hUaW1lICYmIHZhbGlkUG9pbnRlcnMpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC5ldmVudFR5cGUgIT0gSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbFRpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZhbGlkSW50ZXJ2YWwgPSB0aGlzLnBUaW1lID8gKGlucHV0LnRpbWVTdGFtcCAtIHRoaXMucFRpbWUgPCBvcHRpb25zLmludGVydmFsKSA6IHRydWU7XG4gICAgICAgICAgICB2YXIgdmFsaWRNdWx0aVRhcCA9ICF0aGlzLnBDZW50ZXIgfHwgZ2V0RGlzdGFuY2UodGhpcy5wQ2VudGVyLCBpbnB1dC5jZW50ZXIpIDwgb3B0aW9ucy5wb3NUaHJlc2hvbGQ7XG5cbiAgICAgICAgICAgIHRoaXMucFRpbWUgPSBpbnB1dC50aW1lU3RhbXA7XG4gICAgICAgICAgICB0aGlzLnBDZW50ZXIgPSBpbnB1dC5jZW50ZXI7XG5cbiAgICAgICAgICAgIGlmICghdmFsaWRNdWx0aVRhcCB8fCAhdmFsaWRJbnRlcnZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY291bnQgPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvdW50ICs9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XG5cbiAgICAgICAgICAgIC8vIGlmIHRhcCBjb3VudCBtYXRjaGVzIHdlIGhhdmUgcmVjb2duaXplZCBpdCxcbiAgICAgICAgICAgIC8vIGVsc2UgaXQgaGFzIGJlZ2FuIHJlY29nbml6aW5nLi4uXG4gICAgICAgICAgICB2YXIgdGFwQ291bnQgPSB0aGlzLmNvdW50ICUgb3B0aW9ucy50YXBzO1xuICAgICAgICAgICAgaWYgKHRhcENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gZmFpbGluZyByZXF1aXJlbWVudHMsIGltbWVkaWF0ZWx5IHRyaWdnZXIgdGhlIHRhcCBldmVudFxuICAgICAgICAgICAgICAgIC8vIG9yIHdhaXQgYXMgbG9uZyBhcyB0aGUgbXVsdGl0YXAgaW50ZXJ2YWwgdG8gdHJpZ2dlclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5oYXNSZXF1aXJlRmFpbHVyZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfUkVDT0dOSVpFRDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXRDb250ZXh0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX1JFQ09HTklaRUQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyeUVtaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgb3B0aW9ucy5pbnRlcnZhbCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9CRUdBTjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFNUQVRFX0ZBSUxFRDtcbiAgICB9LFxuXG4gICAgZmFpbFRpbWVvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXRDb250ZXh0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX0ZBSUxFRDtcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zLmludGVydmFsLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIFNUQVRFX0ZBSUxFRDtcbiAgICB9LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICAgIH0sXG5cbiAgICBlbWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT0gU1RBVEVfUkVDT0dOSVpFRCkge1xuICAgICAgICAgICAgdGhpcy5faW5wdXQudGFwQ291bnQgPSB0aGlzLmNvdW50O1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50LCB0aGlzLl9pbnB1dCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuLyoqXG4gKiBTaW1wbGUgd2F5IHRvIGNyZWF0ZSBhIG1hbmFnZXIgd2l0aCBhIGRlZmF1bHQgc2V0IG9mIHJlY29nbml6ZXJzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEhhbW1lcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5yZWNvZ25pemVycyA9IGlmVW5kZWZpbmVkKG9wdGlvbnMucmVjb2duaXplcnMsIEhhbW1lci5kZWZhdWx0cy5wcmVzZXQpO1xuICAgIHJldHVybiBuZXcgTWFuYWdlcihlbGVtZW50LCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuSGFtbWVyLlZFUlNJT04gPSAnMi4wLjcnO1xuXG4vKipcbiAqIGRlZmF1bHQgc2V0dGluZ3NcbiAqIEBuYW1lc3BhY2VcbiAqL1xuSGFtbWVyLmRlZmF1bHRzID0ge1xuICAgIC8qKlxuICAgICAqIHNldCBpZiBET00gZXZlbnRzIGFyZSBiZWluZyB0cmlnZ2VyZWQuXG4gICAgICogQnV0IHRoaXMgaXMgc2xvd2VyIGFuZCB1bnVzZWQgYnkgc2ltcGxlIGltcGxlbWVudGF0aW9ucywgc28gZGlzYWJsZWQgYnkgZGVmYXVsdC5cbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIGRvbUV2ZW50czogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgdmFsdWUgZm9yIHRoZSB0b3VjaEFjdGlvbiBwcm9wZXJ0eS9mYWxsYmFjay5cbiAgICAgKiBXaGVuIHNldCB0byBgY29tcHV0ZWAgaXQgd2lsbCBtYWdpY2FsbHkgc2V0IHRoZSBjb3JyZWN0IHZhbHVlIGJhc2VkIG9uIHRoZSBhZGRlZCByZWNvZ25pemVycy5cbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IGNvbXB1dGVcbiAgICAgKi9cbiAgICB0b3VjaEFjdGlvbjogVE9VQ0hfQUNUSU9OX0NPTVBVVEUsXG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgZW5hYmxlOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogRVhQRVJJTUVOVEFMIEZFQVRVUkUgLS0gY2FuIGJlIHJlbW92ZWQvY2hhbmdlZFxuICAgICAqIENoYW5nZSB0aGUgcGFyZW50IGlucHV0IHRhcmdldCBlbGVtZW50LlxuICAgICAqIElmIE51bGwsIHRoZW4gaXQgaXMgYmVpbmcgc2V0IHRoZSB0byBtYWluIGVsZW1lbnQuXG4gICAgICogQHR5cGUge051bGx8RXZlbnRUYXJnZXR9XG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuICAgIGlucHV0VGFyZ2V0OiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogZm9yY2UgYW4gaW5wdXQgY2xhc3NcbiAgICAgKiBAdHlwZSB7TnVsbHxGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgaW5wdXRDbGFzczogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgcmVjb2duaXplciBzZXR1cCB3aGVuIGNhbGxpbmcgYEhhbW1lcigpYFxuICAgICAqIFdoZW4gY3JlYXRpbmcgYSBuZXcgTWFuYWdlciB0aGVzZSB3aWxsIGJlIHNraXBwZWQuXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqL1xuICAgIHByZXNldDogW1xuICAgICAgICAvLyBSZWNvZ25pemVyQ2xhc3MsIG9wdGlvbnMsIFtyZWNvZ25pemVXaXRoLCAuLi5dLCBbcmVxdWlyZUZhaWx1cmUsIC4uLl1cbiAgICAgICAgW1JvdGF0ZVJlY29nbml6ZXIsIHtlbmFibGU6IGZhbHNlfV0sXG4gICAgICAgIFtQaW5jaFJlY29nbml6ZXIsIHtlbmFibGU6IGZhbHNlfSwgWydyb3RhdGUnXV0sXG4gICAgICAgIFtTd2lwZVJlY29nbml6ZXIsIHtkaXJlY3Rpb246IERJUkVDVElPTl9IT1JJWk9OVEFMfV0sXG4gICAgICAgIFtQYW5SZWNvZ25pemVyLCB7ZGlyZWN0aW9uOiBESVJFQ1RJT05fSE9SSVpPTlRBTH0sIFsnc3dpcGUnXV0sXG4gICAgICAgIFtUYXBSZWNvZ25pemVyXSxcbiAgICAgICAgW1RhcFJlY29nbml6ZXIsIHtldmVudDogJ2RvdWJsZXRhcCcsIHRhcHM6IDJ9LCBbJ3RhcCddXSxcbiAgICAgICAgW1ByZXNzUmVjb2duaXplcl1cbiAgICBdLFxuXG4gICAgLyoqXG4gICAgICogU29tZSBDU1MgcHJvcGVydGllcyBjYW4gYmUgdXNlZCB0byBpbXByb3ZlIHRoZSB3b3JraW5nIG9mIEhhbW1lci5cbiAgICAgKiBBZGQgdGhlbSB0byB0aGlzIG1ldGhvZCBhbmQgdGhleSB3aWxsIGJlIHNldCB3aGVuIGNyZWF0aW5nIGEgbmV3IE1hbmFnZXIuXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqL1xuICAgIGNzc1Byb3BzOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlcyB0ZXh0IHNlbGVjdGlvbiB0byBpbXByb3ZlIHRoZSBkcmFnZ2luZyBnZXN0dXJlLiBNYWlubHkgZm9yIGRlc2t0b3AgYnJvd3NlcnMuXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xuICAgICAgICAgKi9cbiAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlIHRoZSBXaW5kb3dzIFBob25lIGdyaXBwZXJzIHdoZW4gcHJlc3NpbmcgYW4gZWxlbWVudC5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXG4gICAgICAgICAqL1xuICAgICAgICB0b3VjaFNlbGVjdDogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlcyB0aGUgZGVmYXVsdCBjYWxsb3V0IHNob3duIHdoZW4geW91IHRvdWNoIGFuZCBob2xkIGEgdG91Y2ggdGFyZ2V0LlxuICAgICAgICAgKiBPbiBpT1MsIHdoZW4geW91IHRvdWNoIGFuZCBob2xkIGEgdG91Y2ggdGFyZ2V0IHN1Y2ggYXMgYSBsaW5rLCBTYWZhcmkgZGlzcGxheXNcbiAgICAgICAgICogYSBjYWxsb3V0IGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGxpbmsuIFRoaXMgcHJvcGVydHkgYWxsb3dzIHlvdSB0byBkaXNhYmxlIHRoYXQgY2FsbG91dC5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXG4gICAgICAgICAqL1xuICAgICAgICB0b3VjaENhbGxvdXQ6ICdub25lJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3BlY2lmaWVzIHdoZXRoZXIgem9vbWluZyBpcyBlbmFibGVkLiBVc2VkIGJ5IElFMTA+XG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xuICAgICAgICAgKi9cbiAgICAgICAgY29udGVudFpvb21pbmc6ICdub25lJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3BlY2lmaWVzIHRoYXQgYW4gZW50aXJlIGVsZW1lbnQgc2hvdWxkIGJlIGRyYWdnYWJsZSBpbnN0ZWFkIG9mIGl0cyBjb250ZW50cy4gTWFpbmx5IGZvciBkZXNrdG9wIGJyb3dzZXJzLlxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAgICAgKiBAZGVmYXVsdCAnbm9uZSdcbiAgICAgICAgICovXG4gICAgICAgIHVzZXJEcmFnOiAnbm9uZScsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE92ZXJyaWRlcyB0aGUgaGlnaGxpZ2h0IGNvbG9yIHNob3duIHdoZW4gdGhlIHVzZXIgdGFwcyBhIGxpbmsgb3IgYSBKYXZhU2NyaXB0XG4gICAgICAgICAqIGNsaWNrYWJsZSBlbGVtZW50IGluIGlPUy4gVGhpcyBwcm9wZXJ0eSBvYmV5cyB0aGUgYWxwaGEgdmFsdWUsIGlmIHNwZWNpZmllZC5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ3JnYmEoMCwwLDAsMCknXG4gICAgICAgICAqL1xuICAgICAgICB0YXBIaWdobGlnaHRDb2xvcjogJ3JnYmEoMCwwLDAsMCknXG4gICAgfVxufTtcblxudmFyIFNUT1AgPSAxO1xudmFyIEZPUkNFRF9TVE9QID0gMjtcblxuLyoqXG4gKiBNYW5hZ2VyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gTWFuYWdlcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gYXNzaWduKHt9LCBIYW1tZXIuZGVmYXVsdHMsIG9wdGlvbnMgfHwge30pO1xuXG4gICAgdGhpcy5vcHRpb25zLmlucHV0VGFyZ2V0ID0gdGhpcy5vcHRpb25zLmlucHV0VGFyZ2V0IHx8IGVsZW1lbnQ7XG5cbiAgICB0aGlzLmhhbmRsZXJzID0ge307XG4gICAgdGhpcy5zZXNzaW9uID0ge307XG4gICAgdGhpcy5yZWNvZ25pemVycyA9IFtdO1xuICAgIHRoaXMub2xkQ3NzUHJvcHMgPSB7fTtcblxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5pbnB1dCA9IGNyZWF0ZUlucHV0SW5zdGFuY2UodGhpcyk7XG4gICAgdGhpcy50b3VjaEFjdGlvbiA9IG5ldyBUb3VjaEFjdGlvbih0aGlzLCB0aGlzLm9wdGlvbnMudG91Y2hBY3Rpb24pO1xuXG4gICAgdG9nZ2xlQ3NzUHJvcHModGhpcywgdHJ1ZSk7XG5cbiAgICBlYWNoKHRoaXMub3B0aW9ucy5yZWNvZ25pemVycywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgcmVjb2duaXplciA9IHRoaXMuYWRkKG5ldyAoaXRlbVswXSkoaXRlbVsxXSkpO1xuICAgICAgICBpdGVtWzJdICYmIHJlY29nbml6ZXIucmVjb2duaXplV2l0aChpdGVtWzJdKTtcbiAgICAgICAgaXRlbVszXSAmJiByZWNvZ25pemVyLnJlcXVpcmVGYWlsdXJlKGl0ZW1bM10pO1xuICAgIH0sIHRoaXMpO1xufVxuXG5NYW5hZ2VyLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZXQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybnMge01hbmFnZXJ9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIE9wdGlvbnMgdGhhdCBuZWVkIGEgbGl0dGxlIG1vcmUgc2V0dXBcbiAgICAgICAgaWYgKG9wdGlvbnMudG91Y2hBY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMudG91Y2hBY3Rpb24udXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuaW5wdXRUYXJnZXQpIHtcbiAgICAgICAgICAgIC8vIENsZWFuIHVwIGV4aXN0aW5nIGV2ZW50IGxpc3RlbmVycyBhbmQgcmVpbml0aWFsaXplXG4gICAgICAgICAgICB0aGlzLmlucHV0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudGFyZ2V0ID0gb3B0aW9ucy5pbnB1dFRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuaW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzdG9wIHJlY29nbml6aW5nIGZvciB0aGlzIHNlc3Npb24uXG4gICAgICogVGhpcyBzZXNzaW9uIHdpbGwgYmUgZGlzY2FyZGVkLCB3aGVuIGEgbmV3IFtpbnB1dF1zdGFydCBldmVudCBpcyBmaXJlZC5cbiAgICAgKiBXaGVuIGZvcmNlZCwgdGhlIHJlY29nbml6ZXIgY3ljbGUgaXMgc3RvcHBlZCBpbW1lZGlhdGVseS5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZV1cbiAgICAgKi9cbiAgICBzdG9wOiBmdW5jdGlvbihmb3JjZSkge1xuICAgICAgICB0aGlzLnNlc3Npb24uc3RvcHBlZCA9IGZvcmNlID8gRk9SQ0VEX1NUT1AgOiBTVE9QO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBydW4gdGhlIHJlY29nbml6ZXJzIVxuICAgICAqIGNhbGxlZCBieSB0aGUgaW5wdXRIYW5kbGVyIGZ1bmN0aW9uIG9uIGV2ZXJ5IG1vdmVtZW50IG9mIHRoZSBwb2ludGVycyAodG91Y2hlcylcbiAgICAgKiBpdCB3YWxrcyB0aHJvdWdoIGFsbCB0aGUgcmVjb2duaXplcnMgYW5kIHRyaWVzIHRvIGRldGVjdCB0aGUgZ2VzdHVyZSB0aGF0IGlzIGJlaW5nIG1hZGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXG4gICAgICovXG4gICAgcmVjb2duaXplOiBmdW5jdGlvbihpbnB1dERhdGEpIHtcbiAgICAgICAgdmFyIHNlc3Npb24gPSB0aGlzLnNlc3Npb247XG4gICAgICAgIGlmIChzZXNzaW9uLnN0b3BwZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJ1biB0aGUgdG91Y2gtYWN0aW9uIHBvbHlmaWxsXG4gICAgICAgIHRoaXMudG91Y2hBY3Rpb24ucHJldmVudERlZmF1bHRzKGlucHV0RGF0YSk7XG5cbiAgICAgICAgdmFyIHJlY29nbml6ZXI7XG4gICAgICAgIHZhciByZWNvZ25pemVycyA9IHRoaXMucmVjb2duaXplcnM7XG5cbiAgICAgICAgLy8gdGhpcyBob2xkcyB0aGUgcmVjb2duaXplciB0aGF0IGlzIGJlaW5nIHJlY29nbml6ZWQuXG4gICAgICAgIC8vIHNvIHRoZSByZWNvZ25pemVyJ3Mgc3RhdGUgbmVlZHMgdG8gYmUgQkVHQU4sIENIQU5HRUQsIEVOREVEIG9yIFJFQ09HTklaRURcbiAgICAgICAgLy8gaWYgbm8gcmVjb2duaXplciBpcyBkZXRlY3RpbmcgYSB0aGluZywgaXQgaXMgc2V0IHRvIGBudWxsYFxuICAgICAgICB2YXIgY3VyUmVjb2duaXplciA9IHNlc3Npb24uY3VyUmVjb2duaXplcjtcblxuICAgICAgICAvLyByZXNldCB3aGVuIHRoZSBsYXN0IHJlY29nbml6ZXIgaXMgcmVjb2duaXplZFxuICAgICAgICAvLyBvciB3aGVuIHdlJ3JlIGluIGEgbmV3IHNlc3Npb25cbiAgICAgICAgaWYgKCFjdXJSZWNvZ25pemVyIHx8IChjdXJSZWNvZ25pemVyICYmIGN1clJlY29nbml6ZXIuc3RhdGUgJiBTVEFURV9SRUNPR05JWkVEKSkge1xuICAgICAgICAgICAgY3VyUmVjb2duaXplciA9IHNlc3Npb24uY3VyUmVjb2duaXplciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgcmVjb2duaXplcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZWNvZ25pemVyID0gcmVjb2duaXplcnNbaV07XG5cbiAgICAgICAgICAgIC8vIGZpbmQgb3V0IGlmIHdlIGFyZSBhbGxvd2VkIHRyeSB0byByZWNvZ25pemUgdGhlIGlucHV0IGZvciB0aGlzIG9uZS5cbiAgICAgICAgICAgIC8vIDEuICAgYWxsb3cgaWYgdGhlIHNlc3Npb24gaXMgTk9UIGZvcmNlZCBzdG9wcGVkIChzZWUgdGhlIC5zdG9wKCkgbWV0aG9kKVxuICAgICAgICAgICAgLy8gMi4gICBhbGxvdyBpZiB3ZSBzdGlsbCBoYXZlbid0IHJlY29nbml6ZWQgYSBnZXN0dXJlIGluIHRoaXMgc2Vzc2lvbiwgb3IgdGhlIHRoaXMgcmVjb2duaXplciBpcyB0aGUgb25lXG4gICAgICAgICAgICAvLyAgICAgIHRoYXQgaXMgYmVpbmcgcmVjb2duaXplZC5cbiAgICAgICAgICAgIC8vIDMuICAgYWxsb3cgaWYgdGhlIHJlY29nbml6ZXIgaXMgYWxsb3dlZCB0byBydW4gc2ltdWx0YW5lb3VzIHdpdGggdGhlIGN1cnJlbnQgcmVjb2duaXplZCByZWNvZ25pemVyLlxuICAgICAgICAgICAgLy8gICAgICB0aGlzIGNhbiBiZSBzZXR1cCB3aXRoIHRoZSBgcmVjb2duaXplV2l0aCgpYCBtZXRob2Qgb24gdGhlIHJlY29nbml6ZXIuXG4gICAgICAgICAgICBpZiAoc2Vzc2lvbi5zdG9wcGVkICE9PSBGT1JDRURfU1RPUCAmJiAoIC8vIDFcbiAgICAgICAgICAgICAgICAgICAgIWN1clJlY29nbml6ZXIgfHwgcmVjb2duaXplciA9PSBjdXJSZWNvZ25pemVyIHx8IC8vIDJcbiAgICAgICAgICAgICAgICAgICAgcmVjb2duaXplci5jYW5SZWNvZ25pemVXaXRoKGN1clJlY29nbml6ZXIpKSkgeyAvLyAzXG4gICAgICAgICAgICAgICAgcmVjb2duaXplci5yZWNvZ25pemUoaW5wdXREYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVjb2duaXplci5yZXNldCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiB0aGUgcmVjb2duaXplciBoYXMgYmVlbiByZWNvZ25pemluZyB0aGUgaW5wdXQgYXMgYSB2YWxpZCBnZXN0dXJlLCB3ZSB3YW50IHRvIHN0b3JlIHRoaXMgb25lIGFzIHRoZVxuICAgICAgICAgICAgLy8gY3VycmVudCBhY3RpdmUgcmVjb2duaXplci4gYnV0IG9ubHkgaWYgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIGFuIGFjdGl2ZSByZWNvZ25pemVyXG4gICAgICAgICAgICBpZiAoIWN1clJlY29nbml6ZXIgJiYgcmVjb2duaXplci5zdGF0ZSAmIChTVEFURV9CRUdBTiB8IFNUQVRFX0NIQU5HRUQgfCBTVEFURV9FTkRFRCkpIHtcbiAgICAgICAgICAgICAgICBjdXJSZWNvZ25pemVyID0gc2Vzc2lvbi5jdXJSZWNvZ25pemVyID0gcmVjb2duaXplcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgYSByZWNvZ25pemVyIGJ5IGl0cyBldmVudCBuYW1lLlxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcnxTdHJpbmd9IHJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcnxOdWxsfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24ocmVjb2duaXplcikge1xuICAgICAgICBpZiAocmVjb2duaXplciBpbnN0YW5jZW9mIFJlY29nbml6ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWNvZ25pemVyO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlY29nbml6ZXJzID0gdGhpcy5yZWNvZ25pemVycztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWNvZ25pemVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHJlY29nbml6ZXJzW2ldLm9wdGlvbnMuZXZlbnQgPT0gcmVjb2duaXplcikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWNvZ25pemVyc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYWRkIGEgcmVjb2duaXplciB0byB0aGUgbWFuYWdlclxuICAgICAqIGV4aXN0aW5nIHJlY29nbml6ZXJzIHdpdGggdGhlIHNhbWUgZXZlbnQgbmFtZSB3aWxsIGJlIHJlbW92ZWRcbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IHJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcnxNYW5hZ2VyfVxuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24ocmVjb2duaXplcikge1xuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcocmVjb2duaXplciwgJ2FkZCcsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbW92ZSBleGlzdGluZ1xuICAgICAgICB2YXIgZXhpc3RpbmcgPSB0aGlzLmdldChyZWNvZ25pemVyLm9wdGlvbnMuZXZlbnQpO1xuICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKGV4aXN0aW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVjb2duaXplcnMucHVzaChyZWNvZ25pemVyKTtcbiAgICAgICAgcmVjb2duaXplci5tYW5hZ2VyID0gdGhpcztcblxuICAgICAgICB0aGlzLnRvdWNoQWN0aW9uLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gcmVjb2duaXplcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVtb3ZlIGEgcmVjb2duaXplciBieSBuYW1lIG9yIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfFN0cmluZ30gcmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtNYW5hZ2VyfVxuICAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24ocmVjb2duaXplcikge1xuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcocmVjb2duaXplciwgJ3JlbW92ZScsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlY29nbml6ZXIgPSB0aGlzLmdldChyZWNvZ25pemVyKTtcblxuICAgICAgICAvLyBsZXQncyBtYWtlIHN1cmUgdGhpcyByZWNvZ25pemVyIGV4aXN0c1xuICAgICAgICBpZiAocmVjb2duaXplcikge1xuICAgICAgICAgICAgdmFyIHJlY29nbml6ZXJzID0gdGhpcy5yZWNvZ25pemVycztcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGluQXJyYXkocmVjb2duaXplcnMsIHJlY29nbml6ZXIpO1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVjb2duaXplcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRvdWNoQWN0aW9uLnVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGJpbmQgZXZlbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRzXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICBvbjogZnVuY3Rpb24oZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnM7XG4gICAgICAgIGVhY2goc3BsaXRTdHIoZXZlbnRzKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XSA9IGhhbmRsZXJzW2V2ZW50XSB8fCBbXTtcbiAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHVuYmluZCBldmVudCwgbGVhdmUgZW1pdCBibGFuayB0byByZW1vdmUgYWxsIGhhbmRsZXJzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50c1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtoYW5kbGVyXVxuICAgICAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50cywgaGFuZGxlcikge1xuICAgICAgICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnM7XG4gICAgICAgIGVhY2goc3BsaXRTdHIoZXZlbnRzKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBoYW5kbGVyc1tldmVudF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XSAmJiBoYW5kbGVyc1tldmVudF0uc3BsaWNlKGluQXJyYXkoaGFuZGxlcnNbZXZlbnRdLCBoYW5kbGVyKSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZW1pdCBldmVudCB0byB0aGUgbGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAgICAgKi9cbiAgICBlbWl0OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAvLyB3ZSBhbHNvIHdhbnQgdG8gdHJpZ2dlciBkb20gZXZlbnRzXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZG9tRXZlbnRzKSB7XG4gICAgICAgICAgICB0cmlnZ2VyRG9tRXZlbnQoZXZlbnQsIGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbm8gaGFuZGxlcnMsIHNvIHNraXAgaXQgYWxsXG4gICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnNbZXZlbnRdICYmIHRoaXMuaGFuZGxlcnNbZXZlbnRdLnNsaWNlKCk7XG4gICAgICAgIGlmICghaGFuZGxlcnMgfHwgIWhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS50eXBlID0gZXZlbnQ7XG4gICAgICAgIGRhdGEucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRhdGEuc3JjRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBoYW5kbGVyc1tpXShkYXRhKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBkZXN0cm95IHRoZSBtYW5hZ2VyIGFuZCB1bmJpbmRzIGFsbCBldmVudHNcbiAgICAgKiBpdCBkb2Vzbid0IHVuYmluZCBkb20gZXZlbnRzLCB0aGF0IGlzIHRoZSB1c2VyIG93biByZXNwb25zaWJpbGl0eVxuICAgICAqL1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgJiYgdG9nZ2xlQ3NzUHJvcHModGhpcywgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSB7fTtcbiAgICAgICAgdGhpcy5zZXNzaW9uID0ge307XG4gICAgICAgIHRoaXMuaW5wdXQuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgIH1cbn07XG5cbi8qKlxuICogYWRkL3JlbW92ZSB0aGUgY3NzIHByb3BlcnRpZXMgYXMgZGVmaW5lZCBpbiBtYW5hZ2VyLm9wdGlvbnMuY3NzUHJvcHNcbiAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlclxuICogQHBhcmFtIHtCb29sZWFufSBhZGRcbiAqL1xuZnVuY3Rpb24gdG9nZ2xlQ3NzUHJvcHMobWFuYWdlciwgYWRkKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBtYW5hZ2VyLmVsZW1lbnQ7XG4gICAgaWYgKCFlbGVtZW50LnN0eWxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHByb3A7XG4gICAgZWFjaChtYW5hZ2VyLm9wdGlvbnMuY3NzUHJvcHMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHByb3AgPSBwcmVmaXhlZChlbGVtZW50LnN0eWxlLCBuYW1lKTtcbiAgICAgICAgaWYgKGFkZCkge1xuICAgICAgICAgICAgbWFuYWdlci5vbGRDc3NQcm9wc1twcm9wXSA9IGVsZW1lbnQuc3R5bGVbcHJvcF07XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3Byb3BdID0gbWFuYWdlci5vbGRDc3NQcm9wc1twcm9wXSB8fCAnJztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghYWRkKSB7XG4gICAgICAgIG1hbmFnZXIub2xkQ3NzUHJvcHMgPSB7fTtcbiAgICB9XG59XG5cbi8qKlxuICogdHJpZ2dlciBkb20gZXZlbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAqL1xuZnVuY3Rpb24gdHJpZ2dlckRvbUV2ZW50KGV2ZW50LCBkYXRhKSB7XG4gICAgdmFyIGdlc3R1cmVFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgIGdlc3R1cmVFdmVudC5pbml0RXZlbnQoZXZlbnQsIHRydWUsIHRydWUpO1xuICAgIGdlc3R1cmVFdmVudC5nZXN0dXJlID0gZGF0YTtcbiAgICBkYXRhLnRhcmdldC5kaXNwYXRjaEV2ZW50KGdlc3R1cmVFdmVudCk7XG59XG5cbmFzc2lnbihIYW1tZXIsIHtcbiAgICBJTlBVVF9TVEFSVDogSU5QVVRfU1RBUlQsXG4gICAgSU5QVVRfTU9WRTogSU5QVVRfTU9WRSxcbiAgICBJTlBVVF9FTkQ6IElOUFVUX0VORCxcbiAgICBJTlBVVF9DQU5DRUw6IElOUFVUX0NBTkNFTCxcblxuICAgIFNUQVRFX1BPU1NJQkxFOiBTVEFURV9QT1NTSUJMRSxcbiAgICBTVEFURV9CRUdBTjogU1RBVEVfQkVHQU4sXG4gICAgU1RBVEVfQ0hBTkdFRDogU1RBVEVfQ0hBTkdFRCxcbiAgICBTVEFURV9FTkRFRDogU1RBVEVfRU5ERUQsXG4gICAgU1RBVEVfUkVDT0dOSVpFRDogU1RBVEVfUkVDT0dOSVpFRCxcbiAgICBTVEFURV9DQU5DRUxMRUQ6IFNUQVRFX0NBTkNFTExFRCxcbiAgICBTVEFURV9GQUlMRUQ6IFNUQVRFX0ZBSUxFRCxcblxuICAgIERJUkVDVElPTl9OT05FOiBESVJFQ1RJT05fTk9ORSxcbiAgICBESVJFQ1RJT05fTEVGVDogRElSRUNUSU9OX0xFRlQsXG4gICAgRElSRUNUSU9OX1JJR0hUOiBESVJFQ1RJT05fUklHSFQsXG4gICAgRElSRUNUSU9OX1VQOiBESVJFQ1RJT05fVVAsXG4gICAgRElSRUNUSU9OX0RPV046IERJUkVDVElPTl9ET1dOLFxuICAgIERJUkVDVElPTl9IT1JJWk9OVEFMOiBESVJFQ1RJT05fSE9SSVpPTlRBTCxcbiAgICBESVJFQ1RJT05fVkVSVElDQUw6IERJUkVDVElPTl9WRVJUSUNBTCxcbiAgICBESVJFQ1RJT05fQUxMOiBESVJFQ1RJT05fQUxMLFxuXG4gICAgTWFuYWdlcjogTWFuYWdlcixcbiAgICBJbnB1dDogSW5wdXQsXG4gICAgVG91Y2hBY3Rpb246IFRvdWNoQWN0aW9uLFxuXG4gICAgVG91Y2hJbnB1dDogVG91Y2hJbnB1dCxcbiAgICBNb3VzZUlucHV0OiBNb3VzZUlucHV0LFxuICAgIFBvaW50ZXJFdmVudElucHV0OiBQb2ludGVyRXZlbnRJbnB1dCxcbiAgICBUb3VjaE1vdXNlSW5wdXQ6IFRvdWNoTW91c2VJbnB1dCxcbiAgICBTaW5nbGVUb3VjaElucHV0OiBTaW5nbGVUb3VjaElucHV0LFxuXG4gICAgUmVjb2duaXplcjogUmVjb2duaXplcixcbiAgICBBdHRyUmVjb2duaXplcjogQXR0clJlY29nbml6ZXIsXG4gICAgVGFwOiBUYXBSZWNvZ25pemVyLFxuICAgIFBhbjogUGFuUmVjb2duaXplcixcbiAgICBTd2lwZTogU3dpcGVSZWNvZ25pemVyLFxuICAgIFBpbmNoOiBQaW5jaFJlY29nbml6ZXIsXG4gICAgUm90YXRlOiBSb3RhdGVSZWNvZ25pemVyLFxuICAgIFByZXNzOiBQcmVzc1JlY29nbml6ZXIsXG5cbiAgICBvbjogYWRkRXZlbnRMaXN0ZW5lcnMsXG4gICAgb2ZmOiByZW1vdmVFdmVudExpc3RlbmVycyxcbiAgICBlYWNoOiBlYWNoLFxuICAgIG1lcmdlOiBtZXJnZSxcbiAgICBleHRlbmQ6IGV4dGVuZCxcbiAgICBhc3NpZ246IGFzc2lnbixcbiAgICBpbmhlcml0OiBpbmhlcml0LFxuICAgIGJpbmRGbjogYmluZEZuLFxuICAgIHByZWZpeGVkOiBwcmVmaXhlZFxufSk7XG5cbi8vIHRoaXMgcHJldmVudHMgZXJyb3JzIHdoZW4gSGFtbWVyIGlzIGxvYWRlZCBpbiB0aGUgcHJlc2VuY2Ugb2YgYW4gQU1EXG4vLyAgc3R5bGUgbG9hZGVyIGJ1dCBieSBzY3JpcHQgdGFnLCBub3QgYnkgdGhlIGxvYWRlci5cbnZhciBmcmVlR2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB7fSkpOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbmZyZWVHbG9iYWwuSGFtbWVyID0gSGFtbWVyO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gSGFtbWVyO1xuICAgIH0pO1xufSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBIYW1tZXI7XG59IGVsc2Uge1xuICAgIHdpbmRvd1tleHBvcnROYW1lXSA9IEhhbW1lcjtcbn1cblxufSkod2luZG93LCBkb2N1bWVudCwgJ0hhbW1lcicpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHVnX2hhc19vd25fcHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIE1lcmdlIHR3byBhdHRyaWJ1dGUgb2JqZWN0cyBnaXZpbmcgcHJlY2VkZW5jZVxuICogdG8gdmFsdWVzIGluIG9iamVjdCBgYmAuIENsYXNzZXMgYXJlIHNwZWNpYWwtY2FzZWRcbiAqIGFsbG93aW5nIGZvciBhcnJheXMgYW5kIG1lcmdpbmcvam9pbmluZyBhcHByb3ByaWF0ZWx5XG4gKiByZXN1bHRpbmcgaW4gYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9IGFcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBwdWdfbWVyZ2U7XG5mdW5jdGlvbiBwdWdfbWVyZ2UoYSwgYikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBhdHRycyA9IGFbMF07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhdHRycyA9IHB1Z19tZXJnZShhdHRycywgYVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBhdHRycztcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBiKSB7XG4gICAgaWYgKGtleSA9PT0gJ2NsYXNzJykge1xuICAgICAgdmFyIHZhbEEgPSBhW2tleV0gfHwgW107XG4gICAgICBhW2tleV0gPSAoQXJyYXkuaXNBcnJheSh2YWxBKSA/IHZhbEEgOiBbdmFsQV0pLmNvbmNhdChiW2tleV0gfHwgW10pO1xuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgICB2YXIgdmFsQSA9IHB1Z19zdHlsZShhW2tleV0pO1xuICAgICAgdmFyIHZhbEIgPSBwdWdfc3R5bGUoYltrZXldKTtcbiAgICAgIGFba2V5XSA9IHZhbEEgKyAodmFsQSAmJiB2YWxCICYmICc7JykgKyB2YWxCO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSBiW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGE7XG59O1xuXG4vKipcbiAqIFByb2Nlc3MgYXJyYXksIG9iamVjdCwgb3Igc3RyaW5nIGFzIGEgc3RyaW5nIG9mIGNsYXNzZXMgZGVsaW1pdGVkIGJ5IGEgc3BhY2UuXG4gKlxuICogSWYgYHZhbGAgaXMgYW4gYXJyYXksIGFsbCBtZW1iZXJzIG9mIGl0IGFuZCBpdHMgc3ViYXJyYXlzIGFyZSBjb3VudGVkIGFzXG4gKiBjbGFzc2VzLiBJZiBgZXNjYXBpbmdgIGlzIGFuIGFycmF5LCB0aGVuIHdoZXRoZXIgb3Igbm90IHRoZSBpdGVtIGluIGB2YWxgIGlzXG4gKiBlc2NhcGVkIGRlcGVuZHMgb24gdGhlIGNvcnJlc3BvbmRpbmcgaXRlbSBpbiBgZXNjYXBpbmdgLiBJZiBgZXNjYXBpbmdgIGlzXG4gKiBub3QgYW4gYXJyYXksIG5vIGVzY2FwaW5nIGlzIGRvbmUuXG4gKlxuICogSWYgYHZhbGAgaXMgYW4gb2JqZWN0LCBhbGwgdGhlIGtleXMgd2hvc2UgdmFsdWUgaXMgdHJ1dGh5IGFyZSBjb3VudGVkIGFzXG4gKiBjbGFzc2VzLiBObyBlc2NhcGluZyBpcyBkb25lLlxuICpcbiAqIElmIGB2YWxgIGlzIGEgc3RyaW5nLCBpdCBpcyBjb3VudGVkIGFzIGEgY2xhc3MuIE5vIGVzY2FwaW5nIGlzIGRvbmUuXG4gKlxuICogQHBhcmFtIHsoQXJyYXkuPHN0cmluZz58T2JqZWN0LjxzdHJpbmcsIGJvb2xlYW4+fHN0cmluZyl9IHZhbFxuICogQHBhcmFtIHs/QXJyYXkuPHN0cmluZz59IGVzY2FwaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuY2xhc3NlcyA9IHB1Z19jbGFzc2VzO1xuZnVuY3Rpb24gcHVnX2NsYXNzZXNfYXJyYXkodmFsLCBlc2NhcGluZykge1xuICB2YXIgY2xhc3NTdHJpbmcgPSAnJywgY2xhc3NOYW1lLCBwYWRkaW5nID0gJycsIGVzY2FwZUVuYWJsZWQgPSBBcnJheS5pc0FycmF5KGVzY2FwaW5nKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICBjbGFzc05hbWUgPSBwdWdfY2xhc3Nlcyh2YWxbaV0pO1xuICAgIGlmICghY2xhc3NOYW1lKSBjb250aW51ZTtcbiAgICBlc2NhcGVFbmFibGVkICYmIGVzY2FwaW5nW2ldICYmIChjbGFzc05hbWUgPSBwdWdfZXNjYXBlKGNsYXNzTmFtZSkpO1xuICAgIGNsYXNzU3RyaW5nID0gY2xhc3NTdHJpbmcgKyBwYWRkaW5nICsgY2xhc3NOYW1lO1xuICAgIHBhZGRpbmcgPSAnICc7XG4gIH1cbiAgcmV0dXJuIGNsYXNzU3RyaW5nO1xufVxuZnVuY3Rpb24gcHVnX2NsYXNzZXNfb2JqZWN0KHZhbCkge1xuICB2YXIgY2xhc3NTdHJpbmcgPSAnJywgcGFkZGluZyA9ICcnO1xuICBmb3IgKHZhciBrZXkgaW4gdmFsKSB7XG4gICAgaWYgKGtleSAmJiB2YWxba2V5XSAmJiBwdWdfaGFzX293bl9wcm9wZXJ0eS5jYWxsKHZhbCwga2V5KSkge1xuICAgICAgY2xhc3NTdHJpbmcgPSBjbGFzc1N0cmluZyArIHBhZGRpbmcgKyBrZXk7XG4gICAgICBwYWRkaW5nID0gJyAnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY2xhc3NTdHJpbmc7XG59XG5mdW5jdGlvbiBwdWdfY2xhc3Nlcyh2YWwsIGVzY2FwaW5nKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICByZXR1cm4gcHVnX2NsYXNzZXNfYXJyYXkodmFsLCBlc2NhcGluZyk7XG4gIH0gZWxzZSBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHB1Z19jbGFzc2VzX29iamVjdCh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWwgfHwgJyc7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IG9iamVjdCBvciBzdHJpbmcgdG8gYSBzdHJpbmcgb2YgQ1NTIHN0eWxlcyBkZWxpbWl0ZWQgYnkgYSBzZW1pY29sb24uXG4gKlxuICogQHBhcmFtIHsoT2JqZWN0LjxzdHJpbmcsIHN0cmluZz58c3RyaW5nKX0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZXhwb3J0cy5zdHlsZSA9IHB1Z19zdHlsZTtcbmZ1bmN0aW9uIHB1Z19zdHlsZSh2YWwpIHtcbiAgaWYgKCF2YWwpIHJldHVybiAnJztcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgdmFyIG91dCA9ICcnLCBkZWxpbSA9ICcnO1xuICAgIGZvciAodmFyIHN0eWxlIGluIHZhbCkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmIChwdWdfaGFzX293bl9wcm9wZXJ0eS5jYWxsKHZhbCwgc3R5bGUpKSB7XG4gICAgICAgIG91dCA9IG91dCArIGRlbGltICsgc3R5bGUgKyAnOicgKyB2YWxbc3R5bGVdO1xuICAgICAgICBkZWxpbSA9ICc7JztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSAnJyArIHZhbDtcbiAgICBpZiAodmFsW3ZhbC5sZW5ndGggLSAxXSA9PT0gJzsnKSByZXR1cm4gdmFsLnNsaWNlKDAsIC0xKTtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXNjYXBlZFxuICogQHBhcmFtIHtCb29sZWFufSB0ZXJzZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHIgPSBwdWdfYXR0cjtcbmZ1bmN0aW9uIHB1Z19hdHRyKGtleSwgdmFsLCBlc2NhcGVkLCB0ZXJzZSkge1xuICBpZiAodmFsID09PSBmYWxzZSB8fCB2YWwgPT0gbnVsbCB8fCAhdmFsICYmIChrZXkgPT09ICdjbGFzcycgfHwga2V5ID09PSAnc3R5bGUnKSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBpZiAodmFsID09PSB0cnVlKSB7XG4gICAgcmV0dXJuICcgJyArICh0ZXJzZSA/IGtleSA6IGtleSArICc9XCInICsga2V5ICsgJ1wiJyk7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWwudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFsID0gdmFsLnRvSlNPTigpO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykge1xuICAgIHZhbCA9IEpTT04uc3RyaW5naWZ5KHZhbCk7XG4gICAgaWYgKCFlc2NhcGVkICYmIHZhbC5pbmRleE9mKCdcIicpICE9PSAtMSkge1xuICAgICAgcmV0dXJuICcgJyArIGtleSArICc9XFwnJyArIHZhbC5yZXBsYWNlKC8nL2csICcmIzM5OycpICsgJ1xcJyc7XG4gICAgfVxuICB9XG4gIGlmIChlc2NhcGVkKSB2YWwgPSBwdWdfZXNjYXBlKHZhbCk7XG4gIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XG59O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtPYmplY3R9IHRlcnNlIHdoZXRoZXIgdG8gdXNlIEhUTUw1IHRlcnNlIGJvb2xlYW4gYXR0cmlidXRlc1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHJzID0gcHVnX2F0dHJzO1xuZnVuY3Rpb24gcHVnX2F0dHJzKG9iaiwgdGVyc2Upe1xuICB2YXIgYXR0cnMgPSAnJztcblxuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKHB1Z19oYXNfb3duX3Byb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICB2YXIgdmFsID0gb2JqW2tleV07XG5cbiAgICAgIGlmICgnY2xhc3MnID09PSBrZXkpIHtcbiAgICAgICAgdmFsID0gcHVnX2NsYXNzZXModmFsKTtcbiAgICAgICAgYXR0cnMgPSBwdWdfYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKSArIGF0dHJzO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICgnc3R5bGUnID09PSBrZXkpIHtcbiAgICAgICAgdmFsID0gcHVnX3N0eWxlKHZhbCk7XG4gICAgICB9XG4gICAgICBhdHRycyArPSBwdWdfYXR0cihrZXksIHZhbCwgZmFsc2UsIHRlcnNlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXR0cnM7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIHB1Z19tYXRjaF9odG1sID0gL1tcIiY8Pl0vO1xuZXhwb3J0cy5lc2NhcGUgPSBwdWdfZXNjYXBlO1xuZnVuY3Rpb24gcHVnX2VzY2FwZShfaHRtbCl7XG4gIHZhciBodG1sID0gJycgKyBfaHRtbDtcbiAgdmFyIHJlZ2V4UmVzdWx0ID0gcHVnX21hdGNoX2h0bWwuZXhlYyhodG1sKTtcbiAgaWYgKCFyZWdleFJlc3VsdCkgcmV0dXJuIF9odG1sO1xuXG4gIHZhciByZXN1bHQgPSAnJztcbiAgdmFyIGksIGxhc3RJbmRleCwgZXNjYXBlO1xuICBmb3IgKGkgPSByZWdleFJlc3VsdC5pbmRleCwgbGFzdEluZGV4ID0gMDsgaSA8IGh0bWwubGVuZ3RoOyBpKyspIHtcbiAgICBzd2l0Y2ggKGh0bWwuY2hhckNvZGVBdChpKSkge1xuICAgICAgY2FzZSAzNDogZXNjYXBlID0gJyZxdW90Oyc7IGJyZWFrO1xuICAgICAgY2FzZSAzODogZXNjYXBlID0gJyZhbXA7JzsgYnJlYWs7XG4gICAgICBjYXNlIDYwOiBlc2NhcGUgPSAnJmx0Oyc7IGJyZWFrO1xuICAgICAgY2FzZSA2MjogZXNjYXBlID0gJyZndDsnOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6IGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAobGFzdEluZGV4ICE9PSBpKSByZXN1bHQgKz0gaHRtbC5zdWJzdHJpbmcobGFzdEluZGV4LCBpKTtcbiAgICBsYXN0SW5kZXggPSBpICsgMTtcbiAgICByZXN1bHQgKz0gZXNjYXBlO1xuICB9XG4gIGlmIChsYXN0SW5kZXggIT09IGkpIHJldHVybiByZXN1bHQgKyBodG1sLnN1YnN0cmluZyhsYXN0SW5kZXgsIGkpO1xuICBlbHNlIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFJlLXRocm93IHRoZSBnaXZlbiBgZXJyYCBpbiBjb250ZXh0IHRvIHRoZVxuICogdGhlIHB1ZyBpbiBgZmlsZW5hbWVgIGF0IHRoZSBnaXZlbiBgbGluZW5vYC5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IGxpbmVub1xuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBvcmlnaW5hbCBzb3VyY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmV0aHJvdyA9IHB1Z19yZXRocm93O1xuZnVuY3Rpb24gcHVnX3JldGhyb3coZXJyLCBmaWxlbmFtZSwgbGluZW5vLCBzdHIpe1xuICBpZiAoIShlcnIgaW5zdGFuY2VvZiBFcnJvcikpIHRocm93IGVycjtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnIHx8ICFmaWxlbmFtZSkgJiYgIXN0cikge1xuICAgIGVyci5tZXNzYWdlICs9ICcgb24gbGluZSAnICsgbGluZW5vO1xuICAgIHRocm93IGVycjtcbiAgfVxuICB0cnkge1xuICAgIHN0ciA9IHN0ciB8fCByZXF1aXJlKCdmcycpLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKVxuICB9IGNhdGNoIChleCkge1xuICAgIHB1Z19yZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxuICB9XG4gIHZhciBjb250ZXh0ID0gM1xuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xuXG4gIC8vIEVycm9yIGNvbnRleHRcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXG4gICAgICArIGN1cnJcbiAgICAgICsgJ3wgJ1xuICAgICAgKyBsaW5lO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnUHVnJykgKyAnOicgKyBsaW5lbm9cbiAgICArICdcXG4nICsgY29udGV4dCArICdcXG5cXG4nICsgZXJyLm1lc3NhZ2U7XG4gIHRocm93IGVycjtcbn07XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDA4LzA5LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2hvcnRlblRleHQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc2hvcnRlbi10ZXh0JyksXG4gICAgTUFYX0NPTlRFWFRfQ1JFRElUX0xFTkdUSCA9IDUwLFxuICAgIE1BWF9MSU5LU19USVRMRV9MRU5HVEggPSA1MCxcbiAgICBNQVhfQkFDS1NUT1JZX0FVVEhPUl9MRU5HVEggPSA1MCxcbiAgICBNQVhfQkFDS1NUT1JZX3B1YmxpY2F0aW9uX0xFTkdUSCA9IDUwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgYWRkTGlua1R5cGVzKGRhdGEubGlua3MpO1xuICAgIHNob3J0ZW5EYXRhVGV4dChkYXRhKTtcbn07XG5cbmZ1bmN0aW9uIGFkZExpbmtUeXBlcyhsaW5rc0xpc3QpIHtcbiAgICBpZiAoIWxpbmtzTGlzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxpbmtzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChsaW5rKSB7XG4gICAgICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBhLmhyZWYgPSBsaW5rLnVybDtcbiAgICAgICAgbGluay50eXBlID0gYS5ob3N0bmFtZS5tYXRjaCgnd2lraXBlZGlhJykgIT0gbnVsbCA/ICd3aWtpcGVkaWEtdycgOiAnbGluayc7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNob3J0ZW5EYXRhVGV4dChkYXRhKSB7XG4gICAgc2hvcnRlbkNvbnRleHRUZXh0KGRhdGEuY29udGV4dCk7XG4gICAgc2hvcnRlbkxpbmtzVGV4dChkYXRhLmxpbmtzKTtcbiAgICBzaG9ydGVuQmFja3N0b3J5KGRhdGEuYmFja1N0b3J5KTtcbiAgICBmb3JtYXRDcmVhdGl2ZUNvbW1vbnMoZGF0YS5jcmVhdGl2ZUNvbW1vbnMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRDcmVhdGl2ZUNvbW1vbnMoY3JlYXRpdmVDb21tb25zKSB7XG4gICAgaWYgKCFjcmVhdGl2ZUNvbW1vbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcGFydHMgPSBbXTtcbiAgICBpZiAoY3JlYXRpdmVDb21tb25zLmNyZWRpdCkge1xuICAgICAgICBwYXJ0cy5wdXNoKGNyZWF0aXZlQ29tbW9ucy5jcmVkaXQpO1xuICAgIH1cbiAgICBpZiAoY3JlYXRpdmVDb21tb25zLnllYXIpIHtcbiAgICAgICAgcGFydHMucHVzaChjcmVhdGl2ZUNvbW1vbnMueWVhcik7XG4gICAgfVxuICAgIGlmIChjcmVhdGl2ZUNvbW1vbnMuY29weXJpZ2h0KSB7XG4gICAgICAgIHBhcnRzLnB1c2goY3JlYXRpdmVDb21tb25zLmNvcHlyaWdodCk7XG4gICAgfVxuICAgIGNyZWF0aXZlQ29tbW9ucy5mb3JtYXR0ZWRDb3B5cmlnaHQgPSBwYXJ0cy5sZW5ndGggPyBcIsKpIFwiICsgcGFydHMuam9pbihcIiwgXCIpIDogXCJcIjtcbn1cblxuZnVuY3Rpb24gc2hvcnRlbkNvbnRleHRUZXh0KGNvbnRleHRMaXN0KSB7XG4gICAgaWYgKCFjb250ZXh0TGlzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnRleHRMaXN0LmZvckVhY2goZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgICAgaWYgKGNvbnRleHQuY3JlZGl0KSB7XG4gICAgICAgICAgICBjb250ZXh0LmNyZWRpdCA9IHNob3J0ZW5UZXh0KGNvbnRleHQuY3JlZGl0LCBNQVhfQ09OVEVYVF9DUkVESVRfTEVOR1RIKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzaG9ydGVuTGlua3NUZXh0KGxpbmtzTGlzdCkge1xuICAgIGlmICghbGlua3NMaXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGlua3NMaXN0LmZvckVhY2goZnVuY3Rpb24gKGxpbmspIHtcbiAgICAgICAgaWYgKGxpbmsudGl0bGUpIHtcbiAgICAgICAgICAgIGxpbmsudGl0bGUgPSBzaG9ydGVuVGV4dChsaW5rLnRpdGxlLCBNQVhfTElOS1NfVElUTEVfTEVOR1RIKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpbmsudGl0bGUgPSBzaG9ydGVuVGV4dChsaW5rLnVybCwgTUFYX0xJTktTX1RJVExFX0xFTkdUSCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2hvcnRlbkJhY2tzdG9yeShiYWNrU3RvcnkpIHtcbiAgICBpZiAoIWJhY2tTdG9yeSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChiYWNrU3RvcnkuYXV0aG9yKSB7XG4gICAgICAgIGJhY2tTdG9yeS5hdXRob3IgPSBzaG9ydGVuVGV4dChiYWNrU3RvcnkuYXV0aG9yLCBNQVhfQkFDS1NUT1JZX0FVVEhPUl9MRU5HVEgpO1xuICAgIH1cbiAgICBpZiAoYmFja1N0b3J5LnB1YmxpY2F0aW9uKSB7XG4gICAgICAgIGJhY2tTdG9yeS5wdWJsaWNhdGlvbiA9IHNob3J0ZW5UZXh0KGJhY2tTdG9yeS5wdWJsaWNhdGlvbiwgTUFYX0JBQ0tTVE9SWV9wdWJsaWNhdGlvbl9MRU5HVEgpO1xuICAgIH1cbn0iLCIvL1xuICAgQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMDYvMDkvMjAxNi5cblxuLmZjLWdhbGxlcnktZmFpbGVkLWltYWdlXG4gICAgLmZjLWdhbGxlcnktZmFpbGVkLWltYWdlLWNhcHRpb24odGl0bGU9XCJGYWlsZWQgdG8gbG9hZCBpbWFnZSBmcm9tOiAje2Z1bGxTcmN9XCIpXG4gICAgICAgIHNwYW4uZmMtaW1hZ2UtdHlwbyBGYWlsZWQgdG8gbG9hZCBpbWFnZSBmcm9tOiAje3Nob3J0U3JjfVxuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlID0gcmVxdWlyZShcIi4vaGVscGVycy9nZXQtYWxsLWVsZW1lbnRzLXdpdGgtYXR0cmlidXRlXCIpLFxuICAgIC8vIE1pZ2h0IGJlIHVzZWQgaW4gZnV0dXJlIGZvciBwYXJzaW5nIFhNUFxuICAgIHhtbFRvSnNvbiA9IHJlcXVpcmUoXCIuL2hlbHBlcnMveG1sLXRvLWpzb25cIiksXG4gICAgYmFzZUF0dHIgPSBcImRhdGEtNGNcIjtcblxudmFyIE1FVEFfVEFHID0gYmFzZUF0dHIgKyBcIi1tZXRhXCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9uU3VjY2Vzcywgb25GYWlsdXJlKSB7XG4gICAgdHJ5R2V0TWV0YSh0aGlzLCBvblN1Y2Nlc3MsIG9uRmFpbHVyZSk7XG59O1xuXG5mdW5jdGlvbiB0cnlHZXRNZXRhKGltZywgb25TdWNjZXNzLCBvbkZhaWx1cmUpIHtcbiAgICB2YXIgcSA9IFt0cnlHZXRGcm9tU2NyaXB0LCB0cnlMb2FkRmlsZUJ5QXR0cmlidXRlLCB0cnlMb2FkSnNvbkJ5U3JjLCB0cnlMb2FkWWFtbEJ5U3JjXSxcbiAgICAgICAgZXhlYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBmbiA9IHEuc2hpZnQoKTtcbiAgICAgICAgICAgIGlmICghZm4pIHtcbiAgICAgICAgICAgICAgICBpZiAob25GYWlsdXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRmFpbHVyZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm4oaW1nLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGV4ZWMoKTtcbn1cblxuZnVuY3Rpb24gdHJ5R2V0RnJvbVNjcmlwdChpbWcsIG9uRmluaXNoKSB7XG4gICAgdmFyIHBhdGggPSBpbWcuZ2V0QXR0cmlidXRlKGJhc2VBdHRyKSB8fCBpbWcuc3JjLFxuICAgICAgICBlbHMgPSBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUoTUVUQV9UQUcpO1xuICAgIGlmIChlbHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgb25GaW5pc2goKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGVscy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBlbCA9IGVsc1tpXSxcbiAgICAgICAgICAgICAgICBkdW1teUltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiksXG4gICAgICAgICAgICAgICAgYXR0ciA9IGVsLmdldEF0dHJpYnV0ZShNRVRBX1RBRyk7XG4gICAgICAgICAgICAvLyBXZSBjcmVhdGUgZHVtbXkgaW1nIGFuZCB2ZXJpZnkgdGhhdCBpdCdzIHNyYyB0cmFuc2Zvcm1lZCBieSBicm93c2VyIHRvIHRoZSBzYW1lIGFzIGluIHRhcmdldCBpbWdcbiAgICAgICAgICAgIC8vIENhdXNlcyBHRVQgNDA0IGFzIHNldHMgc3JjIHRvIG5vbiBleGlzdGluZyBpbWFnZXNcbiAgICAgICAgICAgIGR1bW15SW1nLnNyYyA9IGF0dHI7XG4gICAgICAgICAgICBpZiAoYXR0ciA9PSBwYXRoIHx8IGR1bW15SW1nLnNyYyA9PSBwYXRoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBwYXJzZU1ldGEoZWwuaW5uZXJIVE1MLCBlbC50eXBlLnJlcGxhY2UoXCJ0ZXh0L1wiLCBcIlwiKSk7XG4gICAgICAgICAgICAgICAgb25GaW5pc2goZGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9uRmluaXNoKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0cnlMb2FkRmlsZUJ5QXR0cmlidXRlKGltZywgb25GaW5pc2gpIHtcbiAgICB2YXIgcGF0aCA9IGltZy5nZXRBdHRyaWJ1dGUoYmFzZUF0dHIpLFxuICAgICAgICBleHRMID0gcGF0aC5tYXRjaCgvXFwuKHlhbWx8anNvbikkLyksXG4gICAgICAgIGV4dCA9IGV4dEwgPyBleHRMWzFdIDogZXh0TDtcbiAgICBpZiAoIWV4dCkge1xuICAgICAgICBvbkZpbmlzaCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeVRvTG9hZEZpbGUocGF0aCwgZXh0LCBvbkZpbmlzaCk7XG59XG5cbmZ1bmN0aW9uIHRyeUxvYWRZYW1sQnlTcmMoaW1nLCBvbkZpbmlzaCkge1xuICAgIHZhciBleHQgPSBcInlhbWxcIixcbiAgICAgICAgcGF0aCA9IGltZy5zcmMuc3Vic3RyKDAsIGltZy5zcmMubGFzdEluZGV4T2YoXCIuXCIpKSArIFwiLlwiICsgZXh0O1xuICAgIHRyeVRvTG9hZEZpbGUocGF0aCwgZXh0LCBvbkZpbmlzaCk7XG59XG5cbmZ1bmN0aW9uIHRyeUxvYWRKc29uQnlTcmMoaW1nLCBvbkZpbmlzaCkge1xuICAgIHZhciBleHQgPSBcImpzb25cIixcbiAgICAgICAgcGF0aCA9IGltZy5zcmMuc3Vic3RyKDAsIGltZy5zcmMubGFzdEluZGV4T2YoXCIuXCIpKSArIFwiLlwiICsgZXh0O1xuICAgIHRyeVRvTG9hZEZpbGUocGF0aCwgZXh0LCBvbkZpbmlzaCk7XG59XG5cbmZ1bmN0aW9uIHRyeVRvTG9hZEZpbGUocGF0aCwgZXh0LCBvbkZpbmlzaCkge1xuICAgIGxvYWRGaWxlKHBhdGgsIGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBwYXJzZU1ldGEoeGhyLnJlc3BvbnNlVGV4dCwgZXh0KTtcbiAgICAgICAgb25GaW5pc2goZGF0YSk7XG4gICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBvbkZpbmlzaCgpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBwYXJzZU1ldGEocmF3VGV4dCwgZm9ybWF0KSB7XG4gICAgaWYgKGZvcm1hdCA9PSBcImpzb25cIikge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShyYXdUZXh0KTtcbiAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PSBcInlhbWxcIikge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJGb3VyIENvcm5lcnM6XCIsXG4gICAgICAgICAgICBcIllBTUwgZmlsZXMgYXJlIGRlcHJlY2F0ZWQuXCIsXG4gICAgICAgICAgICBcIllvdSBjYW4gY3JlYXRlIG5ldyBtZXRhIGRhdGEgZmlsZXMgb25cIixcbiAgICAgICAgICAgIFwiaHR0cHM6Ly9kaWdpdGFsaW50ZXJhY3Rpb24uZ2l0aHViLmlvL2ZvdXJjb3JuZXJzLWVkaXRvci9cIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGxvYWRGaWxlKHBhdGgsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgZXJyb3IgPSBlcnJvciB8fCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH07XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MoeGhyLCBwYXRoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoeGhyLCBwYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgeGhyLm9wZW4oXCJHRVRcIiwgcGF0aCwgdHJ1ZSk7XG4gICAgeGhyLnNlbmQoKTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbCwgY2xzKSB7XG4gICAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKGNscyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNscztcbiAgICB9XG59OyIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsLCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICBpZiAoZWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoZWwuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgZWwuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbFtcIm9uXCIgKyBldmVudE5hbWVdID0gaGFuZGxlcjtcbiAgICB9XG59OyIsIi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTc1NjczNDQvZGV0ZWN0LWxlZnQtcmlnaHQtc3dpcGUtb24tdG91Y2gtZGV2aWNlcy1idXQtYWxsb3ctdXAtZG93bi1zY3JvbGxpbmdcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3dpcGVMZWZ0TmFtZSA9ICdzd2lwZUxlZnQnLFxuICAgICAgICBzd2lwZVJpZ2h0TmFtZSA9ICdzd2lwZVJpZ2h0JyxcbiAgICAgICAgc3dpcGVVcE5hbWUgPSAnc3dpcGVVcCcsXG4gICAgICAgIHN3aXBlRG93bk5hbWUgPSAnc3dpcGVEb3duJztcblxuICAgIChmdW5jdGlvbiAoZCkge1xuICAgICAgICB2YXIgY2UgPSBmdW5jdGlvbiAoZSwgbikge1xuICAgICAgICAgICAgICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKTtcbiAgICAgICAgICAgICAgICBhLmluaXRDdXN0b21FdmVudChuLCB0cnVlLCB0cnVlLCBlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgZS50YXJnZXQuZGlzcGF0Y2hFdmVudChhKTtcbiAgICAgICAgICAgICAgICBhID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBubSA9IHRydWUsXG4gICAgICAgICAgICBzcCA9IHt4OiAwLCB5OiAwfSxcbiAgICAgICAgICAgIGVwID0ge3g6IDAsIHk6IDB9LFxuICAgICAgICAgICAgdG91Y2ggPSB7XG4gICAgICAgICAgICAgICAgdG91Y2hzdGFydDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3AgPSB7eDogZS50b3VjaGVzWzBdLnBhZ2VYLCB5OiBlLnRvdWNoZXNbMF0ucGFnZVl9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG91Y2htb3ZlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBubSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBlcCA9IHt4OiBlLnRvdWNoZXNbMF0ucGFnZVgsIHk6IGUudG91Y2hlc1swXS5wYWdlWX07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b3VjaGVuZDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZShlLCAnZmMnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB4ID0gZXAueCAtIHNwLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeHIgPSBNYXRoLmFicyh4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0gZXAueSAtIHNwLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeXIgPSBNYXRoLmFicyh5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNYXRoLm1heCh4ciwgeXIpID4gMjApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZShlLCAoeHIgPiB5ciA/ICh4IDwgMCA/IHN3aXBlTGVmdE5hbWUgOiBzd2lwZVJpZ2h0TmFtZSkgOiAoeSA8IDAgPyBzd2lwZVVwTmFtZSA6IHN3aXBlRG93bk5hbWUpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbm0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG91Y2hjYW5jZWw6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5tID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICBmb3IgKHZhciBhIGluIHRvdWNoKSB7XG4gICAgICAgICAgICBkLmFkZEV2ZW50TGlzdGVuZXIoYSwgdG91Y2hbYV0sIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgfSkoZG9jdW1lbnQpO1xufTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2V0RWxlbWVudFN0eWxlcyA9IHJlcXVpcmUoJy4vZ2V0LWVsZW1lbnQtc3R5bGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZnJvbURvbSwgdG9Eb20pIHtcbiAgICB2YXIgc3R5bGVzID0gZ2V0RWxlbWVudFN0eWxlcyhmcm9tRG9tKTtcbiAgICBmb3IgKHZhciBpIGluIHN0eWxlcykge1xuICAgICAgICBpZiAoc3R5bGVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICB0b0RvbS5zdHlsZVtpXSA9IHN0eWxlc1tpXTtcbiAgICAgICAgfVxuICAgIH1cbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAxNS8wOC8yMDE2LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUoYXR0cmlidXRlLCBlbCkge1xuICAgIGlmIChlbCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZWwgPSBkb2N1bWVudDtcbiAgICB9XG4gICAgdmFyIG1hdGNoaW5nRWxlbWVudHMgPSBbXTtcbiAgICB2YXIgYWxsRWxlbWVudHMgPSBlbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpO1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoYWxsRWxlbWVudHMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEVsZW1lbnQgZXhpc3RzIHdpdGggYXR0cmlidXRlLiBBZGQgdG8gYXJyYXkuXG4gICAgICAgICAgICBtYXRjaGluZ0VsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbWF0Y2hpbmdFbGVtZW50cztcbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAxNS8wOC8yMDE2LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZG9tKSB7XG4gICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUoZG9tKTtcbn07XG5cbmZ1bmN0aW9uIGdldENvbXB1dGVkU3R5bGUoZG9tKSB7XG4gICAgdmFyIHN0eWxlLCByZXR1cm5zLCBtYXJnaW5zO1xuICAgIGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuICAgICAgICBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvbSwgbnVsbCk7XG4gICAgICAgIHJldHVybnMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdHlsZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwcm9wID0gc3R5bGVbaV0sXG4gICAgICAgICAgICAgICAgY2FtZWwgPSBjYW1lbGl6ZShwcm9wKSxcbiAgICAgICAgICAgICAgICB2YWwgPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3ApO1xuICAgICAgICAgICAgcmV0dXJuc1tjYW1lbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHN0eWxlID0gZG9tLmN1cnJlbnRTdHlsZSkge1xuICAgICAgICByZXR1cm5zID0ge307XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gc3R5bGUpIHtcbiAgICAgICAgICAgIHJldHVybnNbcHJvcF0gPSBzdHlsZVtwcm9wXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocmV0dXJucykge1xuICAgICAgICAvLyBJbiBDaHJvbWUgaW5zdGVhZCBvZiAnYXV0bycgYSBzdGF0aWMgdmFsdWUgaXMgcmV0dXJuZWQsIGluIEZpcmVmb3ggLSAwLlxuICAgICAgICAvLyBUbyBzb2x2ZSB0aGF0IHdlIGdldCBtYXJnaW5zIGZyb20gc3R5bGUgc2hlZXRzIGFuZCBzdHlsZSB0YWcuXG4gICAgICAgIG1hcmdpbnMgPSBnZXRTdHlsZVNoZWV0TWFyZ2lucyhkb20pO1xuICAgICAgICBmb3IgKHZhciBpIGluIG1hcmdpbnMpIHtcbiAgICAgICAgICAgIHJldHVybnNbaV0gPSBtYXJnaW5zW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXR1cm5zO1xufVxuXG5mdW5jdGlvbiBnZXRTdHlsZVNoZWV0TWFyZ2lucyhkb20pIHtcbiAgICAvLyBHZXQgYWxsIHN0eWxlc2hlZXRzIGFuZCBlbGVtZW50JyBzdHlsZSBhdHRyaWJ1dGVcbiAgICB2YXIgc2hlZXRzID0gZG9jdW1lbnQuc3R5bGVTaGVldHMsIG8gPSBbXSwgc3R5bGUgPSBkb20uZ2V0QXR0cmlidXRlKCdzdHlsZScpLFxuICAgICAgICBtYXJnaW4gPSB7fTtcbiAgICAvLyBHZXQgZWxlbWVudCdzIGJyb3dzZXIgc3BlY2lmaWMgY3NzIHJ1bGVzIG1hdGNoIG1ldGhvZFxuICAgIGRvbS5tYXRjaGVzID0gZG9tLm1hdGNoZXMgfHwgZG9tLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBkb20ubW96TWF0Y2hlc1NlbGVjdG9yIHx8IGRvbS5tc01hdGNoZXNTZWxlY3RvciB8fCBkb20ub01hdGNoZXNTZWxlY3RvcjtcbiAgICBmb3IgKHZhciBpIGluIHNoZWV0cykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRmlyZWZveCB0aHJvd3MgZXJyb3Igd2hlbiByZWFkaW5nIHN0eWxlc2hlZXRzIGZyb20gZXh0ZXJuYWwgcmVzb3VyY2VzXG4gICAgICAgICAgICB2YXIgcnVsZXMgPSBzaGVldHNbaV0ucnVsZXMgfHwgc2hlZXRzW2ldLmNzc1J1bGVzO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciByIGluIHJ1bGVzKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0b3IgPSBydWxlc1tyXS5zZWxlY3RvclRleHQsXG4gICAgICAgICAgICAgICAgcnVsZSA9IHJ1bGVzW3JdLmNzc1RleHQ7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIFRvIGF2b2lkIFVuY2F1Z2h0IFN5bnRheEVycm9yOiBGYWlsZWQgdG8gZXhlY3V0ZSAnbWF0Y2hlcycgb24gJ0VsZW1lbnQnOiAnW25nOmNsb2FrXSwgW25nLWNsb2FrXSwgW2RhdGEtbmctY2xvYWtdLCBbeC1uZy1jbG9ha10sIC5uZy1jbG9haywgLngtbmctY2xvYWssIC5uZy1oaWRlOm5vdCgubmctaGlkZS1hbmltYXRlKScgaXMgbm90IGEgdmFsaWQgc2VsZWN0b3IuXG4gICAgICAgICAgICAgICAgLy8gT2NjdXJzIHdoZW4gdXNpbmcgd2l0aCBhbmd1bGFyXG4gICAgICAgICAgICAgICAgaWYgKCFkb20ubWF0Y2hlcyhzZWxlY3RvcikgfHwgcnVsZS5tYXRjaChcIm1hcmdpblwiKSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdHlsZVJ1bGVzID0gc3BsaXRDc3NSdWxlKHJ1bGUpO1xuICAgICAgICAgICAgYXBwbHlTdHlsZXNUb01hcmdpbihtYXJnaW4sIHN0eWxlUnVsZXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzdHlsZSkge1xuICAgICAgICB2YXIgc3R5bGVSdWxlcyA9IHNwbGl0U3R5bGVSdWxlKHN0eWxlKTtcbiAgICAgICAgYXBwbHlTdHlsZXNUb01hcmdpbihtYXJnaW4sIHN0eWxlUnVsZXMpO1xuICAgIH1cbiAgICByZXR1cm4gbWFyZ2luO1xufVxuXG5mdW5jdGlvbiBhcHBseVN0eWxlc1RvTWFyZ2luKG1hcmdpbiwgc3R5bGVSdWxlcykge1xuICAgIHN0eWxlUnVsZXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgaWYgKGVsWzBdLm1hdGNoKFwibWFyZ2luXCIpKSB7XG4gICAgICAgICAgICB2YXIgbSA9IHt9O1xuICAgICAgICAgICAgaWYgKGVsWzBdID09IFwibWFyZ2luXCIpIHtcbiAgICAgICAgICAgICAgICBtID0gc3BsaXRNYXJnaW4oZWxbMV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtW2VsWzBdXSA9IGVsWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBtKSB7XG4gICAgICAgICAgICAgICAgbWFyZ2luW2tdID0gbVtrXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzcGxpdENzc1J1bGUocnVsZSkge1xuICAgIHZhciBjbGVhbmVkUnVsZSA9IGNsZWFuQ3NzUnVsZShydWxlKTtcbiAgICByZXR1cm4gc3BsaXRTdHlsZVJ1bGUoY2xlYW5lZFJ1bGUpO1xufVxuXG5mdW5jdGlvbiBzcGxpdFN0eWxlUnVsZShydWxlKSB7XG4gICAgdmFyIHJ1bGVzID0gcnVsZS5zcGxpdCgvOy9nKTtcbiAgICBydWxlcyA9IHJ1bGVzLmZpbHRlcihmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgcmV0dXJuIGVsICYmIGVsLnJlcGxhY2UoL1xccysvZywgJycpO1xuICAgIH0pO1xuICAgIHJldHVybiBydWxlcy5tYXAoZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHZhciBzID0gZWwuc3BsaXQoJzonKTtcbiAgICAgICAgc1swXSA9IGNhbWVsaXplKHNbMF0ucmVwbGFjZSgvXFxzKy9nLCAnJykpO1xuICAgICAgICBzWzFdID0gc1sxXS5yZXBsYWNlKC9cXHNcXHMrL2csICcgJykucmVwbGFjZSgvKF5cXHMrfFxccyskKS9nLCAnJyk7XG4gICAgICAgIHJldHVybiBzO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjbGVhbkNzc1J1bGUocnVsZSkge1xuICAgIHZhciBjbGVhbmVkUnVsZSA9IHJ1bGUubWF0Y2goL3soLio/KX0vZyk7XG4gICAgcmV0dXJuIGNsZWFuZWRSdWxlLm1hcChmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHJldHVybiB2YWwucmVwbGFjZSgvKHt8fXxcXHMrKS9nLCAnJyk7XG4gICAgfSlbMF07XG59XG5cbmZ1bmN0aW9uIHNwbGl0TWFyZ2luKG1hcmdpblJ1bGUpIHtcbiAgICB2YXIgbWFyZ2lucyA9IG1hcmdpblJ1bGUuc3BsaXQoJyAnKTtcbiAgICBpZiAobWFyZ2lucy5sZW5ndGggPT0gMSkge1xuICAgICAgICBtYXJnaW5zLmNvbmNhdChbbWFyZ2luc1swXSwgbWFyZ2luc1swXSwgbWFyZ2luc1swXV0pO1xuICAgIH1cbiAgICBpZiAobWFyZ2lucy5sZW5ndGggPT0gMikge1xuICAgICAgICBtYXJnaW5zLmNvbmNhdChtYXJnaW5zKTtcbiAgICB9XG4gICAgaWYgKG1hcmdpbnMubGVuZ3RoID09IDMpIHtcbiAgICAgICAgbWFyZ2lucy5wdXNoKG1hcmdpbnNbMV0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBtYXJnaW5Ub3A6IG1hcmdpbnNbMF0sXG4gICAgICAgIG1hcmdpblJpZ2h0OiBtYXJnaW5zWzFdLFxuICAgICAgICBtYXJnaW5Cb3R0b206IG1hcmdpbnNbMl0sXG4gICAgICAgIG1hcmdpbkxlZnQ6IG1hcmdpbnNbM11cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBjYW1lbGl6ZShzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcLShbYS16XSkvZywgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGIudG9VcHBlckNhc2UoKTtcbiAgICB9KTtcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDI3LzA4LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmaWxlTmFtZSwgdGFyZ2V0RG9jdW1lbnQpIHtcbiAgICB2YXIgc2NyaXB0ID0gdGFyZ2V0RG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgc2NyaXB0LnNyYyA9IGZpbGVOYW1lO1xuICAgIHRhcmdldERvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KVxufTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTcvMDkvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyB8fCBuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHM7XG59OyIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsLCBjbHMpIHtcbiAgICBpZiAoZWwuY2xhc3NMaXN0KSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKCcoXnxcXFxcYiknICsgY2xzLnNwbGl0KCcgJykuam9pbignfCcpICsgJyhcXFxcYnwkKScsICdnaScpLCAnICcpO1xuICAgIH1cbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwOS8wOC8yMDE3LlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICBpZiAoZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQuZGV0YWNoRXZlbnQpIHtcbiAgICAgICAgZWxlbWVudC5kZXRhY2hFdmVudChcIm9uXCIgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRbXCJvblwiICsgZXZlbnROYW1lXSA9IG51bGw7XG4gICAgfVxufTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDAxLzA5LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdHIsIGxlbiwgY3V0RnJvbVN0YXJ0KSB7XG4gICAgaWYgKHN0ci5sZW5ndGggPCBsZW4pIHtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9IGVsc2UgaWYgKCFjdXRGcm9tU3RhcnQpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoMCwgbGVuKS5yZXBsYWNlKC9cXHMrJC8sICcnKSArICcuLi4nO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnLi4uJyArIHN0ci5zdWJzdHIoc3RyLmxlbmd0aCAtIGxlbiwgc3RyLmxlbmd0aCkucmVwbGFjZSgvXlxccysvLCAnJyk7XG4gICAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgdmFyIHhtbERvYyA9IHBhcnNlWE1MKHN0cik7XG4gICAgcmV0dXJuIHhtbFRvSnNvbih4bWxEb2MpO1xufTtcblxuZnVuY3Rpb24geG1sVG9Kc29uKHhtbCwgdGFiKSB7XG4gICAgdmFyIG9iaiA9IHt9O1xuICAgIGlmICh4bWwubm9kZVR5cGUgPT0gMSkge1xuICAgICAgICBpZiAoeG1sLmF0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgb2JqW1wiQGF0dHJpYnV0ZXNcIl0gPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgeG1sLmF0dHJpYnV0ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYXR0cmlidXRlID0geG1sLmF0dHJpYnV0ZXMuaXRlbShqKTtcbiAgICAgICAgICAgICAgICBvYmpbXCJAYXR0cmlidXRlc1wiXVthdHRyaWJ1dGUubm9kZU5hbWVdID0gYXR0cmlidXRlLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoeG1sLm5vZGVUeXBlID09IDMpIHtcbiAgICAgICAgb2JqID0geG1sLm5vZGVWYWx1ZTtcbiAgICB9XG4gICAgaWYgKHhtbC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4bWwuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB4bWwuY2hpbGROb2Rlcy5pdGVtKGkpO1xuICAgICAgICAgICAgdmFyIG5vZGVOYW1lID0gaXRlbS5ub2RlTmFtZTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgKG9ialtub2RlTmFtZV0pID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICBvYmpbbm9kZU5hbWVdID0geG1sVG9Kc29uKGl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChvYmpbbm9kZU5hbWVdLnB1c2gpID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9sZCA9IG9ialtub2RlTmFtZV07XG4gICAgICAgICAgICAgICAgICAgIG9ialtub2RlTmFtZV0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgb2JqW25vZGVOYW1lXS5wdXNoKG9sZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9ialtub2RlTmFtZV0ucHVzaCh4bWxUb0pzb24oaXRlbSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHBhcnNlWE1MKHZhbCkge1xuICAgIGlmIChkb2N1bWVudC5pbXBsZW1lbnRhdGlvbiAmJiBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVEb2N1bWVudCkge1xuICAgICAgICB2YXIgeG1sRG9jID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyh2YWwsICd0ZXh0L3htbCcpO1xuICAgIH1cbiAgICBlbHNlIGlmICh3aW5kb3cuQWN0aXZlWE9iamVjdCkge1xuICAgICAgICB2YXIgeG1sRG9jID0gbmV3IEFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MRE9NXCIpO1xuICAgICAgICB4bWxEb2MubG9hZFhNTCh2YWwpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB4bWxEb2M7XG59XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDA4LzA5LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwYXRoLCBkYXRhKSB7XG4gICAgcmV0dXJuIGNvbnRleHRJc1ZhbGlkKHBhdGgsIGRhdGEpICYmXG4gICAgICAgIGxpbmtzQXJlVmFsaWQocGF0aCwgZGF0YSkgJiZcbiAgICAgICAgYmFja1N0b3J5SXNWYWxpZChwYXRoLCBkYXRhKSAmJlxuICAgICAgICBjcmVhdGl2ZUNvbW1vbnNBcmVWYWxpZChwYXRoLCBkYXRhKTtcbn07XG5cbmZ1bmN0aW9uIGNvbnRleHRJc1ZhbGlkKHBhdGgsIGRhdGEpIHtcbiAgICBpZiAoIWRhdGEuY29udGV4dCkge1xuICAgICAgICBjb25zb2xlLndhcm4ocGF0aCwgJzogXFwnY29udGV4dFxcJyBpcyBub3QgZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5jb250ZXh0ICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhLmNvbnRleHQpICE9ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgdGhyb3cgcGF0aCArICc6IFxcJ2NvbnRleHRcXCcgbXVzdCBiZSBhIGxpc3QnO1xuICAgIH0gZWxzZSBpZiAoZGF0YS5jb250ZXh0KSB7XG4gICAgICAgIHZhciB0b0RlbGV0ZSA9IFtdO1xuICAgICAgICBkYXRhLmNvbnRleHQuZm9yRWFjaChmdW5jdGlvbiAoZWwsIGkpIHtcbiAgICAgICAgICAgIGlmICghZWwuc3JjICYmICFlbC55b3V0dWJlX2lkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHBhdGgsICc6IFxcJ2NvbnRleHRcXCcsIGVsZW1lbnQgbnVtYmVyJywgU3RyaW5nKGkgKyAxKSxcbiAgICAgICAgICAgICAgICAgICAgJyAtIFxcJ3NyY1xcJyBhbmQgXFwneW91dHViZV9pZFxcJyBhcmUgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICB0b0RlbGV0ZS5wdXNoKGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRvRGVsZXRlLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICB2YXIgaiA9IGRhdGEuY29udGV4dC5pbmRleE9mKGVsKTtcbiAgICAgICAgICAgIGRhdGEuY29udGV4dC5zcGxpY2UoaiwgMSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gbGlua3NBcmVWYWxpZChwYXRoLCBkYXRhKSB7XG4gICAgaWYgKCFkYXRhLmxpbmtzKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdsaW5rc1xcJyBhcmUgbm90IGRlZmluZWQnKTtcbiAgICB9XG4gICAgaWYgKGRhdGEubGlua3MgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEubGlua3MpICE9ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgdGhyb3cgcGF0aCArICc6IFxcJ2xpbmtzXFwnIG11c3QgYmUgYSBsaXN0JztcbiAgICB9IGVsc2UgaWYgKGRhdGEubGlua3MpIHtcbiAgICAgICAgdmFyIHRvRGVsZXRlID0gW107XG4gICAgICAgIGRhdGEubGlua3MuZm9yRWFjaChmdW5jdGlvbiAoZWwsIGkpIHtcbiAgICAgICAgICAgIGlmICghZWwudXJsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHBhdGgsICc6IFxcJ2xpbmtzXFwnLCBlbGVtZW50IG51bWJlcicsIFN0cmluZyhpICsgMSksXG4gICAgICAgICAgICAgICAgICAgICcgLSBcXCd1cmxcXCcgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICB0b0RlbGV0ZS5wdXNoKGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRvRGVsZXRlLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICB2YXIgaiA9IGRhdGEubGlua3MuaW5kZXhPZihlbCk7XG4gICAgICAgICAgICBkYXRhLmxpbmtzLnNwbGljZShqLCAxKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYWNrU3RvcnlJc1ZhbGlkKHBhdGgsIGRhdGEpIHtcbiAgICBpZiAoIWRhdGEuYmFja1N0b3J5KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdiYWNrU3RvcnlcXCcgaXMgbm90IGRlZmluZWQnKTtcbiAgICB9XG4gICAgaWYgKGRhdGEuYmFja1N0b3J5ICYmICFkYXRhLmJhY2tTdG9yeS50ZXh0KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdiYWNrU3RvcnlcXCcgaGFzIG5vIHRleHQnKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGl2ZUNvbW1vbnNBcmVWYWxpZChwYXRoLCBkYXRhKSB7XG4gICAgaWYgKCFkYXRhLmNyZWF0aXZlQ29tbW9ucykge1xuICAgICAgICBjb25zb2xlLndhcm4ocGF0aCwgJzogXFwnY3JlYXRpdmVDb21tb25zXFwnIGFyZSBub3QgZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5jcmVhdGl2ZUNvbW1vbnMgJiYgIWRhdGEuY3JlYXRpdmVDb21tb25zLmNvcHlyaWdodCkge1xuICAgICAgICBjb25zb2xlLndhcm4ocGF0aCwgJzogXFwnY3JlYXRpdmVDb21tb25zXFwnIC0gYXV0aG9yIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBiYXNlQXR0ciA9IFwiZGF0YS00Y1wiLFxuICAgIGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZSA9IHJlcXVpcmUoJy4vaGVscGVycy9nZXQtYWxsLWVsZW1lbnRzLXdpdGgtYXR0cmlidXRlJyksXG4gICAgYWRkQ2xhc3MgPSByZXF1aXJlKCcuL2hlbHBlcnMvYWRkLWNsYXNzJyksXG4gICAgZ2V0SXNUb3VjaCA9IHJlcXVpcmUoXCIuL2hlbHBlcnMvaXMtdG91Y2gtc2NyZWVuXCIpLFxuICAgIHJlbW92ZUNsYXNzID0gcmVxdWlyZSgnLi9oZWxwZXJzL3JlbW92ZS1jbGFzcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkb20pIHtcblxuICAgIHJldHVybiBuZXcgSW1hZ2VNb2RlbChkb20pO1xuXG59O1xuXG5mdW5jdGlvbiBJbWFnZU1vZGVsKGRvbSkge1xuICAgIHRoaXMudG91Y2hlZCA9IGZhbHNlO1xuICAgIHRoaXMudG9wTGVmdENvcm5lciA9IEdhbGxlcnlDb3JuZXJNb2RlbEZhY3RvcnkoZG9tKTtcbiAgICB0aGlzLnRvcFJpZ2h0Q29ybmVyID0gbmV3IENvcm5lck1vZGVsKCk7XG4gICAgdGhpcy5ib3R0b21MZWZ0Q29ybmVyID0gbmV3IENvcm5lck1vZGVsKCk7XG4gICAgdGhpcy5ib3R0b21SaWdodENvcm5lciA9IG5ldyBDcmVhdGl2ZUNvbW1vbnNDb3JuZXIoKTtcbn1cblxuSW1hZ2VNb2RlbC5wcm90b3R5cGUudG9vbHNIaWRkZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9wTGVmdENvcm5lci52aXNpYmxlIHx8XG4gICAgICAgIHRoaXMudG9wUmlnaHRDb3JuZXIudmlzaWJsZSB8fFxuICAgICAgICB0aGlzLmJvdHRvbUxlZnRDb3JuZXIudmlzaWJsZSB8fFxuICAgICAgICB0aGlzLmJvdHRvbVJpZ2h0Q29ybmVyLnZpc2libGU7XG59O1xuXG5JbWFnZU1vZGVsLnByb3RvdHlwZS5zaG93VG9vbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy50b3VjaGVkID0gZ2V0SXNUb3VjaCgpO1xufTtcblxuSW1hZ2VNb2RlbC5wcm90b3R5cGUuaGlkZVRvb2xzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudG91Y2hlZCA9IGZhbHNlO1xufTtcblxuZnVuY3Rpb24gQ29ybmVyTW9kZWwoKSB7XG4gICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgdGhpcy5waW5uZWQgPSBmYWxzZTtcbn1cblxuQ29ybmVyTW9kZWwucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlKSB7XG4gICAgICAgIHRoaXMuc3RvcEV2ZW50UHJvcGFnYXRpb24oZSk7XG4gICAgfVxuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG59O1xuQ29ybmVyTW9kZWwucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucGlubmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG59O1xuQ29ybmVyTW9kZWwucHJvdG90eXBlLnN0b3BFdmVudFByb3BhZ2F0aW9uID0gZnVuY3Rpb24gKGUpIHtcbiAgICAvLyBSZXRyZWl2ZSBmdW5jdGlvbiBmcm9tIE1vdXNlRXZlbnQgb3IgSGFtbWVySlMgc3JjRXZlbnRcbiAgICBpZiAoZS5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlLnNyY0V2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbn07XG5Db3JuZXJNb2RlbC5wcm90b3R5cGUuZm9yY2VIaWRlID0gZnVuY3Rpb24gKGUpIHtcbiAgICB0aGlzLnN0b3BFdmVudFByb3BhZ2F0aW9uKGUpO1xuICAgIHRoaXMucGluKGZhbHNlKTtcbn07XG5Db3JuZXJNb2RlbC5wcm90b3R5cGUucGluID0gZnVuY3Rpb24gKHBpbm5lZCkge1xuICAgIGlmIChwaW5uZWQgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnBpbm5lZCA9IHBpbm5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBpbm5lZCA9ICF0aGlzLnBpbm5lZDtcbiAgICB9XG4gICAgaWYgKHRoaXMucGlubmVkKSB7XG4gICAgICAgIHRoaXMuc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIEdhbGxlcnlDb3JuZXJNb2RlbEZhY3RvcnkoZG9tKSB7XG4gICAgdmFyIGdhbGxlcnlEb20gPSBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUoYmFzZUF0dHIgKyAnLWdhbGxlcnktbGlzdCcsIGRvbSlbMF0sXG4gICAgICAgIGdhbGxlcnlJdGVtRG9tcyA9IGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZShiYXNlQXR0ciArICctZ2FsbGVyeS1pdGVtJywgZ2FsbGVyeURvbSksXG4gICAgICAgIHlvdVR1YmVJZnJhbWVzID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGJhc2VBdHRyICsgJy1nYWxsZXJ5LXl0JywgZ2FsbGVyeURvbSksXG4gICAgICAgIGNhcHRpb25Eb21zID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGJhc2VBdHRyICsgJy1nYWxsZXJ5LWNhcHRpb24nLCBkb20pO1xuXG4gICAgZnVuY3Rpb24gR2FsbGVyeUNvcm5lck1vZGVsKCkge1xuICAgICAgICBDb3JuZXJNb2RlbC5jYWxsKHRoaXMpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICB0aGlzLnByZXNlbGVjdGVkSXRlbSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBnb3RUb0luZGV4LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgR2FsbGVyeUNvcm5lck1vZGVsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29ybmVyTW9kZWwucHJvdG90eXBlKTtcblxuICAgIEdhbGxlcnlDb3JuZXJNb2RlbC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgQ29ybmVyTW9kZWwucHJvdG90eXBlLmhpZGUuY2FsbCh0aGlzKTtcbiAgICAgICAgeW91VHViZUlmcmFtZXMuZm9yRWFjaChwYXVzZVlvdVR1YmVWaWRlbyk7XG4gICAgfTtcbiAgICBHYWxsZXJ5Q29ybmVyTW9kZWwucHJvdG90eXBlLnNlbGVjdEl0ZW0gPSBmdW5jdGlvbiAoZXZlbnQsIGVsKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IGdhbGxlcnlJdGVtRG9tcy5pbmRleE9mKGVsKTtcbiAgICAgICAgZ290VG9JbmRleC5jYWxsKHRoaXMpO1xuICAgIH07XG4gICAgR2FsbGVyeUNvcm5lck1vZGVsLnByb3RvdHlwZS5zZWxlY3ROZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEluZGV4IDwgZ2FsbGVyeUl0ZW1Eb21zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCsrO1xuICAgICAgICAgICAgZ290VG9JbmRleC5jYWxsKHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBHYWxsZXJ5Q29ybmVyTW9kZWwucHJvdG90eXBlLnNlbGVjdFByZXZpb3VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEluZGV4ID09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXgtLTtcbiAgICAgICAgZ290VG9JbmRleC5jYWxsKHRoaXMpO1xuICAgIH07XG4gICAgR2FsbGVyeUNvcm5lck1vZGVsLnByb3RvdHlwZS5wcmVzZWxlY3RQcmV2aW91cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5wcmVzZWxlY3RlZEl0ZW0gPSBnYWxsZXJ5SXRlbURvbXNbdGhpcy5zZWxlY3RlZEluZGV4IC0gMV07XG4gICAgfTtcbiAgICBHYWxsZXJ5Q29ybmVyTW9kZWwucHJvdG90eXBlLnByZXNlbGVjdE5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucHJlc2VsZWN0ZWRJdGVtID0gZ2FsbGVyeUl0ZW1Eb21zW3RoaXMuc2VsZWN0ZWRJbmRleCArIDFdO1xuICAgIH07XG4gICAgR2FsbGVyeUNvcm5lck1vZGVsLnByb3RvdHlwZS5jbGVhclByZXNlbGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5wcmVzZWxlY3RlZEl0ZW0gPSB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICBHYWxsZXJ5Q29ybmVyTW9kZWwucHJvdG90eXBlLmdldFByZXZDb250cm9sbGVySGlkZGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEluZGV4IDw9IDA7XG4gICAgfTtcbiAgICBHYWxsZXJ5Q29ybmVyTW9kZWwucHJvdG90eXBlLmdldE5leHRDb250cm9sbGVySGlkZGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEluZGV4ID49IGdhbGxlcnlJdGVtRG9tcy5sZW5ndGggLSAxO1xuICAgIH07XG4gICAgR2FsbGVyeUNvcm5lck1vZGVsLnByb3RvdHlwZS5nZXRJdGVtSXNQcmVzZWxlY3RlZCA9IGZ1bmN0aW9uIChkb21FbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBkb21FbGVtZW50ID09IHRoaXMucHJlc2VsZWN0ZWRJdGVtO1xuICAgIH07XG4gICAgR2FsbGVyeUNvcm5lck1vZGVsLnByb3RvdHlwZS5nZXRDYXB0aW9uVmlzaWJsZSA9IGZ1bmN0aW9uIChkb21FbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBkb21FbGVtZW50ID09IGNhcHRpb25Eb21zW3RoaXMuc2VsZWN0ZWRJbmRleF07XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGdldEltYWdlT2Zmc2V0cyhlbGVtZW50cykge1xuICAgICAgICB2YXIgb2Zmc2V0cyA9IFtdO1xuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgb2Zmc2V0cy5wdXNoKGVsLm9mZnNldExlZnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG9mZnNldHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ290VG9JbmRleCgpIHtcbiAgICAgICAgaWYgKCFnYWxsZXJ5RG9tKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5zZWxlY3RlZEluZGV4LFxuICAgICAgICAgICAgc2NhbGVDb25zdGFudCA9IDAuOCxcbiAgICAgICAgICAgIGltYWdlT2Zmc2V0cyA9IGdldEltYWdlT2Zmc2V0cyhnYWxsZXJ5SXRlbURvbXMpO1xuICAgICAgICBnYWxsZXJ5SXRlbURvbXMuZm9yRWFjaChmdW5jdGlvbiAoZG9tLCBpKSB7XG4gICAgICAgICAgICBpZiAoaSA9PSBpbmRleCkge1xuICAgICAgICAgICAgICAgIGFkZENsYXNzKGRvbSwgJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbW92ZUNsYXNzKGRvbSwgJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBnYWxsZXJ5RG9tLnN0eWxlLm1hcmdpbkxlZnQgPSAtaW1hZ2VPZmZzZXRzW2luZGV4XSAqIHNjYWxlQ29uc3RhbnQgKyAncHgnO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgR2FsbGVyeUNvcm5lck1vZGVsKCk7XG59XG5cbmZ1bmN0aW9uIENyZWF0aXZlQ29tbW9uc0Nvcm5lcigpIHtcbiAgICBDb3JuZXJNb2RlbC5jYWxsKHRoaXMpO1xufVxuXG5DcmVhdGl2ZUNvbW1vbnNDb3JuZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb3JuZXJNb2RlbC5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBwYXVzZVlvdVR1YmVWaWRlbyhpZnJhbWUpIHtcbiAgICBpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSgne1wiZXZlbnRcIjpcImNvbW1hbmRcIixcImZ1bmNcIjpcInBhdXNlVmlkZW9cIixcImFyZ3NcIjpcIlwifScsICcqJyk7XG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwMi8wOC8yMDE3LlxuICpcbiAqIFNjcmlwdCB0aGF0IGlzIHVzZWQgZm9yIGltcG9ydGluZyB0aGUgcHJvamVjdCBpbiBleHRlcm5hbCBwcm9qZWN0c1xuICpcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gVG9EbzogWW91VHViZSBsaW5rcyBvZnRlbiBjYXVzZSBhIGRlbGF5IHdoZW4gaG92ZXIgb24gYW55IG9mIGNvcm5lcnMgYmVmb3JlIG9wZW5pbmcgaXRcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoXCIuL3BvbHlmaWxscy9pbmRleFwiKSgpO1xucmVxdWlyZShcIi4vaGVscGVycy9hZGQtc3dpcGUtZXZlbnRzXCIpKCk7XG5cbmV4cG9ydHMuaW5pdCA9IHJlcXVpcmUoXCIuL3dyYXAtYWxsLWltZy1lbGVtZW50cy1vbi1wYWdlXCIpO1xuZXhwb3J0cy53cmFwSW1nRWxlbWVudFdpdGhKc29uID0gcmVxdWlyZShcIi4vd3JhcC1pbWctZWxlbWVudC13aXRoLWpzb25cIik7XG5leHBvcnRzLndyYXBJbWdFbGVtZW50ID0gcmVxdWlyZShcIi4vd3JhcC1pbWctZWxlbWVudFwiKTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMDQvMDkvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghRXZlbnQucHJvdG90eXBlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIEV2ZW50LnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKCFFdmVudC5wcm90b3R5cGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgIEV2ZW50LnByb3RvdHlwZS5zdG9wUHJvcGFnYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICghRWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICB2YXIgZXZlbnRMaXN0ZW5lcnMgPSBbXTtcblxuICAgICAgICB2YXIgYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lciAvKiwgdXNlQ2FwdHVyZSAod2lsbCBiZSBpZ25vcmVkKSAqLykge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHdyYXBwZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUudGFyZ2V0ID0gZS5zcmNFbGVtZW50O1xuICAgICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldCA9IHNlbGY7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lci5oYW5kbGVFdmVudCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5oYW5kbGVFdmVudChlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsKHNlbGYsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAodHlwZSA9PSBcIkRPTUNvbnRlbnRMb2FkZWRcIikge1xuICAgICAgICAgICAgICAgIHZhciB3cmFwcGVyMiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiY29tcGxldGVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JhcHBlcihlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYXR0YWNoRXZlbnQoXCJvbnJlYWR5c3RhdGVjaGFuZ2VcIiwgd3JhcHBlcjIpO1xuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJzLnB1c2goe29iamVjdDogdGhpcywgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyLCB3cmFwcGVyOiB3cmFwcGVyMn0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlID0gbmV3IEV2ZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIGUuc3JjRWxlbWVudCA9IHdpbmRvdztcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlcjIoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaEV2ZW50KFwib25cIiArIHR5cGUsIHdyYXBwZXIpO1xuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJzLnB1c2goe29iamVjdDogdGhpcywgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyLCB3cmFwcGVyOiB3cmFwcGVyfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHR5cGUsIGxpc3RlbmVyIC8qLCB1c2VDYXB0dXJlICh3aWxsIGJlIGlnbm9yZWQpICovKSB7XG4gICAgICAgICAgICB2YXIgY291bnRlciA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoY291bnRlciA8IGV2ZW50TGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudExpc3RlbmVyID0gZXZlbnRMaXN0ZW5lcnNbY291bnRlcl07XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50TGlzdGVuZXIub2JqZWN0ID09IHRoaXMgJiYgZXZlbnRMaXN0ZW5lci50eXBlID09IHR5cGUgJiYgZXZlbnRMaXN0ZW5lci5saXN0ZW5lciA9PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBcIkRPTUNvbnRlbnRMb2FkZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXRhY2hFdmVudChcIm9ucmVhZHlzdGF0ZWNoYW5nZVwiLCBldmVudExpc3RlbmVyLndyYXBwZXIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXRhY2hFdmVudChcIm9uXCIgKyB0eXBlLCBldmVudExpc3RlbmVyLndyYXBwZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJzLnNwbGljZShjb3VudGVyLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICsrY291bnRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGFkZEV2ZW50TGlzdGVuZXI7XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSByZW1vdmVFdmVudExpc3RlbmVyO1xuICAgICAgICBpZiAoSFRNTERvY3VtZW50KSB7XG4gICAgICAgICAgICBIVE1MRG9jdW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyO1xuICAgICAgICAgICAgSFRNTERvY3VtZW50LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoV2luZG93KSB7XG4gICAgICAgICAgICBXaW5kb3cucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyO1xuICAgICAgICAgICAgV2luZG93LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDAzLzA5LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUFycmF5LnByb3RvdHlwZS5maWx0ZXIpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uIChmdW4vKiwgdGhpc0FyZyovKSB7XG4gICAgICAgICAgICAndXNlIHN0cmljdCc7XG5cbiAgICAgICAgICAgIGlmICh0aGlzID09PSB2b2lkIDAgfHwgdGhpcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHQgPSBPYmplY3QodGhpcyk7XG4gICAgICAgICAgICB2YXIgbGVuID0gdC5sZW5ndGggPj4+IDA7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGZ1biAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlcyA9IFtdO1xuICAgICAgICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHMubGVuZ3RoID49IDIgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgaW4gdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsID0gdFtpXTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiBUZWNobmljYWxseSB0aGlzIHNob3VsZCBPYmplY3QuZGVmaW5lUHJvcGVydHkgYXRcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgdGhlIG5leHQgaW5kZXgsIGFzIHB1c2ggY2FuIGJlIGFmZmVjdGVkIGJ5XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgIHByb3BlcnRpZXMgb24gT2JqZWN0LnByb3RvdHlwZSBhbmQgQXJyYXkucHJvdG90eXBlLlxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICBCdXQgdGhhdCBtZXRob2QncyBuZXcsIGFuZCBjb2xsaXNpb25zIHNob3VsZCBiZVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICByYXJlLCBzbyB1c2UgdGhlIG1vcmUtY29tcGF0aWJsZSBhbHRlcm5hdGl2ZS5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGZ1bi5jYWxsKHRoaXNBcmcsIHZhbCwgaSwgdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5wdXNoKHZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH07XG4gICAgfVxufTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMDMvMDkvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFByb2R1Y3Rpb24gc3RlcHMgb2YgRUNNQS0yNjIsIEVkaXRpb24gNSwgMTUuNC40LjE4XG4gICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjQuNC4xOFxuICAgIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcblxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc0FyZykge1xuXG4gICAgICAgICAgICB2YXIgVCwgaztcblxuICAgICAgICAgICAgaWYgKHRoaXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCcgdGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDEuIExldCBPIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0b09iamVjdCgpIHBhc3NpbmcgdGhlXG4gICAgICAgICAgICAvLyB8dGhpc3wgdmFsdWUgYXMgdGhlIGFyZ3VtZW50LlxuICAgICAgICAgICAgdmFyIE8gPSBPYmplY3QodGhpcyk7XG5cbiAgICAgICAgICAgIC8vIDIuIExldCBsZW5WYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCgpIGludGVybmFsXG4gICAgICAgICAgICAvLyBtZXRob2Qgb2YgTyB3aXRoIHRoZSBhcmd1bWVudCBcImxlbmd0aFwiLlxuICAgICAgICAgICAgLy8gMy4gTGV0IGxlbiBiZSB0b1VpbnQzMihsZW5WYWx1ZSkuXG4gICAgICAgICAgICB2YXIgbGVuID0gTy5sZW5ndGggPj4+IDA7XG5cbiAgICAgICAgICAgIC8vIDQuIElmIGlzQ2FsbGFibGUoY2FsbGJhY2spIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgICAgICAgICAvLyBTZWU6IGh0dHA6Ly9lczUuZ2l0aHViLmNvbS8jeDkuMTFcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoY2FsbGJhY2sgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDUuIElmIHRoaXNBcmcgd2FzIHN1cHBsaWVkLCBsZXQgVCBiZSB0aGlzQXJnOyBlbHNlIGxldFxuICAgICAgICAgICAgLy8gVCBiZSB1bmRlZmluZWQuXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBUID0gdGhpc0FyZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gNi4gTGV0IGsgYmUgMFxuICAgICAgICAgICAgayA9IDA7XG5cbiAgICAgICAgICAgIC8vIDcuIFJlcGVhdCwgd2hpbGUgayA8IGxlblxuICAgICAgICAgICAgd2hpbGUgKGsgPCBsZW4pIHtcblxuICAgICAgICAgICAgICAgIHZhciBrVmFsdWU7XG5cbiAgICAgICAgICAgICAgICAvLyBhLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG4gICAgICAgICAgICAgICAgLy8gICAgVGhpcyBpcyBpbXBsaWNpdCBmb3IgTEhTIG9wZXJhbmRzIG9mIHRoZSBpbiBvcGVyYXRvclxuICAgICAgICAgICAgICAgIC8vIGIuIExldCBrUHJlc2VudCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEhhc1Byb3BlcnR5XG4gICAgICAgICAgICAgICAgLy8gICAgaW50ZXJuYWwgbWV0aG9kIG9mIE8gd2l0aCBhcmd1bWVudCBQay5cbiAgICAgICAgICAgICAgICAvLyAgICBUaGlzIHN0ZXAgY2FuIGJlIGNvbWJpbmVkIHdpdGggY1xuICAgICAgICAgICAgICAgIC8vIGMuIElmIGtQcmVzZW50IGlzIHRydWUsIHRoZW5cbiAgICAgICAgICAgICAgICBpZiAoayBpbiBPKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaS4gTGV0IGtWYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbFxuICAgICAgICAgICAgICAgICAgICAvLyBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuICAgICAgICAgICAgICAgICAgICBrVmFsdWUgPSBPW2tdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlpLiBDYWxsIHRoZSBDYWxsIGludGVybmFsIG1ldGhvZCBvZiBjYWxsYmFjayB3aXRoIFQgYXNcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHRoaXMgdmFsdWUgYW5kIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyBrVmFsdWUsIGssIGFuZCBPLlxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKFQsIGtWYWx1ZSwgaywgTyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGQuIEluY3JlYXNlIGsgYnkgMS5cbiAgICAgICAgICAgICAgICBrKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyA4LiByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIH07XG4gICAgfVxufTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMDMvMDkvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmVxdWlyZSgnLi9mb3ItZWFjaCcpKCk7XG4gICAgcmVxdWlyZSgnLi9maWx0ZXInKSgpO1xuICAgIHJlcXVpcmUoJy4vbWFwJykoKTtcbiAgICByZXF1aXJlKCcuL2FkZC1ldmVudC1saXN0ZW5lcicpKCk7XG59O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwMy8wOS8yMDE2LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA1LCAxNS40LjQuMTlcbiAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuNC40LjE5XG4gICAgaWYgKCFBcnJheS5wcm90b3R5cGUubWFwKSB7XG5cbiAgICAgICAgQXJyYXkucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc0FyZykge1xuXG4gICAgICAgICAgICB2YXIgVCwgQSwgaztcblxuICAgICAgICAgICAgaWYgKHRoaXMgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJyB0aGlzIGlzIG51bGwgb3Igbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gMS4gTGV0IE8gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIFRvT2JqZWN0IHBhc3NpbmcgdGhlIHx0aGlzfFxuICAgICAgICAgICAgLy8gICAgdmFsdWUgYXMgdGhlIGFyZ3VtZW50LlxuICAgICAgICAgICAgdmFyIE8gPSBPYmplY3QodGhpcyk7XG5cbiAgICAgICAgICAgIC8vIDIuIExldCBsZW5WYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbFxuICAgICAgICAgICAgLy8gICAgbWV0aG9kIG9mIE8gd2l0aCB0aGUgYXJndW1lbnQgXCJsZW5ndGhcIi5cbiAgICAgICAgICAgIC8vIDMuIExldCBsZW4gYmUgVG9VaW50MzIobGVuVmFsdWUpLlxuICAgICAgICAgICAgdmFyIGxlbiA9IE8ubGVuZ3RoID4+PiAwO1xuXG4gICAgICAgICAgICAvLyA0LiBJZiBJc0NhbGxhYmxlKGNhbGxiYWNrKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgICAgICAgLy8gU2VlOiBodHRwOi8vZXM1LmdpdGh1Yi5jb20vI3g5LjExXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihjYWxsYmFjayArICcgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gNS4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFQgYmUgdW5kZWZpbmVkLlxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgVCA9IHRoaXNBcmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDYuIExldCBBIGJlIGEgbmV3IGFycmF5IGNyZWF0ZWQgYXMgaWYgYnkgdGhlIGV4cHJlc3Npb24gbmV3IEFycmF5KGxlbilcbiAgICAgICAgICAgIC8vICAgIHdoZXJlIEFycmF5IGlzIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBjb25zdHJ1Y3RvciB3aXRoIHRoYXQgbmFtZSBhbmRcbiAgICAgICAgICAgIC8vICAgIGxlbiBpcyB0aGUgdmFsdWUgb2YgbGVuLlxuICAgICAgICAgICAgQSA9IG5ldyBBcnJheShsZW4pO1xuXG4gICAgICAgICAgICAvLyA3LiBMZXQgayBiZSAwXG4gICAgICAgICAgICBrID0gMDtcblxuICAgICAgICAgICAgLy8gOC4gUmVwZWF0LCB3aGlsZSBrIDwgbGVuXG4gICAgICAgICAgICB3aGlsZSAoayA8IGxlbikge1xuXG4gICAgICAgICAgICAgICAgdmFyIGtWYWx1ZSwgbWFwcGVkVmFsdWU7XG5cbiAgICAgICAgICAgICAgICAvLyBhLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG4gICAgICAgICAgICAgICAgLy8gICBUaGlzIGlzIGltcGxpY2l0IGZvciBMSFMgb3BlcmFuZHMgb2YgdGhlIGluIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgLy8gYi4gTGV0IGtQcmVzZW50IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgSGFzUHJvcGVydHkgaW50ZXJuYWxcbiAgICAgICAgICAgICAgICAvLyAgICBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuICAgICAgICAgICAgICAgIC8vICAgVGhpcyBzdGVwIGNhbiBiZSBjb21iaW5lZCB3aXRoIGNcbiAgICAgICAgICAgICAgICAvLyBjLiBJZiBrUHJlc2VudCBpcyB0cnVlLCB0aGVuXG4gICAgICAgICAgICAgICAgaWYgKGsgaW4gTykge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuIExldCBrVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgbWV0aG9kIG9mIE8gd2l0aCBhcmd1bWVudCBQay5cbiAgICAgICAgICAgICAgICAgICAga1ZhbHVlID0gT1trXTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpaS4gTGV0IG1hcHBlZFZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgQ2FsbCBpbnRlcm5hbFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgbWV0aG9kIG9mIGNhbGxiYWNrIHdpdGggVCBhcyB0aGUgdGhpcyB2YWx1ZSBhbmQgYXJndW1lbnRcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGxpc3QgY29udGFpbmluZyBrVmFsdWUsIGssIGFuZCBPLlxuICAgICAgICAgICAgICAgICAgICBtYXBwZWRWYWx1ZSA9IGNhbGxiYWNrLmNhbGwoVCwga1ZhbHVlLCBrLCBPKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpaWkuIENhbGwgdGhlIERlZmluZU93blByb3BlcnR5IGludGVybmFsIG1ldGhvZCBvZiBBIHdpdGggYXJndW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIC8vIFBrLCBQcm9wZXJ0eSBEZXNjcmlwdG9yXG4gICAgICAgICAgICAgICAgICAgIC8vIHsgVmFsdWU6IG1hcHBlZFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAvLyAgIFdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAvLyAgIEVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgQ29uZmlndXJhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuZCBmYWxzZS5cblxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBicm93c2VycyB0aGF0IHN1cHBvcnQgT2JqZWN0LmRlZmluZVByb3BlcnR5LCB1c2UgdGhlIGZvbGxvd2luZzpcbiAgICAgICAgICAgICAgICAgICAgLy8gT2JqZWN0LmRlZmluZVByb3BlcnR5KEEsIGssIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICB2YWx1ZTogbWFwcGVkVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGJlc3QgYnJvd3NlciBzdXBwb3J0LCB1c2UgdGhlIGZvbGxvd2luZzpcbiAgICAgICAgICAgICAgICAgICAgQVtrXSA9IG1hcHBlZFZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBkLiBJbmNyZWFzZSBrIGJ5IDEuXG4gICAgICAgICAgICAgICAgaysrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyA5LiByZXR1cm4gQVxuICAgICAgICAgICAgcmV0dXJuIEE7XG4gICAgICAgIH07XG4gICAgfVxufTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXG4gKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBiYXNlQXR0ciA9IFwiZGF0YS00Y1wiLFxuICAgIGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZSA9IHJlcXVpcmUoJy4vaGVscGVycy9nZXQtYWxsLWVsZW1lbnRzLXdpdGgtYXR0cmlidXRlJyksXG4gICAgYWRkQ2xhc3MgPSByZXF1aXJlKCcuL2hlbHBlcnMvYWRkLWNsYXNzJyksXG4gICAgcmVtb3ZlQ2xhc3MgPSByZXF1aXJlKCcuL2hlbHBlcnMvcmVtb3ZlLWNsYXNzJyksXG4gICAgYWRkRXZlbnRMaXN0ZW5lciA9IHJlcXVpcmUoJy4vaGVscGVycy9hZGQtZXZlbnQtbGlzdGVuZXInKSxcbiAgICByZW1vdmVFdmVudExpc3RlbmVyID0gcmVxdWlyZShcIi4vaGVscGVycy9yZW1vdmUtZXZlbnQtbGlzdGVuZXJcIiksXG4gICAgSGFtbWVyID0gcmVxdWlyZSgnaGFtbWVyanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZG9tQ29udGFpbmVyLCBtb2RlbCkge1xuXG4gICAgdmFyIHdhdGNoZXJzID0gW10sXG4gICAgICAgIGRlc3Ryb3llcnMgPSBbXSxcbiAgICAgICAgaXNUb3VjaCA9IHJlcXVpcmUoJy4vaGVscGVycy9pcy10b3VjaC1zY3JlZW4nKSgpO1xuXG4gICAgaW5pdCgpO1xuXG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgc2V0Q2xhc3NXYXRjaGVycygpO1xuICAgICAgICBzZXRUZXh0V2F0Y2hlcnMoKTtcbiAgICAgICAgc2V0RXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgICAgZXhlY3V0ZVdhdGNoZXJzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0RXZlbnRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHZhciBhdHRyID0gYmFzZUF0dHIgKyAnLW9uJyxcbiAgICAgICAgICAgIGRvbXMgPSBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUoYXR0ciwgZG9tQ29udGFpbmVyKTtcbiAgICAgICAgZGVzdHJveWVycyA9IGRvbXMubWFwKGZ1bmN0aW9uIChkb20pIHtcbiAgICAgICAgICAgIHJldHVybiBzZXRFdmVudExpc3RlbmVyc0Zyb21FeHByZXNzaW9uKGRvbSwgZG9tLmdldEF0dHJpYnV0ZShhdHRyKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldEV2ZW50TGlzdGVuZXJzRnJvbUV4cHJlc3Npb24oZWwsIGV4cHJlc3Npb24pIHtcbiAgICAgICAgdmFyIGV2ZW50TWFwID0gcGFyc2VBdHRyaWJ1dGUoZXhwcmVzc2lvbik7XG4gICAgICAgIHZhciBkZXN0cm95ZXJzID0gW107XG4gICAgICAgIGZvciAodmFyIGV2ZW50TmFtZSBpbiBldmVudE1hcCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50TGlzdGVuZXIgPSBnZXRFdmVudExpc3RlbmVyKGVsLCBtb2RlbCwgZXZlbnRNYXBbZXZlbnROYW1lXSk7XG4gICAgICAgICAgICB2YXIgZGVzdHJveWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChpc1RvdWNoKSB7XG4gICAgICAgICAgICAgICAgaWYgKFsnY2xpY2snLCAnbW91c2VvdmVyJ10uaW5kZXhPZihldmVudE5hbWUpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhhbW1lcnRpbWUgPSBuZXcgSGFtbWVyKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgaGFtbWVydGltZS5vbigndGFwJywgZXZlbnRMaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIGRlc3Ryb3llciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbW1lcnRpbWUuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnROYW1lID09ICdjbGlja091dHNpZGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoYW1tZXJ0aW1lID0gbmV3IEhhbW1lcihkb2N1bWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGhhbW1lcnRpbWUub24oJ3RhcCcsIHdyYXBFdmVudExpc3RlbmVyVG9PdXRzaWRlQ2xpY2soZWwsIGV2ZW50TGlzdGVuZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgZGVzdHJveWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFtbWVydGltZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcihlbCwgZXZlbnROYW1lLCBldmVudExpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAgICAgZGVzdHJveWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihlbCwgZXZlbnROYW1lLCBldmVudExpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50TmFtZSA9PSAnY2xpY2tPdXRzaWRlJykge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IHdyYXBFdmVudExpc3RlbmVyVG9PdXRzaWRlQ2xpY2soZWwsIGV2ZW50TGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgIHZhciBldk5hbWUgPSAnY2xpY2snO1xuICAgICAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoZG9jdW1lbnQsIGV2TmFtZSwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgIGRlc3Ryb3llciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihkb2N1bWVudCwgZXZOYW1lLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcihlbCwgZXZlbnROYW1lLCBldmVudExpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICBkZXN0cm95ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoZG9jdW1lbnQsIGV2ZW50TmFtZSwgZXZlbnRMaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlc3Ryb3llcnMucHVzaChkZXN0cm95ZXIpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm4gcmVtb3ZlIGFsbCBldmVudCBsaXN0ZW5lcnMgZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkZXN0cm95ZXJzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0Q2xhc3NXYXRjaGVycygpIHtcbiAgICAgICAgdmFyIGF0dHIgPSBiYXNlQXR0ciArICctY2xhc3MnLFxuICAgICAgICAgICAgZG9tcyA9IGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZShhdHRyLCBkb21Db250YWluZXIpO1xuICAgICAgICBkb21zLmZvckVhY2goZnVuY3Rpb24gKGRvbSkge1xuICAgICAgICAgICAgdmFyIGNsYXNzV2F0Y2hlcnMgPSBnZXRDbGFzc1dhdGNoZXJzRm9yRWxlbWVudChkb20sIGRvbS5nZXRBdHRyaWJ1dGUoYXR0cikpO1xuICAgICAgICAgICAgd2F0Y2hlcnMucHVzaC5hcHBseSh3YXRjaGVycywgY2xhc3NXYXRjaGVycyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFRleHRXYXRjaGVycygpIHtcbiAgICAgICAgdmFyIGF0dHIgPSBiYXNlQXR0ciArICctdGV4dCcsXG4gICAgICAgICAgICBkb21zID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGF0dHIsIGRvbUNvbnRhaW5lcik7XG4gICAgICAgIGRvbXMuZm9yRWFjaChmdW5jdGlvbiAoZG9tKSB7XG4gICAgICAgICAgICB2YXIgdGV4dFdhdGNoZXIgPSBnZXRUZXh0V2F0Y2hlckZvckVsZW1lbnQoZG9tLCBkb20uZ2V0QXR0cmlidXRlKGF0dHIpKTtcbiAgICAgICAgICAgIHdhdGNoZXJzLnB1c2godGV4dFdhdGNoZXIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDbGFzc1dhdGNoZXJzRm9yRWxlbWVudChlbCwgZXhwcmVzc2lvbikge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICAgICAgICBjbGFzc0V4cHJlc3Npb25NYXAgPSBwYXJzZUF0dHJpYnV0ZShleHByZXNzaW9uKTtcbiAgICAgICAgZm9yICh2YXIgY2xhc3NOYW1lIGluIGNsYXNzRXhwcmVzc2lvbk1hcCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goZ2V0Q2xhc3NXYXRjaGVyKGVsLCBjbGFzc05hbWUsIGNsYXNzRXhwcmVzc2lvbk1hcFtjbGFzc05hbWVdKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDbGFzc1dhdGNoZXIoZWwsIGNsYXNzTmFtZSwgZXhwcmVzc2lvbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGdldENsYXNzRXhwcmVzc2lvblZhbHVlKGVsLCBtb2RlbCwgZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICAgICAgICBhZGRDbGFzcyhlbCwgY2xhc3NOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsIGNsYXNzTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUZXh0V2F0Y2hlckZvckVsZW1lbnQoZWwsIGV4cHJlc3Npb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVsLnRleHRDb250ZW50ID0gZ2V0VGV4dEV4cHJlc3Npb25WYWx1ZShlbCwgbW9kZWwsIGV4cHJlc3Npb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VBdHRyaWJ1dGUoc3RyKSB7XG4gICAgICAgIHZhciBrZXlWYWxTdHJzID0gc3RyLnNwbGl0KC8sXFxzKi8pLFxuICAgICAgICAgICAga2V5VmFsID0ge307XG4gICAgICAgIGtleVZhbFN0cnMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIHZhciBrdiA9IGVsLnNwbGl0KC86XFxzKi8pO1xuICAgICAgICAgICAga2V5VmFsW2t2WzBdXSA9IGt2WzFdO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGtleVZhbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUNsYXNzRXhwcmVzc2lvbihzdHIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9wcG9zaXRlOiBzdHIubWF0Y2goL14hLykgIT0gbnVsbCxcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHN0ci5yZXBsYWNlKC9eIS9nLCAnJykuc3BsaXQoJy4nKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q2xhc3NFeHByZXNzaW9uVmFsdWUoZWwsIG1vZGVsLCBleHByZXNzaW9uKSB7XG4gICAgICAgIHZhciBwYXJzZWRFeHByZXNzaW9uID0gcGFyc2VDbGFzc0V4cHJlc3Npb24oZXhwcmVzc2lvbiksXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0gcGFyc2VkRXhwcmVzc2lvbi5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgb3Bwb3NpdGUgPSBwYXJzZWRFeHByZXNzaW9uLm9wcG9zaXRlLFxuICAgICAgICAgICAgc3ViTW9kZWwgPSBtb2RlbCxcbiAgICAgICAgICAgIHRhcmdldFByb3BlcnR5ID0gcHJvcGVydGllcy5wb3AoKSxcbiAgICAgICAgICAgIHN1Yk1vZGVsTmFtZSA9IHByb3BlcnRpZXMuc2hpZnQoKSxcbiAgICAgICAgICAgIHZhbHVlO1xuICAgICAgICB3aGlsZSAoc3ViTW9kZWxOYW1lICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3ViTW9kZWwgPSBzdWJNb2RlbFtzdWJNb2RlbE5hbWVdO1xuICAgICAgICAgICAgc3ViTW9kZWxOYW1lID0gcHJvcGVydGllcy5zaGlmdCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygc3ViTW9kZWxbdGFyZ2V0UHJvcGVydHldID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdmFsdWUgPSBzdWJNb2RlbFt0YXJnZXRQcm9wZXJ0eV0uY2FsbChzdWJNb2RlbCwgZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSBzdWJNb2RlbFt0YXJnZXRQcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wcG9zaXRlID8gIXZhbHVlIDogdmFsdWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VGV4dEV4cHJlc3Npb25WYWx1ZShlbCwgbW9kZWwsIGV4cHJlc3Npb24pIHtcbiAgICAgICAgdmFyIHByb3BlcnRpZXMgPSBleHByZXNzaW9uLnNwbGl0KCcuJyksXG4gICAgICAgICAgICBzdWJNb2RlbCA9IG1vZGVsLFxuICAgICAgICAgICAgdGFyZ2V0UHJvcGVydHkgPSBwcm9wZXJ0aWVzLnBvcCgpLFxuICAgICAgICAgICAgc3ViTW9kZWxOYW1lID0gcHJvcGVydGllcy5zaGlmdCgpLFxuICAgICAgICAgICAgdmFsdWU7XG4gICAgICAgIHdoaWxlIChzdWJNb2RlbE5hbWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdWJNb2RlbCA9IHN1Yk1vZGVsW3N1Yk1vZGVsTmFtZV07XG4gICAgICAgICAgICBzdWJNb2RlbE5hbWUgPSBwcm9wZXJ0aWVzLnNoaWZ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBzdWJNb2RlbFt0YXJnZXRQcm9wZXJ0eV0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHN1Yk1vZGVsW3RhcmdldFByb3BlcnR5XS5jYWxsKHN1Yk1vZGVsLCBlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHN1Yk1vZGVsW3RhcmdldFByb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0RXZlbnRMaXN0ZW5lcihlbCwgbW9kZWwsIGV4cHJlc3Npb24pIHtcbiAgICAgICAgdmFyIHByb3BlcnRpZXMgPSBleHByZXNzaW9uLnNwbGl0KCcuJyksXG4gICAgICAgICAgICBzdWJNb2RlbCA9IG1vZGVsLFxuICAgICAgICAgICAgZnVuTmFtZSA9IHByb3BlcnRpZXMucG9wKCksXG4gICAgICAgICAgICBzdWJNb2RlbE5hbWUgPSBwcm9wZXJ0aWVzLnNoaWZ0KCk7XG4gICAgICAgIHdoaWxlIChzdWJNb2RlbE5hbWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdWJNb2RlbCA9IHN1Yk1vZGVsW3N1Yk1vZGVsTmFtZV07XG4gICAgICAgICAgICBzdWJNb2RlbE5hbWUgPSBwcm9wZXJ0aWVzLnNoaWZ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIC8vIFRpbWVvdXQgaXMgZm9yIHByZXZlbnRpbmcgZXZlbnRzIGZpcmluZyBvbiBlbGVtZW50c1xuICAgICAgICAgICAgLy8gc3RhbmRpbmcgb25lIGJlaGluZCBhbm90aGVyIChlLmcuIG9wZW4gYW5kIGNsb3NlIGJ1dHRvbilcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHN1Yk1vZGVsW2Z1bk5hbWVdLmNhbGwoc3ViTW9kZWwsIGV2ZW50LCBlbCk7XG4gICAgICAgICAgICAgICAgZXhlY3V0ZVdhdGNoZXJzKCk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd3JhcEV2ZW50TGlzdGVuZXJUb091dHNpZGVDbGljayhlbCwgZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gb3V0c2lkZUNsaWNrRXZlbnRMaXN0ZW5lcihldmVudCkge1xuICAgICAgICAgICAgdmFyIGlzQ2xpY2tJbnNpZGUgPSBlbC5jb250YWlucyhldmVudC50YXJnZXQpO1xuICAgICAgICAgICAgaWYgKCFpc0NsaWNrSW5zaWRlKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcihldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleGVjdXRlV2F0Y2hlcnMoKSB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2goZnVuY3Rpb24gKHdhdGNoZXIpIHtcbiAgICAgICAgICAgIHdhdGNoZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgd2F0Y2hlcnMgPSBudWxsO1xuICAgICAgICBkZXN0cm95ZXJzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBmbigpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGV4ZWN1dGVXYXRjaGVyczogZXhlY3V0ZVdhdGNoZXJzLFxuICAgICAgICBkZXN0cm95OiBkZXN0cm95XG4gICAgfVxuXG59OyIsIi5mYy1pbWFnZShkYXRhLTRjLWNsYXNzPVwidG91Y2gtc2NyZWVuOiB0b3VjaGVkXCIgZGF0YS00Yy1vbj1cImNsaWNrOiBzaG93VG9vbHMsIGNsaWNrT3V0c2lkZTogaGlkZVRvb2xzXCIpXG4gICAgaW1nKHNyYz1zcmMpXG4gICAgLmZjLXRvb2xzKGRhdGEtNGMtY2xhc3M9XCJjb2xsYXBzZWQ6IHRvb2xzSGlkZGVuXCIpXG4gICAgICAgIGlmIGNvbnRleHQgJiYgY29udGV4dC5sZW5ndGhcbiAgICAgICAgICAgIGJ1dHRvbi5mYy1idG4uZmMtYnRuLWNvcm5lci5mYy1idG4tdG9wLWxlZnQoZGF0YS00Yy1vbj1cImNsaWNrOiB0b3BMZWZ0Q29ybmVyLnNob3dcIilcbiAgICAgICAgICAgICAgICBpLmZjLWljb24uZmMtaWNvbi1jb250ZXh0XG4gICAgICAgIGlmIGxpbmtzICYmIGxpbmtzLmxlbmd0aFxuICAgICAgICAgICAgYnV0dG9uLmZjLWJ0bi5mYy1idG4tY29ybmVyLmZjLWJ0bi10b3AtcmlnaHQoZGF0YS00Yy1vbj1cImNsaWNrOiB0b3BSaWdodENvcm5lci5zaG93XCIpXG4gICAgICAgICAgICAgICAgaS5mYy1pY29uLmZjLWljb24tbGlua3NcbiAgICAgICAgaWYgYmFja1N0b3J5ICYmIGJhY2tTdG9yeS50ZXh0XG4gICAgICAgICAgICBidXR0b24uZmMtYnRuLmZjLWJ0bi1jb3JuZXIuZmMtYnRuLWJvdHRvbS1sZWZ0KGRhdGEtNGMtb249XCJjbGljazogYm90dG9tTGVmdENvcm5lci5zaG93XCIpXG4gICAgICAgICAgICAgICAgaS5mYy1pY29uLmZjLWljb24taW5mb1xuICAgICAgICBpZiBjcmVhdGl2ZUNvbW1vbnMgJiYgY3JlYXRpdmVDb21tb25zLmZvcm1hdHRlZENvcHlyaWdodFxuICAgICAgICAgICAgYnV0dG9uLmZjLWJ0bi5mYy1idG4tY29ybmVyLmZjLWJ0bi1ib3R0b20tcmlnaHQoZGF0YS00Yy1vbj1cImNsaWNrOiBib3R0b21SaWdodENvcm5lci5zaG93XCIpXG4gICAgICAgICAgICAgICAgaS5mYy1pY29uLmZjLWljb24tY29weXJpZ2h0XG4gICAgLmZjLWNvbnRlbnRcbiAgICAgICAgaWYgY29udGV4dCAmJiBjb250ZXh0Lmxlbmd0aFxuICAgICAgICAgICAgLmZjLWNvbnRlbnQtY29udGFpbmVyLmZjLWNvbnRlbnQtZmlsbChkYXRhLTRjLW9uPVwic3dpcGVMZWZ0OiB0b3BMZWZ0Q29ybmVyLnNlbGVjdE5leHQsIHN3aXBlUmlnaHQ6IHRvcExlZnRDb3JuZXIuc2VsZWN0UHJldmlvdXNcIlxuICAgICAgICAgICAgZGF0YS00Yy1jbGFzcz1cInZpc2libGU6IHRvcExlZnRDb3JuZXIudmlzaWJsZSwgcGlubmVkOiB0b3BMZWZ0Q29ybmVyLnBpbm5lZFwiKVxuICAgICAgICAgICAgICAgIC5mYy1nYWxsZXJ5KGRhdGEtNGMtY2xhc3M9XCJleHBhbmRlZDogIXRvcExlZnRDb3JuZXIudmlzaWJsZVwiKVxuICAgICAgICAgICAgICAgICAgICBpZiBjb250ZXh0Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIC5mYy1nYWxsZXJ5LWNvbnRyb2xzLmZjLWdhbGxlcnktcHJldihkYXRhLTRjLWNsYXNzPVwidHJhbnNwYXJlbnQ6IGdldFByZXZDb250cm9sbGVySGlkZGVuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYShkYXRhLTRjLW9uPVwiY2xpY2s6IHRvcExlZnRDb3JuZXIuc2VsZWN0UHJldmlvdXMsIG1vdXNlb3ZlcjogdG9wTGVmdENvcm5lci5wcmVzZWxlY3RQcmV2aW91cywgbW91c2VsZWF2ZTogdG9wTGVmdENvcm5lci5jbGVhclByZXNlbGVjdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLmZhLmZhLWFuZ2xlLWxlZnRcbiAgICAgICAgICAgICAgICAgICAgdWwoZGF0YS00Yy1nYWxsZXJ5LWxpc3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBlYWNoIGl0ZW0gaW4gY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpKGRhdGEtNGMtb249XCJjbGljazogdG9wTGVmdENvcm5lci5zZWxlY3RJdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLTRjLWNsYXNzPVwiaG92ZXI6IHRvcExlZnRDb3JuZXIuZ2V0SXRlbUlzUHJlc2VsZWN0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtNGMtZ2FsbGVyeS1pdGVtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBpdGVtLnNyY1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nKHNyYz1pdGVtLnNyYylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgaXRlbS55b3V0dWJlX2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZnJhbWUod2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9XCIvL3d3dy55b3V0dWJlLmNvbS9lbWJlZC9cIiArIGl0ZW0ueW91dHViZV9pZCArIFwiP2VuYWJsZWpzYXBpPTFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS00Yy1nYWxsZXJ5LXl0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT1cImJvcmRlcjpub25lXCIpXG4gICAgICAgICAgICAgICAgICAgIGlmIGNvbnRleHQubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgICAgICAgICAgLmZjLWdhbGxlcnktY29udHJvbHMuZmMtZ2FsbGVyeS1uZXh0KGRhdGEtNGMtY2xhc3M9XCJ0cmFuc3BhcmVudDogZ2V0TmV4dENvbnRyb2xsZXJIaWRkZW5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhKGRhdGEtNGMtb249XCJjbGljazogdG9wTGVmdENvcm5lci5zZWxlY3ROZXh0LCBtb3VzZW92ZXI6IHRvcExlZnRDb3JuZXIucHJlc2VsZWN0TmV4dCwgbW91c2VsZWF2ZTogdG9wTGVmdENvcm5lci5jbGVhclByZXNlbGVjdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLmZhLmZhLWFuZ2xlLXJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIGVhY2ggaXRlbSBpbiBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBpdGVtLmNyZWRpdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5mYy1nYWxsZXJ5LWNhcHRpb24oZGF0YS00Yy1nYWxsZXJ5LWNhcHRpb24gZGF0YS00Yy1jbGFzcz1cInZpc2libGU6IHRvcExlZnRDb3JuZXIuZ2V0Q2FwdGlvblZpc2libGVcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZjLWdhbGxlcnktY2FwdGlvbi10ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICN7aXRlbS5jcmVkaXR9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGl2KGRhdGEtNGMtZ2FsbGVyeS1jYXB0aW9uIGRhdGEtNGMtY2xhc3M9XCJ2aXNpYmxlOiB0b3BMZWZ0Q29ybmVyLmdldENhcHRpb25WaXNpYmxlXCIpXG4gICAgICAgICAgICAgICAgYnV0dG9uLmZjLWJ0bi5mYy1idG4tY29ybmVyLmZjLWJ0bi10b3AtcmlnaHQuZmMtZ2FsbGVyeS1jbG9zZS5mYy1idG4tY2xvc2UoZGF0YS00Yy1vbj1cImNsaWNrOiB0b3BMZWZ0Q29ybmVyLmZvcmNlSGlkZVwiIGRhdGEtNGMtY2xhc3M9XCJ2aXNpYmxlOiB0b3BMZWZ0Q29ybmVyLnZpc2libGVcIilcbiAgICAgICAgICAgICAgICAgICAgfCAmdGltZXM7XG4gICAgICAgIGlmIGxpbmtzICYmIGxpbmtzLmxlbmd0aFxuICAgICAgICAgICAgLmZjLWNvbnRlbnQtY29udGFpbmVyLmZjLWNvbnRlbnQtdG9wLXJpZ2h0KGRhdGEtNGMtY2xhc3M9XCJ2aXNpYmxlOiB0b3BSaWdodENvcm5lci52aXNpYmxlXCIpXG4gICAgICAgICAgICAgICAgLmZjLWNvbnRlbnQtYm9keVxuICAgICAgICAgICAgICAgICAgICAudGV4dC1yaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uLmZjLWJ0bi5mYy1idG4tY2xvc2UoZGF0YS00Yy1vbj1cImNsaWNrOiB0b3BSaWdodENvcm5lci5mb3JjZUhpZGVcIiBkYXRhLTRjLWNsYXNzPVwidmlzaWJsZTogdG9wUmlnaHRDb3JuZXIudmlzaWJsZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgJnRpbWVzO1xuICAgICAgICAgICAgICAgICAgICAuZmMtY29udGVudC10ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBoMSBMaW5rc1xuICAgICAgICAgICAgICAgICAgICAgICAgdWwuZmEtdWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYWNoIGl0ZW0gaW4gbGlua3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkuZmEuZmEtbGkoY2xhc3M9XCJmYS1cIiArIGl0ZW0udHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEuZmMtaW1hZ2UtYShocmVmPWl0ZW0udXJsKSAje2l0ZW0udGl0bGV9XG5cbiAgICAgICAgaWYgYmFja1N0b3J5ICYmIGJhY2tTdG9yeS50ZXh0XG4gICAgICAgICAgICAuZmMtY29udGVudC1jb250YWluZXIuZmMtY29udGVudC1ib3R0b20tbGVmdChkYXRhLTRjLWNsYXNzPVwidmlzaWJsZTogYm90dG9tTGVmdENvcm5lci52aXNpYmxlXCIpXG4gICAgICAgICAgICAgICAgLmZjLWNvbnRlbnQtYm9keVxuICAgICAgICAgICAgICAgICAgICAudGV4dC1yaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uLmZjLWJ0bi5mYy1idG4tY2xvc2UoZGF0YS00Yy1vbj1cImNsaWNrOiBib3R0b21MZWZ0Q29ybmVyLmZvcmNlSGlkZVwiIGRhdGEtNGMtY2xhc3M9XCJ2aXNpYmxlOiBib3R0b21MZWZ0Q29ybmVyLnZpc2libGVcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICZ0aW1lcztcbiAgICAgICAgICAgICAgICAgICAgLmZjLWNvbnRlbnQtdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgaDEgQmFja3N0b3J5XG4gICAgICAgICAgICAgICAgICAgICAgICBwICN7YmFja1N0b3J5LnRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgYmFja1N0b3J5LmF1dGhvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICN7YmFja1N0b3J5LmF1dGhvciArIChiYWNrU3RvcnkucHVibGljYXRpb24gfHwgYmFja1N0b3J5LmRhdGUgPyAnLCAnIDogJycpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGJhY2tTdG9yeS5wdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBiYWNrU3RvcnkucHVibGljYXRpb25VcmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEuZmMtaW1hZ2UtYShocmVmPWJhY2tTdG9yeS5wdWJsaWNhdGlvblVybCkgI3tiYWNrU3RvcnkucHVibGljYXRpb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgI3tiYWNrU3RvcnkucHVibGljYXRpb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgI3tiYWNrU3RvcnkuZGF0ZSA/ICcsICcgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBiYWNrU3RvcnkuZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICN7YmFja1N0b3J5LmRhdGV9XG4gICAgICAgIGlmIGNyZWF0aXZlQ29tbW9ucyAmJiBjcmVhdGl2ZUNvbW1vbnMuZm9ybWF0dGVkQ29weXJpZ2h0XG4gICAgICAgICAgICAuZmMtY29udGVudC1jb250YWluZXIuZmMtY29udGVudC1ib3R0b20tcmlnaHQoZGF0YS00Yy1jbGFzcz1cInZpc2libGU6IGJvdHRvbVJpZ2h0Q29ybmVyLnZpc2libGVcIilcbiAgICAgICAgICAgICAgICAuZmMtY29udGVudC1ib2R5XG4gICAgICAgICAgICAgICAgICAgIC50ZXh0LXJpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b24uZmMtYnRuLmZjLWJ0bi1jbG9zZShkYXRhLTRjLW9uPVwiY2xpY2s6IGJvdHRvbVJpZ2h0Q29ybmVyLmZvcmNlSGlkZVwiIGRhdGEtNGMtY2xhc3M9XCJ2aXNpYmxlOiBib3R0b21SaWdodENvcm5lci52aXNpYmxlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAmdGltZXM7XG4gICAgICAgICAgICAgICAgICAgIC5mYy1jb250ZW50LXRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHAuZmMtY29udGVudC1jb3B5cmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICN7Y3JlYXRpdmVDb21tb25zLmZvcm1hdHRlZENvcHlyaWdodH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNyZWF0aXZlQ29tbW9ucy5jb2RlT2ZFdGhpY3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwLmZjLWNvZGUtb2YtZXRoaWNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgQ09ERSBPRiBFVEhJQ1M6ICAje2NyZWF0aXZlQ29tbW9ucy5jb2RlT2ZFdGhpY3N9XG4gICAgICAgICAgICAgICAgICAgICAgICBwICN7Y3JlYXRpdmVDb21tb25zLmRlc2NyaXB0aW9ufVxuLmZjLWZvb3RlcihkYXRhLTRjLWZvb3RlcilcbiAgICB8IEZvdXIgQ29ybmVycyZuYnNwO1xuICAgIGkuZmMtaWNvbi5mYy1pY29uLWJyYW5kIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwMi8wOC8yMDE3LlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlID0gcmVxdWlyZShcIi4vaGVscGVycy9nZXQtYWxsLWVsZW1lbnRzLXdpdGgtYXR0cmlidXRlXCIpLFxuICAgIHdyYXBJbWdFbGVtZW50ID0gcmVxdWlyZShcIi4vd3JhcC1pbWctZWxlbWVudFwiKSxcbiAgICBiYXNlQXR0ciA9IFwiZGF0YS00Y1wiO1xuXG5mdW5jdGlvbiB3cmFwQWxsSW1nRWxlbWVudHNPblBhZ2UoKSB7XG4gICAgdmFyIGltZ3MgPSBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUoYmFzZUF0dHIpO1xuICAgIGltZ3MuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgaWYgKGVsLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICB3cmFwSW1nRWxlbWVudChlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd3JhcEltZ0VsZW1lbnQoZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd3JhcEFsbEltZ0VsZW1lbnRzT25QYWdlOyIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIHRlbXBsYXRlID0gcmVxdWlyZShcIi4vdGVtcGxhdGUucHVnXCIpLFxuICAgIGZhaWxlZEltYWdlVGVtcGxhdGUgPSByZXF1aXJlKFwiLi9mYWlsZWQtaW1hZ2UucHVnXCIpLFxuICAgIGNvcHlTdHlsZSA9IHJlcXVpcmUoXCIuL2hlbHBlcnMvY29weS1zdHlsZVwiKSxcbiAgICBiYXNlQXR0ciA9IFwiZGF0YS00Y1wiLFxuICAgIGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZSA9IHJlcXVpcmUoXCIuL2hlbHBlcnMvZ2V0LWFsbC1lbGVtZW50cy13aXRoLWF0dHJpYnV0ZVwiKSxcbiAgICBzaG9ydGVuVGV4dCA9IHJlcXVpcmUoXCIuL2hlbHBlcnMvc2hvcnRlbi10ZXh0XCIpLFxuICAgIGluc2VydFNjcmlwdCA9IHJlcXVpcmUoJy4vaGVscGVycy9pbnNlcnQtc2NyaXB0JyksXG4gICAgYWRkRXZlbnRMaXN0ZW5lciA9IHJlcXVpcmUoXCIuL2hlbHBlcnMvYWRkLWV2ZW50LWxpc3RlbmVyXCIpLFxuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIgPSByZXF1aXJlKFwiLi9oZWxwZXJzL3JlbW92ZS1ldmVudC1saXN0ZW5lclwiKSxcbiAgICBjc3MgPSByZXF1aXJlKCcuLi9zY3NzL21haW4uc2NzcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbWFnZURhdGEpIHtcbiAgICB2YXIgd3JhcHBlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIiksXG4gICAgICAgIHBhcmVudE5vZGUgPSB0aGlzLnBhcmVudE5vZGUsXG4gICAgICAgIGltZ0RvbSA9IHRoaXM7XG5cbiAgICBjb3B5U3R5bGUoaW1nRG9tLCB3cmFwcGVyRGl2KTtcbiAgICBzdHlsZVdyYXBwZXJEaXYod3JhcHBlckRpdik7XG4gICAgc3R5bGVJZnJhbWUoaWZyYW1lKTtcbiAgICB3cmFwcGVyRGl2LmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gICAgaWYgKHdyYXBwZXJEaXYuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShcImRpc3BsYXlcIikgPT09IFwiaW5saW5lXCIpIHtcbiAgICAgICAgd3JhcHBlckRpdi5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICB9XG4gICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQod3JhcHBlckRpdiwgaW1nRG9tKTtcblxuICAgIHZhciBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuXG4gICAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICAgIC8vIFNldCBpbWFnZSBzcmMgaW4gZGF0YSB0byByZW5kZXIgaXQgaW4gdGVtcGxhdGVcbiAgICBpbWFnZURhdGEuc3JjID0gdGhpcy5zcmM7XG4gICAgaWZyYW1lRG9jdW1lbnQud3JpdGUodGVtcGxhdGUoaW1hZ2VEYXRhKSk7XG4gICAgaWZyYW1lRG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChtYWtlU3R5bGUoKSk7XG4gICAgaW5zZXJ0U2NyaXB0KFwiaHR0cHM6Ly91c2UuZm9udGF3ZXNvbWUuY29tL2RjYmQ1MWI1NGIuanNcIiwgaWZyYW1lRG9jdW1lbnQpO1xuICAgIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG5cbiAgICB0cmVhdEZhdWx0eUltYWdlcyhpZnJhbWVEb2N1bWVudC5ib2R5KTtcbiAgICBhZGp1c3RJZnJhbWVIZWlnaHRUb0Zvb3RlcihpZnJhbWUsIHdyYXBwZXJEaXYpO1xuICAgIHZhciBkZXN0cm95TGlzdGVuZXJzID0gbGlzdGVuVG9SZXNpemUoaW1nRG9tLCB3cmFwcGVyRGl2LCBpZnJhbWUpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGVsZW1lbnQ6IGlmcmFtZURvY3VtZW50LmJvZHksXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRlc3Ryb3lMaXN0ZW5lcnMoKTtcbiAgICAgICAgICAgIGlmICh3cmFwcGVyRGl2LnBhcmVudE5vZGUgPT0gcGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGltZ0RvbSwgd3JhcHBlckRpdik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuZnVuY3Rpb24gbGlzdGVuVG9SZXNpemUoaW1nRG9tLCB3cmFwcGVyRGl2LCBpZnJhbWUpIHtcbiAgICB2YXIgcGFyZW50Tm9kZSA9IHdyYXBwZXJEaXYucGFyZW50Tm9kZSwgdGltZW91dDtcbiAgICB2YXIgcmVzaXplTGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChpbWdEb20pO1xuICAgICAgICAgICAgY29weVN0eWxlKGltZ0RvbSwgd3JhcHBlckRpdik7XG4gICAgICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKGltZ0RvbSk7XG4gICAgICAgICAgICBhZGp1c3RJZnJhbWVIZWlnaHRUb0Zvb3RlcihpZnJhbWUsIHdyYXBwZXJEaXYpO1xuICAgICAgICB9LCA1MDApO1xuICAgIH07XG4gICAgYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3csIFwicmVzaXplXCIsIHJlc2l6ZUxpc3RlbmVyKTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZGVzdHJveSBldmVudCBsaXN0ZW5lciBmdW5jdGlvblxuICAgICAqL1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIod2luZG93LCBcInJlc2l6ZVwiLCByZXNpemVMaXN0ZW5lcik7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gbWFrZVN0eWxlKCkge1xuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcbiAgICBzdHlsZS5pbm5lckhUTUwgPSBjc3M7XG4gICAgcmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiBhZGp1c3RJZnJhbWVIZWlnaHRUb0Zvb3RlcihpZnJhbWUsIHdyYXBwZXJEaXYpIHtcbiAgICB2YXIgZm9vdGVyID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGJhc2VBdHRyICsgXCItZm9vdGVyXCIsIGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50KVswXTtcbiAgICB3cmFwcGVyRGl2LnN0eWxlLmhlaWdodCA9IHdyYXBwZXJEaXYub2Zmc2V0SGVpZ2h0ICsgZm9vdGVyLm9mZnNldEhlaWdodCArIFwicHhcIjtcbn1cblxuZnVuY3Rpb24gc3R5bGVJZnJhbWUoaWZyYW1lKSB7XG4gICAgaWZyYW1lLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgaWZyYW1lLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgIGlmcmFtZS5zdHlsZS5ib3JkZXIgPSBcIm5vbmVcIjtcbn1cblxuZnVuY3Rpb24gc3R5bGVXcmFwcGVyRGl2KGRpdikge1xuICAgIC8vIFRvIHN1cHBvcnQgaW1hZ2UgYm9yZGVyLXJhZGl1c1xuICAgIGRpdi5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG59XG5cbmZ1bmN0aW9uIHRyZWF0RmF1bHR5SW1hZ2VzKGRpdikge1xuICAgIHZhciBnYWxsZXJ5RG9tID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGJhc2VBdHRyICsgXCItZ2FsbGVyeS1saXN0XCIsIGRpdilbMF0sXG4gICAgICAgIGdhbGxlcnlJdGVtRG9tcyA9IGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZShiYXNlQXR0ciArIFwiLWdhbGxlcnktaXRlbVwiLCBnYWxsZXJ5RG9tKTtcbiAgICBnYWxsZXJ5SXRlbURvbXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgdmFyIGltZyA9IGVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW1nXCIpWzBdO1xuICAgICAgICBpZiAoaW1nKSB7XG4gICAgICAgICAgICBpbWcub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBmYWlsZWRJbWFnZVRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgc2hvcnRTcmM6IHNob3J0ZW5UZXh0KGUuc3JjRWxlbWVudC5jdXJyZW50U3JjLCAzMCwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxTcmM6IGUuc3JjRWxlbWVudC5jdXJyZW50U3JjXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMDIvMDgvMjAxNy5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGRhdGFJc1ZhbGlkID0gcmVxdWlyZShcIi4vaW1hZ2UtZGF0YS1pcy12YWxpZFwiKSxcbiAgICB3cmFwSW1hZ2UgPSByZXF1aXJlKFwiLi93cmFwLWltYWdlXCIpLFxuICAgIGltYWdlTW9kZWxGYWN0b3J5ID0gcmVxdWlyZShcIi4vaW1hZ2UtbW9kZWxcIiksXG4gICAgc2V0TWFpbkNvbnRyb2xsZXIgPSByZXF1aXJlKFwiLi9zZXQtbWFpbi1jb250cm9sbGVyXCIpLFxuICAgIGFtZW5kSW1hZ2VEYXRhID0gcmVxdWlyZShcIi4vYW1lbmQtaW1hZ2UtZGF0YVwiKTtcblxuXG5mdW5jdGlvbiB3cmFwSW1nRWxlbWVudFdpdGhKc29uKGltZ0RvbSwganNvbiwgZmlsZVBhdGgpIHtcbiAgICBpZiAoIWRhdGFJc1ZhbGlkKGZpbGVQYXRoIHx8IFwiRm91ciBDb3JuZXJzIC0gSlNPTlwiLCBqc29uKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGFtZW5kSW1hZ2VEYXRhKGpzb24pO1xuXG4gICAgdmFyIHdyYXBwZWQgPSB3cmFwSW1hZ2UuY2FsbChpbWdEb20sIGpzb24pLFxuICAgICAgICBkZXN0cm95Q29udGFpbmVyID0gd3JhcHBlZC5kZXN0cm95LFxuICAgICAgICBkb21Db250YWluZXIgPSB3cmFwcGVkLmVsZW1lbnQsXG4gICAgICAgIG1vZGVsID0gaW1hZ2VNb2RlbEZhY3RvcnkoZG9tQ29udGFpbmVyKSxcbiAgICAgICAgY29udHJvbGxlciA9IHNldE1haW5Db250cm9sbGVyKGRvbUNvbnRhaW5lciwgbW9kZWwpLFxuICAgICAgICBkZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29udHJvbGxlci5kZXN0cm95KCk7XG4gICAgICAgICAgICBkZXN0cm95Q29udGFpbmVyKCk7XG4gICAgICAgIH07XG5cbiAgICByZXR1cm4gRmNJbnRlcmZhY2VGYWN0b3J5KG1vZGVsLCBjb250cm9sbGVyLCBkZXN0cm95KTtcbn1cblxuZnVuY3Rpb24gRmNJbnRlcmZhY2VGYWN0b3J5KG1vZGVsLCBjb250cm9sbGVyLCBmdWxsRGVzdHJveUZuKSB7XG4gICAgdmFyIGNvbnRyb2xsZXIgPSBjb250cm9sbGVyLFxuICAgICAgICBtb2RlbCA9IG1vZGVsO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdG9wTGVmdDogbmV3IEZjQ29ybmVySW50ZXJmYWNlKG1vZGVsLnRvcExlZnRDb3JuZXIsIGNvbnRyb2xsZXIpLFxuICAgICAgICB0b3BSaWdodDogbmV3IEZjQ29ybmVySW50ZXJmYWNlKG1vZGVsLnRvcFJpZ2h0Q29ybmVyLCBjb250cm9sbGVyKSxcbiAgICAgICAgYm90dG9tTGVmdDogbmV3IEZjQ29ybmVySW50ZXJmYWNlKG1vZGVsLmJvdHRvbUxlZnRDb3JuZXIsIGNvbnRyb2xsZXIpLFxuICAgICAgICBib3R0b21SaWdodDogbmV3IENvZGVPZkV0aGljc0Nvcm5lckludGVyZmFjZShtb2RlbC5ib3R0b21SaWdodENvcm5lciwgY29udHJvbGxlciksXG4gICAgICAgIGRlc3Ryb3k6IGZ1bGxEZXN0cm95Rm5cbiAgICB9O1xuXG59XG5cbmZ1bmN0aW9uIEZjQ29ybmVySW50ZXJmYWNlKGNvcm5lck1vZGVsLCBjb250cm9sbGVyKSB7XG5cbiAgICB2YXIgY29udHJvbGxlciA9IGNvbnRyb2xsZXIsXG4gICAgICAgIGNvcm5lck1vZGVsID0gY29ybmVyTW9kZWw7XG5cbiAgICB0aGlzLnBpbiA9IGZ1bmN0aW9uIChwaW5uZWQpIHtcbiAgICAgICAgY29ybmVyTW9kZWwucGluKHBpbm5lZCk7XG4gICAgICAgIGNvbnRyb2xsZXIuZXhlY3V0ZVdhdGNoZXJzKCk7XG4gICAgfTtcblxufVxuXG5mdW5jdGlvbiBDb2RlT2ZFdGhpY3NDb3JuZXJJbnRlcmZhY2UoY29ybmVyTW9kZWwsIGNvbnRyb2xsZXIpIHtcbiAgICB2YXIgY29udHJvbGxlciA9IGNvbnRyb2xsZXIsXG4gICAgICAgIGNvcm5lck1vZGVsID0gY29ybmVyTW9kZWw7XG5cbiAgICB0aGlzLnBpbiA9IGZ1bmN0aW9uIChwaW5uZWQpIHtcbiAgICAgICAgY29ybmVyTW9kZWwucGluKHBpbm5lZCk7XG4gICAgICAgIGNvbnRyb2xsZXIuZXhlY3V0ZVdhdGNoZXJzKCk7XG4gICAgfTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdyYXBJbWdFbGVtZW50V2l0aEpzb247XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDAyLzA4LzIwMTcuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBnZXRJbWFnZURhdGEgPSByZXF1aXJlKFwiLi9nZXQtaW1hZ2UtZGF0YVwiKSxcbiAgICBnZXRJbWFnZURhdGEgPSByZXF1aXJlKFwiLi9nZXQtaW1hZ2UtZGF0YVwiKSxcbiAgICB3cmFwSW1nRWxlbWVudFdpdGhKc29uID0gcmVxdWlyZShcIi4vd3JhcC1pbWctZWxlbWVudC13aXRoLWpzb25cIik7XG5cbmZ1bmN0aW9uIHdyYXBJbWdFbGVtZW50KGltZ0RvbSkge1xuICAgIGdldEltYWdlRGF0YS5jYWxsKGltZ0RvbSwgZnVuY3Rpb24gKGltYWdlRGF0YSwgZmlsZVBhdGgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRpbWVvdXQgaXMgdG8gbGV0IEludGVybmV0IEV4cGxvcmVyIHRvIHJlbmRlciB0aGUgaW1hZ2UgZmlyc3QgYW5kIGNhbGN1bGF0ZSBpdHMnIGhlaWdodFxuICAgICAgICAgKi9cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3cmFwSW1nRWxlbWVudFdpdGhKc29uKGltZ0RvbSwgaW1hZ2VEYXRhLCBmaWxlUGF0aCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdyYXBJbWdFbGVtZW50O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBcImJvZHkge1xcbiAgbWFyZ2luOiAwO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjsgfVxcblxcbnVsIHtcXG4gIG1hcmdpbi10b3A6IDA7IH1cXG5cXG4uZmMtaW1hZ2Uge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIGhlaWdodDogYXV0bzsgfVxcbiAgLmZjLWltYWdlICoge1xcbiAgICAtd2Via2l0LWJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIC1tb3otYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDsgfVxcbiAgLmZjLWltYWdlID4gaW1nIHtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIG1heC13aWR0aDogMTAwJTsgfVxcblxcbi5mYy1jb3JuZXItaWNvbiB7XFxuICB3aWR0aDogNTBweDtcXG4gIGhlaWdodDogNTBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvdHRvbTogMTBweDtcXG4gIHJpZ2h0OiAxMHB4O1xcbiAgYm9yZGVyLXJpZ2h0OiAxMHB4IHNvbGlkICNmZmY7XFxuICBib3JkZXItYm90dG9tOiAxMHB4IHNvbGlkICNmZmY7XFxuICBvcGFjaXR5OiAuNTtcXG4gIC13ZWJraXQtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzIGxpbmVhciwgdHJhbnNmb3JtIDAuMXMgbGluZWFyO1xcbiAgLW1vei10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgbGluZWFyLCB0cmFuc2Zvcm0gMC4xcyBsaW5lYXI7XFxuICAtbXMtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzIGxpbmVhciwgdHJhbnNmb3JtIDAuMXMgbGluZWFyO1xcbiAgLW8tdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzIGxpbmVhciwgdHJhbnNmb3JtIDAuMXMgbGluZWFyO1xcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzIGxpbmVhciwgdHJhbnNmb3JtIDAuMXMgbGluZWFyOyB9XFxuICAuZmMtY29ybmVyLWljb24uaG92ZXIsXFxuICAuZmMtaW1hZ2U6aG92ZXIgLmZjLWNvcm5lci1pY29uIHtcXG4gICAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgyMHB4LCAyMHB4KTtcXG4gICAgLW1vei10cmFuc2Zvcm06IHRyYW5zbGF0ZSgyMHB4LCAyMHB4KTtcXG4gICAgLW1zLXRyYW5zZm9ybTogdHJhbnNsYXRlKDIwcHgsIDIwcHgpO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgyMHB4LCAyMHB4KTtcXG4gICAgb3BhY2l0eTogMDsgfVxcblxcbmJvZHkge1xcbiAgZm9udC1zaXplOiAxM3B4O1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGxpbmUtaGVpZ2h0OiAxLjU7XFxuICAtd2Via2l0LXRleHQtZW1waGFzaXM6IGluaXRpYWw7XFxuICAtd2Via2l0LXRleHQtZmlsbC1jb2xvcjogaW5pdGlhbDtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiSGVsdmV0aWNhIE5ldWVcXFwiLCBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmOyB9XFxuXFxuaDEge1xcbiAgZm9udC1zaXplOiAyMHB4O1xcbiAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gIG1hcmdpbjogMCAwIDBweCAwOyB9XFxuXFxucCB7XFxuICBtYXJnaW46IDAgMCAxMHB4OyB9XFxuXFxuYSB7XFxuICBjb2xvcjogIzMzMztcXG4gIC13ZWJraXQtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIC1tb3otdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIC1tcy10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgLW8tdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7IH1cXG4gIGE6aG92ZXIsIGE6YWN0aXZlLCBhOmZvY3VzIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XFxuICAgIG9wYWNpdHk6IDAuODsgfVxcblxcbi5mYy1pbWFnZSB7XFxuICBjb2xvcjogIzMzMzsgfVxcblxcbi5mYy1mb290ZXIge1xcbiAgdGV4dC1hbGlnbjogcmlnaHQ7XFxuICBwYWRkaW5nOiA0cHggMCA0cHggMDsgfVxcblxcbi5mYy1pY29uIHtcXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBoZWlnaHQ6IDFlbTtcXG4gIHdpZHRoOiAxZW07IH1cXG4gIC5mYy1pY29uLWJyYW5kIHtcXG4gICAgYmFja2dyb3VuZDogdXJsKGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QnBaRDBpVEdGNVpYSmZNU0lnWkdGMFlTMXVZVzFsUFNKTVlYbGxjaUF4SWlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhacFpYZENiM2c5SWpBZ01DQTJOREFnTmpRd0lqNDhkR2wwYkdVK1ptTXRhV052Ymkwd01pMHdNVHd2ZEdsMGJHVStQSEpsWTNRZ2VEMGlMVEV1TlRRaUlIZHBaSFJvUFNJM01DSWdhR1ZwWjJoMFBTSXlOamt1TXlJdlBqeHlaV04wSUhrOUlqTTNNQzQzSWlCM2FXUjBhRDBpTnpBaUlHaGxhV2RvZEQwaU1qWTVMak1pTHo0OGNtVmpkQ0I0UFNJMU5qa3VPRFVpSUhkcFpIUm9QU0kzTUNJZ2FHVnBaMmgwUFNJeU5qa3VNeUl2UGp4eVpXTjBJSGc5SWprM0xqWTFJaUI1UFNJdE9Ua3VOalVpSUhkcFpIUm9QU0kzTUNJZ2FHVnBaMmgwUFNJeU5qa3VNeUlnZEhKaGJuTm1iM0p0UFNKMGNtRnVjMnhoZEdVb01UWTNMalkxSUMwNU55NDJOU2tnY205MFlYUmxLRGt3S1NJdlBqeHlaV04wSUhnOUlqazRMakV4SWlCNVBTSTBOekF1TXpVaUlIZHBaSFJvUFNJM01DSWdhR1ZwWjJoMFBTSXlOamt1TXlJZ2RISmhibk5tYjNKdFBTSjBjbUZ1YzJ4aGRHVW9Oek00TGpFeElEUTNNUzQ0T1NrZ2NtOTBZWFJsS0Rrd0tTSXZQanh5WldOMElIZzlJalEzTUM0ek5TSWdlVDBpTFRrNUxqWTFJaUIzYVdSMGFEMGlOekFpSUdobGFXZG9kRDBpTWpZNUxqTWlJSFJ5WVc1elptOXliVDBpZEhKaGJuTnNZWFJsS0RVME1DNHpOU0F0TkRjd0xqTTFLU0J5YjNSaGRHVW9PVEFwSWk4K1BISmxZM1FnZUQwaU5UWTVMamcxSWlCNVBTSXpOekF1TnlJZ2QybGtkR2c5SWpjd0xqQXlJaUJvWldsbmFIUTlJakkyT1M0eklpQjBjbUZ1YzJadmNtMDlJblJ5WVc1emJHRjBaU2d4TWpBNUxqY3lJREV3TVRBdU55a2djbTkwWVhSbEtERTRNQ2tpSUhOMGVXeGxQU0ptYVd4c09pTXlabUprWldNaUx6NDhjbVZqZENCNFBTSTBOekF1TXpVaUlIazlJalEzTUM0ek5TSWdkMmxrZEdnOUlqY3dJaUJvWldsbmFIUTlJakkyT1M0eklpQjBjbUZ1YzJadmNtMDlJblJ5WVc1emJHRjBaU2d0T1RrdU5qVWdNVEV4TUM0ek5Ta2djbTkwWVhSbEtDMDVNQ2tpSUhOMGVXeGxQU0ptYVd4c09pTXlabUprWldNaUx6NDhMM04yWno0PSk7IH1cXG4gIC5mYy1pY29uLWNvbnRleHQge1xcbiAgICBiYWNrZ3JvdW5kOiB1cmwoZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCcFpEMGlUR0Y1WlhKZk1TSWdaR0YwWVMxdVlXMWxQU0pNWVhsbGNpQXhJaUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSFpwWlhkQ2IzZzlJakFnTUNBeU1EQWdNakF3SWo0OGRHbDBiR1UrWm1NdGFXTnZiaTFqYjI1MFpYaDBQQzkwYVhSc1pUNDhjR0YwYUNCa1BTSk5NVEF1TWpZc056QjJOakJJTFRFMUxqRldOekJJTVRBdU1qWnRNVEF0TVRCSUxUSTFMakYyT0RCSU1qQXVNalpXTmpCb01Gb2lMejQ4Y0dGMGFDQmtQU0pOTWpFMUxqRTJMRFk1TGprMGRqWXdMakV5U0RFNE9TNDJPRlkyT1M0NU5HZ3lOUzQwT0UweU1qVXVNU3cyTUVneE56a3VOelIyT0RCSU1qSTFMakZXTmpCb01Gb2lMejQ4Y0dGMGFDQmtQU0pOTVRVNExqYzBMRFUzZGpnMlNEUXhMakk0VmpVM1NERTFPQzQzTkcweE1pMHhNa2d5T1M0eU9GWXhOVFZJTVRjd0xqYzBWalExYURCYUlpOCtQR05wY21Oc1pTQmplRDBpTmpVdU5qa2lJR041UFNJNE15NHdNeUlnY2owaU1URXVNVGdpTHo0OGNHOXNlV2R2YmlCd2IybHVkSE05SWpVMExqVXhJREV6TXlBeE5EVXVOVEVnTVRNeklERXpNeTR4T0NBNU1pNHpNeUF4TWpRdU5qZ2dPVFV1TXpNZ01URTJMakF4SURnd0xqRTNJRGt3TGpNMElERXhOaTR6TXlBM05pNDJJREV3T0M0NE15QTFOQzQxTVNBeE16TWlMejQ4TDNOMlp6ND0pOyB9XFxuICAuZmMtaWNvbi1pbmZvIHtcXG4gICAgYmFja2dyb3VuZDogdXJsKGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QnBaRDBpVEdGNVpYSmZNU0lnWkdGMFlTMXVZVzFsUFNKTVlYbGxjaUF4SWlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhacFpYZENiM2c5SWpBZ01DQXhOVElnTVRVeUlqNDhkR2wwYkdVK1ptTXRhV052YmkxcGJtWnZQQzkwYVhSc1pUNDhZMmx5WTJ4bElHTjRQU0kzTmlJZ1kzazlJamMySWlCeVBTSTNNQ0lnYzNSNWJHVTlJbVpwYkd3NmJtOXVaVHR6ZEhKdmEyVTZJekF3TUR0emRISnZhMlV0YldsMFpYSnNhVzFwZERveE1EdHpkSEp2YTJVdGQybGtkR2c2TVRKd2VDSXZQanh3WVhSb0lHUTlJazB4TURndU5Td3hNemd1TlRKakxUQXVNVFVzTVM0M05pMHVNeXd6TGpZeExUQXVORGdzTlM0ME5tRXdMamcwTERBdU9EUXNNQ3d3TERFdExqTTBMalV6WXkwMExqa3lMRE11TXpjdE1UQXVNak1zTlM0MU9DMHhOaTR6TVN3MUxqUXhZVEV5TERFeUxEQXNNQ3d4TFRjdU9ESXRNaTQ0TkN3eE1TNDJOQ3d4TVM0Mk5Dd3dMREFzTVMwekxqYzVMVGd1TXprc016SXNNeklzTUN3d0xERXNNaTQ1TXkweE5DNDNObU15TFRRdU56Y3NOQzR5TnkwNUxqUTBMRFl1TXpVdE1UUXVNVGxCTlRVdU5EY3NOVFV1TkRjc01Dd3dMREFzT1RNc09UY3VOR0V4T0M0d055d3hPQzR3Tnl3d0xEQXNNQ3d1TURjdE55NHhZeTB3TGpjdE15NHlOeTB6TFRRdU9URXROaTR5T0MwMExqVXRNUzR5TlM0eE5pMHlMalEyTERBdU5UTXRNeTQyT1N3d0xqZ3hZVEl1T1RNc01pNDVNeXd3TERBc01DMHVOamN1TW1Nd0xqRXRNUzR4TVM0eE9TMHlMakV6TERBdU1qZ3RNeTR4Tm1FeExqa3hMREV1T1RFc01Dd3dMREFzTUMwdU16ZGpMVEF1TVRndE1TNDFOeTQyT0MweUxqUTBMREV1T1RJdE15NHlOV0V6TUM0eU5Td3pNQzR5TlN3d0xEQXNNU3d4TVM0NU1pMDFMREUxTGpJMExERTFMakkwTERBc01Dd3hMRGd1TlRRc01Td3hNQzR6TlN3eE1DNHpOU3d3TERBc01TdzJMalEwTERndU5EY3NNekF1TWpRc016QXVNalFzTUN3d0xERXRNU3d4TVM0NU5HTXRNUzQzTkN3M0xqQTJMVFF1Tml3eE15NDNNUzAzTGpVNExESXdMak15TFRFdU5EZ3NNeTR6TFRNdU1qSXNOaTQwT1MwMExqRTJMREV3WVRFNUxqVTNMREU1TGpVM0xEQXNNQ3d3TFM0NE5pdzNMakV5WXpBdU16TXNNeTR4T1N3eUxqTTFMRFV1TVRjc05TNDFOQ3cxTGpFMlFUUTNMak14TERRM0xqTXhMREFzTUN3d0xERXdPQzQxTERFek9DNDFNbG9pSUhSeVlXNXpabTl5YlQwaWRISmhibk5zWVhSbEtDMHlOQ0F0TWpRcElpOCtQSEJoZEdnZ1pEMGlUVEV4TlM0ME9TdzFOUzQ0TTBFNUxqYzJMRGt1TnpZc01Dd3hMREVzTVRBMUxqYzJMRFEyYURCaE9TNDNNU3c1TGpjeExEQXNNQ3d4TERrdU55dzVMamN5ZGpBdU1EZGFJaUIwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNndE1qUWdMVEkwS1NJdlBqd3ZjM1puUGc9PSk7IH1cXG4gIC5mYy1pY29uLWxpbmtzIHtcXG4gICAgYmFja2dyb3VuZDogdXJsKGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QnBaRDBpVEdGNVpYSmZNU0lnWkdGMFlTMXVZVzFsUFNKTVlYbGxjaUF4SWlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhacFpYZENiM2c5SWpBZ01DQXhNell1TXpRZ01UTTJMak0ySWo0OGRHbDBiR1UrWm1NdGFXTnZiaTFzYVc1cmN6d3ZkR2wwYkdVK1BIQmhkR2dnWkQwaVRUZzRMakkyTERVeUxqbHNOeTR4Tml3M0xqRTJZVEl4TGpFNUxESXhMakU1TERBc01Dd3hMREFzTWprdU9EaE1OVFF1TlRrc01UTXdMamMzWVRJeExqRTVMREl4TGpFNUxEQXNNQ3d4TFRJNUxqZzRMREJzTFRVdU5EY3ROUzQwTjJFeU1TNHhPU3d5TVM0eE9Td3dMREFzTVN3d0xUSTVMamc0VERNd0xqZ3lMRGd6TGpnMElpQjBjbUZ1YzJadmNtMDlJblJ5WVc1emJHRjBaU2d0Tmk0NE15QXROaTQ0TWlraUlITjBlV3hsUFNKbWFXeHNPbTV2Ym1VN2MzUnliMnRsT2lNd01EQTdjM1J5YjJ0bExXeHBibVZqWVhBNmNtOTFibVE3YzNSeWIydGxMVzFwZEdWeWJHbHRhWFE2TVRBN2MzUnliMnRsTFhkcFpIUm9PakV5TGpRNU5qQXdNREk0T1RreE5qazVNbkI0SWk4K1BIQmhkR2dnWkQwaVRUWXhMamMwTERrM0xqRnNMVGN1TVRZdE55NHhObUV5TVM0eE9Td3lNUzR4T1N3d0xEQXNNU3d3TFRJNUxqZzRURGsxTGpReExERTVMakl6WVRJeExqRTVMREl4TGpFNUxEQXNNQ3d4TERJNUxqZzRMREJzTlM0ME55dzFMalEzWVRJeExqRTVMREl4TGpFNUxEQXNNQ3d4TERBc01qa3VPRGhNTVRFNUxqRTVMRFkyTGpFMklpQjBjbUZ1YzJadmNtMDlJblJ5WVc1emJHRjBaU2d0Tmk0NE15QXROaTQ0TWlraUlITjBlV3hsUFNKbWFXeHNPbTV2Ym1VN2MzUnliMnRsT2lNd01EQTdjM1J5YjJ0bExXeHBibVZqWVhBNmNtOTFibVE3YzNSeWIydGxMVzFwZEdWeWJHbHRhWFE2TVRBN2MzUnliMnRsTFhkcFpIUm9PakV5TGpRNU5qQXdNREk0T1RreE5qazVNbkI0SWk4K1BDOXpkbWMrKTsgfVxcbiAgLmZjLWljb24tY29weXJpZ2h0IHtcXG4gICAgYmFja2dyb3VuZDogdXJsKGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QnBaRDBpVEdGNVpYSmZNU0lnWkdGMFlTMXVZVzFsUFNKTVlYbGxjaUF4SWlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhacFpYZENiM2c5SWpBZ01DQXhOVElnTVRVeUlqNDhkR2wwYkdVK1ptTXRhV052YmkxamIzQjVjbWxuYUhROEwzUnBkR3hsUGp4amFYSmpiR1VnWTNnOUlqYzJJaUJqZVQwaU56WWlJSEk5SWpjd0lpQnpkSGxzWlQwaVptbHNiRHB1YjI1bE8zTjBjbTlyWlRvak1EQXdPM04wY205clpTMXRhWFJsY214cGJXbDBPakV3TzNOMGNtOXJaUzEzYVdSMGFEb3hNbkI0SWk4K1BIQmhkR2dnWkQwaVRURXhPQzR6Tnl3NE1pNDFNMkV4Tmk0M05Dd3hOaTQzTkN3d0xEQXNNQzAyTGpFM0xUUXVOamtzTWpBdU5UTXNNakF1TlRNc01Dd3dMREF0T0M0ME5pMHhMalkwTERJeExqRTNMREl4TGpFM0xEQXNNQ3d3TFRFMkxEY3NNalF1TVRjc01qUXVNVGNzTUN3d0xEQXROQzQzTkN3NExETXdMakUzTERNd0xqRTNMREFzTUN3d0xEQXNNVGt1T1RJc01qUXVOemtzTWpRdU56a3NNQ3d3TERBc05DNDJOQ3czTGpnMkxESXhMREl4TERBc01Dd3dMRFl1T1RNc05TNHhPU3d5TUN3eU1Dd3dMREFzTUN3NExqVTNMREV1T0RZc01Ua3VNaXd4T1M0eUxEQXNNQ3d3TERrdU1qZ3RNaTR4T0N3eE9DNDBPQ3d4T0M0ME9Dd3dMREFzTUN3MkxqWTJMVFl1TVRGc01UUXVNVGtzTVRBdU5UbGhNamt1TlRVc01qa3VOVFVzTUN3d0xERXRNVEl1TkRVc01UQXVNVFVzTXpndU5USXNNemd1TlRJc01Dd3dMREV0TVRVdU5Td3pMakk0TERRM0xqWXlMRFEzTGpZeUxEQXNNQ3d4TFRFMkxqY3RNaTQ0TkN3ek9DNHlMRE00TGpJc01Dd3dMREV0TVRNdU1qRXRPQzR4TXl3ek5pNDROeXd6Tmk0NE55d3dMREFzTVMwNExqWTRMVEV5TGpnekxEUXpMalkyTERRekxqWTJMREFzTUN3eExUTXVNVEV0TVRZdU9ERkJORE11TmpZc05ETXVOallzTUN3d0xERXNOall1TnpNc09EUXVNMkV6Tmk0NE9Dd3pOaTQ0T0N3d0xEQXNNU3c0TGpZNExURXlMamd6TERNNExqSTJMRE00TGpJMkxEQXNNQ3d4TERFekxqSXhMVGd1TVRNc05EY3VOaklzTkRjdU5qSXNNQ3d3TERFc01UWXVOeTB5TGpnMExEUXhMRFF4TERBc01Dd3hMRFl1T0RJdU5pd3pOaTQ1TXl3ek5pNDVNeXd3TERBc01TdzNMREV1T1RFc016RXVNakVzTXpFdU1qRXNNQ3d3TERFc05pNDJNU3d6TGpRNUxESTJMak16TERJMkxqTXpMREFzTUN3eExEVXVOamdzTlM0ek5Wb2lJSFJ5WVc1elptOXliVDBpZEhKaGJuTnNZWFJsS0MweU5DQXRNalFwSWk4K1BDOXpkbWMrKTsgfVxcblxcbi50ZXh0LXJpZ2h0IHtcXG4gIHRleHQtYWxpZ246IHJpZ2h0OyB9XFxuXFxuLmZjLWNvbnRlbnQge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlOyB9XFxuICAuZmMtY29udGVudC1jb250YWluZXIge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBtYXgtd2lkdGg6IDI2MHB4O1xcbiAgICBtYXgtaGVpZ2h0OiAxMDAlO1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgICBjb2xvcjogIzMzMztcXG4gICAgb3ZlcmZsb3cteTogYXV0bztcXG4gICAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOCk7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNkZWRlZGU7XFxuICAgIC13ZWJraXQtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gICAgLW1vei10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgICAtbXMtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gICAgLW8tdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjsgfVxcbiAgICAuZmMtY29udGVudC1jb250YWluZXIudmlzaWJsZSwgLmZjLWNvbnRlbnQtY29udGFpbmVyLnBpbm5lZCB7XFxuICAgICAgb3BhY2l0eTogMTtcXG4gICAgICB6LWluZGV4OiAyOyB9XFxuICAuZmMtY29udGVudC1ib2R5IHtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuZmMtY29udGVudC10ZXh0IHtcXG4gICAgcGFkZGluZzogMHB4IDE1cHggMTVweCAxMHB4O1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIHotaW5kZXg6IDI7XFxuICAgIHRleHQtYWxpZ246IGxlZnQ7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDsgfVxcbiAgLmZjLWNvbnRlbnQtZmlsbCB7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgbWF4LXdpZHRoOiAxMDAlOyB9XFxuICAuZmMtY29udGVudC10b3AtcmlnaHQge1xcbiAgICB0b3A6IDA7XFxuICAgIHJpZ2h0OiAwOyB9XFxuICAuZmMtY29udGVudC1ib3R0b20tbGVmdCB7XFxuICAgIGJvdHRvbTogMDtcXG4gICAgbGVmdDogMDsgfVxcbiAgLmZjLWNvbnRlbnQtYm90dG9tLXJpZ2h0IHtcXG4gICAgYm90dG9tOiAwO1xcbiAgICByaWdodDogMDsgfVxcbiAgLmZjLWNvbnRlbnQtY29weXJpZ2h0IHtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuXFxuLmZjLXRvb2xzIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHotaW5kZXg6IDE7XFxuICAtd2Via2l0LWJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAtbW96LWJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxuICAtbW96LXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gIC1tcy10cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxuICBvcGFjaXR5OiAwO1xcbiAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgbGluZWFyLCB0cmFuc2Zvcm0gMC4ycyBsaW5lYXI7XFxuICAtbW96LXRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBsaW5lYXIsIHRyYW5zZm9ybSAwLjJzIGxpbmVhcjtcXG4gIC1tcy10cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgbGluZWFyLCB0cmFuc2Zvcm0gMC4ycyBsaW5lYXI7XFxuICAtby10cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgbGluZWFyLCB0cmFuc2Zvcm0gMC4ycyBsaW5lYXI7XFxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgbGluZWFyLCB0cmFuc2Zvcm0gMC4ycyBsaW5lYXI7IH1cXG4gIC5mYy10b29sczpob3ZlciB7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICAtbXMtdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgb3BhY2l0eTogMTsgfVxcbiAgLnRvdWNoLXNjcmVlbiAuZmMtdG9vbHMge1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIC1tb3otdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIG9wYWNpdHk6IDE7IH1cXG4gIC5mYy10b29scy5jb2xsYXBzZWQge1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gICAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxuICAgIC1tcy10cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gICAgb3BhY2l0eTogMDsgfVxcblxcbi5mYy1idG4ge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgbWFyZ2luOiAwO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XFxuICBjb2xvcjogIzMzMztcXG4gIGJhY2tncm91bmQ6ICNmZmY7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjZGVkZWRlO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgZm9udC1zaXplOiAyMnB4O1xcbiAgaGVpZ2h0OiAzNXB4O1xcbiAgd2lkdGg6IDM1cHg7XFxuICBvcGFjaXR5OiAwLjg7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgcGFkZGluZzogMDtcXG4gIC13ZWJraXQtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIC1tb3otdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIC1tcy10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgLW8tdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7IH1cXG4gIC5mYy1idG46aG92ZXIsIC5mYy1idG46YWN0aXZlLCAuZmMtYnRuOmZvY3VzIHtcXG4gICAgb3BhY2l0eTogMTsgfVxcbiAgLmZjLWJ0bi1jb3JuZXIge1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7IH1cXG4gIC5mYy1idG4tdG9wLWxlZnQge1xcbiAgICB0b3A6IDEwcHg7XFxuICAgIGxlZnQ6IDEwcHg7IH1cXG4gIC5mYy1idG4tdG9wLXJpZ2h0IHtcXG4gICAgdG9wOiAxMHB4O1xcbiAgICByaWdodDogMTBweDsgfVxcbiAgLmZjLWJ0bi1ib3R0b20tbGVmdCB7XFxuICAgIGJvdHRvbTogMTBweDtcXG4gICAgbGVmdDogMTBweDsgfVxcbiAgLmZjLWJ0bi1ib3R0b20tcmlnaHQge1xcbiAgICBib3R0b206IDEwcHg7XFxuICAgIHJpZ2h0OiAxMHB4OyB9XFxuICAuZmMtYnRuLWNsb3NlIHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG4gICAgZm9udC1zaXplOiAzMHB4O1xcbiAgICBwYWRkaW5nOiAwIDAgNXB4O1xcbiAgICBsaW5lLWhlaWdodDogMWVtOyB9XFxuXFxuLmZjLXRvb2xzIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHotaW5kZXg6IDE7XFxuICAtd2Via2l0LWJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAtbW96LWJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxuICAtbW96LXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gIC1tcy10cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxuICBvcGFjaXR5OiAwO1xcbiAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgbGluZWFyLCB0cmFuc2Zvcm0gMC4ycyBsaW5lYXI7XFxuICAtbW96LXRyYW5zaXRpb246IG9wYWNpdHkgMC4zcyBsaW5lYXIsIHRyYW5zZm9ybSAwLjJzIGxpbmVhcjtcXG4gIC1tcy10cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgbGluZWFyLCB0cmFuc2Zvcm0gMC4ycyBsaW5lYXI7XFxuICAtby10cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgbGluZWFyLCB0cmFuc2Zvcm0gMC4ycyBsaW5lYXI7XFxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgbGluZWFyLCB0cmFuc2Zvcm0gMC4ycyBsaW5lYXI7IH1cXG4gIC5mYy10b29sczpob3ZlciB7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICAtbXMtdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgb3BhY2l0eTogMTsgfVxcbiAgLnRvdWNoLXNjcmVlbiAuZmMtdG9vbHMge1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIC1tb3otdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIG9wYWNpdHk6IDE7IH1cXG4gIC5mYy10b29scy5jb2xsYXBzZWQge1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gICAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxuICAgIC1tcy10cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS41KTtcXG4gICAgb3BhY2l0eTogMDsgfVxcblxcbi5mYy1idG4ge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgbWFyZ2luOiAwO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XFxuICBjb2xvcjogIzMzMztcXG4gIGJhY2tncm91bmQ6ICNmZmY7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjZGVkZWRlO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgZm9udC1zaXplOiAyMnB4O1xcbiAgaGVpZ2h0OiAzNXB4O1xcbiAgd2lkdGg6IDM1cHg7XFxuICBvcGFjaXR5OiAwLjg7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgcGFkZGluZzogMDtcXG4gIC13ZWJraXQtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIC1tb3otdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIC1tcy10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgLW8tdHJhbnNpdGlvbjogb3BhY2l0eSAwLjFzIGxpbmVhcjtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7IH1cXG4gIC5mYy1idG46aG92ZXIsIC5mYy1idG46YWN0aXZlLCAuZmMtYnRuOmZvY3VzIHtcXG4gICAgb3BhY2l0eTogMTsgfVxcbiAgLmZjLWJ0bi1jb3JuZXIge1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7IH1cXG4gIC5mYy1idG4tdG9wLWxlZnQge1xcbiAgICB0b3A6IDEwcHg7XFxuICAgIGxlZnQ6IDEwcHg7IH1cXG4gIC5mYy1idG4tdG9wLXJpZ2h0IHtcXG4gICAgdG9wOiAxMHB4O1xcbiAgICByaWdodDogMTBweDsgfVxcbiAgLmZjLWJ0bi1ib3R0b20tbGVmdCB7XFxuICAgIGJvdHRvbTogMTBweDtcXG4gICAgbGVmdDogMTBweDsgfVxcbiAgLmZjLWJ0bi1ib3R0b20tcmlnaHQge1xcbiAgICBib3R0b206IDEwcHg7XFxuICAgIHJpZ2h0OiAxMHB4OyB9XFxuICAuZmMtYnRuLWNsb3NlIHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG4gICAgZm9udC1zaXplOiAzMHB4O1xcbiAgICBwYWRkaW5nOiAwIDAgNXB4O1xcbiAgICBsaW5lLWhlaWdodDogMWVtOyB9XFxuXFxuLmZjLWdhbGxlcnkge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBvdmVyZmxvdzogaGlkZGVuOyB9XFxuICAuZmMtZ2FsbGVyeS1mYWlsZWQtaW1hZ2Uge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBiYWNrZ3JvdW5kOiAjMDAwO1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGRpc3BsYXk6IHRhYmxlOyB9XFxuICAgIC5mYy1nYWxsZXJ5LWZhaWxlZC1pbWFnZS1jYXB0aW9uIHtcXG4gICAgICBkaXNwbGF5OiB0YWJsZS1jZWxsO1xcbiAgICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XFxuICAgICAgZm9udC1zaXplOiAxNnB4O1xcbiAgICAgIHdoaXRlLXNwYWNlOiBub3JtYWw7XFxuICAgICAgcGFkZGluZzogMTBweDsgfVxcbiAgLmZjLWdhbGxlcnkgdWwge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICBtYXJnaW46IDA7XFxuICAgIHBhZGRpbmc6IDA7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgwLjgpO1xcbiAgICAtbW96LXRyYW5zZm9ybTogc2NhbGUoMC44KTtcXG4gICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMC44KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjgpO1xcbiAgICAtd2Via2l0LXRyYW5zaXRpb246IG1hcmdpbi1sZWZ0IDAuMTVzIGxpbmVhcjtcXG4gICAgLW1vei10cmFuc2l0aW9uOiBtYXJnaW4tbGVmdCAwLjE1cyBsaW5lYXI7XFxuICAgIC1tcy10cmFuc2l0aW9uOiBtYXJnaW4tbGVmdCAwLjE1cyBsaW5lYXI7XFxuICAgIC1vLXRyYW5zaXRpb246IG1hcmdpbi1sZWZ0IDAuMTVzIGxpbmVhcjtcXG4gICAgdHJhbnNpdGlvbjogbWFyZ2luLWxlZnQgMC4xNXMgbGluZWFyOyB9XFxuICAgIC5mYy1nYWxsZXJ5IHVsIGxpIHtcXG4gICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgd2lkdGg6IDEwMCU7XFxuICAgICAgaGVpZ2h0OiAxMDAlO1xcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgfVxcbiAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpIGltZyxcXG4gICAgICAuZmMtZ2FsbGVyeSB1bCBsaSBpZnJhbWUsXFxuICAgICAgLmZjLWdhbGxlcnkgdWwgbGkgLmZjLWdhbGxlcnktZmFpbGVkLWltYWdlIHtcXG4gICAgICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XFxuICAgICAgICBvcGFjaXR5OiAwLjc7XFxuICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMC45KTtcXG4gICAgICAgIC1tb3otdHJhbnNmb3JtOiBzY2FsZSgwLjkpO1xcbiAgICAgICAgLW1zLXRyYW5zZm9ybTogc2NhbGUoMC45KTtcXG4gICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMC45KTtcXG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMTVzIGxpbmVhciwgb3BhY2l0eSAwLjE1cyBsaW5lYXI7XFxuICAgICAgICAtbW96LXRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjE1cyBsaW5lYXIsIG9wYWNpdHkgMC4xNXMgbGluZWFyO1xcbiAgICAgICAgLW1zLXRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjE1cyBsaW5lYXIsIG9wYWNpdHkgMC4xNXMgbGluZWFyO1xcbiAgICAgICAgLW8tdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMTVzIGxpbmVhciwgb3BhY2l0eSAwLjE1cyBsaW5lYXI7XFxuICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4xNXMgbGluZWFyLCBvcGFjaXR5IDAuMTVzIGxpbmVhcjsgfVxcbiAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpIGltZyB7XFxuICAgICAgICBtYXgtd2lkdGg6IDEwMCU7XFxuICAgICAgICBtYXgtaGVpZ2h0OiAxMDAlOyB9XFxuICAgICAgLmZjLWdhbGxlcnkgdWwgbGkuaG92ZXIgaW1nLFxcbiAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpLmhvdmVyIGlmcmFtZSxcXG4gICAgICAuZmMtZ2FsbGVyeSB1bCBsaS5ob3ZlciAuZmMtZ2FsbGVyeS1mYWlsZWQtaW1hZ2UsIC5mYy1nYWxsZXJ5IHVsIGxpOmhvdmVyIGltZyxcXG4gICAgICAuZmMtZ2FsbGVyeSB1bCBsaTpob3ZlciBpZnJhbWUsXFxuICAgICAgLmZjLWdhbGxlcnkgdWwgbGk6aG92ZXIgLmZjLWdhbGxlcnktZmFpbGVkLWltYWdlIHtcXG4gICAgICAgIG9wYWNpdHk6IDAuODU7XFxuICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMC45Mik7XFxuICAgICAgICAtbW96LXRyYW5zZm9ybTogc2NhbGUoMC45Mik7XFxuICAgICAgICAtbXMtdHJhbnNmb3JtOiBzY2FsZSgwLjkyKTtcXG4gICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMC45Mik7IH1cXG4gICAgICAuZmMtZ2FsbGVyeSB1bCBsaS5ob3ZlciAuZmMtZ2FsbGVyeS1mYWlsZWQtaW1hZ2UsIC5mYy1nYWxsZXJ5IHVsIGxpOmhvdmVyIC5mYy1nYWxsZXJ5LWZhaWxlZC1pbWFnZSB7XFxuICAgICAgICBvcGFjaXR5OiAwLjc7IH1cXG4gICAgICAuZmMtZ2FsbGVyeSB1bCBsaS5zZWxlY3RlZCB7XFxuICAgICAgICBjdXJzb3I6IGRlZmF1bHQ7IH1cXG4gICAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpLnNlbGVjdGVkIGltZyxcXG4gICAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpLnNlbGVjdGVkIGlmcmFtZSxcXG4gICAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpLnNlbGVjdGVkIC5mYy1nYWxsZXJ5LWZhaWxlZC1pbWFnZSB7XFxuICAgICAgICAgIG9wYWNpdHk6IDE7XFxuICAgICAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgICAgICAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICAgICAgICAtbXMtdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKTsgfVxcbiAgICAgIC5mYy1nYWxsZXJ5IHVsIGxpLnNlbGVjdGVkIC5mYy1nYWxsZXJ5LWZhaWxlZC1pbWFnZSB7XFxuICAgICAgICBvcGFjaXR5OiAwLjc7IH1cXG4gIC5mYy1nYWxsZXJ5LmV4cGFuZGVkIHVsIGxpIGltZyxcXG4gIC5mYy1nYWxsZXJ5LmV4cGFuZGVkIHVsIGxpIGlmcmFtZSB7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgxLjI1KTtcXG4gICAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDEuMjUpO1xcbiAgICAtbXMtdHJhbnNmb3JtOiBzY2FsZSgxLjI1KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1KTsgfVxcbiAgLmZjLWdhbGxlcnktY2FwdGlvbiB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgYm90dG9tOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIHBhZGRpbmc6IDVweDtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gICAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgICAtbW96LXRyYW5zaXRpb246IG9wYWNpdHkgMC4xcyBsaW5lYXI7XFxuICAgIC1tcy10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgICAtby10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyO1xcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMXMgbGluZWFyOyB9XFxuICAgIC5mYy1nYWxsZXJ5LWNhcHRpb24udmlzaWJsZSB7XFxuICAgICAgZGlzcGxheTogYmxvY2s7IH1cXG4gICAgLmZjLWdhbGxlcnktY2FwdGlvbi1iYWNrZ3JvdW5kIHtcXG4gICAgICB3aWR0aDogMTAwJTtcXG4gICAgICBoZWlnaHQ6IDEwMCU7XFxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgIHRvcDogMDtcXG4gICAgICBsZWZ0OiAwO1xcbiAgICAgIGJhY2tncm91bmQ6ICNmZmY7XFxuICAgICAgb3BhY2l0eTogMC40OyB9XFxuICAgIC5mYy1nYWxsZXJ5LWNhcHRpb24tdGV4dCB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgIGhlaWdodDogMTAwJTtcXG4gICAgICB3aWR0aDogMTAwJTsgfVxcbiAgLmZjLWdhbGxlcnktY29udHJvbHMge1xcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICB3aWR0aDogNDBweDtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIHotaW5kZXg6IDE7XFxuICAgIG9wYWNpdHk6IDAuNTtcXG4gICAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMTVzIGxpbmVhcjtcXG4gICAgLW1vei10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMTVzIGxpbmVhcjtcXG4gICAgLW1zLXRyYW5zaXRpb246IG9wYWNpdHkgMC4xNXMgbGluZWFyO1xcbiAgICAtby10cmFuc2l0aW9uOiBvcGFjaXR5IDAuMTVzIGxpbmVhcjtcXG4gICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjE1cyBsaW5lYXI7IH1cXG4gICAgLmZjLWdhbGxlcnktY29udHJvbHMudHJhbnNwYXJlbnQge1xcbiAgICAgIG9wYWNpdHk6IDA7IH1cXG4gICAgLmZjLWdhbGxlcnktY29udHJvbHMgYSB7XFxuICAgICAgZGlzcGxheTogYmxvY2s7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIHdpZHRoOiAxMDAlO1xcbiAgICAgIGhlaWdodDogMTAwJTtcXG4gICAgICBjb2xvcjogIzMzMzsgfVxcbiAgICAgIC5mYy1nYWxsZXJ5LWNvbnRyb2xzIGE6aG92ZXIsIC5mYy1nYWxsZXJ5LWNvbnRyb2xzIGE6YWN0aXZlLCAuZmMtZ2FsbGVyeS1jb250cm9scyBhOmZvY3VzIHtcXG4gICAgICAgIGNvbG9yOiBibGFjazsgfVxcbiAgICAgIC5mYy1nYWxsZXJ5LWNvbnRyb2xzIGEgaSB7XFxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgICB0b3A6IDUwJTtcXG4gICAgICAgIGxlZnQ6IDVweDtcXG4gICAgICAgIG1hcmdpbi10b3A6IC0zNXB4O1xcbiAgICAgICAgZm9udC1zaXplOiA3MHB4OyB9XFxuICAuZmMtZ2FsbGVyeS1wcmV2IHtcXG4gICAgbGVmdDogMDsgfVxcbiAgLmZjLWdhbGxlcnktbmV4dCB7XFxuICAgIHJpZ2h0OiAwOyB9XFxuICAuZmMtZ2FsbGVyeS1jbG9zZSB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxuICAgIHRvcDogMDtcXG4gICAgcmlnaHQ6IDA7IH1cXG4gICAgLmZjLWdhbGxlcnktY2xvc2UudmlzaWJsZSB7XFxuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuXFxuLmZjLWltYWdlIC5mYy1jb2RlLW9mLWV0aGljcyB7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjMzZiY2VhO1xcbiAgYmFja2dyb3VuZDogI2ZmZjtcXG4gIHBhZGRpbmc6IDVweCAxMHB4OyB9XFxuICAuZmMtaW1hZ2UgLmZjLWNvZGUtb2YtZXRoaWNzLnZpc2libGUge1xcbiAgICBkaXNwbGF5OiBibG9jazsgfVxcbiAgLmZjLWltYWdlIC5mYy1jb2RlLW9mLWV0aGljcy1zaG93IHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggZGFzaGVkO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIC13ZWJraXQtdHJhbnNpdGlvbjogY29sb3IgMC4xcyBsaW5lYXI7XFxuICAgIC1tb3otdHJhbnNpdGlvbjogY29sb3IgMC4xcyBsaW5lYXI7XFxuICAgIC1tcy10cmFuc2l0aW9uOiBjb2xvciAwLjFzIGxpbmVhcjtcXG4gICAgLW8tdHJhbnNpdGlvbjogY29sb3IgMC4xcyBsaW5lYXI7XFxuICAgIHRyYW5zaXRpb246IGNvbG9yIDAuMXMgbGluZWFyOyB9XFxuICAgIC5mYy1pbWFnZSAuZmMtY29kZS1vZi1ldGhpY3Mtc2hvdy5mYy1pbWFnZS1hIHtcXG4gICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7IH1cXG5cXG4vKiMgc291cmNlTWFwcGluZ1VSTD1tYWluLnNjc3MubWFwICovXCI7Il19
