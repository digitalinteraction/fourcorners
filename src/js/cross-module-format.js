/**
 * Created by Tim Osadchiy on 04/09/2016.
 */

'use strict';

module.exports = function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition();
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition);
    else this[name] = definition();
};
