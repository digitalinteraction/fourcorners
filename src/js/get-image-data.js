/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var yaml = require('js-yaml'),
    getAllElementsWithAttribute = require("./helpers/get-all-elements-with-attribute"),
    xmlToJson = require("./helpers/xml-to-json"),
    baseAttr = process.env.dataAttributeBase;

var META_TAG = baseAttr + "-meta";

module.exports = function (onSuccess, onFailure) {
    tryGetMeta(this, onSuccess, onFailure);
};

function tryGetMeta(img, onSuccess, onFailure) {
    var q = [tryGetFromScript, tryLoadFileByAttribute, tryLoadYamlBySrc, tryLoadXmlBySrc],
        exec = function () {
            var fn = q.shift();
            if (!fn) {
                onFailure();
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
            if (el[i].getAttribute(META_TAG) == path) {
                var data = parseMeta(el[i].innerHTML, el[i].type.replace("text/", ""));
                onFinish(data);
                return;
            }
        }
    }
}

function tryLoadFileByAttribute(img, onFinish) {
    var path = img.getAttribute(baseAttr),
        extL = path.match(/\.(yaml|xml)$/),
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
    tryToLoadBySrc(path, ext, onFinish);
}

function tryLoadXmlBySrc(img, onFinish) {
    var ext = "xml",
        path = img.src.substr(0, img.src.lastIndexOf(".")) + "." + ext;
    tryToLoadBySrc(path, ext, onFinish);
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
    if (format == "xml") {
        return JSON.parse(xmlToJson(rawText));
    } else if (scriptDom.type == "yaml") {
        return yaml.safeLoad(rawText);
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