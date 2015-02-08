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
      return r.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
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

  RuleBuilder.prototype.make = function(rule, capture_map) {
    var could_capture, current_optional_group, group_index, i, in_optional_group, lazy_leaving, optional_changing, part, r, regex_src, result, token_def, token_defs, _i, _len, _ref;
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
      if (could_capture) {
        lazy_leaving = in_optional_group && (token_def.optional == null);
        optional_changing = ((_ref = token_def.optional) != null ? _ref : false) !== in_optional_group;
        if (lazy_leaving || optional_changing) {
          if (!in_optional_group) {
            group_index++;
            in_optional_group = true;
          } else {
            in_optional_group = false;
            regex_src += "(" + current_optional_group + ")?";
            current_optional_group = "";
          }
        }
        if (token_def.type !== Def.Nothing) {
          group_index++;
          part = "(" + part + ")";
          token_defs.push(token_def);
          token_def.group_index = group_index;
        }
      } else if (in_optional_group) {
        in_optional_group = false;
        regex_src += "(" + current_optional_group + ")?";
        current_optional_group = "";
      }
      if (in_optional_group) {
        current_optional_group += part;
      } else {
        regex_src += part;
      }
    }
    result = {
      regex: new RegExp(regex_src),
      handler: this._makeMatchHandler(token_defs)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXG5vZGVfbW9kdWxlc1xcZ3VscC1icm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29tcGlsZXJcXGdlbmVyYXRvci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxpbmRleC5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxwYXJzZXIuY29mZmVlIiwiRjpcXGRldlxcanNcXG1hcmtyaWdodFxcY29mZmVlXFxjb3JlXFxlbWl0dGVyLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29yZVxcbGFuZ3VhZ2UtcGFjay5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvcmVcXHJ1bGUtYnVpbGRlci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvcmVcXHRva2VuLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcbGFuZ1xcY29yZS5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGxhbmdcXGdmbS5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXG1hcmtyaWdodC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFNBQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLEVBQUEsbUJBQUEsR0FBQSxDQUFiOzttQkFBQTs7SUFGRixDQUFBOzs7OztBQ0FBLElBQUEsMkJBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxTQUNBLEdBQVksT0FB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LFlBQUQsQ0FBYyxXQUFkLEVBQTJCLEVBQTNCLENBL0NBLENBQUE7QUFBQSxJQWlEQSxJQUFDLENBQUEsYUFBRCxDQUFlLGtCQUFmLEVBQW1DLEVBQW5DLENBakRBLENBQUE7QUFBQSxJQW1EQSxJQUFDLENBQUEsYUFBRCxDQUFlLFFBQWYsRUFBeUIsRUFBekIsQ0FuREEsQ0FBQTtBQUFBLElBcURBLElBQUMsQ0FBQSxhQUFELENBQWUsV0FBZixFQUE0QixFQUE1QixDQXJEQSxDQURXO0VBQUEsQ0FBYjs7Y0FBQTs7R0FEaUIsYUFIbkIsQ0FBQTs7Ozs7QUNBQSxJQUFBLGlCQUFBO0VBQUE7aVNBQUE7O0FBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSx1QkFBUixDQUFmLENBQUE7O0FBQUEsTUFFTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdCQUFBLENBQUE7O0FBQWEsRUFBQSxhQUFBLEdBQUE7QUFDWCxJQUFBLHFDQUFNLEtBQU4sQ0FBQSxDQURXO0VBQUEsQ0FBYjs7YUFBQTs7R0FEZ0IsYUFIbEIsQ0FBQTs7Ozs7QUNBQSxJQUFBLDhCQUFBOztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUFYLENBQUE7O0FBQUEsSUFFQSxHQUFPLE9BQUEsQ0FBUSxhQUFSLENBRlAsQ0FBQTs7QUFBQSxHQUdBLEdBQU0sT0FBQSxDQUFRLFlBQVIsQ0FITixDQUFBOztBQUFBLElBS0EsR0FBVyxJQUFBLElBQUEsQ0FBQSxDQUxYLENBQUE7O0FBQUEsR0FNQSxHQUFVLElBQUEsR0FBQSxDQUFBLENBTlYsQ0FBQTs7QUFBQSxRQVFRLENBQUMsT0FBVCxHQUF1QixJQUFBLFFBQUEsQ0FBUyxDQUFDLElBQUQsRUFBTyxHQUFQLENBQVQsQ0FSdkIsQ0FBQTs7QUFBQSxNQVVNLENBQUMsT0FBUCxHQUFpQixRQVZqQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdlbmVyYXRvclxuICBjb25zdHJ1Y3RvcjogLT5cbiIsIlBhcnNlciA9IHJlcXVpcmUgJy4vcGFyc2VyJ1xuR2VuZXJhdG9yID0gcmVxdWlyZSAnLi9nZW5lcmF0b3InXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENvbXBpbGVyXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gIGNvbXBpbGU6IChtZCkgLT5cbiAgICByZXR1cm4gbWRcbiIsIiMgVGhlIHBhcnNlciBwcm9jZXNzZXMgaW5wdXQgTWFya2Rvd24gc291cmNlIGFuZCBnZW5lcmF0ZXMgQVNUXG4jIChhYmFzdHJhY3Qgc3ludGF4IHRyZWUpIGZvciB0aGUgZ2VuZXJhdG9yIHRvIGNvbnN1bWUuXG4jXG4jICMjIFRlcm1pbm9sb2d5XG4jXG4jICogKipEb2N1bWVudHMqKiBhcmUgdG9wIGxldmVsIHJlcHJlc2VudGF0aW9ucyBvZiBwYXJzZWQgTWFya2Rvd24gZmlsZXMuXG4jICogKipTb2xpZCBibG9ja3MqKiBhcmUgY29udGludW91cyBkb2N1bWVudCBwYXJ0cyBjb25zaXN0IG9mIG9ubHkgbGVhZiBibG9ja3MuXG4jICogKipGbHVpZCBibG9ja3MqKiBhcmUgY29udGludW91cyBkb2N1bWVudCBwYXJ0cyB0aGF0IGNvbnRhaW5zIGNvbnRlbnRzIG9mXG4jICAgY29udGFpbmVyIGJsb2NrcyB3aXRoIGNsb3NpbmcgZWxlbWVudHMgeWV0IHRvIGJlIGRldGVybWluZWQuXG4jXG4jIFNlZSB7TGFuZ3VhZ2VQYWNrfSBmb3IgbGFuZ3VhZ2Ugc3BlYyByZWxhdGVkIHRlcm1pbm9sb2d5LlxuI1xuIyAjIyBQYXJzaW5nIFN0cmF0ZWd5XG4jXG4jIFRoZSBwYXJzZXIgYXBwbGllcyBydWxlcyBpbiBhIGRldGVybWluZWQgb3JkZXIgKGEuay5hLiBwcmVjZWRlbmNlKSB0byBhdm9pZFxuIyBhbnkgYW1iaWd1aXR5LiBUaGUgZWxlbWVudHMgdGFrZSB0aGVpciBwcmVjZWRlbmNlIGluIGZvbGxvd2luZyBvcmRlcjpcbiNcbiMgMS4gQ29udGFpbmVyIGJsb2Nrc1xuIyAyLiBMZWFmIGJsb2Nrc1xuIyAzLiBJbmxpbmUgZWxlbWVudHNcbiNcbiMgVGhlIHBhcnNlciBwcm9jZXNzZXMgYSBkb2N1bWVudCBpbiAyIHBhc3NlczpcbiNcbiMgMS4gRGV0ZXJtaW5lIGJsb2NrIHN0cnVjdHVyZXMgYW5kIGFzc2lnbiB1bi1wYXJzZWQgc291cmNlIHRvIGVhY2ggYmxvY2sgdG9rZW5zXG4jIDIuIFBhcnNlIGlubGluZSB0b2tlbnMgb2YgZWFjaCBibG9ja3NcbiNcbiMgIyMjIEJsb2NrIFBhcnNpbmdcbiNcbiMgQmxvY2sgcGFyc2luZyBpcyBpbXBsZW1lbnRlZCBpbiB7UGFyc2VyI19wYXJzZUJsb2Nrc30uXG4jIFVubGlrZSBvdGhlciBNYXJrZG93biBwYXJzZXIgaW1wbGVtZW50YXRpb25zLCBNYXJrUmlnaHQgcGFyc2VyIGRvZXNcbiMgbm90IHJlcXVpcmUgbWF0Y2hlZCBydWxlcyB0byBiZSBhbmNob3JlZCBhdCB0aGUgYmVnaW5pbmcgb2YgdGhlIHN0cmVhbS5cbiMgSW5zdGVhZCwge1BhcnNlciNfX19wYXJzZU9uZUJsb2NrfSBhcHBsaWVzIHJ1bGVzIGZyb20gaGlnaGVzdCBwcmVjZWRlbmNlIHRvXG4jIGxvd2VzdCBhbmQgcmV0dXJucyB0aGUgZmlyc3QgbWF0Y2ggbm8gbWF0dGVyIHdoZXJlIHRoZSBtYXRjaCdzIGxvY2F0aW9uIGlzLlxuI1xuIyBJdCBpcyBleHBlY2VkIHRoYXQgdGhlIGZpcnN0IG1hdGNoIHVzdWFsbHkgb2NjdXJzIGluIHRoZSBtaWRkbGUgdGh1cyBzcGxpdGluZ1xuIyB0aGUgc3RyZWFtIGludG8gdGhyZWUgcGFydHM6XG4jXG4jIGBgYFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKyBEb2N1bWVudCBCZWdpblxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICBQYXJzZWQgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKyBPZmZzZXRcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICBSZXNpZHVhbCBCZWZvcmUgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICBGaXJzdCBNYXRjaCAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICBSZXNpZHVhbCBBZnRlciAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgRG9jdW1lbnQgRW5kXG4jIGBgYFxuI1xuIyBJZiB0aGUgYEZpcnN0IE1hdGNoYCBpcyBhIGxlYWYgYmxvY2ssIHRoZSBwYXJzZXIgY2FuIHNhZmVseSBhc3N1bWUgdGhhdCB0aGVcbiMgZW50aXJlIHN0cmVhbSBpcyBvbmUgc29saWQgYmxvY2suIEhlbmNlIGJvdGggcmVzaWR1YWwgYmxvY2tzIGFyZSBzb2xpZCB0b28uXG4jIFRodXMgdGhlIHBhcnNpbmcgY2FuIGJlIGFjaGl2ZWQgYnkgcmVjdXNpdmVseSBwYXJzZSBhbmQgc3BsaXQgdGhlIHN0cmVhbSBpbnRvXG4jIHNtYWxsZXIgYW5kIHNtYWxsZXIgYmxvY2tzIHVudGlsIHRoZSBlbnRpcmUgc3RyZWFtIGlzIHBhcnNlZC5cbiMgVGhpcyBpcyBkb25lIGJ5IHtQYXJzZXIjX19wYXJzZVNvbGlkQmxvY2tzfS5cbiNcbiMgSWYgdGhlIGBGaXJzdCBNYXRjaGAgaXMgYSBjb250YWluZXIgYmxvY2sgc3RhcnQgdG9rZW4sIHRoZSBgUmVzaWR1YWwgQmVmb3JlYFxuIyBpcyBrbm93biB0byBiZSBhIHNvbGlkIGJsb2NrIGFuZCBjYW4gYmUgcGFyc2VkIHdpdGhcbiMge1BhcnNlciNfX3BhcnNlU29saWRCbG9ja3N9LlxuIyBUaGUgYFJlc2lkdWFsIEFmdGVyYCB3b3VsZCBiZSBhIGZsdWlkIGJsb2NrOlxuI1xuIyBgYGBcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICBGaXJzdCBNYXRjaCAgICAgICAgIHwgPC0tLSsgQ29udGFpbmVyIGJsb2NrIHN0YXJ0IHRva2VuXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIChlLmcuICc+ICcgZm9yIGEgYmxvY2txdW90ZSlcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiMgWCAgICAgICAgICAgICAgICAgICAgICAgICAgIFhcbiMgWCAgICAgICBDb250ZW50IG9mICAgICAgICAgIFggPC0tLSsgUmVzaWR1YWwgQWZ0ZXIgKEZsdWlkIEJsb2NrKVxuIyBYICAgICAgIENvbnRhaW5lciBCbG9jayAgICAgWFxuIyBYICAgICAgICAgICAgICAgICAgICAgICAgICAgWFxuIyBYLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tWCAtLS0tPiBOZXcgb2Zmc2V0IGZvciBuZXh0IGl0ZXJhdGlvblxuIyBYICAgICAgICAgICAgICAgICAgICAgICAgICAgWFxuIyBYICAgICAgIFVuLXBhcnNlZCAgICAgICAgICAgWFxuIyBYICAgICAgICAgICAgICAgICAgICAgICAgICAgWFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKyBEb2N1bWVudCBFbmRcbiMgYGBgXG4jXG4jIEEgZmx1aWQgYmxvY2sgaXMgcGFyc2VkIGJ5IHtQYXJzZXIjX19wYXJzZUZsdWlkQmxvY2tzfS4gSXQgcGFyc2VzIHRoZSBmbHVpZFxuIyBibG9jayBsaW5lYXJseSBhbmQgbG9va3MgZm9yIGxpbmVzIHN0YXJ0IHdpdGggY29udGVudCBibG9jayBkZWxpbWl0ZXIgKGUuZy5cbiMgJz4gJyBmb3IgYmxvY2txdW90ZXMgb3IgY29ycmVjdCBsZXZlbCBvZiBpbmRlbnRhdGlvbiBmb3IgbGlzdCBpdGVtcykuXG4jIERlbGltaXRlcnMgYXJlIHN0cmlwcGVkIGJlZm9yZSB0aGUgY29udGVudHMgYXJlIGFnZ3JlZ2F0ZWQgaW50byBvbmUgbmV3IGJsb2NrXG4jIGZvciBsYXRlciBwYXJzaW5nLiBBIG5ldyBsaW5lIHdpdGhvdXQgYSBjb250YWluZXIgYmxvY2sgZGVsaW1pdGVyIGNhbiBlaXRoZXJcbiMgYmUgdGhlIGVuZCBvZiBjdXJyZW50IGNvbnRhaW5lciBibG9jayBvciBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIGNvbnRhaW5lclxuIyBhY2Nyb2RpbmcgdG8gJ2xhemluZXNzJyBydWxlLiBUaGUgcGFyc2luZyBpcyBub3QgY29tcGxldGUgdW50aWwgZWl0aGVyIHRoZSBlbmRcbiMgb2YgY29udGFpbmVyIGJsb2NrIG9yIHRoZSBlbmQgb2YgdGhlIGRvY3VtZW50IGlzIGVuY291bnRlcmVkLlxuI1xuIyBgYGBcbiMgKy0tLSstLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgfCAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgKiB8IENvbnRlbnQgICAgICAgICAgICAgIHxcbiMgfCAgIHwgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIDwtLSsgUG9zc2libGUgZW5kIG9mIGNvbnRlbnQgYmxvY2tcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICAgICBOZXh0IGVsZW1lbnQgd2l0aG91dCB8XG4jIHwgICAgIGRlbGltaXRlciAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgVW4tcGFyc2VkICAgICAgICAgICAgfFxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiNcbiMgKiBDb250YWluZXIgYmxvY2sgZGVsaW1pdGVyXG4jIGBgYFxuI1xuIyBBZnRlciBlYWNoIGl0ZXJhdGlvbiwgdGhlIGBvZmZzZXRgIGlzIGFkdmFuY2VkIGFuZCB0aGUgd2hvbGUgcHJvY2VzcyBzdGFydHNcbiMgYWdhaW4gdW50aWwgdGhlIGVuZCBvZiB0aGUgZG9jdW1lbnQuXG4jXG4jICMjIyBJbmxpbmUgRWxlbWVudCBQYXJzaW5nXG4jXG4jIElubGluZSBlbGVtZW50IHBhcnNpbmcgKHtQYXJzZXIjX3BhcnNlSW5saW5lfSkgaXMgdHJpdmFsLlxuIyBUaGUgc3RhdGVneSBpcyBleGFjdGx5IHRoZSBzYW1lIGFzIHNvbGlkIGJsb2NrIHBhcnNpbmcuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQYXJzZXJcbiAgIyBDcmVhdGUgYSB7UGFyc2VyfSBpbnN0YW5jZVxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAjIFBhcnNlIE1hcmtkb3duIHNvdXJjZSBpbnRvIEFTVFxuICAjIEBwYXJhbSB7c3RyaW5nfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiB7QXJyYXl9IEFTVFxuICBwYXJzZTogKHNyYykgLT5cbiAgICBhc3QgPSBAX3BhcnNlQmxvY2tzKHNyYylcbiAgICBhc3QgPSBAX3BhcnNlSW5saW5lKGFzdClcblxuICAgIHJldHVybiBhc3RcblxuICAjIEBwcml2YXRlXG4gICMgUGFyc2UgYmxvY2sgc3RydWN0dXJlc1xuICAjIEBwYXJhbSB7c3RyaW5nfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiB7QXJyYXl9IEFTVFxuICBfcGFyc2VCbG9ja3M6IChzcmMpIC0+XG4gICAgb2Zmc2V0ID0gMFxuICAgIG4gPSBzcmMubGVuZ3RoXG4gICAgcGVuZGluZyA9IFtdXG4gICAgYXN0ID0gW11cblxuICAgIHdoaWxlIG9mZnNldCA8IG4gb3IgcGVuZGluZy5sZW5ndGggPiAwXG4gICAgICBzdGFydEluZGV4ID0gb2Zmc2V0XG4gICAgICBjYl9zdGFydF90b2tlbiA9IEBfX3RyeVBhcnNlQ29udGFpbmVyQmxvY2tTdGFydFRva2VuKG9mZnNldCwgc3JjKVxuICAgICAgbGFzdEluZGV4ID0gY2Jfc3RhcnRfdG9rZW4uc3RhcnRJbmRleFxuICAgICAgaWYgY2Jfc3RhcnRfdG9rZW4/XG4gICAgICAgIGFzdF9zb2xpZF9wYXJ0ID0gQF9fcGFyc2VTb2xpZEJsb2NrcyhzdGFydEluZGV4LCBsYXN0SW5kZXgsIHNyYylcbiAgICAgICAge29mZnNldCwgYXN0X2ZsdWlkX3BhcnR9ID0gQF9fcGFyc2VGbHVpZEJsb2NrcyhjYl9zdGFydF90b2tlbiwgc3JjKVxuICAgICAgZWxzZVxuICAgICAgICB7b2Zmc2V0LCBhc3Rfc29saWRfcGFydH0gPSBAX19wYXJzZVNvbGlkQmxvY2tzKHN0YXJ0SW5kZXgsIG4sIHNyYylcblxuICAgICAgYXN0LnB1c2ggYXN0X3NvbGlkX3BhcnRcbiAgICAgIGFzdC5wdXNoIGFzdF9mbHVpZF9wYXJ0XG5cbiAgICByZXR1cm4gYXN0XG5cbiAgIyBAcHJpdmF0ZVxuICAjIFBhcnNlIHRoZSBzb3VyY2Ugc3RhcnRpbmcgZnJvbSBnaXZlbiBvZmZzZXQgYW5kIHRyaWVzIHRvIGZpbmQgdGhlIGZpcnN0XG4gICMgY29udGFpbmVyIGJsb2NrIHN0YXJ0IHRva2VuXG4gICMgQHBhcmFtIHtpbnR9IG9mZnNldCBPZmZzZXQgdmFsdWVcbiAgIyBAcGFyYW0ge3N0cmluZ30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4ge1Rva2VufSBNYXRjaGVkIHRva2VuIChudWxsYWJsZSlcbiAgX3RyeVBhcnNlQ29udGFpbmVyQmxvY2tTdGFydFRva2VuOiAob2Zmc2V0LCBzcmMpIC0+XG5cbiAgIyBAcHJpdmF0ZVxuICAjIFBhcnNlIHRoZSBzcGVjaWZpZWQgZG9jdW1lbnQgcmVnaW9uIGFzIGEgc29saWQgYmxvY2tcbiAgIyBAcGFyYW0ge2ludH0gYmVnaW4gU3RhcnQgaW5kZXggb2YgdGhlIHJlZ2lvblxuICAjIEBwYXJhbSB7aW50fSBlbmQgTGFzdCBpbmRleCBvZiB0aGUgcmVnaW9uXG4gICMgQHBhcmFtIHtzcmN9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIFtBcnJheTxUb2tlbj5dIEFTVCBvZiBzcGVjaWZpZWQgcmVnaW9uXG4gIF9fcGFyc2VTb2xpZEJsb2NrczogKGJlZ2luLCBlbmQsIHNyYykgLT5cbiAgICBibG9jayA9IEBfX19wYXJzZU9uZUJsb2NrKGJlZ2luLCBlbmQsIHNyYylcbiAgICBhc3RfcGFydF9iZWZvcmUgPSBAX19wYXJzZVNvbGlkQmxvY2tzKGJlZ2luLCBibG9jay5zdGFydEluZGV4IC0gMSwgc3JjKVxuICAgIGFzdF9wYXJ0X2FmdGVyICA9IEBfX3BhcnNlU29saWRCbG9ja3MoYmxvY2subGFzdEluZGV4LCBlbmQsIHNyYylcblxuICAgIHJldHVybiBbXS5jb25jYXQoYXN0X3BhcnRfYmVmb3JlLCBibG9jaywgYXN0X3BhcnRfYWZ0ZXIpXG5cbiAgIyBAcHJpdmF0ZVxuICAjIFBhcnNlIHRoZSBzcGVjaWZpZWQgZG9jdW1lbnQgcmVnaW9uIGFzIGEgZmx1aWQgYmxvY2tcbiAgIyBAcGFyYW0ge1Rva2VufSBzdGFydF90b2tlbiBUaGUgc3RhcnQgdG9rZW4gb2YgYSBjb250YWluZXIgYmxvY2tcbiAgIyBAcGFyYW0ge3N0cmluZ30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4gW0FycmF5PFRva2VuPl0gQVNUIG9mIHNwZWNpZmllZCByZWdpb25cbiAgX19wYXJzZUZsdWlkQmxvY2tzOiAoc3RhcnRfdG9rZW4sIHNyYykgLT5cblxuICAjIEBwcml2YXRlXG4gICMgTWF0Y2ggYmxvY2sgcnVsZXMgZnJvbSBoaWdoZXN0IHByZWNlZGVuY2UgdG8gbG93ZXN0IGFnYWluc3QgdGhlIHNwZWNpZmllZFxuICAjIGRvY3VtZW50IHJlZ2lvbiBhbmQgcmV0dXJucyBpbW1lZGlhdGVseSBvbiB0aGUgZmlyc3QgbWF0Y2guXG4gICMgQHBhcmFtIHtpbnR9IGJlZ2luIFN0YXJ0IGluZGV4IG9mIHRoZSByZWdpb25cbiAgIyBAcGFyYW0ge2ludH0gZW5kIExhc3QgaW5kZXggb2YgdGhlIHJlZ2lvblxuICAjIEBwYXJhbSB7c3JjfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiB7VG9rZW59IFRoZSBmaXJzdCBtYXRjaFxuICBfX19wYXJzZU9uZUJsb2NrOiAtPiAoYmVnaW4sIGVuZCwgc3JjKSAtPlxuXG5cbiAgIyBAcHJpdmF0ZVxuICAjIFBhcnNlIGlubGluZSBlbGVtZW50c1xuICAjIEBwYXJhbSB7QXJyYXl9IGFzdCBBU1Qgd2l0aCB1bi1wYXJzZWQgYmxvY2sgbm9kZXMgb25seVxuICAjIEByZXR1cm4ge0FycmF5fSBGdWxseSBwYXJzZWQgQVNUXG4gIF9wYXJzZUlubGluZTogKGFzdCkgLT5cbiIsIntEZWZ9ID0gcmVxdWlyZSAnLi90b2tlbidcblxuIyMjXG5Vc2VkIHdoZW4gZGVmaW5pbmcgbGFuZ3VhZ2UgcnVsZXMgd2l0aCB7TGFuZ3VhZ2VQYWNrfSBBUElzLlxuXG5BbiBlbWl0dGVyIG1ldGhvZCBkb2VzIG5vdCBhY3R1YWxseSBlbWl0IGFueSB0b2tlbnMgd2hlbiBjYWxsZWQsIGJ1dCBjcmVhdGluZ1xuYSBkZWZpbml0aW9uIG9yIGNvbnRyYWN0IG9mIHRva2VucyB0aGF0IHdpbGwgYmUgZW1pdHRlZCBvbmNlIHRoZSBjb3JyZXNwb25kaW5nXG5ydWxlIGlzIG1hdGNoZWQuXG4jIyNcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEVtaXR0ZXJcbiAgY29uc3RydWN0b3I6IChAbW9kaWZpZXJzID0ge30pIC0+XG4gICAgQG9wdGlvbmFsID0gbmV3IE9wdGlvbmFsRW1pdHRlcigpXG5cbiAgIyBAcmV0dXJuIHtUb2tlbi5EZWZ9IEEgdG9rZW4gZGVmaW5pdGlvblxuICBhdHRyaWJ1dGU6IChpZCwgdHJhbnNmb3JtKSAtPlxuICAgIG5ldyBEZWYoRGVmLkF0dHJpYnV0ZSwgaWQsIHRyYW5zZm9ybSwgQG1vZGlmaWVycylcblxuICAjIEByZXR1cm4ge1Rva2VuLkRlZn0gQSB0b2tlbiBkZWZpbml0aW9uXG4gIGNvbnRlbnQ6IChpZCwgdHJhbnNmb3JtKSAtPlxuICAgIG5ldyBEZWYoRGVmLkNvbnRlbnQsIGlkLCB0cmFuc2Zvcm0sIEBtb2RpZmllcnMpXG5cbiAgIyBAcmV0dXJuIHtUb2tlbi5EZWZ9IEEgdG9rZW4gZGVmaW5pdGlvblxuICB0ZXh0OiAoaWQsIHRyYW5zZm9ybSkgLT5cbiAgICBuZXcgRGVmKERlZi5UZXh0LCBpZCwgdHJhbnNmb3JtLCBAbW9kaWZpZXJzKVxuXG4gICMgQHJldHVybiB7VG9rZW4uRGVmfSBBIHRva2VuIGRlZmluaXRpb25cbiAgZGVsaW1pdGVyOiAoaWQsIHRyYW5zZm9ybSkgLT5cbiAgICBuZXcgRGVmKERlZi5EZWxpbWl0ZXIsIGlkLCB0cmFuc2Zvcm0sIEBtb2RpZmllcnMpXG5cbiAgbm90aGluZzogLT5cbiAgICBuZXcgRGVmKERlZi5Ob3RoaW5nLCBudWxsLCBudWxsLCBAbW9kaWZpZXJzKVxuXG5jbGFzcyBPcHRpb25hbEVtaXR0ZXIgZXh0ZW5kcyBFbWl0dGVyXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBtb2RpZmllcnMgPSBvcHRpb25hbDogdHJ1ZVxuIiwiUnVsZUJ1aWxkZXIgPSByZXF1aXJlICcuL3J1bGUtYnVpbGRlcidcbkVtaXR0ZXIgPSByZXF1aXJlICcuL2VtaXR0ZXInXG5cbiMjI1xuQmFzZSBjbGFzcyBmb3IgbGFuZ3VhZ2UgcGFja3NcbiMjI1xubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTGFuZ3VhZ2VQYWNrXG4gICMgQHByb3BlcnR5IFtFbWl0dGVyXSBBbiB7RW1pdHRlcn0gaW5zdGFuY2VcbiAgZW1pdDogbmV3IEVtaXR0ZXIoKVxuXG4gIGNvbnN0cnVjdG9yOiAoQG5zKSAtPlxuICAgIEBfYnVpbGRlciA9IG5ldyBSdWxlQnVpbGRlcigpXG4gICAgQGJsb2NrUnVsZXMgPSBbXVxuICAgIEBpbmxpbmVSdWxlcyA9IFtdXG5cbiAgZGVjbGFyZUFsaWFzOiAoYWxpYXMsIHJlZ2V4KSAtPlxuICAgIEBfYnVpbGRlci5kZWNsYXJlQWxpYXMoYWxpYXMsIHJlZ2V4KVxuXG4gIGRlY2xhcmVEZWxpbWl0ZXJQYWlyOiAob3BlbiwgY2xvc2UpIC0+XG4gICAgIyBUT0RPOiB1c2VkIGZvciBob3QgdXBkYXRlIG1vZGUsIGltcGxlbWVudCBsYXRlclxuXG4gIGFkZEJsb2NrUnVsZTogKG5hbWUsIHJ1bGUsIGVtaXR0ZXIpIC0+XG4gICAgYnVpbHRfcnVsZSA9IEBfYnVpbGRlci5tYWtlKHJ1bGUsIGVtaXR0ZXIpXG4gICAgYnVpbHRfcnVsZS5uYW1lID0gbmFtZVxuICAgIEBibG9ja1J1bGVzLnB1c2ggYnVpbHRfcnVsZVxuXG4gIGFkZElubGluZVJ1bGU6IChuYW1lLCBydWxlLCBlbWl0dGVyKSAtPlxuICAgIGJ1aWx0X3J1bGUgPSBAX2J1aWxkZXIubWFrZShydWxlLCBlbWl0dGVyKVxuICAgIGJ1aWx0X3J1bGUubmFtZSA9IG5hbWVcbiAgICBAaW5saW5lUnVsZXMucHVzaCBidWlsdF9ydWxlXG4iLCJ7RGVmfSA9IHJlcXVpcmUgJy4vdG9rZW4nXG4jIHtSdWxlQnVpbGRlcn0gaXMgdXNlZCBieSB7TGFuZ3VhZ2VQYWNrfSBpbnRlcm5hbGx5IHRvIGNvbXBpbGUgcnVsZXMgZm9yIHBhcnNlclxuIyB0byBleGVjdXRlLlxuI1xuIyAjIyBUZXJtaW5vbG9neVxuI1xuIyAqICoqUnVsZSBkZWNsZXJhdGlvbioqcyBhcmUgbWFkZSB3aXRoIEFQSSBjYWxscyBpbiB7TGFuZ3VhZ2VQYWNrfSB0byBzcGVjaWZ5XG4jICAgdGhlIHN5YW50YXggb2YgYSBsYW5ndWFnZSBmZWF0dXJlIHdpdGggcmVnZXggYXMgd2VsbCBhcyBob3cgcmVsZXZlbnQgZGF0YSBpc1xuIyAgIGNhcHR1cmVkIGFuZCBlbWl0dGVkIGludG8gdG9rZW5zLlxuIyAqICoqUnVsZSoqcyBhcmUgY29tcGlsZWQgZGVjbGFyYXRpb25zIGVhY2ggb2Ygd2hpY2ggY29uc2lzdHMgb2YgYSByZWdleCBhbmQgYVxuIyAgIGhhbmRsZXIgZnVuY3Rpb24uIFRoZSBsYXR0ZXIgZW1pdHMgYSB0b2tlbiBvciBtYW5pcHVsYXRlcyB0aGUgcGFyZW50IHRva2VuLlxuI1xuIyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdG8gZGVjYWxyZSBhIHJ1bGUsIHNlZSB7TGFuZ3VhZ2VQYWNrfS5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFJ1bGVCdWlsZGVyXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfYWxpYXNNYXAgPSB7fVxuXG4gIGRlY2xhcmVBbGlhczogKGFsaWFzLCByZWdleCkgLT5cbiAgICAjIFRPRE86IGNoZWNrIGZvciBkdXBsaWNhdGlvblxuICAgIEBfYWxpYXNNYXBbYWxpYXNdID0gcmVnZXhcblxuICAjIEBwcml2YXRlXG4gICNcbiAgIyBHZXQgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHJlZ2V4IHBhcnQgZm9yIGNvbmNhdGVuYXRpaW9uLlxuICAjXG4gICMgQG92ZXJsb2FkIF9nZXRSZWdleFBhcnQoYWxpYXNfb3JfbGl0ZXJhbClcbiAgIyAgIFRoZSBhcmd1bWVudCBpcyBzZWFyY2hlZCBpbiB0aGUgYWxpYXMgbWFwIGZpcnN0LiBJZiBubyBtYXRjaCBpcyBmb3VuZCwgaXRcbiAgIyAgIGlzIHRoZW4gY29uc2lkZXJlZCBhcyBhIGxpdGVyYWwgcmVnZXggc291cmNlIHN0cmluZy5cbiAgIyAgIFRoZSBsaXRlcmFsIHN0cmluZyB3aWxsIGJlIGVzY2FwZWQuIEZvciBleGFtcGxlLCBgJ15bKCldJ2AgaXMgcHJvY2Vzc2VkIHRvXG4gICMgICBgL1xcXlxcW1xcKFxcKVxcXS9gLlxuICAjICAgQHBhcmFtIFtzdHJpbmddIGFsaWFzX29yX2xpdGVyYWxcbiAgIyBAb3ZlcmxvYWQgX2dldFJlZ2V4UGFydChyZWdleClcbiAgIyAgIEBwYXJhbSBbUmVnRXhwXSByZWdleFxuICAjIEByZXR1cm4gW3N0cmluZ10gUmVnZXggcGFydCdzIHN0cmluZyBzb3VyY2VcbiAgX2dldFJlZ2V4UGFydDogKHIpIC0+XG4gICAgdCA9IHR5cGVvZiByXG4gICAgaWYgdCA9PSAnc3RyaW5nJ1xuICAgICAgaWYgciBvZiBAX2FsaWFzTWFwXG4gICAgICAgICMgQWxpYXNcbiAgICAgICAgcmV0dXJuIEBfYWxpYXNNYXBbcl1cbiAgICAgICMgTGl0ZXJhbFxuICAgICAgcmV0dXJuIHIucmVwbGFjZSgvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCAnXFxcXCQmJylcbiAgICBlbHNlIGlmIHQgPT0gJ29iamVjdCcgYW5kIHIgaW5zdGFuY2VvZiBSZWdFeHBcbiAgICAgIHJldHVybiByLnNvdXJjZVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCIje3J9IGlzIG5vdCBhIHZhbGlkIGFsaWFzIG5hbWUsIHN0cmluZyBvciBSZWdFeHBcIilcblxuICBfbWFrZU1hdGNoSGFuZGxlcjogKHRva2VuX2RlZnMpIC0+XG4gICAgcmV0dXJuIChub2RlLCBtYXRjaGVzKSAtPlxuICAgICAgZm9yIGQgaW4gdG9rZW5fZGVmc1xuICAgICAgICBwYXlsb2FkID0gbWF0Y2ggPSBtYXRjaGVzW2QuZ3JvdXBfaW5kZXhdXG4gICAgICAgIGlmIGQudHJhbnNmb3JtP1xuICAgICAgICAgIHBheWxvYWQgPSBkLnRyYW5zZm9ybShwYXlsb2FkKVxuXG4gICAgICAgIG5vZGVbZC5pZF0gPSBwYXlsb2FkXG4gICAgICAgICMgVE9ETzogdXNlIG5vZGUuYXR0YWNoWHh4IGFjY3JvZGluZyB0byBkLnR5cGUgZmllbGRcblxuXG4gICMgQHBhcmFtIHtSZWdFeHB9IHJ1bGVcbiAgIyBAcGFyYW0ge09iamVjdH0gY2FwdHVyZV9tYXBcbiAgbWFrZTogKHJ1bGUsIGNhcHR1cmVfbWFwKSAtPlxuICAgIHJlZ2V4X3NyYyA9ICcnXG4gICAgZ3JvdXBfaW5kZXggPSAwXG4gICAgdG9rZW5fZGVmcyA9IFtdXG4gICAgaW5fb3B0aW9uYWxfZ3JvdXAgPSBmYWxzZVxuICAgIGN1cnJlbnRfb3B0aW9uYWxfZ3JvdXAgPSBcIlwiXG5cbiAgICBmb3IgciwgaSBpbiBydWxlXG4gICAgICB0b2tlbl9kZWYgPSBjYXB0dXJlX21hcD9baSArIDFdXG5cbiAgICAgIGNvdWxkX2NhcHR1cmUgPSB0b2tlbl9kZWY/XG5cbiAgICAgIHBhcnQgPSBAX2dldFJlZ2V4UGFydChyKVxuICAgICAgaWYgY291bGRfY2FwdHVyZVxuICAgICAgICBsYXp5X2xlYXZpbmcgPSBpbl9vcHRpb25hbF9ncm91cCBhbmQgbm90IHRva2VuX2RlZi5vcHRpb25hbD9cbiAgICAgICAgb3B0aW9uYWxfY2hhbmdpbmcgPSAodG9rZW5fZGVmLm9wdGlvbmFsID8gZmFsc2UpICE9IGluX29wdGlvbmFsX2dyb3VwXG4gICAgICAgIGlmIGxhenlfbGVhdmluZyBvciBvcHRpb25hbF9jaGFuZ2luZ1xuICAgICAgICAgIGlmIG5vdCBpbl9vcHRpb25hbF9ncm91cFxuICAgICAgICAgICAgIyBmYWxzZSAtPiB0cnVlLCBlbnRlcmluZyBvcHRpb25hbCBncm91cFxuICAgICAgICAgICAgZ3JvdXBfaW5kZXgrK1xuICAgICAgICAgICAgaW5fb3B0aW9uYWxfZ3JvdXAgPSB0cnVlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyB0cnVlIC0+IGZhbHNlLCBsZWF2aW5nIG9wdGlvbmFsIGdyb3VwXG4gICAgICAgICAgICBpbl9vcHRpb25hbF9ncm91cCA9IGZhbHNlXG4gICAgICAgICAgICByZWdleF9zcmMgKz0gXCIoI3tjdXJyZW50X29wdGlvbmFsX2dyb3VwfSk/XCJcbiAgICAgICAgICAgIGN1cnJlbnRfb3B0aW9uYWxfZ3JvdXAgPSBcIlwiXG4gICAgICAgIGlmIHRva2VuX2RlZi50eXBlICE9IERlZi5Ob3RoaW5nXG4gICAgICAgICAgZ3JvdXBfaW5kZXgrK1xuICAgICAgICAgIHBhcnQgPSBcIigje3BhcnR9KVwiXG4gICAgICAgICAgdG9rZW5fZGVmcy5wdXNoIHRva2VuX2RlZlxuICAgICAgICAgIHRva2VuX2RlZi5ncm91cF9pbmRleCA9IGdyb3VwX2luZGV4XG4gICAgICBlbHNlIGlmIGluX29wdGlvbmFsX2dyb3VwXG4gICAgICAgICMgdHJ1ZSAtPiBmYWxzZSwgbGVhdmluZyBvcHRpb25hbCBncm91cFxuICAgICAgICBpbl9vcHRpb25hbF9ncm91cCA9IGZhbHNlXG4gICAgICAgIHJlZ2V4X3NyYyArPSBcIigje2N1cnJlbnRfb3B0aW9uYWxfZ3JvdXB9KT9cIlxuICAgICAgICBjdXJyZW50X29wdGlvbmFsX2dyb3VwID0gXCJcIlxuICAgICAgaWYgaW5fb3B0aW9uYWxfZ3JvdXBcbiAgICAgICAgY3VycmVudF9vcHRpb25hbF9ncm91cCArPSBwYXJ0XG4gICAgICBlbHNlXG4gICAgICAgIHJlZ2V4X3NyYyArPSBwYXJ0XG5cbiAgICByZXN1bHQgPVxuICAgICAgcmVnZXg6IG5ldyBSZWdFeHAocmVnZXhfc3JjKVxuICAgICAgaGFuZGxlcjogQF9tYWtlTWF0Y2hIYW5kbGVyKHRva2VuX2RlZnMpXG4gICAgcmV0dXJuIHJlc3VsdFxuIiwiIyBUb2tlbnMgYXJlIGJ1aWxkaW5nIGJsb2NrcyBvZiBwYXJzZWQgZG9jdW1lbnRzLiBFYWNoIHJ1bGUgaXMgZXZhbHVhdGVkIGFuZFxuIyBjYXB0dXJlIGdyb3VwcyBhcmUgdHJhbnNmb3JtZWQgaW50byB0b2tlbnMuIEZvciBpbmZvcm1hdGlvbiBvbiBob3cgdG9rZW5zXG4jIGFyZSBlbWl0dGVkIGZyb20gbGFuZ3VhZ2UgcnVsZXMsIHNlZSB7TGFuZ3VhZ2VQYWNrfS5cbiNcbiMgQSB0b2tlbiBjb250YWlucyBuZWNlc3NhcnkgaW5mb3JtYXRpb24gdG8gcmVwcmVzZW50IGEgTWFya2Rvd24gZWxlbWVudCxcbiMgaW5jbHVkaW5nIGl0cyBsb2NhdGlvbiBpbiBzb3VyY2UgY29kZSwgZGF0YSBmaWVsZHMgYW5kIGV0Yy4gRm9yIHNpbXBsaWNpdHksXG4jIE1hcmtSaWdodCB1c2VzIHRva2VucyBhcyBBU1Qgbm9kZXMgZGlyZWN0bHkgaW5zdGVhZCBvZiBjcmVhdGluZyBuZXcgb25lcy5cbiNcbiMgIyMgVG9rZW4gSGllcmFyY2hpZXNcbiNcbiMgVG9rZW5zIGFyZSBjb25uZWN0ZWQgd2l0aCBlYWNoIG90aGVyIGluIGEgZmV3IGRpZmZyZW50IHdheXMgdG8gZm9ybSBkaWZmcmVudFxuIyByZXByZXNlbnRhdGlvbnMgb2YgdGhlIHNhbWUgZG9jdW1lbnQuXG4jXG4jICMjIyBMaW5lYXIgTGlzdFxuI1xuIyBUb2tlbnMgYXJlIGNoYWluZWQgdG9nZXRoZXIgaW4gYSBkb3VibGUtbGlua2VkIGxpc3QgZmFzaW9uIGZvciBsaW5lYXIgYWNjZXNzLlxuIyBFYWNoIHRva2VuIGhvbGRzIGEge1Rva2VuI3ByZXZ9IGFuZCB7VG9rZW4jbmV4dH0gZmllbGRzIGxpbmtpbmcgdG8gdG9rZW5zXG4jIGJlZm9yZSBhbmQgYWZ0ZXIuXG4jXG4jIFRoZSBvcmRlciBpcyBkZXRlcm1pbmVkIGJ5IHRva2VuJ3MgcG9zaXRpb24gaW4gdGhlIGRvY3VtZW50LiBBbiBlbGVtZW50IG1heVxuIyBjb3JyZXNwb25kIHRvIG9uZSBwYXJlbnQgdG9rZW4gZm9yIHRoZSB3aG9sZSBlbGVtZW50IGFzIHdlbGwgYXMgYSBmZXdcbiMgZGVsaW1pdGVyIGNoaWxkcmVuIHRva2VucyB0byBpbmRpY2F0ZSBib3VuZGFyaWVzLiBJbiBzdWNoIGNhc2UsIHRoZSBwYXJlbnRcbiMgdG9rZW4gY29tZXMgYmV0d2VlbiB0aGUgZmlyc3QgcGFpciBvZiBtYXRjaGVkIGRlbGltaXRlcnMuXG4jXG4jICMjIyBBU1RcbiNcbiMgVG9rZW5zIGNhbiBhbHNvIGJ1aWxkIGFuIGFiYXN0cmFjdCBzeW50YXggdHJlZSwgd2l0aCB7VG9rZW4jcGFyZW50fSBmaWVsZFxuIyBwb2ludGluZyB0byBvbmUncyBkaXJlY3QgcGFyZW50IGFuZCB7VG9rZW4jY2hpbGRyZW59IGhvbGRzIGFuIGFycmF5IG9mXG4jIGNoaWxkcmVuLiBDaGlsZHJlbiBhcmUgYWxzbyBjaGFpbmVkIHRvZ2V0aGVyIGluIGEgZG91YmxlLWxpbmtlZCBsaXN0IHdpdGhcbiMge1Rva2VuI3ByZXZTaWJsaW5nfSBhbmQge1Rva2VuI25leHRTaWJsaW5nfS4gQSBzaW5nbGUgZG9jdW1lbnQgdG9rZW4gaXMgdXNlZFxuIyBhcyB0aGUgcGFyZW50IGZvciBhbGwgdG9wIGxldmVsIHRva2VucyB0byBmb3JtIGEgc2luZ2xlLXJvb3Qgc3RydWN0dXJlLlxuI1xuIyAjIyMgT3V0bGluZVxuI1xuIyBIZWFkaW5nIHRva2VucyBhcmUgbGlua2VkIGludG8gYSB0cmVlIHRvIHJlcHJlc2VudCB0aGUgbG9naWMgc3RydWN0dXJlIG9mIGFcbiMgZG9jdW1lbnQuIEVhY2ggaGVhZGluZyBnb3Zlcm5zIGEgc2VjdGlvbiB1bmRlciBpdHNlbGYgYW5kIGhvbGRzIGVsZW1lbnRzIGFzXG4jIHNlY3Rpb24gY29udGVudC4gKE5vdCBpbXBsZW1lbnRlZClcbiNcbiMgQFRPRE8gT3V0bGluZSBwcm9wZXJ0aWVzXG4jXG4jICMjIyBRdWFkdHJlZVxuI1xuIyBUb2tlbnMgYXJlIGFsc28gaW5kZXhlZCBzcGF0aWFsbHkgd2l0aCBxdWFkdHJlZS4gSXQgaXMgdXNlZnVsbHkgZm9yIGVkaXRvclxuIyBkZXZlbG9wZXJzIHRvIGxvb2sgdXAgdG9rZW4gYnkgY3Vyc29yIGxvY2F0aW9ucy5cbiNcbiMgQFRPRE8gUXVhZHRyZWUgaW1wbGVtZW50YXRpb25cbiNcbiMgQFRPRE8gVG9rZW4gTG9jYXRpb25cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFRva2VuXG4gICMgQHByb3BlcnR5IHtUb2tlbn0gVGhlIHByZXZpb3VzIHRva2VuIGluIGRvY3VtZW50XG4gIHByZXY6IG51bGxcblxuICAjIEBwcm9wZXJ0eSB7VG9rZW59IFRoZSBuZXh0IHRva2VuIGluIGRvY3VtZW50XG4gIG5leHQ6IG51bGxcblxuICAjIEBwcm9wZXJ0eSB7VG9rZW59IFRoZSBwYXJlbnQgdG9rZW5cbiAgcGFyZW50OiBudWxsXG5cbiAgIyBAcHJvcGVydHkge0FycmF5PFRva2VuPn0gVGhlIGNoaWxyZW5cbiAgY2hpbGRyZW46IFtdXG5cbiAgIyBAcHJvcGVydHkge1Rva2VufSBUaGUgZmlyc3QgY2hpbGRcbiAgZmlyc3RDaGlsZDogbnVsbFxuXG4gICMgQHByb3BlcnR5IHtUb2tlbn0gVGhlIHByZXZpb3VzIHRva2VuIHVuZGVyIHRoZSBzYW1lIHBhcmVudFxuICBwcmV2U2libGluZzogbnVsbFxuXG4gICMgQHByb3BlcnR5IHtUb2tlbn0gVGhlIG5leHQgdG9rZW4gdW5kZXIgdGhlIHNhbWUgcGFyZW50XG4gIG5leHRTaWJsaW5nOiBudWxsXG5cbiNcbiMgQHRvZG8gQWRkIGRvY3VtZW50YXRpb25cbm1vZHVsZS5leHBvcnRzLkRlZiA9XG5jbGFzcyBUb2tlbkRlZlxuICBAQXR0cmlidXRlOiAnYXR0cmlidXRlJ1xuICBAQ29udGVudDogJ2NvbnRlbnQnXG4gIEBUZXh0OiAndGV4dCdcbiAgQERlbGltaXRlcjogJ2RlbGltaXRlcidcbiAgQE5vdGhpbmc6ICdub3RoaW5nJ1xuICBcbiAgY29uc3RydWN0b3I6IChAdHlwZSwgQGlkLCBAdHJhbnNmb3JtLCBtb2RpZmllcnMpIC0+XG4gICAgaWYgbW9kaWZpZXJzP1xuICAgICAgZm9yIGtleSwgdmFsdWUgb2YgbW9kaWZpZXJzXG4gICAgICAgIEBba2V5XSA9IHZhbHVlXG4iLCJMYW5ndWFnZVBhY2sgPSByZXF1aXJlICcuLi9jb3JlL2xhbmd1YWdlLXBhY2snXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENvcmUgZXh0ZW5kcyBMYW5ndWFnZVBhY2tcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXIgJ2NvcmUnXG5cbiAgICBAZGVjbGFyZUFsaWFzICdeJywgICAgICAvXlxcIHswLCAzfS9cbiAgICBAZGVjbGFyZUFsaWFzICckJywgICAgICAvJC9cbiAgICBAZGVjbGFyZUFsaWFzICcgJywgICAgICAvXFxzKy9cbiAgICBAZGVjbGFyZUFsaWFzICcjJywgICAgICAvI3sxLCA2fS9cbiAgICBAZGVjbGFyZUFsaWFzICctIC0gLScsICAvKFsqKy1dXFxzPyl7Myx9L1xuICAgIEBkZWNsYXJlQWxpYXMgJz09PScsICAgIC9bLT1dezMsfS9cbiAgICBAZGVjbGFyZUFsaWFzICctPicsICAgICAvXihcXHR8XFwgezR9KS9cbiAgICBAZGVjbGFyZUFsaWFzICdgYGAnLCAgICAvW35gXXszLH0vXG5cbiAgICBAZGVjbGFyZURlbGltaXRlclBhaXIgJygnLCAnKSdcbiAgICBAZGVjbGFyZURlbGltaXRlclBhaXIgJ1snLCAnXSdcbiAgICBAZGVjbGFyZURlbGltaXRlclBhaXIgJ3snLCAnfSdcbiAgICBAZGVjbGFyZURlbGltaXRlclBhaXIgJzwnLCAnPidcbiAgICBAZGVjbGFyZURlbGltaXRlclBhaXIgJ2BgYCdcblxuICAgIEBhZGRCbG9ja1J1bGUgJ3J1bGVzJywgWydeJywgJy0gLSAtJywgJyQnXVxuXG4gICAgQGFkZEJsb2NrUnVsZSAnYXR4X2hlYWRlcicsIFsnXicsICcjJywgJyAnLCAvKC4qKVxccyovLCAnJCddLFxuICAgICAgMTogQGVtaXQuYXR0cmlidXRlICdsZXZlbCcsIChoYXNoKSAtPiBoYXNoLmxlbmd0aFxuICAgICAgMzogQGVtaXQuY29udGVudCAgICd0aXRsZSdcblxuICAgIEBhZGRCbG9ja1J1bGUgJ3NldGV4dF9oZWFkZXInLCBbJ14nLCAvKFteXFxzXS4qKVxcbi8sICc9PT0nLCAnJCddLFxuICAgICAgMTogQGVtaXQuY29udGVudCAgICd0aXRsZSdcbiAgICAgIDI6IEBlbWl0LmF0dHJpYnV0ZSAnbGV2ZWwnLCAocikgLT4gaWYgclswXSA9PSAnLScgdGhlbiAxIGVsc2UgMlxuXG4gICAgQGFkZEJsb2NrUnVsZSAnaW5kZW50ZWRfY29kZScsIFsnLT4nLCAvKC4qKS8sICckJ10sXG4gICAgICAxOiBAZW1pdC50ZXh0ICAgICAgJ3NyYydcblxuICAgIEBhZGRCbG9ja1J1bGUgJ2ZlbmNlZF9jb2RlJywgWydeJywgJ2BgYCcsICckJywgLyhbXl0qKS8sICdeJywgJ2BgYCcsICckJ10sXG4gICAgICAzOiBAZW1pdC50ZXh0ICAgICAgJ3NyYydcblxuICAgIEBhZGRCbG9ja1J1bGUgJ2h0bWwnLCBbXVxuXG4gICAgQGFkZEJsb2NrUnVsZSAnbGlua19yZWYnLCBbXVxuXG4gICAgQGFkZEJsb2NrUnVsZSAncGFyYWdyYXBoJywgW11cblxuICAgIEBhZGRCbG9ja1J1bGUgJ2JsYW5rX2xpbmUnLCBbXVxuXG4gICAgIyBUQkQ6IGFnZ3JlZ2F0ZSBgbGlzdF9pdGVtYCBpbnRvIG9uZSBgKl9saXN0YCBlbGVtZW50IGxhdGVyXG4gICAgIyAgICAgIG9yIGVtaXQgZGlyZWN0bHlcbiAgICAjIEBhZGRCbG9ja1J1bGUgJ29yZGVyZWRfbGlzdCdcbiAgICAjXG4gICAgIyBAYWRkQmxvY2tSdWxlICd1bm9yZGVyZWRfbGlzdCdcblxuICAgIEBhZGRCbG9ja1J1bGUgJ2xpc3RfaXRlbScsIFtdXG5cbiAgICBAYWRkSW5saW5lUnVsZSAnYmFja3NsYXNoX2VzY2FwZScsIFtdXG5cbiAgICBAYWRkSW5saW5lUnVsZSAnZW50aXR5JywgW11cblxuICAgIEBhZGRJbmxpbmVSdWxlICdjb2RlX3NwYW4nLCBbXVxuIiwiTGFuZ3VhZ2VQYWNrID0gcmVxdWlyZSAnLi4vY29yZS9sYW5ndWFnZS1wYWNrJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBHRk0gZXh0ZW5kcyBMYW5ndWFnZVBhY2tcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXIgJ2dmbSdcbiIsIkNvbXBpbGVyID0gcmVxdWlyZSAnLi9jb21waWxlcidcblxuQ29yZSA9IHJlcXVpcmUgJy4vbGFuZy9jb3JlJ1xuR0ZNID0gcmVxdWlyZSAnLi9sYW5nL2dmbSdcblxuY29yZSA9IG5ldyBDb3JlKClcbmdmbSA9IG5ldyBHRk0oKVxuXG5Db21waWxlci5EZWZhdWx0ID0gbmV3IENvbXBpbGVyKFtjb3JlLCBnZm1dKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBpbGVyXG4iXX0=
