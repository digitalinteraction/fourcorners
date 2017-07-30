/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var baseAttr = process.env.dataAttributeBase,
    getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    addClass = require('./helpers/add-class'),
    getIsTouch = require("./helpers/is-touch-screen"),
    removeClass = require('./helpers/remove-class');

module.exports = function (dom) {

    return new ImageModel(dom);

};

function ImageModel(dom) {
    this.topLeftCorner = GalleryCornerModelFactory(dom);
    this.topRightCorner = new CornerModel();
    this.bottomLeftCorner = new CornerModel();
    this.bottomRightCorner = new CreativeCommonsCorner();
}

ImageModel.prototype.toolsHidden = function () {
    return this.topLeftCorner.visible ||
        this.topRightCorner.visible ||
        this.bottomLeftCorner.visible ||
        this.bottomRightCorner.visible;
};

ImageModel.prototype.getIsTouch = function () {
    return getIsTouch();
};

function CornerModel() {
    this.visible = false;
    this.pinned = false;
}

CornerModel.prototype.show = function () {
    this.visible = true;
};
CornerModel.prototype.hide = function () {
    if (this.pinned) {
        return;
    }
    this.visible = false;
};
CornerModel.prototype.forceHide = function () {
    this.pin(false);
};
CornerModel.prototype.pin = function (pinned) {
    if (pinned != null) {
        this.pinned = pinned;
    } else {
        this.pinned = !this.pinned;
    }
    if (this.pinned) {
        this.show();
    } else {
        this.hide();
    }
};

function GalleryCornerModelFactory(dom) {
    var galleryDom = getAllElementsWithAttribute(baseAttr + '-gallery-list', dom)[0],
        galleryItemDoms = getAllElementsWithAttribute(baseAttr + '-gallery-item', galleryDom),
        youTubeIframes = getAllElementsWithAttribute(baseAttr + '-gallery-yt', galleryDom),
        captionDoms = getAllElementsWithAttribute(baseAttr + '-gallery-caption', dom);

    function GalleryCornerModel() {
        CornerModel.call(this);
        this.selectedIndex = 0;
        this.preselectedItem = undefined;

        gotToIndex.call(this);
    }

    GalleryCornerModel.prototype = Object.create(CornerModel.prototype);

    GalleryCornerModel.prototype.hide = function () {
        CornerModel.prototype.hide.call(this);
        youTubeIframes.forEach(pauseYouTubeVideo);
    };
    GalleryCornerModel.prototype.selectItem = function (event, el) {
        this.selectedIndex = galleryItemDoms.indexOf(el);
        gotToIndex.call(this);
    };
    GalleryCornerModel.prototype.selectNext = function () {
        if (this.selectedIndex < galleryItemDoms.length - 1) {
            this.selectedIndex++;
            gotToIndex.call(this);
        }
    };
    GalleryCornerModel.prototype.selectPrevious = function () {
        if (this.selectedIndex == 0) {
            return;
        }
        this.selectedIndex--;
        gotToIndex.call(this);
    };
    GalleryCornerModel.prototype.preselectPrevious = function () {
        this.preselectedItem = galleryItemDoms[this.selectedIndex - 1];
    };
    GalleryCornerModel.prototype.preselectNext = function () {
        this.preselectedItem = galleryItemDoms[this.selectedIndex + 1];
    };
    GalleryCornerModel.prototype.clearPreselect = function () {
        this.preselectedItem = undefined;
    };
    GalleryCornerModel.prototype.getPrevControllerHidden = function () {
        return this.selectedIndex <= 0;
    };
    GalleryCornerModel.prototype.getNextControllerHidden = function () {
        return this.selectedIndex >= galleryItemDoms.length - 1;
    };
    GalleryCornerModel.prototype.getItemIsPreselected = function (domElement) {
        return domElement == this.preselectedItem;
    };
    GalleryCornerModel.prototype.getCaptionVisible = function (domElement) {
        return domElement == captionDoms[this.selectedIndex];
    };

    function getImageOffsets(elements) {
        var offsets = [];
        elements.forEach(function (el) {
            offsets.push(el.offsetLeft);
        });
        return offsets;
    }

    function gotToIndex() {
        if (!galleryDom) {
            return;
        }
        var index = this.selectedIndex,
            scaleConstant = 0.8,
            imageOffsets = getImageOffsets(galleryItemDoms);
        galleryItemDoms.forEach(function (dom, i) {
            if (i == index) {
                addClass(dom, 'selected');
            } else {
                removeClass(dom, 'selected');
            }
        });
        galleryDom.style.marginLeft = -imageOffsets[index] * scaleConstant + 'px';
    }

    return new GalleryCornerModel();
}

function CreativeCommonsCorner() {
    CornerModel.call(this);
}

CreativeCommonsCorner.prototype = Object.create(CornerModel.prototype);

function pauseYouTubeVideo(iframe) {
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
}