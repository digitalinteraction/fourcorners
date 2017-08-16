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
    addEventListener = require("./helpers/add-event-listener"),
    removeEventListener = require("./helpers/remove-event-listener"),
    css = require('../scss/main.scss');

module.exports = function (imageData) {
    var wrapperDiv = document.createElement("div"),
        iframe = document.createElement("iframe"),
        parentNode = this.parentNode,
        imgDom = this;

    copyStyle(imgDom, wrapperDiv);
    styleWrapperDiv(wrapperDiv);
    styleIframe(iframe);
    wrapperDiv.appendChild(iframe);
    if (wrapperDiv.style.getPropertyValue("display") === "inline") {
        wrapperDiv.style.display = "inline-block";
    }
    parentNode.replaceChild(wrapperDiv, imgDom);

    var iframeDocument = iframe.contentWindow.document;

    iframeDocument.open();
    // Set image src in data to render it in template
    imageData.src = this.src;
    iframeDocument.write(template(imageData));
    iframeDocument.head.appendChild(makeStyle());
    insertScript(process.env.fontAwesomeCdnUrl, iframeDocument);
    iframeDocument.close();

    treatFaultyImages(iframeDocument.body);
    adjustIframeHeightToFooter(iframe, wrapperDiv);
    var destroyListeners = listenToResize(imgDom, wrapperDiv, iframe);
    return {
        element: iframeDocument.body,
        destroy: function () {
            destroyListeners();
            if (wrapperDiv.parentNode == parentNode) {
                parentNode.replaceChild(imgDom, wrapperDiv);
            }
        }
    };
};

function listenToResize(imgDom, wrapperDiv, iframe) {
    var parentNode = wrapperDiv.parentNode, timeout;
    var resizeListener = function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            parentNode.appendChild(imgDom);
            copyStyle(imgDom, wrapperDiv);
            parentNode.removeChild(imgDom);
            adjustIframeHeightToFooter(iframe, wrapperDiv);
        }, 500);
    };
    addEventListener(window, "resize", resizeListener);
    /**
     * Return destroy event listener function
     */
    return function () {
        removeEventListener(window, "resize", resizeListener);
    };
}

function makeStyle() {
    var style = document.createElement("style");
    style.type = 'text/css';
    style.innerHTML = css;
    return style;
}

function adjustIframeHeightToFooter(iframe, wrapperDiv) {
    var footer = getAllElementsWithAttribute(baseAttr + "-footer", iframe.contentWindow.document)[0];
    wrapperDiv.style.height = wrapperDiv.offsetHeight + footer.offsetHeight + "px";
}

function styleIframe(iframe) {
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
}

function styleWrapperDiv(div) {
    // To support image border-radius
    div.style.overflow = "hidden";
    div.style.border = "1px solid #ddd";
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