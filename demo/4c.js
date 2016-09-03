(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }
        
        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            head.appendChild(style);
        } else if (style.styleSheet) { // for IE8 and below
            head.appendChild(style);
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            head.appendChild(style);
        }
    }
};

},{}],3:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jade = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return (Array.isArray(val) ? val.map(joinClasses) :
    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
    [val]).filter(nulls).join(' ');
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};


exports.style = function (val) {
  if (val && typeof val === 'object') {
    return Object.keys(val).map(function (style) {
      return style + ':' + val[style];
    }).join(';');
  } else {
    return val;
  }
};
/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if (key === 'style') {
    val = exports.style(val);
  }
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    if (JSON.stringify(val).indexOf('&') !== -1) {
      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
                   'will be escaped to `&amp;`');
    };
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will eliminate the double quotes around dates in ' +
                   'ISO form after 2.0.0');
    }
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

var jade_encode_html_rules = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};
var jade_match_html = /[&<>"]/g;

function jade_encode_char(c) {
  return jade_encode_html_rules[c] || c;
}

exports.escape = jade_escape;
function jade_escape(html){
  var result = String(html).replace(jade_match_html, jade_encode_char);
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

exports.DebugItem = function DebugItem(lineno, filename) {
  this.lineno = lineno;
  this.filename = filename;
}

},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"fs":1}],4:[function(require,module,exports){
'use strict';


var yaml = require('./lib/js-yaml.js');


module.exports = yaml;

},{"./lib/js-yaml.js":5}],5:[function(require,module,exports){
'use strict';


var loader = require('./js-yaml/loader');
var dumper = require('./js-yaml/dumper');


function deprecated(name) {
  return function () {
    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
  };
}


module.exports.Type                = require('./js-yaml/type');
module.exports.Schema              = require('./js-yaml/schema');
module.exports.FAILSAFE_SCHEMA     = require('./js-yaml/schema/failsafe');
module.exports.JSON_SCHEMA         = require('./js-yaml/schema/json');
module.exports.CORE_SCHEMA         = require('./js-yaml/schema/core');
module.exports.DEFAULT_SAFE_SCHEMA = require('./js-yaml/schema/default_safe');
module.exports.DEFAULT_FULL_SCHEMA = require('./js-yaml/schema/default_full');
module.exports.load                = loader.load;
module.exports.loadAll             = loader.loadAll;
module.exports.safeLoad            = loader.safeLoad;
module.exports.safeLoadAll         = loader.safeLoadAll;
module.exports.dump                = dumper.dump;
module.exports.safeDump            = dumper.safeDump;
module.exports.YAMLException       = require('./js-yaml/exception');

// Deprecated schema names from JS-YAML 2.0.x
module.exports.MINIMAL_SCHEMA = require('./js-yaml/schema/failsafe');
module.exports.SAFE_SCHEMA    = require('./js-yaml/schema/default_safe');
module.exports.DEFAULT_SCHEMA = require('./js-yaml/schema/default_full');

// Deprecated functions from JS-YAML 1.x.x
module.exports.scan           = deprecated('scan');
module.exports.parse          = deprecated('parse');
module.exports.compose        = deprecated('compose');
module.exports.addConstructor = deprecated('addConstructor');

},{"./js-yaml/dumper":7,"./js-yaml/exception":8,"./js-yaml/loader":9,"./js-yaml/schema":11,"./js-yaml/schema/core":12,"./js-yaml/schema/default_full":13,"./js-yaml/schema/default_safe":14,"./js-yaml/schema/failsafe":15,"./js-yaml/schema/json":16,"./js-yaml/type":17}],6:[function(require,module,exports){
'use strict';


function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


module.exports.isNothing      = isNothing;
module.exports.isObject       = isObject;
module.exports.toArray        = toArray;
module.exports.repeat         = repeat;
module.exports.isNegativeZero = isNegativeZero;
module.exports.extend         = extend;

},{}],7:[function(require,module,exports){
'use strict';

/*eslint-disable no-use-before-define*/

var common              = require('./common');
var YAMLException       = require('./exception');
var DEFAULT_FULL_SCHEMA = require('./schema/default_full');
var DEFAULT_SAFE_SCHEMA = require('./schema/default_safe');

var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }

    type = schema.compiledTypeMap[tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}

function State(options) {
  this.schema       = options['schema'] || DEFAULT_FULL_SCHEMA;
  this.indent       = Math.max(1, (options['indent'] || 2));
  this.skipInvalid  = options['skipInvalid'] || false;
  this.flowLevel    = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap     = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys     = options['sortKeys'] || false;
  this.lineWidth    = options['lineWidth'] || 80;
  this.noRefs       = options['noRefs'] || false;
  this.noCompatMode = options['noCompatMode'] || false;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== 0xFEFF /* BOM */)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// Simplified test for values allowed after the first character in plain style.
function isPlainSafe(c) {
  // Uses a subset of nb-char - c-flow-indicator - ":" - "#"
  // where nb-char ::= c-printable - b-char - c-byte-order-mark.
  return isPrintable(c) && c !== 0xFEFF
    // - c-flow-indicator
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // - ":" - "#"
    && c !== CHAR_COLON
    && c !== CHAR_SHARP;
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  return isPrintable(c) && c !== 0xFEFF
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
  var i;
  var char;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(string.charCodeAt(0))
          && !isWhitespace(string.charCodeAt(string.length - 1));

  if (singleLineOnly) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char);
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char);
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    return plain && !testAmbiguousType(string)
      ? STYLE_PLAIN : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (string[0] === ' ' && indentPerLevel > 9) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey) {
  state.dump = (function () {
    if (string.length === 0) {
      return "''";
    }
    if (!state.noCompatMode &&
        DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
      return "'" + string + "'";
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string, lineWidth) + '"';
      default:
        throw new YAMLException('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = (string[0] === ' ') ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char;
  var escapeSeq;

  for (var i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    result += !escapeSeq && isPrintable(char)
      ? string[i]
      : escapeSeq || encodeHex(char);
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level, object[index], false, false)) {
      if (index !== 0) _result += ', ';
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level + 1, object[index], true, true)) {
      if (!compact || index !== 0) {
        _result += generateNextLine(state, level);
      }
      _result += '- ' + state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (index !== 0) pairBuffer += ', ';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + ': ';

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLException('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || index !== 0) {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      state.tag = explicit ? type.tag : '?';

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && (state.dump.length !== 0)) {
        writeBlockSequence(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey);
      }
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLException('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      state.dump = '!<' + state.tag + '> ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  if (writeNode(state, 0, input, true, true)) return state.dump + '\n';

  return '';
}

function safeDump(input, options) {
  return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}

module.exports.dump     = dump;
module.exports.safeDump = safeDump;

},{"./common":6,"./exception":8,"./schema/default_full":13,"./schema/default_safe":14}],8:[function(require,module,exports){
// YAML error class. http://stackoverflow.com/questions/8458984
//
'use strict';

function YAMLException(reason, mark) {
  // Super constructor
  Error.call(this);

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = (this.reason || '(unknown reason)') + (this.mark ? ' ' + this.mark.toString() : '');
}


// Inherit from Error
YAMLException.prototype = Object.create(Error.prototype);
YAMLException.prototype.constructor = YAMLException;


YAMLException.prototype.toString = function toString(compact) {
  var result = this.name + ': ';

  result += this.reason || '(unknown reason)';

  if (!compact && this.mark) {
    result += ' ' + this.mark.toString();
  }

  return result;
};


module.exports = YAMLException;

},{}],9:[function(require,module,exports){
'use strict';

/*eslint-disable max-len,no-use-before-define*/

var common              = require('./common');
var YAMLException       = require('./exception');
var Mark                = require('./mark');
var DEFAULT_SAFE_SCHEMA = require('./schema/default_safe');
var DEFAULT_FULL_SCHEMA = require('./schema/default_full');


var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(((c - 0x010000) >> 10) + 0xD800,
                             ((c - 0x010000) & 0x03FF) + 0xDC00);
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || DEFAULT_FULL_SCHEMA;
  this.onWarning = options['onWarning'] || null;
  this.legacy    = options['legacy']    || false;
  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  return new YAMLException(
    message,
    new Mark(state.filename, state.input, state.position, state.line, (state.position - state.lineStart)));
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length;
           _position < _length;
           _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode) {
  var index, quantity;

  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty.call(overridableKeys, keyNode) &&
        _hasOwnProperty.call(_result, keyNode)) {
      throwError(state, 'duplicated mapping key');
    }
    _result[keyNode] = valueNode;
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = captureEnd = state.position;
        state.position++;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = {},
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = {},
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }

    } else {
      break; // Reading is done. Go to the epilogue.
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if (state.lineIndent > nodeIndent && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!state.anchorMap.hasOwnProperty(alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag !== null && state.tag !== '!') {
    if (state.tag === '?') {
      for (typeIndex = 0, typeQuantity = state.implicitTypes.length;
           typeIndex < typeQuantity;
           typeIndex += 1) {
        type = state.implicitTypes[typeIndex];

        // Implicit resolving is not allowed for non-scalar types, and '?'
        // non-specific tag is only assigned to plain scalars. So, it isn't
        // needed to check for 'kind' conformity.

        if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
          state.result = type.construct(state.result);
          state.tag = type.tag;
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
          break;
        }
      }
    } else if (_hasOwnProperty.call(state.typeMap, state.tag)) {
      type = state.typeMap[state.tag];

      if (state.result !== null && type.kind !== state.kind) {
        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
      }

      if (!type.resolve(state.result)) { // `state.result` updated in resolver if matched
        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
      } else {
        state.result = type.construct(state.result);
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = {};
  state.anchorMap = {};

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State(input, options);

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll(input, iterator, options) {
  var documents = loadDocuments(input, options), index, length;

  for (index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException('expected a single document in the stream, but found more');
}


function safeLoadAll(input, output, options) {
  loadAll(input, output, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


function safeLoad(input, options) {
  return load(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


module.exports.loadAll     = loadAll;
module.exports.load        = load;
module.exports.safeLoadAll = safeLoadAll;
module.exports.safeLoad    = safeLoad;

},{"./common":6,"./exception":8,"./mark":10,"./schema/default_full":13,"./schema/default_safe":14}],10:[function(require,module,exports){
'use strict';


var common = require('./common');


function Mark(name, buffer, position, line, column) {
  this.name     = name;
  this.buffer   = buffer;
  this.position = position;
  this.line     = line;
  this.column   = column;
}


Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
  var head, start, tail, end, snippet;

  if (!this.buffer) return null;

  indent = indent || 4;
  maxLength = maxLength || 75;

  head = '';
  start = this.position;

  while (start > 0 && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1)) === -1) {
    start -= 1;
    if (this.position - start > (maxLength / 2 - 1)) {
      head = ' ... ';
      start += 5;
      break;
    }
  }

  tail = '';
  end = this.position;

  while (end < this.buffer.length && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end)) === -1) {
    end += 1;
    if (end - this.position > (maxLength / 2 - 1)) {
      tail = ' ... ';
      end -= 5;
      break;
    }
  }

  snippet = this.buffer.slice(start, end);

  return common.repeat(' ', indent) + head + snippet + tail + '\n' +
         common.repeat(' ', indent + this.position - start + head.length) + '^';
};


Mark.prototype.toString = function toString(compact) {
  var snippet, where = '';

  if (this.name) {
    where += 'in "' + this.name + '" ';
  }

  where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);

  if (!compact) {
    snippet = this.getSnippet();

    if (snippet) {
      where += ':\n' + snippet;
    }
  }

  return where;
};


module.exports = Mark;

},{"./common":6}],11:[function(require,module,exports){
'use strict';

/*eslint-disable max-len*/

var common        = require('./common');
var YAMLException = require('./exception');
var Type          = require('./type');


function compileList(schema, name, result) {
  var exclude = [];

  schema.include.forEach(function (includedSchema) {
    result = compileList(includedSchema, name, result);
  });

  schema[name].forEach(function (currentType) {
    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag) {
        exclude.push(previousIndex);
      }
    });

    result.push(currentType);
  });

  return result.filter(function (type, index) {
    return exclude.indexOf(index) === -1;
  });
}


function compileMap(/* lists... */) {
  var result = {}, index, length;

  function collectType(type) {
    result[type.tag] = type;
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }

  return result;
}


function Schema(definition) {
  this.include  = definition.include  || [];
  this.implicit = definition.implicit || [];
  this.explicit = definition.explicit || [];

  this.implicit.forEach(function (type) {
    if (type.loadKind && type.loadKind !== 'scalar') {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }
  });

  this.compiledImplicit = compileList(this, 'implicit', []);
  this.compiledExplicit = compileList(this, 'explicit', []);
  this.compiledTypeMap  = compileMap(this.compiledImplicit, this.compiledExplicit);
}


Schema.DEFAULT = null;


Schema.create = function createSchema() {
  var schemas, types;

  switch (arguments.length) {
    case 1:
      schemas = Schema.DEFAULT;
      types = arguments[0];
      break;

    case 2:
      schemas = arguments[0];
      types = arguments[1];
      break;

    default:
      throw new YAMLException('Wrong number of arguments for Schema.create function');
  }

  schemas = common.toArray(schemas);
  types = common.toArray(types);

  if (!schemas.every(function (schema) { return schema instanceof Schema; })) {
    throw new YAMLException('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
  }

  if (!types.every(function (type) { return type instanceof Type; })) {
    throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
  }

  return new Schema({
    include: schemas,
    explicit: types
  });
};


module.exports = Schema;

},{"./common":6,"./exception":8,"./type":17}],12:[function(require,module,exports){
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./json')
  ]
});

},{"../schema":11,"./json":16}],13:[function(require,module,exports){
// JS-YAML's default schema for `load` function.
// It is not described in the YAML specification.
//
// This schema is based on JS-YAML's default safe schema and includes
// JavaScript-specific types: !!js/undefined, !!js/regexp and !!js/function.
//
// Also this schema is used as default base schema at `Schema.create` function.


'use strict';


var Schema = require('../schema');


module.exports = Schema.DEFAULT = new Schema({
  include: [
    require('./default_safe')
  ],
  explicit: [
    require('../type/js/undefined'),
    require('../type/js/regexp'),
    require('../type/js/function')
  ]
});

},{"../schema":11,"../type/js/function":22,"../type/js/regexp":23,"../type/js/undefined":24,"./default_safe":14}],14:[function(require,module,exports){
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./core')
  ],
  implicit: [
    require('../type/timestamp'),
    require('../type/merge')
  ],
  explicit: [
    require('../type/binary'),
    require('../type/omap'),
    require('../type/pairs'),
    require('../type/set')
  ]
});

},{"../schema":11,"../type/binary":18,"../type/merge":26,"../type/omap":28,"../type/pairs":29,"../type/set":31,"../type/timestamp":33,"./core":12}],15:[function(require,module,exports){
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  explicit: [
    require('../type/str'),
    require('../type/seq'),
    require('../type/map')
  ]
});

},{"../schema":11,"../type/map":25,"../type/seq":30,"../type/str":32}],16:[function(require,module,exports){
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./failsafe')
  ],
  implicit: [
    require('../type/null'),
    require('../type/bool'),
    require('../type/int'),
    require('../type/float')
  ]
});

},{"../schema":11,"../type/bool":19,"../type/float":20,"../type/int":21,"../type/null":27,"./failsafe":15}],17:[function(require,module,exports){
'use strict';

var YAMLException = require('./exception');

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.tag          = tag;
  this.kind         = options['kind']         || null;
  this.resolve      = options['resolve']      || function () { return true; };
  this.construct    = options['construct']    || function (data) { return data; };
  this.instanceOf   = options['instanceOf']   || null;
  this.predicate    = options['predicate']    || null;
  this.represent    = options['represent']    || null;
  this.defaultStyle = options['defaultStyle'] || null;
  this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

module.exports = Type;

},{"./exception":8}],18:[function(require,module,exports){
'use strict';

/*eslint-disable no-bitwise*/

var NodeBuffer;

try {
  // A trick for browserified version, to not include `Buffer` shim
  var _require = require;
  NodeBuffer = _require('buffer').Buffer;
} catch (__) {}

var Type       = require('../type');


// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  // Wrap into Buffer for NodeJS and leave Array for browser
  if (NodeBuffer) return new NodeBuffer(result);

  return result;
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(object) {
  return NodeBuffer && NodeBuffer.isBuffer(object);
}

module.exports = new Type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});

},{"../type":17}],19:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

module.exports = new Type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});

},{"../type":17}],20:[function(require,module,exports){
'use strict';

var common = require('../common');
var Type   = require('../type');

var YAML_FLOAT_PATTERN = new RegExp(
  '^(?:[-+]?(?:[0-9][0-9_]*)\\.[0-9_]*(?:[eE][-+][0-9]+)?' +
  '|\\.[0-9_]+(?:[eE][-+][0-9]+)?' +
  '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' +
  '|[-+]?\\.(?:inf|Inf|INF)' +
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data)) return false;

  return true;
}

function constructYamlFloat(data) {
  var value, sign, base, digits;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;
  digits = [];

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;

  } else if (value.indexOf(':') >= 0) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseFloat(v, 10));
    });

    value = 0.0;
    base = 1;

    digits.forEach(function (d) {
      value += d * base;
      base *= 60;
    });

    return sign * value;

  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});

},{"../common":6,"../type":17}],21:[function(require,module,exports){
'use strict';

var common = require('../common');
var Type   = require('../type');

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits;
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits;
    }

    // base 8
    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') continue;
      if (!isOctCode(data.charCodeAt(index))) return false;
      hasDigits = true;
    }
    return hasDigits;
  }

  // base 10 (except 0) or base 60

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (ch === ':') break;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  if (!hasDigits) return false;

  // if !base60 - done;
  if (ch !== ':') return true;

  // base60 almost not used, no needs to optimize
  return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch, base, digits = [];

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value, 16);
    return sign * parseInt(value, 8);
  }

  if (value.indexOf(':') !== -1) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseInt(v, 10));
    });

    value = 0;
    base = 1;

    digits.forEach(function (d) {
      value += (d * base);
      base *= 60;
    });

    return sign * value;

  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (object) { return '0b' + object.toString(2); },
    octal:       function (object) { return '0'  + object.toString(8); },
    decimal:     function (object) { return        object.toString(10); },
    hexadecimal: function (object) { return '0x' + object.toString(16).toUpperCase(); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});

},{"../common":6,"../type":17}],22:[function(require,module,exports){
'use strict';

var esprima;

// Browserified version does not have esprima
//
// 1. For node.js just require module as deps
// 2. For browser try to require mudule via external AMD system.
//    If not found - try to fallback to window.esprima. If not
//    found too - then fail to parse.
//
try {
  // workaround to exclude package from browserify list.
  var _require = require;
  esprima = _require('esprima');
} catch (_) {
  /*global window */
  if (typeof window !== 'undefined') esprima = window.esprima;
}

var Type = require('../../type');

function resolveJavascriptFunction(data) {
  if (data === null) return false;

  try {
    var source = '(' + data + ')',
        ast    = esprima.parse(source, { range: true });

    if (ast.type                    !== 'Program'             ||
        ast.body.length             !== 1                     ||
        ast.body[0].type            !== 'ExpressionStatement' ||
        ast.body[0].expression.type !== 'FunctionExpression') {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

function constructJavascriptFunction(data) {
  /*jslint evil:true*/

  var source = '(' + data + ')',
      ast    = esprima.parse(source, { range: true }),
      params = [],
      body;

  if (ast.type                    !== 'Program'             ||
      ast.body.length             !== 1                     ||
      ast.body[0].type            !== 'ExpressionStatement' ||
      ast.body[0].expression.type !== 'FunctionExpression') {
    throw new Error('Failed to resolve function');
  }

  ast.body[0].expression.params.forEach(function (param) {
    params.push(param.name);
  });

  body = ast.body[0].expression.body.range;

  // Esprima's ranges include the first '{' and the last '}' characters on
  // function expressions. So cut them out.
  /*eslint-disable no-new-func*/
  return new Function(params, source.slice(body[0] + 1, body[1] - 1));
}

function representJavascriptFunction(object /*, style*/) {
  return object.toString();
}

function isFunction(object) {
  return Object.prototype.toString.call(object) === '[object Function]';
}

module.exports = new Type('tag:yaml.org,2002:js/function', {
  kind: 'scalar',
  resolve: resolveJavascriptFunction,
  construct: constructJavascriptFunction,
  predicate: isFunction,
  represent: representJavascriptFunction
});

},{"../../type":17}],23:[function(require,module,exports){
'use strict';

var Type = require('../../type');

function resolveJavascriptRegExp(data) {
  if (data === null) return false;
  if (data.length === 0) return false;

  var regexp = data,
      tail   = /\/([gim]*)$/.exec(data),
      modifiers = '';

  // if regexp starts with '/' it can have modifiers and must be properly closed
  // `/foo/gim` - modifiers tail can be maximum 3 chars
  if (regexp[0] === '/') {
    if (tail) modifiers = tail[1];

    if (modifiers.length > 3) return false;
    // if expression starts with /, is should be properly terminated
    if (regexp[regexp.length - modifiers.length - 1] !== '/') return false;
  }

  return true;
}

function constructJavascriptRegExp(data) {
  var regexp = data,
      tail   = /\/([gim]*)$/.exec(data),
      modifiers = '';

  // `/foo/gim` - tail can be maximum 4 chars
  if (regexp[0] === '/') {
    if (tail) modifiers = tail[1];
    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
  }

  return new RegExp(regexp, modifiers);
}

function representJavascriptRegExp(object /*, style*/) {
  var result = '/' + object.source + '/';

  if (object.global) result += 'g';
  if (object.multiline) result += 'm';
  if (object.ignoreCase) result += 'i';

  return result;
}

function isRegExp(object) {
  return Object.prototype.toString.call(object) === '[object RegExp]';
}

module.exports = new Type('tag:yaml.org,2002:js/regexp', {
  kind: 'scalar',
  resolve: resolveJavascriptRegExp,
  construct: constructJavascriptRegExp,
  predicate: isRegExp,
  represent: representJavascriptRegExp
});

},{"../../type":17}],24:[function(require,module,exports){
'use strict';

var Type = require('../../type');

function resolveJavascriptUndefined() {
  return true;
}

function constructJavascriptUndefined() {
  /*eslint-disable no-undefined*/
  return undefined;
}

function representJavascriptUndefined() {
  return '';
}

function isUndefined(object) {
  return typeof object === 'undefined';
}

module.exports = new Type('tag:yaml.org,2002:js/undefined', {
  kind: 'scalar',
  resolve: resolveJavascriptUndefined,
  construct: constructJavascriptUndefined,
  predicate: isUndefined,
  represent: representJavascriptUndefined
});

},{"../../type":17}],25:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});

},{"../type":17}],26:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

module.exports = new Type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});

},{"../type":17}],27:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

module.exports = new Type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; }
  },
  defaultStyle: 'lowercase'
});

},{"../type":17}],28:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});

},{"../type":17}],29:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _toString = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});

},{"../type":17}],30:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});

},{"../type":17}],31:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});

},{"../type":17}],32:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});

},{"../type":17}],33:[function(require,module,exports){
'use strict';

var Type = require('../type');

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

module.exports = new Type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

},{"../type":17}],34:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var yaml = require('js-yaml'),
    shortenText = require('./helpers/shorten-text'),
    baseAttr = "data-4c",
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
        data.context.forEach(function (el, i) {
            if (!el.src && !el.youtube_id) {
                console.warn(path, ': \'context\', element number', String(i + 1),
                    ' - \'src\' and \'youtube_id\' are not defined');
                toDelete.push(el);
            }
        });
        toDelete.forEach(function (el) {
            var j = data.context.indexOf(el);
            data.context.splice(j, 1);
        });
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
        data.links.forEach(function (el, i) {
            if (!el.url) {
                console.warn(path, ': \'links\', element number', String(i + 1),
                    ' - \'url\' is not defined');
                toDelete.push(el);
            }
        });
        toDelete.forEach(function(el) {
            var j = data.links.indexOf(el);
            data.links.splice(j, 1);
        });
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
    linksList.forEach(function(link) {
        var a = document.createElement('a');
        a.href = link.url;
        link.type = a.hostname.match('wikipedia') != null ? 'wikipedia-w' : 'link';
    });
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
    contextList.forEach(function(context) {
        if (context.credit) {
            context.credit = shortenText(context.credit, MAX_CONTEXT_CREDIT_LENGTH);
        }
    });
}

function shortenLinksText(linksList) {
    if (!linksList) {
        return;
    }
    linksList.forEach(function(link) {
        if (link.title) {
            link.title = shortenText(link.title, MAX_LINKS_TITLE_LENGTH);
        } else {
            link.title = shortenText(link.url, MAX_LINKS_TITLE_LENGTH);
        }
    });
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
},{"./helpers/shorten-text":43,"js-yaml":4}],35:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (el, cls) {
    if (el.classList) {
        el.classList.add(cls);
    } else {
        el.className += ' ' + cls;
    }
};
},{}],36:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (el, eventName, handler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, handler);
    } else {
        el.attachEvent('on' + eventName, function (event) {
            handler.call(el, event);
        });
    }
};
},{}],37:[function(require,module,exports){
// http://stackoverflow.com/questions/17567344/detect-left-right-swipe-on-touch-devices-but-allow-up-down-scrolling

'use strict';

module.exports = function () {
    var swipeLeftName = 'swipeLeft',
        swipeRightName = 'swipeRight',
        swipeUpName = 'swipeUp',
        swipeDownName = 'swipeDown';

    (function (d) {
        var ce = function (e, n) {
                var a = document.createEvent("CustomEvent");
                a.initCustomEvent(n, true, true, e.target);
                e.target.dispatchEvent(a);
                a = null;
                return false
            },
            nm = true,
            sp = {x: 0, y: 0},
            ep = {x: 0, y: 0},
            touch = {
                touchstart: function (e) {
                    sp = {x: e.touches[0].pageX, y: e.touches[0].pageY};
                },
                touchmove: function (e) {
                    nm = false;
                    ep = {x: e.touches[0].pageX, y: e.touches[0].pageY};
                },
                touchend: function (e) {
                    if (nm) {
                        ce(e, 'fc');
                    } else {
                        var x = ep.x - sp.x,
                            xr = Math.abs(x),
                            y = ep.y - sp.y,
                            yr = Math.abs(y);
                        if (Math.max(xr, yr) > 20) {
                            ce(e, (xr > yr ? (x < 0 ? swipeLeftName : swipeRightName) : (y < 0 ? swipeUpName : swipeDownName)));
                        }
                    }
                    nm = true;
                },
                touchcancel: function (e) {
                    nm = false;
                }
            };

        for (var a in touch) {
            d.addEventListener(a, touch[a], false);
        }

    })(document);
};
},{}],38:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var getElementStyles = require('./get-element-style');

module.exports = function (fromDom, toDom) {
    //Fixme: Margins are transformed by the getComputedStyle.
    // In Chrome instead of 'auto' a static value is returned, in Firefox - 0.
    // Potential solution get all css from stylesheets (In Chrome instead of 'auto' a static value is returned, in Firefox - 0.)
    // and from style attribute and apply those to toDom.

    var styles = getElementStyles(fromDom);
    for (var i in styles) {
        if (styles.hasOwnProperty(i)) {
            toDom.style[i] = styles[i];
        }
    }
};
},{"./get-element-style":40}],39:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function getAllElementsWithAttribute(attribute, el) {
    if (el == undefined) {
        el = document;
    }
    var matchingElements = [];
    var allElements = el.getElementsByTagName('*');
    Array.prototype.forEach.call(allElements, function(element) {
        if (element.getAttribute(attribute) !== null) {
            // Element exists with attribute. Add to array.
            matchingElements.push(element);
        }
    });
    return matchingElements;
};
},{}],40:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (dom) {
    return getComputedStyle(dom);
};

function getComputedStyle(dom) {
    var style, returns, margins;
    if (window.getComputedStyle) {
        style = window.getComputedStyle(dom, null);
        returns = {};
        for (var i = 0, l = style.length; i < l; i++) {
            var prop = style[i],
                camel = camelize(prop),
                val = style.getPropertyValue(prop);
            returns[camel] = val;
        }
    } else if (style = dom.currentStyle) {
        returns = {};
        for (var prop in style) {
            returns[prop] = style[prop];
        }
    }
    if (returns) {
        margins = getStyleSheetMargins(dom);
        for (var i in margins) {
            returns[i] = margins[i];
        }
    }
    return returns;
}

function getStyleSheetMargins(dom) {
    // Get all stylesheets and element' style attribute
    var sheets = document.styleSheets, o = [], style = dom.getAttribute('style'),
        margin = {};
    // Get element's browser specific css rules match method
    dom.matches = dom.matches || dom.webkitMatchesSelector || dom.mozMatchesSelector || dom.msMatchesSelector || dom.oMatchesSelector;
    for (var i in sheets) {
        var rules = sheets[i].rules || sheets[i].cssRules;
        for (var r in rules) {
            var selector = rules[r].selectorText,
                rule = rules[r].cssText;
            if (!dom.matches(selector) || rule.match("margin") == null) {
                continue;
            }
            var styleRules = splitCssRule(rule);
            applyStylesToMargin(margin, styleRules);
        }
    }
    if (style) {
        var styleRules = splitStyleRule(style);
        applyStylesToMargin(margin, styleRules);
    }
    return margin;
}

function applyStylesToMargin(margin, styleRules) {
    styleRules.forEach(function (el) {
        if (el[0].match("margin")) {
            var m = {};
            if (el[0] == "margin") {
                m = splitMargin(el[1]);
            } else {
                m[el[0]] = el[1];
            }
            for (var k in m) {
                margin[k] = m[k];
            }
        }
    });
}

function splitCssRule(rule) {
    var cleanedRule = cleanCssRule(rule);
    return splitStyleRule(cleanedRule);
}

function splitStyleRule(rule) {
    var rules = rule.split(/;/g);
    rules = rules.filter(function (el) {
        return el && el.replace(/\s+/g, '');
    });
    return rules.map(function (el) {
        var s = el.split(':');
        s[0] = camelize(s[0].replace(/\s+/g, ''));
        s[1] = s[1].replace(/\s\s+/g, ' ').replace(/(^\s+|\s+$)/g, '');
        return s;
    });
}

function cleanCssRule(rule) {
    var cleanedRule = rule.match(/{(.*?)}/g);
    return cleanedRule.map(function (val) {
        return val.replace(/({|}|\s+)/g, '');
    })[0];
}

function splitMargin(marginRule) {
    var margins = marginRule.split(' ');
    if (margins.length == 1) {
        margins.concat([margins[0], margins[0], margins[0]]);
    }
    if (margins.length == 2) {
        margins.concat(margins);
    }
    if (margins.length == 3) {
        margins.push(margins[1]);
    }
    return {
        marginTop: margins[0],
        marginRight: margins[1],
        marginBottom: margins[2],
        marginLeft: margins[3]
    };
}

function camelize(str) {
    return str.replace(/\-([a-z])/g, function (a, b) {
        return b.toUpperCase();
    });
}
},{}],41:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 27/08/2016.
 */

'use strict';

module.exports = function (fileName) {
    var script = document.createElement('script');
    script.src = fileName;
    document.body.appendChild(script)
};

},{}],42:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

module.exports = function (el, cls) {
    if (el.classList) {
        el.classList.remove(cls);
    } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
};
},{}],43:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 01/09/2016.
 */

'use strict';

module.exports = function (str, len) {
    if (str.length < len) {
        return str;
    } else {
        return str.substr(0, len).replace(/\s+$/, '') + '...';
    }
};
},{}],44:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var baseAttr = "data-4c",
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
        this.getCaptionVisible = function (domElement) {
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
},{"./helpers/add-class":35,"./helpers/get-all-elements-with-attribute":39,"./helpers/remove-class":42}],45:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

// ToDo: YouTube links often cause a delay when hover on any of corners before opening it

'use strict';

require('./polyfills')();

var getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    baseAttr = "data-4c",
    imgs = getAllElementsWithAttribute(baseAttr),
    setMainController = require('./set-main-controller'),
    wrapImage = require('./wrap-image'),
    imageModelFactory = require('./image-model'),
    getImageData = require('./get-image-data');

window.onload = init;

function init() {
    require('./helpers/add-swipe-events')();
    insertFontawesome();
    if (true) {
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

function insertFontawesome() {
    // ToDo: fontawesome should not be loaded from external CDN.
    if (!fontawesomeIsLoaded()) {
        require('./helpers/insert-script')("https://use.fontawesome.com/dcbd51b54b.js");
    }
}

function fontawesomeIsLoaded() {
    var span = document.createElement('span'),
        loaded = false;
    span.className = 'fa';
    span.style.display = 'none';
    document.body.insertBefore(span, document.body.firstChild);

    function css(element, property) {
        return window.getComputedStyle(element, null).getPropertyValue(property);
    }

    if (css(span, 'font-family') === 'FontAwesome') {
        loaded = true;
    }
    return loaded;
}
},{"../temp/style.min.css":53,"./get-image-data":34,"./helpers/add-swipe-events":37,"./helpers/get-all-elements-with-attribute":39,"./helpers/insert-script":41,"./image-model":44,"./polyfills":48,"./set-main-controller":50,"./wrap-image":52}],46:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 03/09/2016.
 */

'use strict';

module.exports = function () {
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (fun/*, thisArg*/) {
            'use strict';

            if (this === void 0 || this === null) {
                throw new TypeError();
            }

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== 'function') {
                throw new TypeError();
            }

            var res = [];
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i];

                    // NOTE: Technically this should Object.defineProperty at
                    //       the next index, as push can be affected by
                    //       properties on Object.prototype and Array.prototype.
                    //       But that method's new, and collisions should be
                    //       rare, so use the more-compatible alternative.
                    if (fun.call(thisArg, val, i, t)) {
                        res.push(val);
                    }
                }
            }

            return res;
        };
    }
};

},{}],47:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 03/09/2016.
 */

'use strict';

module.exports = function () {
    // Production steps of ECMA-262, Edition 5, 15.4.4.18
    // Reference: http://es5.github.io/#x15.4.4.18
    if (!Array.prototype.forEach) {

        Array.prototype.forEach = function (callback, thisArg) {

            var T, k;

            if (this === null) {
                throw new TypeError(' this is null or not defined');
            }

            // 1. Let O be the result of calling toObject() passing the
            // |this| value as the argument.
            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get() internal
            // method of O with the argument "length".
            // 3. Let len be toUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If isCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== "function") {
                throw new TypeError(callback + ' is not a function');
            }

            // 5. If thisArg was supplied, let T be thisArg; else let
            // T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }

            // 6. Let k be 0
            k = 0;

            // 7. Repeat, while k < len
            while (k < len) {

                var kValue;

                // a. Let Pk be ToString(k).
                //    This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty
                //    internal method of O with argument Pk.
                //    This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal
                    // method of O with argument Pk.
                    kValue = O[k];

                    // ii. Call the Call internal method of callback with T as
                    // the this value and argument list containing kValue, k, and O.
                    callback.call(T, kValue, k, O);
                }
                // d. Increase k by 1.
                k++;
            }
            // 8. return undefined
        };
    }
};

},{}],48:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 03/09/2016.
 */

'use strict';

module.exports = function() {
    require('./for-each')();
    require('./filter')();
    require('./map')();
};

},{"./filter":46,"./for-each":47,"./map":49}],49:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 03/09/2016.
 */

'use strict';

module.exports = function () {
    // Production steps of ECMA-262, Edition 5, 15.4.4.19
    // Reference: http://es5.github.io/#x15.4.4.19
    if (!Array.prototype.map) {

        Array.prototype.map = function (callback, thisArg) {

            var T, A, k;

            if (this == null) {
                throw new TypeError(' this is null or not defined');
            }

            // 1. Let O be the result of calling ToObject passing the |this|
            //    value as the argument.
            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get internal
            //    method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }

            // 6. Let A be a new array created as if by the expression new Array(len)
            //    where Array is the standard built-in constructor with that name and
            //    len is the value of len.
            A = new Array(len);

            // 7. Let k be 0
            k = 0;

            // 8. Repeat, while k < len
            while (k < len) {

                var kValue, mappedValue;

                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal
                //    method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal
                    //    method of O with argument Pk.
                    kValue = O[k];

                    // ii. Let mappedValue be the result of calling the Call internal
                    //     method of callback with T as the this value and argument
                    //     list containing kValue, k, and O.
                    mappedValue = callback.call(T, kValue, k, O);

                    // iii. Call the DefineOwnProperty internal method of A with arguments
                    // Pk, Property Descriptor
                    // { Value: mappedValue,
                    //   Writable: true,
                    //   Enumerable: true,
                    //   Configurable: true },
                    // and false.

                    // In browsers that support Object.defineProperty, use the following:
                    // Object.defineProperty(A, k, {
                    //   value: mappedValue,
                    //   writable: true,
                    //   enumerable: true,
                    //   configurable: true
                    // });

                    // For best browser support, use the following:
                    A[k] = mappedValue;
                }
                // d. Increase k by 1.
                k++;
            }

            // 9. return A
            return A;
        };
    }
};
},{}],50:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */


'use strict';

var baseAttr = "data-4c",
    getAllElementsWithAttribute = require('./helpers/get-all-elements-with-attribute'),
    addClass = require('./helpers/add-class'),
    removeClass = require('./helpers/remove-class'),
    addEventListener = require('./helpers/add-event-listener');

module.exports = function (domContainer, model) {
    var watchers = [];

    init();

    function init() {
        setClassWatchers();
        setTextWatchers();
        setEventListeners();
        executeWatchers();
    }

    function setEventListeners() {
        var attr = baseAttr + '-on',
            doms = getAllElementsWithAttribute(attr, domContainer);
        doms.forEach(function(dom) {
            setEventListenersFromExpression(dom, dom.getAttribute(attr));
        });
    }

    function setEventListenersFromExpression(el, expression) {
        var eventMap = parseAttribute(expression);
        for (var eventName in eventMap) {
            addEventListener(el, eventName, getEventListener(el, model, eventMap[eventName]));
        }
    }

    function setClassWatchers() {
        var attr = baseAttr + '-class',
            doms = getAllElementsWithAttribute(attr, domContainer);
        doms.forEach(function(dom) {
            var classWatchers = getClassWatchersForElement(dom, dom.getAttribute(attr));
            watchers.push.apply(watchers, classWatchers);
        });
    }

    function setTextWatchers() {
        var attr = baseAttr + '-text',
            doms = getAllElementsWithAttribute(attr, domContainer);
        doms.forEach(function(dom) {
            var textWatcher = getTextWatcherForElement(dom, dom.getAttribute(attr));
            watchers.push(textWatcher);
        });
    }

    function getClassWatchersForElement(el, expression) {
        var result = [],
            classExpressionMap = parseAttribute(expression);
        for (var className in classExpressionMap) {
            result.push(getClassWatcher(el, className, classExpressionMap[className]));
        }
        return result;
    }

    function getClassWatcher(el, className, expression) {
        return function () {
            if (getClassExpressionValue(el, model, expression)) {
                addClass(el, className);
            } else {
                removeClass(el, className);
            }
        }
    }

    function getTextWatcherForElement(el, expression) {
        return function () {
            el.textContent = getTextExpressionValue(el, model, expression);
        }
    }

    function parseAttribute(str) {
        var keyValStrs = str.split(/,\s*/),
            keyVal = {};
        keyValStrs.forEach(function(el) {
            var kv = el.split(/:\s*/);
            keyVal[kv[0]] = kv[1];
        });
        return keyVal;
    }

    function parseClassExpression(str) {
        return {
            opposite: str.match(/^!/) != null,
            properties: str.replace(/^!/g, '').split('.')
        }
    }

    function getClassExpressionValue(el, model, expression) {
        var parsedExpression = parseClassExpression(expression),
            properties = parsedExpression.properties,
            opposite = parsedExpression.opposite,
            subModel = model,
            targetProperty = properties.pop(),
            subModelName = properties.shift(),
            value;
        while (subModelName != undefined) {
            subModel = subModel[subModelName];
            subModelName = properties.shift();
        }
        if (typeof subModel[targetProperty] == "function") {
            value = subModel[targetProperty].call(subModel, el);
        } else {
            value = subModel[targetProperty];
        }
        return opposite ? !value : value;
    }

    function getTextExpressionValue(el, model, expression) {
        var properties = expression.split('.'),
            subModel = model,
            targetProperty = properties.pop(),
            subModelName = properties.shift(),
            value;
        while (subModelName != undefined) {
            subModel = subModel[subModelName];
            subModelName = properties.shift();
        }
        if (typeof subModel[targetProperty] == "function") {
            value = subModel[targetProperty].call(subModel, el);
        } else {
            value = subModel[targetProperty];
        }
        return value;
    }

    function getEventListener(el, model, expression) {
        var properties = expression.split('.'),
            subModel = model,
            funName = properties.pop(),
            subModelName = properties.shift();
        while (subModelName != undefined) {
            subModel = subModel[subModelName];
            subModelName = properties.shift();
        }
        return function (event) {
            event.preventDefault();
            // Timeout is for preventing events firing on elements
            // standing one behind another (e.g. open and close button)
            setTimeout(function() {
                subModel[funName].call(subModel, event, el);
                executeWatchers();
            }, 10);
        }
    }

    function executeWatchers() {
        watchers.forEach(function(watcher) {
            watcher();
        });
    }
};
},{"./helpers/add-class":35,"./helpers/add-event-listener":36,"./helpers/get-all-elements-with-attribute":39,"./helpers/remove-class":42}],51:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (backStory, context, creativeCommons, links, src, undefined) {
buf.push("<img" + (jade.attr("src", src, true, false)) + "/><div data-4c-class=\"collapsed: toolsHidden\" class=\"fc-tools\">");
if ( context && context.length)
{
buf.push("<button data-4c-on=\"mouseover: topLeftCorner.show\" class=\"fc-btn fc-btn-top-left\"><i class=\"fa fa-history\"></i></button>");
}
if ( links && links.length)
{
buf.push("<button data-4c-on=\"mouseover: topRightCorner.show\" class=\"fc-btn fc-btn-top-right\"><i class=\"fa fa-external-link\"></i></button>");
}
if ( backStory && backStory.text)
{
buf.push("<button data-4c-on=\"mouseover: bottomLeftCorner.show\" class=\"fc-btn fc-btn-bottom-left\"><i class=\"fa fa-info\"></i></button>");
}
if ( creativeCommons && creativeCommons.copyright)
{
buf.push("<button data-4c-on=\"mouseover: bottomRightCorner.show\" class=\"fc-btn fc-btn-bottom-right\"><i class=\"fa fa-copyright\"></i></button>");
}
buf.push("</div><div class=\"fc-content\">");
if ( context && context.length)
{
buf.push("<div data-4c-on=\"swipeLeft: topLeftCorner.selectNext, swipeRight: topLeftCorner.selectPrevious\" data-4c-class=\"visible: topLeftCorner.visible, pinned: topLeftCorner.pinned\" class=\"fc-content-container fc-content-fill\"><div class=\"fc-content-background\"></div><div data-4c-class=\"expanded: !topLeftCorner.visible\" class=\"fc-gallery\">");
if ( context.length > 1)
{
buf.push("<div data-4c-class=\"transparent: getPrevControllerHidden\" class=\"fc-gallery-controls fc-gallery-prev\"><a href=\"\" data-4c-on=\"click: topLeftCorner.selectPrevious, mouseover: topLeftCorner.preselectPrevious, mouseleave: topLeftCorner.clearPreselect\"><i class=\"fa fa-angle-left\"></i></a></div>");
}
buf.push("<ul data-4c-gallery-list=\"data-4c-gallery-list\">");
// iterate context
;(function(){
  var $$obj = context;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

buf.push("<li data-4c-on=\"click: topLeftCorner.selectItem\" data-4c-class=\"hover: topLeftCorner.getItemIsPreselected\" data-4c-gallery-item=\"data-4c-gallery-item\">");
if ( item.src)
{
buf.push("<img" + (jade.attr("src", item.src, true, false)) + "/>");
}
if ( item.youtube_id)
{
buf.push("<iframe width=\"100%\" height=\"100%\"" + (jade.attr("src", "//www.youtube.com/embed/" + item.youtube_id, true, false)) + " style=\"border:none\"></iframe>");
}
buf.push("</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

buf.push("<li data-4c-on=\"click: topLeftCorner.selectItem\" data-4c-class=\"hover: topLeftCorner.getItemIsPreselected\" data-4c-gallery-item=\"data-4c-gallery-item\">");
if ( item.src)
{
buf.push("<img" + (jade.attr("src", item.src, true, false)) + "/>");
}
if ( item.youtube_id)
{
buf.push("<iframe width=\"100%\" height=\"100%\"" + (jade.attr("src", "//www.youtube.com/embed/" + item.youtube_id, true, false)) + " style=\"border:none\"></iframe>");
}
buf.push("</li>");
    }

  }
}).call(this);

buf.push("</ul>");
if ( context.length > 1)
{
buf.push("<div data-4c-class=\"transparent: getNextControllerHidden\" class=\"fc-gallery-controls fc-gallery-next\"><a href=\"\" data-4c-on=\"click: topLeftCorner.selectNext, mouseover: topLeftCorner.preselectNext, mouseleave: topLeftCorner.clearPreselect\"><i class=\"fa fa-angle-right\"></i></a></div>");
}
// iterate context
;(function(){
  var $$obj = context;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

if ( item.credit)
{
buf.push("<div data-4c-gallery-caption=\"data-4c-gallery-caption\" data-4c-class=\"visible: topLeftCorner.getCaptionVisible\" class=\"fc-gallery-caption\"><div class=\"fc-gallery-caption-background\"></div><div class=\"fc-gallery-caption-text\">" + (jade.escape((jade_interp = item.credit) == null ? '' : jade_interp)) + "</div></div>");
}
else
{
buf.push("<div data-4c-gallery-caption=\"data-4c-gallery-caption\" data-4c-class=\"visible: topLeftCorner.getCaptionVisible\"></div>");
}
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

if ( item.credit)
{
buf.push("<div data-4c-gallery-caption=\"data-4c-gallery-caption\" data-4c-class=\"visible: topLeftCorner.getCaptionVisible\" class=\"fc-gallery-caption\"><div class=\"fc-gallery-caption-background\"></div><div class=\"fc-gallery-caption-text\">" + (jade.escape((jade_interp = item.credit) == null ? '' : jade_interp)) + "</div></div>");
}
else
{
buf.push("<div data-4c-gallery-caption=\"data-4c-gallery-caption\" data-4c-class=\"visible: topLeftCorner.getCaptionVisible\"></div>");
}
    }

  }
}).call(this);

buf.push("</div><button data-4c-on=\"click: topLeftCorner.hide\" class=\"fc-btn fc-btn-top-left fc-gallery-close\"><i class=\"fa fa-times\"></i></button></div>");
}
if ( links && links.length)
{
buf.push("<div data-4c-on=\"mouseleave: topRightCorner.hide\" data-4c-class=\"visible: topRightCorner.visible\" class=\"fc-content-container fc-content-top-right\"><div class=\"fc-content-body\"><div class=\"fc-content-background\"></div><div class=\"fc-content-text\"><button data-4c-on=\"click: topRightCorner.hide\" class=\"fc-btn fc-btn-close\"><i class=\"fa fa-times\"></i></button><h1>Links</h1><div class=\"fa-ul\">");
// iterate links
;(function(){
  var $$obj = links;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

buf.push("<li><i" + (jade.cls(["fa-li fa fa-" + item.type], [true])) + "></i><a" + (jade.attr("href", item.url, true, false)) + ">" + (jade.escape((jade_interp = item.title) == null ? '' : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

buf.push("<li><i" + (jade.cls(["fa-li fa fa-" + item.type], [true])) + "></i><a" + (jade.attr("href", item.url, true, false)) + ">" + (jade.escape((jade_interp = item.title) == null ? '' : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

buf.push("</div></div></div></div>");
}
if ( backStory && backStory.text)
{
buf.push("<div data-4c-on=\"mouseleave: bottomLeftCorner.hide\" data-4c-class=\"visible: bottomLeftCorner.visible\" class=\"fc-content-container fc-content-bottom-left\"><div class=\"fc-content-body\"><div class=\"fc-content-background\"></div><div class=\"fc-content-text\"><button data-4c-on=\"click: bottomLeftCorner.hide\" class=\"fc-btn fc-btn-close\"><i class=\"fa fa-times\"></i></button><h1>Backstory</h1><p>" + (jade.escape((jade_interp = backStory.text) == null ? '' : jade_interp)) + "</p><p>");
if ( backStory.author)
{
buf.push("" + (jade.escape((jade_interp = backStory.author + (backStory.magazine || backStory.date ? ', ' : '')) == null ? '' : jade_interp)) + "");
}
if ( backStory.magazine)
{
if ( backStory.magazineUrl)
{
buf.push("<a" + (jade.attr("href", backStory.magazineUrl, true, false)) + ">" + (jade.escape((jade_interp = backStory.magazine) == null ? '' : jade_interp)) + "</a>");
}
else
{
buf.push("" + (jade.escape((jade_interp = backStory.magazine) == null ? '' : jade_interp)) + "");
}
buf.push("" + (jade.escape((jade_interp = backStory.date ? ', ' : '') == null ? '' : jade_interp)) + "");
}
if ( backStory.date)
{
buf.push("" + (jade.escape((jade_interp = backStory.date) == null ? '' : jade_interp)) + "");
}
buf.push("</p></div></div></div>");
}
if ( creativeCommons && creativeCommons.copyright)
{
buf.push("<div data-4c-on=\"mouseleave: bottomRightCorner.hide\" data-4c-class=\"visible: bottomRightCorner.visible\" class=\"fc-content-container fc-content-bottom-right\"><div class=\"fc-content-body\"><div class=\"fc-content-background\"></div><div class=\"fc-content-text\"><button data-4c-on=\"click: bottomRightCorner.hide\" class=\"fc-btn fc-btn-close\"><i class=\"fa fa-times\"></i></button><p class=\"fc-content-copyright\">" + (jade.escape((jade_interp = 'Photograph by ') == null ? '' : jade_interp)) + "");
if ( creativeCommons.codeOfEthics)
{
buf.push("<a href=\"\" data-4c-on=\"click: bottomRightCorner.toggleCodeOfEthics\" class=\"fc-code-of-ethics-show\">" + (jade.escape((jade_interp = creativeCommons.copyright) == null ? '' : jade_interp)) + "</a>");
}
else
{
buf.push("" + (jade.escape((jade_interp = creativeCommons.copyright) == null ? '' : jade_interp)) + "");
}
buf.push("</p>");
if ( creativeCommons.codeOfEthics)
{
buf.push("<p data-4c-class=\"visible: bottomRightCorner.codeOfEthicsVisible\" class=\"fc-code-of-ethics\">CODE OF ETHICS:  " + (jade.escape((jade_interp = creativeCommons.codeOfEthics) == null ? '' : jade_interp)) + "</p>");
}
buf.push("<p>" + (jade.escape((jade_interp = creativeCommons.description) == null ? '' : jade_interp)) + "</p></div></div></div>");
}
buf.push("</div>");}.call(this,"backStory" in locals_for_with?locals_for_with.backStory:typeof backStory!=="undefined"?backStory:undefined,"context" in locals_for_with?locals_for_with.context:typeof context!=="undefined"?context:undefined,"creativeCommons" in locals_for_with?locals_for_with.creativeCommons:typeof creativeCommons!=="undefined"?creativeCommons:undefined,"links" in locals_for_with?locals_for_with.links:typeof links!=="undefined"?links:undefined,"src" in locals_for_with?locals_for_with.src:typeof src!=="undefined"?src:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":3}],52:[function(require,module,exports){
/**
 * Created by Tim Osadchiy on 15/08/2016.
 */

'use strict';

var template = require("./template.jade"),
    copyStyle = require('./helpers/copy-style');

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
    return div;
};
},{"./helpers/copy-style":38,"./template.jade":51}],53:[function(require,module,exports){
var css = ".fc-code-of-ethics-show:active,.fc-code-of-ethics-show:focus,.fc-code-of-ethics-show:hover,.fc-image a{text-decoration:none}.fc-btn,.fc-gallery ul li{text-align:center;vertical-align:middle}.fc-image{position:relative!important;overflow:hidden!important;height:auto!important}.fc-image *{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;font-size:13px;font-family:\"Helvetica Neue\",Helvetica,Arial,sans-serif;font-weight:300;letter-spacing:.03em;-webkit-text-emphasis:initial;-webkit-text-fill-color:initial}.fc-image>img{display:block;max-width:100%}.fc-image h1{font-size:24px;letter-spacing:.1em;font-weight:300;margin:10px 0}.fc-image p{margin:0 0 10px}.fc-image a{color:#337ab7;-webkit-transition:color .1s linear;-moz-transition:color .1s linear;-ms-transition:color .1s linear;-o-transition:color .1s linear;transition:color .1s linear}.fc-image a:active,.fc-image a:focus,.fc-image a:hover{color:#4f93ce}.fc-content{position:absolute;top:0;left:0;height:100%;width:100%}.fc-content-container{position:absolute;width:100%;max-width:260px;max-height:100%;opacity:0;color:#fff;overflow-y:auto;overflow-x:hidden;-webkit-transition:opacity .1s linear;-moz-transition:opacity .1s linear;-ms-transition:opacity .1s linear;-o-transition:opacity .1s linear;transition:opacity .1s linear}.fc-content-container.pinned,.fc-content-container.visible{opacity:1;z-index:2}.fc-content-body{height:100%;width:100%;position:relative}.fc-content-text{padding:5px 15px 15px 10px;position:relative;z-index:2}.fc-content-background{position:absolute;top:0;left:0;width:100%;height:100%;background:#000;opacity:.7}.fc-gallery,.fc-gallery ul{position:relative;width:100%;height:100%}.fc-content-fill{top:0;left:0;width:100%;height:100%;max-width:100%}.fc-content-top-right{top:0;right:0}.fc-content-bottom-left{bottom:0;left:0}.fc-content-bottom-right{bottom:0;right:0}.fc-content-copyright{display:inline-block}.fc-gallery{overflow:hidden}.fc-gallery ul{white-space:nowrap;display:block;margin:0;padding:0;-webkit-transform:scale(.8);-moz-transform:scale(.8);-ms-transform:scale(.8);transform:scale(.8);-webkit-transition:margin-left .15s linear;-moz-transition:margin-left .15s linear;-ms-transition:margin-left .15s linear;-o-transition:margin-left .15s linear;transition:margin-left .15s linear}.fc-gallery ul li{display:inline-block;cursor:pointer;width:100%;height:100%}.fc-gallery ul li iframe,.fc-gallery ul li img{vertical-align:middle;opacity:.7;-webkit-transform:scale(.9);-moz-transform:scale(.9);-ms-transform:scale(.9);transform:scale(.9);-webkit-transition:transform .15s linear,opacity .15s linear;-moz-transition:transform .15s linear,opacity .15s linear;-ms-transition:transform .15s linear,opacity .15s linear;-o-transition:transform .15s linear,opacity .15s linear;transition:transform .15s linear,opacity .15s linear}.fc-gallery ul li img{max-width:100%;max-height:100%}.fc-gallery ul li.hover iframe,.fc-gallery ul li.hover img,.fc-gallery ul li:hover iframe,.fc-gallery ul li:hover img{opacity:.85;-webkit-transform:scale(.92);-moz-transform:scale(.92);-ms-transform:scale(.92);transform:scale(.92)}.fc-gallery ul li.selected{cursor:default}.fc-gallery ul li.selected iframe,.fc-gallery ul li.selected img{opacity:1;-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}.fc-gallery.expanded ul li iframe,.fc-gallery.expanded ul li img{-webkit-transform:scale(1.25);-moz-transform:scale(1.25);-ms-transform:scale(1.25);transform:scale(1.25)}.fc-gallery-caption{position:absolute;bottom:0;left:0;text-align:center;padding:5px;font-size:12px;width:100%;opacity:0;-webkit-transition:opacity .1s linear;-moz-transition:opacity .1s linear;-ms-transition:opacity .1s linear;-o-transition:opacity .1s linear;transition:opacity .1s linear}.fc-gallery-caption.visible{opacity:1}.fc-gallery-caption-background{width:100%;height:100%;position:absolute;top:0;left:0;background:#000;opacity:.4}.fc-gallery-caption-text{position:relative;height:100%;width:100%}.fc-gallery-controls{background:0 0;height:100%;width:40px;position:absolute;top:0;z-index:1;opacity:.5;-webkit-transition:opacity .15s linear;-moz-transition:opacity .15s linear;-ms-transition:opacity .15s linear;-o-transition:opacity .15s linear;transition:opacity .15s linear}.fc-gallery-controls.transparent,.fc-tools{opacity:0}.fc-gallery-controls a{display:block;width:100%;height:100%;color:#fff}.fc-gallery-controls a:active,.fc-gallery-controls a:focus,.fc-gallery-controls a:hover{color:#ccc}.fc-gallery-controls a i{position:absolute;top:50%;left:5px;margin-top:-35px;font-size:70px}.fc-gallery-prev{left:0}.fc-gallery-next{right:0}.fc-gallery-close{z-index:2}.fc-code-of-ethics{border:1px solid #337ab7;background:#000;padding:5px 10px;display:none}.fc-code-of-ethics.visible{display:block}.fc-code-of-ethics-show{text-decoration:none;border-bottom:1px dashed;white-space:nowrap;-webkit-transition:color .1s linear;-moz-transition:color .1s linear;-ms-transition:color .1s linear;-o-transition:color .1s linear;transition:color .1s linear}.fc-tools{position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;-webkit-transform:scale(1.5);-moz-transform:scale(1.5);-ms-transform:scale(1.5);transform:scale(1.5);-webkit-transition:opacity .3s linear,transform .2s linear;-moz-transition:opacity .3s linear,transform .2s linear;-ms-transition:opacity .3s linear,transform .2s linear;-o-transition:opacity .3s linear,transform .2s linear;transition:opacity .3s linear,transform .2s linear}.fc-tools:hover{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);transform:scale(1);opacity:1}.touch-screen .fc-tools{opacity:1!important;-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}.touch-screen .fc-tools.collapsed{opacity:0;-webkit-transform:scale(1.5);-moz-transform:scale(1.5);-ms-transform:scale(1.5);transform:scale(1.5)}.fc-btn{display:inline-block;margin:0;white-space:nowrap;position:absolute;color:#fff;background:#000;border:none;border-radius:50%;padding:6px;height:30px;width:30px;opacity:.7;outline:0;-webkit-transition:opacity .1s linear;-moz-transition:opacity .1s linear;-ms-transition:opacity .1s linear;-o-transition:opacity .1s linear;transition:opacity .1s linear}.fc-btn:active,.fc-btn:focus,.fc-btn:hover{opacity:1}.fc-btn-top-left{top:5px;left:5px}.fc-btn-top-right{top:5px;right:5px}.fc-btn-bottom-left{bottom:5px;left:5px}.fc-btn-bottom-right{bottom:5px;right:5px}.fc-btn-close{display:none;position:static;float:right}.touch-screen .fc-btn-close{display:inline-block}"; (require("browserify-css").createStyle(css, { "href": "src/temp/style.min.css"})); module.exports = css;
},{"browserify-css":2}]},{},[45])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktY3NzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvamFkZS9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL2pzLXlhbWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL2NvbW1vbi5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL2R1bXBlci5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL2xvYWRlci5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL21hcmsuanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC9zY2hlbWEuanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC9zY2hlbWEvY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL3NjaGVtYS9kZWZhdWx0X2Z1bGwuanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC9zY2hlbWEvZGVmYXVsdF9zYWZlLmpzIiwibm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2pzLXlhbWwvc2NoZW1hL2ZhaWxzYWZlLmpzIiwibm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2pzLXlhbWwvc2NoZW1hL2pzb24uanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC90eXBlLmpzIiwibm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2pzLXlhbWwvdHlwZS9iaW5hcnkuanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC90eXBlL2Jvb2wuanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC90eXBlL2Zsb2F0LmpzIiwibm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2pzLXlhbWwvdHlwZS9pbnQuanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC90eXBlL2pzL2Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2pzLXlhbWwvdHlwZS9qcy9yZWdleHAuanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC90eXBlL2pzL3VuZGVmaW5lZC5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL3R5cGUvbWFwLmpzIiwibm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2pzLXlhbWwvdHlwZS9tZXJnZS5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL3R5cGUvbnVsbC5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL3R5cGUvb21hcC5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL3R5cGUvcGFpcnMuanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC90eXBlL3NlcS5qcyIsIm5vZGVfbW9kdWxlcy9qcy15YW1sL2xpYi9qcy15YW1sL3R5cGUvc2V0LmpzIiwibm9kZV9tb2R1bGVzL2pzLXlhbWwvbGliL2pzLXlhbWwvdHlwZS9zdHIuanMiLCJub2RlX21vZHVsZXMvanMteWFtbC9saWIvanMteWFtbC90eXBlL3RpbWVzdGFtcC5qcyIsInNyYy9qcy9nZXQtaW1hZ2UtZGF0YS5qcyIsInNyYy9qcy9oZWxwZXJzL2FkZC1jbGFzcy5qcyIsInNyYy9qcy9oZWxwZXJzL2FkZC1ldmVudC1saXN0ZW5lci5qcyIsInNyYy9qcy9oZWxwZXJzL2FkZC1zd2lwZS1ldmVudHMuanMiLCJzcmMvanMvaGVscGVycy9jb3B5LXN0eWxlLmpzIiwic3JjL2pzL2hlbHBlcnMvZ2V0LWFsbC1lbGVtZW50cy13aXRoLWF0dHJpYnV0ZS5qcyIsInNyYy9qcy9oZWxwZXJzL2dldC1lbGVtZW50LXN0eWxlLmpzIiwic3JjL2pzL2hlbHBlcnMvaW5zZXJ0LXNjcmlwdC5qcyIsInNyYy9qcy9oZWxwZXJzL3JlbW92ZS1jbGFzcy5qcyIsInNyYy9qcy9oZWxwZXJzL3Nob3J0ZW4tdGV4dC5qcyIsInNyYy9qcy9pbWFnZS1tb2RlbC5qcyIsInNyYy9qcy9pbmRleC5qcyIsInNyYy9qcy9wb2x5ZmlsbHMvZmlsdGVyLmpzIiwic3JjL2pzL3BvbHlmaWxscy9mb3ItZWFjaC5qcyIsInNyYy9qcy9wb2x5ZmlsbHMvaW5kZXguanMiLCJzcmMvanMvcG9seWZpbGxzL21hcC5qcyIsInNyYy9qcy9zZXQtbWFpbi1jb250cm9sbGVyLmpzIiwic3JjL2pzL3RlbXBsYXRlLmphZGUiLCJzcmMvanMvd3JhcC1pbWFnZS5qcyIsInNyYy90ZW1wL3N0eWxlLm1pbi5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2x5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiIsIid1c2Ugc3RyaWN0Jztcbi8vIEZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGJyb3dzZXIgZmllbGQsIGNoZWNrIG91dCB0aGUgYnJvd3NlciBmaWVsZCBhdCBodHRwczovL2dpdGh1Yi5jb20vc3Vic3RhY2svYnJvd3NlcmlmeS1oYW5kYm9vayNicm93c2VyLWZpZWxkLlxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBDcmVhdGUgYSA8bGluaz4gdGFnIHdpdGggb3B0aW9uYWwgZGF0YSBhdHRyaWJ1dGVzXG4gICAgY3JlYXRlTGluazogZnVuY3Rpb24oaHJlZiwgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICAgICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cbiAgICAgICAgbGluay5ocmVmID0gaHJlZjtcbiAgICAgICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIGlmICggISBhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdkYXRhLScgKyBrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgfSxcbiAgICAvLyBDcmVhdGUgYSA8c3R5bGU+IHRhZyB3aXRoIG9wdGlvbmFsIGRhdGEgYXR0cmlidXRlc1xuICAgIGNyZWF0ZVN0eWxlOiBmdW5jdGlvbihjc3NUZXh0LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHZhciBoZWFkID0gZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgICAgICAgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXG4gICAgICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAoICEgYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgICAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoc3R5bGUuc2hlZXQpIHsgLy8gZm9yIGpzZG9tIGFuZCBJRTkrXG4gICAgICAgICAgICBzdHlsZS5pbm5lckhUTUwgPSBjc3NUZXh0O1xuICAgICAgICAgICAgc3R5bGUuc2hlZXQuY3NzVGV4dCA9IGNzc1RleHQ7XG4gICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7IC8vIGZvciBJRTggYW5kIGJlbG93XG4gICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzc1RleHQ7XG4gICAgICAgIH0gZWxzZSB7IC8vIGZvciBDaHJvbWUsIEZpcmVmb3gsIGFuZCBTYWZhcmlcbiAgICAgICAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzc1RleHQpKTtcbiAgICAgICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsIihmdW5jdGlvbihmKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1mKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZil9ZWxzZXt2YXIgZztpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7Zz13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7Zz1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe2c9c2VsZn1lbHNle2c9dGhpc31nLmphZGUgPSBmKCl9fSkoZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXG4gKiB0byB2YWx1ZXMgaW4gb2JqZWN0IGBiYC4gQ2xhc3NlcyBhcmUgc3BlY2lhbC1jYXNlZFxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH0gYVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB2YXIgYXR0cnMgPSBhWzBdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0cnMgPSBtZXJnZShhdHRycywgYVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBhdHRycztcbiAgfVxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xuICB2YXIgYmMgPSBiWydjbGFzcyddO1xuXG4gIGlmIChhYyB8fCBiYykge1xuICAgIGFjID0gYWMgfHwgW107XG4gICAgYmMgPSBiYyB8fCBbXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xuICAgIGFbJ2NsYXNzJ10gPSBhYy5jb25jYXQoYmMpLmZpbHRlcihudWxscyk7XG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhO1xufTtcblxuLyoqXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJyc7XG59XG5cbi8qKlxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuam9pbkNsYXNzZXMgPSBqb2luQ2xhc3NlcztcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5tYXAoam9pbkNsYXNzZXMpIDpcbiAgICAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSA/IE9iamVjdC5rZXlzKHZhbCkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIHZhbFtrZXldOyB9KSA6XG4gICAgW3ZhbF0pLmZpbHRlcihudWxscykuam9pbignICcpO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBjbGFzc2VzXG4gKiBAcGFyYW0ge0FycmF5LjxCb29sZWFuPn0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmNscyA9IGZ1bmN0aW9uIGNscyhjbGFzc2VzLCBlc2NhcGVkKSB7XG4gIHZhciBidWYgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtpXSkge1xuICAgICAgYnVmLnB1c2goZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXMoW2NsYXNzZXNbaV1dKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWYucHVzaChqb2luQ2xhc3NlcyhjbGFzc2VzW2ldKSk7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0ID0gam9pbkNsYXNzZXMoYnVmKTtcbiAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcgY2xhc3M9XCInICsgdGV4dCArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5cbmV4cG9ydHMuc3R5bGUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModmFsKS5tYXAoZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICByZXR1cm4gc3R5bGUgKyAnOicgKyB2YWxbc3R5bGVdO1xuICAgIH0pLmpvaW4oJzsnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcbiAgaWYgKGtleSA9PT0gJ3N0eWxlJykge1xuICAgIHZhbCA9IGV4cG9ydHMuc3R5bGUodmFsKTtcbiAgfVxuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeSh2YWwpLmluZGV4T2YoJyYnKSAhPT0gLTEpIHtcbiAgICAgIGNvbnNvbGUud2FybignU2luY2UgSmFkZSAyLjAuMCwgYW1wZXJzYW5kcyAoYCZgKSBpbiBkYXRhIGF0dHJpYnV0ZXMgJyArXG4gICAgICAgICAgICAgICAgICAgJ3dpbGwgYmUgZXNjYXBlZCB0byBgJmFtcDtgJyk7XG4gICAgfTtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIGVsaW1pbmF0ZSB0aGUgZG91YmxlIHF1b3RlcyBhcm91bmQgZGF0ZXMgaW4gJyArXG4gICAgICAgICAgICAgICAgICAgJ0lTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyBcIj0nXCIgKyBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoLycvZywgJyZhcG9zOycpICsgXCInXCI7XG4gIH0gZWxzZSBpZiAoZXNjYXBlZCkge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XG4gIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge09iamVjdH0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCB0ZXJzZSl7XG4gIHZhciBidWYgPSBbXTtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICAsIHZhbCA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcbiAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcbiAgICAgICAgICBidWYucHVzaCgnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWYucHVzaChleHBvcnRzLmF0dHIoa2V5LCB2YWwsIGZhbHNlLCB0ZXJzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYuam9pbignJyk7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIGphZGVfZW5jb2RlX2h0bWxfcnVsZXMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7J1xufTtcbnZhciBqYWRlX21hdGNoX2h0bWwgPSAvWyY8PlwiXS9nO1xuXG5mdW5jdGlvbiBqYWRlX2VuY29kZV9jaGFyKGMpIHtcbiAgcmV0dXJuIGphZGVfZW5jb2RlX2h0bWxfcnVsZXNbY10gfHwgYztcbn1cblxuZXhwb3J0cy5lc2NhcGUgPSBqYWRlX2VzY2FwZTtcbmZ1bmN0aW9uIGphZGVfZXNjYXBlKGh0bWwpe1xuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpLnJlcGxhY2UoamFkZV9tYXRjaF9odG1sLCBqYWRlX2VuY29kZV9jaGFyKTtcbiAgaWYgKHJlc3VsdCA9PT0gJycgKyBodG1sKSByZXR1cm4gaHRtbDtcbiAgZWxzZSByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZS10aHJvdyB0aGUgZ2l2ZW4gYGVycmAgaW4gY29udGV4dCB0byB0aGVcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KGVyciwgZmlsZW5hbWUsIGxpbmVubywgc3RyKXtcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcbiAgICBlcnIubWVzc2FnZSArPSAnIG9uIGxpbmUgJyArIGxpbmVubztcbiAgICB0aHJvdyBlcnI7XG4gIH1cbiAgdHJ5IHtcbiAgICBzdHIgPSBzdHIgfHwgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4JylcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxuICB9XG4gIHZhciBjb250ZXh0ID0gM1xuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xuXG4gIC8vIEVycm9yIGNvbnRleHRcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXG4gICAgICArIGN1cnJcbiAgICAgICsgJ3wgJ1xuICAgICAgKyBsaW5lO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXG4gICAgKyAnXFxuJyArIGNvbnRleHQgKyAnXFxuXFxuJyArIGVyci5tZXNzYWdlO1xuICB0aHJvdyBlcnI7XG59O1xuXG5leHBvcnRzLkRlYnVnSXRlbSA9IGZ1bmN0aW9uIERlYnVnSXRlbShsaW5lbm8sIGZpbGVuYW1lKSB7XG4gIHRoaXMubGluZW5vID0gbGluZW5vO1xuICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG59XG5cbn0se1wiZnNcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbn0se31dfSx7fSxbMV0pKDEpXG59KTsiLCIndXNlIHN0cmljdCc7XG5cblxudmFyIHlhbWwgPSByZXF1aXJlKCcuL2xpYi9qcy15YW1sLmpzJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB5YW1sO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBsb2FkZXIgPSByZXF1aXJlKCcuL2pzLXlhbWwvbG9hZGVyJyk7XG52YXIgZHVtcGVyID0gcmVxdWlyZSgnLi9qcy15YW1sL2R1bXBlcicpO1xuXG5cbmZ1bmN0aW9uIGRlcHJlY2F0ZWQobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRnVuY3Rpb24gJyArIG5hbWUgKyAnIGlzIGRlcHJlY2F0ZWQgYW5kIGNhbm5vdCBiZSB1c2VkLicpO1xuICB9O1xufVxuXG5cbm1vZHVsZS5leHBvcnRzLlR5cGUgICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL2pzLXlhbWwvdHlwZScpO1xubW9kdWxlLmV4cG9ydHMuU2NoZW1hICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vanMteWFtbC9zY2hlbWEnKTtcbm1vZHVsZS5leHBvcnRzLkZBSUxTQUZFX1NDSEVNQSAgICAgPSByZXF1aXJlKCcuL2pzLXlhbWwvc2NoZW1hL2ZhaWxzYWZlJyk7XG5tb2R1bGUuZXhwb3J0cy5KU09OX1NDSEVNQSAgICAgICAgID0gcmVxdWlyZSgnLi9qcy15YW1sL3NjaGVtYS9qc29uJyk7XG5tb2R1bGUuZXhwb3J0cy5DT1JFX1NDSEVNQSAgICAgICAgID0gcmVxdWlyZSgnLi9qcy15YW1sL3NjaGVtYS9jb3JlJyk7XG5tb2R1bGUuZXhwb3J0cy5ERUZBVUxUX1NBRkVfU0NIRU1BID0gcmVxdWlyZSgnLi9qcy15YW1sL3NjaGVtYS9kZWZhdWx0X3NhZmUnKTtcbm1vZHVsZS5leHBvcnRzLkRFRkFVTFRfRlVMTF9TQ0hFTUEgPSByZXF1aXJlKCcuL2pzLXlhbWwvc2NoZW1hL2RlZmF1bHRfZnVsbCcpO1xubW9kdWxlLmV4cG9ydHMubG9hZCAgICAgICAgICAgICAgICA9IGxvYWRlci5sb2FkO1xubW9kdWxlLmV4cG9ydHMubG9hZEFsbCAgICAgICAgICAgICA9IGxvYWRlci5sb2FkQWxsO1xubW9kdWxlLmV4cG9ydHMuc2FmZUxvYWQgICAgICAgICAgICA9IGxvYWRlci5zYWZlTG9hZDtcbm1vZHVsZS5leHBvcnRzLnNhZmVMb2FkQWxsICAgICAgICAgPSBsb2FkZXIuc2FmZUxvYWRBbGw7XG5tb2R1bGUuZXhwb3J0cy5kdW1wICAgICAgICAgICAgICAgID0gZHVtcGVyLmR1bXA7XG5tb2R1bGUuZXhwb3J0cy5zYWZlRHVtcCAgICAgICAgICAgID0gZHVtcGVyLnNhZmVEdW1wO1xubW9kdWxlLmV4cG9ydHMuWUFNTEV4Y2VwdGlvbiAgICAgICA9IHJlcXVpcmUoJy4vanMteWFtbC9leGNlcHRpb24nKTtcblxuLy8gRGVwcmVjYXRlZCBzY2hlbWEgbmFtZXMgZnJvbSBKUy1ZQU1MIDIuMC54XG5tb2R1bGUuZXhwb3J0cy5NSU5JTUFMX1NDSEVNQSA9IHJlcXVpcmUoJy4vanMteWFtbC9zY2hlbWEvZmFpbHNhZmUnKTtcbm1vZHVsZS5leHBvcnRzLlNBRkVfU0NIRU1BICAgID0gcmVxdWlyZSgnLi9qcy15YW1sL3NjaGVtYS9kZWZhdWx0X3NhZmUnKTtcbm1vZHVsZS5leHBvcnRzLkRFRkFVTFRfU0NIRU1BID0gcmVxdWlyZSgnLi9qcy15YW1sL3NjaGVtYS9kZWZhdWx0X2Z1bGwnKTtcblxuLy8gRGVwcmVjYXRlZCBmdW5jdGlvbnMgZnJvbSBKUy1ZQU1MIDEueC54XG5tb2R1bGUuZXhwb3J0cy5zY2FuICAgICAgICAgICA9IGRlcHJlY2F0ZWQoJ3NjYW4nKTtcbm1vZHVsZS5leHBvcnRzLnBhcnNlICAgICAgICAgID0gZGVwcmVjYXRlZCgncGFyc2UnKTtcbm1vZHVsZS5leHBvcnRzLmNvbXBvc2UgICAgICAgID0gZGVwcmVjYXRlZCgnY29tcG9zZScpO1xubW9kdWxlLmV4cG9ydHMuYWRkQ29uc3RydWN0b3IgPSBkZXByZWNhdGVkKCdhZGRDb25zdHJ1Y3RvcicpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbmZ1bmN0aW9uIGlzTm90aGluZyhzdWJqZWN0KSB7XG4gIHJldHVybiAodHlwZW9mIHN1YmplY3QgPT09ICd1bmRlZmluZWQnKSB8fCAoc3ViamVjdCA9PT0gbnVsbCk7XG59XG5cblxuZnVuY3Rpb24gaXNPYmplY3Qoc3ViamVjdCkge1xuICByZXR1cm4gKHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JykgJiYgKHN1YmplY3QgIT09IG51bGwpO1xufVxuXG5cbmZ1bmN0aW9uIHRvQXJyYXkoc2VxdWVuY2UpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc2VxdWVuY2UpKSByZXR1cm4gc2VxdWVuY2U7XG4gIGVsc2UgaWYgKGlzTm90aGluZyhzZXF1ZW5jZSkpIHJldHVybiBbXTtcblxuICByZXR1cm4gWyBzZXF1ZW5jZSBdO1xufVxuXG5cbmZ1bmN0aW9uIGV4dGVuZCh0YXJnZXQsIHNvdXJjZSkge1xuICB2YXIgaW5kZXgsIGxlbmd0aCwga2V5LCBzb3VyY2VLZXlzO1xuXG4gIGlmIChzb3VyY2UpIHtcbiAgICBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKTtcblxuICAgIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBzb3VyY2VLZXlzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgIGtleSA9IHNvdXJjZUtleXNbaW5kZXhdO1xuICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5cbmZ1bmN0aW9uIHJlcGVhdChzdHJpbmcsIGNvdW50KSB7XG4gIHZhciByZXN1bHQgPSAnJywgY3ljbGU7XG5cbiAgZm9yIChjeWNsZSA9IDA7IGN5Y2xlIDwgY291bnQ7IGN5Y2xlICs9IDEpIHtcbiAgICByZXN1bHQgKz0gc3RyaW5nO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5mdW5jdGlvbiBpc05lZ2F0aXZlWmVybyhudW1iZXIpIHtcbiAgcmV0dXJuIChudW1iZXIgPT09IDApICYmIChOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgPT09IDEgLyBudW1iZXIpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzLmlzTm90aGluZyAgICAgID0gaXNOb3RoaW5nO1xubW9kdWxlLmV4cG9ydHMuaXNPYmplY3QgICAgICAgPSBpc09iamVjdDtcbm1vZHVsZS5leHBvcnRzLnRvQXJyYXkgICAgICAgID0gdG9BcnJheTtcbm1vZHVsZS5leHBvcnRzLnJlcGVhdCAgICAgICAgID0gcmVwZWF0O1xubW9kdWxlLmV4cG9ydHMuaXNOZWdhdGl2ZVplcm8gPSBpc05lZ2F0aXZlWmVybztcbm1vZHVsZS5leHBvcnRzLmV4dGVuZCAgICAgICAgID0gZXh0ZW5kO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKmVzbGludC1kaXNhYmxlIG5vLXVzZS1iZWZvcmUtZGVmaW5lKi9cblxudmFyIGNvbW1vbiAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL2NvbW1vbicpO1xudmFyIFlBTUxFeGNlcHRpb24gICAgICAgPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xudmFyIERFRkFVTFRfRlVMTF9TQ0hFTUEgPSByZXF1aXJlKCcuL3NjaGVtYS9kZWZhdWx0X2Z1bGwnKTtcbnZhciBERUZBVUxUX1NBRkVfU0NIRU1BID0gcmVxdWlyZSgnLi9zY2hlbWEvZGVmYXVsdF9zYWZlJyk7XG5cbnZhciBfdG9TdHJpbmcgICAgICAgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIF9oYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbnZhciBDSEFSX1RBQiAgICAgICAgICAgICAgICAgID0gMHgwOTsgLyogVGFiICovXG52YXIgQ0hBUl9MSU5FX0ZFRUQgICAgICAgICAgICA9IDB4MEE7IC8qIExGICovXG52YXIgQ0hBUl9TUEFDRSAgICAgICAgICAgICAgICA9IDB4MjA7IC8qIFNwYWNlICovXG52YXIgQ0hBUl9FWENMQU1BVElPTiAgICAgICAgICA9IDB4MjE7IC8qICEgKi9cbnZhciBDSEFSX0RPVUJMRV9RVU9URSAgICAgICAgID0gMHgyMjsgLyogXCIgKi9cbnZhciBDSEFSX1NIQVJQICAgICAgICAgICAgICAgID0gMHgyMzsgLyogIyAqL1xudmFyIENIQVJfUEVSQ0VOVCAgICAgICAgICAgICAgPSAweDI1OyAvKiAlICovXG52YXIgQ0hBUl9BTVBFUlNBTkQgICAgICAgICAgICA9IDB4MjY7IC8qICYgKi9cbnZhciBDSEFSX1NJTkdMRV9RVU9URSAgICAgICAgID0gMHgyNzsgLyogJyAqL1xudmFyIENIQVJfQVNURVJJU0sgICAgICAgICAgICAgPSAweDJBOyAvKiAqICovXG52YXIgQ0hBUl9DT01NQSAgICAgICAgICAgICAgICA9IDB4MkM7IC8qICwgKi9cbnZhciBDSEFSX01JTlVTICAgICAgICAgICAgICAgID0gMHgyRDsgLyogLSAqL1xudmFyIENIQVJfQ09MT04gICAgICAgICAgICAgICAgPSAweDNBOyAvKiA6ICovXG52YXIgQ0hBUl9HUkVBVEVSX1RIQU4gICAgICAgICA9IDB4M0U7IC8qID4gKi9cbnZhciBDSEFSX1FVRVNUSU9OICAgICAgICAgICAgID0gMHgzRjsgLyogPyAqL1xudmFyIENIQVJfQ09NTUVSQ0lBTF9BVCAgICAgICAgPSAweDQwOyAvKiBAICovXG52YXIgQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICA9IDB4NUI7IC8qIFsgKi9cbnZhciBDSEFSX1JJR0hUX1NRVUFSRV9CUkFDS0VUID0gMHg1RDsgLyogXSAqL1xudmFyIENIQVJfR1JBVkVfQUNDRU5UICAgICAgICAgPSAweDYwOyAvKiBgICovXG52YXIgQ0hBUl9MRUZUX0NVUkxZX0JSQUNLRVQgICA9IDB4N0I7IC8qIHsgKi9cbnZhciBDSEFSX1ZFUlRJQ0FMX0xJTkUgICAgICAgID0gMHg3QzsgLyogfCAqL1xudmFyIENIQVJfUklHSFRfQ1VSTFlfQlJBQ0tFVCAgPSAweDdEOyAvKiB9ICovXG5cbnZhciBFU0NBUEVfU0VRVUVOQ0VTID0ge307XG5cbkVTQ0FQRV9TRVFVRU5DRVNbMHgwMF0gICA9ICdcXFxcMCc7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDddICAgPSAnXFxcXGEnO1xuRVNDQVBFX1NFUVVFTkNFU1sweDA4XSAgID0gJ1xcXFxiJztcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwOV0gICA9ICdcXFxcdCc7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MEFdICAgPSAnXFxcXG4nO1xuRVNDQVBFX1NFUVVFTkNFU1sweDBCXSAgID0gJ1xcXFx2JztcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwQ10gICA9ICdcXFxcZic7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MERdICAgPSAnXFxcXHInO1xuRVNDQVBFX1NFUVVFTkNFU1sweDFCXSAgID0gJ1xcXFxlJztcbkVTQ0FQRV9TRVFVRU5DRVNbMHgyMl0gICA9ICdcXFxcXCInO1xuRVNDQVBFX1NFUVVFTkNFU1sweDVDXSAgID0gJ1xcXFxcXFxcJztcbkVTQ0FQRV9TRVFVRU5DRVNbMHg4NV0gICA9ICdcXFxcTic7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4QTBdICAgPSAnXFxcXF8nO1xuRVNDQVBFX1NFUVVFTkNFU1sweDIwMjhdID0gJ1xcXFxMJztcbkVTQ0FQRV9TRVFVRU5DRVNbMHgyMDI5XSA9ICdcXFxcUCc7XG5cbnZhciBERVBSRUNBVEVEX0JPT0xFQU5TX1NZTlRBWCA9IFtcbiAgJ3knLCAnWScsICd5ZXMnLCAnWWVzJywgJ1lFUycsICdvbicsICdPbicsICdPTicsXG4gICduJywgJ04nLCAnbm8nLCAnTm8nLCAnTk8nLCAnb2ZmJywgJ09mZicsICdPRkYnXG5dO1xuXG5mdW5jdGlvbiBjb21waWxlU3R5bGVNYXAoc2NoZW1hLCBtYXApIHtcbiAgdmFyIHJlc3VsdCwga2V5cywgaW5kZXgsIGxlbmd0aCwgdGFnLCBzdHlsZSwgdHlwZTtcblxuICBpZiAobWFwID09PSBudWxsKSByZXR1cm4ge307XG5cbiAgcmVzdWx0ID0ge307XG4gIGtleXMgPSBPYmplY3Qua2V5cyhtYXApO1xuXG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICB0YWcgPSBrZXlzW2luZGV4XTtcbiAgICBzdHlsZSA9IFN0cmluZyhtYXBbdGFnXSk7XG5cbiAgICBpZiAodGFnLnNsaWNlKDAsIDIpID09PSAnISEnKSB7XG4gICAgICB0YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6JyArIHRhZy5zbGljZSgyKTtcbiAgICB9XG5cbiAgICB0eXBlID0gc2NoZW1hLmNvbXBpbGVkVHlwZU1hcFt0YWddO1xuXG4gICAgaWYgKHR5cGUgJiYgX2hhc093blByb3BlcnR5LmNhbGwodHlwZS5zdHlsZUFsaWFzZXMsIHN0eWxlKSkge1xuICAgICAgc3R5bGUgPSB0eXBlLnN0eWxlQWxpYXNlc1tzdHlsZV07XG4gICAgfVxuXG4gICAgcmVzdWx0W3RhZ10gPSBzdHlsZTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGVuY29kZUhleChjaGFyYWN0ZXIpIHtcbiAgdmFyIHN0cmluZywgaGFuZGxlLCBsZW5ndGg7XG5cbiAgc3RyaW5nID0gY2hhcmFjdGVyLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuXG4gIGlmIChjaGFyYWN0ZXIgPD0gMHhGRikge1xuICAgIGhhbmRsZSA9ICd4JztcbiAgICBsZW5ndGggPSAyO1xuICB9IGVsc2UgaWYgKGNoYXJhY3RlciA8PSAweEZGRkYpIHtcbiAgICBoYW5kbGUgPSAndSc7XG4gICAgbGVuZ3RoID0gNDtcbiAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPD0gMHhGRkZGRkZGRikge1xuICAgIGhhbmRsZSA9ICdVJztcbiAgICBsZW5ndGggPSA4O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdjb2RlIHBvaW50IHdpdGhpbiBhIHN0cmluZyBtYXkgbm90IGJlIGdyZWF0ZXIgdGhhbiAweEZGRkZGRkZGJyk7XG4gIH1cblxuICByZXR1cm4gJ1xcXFwnICsgaGFuZGxlICsgY29tbW9uLnJlcGVhdCgnMCcsIGxlbmd0aCAtIHN0cmluZy5sZW5ndGgpICsgc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBTdGF0ZShvcHRpb25zKSB7XG4gIHRoaXMuc2NoZW1hICAgICAgID0gb3B0aW9uc1snc2NoZW1hJ10gfHwgREVGQVVMVF9GVUxMX1NDSEVNQTtcbiAgdGhpcy5pbmRlbnQgICAgICAgPSBNYXRoLm1heCgxLCAob3B0aW9uc1snaW5kZW50J10gfHwgMikpO1xuICB0aGlzLnNraXBJbnZhbGlkICA9IG9wdGlvbnNbJ3NraXBJbnZhbGlkJ10gfHwgZmFsc2U7XG4gIHRoaXMuZmxvd0xldmVsICAgID0gKGNvbW1vbi5pc05vdGhpbmcob3B0aW9uc1snZmxvd0xldmVsJ10pID8gLTEgOiBvcHRpb25zWydmbG93TGV2ZWwnXSk7XG4gIHRoaXMuc3R5bGVNYXAgICAgID0gY29tcGlsZVN0eWxlTWFwKHRoaXMuc2NoZW1hLCBvcHRpb25zWydzdHlsZXMnXSB8fCBudWxsKTtcbiAgdGhpcy5zb3J0S2V5cyAgICAgPSBvcHRpb25zWydzb3J0S2V5cyddIHx8IGZhbHNlO1xuICB0aGlzLmxpbmVXaWR0aCAgICA9IG9wdGlvbnNbJ2xpbmVXaWR0aCddIHx8IDgwO1xuICB0aGlzLm5vUmVmcyAgICAgICA9IG9wdGlvbnNbJ25vUmVmcyddIHx8IGZhbHNlO1xuICB0aGlzLm5vQ29tcGF0TW9kZSA9IG9wdGlvbnNbJ25vQ29tcGF0TW9kZSddIHx8IGZhbHNlO1xuXG4gIHRoaXMuaW1wbGljaXRUeXBlcyA9IHRoaXMuc2NoZW1hLmNvbXBpbGVkSW1wbGljaXQ7XG4gIHRoaXMuZXhwbGljaXRUeXBlcyA9IHRoaXMuc2NoZW1hLmNvbXBpbGVkRXhwbGljaXQ7XG5cbiAgdGhpcy50YWcgPSBudWxsO1xuICB0aGlzLnJlc3VsdCA9ICcnO1xuXG4gIHRoaXMuZHVwbGljYXRlcyA9IFtdO1xuICB0aGlzLnVzZWREdXBsaWNhdGVzID0gbnVsbDtcbn1cblxuLy8gSW5kZW50cyBldmVyeSBsaW5lIGluIGEgc3RyaW5nLiBFbXB0eSBsaW5lcyAoXFxuIG9ubHkpIGFyZSBub3QgaW5kZW50ZWQuXG5mdW5jdGlvbiBpbmRlbnRTdHJpbmcoc3RyaW5nLCBzcGFjZXMpIHtcbiAgdmFyIGluZCA9IGNvbW1vbi5yZXBlYXQoJyAnLCBzcGFjZXMpLFxuICAgICAgcG9zaXRpb24gPSAwLFxuICAgICAgbmV4dCA9IC0xLFxuICAgICAgcmVzdWx0ID0gJycsXG4gICAgICBsaW5lLFxuICAgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcblxuICB3aGlsZSAocG9zaXRpb24gPCBsZW5ndGgpIHtcbiAgICBuZXh0ID0gc3RyaW5nLmluZGV4T2YoJ1xcbicsIHBvc2l0aW9uKTtcbiAgICBpZiAobmV4dCA9PT0gLTEpIHtcbiAgICAgIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zaXRpb24pO1xuICAgICAgcG9zaXRpb24gPSBsZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zaXRpb24sIG5leHQgKyAxKTtcbiAgICAgIHBvc2l0aW9uID0gbmV4dCArIDE7XG4gICAgfVxuXG4gICAgaWYgKGxpbmUubGVuZ3RoICYmIGxpbmUgIT09ICdcXG4nKSByZXN1bHQgKz0gaW5kO1xuXG4gICAgcmVzdWx0ICs9IGxpbmU7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbCkge1xuICByZXR1cm4gJ1xcbicgKyBjb21tb24ucmVwZWF0KCcgJywgc3RhdGUuaW5kZW50ICogbGV2ZWwpO1xufVxuXG5mdW5jdGlvbiB0ZXN0SW1wbGljaXRSZXNvbHZpbmcoc3RhdGUsIHN0cikge1xuICB2YXIgaW5kZXgsIGxlbmd0aCwgdHlwZTtcblxuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gc3RhdGUuaW1wbGljaXRUeXBlcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgdHlwZSA9IHN0YXRlLmltcGxpY2l0VHlwZXNbaW5kZXhdO1xuXG4gICAgaWYgKHR5cGUucmVzb2x2ZShzdHIpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIFszM10gcy13aGl0ZSA6Oj0gcy1zcGFjZSB8IHMtdGFiXG5mdW5jdGlvbiBpc1doaXRlc3BhY2UoYykge1xuICByZXR1cm4gYyA9PT0gQ0hBUl9TUEFDRSB8fCBjID09PSBDSEFSX1RBQjtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBjaGFyYWN0ZXIgY2FuIGJlIHByaW50ZWQgd2l0aG91dCBlc2NhcGluZy5cbi8vIEZyb20gWUFNTCAxLjI6IFwiYW55IGFsbG93ZWQgY2hhcmFjdGVycyBrbm93biB0byBiZSBub24tcHJpbnRhYmxlXG4vLyBzaG91bGQgYWxzbyBiZSBlc2NhcGVkLiBbSG93ZXZlcixdIFRoaXMgaXNu4oCZdCBtYW5kYXRvcnlcIlxuLy8gRGVyaXZlZCBmcm9tIG5iLWNoYXIgLSBcXHQgLSAjeDg1IC0gI3hBMCAtICN4MjAyOCAtICN4MjAyOS5cbmZ1bmN0aW9uIGlzUHJpbnRhYmxlKGMpIHtcbiAgcmV0dXJuICAoMHgwMDAyMCA8PSBjICYmIGMgPD0gMHgwMDAwN0UpXG4gICAgICB8fCAoKDB4MDAwQTEgPD0gYyAmJiBjIDw9IDB4MDBEN0ZGKSAmJiBjICE9PSAweDIwMjggJiYgYyAhPT0gMHgyMDI5KVxuICAgICAgfHwgKCgweDBFMDAwIDw9IGMgJiYgYyA8PSAweDAwRkZGRCkgJiYgYyAhPT0gMHhGRUZGIC8qIEJPTSAqLylcbiAgICAgIHx8ICAoMHgxMDAwMCA8PSBjICYmIGMgPD0gMHgxMEZGRkYpO1xufVxuXG4vLyBTaW1wbGlmaWVkIHRlc3QgZm9yIHZhbHVlcyBhbGxvd2VkIGFmdGVyIHRoZSBmaXJzdCBjaGFyYWN0ZXIgaW4gcGxhaW4gc3R5bGUuXG5mdW5jdGlvbiBpc1BsYWluU2FmZShjKSB7XG4gIC8vIFVzZXMgYSBzdWJzZXQgb2YgbmItY2hhciAtIGMtZmxvdy1pbmRpY2F0b3IgLSBcIjpcIiAtIFwiI1wiXG4gIC8vIHdoZXJlIG5iLWNoYXIgOjo9IGMtcHJpbnRhYmxlIC0gYi1jaGFyIC0gYy1ieXRlLW9yZGVyLW1hcmsuXG4gIHJldHVybiBpc1ByaW50YWJsZShjKSAmJiBjICE9PSAweEZFRkZcbiAgICAvLyAtIGMtZmxvdy1pbmRpY2F0b3JcbiAgICAmJiBjICE9PSBDSEFSX0NPTU1BXG4gICAgJiYgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUXG4gICAgJiYgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVFxuICAgICYmIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUXG4gICAgJiYgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUXG4gICAgLy8gLSBcIjpcIiAtIFwiI1wiXG4gICAgJiYgYyAhPT0gQ0hBUl9DT0xPTlxuICAgICYmIGMgIT09IENIQVJfU0hBUlA7XG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYXMgdGhlIGZpcnN0IGNoYXJhY3RlciBpbiBwbGFpbiBzdHlsZS5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlRmlyc3QoYykge1xuICAvLyBVc2VzIGEgc3Vic2V0IG9mIG5zLWNoYXIgLSBjLWluZGljYXRvclxuICAvLyB3aGVyZSBucy1jaGFyID0gbmItY2hhciAtIHMtd2hpdGUuXG4gIHJldHVybiBpc1ByaW50YWJsZShjKSAmJiBjICE9PSAweEZFRkZcbiAgICAmJiAhaXNXaGl0ZXNwYWNlKGMpIC8vIC0gcy13aGl0ZVxuICAgIC8vIC0gKGMtaW5kaWNhdG9yIDo6PVxuICAgIC8vIOKAnC3igJ0gfCDigJw/4oCdIHwg4oCcOuKAnSB8IOKAnCzigJ0gfCDigJxb4oCdIHwg4oCcXeKAnSB8IOKAnHvigJ0gfCDigJx94oCdXG4gICAgJiYgYyAhPT0gQ0hBUl9NSU5VU1xuICAgICYmIGMgIT09IENIQVJfUVVFU1RJT05cbiAgICAmJiBjICE9PSBDSEFSX0NPTE9OXG4gICAgJiYgYyAhPT0gQ0hBUl9DT01NQVxuICAgICYmIGMgIT09IENIQVJfTEVGVF9TUVVBUkVfQlJBQ0tFVFxuICAgICYmIGMgIT09IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVRcbiAgICAmJiBjICE9PSBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0tFVFxuICAgICYmIGMgIT09IENIQVJfUklHSFRfQ1VSTFlfQlJBQ0tFVFxuICAgIC8vIHwg4oCcI+KAnSB8IOKAnCbigJ0gfCDigJwq4oCdIHwg4oCcIeKAnSB8IOKAnHzigJ0gfCDigJw+4oCdIHwg4oCcJ+KAnSB8IOKAnFwi4oCdXG4gICAgJiYgYyAhPT0gQ0hBUl9TSEFSUFxuICAgICYmIGMgIT09IENIQVJfQU1QRVJTQU5EXG4gICAgJiYgYyAhPT0gQ0hBUl9BU1RFUklTS1xuICAgICYmIGMgIT09IENIQVJfRVhDTEFNQVRJT05cbiAgICAmJiBjICE9PSBDSEFSX1ZFUlRJQ0FMX0xJTkVcbiAgICAmJiBjICE9PSBDSEFSX0dSRUFURVJfVEhBTlxuICAgICYmIGMgIT09IENIQVJfU0lOR0xFX1FVT1RFXG4gICAgJiYgYyAhPT0gQ0hBUl9ET1VCTEVfUVVPVEVcbiAgICAvLyB8IOKAnCXigJ0gfCDigJxA4oCdIHwg4oCcYOKAnSlcbiAgICAmJiBjICE9PSBDSEFSX1BFUkNFTlRcbiAgICAmJiBjICE9PSBDSEFSX0NPTU1FUkNJQUxfQVRcbiAgICAmJiBjICE9PSBDSEFSX0dSQVZFX0FDQ0VOVDtcbn1cblxudmFyIFNUWUxFX1BMQUlOICAgPSAxLFxuICAgIFNUWUxFX1NJTkdMRSAgPSAyLFxuICAgIFNUWUxFX0xJVEVSQUwgPSAzLFxuICAgIFNUWUxFX0ZPTERFRCAgPSA0LFxuICAgIFNUWUxFX0RPVUJMRSAgPSA1O1xuXG4vLyBEZXRlcm1pbmVzIHdoaWNoIHNjYWxhciBzdHlsZXMgYXJlIHBvc3NpYmxlIGFuZCByZXR1cm5zIHRoZSBwcmVmZXJyZWQgc3R5bGUuXG4vLyBsaW5lV2lkdGggPSAtMSA9PiBubyBsaW1pdC5cbi8vIFByZS1jb25kaXRpb25zOiBzdHIubGVuZ3RoID4gMC5cbi8vIFBvc3QtY29uZGl0aW9uczpcbi8vICAgIFNUWUxFX1BMQUlOIG9yIFNUWUxFX1NJTkdMRSA9PiBubyBcXG4gYXJlIGluIHRoZSBzdHJpbmcuXG4vLyAgICBTVFlMRV9MSVRFUkFMID0+IG5vIGxpbmVzIGFyZSBzdWl0YWJsZSBmb3IgZm9sZGluZyAob3IgbGluZVdpZHRoIGlzIC0xKS5cbi8vICAgIFNUWUxFX0ZPTERFRCA9PiBhIGxpbmUgPiBsaW5lV2lkdGggYW5kIGNhbiBiZSBmb2xkZWQgKGFuZCBsaW5lV2lkdGggIT0gLTEpLlxuZnVuY3Rpb24gY2hvb3NlU2NhbGFyU3R5bGUoc3RyaW5nLCBzaW5nbGVMaW5lT25seSwgaW5kZW50UGVyTGV2ZWwsIGxpbmVXaWR0aCwgdGVzdEFtYmlndW91c1R5cGUpIHtcbiAgdmFyIGk7XG4gIHZhciBjaGFyO1xuICB2YXIgaGFzTGluZUJyZWFrID0gZmFsc2U7XG4gIHZhciBoYXNGb2xkYWJsZUxpbmUgPSBmYWxzZTsgLy8gb25seSBjaGVja2VkIGlmIHNob3VsZFRyYWNrV2lkdGhcbiAgdmFyIHNob3VsZFRyYWNrV2lkdGggPSBsaW5lV2lkdGggIT09IC0xO1xuICB2YXIgcHJldmlvdXNMaW5lQnJlYWsgPSAtMTsgLy8gY291bnQgdGhlIGZpcnN0IGxpbmUgY29ycmVjdGx5XG4gIHZhciBwbGFpbiA9IGlzUGxhaW5TYWZlRmlyc3Qoc3RyaW5nLmNoYXJDb2RlQXQoMCkpXG4gICAgICAgICAgJiYgIWlzV2hpdGVzcGFjZShzdHJpbmcuY2hhckNvZGVBdChzdHJpbmcubGVuZ3RoIC0gMSkpO1xuXG4gIGlmIChzaW5nbGVMaW5lT25seSkge1xuICAgIC8vIENhc2U6IG5vIGJsb2NrIHN0eWxlcy5cbiAgICAvLyBDaGVjayBmb3IgZGlzYWxsb3dlZCBjaGFyYWN0ZXJzIHRvIHJ1bGUgb3V0IHBsYWluIGFuZCBzaW5nbGUuXG4gICAgZm9yIChpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhciA9IHN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKCFpc1ByaW50YWJsZShjaGFyKSkge1xuICAgICAgICByZXR1cm4gU1RZTEVfRE9VQkxFO1xuICAgICAgfVxuICAgICAgcGxhaW4gPSBwbGFpbiAmJiBpc1BsYWluU2FmZShjaGFyKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gQ2FzZTogYmxvY2sgc3R5bGVzIHBlcm1pdHRlZC5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGFyID0gc3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoY2hhciA9PT0gQ0hBUl9MSU5FX0ZFRUQpIHtcbiAgICAgICAgaGFzTGluZUJyZWFrID0gdHJ1ZTtcbiAgICAgICAgLy8gQ2hlY2sgaWYgYW55IGxpbmUgY2FuIGJlIGZvbGRlZC5cbiAgICAgICAgaWYgKHNob3VsZFRyYWNrV2lkdGgpIHtcbiAgICAgICAgICBoYXNGb2xkYWJsZUxpbmUgPSBoYXNGb2xkYWJsZUxpbmUgfHxcbiAgICAgICAgICAgIC8vIEZvbGRhYmxlIGxpbmUgPSB0b28gbG9uZywgYW5kIG5vdCBtb3JlLWluZGVudGVkLlxuICAgICAgICAgICAgKGkgLSBwcmV2aW91c0xpbmVCcmVhayAtIDEgPiBsaW5lV2lkdGggJiZcbiAgICAgICAgICAgICBzdHJpbmdbcHJldmlvdXNMaW5lQnJlYWsgKyAxXSAhPT0gJyAnKTtcbiAgICAgICAgICBwcmV2aW91c0xpbmVCcmVhayA9IGk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWlzUHJpbnRhYmxlKGNoYXIpKSB7XG4gICAgICAgIHJldHVybiBTVFlMRV9ET1VCTEU7XG4gICAgICB9XG4gICAgICBwbGFpbiA9IHBsYWluICYmIGlzUGxhaW5TYWZlKGNoYXIpO1xuICAgIH1cbiAgICAvLyBpbiBjYXNlIHRoZSBlbmQgaXMgbWlzc2luZyBhIFxcblxuICAgIGhhc0ZvbGRhYmxlTGluZSA9IGhhc0ZvbGRhYmxlTGluZSB8fCAoc2hvdWxkVHJhY2tXaWR0aCAmJlxuICAgICAgKGkgLSBwcmV2aW91c0xpbmVCcmVhayAtIDEgPiBsaW5lV2lkdGggJiZcbiAgICAgICBzdHJpbmdbcHJldmlvdXNMaW5lQnJlYWsgKyAxXSAhPT0gJyAnKSk7XG4gIH1cbiAgLy8gQWx0aG91Z2ggZXZlcnkgc3R5bGUgY2FuIHJlcHJlc2VudCBcXG4gd2l0aG91dCBlc2NhcGluZywgcHJlZmVyIGJsb2NrIHN0eWxlc1xuICAvLyBmb3IgbXVsdGlsaW5lLCBzaW5jZSB0aGV5J3JlIG1vcmUgcmVhZGFibGUgYW5kIHRoZXkgZG9uJ3QgYWRkIGVtcHR5IGxpbmVzLlxuICAvLyBBbHNvIHByZWZlciBmb2xkaW5nIGEgc3VwZXItbG9uZyBsaW5lLlxuICBpZiAoIWhhc0xpbmVCcmVhayAmJiAhaGFzRm9sZGFibGVMaW5lKSB7XG4gICAgLy8gU3RyaW5ncyBpbnRlcnByZXRhYmxlIGFzIGFub3RoZXIgdHlwZSBoYXZlIHRvIGJlIHF1b3RlZDtcbiAgICAvLyBlLmcuIHRoZSBzdHJpbmcgJ3RydWUnIHZzLiB0aGUgYm9vbGVhbiB0cnVlLlxuICAgIHJldHVybiBwbGFpbiAmJiAhdGVzdEFtYmlndW91c1R5cGUoc3RyaW5nKVxuICAgICAgPyBTVFlMRV9QTEFJTiA6IFNUWUxFX1NJTkdMRTtcbiAgfVxuICAvLyBFZGdlIGNhc2U6IGJsb2NrIGluZGVudGF0aW9uIGluZGljYXRvciBjYW4gb25seSBoYXZlIG9uZSBkaWdpdC5cbiAgaWYgKHN0cmluZ1swXSA9PT0gJyAnICYmIGluZGVudFBlckxldmVsID4gOSkge1xuICAgIHJldHVybiBTVFlMRV9ET1VCTEU7XG4gIH1cbiAgLy8gQXQgdGhpcyBwb2ludCB3ZSBrbm93IGJsb2NrIHN0eWxlcyBhcmUgdmFsaWQuXG4gIC8vIFByZWZlciBsaXRlcmFsIHN0eWxlIHVubGVzcyB3ZSB3YW50IHRvIGZvbGQuXG4gIHJldHVybiBoYXNGb2xkYWJsZUxpbmUgPyBTVFlMRV9GT0xERUQgOiBTVFlMRV9MSVRFUkFMO1xufVxuXG4vLyBOb3RlOiBsaW5lIGJyZWFraW5nL2ZvbGRpbmcgaXMgaW1wbGVtZW50ZWQgZm9yIG9ubHkgdGhlIGZvbGRlZCBzdHlsZS5cbi8vIE5CLiBXZSBkcm9wIHRoZSBsYXN0IHRyYWlsaW5nIG5ld2xpbmUgKGlmIGFueSkgb2YgYSByZXR1cm5lZCBibG9jayBzY2FsYXJcbi8vICBzaW5jZSB0aGUgZHVtcGVyIGFkZHMgaXRzIG93biBuZXdsaW5lLiBUaGlzIGFsd2F5cyB3b3Jrczpcbi8vICAgIOKAoiBObyBlbmRpbmcgbmV3bGluZSA9PiB1bmFmZmVjdGVkOyBhbHJlYWR5IHVzaW5nIHN0cmlwIFwiLVwiIGNob21waW5nLlxuLy8gICAg4oCiIEVuZGluZyBuZXdsaW5lICAgID0+IHJlbW92ZWQgdGhlbiByZXN0b3JlZC5cbi8vICBJbXBvcnRhbnRseSwgdGhpcyBrZWVwcyB0aGUgXCIrXCIgY2hvbXAgaW5kaWNhdG9yIGZyb20gZ2FpbmluZyBhbiBleHRyYSBsaW5lLlxuZnVuY3Rpb24gd3JpdGVTY2FsYXIoc3RhdGUsIHN0cmluZywgbGV2ZWwsIGlza2V5KSB7XG4gIHN0YXRlLmR1bXAgPSAoZnVuY3Rpb24gKCkge1xuICAgIGlmIChzdHJpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gXCInJ1wiO1xuICAgIH1cbiAgICBpZiAoIXN0YXRlLm5vQ29tcGF0TW9kZSAmJlxuICAgICAgICBERVBSRUNBVEVEX0JPT0xFQU5TX1NZTlRBWC5pbmRleE9mKHN0cmluZykgIT09IC0xKSB7XG4gICAgICByZXR1cm4gXCInXCIgKyBzdHJpbmcgKyBcIidcIjtcbiAgICB9XG5cbiAgICB2YXIgaW5kZW50ID0gc3RhdGUuaW5kZW50ICogTWF0aC5tYXgoMSwgbGV2ZWwpOyAvLyBubyAwLWluZGVudCBzY2FsYXJzXG4gICAgLy8gQXMgaW5kZW50YXRpb24gZ2V0cyBkZWVwZXIsIGxldCB0aGUgd2lkdGggZGVjcmVhc2UgbW9ub3RvbmljYWxseVxuICAgIC8vIHRvIHRoZSBsb3dlciBib3VuZCBtaW4oc3RhdGUubGluZVdpZHRoLCA0MCkuXG4gICAgLy8gTm90ZSB0aGF0IHRoaXMgaW1wbGllc1xuICAgIC8vICBzdGF0ZS5saW5lV2lkdGgg4omkIDQwICsgc3RhdGUuaW5kZW50OiB3aWR0aCBpcyBmaXhlZCBhdCB0aGUgbG93ZXIgYm91bmQuXG4gICAgLy8gIHN0YXRlLmxpbmVXaWR0aCA+IDQwICsgc3RhdGUuaW5kZW50OiB3aWR0aCBkZWNyZWFzZXMgdW50aWwgdGhlIGxvd2VyIGJvdW5kLlxuICAgIC8vIFRoaXMgYmVoYXZlcyBiZXR0ZXIgdGhhbiBhIGNvbnN0YW50IG1pbmltdW0gd2lkdGggd2hpY2ggZGlzYWxsb3dzIG5hcnJvd2VyIG9wdGlvbnMsXG4gICAgLy8gb3IgYW4gaW5kZW50IHRocmVzaG9sZCB3aGljaCBjYXVzZXMgdGhlIHdpZHRoIHRvIHN1ZGRlbmx5IGluY3JlYXNlLlxuICAgIHZhciBsaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggPT09IC0xXG4gICAgICA/IC0xIDogTWF0aC5tYXgoTWF0aC5taW4oc3RhdGUubGluZVdpZHRoLCA0MCksIHN0YXRlLmxpbmVXaWR0aCAtIGluZGVudCk7XG5cbiAgICAvLyBXaXRob3V0IGtub3dpbmcgaWYga2V5cyBhcmUgaW1wbGljaXQvZXhwbGljaXQsIGFzc3VtZSBpbXBsaWNpdCBmb3Igc2FmZXR5LlxuICAgIHZhciBzaW5nbGVMaW5lT25seSA9IGlza2V5XG4gICAgICAvLyBObyBibG9jayBzdHlsZXMgaW4gZmxvdyBtb2RlLlxuICAgICAgfHwgKHN0YXRlLmZsb3dMZXZlbCA+IC0xICYmIGxldmVsID49IHN0YXRlLmZsb3dMZXZlbCk7XG4gICAgZnVuY3Rpb24gdGVzdEFtYmlndWl0eShzdHJpbmcpIHtcbiAgICAgIHJldHVybiB0ZXN0SW1wbGljaXRSZXNvbHZpbmcoc3RhdGUsIHN0cmluZyk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChjaG9vc2VTY2FsYXJTdHlsZShzdHJpbmcsIHNpbmdsZUxpbmVPbmx5LCBzdGF0ZS5pbmRlbnQsIGxpbmVXaWR0aCwgdGVzdEFtYmlndWl0eSkpIHtcbiAgICAgIGNhc2UgU1RZTEVfUExBSU46XG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICBjYXNlIFNUWUxFX1NJTkdMRTpcbiAgICAgICAgcmV0dXJuIFwiJ1wiICsgc3RyaW5nLnJlcGxhY2UoLycvZywgXCInJ1wiKSArIFwiJ1wiO1xuICAgICAgY2FzZSBTVFlMRV9MSVRFUkFMOlxuICAgICAgICByZXR1cm4gJ3wnICsgYmxvY2tIZWFkZXIoc3RyaW5nLCBzdGF0ZS5pbmRlbnQpXG4gICAgICAgICAgKyBkcm9wRW5kaW5nTmV3bGluZShpbmRlbnRTdHJpbmcoc3RyaW5nLCBpbmRlbnQpKTtcbiAgICAgIGNhc2UgU1RZTEVfRk9MREVEOlxuICAgICAgICByZXR1cm4gJz4nICsgYmxvY2tIZWFkZXIoc3RyaW5nLCBzdGF0ZS5pbmRlbnQpXG4gICAgICAgICAgKyBkcm9wRW5kaW5nTmV3bGluZShpbmRlbnRTdHJpbmcoZm9sZFN0cmluZyhzdHJpbmcsIGxpbmVXaWR0aCksIGluZGVudCkpO1xuICAgICAgY2FzZSBTVFlMRV9ET1VCTEU6XG4gICAgICAgIHJldHVybiAnXCInICsgZXNjYXBlU3RyaW5nKHN0cmluZywgbGluZVdpZHRoKSArICdcIic7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignaW1wb3NzaWJsZSBlcnJvcjogaW52YWxpZCBzY2FsYXIgc3R5bGUnKTtcbiAgICB9XG4gIH0oKSk7XG59XG5cbi8vIFByZS1jb25kaXRpb25zOiBzdHJpbmcgaXMgdmFsaWQgZm9yIGEgYmxvY2sgc2NhbGFyLCAxIDw9IGluZGVudFBlckxldmVsIDw9IDkuXG5mdW5jdGlvbiBibG9ja0hlYWRlcihzdHJpbmcsIGluZGVudFBlckxldmVsKSB7XG4gIHZhciBpbmRlbnRJbmRpY2F0b3IgPSAoc3RyaW5nWzBdID09PSAnICcpID8gU3RyaW5nKGluZGVudFBlckxldmVsKSA6ICcnO1xuXG4gIC8vIG5vdGUgdGhlIHNwZWNpYWwgY2FzZTogdGhlIHN0cmluZyAnXFxuJyBjb3VudHMgYXMgYSBcInRyYWlsaW5nXCIgZW1wdHkgbGluZS5cbiAgdmFyIGNsaXAgPSAgICAgICAgICBzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDFdID09PSAnXFxuJztcbiAgdmFyIGtlZXAgPSBjbGlwICYmIChzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDJdID09PSAnXFxuJyB8fCBzdHJpbmcgPT09ICdcXG4nKTtcbiAgdmFyIGNob21wID0ga2VlcCA/ICcrJyA6IChjbGlwID8gJycgOiAnLScpO1xuXG4gIHJldHVybiBpbmRlbnRJbmRpY2F0b3IgKyBjaG9tcCArICdcXG4nO1xufVxuXG4vLyAoU2VlIHRoZSBub3RlIGZvciB3cml0ZVNjYWxhci4pXG5mdW5jdGlvbiBkcm9wRW5kaW5nTmV3bGluZShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMV0gPT09ICdcXG4nID8gc3RyaW5nLnNsaWNlKDAsIC0xKSA6IHN0cmluZztcbn1cblxuLy8gTm90ZTogYSBsb25nIGxpbmUgd2l0aG91dCBhIHN1aXRhYmxlIGJyZWFrIHBvaW50IHdpbGwgZXhjZWVkIHRoZSB3aWR0aCBsaW1pdC5cbi8vIFByZS1jb25kaXRpb25zOiBldmVyeSBjaGFyIGluIHN0ciBpc1ByaW50YWJsZSwgc3RyLmxlbmd0aCA+IDAsIHdpZHRoID4gMC5cbmZ1bmN0aW9uIGZvbGRTdHJpbmcoc3RyaW5nLCB3aWR0aCkge1xuICAvLyBJbiBmb2xkZWQgc3R5bGUsICRrJCBjb25zZWN1dGl2ZSBuZXdsaW5lcyBvdXRwdXQgYXMgJGsrMSQgbmV3bGluZXPigJRcbiAgLy8gdW5sZXNzIHRoZXkncmUgYmVmb3JlIG9yIGFmdGVyIGEgbW9yZS1pbmRlbnRlZCBsaW5lLCBvciBhdCB0aGUgdmVyeVxuICAvLyBiZWdpbm5pbmcgb3IgZW5kLCBpbiB3aGljaCBjYXNlICRrJCBtYXBzIHRvICRrJC5cbiAgLy8gVGhlcmVmb3JlLCBwYXJzZSBlYWNoIGNodW5rIGFzIG5ld2xpbmUocykgZm9sbG93ZWQgYnkgYSBjb250ZW50IGxpbmUuXG4gIHZhciBsaW5lUmUgPSAvKFxcbispKFteXFxuXSopL2c7XG5cbiAgLy8gZmlyc3QgbGluZSAocG9zc2libHkgYW4gZW1wdHkgbGluZSlcbiAgdmFyIHJlc3VsdCA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5leHRMRiA9IHN0cmluZy5pbmRleE9mKCdcXG4nKTtcbiAgICBuZXh0TEYgPSBuZXh0TEYgIT09IC0xID8gbmV4dExGIDogc3RyaW5nLmxlbmd0aDtcbiAgICBsaW5lUmUubGFzdEluZGV4ID0gbmV4dExGO1xuICAgIHJldHVybiBmb2xkTGluZShzdHJpbmcuc2xpY2UoMCwgbmV4dExGKSwgd2lkdGgpO1xuICB9KCkpO1xuICAvLyBJZiB3ZSBoYXZlbid0IHJlYWNoZWQgdGhlIGZpcnN0IGNvbnRlbnQgbGluZSB5ZXQsIGRvbid0IGFkZCBhbiBleHRyYSBcXG4uXG4gIHZhciBwcmV2TW9yZUluZGVudGVkID0gc3RyaW5nWzBdID09PSAnXFxuJyB8fCBzdHJpbmdbMF0gPT09ICcgJztcbiAgdmFyIG1vcmVJbmRlbnRlZDtcblxuICAvLyByZXN0IG9mIHRoZSBsaW5lc1xuICB2YXIgbWF0Y2g7XG4gIHdoaWxlICgobWF0Y2ggPSBsaW5lUmUuZXhlYyhzdHJpbmcpKSkge1xuICAgIHZhciBwcmVmaXggPSBtYXRjaFsxXSwgbGluZSA9IG1hdGNoWzJdO1xuICAgIG1vcmVJbmRlbnRlZCA9IChsaW5lWzBdID09PSAnICcpO1xuICAgIHJlc3VsdCArPSBwcmVmaXhcbiAgICAgICsgKCFwcmV2TW9yZUluZGVudGVkICYmICFtb3JlSW5kZW50ZWQgJiYgbGluZSAhPT0gJydcbiAgICAgICAgPyAnXFxuJyA6ICcnKVxuICAgICAgKyBmb2xkTGluZShsaW5lLCB3aWR0aCk7XG4gICAgcHJldk1vcmVJbmRlbnRlZCA9IG1vcmVJbmRlbnRlZDtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIEdyZWVkeSBsaW5lIGJyZWFraW5nLlxuLy8gUGlja3MgdGhlIGxvbmdlc3QgbGluZSB1bmRlciB0aGUgbGltaXQgZWFjaCB0aW1lLFxuLy8gb3RoZXJ3aXNlIHNldHRsZXMgZm9yIHRoZSBzaG9ydGVzdCBsaW5lIG92ZXIgdGhlIGxpbWl0LlxuLy8gTkIuIE1vcmUtaW5kZW50ZWQgbGluZXMgKmNhbm5vdCogYmUgZm9sZGVkLCBhcyB0aGF0IHdvdWxkIGFkZCBhbiBleHRyYSBcXG4uXG5mdW5jdGlvbiBmb2xkTGluZShsaW5lLCB3aWR0aCkge1xuICBpZiAobGluZSA9PT0gJycgfHwgbGluZVswXSA9PT0gJyAnKSByZXR1cm4gbGluZTtcblxuICAvLyBTaW5jZSBhIG1vcmUtaW5kZW50ZWQgbGluZSBhZGRzIGEgXFxuLCBicmVha3MgY2FuJ3QgYmUgZm9sbG93ZWQgYnkgYSBzcGFjZS5cbiAgdmFyIGJyZWFrUmUgPSAvIFteIF0vZzsgLy8gbm90ZTogdGhlIG1hdGNoIGluZGV4IHdpbGwgYWx3YXlzIGJlIDw9IGxlbmd0aC0yLlxuICB2YXIgbWF0Y2g7XG4gIC8vIHN0YXJ0IGlzIGFuIGluY2x1c2l2ZSBpbmRleC4gZW5kLCBjdXJyLCBhbmQgbmV4dCBhcmUgZXhjbHVzaXZlLlxuICB2YXIgc3RhcnQgPSAwLCBlbmQsIGN1cnIgPSAwLCBuZXh0ID0gMDtcbiAgdmFyIHJlc3VsdCA9ICcnO1xuXG4gIC8vIEludmFyaWFudHM6IDAgPD0gc3RhcnQgPD0gbGVuZ3RoLTEuXG4gIC8vICAgMCA8PSBjdXJyIDw9IG5leHQgPD0gbWF4KDAsIGxlbmd0aC0yKS4gY3VyciAtIHN0YXJ0IDw9IHdpZHRoLlxuICAvLyBJbnNpZGUgdGhlIGxvb3A6XG4gIC8vICAgQSBtYXRjaCBpbXBsaWVzIGxlbmd0aCA+PSAyLCBzbyBjdXJyIGFuZCBuZXh0IGFyZSA8PSBsZW5ndGgtMi5cbiAgd2hpbGUgKChtYXRjaCA9IGJyZWFrUmUuZXhlYyhsaW5lKSkpIHtcbiAgICBuZXh0ID0gbWF0Y2guaW5kZXg7XG4gICAgLy8gbWFpbnRhaW4gaW52YXJpYW50OiBjdXJyIC0gc3RhcnQgPD0gd2lkdGhcbiAgICBpZiAobmV4dCAtIHN0YXJ0ID4gd2lkdGgpIHtcbiAgICAgIGVuZCA9IChjdXJyID4gc3RhcnQpID8gY3VyciA6IG5leHQ7IC8vIGRlcml2ZSBlbmQgPD0gbGVuZ3RoLTJcbiAgICAgIHJlc3VsdCArPSAnXFxuJyArIGxpbmUuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgICAvLyBza2lwIHRoZSBzcGFjZSB0aGF0IHdhcyBvdXRwdXQgYXMgXFxuXG4gICAgICBzdGFydCA9IGVuZCArIDE7ICAgICAgICAgICAgICAgICAgICAvLyBkZXJpdmUgc3RhcnQgPD0gbGVuZ3RoLTFcbiAgICB9XG4gICAgY3VyciA9IG5leHQ7XG4gIH1cblxuICAvLyBCeSB0aGUgaW52YXJpYW50cywgc3RhcnQgPD0gbGVuZ3RoLTEsIHNvIHRoZXJlIGlzIHNvbWV0aGluZyBsZWZ0IG92ZXIuXG4gIC8vIEl0IGlzIGVpdGhlciB0aGUgd2hvbGUgc3RyaW5nIG9yIGEgcGFydCBzdGFydGluZyBmcm9tIG5vbi13aGl0ZXNwYWNlLlxuICByZXN1bHQgKz0gJ1xcbic7XG4gIC8vIEluc2VydCBhIGJyZWFrIGlmIHRoZSByZW1haW5kZXIgaXMgdG9vIGxvbmcgYW5kIHRoZXJlIGlzIGEgYnJlYWsgYXZhaWxhYmxlLlxuICBpZiAobGluZS5sZW5ndGggLSBzdGFydCA+IHdpZHRoICYmIGN1cnIgPiBzdGFydCkge1xuICAgIHJlc3VsdCArPSBsaW5lLnNsaWNlKHN0YXJ0LCBjdXJyKSArICdcXG4nICsgbGluZS5zbGljZShjdXJyICsgMSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ICs9IGxpbmUuc2xpY2Uoc3RhcnQpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdC5zbGljZSgxKTsgLy8gZHJvcCBleHRyYSBcXG4gam9pbmVyXG59XG5cbi8vIEVzY2FwZXMgYSBkb3VibGUtcXVvdGVkIHN0cmluZy5cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZyhzdHJpbmcpIHtcbiAgdmFyIHJlc3VsdCA9ICcnO1xuICB2YXIgY2hhcjtcbiAgdmFyIGVzY2FwZVNlcTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgIGNoYXIgPSBzdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICBlc2NhcGVTZXEgPSBFU0NBUEVfU0VRVUVOQ0VTW2NoYXJdO1xuICAgIHJlc3VsdCArPSAhZXNjYXBlU2VxICYmIGlzUHJpbnRhYmxlKGNoYXIpXG4gICAgICA/IHN0cmluZ1tpXVxuICAgICAgOiBlc2NhcGVTZXEgfHwgZW5jb2RlSGV4KGNoYXIpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG93U2VxdWVuY2Uoc3RhdGUsIGxldmVsLCBvYmplY3QpIHtcbiAgdmFyIF9yZXN1bHQgPSAnJyxcbiAgICAgIF90YWcgICAgPSBzdGF0ZS50YWcsXG4gICAgICBpbmRleCxcbiAgICAgIGxlbmd0aDtcblxuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAvLyBXcml0ZSBvbmx5IHZhbGlkIGVsZW1lbnRzLlxuICAgIGlmICh3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCBvYmplY3RbaW5kZXhdLCBmYWxzZSwgZmFsc2UpKSB7XG4gICAgICBpZiAoaW5kZXggIT09IDApIF9yZXN1bHQgKz0gJywgJztcbiAgICAgIF9yZXN1bHQgKz0gc3RhdGUuZHVtcDtcbiAgICB9XG4gIH1cblxuICBzdGF0ZS50YWcgPSBfdGFnO1xuICBzdGF0ZS5kdW1wID0gJ1snICsgX3Jlc3VsdCArICddJztcbn1cblxuZnVuY3Rpb24gd3JpdGVCbG9ja1NlcXVlbmNlKHN0YXRlLCBsZXZlbCwgb2JqZWN0LCBjb21wYWN0KSB7XG4gIHZhciBfcmVzdWx0ID0gJycsXG4gICAgICBfdGFnICAgID0gc3RhdGUudGFnLFxuICAgICAgaW5kZXgsXG4gICAgICBsZW5ndGg7XG5cbiAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgLy8gV3JpdGUgb25seSB2YWxpZCBlbGVtZW50cy5cbiAgICBpZiAod3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIG9iamVjdFtpbmRleF0sIHRydWUsIHRydWUpKSB7XG4gICAgICBpZiAoIWNvbXBhY3QgfHwgaW5kZXggIT09IDApIHtcbiAgICAgICAgX3Jlc3VsdCArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbCk7XG4gICAgICB9XG4gICAgICBfcmVzdWx0ICs9ICctICcgKyBzdGF0ZS5kdW1wO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRlLnRhZyA9IF90YWc7XG4gIHN0YXRlLmR1bXAgPSBfcmVzdWx0IHx8ICdbXSc7IC8vIEVtcHR5IHNlcXVlbmNlIGlmIG5vIHZhbGlkIHZhbHVlcy5cbn1cblxuZnVuY3Rpb24gd3JpdGVGbG93TWFwcGluZyhzdGF0ZSwgbGV2ZWwsIG9iamVjdCkge1xuICB2YXIgX3Jlc3VsdCAgICAgICA9ICcnLFxuICAgICAgX3RhZyAgICAgICAgICA9IHN0YXRlLnRhZyxcbiAgICAgIG9iamVjdEtleUxpc3QgPSBPYmplY3Qua2V5cyhvYmplY3QpLFxuICAgICAgaW5kZXgsXG4gICAgICBsZW5ndGgsXG4gICAgICBvYmplY3RLZXksXG4gICAgICBvYmplY3RWYWx1ZSxcbiAgICAgIHBhaXJCdWZmZXI7XG5cbiAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdEtleUxpc3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIHBhaXJCdWZmZXIgPSAnJztcblxuICAgIGlmIChpbmRleCAhPT0gMCkgcGFpckJ1ZmZlciArPSAnLCAnO1xuXG4gICAgb2JqZWN0S2V5ID0gb2JqZWN0S2V5TGlzdFtpbmRleF07XG4gICAgb2JqZWN0VmFsdWUgPSBvYmplY3Rbb2JqZWN0S2V5XTtcblxuICAgIGlmICghd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgb2JqZWN0S2V5LCBmYWxzZSwgZmFsc2UpKSB7XG4gICAgICBjb250aW51ZTsgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIGtleTtcbiAgICB9XG5cbiAgICBpZiAoc3RhdGUuZHVtcC5sZW5ndGggPiAxMDI0KSBwYWlyQnVmZmVyICs9ICc/ICc7XG5cbiAgICBwYWlyQnVmZmVyICs9IHN0YXRlLmR1bXAgKyAnOiAnO1xuXG4gICAgaWYgKCF3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCBvYmplY3RWYWx1ZSwgZmFsc2UsIGZhbHNlKSkge1xuICAgICAgY29udGludWU7IC8vIFNraXAgdGhpcyBwYWlyIGJlY2F1c2Ugb2YgaW52YWxpZCB2YWx1ZS5cbiAgICB9XG5cbiAgICBwYWlyQnVmZmVyICs9IHN0YXRlLmR1bXA7XG5cbiAgICAvLyBCb3RoIGtleSBhbmQgdmFsdWUgYXJlIHZhbGlkLlxuICAgIF9yZXN1bHQgKz0gcGFpckJ1ZmZlcjtcbiAgfVxuXG4gIHN0YXRlLnRhZyA9IF90YWc7XG4gIHN0YXRlLmR1bXAgPSAneycgKyBfcmVzdWx0ICsgJ30nO1xufVxuXG5mdW5jdGlvbiB3cml0ZUJsb2NrTWFwcGluZyhzdGF0ZSwgbGV2ZWwsIG9iamVjdCwgY29tcGFjdCkge1xuICB2YXIgX3Jlc3VsdCAgICAgICA9ICcnLFxuICAgICAgX3RhZyAgICAgICAgICA9IHN0YXRlLnRhZyxcbiAgICAgIG9iamVjdEtleUxpc3QgPSBPYmplY3Qua2V5cyhvYmplY3QpLFxuICAgICAgaW5kZXgsXG4gICAgICBsZW5ndGgsXG4gICAgICBvYmplY3RLZXksXG4gICAgICBvYmplY3RWYWx1ZSxcbiAgICAgIGV4cGxpY2l0UGFpcixcbiAgICAgIHBhaXJCdWZmZXI7XG5cbiAgLy8gQWxsb3cgc29ydGluZyBrZXlzIHNvIHRoYXQgdGhlIG91dHB1dCBmaWxlIGlzIGRldGVybWluaXN0aWNcbiAgaWYgKHN0YXRlLnNvcnRLZXlzID09PSB0cnVlKSB7XG4gICAgLy8gRGVmYXVsdCBzb3J0aW5nXG4gICAgb2JqZWN0S2V5TGlzdC5zb3J0KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHN0YXRlLnNvcnRLZXlzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gQ3VzdG9tIHNvcnQgZnVuY3Rpb25cbiAgICBvYmplY3RLZXlMaXN0LnNvcnQoc3RhdGUuc29ydEtleXMpO1xuICB9IGVsc2UgaWYgKHN0YXRlLnNvcnRLZXlzKSB7XG4gICAgLy8gU29tZXRoaW5nIGlzIHdyb25nXG4gICAgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oJ3NvcnRLZXlzIG11c3QgYmUgYSBib29sZWFuIG9yIGEgZnVuY3Rpb24nKTtcbiAgfVxuXG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBvYmplY3RLZXlMaXN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBwYWlyQnVmZmVyID0gJyc7XG5cbiAgICBpZiAoIWNvbXBhY3QgfHwgaW5kZXggIT09IDApIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gZ2VuZXJhdGVOZXh0TGluZShzdGF0ZSwgbGV2ZWwpO1xuICAgIH1cblxuICAgIG9iamVjdEtleSA9IG9iamVjdEtleUxpc3RbaW5kZXhdO1xuICAgIG9iamVjdFZhbHVlID0gb2JqZWN0W29iamVjdEtleV07XG5cbiAgICBpZiAoIXdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBvYmplY3RLZXksIHRydWUsIHRydWUsIHRydWUpKSB7XG4gICAgICBjb250aW51ZTsgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIGtleS5cbiAgICB9XG5cbiAgICBleHBsaWNpdFBhaXIgPSAoc3RhdGUudGFnICE9PSBudWxsICYmIHN0YXRlLnRhZyAhPT0gJz8nKSB8fFxuICAgICAgICAgICAgICAgICAgIChzdGF0ZS5kdW1wICYmIHN0YXRlLmR1bXAubGVuZ3RoID4gMTAyNCk7XG5cbiAgICBpZiAoZXhwbGljaXRQYWlyKSB7XG4gICAgICBpZiAoc3RhdGUuZHVtcCAmJiBDSEFSX0xJTkVfRkVFRCA9PT0gc3RhdGUuZHVtcC5jaGFyQ29kZUF0KDApKSB7XG4gICAgICAgIHBhaXJCdWZmZXIgKz0gJz8nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFpckJ1ZmZlciArPSAnPyAnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcDtcblxuICAgIGlmIChleHBsaWNpdFBhaXIpIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gZ2VuZXJhdGVOZXh0TGluZShzdGF0ZSwgbGV2ZWwpO1xuICAgIH1cblxuICAgIGlmICghd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIG9iamVjdFZhbHVlLCB0cnVlLCBleHBsaWNpdFBhaXIpKSB7XG4gICAgICBjb250aW51ZTsgLy8gU2tpcCB0aGlzIHBhaXIgYmVjYXVzZSBvZiBpbnZhbGlkIHZhbHVlLlxuICAgIH1cblxuICAgIGlmIChzdGF0ZS5kdW1wICYmIENIQVJfTElORV9GRUVEID09PSBzdGF0ZS5kdW1wLmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgIHBhaXJCdWZmZXIgKz0gJzonO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYWlyQnVmZmVyICs9ICc6ICc7XG4gICAgfVxuXG4gICAgcGFpckJ1ZmZlciArPSBzdGF0ZS5kdW1wO1xuXG4gICAgLy8gQm90aCBrZXkgYW5kIHZhbHVlIGFyZSB2YWxpZC5cbiAgICBfcmVzdWx0ICs9IHBhaXJCdWZmZXI7XG4gIH1cblxuICBzdGF0ZS50YWcgPSBfdGFnO1xuICBzdGF0ZS5kdW1wID0gX3Jlc3VsdCB8fCAne30nOyAvLyBFbXB0eSBtYXBwaW5nIGlmIG5vIHZhbGlkIHBhaXJzLlxufVxuXG5mdW5jdGlvbiBkZXRlY3RUeXBlKHN0YXRlLCBvYmplY3QsIGV4cGxpY2l0KSB7XG4gIHZhciBfcmVzdWx0LCB0eXBlTGlzdCwgaW5kZXgsIGxlbmd0aCwgdHlwZSwgc3R5bGU7XG5cbiAgdHlwZUxpc3QgPSBleHBsaWNpdCA/IHN0YXRlLmV4cGxpY2l0VHlwZXMgOiBzdGF0ZS5pbXBsaWNpdFR5cGVzO1xuXG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSB0eXBlTGlzdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgdHlwZSA9IHR5cGVMaXN0W2luZGV4XTtcblxuICAgIGlmICgodHlwZS5pbnN0YW5jZU9mICB8fCB0eXBlLnByZWRpY2F0ZSkgJiZcbiAgICAgICAgKCF0eXBlLmluc3RhbmNlT2YgfHwgKCh0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JykgJiYgKG9iamVjdCBpbnN0YW5jZW9mIHR5cGUuaW5zdGFuY2VPZikpKSAmJlxuICAgICAgICAoIXR5cGUucHJlZGljYXRlICB8fCB0eXBlLnByZWRpY2F0ZShvYmplY3QpKSkge1xuXG4gICAgICBzdGF0ZS50YWcgPSBleHBsaWNpdCA/IHR5cGUudGFnIDogJz8nO1xuXG4gICAgICBpZiAodHlwZS5yZXByZXNlbnQpIHtcbiAgICAgICAgc3R5bGUgPSBzdGF0ZS5zdHlsZU1hcFt0eXBlLnRhZ10gfHwgdHlwZS5kZWZhdWx0U3R5bGU7XG5cbiAgICAgICAgaWYgKF90b1N0cmluZy5jYWxsKHR5cGUucmVwcmVzZW50KSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJykge1xuICAgICAgICAgIF9yZXN1bHQgPSB0eXBlLnJlcHJlc2VudChvYmplY3QsIHN0eWxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChfaGFzT3duUHJvcGVydHkuY2FsbCh0eXBlLnJlcHJlc2VudCwgc3R5bGUpKSB7XG4gICAgICAgICAgX3Jlc3VsdCA9IHR5cGUucmVwcmVzZW50W3N0eWxlXShvYmplY3QsIHN0eWxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignITwnICsgdHlwZS50YWcgKyAnPiB0YWcgcmVzb2x2ZXIgYWNjZXB0cyBub3QgXCInICsgc3R5bGUgKyAnXCIgc3R5bGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmR1bXAgPSBfcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIFNlcmlhbGl6ZXMgYG9iamVjdGAgYW5kIHdyaXRlcyBpdCB0byBnbG9iYWwgYHJlc3VsdGAuXG4vLyBSZXR1cm5zIHRydWUgb24gc3VjY2Vzcywgb3IgZmFsc2Ugb24gaW52YWxpZCBvYmplY3QuXG4vL1xuZnVuY3Rpb24gd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgb2JqZWN0LCBibG9jaywgY29tcGFjdCwgaXNrZXkpIHtcbiAgc3RhdGUudGFnID0gbnVsbDtcbiAgc3RhdGUuZHVtcCA9IG9iamVjdDtcblxuICBpZiAoIWRldGVjdFR5cGUoc3RhdGUsIG9iamVjdCwgZmFsc2UpKSB7XG4gICAgZGV0ZWN0VHlwZShzdGF0ZSwgb2JqZWN0LCB0cnVlKTtcbiAgfVxuXG4gIHZhciB0eXBlID0gX3RvU3RyaW5nLmNhbGwoc3RhdGUuZHVtcCk7XG5cbiAgaWYgKGJsb2NrKSB7XG4gICAgYmxvY2sgPSAoc3RhdGUuZmxvd0xldmVsIDwgMCB8fCBzdGF0ZS5mbG93TGV2ZWwgPiBsZXZlbCk7XG4gIH1cblxuICB2YXIgb2JqZWN0T3JBcnJheSA9IHR5cGUgPT09ICdbb2JqZWN0IE9iamVjdF0nIHx8IHR5cGUgPT09ICdbb2JqZWN0IEFycmF5XScsXG4gICAgICBkdXBsaWNhdGVJbmRleCxcbiAgICAgIGR1cGxpY2F0ZTtcblxuICBpZiAob2JqZWN0T3JBcnJheSkge1xuICAgIGR1cGxpY2F0ZUluZGV4ID0gc3RhdGUuZHVwbGljYXRlcy5pbmRleE9mKG9iamVjdCk7XG4gICAgZHVwbGljYXRlID0gZHVwbGljYXRlSW5kZXggIT09IC0xO1xuICB9XG5cbiAgaWYgKChzdGF0ZS50YWcgIT09IG51bGwgJiYgc3RhdGUudGFnICE9PSAnPycpIHx8IGR1cGxpY2F0ZSB8fCAoc3RhdGUuaW5kZW50ICE9PSAyICYmIGxldmVsID4gMCkpIHtcbiAgICBjb21wYWN0ID0gZmFsc2U7XG4gIH1cblxuICBpZiAoZHVwbGljYXRlICYmIHN0YXRlLnVzZWREdXBsaWNhdGVzW2R1cGxpY2F0ZUluZGV4XSkge1xuICAgIHN0YXRlLmR1bXAgPSAnKnJlZl8nICsgZHVwbGljYXRlSW5kZXg7XG4gIH0gZWxzZSB7XG4gICAgaWYgKG9iamVjdE9yQXJyYXkgJiYgZHVwbGljYXRlICYmICFzdGF0ZS51c2VkRHVwbGljYXRlc1tkdXBsaWNhdGVJbmRleF0pIHtcbiAgICAgIHN0YXRlLnVzZWREdXBsaWNhdGVzW2R1cGxpY2F0ZUluZGV4XSA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0eXBlID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgaWYgKGJsb2NrICYmIChPYmplY3Qua2V5cyhzdGF0ZS5kdW1wKS5sZW5ndGggIT09IDApKSB7XG4gICAgICAgIHdyaXRlQmxvY2tNYXBwaW5nKHN0YXRlLCBsZXZlbCwgc3RhdGUuZHVtcCwgY29tcGFjdCk7XG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gJyZyZWZfJyArIGR1cGxpY2F0ZUluZGV4ICsgc3RhdGUuZHVtcDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd3JpdGVGbG93TWFwcGluZyhzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXApO1xuICAgICAgICBpZiAoZHVwbGljYXRlKSB7XG4gICAgICAgICAgc3RhdGUuZHVtcCA9ICcmcmVmXycgKyBkdXBsaWNhdGVJbmRleCArICcgJyArIHN0YXRlLmR1bXA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIGlmIChibG9jayAmJiAoc3RhdGUuZHVtcC5sZW5ndGggIT09IDApKSB7XG4gICAgICAgIHdyaXRlQmxvY2tTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXAsIGNvbXBhY3QpO1xuICAgICAgICBpZiAoZHVwbGljYXRlKSB7XG4gICAgICAgICAgc3RhdGUuZHVtcCA9ICcmcmVmXycgKyBkdXBsaWNhdGVJbmRleCArIHN0YXRlLmR1bXA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdyaXRlRmxvd1NlcXVlbmNlKHN0YXRlLCBsZXZlbCwgc3RhdGUuZHVtcCk7XG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gJyZyZWZfJyArIGR1cGxpY2F0ZUluZGV4ICsgJyAnICsgc3RhdGUuZHVtcDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ1tvYmplY3QgU3RyaW5nXScpIHtcbiAgICAgIGlmIChzdGF0ZS50YWcgIT09ICc/Jykge1xuICAgICAgICB3cml0ZVNjYWxhcihzdGF0ZSwgc3RhdGUuZHVtcCwgbGV2ZWwsIGlza2V5KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN0YXRlLnNraXBJbnZhbGlkKSByZXR1cm4gZmFsc2U7XG4gICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbigndW5hY2NlcHRhYmxlIGtpbmQgb2YgYW4gb2JqZWN0IHRvIGR1bXAgJyArIHR5cGUpO1xuICAgIH1cblxuICAgIGlmIChzdGF0ZS50YWcgIT09IG51bGwgJiYgc3RhdGUudGFnICE9PSAnPycpIHtcbiAgICAgIHN0YXRlLmR1bXAgPSAnITwnICsgc3RhdGUudGFnICsgJz4gJyArIHN0YXRlLmR1bXA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGdldER1cGxpY2F0ZVJlZmVyZW5jZXMob2JqZWN0LCBzdGF0ZSkge1xuICB2YXIgb2JqZWN0cyA9IFtdLFxuICAgICAgZHVwbGljYXRlc0luZGV4ZXMgPSBbXSxcbiAgICAgIGluZGV4LFxuICAgICAgbGVuZ3RoO1xuXG4gIGluc3BlY3ROb2RlKG9iamVjdCwgb2JqZWN0cywgZHVwbGljYXRlc0luZGV4ZXMpO1xuXG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBkdXBsaWNhdGVzSW5kZXhlcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgc3RhdGUuZHVwbGljYXRlcy5wdXNoKG9iamVjdHNbZHVwbGljYXRlc0luZGV4ZXNbaW5kZXhdXSk7XG4gIH1cbiAgc3RhdGUudXNlZER1cGxpY2F0ZXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gaW5zcGVjdE5vZGUob2JqZWN0LCBvYmplY3RzLCBkdXBsaWNhdGVzSW5kZXhlcykge1xuICB2YXIgb2JqZWN0S2V5TGlzdCxcbiAgICAgIGluZGV4LFxuICAgICAgbGVuZ3RoO1xuXG4gIGlmIChvYmplY3QgIT09IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcpIHtcbiAgICBpbmRleCA9IG9iamVjdHMuaW5kZXhPZihvYmplY3QpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGlmIChkdXBsaWNhdGVzSW5kZXhlcy5pbmRleE9mKGluZGV4KSA9PT0gLTEpIHtcbiAgICAgICAgZHVwbGljYXRlc0luZGV4ZXMucHVzaChpbmRleCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iamVjdHMucHVzaChvYmplY3QpO1xuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmplY3QpKSB7XG4gICAgICAgIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBvYmplY3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgICAgICAgIGluc3BlY3ROb2RlKG9iamVjdFtpbmRleF0sIG9iamVjdHMsIGR1cGxpY2F0ZXNJbmRleGVzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb2JqZWN0S2V5TGlzdCA9IE9iamVjdC5rZXlzKG9iamVjdCk7XG5cbiAgICAgICAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdEtleUxpc3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgICAgICAgIGluc3BlY3ROb2RlKG9iamVjdFtvYmplY3RLZXlMaXN0W2luZGV4XV0sIG9iamVjdHMsIGR1cGxpY2F0ZXNJbmRleGVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkdW1wKGlucHV0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBzdGF0ZSA9IG5ldyBTdGF0ZShvcHRpb25zKTtcblxuICBpZiAoIXN0YXRlLm5vUmVmcykgZ2V0RHVwbGljYXRlUmVmZXJlbmNlcyhpbnB1dCwgc3RhdGUpO1xuXG4gIGlmICh3cml0ZU5vZGUoc3RhdGUsIDAsIGlucHV0LCB0cnVlLCB0cnVlKSkgcmV0dXJuIHN0YXRlLmR1bXAgKyAnXFxuJztcblxuICByZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIHNhZmVEdW1wKGlucHV0LCBvcHRpb25zKSB7XG4gIHJldHVybiBkdW1wKGlucHV0LCBjb21tb24uZXh0ZW5kKHsgc2NoZW1hOiBERUZBVUxUX1NBRkVfU0NIRU1BIH0sIG9wdGlvbnMpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuZHVtcCAgICAgPSBkdW1wO1xubW9kdWxlLmV4cG9ydHMuc2FmZUR1bXAgPSBzYWZlRHVtcDtcbiIsIi8vIFlBTUwgZXJyb3IgY2xhc3MuIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODQ1ODk4NFxuLy9cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gWUFNTEV4Y2VwdGlvbihyZWFzb24sIG1hcmspIHtcbiAgLy8gU3VwZXIgY29uc3RydWN0b3JcbiAgRXJyb3IuY2FsbCh0aGlzKTtcblxuICAvLyBJbmNsdWRlIHN0YWNrIHRyYWNlIGluIGVycm9yIG9iamVjdFxuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICAvLyBDaHJvbWUgYW5kIE5vZGVKU1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHRoaXMuY29uc3RydWN0b3IpO1xuICB9IGVsc2Uge1xuICAgIC8vIEZGLCBJRSAxMCsgYW5kIFNhZmFyaSA2Ky4gRmFsbGJhY2sgZm9yIG90aGVyc1xuICAgIHRoaXMuc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrIHx8ICcnO1xuICB9XG5cbiAgdGhpcy5uYW1lID0gJ1lBTUxFeGNlcHRpb24nO1xuICB0aGlzLnJlYXNvbiA9IHJlYXNvbjtcbiAgdGhpcy5tYXJrID0gbWFyaztcbiAgdGhpcy5tZXNzYWdlID0gKHRoaXMucmVhc29uIHx8ICcodW5rbm93biByZWFzb24pJykgKyAodGhpcy5tYXJrID8gJyAnICsgdGhpcy5tYXJrLnRvU3RyaW5nKCkgOiAnJyk7XG59XG5cblxuLy8gSW5oZXJpdCBmcm9tIEVycm9yXG5ZQU1MRXhjZXB0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbllBTUxFeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gWUFNTEV4Y2VwdGlvbjtcblxuXG5ZQU1MRXhjZXB0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKGNvbXBhY3QpIHtcbiAgdmFyIHJlc3VsdCA9IHRoaXMubmFtZSArICc6ICc7XG5cbiAgcmVzdWx0ICs9IHRoaXMucmVhc29uIHx8ICcodW5rbm93biByZWFzb24pJztcblxuICBpZiAoIWNvbXBhY3QgJiYgdGhpcy5tYXJrKSB7XG4gICAgcmVzdWx0ICs9ICcgJyArIHRoaXMubWFyay50b1N0cmluZygpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBZQU1MRXhjZXB0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKmVzbGludC1kaXNhYmxlIG1heC1sZW4sbm8tdXNlLWJlZm9yZS1kZWZpbmUqL1xuXG52YXIgY29tbW9uICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vY29tbW9uJyk7XG52YXIgWUFNTEV4Y2VwdGlvbiAgICAgICA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJyk7XG52YXIgTWFyayAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vbWFyaycpO1xudmFyIERFRkFVTFRfU0FGRV9TQ0hFTUEgPSByZXF1aXJlKCcuL3NjaGVtYS9kZWZhdWx0X3NhZmUnKTtcbnZhciBERUZBVUxUX0ZVTExfU0NIRU1BID0gcmVxdWlyZSgnLi9zY2hlbWEvZGVmYXVsdF9mdWxsJyk7XG5cblxudmFyIF9oYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cblxudmFyIENPTlRFWFRfRkxPV19JTiAgID0gMTtcbnZhciBDT05URVhUX0ZMT1dfT1VUICA9IDI7XG52YXIgQ09OVEVYVF9CTE9DS19JTiAgPSAzO1xudmFyIENPTlRFWFRfQkxPQ0tfT1VUID0gNDtcblxuXG52YXIgQ0hPTVBJTkdfQ0xJUCAgPSAxO1xudmFyIENIT01QSU5HX1NUUklQID0gMjtcbnZhciBDSE9NUElOR19LRUVQICA9IDM7XG5cblxudmFyIFBBVFRFUk5fTk9OX1BSSU5UQUJMRSAgICAgICAgID0gL1tcXHgwMC1cXHgwOFxceDBCXFx4MENcXHgwRS1cXHgxRlxceDdGLVxceDg0XFx4ODYtXFx4OUZcXHVGRkZFXFx1RkZGRl18W1xcdUQ4MDAtXFx1REJGRl0oPyFbXFx1REMwMC1cXHVERkZGXSl8KD86W15cXHVEODAwLVxcdURCRkZdfF4pW1xcdURDMDAtXFx1REZGRl0vO1xudmFyIFBBVFRFUk5fTk9OX0FTQ0lJX0xJTkVfQlJFQUtTID0gL1tcXHg4NVxcdTIwMjhcXHUyMDI5XS87XG52YXIgUEFUVEVSTl9GTE9XX0lORElDQVRPUlMgICAgICAgPSAvWyxcXFtcXF1cXHtcXH1dLztcbnZhciBQQVRURVJOX1RBR19IQU5ETEUgICAgICAgICAgICA9IC9eKD86IXwhIXwhW2EtelxcLV0rISkkL2k7XG52YXIgUEFUVEVSTl9UQUdfVVJJICAgICAgICAgICAgICAgPSAvXig/OiF8W14sXFxbXFxdXFx7XFx9XSkoPzolWzAtOWEtZl17Mn18WzAtOWEtelxcLSM7XFwvXFw/OkAmPVxcK1xcJCxfXFwuIX5cXConXFwoXFwpXFxbXFxdXSkqJC9pO1xuXG5cbmZ1bmN0aW9uIGlzX0VPTChjKSB7XG4gIHJldHVybiAoYyA9PT0gMHgwQS8qIExGICovKSB8fCAoYyA9PT0gMHgwRC8qIENSICovKTtcbn1cblxuZnVuY3Rpb24gaXNfV0hJVEVfU1BBQ0UoYykge1xuICByZXR1cm4gKGMgPT09IDB4MDkvKiBUYWIgKi8pIHx8IChjID09PSAweDIwLyogU3BhY2UgKi8pO1xufVxuXG5mdW5jdGlvbiBpc19XU19PUl9FT0woYykge1xuICByZXR1cm4gKGMgPT09IDB4MDkvKiBUYWIgKi8pIHx8XG4gICAgICAgICAoYyA9PT0gMHgyMC8qIFNwYWNlICovKSB8fFxuICAgICAgICAgKGMgPT09IDB4MEEvKiBMRiAqLykgfHxcbiAgICAgICAgIChjID09PSAweDBELyogQ1IgKi8pO1xufVxuXG5mdW5jdGlvbiBpc19GTE9XX0lORElDQVRPUihjKSB7XG4gIHJldHVybiBjID09PSAweDJDLyogLCAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg1Qi8qIFsgKi8gfHxcbiAgICAgICAgIGMgPT09IDB4NUQvKiBdICovIHx8XG4gICAgICAgICBjID09PSAweDdCLyogeyAqLyB8fFxuICAgICAgICAgYyA9PT0gMHg3RC8qIH0gKi87XG59XG5cbmZ1bmN0aW9uIGZyb21IZXhDb2RlKGMpIHtcbiAgdmFyIGxjO1xuXG4gIGlmICgoMHgzMC8qIDAgKi8gPD0gYykgJiYgKGMgPD0gMHgzOS8qIDkgKi8pKSB7XG4gICAgcmV0dXJuIGMgLSAweDMwO1xuICB9XG5cbiAgLyplc2xpbnQtZGlzYWJsZSBuby1iaXR3aXNlKi9cbiAgbGMgPSBjIHwgMHgyMDtcblxuICBpZiAoKDB4NjEvKiBhICovIDw9IGxjKSAmJiAobGMgPD0gMHg2Ni8qIGYgKi8pKSB7XG4gICAgcmV0dXJuIGxjIC0gMHg2MSArIDEwO1xuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVkSGV4TGVuKGMpIHtcbiAgaWYgKGMgPT09IDB4NzgvKiB4ICovKSB7IHJldHVybiAyOyB9XG4gIGlmIChjID09PSAweDc1LyogdSAqLykgeyByZXR1cm4gNDsgfVxuICBpZiAoYyA9PT0gMHg1NS8qIFUgKi8pIHsgcmV0dXJuIDg7IH1cbiAgcmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIGZyb21EZWNpbWFsQ29kZShjKSB7XG4gIGlmICgoMHgzMC8qIDAgKi8gPD0gYykgJiYgKGMgPD0gMHgzOS8qIDkgKi8pKSB7XG4gICAgcmV0dXJuIGMgLSAweDMwO1xuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBzaW1wbGVFc2NhcGVTZXF1ZW5jZShjKSB7XG4gIHJldHVybiAoYyA9PT0gMHgzMC8qIDAgKi8pID8gJ1xceDAwJyA6XG4gICAgICAgIChjID09PSAweDYxLyogYSAqLykgPyAnXFx4MDcnIDpcbiAgICAgICAgKGMgPT09IDB4NjIvKiBiICovKSA/ICdcXHgwOCcgOlxuICAgICAgICAoYyA9PT0gMHg3NC8qIHQgKi8pID8gJ1xceDA5JyA6XG4gICAgICAgIChjID09PSAweDA5LyogVGFiICovKSA/ICdcXHgwOScgOlxuICAgICAgICAoYyA9PT0gMHg2RS8qIG4gKi8pID8gJ1xceDBBJyA6XG4gICAgICAgIChjID09PSAweDc2LyogdiAqLykgPyAnXFx4MEInIDpcbiAgICAgICAgKGMgPT09IDB4NjYvKiBmICovKSA/ICdcXHgwQycgOlxuICAgICAgICAoYyA9PT0gMHg3Mi8qIHIgKi8pID8gJ1xceDBEJyA6XG4gICAgICAgIChjID09PSAweDY1LyogZSAqLykgPyAnXFx4MUInIDpcbiAgICAgICAgKGMgPT09IDB4MjAvKiBTcGFjZSAqLykgPyAnICcgOlxuICAgICAgICAoYyA9PT0gMHgyMi8qIFwiICovKSA/ICdcXHgyMicgOlxuICAgICAgICAoYyA9PT0gMHgyRi8qIC8gKi8pID8gJy8nIDpcbiAgICAgICAgKGMgPT09IDB4NUMvKiBcXCAqLykgPyAnXFx4NUMnIDpcbiAgICAgICAgKGMgPT09IDB4NEUvKiBOICovKSA/ICdcXHg4NScgOlxuICAgICAgICAoYyA9PT0gMHg1Ri8qIF8gKi8pID8gJ1xceEEwJyA6XG4gICAgICAgIChjID09PSAweDRDLyogTCAqLykgPyAnXFx1MjAyOCcgOlxuICAgICAgICAoYyA9PT0gMHg1MC8qIFAgKi8pID8gJ1xcdTIwMjknIDogJyc7XG59XG5cbmZ1bmN0aW9uIGNoYXJGcm9tQ29kZXBvaW50KGMpIHtcbiAgaWYgKGMgPD0gMHhGRkZGKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gIH1cbiAgLy8gRW5jb2RlIFVURi0xNiBzdXJyb2dhdGUgcGFpclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9VVEYtMTYjQ29kZV9wb2ludHNfVS4yQjAxMDAwMF90b19VLjJCMTBGRkZGXG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKCgoYyAtIDB4MDEwMDAwKSA+PiAxMCkgKyAweEQ4MDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoYyAtIDB4MDEwMDAwKSAmIDB4MDNGRikgKyAweERDMDApO1xufVxuXG52YXIgc2ltcGxlRXNjYXBlQ2hlY2sgPSBuZXcgQXJyYXkoMjU2KTsgLy8gaW50ZWdlciwgZm9yIGZhc3QgYWNjZXNzXG52YXIgc2ltcGxlRXNjYXBlTWFwID0gbmV3IEFycmF5KDI1Nik7XG5mb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gIHNpbXBsZUVzY2FwZUNoZWNrW2ldID0gc2ltcGxlRXNjYXBlU2VxdWVuY2UoaSkgPyAxIDogMDtcbiAgc2ltcGxlRXNjYXBlTWFwW2ldID0gc2ltcGxlRXNjYXBlU2VxdWVuY2UoaSk7XG59XG5cblxuZnVuY3Rpb24gU3RhdGUoaW5wdXQsIG9wdGlvbnMpIHtcbiAgdGhpcy5pbnB1dCA9IGlucHV0O1xuXG4gIHRoaXMuZmlsZW5hbWUgID0gb3B0aW9uc1snZmlsZW5hbWUnXSAgfHwgbnVsbDtcbiAgdGhpcy5zY2hlbWEgICAgPSBvcHRpb25zWydzY2hlbWEnXSAgICB8fCBERUZBVUxUX0ZVTExfU0NIRU1BO1xuICB0aGlzLm9uV2FybmluZyA9IG9wdGlvbnNbJ29uV2FybmluZyddIHx8IG51bGw7XG4gIHRoaXMubGVnYWN5ICAgID0gb3B0aW9uc1snbGVnYWN5J10gICAgfHwgZmFsc2U7XG4gIHRoaXMuanNvbiAgICAgID0gb3B0aW9uc1snanNvbiddICAgICAgfHwgZmFsc2U7XG4gIHRoaXMubGlzdGVuZXIgID0gb3B0aW9uc1snbGlzdGVuZXInXSAgfHwgbnVsbDtcblxuICB0aGlzLmltcGxpY2l0VHlwZXMgPSB0aGlzLnNjaGVtYS5jb21waWxlZEltcGxpY2l0O1xuICB0aGlzLnR5cGVNYXAgICAgICAgPSB0aGlzLnNjaGVtYS5jb21waWxlZFR5cGVNYXA7XG5cbiAgdGhpcy5sZW5ndGggICAgID0gaW5wdXQubGVuZ3RoO1xuICB0aGlzLnBvc2l0aW9uICAgPSAwO1xuICB0aGlzLmxpbmUgICAgICAgPSAwO1xuICB0aGlzLmxpbmVTdGFydCAgPSAwO1xuICB0aGlzLmxpbmVJbmRlbnQgPSAwO1xuXG4gIHRoaXMuZG9jdW1lbnRzID0gW107XG5cbiAgLypcbiAgdGhpcy52ZXJzaW9uO1xuICB0aGlzLmNoZWNrTGluZUJyZWFrcztcbiAgdGhpcy50YWdNYXA7XG4gIHRoaXMuYW5jaG9yTWFwO1xuICB0aGlzLnRhZztcbiAgdGhpcy5hbmNob3I7XG4gIHRoaXMua2luZDtcbiAgdGhpcy5yZXN1bHQ7Ki9cblxufVxuXG5cbmZ1bmN0aW9uIGdlbmVyYXRlRXJyb3Ioc3RhdGUsIG1lc3NhZ2UpIHtcbiAgcmV0dXJuIG5ldyBZQU1MRXhjZXB0aW9uKFxuICAgIG1lc3NhZ2UsXG4gICAgbmV3IE1hcmsoc3RhdGUuZmlsZW5hbWUsIHN0YXRlLmlucHV0LCBzdGF0ZS5wb3NpdGlvbiwgc3RhdGUubGluZSwgKHN0YXRlLnBvc2l0aW9uIC0gc3RhdGUubGluZVN0YXJ0KSkpO1xufVxuXG5mdW5jdGlvbiB0aHJvd0Vycm9yKHN0YXRlLCBtZXNzYWdlKSB7XG4gIHRocm93IGdlbmVyYXRlRXJyb3Ioc3RhdGUsIG1lc3NhZ2UpO1xufVxuXG5mdW5jdGlvbiB0aHJvd1dhcm5pbmcoc3RhdGUsIG1lc3NhZ2UpIHtcbiAgaWYgKHN0YXRlLm9uV2FybmluZykge1xuICAgIHN0YXRlLm9uV2FybmluZy5jYWxsKG51bGwsIGdlbmVyYXRlRXJyb3Ioc3RhdGUsIG1lc3NhZ2UpKTtcbiAgfVxufVxuXG5cbnZhciBkaXJlY3RpdmVIYW5kbGVycyA9IHtcblxuICBZQU1MOiBmdW5jdGlvbiBoYW5kbGVZYW1sRGlyZWN0aXZlKHN0YXRlLCBuYW1lLCBhcmdzKSB7XG5cbiAgICB2YXIgbWF0Y2gsIG1ham9yLCBtaW5vcjtcblxuICAgIGlmIChzdGF0ZS52ZXJzaW9uICE9PSBudWxsKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZHVwbGljYXRpb24gb2YgJVlBTUwgZGlyZWN0aXZlJyk7XG4gICAgfVxuXG4gICAgaWYgKGFyZ3MubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnWUFNTCBkaXJlY3RpdmUgYWNjZXB0cyBleGFjdGx5IG9uZSBhcmd1bWVudCcpO1xuICAgIH1cblxuICAgIG1hdGNoID0gL14oWzAtOV0rKVxcLihbMC05XSspJC8uZXhlYyhhcmdzWzBdKTtcblxuICAgIGlmIChtYXRjaCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2lsbC1mb3JtZWQgYXJndW1lbnQgb2YgdGhlIFlBTUwgZGlyZWN0aXZlJyk7XG4gICAgfVxuXG4gICAgbWFqb3IgPSBwYXJzZUludChtYXRjaFsxXSwgMTApO1xuICAgIG1pbm9yID0gcGFyc2VJbnQobWF0Y2hbMl0sIDEwKTtcblxuICAgIGlmIChtYWpvciAhPT0gMSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuYWNjZXB0YWJsZSBZQU1MIHZlcnNpb24gb2YgdGhlIGRvY3VtZW50Jyk7XG4gICAgfVxuXG4gICAgc3RhdGUudmVyc2lvbiA9IGFyZ3NbMF07XG4gICAgc3RhdGUuY2hlY2tMaW5lQnJlYWtzID0gKG1pbm9yIDwgMik7XG5cbiAgICBpZiAobWlub3IgIT09IDEgJiYgbWlub3IgIT09IDIpIHtcbiAgICAgIHRocm93V2FybmluZyhzdGF0ZSwgJ3Vuc3VwcG9ydGVkIFlBTUwgdmVyc2lvbiBvZiB0aGUgZG9jdW1lbnQnKTtcbiAgICB9XG4gIH0sXG5cbiAgVEFHOiBmdW5jdGlvbiBoYW5kbGVUYWdEaXJlY3RpdmUoc3RhdGUsIG5hbWUsIGFyZ3MpIHtcblxuICAgIHZhciBoYW5kbGUsIHByZWZpeDtcblxuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMikge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ1RBRyBkaXJlY3RpdmUgYWNjZXB0cyBleGFjdGx5IHR3byBhcmd1bWVudHMnKTtcbiAgICB9XG5cbiAgICBoYW5kbGUgPSBhcmdzWzBdO1xuICAgIHByZWZpeCA9IGFyZ3NbMV07XG5cbiAgICBpZiAoIVBBVFRFUk5fVEFHX0hBTkRMRS50ZXN0KGhhbmRsZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdpbGwtZm9ybWVkIHRhZyBoYW5kbGUgKGZpcnN0IGFyZ3VtZW50KSBvZiB0aGUgVEFHIGRpcmVjdGl2ZScpO1xuICAgIH1cblxuICAgIGlmIChfaGFzT3duUHJvcGVydHkuY2FsbChzdGF0ZS50YWdNYXAsIGhhbmRsZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0aGVyZSBpcyBhIHByZXZpb3VzbHkgZGVjbGFyZWQgc3VmZml4IGZvciBcIicgKyBoYW5kbGUgKyAnXCIgdGFnIGhhbmRsZScpO1xuICAgIH1cblxuICAgIGlmICghUEFUVEVSTl9UQUdfVVJJLnRlc3QocHJlZml4KSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2lsbC1mb3JtZWQgdGFnIHByZWZpeCAoc2Vjb25kIGFyZ3VtZW50KSBvZiB0aGUgVEFHIGRpcmVjdGl2ZScpO1xuICAgIH1cblxuICAgIHN0YXRlLnRhZ01hcFtoYW5kbGVdID0gcHJlZml4O1xuICB9XG59O1xuXG5cbmZ1bmN0aW9uIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBzdGFydCwgZW5kLCBjaGVja0pzb24pIHtcbiAgdmFyIF9wb3NpdGlvbiwgX2xlbmd0aCwgX2NoYXJhY3RlciwgX3Jlc3VsdDtcblxuICBpZiAoc3RhcnQgPCBlbmQpIHtcbiAgICBfcmVzdWx0ID0gc3RhdGUuaW5wdXQuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICBpZiAoY2hlY2tKc29uKSB7XG4gICAgICBmb3IgKF9wb3NpdGlvbiA9IDAsIF9sZW5ndGggPSBfcmVzdWx0Lmxlbmd0aDtcbiAgICAgICAgICAgX3Bvc2l0aW9uIDwgX2xlbmd0aDtcbiAgICAgICAgICAgX3Bvc2l0aW9uICs9IDEpIHtcbiAgICAgICAgX2NoYXJhY3RlciA9IF9yZXN1bHQuY2hhckNvZGVBdChfcG9zaXRpb24pO1xuICAgICAgICBpZiAoIShfY2hhcmFjdGVyID09PSAweDA5IHx8XG4gICAgICAgICAgICAgICgweDIwIDw9IF9jaGFyYWN0ZXIgJiYgX2NoYXJhY3RlciA8PSAweDEwRkZGRikpKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2V4cGVjdGVkIHZhbGlkIEpTT04gY2hhcmFjdGVyJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFBBVFRFUk5fTk9OX1BSSU5UQUJMRS50ZXN0KF9yZXN1bHQpKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndGhlIHN0cmVhbSBjb250YWlucyBub24tcHJpbnRhYmxlIGNoYXJhY3RlcnMnKTtcbiAgICB9XG5cbiAgICBzdGF0ZS5yZXN1bHQgKz0gX3Jlc3VsdDtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZU1hcHBpbmdzKHN0YXRlLCBkZXN0aW5hdGlvbiwgc291cmNlLCBvdmVycmlkYWJsZUtleXMpIHtcbiAgdmFyIHNvdXJjZUtleXMsIGtleSwgaW5kZXgsIHF1YW50aXR5O1xuXG4gIGlmICghY29tbW9uLmlzT2JqZWN0KHNvdXJjZSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnY2Fubm90IG1lcmdlIG1hcHBpbmdzOyB0aGUgcHJvdmlkZWQgc291cmNlIG9iamVjdCBpcyB1bmFjY2VwdGFibGUnKTtcbiAgfVxuXG4gIHNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpO1xuXG4gIGZvciAoaW5kZXggPSAwLCBxdWFudGl0eSA9IHNvdXJjZUtleXMubGVuZ3RoOyBpbmRleCA8IHF1YW50aXR5OyBpbmRleCArPSAxKSB7XG4gICAga2V5ID0gc291cmNlS2V5c1tpbmRleF07XG5cbiAgICBpZiAoIV9oYXNPd25Qcm9wZXJ0eS5jYWxsKGRlc3RpbmF0aW9uLCBrZXkpKSB7XG4gICAgICBkZXN0aW5hdGlvbltrZXldID0gc291cmNlW2tleV07XG4gICAgICBvdmVycmlkYWJsZUtleXNba2V5XSA9IHRydWU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHN0b3JlTWFwcGluZ1BhaXIoc3RhdGUsIF9yZXN1bHQsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCB2YWx1ZU5vZGUpIHtcbiAgdmFyIGluZGV4LCBxdWFudGl0eTtcblxuICBrZXlOb2RlID0gU3RyaW5nKGtleU5vZGUpO1xuXG4gIGlmIChfcmVzdWx0ID09PSBudWxsKSB7XG4gICAgX3Jlc3VsdCA9IHt9O1xuICB9XG5cbiAgaWYgKGtleVRhZyA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOm1lcmdlJykge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlTm9kZSkpIHtcbiAgICAgIGZvciAoaW5kZXggPSAwLCBxdWFudGl0eSA9IHZhbHVlTm9kZS5sZW5ndGg7IGluZGV4IDwgcXVhbnRpdHk7IGluZGV4ICs9IDEpIHtcbiAgICAgICAgbWVyZ2VNYXBwaW5ncyhzdGF0ZSwgX3Jlc3VsdCwgdmFsdWVOb2RlW2luZGV4XSwgb3ZlcnJpZGFibGVLZXlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWVyZ2VNYXBwaW5ncyhzdGF0ZSwgX3Jlc3VsdCwgdmFsdWVOb2RlLCBvdmVycmlkYWJsZUtleXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoIXN0YXRlLmpzb24gJiZcbiAgICAgICAgIV9oYXNPd25Qcm9wZXJ0eS5jYWxsKG92ZXJyaWRhYmxlS2V5cywga2V5Tm9kZSkgJiZcbiAgICAgICAgX2hhc093blByb3BlcnR5LmNhbGwoX3Jlc3VsdCwga2V5Tm9kZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdkdXBsaWNhdGVkIG1hcHBpbmcga2V5Jyk7XG4gICAgfVxuICAgIF9yZXN1bHRba2V5Tm9kZV0gPSB2YWx1ZU5vZGU7XG4gICAgZGVsZXRlIG92ZXJyaWRhYmxlS2V5c1trZXlOb2RlXTtcbiAgfVxuXG4gIHJldHVybiBfcmVzdWx0O1xufVxuXG5mdW5jdGlvbiByZWFkTGluZUJyZWFrKHN0YXRlKSB7XG4gIHZhciBjaDtcblxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gIGlmIChjaCA9PT0gMHgwQS8qIExGICovKSB7XG4gICAgc3RhdGUucG9zaXRpb24rKztcbiAgfSBlbHNlIGlmIChjaCA9PT0gMHgwRC8qIENSICovKSB7XG4gICAgc3RhdGUucG9zaXRpb24rKztcbiAgICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MEEvKiBMRiAqLykge1xuICAgICAgc3RhdGUucG9zaXRpb24rKztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2EgbGluZSBicmVhayBpcyBleHBlY3RlZCcpO1xuICB9XG5cbiAgc3RhdGUubGluZSArPSAxO1xuICBzdGF0ZS5saW5lU3RhcnQgPSBzdGF0ZS5wb3NpdGlvbjtcbn1cblxuZnVuY3Rpb24gc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgYWxsb3dDb21tZW50cywgY2hlY2tJbmRlbnQpIHtcbiAgdmFyIGxpbmVCcmVha3MgPSAwLFxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICB3aGlsZSAoaXNfV0hJVEVfU1BBQ0UoY2gpKSB7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKGFsbG93Q29tbWVudHMgJiYgY2ggPT09IDB4MjMvKiAjICovKSB7XG4gICAgICBkbyB7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICAgIH0gd2hpbGUgKGNoICE9PSAweDBBLyogTEYgKi8gJiYgY2ggIT09IDB4MEQvKiBDUiAqLyAmJiBjaCAhPT0gMCk7XG4gICAgfVxuXG4gICAgaWYgKGlzX0VPTChjaCkpIHtcbiAgICAgIHJlYWRMaW5lQnJlYWsoc3RhdGUpO1xuXG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICAgICAgbGluZUJyZWFrcysrO1xuICAgICAgc3RhdGUubGluZUluZGVudCA9IDA7XG5cbiAgICAgIHdoaWxlIChjaCA9PT0gMHgyMC8qIFNwYWNlICovKSB7XG4gICAgICAgIHN0YXRlLmxpbmVJbmRlbnQrKztcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAoY2hlY2tJbmRlbnQgIT09IC0xICYmIGxpbmVCcmVha3MgIT09IDAgJiYgc3RhdGUubGluZUluZGVudCA8IGNoZWNrSW5kZW50KSB7XG4gICAgdGhyb3dXYXJuaW5nKHN0YXRlLCAnZGVmaWNpZW50IGluZGVudGF0aW9uJyk7XG4gIH1cblxuICByZXR1cm4gbGluZUJyZWFrcztcbn1cblxuZnVuY3Rpb24gdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSB7XG4gIHZhciBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvbixcbiAgICAgIGNoO1xuXG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChfcG9zaXRpb24pO1xuXG4gIC8vIENvbmRpdGlvbiBzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0IGlzIHRlc3RlZFxuICAvLyBpbiBwYXJlbnQgb24gZWFjaCBjYWxsLCBmb3IgZWZmaWNpZW5jeS4gTm8gbmVlZHMgdG8gdGVzdCBoZXJlIGFnYWluLlxuICBpZiAoKGNoID09PSAweDJELyogLSAqLyB8fCBjaCA9PT0gMHgyRS8qIC4gKi8pICYmXG4gICAgICBjaCA9PT0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChfcG9zaXRpb24gKyAxKSAmJlxuICAgICAgY2ggPT09IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoX3Bvc2l0aW9uICsgMikpIHtcblxuICAgIF9wb3NpdGlvbiArPSAzO1xuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KF9wb3NpdGlvbik7XG5cbiAgICBpZiAoY2ggPT09IDAgfHwgaXNfV1NfT1JfRU9MKGNoKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiB3cml0ZUZvbGRlZExpbmVzKHN0YXRlLCBjb3VudCkge1xuICBpZiAoY291bnQgPT09IDEpIHtcbiAgICBzdGF0ZS5yZXN1bHQgKz0gJyAnO1xuICB9IGVsc2UgaWYgKGNvdW50ID4gMSkge1xuICAgIHN0YXRlLnJlc3VsdCArPSBjb21tb24ucmVwZWF0KCdcXG4nLCBjb3VudCAtIDEpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gcmVhZFBsYWluU2NhbGFyKHN0YXRlLCBub2RlSW5kZW50LCB3aXRoaW5GbG93Q29sbGVjdGlvbikge1xuICB2YXIgcHJlY2VkaW5nLFxuICAgICAgZm9sbG93aW5nLFxuICAgICAgY2FwdHVyZVN0YXJ0LFxuICAgICAgY2FwdHVyZUVuZCxcbiAgICAgIGhhc1BlbmRpbmdDb250ZW50LFxuICAgICAgX2xpbmUsXG4gICAgICBfbGluZVN0YXJ0LFxuICAgICAgX2xpbmVJbmRlbnQsXG4gICAgICBfa2luZCA9IHN0YXRlLmtpbmQsXG4gICAgICBfcmVzdWx0ID0gc3RhdGUucmVzdWx0LFxuICAgICAgY2g7XG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICBpZiAoaXNfV1NfT1JfRU9MKGNoKSAgICAgIHx8XG4gICAgICBpc19GTE9XX0lORElDQVRPUihjaCkgfHxcbiAgICAgIGNoID09PSAweDIzLyogIyAqLyAgICB8fFxuICAgICAgY2ggPT09IDB4MjYvKiAmICovICAgIHx8XG4gICAgICBjaCA9PT0gMHgyQS8qICogKi8gICAgfHxcbiAgICAgIGNoID09PSAweDIxLyogISAqLyAgICB8fFxuICAgICAgY2ggPT09IDB4N0MvKiB8ICovICAgIHx8XG4gICAgICBjaCA9PT0gMHgzRS8qID4gKi8gICAgfHxcbiAgICAgIGNoID09PSAweDI3LyogJyAqLyAgICB8fFxuICAgICAgY2ggPT09IDB4MjIvKiBcIiAqLyAgICB8fFxuICAgICAgY2ggPT09IDB4MjUvKiAlICovICAgIHx8XG4gICAgICBjaCA9PT0gMHg0MC8qIEAgKi8gICAgfHxcbiAgICAgIGNoID09PSAweDYwLyogYCAqLykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChjaCA9PT0gMHgzRi8qID8gKi8gfHwgY2ggPT09IDB4MkQvKiAtICovKSB7XG4gICAgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpO1xuXG4gICAgaWYgKGlzX1dTX09SX0VPTChmb2xsb3dpbmcpIHx8XG4gICAgICAgIHdpdGhpbkZsb3dDb2xsZWN0aW9uICYmIGlzX0ZMT1dfSU5ESUNBVE9SKGZvbGxvd2luZykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBzdGF0ZS5raW5kID0gJ3NjYWxhcic7XG4gIHN0YXRlLnJlc3VsdCA9ICcnO1xuICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb247XG4gIGhhc1BlbmRpbmdDb250ZW50ID0gZmFsc2U7XG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgaWYgKGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpO1xuXG4gICAgICBpZiAoaXNfV1NfT1JfRU9MKGZvbGxvd2luZykgfHxcbiAgICAgICAgICB3aXRoaW5GbG93Q29sbGVjdGlvbiAmJiBpc19GTE9XX0lORElDQVRPUihmb2xsb3dpbmcpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgyMy8qICMgKi8pIHtcbiAgICAgIHByZWNlZGluZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gLSAxKTtcblxuICAgICAgaWYgKGlzX1dTX09SX0VPTChwcmVjZWRpbmcpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIGlmICgoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB8fFxuICAgICAgICAgICAgICAgd2l0aGluRmxvd0NvbGxlY3Rpb24gJiYgaXNfRkxPV19JTkRJQ0FUT1IoY2gpKSB7XG4gICAgICBicmVhaztcblxuICAgIH0gZWxzZSBpZiAoaXNfRU9MKGNoKSkge1xuICAgICAgX2xpbmUgPSBzdGF0ZS5saW5lO1xuICAgICAgX2xpbmVTdGFydCA9IHN0YXRlLmxpbmVTdGFydDtcbiAgICAgIF9saW5lSW5kZW50ID0gc3RhdGUubGluZUluZGVudDtcbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIGZhbHNlLCAtMSk7XG5cbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID49IG5vZGVJbmRlbnQpIHtcbiAgICAgICAgaGFzUGVuZGluZ0NvbnRlbnQgPSB0cnVlO1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uID0gY2FwdHVyZUVuZDtcbiAgICAgICAgc3RhdGUubGluZSA9IF9saW5lO1xuICAgICAgICBzdGF0ZS5saW5lU3RhcnQgPSBfbGluZVN0YXJ0O1xuICAgICAgICBzdGF0ZS5saW5lSW5kZW50ID0gX2xpbmVJbmRlbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChoYXNQZW5kaW5nQ29udGVudCkge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgZmFsc2UpO1xuICAgICAgd3JpdGVGb2xkZWRMaW5lcyhzdGF0ZSwgc3RhdGUubGluZSAtIF9saW5lKTtcbiAgICAgIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgICAgIGhhc1BlbmRpbmdDb250ZW50ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFpc19XSElURV9TUEFDRShjaCkpIHtcbiAgICAgIGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbiArIDE7XG4gICAgfVxuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICB9XG5cbiAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgZmFsc2UpO1xuXG4gIGlmIChzdGF0ZS5yZXN1bHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHN0YXRlLmtpbmQgPSBfa2luZDtcbiAgc3RhdGUucmVzdWx0ID0gX3Jlc3VsdDtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiByZWFkU2luZ2xlUXVvdGVkU2NhbGFyKHN0YXRlLCBub2RlSW5kZW50KSB7XG4gIHZhciBjaCxcbiAgICAgIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZDtcblxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gIGlmIChjaCAhPT0gMHgyNy8qICcgKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdGF0ZS5raW5kID0gJ3NjYWxhcic7XG4gIHN0YXRlLnJlc3VsdCA9ICcnO1xuICBzdGF0ZS5wb3NpdGlvbisrO1xuICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb247XG5cbiAgd2hpbGUgKChjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSAhPT0gMCkge1xuICAgIGlmIChjaCA9PT0gMHgyNy8qICcgKi8pIHtcbiAgICAgIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIHN0YXRlLnBvc2l0aW9uLCB0cnVlKTtcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcblxuICAgICAgaWYgKGNoID09PSAweDI3LyogJyAqLykge1xuICAgICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb247XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAoaXNfRU9MKGNoKSkge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgdHJ1ZSk7XG4gICAgICB3cml0ZUZvbGRlZExpbmVzKHN0YXRlLCBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBmYWxzZSwgbm9kZUluZGVudCkpO1xuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uO1xuXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgZG9jdW1lbnQgd2l0aGluIGEgc2luZ2xlIHF1b3RlZCBzY2FsYXInKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbisrO1xuICAgICAgY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uO1xuICAgIH1cbiAgfVxuXG4gIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIHNpbmdsZSBxdW90ZWQgc2NhbGFyJyk7XG59XG5cbmZ1bmN0aW9uIHJlYWREb3VibGVRdW90ZWRTY2FsYXIoc3RhdGUsIG5vZGVJbmRlbnQpIHtcbiAgdmFyIGNhcHR1cmVTdGFydCxcbiAgICAgIGNhcHR1cmVFbmQsXG4gICAgICBoZXhMZW5ndGgsXG4gICAgICBoZXhSZXN1bHQsXG4gICAgICB0bXAsXG4gICAgICBjaDtcblxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gIGlmIChjaCAhPT0gMHgyMi8qIFwiICovKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3RhdGUua2luZCA9ICdzY2FsYXInO1xuICBzdGF0ZS5yZXN1bHQgPSAnJztcbiAgc3RhdGUucG9zaXRpb24rKztcbiAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uO1xuXG4gIHdoaWxlICgoY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkgIT09IDApIHtcbiAgICBpZiAoY2ggPT09IDB4MjIvKiBcIiAqLykge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgc3RhdGUucG9zaXRpb24sIHRydWUpO1xuICAgICAgc3RhdGUucG9zaXRpb24rKztcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHg1Qy8qIFxcICovKSB7XG4gICAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbiwgdHJ1ZSk7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG5cbiAgICAgIGlmIChpc19FT0woY2gpKSB7XG4gICAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIGZhbHNlLCBub2RlSW5kZW50KTtcblxuICAgICAgICAvLyBUT0RPOiByZXdvcmsgdG8gaW5saW5lIGZuIHdpdGggbm8gdHlwZSBjYXN0P1xuICAgICAgfSBlbHNlIGlmIChjaCA8IDI1NiAmJiBzaW1wbGVFc2NhcGVDaGVja1tjaF0pIHtcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IHNpbXBsZUVzY2FwZU1hcFtjaF07XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG5cbiAgICAgIH0gZWxzZSBpZiAoKHRtcCA9IGVzY2FwZWRIZXhMZW4oY2gpKSA+IDApIHtcbiAgICAgICAgaGV4TGVuZ3RoID0gdG1wO1xuICAgICAgICBoZXhSZXN1bHQgPSAwO1xuXG4gICAgICAgIGZvciAoOyBoZXhMZW5ndGggPiAwOyBoZXhMZW5ndGgtLSkge1xuICAgICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcblxuICAgICAgICAgIGlmICgodG1wID0gZnJvbUhleENvZGUoY2gpKSA+PSAwKSB7XG4gICAgICAgICAgICBoZXhSZXN1bHQgPSAoaGV4UmVzdWx0IDw8IDQpICsgdG1wO1xuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdleHBlY3RlZCBoZXhhZGVjaW1hbCBjaGFyYWN0ZXInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gY2hhckZyb21Db2RlcG9pbnQoaGV4UmVzdWx0KTtcblxuICAgICAgICBzdGF0ZS5wb3NpdGlvbisrO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5rbm93biBlc2NhcGUgc2VxdWVuY2UnKTtcbiAgICAgIH1cblxuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uO1xuXG4gICAgfSBlbHNlIGlmIChpc19FT0woY2gpKSB7XG4gICAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBjYXB0dXJlRW5kLCB0cnVlKTtcbiAgICAgIHdyaXRlRm9sZGVkTGluZXMoc3RhdGUsIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIGZhbHNlLCBub2RlSW5kZW50KSk7XG4gICAgICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb247XG5cbiAgICB9IGVsc2UgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBkb2N1bWVudCB3aXRoaW4gYSBkb3VibGUgcXVvdGVkIHNjYWxhcicpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb247XG4gICAgfVxuICB9XG5cbiAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZXhwZWN0ZWQgZW5kIG9mIHRoZSBzdHJlYW0gd2l0aGluIGEgZG91YmxlIHF1b3RlZCBzY2FsYXInKTtcbn1cblxuZnVuY3Rpb24gcmVhZEZsb3dDb2xsZWN0aW9uKHN0YXRlLCBub2RlSW5kZW50KSB7XG4gIHZhciByZWFkTmV4dCA9IHRydWUsXG4gICAgICBfbGluZSxcbiAgICAgIF90YWcgICAgID0gc3RhdGUudGFnLFxuICAgICAgX3Jlc3VsdCxcbiAgICAgIF9hbmNob3IgID0gc3RhdGUuYW5jaG9yLFxuICAgICAgZm9sbG93aW5nLFxuICAgICAgdGVybWluYXRvcixcbiAgICAgIGlzUGFpcixcbiAgICAgIGlzRXhwbGljaXRQYWlyLFxuICAgICAgaXNNYXBwaW5nLFxuICAgICAgb3ZlcnJpZGFibGVLZXlzID0ge30sXG4gICAgICBrZXlOb2RlLFxuICAgICAga2V5VGFnLFxuICAgICAgdmFsdWVOb2RlLFxuICAgICAgY2g7XG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICBpZiAoY2ggPT09IDB4NUIvKiBbICovKSB7XG4gICAgdGVybWluYXRvciA9IDB4NUQ7LyogXSAqL1xuICAgIGlzTWFwcGluZyA9IGZhbHNlO1xuICAgIF9yZXN1bHQgPSBbXTtcbiAgfSBlbHNlIGlmIChjaCA9PT0gMHg3Qi8qIHsgKi8pIHtcbiAgICB0ZXJtaW5hdG9yID0gMHg3RDsvKiB9ICovXG4gICAgaXNNYXBwaW5nID0gdHJ1ZTtcbiAgICBfcmVzdWx0ID0ge307XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgIHN0YXRlLmFuY2hvck1hcFtzdGF0ZS5hbmNob3JdID0gX3Jlc3VsdDtcbiAgfVxuXG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCBub2RlSW5kZW50KTtcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG5cbiAgICBpZiAoY2ggPT09IHRlcm1pbmF0b3IpIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICBzdGF0ZS50YWcgPSBfdGFnO1xuICAgICAgc3RhdGUuYW5jaG9yID0gX2FuY2hvcjtcbiAgICAgIHN0YXRlLmtpbmQgPSBpc01hcHBpbmcgPyAnbWFwcGluZycgOiAnc2VxdWVuY2UnO1xuICAgICAgc3RhdGUucmVzdWx0ID0gX3Jlc3VsdDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoIXJlYWROZXh0KSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnbWlzc2VkIGNvbW1hIGJldHdlZW4gZmxvdyBjb2xsZWN0aW9uIGVudHJpZXMnKTtcbiAgICB9XG5cbiAgICBrZXlUYWcgPSBrZXlOb2RlID0gdmFsdWVOb2RlID0gbnVsbDtcbiAgICBpc1BhaXIgPSBpc0V4cGxpY2l0UGFpciA9IGZhbHNlO1xuXG4gICAgaWYgKGNoID09PSAweDNGLyogPyAqLykge1xuICAgICAgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpO1xuXG4gICAgICBpZiAoaXNfV1NfT1JfRU9MKGZvbGxvd2luZykpIHtcbiAgICAgICAgaXNQYWlyID0gaXNFeHBsaWNpdFBhaXIgPSB0cnVlO1xuICAgICAgICBzdGF0ZS5wb3NpdGlvbisrO1xuICAgICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCBub2RlSW5kZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfbGluZSA9IHN0YXRlLmxpbmU7XG4gICAgY29tcG9zZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpO1xuICAgIGtleVRhZyA9IHN0YXRlLnRhZztcbiAgICBrZXlOb2RlID0gc3RhdGUucmVzdWx0O1xuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIG5vZGVJbmRlbnQpO1xuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICAgIGlmICgoaXNFeHBsaWNpdFBhaXIgfHwgc3RhdGUubGluZSA9PT0gX2xpbmUpICYmIGNoID09PSAweDNBLyogOiAqLykge1xuICAgICAgaXNQYWlyID0gdHJ1ZTtcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIG5vZGVJbmRlbnQpO1xuICAgICAgY29tcG9zZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpO1xuICAgICAgdmFsdWVOb2RlID0gc3RhdGUucmVzdWx0O1xuICAgIH1cblxuICAgIGlmIChpc01hcHBpbmcpIHtcbiAgICAgIHN0b3JlTWFwcGluZ1BhaXIoc3RhdGUsIF9yZXN1bHQsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCB2YWx1ZU5vZGUpO1xuICAgIH0gZWxzZSBpZiAoaXNQYWlyKSB7XG4gICAgICBfcmVzdWx0LnB1c2goc3RvcmVNYXBwaW5nUGFpcihzdGF0ZSwgbnVsbCwgb3ZlcnJpZGFibGVLZXlzLCBrZXlUYWcsIGtleU5vZGUsIHZhbHVlTm9kZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfcmVzdWx0LnB1c2goa2V5Tm9kZSk7XG4gICAgfVxuXG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudCk7XG5cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gICAgaWYgKGNoID09PSAweDJDLyogLCAqLykge1xuICAgICAgcmVhZE5leHQgPSB0cnVlO1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWFkTmV4dCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIGZsb3cgY29sbGVjdGlvbicpO1xufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTY2FsYXIoc3RhdGUsIG5vZGVJbmRlbnQpIHtcbiAgdmFyIGNhcHR1cmVTdGFydCxcbiAgICAgIGZvbGRpbmcsXG4gICAgICBjaG9tcGluZyAgICAgICA9IENIT01QSU5HX0NMSVAsXG4gICAgICBkaWRSZWFkQ29udGVudCA9IGZhbHNlLFxuICAgICAgZGV0ZWN0ZWRJbmRlbnQgPSBmYWxzZSxcbiAgICAgIHRleHRJbmRlbnQgICAgID0gbm9kZUluZGVudCxcbiAgICAgIGVtcHR5TGluZXMgICAgID0gMCxcbiAgICAgIGF0TW9yZUluZGVudGVkID0gZmFsc2UsXG4gICAgICB0bXAsXG4gICAgICBjaDtcblxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gIGlmIChjaCA9PT0gMHg3Qy8qIHwgKi8pIHtcbiAgICBmb2xkaW5nID0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoY2ggPT09IDB4M0UvKiA+ICovKSB7XG4gICAgZm9sZGluZyA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3RhdGUua2luZCA9ICdzY2FsYXInO1xuICBzdGF0ZS5yZXN1bHQgPSAnJztcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG5cbiAgICBpZiAoY2ggPT09IDB4MkIvKiArICovIHx8IGNoID09PSAweDJELyogLSAqLykge1xuICAgICAgaWYgKENIT01QSU5HX0NMSVAgPT09IGNob21waW5nKSB7XG4gICAgICAgIGNob21waW5nID0gKGNoID09PSAweDJCLyogKyAqLykgPyBDSE9NUElOR19LRUVQIDogQ0hPTVBJTkdfU1RSSVA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAncmVwZWF0IG9mIGEgY2hvbXBpbmcgbW9kZSBpZGVudGlmaWVyJyk7XG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKCh0bXAgPSBmcm9tRGVjaW1hbENvZGUoY2gpKSA+PSAwKSB7XG4gICAgICBpZiAodG1wID09PSAwKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgZXhwbGljaXQgaW5kZW50YXRpb24gd2lkdGggb2YgYSBibG9jayBzY2FsYXI7IGl0IGNhbm5vdCBiZSBsZXNzIHRoYW4gb25lJyk7XG4gICAgICB9IGVsc2UgaWYgKCFkZXRlY3RlZEluZGVudCkge1xuICAgICAgICB0ZXh0SW5kZW50ID0gbm9kZUluZGVudCArIHRtcCAtIDE7XG4gICAgICAgIGRldGVjdGVkSW5kZW50ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdyZXBlYXQgb2YgYW4gaW5kZW50YXRpb24gd2lkdGggaWRlbnRpZmllcicpO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChpc19XSElURV9TUEFDRShjaCkpIHtcbiAgICBkbyB7IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTsgfVxuICAgIHdoaWxlIChpc19XSElURV9TUEFDRShjaCkpO1xuXG4gICAgaWYgKGNoID09PSAweDIzLyogIyAqLykge1xuICAgICAgZG8geyBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7IH1cbiAgICAgIHdoaWxlICghaXNfRU9MKGNoKSAmJiAoY2ggIT09IDApKTtcbiAgICB9XG4gIH1cblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICByZWFkTGluZUJyZWFrKHN0YXRlKTtcbiAgICBzdGF0ZS5saW5lSW5kZW50ID0gMDtcblxuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG5cbiAgICB3aGlsZSAoKCFkZXRlY3RlZEluZGVudCB8fCBzdGF0ZS5saW5lSW5kZW50IDwgdGV4dEluZGVudCkgJiZcbiAgICAgICAgICAgKGNoID09PSAweDIwLyogU3BhY2UgKi8pKSB7XG4gICAgICBzdGF0ZS5saW5lSW5kZW50Kys7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKCFkZXRlY3RlZEluZGVudCAmJiBzdGF0ZS5saW5lSW5kZW50ID4gdGV4dEluZGVudCkge1xuICAgICAgdGV4dEluZGVudCA9IHN0YXRlLmxpbmVJbmRlbnQ7XG4gICAgfVxuXG4gICAgaWYgKGlzX0VPTChjaCkpIHtcbiAgICAgIGVtcHR5TGluZXMrKztcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIEVuZCBvZiB0aGUgc2NhbGFyLlxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgdGV4dEluZGVudCkge1xuXG4gICAgICAvLyBQZXJmb3JtIHRoZSBjaG9tcGluZy5cbiAgICAgIGlmIChjaG9tcGluZyA9PT0gQ0hPTVBJTkdfS0VFUCkge1xuICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdCgnXFxuJywgZGlkUmVhZENvbnRlbnQgPyAxICsgZW1wdHlMaW5lcyA6IGVtcHR5TGluZXMpO1xuICAgICAgfSBlbHNlIGlmIChjaG9tcGluZyA9PT0gQ0hPTVBJTkdfQ0xJUCkge1xuICAgICAgICBpZiAoZGlkUmVhZENvbnRlbnQpIHsgLy8gaS5lLiBvbmx5IGlmIHRoZSBzY2FsYXIgaXMgbm90IGVtcHR5LlxuICAgICAgICAgIHN0YXRlLnJlc3VsdCArPSAnXFxuJztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBCcmVhayB0aGlzIGB3aGlsZWAgY3ljbGUgYW5kIGdvIHRvIHRoZSBmdW5jaXRvbidzIGVwaWxvZ3VlLlxuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gRm9sZGVkIHN0eWxlOiB1c2UgZmFuY3kgcnVsZXMgdG8gaGFuZGxlIGxpbmUgYnJlYWtzLlxuICAgIGlmIChmb2xkaW5nKSB7XG5cbiAgICAgIC8vIExpbmVzIHN0YXJ0aW5nIHdpdGggd2hpdGUgc3BhY2UgY2hhcmFjdGVycyAobW9yZS1pbmRlbnRlZCBsaW5lcykgYXJlIG5vdCBmb2xkZWQuXG4gICAgICBpZiAoaXNfV0hJVEVfU1BBQ0UoY2gpKSB7XG4gICAgICAgIGF0TW9yZUluZGVudGVkID0gdHJ1ZTtcbiAgICAgICAgLy8gZXhjZXB0IGZvciB0aGUgZmlyc3QgY29udGVudCBsaW5lIChjZi4gRXhhbXBsZSA4LjEpXG4gICAgICAgIHN0YXRlLnJlc3VsdCArPSBjb21tb24ucmVwZWF0KCdcXG4nLCBkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcyk7XG5cbiAgICAgIC8vIEVuZCBvZiBtb3JlLWluZGVudGVkIGJsb2NrLlxuICAgICAgfSBlbHNlIGlmIChhdE1vcmVJbmRlbnRlZCkge1xuICAgICAgICBhdE1vcmVJbmRlbnRlZCA9IGZhbHNlO1xuICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdCgnXFxuJywgZW1wdHlMaW5lcyArIDEpO1xuXG4gICAgICAvLyBKdXN0IG9uZSBsaW5lIGJyZWFrIC0gcGVyY2VpdmUgYXMgdGhlIHNhbWUgbGluZS5cbiAgICAgIH0gZWxzZSBpZiAoZW1wdHlMaW5lcyA9PT0gMCkge1xuICAgICAgICBpZiAoZGlkUmVhZENvbnRlbnQpIHsgLy8gaS5lLiBvbmx5IGlmIHdlIGhhdmUgYWxyZWFkeSByZWFkIHNvbWUgc2NhbGFyIGNvbnRlbnQuXG4gICAgICAgICAgc3RhdGUucmVzdWx0ICs9ICcgJztcbiAgICAgICAgfVxuXG4gICAgICAvLyBTZXZlcmFsIGxpbmUgYnJlYWtzIC0gcGVyY2VpdmUgYXMgZGlmZmVyZW50IGxpbmVzLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoJ1xcbicsIGVtcHR5TGluZXMpO1xuICAgICAgfVxuXG4gICAgLy8gTGl0ZXJhbCBzdHlsZToganVzdCBhZGQgZXhhY3QgbnVtYmVyIG9mIGxpbmUgYnJlYWtzIGJldHdlZW4gY29udGVudCBsaW5lcy5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gS2VlcCBhbGwgbGluZSBicmVha3MgZXhjZXB0IHRoZSBoZWFkZXIgbGluZSBicmVhay5cbiAgICAgIHN0YXRlLnJlc3VsdCArPSBjb21tb24ucmVwZWF0KCdcXG4nLCBkaWRSZWFkQ29udGVudCA/IDEgKyBlbXB0eUxpbmVzIDogZW1wdHlMaW5lcyk7XG4gICAgfVxuXG4gICAgZGlkUmVhZENvbnRlbnQgPSB0cnVlO1xuICAgIGRldGVjdGVkSW5kZW50ID0gdHJ1ZTtcbiAgICBlbXB0eUxpbmVzID0gMDtcbiAgICBjYXB0dXJlU3RhcnQgPSBzdGF0ZS5wb3NpdGlvbjtcblxuICAgIHdoaWxlICghaXNfRU9MKGNoKSAmJiAoY2ggIT09IDApKSB7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgc3RhdGUucG9zaXRpb24sIGZhbHNlKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgbm9kZUluZGVudCkge1xuICB2YXIgX2xpbmUsXG4gICAgICBfdGFnICAgICAgPSBzdGF0ZS50YWcsXG4gICAgICBfYW5jaG9yICAgPSBzdGF0ZS5hbmNob3IsXG4gICAgICBfcmVzdWx0ICAgPSBbXSxcbiAgICAgIGZvbGxvd2luZyxcbiAgICAgIGRldGVjdGVkICA9IGZhbHNlLFxuICAgICAgY2g7XG5cbiAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgIHN0YXRlLmFuY2hvck1hcFtzdGF0ZS5hbmNob3JdID0gX3Jlc3VsdDtcbiAgfVxuXG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG5cbiAgd2hpbGUgKGNoICE9PSAwKSB7XG5cbiAgICBpZiAoY2ggIT09IDB4MkQvKiAtICovKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBmb2xsb3dpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSk7XG5cbiAgICBpZiAoIWlzX1dTX09SX0VPTChmb2xsb3dpbmcpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBkZXRlY3RlZCA9IHRydWU7XG4gICAgc3RhdGUucG9zaXRpb24rKztcblxuICAgIGlmIChza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSkpIHtcbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDw9IG5vZGVJbmRlbnQpIHtcbiAgICAgICAgX3Jlc3VsdC5wdXNoKG51bGwpO1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfbGluZSA9IHN0YXRlLmxpbmU7XG4gICAgY29tcG9zZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfQkxPQ0tfSU4sIGZhbHNlLCB0cnVlKTtcbiAgICBfcmVzdWx0LnB1c2goc3RhdGUucmVzdWx0KTtcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSk7XG5cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gICAgaWYgKChzdGF0ZS5saW5lID09PSBfbGluZSB8fCBzdGF0ZS5saW5lSW5kZW50ID4gbm9kZUluZGVudCkgJiYgKGNoICE9PSAwKSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2JhZCBpbmRlbnRhdGlvbiBvZiBhIHNlcXVlbmNlIGVudHJ5Jyk7XG4gICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgbm9kZUluZGVudCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKGRldGVjdGVkKSB7XG4gICAgc3RhdGUudGFnID0gX3RhZztcbiAgICBzdGF0ZS5hbmNob3IgPSBfYW5jaG9yO1xuICAgIHN0YXRlLmtpbmQgPSAnc2VxdWVuY2UnO1xuICAgIHN0YXRlLnJlc3VsdCA9IF9yZXN1bHQ7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiByZWFkQmxvY2tNYXBwaW5nKHN0YXRlLCBub2RlSW5kZW50LCBmbG93SW5kZW50KSB7XG4gIHZhciBmb2xsb3dpbmcsXG4gICAgICBhbGxvd0NvbXBhY3QsXG4gICAgICBfbGluZSxcbiAgICAgIF90YWcgICAgICAgICAgPSBzdGF0ZS50YWcsXG4gICAgICBfYW5jaG9yICAgICAgID0gc3RhdGUuYW5jaG9yLFxuICAgICAgX3Jlc3VsdCAgICAgICA9IHt9LFxuICAgICAgb3ZlcnJpZGFibGVLZXlzID0ge30sXG4gICAgICBrZXlUYWcgICAgICAgID0gbnVsbCxcbiAgICAgIGtleU5vZGUgICAgICAgPSBudWxsLFxuICAgICAgdmFsdWVOb2RlICAgICA9IG51bGwsXG4gICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2UsXG4gICAgICBkZXRlY3RlZCAgICAgID0gZmFsc2UsXG4gICAgICBjaDtcblxuICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgc3RhdGUuYW5jaG9yTWFwW3N0YXRlLmFuY2hvcl0gPSBfcmVzdWx0O1xuICB9XG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBmb2xsb3dpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSk7XG4gICAgX2xpbmUgPSBzdGF0ZS5saW5lOyAvLyBTYXZlIHRoZSBjdXJyZW50IGxpbmUuXG5cbiAgICAvL1xuICAgIC8vIEV4cGxpY2l0IG5vdGF0aW9uIGNhc2UuIFRoZXJlIGFyZSB0d28gc2VwYXJhdGUgYmxvY2tzOlxuICAgIC8vIGZpcnN0IGZvciB0aGUga2V5IChkZW5vdGVkIGJ5IFwiP1wiKSBhbmQgc2Vjb25kIGZvciB0aGUgdmFsdWUgKGRlbm90ZWQgYnkgXCI6XCIpXG4gICAgLy9cbiAgICBpZiAoKGNoID09PSAweDNGLyogPyAqLyB8fCBjaCA9PT0gMHgzQS8qIDogKi8pICYmIGlzX1dTX09SX0VPTChmb2xsb3dpbmcpKSB7XG5cbiAgICAgIGlmIChjaCA9PT0gMHgzRi8qID8gKi8pIHtcbiAgICAgICAgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgICBzdG9yZU1hcHBpbmdQYWlyKHN0YXRlLCBfcmVzdWx0LCBvdmVycmlkYWJsZUtleXMsIGtleVRhZywga2V5Tm9kZSwgbnVsbCk7XG4gICAgICAgICAga2V5VGFnID0ga2V5Tm9kZSA9IHZhbHVlTm9kZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBkZXRlY3RlZCA9IHRydWU7XG4gICAgICAgIGF0RXhwbGljaXRLZXkgPSB0cnVlO1xuICAgICAgICBhbGxvd0NvbXBhY3QgPSB0cnVlO1xuXG4gICAgICB9IGVsc2UgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgLy8gaS5lLiAweDNBLyogOiAqLyA9PT0gY2hhcmFjdGVyIGFmdGVyIHRoZSBleHBsaWNpdCBrZXkuXG4gICAgICAgIGF0RXhwbGljaXRLZXkgPSBmYWxzZTtcbiAgICAgICAgYWxsb3dDb21wYWN0ID0gdHJ1ZTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2luY29tcGxldGUgZXhwbGljaXQgbWFwcGluZyBwYWlyOyBhIGtleSBub2RlIGlzIG1pc3NlZCcpO1xuICAgICAgfVxuXG4gICAgICBzdGF0ZS5wb3NpdGlvbiArPSAxO1xuICAgICAgY2ggPSBmb2xsb3dpbmc7XG5cbiAgICAvL1xuICAgIC8vIEltcGxpY2l0IG5vdGF0aW9uIGNhc2UuIEZsb3ctc3R5bGUgbm9kZSBhcyB0aGUga2V5IGZpcnN0LCB0aGVuIFwiOlwiLCBhbmQgdGhlIHZhbHVlLlxuICAgIC8vXG4gICAgfSBlbHNlIGlmIChjb21wb3NlTm9kZShzdGF0ZSwgZmxvd0luZGVudCwgQ09OVEVYVF9GTE9XX09VVCwgZmFsc2UsIHRydWUpKSB7XG5cbiAgICAgIGlmIChzdGF0ZS5saW5lID09PSBfbGluZSkge1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gICAgICAgIHdoaWxlIChpc19XSElURV9TUEFDRShjaCkpIHtcbiAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2ggPT09IDB4M0EvKiA6ICovKSB7XG4gICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuXG4gICAgICAgICAgaWYgKCFpc19XU19PUl9FT0woY2gpKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnYSB3aGl0ZXNwYWNlIGNoYXJhY3RlciBpcyBleHBlY3RlZCBhZnRlciB0aGUga2V5LXZhbHVlIHNlcGFyYXRvciB3aXRoaW4gYSBibG9jayBtYXBwaW5nJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgICAgIHN0b3JlTWFwcGluZ1BhaXIoc3RhdGUsIF9yZXN1bHQsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCBudWxsKTtcbiAgICAgICAgICAgIGtleVRhZyA9IGtleU5vZGUgPSB2YWx1ZU5vZGUgPSBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRldGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICBhdEV4cGxpY2l0S2V5ID0gZmFsc2U7XG4gICAgICAgICAgYWxsb3dDb21wYWN0ID0gZmFsc2U7XG4gICAgICAgICAga2V5VGFnID0gc3RhdGUudGFnO1xuICAgICAgICAgIGtleU5vZGUgPSBzdGF0ZS5yZXN1bHQ7XG5cbiAgICAgICAgfSBlbHNlIGlmIChkZXRlY3RlZCkge1xuICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdjYW4gbm90IHJlYWQgYW4gaW1wbGljaXQgbWFwcGluZyBwYWlyOyBhIGNvbG9uIGlzIG1pc3NlZCcpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhdGUudGFnID0gX3RhZztcbiAgICAgICAgICBzdGF0ZS5hbmNob3IgPSBfYW5jaG9yO1xuICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBLZWVwIHRoZSByZXN1bHQgb2YgYGNvbXBvc2VOb2RlYC5cbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKGRldGVjdGVkKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdjYW4gbm90IHJlYWQgYSBibG9jayBtYXBwaW5nIGVudHJ5OyBhIG11bHRpbGluZSBrZXkgbWF5IG5vdCBiZSBhbiBpbXBsaWNpdCBrZXknKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUudGFnID0gX3RhZztcbiAgICAgICAgc3RhdGUuYW5jaG9yID0gX2FuY2hvcjtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIEtlZXAgdGhlIHJlc3VsdCBvZiBgY29tcG9zZU5vZGVgLlxuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrOyAvLyBSZWFkaW5nIGlzIGRvbmUuIEdvIHRvIHRoZSBlcGlsb2d1ZS5cbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIENvbW1vbiByZWFkaW5nIGNvZGUgZm9yIGJvdGggZXhwbGljaXQgYW5kIGltcGxpY2l0IG5vdGF0aW9ucy5cbiAgICAvL1xuICAgIGlmIChzdGF0ZS5saW5lID09PSBfbGluZSB8fCBzdGF0ZS5saW5lSW5kZW50ID4gbm9kZUluZGVudCkge1xuICAgICAgaWYgKGNvbXBvc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0JMT0NLX09VVCwgdHJ1ZSwgYWxsb3dDb21wYWN0KSkge1xuICAgICAgICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICAgIGtleU5vZGUgPSBzdGF0ZS5yZXN1bHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWVOb2RlID0gc3RhdGUucmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghYXRFeHBsaWNpdEtleSkge1xuICAgICAgICBzdG9yZU1hcHBpbmdQYWlyKHN0YXRlLCBfcmVzdWx0LCBvdmVycmlkYWJsZUtleXMsIGtleVRhZywga2V5Tm9kZSwgdmFsdWVOb2RlKTtcbiAgICAgICAga2V5VGFnID0ga2V5Tm9kZSA9IHZhbHVlTm9kZSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKTtcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50ICYmIChjaCAhPT0gMCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICdiYWQgaW5kZW50YXRpb24gb2YgYSBtYXBwaW5nIGVudHJ5Jyk7XG4gICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgbm9kZUluZGVudCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gRXBpbG9ndWUuXG4gIC8vXG5cbiAgLy8gU3BlY2lhbCBjYXNlOiBsYXN0IG1hcHBpbmcncyBub2RlIGNvbnRhaW5zIG9ubHkgdGhlIGtleSBpbiBleHBsaWNpdCBub3RhdGlvbi5cbiAgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICBzdG9yZU1hcHBpbmdQYWlyKHN0YXRlLCBfcmVzdWx0LCBvdmVycmlkYWJsZUtleXMsIGtleVRhZywga2V5Tm9kZSwgbnVsbCk7XG4gIH1cblxuICAvLyBFeHBvc2UgdGhlIHJlc3VsdGluZyBtYXBwaW5nLlxuICBpZiAoZGV0ZWN0ZWQpIHtcbiAgICBzdGF0ZS50YWcgPSBfdGFnO1xuICAgIHN0YXRlLmFuY2hvciA9IF9hbmNob3I7XG4gICAgc3RhdGUua2luZCA9ICdtYXBwaW5nJztcbiAgICBzdGF0ZS5yZXN1bHQgPSBfcmVzdWx0O1xuICB9XG5cbiAgcmV0dXJuIGRldGVjdGVkO1xufVxuXG5mdW5jdGlvbiByZWFkVGFnUHJvcGVydHkoc3RhdGUpIHtcbiAgdmFyIF9wb3NpdGlvbixcbiAgICAgIGlzVmVyYmF0aW0gPSBmYWxzZSxcbiAgICAgIGlzTmFtZWQgICAgPSBmYWxzZSxcbiAgICAgIHRhZ0hhbmRsZSxcbiAgICAgIHRhZ05hbWUsXG4gICAgICBjaDtcblxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuXG4gIGlmIChjaCAhPT0gMHgyMS8qICEgKi8pIHJldHVybiBmYWxzZTtcblxuICBpZiAoc3RhdGUudGFnICE9PSBudWxsKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2R1cGxpY2F0aW9uIG9mIGEgdGFnIHByb3BlcnR5Jyk7XG4gIH1cblxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG5cbiAgaWYgKGNoID09PSAweDNDLyogPCAqLykge1xuICAgIGlzVmVyYmF0aW0gPSB0cnVlO1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcblxuICB9IGVsc2UgaWYgKGNoID09PSAweDIxLyogISAqLykge1xuICAgIGlzTmFtZWQgPSB0cnVlO1xuICAgIHRhZ0hhbmRsZSA9ICchISc7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuXG4gIH0gZWxzZSB7XG4gICAgdGFnSGFuZGxlID0gJyEnO1xuICB9XG5cbiAgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb247XG5cbiAgaWYgKGlzVmVyYmF0aW0pIHtcbiAgICBkbyB7IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTsgfVxuICAgIHdoaWxlIChjaCAhPT0gMCAmJiBjaCAhPT0gMHgzRS8qID4gKi8pO1xuXG4gICAgaWYgKHN0YXRlLnBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoKSB7XG4gICAgICB0YWdOYW1lID0gc3RhdGUuaW5wdXQuc2xpY2UoX3Bvc2l0aW9uLCBzdGF0ZS5wb3NpdGlvbik7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIHZlcmJhdGltIHRhZycpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzX1dTX09SX0VPTChjaCkpIHtcblxuICAgICAgaWYgKGNoID09PSAweDIxLyogISAqLykge1xuICAgICAgICBpZiAoIWlzTmFtZWQpIHtcbiAgICAgICAgICB0YWdIYW5kbGUgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24gLSAxLCBzdGF0ZS5wb3NpdGlvbiArIDEpO1xuXG4gICAgICAgICAgaWYgKCFQQVRURVJOX1RBR19IQU5ETEUudGVzdCh0YWdIYW5kbGUpKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnbmFtZWQgdGFnIGhhbmRsZSBjYW5ub3QgY29udGFpbiBzdWNoIGNoYXJhY3RlcnMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpc05hbWVkID0gdHJ1ZTtcbiAgICAgICAgICBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvbiArIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3RhZyBzdWZmaXggY2Fubm90IGNvbnRhaW4gZXhjbGFtYXRpb24gbWFya3MnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgdGFnTmFtZSA9IHN0YXRlLmlucHV0LnNsaWNlKF9wb3NpdGlvbiwgc3RhdGUucG9zaXRpb24pO1xuXG4gICAgaWYgKFBBVFRFUk5fRkxPV19JTkRJQ0FUT1JTLnRlc3QodGFnTmFtZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0YWcgc3VmZml4IGNhbm5vdCBjb250YWluIGZsb3cgaW5kaWNhdG9yIGNoYXJhY3RlcnMnKTtcbiAgICB9XG4gIH1cblxuICBpZiAodGFnTmFtZSAmJiAhUEFUVEVSTl9UQUdfVVJJLnRlc3QodGFnTmFtZSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAndGFnIG5hbWUgY2Fubm90IGNvbnRhaW4gc3VjaCBjaGFyYWN0ZXJzOiAnICsgdGFnTmFtZSk7XG4gIH1cblxuICBpZiAoaXNWZXJiYXRpbSkge1xuICAgIHN0YXRlLnRhZyA9IHRhZ05hbWU7XG5cbiAgfSBlbHNlIGlmIChfaGFzT3duUHJvcGVydHkuY2FsbChzdGF0ZS50YWdNYXAsIHRhZ0hhbmRsZSkpIHtcbiAgICBzdGF0ZS50YWcgPSBzdGF0ZS50YWdNYXBbdGFnSGFuZGxlXSArIHRhZ05hbWU7XG5cbiAgfSBlbHNlIGlmICh0YWdIYW5kbGUgPT09ICchJykge1xuICAgIHN0YXRlLnRhZyA9ICchJyArIHRhZ05hbWU7XG5cbiAgfSBlbHNlIGlmICh0YWdIYW5kbGUgPT09ICchIScpIHtcbiAgICBzdGF0ZS50YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6JyArIHRhZ05hbWU7XG5cbiAgfSBlbHNlIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5kZWNsYXJlZCB0YWcgaGFuZGxlIFwiJyArIHRhZ0hhbmRsZSArICdcIicpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHJlYWRBbmNob3JQcm9wZXJ0eShzdGF0ZSkge1xuICB2YXIgX3Bvc2l0aW9uLFxuICAgICAgY2g7XG5cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICBpZiAoY2ggIT09IDB4MjYvKiAmICovKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICdkdXBsaWNhdGlvbiBvZiBhbiBhbmNob3IgcHJvcGVydHknKTtcbiAgfVxuXG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb247XG5cbiAgd2hpbGUgKGNoICE9PSAwICYmICFpc19XU19PUl9FT0woY2gpICYmICFpc19GTE9XX0lORElDQVRPUihjaCkpIHtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gIH1cblxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IF9wb3NpdGlvbikge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICduYW1lIG9mIGFuIGFuY2hvciBub2RlIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgY2hhcmFjdGVyJyk7XG4gIH1cblxuICBzdGF0ZS5hbmNob3IgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHJlYWRBbGlhcyhzdGF0ZSkge1xuICB2YXIgX3Bvc2l0aW9uLCBhbGlhcyxcbiAgICAgIGNoO1xuXG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG5cbiAgaWYgKGNoICE9PSAweDJBLyogKiAqLykgcmV0dXJuIGZhbHNlO1xuXG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb247XG5cbiAgd2hpbGUgKGNoICE9PSAwICYmICFpc19XU19PUl9FT0woY2gpICYmICFpc19GTE9XX0lORElDQVRPUihjaCkpIHtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gIH1cblxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IF9wb3NpdGlvbikge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsICduYW1lIG9mIGFuIGFsaWFzIG5vZGUgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBjaGFyYWN0ZXInKTtcbiAgfVxuXG4gIGFsaWFzID0gc3RhdGUuaW5wdXQuc2xpY2UoX3Bvc2l0aW9uLCBzdGF0ZS5wb3NpdGlvbik7XG5cbiAgaWYgKCFzdGF0ZS5hbmNob3JNYXAuaGFzT3duUHJvcGVydHkoYWxpYXMpKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuaWRlbnRpZmllZCBhbGlhcyBcIicgKyBhbGlhcyArICdcIicpO1xuICB9XG5cbiAgc3RhdGUucmVzdWx0ID0gc3RhdGUuYW5jaG9yTWFwW2FsaWFzXTtcbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY29tcG9zZU5vZGUoc3RhdGUsIHBhcmVudEluZGVudCwgbm9kZUNvbnRleHQsIGFsbG93VG9TZWVrLCBhbGxvd0NvbXBhY3QpIHtcbiAgdmFyIGFsbG93QmxvY2tTdHlsZXMsXG4gICAgICBhbGxvd0Jsb2NrU2NhbGFycyxcbiAgICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyxcbiAgICAgIGluZGVudFN0YXR1cyA9IDEsIC8vIDE6IHRoaXM+cGFyZW50LCAwOiB0aGlzPXBhcmVudCwgLTE6IHRoaXM8cGFyZW50XG4gICAgICBhdE5ld0xpbmUgID0gZmFsc2UsXG4gICAgICBoYXNDb250ZW50ID0gZmFsc2UsXG4gICAgICB0eXBlSW5kZXgsXG4gICAgICB0eXBlUXVhbnRpdHksXG4gICAgICB0eXBlLFxuICAgICAgZmxvd0luZGVudCxcbiAgICAgIGJsb2NrSW5kZW50O1xuXG4gIGlmIChzdGF0ZS5saXN0ZW5lciAhPT0gbnVsbCkge1xuICAgIHN0YXRlLmxpc3RlbmVyKCdvcGVuJywgc3RhdGUpO1xuICB9XG5cbiAgc3RhdGUudGFnICAgID0gbnVsbDtcbiAgc3RhdGUuYW5jaG9yID0gbnVsbDtcbiAgc3RhdGUua2luZCAgID0gbnVsbDtcbiAgc3RhdGUucmVzdWx0ID0gbnVsbDtcblxuICBhbGxvd0Jsb2NrU3R5bGVzID0gYWxsb3dCbG9ja1NjYWxhcnMgPSBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgPVxuICAgIENPTlRFWFRfQkxPQ0tfT1VUID09PSBub2RlQ29udGV4dCB8fFxuICAgIENPTlRFWFRfQkxPQ0tfSU4gID09PSBub2RlQ29udGV4dDtcblxuICBpZiAoYWxsb3dUb1NlZWspIHtcbiAgICBpZiAoc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpKSB7XG4gICAgICBhdE5ld0xpbmUgPSB0cnVlO1xuXG4gICAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IHBhcmVudEluZGVudCkge1xuICAgICAgICBpbmRlbnRTdGF0dXMgPSAxO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgaW5kZW50U3RhdHVzID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IHBhcmVudEluZGVudCkge1xuICAgICAgICBpbmRlbnRTdGF0dXMgPSAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoaW5kZW50U3RhdHVzID09PSAxKSB7XG4gICAgd2hpbGUgKHJlYWRUYWdQcm9wZXJ0eShzdGF0ZSkgfHwgcmVhZEFuY2hvclByb3BlcnR5KHN0YXRlKSkge1xuICAgICAgaWYgKHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKSkge1xuICAgICAgICBhdE5ld0xpbmUgPSB0cnVlO1xuICAgICAgICBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgPSBhbGxvd0Jsb2NrU3R5bGVzO1xuXG4gICAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gcGFyZW50SW5kZW50KSB7XG4gICAgICAgICAgaW5kZW50U3RhdHVzID0gMTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAtMTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGFsbG93QmxvY2tDb2xsZWN0aW9ucykge1xuICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGF0TmV3TGluZSB8fCBhbGxvd0NvbXBhY3Q7XG4gIH1cblxuICBpZiAoaW5kZW50U3RhdHVzID09PSAxIHx8IENPTlRFWFRfQkxPQ0tfT1VUID09PSBub2RlQ29udGV4dCkge1xuICAgIGlmIChDT05URVhUX0ZMT1dfSU4gPT09IG5vZGVDb250ZXh0IHx8IENPTlRFWFRfRkxPV19PVVQgPT09IG5vZGVDb250ZXh0KSB7XG4gICAgICBmbG93SW5kZW50ID0gcGFyZW50SW5kZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBmbG93SW5kZW50ID0gcGFyZW50SW5kZW50ICsgMTtcbiAgICB9XG5cbiAgICBibG9ja0luZGVudCA9IHN0YXRlLnBvc2l0aW9uIC0gc3RhdGUubGluZVN0YXJ0O1xuXG4gICAgaWYgKGluZGVudFN0YXR1cyA9PT0gMSkge1xuICAgICAgaWYgKGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJlxuICAgICAgICAgIChyZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQpIHx8XG4gICAgICAgICAgIHJlYWRCbG9ja01hcHBpbmcoc3RhdGUsIGJsb2NrSW5kZW50LCBmbG93SW5kZW50KSkgfHxcbiAgICAgICAgICByZWFkRmxvd0NvbGxlY3Rpb24oc3RhdGUsIGZsb3dJbmRlbnQpKSB7XG4gICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKChhbGxvd0Jsb2NrU2NhbGFycyAmJiByZWFkQmxvY2tTY2FsYXIoc3RhdGUsIGZsb3dJbmRlbnQpKSB8fFxuICAgICAgICAgICAgcmVhZFNpbmdsZVF1b3RlZFNjYWxhcihzdGF0ZSwgZmxvd0luZGVudCkgfHxcbiAgICAgICAgICAgIHJlYWREb3VibGVRdW90ZWRTY2FsYXIoc3RhdGUsIGZsb3dJbmRlbnQpKSB7XG4gICAgICAgICAgaGFzQ29udGVudCA9IHRydWU7XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWFkQWxpYXMoc3RhdGUpKSB7XG4gICAgICAgICAgaGFzQ29udGVudCA9IHRydWU7XG5cbiAgICAgICAgICBpZiAoc3RhdGUudGFnICE9PSBudWxsIHx8IHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2FsaWFzIG5vZGUgc2hvdWxkIG5vdCBoYXZlIGFueSBwcm9wZXJ0aWVzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAocmVhZFBsYWluU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50LCBDT05URVhUX0ZMT1dfSU4gPT09IG5vZGVDb250ZXh0KSkge1xuICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlO1xuXG4gICAgICAgICAgaWYgKHN0YXRlLnRhZyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgc3RhdGUudGFnID0gJz8nO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICBzdGF0ZS5hbmNob3JNYXBbc3RhdGUuYW5jaG9yXSA9IHN0YXRlLnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW5kZW50U3RhdHVzID09PSAwKSB7XG4gICAgICAvLyBTcGVjaWFsIGNhc2U6IGJsb2NrIHNlcXVlbmNlcyBhcmUgYWxsb3dlZCB0byBoYXZlIHNhbWUgaW5kZW50YXRpb24gbGV2ZWwgYXMgdGhlIHBhcmVudC5cbiAgICAgIC8vIGh0dHA6Ly93d3cueWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjc5OTc4NFxuICAgICAgaGFzQ29udGVudCA9IGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJiByZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzdGF0ZS50YWcgIT09IG51bGwgJiYgc3RhdGUudGFnICE9PSAnIScpIHtcbiAgICBpZiAoc3RhdGUudGFnID09PSAnPycpIHtcbiAgICAgIGZvciAodHlwZUluZGV4ID0gMCwgdHlwZVF1YW50aXR5ID0gc3RhdGUuaW1wbGljaXRUeXBlcy5sZW5ndGg7XG4gICAgICAgICAgIHR5cGVJbmRleCA8IHR5cGVRdWFudGl0eTtcbiAgICAgICAgICAgdHlwZUluZGV4ICs9IDEpIHtcbiAgICAgICAgdHlwZSA9IHN0YXRlLmltcGxpY2l0VHlwZXNbdHlwZUluZGV4XTtcblxuICAgICAgICAvLyBJbXBsaWNpdCByZXNvbHZpbmcgaXMgbm90IGFsbG93ZWQgZm9yIG5vbi1zY2FsYXIgdHlwZXMsIGFuZCAnPydcbiAgICAgICAgLy8gbm9uLXNwZWNpZmljIHRhZyBpcyBvbmx5IGFzc2lnbmVkIHRvIHBsYWluIHNjYWxhcnMuIFNvLCBpdCBpc24ndFxuICAgICAgICAvLyBuZWVkZWQgdG8gY2hlY2sgZm9yICdraW5kJyBjb25mb3JtaXR5LlxuXG4gICAgICAgIGlmICh0eXBlLnJlc29sdmUoc3RhdGUucmVzdWx0KSkgeyAvLyBgc3RhdGUucmVzdWx0YCB1cGRhdGVkIGluIHJlc29sdmVyIGlmIG1hdGNoZWRcbiAgICAgICAgICBzdGF0ZS5yZXN1bHQgPSB0eXBlLmNvbnN0cnVjdChzdGF0ZS5yZXN1bHQpO1xuICAgICAgICAgIHN0YXRlLnRhZyA9IHR5cGUudGFnO1xuICAgICAgICAgIGlmIChzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHN0YXRlLmFuY2hvck1hcFtzdGF0ZS5hbmNob3JdID0gc3RhdGUucmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoX2hhc093blByb3BlcnR5LmNhbGwoc3RhdGUudHlwZU1hcCwgc3RhdGUudGFnKSkge1xuICAgICAgdHlwZSA9IHN0YXRlLnR5cGVNYXBbc3RhdGUudGFnXTtcblxuICAgICAgaWYgKHN0YXRlLnJlc3VsdCAhPT0gbnVsbCAmJiB0eXBlLmtpbmQgIT09IHN0YXRlLmtpbmQpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuYWNjZXB0YWJsZSBub2RlIGtpbmQgZm9yICE8JyArIHN0YXRlLnRhZyArICc+IHRhZzsgaXQgc2hvdWxkIGJlIFwiJyArIHR5cGUua2luZCArICdcIiwgbm90IFwiJyArIHN0YXRlLmtpbmQgKyAnXCInKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0eXBlLnJlc29sdmUoc3RhdGUucmVzdWx0KSkgeyAvLyBgc3RhdGUucmVzdWx0YCB1cGRhdGVkIGluIHJlc29sdmVyIGlmIG1hdGNoZWRcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2Nhbm5vdCByZXNvbHZlIGEgbm9kZSB3aXRoICE8JyArIHN0YXRlLnRhZyArICc+IGV4cGxpY2l0IHRhZycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUucmVzdWx0ID0gdHlwZS5jb25zdHJ1Y3Qoc3RhdGUucmVzdWx0KTtcbiAgICAgICAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgIHN0YXRlLmFuY2hvck1hcFtzdGF0ZS5hbmNob3JdID0gc3RhdGUucmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmtub3duIHRhZyAhPCcgKyBzdGF0ZS50YWcgKyAnPicpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzdGF0ZS5saXN0ZW5lciAhPT0gbnVsbCkge1xuICAgIHN0YXRlLmxpc3RlbmVyKCdjbG9zZScsIHN0YXRlKTtcbiAgfVxuICByZXR1cm4gc3RhdGUudGFnICE9PSBudWxsIHx8ICBzdGF0ZS5hbmNob3IgIT09IG51bGwgfHwgaGFzQ29udGVudDtcbn1cblxuZnVuY3Rpb24gcmVhZERvY3VtZW50KHN0YXRlKSB7XG4gIHZhciBkb2N1bWVudFN0YXJ0ID0gc3RhdGUucG9zaXRpb24sXG4gICAgICBfcG9zaXRpb24sXG4gICAgICBkaXJlY3RpdmVOYW1lLFxuICAgICAgZGlyZWN0aXZlQXJncyxcbiAgICAgIGhhc0RpcmVjdGl2ZXMgPSBmYWxzZSxcbiAgICAgIGNoO1xuXG4gIHN0YXRlLnZlcnNpb24gPSBudWxsO1xuICBzdGF0ZS5jaGVja0xpbmVCcmVha3MgPSBzdGF0ZS5sZWdhY3k7XG4gIHN0YXRlLnRhZ01hcCA9IHt9O1xuICBzdGF0ZS5hbmNob3JNYXAgPSB7fTtcblxuICB3aGlsZSAoKGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikpICE9PSAwKSB7XG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuXG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcblxuICAgIGlmIChzdGF0ZS5saW5lSW5kZW50ID4gMCB8fCBjaCAhPT0gMHgyNS8qICUgKi8pIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlO1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvbjtcblxuICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNfV1NfT1JfRU9MKGNoKSkge1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIH1cblxuICAgIGRpcmVjdGl2ZU5hbWUgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKTtcbiAgICBkaXJlY3RpdmVBcmdzID0gW107XG5cbiAgICBpZiAoZGlyZWN0aXZlTmFtZS5sZW5ndGggPCAxKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZGlyZWN0aXZlIG5hbWUgbXVzdCBub3QgYmUgbGVzcyB0aGFuIG9uZSBjaGFyYWN0ZXIgaW4gbGVuZ3RoJyk7XG4gICAgfVxuXG4gICAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgICB3aGlsZSAoaXNfV0hJVEVfU1BBQ0UoY2gpKSB7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNoID09PSAweDIzLyogIyAqLykge1xuICAgICAgICBkbyB7IGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTsgfVxuICAgICAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzX0VPTChjaCkpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKGlzX0VPTChjaCkpIGJyZWFrO1xuXG4gICAgICBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvbjtcblxuICAgICAgd2hpbGUgKGNoICE9PSAwICYmICFpc19XU19PUl9FT0woY2gpKSB7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICAgIH1cblxuICAgICAgZGlyZWN0aXZlQXJncy5wdXNoKHN0YXRlLmlucHV0LnNsaWNlKF9wb3NpdGlvbiwgc3RhdGUucG9zaXRpb24pKTtcbiAgICB9XG5cbiAgICBpZiAoY2ggIT09IDApIHJlYWRMaW5lQnJlYWsoc3RhdGUpO1xuXG4gICAgaWYgKF9oYXNPd25Qcm9wZXJ0eS5jYWxsKGRpcmVjdGl2ZUhhbmRsZXJzLCBkaXJlY3RpdmVOYW1lKSkge1xuICAgICAgZGlyZWN0aXZlSGFuZGxlcnNbZGlyZWN0aXZlTmFtZV0oc3RhdGUsIGRpcmVjdGl2ZU5hbWUsIGRpcmVjdGl2ZUFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvd1dhcm5pbmcoc3RhdGUsICd1bmtub3duIGRvY3VtZW50IGRpcmVjdGl2ZSBcIicgKyBkaXJlY3RpdmVOYW1lICsgJ1wiJyk7XG4gICAgfVxuICB9XG5cbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuXG4gIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSAwICYmXG4gICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSAgICAgPT09IDB4MkQvKiAtICovICYmXG4gICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkgPT09IDB4MkQvKiAtICovICYmXG4gICAgICBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMikgPT09IDB4MkQvKiAtICovKSB7XG4gICAgc3RhdGUucG9zaXRpb24gKz0gMztcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSk7XG5cbiAgfSBlbHNlIGlmIChoYXNEaXJlY3RpdmVzKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ2RpcmVjdGl2ZXMgZW5kIG1hcmsgaXMgZXhwZWN0ZWQnKTtcbiAgfVxuXG4gIGNvbXBvc2VOb2RlKHN0YXRlLCBzdGF0ZS5saW5lSW5kZW50IC0gMSwgQ09OVEVYVF9CTE9DS19PVVQsIGZhbHNlLCB0cnVlKTtcbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuXG4gIGlmIChzdGF0ZS5jaGVja0xpbmVCcmVha3MgJiZcbiAgICAgIFBBVFRFUk5fTk9OX0FTQ0lJX0xJTkVfQlJFQUtTLnRlc3Qoc3RhdGUuaW5wdXQuc2xpY2UoZG9jdW1lbnRTdGFydCwgc3RhdGUucG9zaXRpb24pKSkge1xuICAgIHRocm93V2FybmluZyhzdGF0ZSwgJ25vbi1BU0NJSSBsaW5lIGJyZWFrcyBhcmUgaW50ZXJwcmV0ZWQgYXMgY29udGVudCcpO1xuICB9XG5cbiAgc3RhdGUuZG9jdW1lbnRzLnB1c2goc3RhdGUucmVzdWx0KTtcblxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG5cbiAgICBpZiAoc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbikgPT09IDB4MkUvKiAuICovKSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbiArPSAzO1xuICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoc3RhdGUucG9zaXRpb24gPCAoc3RhdGUubGVuZ3RoIC0gMSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAnZW5kIG9mIHRoZSBzdHJlYW0gb3IgYSBkb2N1bWVudCBzZXBhcmF0b3IgaXMgZXhwZWN0ZWQnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm47XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBsb2FkRG9jdW1lbnRzKGlucHV0LCBvcHRpb25zKSB7XG4gIGlucHV0ID0gU3RyaW5nKGlucHV0KTtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgaWYgKGlucHV0Lmxlbmd0aCAhPT0gMCkge1xuXG4gICAgLy8gQWRkIHRhaWxpbmcgYFxcbmAgaWYgbm90IGV4aXN0c1xuICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KGlucHV0Lmxlbmd0aCAtIDEpICE9PSAweDBBLyogTEYgKi8gJiZcbiAgICAgICAgaW5wdXQuY2hhckNvZGVBdChpbnB1dC5sZW5ndGggLSAxKSAhPT0gMHgwRC8qIENSICovKSB7XG4gICAgICBpbnB1dCArPSAnXFxuJztcbiAgICB9XG5cbiAgICAvLyBTdHJpcCBCT01cbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgICBpbnB1dCA9IGlucHV0LnNsaWNlKDEpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBzdGF0ZSA9IG5ldyBTdGF0ZShpbnB1dCwgb3B0aW9ucyk7XG5cbiAgLy8gVXNlIDAgYXMgc3RyaW5nIHRlcm1pbmF0b3IuIFRoYXQgc2lnbmlmaWNhbnRseSBzaW1wbGlmaWVzIGJvdW5kcyBjaGVjay5cbiAgc3RhdGUuaW5wdXQgKz0gJ1xcMCc7XG5cbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAweDIwLyogU3BhY2UgKi8pIHtcbiAgICBzdGF0ZS5saW5lSW5kZW50ICs9IDE7XG4gICAgc3RhdGUucG9zaXRpb24gKz0gMTtcbiAgfVxuXG4gIHdoaWxlIChzdGF0ZS5wb3NpdGlvbiA8IChzdGF0ZS5sZW5ndGggLSAxKSkge1xuICAgIHJlYWREb2N1bWVudChzdGF0ZSk7XG4gIH1cblxuICByZXR1cm4gc3RhdGUuZG9jdW1lbnRzO1xufVxuXG5cbmZ1bmN0aW9uIGxvYWRBbGwoaW5wdXQsIGl0ZXJhdG9yLCBvcHRpb25zKSB7XG4gIHZhciBkb2N1bWVudHMgPSBsb2FkRG9jdW1lbnRzKGlucHV0LCBvcHRpb25zKSwgaW5kZXgsIGxlbmd0aDtcblxuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gZG9jdW1lbnRzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBpdGVyYXRvcihkb2N1bWVudHNbaW5kZXhdKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGxvYWQoaW5wdXQsIG9wdGlvbnMpIHtcbiAgdmFyIGRvY3VtZW50cyA9IGxvYWREb2N1bWVudHMoaW5wdXQsIG9wdGlvbnMpO1xuXG4gIGlmIChkb2N1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgLyplc2xpbnQtZGlzYWJsZSBuby11bmRlZmluZWQqL1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSBpZiAoZG9jdW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBkb2N1bWVudHNbMF07XG4gIH1cbiAgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oJ2V4cGVjdGVkIGEgc2luZ2xlIGRvY3VtZW50IGluIHRoZSBzdHJlYW0sIGJ1dCBmb3VuZCBtb3JlJyk7XG59XG5cblxuZnVuY3Rpb24gc2FmZUxvYWRBbGwoaW5wdXQsIG91dHB1dCwgb3B0aW9ucykge1xuICBsb2FkQWxsKGlucHV0LCBvdXRwdXQsIGNvbW1vbi5leHRlbmQoeyBzY2hlbWE6IERFRkFVTFRfU0FGRV9TQ0hFTUEgfSwgb3B0aW9ucykpO1xufVxuXG5cbmZ1bmN0aW9uIHNhZmVMb2FkKGlucHV0LCBvcHRpb25zKSB7XG4gIHJldHVybiBsb2FkKGlucHV0LCBjb21tb24uZXh0ZW5kKHsgc2NoZW1hOiBERUZBVUxUX1NBRkVfU0NIRU1BIH0sIG9wdGlvbnMpKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cy5sb2FkQWxsICAgICA9IGxvYWRBbGw7XG5tb2R1bGUuZXhwb3J0cy5sb2FkICAgICAgICA9IGxvYWQ7XG5tb2R1bGUuZXhwb3J0cy5zYWZlTG9hZEFsbCA9IHNhZmVMb2FkQWxsO1xubW9kdWxlLmV4cG9ydHMuc2FmZUxvYWQgICAgPSBzYWZlTG9hZDtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG52YXIgY29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24nKTtcblxuXG5mdW5jdGlvbiBNYXJrKG5hbWUsIGJ1ZmZlciwgcG9zaXRpb24sIGxpbmUsIGNvbHVtbikge1xuICB0aGlzLm5hbWUgICAgID0gbmFtZTtcbiAgdGhpcy5idWZmZXIgICA9IGJ1ZmZlcjtcbiAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICB0aGlzLmxpbmUgICAgID0gbGluZTtcbiAgdGhpcy5jb2x1bW4gICA9IGNvbHVtbjtcbn1cblxuXG5NYXJrLnByb3RvdHlwZS5nZXRTbmlwcGV0ID0gZnVuY3Rpb24gZ2V0U25pcHBldChpbmRlbnQsIG1heExlbmd0aCkge1xuICB2YXIgaGVhZCwgc3RhcnQsIHRhaWwsIGVuZCwgc25pcHBldDtcblxuICBpZiAoIXRoaXMuYnVmZmVyKSByZXR1cm4gbnVsbDtcblxuICBpbmRlbnQgPSBpbmRlbnQgfHwgNDtcbiAgbWF4TGVuZ3RoID0gbWF4TGVuZ3RoIHx8IDc1O1xuXG4gIGhlYWQgPSAnJztcbiAgc3RhcnQgPSB0aGlzLnBvc2l0aW9uO1xuXG4gIHdoaWxlIChzdGFydCA+IDAgJiYgJ1xceDAwXFxyXFxuXFx4ODVcXHUyMDI4XFx1MjAyOScuaW5kZXhPZih0aGlzLmJ1ZmZlci5jaGFyQXQoc3RhcnQgLSAxKSkgPT09IC0xKSB7XG4gICAgc3RhcnQgLT0gMTtcbiAgICBpZiAodGhpcy5wb3NpdGlvbiAtIHN0YXJ0ID4gKG1heExlbmd0aCAvIDIgLSAxKSkge1xuICAgICAgaGVhZCA9ICcgLi4uICc7XG4gICAgICBzdGFydCArPSA1O1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdGFpbCA9ICcnO1xuICBlbmQgPSB0aGlzLnBvc2l0aW9uO1xuXG4gIHdoaWxlIChlbmQgPCB0aGlzLmJ1ZmZlci5sZW5ndGggJiYgJ1xceDAwXFxyXFxuXFx4ODVcXHUyMDI4XFx1MjAyOScuaW5kZXhPZih0aGlzLmJ1ZmZlci5jaGFyQXQoZW5kKSkgPT09IC0xKSB7XG4gICAgZW5kICs9IDE7XG4gICAgaWYgKGVuZCAtIHRoaXMucG9zaXRpb24gPiAobWF4TGVuZ3RoIC8gMiAtIDEpKSB7XG4gICAgICB0YWlsID0gJyAuLi4gJztcbiAgICAgIGVuZCAtPSA1O1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgc25pcHBldCA9IHRoaXMuYnVmZmVyLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gIHJldHVybiBjb21tb24ucmVwZWF0KCcgJywgaW5kZW50KSArIGhlYWQgKyBzbmlwcGV0ICsgdGFpbCArICdcXG4nICtcbiAgICAgICAgIGNvbW1vbi5yZXBlYXQoJyAnLCBpbmRlbnQgKyB0aGlzLnBvc2l0aW9uIC0gc3RhcnQgKyBoZWFkLmxlbmd0aCkgKyAnXic7XG59O1xuXG5cbk1hcmsucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoY29tcGFjdCkge1xuICB2YXIgc25pcHBldCwgd2hlcmUgPSAnJztcblxuICBpZiAodGhpcy5uYW1lKSB7XG4gICAgd2hlcmUgKz0gJ2luIFwiJyArIHRoaXMubmFtZSArICdcIiAnO1xuICB9XG5cbiAgd2hlcmUgKz0gJ2F0IGxpbmUgJyArICh0aGlzLmxpbmUgKyAxKSArICcsIGNvbHVtbiAnICsgKHRoaXMuY29sdW1uICsgMSk7XG5cbiAgaWYgKCFjb21wYWN0KSB7XG4gICAgc25pcHBldCA9IHRoaXMuZ2V0U25pcHBldCgpO1xuXG4gICAgaWYgKHNuaXBwZXQpIHtcbiAgICAgIHdoZXJlICs9ICc6XFxuJyArIHNuaXBwZXQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHdoZXJlO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcms7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qZXNsaW50LWRpc2FibGUgbWF4LWxlbiovXG5cbnZhciBjb21tb24gICAgICAgID0gcmVxdWlyZSgnLi9jb21tb24nKTtcbnZhciBZQU1MRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcbnZhciBUeXBlICAgICAgICAgID0gcmVxdWlyZSgnLi90eXBlJyk7XG5cblxuZnVuY3Rpb24gY29tcGlsZUxpc3Qoc2NoZW1hLCBuYW1lLCByZXN1bHQpIHtcbiAgdmFyIGV4Y2x1ZGUgPSBbXTtcblxuICBzY2hlbWEuaW5jbHVkZS5mb3JFYWNoKGZ1bmN0aW9uIChpbmNsdWRlZFNjaGVtYSkge1xuICAgIHJlc3VsdCA9IGNvbXBpbGVMaXN0KGluY2x1ZGVkU2NoZW1hLCBuYW1lLCByZXN1bHQpO1xuICB9KTtcblxuICBzY2hlbWFbbmFtZV0uZm9yRWFjaChmdW5jdGlvbiAoY3VycmVudFR5cGUpIHtcbiAgICByZXN1bHQuZm9yRWFjaChmdW5jdGlvbiAocHJldmlvdXNUeXBlLCBwcmV2aW91c0luZGV4KSB7XG4gICAgICBpZiAocHJldmlvdXNUeXBlLnRhZyA9PT0gY3VycmVudFR5cGUudGFnKSB7XG4gICAgICAgIGV4Y2x1ZGUucHVzaChwcmV2aW91c0luZGV4KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJlc3VsdC5wdXNoKGN1cnJlbnRUeXBlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdC5maWx0ZXIoZnVuY3Rpb24gKHR5cGUsIGluZGV4KSB7XG4gICAgcmV0dXJuIGV4Y2x1ZGUuaW5kZXhPZihpbmRleCkgPT09IC0xO1xuICB9KTtcbn1cblxuXG5mdW5jdGlvbiBjb21waWxlTWFwKC8qIGxpc3RzLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fSwgaW5kZXgsIGxlbmd0aDtcblxuICBmdW5jdGlvbiBjb2xsZWN0VHlwZSh0eXBlKSB7XG4gICAgcmVzdWx0W3R5cGUudGFnXSA9IHR5cGU7XG4gIH1cblxuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBhcmd1bWVudHNbaW5kZXhdLmZvckVhY2goY29sbGVjdFR5cGUpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5mdW5jdGlvbiBTY2hlbWEoZGVmaW5pdGlvbikge1xuICB0aGlzLmluY2x1ZGUgID0gZGVmaW5pdGlvbi5pbmNsdWRlICB8fCBbXTtcbiAgdGhpcy5pbXBsaWNpdCA9IGRlZmluaXRpb24uaW1wbGljaXQgfHwgW107XG4gIHRoaXMuZXhwbGljaXQgPSBkZWZpbml0aW9uLmV4cGxpY2l0IHx8IFtdO1xuXG4gIHRoaXMuaW1wbGljaXQuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgIGlmICh0eXBlLmxvYWRLaW5kICYmIHR5cGUubG9hZEtpbmQgIT09ICdzY2FsYXInKSB7XG4gICAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignVGhlcmUgaXMgYSBub24tc2NhbGFyIHR5cGUgaW4gdGhlIGltcGxpY2l0IGxpc3Qgb2YgYSBzY2hlbWEuIEltcGxpY2l0IHJlc29sdmluZyBvZiBzdWNoIHR5cGVzIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgfVxuICB9KTtcblxuICB0aGlzLmNvbXBpbGVkSW1wbGljaXQgPSBjb21waWxlTGlzdCh0aGlzLCAnaW1wbGljaXQnLCBbXSk7XG4gIHRoaXMuY29tcGlsZWRFeHBsaWNpdCA9IGNvbXBpbGVMaXN0KHRoaXMsICdleHBsaWNpdCcsIFtdKTtcbiAgdGhpcy5jb21waWxlZFR5cGVNYXAgID0gY29tcGlsZU1hcCh0aGlzLmNvbXBpbGVkSW1wbGljaXQsIHRoaXMuY29tcGlsZWRFeHBsaWNpdCk7XG59XG5cblxuU2NoZW1hLkRFRkFVTFQgPSBudWxsO1xuXG5cblNjaGVtYS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGVTY2hlbWEoKSB7XG4gIHZhciBzY2hlbWFzLCB0eXBlcztcblxuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDE6XG4gICAgICBzY2hlbWFzID0gU2NoZW1hLkRFRkFVTFQ7XG4gICAgICB0eXBlcyA9IGFyZ3VtZW50c1swXTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAyOlxuICAgICAgc2NoZW1hcyA9IGFyZ3VtZW50c1swXTtcbiAgICAgIHR5cGVzID0gYXJndW1lbnRzWzFdO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oJ1dyb25nIG51bWJlciBvZiBhcmd1bWVudHMgZm9yIFNjaGVtYS5jcmVhdGUgZnVuY3Rpb24nKTtcbiAgfVxuXG4gIHNjaGVtYXMgPSBjb21tb24udG9BcnJheShzY2hlbWFzKTtcbiAgdHlwZXMgPSBjb21tb24udG9BcnJheSh0eXBlcyk7XG5cbiAgaWYgKCFzY2hlbWFzLmV2ZXJ5KGZ1bmN0aW9uIChzY2hlbWEpIHsgcmV0dXJuIHNjaGVtYSBpbnN0YW5jZW9mIFNjaGVtYTsgfSkpIHtcbiAgICB0aHJvdyBuZXcgWUFNTEV4Y2VwdGlvbignU3BlY2lmaWVkIGxpc3Qgb2Ygc3VwZXIgc2NoZW1hcyAob3IgYSBzaW5nbGUgU2NoZW1hIG9iamVjdCkgY29udGFpbnMgYSBub24tU2NoZW1hIG9iamVjdC4nKTtcbiAgfVxuXG4gIGlmICghdHlwZXMuZXZlcnkoZnVuY3Rpb24gKHR5cGUpIHsgcmV0dXJuIHR5cGUgaW5zdGFuY2VvZiBUeXBlOyB9KSkge1xuICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdTcGVjaWZpZWQgbGlzdCBvZiBZQU1MIHR5cGVzIChvciBhIHNpbmdsZSBUeXBlIG9iamVjdCkgY29udGFpbnMgYSBub24tVHlwZSBvYmplY3QuJyk7XG4gIH1cblxuICByZXR1cm4gbmV3IFNjaGVtYSh7XG4gICAgaW5jbHVkZTogc2NoZW1hcyxcbiAgICBleHBsaWNpdDogdHlwZXNcbiAgfSk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gU2NoZW1hO1xuIiwiLy8gU3RhbmRhcmQgWUFNTCdzIENvcmUgc2NoZW1hLlxuLy8gaHR0cDovL3d3dy55YW1sLm9yZy9zcGVjLzEuMi9zcGVjLmh0bWwjaWQyODA0OTIzXG4vL1xuLy8gTk9URTogSlMtWUFNTCBkb2VzIG5vdCBzdXBwb3J0IHNjaGVtYS1zcGVjaWZpYyB0YWcgcmVzb2x1dGlvbiByZXN0cmljdGlvbnMuXG4vLyBTbywgQ29yZSBzY2hlbWEgaGFzIG5vIGRpc3RpbmN0aW9ucyBmcm9tIEpTT04gc2NoZW1hIGlzIEpTLVlBTUwuXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBTY2hlbWEgPSByZXF1aXJlKCcuLi9zY2hlbWEnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTY2hlbWEoe1xuICBpbmNsdWRlOiBbXG4gICAgcmVxdWlyZSgnLi9qc29uJylcbiAgXVxufSk7XG4iLCIvLyBKUy1ZQU1MJ3MgZGVmYXVsdCBzY2hlbWEgZm9yIGBsb2FkYCBmdW5jdGlvbi5cbi8vIEl0IGlzIG5vdCBkZXNjcmliZWQgaW4gdGhlIFlBTUwgc3BlY2lmaWNhdGlvbi5cbi8vXG4vLyBUaGlzIHNjaGVtYSBpcyBiYXNlZCBvbiBKUy1ZQU1MJ3MgZGVmYXVsdCBzYWZlIHNjaGVtYSBhbmQgaW5jbHVkZXNcbi8vIEphdmFTY3JpcHQtc3BlY2lmaWMgdHlwZXM6ICEhanMvdW5kZWZpbmVkLCAhIWpzL3JlZ2V4cCBhbmQgISFqcy9mdW5jdGlvbi5cbi8vXG4vLyBBbHNvIHRoaXMgc2NoZW1hIGlzIHVzZWQgYXMgZGVmYXVsdCBiYXNlIHNjaGVtYSBhdCBgU2NoZW1hLmNyZWF0ZWAgZnVuY3Rpb24uXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBTY2hlbWEgPSByZXF1aXJlKCcuLi9zY2hlbWEnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjaGVtYS5ERUZBVUxUID0gbmV3IFNjaGVtYSh7XG4gIGluY2x1ZGU6IFtcbiAgICByZXF1aXJlKCcuL2RlZmF1bHRfc2FmZScpXG4gIF0sXG4gIGV4cGxpY2l0OiBbXG4gICAgcmVxdWlyZSgnLi4vdHlwZS9qcy91bmRlZmluZWQnKSxcbiAgICByZXF1aXJlKCcuLi90eXBlL2pzL3JlZ2V4cCcpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvanMvZnVuY3Rpb24nKVxuICBdXG59KTtcbiIsIi8vIEpTLVlBTUwncyBkZWZhdWx0IHNjaGVtYSBmb3IgYHNhZmVMb2FkYCBmdW5jdGlvbi5cbi8vIEl0IGlzIG5vdCBkZXNjcmliZWQgaW4gdGhlIFlBTUwgc3BlY2lmaWNhdGlvbi5cbi8vXG4vLyBUaGlzIHNjaGVtYSBpcyBiYXNlZCBvbiBzdGFuZGFyZCBZQU1MJ3MgQ29yZSBzY2hlbWEgYW5kIGluY2x1ZGVzIG1vc3Qgb2Zcbi8vIGV4dHJhIHR5cGVzIGRlc2NyaWJlZCBhdCBZQU1MIHRhZyByZXBvc2l0b3J5LiAoaHR0cDovL3lhbWwub3JnL3R5cGUvKVxuXG5cbid1c2Ugc3RyaWN0JztcblxuXG52YXIgU2NoZW1hID0gcmVxdWlyZSgnLi4vc2NoZW1hJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2NoZW1hKHtcbiAgaW5jbHVkZTogW1xuICAgIHJlcXVpcmUoJy4vY29yZScpXG4gIF0sXG4gIGltcGxpY2l0OiBbXG4gICAgcmVxdWlyZSgnLi4vdHlwZS90aW1lc3RhbXAnKSxcbiAgICByZXF1aXJlKCcuLi90eXBlL21lcmdlJylcbiAgXSxcbiAgZXhwbGljaXQ6IFtcbiAgICByZXF1aXJlKCcuLi90eXBlL2JpbmFyeScpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvb21hcCcpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvcGFpcnMnKSxcbiAgICByZXF1aXJlKCcuLi90eXBlL3NldCcpXG4gIF1cbn0pO1xuIiwiLy8gU3RhbmRhcmQgWUFNTCdzIEZhaWxzYWZlIHNjaGVtYS5cbi8vIGh0dHA6Ly93d3cueWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjgwMjM0NlxuXG5cbid1c2Ugc3RyaWN0JztcblxuXG52YXIgU2NoZW1hID0gcmVxdWlyZSgnLi4vc2NoZW1hJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2NoZW1hKHtcbiAgZXhwbGljaXQ6IFtcbiAgICByZXF1aXJlKCcuLi90eXBlL3N0cicpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvc2VxJyksXG4gICAgcmVxdWlyZSgnLi4vdHlwZS9tYXAnKVxuICBdXG59KTtcbiIsIi8vIFN0YW5kYXJkIFlBTUwncyBKU09OIHNjaGVtYS5cbi8vIGh0dHA6Ly93d3cueWFtbC5vcmcvc3BlYy8xLjIvc3BlYy5odG1sI2lkMjgwMzIzMVxuLy9cbi8vIE5PVEU6IEpTLVlBTUwgZG9lcyBub3Qgc3VwcG9ydCBzY2hlbWEtc3BlY2lmaWMgdGFnIHJlc29sdXRpb24gcmVzdHJpY3Rpb25zLlxuLy8gU28sIHRoaXMgc2NoZW1hIGlzIG5vdCBzdWNoIHN0cmljdCBhcyBkZWZpbmVkIGluIHRoZSBZQU1MIHNwZWNpZmljYXRpb24uXG4vLyBJdCBhbGxvd3MgbnVtYmVycyBpbiBiaW5hcnkgbm90YWlvbiwgdXNlIGBOdWxsYCBhbmQgYE5VTExgIGFzIGBudWxsYCwgZXRjLlxuXG5cbid1c2Ugc3RyaWN0JztcblxuXG52YXIgU2NoZW1hID0gcmVxdWlyZSgnLi4vc2NoZW1hJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2NoZW1hKHtcbiAgaW5jbHVkZTogW1xuICAgIHJlcXVpcmUoJy4vZmFpbHNhZmUnKVxuICBdLFxuICBpbXBsaWNpdDogW1xuICAgIHJlcXVpcmUoJy4uL3R5cGUvbnVsbCcpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvYm9vbCcpLFxuICAgIHJlcXVpcmUoJy4uL3R5cGUvaW50JyksXG4gICAgcmVxdWlyZSgnLi4vdHlwZS9mbG9hdCcpXG4gIF1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgWUFNTEV4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJyk7XG5cbnZhciBUWVBFX0NPTlNUUlVDVE9SX09QVElPTlMgPSBbXG4gICdraW5kJyxcbiAgJ3Jlc29sdmUnLFxuICAnY29uc3RydWN0JyxcbiAgJ2luc3RhbmNlT2YnLFxuICAncHJlZGljYXRlJyxcbiAgJ3JlcHJlc2VudCcsXG4gICdkZWZhdWx0U3R5bGUnLFxuICAnc3R5bGVBbGlhc2VzJ1xuXTtcblxudmFyIFlBTUxfTk9ERV9LSU5EUyA9IFtcbiAgJ3NjYWxhcicsXG4gICdzZXF1ZW5jZScsXG4gICdtYXBwaW5nJ1xuXTtcblxuZnVuY3Rpb24gY29tcGlsZVN0eWxlQWxpYXNlcyhtYXApIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gIGlmIChtYXAgIT09IG51bGwpIHtcbiAgICBPYmplY3Qua2V5cyhtYXApLmZvckVhY2goZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICBtYXBbc3R5bGVdLmZvckVhY2goZnVuY3Rpb24gKGFsaWFzKSB7XG4gICAgICAgIHJlc3VsdFtTdHJpbmcoYWxpYXMpXSA9IHN0eWxlO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBUeXBlKHRhZywgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKFRZUEVfQ09OU1RSVUNUT1JfT1BUSU9OUy5pbmRleE9mKG5hbWUpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFlBTUxFeGNlcHRpb24oJ1Vua25vd24gb3B0aW9uIFwiJyArIG5hbWUgKyAnXCIgaXMgbWV0IGluIGRlZmluaXRpb24gb2YgXCInICsgdGFnICsgJ1wiIFlBTUwgdHlwZS4nKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFRPRE86IEFkZCB0YWcgZm9ybWF0IGNoZWNrLlxuICB0aGlzLnRhZyAgICAgICAgICA9IHRhZztcbiAgdGhpcy5raW5kICAgICAgICAgPSBvcHRpb25zWydraW5kJ10gICAgICAgICB8fCBudWxsO1xuICB0aGlzLnJlc29sdmUgICAgICA9IG9wdGlvbnNbJ3Jlc29sdmUnXSAgICAgIHx8IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRydWU7IH07XG4gIHRoaXMuY29uc3RydWN0ICAgID0gb3B0aW9uc1snY29uc3RydWN0J10gICAgfHwgZnVuY3Rpb24gKGRhdGEpIHsgcmV0dXJuIGRhdGE7IH07XG4gIHRoaXMuaW5zdGFuY2VPZiAgID0gb3B0aW9uc1snaW5zdGFuY2VPZiddICAgfHwgbnVsbDtcbiAgdGhpcy5wcmVkaWNhdGUgICAgPSBvcHRpb25zWydwcmVkaWNhdGUnXSAgICB8fCBudWxsO1xuICB0aGlzLnJlcHJlc2VudCAgICA9IG9wdGlvbnNbJ3JlcHJlc2VudCddICAgIHx8IG51bGw7XG4gIHRoaXMuZGVmYXVsdFN0eWxlID0gb3B0aW9uc1snZGVmYXVsdFN0eWxlJ10gfHwgbnVsbDtcbiAgdGhpcy5zdHlsZUFsaWFzZXMgPSBjb21waWxlU3R5bGVBbGlhc2VzKG9wdGlvbnNbJ3N0eWxlQWxpYXNlcyddIHx8IG51bGwpO1xuXG4gIGlmIChZQU1MX05PREVfS0lORFMuaW5kZXhPZih0aGlzLmtpbmQpID09PSAtMSkge1xuICAgIHRocm93IG5ldyBZQU1MRXhjZXB0aW9uKCdVbmtub3duIGtpbmQgXCInICsgdGhpcy5raW5kICsgJ1wiIGlzIHNwZWNpZmllZCBmb3IgXCInICsgdGFnICsgJ1wiIFlBTUwgdHlwZS4nKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qZXNsaW50LWRpc2FibGUgbm8tYml0d2lzZSovXG5cbnZhciBOb2RlQnVmZmVyO1xuXG50cnkge1xuICAvLyBBIHRyaWNrIGZvciBicm93c2VyaWZpZWQgdmVyc2lvbiwgdG8gbm90IGluY2x1ZGUgYEJ1ZmZlcmAgc2hpbVxuICB2YXIgX3JlcXVpcmUgPSByZXF1aXJlO1xuICBOb2RlQnVmZmVyID0gX3JlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcbn0gY2F0Y2ggKF9fKSB7fVxuXG52YXIgVHlwZSAgICAgICA9IHJlcXVpcmUoJy4uL3R5cGUnKTtcblxuXG4vLyBbIDY0LCA2NSwgNjYgXSAtPiBbIHBhZGRpbmcsIENSLCBMRiBdXG52YXIgQkFTRTY0X01BUCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVxcblxccic7XG5cblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxCaW5hcnkoZGF0YSkge1xuICBpZiAoZGF0YSA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBjb2RlLCBpZHgsIGJpdGxlbiA9IDAsIG1heCA9IGRhdGEubGVuZ3RoLCBtYXAgPSBCQVNFNjRfTUFQO1xuXG4gIC8vIENvbnZlcnQgb25lIGJ5IG9uZS5cbiAgZm9yIChpZHggPSAwOyBpZHggPCBtYXg7IGlkeCsrKSB7XG4gICAgY29kZSA9IG1hcC5pbmRleE9mKGRhdGEuY2hhckF0KGlkeCkpO1xuXG4gICAgLy8gU2tpcCBDUi9MRlxuICAgIGlmIChjb2RlID4gNjQpIGNvbnRpbnVlO1xuXG4gICAgLy8gRmFpbCBvbiBpbGxlZ2FsIGNoYXJhY3RlcnNcbiAgICBpZiAoY29kZSA8IDApIHJldHVybiBmYWxzZTtcblxuICAgIGJpdGxlbiArPSA2O1xuICB9XG5cbiAgLy8gSWYgdGhlcmUgYXJlIGFueSBiaXRzIGxlZnQsIHNvdXJjZSB3YXMgY29ycnVwdGVkXG4gIHJldHVybiAoYml0bGVuICUgOCkgPT09IDA7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxCaW5hcnkoZGF0YSkge1xuICB2YXIgaWR4LCB0YWlsYml0cyxcbiAgICAgIGlucHV0ID0gZGF0YS5yZXBsYWNlKC9bXFxyXFxuPV0vZywgJycpLCAvLyByZW1vdmUgQ1IvTEYgJiBwYWRkaW5nIHRvIHNpbXBsaWZ5IHNjYW5cbiAgICAgIG1heCA9IGlucHV0Lmxlbmd0aCxcbiAgICAgIG1hcCA9IEJBU0U2NF9NQVAsXG4gICAgICBiaXRzID0gMCxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIC8vIENvbGxlY3QgYnkgNio0IGJpdHMgKDMgYnl0ZXMpXG5cbiAgZm9yIChpZHggPSAwOyBpZHggPCBtYXg7IGlkeCsrKSB7XG4gICAgaWYgKChpZHggJSA0ID09PSAwKSAmJiBpZHgpIHtcbiAgICAgIHJlc3VsdC5wdXNoKChiaXRzID4+IDE2KSAmIDB4RkYpO1xuICAgICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gOCkgJiAweEZGKTtcbiAgICAgIHJlc3VsdC5wdXNoKGJpdHMgJiAweEZGKTtcbiAgICB9XG5cbiAgICBiaXRzID0gKGJpdHMgPDwgNikgfCBtYXAuaW5kZXhPZihpbnB1dC5jaGFyQXQoaWR4KSk7XG4gIH1cblxuICAvLyBEdW1wIHRhaWxcblxuICB0YWlsYml0cyA9IChtYXggJSA0KSAqIDY7XG5cbiAgaWYgKHRhaWxiaXRzID09PSAwKSB7XG4gICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gMTYpICYgMHhGRik7XG4gICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gOCkgJiAweEZGKTtcbiAgICByZXN1bHQucHVzaChiaXRzICYgMHhGRik7XG4gIH0gZWxzZSBpZiAodGFpbGJpdHMgPT09IDE4KSB7XG4gICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gMTApICYgMHhGRik7XG4gICAgcmVzdWx0LnB1c2goKGJpdHMgPj4gMikgJiAweEZGKTtcbiAgfSBlbHNlIGlmICh0YWlsYml0cyA9PT0gMTIpIHtcbiAgICByZXN1bHQucHVzaCgoYml0cyA+PiA0KSAmIDB4RkYpO1xuICB9XG5cbiAgLy8gV3JhcCBpbnRvIEJ1ZmZlciBmb3IgTm9kZUpTIGFuZCBsZWF2ZSBBcnJheSBmb3IgYnJvd3NlclxuICBpZiAoTm9kZUJ1ZmZlcikgcmV0dXJuIG5ldyBOb2RlQnVmZmVyKHJlc3VsdCk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEJpbmFyeShvYmplY3QgLyosIHN0eWxlKi8pIHtcbiAgdmFyIHJlc3VsdCA9ICcnLCBiaXRzID0gMCwgaWR4LCB0YWlsLFxuICAgICAgbWF4ID0gb2JqZWN0Lmxlbmd0aCxcbiAgICAgIG1hcCA9IEJBU0U2NF9NQVA7XG5cbiAgLy8gQ29udmVydCBldmVyeSB0aHJlZSBieXRlcyB0byA0IEFTQ0lJIGNoYXJhY3RlcnMuXG5cbiAgZm9yIChpZHggPSAwOyBpZHggPCBtYXg7IGlkeCsrKSB7XG4gICAgaWYgKChpZHggJSAzID09PSAwKSAmJiBpZHgpIHtcbiAgICAgIHJlc3VsdCArPSBtYXBbKGJpdHMgPj4gMTgpICYgMHgzRl07XG4gICAgICByZXN1bHQgKz0gbWFwWyhiaXRzID4+IDEyKSAmIDB4M0ZdO1xuICAgICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiA2KSAmIDB4M0ZdO1xuICAgICAgcmVzdWx0ICs9IG1hcFtiaXRzICYgMHgzRl07XG4gICAgfVxuXG4gICAgYml0cyA9IChiaXRzIDw8IDgpICsgb2JqZWN0W2lkeF07XG4gIH1cblxuICAvLyBEdW1wIHRhaWxcblxuICB0YWlsID0gbWF4ICUgMztcblxuICBpZiAodGFpbCA9PT0gMCkge1xuICAgIHJlc3VsdCArPSBtYXBbKGJpdHMgPj4gMTgpICYgMHgzRl07XG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiAxMikgJiAweDNGXTtcbiAgICByZXN1bHQgKz0gbWFwWyhiaXRzID4+IDYpICYgMHgzRl07XG4gICAgcmVzdWx0ICs9IG1hcFtiaXRzICYgMHgzRl07XG4gIH0gZWxzZSBpZiAodGFpbCA9PT0gMikge1xuICAgIHJlc3VsdCArPSBtYXBbKGJpdHMgPj4gMTApICYgMHgzRl07XG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiA0KSAmIDB4M0ZdO1xuICAgIHJlc3VsdCArPSBtYXBbKGJpdHMgPDwgMikgJiAweDNGXTtcbiAgICByZXN1bHQgKz0gbWFwWzY0XTtcbiAgfSBlbHNlIGlmICh0YWlsID09PSAxKSB7XG4gICAgcmVzdWx0ICs9IG1hcFsoYml0cyA+PiAyKSAmIDB4M0ZdO1xuICAgIHJlc3VsdCArPSBtYXBbKGJpdHMgPDwgNCkgJiAweDNGXTtcbiAgICByZXN1bHQgKz0gbWFwWzY0XTtcbiAgICByZXN1bHQgKz0gbWFwWzY0XTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzQmluYXJ5KG9iamVjdCkge1xuICByZXR1cm4gTm9kZUJ1ZmZlciAmJiBOb2RlQnVmZmVyLmlzQnVmZmVyKG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOmJpbmFyeScsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sQmluYXJ5LFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxCaW5hcnksXG4gIHByZWRpY2F0ZTogaXNCaW5hcnksXG4gIHJlcHJlc2VudDogcmVwcmVzZW50WWFtbEJpbmFyeVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBUeXBlID0gcmVxdWlyZSgnLi4vdHlwZScpO1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEJvb2xlYW4oZGF0YSkge1xuICBpZiAoZGF0YSA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBtYXggPSBkYXRhLmxlbmd0aDtcblxuICByZXR1cm4gKG1heCA9PT0gNCAmJiAoZGF0YSA9PT0gJ3RydWUnIHx8IGRhdGEgPT09ICdUcnVlJyB8fCBkYXRhID09PSAnVFJVRScpKSB8fFxuICAgICAgICAgKG1heCA9PT0gNSAmJiAoZGF0YSA9PT0gJ2ZhbHNlJyB8fCBkYXRhID09PSAnRmFsc2UnIHx8IGRhdGEgPT09ICdGQUxTRScpKTtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0WWFtbEJvb2xlYW4oZGF0YSkge1xuICByZXR1cm4gZGF0YSA9PT0gJ3RydWUnIHx8XG4gICAgICAgICBkYXRhID09PSAnVHJ1ZScgfHxcbiAgICAgICAgIGRhdGEgPT09ICdUUlVFJztcbn1cblxuZnVuY3Rpb24gaXNCb29sZWFuKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sQm9vbGVhbixcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sQm9vbGVhbixcbiAgcHJlZGljYXRlOiBpc0Jvb2xlYW4sXG4gIHJlcHJlc2VudDoge1xuICAgIGxvd2VyY2FzZTogZnVuY3Rpb24gKG9iamVjdCkgeyByZXR1cm4gb2JqZWN0ID8gJ3RydWUnIDogJ2ZhbHNlJzsgfSxcbiAgICB1cHBlcmNhc2U6IGZ1bmN0aW9uIChvYmplY3QpIHsgcmV0dXJuIG9iamVjdCA/ICdUUlVFJyA6ICdGQUxTRSc7IH0sXG4gICAgY2FtZWxjYXNlOiBmdW5jdGlvbiAob2JqZWN0KSB7IHJldHVybiBvYmplY3QgPyAnVHJ1ZScgOiAnRmFsc2UnOyB9XG4gIH0sXG4gIGRlZmF1bHRTdHlsZTogJ2xvd2VyY2FzZSdcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uJyk7XG52YXIgVHlwZSAgID0gcmVxdWlyZSgnLi4vdHlwZScpO1xuXG52YXIgWUFNTF9GTE9BVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgJ14oPzpbLStdPyg/OlswLTldWzAtOV9dKilcXFxcLlswLTlfXSooPzpbZUVdWy0rXVswLTldKyk/JyArXG4gICd8XFxcXC5bMC05X10rKD86W2VFXVstK11bMC05XSspPycgK1xuICAnfFstK10/WzAtOV1bMC05X10qKD86OlswLTVdP1swLTldKStcXFxcLlswLTlfXSonICtcbiAgJ3xbLStdP1xcXFwuKD86aW5mfEluZnxJTkYpJyArXG4gICd8XFxcXC4oPzpuYW58TmFOfE5BTikpJCcpO1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0KGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblxuICBpZiAoIVlBTUxfRkxPQVRfUEFUVEVSTi50ZXN0KGRhdGEpKSByZXR1cm4gZmFsc2U7XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxGbG9hdChkYXRhKSB7XG4gIHZhciB2YWx1ZSwgc2lnbiwgYmFzZSwgZGlnaXRzO1xuXG4gIHZhbHVlICA9IGRhdGEucmVwbGFjZSgvXy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgc2lnbiAgID0gdmFsdWVbMF0gPT09ICctJyA/IC0xIDogMTtcbiAgZGlnaXRzID0gW107XG5cbiAgaWYgKCcrLScuaW5kZXhPZih2YWx1ZVswXSkgPj0gMCkge1xuICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMSk7XG4gIH1cblxuICBpZiAodmFsdWUgPT09ICcuaW5mJykge1xuICAgIHJldHVybiAoc2lnbiA9PT0gMSkgPyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgOiBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG5cbiAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gJy5uYW4nKSB7XG4gICAgcmV0dXJuIE5hTjtcblxuICB9IGVsc2UgaWYgKHZhbHVlLmluZGV4T2YoJzonKSA+PSAwKSB7XG4gICAgdmFsdWUuc3BsaXQoJzonKS5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICBkaWdpdHMudW5zaGlmdChwYXJzZUZsb2F0KHYsIDEwKSk7XG4gICAgfSk7XG5cbiAgICB2YWx1ZSA9IDAuMDtcbiAgICBiYXNlID0gMTtcblxuICAgIGRpZ2l0cy5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XG4gICAgICB2YWx1ZSArPSBkICogYmFzZTtcbiAgICAgIGJhc2UgKj0gNjA7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2lnbiAqIHZhbHVlO1xuXG4gIH1cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUZsb2F0KHZhbHVlLCAxMCk7XG59XG5cblxudmFyIFNDSUVOVElGSUNfV0lUSE9VVF9ET1QgPSAvXlstK10/WzAtOV0rZS87XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxGbG9hdChvYmplY3QsIHN0eWxlKSB7XG4gIHZhciByZXM7XG5cbiAgaWYgKGlzTmFOKG9iamVjdCkpIHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICBjYXNlICdsb3dlcmNhc2UnOiByZXR1cm4gJy5uYW4nO1xuICAgICAgY2FzZSAndXBwZXJjYXNlJzogcmV0dXJuICcuTkFOJztcbiAgICAgIGNhc2UgJ2NhbWVsY2FzZSc6IHJldHVybiAnLk5hTic7XG4gICAgfVxuICB9IGVsc2UgaWYgKE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA9PT0gb2JqZWN0KSB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgY2FzZSAnbG93ZXJjYXNlJzogcmV0dXJuICcuaW5mJztcbiAgICAgIGNhc2UgJ3VwcGVyY2FzZSc6IHJldHVybiAnLklORic7XG4gICAgICBjYXNlICdjYW1lbGNhc2UnOiByZXR1cm4gJy5JbmYnO1xuICAgIH1cbiAgfSBlbHNlIGlmIChOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkgPT09IG9iamVjdCkge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgIGNhc2UgJ2xvd2VyY2FzZSc6IHJldHVybiAnLS5pbmYnO1xuICAgICAgY2FzZSAndXBwZXJjYXNlJzogcmV0dXJuICctLklORic7XG4gICAgICBjYXNlICdjYW1lbGNhc2UnOiByZXR1cm4gJy0uSW5mJztcbiAgICB9XG4gIH0gZWxzZSBpZiAoY29tbW9uLmlzTmVnYXRpdmVaZXJvKG9iamVjdCkpIHtcbiAgICByZXR1cm4gJy0wLjAnO1xuICB9XG5cbiAgcmVzID0gb2JqZWN0LnRvU3RyaW5nKDEwKTtcblxuICAvLyBKUyBzdHJpbmdpZmllciBjYW4gYnVpbGQgc2NpZW50aWZpYyBmb3JtYXQgd2l0aG91dCBkb3RzOiA1ZS0xMDAsXG4gIC8vIHdoaWxlIFlBTUwgcmVxdXJlcyBkb3Q6IDUuZS0xMDAuIEZpeCBpdCB3aXRoIHNpbXBsZSBoYWNrXG5cbiAgcmV0dXJuIFNDSUVOVElGSUNfV0lUSE9VVF9ET1QudGVzdChyZXMpID8gcmVzLnJlcGxhY2UoJ2UnLCAnLmUnKSA6IHJlcztcbn1cblxuZnVuY3Rpb24gaXNGbG9hdChvYmplY3QpIHtcbiAgcmV0dXJuIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgTnVtYmVyXScpICYmXG4gICAgICAgICAob2JqZWN0ICUgMSAhPT0gMCB8fCBjb21tb24uaXNOZWdhdGl2ZVplcm8ob2JqZWN0KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0Jywge1xuICBraW5kOiAnc2NhbGFyJyxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxGbG9hdCxcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sRmxvYXQsXG4gIHByZWRpY2F0ZTogaXNGbG9hdCxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sRmxvYXQsXG4gIGRlZmF1bHRTdHlsZTogJ2xvd2VyY2FzZSdcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uJyk7XG52YXIgVHlwZSAgID0gcmVxdWlyZSgnLi4vdHlwZScpO1xuXG5mdW5jdGlvbiBpc0hleENvZGUoYykge1xuICByZXR1cm4gKCgweDMwLyogMCAqLyA8PSBjKSAmJiAoYyA8PSAweDM5LyogOSAqLykpIHx8XG4gICAgICAgICAoKDB4NDEvKiBBICovIDw9IGMpICYmIChjIDw9IDB4NDYvKiBGICovKSkgfHxcbiAgICAgICAgICgoMHg2MS8qIGEgKi8gPD0gYykgJiYgKGMgPD0gMHg2Ni8qIGYgKi8pKTtcbn1cblxuZnVuY3Rpb24gaXNPY3RDb2RlKGMpIHtcbiAgcmV0dXJuICgoMHgzMC8qIDAgKi8gPD0gYykgJiYgKGMgPD0gMHgzNy8qIDcgKi8pKTtcbn1cblxuZnVuY3Rpb24gaXNEZWNDb2RlKGMpIHtcbiAgcmV0dXJuICgoMHgzMC8qIDAgKi8gPD0gYykgJiYgKGMgPD0gMHgzOS8qIDkgKi8pKTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxJbnRlZ2VyKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblxuICB2YXIgbWF4ID0gZGF0YS5sZW5ndGgsXG4gICAgICBpbmRleCA9IDAsXG4gICAgICBoYXNEaWdpdHMgPSBmYWxzZSxcbiAgICAgIGNoO1xuXG4gIGlmICghbWF4KSByZXR1cm4gZmFsc2U7XG5cbiAgY2ggPSBkYXRhW2luZGV4XTtcblxuICAvLyBzaWduXG4gIGlmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnKycpIHtcbiAgICBjaCA9IGRhdGFbKytpbmRleF07XG4gIH1cblxuICBpZiAoY2ggPT09ICcwJykge1xuICAgIC8vIDBcbiAgICBpZiAoaW5kZXggKyAxID09PSBtYXgpIHJldHVybiB0cnVlO1xuICAgIGNoID0gZGF0YVsrK2luZGV4XTtcblxuICAgIC8vIGJhc2UgMiwgYmFzZSA4LCBiYXNlIDE2XG5cbiAgICBpZiAoY2ggPT09ICdiJykge1xuICAgICAgLy8gYmFzZSAyXG4gICAgICBpbmRleCsrO1xuXG4gICAgICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICAgICAgY2ggPSBkYXRhW2luZGV4XTtcbiAgICAgICAgaWYgKGNoID09PSAnXycpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoY2ggIT09ICcwJyAmJiBjaCAhPT0gJzEnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGhhc0RpZ2l0cyA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzRGlnaXRzO1xuICAgIH1cblxuXG4gICAgaWYgKGNoID09PSAneCcpIHtcbiAgICAgIC8vIGJhc2UgMTZcbiAgICAgIGluZGV4Kys7XG5cbiAgICAgIGZvciAoOyBpbmRleCA8IG1heDsgaW5kZXgrKykge1xuICAgICAgICBjaCA9IGRhdGFbaW5kZXhdO1xuICAgICAgICBpZiAoY2ggPT09ICdfJykgY29udGludWU7XG4gICAgICAgIGlmICghaXNIZXhDb2RlKGRhdGEuY2hhckNvZGVBdChpbmRleCkpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGhhc0RpZ2l0cyA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzRGlnaXRzO1xuICAgIH1cblxuICAgIC8vIGJhc2UgOFxuICAgIGZvciAoOyBpbmRleCA8IG1heDsgaW5kZXgrKykge1xuICAgICAgY2ggPSBkYXRhW2luZGV4XTtcbiAgICAgIGlmIChjaCA9PT0gJ18nKSBjb250aW51ZTtcbiAgICAgIGlmICghaXNPY3RDb2RlKGRhdGEuY2hhckNvZGVBdChpbmRleCkpKSByZXR1cm4gZmFsc2U7XG4gICAgICBoYXNEaWdpdHMgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gaGFzRGlnaXRzO1xuICB9XG5cbiAgLy8gYmFzZSAxMCAoZXhjZXB0IDApIG9yIGJhc2UgNjBcblxuICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICBjaCA9IGRhdGFbaW5kZXhdO1xuICAgIGlmIChjaCA9PT0gJ18nKSBjb250aW51ZTtcbiAgICBpZiAoY2ggPT09ICc6JykgYnJlYWs7XG4gICAgaWYgKCFpc0RlY0NvZGUoZGF0YS5jaGFyQ29kZUF0KGluZGV4KSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaGFzRGlnaXRzID0gdHJ1ZTtcbiAgfVxuXG4gIGlmICghaGFzRGlnaXRzKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gaWYgIWJhc2U2MCAtIGRvbmU7XG4gIGlmIChjaCAhPT0gJzonKSByZXR1cm4gdHJ1ZTtcblxuICAvLyBiYXNlNjAgYWxtb3N0IG5vdCB1c2VkLCBubyBuZWVkcyB0byBvcHRpbWl6ZVxuICByZXR1cm4gL14oOlswLTVdP1swLTldKSskLy50ZXN0KGRhdGEuc2xpY2UoaW5kZXgpKTtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0WWFtbEludGVnZXIoZGF0YSkge1xuICB2YXIgdmFsdWUgPSBkYXRhLCBzaWduID0gMSwgY2gsIGJhc2UsIGRpZ2l0cyA9IFtdO1xuXG4gIGlmICh2YWx1ZS5pbmRleE9mKCdfJykgIT09IC0xKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9fL2csICcnKTtcbiAgfVxuXG4gIGNoID0gdmFsdWVbMF07XG5cbiAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcrJykge1xuICAgIGlmIChjaCA9PT0gJy0nKSBzaWduID0gLTE7XG4gICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxKTtcbiAgICBjaCA9IHZhbHVlWzBdO1xuICB9XG5cbiAgaWYgKHZhbHVlID09PSAnMCcpIHJldHVybiAwO1xuXG4gIGlmIChjaCA9PT0gJzAnKSB7XG4gICAgaWYgKHZhbHVlWzFdID09PSAnYicpIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIDIpO1xuICAgIGlmICh2YWx1ZVsxXSA9PT0gJ3gnKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLCAxNik7XG4gICAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgOCk7XG4gIH1cblxuICBpZiAodmFsdWUuaW5kZXhPZignOicpICE9PSAtMSkge1xuICAgIHZhbHVlLnNwbGl0KCc6JykuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgZGlnaXRzLnVuc2hpZnQocGFyc2VJbnQodiwgMTApKTtcbiAgICB9KTtcblxuICAgIHZhbHVlID0gMDtcbiAgICBiYXNlID0gMTtcblxuICAgIGRpZ2l0cy5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XG4gICAgICB2YWx1ZSArPSAoZCAqIGJhc2UpO1xuICAgICAgYmFzZSAqPSA2MDtcbiAgICB9KTtcblxuICAgIHJldHVybiBzaWduICogdmFsdWU7XG5cbiAgfVxuXG4gIHJldHVybiBzaWduICogcGFyc2VJbnQodmFsdWUsIDEwKTtcbn1cblxuZnVuY3Rpb24gaXNJbnRlZ2VyKG9iamVjdCkge1xuICByZXR1cm4gKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpKSA9PT0gJ1tvYmplY3QgTnVtYmVyXScgJiZcbiAgICAgICAgIChvYmplY3QgJSAxID09PSAwICYmICFjb21tb24uaXNOZWdhdGl2ZVplcm8ob2JqZWN0KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sSW50ZWdlcixcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sSW50ZWdlcixcbiAgcHJlZGljYXRlOiBpc0ludGVnZXIsXG4gIHJlcHJlc2VudDoge1xuICAgIGJpbmFyeTogICAgICBmdW5jdGlvbiAob2JqZWN0KSB7IHJldHVybiAnMGInICsgb2JqZWN0LnRvU3RyaW5nKDIpOyB9LFxuICAgIG9jdGFsOiAgICAgICBmdW5jdGlvbiAob2JqZWN0KSB7IHJldHVybiAnMCcgICsgb2JqZWN0LnRvU3RyaW5nKDgpOyB9LFxuICAgIGRlY2ltYWw6ICAgICBmdW5jdGlvbiAob2JqZWN0KSB7IHJldHVybiAgICAgICAgb2JqZWN0LnRvU3RyaW5nKDEwKTsgfSxcbiAgICBoZXhhZGVjaW1hbDogZnVuY3Rpb24gKG9iamVjdCkgeyByZXR1cm4gJzB4JyArIG9iamVjdC50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTsgfVxuICB9LFxuICBkZWZhdWx0U3R5bGU6ICdkZWNpbWFsJyxcbiAgc3R5bGVBbGlhc2VzOiB7XG4gICAgYmluYXJ5OiAgICAgIFsgMiwgICdiaW4nIF0sXG4gICAgb2N0YWw6ICAgICAgIFsgOCwgICdvY3QnIF0sXG4gICAgZGVjaW1hbDogICAgIFsgMTAsICdkZWMnIF0sXG4gICAgaGV4YWRlY2ltYWw6IFsgMTYsICdoZXgnIF1cbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlc3ByaW1hO1xuXG4vLyBCcm93c2VyaWZpZWQgdmVyc2lvbiBkb2VzIG5vdCBoYXZlIGVzcHJpbWFcbi8vXG4vLyAxLiBGb3Igbm9kZS5qcyBqdXN0IHJlcXVpcmUgbW9kdWxlIGFzIGRlcHNcbi8vIDIuIEZvciBicm93c2VyIHRyeSB0byByZXF1aXJlIG11ZHVsZSB2aWEgZXh0ZXJuYWwgQU1EIHN5c3RlbS5cbi8vICAgIElmIG5vdCBmb3VuZCAtIHRyeSB0byBmYWxsYmFjayB0byB3aW5kb3cuZXNwcmltYS4gSWYgbm90XG4vLyAgICBmb3VuZCB0b28gLSB0aGVuIGZhaWwgdG8gcGFyc2UuXG4vL1xudHJ5IHtcbiAgLy8gd29ya2Fyb3VuZCB0byBleGNsdWRlIHBhY2thZ2UgZnJvbSBicm93c2VyaWZ5IGxpc3QuXG4gIHZhciBfcmVxdWlyZSA9IHJlcXVpcmU7XG4gIGVzcHJpbWEgPSBfcmVxdWlyZSgnZXNwcmltYScpO1xufSBjYXRjaCAoXykge1xuICAvKmdsb2JhbCB3aW5kb3cgKi9cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSBlc3ByaW1hID0gd2luZG93LmVzcHJpbWE7XG59XG5cbnZhciBUeXBlID0gcmVxdWlyZSgnLi4vLi4vdHlwZScpO1xuXG5mdW5jdGlvbiByZXNvbHZlSmF2YXNjcmlwdEZ1bmN0aW9uKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblxuICB0cnkge1xuICAgIHZhciBzb3VyY2UgPSAnKCcgKyBkYXRhICsgJyknLFxuICAgICAgICBhc3QgICAgPSBlc3ByaW1hLnBhcnNlKHNvdXJjZSwgeyByYW5nZTogdHJ1ZSB9KTtcblxuICAgIGlmIChhc3QudHlwZSAgICAgICAgICAgICAgICAgICAgIT09ICdQcm9ncmFtJyAgICAgICAgICAgICB8fFxuICAgICAgICBhc3QuYm9keS5sZW5ndGggICAgICAgICAgICAgIT09IDEgICAgICAgICAgICAgICAgICAgICB8fFxuICAgICAgICBhc3QuYm9keVswXS50eXBlICAgICAgICAgICAgIT09ICdFeHByZXNzaW9uU3RhdGVtZW50JyB8fFxuICAgICAgICBhc3QuYm9keVswXS5leHByZXNzaW9uLnR5cGUgIT09ICdGdW5jdGlvbkV4cHJlc3Npb24nKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RKYXZhc2NyaXB0RnVuY3Rpb24oZGF0YSkge1xuICAvKmpzbGludCBldmlsOnRydWUqL1xuXG4gIHZhciBzb3VyY2UgPSAnKCcgKyBkYXRhICsgJyknLFxuICAgICAgYXN0ICAgID0gZXNwcmltYS5wYXJzZShzb3VyY2UsIHsgcmFuZ2U6IHRydWUgfSksXG4gICAgICBwYXJhbXMgPSBbXSxcbiAgICAgIGJvZHk7XG5cbiAgaWYgKGFzdC50eXBlICAgICAgICAgICAgICAgICAgICAhPT0gJ1Byb2dyYW0nICAgICAgICAgICAgIHx8XG4gICAgICBhc3QuYm9keS5sZW5ndGggICAgICAgICAgICAgIT09IDEgICAgICAgICAgICAgICAgICAgICB8fFxuICAgICAgYXN0LmJvZHlbMF0udHlwZSAgICAgICAgICAgICE9PSAnRXhwcmVzc2lvblN0YXRlbWVudCcgfHxcbiAgICAgIGFzdC5ib2R5WzBdLmV4cHJlc3Npb24udHlwZSAhPT0gJ0Z1bmN0aW9uRXhwcmVzc2lvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZXNvbHZlIGZ1bmN0aW9uJyk7XG4gIH1cblxuICBhc3QuYm9keVswXS5leHByZXNzaW9uLnBhcmFtcy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJhbSkge1xuICAgIHBhcmFtcy5wdXNoKHBhcmFtLm5hbWUpO1xuICB9KTtcblxuICBib2R5ID0gYXN0LmJvZHlbMF0uZXhwcmVzc2lvbi5ib2R5LnJhbmdlO1xuXG4gIC8vIEVzcHJpbWEncyByYW5nZXMgaW5jbHVkZSB0aGUgZmlyc3QgJ3snIGFuZCB0aGUgbGFzdCAnfScgY2hhcmFjdGVycyBvblxuICAvLyBmdW5jdGlvbiBleHByZXNzaW9ucy4gU28gY3V0IHRoZW0gb3V0LlxuICAvKmVzbGludC1kaXNhYmxlIG5vLW5ldy1mdW5jKi9cbiAgcmV0dXJuIG5ldyBGdW5jdGlvbihwYXJhbXMsIHNvdXJjZS5zbGljZShib2R5WzBdICsgMSwgYm9keVsxXSAtIDEpKTtcbn1cblxuZnVuY3Rpb24gcmVwcmVzZW50SmF2YXNjcmlwdEZ1bmN0aW9uKG9iamVjdCAvKiwgc3R5bGUqLykge1xuICByZXR1cm4gb2JqZWN0LnRvU3RyaW5nKCk7XG59XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6anMvZnVuY3Rpb24nLCB7XG4gIGtpbmQ6ICdzY2FsYXInLFxuICByZXNvbHZlOiByZXNvbHZlSmF2YXNjcmlwdEZ1bmN0aW9uLFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdEphdmFzY3JpcHRGdW5jdGlvbixcbiAgcHJlZGljYXRlOiBpc0Z1bmN0aW9uLFxuICByZXByZXNlbnQ6IHJlcHJlc2VudEphdmFzY3JpcHRGdW5jdGlvblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBUeXBlID0gcmVxdWlyZSgnLi4vLi4vdHlwZScpO1xuXG5mdW5jdGlvbiByZXNvbHZlSmF2YXNjcmlwdFJlZ0V4cChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciByZWdleHAgPSBkYXRhLFxuICAgICAgdGFpbCAgID0gL1xcLyhbZ2ltXSopJC8uZXhlYyhkYXRhKSxcbiAgICAgIG1vZGlmaWVycyA9ICcnO1xuXG4gIC8vIGlmIHJlZ2V4cCBzdGFydHMgd2l0aCAnLycgaXQgY2FuIGhhdmUgbW9kaWZpZXJzIGFuZCBtdXN0IGJlIHByb3Blcmx5IGNsb3NlZFxuICAvLyBgL2Zvby9naW1gIC0gbW9kaWZpZXJzIHRhaWwgY2FuIGJlIG1heGltdW0gMyBjaGFyc1xuICBpZiAocmVnZXhwWzBdID09PSAnLycpIHtcbiAgICBpZiAodGFpbCkgbW9kaWZpZXJzID0gdGFpbFsxXTtcblxuICAgIGlmIChtb2RpZmllcnMubGVuZ3RoID4gMykgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGlmIGV4cHJlc3Npb24gc3RhcnRzIHdpdGggLywgaXMgc2hvdWxkIGJlIHByb3Blcmx5IHRlcm1pbmF0ZWRcbiAgICBpZiAocmVnZXhwW3JlZ2V4cC5sZW5ndGggLSBtb2RpZmllcnMubGVuZ3RoIC0gMV0gIT09ICcvJykgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdEphdmFzY3JpcHRSZWdFeHAoZGF0YSkge1xuICB2YXIgcmVnZXhwID0gZGF0YSxcbiAgICAgIHRhaWwgICA9IC9cXC8oW2dpbV0qKSQvLmV4ZWMoZGF0YSksXG4gICAgICBtb2RpZmllcnMgPSAnJztcblxuICAvLyBgL2Zvby9naW1gIC0gdGFpbCBjYW4gYmUgbWF4aW11bSA0IGNoYXJzXG4gIGlmIChyZWdleHBbMF0gPT09ICcvJykge1xuICAgIGlmICh0YWlsKSBtb2RpZmllcnMgPSB0YWlsWzFdO1xuICAgIHJlZ2V4cCA9IHJlZ2V4cC5zbGljZSgxLCByZWdleHAubGVuZ3RoIC0gbW9kaWZpZXJzLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXhwLCBtb2RpZmllcnMpO1xufVxuXG5mdW5jdGlvbiByZXByZXNlbnRKYXZhc2NyaXB0UmVnRXhwKG9iamVjdCAvKiwgc3R5bGUqLykge1xuICB2YXIgcmVzdWx0ID0gJy8nICsgb2JqZWN0LnNvdXJjZSArICcvJztcblxuICBpZiAob2JqZWN0Lmdsb2JhbCkgcmVzdWx0ICs9ICdnJztcbiAgaWYgKG9iamVjdC5tdWx0aWxpbmUpIHJlc3VsdCArPSAnbSc7XG4gIGlmIChvYmplY3QuaWdub3JlQ2FzZSkgcmVzdWx0ICs9ICdpJztcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc1JlZ0V4cChvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6anMvcmVnZXhwJywge1xuICBraW5kOiAnc2NhbGFyJyxcbiAgcmVzb2x2ZTogcmVzb2x2ZUphdmFzY3JpcHRSZWdFeHAsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0SmF2YXNjcmlwdFJlZ0V4cCxcbiAgcHJlZGljYXRlOiBpc1JlZ0V4cCxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRKYXZhc2NyaXB0UmVnRXhwXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFR5cGUgPSByZXF1aXJlKCcuLi8uLi90eXBlJyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVKYXZhc2NyaXB0VW5kZWZpbmVkKCkge1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0SmF2YXNjcmlwdFVuZGVmaW5lZCgpIHtcbiAgLyplc2xpbnQtZGlzYWJsZSBuby11bmRlZmluZWQqL1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiByZXByZXNlbnRKYXZhc2NyaXB0VW5kZWZpbmVkKCkge1xuICByZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKG9iamVjdCkge1xuICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOmpzL3VuZGVmaW5lZCcsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIHJlc29sdmU6IHJlc29sdmVKYXZhc2NyaXB0VW5kZWZpbmVkLFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdEphdmFzY3JpcHRVbmRlZmluZWQsXG4gIHByZWRpY2F0ZTogaXNVbmRlZmluZWQsXG4gIHJlcHJlc2VudDogcmVwcmVzZW50SmF2YXNjcmlwdFVuZGVmaW5lZFxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBUeXBlID0gcmVxdWlyZSgnLi4vdHlwZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBUeXBlKCd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLCB7XG4gIGtpbmQ6ICdtYXBwaW5nJyxcbiAgY29uc3RydWN0OiBmdW5jdGlvbiAoZGF0YSkgeyByZXR1cm4gZGF0YSAhPT0gbnVsbCA/IGRhdGEgOiB7fTsgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBUeXBlID0gcmVxdWlyZSgnLi4vdHlwZScpO1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbE1lcmdlKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEgPT09ICc8PCcgfHwgZGF0YSA9PT0gbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6bWVyZ2UnLCB7XG4gIGtpbmQ6ICdzY2FsYXInLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbE1lcmdlXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sTnVsbChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gdHJ1ZTtcblxuICB2YXIgbWF4ID0gZGF0YS5sZW5ndGg7XG5cbiAgcmV0dXJuIChtYXggPT09IDEgJiYgZGF0YSA9PT0gJ34nKSB8fFxuICAgICAgICAgKG1heCA9PT0gNCAmJiAoZGF0YSA9PT0gJ251bGwnIHx8IGRhdGEgPT09ICdOdWxsJyB8fCBkYXRhID09PSAnTlVMTCcpKTtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0WWFtbE51bGwoKSB7XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc051bGwob2JqZWN0KSB7XG4gIHJldHVybiBvYmplY3QgPT09IG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLCB7XG4gIGtpbmQ6ICdzY2FsYXInLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbE51bGwsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbE51bGwsXG4gIHByZWRpY2F0ZTogaXNOdWxsLFxuICByZXByZXNlbnQ6IHtcbiAgICBjYW5vbmljYWw6IGZ1bmN0aW9uICgpIHsgcmV0dXJuICd+JzsgICAgfSxcbiAgICBsb3dlcmNhc2U6IGZ1bmN0aW9uICgpIHsgcmV0dXJuICdudWxsJzsgfSxcbiAgICB1cHBlcmNhc2U6IGZ1bmN0aW9uICgpIHsgcmV0dXJuICdOVUxMJzsgfSxcbiAgICBjYW1lbGNhc2U6IGZ1bmN0aW9uICgpIHsgcmV0dXJuICdOdWxsJzsgfVxuICB9LFxuICBkZWZhdWx0U3R5bGU6ICdsb3dlcmNhc2UnXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJyk7XG5cbnZhciBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIF90b1N0cmluZyAgICAgICA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sT21hcChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gdHJ1ZTtcblxuICB2YXIgb2JqZWN0S2V5cyA9IFtdLCBpbmRleCwgbGVuZ3RoLCBwYWlyLCBwYWlyS2V5LCBwYWlySGFzS2V5LFxuICAgICAgb2JqZWN0ID0gZGF0YTtcblxuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBwYWlyID0gb2JqZWN0W2luZGV4XTtcbiAgICBwYWlySGFzS2V5ID0gZmFsc2U7XG5cbiAgICBpZiAoX3RvU3RyaW5nLmNhbGwocGFpcikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHBhaXJLZXkgaW4gcGFpcikge1xuICAgICAgaWYgKF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHBhaXIsIHBhaXJLZXkpKSB7XG4gICAgICAgIGlmICghcGFpckhhc0tleSkgcGFpckhhc0tleSA9IHRydWU7XG4gICAgICAgIGVsc2UgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcGFpckhhc0tleSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKG9iamVjdEtleXMuaW5kZXhPZihwYWlyS2V5KSA9PT0gLTEpIG9iamVjdEtleXMucHVzaChwYWlyS2V5KTtcbiAgICBlbHNlIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sT21hcChkYXRhKSB7XG4gIHJldHVybiBkYXRhICE9PSBudWxsID8gZGF0YSA6IFtdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBUeXBlKCd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJywge1xuICBraW5kOiAnc2VxdWVuY2UnLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbE9tYXAsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbE9tYXBcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKTtcblxudmFyIF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmZ1bmN0aW9uIHJlc29sdmVZYW1sUGFpcnMoZGF0YSkge1xuICBpZiAoZGF0YSA9PT0gbnVsbCkgcmV0dXJuIHRydWU7XG5cbiAgdmFyIGluZGV4LCBsZW5ndGgsIHBhaXIsIGtleXMsIHJlc3VsdCxcbiAgICAgIG9iamVjdCA9IGRhdGE7XG5cbiAgcmVzdWx0ID0gbmV3IEFycmF5KG9iamVjdC5sZW5ndGgpO1xuXG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBvYmplY3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIHBhaXIgPSBvYmplY3RbaW5kZXhdO1xuXG4gICAgaWYgKF90b1N0cmluZy5jYWxsKHBhaXIpICE9PSAnW29iamVjdCBPYmplY3RdJykgcmV0dXJuIGZhbHNlO1xuXG4gICAga2V5cyA9IE9iamVjdC5rZXlzKHBhaXIpO1xuXG4gICAgaWYgKGtleXMubGVuZ3RoICE9PSAxKSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXN1bHRbaW5kZXhdID0gWyBrZXlzWzBdLCBwYWlyW2tleXNbMF1dIF07XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0WWFtbFBhaXJzKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBbXTtcblxuICB2YXIgaW5kZXgsIGxlbmd0aCwgcGFpciwga2V5cywgcmVzdWx0LFxuICAgICAgb2JqZWN0ID0gZGF0YTtcblxuICByZXN1bHQgPSBuZXcgQXJyYXkob2JqZWN0Lmxlbmd0aCk7XG5cbiAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgcGFpciA9IG9iamVjdFtpbmRleF07XG5cbiAgICBrZXlzID0gT2JqZWN0LmtleXMocGFpcik7XG5cbiAgICByZXN1bHRbaW5kZXhdID0gWyBrZXlzWzBdLCBwYWlyW2tleXNbMF1dIF07XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBUeXBlKCd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycycsIHtcbiAga2luZDogJ3NlcXVlbmNlJyxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxQYWlycyxcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sUGFpcnNcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6c2VxJywge1xuICBraW5kOiAnc2VxdWVuY2UnLFxuICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uIChkYXRhKSB7IHJldHVybiBkYXRhICE9PSBudWxsID8gZGF0YSA6IFtdOyB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJyk7XG5cbnZhciBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbFNldChkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gdHJ1ZTtcblxuICB2YXIga2V5LCBvYmplY3QgPSBkYXRhO1xuXG4gIGZvciAoa2V5IGluIG9iamVjdCkge1xuICAgIGlmIChfaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpIHtcbiAgICAgIGlmIChvYmplY3Rba2V5XSAhPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sU2V0KGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDoge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOnNldCcsIHtcbiAga2luZDogJ21hcHBpbmcnLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbFNldCxcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sU2V0XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFR5cGUgPSByZXF1aXJlKCcuLi90eXBlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFR5cGUoJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicsIHtcbiAga2luZDogJ3NjYWxhcicsXG4gIGNvbnN0cnVjdDogZnVuY3Rpb24gKGRhdGEpIHsgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDogJyc7IH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVHlwZSA9IHJlcXVpcmUoJy4uL3R5cGUnKTtcblxudmFyIFlBTUxfREFURV9SRUdFWFAgPSBuZXcgUmVnRXhwKFxuICAnXihbMC05XVswLTldWzAtOV1bMC05XSknICAgICAgICAgICsgLy8gWzFdIHllYXJcbiAgJy0oWzAtOV1bMC05XSknICAgICAgICAgICAgICAgICAgICArIC8vIFsyXSBtb250aFxuICAnLShbMC05XVswLTldKSQnKTsgICAgICAgICAgICAgICAgICAgLy8gWzNdIGRheVxuXG52YXIgWUFNTF9USU1FU1RBTVBfUkVHRVhQID0gbmV3IFJlZ0V4cChcbiAgJ14oWzAtOV1bMC05XVswLTldWzAtOV0pJyAgICAgICAgICArIC8vIFsxXSB5ZWFyXG4gICctKFswLTldWzAtOV0/KScgICAgICAgICAgICAgICAgICAgKyAvLyBbMl0gbW9udGhcbiAgJy0oWzAtOV1bMC05XT8pJyAgICAgICAgICAgICAgICAgICArIC8vIFszXSBkYXlcbiAgJyg/OltUdF18WyBcXFxcdF0rKScgICAgICAgICAgICAgICAgICsgLy8gLi4uXG4gICcoWzAtOV1bMC05XT8pJyAgICAgICAgICAgICAgICAgICAgKyAvLyBbNF0gaG91clxuICAnOihbMC05XVswLTldKScgICAgICAgICAgICAgICAgICAgICsgLy8gWzVdIG1pbnV0ZVxuICAnOihbMC05XVswLTldKScgICAgICAgICAgICAgICAgICAgICsgLy8gWzZdIHNlY29uZFxuICAnKD86XFxcXC4oWzAtOV0qKSk/JyAgICAgICAgICAgICAgICAgKyAvLyBbN10gZnJhY3Rpb25cbiAgJyg/OlsgXFxcXHRdKihafChbLStdKShbMC05XVswLTldPyknICsgLy8gWzhdIHR6IFs5XSB0el9zaWduIFsxMF0gdHpfaG91clxuICAnKD86OihbMC05XVswLTldKSk/KSk/JCcpOyAgICAgICAgICAgLy8gWzExXSB0el9taW51dGVcblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxUaW1lc3RhbXAoZGF0YSkge1xuICBpZiAoZGF0YSA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoWUFNTF9EQVRFX1JFR0VYUC5leGVjKGRhdGEpICE9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKFlBTUxfVElNRVNUQU1QX1JFR0VYUC5leGVjKGRhdGEpICE9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sVGltZXN0YW1wKGRhdGEpIHtcbiAgdmFyIG1hdGNoLCB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZnJhY3Rpb24gPSAwLFxuICAgICAgZGVsdGEgPSBudWxsLCB0el9ob3VyLCB0el9taW51dGUsIGRhdGU7XG5cbiAgbWF0Y2ggPSBZQU1MX0RBVEVfUkVHRVhQLmV4ZWMoZGF0YSk7XG4gIGlmIChtYXRjaCA9PT0gbnVsbCkgbWF0Y2ggPSBZQU1MX1RJTUVTVEFNUF9SRUdFWFAuZXhlYyhkYXRhKTtcblxuICBpZiAobWF0Y2ggPT09IG51bGwpIHRocm93IG5ldyBFcnJvcignRGF0ZSByZXNvbHZlIGVycm9yJyk7XG5cbiAgLy8gbWF0Y2g6IFsxXSB5ZWFyIFsyXSBtb250aCBbM10gZGF5XG5cbiAgeWVhciA9ICsobWF0Y2hbMV0pO1xuICBtb250aCA9ICsobWF0Y2hbMl0pIC0gMTsgLy8gSlMgbW9udGggc3RhcnRzIHdpdGggMFxuICBkYXkgPSArKG1hdGNoWzNdKTtcblxuICBpZiAoIW1hdGNoWzRdKSB7IC8vIG5vIGhvdXJcbiAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGgsIGRheSkpO1xuICB9XG5cbiAgLy8gbWF0Y2g6IFs0XSBob3VyIFs1XSBtaW51dGUgWzZdIHNlY29uZCBbN10gZnJhY3Rpb25cblxuICBob3VyID0gKyhtYXRjaFs0XSk7XG4gIG1pbnV0ZSA9ICsobWF0Y2hbNV0pO1xuICBzZWNvbmQgPSArKG1hdGNoWzZdKTtcblxuICBpZiAobWF0Y2hbN10pIHtcbiAgICBmcmFjdGlvbiA9IG1hdGNoWzddLnNsaWNlKDAsIDMpO1xuICAgIHdoaWxlIChmcmFjdGlvbi5sZW5ndGggPCAzKSB7IC8vIG1pbGxpLXNlY29uZHNcbiAgICAgIGZyYWN0aW9uICs9ICcwJztcbiAgICB9XG4gICAgZnJhY3Rpb24gPSArZnJhY3Rpb247XG4gIH1cblxuICAvLyBtYXRjaDogWzhdIHR6IFs5XSB0el9zaWduIFsxMF0gdHpfaG91ciBbMTFdIHR6X21pbnV0ZVxuXG4gIGlmIChtYXRjaFs5XSkge1xuICAgIHR6X2hvdXIgPSArKG1hdGNoWzEwXSk7XG4gICAgdHpfbWludXRlID0gKyhtYXRjaFsxMV0gfHwgMCk7XG4gICAgZGVsdGEgPSAodHpfaG91ciAqIDYwICsgdHpfbWludXRlKSAqIDYwMDAwOyAvLyBkZWx0YSBpbiBtaWxpLXNlY29uZHNcbiAgICBpZiAobWF0Y2hbOV0gPT09ICctJykgZGVsdGEgPSAtZGVsdGE7XG4gIH1cblxuICBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIGZyYWN0aW9uKSk7XG5cbiAgaWYgKGRlbHRhKSBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgLSBkZWx0YSk7XG5cbiAgcmV0dXJuIGRhdGU7XG59XG5cbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxUaW1lc3RhbXAob2JqZWN0IC8qLCBzdHlsZSovKSB7XG4gIHJldHVybiBvYmplY3QudG9JU09TdHJpbmcoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVHlwZSgndGFnOnlhbWwub3JnLDIwMDI6dGltZXN0YW1wJywge1xuICBraW5kOiAnc2NhbGFyJyxcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxUaW1lc3RhbXAsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbFRpbWVzdGFtcCxcbiAgaW5zdGFuY2VPZjogRGF0ZSxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sVGltZXN0YW1wXG59KTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB5YW1sID0gcmVxdWlyZSgnanMteWFtbCcpLFxuICAgIHNob3J0ZW5UZXh0ID0gcmVxdWlyZSgnLi9oZWxwZXJzL3Nob3J0ZW4tdGV4dCcpLFxuICAgIGJhc2VBdHRyID0gXCJkYXRhLTRjXCIsXG4gICAgTUFYX0NPTlRFWFRfQ1JFRElUX0xFTkdUSCA9IDUwLFxuICAgIE1BWF9MSU5LU19USVRMRV9MRU5HVEggPSA1MCxcbiAgICBNQVhfQkFDS1NUT1JZX0FVVEhPUl9MRU5HVEggPSA1MCxcbiAgICBNQVhfQkFDS1NUT1JZX01BR0FaSU5FX0xFTkdUSCA9IDUwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvblN1Y2Nlc3MsIG9uRmFpbHVyZSkge1xuICAgIHZhciB5YW1sUGF0aCA9IHRoaXMuZ2V0QXR0cmlidXRlKGJhc2VBdHRyKSB8fCB0aGlzLnNyYy5zdWJzdHIoMCwgdGhpcy5zcmMubGFzdEluZGV4T2YoXCIuXCIpKSArIFwiLnlhbWxcIjtcbiAgICBsb2FkWWFtbCh5YW1sUGF0aCwgb25TdWNjZXNzLCBvbkZhaWx1cmUpO1xufTtcblxuZnVuY3Rpb24gbG9hZFlhbWwocGF0aCwgc3VjY2VzcywgZXJyb3IpIHtcbiAgICBlcnJvciA9IGVycm9yIHx8IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfTtcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB5YW1sLnNhZmVMb2FkKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgIGlmICghZGF0YUlzVmFsaWQocGF0aCwgZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhZGRMaW5rVHlwZXMoZGF0YS5saW5rcyk7XG4gICAgICAgICAgICAgICAgICAgIHNob3J0ZW5EYXRhVGV4dChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyhkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVycm9yKHhocik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHhoci5vcGVuKFwiR0VUXCIsIHBhdGgsIHRydWUpO1xuICAgIHhoci5zZW5kKCk7XG59XG5cbmZ1bmN0aW9uIGRhdGFJc1ZhbGlkKHBhdGgsIGRhdGEpIHtcbiAgICByZXR1cm4gY29udGV4dElzVmFsaWQocGF0aCwgZGF0YSkgJiZcbiAgICAgICAgbGlua3NBcmVWYWxpZChwYXRoLCBkYXRhKSAmJlxuICAgICAgICBiYWNrU3RvcnlJc1ZhbGlkKHBhdGgsIGRhdGEpICYmXG4gICAgICAgIGNyZWF0aXZlQ29tbW9uc0FyZVZhbGlkKHBhdGgsIGRhdGEpO1xufVxuXG5mdW5jdGlvbiBjb250ZXh0SXNWYWxpZChwYXRoLCBkYXRhKSB7XG4gICAgaWYgKCFkYXRhLmNvbnRleHQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKHBhdGgsICc6IFxcJ2NvbnRleHRcXCcgaXMgbm90IGRlZmluZWQnKTtcbiAgICB9XG4gICAgaWYgKGRhdGEuY29udGV4dCAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0YS5jb250ZXh0KSAhPSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgIHRocm93IHBhdGggKyAnOiBcXCdjb250ZXh0XFwnIG11c3QgYmUgYSBsaXN0JztcbiAgICB9IGVsc2UgaWYgKGRhdGEuY29udGV4dCkge1xuICAgICAgICB2YXIgdG9EZWxldGUgPSBbXTtcbiAgICAgICAgZGF0YS5jb250ZXh0LmZvckVhY2goZnVuY3Rpb24gKGVsLCBpKSB7XG4gICAgICAgICAgICBpZiAoIWVsLnNyYyAmJiAhZWwueW91dHViZV9pZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdjb250ZXh0XFwnLCBlbGVtZW50IG51bWJlcicsIFN0cmluZyhpICsgMSksXG4gICAgICAgICAgICAgICAgICAgICcgLSBcXCdzcmNcXCcgYW5kIFxcJ3lvdXR1YmVfaWRcXCcgYXJlIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgICAgICAgICAgdG9EZWxldGUucHVzaChlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0b0RlbGV0ZS5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgdmFyIGogPSBkYXRhLmNvbnRleHQuaW5kZXhPZihlbCk7XG4gICAgICAgICAgICBkYXRhLmNvbnRleHQuc3BsaWNlKGosIDEpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGxpbmtzQXJlVmFsaWQocGF0aCwgZGF0YSkge1xuICAgIGlmICghZGF0YS5saW5rcykge1xuICAgICAgICBjb25zb2xlLndhcm4ocGF0aCwgJzogXFwnbGlua3NcXCcgYXJlIG5vdCBkZWZpbmVkJyk7XG4gICAgfVxuICAgIGlmIChkYXRhLmxpbmtzICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhLmxpbmtzKSAhPSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgIHRocm93IHBhdGggKyAnOiBcXCdsaW5rc1xcJyBtdXN0IGJlIGEgbGlzdCc7XG4gICAgfSBlbHNlIGlmIChkYXRhLmxpbmtzKSB7XG4gICAgICAgIHZhciB0b0RlbGV0ZSA9IFtdO1xuICAgICAgICBkYXRhLmxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGVsLCBpKSB7XG4gICAgICAgICAgICBpZiAoIWVsLnVybCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdsaW5rc1xcJywgZWxlbWVudCBudW1iZXInLCBTdHJpbmcoaSArIDEpLFxuICAgICAgICAgICAgICAgICAgICAnIC0gXFwndXJsXFwnIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgICAgICAgICAgdG9EZWxldGUucHVzaChlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0b0RlbGV0ZS5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgaiA9IGRhdGEubGlua3MuaW5kZXhPZihlbCk7XG4gICAgICAgICAgICBkYXRhLmxpbmtzLnNwbGljZShqLCAxKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYWNrU3RvcnlJc1ZhbGlkKHBhdGgsIGRhdGEpIHtcbiAgICBpZiAoIWRhdGEuYmFja1N0b3J5KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdiYWNrU3RvcnlcXCcgaXMgbm90IGRlZmluZWQnKTtcbiAgICB9XG4gICAgaWYgKGRhdGEuYmFja1N0b3J5ICYmICFkYXRhLmJhY2tTdG9yeS50ZXh0KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihwYXRoLCAnOiBcXCdiYWNrU3RvcnlcXCcgaGFzIG5vIHRleHQnKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGl2ZUNvbW1vbnNBcmVWYWxpZChwYXRoLCBkYXRhKSB7XG4gICAgaWYgKCFkYXRhLmNyZWF0aXZlQ29tbW9ucykge1xuICAgICAgICBjb25zb2xlLndhcm4ocGF0aCwgJzogXFwnY3JlYXRpdmVDb21tb25zXFwnIGFyZSBub3QgZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAoZGF0YS5jcmVhdGl2ZUNvbW1vbnMgJiYgIWRhdGEuY3JlYXRpdmVDb21tb25zLmNvcHlyaWdodCkge1xuICAgICAgICBjb25zb2xlLndhcm4ocGF0aCwgJzogXFwnY3JlYXRpdmVDb21tb25zXFwnIC0gYXV0aG9yIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gYWRkTGlua1R5cGVzKGxpbmtzTGlzdCkge1xuICAgIGlmICghbGlua3NMaXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGlua3NMaXN0LmZvckVhY2goZnVuY3Rpb24obGluaykge1xuICAgICAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgYS5ocmVmID0gbGluay51cmw7XG4gICAgICAgIGxpbmsudHlwZSA9IGEuaG9zdG5hbWUubWF0Y2goJ3dpa2lwZWRpYScpICE9IG51bGwgPyAnd2lraXBlZGlhLXcnIDogJ2xpbmsnO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzaG9ydGVuRGF0YVRleHQoZGF0YSkge1xuICAgIHNob3J0ZW5Db250ZXh0VGV4dChkYXRhLmNvbnRleHQpO1xuICAgIHNob3J0ZW5MaW5rc1RleHQoZGF0YS5saW5rcyk7XG4gICAgc2hvcnRlbkJhY2tzdG9yeShkYXRhLmJhY2tTdG9yeSk7XG59XG5cbmZ1bmN0aW9uIHNob3J0ZW5Db250ZXh0VGV4dChjb250ZXh0TGlzdCkge1xuICAgIGlmICghY29udGV4dExpc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb250ZXh0TGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICAgICAgaWYgKGNvbnRleHQuY3JlZGl0KSB7XG4gICAgICAgICAgICBjb250ZXh0LmNyZWRpdCA9IHNob3J0ZW5UZXh0KGNvbnRleHQuY3JlZGl0LCBNQVhfQ09OVEVYVF9DUkVESVRfTEVOR1RIKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzaG9ydGVuTGlua3NUZXh0KGxpbmtzTGlzdCkge1xuICAgIGlmICghbGlua3NMaXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGlua3NMaXN0LmZvckVhY2goZnVuY3Rpb24obGluaykge1xuICAgICAgICBpZiAobGluay50aXRsZSkge1xuICAgICAgICAgICAgbGluay50aXRsZSA9IHNob3J0ZW5UZXh0KGxpbmsudGl0bGUsIE1BWF9MSU5LU19USVRMRV9MRU5HVEgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGluay50aXRsZSA9IHNob3J0ZW5UZXh0KGxpbmsudXJsLCBNQVhfTElOS1NfVElUTEVfTEVOR1RIKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzaG9ydGVuQmFja3N0b3J5KGJhY2tTdG9yeSkge1xuICAgIGlmICghYmFja1N0b3J5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGJhY2tTdG9yeS5hdXRob3IpIHtcbiAgICAgICAgYmFja1N0b3J5LmF1dGhvciA9IHNob3J0ZW5UZXh0KGJhY2tTdG9yeS5hdXRob3IsIE1BWF9CQUNLU1RPUllfQVVUSE9SX0xFTkdUSCk7XG4gICAgfVxuICAgIGlmIChiYWNrU3RvcnkubWFnYXppbmUpIHtcbiAgICAgICAgYmFja1N0b3J5Lm1hZ2F6aW5lID0gc2hvcnRlblRleHQoYmFja1N0b3J5Lm1hZ2F6aW5lLCBNQVhfQkFDS1NUT1JZX01BR0FaSU5FX0xFTkdUSCk7XG4gICAgfVxufSIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsLCBjbHMpIHtcbiAgICBpZiAoZWwuY2xhc3NMaXN0KSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoY2xzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xzO1xuICAgIH1cbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAxNS8wOC8yMDE2LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWwsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIGlmIChlbC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbChlbCwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG59OyIsIi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTc1NjczNDQvZGV0ZWN0LWxlZnQtcmlnaHQtc3dpcGUtb24tdG91Y2gtZGV2aWNlcy1idXQtYWxsb3ctdXAtZG93bi1zY3JvbGxpbmdcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3dpcGVMZWZ0TmFtZSA9ICdzd2lwZUxlZnQnLFxuICAgICAgICBzd2lwZVJpZ2h0TmFtZSA9ICdzd2lwZVJpZ2h0JyxcbiAgICAgICAgc3dpcGVVcE5hbWUgPSAnc3dpcGVVcCcsXG4gICAgICAgIHN3aXBlRG93bk5hbWUgPSAnc3dpcGVEb3duJztcblxuICAgIChmdW5jdGlvbiAoZCkge1xuICAgICAgICB2YXIgY2UgPSBmdW5jdGlvbiAoZSwgbikge1xuICAgICAgICAgICAgICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKTtcbiAgICAgICAgICAgICAgICBhLmluaXRDdXN0b21FdmVudChuLCB0cnVlLCB0cnVlLCBlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgZS50YXJnZXQuZGlzcGF0Y2hFdmVudChhKTtcbiAgICAgICAgICAgICAgICBhID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBubSA9IHRydWUsXG4gICAgICAgICAgICBzcCA9IHt4OiAwLCB5OiAwfSxcbiAgICAgICAgICAgIGVwID0ge3g6IDAsIHk6IDB9LFxuICAgICAgICAgICAgdG91Y2ggPSB7XG4gICAgICAgICAgICAgICAgdG91Y2hzdGFydDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3AgPSB7eDogZS50b3VjaGVzWzBdLnBhZ2VYLCB5OiBlLnRvdWNoZXNbMF0ucGFnZVl9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG91Y2htb3ZlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBubSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBlcCA9IHt4OiBlLnRvdWNoZXNbMF0ucGFnZVgsIHk6IGUudG91Y2hlc1swXS5wYWdlWX07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b3VjaGVuZDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZShlLCAnZmMnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB4ID0gZXAueCAtIHNwLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeHIgPSBNYXRoLmFicyh4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0gZXAueSAtIHNwLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeXIgPSBNYXRoLmFicyh5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNYXRoLm1heCh4ciwgeXIpID4gMjApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZShlLCAoeHIgPiB5ciA/ICh4IDwgMCA/IHN3aXBlTGVmdE5hbWUgOiBzd2lwZVJpZ2h0TmFtZSkgOiAoeSA8IDAgPyBzd2lwZVVwTmFtZSA6IHN3aXBlRG93bk5hbWUpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbm0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG91Y2hjYW5jZWw6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5tID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICBmb3IgKHZhciBhIGluIHRvdWNoKSB7XG4gICAgICAgICAgICBkLmFkZEV2ZW50TGlzdGVuZXIoYSwgdG91Y2hbYV0sIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgfSkoZG9jdW1lbnQpO1xufTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2V0RWxlbWVudFN0eWxlcyA9IHJlcXVpcmUoJy4vZ2V0LWVsZW1lbnQtc3R5bGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZnJvbURvbSwgdG9Eb20pIHtcbiAgICAvL0ZpeG1lOiBNYXJnaW5zIGFyZSB0cmFuc2Zvcm1lZCBieSB0aGUgZ2V0Q29tcHV0ZWRTdHlsZS5cbiAgICAvLyBJbiBDaHJvbWUgaW5zdGVhZCBvZiAnYXV0bycgYSBzdGF0aWMgdmFsdWUgaXMgcmV0dXJuZWQsIGluIEZpcmVmb3ggLSAwLlxuICAgIC8vIFBvdGVudGlhbCBzb2x1dGlvbiBnZXQgYWxsIGNzcyBmcm9tIHN0eWxlc2hlZXRzIChJbiBDaHJvbWUgaW5zdGVhZCBvZiAnYXV0bycgYSBzdGF0aWMgdmFsdWUgaXMgcmV0dXJuZWQsIGluIEZpcmVmb3ggLSAwLilcbiAgICAvLyBhbmQgZnJvbSBzdHlsZSBhdHRyaWJ1dGUgYW5kIGFwcGx5IHRob3NlIHRvIHRvRG9tLlxuXG4gICAgdmFyIHN0eWxlcyA9IGdldEVsZW1lbnRTdHlsZXMoZnJvbURvbSk7XG4gICAgZm9yICh2YXIgaSBpbiBzdHlsZXMpIHtcbiAgICAgICAgaWYgKHN0eWxlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgdG9Eb20uc3R5bGVbaV0gPSBzdHlsZXNbaV07XG4gICAgICAgIH1cbiAgICB9XG59OyIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGF0dHJpYnV0ZSwgZWwpIHtcbiAgICBpZiAoZWwgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVsID0gZG9jdW1lbnQ7XG4gICAgfVxuICAgIHZhciBtYXRjaGluZ0VsZW1lbnRzID0gW107XG4gICAgdmFyIGFsbEVsZW1lbnRzID0gZWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJyonKTtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGFsbEVsZW1lbnRzLCBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGlmIChlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBFbGVtZW50IGV4aXN0cyB3aXRoIGF0dHJpYnV0ZS4gQWRkIHRvIGFycmF5LlxuICAgICAgICAgICAgbWF0Y2hpbmdFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGNoaW5nRWxlbWVudHM7XG59OyIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMTUvMDgvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRvbSkge1xuICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKGRvbSk7XG59O1xuXG5mdW5jdGlvbiBnZXRDb21wdXRlZFN0eWxlKGRvbSkge1xuICAgIHZhciBzdHlsZSwgcmV0dXJucywgbWFyZ2lucztcbiAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb20sIG51bGwpO1xuICAgICAgICByZXR1cm5zID0ge307XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc3R5bGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcHJvcCA9IHN0eWxlW2ldLFxuICAgICAgICAgICAgICAgIGNhbWVsID0gY2FtZWxpemUocHJvcCksXG4gICAgICAgICAgICAgICAgdmFsID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9wKTtcbiAgICAgICAgICAgIHJldHVybnNbY2FtZWxdID0gdmFsO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChzdHlsZSA9IGRvbS5jdXJyZW50U3R5bGUpIHtcbiAgICAgICAgcmV0dXJucyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHN0eWxlKSB7XG4gICAgICAgICAgICByZXR1cm5zW3Byb3BdID0gc3R5bGVbcHJvcF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJldHVybnMpIHtcbiAgICAgICAgbWFyZ2lucyA9IGdldFN0eWxlU2hlZXRNYXJnaW5zKGRvbSk7XG4gICAgICAgIGZvciAodmFyIGkgaW4gbWFyZ2lucykge1xuICAgICAgICAgICAgcmV0dXJuc1tpXSA9IG1hcmdpbnNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldHVybnM7XG59XG5cbmZ1bmN0aW9uIGdldFN0eWxlU2hlZXRNYXJnaW5zKGRvbSkge1xuICAgIC8vIEdldCBhbGwgc3R5bGVzaGVldHMgYW5kIGVsZW1lbnQnIHN0eWxlIGF0dHJpYnV0ZVxuICAgIHZhciBzaGVldHMgPSBkb2N1bWVudC5zdHlsZVNoZWV0cywgbyA9IFtdLCBzdHlsZSA9IGRvbS5nZXRBdHRyaWJ1dGUoJ3N0eWxlJyksXG4gICAgICAgIG1hcmdpbiA9IHt9O1xuICAgIC8vIEdldCBlbGVtZW50J3MgYnJvd3NlciBzcGVjaWZpYyBjc3MgcnVsZXMgbWF0Y2ggbWV0aG9kXG4gICAgZG9tLm1hdGNoZXMgPSBkb20ubWF0Y2hlcyB8fCBkb20ud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IGRvbS5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgZG9tLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IGRvbS5vTWF0Y2hlc1NlbGVjdG9yO1xuICAgIGZvciAodmFyIGkgaW4gc2hlZXRzKSB7XG4gICAgICAgIHZhciBydWxlcyA9IHNoZWV0c1tpXS5ydWxlcyB8fCBzaGVldHNbaV0uY3NzUnVsZXM7XG4gICAgICAgIGZvciAodmFyIHIgaW4gcnVsZXMpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RvciA9IHJ1bGVzW3JdLnNlbGVjdG9yVGV4dCxcbiAgICAgICAgICAgICAgICBydWxlID0gcnVsZXNbcl0uY3NzVGV4dDtcbiAgICAgICAgICAgIGlmICghZG9tLm1hdGNoZXMoc2VsZWN0b3IpIHx8IHJ1bGUubWF0Y2goXCJtYXJnaW5cIikgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHN0eWxlUnVsZXMgPSBzcGxpdENzc1J1bGUocnVsZSk7XG4gICAgICAgICAgICBhcHBseVN0eWxlc1RvTWFyZ2luKG1hcmdpbiwgc3R5bGVSdWxlcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHN0eWxlKSB7XG4gICAgICAgIHZhciBzdHlsZVJ1bGVzID0gc3BsaXRTdHlsZVJ1bGUoc3R5bGUpO1xuICAgICAgICBhcHBseVN0eWxlc1RvTWFyZ2luKG1hcmdpbiwgc3R5bGVSdWxlcyk7XG4gICAgfVxuICAgIHJldHVybiBtYXJnaW47XG59XG5cbmZ1bmN0aW9uIGFwcGx5U3R5bGVzVG9NYXJnaW4obWFyZ2luLCBzdHlsZVJ1bGVzKSB7XG4gICAgc3R5bGVSdWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBpZiAoZWxbMF0ubWF0Y2goXCJtYXJnaW5cIikpIHtcbiAgICAgICAgICAgIHZhciBtID0ge307XG4gICAgICAgICAgICBpZiAoZWxbMF0gPT0gXCJtYXJnaW5cIikge1xuICAgICAgICAgICAgICAgIG0gPSBzcGxpdE1hcmdpbihlbFsxXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1bZWxbMF1dID0gZWxbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIG0pIHtcbiAgICAgICAgICAgICAgICBtYXJnaW5ba10gPSBtW2tdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNwbGl0Q3NzUnVsZShydWxlKSB7XG4gICAgdmFyIGNsZWFuZWRSdWxlID0gY2xlYW5Dc3NSdWxlKHJ1bGUpO1xuICAgIHJldHVybiBzcGxpdFN0eWxlUnVsZShjbGVhbmVkUnVsZSk7XG59XG5cbmZ1bmN0aW9uIHNwbGl0U3R5bGVSdWxlKHJ1bGUpIHtcbiAgICB2YXIgcnVsZXMgPSBydWxlLnNwbGl0KC87L2cpO1xuICAgIHJ1bGVzID0gcnVsZXMuZmlsdGVyKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICByZXR1cm4gZWwgJiYgZWwucmVwbGFjZSgvXFxzKy9nLCAnJyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJ1bGVzLm1hcChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgdmFyIHMgPSBlbC5zcGxpdCgnOicpO1xuICAgICAgICBzWzBdID0gY2FtZWxpemUoc1swXS5yZXBsYWNlKC9cXHMrL2csICcnKSk7XG4gICAgICAgIHNbMV0gPSBzWzFdLnJlcGxhY2UoL1xcc1xccysvZywgJyAnKS5yZXBsYWNlKC8oXlxccyt8XFxzKyQpL2csICcnKTtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFuQ3NzUnVsZShydWxlKSB7XG4gICAgdmFyIGNsZWFuZWRSdWxlID0gcnVsZS5tYXRjaCgveyguKj8pfS9nKTtcbiAgICByZXR1cm4gY2xlYW5lZFJ1bGUubWFwKGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgcmV0dXJuIHZhbC5yZXBsYWNlKC8oe3x9fFxccyspL2csICcnKTtcbiAgICB9KVswXTtcbn1cblxuZnVuY3Rpb24gc3BsaXRNYXJnaW4obWFyZ2luUnVsZSkge1xuICAgIHZhciBtYXJnaW5zID0gbWFyZ2luUnVsZS5zcGxpdCgnICcpO1xuICAgIGlmIChtYXJnaW5zLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIG1hcmdpbnMuY29uY2F0KFttYXJnaW5zWzBdLCBtYXJnaW5zWzBdLCBtYXJnaW5zWzBdXSk7XG4gICAgfVxuICAgIGlmIChtYXJnaW5zLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIG1hcmdpbnMuY29uY2F0KG1hcmdpbnMpO1xuICAgIH1cbiAgICBpZiAobWFyZ2lucy5sZW5ndGggPT0gMykge1xuICAgICAgICBtYXJnaW5zLnB1c2gobWFyZ2luc1sxXSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIG1hcmdpblRvcDogbWFyZ2luc1swXSxcbiAgICAgICAgbWFyZ2luUmlnaHQ6IG1hcmdpbnNbMV0sXG4gICAgICAgIG1hcmdpbkJvdHRvbTogbWFyZ2luc1syXSxcbiAgICAgICAgbWFyZ2luTGVmdDogbWFyZ2luc1szXVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGNhbWVsaXplKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvXFwtKFthLXpdKS9nLCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gYi50b1VwcGVyQ2FzZSgpO1xuICAgIH0pO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMjcvMDgvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZpbGVOYW1lKSB7XG4gICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIHNjcmlwdC5zcmMgPSBmaWxlTmFtZTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdClcbn07XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbCwgY2xzKSB7XG4gICAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKGNscyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UobmV3IFJlZ0V4cCgnKF58XFxcXGIpJyArIGNscy5zcGxpdCgnICcpLmpvaW4oJ3wnKSArICcoXFxcXGJ8JCknLCAnZ2knKSwgJyAnKTtcbiAgICB9XG59OyIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMDEvMDkvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0ciwgbGVuKSB7XG4gICAgaWYgKHN0ci5sZW5ndGggPCBsZW4pIHtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3RyLnN1YnN0cigwLCBsZW4pLnJlcGxhY2UoL1xccyskLywgJycpICsgJy4uLic7XG4gICAgfVxufTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmFzZUF0dHIgPSBcImRhdGEtNGNcIixcbiAgICBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUgPSByZXF1aXJlKCcuL2hlbHBlcnMvZ2V0LWFsbC1lbGVtZW50cy13aXRoLWF0dHJpYnV0ZScpLFxuICAgIGFkZENsYXNzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2FkZC1jbGFzcycpLFxuICAgIHJlbW92ZUNsYXNzID0gcmVxdWlyZSgnLi9oZWxwZXJzL3JlbW92ZS1jbGFzcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkb20pIHtcblxuICAgIGZ1bmN0aW9uIEltYWdlTW9kZWwoKSB7XG4gICAgICAgIHRoaXMudG9wTGVmdENvcm5lciA9IG5ldyBHYWxsZXJ5Q29ybmVyTW9kZWwoKTtcbiAgICAgICAgdGhpcy50b3BSaWdodENvcm5lciA9IG5ldyBDb3JuZXJNb2RlbCgpO1xuICAgICAgICB0aGlzLmJvdHRvbUxlZnRDb3JuZXIgPSBuZXcgQ29ybmVyTW9kZWwoKTtcbiAgICAgICAgdGhpcy5ib3R0b21SaWdodENvcm5lciA9IG5ldyBDcmVhdGl2ZUNvbW1vbnNDb3JuZXIoKTtcbiAgICAgICAgdGhpcy50b29sc0hpZGRlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvcExlZnRDb3JuZXIudmlzaWJsZSB8fFxuICAgICAgICAgICAgICAgIHRoaXMudG9wUmlnaHRDb3JuZXIudmlzaWJsZSB8fFxuICAgICAgICAgICAgICAgIHRoaXMuYm90dG9tTGVmdENvcm5lci52aXNpYmxlIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5ib3R0b21SaWdodENvcm5lci52aXNpYmxlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIENvcm5lck1vZGVsKCkge1xuICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5waW5uZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5waW5uZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5waW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnBpbm5lZCA9ICF0aGlzLnBpbm5lZDtcbiAgICAgICAgICAgIGlmICh0aGlzLnBpbm5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gR2FsbGVyeUNvcm5lck1vZGVsKCkge1xuICAgICAgICB2YXIgZ2FsbGVyeURvbSA9IGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZShiYXNlQXR0ciArICctZ2FsbGVyeS1saXN0JywgZG9tKVswXSxcbiAgICAgICAgICAgIGdhbGxlcnlJdGVtRG9tcyA9IGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZShiYXNlQXR0ciArICctZ2FsbGVyeS1pdGVtJywgZ2FsbGVyeURvbSksXG4gICAgICAgICAgICBjYXB0aW9uRG9tcyA9IGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZShiYXNlQXR0ciArICctZ2FsbGVyeS1jYXB0aW9uJywgZG9tKTtcbiAgICAgICAgQ29ybmVyTW9kZWwuY2FsbCh0aGlzKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgdGhpcy5wcmVzZWxlY3RlZEl0ZW0gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuc2VsZWN0SXRlbSA9IGZ1bmN0aW9uIChldmVudCwgZWwpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IGdhbGxlcnlJdGVtRG9tcy5pbmRleE9mKGVsKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZWxlY3ROZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRJbmRleCA8IGdhbGxlcnlJdGVtRG9tcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4Kys7XG4gICAgICAgICAgICAgICAgZ290VG9JbmRleC5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNlbGVjdFByZXZpb3VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRJbmRleCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4LS07XG4gICAgICAgICAgICBnb3RUb0luZGV4LmNhbGwodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucHJlc2VsZWN0UHJldmlvdXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNlbGVjdGVkSXRlbSA9IGdhbGxlcnlJdGVtRG9tc1t0aGlzLnNlbGVjdGVkSW5kZXggLSAxXTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wcmVzZWxlY3ROZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5wcmVzZWxlY3RlZEl0ZW0gPSBnYWxsZXJ5SXRlbURvbXNbdGhpcy5zZWxlY3RlZEluZGV4ICsgMV07XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY2xlYXJQcmVzZWxlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNlbGVjdGVkSXRlbSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRQcmV2Q29udHJvbGxlckhpZGRlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkSW5kZXggPD0gMDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXROZXh0Q29udHJvbGxlckhpZGRlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkSW5kZXggPj0gZ2FsbGVyeUl0ZW1Eb21zLmxlbmd0aCAtIDE7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0SXRlbUlzUHJlc2VsZWN0ZWQgPSBmdW5jdGlvbiAoZG9tRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvbUVsZW1lbnQgPT0gdGhpcy5wcmVzZWxlY3RlZEl0ZW07XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0Q2FwdGlvblZpc2libGUgPSBmdW5jdGlvbiAoZG9tRWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvbUVsZW1lbnQgPT0gY2FwdGlvbkRvbXNbdGhpcy5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgfTtcbiAgICAgICAgZnVuY3Rpb24gZ2V0SW1hZ2VPZmZzZXRzKGVsZW1lbnRzKSB7XG4gICAgICAgICAgICB2YXIgb2Zmc2V0cyA9IFtdO1xuICAgICAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICBvZmZzZXRzLnB1c2goZWwub2Zmc2V0TGVmdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBvZmZzZXRzO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ290VG9JbmRleCgpIHtcbiAgICAgICAgICAgIGlmICghZ2FsbGVyeURvbSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuc2VsZWN0ZWRJbmRleCxcbiAgICAgICAgICAgICAgICBzY2FsZUNvbnN0YW50ID0gMC44LFxuICAgICAgICAgICAgICAgIGltYWdlT2Zmc2V0cyA9IGdldEltYWdlT2Zmc2V0cyhnYWxsZXJ5SXRlbURvbXMpO1xuICAgICAgICAgICAgZ2FsbGVyeUl0ZW1Eb21zLmZvckVhY2goZnVuY3Rpb24gKGRvbSwgaSkge1xuICAgICAgICAgICAgICAgIGlmIChpID09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZENsYXNzKGRvbSwgJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3MoZG9tLCAnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGdhbGxlcnlEb20uc3R5bGUubWFyZ2luTGVmdCA9IC1pbWFnZU9mZnNldHNbaW5kZXhdICogc2NhbGVDb25zdGFudCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBnb3RUb0luZGV4LmNhbGwodGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gQ3JlYXRpdmVDb21tb25zQ29ybmVyKCkge1xuICAgICAgICBDb3JuZXJNb2RlbC5jYWxsKHRoaXMpO1xuICAgICAgICB0aGlzLmNvZGVPZkV0aGljc1Zpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50b2dnbGVDb2RlT2ZFdGhpY3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNvZGVPZkV0aGljc1Zpc2libGUgPSAhdGhpcy5jb2RlT2ZFdGhpY3NWaXNpYmxlO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEltYWdlTW9kZWwoKTtcblxufTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgVGltIE9zYWRjaGl5IG9uIDE1LzA4LzIwMTYuXG4gKi9cblxuLy8gVG9EbzogWW91VHViZSBsaW5rcyBvZnRlbiBjYXVzZSBhIGRlbGF5IHdoZW4gaG92ZXIgb24gYW55IG9mIGNvcm5lcnMgYmVmb3JlIG9wZW5pbmcgaXRcblxuJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3BvbHlmaWxscycpKCk7XG5cbnZhciBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUgPSByZXF1aXJlKCcuL2hlbHBlcnMvZ2V0LWFsbC1lbGVtZW50cy13aXRoLWF0dHJpYnV0ZScpLFxuICAgIGJhc2VBdHRyID0gXCJkYXRhLTRjXCIsXG4gICAgaW1ncyA9IGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZShiYXNlQXR0ciksXG4gICAgc2V0TWFpbkNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL3NldC1tYWluLWNvbnRyb2xsZXInKSxcbiAgICB3cmFwSW1hZ2UgPSByZXF1aXJlKCcuL3dyYXAtaW1hZ2UnKSxcbiAgICBpbWFnZU1vZGVsRmFjdG9yeSA9IHJlcXVpcmUoJy4vaW1hZ2UtbW9kZWwnKSxcbiAgICBnZXRJbWFnZURhdGEgPSByZXF1aXJlKCcuL2dldC1pbWFnZS1kYXRhJyk7XG5cbndpbmRvdy5vbmxvYWQgPSBpbml0O1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIHJlcXVpcmUoJy4vaGVscGVycy9hZGQtc3dpcGUtZXZlbnRzJykoKTtcbiAgICBpbnNlcnRGb250YXdlc29tZSgpO1xuICAgIGlmICh0cnVlKSB7XG4gICAgICAgIHJlcXVpcmUoJy4uL3RlbXAvc3R5bGUubWluLmNzcycpO1xuICAgIH1cbiAgICBpbWdzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIGlmIChlbC5jb21wbGV0ZSkge1xuICAgICAgICAgICAgYnVpbGQoZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWwub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJ1aWxkKGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBidWlsZChpbWdEb20pIHtcbiAgICBnZXRJbWFnZURhdGEuY2FsbChpbWdEb20sIGZ1bmN0aW9uIChpbWFnZURhdGEpIHtcbiAgICAgICAgdmFyIGRvbUNvbnRhaW5lciA9IHdyYXBJbWFnZS5jYWxsKGltZ0RvbSwgaW1hZ2VEYXRhKSxcbiAgICAgICAgICAgIG1vZGVsID0gaW1hZ2VNb2RlbEZhY3RvcnkoZG9tQ29udGFpbmVyKTtcbiAgICAgICAgc2V0TWFpbkNvbnRyb2xsZXIoZG9tQ29udGFpbmVyLCBtb2RlbCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGluc2VydEZvbnRhd2Vzb21lKCkge1xuICAgIC8vIFRvRG86IGZvbnRhd2Vzb21lIHNob3VsZCBub3QgYmUgbG9hZGVkIGZyb20gZXh0ZXJuYWwgQ0ROLlxuICAgIGlmICghZm9udGF3ZXNvbWVJc0xvYWRlZCgpKSB7XG4gICAgICAgIHJlcXVpcmUoJy4vaGVscGVycy9pbnNlcnQtc2NyaXB0JykoXCJodHRwczovL3VzZS5mb250YXdlc29tZS5jb20vZGNiZDUxYjU0Yi5qc1wiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZvbnRhd2Vzb21lSXNMb2FkZWQoKSB7XG4gICAgdmFyIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksXG4gICAgICAgIGxvYWRlZCA9IGZhbHNlO1xuICAgIHNwYW4uY2xhc3NOYW1lID0gJ2ZhJztcbiAgICBzcGFuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgZG9jdW1lbnQuYm9keS5pbnNlcnRCZWZvcmUoc3BhbiwgZG9jdW1lbnQuYm9keS5maXJzdENoaWxkKTtcblxuICAgIGZ1bmN0aW9uIGNzcyhlbGVtZW50LCBwcm9wZXJ0eSkge1xuICAgICAgICByZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSk7XG4gICAgfVxuXG4gICAgaWYgKGNzcyhzcGFuLCAnZm9udC1mYW1pbHknKSA9PT0gJ0ZvbnRBd2Vzb21lJykge1xuICAgICAgICBsb2FkZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gbG9hZGVkO1xufSIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMDMvMDkvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghQXJyYXkucHJvdG90eXBlLmZpbHRlcikge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24gKGZ1bi8qLCB0aGlzQXJnKi8pIHtcbiAgICAgICAgICAgICd1c2Ugc3RyaWN0JztcblxuICAgICAgICAgICAgaWYgKHRoaXMgPT09IHZvaWQgMCB8fCB0aGlzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICAgICAgICAgIHZhciBsZW4gPSB0Lmxlbmd0aCA+Pj4gMDtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZnVuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVzID0gW107XG4gICAgICAgICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50cy5sZW5ndGggPj0gMiA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaSBpbiB0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWwgPSB0W2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IFRlY2huaWNhbGx5IHRoaXMgc2hvdWxkIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBhdFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICB0aGUgbmV4dCBpbmRleCwgYXMgcHVzaCBjYW4gYmUgYWZmZWN0ZWQgYnlcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgcHJvcGVydGllcyBvbiBPYmplY3QucHJvdG90eXBlIGFuZCBBcnJheS5wcm90b3R5cGUuXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgIEJ1dCB0aGF0IG1ldGhvZCdzIG5ldywgYW5kIGNvbGxpc2lvbnMgc2hvdWxkIGJlXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgIHJhcmUsIHNvIHVzZSB0aGUgbW9yZS1jb21wYXRpYmxlIGFsdGVybmF0aXZlLlxuICAgICAgICAgICAgICAgICAgICBpZiAoZnVuLmNhbGwodGhpc0FyZywgdmFsLCBpLCB0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnB1c2godmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfTtcbiAgICB9XG59O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwMy8wOS8yMDE2LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA1LCAxNS40LjQuMThcbiAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuNC40LjE4XG4gICAgaWYgKCFBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkge1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG5cbiAgICAgICAgICAgIHZhciBULCBrO1xuXG4gICAgICAgICAgICBpZiAodGhpcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJyB0aGlzIGlzIG51bGwgb3Igbm90IGRlZmluZWQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gMS4gTGV0IE8gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRvT2JqZWN0KCkgcGFzc2luZyB0aGVcbiAgICAgICAgICAgIC8vIHx0aGlzfCB2YWx1ZSBhcyB0aGUgYXJndW1lbnQuXG4gICAgICAgICAgICB2YXIgTyA9IE9iamVjdCh0aGlzKTtcblxuICAgICAgICAgICAgLy8gMi4gTGV0IGxlblZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0KCkgaW50ZXJuYWxcbiAgICAgICAgICAgIC8vIG1ldGhvZCBvZiBPIHdpdGggdGhlIGFyZ3VtZW50IFwibGVuZ3RoXCIuXG4gICAgICAgICAgICAvLyAzLiBMZXQgbGVuIGJlIHRvVWludDMyKGxlblZhbHVlKS5cbiAgICAgICAgICAgIHZhciBsZW4gPSBPLmxlbmd0aCA+Pj4gMDtcblxuICAgICAgICAgICAgLy8gNC4gSWYgaXNDYWxsYWJsZShjYWxsYmFjaykgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgICAgIC8vIFNlZTogaHR0cDovL2VzNS5naXRodWIuY29tLyN4OS4xMVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihjYWxsYmFjayArICcgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gNS4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0XG4gICAgICAgICAgICAvLyBUIGJlIHVuZGVmaW5lZC5cbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIFQgPSB0aGlzQXJnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyA2LiBMZXQgayBiZSAwXG4gICAgICAgICAgICBrID0gMDtcblxuICAgICAgICAgICAgLy8gNy4gUmVwZWF0LCB3aGlsZSBrIDwgbGVuXG4gICAgICAgICAgICB3aGlsZSAoayA8IGxlbikge1xuXG4gICAgICAgICAgICAgICAgdmFyIGtWYWx1ZTtcblxuICAgICAgICAgICAgICAgIC8vIGEuIExldCBQayBiZSBUb1N0cmluZyhrKS5cbiAgICAgICAgICAgICAgICAvLyAgICBUaGlzIGlzIGltcGxpY2l0IGZvciBMSFMgb3BlcmFuZHMgb2YgdGhlIGluIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgLy8gYi4gTGV0IGtQcmVzZW50IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgSGFzUHJvcGVydHlcbiAgICAgICAgICAgICAgICAvLyAgICBpbnRlcm5hbCBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuICAgICAgICAgICAgICAgIC8vICAgIFRoaXMgc3RlcCBjYW4gYmUgY29tYmluZWQgd2l0aCBjXG4gICAgICAgICAgICAgICAgLy8gYy4gSWYga1ByZXNlbnQgaXMgdHJ1ZSwgdGhlblxuICAgICAgICAgICAgICAgIGlmIChrIGluIE8pIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpLiBMZXQga1ZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0IGludGVybmFsXG4gICAgICAgICAgICAgICAgICAgIC8vIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG4gICAgICAgICAgICAgICAgICAgIGtWYWx1ZSA9IE9ba107XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWkuIENhbGwgdGhlIENhbGwgaW50ZXJuYWwgbWV0aG9kIG9mIGNhbGxiYWNrIHdpdGggVCBhc1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgdGhpcyB2YWx1ZSBhbmQgYXJndW1lbnQgbGlzdCBjb250YWluaW5nIGtWYWx1ZSwgaywgYW5kIE8uXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoVCwga1ZhbHVlLCBrLCBPKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZC4gSW5jcmVhc2UgayBieSAxLlxuICAgICAgICAgICAgICAgIGsrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIDguIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgfTtcbiAgICB9XG59O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAwMy8wOS8yMDE2LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXF1aXJlKCcuL2Zvci1lYWNoJykoKTtcbiAgICByZXF1aXJlKCcuL2ZpbHRlcicpKCk7XG4gICAgcmVxdWlyZSgnLi9tYXAnKSgpO1xufTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBUaW0gT3NhZGNoaXkgb24gMDMvMDkvMjAxNi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFByb2R1Y3Rpb24gc3RlcHMgb2YgRUNNQS0yNjIsIEVkaXRpb24gNSwgMTUuNC40LjE5XG4gICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjQuNC4xOVxuICAgIGlmICghQXJyYXkucHJvdG90eXBlLm1hcCkge1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNBcmcpIHtcblxuICAgICAgICAgICAgdmFyIFQsIEEsIGs7XG5cbiAgICAgICAgICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCcgdGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDEuIExldCBPIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyBUb09iamVjdCBwYXNzaW5nIHRoZSB8dGhpc3xcbiAgICAgICAgICAgIC8vICAgIHZhbHVlIGFzIHRoZSBhcmd1bWVudC5cbiAgICAgICAgICAgIHZhciBPID0gT2JqZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICAvLyAyLiBMZXQgbGVuVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWxcbiAgICAgICAgICAgIC8vICAgIG1ldGhvZCBvZiBPIHdpdGggdGhlIGFyZ3VtZW50IFwibGVuZ3RoXCIuXG4gICAgICAgICAgICAvLyAzLiBMZXQgbGVuIGJlIFRvVWludDMyKGxlblZhbHVlKS5cbiAgICAgICAgICAgIHZhciBsZW4gPSBPLmxlbmd0aCA+Pj4gMDtcblxuICAgICAgICAgICAgLy8gNC4gSWYgSXNDYWxsYWJsZShjYWxsYmFjaykgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgICAgIC8vIFNlZTogaHR0cDovL2VzNS5naXRodWIuY29tLyN4OS4xMVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoY2FsbGJhY2sgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDUuIElmIHRoaXNBcmcgd2FzIHN1cHBsaWVkLCBsZXQgVCBiZSB0aGlzQXJnOyBlbHNlIGxldCBUIGJlIHVuZGVmaW5lZC5cbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIFQgPSB0aGlzQXJnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyA2LiBMZXQgQSBiZSBhIG5ldyBhcnJheSBjcmVhdGVkIGFzIGlmIGJ5IHRoZSBleHByZXNzaW9uIG5ldyBBcnJheShsZW4pXG4gICAgICAgICAgICAvLyAgICB3aGVyZSBBcnJheSBpcyB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gY29uc3RydWN0b3Igd2l0aCB0aGF0IG5hbWUgYW5kXG4gICAgICAgICAgICAvLyAgICBsZW4gaXMgdGhlIHZhbHVlIG9mIGxlbi5cbiAgICAgICAgICAgIEEgPSBuZXcgQXJyYXkobGVuKTtcblxuICAgICAgICAgICAgLy8gNy4gTGV0IGsgYmUgMFxuICAgICAgICAgICAgayA9IDA7XG5cbiAgICAgICAgICAgIC8vIDguIFJlcGVhdCwgd2hpbGUgayA8IGxlblxuICAgICAgICAgICAgd2hpbGUgKGsgPCBsZW4pIHtcblxuICAgICAgICAgICAgICAgIHZhciBrVmFsdWUsIG1hcHBlZFZhbHVlO1xuXG4gICAgICAgICAgICAgICAgLy8gYS4gTGV0IFBrIGJlIFRvU3RyaW5nKGspLlxuICAgICAgICAgICAgICAgIC8vICAgVGhpcyBpcyBpbXBsaWNpdCBmb3IgTEhTIG9wZXJhbmRzIG9mIHRoZSBpbiBvcGVyYXRvclxuICAgICAgICAgICAgICAgIC8vIGIuIExldCBrUHJlc2VudCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEhhc1Byb3BlcnR5IGludGVybmFsXG4gICAgICAgICAgICAgICAgLy8gICAgbWV0aG9kIG9mIE8gd2l0aCBhcmd1bWVudCBQay5cbiAgICAgICAgICAgICAgICAvLyAgIFRoaXMgc3RlcCBjYW4gYmUgY29tYmluZWQgd2l0aCBjXG4gICAgICAgICAgICAgICAgLy8gYy4gSWYga1ByZXNlbnQgaXMgdHJ1ZSwgdGhlblxuICAgICAgICAgICAgICAgIGlmIChrIGluIE8pIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpLiBMZXQga1ZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0IGludGVybmFsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG4gICAgICAgICAgICAgICAgICAgIGtWYWx1ZSA9IE9ba107XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWkuIExldCBtYXBwZWRWYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIENhbGwgaW50ZXJuYWxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIG1ldGhvZCBvZiBjYWxsYmFjayB3aXRoIFQgYXMgdGhlIHRoaXMgdmFsdWUgYW5kIGFyZ3VtZW50XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBsaXN0IGNvbnRhaW5pbmcga1ZhbHVlLCBrLCBhbmQgTy5cbiAgICAgICAgICAgICAgICAgICAgbWFwcGVkVmFsdWUgPSBjYWxsYmFjay5jYWxsKFQsIGtWYWx1ZSwgaywgTyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWlpLiBDYWxsIHRoZSBEZWZpbmVPd25Qcm9wZXJ0eSBpbnRlcm5hbCBtZXRob2Qgb2YgQSB3aXRoIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgICAgICAvLyBQaywgUHJvcGVydHkgRGVzY3JpcHRvclxuICAgICAgICAgICAgICAgICAgICAvLyB7IFZhbHVlOiBtYXBwZWRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gICBXcml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gICBFbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAvLyAgIENvbmZpZ3VyYWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICAvLyBhbmQgZmFsc2UuXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSwgdXNlIHRoZSBmb2xsb3dpbmc6XG4gICAgICAgICAgICAgICAgICAgIC8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBLCBrLCB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgdmFsdWU6IG1hcHBlZFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAvLyAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAvLyAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBiZXN0IGJyb3dzZXIgc3VwcG9ydCwgdXNlIHRoZSBmb2xsb3dpbmc6XG4gICAgICAgICAgICAgICAgICAgIEFba10gPSBtYXBwZWRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZC4gSW5jcmVhc2UgayBieSAxLlxuICAgICAgICAgICAgICAgIGsrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gOS4gcmV0dXJuIEFcbiAgICAgICAgICAgIHJldHVybiBBO1xuICAgICAgICB9O1xuICAgIH1cbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAxNS8wOC8yMDE2LlxuICovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmFzZUF0dHIgPSBcImRhdGEtNGNcIixcbiAgICBnZXRBbGxFbGVtZW50c1dpdGhBdHRyaWJ1dGUgPSByZXF1aXJlKCcuL2hlbHBlcnMvZ2V0LWFsbC1lbGVtZW50cy13aXRoLWF0dHJpYnV0ZScpLFxuICAgIGFkZENsYXNzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2FkZC1jbGFzcycpLFxuICAgIHJlbW92ZUNsYXNzID0gcmVxdWlyZSgnLi9oZWxwZXJzL3JlbW92ZS1jbGFzcycpLFxuICAgIGFkZEV2ZW50TGlzdGVuZXIgPSByZXF1aXJlKCcuL2hlbHBlcnMvYWRkLWV2ZW50LWxpc3RlbmVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRvbUNvbnRhaW5lciwgbW9kZWwpIHtcbiAgICB2YXIgd2F0Y2hlcnMgPSBbXTtcblxuICAgIGluaXQoKTtcblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIHNldENsYXNzV2F0Y2hlcnMoKTtcbiAgICAgICAgc2V0VGV4dFdhdGNoZXJzKCk7XG4gICAgICAgIHNldEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICAgIGV4ZWN1dGVXYXRjaGVycygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgICB2YXIgYXR0ciA9IGJhc2VBdHRyICsgJy1vbicsXG4gICAgICAgICAgICBkb21zID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGF0dHIsIGRvbUNvbnRhaW5lcik7XG4gICAgICAgIGRvbXMuZm9yRWFjaChmdW5jdGlvbihkb20pIHtcbiAgICAgICAgICAgIHNldEV2ZW50TGlzdGVuZXJzRnJvbUV4cHJlc3Npb24oZG9tLCBkb20uZ2V0QXR0cmlidXRlKGF0dHIpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0RXZlbnRMaXN0ZW5lcnNGcm9tRXhwcmVzc2lvbihlbCwgZXhwcmVzc2lvbikge1xuICAgICAgICB2YXIgZXZlbnRNYXAgPSBwYXJzZUF0dHJpYnV0ZShleHByZXNzaW9uKTtcbiAgICAgICAgZm9yICh2YXIgZXZlbnROYW1lIGluIGV2ZW50TWFwKSB7XG4gICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyKGVsLCBldmVudE5hbWUsIGdldEV2ZW50TGlzdGVuZXIoZWwsIG1vZGVsLCBldmVudE1hcFtldmVudE5hbWVdKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRDbGFzc1dhdGNoZXJzKCkge1xuICAgICAgICB2YXIgYXR0ciA9IGJhc2VBdHRyICsgJy1jbGFzcycsXG4gICAgICAgICAgICBkb21zID0gZ2V0QWxsRWxlbWVudHNXaXRoQXR0cmlidXRlKGF0dHIsIGRvbUNvbnRhaW5lcik7XG4gICAgICAgIGRvbXMuZm9yRWFjaChmdW5jdGlvbihkb20pIHtcbiAgICAgICAgICAgIHZhciBjbGFzc1dhdGNoZXJzID0gZ2V0Q2xhc3NXYXRjaGVyc0ZvckVsZW1lbnQoZG9tLCBkb20uZ2V0QXR0cmlidXRlKGF0dHIpKTtcbiAgICAgICAgICAgIHdhdGNoZXJzLnB1c2guYXBwbHkod2F0Y2hlcnMsIGNsYXNzV2F0Y2hlcnMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRUZXh0V2F0Y2hlcnMoKSB7XG4gICAgICAgIHZhciBhdHRyID0gYmFzZUF0dHIgKyAnLXRleHQnLFxuICAgICAgICAgICAgZG9tcyA9IGdldEFsbEVsZW1lbnRzV2l0aEF0dHJpYnV0ZShhdHRyLCBkb21Db250YWluZXIpO1xuICAgICAgICBkb21zLmZvckVhY2goZnVuY3Rpb24oZG9tKSB7XG4gICAgICAgICAgICB2YXIgdGV4dFdhdGNoZXIgPSBnZXRUZXh0V2F0Y2hlckZvckVsZW1lbnQoZG9tLCBkb20uZ2V0QXR0cmlidXRlKGF0dHIpKTtcbiAgICAgICAgICAgIHdhdGNoZXJzLnB1c2godGV4dFdhdGNoZXIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDbGFzc1dhdGNoZXJzRm9yRWxlbWVudChlbCwgZXhwcmVzc2lvbikge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICAgICAgICBjbGFzc0V4cHJlc3Npb25NYXAgPSBwYXJzZUF0dHJpYnV0ZShleHByZXNzaW9uKTtcbiAgICAgICAgZm9yICh2YXIgY2xhc3NOYW1lIGluIGNsYXNzRXhwcmVzc2lvbk1hcCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goZ2V0Q2xhc3NXYXRjaGVyKGVsLCBjbGFzc05hbWUsIGNsYXNzRXhwcmVzc2lvbk1hcFtjbGFzc05hbWVdKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDbGFzc1dhdGNoZXIoZWwsIGNsYXNzTmFtZSwgZXhwcmVzc2lvbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGdldENsYXNzRXhwcmVzc2lvblZhbHVlKGVsLCBtb2RlbCwgZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICAgICAgICBhZGRDbGFzcyhlbCwgY2xhc3NOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsIGNsYXNzTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUZXh0V2F0Y2hlckZvckVsZW1lbnQoZWwsIGV4cHJlc3Npb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVsLnRleHRDb250ZW50ID0gZ2V0VGV4dEV4cHJlc3Npb25WYWx1ZShlbCwgbW9kZWwsIGV4cHJlc3Npb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VBdHRyaWJ1dGUoc3RyKSB7XG4gICAgICAgIHZhciBrZXlWYWxTdHJzID0gc3RyLnNwbGl0KC8sXFxzKi8pLFxuICAgICAgICAgICAga2V5VmFsID0ge307XG4gICAgICAgIGtleVZhbFN0cnMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgdmFyIGt2ID0gZWwuc3BsaXQoLzpcXHMqLyk7XG4gICAgICAgICAgICBrZXlWYWxba3ZbMF1dID0ga3ZbMV07XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ga2V5VmFsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlQ2xhc3NFeHByZXNzaW9uKHN0cikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb3Bwb3NpdGU6IHN0ci5tYXRjaCgvXiEvKSAhPSBudWxsLFxuICAgICAgICAgICAgcHJvcGVydGllczogc3RyLnJlcGxhY2UoL14hL2csICcnKS5zcGxpdCgnLicpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDbGFzc0V4cHJlc3Npb25WYWx1ZShlbCwgbW9kZWwsIGV4cHJlc3Npb24pIHtcbiAgICAgICAgdmFyIHBhcnNlZEV4cHJlc3Npb24gPSBwYXJzZUNsYXNzRXhwcmVzc2lvbihleHByZXNzaW9uKSxcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSBwYXJzZWRFeHByZXNzaW9uLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBvcHBvc2l0ZSA9IHBhcnNlZEV4cHJlc3Npb24ub3Bwb3NpdGUsXG4gICAgICAgICAgICBzdWJNb2RlbCA9IG1vZGVsLFxuICAgICAgICAgICAgdGFyZ2V0UHJvcGVydHkgPSBwcm9wZXJ0aWVzLnBvcCgpLFxuICAgICAgICAgICAgc3ViTW9kZWxOYW1lID0gcHJvcGVydGllcy5zaGlmdCgpLFxuICAgICAgICAgICAgdmFsdWU7XG4gICAgICAgIHdoaWxlIChzdWJNb2RlbE5hbWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdWJNb2RlbCA9IHN1Yk1vZGVsW3N1Yk1vZGVsTmFtZV07XG4gICAgICAgICAgICBzdWJNb2RlbE5hbWUgPSBwcm9wZXJ0aWVzLnNoaWZ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBzdWJNb2RlbFt0YXJnZXRQcm9wZXJ0eV0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHN1Yk1vZGVsW3RhcmdldFByb3BlcnR5XS5jYWxsKHN1Yk1vZGVsLCBlbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHN1Yk1vZGVsW3RhcmdldFByb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3Bwb3NpdGUgPyAhdmFsdWUgOiB2YWx1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUZXh0RXhwcmVzc2lvblZhbHVlKGVsLCBtb2RlbCwgZXhwcmVzc2lvbikge1xuICAgICAgICB2YXIgcHJvcGVydGllcyA9IGV4cHJlc3Npb24uc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIHN1Yk1vZGVsID0gbW9kZWwsXG4gICAgICAgICAgICB0YXJnZXRQcm9wZXJ0eSA9IHByb3BlcnRpZXMucG9wKCksXG4gICAgICAgICAgICBzdWJNb2RlbE5hbWUgPSBwcm9wZXJ0aWVzLnNoaWZ0KCksXG4gICAgICAgICAgICB2YWx1ZTtcbiAgICAgICAgd2hpbGUgKHN1Yk1vZGVsTmFtZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1Yk1vZGVsID0gc3ViTW9kZWxbc3ViTW9kZWxOYW1lXTtcbiAgICAgICAgICAgIHN1Yk1vZGVsTmFtZSA9IHByb3BlcnRpZXMuc2hpZnQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHN1Yk1vZGVsW3RhcmdldFByb3BlcnR5XSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHZhbHVlID0gc3ViTW9kZWxbdGFyZ2V0UHJvcGVydHldLmNhbGwoc3ViTW9kZWwsIGVsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gc3ViTW9kZWxbdGFyZ2V0UHJvcGVydHldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRFdmVudExpc3RlbmVyKGVsLCBtb2RlbCwgZXhwcmVzc2lvbikge1xuICAgICAgICB2YXIgcHJvcGVydGllcyA9IGV4cHJlc3Npb24uc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIHN1Yk1vZGVsID0gbW9kZWwsXG4gICAgICAgICAgICBmdW5OYW1lID0gcHJvcGVydGllcy5wb3AoKSxcbiAgICAgICAgICAgIHN1Yk1vZGVsTmFtZSA9IHByb3BlcnRpZXMuc2hpZnQoKTtcbiAgICAgICAgd2hpbGUgKHN1Yk1vZGVsTmFtZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1Yk1vZGVsID0gc3ViTW9kZWxbc3ViTW9kZWxOYW1lXTtcbiAgICAgICAgICAgIHN1Yk1vZGVsTmFtZSA9IHByb3BlcnRpZXMuc2hpZnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgLy8gVGltZW91dCBpcyBmb3IgcHJldmVudGluZyBldmVudHMgZmlyaW5nIG9uIGVsZW1lbnRzXG4gICAgICAgICAgICAvLyBzdGFuZGluZyBvbmUgYmVoaW5kIGFub3RoZXIgKGUuZy4gb3BlbiBhbmQgY2xvc2UgYnV0dG9uKVxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzdWJNb2RlbFtmdW5OYW1lXS5jYWxsKHN1Yk1vZGVsLCBldmVudCwgZWwpO1xuICAgICAgICAgICAgICAgIGV4ZWN1dGVXYXRjaGVycygpO1xuICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlY3V0ZVdhdGNoZXJzKCkge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKGZ1bmN0aW9uKHdhdGNoZXIpIHtcbiAgICAgICAgICAgIHdhdGNoZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChiYWNrU3RvcnksIGNvbnRleHQsIGNyZWF0aXZlQ29tbW9ucywgbGlua3MsIHNyYywgdW5kZWZpbmVkKSB7XG5idWYucHVzaChcIjxpbWdcIiArIChqYWRlLmF0dHIoXCJzcmNcIiwgc3JjLCB0cnVlLCBmYWxzZSkpICsgXCIvPjxkaXYgZGF0YS00Yy1jbGFzcz1cXFwiY29sbGFwc2VkOiB0b29sc0hpZGRlblxcXCIgY2xhc3M9XFxcImZjLXRvb2xzXFxcIj5cIik7XG5pZiAoIGNvbnRleHQgJiYgY29udGV4dC5sZW5ndGgpXG57XG5idWYucHVzaChcIjxidXR0b24gZGF0YS00Yy1vbj1cXFwibW91c2VvdmVyOiB0b3BMZWZ0Q29ybmVyLnNob3dcXFwiIGNsYXNzPVxcXCJmYy1idG4gZmMtYnRuLXRvcC1sZWZ0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtaGlzdG9yeVxcXCI+PC9pPjwvYnV0dG9uPlwiKTtcbn1cbmlmICggbGlua3MgJiYgbGlua3MubGVuZ3RoKVxue1xuYnVmLnB1c2goXCI8YnV0dG9uIGRhdGEtNGMtb249XFxcIm1vdXNlb3ZlcjogdG9wUmlnaHRDb3JuZXIuc2hvd1xcXCIgY2xhc3M9XFxcImZjLWJ0biBmYy1idG4tdG9wLXJpZ2h0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtZXh0ZXJuYWwtbGlua1xcXCI+PC9pPjwvYnV0dG9uPlwiKTtcbn1cbmlmICggYmFja1N0b3J5ICYmIGJhY2tTdG9yeS50ZXh0KVxue1xuYnVmLnB1c2goXCI8YnV0dG9uIGRhdGEtNGMtb249XFxcIm1vdXNlb3ZlcjogYm90dG9tTGVmdENvcm5lci5zaG93XFxcIiBjbGFzcz1cXFwiZmMtYnRuIGZjLWJ0bi1ib3R0b20tbGVmdFxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWluZm9cXFwiPjwvaT48L2J1dHRvbj5cIik7XG59XG5pZiAoIGNyZWF0aXZlQ29tbW9ucyAmJiBjcmVhdGl2ZUNvbW1vbnMuY29weXJpZ2h0KVxue1xuYnVmLnB1c2goXCI8YnV0dG9uIGRhdGEtNGMtb249XFxcIm1vdXNlb3ZlcjogYm90dG9tUmlnaHRDb3JuZXIuc2hvd1xcXCIgY2xhc3M9XFxcImZjLWJ0biBmYy1idG4tYm90dG9tLXJpZ2h0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY29weXJpZ2h0XFxcIj48L2k+PC9idXR0b24+XCIpO1xufVxuYnVmLnB1c2goXCI8L2Rpdj48ZGl2IGNsYXNzPVxcXCJmYy1jb250ZW50XFxcIj5cIik7XG5pZiAoIGNvbnRleHQgJiYgY29udGV4dC5sZW5ndGgpXG57XG5idWYucHVzaChcIjxkaXYgZGF0YS00Yy1vbj1cXFwic3dpcGVMZWZ0OiB0b3BMZWZ0Q29ybmVyLnNlbGVjdE5leHQsIHN3aXBlUmlnaHQ6IHRvcExlZnRDb3JuZXIuc2VsZWN0UHJldmlvdXNcXFwiIGRhdGEtNGMtY2xhc3M9XFxcInZpc2libGU6IHRvcExlZnRDb3JuZXIudmlzaWJsZSwgcGlubmVkOiB0b3BMZWZ0Q29ybmVyLnBpbm5lZFxcXCIgY2xhc3M9XFxcImZjLWNvbnRlbnQtY29udGFpbmVyIGZjLWNvbnRlbnQtZmlsbFxcXCI+PGRpdiBjbGFzcz1cXFwiZmMtY29udGVudC1iYWNrZ3JvdW5kXFxcIj48L2Rpdj48ZGl2IGRhdGEtNGMtY2xhc3M9XFxcImV4cGFuZGVkOiAhdG9wTGVmdENvcm5lci52aXNpYmxlXFxcIiBjbGFzcz1cXFwiZmMtZ2FsbGVyeVxcXCI+XCIpO1xuaWYgKCBjb250ZXh0Lmxlbmd0aCA+IDEpXG57XG5idWYucHVzaChcIjxkaXYgZGF0YS00Yy1jbGFzcz1cXFwidHJhbnNwYXJlbnQ6IGdldFByZXZDb250cm9sbGVySGlkZGVuXFxcIiBjbGFzcz1cXFwiZmMtZ2FsbGVyeS1jb250cm9scyBmYy1nYWxsZXJ5LXByZXZcXFwiPjxhIGhyZWY9XFxcIlxcXCIgZGF0YS00Yy1vbj1cXFwiY2xpY2s6IHRvcExlZnRDb3JuZXIuc2VsZWN0UHJldmlvdXMsIG1vdXNlb3ZlcjogdG9wTGVmdENvcm5lci5wcmVzZWxlY3RQcmV2aW91cywgbW91c2VsZWF2ZTogdG9wTGVmdENvcm5lci5jbGVhclByZXNlbGVjdFxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWFuZ2xlLWxlZnRcXFwiPjwvaT48L2E+PC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8dWwgZGF0YS00Yy1nYWxsZXJ5LWxpc3Q9XFxcImRhdGEtNGMtZ2FsbGVyeS1saXN0XFxcIj5cIik7XG4vLyBpdGVyYXRlIGNvbnRleHRcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gY29udGV4dDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyICRpbmRleCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgJGluZGV4IDwgJCRsOyAkaW5kZXgrKykge1xuICAgICAgdmFyIGl0ZW0gPSAkJG9ialskaW5kZXhdO1xuXG5idWYucHVzaChcIjxsaSBkYXRhLTRjLW9uPVxcXCJjbGljazogdG9wTGVmdENvcm5lci5zZWxlY3RJdGVtXFxcIiBkYXRhLTRjLWNsYXNzPVxcXCJob3ZlcjogdG9wTGVmdENvcm5lci5nZXRJdGVtSXNQcmVzZWxlY3RlZFxcXCIgZGF0YS00Yy1nYWxsZXJ5LWl0ZW09XFxcImRhdGEtNGMtZ2FsbGVyeS1pdGVtXFxcIj5cIik7XG5pZiAoIGl0ZW0uc3JjKVxue1xuYnVmLnB1c2goXCI8aW1nXCIgKyAoamFkZS5hdHRyKFwic3JjXCIsIGl0ZW0uc3JjLCB0cnVlLCBmYWxzZSkpICsgXCIvPlwiKTtcbn1cbmlmICggaXRlbS55b3V0dWJlX2lkKVxue1xuYnVmLnB1c2goXCI8aWZyYW1lIHdpZHRoPVxcXCIxMDAlXFxcIiBoZWlnaHQ9XFxcIjEwMCVcXFwiXCIgKyAoamFkZS5hdHRyKFwic3JjXCIsIFwiLy93d3cueW91dHViZS5jb20vZW1iZWQvXCIgKyBpdGVtLnlvdXR1YmVfaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBzdHlsZT1cXFwiYm9yZGVyOm5vbmVcXFwiPjwvaWZyYW1lPlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgJGluZGV4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgaXRlbSA9ICQkb2JqWyRpbmRleF07XG5cbmJ1Zi5wdXNoKFwiPGxpIGRhdGEtNGMtb249XFxcImNsaWNrOiB0b3BMZWZ0Q29ybmVyLnNlbGVjdEl0ZW1cXFwiIGRhdGEtNGMtY2xhc3M9XFxcImhvdmVyOiB0b3BMZWZ0Q29ybmVyLmdldEl0ZW1Jc1ByZXNlbGVjdGVkXFxcIiBkYXRhLTRjLWdhbGxlcnktaXRlbT1cXFwiZGF0YS00Yy1nYWxsZXJ5LWl0ZW1cXFwiPlwiKTtcbmlmICggaXRlbS5zcmMpXG57XG5idWYucHVzaChcIjxpbWdcIiArIChqYWRlLmF0dHIoXCJzcmNcIiwgaXRlbS5zcmMsIHRydWUsIGZhbHNlKSkgKyBcIi8+XCIpO1xufVxuaWYgKCBpdGVtLnlvdXR1YmVfaWQpXG57XG5idWYucHVzaChcIjxpZnJhbWUgd2lkdGg9XFxcIjEwMCVcXFwiIGhlaWdodD1cXFwiMTAwJVxcXCJcIiArIChqYWRlLmF0dHIoXCJzcmNcIiwgXCIvL3d3dy55b3V0dWJlLmNvbS9lbWJlZC9cIiArIGl0ZW0ueW91dHViZV9pZCwgdHJ1ZSwgZmFsc2UpKSArIFwiIHN0eWxlPVxcXCJib3JkZXI6bm9uZVxcXCI+PC9pZnJhbWU+XCIpO1xufVxuYnVmLnB1c2goXCI8L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L3VsPlwiKTtcbmlmICggY29udGV4dC5sZW5ndGggPiAxKVxue1xuYnVmLnB1c2goXCI8ZGl2IGRhdGEtNGMtY2xhc3M9XFxcInRyYW5zcGFyZW50OiBnZXROZXh0Q29udHJvbGxlckhpZGRlblxcXCIgY2xhc3M9XFxcImZjLWdhbGxlcnktY29udHJvbHMgZmMtZ2FsbGVyeS1uZXh0XFxcIj48YSBocmVmPVxcXCJcXFwiIGRhdGEtNGMtb249XFxcImNsaWNrOiB0b3BMZWZ0Q29ybmVyLnNlbGVjdE5leHQsIG1vdXNlb3ZlcjogdG9wTGVmdENvcm5lci5wcmVzZWxlY3ROZXh0LCBtb3VzZWxlYXZlOiB0b3BMZWZ0Q29ybmVyLmNsZWFyUHJlc2VsZWN0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtYW5nbGUtcmlnaHRcXFwiPjwvaT48L2E+PC9kaXY+XCIpO1xufVxuLy8gaXRlcmF0ZSBjb250ZXh0XG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IGNvbnRleHQ7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciBpdGVtID0gJCRvYmpbJGluZGV4XTtcblxuaWYgKCBpdGVtLmNyZWRpdClcbntcbmJ1Zi5wdXNoKFwiPGRpdiBkYXRhLTRjLWdhbGxlcnktY2FwdGlvbj1cXFwiZGF0YS00Yy1nYWxsZXJ5LWNhcHRpb25cXFwiIGRhdGEtNGMtY2xhc3M9XFxcInZpc2libGU6IHRvcExlZnRDb3JuZXIuZ2V0Q2FwdGlvblZpc2libGVcXFwiIGNsYXNzPVxcXCJmYy1nYWxsZXJ5LWNhcHRpb25cXFwiPjxkaXYgY2xhc3M9XFxcImZjLWdhbGxlcnktY2FwdGlvbi1iYWNrZ3JvdW5kXFxcIj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJmYy1nYWxsZXJ5LWNhcHRpb24tdGV4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gaXRlbS5jcmVkaXQpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvZGl2PjwvZGl2PlwiKTtcbn1cbmVsc2VcbntcbmJ1Zi5wdXNoKFwiPGRpdiBkYXRhLTRjLWdhbGxlcnktY2FwdGlvbj1cXFwiZGF0YS00Yy1nYWxsZXJ5LWNhcHRpb25cXFwiIGRhdGEtNGMtY2xhc3M9XFxcInZpc2libGU6IHRvcExlZnRDb3JuZXIuZ2V0Q2FwdGlvblZpc2libGVcXFwiPjwvZGl2PlwiKTtcbn1cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBpdGVtID0gJCRvYmpbJGluZGV4XTtcblxuaWYgKCBpdGVtLmNyZWRpdClcbntcbmJ1Zi5wdXNoKFwiPGRpdiBkYXRhLTRjLWdhbGxlcnktY2FwdGlvbj1cXFwiZGF0YS00Yy1nYWxsZXJ5LWNhcHRpb25cXFwiIGRhdGEtNGMtY2xhc3M9XFxcInZpc2libGU6IHRvcExlZnRDb3JuZXIuZ2V0Q2FwdGlvblZpc2libGVcXFwiIGNsYXNzPVxcXCJmYy1nYWxsZXJ5LWNhcHRpb25cXFwiPjxkaXYgY2xhc3M9XFxcImZjLWdhbGxlcnktY2FwdGlvbi1iYWNrZ3JvdW5kXFxcIj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJmYy1nYWxsZXJ5LWNhcHRpb24tdGV4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gaXRlbS5jcmVkaXQpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvZGl2PjwvZGl2PlwiKTtcbn1cbmVsc2VcbntcbmJ1Zi5wdXNoKFwiPGRpdiBkYXRhLTRjLWdhbGxlcnktY2FwdGlvbj1cXFwiZGF0YS00Yy1nYWxsZXJ5LWNhcHRpb25cXFwiIGRhdGEtNGMtY2xhc3M9XFxcInZpc2libGU6IHRvcExlZnRDb3JuZXIuZ2V0Q2FwdGlvblZpc2libGVcXFwiPjwvZGl2PlwiKTtcbn1cbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L2Rpdj48YnV0dG9uIGRhdGEtNGMtb249XFxcImNsaWNrOiB0b3BMZWZ0Q29ybmVyLmhpZGVcXFwiIGNsYXNzPVxcXCJmYy1idG4gZmMtYnRuLXRvcC1sZWZ0IGZjLWdhbGxlcnktY2xvc2VcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lc1xcXCI+PC9pPjwvYnV0dG9uPjwvZGl2PlwiKTtcbn1cbmlmICggbGlua3MgJiYgbGlua3MubGVuZ3RoKVxue1xuYnVmLnB1c2goXCI8ZGl2IGRhdGEtNGMtb249XFxcIm1vdXNlbGVhdmU6IHRvcFJpZ2h0Q29ybmVyLmhpZGVcXFwiIGRhdGEtNGMtY2xhc3M9XFxcInZpc2libGU6IHRvcFJpZ2h0Q29ybmVyLnZpc2libGVcXFwiIGNsYXNzPVxcXCJmYy1jb250ZW50LWNvbnRhaW5lciBmYy1jb250ZW50LXRvcC1yaWdodFxcXCI+PGRpdiBjbGFzcz1cXFwiZmMtY29udGVudC1ib2R5XFxcIj48ZGl2IGNsYXNzPVxcXCJmYy1jb250ZW50LWJhY2tncm91bmRcXFwiPjwvZGl2PjxkaXYgY2xhc3M9XFxcImZjLWNvbnRlbnQtdGV4dFxcXCI+PGJ1dHRvbiBkYXRhLTRjLW9uPVxcXCJjbGljazogdG9wUmlnaHRDb3JuZXIuaGlkZVxcXCIgY2xhc3M9XFxcImZjLWJ0biBmYy1idG4tY2xvc2VcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lc1xcXCI+PC9pPjwvYnV0dG9uPjxoMT5MaW5rczwvaDE+PGRpdiBjbGFzcz1cXFwiZmEtdWxcXFwiPlwiKTtcbi8vIGl0ZXJhdGUgbGlua3NcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlua3M7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciAkaW5kZXggPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7ICRpbmRleCA8ICQkbDsgJGluZGV4KyspIHtcbiAgICAgIHZhciBpdGVtID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGlcIiArIChqYWRlLmNscyhbXCJmYS1saSBmYSBmYS1cIiArIGl0ZW0udHlwZV0sIFt0cnVlXSkpICsgXCI+PC9pPjxhXCIgKyAoamFkZS5hdHRyKFwiaHJlZlwiLCBpdGVtLnVybCwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGl0ZW0udGl0bGUpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciAkaW5kZXggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBpdGVtID0gJCRvYmpbJGluZGV4XTtcblxuYnVmLnB1c2goXCI8bGk+PGlcIiArIChqYWRlLmNscyhbXCJmYS1saSBmYSBmYS1cIiArIGl0ZW0udHlwZV0sIFt0cnVlXSkpICsgXCI+PC9pPjxhXCIgKyAoamFkZS5hdHRyKFwiaHJlZlwiLCBpdGVtLnVybCwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGl0ZW0udGl0bGUpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuYnVmLnB1c2goXCI8L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj5cIik7XG59XG5pZiAoIGJhY2tTdG9yeSAmJiBiYWNrU3RvcnkudGV4dClcbntcbmJ1Zi5wdXNoKFwiPGRpdiBkYXRhLTRjLW9uPVxcXCJtb3VzZWxlYXZlOiBib3R0b21MZWZ0Q29ybmVyLmhpZGVcXFwiIGRhdGEtNGMtY2xhc3M9XFxcInZpc2libGU6IGJvdHRvbUxlZnRDb3JuZXIudmlzaWJsZVxcXCIgY2xhc3M9XFxcImZjLWNvbnRlbnQtY29udGFpbmVyIGZjLWNvbnRlbnQtYm90dG9tLWxlZnRcXFwiPjxkaXYgY2xhc3M9XFxcImZjLWNvbnRlbnQtYm9keVxcXCI+PGRpdiBjbGFzcz1cXFwiZmMtY29udGVudC1iYWNrZ3JvdW5kXFxcIj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJmYy1jb250ZW50LXRleHRcXFwiPjxidXR0b24gZGF0YS00Yy1vbj1cXFwiY2xpY2s6IGJvdHRvbUxlZnRDb3JuZXIuaGlkZVxcXCIgY2xhc3M9XFxcImZjLWJ0biBmYy1idG4tY2xvc2VcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lc1xcXCI+PC9pPjwvYnV0dG9uPjxoMT5CYWNrc3Rvcnk8L2gxPjxwPlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGJhY2tTdG9yeS50ZXh0KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCI8L3A+PHA+XCIpO1xuaWYgKCBiYWNrU3RvcnkuYXV0aG9yKVxue1xuYnVmLnB1c2goXCJcIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBiYWNrU3RvcnkuYXV0aG9yICsgKGJhY2tTdG9yeS5tYWdhemluZSB8fCBiYWNrU3RvcnkuZGF0ZSA/ICcsICcgOiAnJykpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlwiKTtcbn1cbmlmICggYmFja1N0b3J5Lm1hZ2F6aW5lKVxue1xuaWYgKCBiYWNrU3RvcnkubWFnYXppbmVVcmwpXG57XG5idWYucHVzaChcIjxhXCIgKyAoamFkZS5hdHRyKFwiaHJlZlwiLCBiYWNrU3RvcnkubWFnYXppbmVVcmwsIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBiYWNrU3RvcnkubWFnYXppbmUpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT5cIik7XG59XG5lbHNlXG57XG5idWYucHVzaChcIlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGJhY2tTdG9yeS5tYWdhemluZSkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiXCIpO1xufVxuYnVmLnB1c2goXCJcIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBiYWNrU3RvcnkuZGF0ZSA/ICcsICcgOiAnJykgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiXCIpO1xufVxuaWYgKCBiYWNrU3RvcnkuZGF0ZSlcbntcbmJ1Zi5wdXNoKFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gYmFja1N0b3J5LmRhdGUpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPC9wPjwvZGl2PjwvZGl2PjwvZGl2PlwiKTtcbn1cbmlmICggY3JlYXRpdmVDb21tb25zICYmIGNyZWF0aXZlQ29tbW9ucy5jb3B5cmlnaHQpXG57XG5idWYucHVzaChcIjxkaXYgZGF0YS00Yy1vbj1cXFwibW91c2VsZWF2ZTogYm90dG9tUmlnaHRDb3JuZXIuaGlkZVxcXCIgZGF0YS00Yy1jbGFzcz1cXFwidmlzaWJsZTogYm90dG9tUmlnaHRDb3JuZXIudmlzaWJsZVxcXCIgY2xhc3M9XFxcImZjLWNvbnRlbnQtY29udGFpbmVyIGZjLWNvbnRlbnQtYm90dG9tLXJpZ2h0XFxcIj48ZGl2IGNsYXNzPVxcXCJmYy1jb250ZW50LWJvZHlcXFwiPjxkaXYgY2xhc3M9XFxcImZjLWNvbnRlbnQtYmFja2dyb3VuZFxcXCI+PC9kaXY+PGRpdiBjbGFzcz1cXFwiZmMtY29udGVudC10ZXh0XFxcIj48YnV0dG9uIGRhdGEtNGMtb249XFxcImNsaWNrOiBib3R0b21SaWdodENvcm5lci5oaWRlXFxcIiBjbGFzcz1cXFwiZmMtYnRuIGZjLWJ0bi1jbG9zZVxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLXRpbWVzXFxcIj48L2k+PC9idXR0b24+PHAgY2xhc3M9XFxcImZjLWNvbnRlbnQtY29weXJpZ2h0XFxcIj5cIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSAnUGhvdG9ncmFwaCBieSAnKSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcIik7XG5pZiAoIGNyZWF0aXZlQ29tbW9ucy5jb2RlT2ZFdGhpY3MpXG57XG5idWYucHVzaChcIjxhIGhyZWY9XFxcIlxcXCIgZGF0YS00Yy1vbj1cXFwiY2xpY2s6IGJvdHRvbVJpZ2h0Q29ybmVyLnRvZ2dsZUNvZGVPZkV0aGljc1xcXCIgY2xhc3M9XFxcImZjLWNvZGUtb2YtZXRoaWNzLXNob3dcXFwiPlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGNyZWF0aXZlQ29tbW9ucy5jb3B5cmlnaHQpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvYT5cIik7XG59XG5lbHNlXG57XG5idWYucHVzaChcIlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGNyZWF0aXZlQ29tbW9ucy5jb3B5cmlnaHQpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPC9wPlwiKTtcbmlmICggY3JlYXRpdmVDb21tb25zLmNvZGVPZkV0aGljcylcbntcbmJ1Zi5wdXNoKFwiPHAgZGF0YS00Yy1jbGFzcz1cXFwidmlzaWJsZTogYm90dG9tUmlnaHRDb3JuZXIuY29kZU9mRXRoaWNzVmlzaWJsZVxcXCIgY2xhc3M9XFxcImZjLWNvZGUtb2YtZXRoaWNzXFxcIj5DT0RFIE9GIEVUSElDUzogIFwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGNyZWF0aXZlQ29tbW9ucy5jb2RlT2ZFdGhpY3MpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIjwvcD5cIik7XG59XG5idWYucHVzaChcIjxwPlwiICsgKGphZGUuZXNjYXBlKChqYWRlX2ludGVycCA9IGNyZWF0aXZlQ29tbW9ucy5kZXNjcmlwdGlvbikgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9wPjwvZGl2PjwvZGl2PjwvZGl2PlwiKTtcbn1cbmJ1Zi5wdXNoKFwiPC9kaXY+XCIpO30uY2FsbCh0aGlzLFwiYmFja1N0b3J5XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5iYWNrU3Rvcnk6dHlwZW9mIGJhY2tTdG9yeSE9PVwidW5kZWZpbmVkXCI/YmFja1N0b3J5OnVuZGVmaW5lZCxcImNvbnRleHRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNvbnRleHQ6dHlwZW9mIGNvbnRleHQhPT1cInVuZGVmaW5lZFwiP2NvbnRleHQ6dW5kZWZpbmVkLFwiY3JlYXRpdmVDb21tb25zXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jcmVhdGl2ZUNvbW1vbnM6dHlwZW9mIGNyZWF0aXZlQ29tbW9ucyE9PVwidW5kZWZpbmVkXCI/Y3JlYXRpdmVDb21tb25zOnVuZGVmaW5lZCxcImxpbmtzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5saW5rczp0eXBlb2YgbGlua3MhPT1cInVuZGVmaW5lZFwiP2xpbmtzOnVuZGVmaW5lZCxcInNyY1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc3JjOnR5cGVvZiBzcmMhPT1cInVuZGVmaW5lZFwiP3NyYzp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IFRpbSBPc2FkY2hpeSBvbiAxNS8wOC8yMDE2LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHRlbXBsYXRlID0gcmVxdWlyZShcIi4vdGVtcGxhdGUuamFkZVwiKSxcbiAgICBjb3B5U3R5bGUgPSByZXF1aXJlKCcuL2hlbHBlcnMvY29weS1zdHlsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbWFnZURhdGEpIHtcbiAgICB2YXIgdG91Y2hTY3JlZW4gPSAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgfHwgbmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzLFxuICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICBwYXJlbnROb2RlID0gdGhpcy5wYXJlbnROb2RlO1xuXG4gICAgaW1hZ2VEYXRhLnNyYyA9IHRoaXMuc3JjO1xuICAgIGlmICh0b3VjaFNjcmVlbikge1xuICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZCgndG91Y2gtc2NyZWVuJyk7XG4gICAgfVxuICAgIGRpdi5pbm5lckhUTUwgPSB0ZW1wbGF0ZShpbWFnZURhdGEpO1xuICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdmYy1pbWFnZScpO1xuICAgIGNvcHlTdHlsZSh0aGlzLCBkaXYpO1xuICAgIGlmIChkaXYuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnZGlzcGxheScpID09ICdpbmxpbmUnKSB7XG4gICAgICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgfVxuICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGRpdiwgdGhpcyk7XG4gICAgcmV0dXJuIGRpdjtcbn07IiwidmFyIGNzcyA9IFwiLmZjLWNvZGUtb2YtZXRoaWNzLXNob3c6YWN0aXZlLC5mYy1jb2RlLW9mLWV0aGljcy1zaG93OmZvY3VzLC5mYy1jb2RlLW9mLWV0aGljcy1zaG93OmhvdmVyLC5mYy1pbWFnZSBhe3RleHQtZGVjb3JhdGlvbjpub25lfS5mYy1idG4sLmZjLWdhbGxlcnkgdWwgbGl7dGV4dC1hbGlnbjpjZW50ZXI7dmVydGljYWwtYWxpZ246bWlkZGxlfS5mYy1pbWFnZXtwb3NpdGlvbjpyZWxhdGl2ZSFpbXBvcnRhbnQ7b3ZlcmZsb3c6aGlkZGVuIWltcG9ydGFudDtoZWlnaHQ6YXV0byFpbXBvcnRhbnR9LmZjLWltYWdlICp7LXdlYmtpdC1ib3gtc2l6aW5nOmJvcmRlci1ib3g7LW1vei1ib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym94LXNpemluZzpib3JkZXItYm94O2ZvbnQtc2l6ZToxM3B4O2ZvbnQtZmFtaWx5OlxcXCJIZWx2ZXRpY2EgTmV1ZVxcXCIsSGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6MzAwO2xldHRlci1zcGFjaW5nOi4wM2VtOy13ZWJraXQtdGV4dC1lbXBoYXNpczppbml0aWFsOy13ZWJraXQtdGV4dC1maWxsLWNvbG9yOmluaXRpYWx9LmZjLWltYWdlPmltZ3tkaXNwbGF5OmJsb2NrO21heC13aWR0aDoxMDAlfS5mYy1pbWFnZSBoMXtmb250LXNpemU6MjRweDtsZXR0ZXItc3BhY2luZzouMWVtO2ZvbnQtd2VpZ2h0OjMwMDttYXJnaW46MTBweCAwfS5mYy1pbWFnZSBwe21hcmdpbjowIDAgMTBweH0uZmMtaW1hZ2UgYXtjb2xvcjojMzM3YWI3Oy13ZWJraXQtdHJhbnNpdGlvbjpjb2xvciAuMXMgbGluZWFyOy1tb3otdHJhbnNpdGlvbjpjb2xvciAuMXMgbGluZWFyOy1tcy10cmFuc2l0aW9uOmNvbG9yIC4xcyBsaW5lYXI7LW8tdHJhbnNpdGlvbjpjb2xvciAuMXMgbGluZWFyO3RyYW5zaXRpb246Y29sb3IgLjFzIGxpbmVhcn0uZmMtaW1hZ2UgYTphY3RpdmUsLmZjLWltYWdlIGE6Zm9jdXMsLmZjLWltYWdlIGE6aG92ZXJ7Y29sb3I6IzRmOTNjZX0uZmMtY29udGVudHtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjA7aGVpZ2h0OjEwMCU7d2lkdGg6MTAwJX0uZmMtY29udGVudC1jb250YWluZXJ7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MTAwJTttYXgtd2lkdGg6MjYwcHg7bWF4LWhlaWdodDoxMDAlO29wYWNpdHk6MDtjb2xvcjojZmZmO292ZXJmbG93LXk6YXV0bztvdmVyZmxvdy14OmhpZGRlbjstd2Via2l0LXRyYW5zaXRpb246b3BhY2l0eSAuMXMgbGluZWFyOy1tb3otdHJhbnNpdGlvbjpvcGFjaXR5IC4xcyBsaW5lYXI7LW1zLXRyYW5zaXRpb246b3BhY2l0eSAuMXMgbGluZWFyOy1vLXRyYW5zaXRpb246b3BhY2l0eSAuMXMgbGluZWFyO3RyYW5zaXRpb246b3BhY2l0eSAuMXMgbGluZWFyfS5mYy1jb250ZW50LWNvbnRhaW5lci5waW5uZWQsLmZjLWNvbnRlbnQtY29udGFpbmVyLnZpc2libGV7b3BhY2l0eToxO3otaW5kZXg6Mn0uZmMtY29udGVudC1ib2R5e2hlaWdodDoxMDAlO3dpZHRoOjEwMCU7cG9zaXRpb246cmVsYXRpdmV9LmZjLWNvbnRlbnQtdGV4dHtwYWRkaW5nOjVweCAxNXB4IDE1cHggMTBweDtwb3NpdGlvbjpyZWxhdGl2ZTt6LWluZGV4OjJ9LmZjLWNvbnRlbnQtYmFja2dyb3VuZHtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtiYWNrZ3JvdW5kOiMwMDA7b3BhY2l0eTouN30uZmMtZ2FsbGVyeSwuZmMtZ2FsbGVyeSB1bHtwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDoxMDAlO2hlaWdodDoxMDAlfS5mYy1jb250ZW50LWZpbGx7dG9wOjA7bGVmdDowO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7bWF4LXdpZHRoOjEwMCV9LmZjLWNvbnRlbnQtdG9wLXJpZ2h0e3RvcDowO3JpZ2h0OjB9LmZjLWNvbnRlbnQtYm90dG9tLWxlZnR7Ym90dG9tOjA7bGVmdDowfS5mYy1jb250ZW50LWJvdHRvbS1yaWdodHtib3R0b206MDtyaWdodDowfS5mYy1jb250ZW50LWNvcHlyaWdodHtkaXNwbGF5OmlubGluZS1ibG9ja30uZmMtZ2FsbGVyeXtvdmVyZmxvdzpoaWRkZW59LmZjLWdhbGxlcnkgdWx7d2hpdGUtc3BhY2U6bm93cmFwO2Rpc3BsYXk6YmxvY2s7bWFyZ2luOjA7cGFkZGluZzowOy13ZWJraXQtdHJhbnNmb3JtOnNjYWxlKC44KTstbW96LXRyYW5zZm9ybTpzY2FsZSguOCk7LW1zLXRyYW5zZm9ybTpzY2FsZSguOCk7dHJhbnNmb3JtOnNjYWxlKC44KTstd2Via2l0LXRyYW5zaXRpb246bWFyZ2luLWxlZnQgLjE1cyBsaW5lYXI7LW1vei10cmFuc2l0aW9uOm1hcmdpbi1sZWZ0IC4xNXMgbGluZWFyOy1tcy10cmFuc2l0aW9uOm1hcmdpbi1sZWZ0IC4xNXMgbGluZWFyOy1vLXRyYW5zaXRpb246bWFyZ2luLWxlZnQgLjE1cyBsaW5lYXI7dHJhbnNpdGlvbjptYXJnaW4tbGVmdCAuMTVzIGxpbmVhcn0uZmMtZ2FsbGVyeSB1bCBsaXtkaXNwbGF5OmlubGluZS1ibG9jaztjdXJzb3I6cG9pbnRlcjt3aWR0aDoxMDAlO2hlaWdodDoxMDAlfS5mYy1nYWxsZXJ5IHVsIGxpIGlmcmFtZSwuZmMtZ2FsbGVyeSB1bCBsaSBpbWd7dmVydGljYWwtYWxpZ246bWlkZGxlO29wYWNpdHk6Ljc7LXdlYmtpdC10cmFuc2Zvcm06c2NhbGUoLjkpOy1tb3otdHJhbnNmb3JtOnNjYWxlKC45KTstbXMtdHJhbnNmb3JtOnNjYWxlKC45KTt0cmFuc2Zvcm06c2NhbGUoLjkpOy13ZWJraXQtdHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjE1cyBsaW5lYXIsb3BhY2l0eSAuMTVzIGxpbmVhcjstbW96LXRyYW5zaXRpb246dHJhbnNmb3JtIC4xNXMgbGluZWFyLG9wYWNpdHkgLjE1cyBsaW5lYXI7LW1zLXRyYW5zaXRpb246dHJhbnNmb3JtIC4xNXMgbGluZWFyLG9wYWNpdHkgLjE1cyBsaW5lYXI7LW8tdHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjE1cyBsaW5lYXIsb3BhY2l0eSAuMTVzIGxpbmVhcjt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMTVzIGxpbmVhcixvcGFjaXR5IC4xNXMgbGluZWFyfS5mYy1nYWxsZXJ5IHVsIGxpIGltZ3ttYXgtd2lkdGg6MTAwJTttYXgtaGVpZ2h0OjEwMCV9LmZjLWdhbGxlcnkgdWwgbGkuaG92ZXIgaWZyYW1lLC5mYy1nYWxsZXJ5IHVsIGxpLmhvdmVyIGltZywuZmMtZ2FsbGVyeSB1bCBsaTpob3ZlciBpZnJhbWUsLmZjLWdhbGxlcnkgdWwgbGk6aG92ZXIgaW1ne29wYWNpdHk6Ljg1Oy13ZWJraXQtdHJhbnNmb3JtOnNjYWxlKC45Mik7LW1vei10cmFuc2Zvcm06c2NhbGUoLjkyKTstbXMtdHJhbnNmb3JtOnNjYWxlKC45Mik7dHJhbnNmb3JtOnNjYWxlKC45Mil9LmZjLWdhbGxlcnkgdWwgbGkuc2VsZWN0ZWR7Y3Vyc29yOmRlZmF1bHR9LmZjLWdhbGxlcnkgdWwgbGkuc2VsZWN0ZWQgaWZyYW1lLC5mYy1nYWxsZXJ5IHVsIGxpLnNlbGVjdGVkIGltZ3tvcGFjaXR5OjE7LXdlYmtpdC10cmFuc2Zvcm06c2NhbGUoMSk7LW1vei10cmFuc2Zvcm06c2NhbGUoMSk7LW1zLXRyYW5zZm9ybTpzY2FsZSgxKTt0cmFuc2Zvcm06c2NhbGUoMSl9LmZjLWdhbGxlcnkuZXhwYW5kZWQgdWwgbGkgaWZyYW1lLC5mYy1nYWxsZXJ5LmV4cGFuZGVkIHVsIGxpIGltZ3std2Via2l0LXRyYW5zZm9ybTpzY2FsZSgxLjI1KTstbW96LXRyYW5zZm9ybTpzY2FsZSgxLjI1KTstbXMtdHJhbnNmb3JtOnNjYWxlKDEuMjUpO3RyYW5zZm9ybTpzY2FsZSgxLjI1KX0uZmMtZ2FsbGVyeS1jYXB0aW9ue3Bvc2l0aW9uOmFic29sdXRlO2JvdHRvbTowO2xlZnQ6MDt0ZXh0LWFsaWduOmNlbnRlcjtwYWRkaW5nOjVweDtmb250LXNpemU6MTJweDt3aWR0aDoxMDAlO29wYWNpdHk6MDstd2Via2l0LXRyYW5zaXRpb246b3BhY2l0eSAuMXMgbGluZWFyOy1tb3otdHJhbnNpdGlvbjpvcGFjaXR5IC4xcyBsaW5lYXI7LW1zLXRyYW5zaXRpb246b3BhY2l0eSAuMXMgbGluZWFyOy1vLXRyYW5zaXRpb246b3BhY2l0eSAuMXMgbGluZWFyO3RyYW5zaXRpb246b3BhY2l0eSAuMXMgbGluZWFyfS5mYy1nYWxsZXJ5LWNhcHRpb24udmlzaWJsZXtvcGFjaXR5OjF9LmZjLWdhbGxlcnktY2FwdGlvbi1iYWNrZ3JvdW5ke3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO2JhY2tncm91bmQ6IzAwMDtvcGFjaXR5Oi40fS5mYy1nYWxsZXJ5LWNhcHRpb24tdGV4dHtwb3NpdGlvbjpyZWxhdGl2ZTtoZWlnaHQ6MTAwJTt3aWR0aDoxMDAlfS5mYy1nYWxsZXJ5LWNvbnRyb2xze2JhY2tncm91bmQ6MCAwO2hlaWdodDoxMDAlO3dpZHRoOjQwcHg7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7ei1pbmRleDoxO29wYWNpdHk6LjU7LXdlYmtpdC10cmFuc2l0aW9uOm9wYWNpdHkgLjE1cyBsaW5lYXI7LW1vei10cmFuc2l0aW9uOm9wYWNpdHkgLjE1cyBsaW5lYXI7LW1zLXRyYW5zaXRpb246b3BhY2l0eSAuMTVzIGxpbmVhcjstby10cmFuc2l0aW9uOm9wYWNpdHkgLjE1cyBsaW5lYXI7dHJhbnNpdGlvbjpvcGFjaXR5IC4xNXMgbGluZWFyfS5mYy1nYWxsZXJ5LWNvbnRyb2xzLnRyYW5zcGFyZW50LC5mYy10b29sc3tvcGFjaXR5OjB9LmZjLWdhbGxlcnktY29udHJvbHMgYXtkaXNwbGF5OmJsb2NrO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7Y29sb3I6I2ZmZn0uZmMtZ2FsbGVyeS1jb250cm9scyBhOmFjdGl2ZSwuZmMtZ2FsbGVyeS1jb250cm9scyBhOmZvY3VzLC5mYy1nYWxsZXJ5LWNvbnRyb2xzIGE6aG92ZXJ7Y29sb3I6I2NjY30uZmMtZ2FsbGVyeS1jb250cm9scyBhIGl7cG9zaXRpb246YWJzb2x1dGU7dG9wOjUwJTtsZWZ0OjVweDttYXJnaW4tdG9wOi0zNXB4O2ZvbnQtc2l6ZTo3MHB4fS5mYy1nYWxsZXJ5LXByZXZ7bGVmdDowfS5mYy1nYWxsZXJ5LW5leHR7cmlnaHQ6MH0uZmMtZ2FsbGVyeS1jbG9zZXt6LWluZGV4OjJ9LmZjLWNvZGUtb2YtZXRoaWNze2JvcmRlcjoxcHggc29saWQgIzMzN2FiNztiYWNrZ3JvdW5kOiMwMDA7cGFkZGluZzo1cHggMTBweDtkaXNwbGF5Om5vbmV9LmZjLWNvZGUtb2YtZXRoaWNzLnZpc2libGV7ZGlzcGxheTpibG9ja30uZmMtY29kZS1vZi1ldGhpY3Mtc2hvd3t0ZXh0LWRlY29yYXRpb246bm9uZTtib3JkZXItYm90dG9tOjFweCBkYXNoZWQ7d2hpdGUtc3BhY2U6bm93cmFwOy13ZWJraXQtdHJhbnNpdGlvbjpjb2xvciAuMXMgbGluZWFyOy1tb3otdHJhbnNpdGlvbjpjb2xvciAuMXMgbGluZWFyOy1tcy10cmFuc2l0aW9uOmNvbG9yIC4xcyBsaW5lYXI7LW8tdHJhbnNpdGlvbjpjb2xvciAuMXMgbGluZWFyO3RyYW5zaXRpb246Y29sb3IgLjFzIGxpbmVhcn0uZmMtdG9vbHN7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7ei1pbmRleDoxOy13ZWJraXQtYm94LXNpemluZzpib3JkZXItYm94Oy1tb3otYm94LXNpemluZzpib3JkZXItYm94O2JveC1zaXppbmc6Ym9yZGVyLWJveDstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSgxLjUpOy1tb3otdHJhbnNmb3JtOnNjYWxlKDEuNSk7LW1zLXRyYW5zZm9ybTpzY2FsZSgxLjUpO3RyYW5zZm9ybTpzY2FsZSgxLjUpOy13ZWJraXQtdHJhbnNpdGlvbjpvcGFjaXR5IC4zcyBsaW5lYXIsdHJhbnNmb3JtIC4ycyBsaW5lYXI7LW1vei10cmFuc2l0aW9uOm9wYWNpdHkgLjNzIGxpbmVhcix0cmFuc2Zvcm0gLjJzIGxpbmVhcjstbXMtdHJhbnNpdGlvbjpvcGFjaXR5IC4zcyBsaW5lYXIsdHJhbnNmb3JtIC4ycyBsaW5lYXI7LW8tdHJhbnNpdGlvbjpvcGFjaXR5IC4zcyBsaW5lYXIsdHJhbnNmb3JtIC4ycyBsaW5lYXI7dHJhbnNpdGlvbjpvcGFjaXR5IC4zcyBsaW5lYXIsdHJhbnNmb3JtIC4ycyBsaW5lYXJ9LmZjLXRvb2xzOmhvdmVyey13ZWJraXQtdHJhbnNmb3JtOnNjYWxlKDEpOy1tb3otdHJhbnNmb3JtOnNjYWxlKDEpOy1tcy10cmFuc2Zvcm06c2NhbGUoMSk7dHJhbnNmb3JtOnNjYWxlKDEpO29wYWNpdHk6MX0udG91Y2gtc2NyZWVuIC5mYy10b29sc3tvcGFjaXR5OjEhaW1wb3J0YW50Oy13ZWJraXQtdHJhbnNmb3JtOnNjYWxlKDEpOy1tb3otdHJhbnNmb3JtOnNjYWxlKDEpOy1tcy10cmFuc2Zvcm06c2NhbGUoMSk7dHJhbnNmb3JtOnNjYWxlKDEpfS50b3VjaC1zY3JlZW4gLmZjLXRvb2xzLmNvbGxhcHNlZHtvcGFjaXR5OjA7LXdlYmtpdC10cmFuc2Zvcm06c2NhbGUoMS41KTstbW96LXRyYW5zZm9ybTpzY2FsZSgxLjUpOy1tcy10cmFuc2Zvcm06c2NhbGUoMS41KTt0cmFuc2Zvcm06c2NhbGUoMS41KX0uZmMtYnRue2Rpc3BsYXk6aW5saW5lLWJsb2NrO21hcmdpbjowO3doaXRlLXNwYWNlOm5vd3JhcDtwb3NpdGlvbjphYnNvbHV0ZTtjb2xvcjojZmZmO2JhY2tncm91bmQ6IzAwMDtib3JkZXI6bm9uZTtib3JkZXItcmFkaXVzOjUwJTtwYWRkaW5nOjZweDtoZWlnaHQ6MzBweDt3aWR0aDozMHB4O29wYWNpdHk6Ljc7b3V0bGluZTowOy13ZWJraXQtdHJhbnNpdGlvbjpvcGFjaXR5IC4xcyBsaW5lYXI7LW1vei10cmFuc2l0aW9uOm9wYWNpdHkgLjFzIGxpbmVhcjstbXMtdHJhbnNpdGlvbjpvcGFjaXR5IC4xcyBsaW5lYXI7LW8tdHJhbnNpdGlvbjpvcGFjaXR5IC4xcyBsaW5lYXI7dHJhbnNpdGlvbjpvcGFjaXR5IC4xcyBsaW5lYXJ9LmZjLWJ0bjphY3RpdmUsLmZjLWJ0bjpmb2N1cywuZmMtYnRuOmhvdmVye29wYWNpdHk6MX0uZmMtYnRuLXRvcC1sZWZ0e3RvcDo1cHg7bGVmdDo1cHh9LmZjLWJ0bi10b3AtcmlnaHR7dG9wOjVweDtyaWdodDo1cHh9LmZjLWJ0bi1ib3R0b20tbGVmdHtib3R0b206NXB4O2xlZnQ6NXB4fS5mYy1idG4tYm90dG9tLXJpZ2h0e2JvdHRvbTo1cHg7cmlnaHQ6NXB4fS5mYy1idG4tY2xvc2V7ZGlzcGxheTpub25lO3Bvc2l0aW9uOnN0YXRpYztmbG9hdDpyaWdodH0udG91Y2gtc2NyZWVuIC5mYy1idG4tY2xvc2V7ZGlzcGxheTppbmxpbmUtYmxvY2t9XCI7IChyZXF1aXJlKFwiYnJvd3NlcmlmeS1jc3NcIikuY3JlYXRlU3R5bGUoY3NzLCB7IFwiaHJlZlwiOiBcInNyYy90ZW1wL3N0eWxlLm1pbi5jc3NcIn0pKTsgbW9kdWxlLmV4cG9ydHMgPSBjc3M7Il19
