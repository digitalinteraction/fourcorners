/**
 * Created by Tim Osadchiy on 01/09/2016.
 */

'use strict';

module.exports = function (str, len) {
    if (str.length < len) {
        return str;
    } else {
        return str.substr(0, len).replace(/\s+$/, '') + '...';
    }
};