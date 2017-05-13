/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

// ToDo: YouTube links often cause a delay when hover on any of corners before opening it

'use strict';

var getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    baseAttr = process.env.dataAttributeBase,
    imgs = getAllElementsWithAttribute(baseAttr),
    setMainController = require('./set-main-controller'),
    wrapImage = require('./wrap-image'),
    imageModelFactory = require('./image-model'),
    dataIsValid = require('./image-data-is-valid'),
    getImageData = require('./get-image-data'),
    amendImageData = require('./amend-image-data');

window.addEventListener("load", function load(event) {
    window.removeEventListener("load", load, false);
    init();
}, false);

function init() {
    require('./polyfills')();
    require('./helpers/add-swipe-events')();
    require('./insert-fontawesome')();
    if (process.env.insertCssWithJs) {
        require('../temp/style.min.css');
    }
    imgs.forEach(function (el) {
        if (el.complete) {
            autoBuild(el);
        } else {
            el.onload = function () {
                autoBuild(el);
            }
        }
    });
}

function buildFromJson(imgDom, json, filePath) {
    if (!dataIsValid(filePath || 'Four Corners - JSON', json)) {
        return;
    }
    amendImageData(json);

    var domContainer = wrapImage.call(imgDom, json),
        model = imageModelFactory(domContainer),
        controller = setMainController(domContainer, model);

    return FcInterfaceFactory(model, controller);
}

function autoBuild(imgDom) {
    getImageData.call(imgDom, function (imageData, filePath) {
        buildFromJson(imgDom, imageData, filePath);
    });
}

function FcInterfaceFactory(model, controller) {
    var controller = controller,
        model = model;

    function FcInterface() {

    }

    FcInterface.prototype.pinTopLeft = function () {
        model.topLeftCorner.pin();
        controller.executeWatchers()
    };

    FcInterface.prototype.pinTopRight = function () {
        model.topRightCorner.pin();
        controller.executeWatchers()
    };

    FcInterface.prototype.pinBottomLeft = function () {
        model.bottomLeftCorner.pin();
        controller.executeWatchers()
    };

    FcInterface.prototype.pinBottomRight = function () {
        model.bottomRightCorner.pin();
        controller.executeWatchers()
    };

    return new FcInterface();

}

exports.buildFromJson = buildFromJson;
exports.autoBuild = autoBuild;