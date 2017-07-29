/**
 * Created by Tim Osadchiy on 27/08/2016.
 */

'use strict';

module.exports = function (fileName, targetDocument) {
    var script = targetDocument.createElement('script');
    script.src = fileName;
    targetDocument.body.appendChild(script)
};
