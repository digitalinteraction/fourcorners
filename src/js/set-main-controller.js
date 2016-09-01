/**
 * Created by Tim Osadchiy on 15/08/2016.
 */


'use strict';

var baseAttr = process.env.dataAttributeBase,
    getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    addClass = require('./helpers/add-class'),
    removeClass = require('./helpers/remove-class'),
    addEventListener = require('./helpers/add-event-listener');

module.exports = function (domContainer, model) {
    var watchers = [];

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
        for (var i = 0; i < doms.length; i++) {
            setEventListenersFromExpression(doms[i], doms[i].getAttribute(attr));
        }
    }

    function setEventListenersFromExpression(el, expression) {
        var eventMap = parseAttribute(expression);
        for (var eventName in eventMap) {
            addEventListener(el, eventName, getEventListener(el, model, eventMap[eventName]));
        }
    }

    function setClassWatchers() {
        var attr = baseAttr + '-class',
            doms = getAllElementsWithAttribute(attr, domContainer);
        for (var i = 0; i < doms.length; i++) {
            var classWatchers = getClassWatchersForElement(doms[i], doms[i].getAttribute(attr));
            watchers.push.apply(watchers, classWatchers);
        }
    }

    function setTextWatchers() {
        var attr = baseAttr + '-text',
            doms = getAllElementsWithAttribute(attr, domContainer);
        for (var i = 0; i < doms.length; i++) {
            var textWatcher = getTextWatcherForElement(doms[i], doms[i].getAttribute(attr));
            watchers.push(textWatcher);
        }
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
        for (var i = 0; i < keyValStrs.length; i++) {
            var kv = keyValStrs[i].split(/:\s*/);
            keyVal[kv[0]] = kv[1];
        }
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
            setTimeout(function() {
                subModel[funName].call(subModel, event, el);
                executeWatchers();
            }, 10);
        }
    }

    function executeWatchers() {
        for (var i = 0; i < watchers.length; i++) {
            watchers[i]();
        }
    }
};