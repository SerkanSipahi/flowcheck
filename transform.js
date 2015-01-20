'use strict';

var jstransform = require('jstransform');
var typeSyntax = require('jstransform/visitors/type-syntax');
var visitorList = require('./visitors').visitorList;
var Buffer = require('buffer').Buffer;

function getOptions(options) {
  options = options || {};
  options.assertions =  typeof options.assertions === 'undefined' ? true : options.assertions;
  options.module =      options['module'] || options.module || 'flowtype/assert';
  options.namespace =   options.namespace || 'f';
  options.sourceMap =   options['source-map'] || options.sourceMap;
  return options;
}

function innerTransform(input, options) {
  return jstransform.transform(visitorList, input, getOptions(options));
}

function inlineSourceMap(sourceMap, sourceCode, sourceFilename) {
  var json = sourceMap.toJSON();
  json.sources = [sourceFilename];
  json.sourcesContent = [sourceCode];
  var base64 = Buffer(JSON.stringify(json)).toString('base64');
  return '//# sourceMappingURL=data:application/json;base64,' +
         base64;
}

module.exports = {

  transform: function(input, options) {
    var output = innerTransform(input, options);
    var result = output.code;
    if (options && options.sourceMap) {
      var map = inlineSourceMap(
        output.sourceMap,
        input,
        options.sourceFilename
      );
      result += '\n' + map;
    }
    return result;
  },

  transformWithDetails: function(input, options) {
    var output = innerTransform(input, options);
    var result = {};
    result.code = output.code;
    if (options && options.sourceMap) {
      result.sourceMap = output.sourceMap.toJSON();
    }
    return result;
  }

};
