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
var Def, Emitter, OptionalEmitter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Def = require('./token').Def;


/*
Used when defining language rules with {LanguagePack} APIs.

An emitter method does not actually emit any tokens when called, but creating
a definition or contract of tokens that will be emitted once the corresponding
rule is matched.
 */

module.exports = Emitter = (function() {
  function Emitter(modifiers) {
    this.modifiers = modifiers != null ? modifiers : {};
    this.optional = new OptionalEmitter();
  }

  Emitter.prototype.attribute = function(id, transform) {
    return new Def(Def.Attribute, id, transform, this.modifiers);
  };

  Emitter.prototype.content = function(id, transform) {
    return new Def(Def.Content, id, transform, this.modifiers);
  };

  Emitter.prototype.text = function(id, transform) {
    return new Def(Def.Text, id, transform, this.modifiers);
  };

  Emitter.prototype.delimiter = function(id, transform) {
    return new Def(Def.Delimiter, id, transform, this.modifiers);
  };

  Emitter.prototype.nothing = function() {
    return new Def(Def.Nothing, null, null, this.modifiers);
  };

  return Emitter;

})();

OptionalEmitter = (function(_super) {
  __extends(OptionalEmitter, _super);

  function OptionalEmitter() {
    this.modifiers = {
      optional: true
    };
  }

  return OptionalEmitter;

})(Emitter);



},{"./token":7}],5:[function(require,module,exports){
var Emitter, LanguagePack, RuleBuilder;

RuleBuilder = require('./rule-builder');

Emitter = require('./emitter');


/*
Base class for language packs
 */

module.exports = LanguagePack = (function() {
  LanguagePack.prototype.emit = new Emitter();

  function LanguagePack(ns) {
    this.ns = ns;
    this._builder = new RuleBuilder();
    this.blockRules = [];
    this.inlineRules = [];
  }

  LanguagePack.prototype.declareAlias = function(alias, regex) {
    return this._builder.declareAlias(alias, regex);
  };

  LanguagePack.prototype.declareDelimiterPair = function(open, close) {};

  LanguagePack.prototype.addBlockRule = function(name, rule, emitter) {
    var built_rule;
    built_rule = this._builder.make(rule, emitter);
    built_rule.name = name;
    return this.blockRules.push(built_rule);
  };

  LanguagePack.prototype.addInlineRule = function(name, rule, emitter) {
    var built_rule;
    built_rule = this._builder.make(rule, emitter);
    built_rule.name = name;
    return this.inlineRules.push(built_rule);
  };

  return LanguagePack;

})();



},{"./emitter":4,"./rule-builder":6}],6:[function(require,module,exports){
var Def, RuleBuilder;

Def = require('./token').Def;

module.exports = RuleBuilder = (function() {
  function RuleBuilder() {
    this._aliasMap = {};
    this._subRules = {};
  }

  RuleBuilder.prototype.declareAlias = function(alias, regex) {
    return this._aliasMap[alias] = regex;
  };

  RuleBuilder.prototype.declareSubRule = function(name, rule, capture_map) {
    var compiled;
    compiled = this._compileRule(rule, capture_map);
    return this._subRules[name] = compiled;
  };

  RuleBuilder.prototype._getRegexPart = function(r) {
    var escape_r, t;
    escape_r = /[-\/\\^$*+?.()|[\]{}]/g;
    t = typeof r;
    if (t === 'string') {
      if (r in this._aliasMap) {
        return {
          type: 'alias',
          rule: this._aliasMap[r]
        };
      }
      if (r in this._subRules) {
        return {
          type: 'sub',
          rule: this._subRules[r]
        };
      }
      return {
        type: 'literal',
        rule: r.replace(escape_r, '\\$&')
      };
    } else if (t === 'object' && r instanceof RegExp) {
      return {
        type: 'regex',
        rule: r.source
      };
    } else if (t === 'array') {
      throw new Error("Not implemented");
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

  RuleBuilder.prototype._compileRule = function(rule, capture_map) {
    var base_group_index, compiled, copied, could_capture, current_group_index, current_optional_group, err, group_index, i, in_optional_group, lazy_leaving, optional_changing, part, part_src, r, regex_src, sub_def, token_def, token_defs, _i, _j, _len, _len1, _ref, _ref1;
    regex_src = '';
    group_index = 0;
    token_defs = [];
    in_optional_group = false;
    current_optional_group = "";
    for (i = _i = 0, _len = rule.length; _i < _len; i = ++_i) {
      r = rule[i];
      token_def = capture_map != null ? capture_map[i + 1] : void 0;
      could_capture = token_def != null;
      part = this._getRegexPart(r);
      part_src = part.rule;
      if (part.type === 'sub') {
        if (could_capture) {
          err = new TypeError("Sub-rules cannot be re-captured");
          err.ruleName = r;
          err.ruleIndex = i;
          throw err;
        }
        regex_src += part.rule.regex.source;
        base_group_index = group_index;
        _ref = part.rule.token_defs;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          sub_def = _ref[_j];
          copied = Def.clone(sub_def);
          current_group_index = base_group_index + sub_def.group_index;
          copied.group_index = current_group_index;
          group_index = current_group_index;
          token_defs.push(copied);
        }
      } else {
        if (could_capture) {
          lazy_leaving = in_optional_group && (token_def.optional == null);
          optional_changing = ((_ref1 = token_def.optional) != null ? _ref1 : false) !== in_optional_group;
          if (lazy_leaving || optional_changing) {
            if (!in_optional_group) {
              in_optional_group = true;
            } else {
              in_optional_group = false;
              regex_src += "(?:" + current_optional_group + ")?";
              current_optional_group = "";
            }
          }
          if (token_def.type !== Def.Nothing) {
            group_index++;
            part_src = "(" + part.rule + ")";
            token_defs.push(token_def);
            token_def.group_index = group_index;
          }
        } else if (in_optional_group) {
          in_optional_group = false;
          regex_src += "(?:" + current_optional_group + ")?";
          current_optional_group = "";
        }
        if (in_optional_group) {
          current_optional_group += part_src;
        } else {
          regex_src += part_src;
        }
      }
    }
    compiled = {
      regex: new RegExp(regex_src),
      token_defs: token_defs
    };
    return compiled;
  };

  RuleBuilder.prototype.make = function(rule, capture_map) {
    var compiled, result;
    compiled = this._compileRule(rule, capture_map);
    result = {
      regex: compiled.regex,
      handler: this._makeMatchHandler(compiled.token_defs)
    };
    return result;
  };

  return RuleBuilder;

})();



},{"./token":7}],7:[function(require,module,exports){
var Token, TokenDef;

module.exports = Token = (function() {
  function Token() {}

  Token.prototype.prev = null;

  Token.prototype.next = null;

  Token.prototype.parent = null;

  Token.prototype.children = [];

  Token.prototype.firstChild = null;

  Token.prototype.prevSibling = null;

  Token.prototype.nextSibling = null;

  return Token;

})();

module.exports.Def = TokenDef = (function() {
  TokenDef.Attribute = 'attribute';

  TokenDef.Content = 'content';

  TokenDef.Text = 'text';

  TokenDef.Delimiter = 'delimiter';

  TokenDef.Nothing = 'nothing';

  TokenDef.clone = function(another) {
    var copied, key, value;
    copied = new TokenDef(another.type, another.id, another.transform);
    for (key in another) {
      value = another[key];
      if (another.hasOwnProperty(key)) {
        copied[key] = value;
      }
    }
    return copied;
  };

  function TokenDef(type, id, transform, modifiers) {
    var key, value;
    this.type = type;
    this.id = id;
    this.transform = transform;
    if (modifiers != null) {
      for (key in modifiers) {
        value = modifiers[key];
        this[key] = value;
      }
    }
  }

  return TokenDef;

})();



},{}],8:[function(require,module,exports){
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
      1: this.emit.attribute('level', function(hash) {
        return hash.length;
      }),
      3: this.emit.content('title')
    });
    this.addBlockRule('setext_header', ['^', /([^\s].*)\n/, '===', '$'], {
      1: this.emit.content('title'),
      2: this.emit.attribute('level', function(r) {
        if (r[0] === '-') {
          return 1;
        } else {
          return 2;
        }
      })
    });
    this.addBlockRule('indented_code', ['->', /(.*)/, '$'], {
      1: this.emit.text('src')
    });
    this.addBlockRule('fenced_code', ['^', '```', '$', /([^]*)/, '^', '```', '$'], {
      3: this.emit.text('src')
    });
    this.addBlockRule('html', []);
    this.addBlockRule('link_ref', []);
    this.addBlockRule('paragraph', []);
    this.addBlockRule('blank_line', []);
    this.addBlockRule('list_item', []);
    this.addInlineRule('backslash_escape', []);
    this.addInlineRule('entity', []);
    this.addInlineRule('code_span', []);
  }

  return Core;

})(LanguagePack);



},{"../core/language-pack":5}],9:[function(require,module,exports){
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



},{"../core/language-pack":5}],10:[function(require,module,exports){
var Compiler, Core, GFM, core, gfm;

Compiler = require('./compiler');

Core = require('./lang/core');

GFM = require('./lang/gfm');

core = new Core();

gfm = new GFM();

Compiler.Default = new Compiler([core, gfm]);

module.exports = Compiler;



},{"./compiler":2,"./lang/core":8,"./lang/gfm":9}]},{},[10])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXG5vZGVfbW9kdWxlc1xcZ3VscC1icm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29tcGlsZXJcXGdlbmVyYXRvci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxpbmRleC5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxwYXJzZXIuY29mZmVlIiwiRjpcXGRldlxcanNcXG1hcmtyaWdodFxcY29mZmVlXFxjb3JlXFxlbWl0dGVyLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29yZVxcbGFuZ3VhZ2UtcGFjay5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvcmVcXHJ1bGUtYnVpbGRlci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvcmVcXHRva2VuLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcbGFuZ1xcY29yZS5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGxhbmdcXGdmbS5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXG1hcmtyaWdodC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFNBQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLEVBQUEsbUJBQUEsR0FBQSxDQUFiOzttQkFBQTs7SUFGRixDQUFBOzs7OztBQ0FBLElBQUEsMkJBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxTQUNBLEdBQVksT0FB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ZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgR2VuZXJhdG9yXG4gIGNvbnN0cnVjdG9yOiAtPlxuIiwiUGFyc2VyID0gcmVxdWlyZSAnLi9wYXJzZXInXG5HZW5lcmF0b3IgPSByZXF1aXJlICcuL2dlbmVyYXRvcidcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29tcGlsZXJcbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgY29tcGlsZTogKG1kKSAtPlxuICAgIHJldHVybiBtZFxuIiwiIyBUaGUgcGFyc2VyIHByb2Nlc3NlcyBpbnB1dCBNYXJrZG93biBzb3VyY2UgYW5kIGdlbmVyYXRlcyBBU1RcbiMgKGFiYXN0cmFjdCBzeW50YXggdHJlZSkgZm9yIHRoZSBnZW5lcmF0b3IgdG8gY29uc3VtZS5cbiNcbiMgIyMgVGVybWlub2xvZ3lcbiNcbiMgKiAqKkRvY3VtZW50cyoqIGFyZSB0b3AgbGV2ZWwgcmVwcmVzZW50YXRpb25zIG9mIHBhcnNlZCBNYXJrZG93biBmaWxlcy5cbiMgKiAqKlNvbGlkIGJsb2NrcyoqIGFyZSBjb250aW51b3VzIGRvY3VtZW50IHBhcnRzIGNvbnNpc3Qgb2Ygb25seSBsZWFmIGJsb2Nrcy5cbiMgKiAqKkZsdWlkIGJsb2NrcyoqIGFyZSBjb250aW51b3VzIGRvY3VtZW50IHBhcnRzIHRoYXQgY29udGFpbnMgY29udGVudHMgb2ZcbiMgICBjb250YWluZXIgYmxvY2tzIHdpdGggY2xvc2luZyBlbGVtZW50cyB5ZXQgdG8gYmUgZGV0ZXJtaW5lZC5cbiNcbiMgU2VlIHtMYW5ndWFnZVBhY2t9IGZvciBsYW5ndWFnZSBzcGVjIHJlbGF0ZWQgdGVybWlub2xvZ3kuXG4jXG4jICMjIFBhcnNpbmcgU3RyYXRlZ3lcbiNcbiMgVGhlIHBhcnNlciBhcHBsaWVzIHJ1bGVzIGluIGEgZGV0ZXJtaW5lZCBvcmRlciAoYS5rLmEuIHByZWNlZGVuY2UpIHRvIGF2b2lkXG4jIGFueSBhbWJpZ3VpdHkuIFRoZSBlbGVtZW50cyB0YWtlIHRoZWlyIHByZWNlZGVuY2UgaW4gZm9sbG93aW5nIG9yZGVyOlxuI1xuIyAxLiBDb250YWluZXIgYmxvY2tzXG4jIDIuIExlYWYgYmxvY2tzXG4jIDMuIElubGluZSBlbGVtZW50c1xuI1xuIyBUaGUgcGFyc2VyIHByb2Nlc3NlcyBhIGRvY3VtZW50IGluIDIgcGFzc2VzOlxuI1xuIyAxLiBEZXRlcm1pbmUgYmxvY2sgc3RydWN0dXJlcyBhbmQgYXNzaWduIHVuLXBhcnNlZCBzb3VyY2UgdG8gZWFjaCBibG9jayB0b2tlbnNcbiMgMi4gUGFyc2UgaW5saW5lIHRva2VucyBvZiBlYWNoIGJsb2Nrc1xuI1xuIyAjIyMgQmxvY2sgUGFyc2luZ1xuI1xuIyBCbG9jayBwYXJzaW5nIGlzIGltcGxlbWVudGVkIGluIHtQYXJzZXIjX3BhcnNlQmxvY2tzfS5cbiMgVW5saWtlIG90aGVyIE1hcmtkb3duIHBhcnNlciBpbXBsZW1lbnRhdGlvbnMsIE1hcmtSaWdodCBwYXJzZXIgZG9lc1xuIyBub3QgcmVxdWlyZSBtYXRjaGVkIHJ1bGVzIHRvIGJlIGFuY2hvcmVkIGF0IHRoZSBiZWdpbmluZyBvZiB0aGUgc3RyZWFtLlxuIyBJbnN0ZWFkLCB7UGFyc2VyI19fX3BhcnNlT25lQmxvY2t9IGFwcGxpZXMgcnVsZXMgZnJvbSBoaWdoZXN0IHByZWNlZGVuY2UgdG9cbiMgbG93ZXN0IGFuZCByZXR1cm5zIHRoZSBmaXJzdCBtYXRjaCBubyBtYXR0ZXIgd2hlcmUgdGhlIG1hdGNoJ3MgbG9jYXRpb24gaXMuXG4jXG4jIEl0IGlzIGV4cGVjZWQgdGhhdCB0aGUgZmlyc3QgbWF0Y2ggdXN1YWxseSBvY2N1cnMgaW4gdGhlIG1pZGRsZSB0aHVzIHNwbGl0aW5nXG4jIHRoZSBzdHJlYW0gaW50byB0aHJlZSBwYXJ0czpcbiNcbiMgYGBgXG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIERvY3VtZW50IEJlZ2luXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgIFBhcnNlZCAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIE9mZnNldFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIFJlc2lkdWFsIEJlZm9yZSAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIEZpcnN0IE1hdGNoICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIFJlc2lkdWFsIEFmdGVyICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKyBEb2N1bWVudCBFbmRcbiMgYGBgXG4jXG4jIElmIHRoZSBgRmlyc3QgTWF0Y2hgIGlzIGEgbGVhZiBibG9jaywgdGhlIHBhcnNlciBjYW4gc2FmZWx5IGFzc3VtZSB0aGF0IHRoZVxuIyBlbnRpcmUgc3RyZWFtIGlzIG9uZSBzb2xpZCBibG9jay4gSGVuY2UgYm90aCByZXNpZHVhbCBibG9ja3MgYXJlIHNvbGlkIHRvby5cbiMgVGh1cyB0aGUgcGFyc2luZyBjYW4gYmUgYWNoaXZlZCBieSByZWN1c2l2ZWx5IHBhcnNlIGFuZCBzcGxpdCB0aGUgc3RyZWFtIGludG9cbiMgc21hbGxlciBhbmQgc21hbGxlciBibG9ja3MgdW50aWwgdGhlIGVudGlyZSBzdHJlYW0gaXMgcGFyc2VkLlxuIyBUaGlzIGlzIGRvbmUgYnkge1BhcnNlciNfX3BhcnNlU29saWRCbG9ja3N9LlxuI1xuIyBJZiB0aGUgYEZpcnN0IE1hdGNoYCBpcyBhIGNvbnRhaW5lciBibG9jayBzdGFydCB0b2tlbiwgdGhlIGBSZXNpZHVhbCBCZWZvcmVgXG4jIGlzIGtub3duIHRvIGJlIGEgc29saWQgYmxvY2sgYW5kIGNhbiBiZSBwYXJzZWQgd2l0aFxuIyB7UGFyc2VyI19fcGFyc2VTb2xpZEJsb2Nrc30uXG4jIFRoZSBgUmVzaWR1YWwgQWZ0ZXJgIHdvdWxkIGJlIGEgZmx1aWQgYmxvY2s6XG4jXG4jIGBgYFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgIEZpcnN0IE1hdGNoICAgICAgICAgfCA8LS0tKyBDb250YWluZXIgYmxvY2sgc3RhcnQgdG9rZW5cbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgKGUuZy4gJz4gJyBmb3IgYSBibG9ja3F1b3RlKVxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyBYICAgICAgICAgICAgICAgICAgICAgICAgICAgWFxuIyBYICAgICAgIENvbnRlbnQgb2YgICAgICAgICAgWCA8LS0tKyBSZXNpZHVhbCBBZnRlciAoRmx1aWQgQmxvY2spXG4jIFggICAgICAgQ29udGFpbmVyIEJsb2NrICAgICBYXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jIFgtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1YIC0tLS0+IE5ldyBvZmZzZXQgZm9yIG5leHQgaXRlcmF0aW9uXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jIFggICAgICAgVW4tcGFyc2VkICAgICAgICAgICBYXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIERvY3VtZW50IEVuZFxuIyBgYGBcbiNcbiMgQSBmbHVpZCBibG9jayBpcyBwYXJzZWQgYnkge1BhcnNlciNfX3BhcnNlRmx1aWRCbG9ja3N9LiBJdCBwYXJzZXMgdGhlIGZsdWlkXG4jIGJsb2NrIGxpbmVhcmx5IGFuZCBsb29rcyBmb3IgbGluZXMgc3RhcnQgd2l0aCBjb250ZW50IGJsb2NrIGRlbGltaXRlciAoZS5nLlxuIyAnPiAnIGZvciBibG9ja3F1b3RlcyBvciBjb3JyZWN0IGxldmVsIG9mIGluZGVudGF0aW9uIGZvciBsaXN0IGl0ZW1zKS5cbiMgRGVsaW1pdGVycyBhcmUgc3RyaXBwZWQgYmVmb3JlIHRoZSBjb250ZW50cyBhcmUgYWdncmVnYXRlZCBpbnRvIG9uZSBuZXcgYmxvY2tcbiMgZm9yIGxhdGVyIHBhcnNpbmcuIEEgbmV3IGxpbmUgd2l0aG91dCBhIGNvbnRhaW5lciBibG9jayBkZWxpbWl0ZXIgY2FuIGVpdGhlclxuIyBiZSB0aGUgZW5kIG9mIGN1cnJlbnQgY29udGFpbmVyIGJsb2NrIG9yIHNob3VsZCBiZSBhZGRlZCB0byB0aGUgY29udGFpbmVyXG4jIGFjY3JvZGluZyB0byAnbGF6aW5lc3MnIHJ1bGUuIFRoZSBwYXJzaW5nIGlzIG5vdCBjb21wbGV0ZSB1bnRpbCBlaXRoZXIgdGhlIGVuZFxuIyBvZiBjb250YWluZXIgYmxvY2sgb3IgdGhlIGVuZCBvZiB0aGUgZG9jdW1lbnQgaXMgZW5jb3VudGVyZWQuXG4jXG4jIGBgYFxuIyArLS0tKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIHwgICB8ICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAqIHwgQ29udGVudCAgICAgICAgICAgICAgfFxuIyB8ICAgfCAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0rLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgPC0tKyBQb3NzaWJsZSBlbmQgb2YgY29udGVudCBibG9ja1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgIE5leHQgZWxlbWVudCB3aXRob3V0IHxcbiMgfCAgICAgZGVsaW1pdGVyICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICBVbi1wYXJzZWQgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuI1xuIyAqIENvbnRhaW5lciBibG9jayBkZWxpbWl0ZXJcbiMgYGBgXG4jXG4jIEFmdGVyIGVhY2ggaXRlcmF0aW9uLCB0aGUgYG9mZnNldGAgaXMgYWR2YW5jZWQgYW5kIHRoZSB3aG9sZSBwcm9jZXNzIHN0YXJ0c1xuIyBhZ2FpbiB1bnRpbCB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudC5cbiNcbiMgIyMjIElubGluZSBFbGVtZW50IFBhcnNpbmdcbiNcbiMgSW5saW5lIGVsZW1lbnQgcGFyc2luZyAoe1BhcnNlciNfcGFyc2VJbmxpbmV9KSBpcyB0cml2YWwuXG4jIFRoZSBzdGF0ZWd5IGlzIGV4YWN0bHkgdGhlIHNhbWUgYXMgc29saWQgYmxvY2sgcGFyc2luZy5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBhcnNlclxuICAjIENyZWF0ZSBhIHtQYXJzZXJ9IGluc3RhbmNlXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICMgUGFyc2UgTWFya2Rvd24gc291cmNlIGludG8gQVNUXG4gICMgQHBhcmFtIHtzdHJpbmd9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtBcnJheX0gQVNUXG4gIHBhcnNlOiAoc3JjKSAtPlxuICAgIGFzdCA9IEBfcGFyc2VCbG9ja3Moc3JjKVxuICAgIGFzdCA9IEBfcGFyc2VJbmxpbmUoYXN0KVxuXG4gICAgcmV0dXJuIGFzdFxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSBibG9jayBzdHJ1Y3R1cmVzXG4gICMgQHBhcmFtIHtzdHJpbmd9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtBcnJheX0gQVNUXG4gIF9wYXJzZUJsb2NrczogKHNyYykgLT5cbiAgICBvZmZzZXQgPSAwXG4gICAgbiA9IHNyYy5sZW5ndGhcbiAgICBwZW5kaW5nID0gW11cbiAgICBhc3QgPSBbXVxuXG4gICAgd2hpbGUgb2Zmc2V0IDwgbiBvciBwZW5kaW5nLmxlbmd0aCA+IDBcbiAgICAgIHN0YXJ0SW5kZXggPSBvZmZzZXRcbiAgICAgIGNiX3N0YXJ0X3Rva2VuID0gQF9fdHJ5UGFyc2VDb250YWluZXJCbG9ja1N0YXJ0VG9rZW4ob2Zmc2V0LCBzcmMpXG4gICAgICBsYXN0SW5kZXggPSBjYl9zdGFydF90b2tlbi5zdGFydEluZGV4XG4gICAgICBpZiBjYl9zdGFydF90b2tlbj9cbiAgICAgICAgYXN0X3NvbGlkX3BhcnQgPSBAX19wYXJzZVNvbGlkQmxvY2tzKHN0YXJ0SW5kZXgsIGxhc3RJbmRleCwgc3JjKVxuICAgICAgICB7b2Zmc2V0LCBhc3RfZmx1aWRfcGFydH0gPSBAX19wYXJzZUZsdWlkQmxvY2tzKGNiX3N0YXJ0X3Rva2VuLCBzcmMpXG4gICAgICBlbHNlXG4gICAgICAgIHtvZmZzZXQsIGFzdF9zb2xpZF9wYXJ0fSA9IEBfX3BhcnNlU29saWRCbG9ja3Moc3RhcnRJbmRleCwgbiwgc3JjKVxuXG4gICAgICBhc3QucHVzaCBhc3Rfc29saWRfcGFydFxuICAgICAgYXN0LnB1c2ggYXN0X2ZsdWlkX3BhcnRcblxuICAgIHJldHVybiBhc3RcblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgdGhlIHNvdXJjZSBzdGFydGluZyBmcm9tIGdpdmVuIG9mZnNldCBhbmQgdHJpZXMgdG8gZmluZCB0aGUgZmlyc3RcbiAgIyBjb250YWluZXIgYmxvY2sgc3RhcnQgdG9rZW5cbiAgIyBAcGFyYW0ge2ludH0gb2Zmc2V0IE9mZnNldCB2YWx1ZVxuICAjIEBwYXJhbSB7c3RyaW5nfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiB7VG9rZW59IE1hdGNoZWQgdG9rZW4gKG51bGxhYmxlKVxuICBfdHJ5UGFyc2VDb250YWluZXJCbG9ja1N0YXJ0VG9rZW46IChvZmZzZXQsIHNyYykgLT5cblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgdGhlIHNwZWNpZmllZCBkb2N1bWVudCByZWdpb24gYXMgYSBzb2xpZCBibG9ja1xuICAjIEBwYXJhbSB7aW50fSBiZWdpbiBTdGFydCBpbmRleCBvZiB0aGUgcmVnaW9uXG4gICMgQHBhcmFtIHtpbnR9IGVuZCBMYXN0IGluZGV4IG9mIHRoZSByZWdpb25cbiAgIyBAcGFyYW0ge3NyY30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4gW0FycmF5PFRva2VuPl0gQVNUIG9mIHNwZWNpZmllZCByZWdpb25cbiAgX19wYXJzZVNvbGlkQmxvY2tzOiAoYmVnaW4sIGVuZCwgc3JjKSAtPlxuICAgIGJsb2NrID0gQF9fX3BhcnNlT25lQmxvY2soYmVnaW4sIGVuZCwgc3JjKVxuICAgIGFzdF9wYXJ0X2JlZm9yZSA9IEBfX3BhcnNlU29saWRCbG9ja3MoYmVnaW4sIGJsb2NrLnN0YXJ0SW5kZXggLSAxLCBzcmMpXG4gICAgYXN0X3BhcnRfYWZ0ZXIgID0gQF9fcGFyc2VTb2xpZEJsb2NrcyhibG9jay5sYXN0SW5kZXgsIGVuZCwgc3JjKVxuXG4gICAgcmV0dXJuIFtdLmNvbmNhdChhc3RfcGFydF9iZWZvcmUsIGJsb2NrLCBhc3RfcGFydF9hZnRlcilcblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgdGhlIHNwZWNpZmllZCBkb2N1bWVudCByZWdpb24gYXMgYSBmbHVpZCBibG9ja1xuICAjIEBwYXJhbSB7VG9rZW59IHN0YXJ0X3Rva2VuIFRoZSBzdGFydCB0b2tlbiBvZiBhIGNvbnRhaW5lciBibG9ja1xuICAjIEBwYXJhbSB7c3RyaW5nfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiBbQXJyYXk8VG9rZW4+XSBBU1Qgb2Ygc3BlY2lmaWVkIHJlZ2lvblxuICBfX3BhcnNlRmx1aWRCbG9ja3M6IChzdGFydF90b2tlbiwgc3JjKSAtPlxuXG4gICMgQHByaXZhdGVcbiAgIyBNYXRjaCBibG9jayBydWxlcyBmcm9tIGhpZ2hlc3QgcHJlY2VkZW5jZSB0byBsb3dlc3QgYWdhaW5zdCB0aGUgc3BlY2lmaWVkXG4gICMgZG9jdW1lbnQgcmVnaW9uIGFuZCByZXR1cm5zIGltbWVkaWF0ZWx5IG9uIHRoZSBmaXJzdCBtYXRjaC5cbiAgIyBAcGFyYW0ge2ludH0gYmVnaW4gU3RhcnQgaW5kZXggb2YgdGhlIHJlZ2lvblxuICAjIEBwYXJhbSB7aW50fSBlbmQgTGFzdCBpbmRleCBvZiB0aGUgcmVnaW9uXG4gICMgQHBhcmFtIHtzcmN9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtUb2tlbn0gVGhlIGZpcnN0IG1hdGNoXG4gIF9fX3BhcnNlT25lQmxvY2s6IC0+IChiZWdpbiwgZW5kLCBzcmMpIC0+XG5cblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgaW5saW5lIGVsZW1lbnRzXG4gICMgQHBhcmFtIHtBcnJheX0gYXN0IEFTVCB3aXRoIHVuLXBhcnNlZCBibG9jayBub2RlcyBvbmx5XG4gICMgQHJldHVybiB7QXJyYXl9IEZ1bGx5IHBhcnNlZCBBU1RcbiAgX3BhcnNlSW5saW5lOiAoYXN0KSAtPlxuIiwie0RlZn0gPSByZXF1aXJlICcuL3Rva2VuJ1xuXG4jIyNcblVzZWQgd2hlbiBkZWZpbmluZyBsYW5ndWFnZSBydWxlcyB3aXRoIHtMYW5ndWFnZVBhY2t9IEFQSXMuXG5cbkFuIGVtaXR0ZXIgbWV0aG9kIGRvZXMgbm90IGFjdHVhbGx5IGVtaXQgYW55IHRva2VucyB3aGVuIGNhbGxlZCwgYnV0IGNyZWF0aW5nXG5hIGRlZmluaXRpb24gb3IgY29udHJhY3Qgb2YgdG9rZW5zIHRoYXQgd2lsbCBiZSBlbWl0dGVkIG9uY2UgdGhlIGNvcnJlc3BvbmRpbmdcbnJ1bGUgaXMgbWF0Y2hlZC5cbiMjI1xubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRW1pdHRlclxuICBjb25zdHJ1Y3RvcjogKEBtb2RpZmllcnMgPSB7fSkgLT5cbiAgICBAb3B0aW9uYWwgPSBuZXcgT3B0aW9uYWxFbWl0dGVyKClcblxuICAjIEByZXR1cm4ge1Rva2VuLkRlZn0gQSB0b2tlbiBkZWZpbml0aW9uXG4gIGF0dHJpYnV0ZTogKGlkLCB0cmFuc2Zvcm0pIC0+XG4gICAgbmV3IERlZihEZWYuQXR0cmlidXRlLCBpZCwgdHJhbnNmb3JtLCBAbW9kaWZpZXJzKVxuXG4gICMgQHJldHVybiB7VG9rZW4uRGVmfSBBIHRva2VuIGRlZmluaXRpb25cbiAgY29udGVudDogKGlkLCB0cmFuc2Zvcm0pIC0+XG4gICAgbmV3IERlZihEZWYuQ29udGVudCwgaWQsIHRyYW5zZm9ybSwgQG1vZGlmaWVycylcblxuICAjIEByZXR1cm4ge1Rva2VuLkRlZn0gQSB0b2tlbiBkZWZpbml0aW9uXG4gIHRleHQ6IChpZCwgdHJhbnNmb3JtKSAtPlxuICAgIG5ldyBEZWYoRGVmLlRleHQsIGlkLCB0cmFuc2Zvcm0sIEBtb2RpZmllcnMpXG5cbiAgIyBAcmV0dXJuIHtUb2tlbi5EZWZ9IEEgdG9rZW4gZGVmaW5pdGlvblxuICBkZWxpbWl0ZXI6IChpZCwgdHJhbnNmb3JtKSAtPlxuICAgIG5ldyBEZWYoRGVmLkRlbGltaXRlciwgaWQsIHRyYW5zZm9ybSwgQG1vZGlmaWVycylcblxuICBub3RoaW5nOiAtPlxuICAgIG5ldyBEZWYoRGVmLk5vdGhpbmcsIG51bGwsIG51bGwsIEBtb2RpZmllcnMpXG5cbmNsYXNzIE9wdGlvbmFsRW1pdHRlciBleHRlbmRzIEVtaXR0ZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQG1vZGlmaWVycyA9IG9wdGlvbmFsOiB0cnVlXG4iLCJSdWxlQnVpbGRlciA9IHJlcXVpcmUgJy4vcnVsZS1idWlsZGVyJ1xuRW1pdHRlciA9IHJlcXVpcmUgJy4vZW1pdHRlcidcblxuIyMjXG5CYXNlIGNsYXNzIGZvciBsYW5ndWFnZSBwYWNrc1xuIyMjXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMYW5ndWFnZVBhY2tcbiAgIyBAcHJvcGVydHkgW0VtaXR0ZXJdIEFuIHtFbWl0dGVyfSBpbnN0YW5jZVxuICBlbWl0OiBuZXcgRW1pdHRlcigpXG5cbiAgY29uc3RydWN0b3I6IChAbnMpIC0+XG4gICAgQF9idWlsZGVyID0gbmV3IFJ1bGVCdWlsZGVyKClcbiAgICBAYmxvY2tSdWxlcyA9IFtdXG4gICAgQGlubGluZVJ1bGVzID0gW11cblxuICBkZWNsYXJlQWxpYXM6IChhbGlhcywgcmVnZXgpIC0+XG4gICAgQF9idWlsZGVyLmRlY2xhcmVBbGlhcyhhbGlhcywgcmVnZXgpXG5cbiAgZGVjbGFyZURlbGltaXRlclBhaXI6IChvcGVuLCBjbG9zZSkgLT5cbiAgICAjIFRPRE86IHVzZWQgZm9yIGhvdCB1cGRhdGUgbW9kZSwgaW1wbGVtZW50IGxhdGVyXG5cbiAgYWRkQmxvY2tSdWxlOiAobmFtZSwgcnVsZSwgZW1pdHRlcikgLT5cbiAgICBidWlsdF9ydWxlID0gQF9idWlsZGVyLm1ha2UocnVsZSwgZW1pdHRlcilcbiAgICBidWlsdF9ydWxlLm5hbWUgPSBuYW1lXG4gICAgQGJsb2NrUnVsZXMucHVzaCBidWlsdF9ydWxlXG5cbiAgYWRkSW5saW5lUnVsZTogKG5hbWUsIHJ1bGUsIGVtaXR0ZXIpIC0+XG4gICAgYnVpbHRfcnVsZSA9IEBfYnVpbGRlci5tYWtlKHJ1bGUsIGVtaXR0ZXIpXG4gICAgYnVpbHRfcnVsZS5uYW1lID0gbmFtZVxuICAgIEBpbmxpbmVSdWxlcy5wdXNoIGJ1aWx0X3J1bGVcbiIsIntEZWZ9ID0gcmVxdWlyZSAnLi90b2tlbidcbiMge1J1bGVCdWlsZGVyfSBpcyB1c2VkIGJ5IHtMYW5ndWFnZVBhY2t9IGludGVybmFsbHkgdG8gY29tcGlsZSBydWxlcyBmb3IgcGFyc2VyXG4jIHRvIGV4ZWN1dGUuXG4jXG4jICMjIFRlcm1pbm9sb2d5XG4jXG4jICogKipSdWxlIGRlY2xlcmF0aW9uKipzIGFyZSBtYWRlIHdpdGggQVBJIGNhbGxzIGluIHtMYW5ndWFnZVBhY2t9IHRvIHNwZWNpZnlcbiMgICB0aGUgc3lhbnRheCBvZiBhIGxhbmd1YWdlIGZlYXR1cmUgd2l0aCByZWdleCBhcyB3ZWxsIGFzIGhvdyByZWxldmVudCBkYXRhIGlzXG4jICAgY2FwdHVyZWQgYW5kIGVtaXR0ZWQgaW50byB0b2tlbnMuXG4jICogKipSdWxlKipzIGFyZSBjb21waWxlZCBkZWNsYXJhdGlvbnMgZWFjaCBvZiB3aGljaCBjb25zaXN0cyBvZiBhIHJlZ2V4IGFuZCBhXG4jICAgaGFuZGxlciBmdW5jdGlvbi4gVGhlIGxhdHRlciBlbWl0cyBhIHRva2VuIG9yIG1hbmlwdWxhdGVzIHRoZSBwYXJlbnQgdG9rZW4uXG4jXG4jIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0byBkZWNhbHJlIGEgcnVsZSwgc2VlIHtMYW5ndWFnZVBhY2t9LlxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUnVsZUJ1aWxkZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9hbGlhc01hcCA9IHt9XG4gICAgQF9zdWJSdWxlcyA9IHt9XG5cbiAgZGVjbGFyZUFsaWFzOiAoYWxpYXMsIHJlZ2V4KSAtPlxuICAgICMgVE9ETzogY2hlY2sgZm9yIGR1cGxpY2F0aW9uXG4gICAgQF9hbGlhc01hcFthbGlhc10gPSByZWdleFxuXG4gIGRlY2xhcmVTdWJSdWxlOiAobmFtZSwgcnVsZSwgY2FwdHVyZV9tYXApIC0+XG4gICAgIyBUT0RPOiBjaGVjayBmb3IgbmFtZSBkdXBsaWNhdGlvblxuICAgIGNvbXBpbGVkID0gQF9jb21waWxlUnVsZShydWxlLCBjYXB0dXJlX21hcClcbiAgICBAX3N1YlJ1bGVzW25hbWVdID0gY29tcGlsZWRcblxuICAjIEBwcml2YXRlXG4gICNcbiAgIyBHZXQgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHJlZ2V4IHBhcnQgZm9yIGNvbmNhdGVuYXRpaW9uLlxuICAjXG4gICMgQG92ZXJsb2FkIF9nZXRSZWdleFBhcnQoYWxpYXNfb3JfbGl0ZXJhbClcbiAgIyAgIFRoZSBhcmd1bWVudCBpcyBzZWFyY2hlZCBpbiB0aGUgYWxpYXMgbWFwIGZpcnN0LCB0aGVuIGluIHRoZSBzdWItcnVsZSBtYXAuXG4gICMgICBJZiBubyBtYXRjaCBpcyBmb3VuZCwgaXRcbiAgIyAgIGlzIHRoZW4gY29uc2lkZXJlZCBhcyBhIGxpdGVyYWwgcmVnZXggc291cmNlIHN0cmluZy5cbiAgIyAgIFRoZSBsaXRlcmFsIHN0cmluZyB3aWxsIGJlIGVzY2FwZWQuIEZvciBleGFtcGxlLCBgJ15bKCldJ2AgaXMgcHJvY2Vzc2VkIHRvXG4gICMgICBgL1xcXlxcW1xcKFxcKVxcXS9gLlxuICAjICAgQHBhcmFtIFtzdHJpbmddIGFsaWFzX29yX2xpdGVyYWxcbiAgIyBAb3ZlcmxvYWQgX2dldFJlZ2V4UGFydChhbHRlcm5hdGl2ZXMpXG4gICMgICBAcGFyYW0gW0FycmF5PHN0cmluZz5dIGFsdGVybmF0aXZlcyBBbiBhcnJheSBvZiBzdWItcnVsZSBuYW1lc1xuICAjIEBvdmVybG9hZCBfZ2V0UmVnZXhQYXJ0KHJlZ2V4KVxuICAjICAgQHBhcmFtIFtSZWdFeHBdIHJlZ2V4XG4gICMgQHJldHVybiBbc3RyaW5nXSBSZWdleCBwYXJ0J3Mgc3RyaW5nIHNvdXJjZVxuICBfZ2V0UmVnZXhQYXJ0OiAocikgLT5cbiAgICBlc2NhcGVfciA9IC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2dcbiAgICB0ID0gdHlwZW9mIHJcbiAgICBpZiB0ID09ICdzdHJpbmcnXG4gICAgICBpZiByIG9mIEBfYWxpYXNNYXBcbiAgICAgICAgIyBBbGlhc1xuICAgICAgICByZXR1cm4ge3R5cGU6ICdhbGlhcycsIHJ1bGU6IEBfYWxpYXNNYXBbcl19XG4gICAgICBpZiByIG9mIEBfc3ViUnVsZXNcbiAgICAgICAgIyBTdWItcnVsZVxuICAgICAgICByZXR1cm4ge3R5cGU6ICdzdWInLCBydWxlOiBAX3N1YlJ1bGVzW3JdfVxuICAgICAgIyBMaXRlcmFsXG4gICAgICByZXR1cm4ge3R5cGU6ICdsaXRlcmFsJywgcnVsZTogci5yZXBsYWNlKGVzY2FwZV9yLCAnXFxcXCQmJyl9XG4gICAgZWxzZSBpZiB0ID09ICdvYmplY3QnIGFuZCByIGluc3RhbmNlb2YgUmVnRXhwXG4gICAgICByZXR1cm4ge3R5cGU6ICdyZWdleCcsIHJ1bGU6IHIuc291cmNlfVxuICAgIGVsc2UgaWYgdCA9PSAnYXJyYXknXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWRcIilcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiI3tyfSBpcyBub3QgYSB2YWxpZCBhbGlhcyBuYW1lLCBzdHJpbmcgb3IgUmVnRXhwXCIpXG5cbiAgX21ha2VNYXRjaEhhbmRsZXI6ICh0b2tlbl9kZWZzKSAtPlxuICAgIHJldHVybiAobm9kZSwgbWF0Y2hlcykgLT5cbiAgICAgIGZvciBkIGluIHRva2VuX2RlZnNcbiAgICAgICAgcGF5bG9hZCA9IG1hdGNoID0gbWF0Y2hlc1tkLmdyb3VwX2luZGV4XVxuICAgICAgICBpZiBkLnRyYW5zZm9ybT9cbiAgICAgICAgICBwYXlsb2FkID0gZC50cmFuc2Zvcm0ocGF5bG9hZClcblxuICAgICAgICBub2RlW2QuaWRdID0gcGF5bG9hZFxuICAgICAgICAjIFRPRE86IHVzZSBub2RlLmF0dGFjaFh4eCBhY2Nyb2RpbmcgdG8gZC50eXBlIGZpZWxkXG5cbiAgIyBAcHJpdmF0ZVxuICAjIENvbXBpbGUgcnVsZXNcbiAgIyBAcGFyYW0ge0FycmF5PFJlZ0V4cHxzdHJpbmc+fSBydWxlXG4gICMgQHBhcmFtIHtPYmplY3R9IGNhcHR1cmVfbWFwXG4gICMgQHJldHVybiB7T2JqZWN0fVxuICBfY29tcGlsZVJ1bGU6IChydWxlLCBjYXB0dXJlX21hcCkgLT5cbiAgICByZWdleF9zcmMgPSAnJ1xuICAgIGdyb3VwX2luZGV4ID0gMFxuICAgIHRva2VuX2RlZnMgPSBbXVxuICAgIGluX29wdGlvbmFsX2dyb3VwID0gZmFsc2VcbiAgICBjdXJyZW50X29wdGlvbmFsX2dyb3VwID0gXCJcIlxuXG4gICAgZm9yIHIsIGkgaW4gcnVsZVxuICAgICAgdG9rZW5fZGVmID0gY2FwdHVyZV9tYXA/W2kgKyAxXVxuXG4gICAgICBjb3VsZF9jYXB0dXJlID0gdG9rZW5fZGVmP1xuXG4gICAgICBwYXJ0ID0gQF9nZXRSZWdleFBhcnQocilcbiAgICAgIHBhcnRfc3JjID0gcGFydC5ydWxlXG5cbiAgICAgIGlmIHBhcnQudHlwZSA9PSAnc3ViJ1xuICAgICAgICBpZiBjb3VsZF9jYXB0dXJlXG4gICAgICAgICAgZXJyID0gbmV3IFR5cGVFcnJvcihcIlN1Yi1ydWxlcyBjYW5ub3QgYmUgcmUtY2FwdHVyZWRcIilcbiAgICAgICAgICBlcnIucnVsZU5hbWUgPSByXG4gICAgICAgICAgZXJyLnJ1bGVJbmRleCA9IGlcbiAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgcmVnZXhfc3JjICs9IHBhcnQucnVsZS5yZWdleC5zb3VyY2VcbiAgICAgICAgIyBGbGF0dGVuIHBhcnQudG9rZW5fZGVmc1xuICAgICAgICBiYXNlX2dyb3VwX2luZGV4ID0gZ3JvdXBfaW5kZXhcbiAgICAgICAgZm9yIHN1Yl9kZWYgaW4gcGFydC5ydWxlLnRva2VuX2RlZnNcbiAgICAgICAgICBjb3BpZWQgPSBEZWYuY2xvbmUoc3ViX2RlZilcbiAgICAgICAgICBjdXJyZW50X2dyb3VwX2luZGV4ID0gYmFzZV9ncm91cF9pbmRleCArIHN1Yl9kZWYuZ3JvdXBfaW5kZXhcbiAgICAgICAgICBjb3BpZWQuZ3JvdXBfaW5kZXggPSBjdXJyZW50X2dyb3VwX2luZGV4XG4gICAgICAgICAgZ3JvdXBfaW5kZXggPSBjdXJyZW50X2dyb3VwX2luZGV4XG4gICAgICAgICAgdG9rZW5fZGVmcy5wdXNoIGNvcGllZFxuICAgICAgZWxzZVxuICAgICAgICBpZiBjb3VsZF9jYXB0dXJlXG4gICAgICAgICAgbGF6eV9sZWF2aW5nID0gaW5fb3B0aW9uYWxfZ3JvdXAgYW5kIG5vdCB0b2tlbl9kZWYub3B0aW9uYWw/XG4gICAgICAgICAgb3B0aW9uYWxfY2hhbmdpbmcgPSAodG9rZW5fZGVmLm9wdGlvbmFsID8gZmFsc2UpICE9IGluX29wdGlvbmFsX2dyb3VwXG4gICAgICAgICAgaWYgbGF6eV9sZWF2aW5nIG9yIG9wdGlvbmFsX2NoYW5naW5nXG4gICAgICAgICAgICBpZiBub3QgaW5fb3B0aW9uYWxfZ3JvdXBcbiAgICAgICAgICAgICAgIyBmYWxzZSAtPiB0cnVlLCBlbnRlcmluZyBvcHRpb25hbCBncm91cFxuICAgICAgICAgICAgICAjIGdyb3VwX2luZGV4KytcbiAgICAgICAgICAgICAgaW5fb3B0aW9uYWxfZ3JvdXAgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICMgdHJ1ZSAtPiBmYWxzZSwgbGVhdmluZyBvcHRpb25hbCBncm91cFxuICAgICAgICAgICAgICBpbl9vcHRpb25hbF9ncm91cCA9IGZhbHNlXG4gICAgICAgICAgICAgICMgVE9ETzogbWFrZSBjYXB0dXJlL25vdC1jYXB0dXJlIGNvbmZpZ3VhYmxlXG4gICAgICAgICAgICAgIHJlZ2V4X3NyYyArPSBcIig/OiN7Y3VycmVudF9vcHRpb25hbF9ncm91cH0pP1wiXG4gICAgICAgICAgICAgIGN1cnJlbnRfb3B0aW9uYWxfZ3JvdXAgPSBcIlwiXG4gICAgICAgICAgaWYgdG9rZW5fZGVmLnR5cGUgIT0gRGVmLk5vdGhpbmdcbiAgICAgICAgICAgIGdyb3VwX2luZGV4KytcbiAgICAgICAgICAgIHBhcnRfc3JjID0gXCIoI3twYXJ0LnJ1bGV9KVwiXG4gICAgICAgICAgICB0b2tlbl9kZWZzLnB1c2ggdG9rZW5fZGVmXG4gICAgICAgICAgICB0b2tlbl9kZWYuZ3JvdXBfaW5kZXggPSBncm91cF9pbmRleFxuICAgICAgICBlbHNlIGlmIGluX29wdGlvbmFsX2dyb3VwXG4gICAgICAgICAgIyB0cnVlIC0+IGZhbHNlLCBsZWF2aW5nIG9wdGlvbmFsIGdyb3VwXG4gICAgICAgICAgaW5fb3B0aW9uYWxfZ3JvdXAgPSBmYWxzZVxuICAgICAgICAgIHJlZ2V4X3NyYyArPSBcIig/OiN7Y3VycmVudF9vcHRpb25hbF9ncm91cH0pP1wiXG4gICAgICAgICAgY3VycmVudF9vcHRpb25hbF9ncm91cCA9IFwiXCJcbiAgICAgICAgIyBBY2N1bXVsYXRlIHNvdXJjZVxuICAgICAgICBpZiBpbl9vcHRpb25hbF9ncm91cFxuICAgICAgICAgIGN1cnJlbnRfb3B0aW9uYWxfZ3JvdXAgKz0gcGFydF9zcmNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlZ2V4X3NyYyArPSBwYXJ0X3NyY1xuXG4gICAgY29tcGlsZWQgPVxuICAgICAgcmVnZXg6IG5ldyBSZWdFeHAocmVnZXhfc3JjKVxuICAgICAgdG9rZW5fZGVmczogdG9rZW5fZGVmc1xuXG4gICAgcmV0dXJuIGNvbXBpbGVkXG5cbiAgIyBAcGFyYW0ge0FycmF5PFJlZ0V4cHxzdHJpbmc+fSBydWxlXG4gICMgQHBhcmFtIHtPYmplY3R9IGNhcHR1cmVfbWFwXG4gIG1ha2U6IChydWxlLCBjYXB0dXJlX21hcCkgLT5cbiAgICBjb21waWxlZCA9IEBfY29tcGlsZVJ1bGUocnVsZSwgY2FwdHVyZV9tYXApXG5cbiAgICByZXN1bHQgPVxuICAgICAgcmVnZXg6IGNvbXBpbGVkLnJlZ2V4XG4gICAgICBoYW5kbGVyOiBAX21ha2VNYXRjaEhhbmRsZXIoY29tcGlsZWQudG9rZW5fZGVmcylcbiAgICByZXR1cm4gcmVzdWx0XG4iLCIjIFRva2VucyBhcmUgYnVpbGRpbmcgYmxvY2tzIG9mIHBhcnNlZCBkb2N1bWVudHMuIEVhY2ggcnVsZSBpcyBldmFsdWF0ZWQgYW5kXG4jIGNhcHR1cmUgZ3JvdXBzIGFyZSB0cmFuc2Zvcm1lZCBpbnRvIHRva2Vucy4gRm9yIGluZm9ybWF0aW9uIG9uIGhvdyB0b2tlbnNcbiMgYXJlIGVtaXR0ZWQgZnJvbSBsYW5ndWFnZSBydWxlcywgc2VlIHtMYW5ndWFnZVBhY2t9LlxuI1xuIyBBIHRva2VuIGNvbnRhaW5zIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byByZXByZXNlbnQgYSBNYXJrZG93biBlbGVtZW50LFxuIyBpbmNsdWRpbmcgaXRzIGxvY2F0aW9uIGluIHNvdXJjZSBjb2RlLCBkYXRhIGZpZWxkcyBhbmQgZXRjLiBGb3Igc2ltcGxpY2l0eSxcbiMgTWFya1JpZ2h0IHVzZXMgdG9rZW5zIGFzIEFTVCBub2RlcyBkaXJlY3RseSBpbnN0ZWFkIG9mIGNyZWF0aW5nIG5ldyBvbmVzLlxuI1xuIyAjIyBUb2tlbiBIaWVyYXJjaGllc1xuI1xuIyBUb2tlbnMgYXJlIGNvbm5lY3RlZCB3aXRoIGVhY2ggb3RoZXIgaW4gYSBmZXcgZGlmZnJlbnQgd2F5cyB0byBmb3JtIGRpZmZyZW50XG4jIHJlcHJlc2VudGF0aW9ucyBvZiB0aGUgc2FtZSBkb2N1bWVudC5cbiNcbiMgIyMjIExpbmVhciBMaXN0XG4jXG4jIFRva2VucyBhcmUgY2hhaW5lZCB0b2dldGhlciBpbiBhIGRvdWJsZS1saW5rZWQgbGlzdCBmYXNpb24gZm9yIGxpbmVhciBhY2Nlc3MuXG4jIEVhY2ggdG9rZW4gaG9sZHMgYSB7VG9rZW4jcHJldn0gYW5kIHtUb2tlbiNuZXh0fSBmaWVsZHMgbGlua2luZyB0byB0b2tlbnNcbiMgYmVmb3JlIGFuZCBhZnRlci5cbiNcbiMgVGhlIG9yZGVyIGlzIGRldGVybWluZWQgYnkgdG9rZW4ncyBwb3NpdGlvbiBpbiB0aGUgZG9jdW1lbnQuIEFuIGVsZW1lbnQgbWF5XG4jIGNvcnJlc3BvbmQgdG8gb25lIHBhcmVudCB0b2tlbiBmb3IgdGhlIHdob2xlIGVsZW1lbnQgYXMgd2VsbCBhcyBhIGZld1xuIyBkZWxpbWl0ZXIgY2hpbGRyZW4gdG9rZW5zIHRvIGluZGljYXRlIGJvdW5kYXJpZXMuIEluIHN1Y2ggY2FzZSwgdGhlIHBhcmVudFxuIyB0b2tlbiBjb21lcyBiZXR3ZWVuIHRoZSBmaXJzdCBwYWlyIG9mIG1hdGNoZWQgZGVsaW1pdGVycy5cbiNcbiMgIyMjIEFTVFxuI1xuIyBUb2tlbnMgY2FuIGFsc28gYnVpbGQgYW4gYWJhc3RyYWN0IHN5bnRheCB0cmVlLCB3aXRoIHtUb2tlbiNwYXJlbnR9IGZpZWxkXG4jIHBvaW50aW5nIHRvIG9uZSdzIGRpcmVjdCBwYXJlbnQgYW5kIHtUb2tlbiNjaGlsZHJlbn0gaG9sZHMgYW4gYXJyYXkgb2ZcbiMgY2hpbGRyZW4uIENoaWxkcmVuIGFyZSBhbHNvIGNoYWluZWQgdG9nZXRoZXIgaW4gYSBkb3VibGUtbGlua2VkIGxpc3Qgd2l0aFxuIyB7VG9rZW4jcHJldlNpYmxpbmd9IGFuZCB7VG9rZW4jbmV4dFNpYmxpbmd9LiBBIHNpbmdsZSBkb2N1bWVudCB0b2tlbiBpcyB1c2VkXG4jIGFzIHRoZSBwYXJlbnQgZm9yIGFsbCB0b3AgbGV2ZWwgdG9rZW5zIHRvIGZvcm0gYSBzaW5nbGUtcm9vdCBzdHJ1Y3R1cmUuXG4jXG4jICMjIyBPdXRsaW5lXG4jXG4jIEhlYWRpbmcgdG9rZW5zIGFyZSBsaW5rZWQgaW50byBhIHRyZWUgdG8gcmVwcmVzZW50IHRoZSBsb2dpYyBzdHJ1Y3R1cmUgb2YgYVxuIyBkb2N1bWVudC4gRWFjaCBoZWFkaW5nIGdvdmVybnMgYSBzZWN0aW9uIHVuZGVyIGl0c2VsZiBhbmQgaG9sZHMgZWxlbWVudHMgYXNcbiMgc2VjdGlvbiBjb250ZW50LiAoTm90IGltcGxlbWVudGVkKVxuI1xuIyBAVE9ETyBPdXRsaW5lIHByb3BlcnRpZXNcbiNcbiMgIyMjIFF1YWR0cmVlXG4jXG4jIFRva2VucyBhcmUgYWxzbyBpbmRleGVkIHNwYXRpYWxseSB3aXRoIHF1YWR0cmVlLiBJdCBpcyB1c2VmdWxseSBmb3IgZWRpdG9yXG4jIGRldmVsb3BlcnMgdG8gbG9vayB1cCB0b2tlbiBieSBjdXJzb3IgbG9jYXRpb25zLlxuI1xuIyBAVE9ETyBRdWFkdHJlZSBpbXBsZW1lbnRhdGlvblxuI1xuIyBAVE9ETyBUb2tlbiBMb2NhdGlvblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVG9rZW5cbiAgIyBAcHJvcGVydHkge1Rva2VufSBUaGUgcHJldmlvdXMgdG9rZW4gaW4gZG9jdW1lbnRcbiAgcHJldjogbnVsbFxuXG4gICMgQHByb3BlcnR5IHtUb2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gZG9jdW1lbnRcbiAgbmV4dDogbnVsbFxuXG4gICMgQHByb3BlcnR5IHtUb2tlbn0gVGhlIHBhcmVudCB0b2tlblxuICBwYXJlbnQ6IG51bGxcblxuICAjIEBwcm9wZXJ0eSB7QXJyYXk8VG9rZW4+fSBUaGUgY2hpbHJlblxuICBjaGlsZHJlbjogW11cblxuICAjIEBwcm9wZXJ0eSB7VG9rZW59IFRoZSBmaXJzdCBjaGlsZFxuICBmaXJzdENoaWxkOiBudWxsXG5cbiAgIyBAcHJvcGVydHkge1Rva2VufSBUaGUgcHJldmlvdXMgdG9rZW4gdW5kZXIgdGhlIHNhbWUgcGFyZW50XG4gIHByZXZTaWJsaW5nOiBudWxsXG5cbiAgIyBAcHJvcGVydHkge1Rva2VufSBUaGUgbmV4dCB0b2tlbiB1bmRlciB0aGUgc2FtZSBwYXJlbnRcbiAgbmV4dFNpYmxpbmc6IG51bGxcblxuI1xuIyBAdG9kbyBBZGQgZG9jdW1lbnRhdGlvblxubW9kdWxlLmV4cG9ydHMuRGVmID1cbmNsYXNzIFRva2VuRGVmXG4gIEBBdHRyaWJ1dGU6ICdhdHRyaWJ1dGUnXG4gIEBDb250ZW50OiAnY29udGVudCdcbiAgQFRleHQ6ICd0ZXh0J1xuICBARGVsaW1pdGVyOiAnZGVsaW1pdGVyJ1xuICBATm90aGluZzogJ25vdGhpbmcnXG5cbiAgQGNsb25lOiAoYW5vdGhlcikgLT5cbiAgICBjb3BpZWQgPSBuZXcgVG9rZW5EZWYoYW5vdGhlci50eXBlLCBhbm90aGVyLmlkLCBhbm90aGVyLnRyYW5zZm9ybSlcbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBhbm90aGVyXG4gICAgICBpZiBhbm90aGVyLmhhc093blByb3BlcnR5KGtleSlcbiAgICAgICAgY29waWVkW2tleV0gPSB2YWx1ZVxuICAgIHJldHVybiBjb3BpZWRcblxuICBjb25zdHJ1Y3RvcjogKEB0eXBlLCBAaWQsIEB0cmFuc2Zvcm0sIG1vZGlmaWVycykgLT5cbiAgICBpZiBtb2RpZmllcnM/XG4gICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBtb2RpZmllcnNcbiAgICAgICAgQFtrZXldID0gdmFsdWVcbiIsIkxhbmd1YWdlUGFjayA9IHJlcXVpcmUgJy4uL2NvcmUvbGFuZ3VhZ2UtcGFjaydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29yZSBleHRlbmRzIExhbmd1YWdlUGFja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlciAnY29yZSdcblxuICAgIEBkZWNsYXJlQWxpYXMgJ14nLCAgICAgIC9eXFwgezAsIDN9L1xuICAgIEBkZWNsYXJlQWxpYXMgJyQnLCAgICAgIC8kL1xuICAgIEBkZWNsYXJlQWxpYXMgJyAnLCAgICAgIC9cXHMrL1xuICAgIEBkZWNsYXJlQWxpYXMgJyMnLCAgICAgIC8jezEsIDZ9L1xuICAgIEBkZWNsYXJlQWxpYXMgJy0gLSAtJywgIC8oWyorLV1cXHM/KXszLH0vXG4gICAgQGRlY2xhcmVBbGlhcyAnPT09JywgICAgL1stPV17Myx9L1xuICAgIEBkZWNsYXJlQWxpYXMgJy0+JywgICAgIC9eKFxcdHxcXCB7NH0pL1xuICAgIEBkZWNsYXJlQWxpYXMgJ2BgYCcsICAgIC9bfmBdezMsfS9cblxuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnKCcsICcpJ1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnWycsICddJ1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAneycsICd9J1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnPCcsICc+J1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnYGBgJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAncnVsZXMnLCBbJ14nLCAnLSAtIC0nLCAnJCddXG5cbiAgICBAYWRkQmxvY2tSdWxlICdhdHhfaGVhZGVyJywgWydeJywgJyMnLCAnICcsIC8oLiopXFxzKi8sICckJ10sXG4gICAgICAxOiBAZW1pdC5hdHRyaWJ1dGUgJ2xldmVsJywgKGhhc2gpIC0+IGhhc2gubGVuZ3RoXG4gICAgICAzOiBAZW1pdC5jb250ZW50ICAgJ3RpdGxlJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnc2V0ZXh0X2hlYWRlcicsIFsnXicsIC8oW15cXHNdLiopXFxuLywgJz09PScsICckJ10sXG4gICAgICAxOiBAZW1pdC5jb250ZW50ICAgJ3RpdGxlJ1xuICAgICAgMjogQGVtaXQuYXR0cmlidXRlICdsZXZlbCcsIChyKSAtPiBpZiByWzBdID09ICctJyB0aGVuIDEgZWxzZSAyXG5cbiAgICBAYWRkQmxvY2tSdWxlICdpbmRlbnRlZF9jb2RlJywgWyctPicsIC8oLiopLywgJyQnXSxcbiAgICAgIDE6IEBlbWl0LnRleHQgICAgICAnc3JjJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnZmVuY2VkX2NvZGUnLCBbJ14nLCAnYGBgJywgJyQnLCAvKFteXSopLywgJ14nLCAnYGBgJywgJyQnXSxcbiAgICAgIDM6IEBlbWl0LnRleHQgICAgICAnc3JjJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnaHRtbCcsIFtdXG5cbiAgICBAYWRkQmxvY2tSdWxlICdsaW5rX3JlZicsIFtdXG5cbiAgICBAYWRkQmxvY2tSdWxlICdwYXJhZ3JhcGgnLCBbXVxuXG4gICAgQGFkZEJsb2NrUnVsZSAnYmxhbmtfbGluZScsIFtdXG5cbiAgICAjIFRCRDogYWdncmVnYXRlIGBsaXN0X2l0ZW1gIGludG8gb25lIGAqX2xpc3RgIGVsZW1lbnQgbGF0ZXJcbiAgICAjICAgICAgb3IgZW1pdCBkaXJlY3RseVxuICAgICMgQGFkZEJsb2NrUnVsZSAnb3JkZXJlZF9saXN0J1xuICAgICNcbiAgICAjIEBhZGRCbG9ja1J1bGUgJ3Vub3JkZXJlZF9saXN0J1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnbGlzdF9pdGVtJywgW11cblxuICAgIEBhZGRJbmxpbmVSdWxlICdiYWNrc2xhc2hfZXNjYXBlJywgW11cblxuICAgIEBhZGRJbmxpbmVSdWxlICdlbnRpdHknLCBbXVxuXG4gICAgQGFkZElubGluZVJ1bGUgJ2NvZGVfc3BhbicsIFtdXG4iLCJMYW5ndWFnZVBhY2sgPSByZXF1aXJlICcuLi9jb3JlL2xhbmd1YWdlLXBhY2snXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdGTSBleHRlbmRzIExhbmd1YWdlUGFja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlciAnZ2ZtJ1xuIiwiQ29tcGlsZXIgPSByZXF1aXJlICcuL2NvbXBpbGVyJ1xuXG5Db3JlID0gcmVxdWlyZSAnLi9sYW5nL2NvcmUnXG5HRk0gPSByZXF1aXJlICcuL2xhbmcvZ2ZtJ1xuXG5jb3JlID0gbmV3IENvcmUoKVxuZ2ZtID0gbmV3IEdGTSgpXG5cbkNvbXBpbGVyLkRlZmF1bHQgPSBuZXcgQ29tcGlsZXIoW2NvcmUsIGdmbV0pXG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcGlsZXJcbiJdfQ==
