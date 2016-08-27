/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (dom) {
    var style,
        returns = {};
    if (window.getComputedStyle) {
        var camelize = function (a, b) {
            return b.toUpperCase();
        };
        style = window.getComputedStyle(dom, null);
        for (var i = 0, l = style.length; i < l; i++) {
            var prop = style[i],
                camel = prop.replace(/\-([a-z])/g, camelize),
                val = style.getPropertyValue(prop);
            returns[camel] = val;
        }
        return returns;
    }
    if (style = dom.currentStyle) {
        for (var prop in style) {
            returns[prop] = style[prop];
        }
        return returns;
    }
};