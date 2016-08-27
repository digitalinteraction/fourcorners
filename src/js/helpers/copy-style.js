/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var getElementStyles = require('./get-element-style');

module.exports = function (fromDom, toDom) {
    //Fixme: Margins are transformed by the getComputedStyle.
    // In Chrome instead of 'auto' a static value is returned, in Firefox - 0.
    // Potential solution get all css from stylesheets (In Chrome instead of 'auto' a static value is returned, in Firefox - 0.)
    // and from style attribute and apply those to toDom.

    var styles = getElementStyles(fromDom);
    for (var i in styles) {
        if (styles.hasOwnProperty(i)) {
            toDom.style[i] = styles[i];
        }
    }
};