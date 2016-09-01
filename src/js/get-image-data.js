/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var yaml = require('js-yaml'),
    shortenText = require('./helpers/shorten-text'),
    baseAttr = process.env.dataAttributeBase,
    MAX_CONTEXT_CREDIT_LENGTH = 50,
    MAX_LINKS_TITLE_LENGTH = 50,
    MAX_BACKSTORY_AUTHOR_LENGTH = 50,
    MAX_BACKSTORY_MAGAZINE_LENGTH = 50;

module.exports = function (onSuccess, onFailure) {
    var yamlPath = this.getAttribute(baseAttr) || this.src.substr(0, this.src.lastIndexOf(".")) + ".yaml";
    loadYaml(yamlPath, onSuccess, onFailure);
};

function loadYaml(path, success, error) {
    error = error || function () {
        };
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var data = yaml.safeLoad(xhr.responseText);
                if (!dataIsValid(path, data)) {
                    error();
                } else {
                    addLinkTypes(data.links);
                    shortenDataText(data);
                    success(data);
                }
            } else {
                error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function dataIsValid(path, data) {
    return contextIsValid(path, data) &&
        linksAreValid(path, data) &&
        backStoryIsValid(path, data) &&
        creativeCommonsAreValid(path, data);
}

function contextIsValid(path, data) {
    if (!data.context) {
        console.warn(path, ': \'context\' is not defined');
    }
    if (data.context && Object.prototype.toString.call(data.context) != '[object Array]') {
        throw path + ': \'context\' must be a list';
    } else if (data.context) {
        var toDelete = [];
        for (var i = 0, l = data.context.length; i < l; i++) {
            var el = data.context[i];
            if (!el.src && !el.youtube_id) {
                console.warn(path, ': \'context\', element number', String(i + 1),
                    ' - \'src\' and \'youtube_id\' are not defined');
                toDelete.push(el);
            }
        }
        for (var i = 0, l = toDelete.length; i < l; i++) {
            var j = data.context.indexOf(toDelete[i]);
            data.context.splice(j, 1);
        }
    }
    return true;
}

function linksAreValid(path, data) {
    if (!data.links) {
        console.warn(path, ': \'links\' are not defined');
    }
    if (data.links && Object.prototype.toString.call(data.links) != '[object Array]') {
        throw path + ': \'links\' must be a list';
    } else if (data.links) {
        var toDelete = [];
        for (var i = 0, l = data.links.length; i < l; i++) {
            var el = data.links[i];
            if (!el.url) {
                console.warn(path, ': \'links\', element number', String(i + 1),
                    ' - \'url\' is not defined');
                toDelete.push(el);
            }
        }
        for (var i = 0, l = toDelete.length; i < l; i++) {
            var j = data.links.indexOf(toDelete[i]);
            data.links.splice(j, 1);
        }
    }
    return true;
}

function backStoryIsValid(path, data) {
    if (!data.backStory) {
        console.warn(path, ': \'backStory\' is not defined');
    }
    if (data.backStory && !data.backStory.text) {
        console.warn(path, ': \'backStory\' has no text');
        return true;
    }
    return true;
}

function creativeCommonsAreValid(path, data) {
    if (!data.creativeCommons) {
        console.warn(path, ': \'creativeCommons\' are not defined');
    }
    if (data.creativeCommons && !data.creativeCommons.copyright) {
        console.warn(path, ': \'creativeCommons\' - author is not defined');
        return true;
    }
    return true;
}

function addLinkTypes(linksList) {
    if (!linksList) {
        return;
    }
    for (var i = 0, l = linksList.length; i < l; i++) {
        var link = linksList[i],
            a = document.createElement('a');
        a.href = link.url;
        link.type = a.hostname.match('wikipedia') != null ? 'wikipedia-w' : 'link';
    }
}

function shortenDataText(data) {
    shortenContextText(data.context);
    shortenLinksText(data.links);
    shortenBackstory(data.backStory);
}

function shortenContextText(contextList) {
    if (!contextList) {
        return;
    }
    for (var i= 0, l=contextList.length; i<l; i++) {
        var context = contextList[i];
        if (context.credit) {
            context.credit = shortenText(context.credit, MAX_CONTEXT_CREDIT_LENGTH);
        }
    }
}

function shortenLinksText(linksList) {
    if (!linksList) {
        return;
    }
    for (var i= 0, l=linksList.length; i<l; i++) {
        var link = linksList[i];
        if (link.title) {
            link.title = shortenText(link.title, MAX_LINKS_TITLE_LENGTH);
        } else {
            link.title = shortenText(link.url, MAX_LINKS_TITLE_LENGTH);
        }
    }
}

function shortenBackstory(backStory) {
    if (!backStory) {
        return;
    }
    if (backStory.author) {
        backStory.author = shortenText(backStory.author, MAX_BACKSTORY_AUTHOR_LENGTH);
    }
    if (backStory.magazine) {
        backStory.magazine = shortenText(backStory.magazine, MAX_BACKSTORY_MAGAZINE_LENGTH);
    }
}