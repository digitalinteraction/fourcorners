/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

// ToDo: YouTube links often cause a delay when hover on any of corners before opening it

'use strict';

require('./polyfills')();

var getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    baseAttr = process.env.dataAttributeBase,
    imgs = getAllElementsWithAttribute(baseAttr),
    setMainController = require('./set-main-controller'),
    wrapImage = require('./wrap-image'),
    imageModelFactory = require('./image-model'),
    getImageData = require('./get-image-data');

window.onload = init;

function init() {
    require('./helpers/add-swipe-events')();
    insertFontawesome();
    if (process.env.insertCssWithJs) {
        require('../temp/style.min.css');
    }
    imgs.forEach(function (el) {
        if (el.complete) {
            build(el);
        } else {
            el.onload = function () {
                build(el);
            }
        }
    });
}

function build(imgDom) {
    getImageData.call(imgDom, function (imageData) {
        var domContainer = wrapImage.call(imgDom, imageData),
            model = imageModelFactory(domContainer);
        setMainController(domContainer, model);
    });
}

function insertFontawesome() {
    // ToDo: fontawesome should not be loaded from external CDN.
    if (!fontawesomeIsLoaded()) {
        require('./helpers/insert-script')(process.env.fontAwesomeCdnUrl);
    }
}

function fontawesomeIsLoaded() {
    var span = document.createElement('span'),
        loaded = false;
    span.className = 'fa';
    span.style.display = 'none';
    document.body.insertBefore(span, document.body.firstChild);

    function css(element, property) {
        return window.getComputedStyle(element, null).getPropertyValue(property);
    }

    if (css(span, 'font-family') === 'FontAwesome') {
        loaded = true;
    }
    return loaded;
}