/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var baseAttr = process.env.dataAttributeBase,
    getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    addClass = require('./helpers/add-class'),
    removeClass = require('./helpers/remove-class');

module.exports = function (dom) {

    function ImageModel() {
        this.topLeftCorner = new GalleryCornerModel();
        this.topRightCorner = new CornerModel();
        this.bottomLeftCorner = new CornerModel();
        this.bottomRightCorner = new CreativeCommonsCorner();
        this.toolsHidden = function () {
            return this.topLeftCorner.visible ||
                this.topRightCorner.visible ||
                this.bottomLeftCorner.visible ||
                this.bottomRightCorner.visible;
        };
    }

    function CornerModel() {
        this.visible = false;
        this.pinned = false;

        this.show = function () {
            this.visible = true;
        };
        this.hide = function () {
            if (this.pinned) {
                return;
            }
            this.visible = false;
        };
        this.pin = function () {
            this.pinned = !this.pinned;
            if (this.pinned) {
                this.show();
            } else {
                this.hide();
            }
        };
        return this;
    }

    function GalleryCornerModel() {
        var galleryDom = getAllElementsWithAttribute(baseAttr + '-gallery-list', dom)[0],
            galleryItemDoms = getAllElementsWithAttribute(baseAttr + '-gallery-item', galleryDom),
            captionDoms = getAllElementsWithAttribute(baseAttr + '-gallery-caption', dom);
        CornerModel.call(this);
        this.selectedIndex = 0;
        this.preselectedItem = undefined;
        this.selectItem = function (event, el) {
            this.selectedIndex = galleryItemDoms.indexOf(el);
        };
        this.selectNext = function () {
            if (this.selectedIndex < galleryItemDoms.length - 1) {
                this.selectedIndex++;
                gotToIndex.call(this);
            }
        };
        this.selectPrevious = function () {
            if (this.selectedIndex == 0) {
                return;
            }
            this.selectedIndex--;
            gotToIndex.call(this);
        };
        this.preselectPrevious = function () {
            this.preselectedItem = galleryItemDoms[this.selectedIndex - 1];
        };
        this.preselectNext = function () {
            this.preselectedItem = galleryItemDoms[this.selectedIndex + 1];
        };
        this.clearPreselect = function () {
            this.preselectedItem = undefined;
        };
        this.getPrevControllerHidden = function () {
            return this.selectedIndex <= 0;
        };
        this.getNextControllerHidden = function () {
            return this.selectedIndex >= galleryItemDoms.length - 1;
        };
        this.getItemIsPreselected = function (domElement) {
            return domElement == this.preselectedItem;
        };
        this.getCaptionVisible = function(domElement) {
            return domElement == captionDoms[this.selectedIndex];
        };
        function getImageOffsets(elements) {
            var offsets = [];
            for (var i = 0; i < elements.length; i++) {
                offsets.push(elements[i].offsetLeft);
            }
            return offsets;
        }

        function gotToIndex() {
            var index = this.selectedIndex,
                scaleConstant = 0.8,
                imageOffsets = getImageOffsets(galleryItemDoms);
            for (var i = 0; i < galleryItemDoms.length; i++) {
                if (i == index) {
                    addClass(galleryItemDoms[i], 'selected');
                } else {
                    removeClass(galleryItemDoms[i], 'selected');
                }
            }
            galleryDom.style.marginLeft = -imageOffsets[index] * scaleConstant + 'px';
        }

        gotToIndex.call(this);

        return this;
    }

    function CreativeCommonsCorner() {
        CornerModel.call(this);
        this.codeOfEthicsVisible = false;
        this.toggleCodeOfEthics = function () {
            this.codeOfEthicsVisible = !this.codeOfEthicsVisible;
        };
        return this;
    }

    return new ImageModel();

};