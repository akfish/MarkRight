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

  Parser.prototype.parse = function(src) {
    var ast;
    ast = this._parseBlocks(src);
    ast = this._parseInline(ast);
    return ast;
  };

  Parser.prototype._parseBlocks = function(src) {
    var ast, ast_fluid_part, ast_solid_part, cb_start_token, lastIndex, n, offset, pending, startIndex, _ref, _ref1;
    offset = 0;
    n = src.length;
    pending = [];
    ast = [];
    while (offset < n || pending.length > 0) {
      startIndex = offset;
      cb_start_token = this.__tryParseContainerBlockStartToken(offset, src);
      lastIndex = cb_start_token.startIndex;
      if (cb_start_token != null) {
        ast_solid_part = this.__parseSolidBlocks(startIndex, lastIndex, src);
        _ref = this.__parseFluidBlocks(cb_start_token, src), offset = _ref.offset, ast_fluid_part = _ref.ast_fluid_part;
      } else {
        _ref1 = this.__parseSolidBlocks(startIndex, n, src), offset = _ref1.offset, ast_solid_part = _ref1.ast_solid_part;
      }
      ast.push(ast_solid_part);
      ast.push(ast_fluid_part);
    }
    return ast;
  };

  Parser.prototype._tryParseContainerBlockStartToken = function(offset, src) {};

  Parser.prototype.__parseSolidBlocks = function(begin, end, src) {
    var ast_part_after, ast_part_before, block;
    block = this.___parseOneBlock(begin, end, src);
    ast_part_before = this.__parseSolidBlocks(begin, block.startIndex - 1, src);
    ast_part_after = this.__parseSolidBlocks(block.lastIndex, end, src);
    return [].concat(ast_part_before, block, ast_part_after);
  };

  Parser.prototype.__parseFluidBlocks = function(start_token, src) {};

  Parser.prototype.___parseOneBlock = function() {
    return function(begin, end, src) {};
  };

  Parser.prototype._parseInline = function(ast) {};

  return Parser;

})();



},{}],4:[function(require,module,exports){
var LanguagePack, RuleBuilder;

RuleBuilder = require('./rule-builder');


/*
Base class for language packs
 */

module.exports = LanguagePack = (function() {
  function LanguagePack(ns) {
    this.ns = ns;
    this._builder = new RuleBuilder();
  }

  LanguagePack.prototype.declareAlias = function(alias, regex) {
    return this._builder.declareAlias(alias, regex);
  };

  LanguagePack.prototype.declareDelimiterPair = function(open, close) {};

  LanguagePack.prototype.addBlockRule = function(name, rule, emitter) {};

  LanguagePack.prototype.addInlineRule = function(name, rule, emitter) {};

  LanguagePack.prototype.emitAttribute = function(name, transform) {};

  LanguagePack.prototype.emitContent = function(name, transform) {};

  LanguagePack.prototype.emitText = function(name, transform) {};

  return LanguagePack;

})();



},{"./rule-builder":5}],5:[function(require,module,exports){
var RuleBuilder;

module.exports = RuleBuilder = (function() {
  function RuleBuilder() {
    this._aliasMap = {};
  }

  RuleBuilder.prototype.declareAlias = function(alias, regex) {
    return this._aliasMap[alias] = regex;
  };

  RuleBuilder.prototype._getRegexPart = function(alias_or_literal) {};

  RuleBuilder.prototype._makeMatchHandler = function(token_defs) {
    return function(node, matches) {
      var d, match, payload, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = token_defs.length; _i < _len; _i++) {
        d = token_defs[_i];
        payload = match = matches[d.group_index];
        if (d.transform != null) {
          _results.push(payload = d.transform(payload));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
  };

  RuleBuilder.prototype.make = function(rule, emitter) {
    var group_index, i, part, r, regex_src, should_capture, token_def, token_defs, _i, _len;
    regex_src = '';
    group_index = 0;
    token_defs = [];
    for (i = _i = 0, _len = rule.length; _i < _len; i = ++_i) {
      r = rule[i];
      token_def = emitter[i];
      should_capture = token_def != null;
      part = _getRegexPart(r);
      if (should_capture) {
        part = "(" + part + ")";
      }
      regex_src += part;
      group_index++;
      token_def.group_index = group_index;
      token_defs.push(token_def);
    }
    return {
      regex: new Regexp(regex_src)({
        handler: this._makeMatchHandler(token_defs)
      })
    };
  };

  return RuleBuilder;

})();



},{}],6:[function(require,module,exports){
var Core, LanguagePack,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

LanguagePack = require('../core/language-pack');

module.exports = Core = (function(_super) {
  __extends(Core, _super);

  function Core() {
    Core.__super__.constructor.call(this, 'core');
    this.decalreAlias('^', /^\ {0, 3}/);
    this.decalreAlias('$', /$/);
    this.decalreAlias(' ', /\s+/);
    this.decalreAlias('#', /#{1, 6}/);
    this.decalreAlias('- - -', /([*+-]\s?){3,}/);
    this.decalreAlias('===', /[-=]{3,}/);
    this.decalreAlias('->', /^(\t|\ {4})/);
    this.decalreAlias('```', /[~`]{3,}/);
    this.declareDelimiterPair('(', ')');
    this.declareDelimiterPair('[', ']');
    this.declareDelimiterPair('{', '}');
    this.declareDelimiterPair('<', '>');
    this.declareDelimiterPair('```');
    this.addBlockRule('rules', ['^', '- - -', '$']);
    this.addBlockRule('atx_header', ['^', '#', ' ', /(.*)\s*/, '$'], {
      1: this.emitAttribute('level', function(hash) {
        return hash.length;
      }),
      3: this.emitContent('title')
    });
    this.addBlockRule('setext_header', ['^', /([^\s].*)\n/, '===', '$'], {
      1: this.emitContent('title'),
      2: this.emitAttribute('level', function(r) {
        if (r[0] === '-') {
          return 1;
        } else {
          return 2;
        }
      })
    });
    this.addBlockRule('indented_code', ['->', /(.*)/, '$'], {
      1: this.emitText('src')
    });
    this.addBlockRule('fenced_code', ['^', '```', '$', /([^]*)/, '^', '```', '$'], {
      3: this.emitText('src')
    });
    this.addBlockRule('html');
    this.addBlockRule('link_ref');
    this.addBlockRule('paragraph');
    this.addBlockRule('blank_line');
    this.addBlockRule('list_item');
    this.addInlineRule('backslash_escape');
    this.addInlineRule('entity');
    this.addInlineRule('code_span');
  }

  return Core;

})(LanguagePack);



},{"../core/language-pack":4}],7:[function(require,module,exports){
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



},{"../core/language-pack":4}],8:[function(require,module,exports){
var Compiler, Core, GFM, core, gfm;

Compiler = require('./compiler');

Core = require('./lang/core');

GFM = require('./lang/gfm');

core = new Core();

gfm = new GFM();

Compiler.Default = new Compiler([core, gfm]);

module.exports = Compiler;



},{"./compiler":2,"./lang/core":6,"./lang/gfm":7}]},{},[8])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXG5vZGVfbW9kdWxlc1xcZ3VscC1icm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29tcGlsZXJcXGdlbmVyYXRvci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxpbmRleC5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxwYXJzZXIuY29mZmVlIiwiRjpcXGRldlxcanNcXG1hcmtyaWdodFxcY29mZmVlXFxjb3JlXFxsYW5ndWFnZS1wYWNrLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29yZVxccnVsZS1idWlsZGVyLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcbGFuZ1xcY29yZS5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGxhbmdcXGdmbS5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXG1hcmtyaWdodC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFNBQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLEVBQUEsbUJBQUEsR0FBQSxDQUFiOzttQkFBQTs7SUFGRixDQUFBOzs7OztBQ0FBLElBQUEsMkJBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxTQUNBLEdBQVksT0FBQSxDQUFRLGFBQVIsQ0FEWixDQUFBOztBQUFBLE1BR00sQ0FBQyxPQUFQLEdBQ007QUFDUyxFQUFBLGtCQUFBLEdBQUEsQ0FBYjs7QUFBQSxxQkFFQSxPQUFBLEdBQVMsU0FBQyxFQUFELEdB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OztBQ0FBLElBQUEsaUJBQUE7RUFBQTtpU0FBQTs7QUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHVCQUFSLENBQWYsQ0FBQTs7QUFBQSxNQUVNLENBQUMsT0FBUCxHQUNNO0FBQ0osd0JBQUEsQ0FBQTs7QUFBYSxFQUFBLGFBQUEsR0FBQTtBQUNYLElBQUEscUNBQU0sS0FBTixDQUFBLENBRFc7RUFBQSxDQUFiOzthQUFBOztHQURnQixhQUhsQixDQUFBOzs7OztBQ0FBLElBQUEsOEJBQUE7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBQVgsQ0FBQTs7QUFBQSxJQUVBLEdBQU8sT0FBQSxDQUFRLGFBQVIsQ0FGUCxDQUFBOztBQUFBLEdBR0EsR0FBTSxPQUFBLENBQVEsWUFBUixDQUhOLENBQUE7O0FBQUEsSUFLQSxHQUFXLElBQUEsSUFBQSxDQUFBLENBTFgsQ0FBQTs7QUFBQSxHQU1BLEdBQVUsSUFBQSxHQUFBLENBQUEsQ0FOVixDQUFBOztBQUFBLFFBUVEsQ0FBQyxPQUFULEdBQXVCLElBQUEsUUFBQSxDQUFTLENBQUMsSUFBRCxFQUFPLEdBQVAsQ0FBVCxDQVJ2QixDQUFBOztBQUFBLE1BVU0sQ0FBQyxPQUFQLEdBQWlCLFFBVmpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgR2VuZXJhdG9yXG4gIGNvbnN0cnVjdG9yOiAtPlxuIiwiUGFyc2VyID0gcmVxdWlyZSAnLi9wYXJzZXInXG5HZW5lcmF0b3IgPSByZXF1aXJlICcuL2dlbmVyYXRvcidcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29tcGlsZXJcbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgY29tcGlsZTogKG1kKSAtPlxuICAgIHJldHVybiBtZFxuIiwiIyBUaGUgcGFyc2VyIHByb2Nlc3NlcyBpbnB1dCBNYXJrZG93biBzb3VyY2UgYW5kIGdlbmVyYXRlcyBBU1RcbiMgKGFiYXN0cmFjdCBzeW50YXggdHJlZSkgZm9yIHRoZSBnZW5lcmF0b3IgdG8gY29uc3VtZS5cbiNcbiMgIyMgVGVybWlub2xvZ3lcbiNcbiMgKiAqKkRvY3VtZW50cyoqIGFyZSB0b3AgbGV2ZWwgcmVwcmVzZW50YXRpb25zIG9mIHBhcnNlZCBNYXJrZG93biBmaWxlcy5cbiMgKiAqKlNvbGlkIGJsb2NrcyoqIGFyZSBjb250aW51b3VzIGRvY3VtZW50IHBhcnRzIGNvbnNpc3Qgb2Ygb25seSBsZWFmIGJsb2Nrcy5cbiMgKiAqKkZsdWlkIGJsb2NrcyoqIGFyZSBjb250aW51b3VzIGRvY3VtZW50IHBhcnRzIHRoYXQgY29udGFpbnMgY29udGVudHMgb2ZcbiMgICBjb250YWluZXIgYmxvY2tzIHdpdGggY2xvc2luZyBlbGVtZW50cyB5ZXQgdG8gYmUgZGV0ZXJtaW5lZC5cbiNcbiMgU2VlIHtMYW5ndWFnZVBhY2t9IGZvciBsYW5ndWFnZSBzcGVjIHJlbGF0ZWQgdGVybWlub2xvZ3kuXG4jXG4jICMjIFBhcnNpbmcgU3RyYXRlZ3lcbiNcbiMgVGhlIHBhcnNlciBhcHBsaWVzIHJ1bGVzIGluIGEgZGV0ZXJtaW5lZCBvcmRlciAoYS5rLmEuIHByZWNlZGVuY2UpIHRvIGF2b2lkXG4jIGFueSBhbWJpZ3VpdHkuIFRoZSBlbGVtZW50cyB0YWtlIHRoZWlyIHByZWNlZGVuY2UgaW4gZm9sbG93aW5nIG9yZGVyOlxuI1xuIyAxLiBDb250YWluZXIgYmxvY2tzXG4jIDIuIExlYWYgYmxvY2tzXG4jIDMuIElubGluZSBlbGVtZW50c1xuI1xuIyBUaGUgcGFyc2VyIHByb2Nlc3NlcyBhIGRvY3VtZW50IGluIDIgcGFzc2VzOlxuI1xuIyAxLiBEZXRlcm1pbmUgYmxvY2sgc3RydWN0dXJlcyBhbmQgYXNzaWduIHVuLXBhcnNlZCBzb3VyY2UgdG8gZWFjaCBibG9jayB0b2tlbnNcbiMgMi4gUGFyc2UgaW5saW5lIHRva2VucyBvZiBlYWNoIGJsb2Nrc1xuI1xuIyAjIyMgQmxvY2sgUGFyc2luZ1xuI1xuIyBCbG9jayBwYXJzaW5nIGlzIGltcGxlbWVudGVkIGluIHtQYXJzZXIjX3BhcnNlQmxvY2tzfS5cbiMgVW5saWtlIG90aGVyIE1hcmtkb3duIHBhcnNlciBpbXBsZW1lbnRhdGlvbnMsIE1hcmtSaWdodCBwYXJzZXIgZG9lc1xuIyBub3QgcmVxdWlyZSBtYXRjaGVkIHJ1bGVzIHRvIGJlIGFuY2hvcmVkIGF0IHRoZSBiZWdpbmluZyBvZiB0aGUgc3RyZWFtLlxuIyBJbnN0ZWFkLCB7UGFyc2VyI19fX3BhcnNlT25lQmxvY2t9IGFwcGxpZXMgcnVsZXMgZnJvbSBoaWdoZXN0IHByZWNlZGVuY2UgdG9cbiMgbG93ZXN0IGFuZCByZXR1cm5zIHRoZSBmaXJzdCBtYXRjaCBubyBtYXR0ZXIgd2hlcmUgdGhlIG1hdGNoJ3MgbG9jYXRpb24gaXMuXG4jXG4jIEl0IGlzIGV4cGVjZWQgdGhhdCB0aGUgZmlyc3QgbWF0Y2ggdXN1YWxseSBvY2N1cnMgaW4gdGhlIG1pZGRsZSB0aHVzIHNwbGl0aW5nXG4jIHRoZSBzdHJlYW0gaW50byB0aHJlZSBwYXJ0czpcbiNcbiMgYGBgXG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIERvY3VtZW50IEJlZ2luXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgIFBhcnNlZCAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIE9mZnNldFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIFJlc2lkdWFsIEJlZm9yZSAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIEZpcnN0IE1hdGNoICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIFJlc2lkdWFsIEFmdGVyICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKyBEb2N1bWVudCBFbmRcbiMgYGBgXG4jXG4jIElmIHRoZSBgRmlyc3QgTWF0Y2hgIGlzIGEgbGVhZiBibG9jaywgdGhlIHBhcnNlciBjYW4gc2FmZWx5IGFzc3VtZSB0aGF0IHRoZVxuIyBlbnRpcmUgc3RyZWFtIGlzIG9uZSBzb2xpZCBibG9jay4gSGVuY2UgYm90aCByZXNpZHVhbCBibG9ja3MgYXJlIHNvbGlkIHRvby5cbiMgVGh1cyB0aGUgcGFyc2luZyBjYW4gYmUgYWNoaXZlZCBieSByZWN1c2l2ZWx5IHBhcnNlIGFuZCBzcGxpdCB0aGUgc3RyZWFtIGludG9cbiMgc21hbGxlciBhbmQgc21hbGxlciBibG9ja3MgdW50aWwgdGhlIGVudGlyZSBzdHJlYW0gaXMgcGFyc2VkLlxuIyBUaGlzIGlzIGRvbmUgYnkge1BhcnNlciNfX3BhcnNlU29saWRCbG9ja3N9LlxuI1xuIyBJZiB0aGUgYEZpcnN0IE1hdGNoYCBpcyBhIGNvbnRhaW5lciBibG9jayBzdGFydCB0b2tlbiwgdGhlIGBSZXNpZHVhbCBCZWZvcmVgXG4jIGlzIGtub3duIHRvIGJlIGEgc29saWQgYmxvY2sgYW5kIGNhbiBiZSBwYXJzZWQgd2l0aFxuIyB7UGFyc2VyI19fcGFyc2VTb2xpZEJsb2Nrc30uXG4jIFRoZSBgUmVzaWR1YWwgQWZ0ZXJgIHdvdWxkIGJlIGEgZmx1aWQgYmxvY2s6XG4jXG4jIGBgYFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIEZpcnN0IE1hdGNoICAgICAgICAgfCA8LS0tKyBDb250YWluZXIgYmxvY2sgc3RhcnQgdG9rZW5cbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgKGUuZy4gJz4gJyBmb3IgYSBibG9ja3F1b3RlKVxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyBYICAgICAgICAgICAgICAgICAgICAgICAgICAgWFxuIyBYICAgICAgIENvbnRlbnQgb2YgICAgICAgICAgWCA8LS0tKyBSZXNpZHVhbCBBZnRlciAoRmx1aWQgQmxvY2spXG4jIFggICAgICAgQ29udGFpbmVyIEJsb2NrICAgICBYXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jIFgtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1YIC0tLS0+IE5ldyBvZmZzZXQgZm9yIG5leHQgaXRlcmF0aW9uXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jIFggICAgICAgVW4tcGFyc2VkICAgICAgICAgICBYXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIERvY3VtZW50IEVuZFxuIyBgYGBcbiNcbiMgQSBmbHVpZCBibG9jayBpcyBwYXJzZWQgYnkge1BhcnNlciNfX3BhcnNlRmx1aWRCbG9ja3N9LiBJdCBwYXJzZXMgdGhlIGZsdWlkXG4jIGJsb2NrIGxpbmVhcmx5IGFuZCBsb29rcyBmb3IgbGluZXMgc3RhcnQgd2l0aCBjb250ZW50IGJsb2NrIGRlbGltaXRlciAoZS5nLlxuIyAnPiAnIGZvciBibG9ja3F1b3RlcyBvciBjb3JyZWN0IGxldmVsIG9mIGluZGVudGF0aW9uIGZvciBsaXN0IGl0ZW1zKS5cbiMgRGVsaW1pdGVycyBhcmUgc3RyaXBwZWQgYmVmb3JlIHRoZSBjb250ZW50cyBhcmUgYWdncmVnYXRlZCBpbnRvIG9uZSBuZXcgYmxvY2tcbiMgZm9yIGxhdGVyIHBhcnNpbmcuIEEgbmV3IGxpbmUgd2l0aG91dCBhIGNvbnRhaW5lciBibG9jayBkZWxpbWl0ZXIgY2FuIGVpdGhlclxuIyBiZSB0aGUgZW5kIG9mIGN1cnJlbnQgY29udGFpbmVyIGJsb2NrIG9yIHNob3VsZCBiZSBhZGRlZCB0byB0aGUgY29udGFpbmVyXG4jIGFjY3JvZGluZyB0byAnbGF6aW5lc3MnIHJ1bGUuIFRoZSBwYXJzaW5nIGlzIG5vdCBjb21wbGV0ZSB1bnRpbCBlaXRoZXIgdGhlIGVuZFxuIyBvZiBjb250YWluZXIgYmxvY2sgb3IgdGhlIGVuZCBvZiB0aGUgZG9jdW1lbnQgaXMgZW5jb3VudGVyZWQuXG4jXG4jIGBgYFxuIyArLS0tKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIHwgICB8ICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAqIHwgQ29udGVudCAgICAgICAgICAgICAgfFxuIyB8ICAgfCAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0rLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgPC0tKyBQb3NzaWJsZSBlbmQgb2YgY29udGVudCBibG9ja1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgIE5leHQgZWxlbWVudCB3aXRob3V0IHxcbiMgfCAgICAgZGVsaW1pdGVyICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICBVbi1wYXJzZWQgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuI1xuIyAqIENvbnRhaW5lciBibG9jayBkZWxpbWl0ZXJcbiMgYGBgXG4jXG4jIEFmdGVyIGVhY2ggaXRlcmF0aW9uLCB0aGUgYG9mZnNldGAgaXMgYWR2YW5jZWQgYW5kIHRoZSB3aG9sZSBwcm9jZXNzIHN0YXJ0c1xuIyBhZ2FpbiB1bnRpbCB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudC5cbiNcbiMgIyMjIElubGluZSBFbGVtZW50IFBhcnNpbmdcbiNcbiMgSW5saW5lIGVsZW1lbnQgcGFyc2luZyAoe1BhcnNlciNfcGFyc2VJbmxpbmV9KSBpcyB0cml2YWwuXG4jIFRoZSBzdGF0ZWd5IGlzIGV4YWN0bHkgdGhlIHNhbWUgYXMgc29saWQgYmxvY2sgcGFyc2luZy5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBhcnNlclxuICAjIENyZWF0ZSBhIHtQYXJzZXJ9IGluc3RhbmNlXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICMgUGFyc2UgTWFya2Rvd24gc291cmNlIGludG8gQVNUXG4gICMgQHBhcmFtIHtzdHJpbmd9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtBcnJheX0gQVNUXG4gIHBhcnNlOiAoc3JjKSAtPlxuICAgIGFzdCA9IEBfcGFyc2VCbG9ja3Moc3JjKVxuICAgIGFzdCA9IEBfcGFyc2VJbmxpbmUoYXN0KVxuXG4gICAgcmV0dXJuIGFzdFxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSBibG9jayBzdHJ1Y3R1cmVzXG4gICMgQHBhcmFtIHtzdHJpbmd9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtBcnJheX0gQVNUXG4gIF9wYXJzZUJsb2NrczogKHNyYykgLT5cbiAgICBvZmZzZXQgPSAwXG4gICAgbiA9IHNyYy5sZW5ndGhcbiAgICBwZW5kaW5nID0gW11cbiAgICBhc3QgPSBbXVxuXG4gICAgd2hpbGUgb2Zmc2V0IDwgbiBvciBwZW5kaW5nLmxlbmd0aCA+IDBcbiAgICAgIHN0YXJ0SW5kZXggPSBvZmZzZXRcbiAgICAgIGNiX3N0YXJ0X3Rva2VuID0gQF9fdHJ5UGFyc2VDb250YWluZXJCbG9ja1N0YXJ0VG9rZW4ob2Zmc2V0LCBzcmMpXG4gICAgICBsYXN0SW5kZXggPSBjYl9zdGFydF90b2tlbi5zdGFydEluZGV4XG4gICAgICBpZiBjYl9zdGFydF90b2tlbj9cbiAgICAgICAgYXN0X3NvbGlkX3BhcnQgPSBAX19wYXJzZVNvbGlkQmxvY2tzKHN0YXJ0SW5kZXgsIGxhc3RJbmRleCwgc3JjKVxuICAgICAgICB7b2Zmc2V0LCBhc3RfZmx1aWRfcGFydH0gPSBAX19wYXJzZUZsdWlkQmxvY2tzKGNiX3N0YXJ0X3Rva2VuLCBzcmMpXG4gICAgICBlbHNlXG4gICAgICAgIHtvZmZzZXQsIGFzdF9zb2xpZF9wYXJ0fSA9IEBfX3BhcnNlU29saWRCbG9ja3Moc3RhcnRJbmRleCwgbiwgc3JjKVxuXG4gICAgICBhc3QucHVzaCBhc3Rfc29saWRfcGFydFxuICAgICAgYXN0LnB1c2ggYXN0X2ZsdWlkX3BhcnRcblxuICAgIHJldHVybiBhc3RcblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgdGhlIHNvdXJjZSBzdGFydGluZyBmcm9tIGdpdmVuIG9mZnNldCBhbmQgdHJpZXMgdG8gZmluZCB0aGUgZmlyc3RcbiAgIyBjb250YWluZXIgYmxvY2sgc3RhcnQgdG9rZW5cbiAgIyBAcGFyYW0ge2ludH0gb2Zmc2V0IE9mZnNldCB2YWx1ZVxuICAjIEBwYXJhbSB7c3RyaW5nfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiB7VG9rZW59IE1hdGNoZWQgdG9rZW4gKG51bGxhYmxlKVxuICBfdHJ5UGFyc2VDb250YWluZXJCbG9ja1N0YXJ0VG9rZW46IChvZmZzZXQsIHNyYykgLT5cblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgdGhlIHNwZWNpZmllZCBkb2N1bWVudCByZWdpb24gYXMgYSBzb2xpZCBibG9ja1xuICAjIEBwYXJhbSB7aW50fSBiZWdpbiBTdGFydCBpbmRleCBvZiB0aGUgcmVnaW9uXG4gICMgQHBhcmFtIHtpbnR9IGVuZCBMYXN0IGluZGV4IG9mIHRoZSByZWdpb25cbiAgIyBAcGFyYW0ge3NyY30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4gW0FycmF5PFRva2VuPl0gQVNUIG9mIHNwZWNpZmllZCByZWdpb25cbiAgX19wYXJzZVNvbGlkQmxvY2tzOiAoYmVnaW4sIGVuZCwgc3JjKSAtPlxuICAgIGJsb2NrID0gQF9fX3BhcnNlT25lQmxvY2soYmVnaW4sIGVuZCwgc3JjKVxuICAgIGFzdF9wYXJ0X2JlZm9yZSA9IEBfX3BhcnNlU29saWRCbG9ja3MoYmVnaW4sIGJsb2NrLnN0YXJ0SW5kZXggLSAxLCBzcmMpXG4gICAgYXN0X3BhcnRfYWZ0ZXIgID0gQF9fcGFyc2VTb2xpZEJsb2NrcyhibG9jay5sYXN0SW5kZXgsIGVuZCwgc3JjKVxuXG4gICAgcmV0dXJuIFtdLmNvbmNhdChhc3RfcGFydF9iZWZvcmUsIGJsb2NrLCBhc3RfcGFydF9hZnRlcilcblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgdGhlIHNwZWNpZmllZCBkb2N1bWVudCByZWdpb24gYXMgYSBmbHVpZCBibG9ja1xuICAjIEBwYXJhbSB7VG9rZW59IHN0YXJ0X3Rva2VuIFRoZSBzdGFydCB0b2tlbiBvZiBhIGNvbnRhaW5lciBibG9ja1xuICAjIEBwYXJhbSB7c3RyaW5nfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiBbQXJyYXk8VG9rZW4+XSBBU1Qgb2Ygc3BlY2lmaWVkIHJlZ2lvblxuICBfX3BhcnNlRmx1aWRCbG9ja3M6IChzdGFydF90b2tlbiwgc3JjKSAtPlxuXG4gICMgQHByaXZhdGVcbiAgIyBNYXRjaCBibG9jayBydWxlcyBmcm9tIGhpZ2hlc3QgcHJlY2VkZW5jZSB0byBsb3dlc3QgYWdhaW5zdCB0aGUgc3BlY2lmaWVkXG4gICMgZG9jdW1lbnQgcmVnaW9uIGFuZCByZXR1cm5zIGltbWVkaWF0ZWx5IG9uIHRoZSBmaXJzdCBtYXRjaC5cbiAgIyBAcGFyYW0ge2ludH0gYmVnaW4gU3RhcnQgaW5kZXggb2YgdGhlIHJlZ2lvblxuICAjIEBwYXJhbSB7aW50fSBlbmQgTGFzdCBpbmRleCBvZiB0aGUgcmVnaW9uXG4gICMgQHBhcmFtIHtzcmN9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtUb2tlbn0gVGhlIGZpcnN0IG1hdGNoXG4gIF9fX3BhcnNlT25lQmxvY2s6IC0+IChiZWdpbiwgZW5kLCBzcmMpIC0+XG5cblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgaW5saW5lIGVsZW1lbnRzXG4gICMgQHBhcmFtIHtBcnJheX0gYXN0IEFTVCB3aXRoIHVuLXBhcnNlZCBibG9jayBub2RlcyBvbmx5XG4gICMgQHJldHVybiB7QXJyYXl9IEZ1bGx5IHBhcnNlZCBBU1RcbiAgX3BhcnNlSW5saW5lOiAoYXN0KSAtPlxuIiwiUnVsZUJ1aWxkZXIgPSByZXF1aXJlICcuL3J1bGUtYnVpbGRlcidcblxuIyMjXG5CYXNlIGNsYXNzIGZvciBsYW5ndWFnZSBwYWNrc1xuIyMjXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMYW5ndWFnZVBhY2tcbiAgY29uc3RydWN0b3I6IChAbnMpIC0+XG4gICAgQF9idWlsZGVyID0gbmV3IFJ1bGVCdWlsZGVyKClcblxuICBkZWNsYXJlQWxpYXM6IChhbGlhcywgcmVnZXgpIC0+XG4gICAgQF9idWlsZGVyLmRlY2xhcmVBbGlhcyhhbGlhcywgcmVnZXgpXG5cbiAgZGVjbGFyZURlbGltaXRlclBhaXI6IChvcGVuLCBjbG9zZSkgLT5cbiAgICAjIFRPRE86IHVzZWQgZm9yIGhvdCB1cGRhdGUgbW9kZSwgaW1wbGVtZW50IGxhdGVyXG5cbiAgYWRkQmxvY2tSdWxlOiAobmFtZSwgcnVsZSwgZW1pdHRlcikgLT5cblxuICBhZGRJbmxpbmVSdWxlOiAobmFtZSwgcnVsZSwgZW1pdHRlcikgLT5cblxuICBlbWl0QXR0cmlidXRlOiAobmFtZSwgdHJhbnNmb3JtKSAtPlxuXG4gIGVtaXRDb250ZW50OiAobmFtZSwgdHJhbnNmb3JtKSAtPlxuXG4gIGVtaXRUZXh0OiAobmFtZSwgdHJhbnNmb3JtKSAtPlxuIiwibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUnVsZUJ1aWxkZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9hbGlhc01hcCA9IHt9XG5cbiAgZGVjbGFyZUFsaWFzOiAoYWxpYXMsIHJlZ2V4KSAtPlxuICAgICMgVE9ETzogY2hlY2sgZm9yIGR1cGxpY2F0aW9uXG4gICAgQF9hbGlhc01hcFthbGlhc10gPSByZWdleFxuXG4gIF9nZXRSZWdleFBhcnQ6IChhbGlhc19vcl9saXRlcmFsKSAtPlxuICAgICMgVE9ETzogZmV0Y2ggcmVnZXggcGFydCBmcm9tIGFsaWFzIG1hcCBvciBwYXJzZSBmcm9tIGxpdGVyYWxcblxuICBfbWFrZU1hdGNoSGFuZGxlcjogKHRva2VuX2RlZnMpIC0+XG4gICAgcmV0dXJuIChub2RlLCBtYXRjaGVzKSAtPlxuICAgICAgZm9yIGQgaW4gdG9rZW5fZGVmc1xuICAgICAgICBwYXlsb2FkID0gbWF0Y2ggPSBtYXRjaGVzW2QuZ3JvdXBfaW5kZXhdXG4gICAgICAgIGlmIGQudHJhbnNmb3JtP1xuICAgICAgICAgIHBheWxvYWQgPSBkLnRyYW5zZm9ybShwYXlsb2FkKVxuXG4gICAgICAgICMgVE9ETzogYXR0YWNoIHBheWxvYWQgdG8gbm9kZVxuXG4gICAgICAgIFxuICBtYWtlOiAocnVsZSwgZW1pdHRlcikgLT5cbiAgICByZWdleF9zcmMgPSAnJ1xuICAgIGdyb3VwX2luZGV4ID0gMFxuICAgIHRva2VuX2RlZnMgPSBbXVxuICAgIGZvciByLCBpIGluIHJ1bGVcbiAgICAgIHRva2VuX2RlZiA9IGVtaXR0ZXJbaV1cbiAgICAgIHNob3VsZF9jYXB0dXJlID0gdG9rZW5fZGVmP1xuXG4gICAgICBwYXJ0ID0gX2dldFJlZ2V4UGFydChyKVxuICAgICAgaWYgc2hvdWxkX2NhcHR1cmVcbiAgICAgICAgcGFydCA9IFwiKCN7cGFydH0pXCJcbiAgICAgIHJlZ2V4X3NyYyArPSBwYXJ0XG4gICAgICBncm91cF9pbmRleCsrXG5cbiAgICAgIHRva2VuX2RlZi5ncm91cF9pbmRleCA9IGdyb3VwX2luZGV4XG4gICAgICB0b2tlbl9kZWZzLnB1c2ggdG9rZW5fZGVmXG5cbiAgICByZXR1cm4gcmVnZXg6IG5ldyBSZWdleHAocmVnZXhfc3JjKVxuICAgICAgaGFuZGxlcjogQF9tYWtlTWF0Y2hIYW5kbGVyKHRva2VuX2RlZnMpXG4iLCJMYW5ndWFnZVBhY2sgPSByZXF1aXJlICcuLi9jb3JlL2xhbmd1YWdlLXBhY2snXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENvcmUgZXh0ZW5kcyBMYW5ndWFnZVBhY2tcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXIgJ2NvcmUnXG5cbiAgICBAZGVjYWxyZUFsaWFzICdeJywgICAgICAvXlxcIHswLCAzfS9cbiAgICBAZGVjYWxyZUFsaWFzICckJywgICAgICAvJC9cbiAgICBAZGVjYWxyZUFsaWFzICcgJywgICAgICAvXFxzKy9cbiAgICBAZGVjYWxyZUFsaWFzICcjJywgICAgICAvI3sxLCA2fS9cbiAgICBAZGVjYWxyZUFsaWFzICctIC0gLScsICAvKFsqKy1dXFxzPyl7Myx9L1xuICAgIEBkZWNhbHJlQWxpYXMgJz09PScsICAgIC9bLT1dezMsfS9cbiAgICBAZGVjYWxyZUFsaWFzICctPicsICAgICAvXihcXHR8XFwgezR9KS9cbiAgICBAZGVjYWxyZUFsaWFzICdgYGAnLCAgICAvW35gXXszLH0vXG5cbiAgICBAZGVjbGFyZURlbGltaXRlclBhaXIgJygnLCAnKSdcbiAgICBAZGVjbGFyZURlbGltaXRlclBhaXIgJ1snLCAnXSdcbiAgICBAZGVjbGFyZURlbGltaXRlclBhaXIgJ3snLCAnfSdcbiAgICBAZGVjbGFyZURlbGltaXRlclBhaXIgJzwnLCAnPidcbiAgICBAZGVjbGFyZURlbGltaXRlclBhaXIgJ2BgYCdcblxuICAgIEBhZGRCbG9ja1J1bGUgJ3J1bGVzJywgWydeJywgJy0gLSAtJywgJyQnXVxuXG4gICAgQGFkZEJsb2NrUnVsZSAnYXR4X2hlYWRlcicsIFsnXicsICcjJywgJyAnLCAvKC4qKVxccyovLCAnJCddLFxuICAgICAgMTogQGVtaXRBdHRyaWJ1dGUgJ2xldmVsJywgKGhhc2gpIC0+IGhhc2gubGVuZ3RoXG4gICAgICAzOiBAZW1pdENvbnRlbnQgICAndGl0bGUnXG5cbiAgICBAYWRkQmxvY2tSdWxlICdzZXRleHRfaGVhZGVyJywgWydeJywgLyhbXlxcc10uKilcXG4vLCAnPT09JywgJyQnXSxcbiAgICAgIDE6IEBlbWl0Q29udGVudCAgICd0aXRsZSdcbiAgICAgIDI6IEBlbWl0QXR0cmlidXRlICdsZXZlbCcsIChyKSAtPiBpZiByWzBdID09ICctJyB0aGVuIDEgZWxzZSAyXG5cbiAgICBAYWRkQmxvY2tSdWxlICdpbmRlbnRlZF9jb2RlJywgWyctPicsIC8oLiopLywgJyQnXSxcbiAgICAgIDE6IEBlbWl0VGV4dCAgICAgICdzcmMnXG5cbiAgICBAYWRkQmxvY2tSdWxlICdmZW5jZWRfY29kZScsIFsnXicsICdgYGAnLCAnJCcsIC8oW15dKikvLCAnXicsICdgYGAnLCAnJCddLFxuICAgICAgMzogQGVtaXRUZXh0ICAgICAgJ3NyYydcblxuICAgIEBhZGRCbG9ja1J1bGUgJ2h0bWwnXG5cbiAgICBAYWRkQmxvY2tSdWxlICdsaW5rX3JlZidcblxuICAgIEBhZGRCbG9ja1J1bGUgJ3BhcmFncmFwaCdcblxuICAgIEBhZGRCbG9ja1J1bGUgJ2JsYW5rX2xpbmUnXG5cbiAgICAjIFRCRDogYWdncmVnYXRlIGBsaXN0X2l0ZW1gIGludG8gb25lIGAqX2xpc3RgIGVsZW1lbnQgbGF0ZXJcbiAgICAjICAgICAgb3IgZW1pdCBkaXJlY3RseVxuICAgICMgQGFkZEJsb2NrUnVsZSAnb3JkZXJlZF9saXN0J1xuICAgICNcbiAgICAjIEBhZGRCbG9ja1J1bGUgJ3Vub3JkZXJlZF9saXN0J1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnbGlzdF9pdGVtJ1xuXG4gICAgQGFkZElubGluZVJ1bGUgJ2JhY2tzbGFzaF9lc2NhcGUnXG5cbiAgICBAYWRkSW5saW5lUnVsZSAnZW50aXR5J1xuXG4gICAgQGFkZElubGluZVJ1bGUgJ2NvZGVfc3BhbidcbiIsIkxhbmd1YWdlUGFjayA9IHJlcXVpcmUgJy4uL2NvcmUvbGFuZ3VhZ2UtcGFjaydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgR0ZNIGV4dGVuZHMgTGFuZ3VhZ2VQYWNrXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyICdnZm0nXG4iLCJDb21waWxlciA9IHJlcXVpcmUgJy4vY29tcGlsZXInXG5cbkNvcmUgPSByZXF1aXJlICcuL2xhbmcvY29yZSdcbkdGTSA9IHJlcXVpcmUgJy4vbGFuZy9nZm0nXG5cbmNvcmUgPSBuZXcgQ29yZSgpXG5nZm0gPSBuZXcgR0ZNKClcblxuQ29tcGlsZXIuRGVmYXVsdCA9IG5ldyBDb21waWxlcihbY29yZSwgZ2ZtXSlcblxubW9kdWxlLmV4cG9ydHMgPSBDb21waWxlclxuIl19
