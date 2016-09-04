/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

// ToDo: YouTube links often cause a delay when hover on any of corners before opening it

'use strict';

(require('./cross-module-format')('fourcorners', function () {

    var getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
        baseAttr = process.env.dataAttributeBase,
        imgs = getAllElementsWithAttribute(baseAttr),
        setMainController = require('./set-main-controller'),
        wrapImage = require('./wrap-image'),
        imageModelFactory = require('./image-model'),
        getImageData = require('./get-image-data');

    window.onload = init;

    function init() {
        require('./polyfills')();
        require('./helpers/add-swipe-events')();
        require('./insert-fontawesome')();
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

}));