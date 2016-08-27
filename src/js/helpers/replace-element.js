/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (targetEl, withEl) {
    if (targetEl.outerHTML) { //if outerHTML is supported
        targetEl.outerHTML = withEl.outerHTML; ///it's simple replacement of whole element with contents of str var
    }
    else { //if outerHTML is not supported, there is a weird but crossbrowsered trick
        var div = document.createElement("div");
        div.appendChild(withEl);
        var strWithEl = div.innerHTML;
        var tmpObj = document.createElement("div");
        var parentNode = targetEl.parentNode; //Okey, element should be parented
        tmpObj.innerHTML = '<!--THIS DATA SHOULD BE REPLACED-->';
        parentNode.replaceChild(tmpObj, targetEl); //here we placing our temporary data instead of our target, so we can find it then and replace it into whatever we want to replace to
        parentNode.innerHTML = parentNode.innerHTML.replace('<div><!--THIS DATA SHOULD BE REPLACED--></div>', strWithEl);
    }
};