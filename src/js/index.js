/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

// ToDo: YouTube links often cause a delay when hover on any of corners before opening it

'use strict';

var getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    baseAttr = process.env.dataAttributeBase,
    setMainController = require('./set-main-controller'),
    wrapImage = require('./wrap-image'),
    imageModelFactory = require('./image-model'),
    dataIsValid = require('./image-data-is-valid'),
    getImageData = require('./get-image-data'),
    amendImageData = require('./amend-image-data'),
    imgs;

window.addEventListener("load", function load(event) {
    // Fixme: addEventListener must be initiated only in auto build mode
    window.removeEventListener("load", load, false);
    init();
}, false);

function init() {
    imgs = getAllElementsWithAttribute(baseAttr);
    require('./polyfills')();
    require('./helpers/add-swipe-events')();
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

    return {
        topLeft: new FcCornerInterface(model.topLeftCorner, controller),
        topRight: new FcCornerInterface(model.topRightCorner, controller),
        bottomLeft: new FcCornerInterface(model.bottomLeftCorner, controller),
        bottomRight: new CodeOfEthicsCornerInterface(model.bottomRightCorner, controller)
    };

}

function FcCornerInterface(cornerModel, controller) {

    var controller = controller,
        cornerModel = cornerModel;

    this.pin = function (pinned) {
        cornerModel.pin(pinned);
        controller.executeWatchers();
    };

}

function CodeOfEthicsCornerInterface(cornerModel, controller) {
    var controller = controller,
        cornerModel = cornerModel;

    this.pin = function (pinned) {
        cornerModel.pin(pinned);
        controller.executeWatchers();
    };

}

exports.buildFromJson = buildFromJson;
exports.autoBuild = autoBuild;