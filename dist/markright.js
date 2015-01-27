(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Generator;

module.exports = Generator = (function() {
  function Generator() {}

  return Generator;

})();



},{}],2:[function(require,module,exports){
var Compiler, Generator, Parser;

Parser = require('./parser');

Generator = require('./generator');

module.exports = Compiler = (function() {
  function Compiler() {}

  Compiler.prototype.compile = function(md) {
    return md;
  };

  return Compiler;

})();



},{"./generator":1,"./parser":3}],3:[function(require,module,exports){
var Parser;

module.exports = Parser = (function() {
  function Parser() {}

  return Parser;

})();



},{}],4:[function(require,module,exports){
var LanguagePack;

module.exports = LanguagePack = (function() {
  function LanguagePack(ns) {
    this.ns = ns;
  }

  return LanguagePack;

})();



},{}],5:[function(require,module,exports){
var Core, LanguagePack,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

LanguagePack = require('../core/language-pack');

module.exports = Core = (function(_super) {
  __extends(Core, _super);

  function Core() {
    Core.__super__.constructor.call(this, 'core');
  }

  return Core;

})(LanguagePack);



},{"../core/language-pack":4}],6:[function(require,module,exports){
var GFM, LanguagePack,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

LanguagePack = require('../core/language-pack');

module.exports = GFM = (function(_super) {
  __extends(GFM, _super);

  function GFM() {
    GFM.__super__.constructor.call(this, 'gfm');
  }

  return GFM;

})(LanguagePack);



},{"../core/language-pack":4}],7:[function(require,module,exports){
var Compiler, Core, GFM, core, gfm;

Compiler = require('./compiler');

Core = require('./lang/core');

GFM = require('./lang/gfm');

core = new Core();

gfm = new GFM();

Compiler.Default = new Compiler([core, gfm]);

module.exports = Compiler;



},{"./compiler":2,"./lang/core":5,"./lang/gfm":6}]},{},[7])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFxEZXZcXGpzXFxtYXJrcmlnaHRcXG5vZGVfbW9kdWxlc1xcZ3VscC1icm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkY6XFxEZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29tcGlsZXJcXGdlbmVyYXRvci5jb2ZmZWUiLCJGOlxcRGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxpbmRleC5jb2ZmZWUiLCJGOlxcRGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxwYXJzZXIuY29mZmVlIiwiRjpcXERldlxcanNcXG1hcmtyaWdodFxcY29mZmVlXFxjb3JlXFxsYW5ndWFnZS1wYWNrLmNvZmZlZSIsIkY6XFxEZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcbGFuZ1xcY29yZS5jb2ZmZWUiLCJGOlxcRGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGxhbmdcXGdmbS5jb2ZmZWUiLCJGOlxcRGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXG1hcmtyaWdodC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFNBQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLEVBQUEsbUJBQUEsR0FBQSxDQUFiOzttQkFBQTs7SUFGRixDQUFBOzs7OztBQ0FBLElBQUEsMkJBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxTQUNBLEdBQVksT0FBQSxDQUFRLGFBQVIsQ0FEWixDQUFBOztBQUFBLE1BR00sQ0FBQyxPQUFQLEdBQ007QUFDUyxFQUFBLGtCQUFBLEdBQUEsQ0FBYjs7QUFBQSxxQkFFQSxPQUFBLEdBQVMsU0FBQyxFQUFELEdBQUE7QUFDUCxXQUFPLEVBQVAsQ0FETztFQUFBLENBRlQsQ0FBQTs7a0JBQUE7O0lBTEYsQ0FBQTs7Ozs7QUNBQSxJQUFBLE1BQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLEVBQUEsZ0JBQUEsR0FBQSxDQUFiOztnQkFBQTs7SUFGRixDQUFBOzs7OztBQ0FBLElBQUEsWUFBQTs7QUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsRUFBQSxzQkFBRSxFQUFGLEdBQUE7QUFBTyxJQUFOLElBQUMsQ0FBQSxLQUFBLEVBQUssQ0FBUDtFQUFBLENBQWI7O3NCQUFBOztJQUZGLENBQUE7Ozs7O0FDQUEsSUFBQSxrQkFBQTtFQUFBO2lTQUFBOztBQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsdUJBQVIsQ0FBZixDQUFBOztBQUFBLE1BRU0sQ0FBQyxPQUFQLEdBQ007QUFDSix5QkFBQSxDQUFBOztBQUFhLEVBQUEsY0FBQSxHQUFBO0FBQ1gsSUFBQSxzQ0FBTSxNQUFOLENBQUEsQ0FEVztFQUFBLENBQWI7O2NBQUE7O0dBRGlCLGFBSG5CLENBQUE7Ozs7O0FDQUEsSUFBQSxpQkFBQTtFQUFBO2lTQUFBOztBQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsdUJBQVIsQ0FBZixDQUFBOztBQUFBLE1BRU0sQ0FBQyxPQUFQLEdBQ007QUFDSix3QkFBQSxDQUFBOztBQUFhLEVBQUEsYUFBQSxHQUFBO0FBQ1gsSUFBQSxxQ0FBTSxLQUFOLENBQUEsQ0FEVztFQUFBLENBQWI7O2FBQUE7O0dBRGdCLGFBSGxCLENBQUE7Ozs7O0FDQUEsSUFBQSw4QkFBQTs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FBWCxDQUFBOztBQUFBLElBRUEsR0FBTyxPQUFBLENBQVEsYUFBUixDQUZQLENBQUE7O0FBQUEsR0FHQSxHQUFNLE9BQUEsQ0FBUSxZQUFSLENBSE4sQ0FBQTs7QUFBQSxJQUtBLEdBQVcsSUFBQSxJQUFBLENBQUEsQ0FMWCxDQUFBOztBQUFBLEdBTUEsR0FBVSxJQUFBLEdBQUEsQ0FBQSxDQU5WLENBQUE7O0FBQUEsUUFRUSxDQUFDLE9BQVQsR0FBdUIsSUFBQSxRQUFBLENBQVMsQ0FBQyxJQUFELEVBQU8sR0FBUCxDQUFULENBUnZCLENBQUE7O0FBQUEsTUFVTSxDQUFDLE9BQVAsR0FBaUIsUUFWakIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBHZW5lcmF0b3JcbiAgY29uc3RydWN0b3I6IC0+XG4iLCJQYXJzZXIgPSByZXF1aXJlICcuL3BhcnNlcidcbkdlbmVyYXRvciA9IHJlcXVpcmUgJy4vZ2VuZXJhdG9yJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDb21waWxlclxuICBjb25zdHJ1Y3RvcjogLT5cblxuICBjb21waWxlOiAobWQpIC0+XG4gICAgcmV0dXJuIG1kXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQYXJzZXJcbiAgY29uc3RydWN0b3I6IC0+XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMYW5ndWFnZVBhY2tcbiAgY29uc3RydWN0b3I6IChAbnMpIC0+XG4iLCJMYW5ndWFnZVBhY2sgPSByZXF1aXJlICcuLi9jb3JlL2xhbmd1YWdlLXBhY2snXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENvcmUgZXh0ZW5kcyBMYW5ndWFnZVBhY2tcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXIgJ2NvcmUnXG4iLCJMYW5ndWFnZVBhY2sgPSByZXF1aXJlICcuLi9jb3JlL2xhbmd1YWdlLXBhY2snXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdGTSBleHRlbmRzIExhbmd1YWdlUGFja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlciAnZ2ZtJ1xuIiwiQ29tcGlsZXIgPSByZXF1aXJlICcuL2NvbXBpbGVyJ1xuXG5Db3JlID0gcmVxdWlyZSAnLi9sYW5nL2NvcmUnXG5HRk0gPSByZXF1aXJlICcuL2xhbmcvZ2ZtJ1xuXG5jb3JlID0gbmV3IENvcmUoKVxuZ2ZtID0gbmV3IEdGTSgpXG5cbkNvbXBpbGVyLkRlZmF1bHQgPSBuZXcgQ29tcGlsZXIoW2NvcmUsIGdmbV0pXG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcGlsZXJcbiJdfQ==
