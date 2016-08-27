/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var hasClass = require('./has-class');

module.exports = function (el, className) {
    return getChildNodesByClass(el, className);
};

function getChildNodesByClass(el, className) {
    var result = [];
    for (var i = 0; i < el.childNodes.length; i++) {
        var child = el.childNodes[i];
        if (hasClass(child, className)) {
            result.push(child);
        }
        var childResults = getChildNodesByClass(child, className);
        for (var j = 0; j < childResults.length; j++) {
            result.push(childResults[j]);
        }
    }
    return result;
}
