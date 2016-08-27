/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

// ToDo: Error in console if yaml was not found
// ToDo: Error in console if yaml has got a wrong structure
// ToDo: Warning in console if some of the corners were not found in yaml

'use strict';

var yaml = require('js-yaml'),
    baseAttr = process.env.dataAttributeBase;

module.exports = function (onSuccess, onFailure) {
    var yamlPath = this.getAttribute(baseAttr) || this.src.substr(0, this.src.lastIndexOf(".")) + ".yaml";
    loadYaml(yamlPath, onSuccess, onFailure);
};

function loadYaml(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(yaml.safeLoad(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}