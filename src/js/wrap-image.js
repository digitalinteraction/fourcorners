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
    getIsTouch = require("./helpers/is-touch-screen"),
    insertScript = require('./helpers/insert-script'),
    css = require('../temp/style.min.css');

module.exports = function (imageData) {
    var iframe = document.createElement("iframe"),
        div = makeContentDiv.call(this, imageData),
        dummyDiv = document.createElement("div"),
        parentNode = this.parentNode;

    copyStyle(this, iframe);
    if (iframe.style.getPropertyValue("display") === "inline") {
        iframe.style.display = "inline-block";
    }
    dummyDiv.appendChild(div);
    parentNode.replaceChild(iframe, this);

    var iframeDocument = iframe.contentWindow.document;

    iframeDocument.open();
    iframeDocument.write(dummyDiv.innerHTML);
    iframeDocument.head.appendChild(makeStyle());
    insertScript(process.env.fontAwesomeCdnUrl, iframeDocument);
    iframeDocument.close();

    var newDiv = iframeDocument.getElementsByTagName("div")[0];

    treatFaultyImages(newDiv);
    return newDiv;
};

function makeContentDiv(imageData) {
    var touchScreen = getIsTouch(),
        div = document.createElement("div");

    imageData.src = this.src;
    div.innerHTML = template(imageData);
    div.className = "fc-image" + (touchScreen ? " touch-screen" : "");

    return div;
}

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