/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

"use strict";

var template = require("./template.pug"),
    failedImageTemplate = require("./failed-image.pug"),
    copyStyle = require("./helpers/copy-style"),
    baseAttr = process.env.dataAttributeBase,
    getAllElementsWithAttribute = require("./helpers/get-all-elements-with-attribute"),
    shortenText = require("./helpers/shorten-text"),
    insertScript = require('./helpers/insert-script'),
    css = require('../temp/style.min.css');

module.exports = function (imageData) {
    var iframe = document.createElement("iframe"),
        parentNode = this.parentNode;

    copyStyle(this, iframe);
    if (iframe.style.getPropertyValue("display") === "inline") {
        iframe.style.display = "inline-block";
    }
    parentNode.replaceChild(iframe, this);

    var iframeDocument = iframe.contentWindow.document;

    iframeDocument.open();
    // Set image src in data to render it in template
    imageData.src = this.src;
    iframeDocument.write(template(imageData));
    iframeDocument.head.appendChild(makeStyle());
    insertScript(process.env.fontAwesomeCdnUrl, iframeDocument);
    iframeDocument.close();

    var newDiv = iframeDocument.getElementsByTagName("div")[0];

    treatFaultyImages(newDiv);
    return newDiv;
};

function makeStyle() {
    var style = document.createElement("style");
    style.type = 'text/css';
    style.innerHTML = css;
    return style;
}

function treatFaultyImages(div) {
    var galleryDom = getAllElementsWithAttribute(baseAttr + "-gallery-list", div)[0],
        galleryItemDoms = getAllElementsWithAttribute(baseAttr + "-gallery-item", galleryDom);
    galleryItemDoms.forEach(function (el) {
        var img = el.getElementsByTagName("img")[0];
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