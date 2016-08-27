/**
 * Created by Tim Osadchiy on 27/08/2016.
 */

'use strict';

module.exports = function (fileName) {
    var script = document.createElement('script');
    script.src = fileName;
    document.body.appendChild(script)
};
