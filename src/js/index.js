/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

"use strict";

var init = require("./wrap-all-img-elements-on-page");

window.FourCorners = require("./index-npm");

window.addEventListener("load", function load(event) {
    window.removeEventListener("load", load, false);
    init();
}, false);