/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var template = require("./template.jade"),
    failedImageTemplate = require("./failed-image.jade"),
    copyStyle = require('./helpers/copy-style'),
    baseAttr = process.env.dataAttributeBase,
    getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    shortenText = require('./helpers/shorten-text');

module.exports = function (imageData) {
    var touchScreen = 'ontouchstart' in window || navigator.maxTouchPoints,
        div = document.createElement("div"),
        parentNode = this.parentNode;

    imageData.src = this.src;
    if (touchScreen) {
        div.classList.add('touch-screen');
    }
    div.innerHTML = template(imageData);
    div.classList.add('fc-image');
    copyStyle(this, div);
    if (div.style.getPropertyValue('display') == 'inline') {
        div.style.display = 'inline-block';
    }
    parentNode.replaceChild(div, this);
    treatFaultyImages(div);
    return div;
};

function treatFaultyImages(div) {
    var galleryDom = getAllElementsWithAttribute(baseAttr + '-gallery-list', div)[0],
        galleryItemDoms = getAllElementsWithAttribute(baseAttr + '-gallery-item', galleryDom);
    galleryItemDoms.forEach(function (el) {
        var img = el.getElementsByTagName('img')[0];
        if (img) {
            img.onerror = function (e) {
                var html = failedImageTemplate({
                    shortSrc: shortenText(e.srcElement.currentSrc, 30, true),
                    fullSrc: e.srcElement.currentSrc
                });
                el.innerHTML = html;
            }
        }
    });
}