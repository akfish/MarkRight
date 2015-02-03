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

  RuleBuilder.prototype._getRegexPart = function(r) {
    var t;
    t = typeof r;
    if (t === 'string') {
      if (r in this._aliasMap) {
        return this._aliasMap[r];
      }
      return r;
    } else if (t === 'object' && r instanceof RegExp) {
      return r.source;
    }
    throw new TypeError("" + r + " is not a valid alias name, string or RegExp");
  };

  RuleBuilder.prototype._makeMatchHandler = function(token_defs) {
    return function(node, matches) {
      var d, match, payload, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = token_defs.length; _i < _len; _i++) {
        d = token_defs[_i];
        payload = match = matches[d.group_index];
        if (d.transform != null) {
          payload = d.transform(payload);
        }
        _results.push(node[d.id] = payload);
      }
      return _results;
    };
  };

  RuleBuilder.prototype.make = function(rule, emitter) {
    var group_index, i, part, r, regex_src, result, should_capture, token_def, token_defs, _i, _len;
    regex_src = '';
    group_index = 0;
    token_defs = [];
    for (i = _i = 0, _len = rule.length; _i < _len; i = ++_i) {
      r = rule[i];
      token_def = emitter[i + 1];
      should_capture = token_def != null;
      part = this._getRegexPart(r);
      if (should_capture) {
        part = "(" + part + ")";
        group_index++;
        token_def.group_index = group_index;
        token_defs.push(token_def);
      }
      regex_src += part;
    }
    result = {
      regex: new RegExp(regex_src),
      handler: this._makeMatchHandler(token_defs)
    };
    return result;
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
    this.declareAlias('^', /^\ {0, 3}/);
    this.declareAlias('$', /$/);
    this.declareAlias(' ', /\s+/);
    this.declareAlias('#', /#{1, 6}/);
    this.declareAlias('- - -', /([*+-]\s?){3,}/);
    this.declareAlias('===', /[-=]{3,}/);
    this.declareAlias('->', /^(\t|\ {4})/);
    this.declareAlias('```', /[~`]{3,}/);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXG5vZGVfbW9kdWxlc1xcZ3VscC1icm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29tcGlsZXJcXGdlbmVyYXRvci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxpbmRleC5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxwYXJzZXIuY29mZmVlIiwiRjpcXGRldlxcanNcXG1hcmtyaWdodFxcY29mZmVlXFxjb3JlXFxsYW5ndWFnZS1wYWNrLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29yZVxccnVsZS1idWlsZGVyLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcbGFuZ1xcY29yZS5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGxhbmdcXGdmbS5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXG1hcmtyaWdodC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFNBQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLEVBQUEsbUJBQUEsR0FBQSxDQUFiOzttQkFBQTs7SUFGRixDQUFBOzs7OztBQ0FBLElBQUEsMkJBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxTQUNBLEdBQVksT0FBQSxDQUFRLGFBQVIsQ0FEWixDQUFBOztBQUFBLE1BR00sQ0FBQyxPQUFQLEdBQ007QUFDUyxFQUFBLGtCQUFBLEdBQUEsQ0FBYjs7QUFBQSxxQkFFQSxPQUFBLEdBQVMsU0FBQyxFQUFELEdB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LENBQUMsSUFBRCxFQUFPLEdBQVAsQ0FBVCxDQVJ2QixDQUFBOztBQUFBLE1BVU0sQ0FBQyxPQUFQLEdBQWlCLFFBVmpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgR2VuZXJhdG9yXG4gIGNvbnN0cnVjdG9yOiAtPlxuIiwiUGFyc2VyID0gcmVxdWlyZSAnLi9wYXJzZXInXG5HZW5lcmF0b3IgPSByZXF1aXJlICcuL2dlbmVyYXRvcidcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29tcGlsZXJcbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgY29tcGlsZTogKG1kKSAtPlxuICAgIHJldHVybiBtZFxuIiwiIyBUaGUgcGFyc2VyIHByb2Nlc3NlcyBpbnB1dCBNYXJrZG93biBzb3VyY2UgYW5kIGdlbmVyYXRlcyBBU1RcbiMgKGFiYXN0cmFjdCBzeW50YXggdHJlZSkgZm9yIHRoZSBnZW5lcmF0b3IgdG8gY29uc3VtZS5cbiNcbiMgIyMgVGVybWlub2xvZ3lcbiNcbiMgKiAqKkRvY3VtZW50cyoqIGFyZSB0b3AgbGV2ZWwgcmVwcmVzZW50YXRpb25zIG9mIHBhcnNlZCBNYXJrZG93biBmaWxlcy5cbiMgKiAqKlNvbGlkIGJsb2NrcyoqIGFyZSBjb250aW51b3VzIGRvY3VtZW50IHBhcnRzIGNvbnNpc3Qgb2Ygb25seSBsZWFmIGJsb2Nrcy5cbiMgKiAqKkZsdWlkIGJsb2NrcyoqIGFyZSBjb250aW51b3VzIGRvY3VtZW50IHBhcnRzIHRoYXQgY29udGFpbnMgY29udGVudHMgb2ZcbiMgICBjb250YWluZXIgYmxvY2tzIHdpdGggY2xvc2luZyBlbGVtZW50cyB5ZXQgdG8gYmUgZGV0ZXJtaW5lZC5cbiNcbiMgU2VlIHtMYW5ndWFnZVBhY2t9IGZvciBsYW5ndWFnZSBzcGVjIHJlbGF0ZWQgdGVybWlub2xvZ3kuXG4jXG4jICMjIFBhcnNpbmcgU3RyYXRlZ3lcbiNcbiMgVGhlIHBhcnNlciBhcHBsaWVzIHJ1bGVzIGluIGEgZGV0ZXJtaW5lZCBvcmRlciAoYS5rLmEuIHByZWNlZGVuY2UpIHRvIGF2b2lkXG4jIGFueSBhbWJpZ3VpdHkuIFRoZSBlbGVtZW50cyB0YWtlIHRoZWlyIHByZWNlZGVuY2UgaW4gZm9sbG93aW5nIG9yZGVyOlxuI1xuIyAxLiBDb250YWluZXIgYmxvY2tzXG4jIDIuIExlYWYgYmxvY2tzXG4jIDMuIElubGluZSBlbGVtZW50c1xuI1xuIyBUaGUgcGFyc2VyIHByb2Nlc3NlcyBhIGRvY3VtZW50IGluIDIgcGFzc2VzOlxuI1xuIyAxLiBEZXRlcm1pbmUgYmxvY2sgc3RydWN0dXJlcyBhbmQgYXNzaWduIHVuLXBhcnNlZCBzb3VyY2UgdG8gZWFjaCBibG9jayB0b2tlbnNcbiMgMi4gUGFyc2UgaW5saW5lIHRva2VucyBvZiBlYWNoIGJsb2Nrc1xuI1xuIyAjIyMgQmxvY2sgUGFyc2luZ1xuI1xuIyBCbG9jayBwYXJzaW5nIGlzIGltcGxlbWVudGVkIGluIHtQYXJzZXIjX3BhcnNlQmxvY2tzfS5cbiMgVW5saWtlIG90aGVyIE1hcmtkb3duIHBhcnNlciBpbXBsZW1lbnRhdGlvbnMsIE1hcmtSaWdodCBwYXJzZXIgZG9lc1xuIyBub3QgcmVxdWlyZSBtYXRjaGVkIHJ1bGVzIHRvIGJlIGFuY2hvcmVkIGF0IHRoZSBiZWdpbmluZyBvZiB0aGUgc3RyZWFtLlxuIyBJbnN0ZWFkLCB7UGFyc2VyI19fX3BhcnNlT25lQmxvY2t9IGFwcGxpZXMgcnVsZXMgZnJvbSBoaWdoZXN0IHByZWNlZGVuY2UgdG9cbiMgbG93ZXN0IGFuZCByZXR1cm5zIHRoZSBmaXJzdCBtYXRjaCBubyBtYXR0ZXIgd2hlcmUgdGhlIG1hdGNoJ3MgbG9jYXRpb24gaXMuXG4jXG4jIEl0IGlzIGV4cGVjZWQgdGhhdCB0aGUgZmlyc3QgbWF0Y2ggdXN1YWxseSBvY2N1cnMgaW4gdGhlIG1pZGRsZSB0aHVzIHNwbGl0aW5nXG4jIHRoZSBzdHJlYW0gaW50byB0aHJlZSBwYXJ0czpcbiNcbiMgYGBgXG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIERvY3VtZW50IEJlZ2luXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgIFBhcnNlZCAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIE9mZnNldFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIFJlc2lkdWFsIEJlZm9yZSAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIEZpcnN0IE1hdGNoICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIFJlc2lkdWFsIEFmdGVyICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKyBEb2N1bWVudCBFbmRcbiMgYGBgXG4jXG4jIElmIHRoZSBgRmlyc3QgTWF0Y2hgIGlzIGEgbGVhZiBibG9jaywgdGhlIHBhcnNlciBjYW4gc2FmZWx5IGFzc3VtZSB0aGF0IHRoZVxuIyBlbnRpcmUgc3RyZWFtIGlzIG9uZSBzb2xpZCBibG9jay4gSGVuY2UgYm90aCByZXNpZHVhbCBibG9ja3MgYXJlIHNvbGlkIHRvby5cbiMgVGh1cyB0aGUgcGFyc2luZyBjYW4gYmUgYWNoaXZlZCBieSByZWN1c2l2ZWx5IHBhcnNlIGFuZCBzcGxpdCB0aGUgc3RyZWFtIGludG9cbiMgc21hbGxlciBhbmQgc21hbGxlciBibG9ja3MgdW50aWwgdGhlIGVudGlyZSBzdHJlYW0gaXMgcGFyc2VkLlxuIyBUaGlzIGlzIGRvbmUgYnkge1BhcnNlciNfX3BhcnNlU29saWRCbG9ja3N9LlxuI1xuIyBJZiB0aGUgYEZpcnN0IE1hdGNoYCBpcyBhIGNvbnRhaW5lciBibG9jayBzdGFydCB0b2tlbiwgdGhlIGBSZXNpZHVhbCBCZWZvcmVgXG4jIGlzIGtub3duIHRvIGJlIGEgc29saWQgYmxvY2sgYW5kIGNhbiBiZSBwYXJzZWQgd2l0aFxuIyB7UGFyc2VyI19fcGFyc2VTb2xpZEJsb2Nrc30uXG4jIFRoZSBgUmVzaWR1YWwgQWZ0ZXJgIHdvdWxkIGJlIGEgZmx1aWQgYmxvY2s6XG4jXG4jIGBgYFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIEZpcnN0IE1hdGNoICAgICAgICAgfCA8LS0tKyBDb250YWluZXIgYmxvY2sgc3RhcnQgdG9rZW5cbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgKGUuZy4gJz4gJyBmb3IgYSBibG9ja3F1b3RlKVxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyBYICAgICAgICAgICAgICAgICAgICAgICAgICAgWFxuIyBYICAgICAgIENvbnRlbnQgb2YgICAgICAgICAgWCA8LS0tKyBSZXNpZHVhbCBBZnRlciAoRmx1aWQgQmxvY2spXG4jIFggICAgICAgQ29udGFpbmVyIEJsb2NrICAgICBYXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jIFgtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1YIC0tLS0+IE5ldyBvZmZzZXQgZm9yIG5leHQgaXRlcmF0aW9uXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jIFggICAgICAgVW4tcGFyc2VkICAgICAgICAgICBYXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIERvY3VtZW50IEVuZFxuIyBgYGBcbiNcbiMgQSBmbHVpZCBibG9jayBpcyBwYXJzZWQgYnkge1BhcnNlciNfX3BhcnNlRmx1aWRCbG9ja3N9LiBJdCBwYXJzZXMgdGhlIGZsdWlkXG4jIGJsb2NrIGxpbmVhcmx5IGFuZCBsb29rcyBmb3IgbGluZXMgc3RhcnQgd2l0aCBjb250ZW50IGJsb2NrIGRlbGltaXRlciAoZS5nLlxuIyAnPiAnIGZvciBibG9ja3F1b3RlcyBvciBjb3JyZWN0IGxldmVsIG9mIGluZGVudGF0aW9uIGZvciBsaXN0IGl0ZW1zKS5cbiMgRGVsaW1pdGVycyBhcmUgc3RyaXBwZWQgYmVmb3JlIHRoZSBjb250ZW50cyBhcmUgYWdncmVnYXRlZCBpbnRvIG9uZSBuZXcgYmxvY2tcbiMgZm9yIGxhdGVyIHBhcnNpbmcuIEEgbmV3IGxpbmUgd2l0aG91dCBhIGNvbnRhaW5lciBibG9jayBkZWxpbWl0ZXIgY2FuIGVpdGhlclxuIyBiZSB0aGUgZW5kIG9mIGN1cnJlbnQgY29udGFpbmVyIGJsb2NrIG9yIHNob3VsZCBiZSBhZGRlZCB0byB0aGUgY29udGFpbmVyXG4jIGFjY3JvZGluZyB0byAnbGF6aW5lc3MnIHJ1bGUuIFRoZSBwYXJzaW5nIGlzIG5vdCBjb21wbGV0ZSB1bnRpbCBlaXRoZXIgdGhlIGVuZFxuIyBvZiBjb250YWluZXIgYmxvY2sgb3IgdGhlIGVuZCBvZiB0aGUgZG9jdW1lbnQgaXMgZW5jb3VudGVyZWQuXG4jXG4jIGBgYFxuIyArLS0tKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIHwgICB8ICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAqIHwgQ29udGVudCAgICAgICAgICAgICAgfFxuIyB8ICAgfCAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0rLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgPC0tKyBQb3NzaWJsZSBlbmQgb2YgY29udGVudCBibG9ja1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgIE5leHQgZWxlbWVudCB3aXRob3V0IHxcbiMgfCAgICAgZGVsaW1pdGVyICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICBVbi1wYXJzZWQgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuI1xuIyAqIENvbnRhaW5lciBibG9jayBkZWxpbWl0ZXJcbiMgYGBgXG4jXG4jIEFmdGVyIGVhY2ggaXRlcmF0aW9uLCB0aGUgYG9mZnNldGAgaXMgYWR2YW5jZWQgYW5kIHRoZSB3aG9sZSBwcm9jZXNzIHN0YXJ0c1xuIyBhZ2FpbiB1bnRpbCB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudC5cbiNcbiMgIyMjIElubGluZSBFbGVtZW50IFBhcnNpbmdcbiNcbiMgSW5saW5lIGVsZW1lbnQgcGFyc2luZyAoe1BhcnNlciNfcGFyc2VJbmxpbmV9KSBpcyB0cml2YWwuXG4jIFRoZSBzdGF0ZWd5IGlzIGV4YWN0bHkgdGhlIHNhbWUgYXMgc29saWQgYmxvY2sgcGFyc2luZy5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBhcnNlclxuICAjIENyZWF0ZSBhIHtQYXJzZXJ9IGluc3RhbmNlXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICMgUGFyc2UgTWFya2Rvd24gc291cmNlIGludG8gQVNUXG4gICMgQHBhcmFtIHtzdHJpbmd9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtBcnJheX0gQVNUXG4gIHBhcnNlOiAoc3JjKSAtPlxuICAgIGFzdCA9IEBfcGFyc2VCbG9ja3Moc3JjKVxuICAgIGFzdCA9IEBfcGFyc2VJbmxpbmUoYXN0KVxuXG4gICAgcmV0dXJuIGFzdFxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSBibG9jayBzdHJ1Y3R1cmVzXG4gICMgQHBhcmFtIHtzdHJpbmd9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtBcnJheX0gQVNUXG4gIF9wYXJzZUJsb2NrczogKHNyYykgLT5cbiAgICBvZmZzZXQgPSAwXG4gICAgbiA9IHNyYy5sZW5ndGhcbiAgICBwZW5kaW5nID0gW11cbiAgICBhc3QgPSBbXVxuXG4gICAgd2hpbGUgb2Zmc2V0IDwgbiBvciBwZW5kaW5nLmxlbmd0aCA+IDBcbiAgICAgIHN0YXJ0SW5kZXggPSBvZmZzZXRcbiAgICAgIGNiX3N0YXJ0X3Rva2VuID0gQF9fdHJ5UGFyc2VDb250YWluZXJCbG9ja1N0YXJ0VG9rZW4ob2Zmc2V0LCBzcmMpXG4gICAgICBsYXN0SW5kZXggPSBjYl9zdGFydF90b2tlbi5zdGFydEluZGV4XG4gICAgICBpZiBjYl9zdGFydF90b2tlbj9cbiAgICAgICAgYXN0X3NvbGlkX3BhcnQgPSBAX19wYXJzZVNvbGlkQmxvY2tzKHN0YXJ0SW5kZXgsIGxhc3RJbmRleCwgc3JjKVxuICAgICAgICB7b2Zmc2V0LCBhc3RfZmx1aWRfcGFydH0gPSBAX19wYXJzZUZsdWlkQmxvY2tzKGNiX3N0YXJ0X3Rva2VuLCBzcmMpXG4gICAgICBlbHNlXG4gICAgICAgIHtvZmZzZXQsIGFzdF9zb2xpZF9wYXJ0fSA9IEBfX3BhcnNlU29saWRCbG9ja3Moc3RhcnRJbmRleCwgbiwgc3JjKVxuXG4gICAgICBhc3QucHVzaCBhc3Rfc29saWRfcGFydFxuICAgICAgYXN0LnB1c2ggYXN0X2ZsdWlkX3BhcnRcblxuICAgIHJldHVybiBhc3RcblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgdGhlIHNvdXJjZSBzdGFydGluZyBmcm9tIGdpdmVuIG9mZnNldCBhbmQgdHJpZXMgdG8gZmluZCB0aGUgZmlyc3RcbiAgIyBjb250YWluZXIgYmxvY2sgc3RhcnQgdG9rZW5cbiAgIyBAcGFyYW0ge2ludH0gb2Zmc2V0IE9mZnNldCB2YWx1ZVxuICAjIEBwYXJhbSB7c3RyaW5nfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiB7VG9rZW59IE1hdGNoZWQgdG9rZW4gKG51bGxhYmxlKVxuICBfdHJ5UGFyc2VDb250YWluZXJCbG9ja1N0YXJ0VG9rZW46IChvZmZzZXQsIHNyYykgLT5cblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgdGhlIHNwZWNpZmllZCBkb2N1bWVudCByZWdpb24gYXMgYSBzb2xpZCBibG9ja1xuICAjIEBwYXJhbSB7aW50fSBiZWdpbiBTdGFydCBpbmRleCBvZiB0aGUgcmVnaW9uXG4gICMgQHBhcmFtIHtpbnR9IGVuZCBMYXN0IGluZGV4IG9mIHRoZSByZWdpb25cbiAgIyBAcGFyYW0ge3NyY30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4gW0FycmF5PFRva2VuPl0gQVNUIG9mIHNwZWNpZmllZCByZWdpb25cbiAgX19wYXJzZVNvbGlkQmxvY2tzOiAoYmVnaW4sIGVuZCwgc3JjKSAtPlxuICAgIGJsb2NrID0gQF9fX3BhcnNlT25lQmxvY2soYmVnaW4sIGVuZCwgc3JjKVxuICAgIGFzdF9wYXJ0X2JlZm9yZSA9IEBfX3BhcnNlU29saWRCbG9ja3MoYmVnaW4sIGJsb2NrLnN0YXJ0SW5kZXggLSAxLCBzcmMpXG4gICAgYXN0X3BhcnRfYWZ0ZXIgID0gQF9fcGFyc2VTb2xpZEJsb2NrcyhibG9jay5sYXN0SW5kZXgsIGVuZCwgc3JjKVxuXG4gICAgcmV0dXJuIFtdLmNvbmNhdChhc3RfcGFydF9iZWZvcmUsIGJsb2NrLCBhc3RfcGFydF9hZnRlcilcblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgdGhlIHNwZWNpZmllZCBkb2N1bWVudCByZWdpb24gYXMgYSBmbHVpZCBibG9ja1xuICAjIEBwYXJhbSB7VG9rZW59IHN0YXJ0X3Rva2VuIFRoZSBzdGFydCB0b2tlbiBvZiBhIGNvbnRhaW5lciBibG9ja1xuICAjIEBwYXJhbSB7c3RyaW5nfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiBbQXJyYXk8VG9rZW4+XSBBU1Qgb2Ygc3BlY2lmaWVkIHJlZ2lvblxuICBfX3BhcnNlRmx1aWRCbG9ja3M6IChzdGFydF90b2tlbiwgc3JjKSAtPlxuXG4gICMgQHByaXZhdGVcbiAgIyBNYXRjaCBibG9jayBydWxlcyBmcm9tIGhpZ2hlc3QgcHJlY2VkZW5jZSB0byBsb3dlc3QgYWdhaW5zdCB0aGUgc3BlY2lmaWVkXG4gICMgZG9jdW1lbnQgcmVnaW9uIGFuZCByZXR1cm5zIGltbWVkaWF0ZWx5IG9uIHRoZSBmaXJzdCBtYXRjaC5cbiAgIyBAcGFyYW0ge2ludH0gYmVnaW4gU3RhcnQgaW5kZXggb2YgdGhlIHJlZ2lvblxuICAjIEBwYXJhbSB7aW50fSBlbmQgTGFzdCBpbmRleCBvZiB0aGUgcmVnaW9uXG4gICMgQHBhcmFtIHtzcmN9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtUb2tlbn0gVGhlIGZpcnN0IG1hdGNoXG4gIF9fX3BhcnNlT25lQmxvY2s6IC0+IChiZWdpbiwgZW5kLCBzcmMpIC0+XG5cblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgaW5saW5lIGVsZW1lbnRzXG4gICMgQHBhcmFtIHtBcnJheX0gYXN0IEFTVCB3aXRoIHVuLXBhcnNlZCBibG9jayBub2RlcyBvbmx5XG4gICMgQHJldHVybiB7QXJyYXl9IEZ1bGx5IHBhcnNlZCBBU1RcbiAgX3BhcnNlSW5saW5lOiAoYXN0KSAtPlxuIiwiUnVsZUJ1aWxkZXIgPSByZXF1aXJlICcuL3J1bGUtYnVpbGRlcidcblxuIyMjXG5CYXNlIGNsYXNzIGZvciBsYW5ndWFnZSBwYWNrc1xuIyMjXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMYW5ndWFnZVBhY2tcbiAgY29uc3RydWN0b3I6IChAbnMpIC0+XG4gICAgQF9idWlsZGVyID0gbmV3IFJ1bGVCdWlsZGVyKClcblxuICBkZWNsYXJlQWxpYXM6IChhbGlhcywgcmVnZXgpIC0+XG4gICAgQF9idWlsZGVyLmRlY2xhcmVBbGlhcyhhbGlhcywgcmVnZXgpXG5cbiAgZGVjbGFyZURlbGltaXRlclBhaXI6IChvcGVuLCBjbG9zZSkgLT5cbiAgICAjIFRPRE86IHVzZWQgZm9yIGhvdCB1cGRhdGUgbW9kZSwgaW1wbGVtZW50IGxhdGVyXG5cbiAgYWRkQmxvY2tSdWxlOiAobmFtZSwgcnVsZSwgZW1pdHRlcikgLT5cblxuICBhZGRJbmxpbmVSdWxlOiAobmFtZSwgcnVsZSwgZW1pdHRlcikgLT5cblxuICBlbWl0QXR0cmlidXRlOiAobmFtZSwgdHJhbnNmb3JtKSAtPlxuXG4gIGVtaXRDb250ZW50OiAobmFtZSwgdHJhbnNmb3JtKSAtPlxuXG4gIGVtaXRUZXh0OiAobmFtZSwgdHJhbnNmb3JtKSAtPlxuIiwiIyB7UnVsZUJ1aWxkZXJ9IGlzIHVzZWQgYnkge0xhbmd1YWdlUGFja30gaW50ZXJuYWxseSB0byBjb21waWxlIHJ1bGVzIGZvciBwYXJzZXJcbiMgdG8gZXhlY3V0ZS5cbiNcbiMgIyMgVGVybWlub2xvZ3lcbiNcbiMgKiAqKlJ1bGUgZGVjbGVyYXRpb24qKnMgYXJlIG1hZGUgd2l0aCBBUEkgY2FsbHMgaW4ge0xhbmd1YWdlUGFja30gdG8gc3BlY2lmeVxuIyAgIHRoZSBzeWFudGF4IG9mIGEgbGFuZ3VhZ2UgZmVhdHVyZSB3aXRoIHJlZ2V4IGFzIHdlbGwgYXMgaG93IHJlbGV2ZW50IGRhdGEgaXNcbiMgICBjYXB0dXJlZCBhbmQgZW1pdHRlZCBpbnRvIHRva2Vucy5cbiMgKiAqKlJ1bGUqKnMgYXJlIGNvbXBpbGVkIGRlY2xhcmF0aW9ucyBlYWNoIG9mIHdoaWNoIGNvbnNpc3RzIG9mIGEgcmVnZXggYW5kIGFcbiMgICBoYW5kbGVyIGZ1bmN0aW9uLiBUaGUgbGF0dGVyIGVtaXRzIGEgdG9rZW4gb3IgbWFuaXB1bGF0ZXMgdGhlIHBhcmVudCB0b2tlbi5cbiNcbiMgRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRvIGRlY2FscmUgYSBydWxlLCBzZWUge0xhbmd1YWdlUGFja30uXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSdWxlQnVpbGRlclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2FsaWFzTWFwID0ge31cblxuICBkZWNsYXJlQWxpYXM6IChhbGlhcywgcmVnZXgpIC0+XG4gICAgIyBUT0RPOiBjaGVjayBmb3IgZHVwbGljYXRpb25cbiAgICBAX2FsaWFzTWFwW2FsaWFzXSA9IHJlZ2V4XG5cbiAgIyBAcHJpdmF0ZVxuICAjXG4gICMgR2V0IHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSByZWdleCBwYXJ0IGZvciBjb25jYXRlbmF0aWlvbi5cbiAgI1xuICAjIEBvdmVybG9hZCBfZ2V0UmVnZXhQYXJ0KGFsaWFzX29yX2xpdGVyYWwpXG4gICMgICBUaGUgYXJndW1lbnQgaXMgc2VhcmNoZWQgaW4gdGhlIGFsaWFzIG1hcCBmaXJzdC4gSWYgbm8gbWF0Y2ggaXMgZm91bmQsIGl0XG4gICMgICBpcyB0aGVuIGNvbnNpZGVyZWQgYXMgYSBsaXRlcmFsIHJlZ2V4IHNvdXJjZSBzdHJpbmcuXG4gICMgICBAcGFyYW0gW3N0cmluZ10gYWxpYXNfb3JfbGl0ZXJhbFxuICAjIEBvdmVybG9hZCBfZ2V0UmVnZXhQYXJ0KHJlZ2V4KVxuICAjICAgQHBhcmFtIFtSZWdFeHBdIHJlZ2V4XG4gICMgQHJldHVybiBbc3RyaW5nXSBSZWdleCBwYXJ0J3Mgc3RyaW5nIHNvdXJjZVxuICBfZ2V0UmVnZXhQYXJ0OiAocikgLT5cbiAgICB0ID0gdHlwZW9mIHJcbiAgICBpZiB0ID09ICdzdHJpbmcnXG4gICAgICBpZiByIG9mIEBfYWxpYXNNYXBcbiAgICAgICAgcmV0dXJuIEBfYWxpYXNNYXBbcl1cbiAgICAgICMgVE9ETzogZXNjYXBlXG4gICAgICByZXR1cm4gclxuICAgIGVsc2UgaWYgdCA9PSAnb2JqZWN0JyBhbmQgciBpbnN0YW5jZW9mIFJlZ0V4cFxuICAgICAgcmV0dXJuIHIuc291cmNlXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIiN7cn0gaXMgbm90IGEgdmFsaWQgYWxpYXMgbmFtZSwgc3RyaW5nIG9yIFJlZ0V4cFwiKVxuXG4gIF9tYWtlTWF0Y2hIYW5kbGVyOiAodG9rZW5fZGVmcykgLT5cbiAgICByZXR1cm4gKG5vZGUsIG1hdGNoZXMpIC0+XG4gICAgICBmb3IgZCBpbiB0b2tlbl9kZWZzXG4gICAgICAgIHBheWxvYWQgPSBtYXRjaCA9IG1hdGNoZXNbZC5ncm91cF9pbmRleF1cbiAgICAgICAgaWYgZC50cmFuc2Zvcm0/XG4gICAgICAgICAgcGF5bG9hZCA9IGQudHJhbnNmb3JtKHBheWxvYWQpXG5cbiAgICAgICAgbm9kZVtkLmlkXSA9IHBheWxvYWRcbiAgICAgICAgIyBUT0RPOiBhdHRhY2ggcGF5bG9hZCB0byBub2RlXG5cblxuICBtYWtlOiAocnVsZSwgZW1pdHRlcikgLT5cbiAgICByZWdleF9zcmMgPSAnJ1xuICAgIGdyb3VwX2luZGV4ID0gMFxuICAgIHRva2VuX2RlZnMgPSBbXVxuICAgIGZvciByLCBpIGluIHJ1bGVcbiAgICAgIHRva2VuX2RlZiA9IGVtaXR0ZXJbaSArIDFdXG4gICAgICBzaG91bGRfY2FwdHVyZSA9IHRva2VuX2RlZj9cblxuICAgICAgcGFydCA9IEBfZ2V0UmVnZXhQYXJ0KHIpXG4gICAgICBpZiBzaG91bGRfY2FwdHVyZVxuICAgICAgICBwYXJ0ID0gXCIoI3twYXJ0fSlcIlxuICAgICAgICBncm91cF9pbmRleCsrXG4gICAgICAgIHRva2VuX2RlZi5ncm91cF9pbmRleCA9IGdyb3VwX2luZGV4XG4gICAgICAgIHRva2VuX2RlZnMucHVzaCB0b2tlbl9kZWZcbiAgICAgIHJlZ2V4X3NyYyArPSBwYXJ0XG5cbiAgICByZXN1bHQgPVxuICAgICAgcmVnZXg6IG5ldyBSZWdFeHAocmVnZXhfc3JjKVxuICAgICAgaGFuZGxlcjogQF9tYWtlTWF0Y2hIYW5kbGVyKHRva2VuX2RlZnMpXG4gICAgcmV0dXJuIHJlc3VsdFxuIiwiTGFuZ3VhZ2VQYWNrID0gcmVxdWlyZSAnLi4vY29yZS9sYW5ndWFnZS1wYWNrJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDb3JlIGV4dGVuZHMgTGFuZ3VhZ2VQYWNrXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyICdjb3JlJ1xuXG4gICAgQGRlY2xhcmVBbGlhcyAnXicsICAgICAgL15cXCB7MCwgM30vXG4gICAgQGRlY2xhcmVBbGlhcyAnJCcsICAgICAgLyQvXG4gICAgQGRlY2xhcmVBbGlhcyAnICcsICAgICAgL1xccysvXG4gICAgQGRlY2xhcmVBbGlhcyAnIycsICAgICAgLyN7MSwgNn0vXG4gICAgQGRlY2xhcmVBbGlhcyAnLSAtIC0nLCAgLyhbKistXVxccz8pezMsfS9cbiAgICBAZGVjbGFyZUFsaWFzICc9PT0nLCAgICAvWy09XXszLH0vXG4gICAgQGRlY2xhcmVBbGlhcyAnLT4nLCAgICAgL14oXFx0fFxcIHs0fSkvXG4gICAgQGRlY2xhcmVBbGlhcyAnYGBgJywgICAgL1t+YF17Myx9L1xuXG4gICAgQGRlY2xhcmVEZWxpbWl0ZXJQYWlyICcoJywgJyknXG4gICAgQGRlY2xhcmVEZWxpbWl0ZXJQYWlyICdbJywgJ10nXG4gICAgQGRlY2xhcmVEZWxpbWl0ZXJQYWlyICd7JywgJ30nXG4gICAgQGRlY2xhcmVEZWxpbWl0ZXJQYWlyICc8JywgJz4nXG4gICAgQGRlY2xhcmVEZWxpbWl0ZXJQYWlyICdgYGAnXG5cbiAgICBAYWRkQmxvY2tSdWxlICdydWxlcycsIFsnXicsICctIC0gLScsICckJ11cblxuICAgIEBhZGRCbG9ja1J1bGUgJ2F0eF9oZWFkZXInLCBbJ14nLCAnIycsICcgJywgLyguKilcXHMqLywgJyQnXSxcbiAgICAgIDE6IEBlbWl0QXR0cmlidXRlICdsZXZlbCcsIChoYXNoKSAtPiBoYXNoLmxlbmd0aFxuICAgICAgMzogQGVtaXRDb250ZW50ICAgJ3RpdGxlJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnc2V0ZXh0X2hlYWRlcicsIFsnXicsIC8oW15cXHNdLiopXFxuLywgJz09PScsICckJ10sXG4gICAgICAxOiBAZW1pdENvbnRlbnQgICAndGl0bGUnXG4gICAgICAyOiBAZW1pdEF0dHJpYnV0ZSAnbGV2ZWwnLCAocikgLT4gaWYgclswXSA9PSAnLScgdGhlbiAxIGVsc2UgMlxuXG4gICAgQGFkZEJsb2NrUnVsZSAnaW5kZW50ZWRfY29kZScsIFsnLT4nLCAvKC4qKS8sICckJ10sXG4gICAgICAxOiBAZW1pdFRleHQgICAgICAnc3JjJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnZmVuY2VkX2NvZGUnLCBbJ14nLCAnYGBgJywgJyQnLCAvKFteXSopLywgJ14nLCAnYGBgJywgJyQnXSxcbiAgICAgIDM6IEBlbWl0VGV4dCAgICAgICdzcmMnXG5cbiAgICBAYWRkQmxvY2tSdWxlICdodG1sJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnbGlua19yZWYnXG5cbiAgICBAYWRkQmxvY2tSdWxlICdwYXJhZ3JhcGgnXG5cbiAgICBAYWRkQmxvY2tSdWxlICdibGFua19saW5lJ1xuXG4gICAgIyBUQkQ6IGFnZ3JlZ2F0ZSBgbGlzdF9pdGVtYCBpbnRvIG9uZSBgKl9saXN0YCBlbGVtZW50IGxhdGVyXG4gICAgIyAgICAgIG9yIGVtaXQgZGlyZWN0bHlcbiAgICAjIEBhZGRCbG9ja1J1bGUgJ29yZGVyZWRfbGlzdCdcbiAgICAjXG4gICAgIyBAYWRkQmxvY2tSdWxlICd1bm9yZGVyZWRfbGlzdCdcblxuICAgIEBhZGRCbG9ja1J1bGUgJ2xpc3RfaXRlbSdcblxuICAgIEBhZGRJbmxpbmVSdWxlICdiYWNrc2xhc2hfZXNjYXBlJ1xuXG4gICAgQGFkZElubGluZVJ1bGUgJ2VudGl0eSdcblxuICAgIEBhZGRJbmxpbmVSdWxlICdjb2RlX3NwYW4nXG4iLCJMYW5ndWFnZVBhY2sgPSByZXF1aXJlICcuLi9jb3JlL2xhbmd1YWdlLXBhY2snXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdGTSBleHRlbmRzIExhbmd1YWdlUGFja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlciAnZ2ZtJ1xuIiwiQ29tcGlsZXIgPSByZXF1aXJlICcuL2NvbXBpbGVyJ1xuXG5Db3JlID0gcmVxdWlyZSAnLi9sYW5nL2NvcmUnXG5HRk0gPSByZXF1aXJlICcuL2xhbmcvZ2ZtJ1xuXG5jb3JlID0gbmV3IENvcmUoKVxuZ2ZtID0gbmV3IEdGTSgpXG5cbkNvbXBpbGVyLkRlZmF1bHQgPSBuZXcgQ29tcGlsZXIoW2NvcmUsIGdmbV0pXG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcGlsZXJcbiJdfQ==
