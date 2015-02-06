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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXG5vZGVfbW9kdWxlc1xcZ3VscC1icm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29tcGlsZXJcXGdlbmVyYXRvci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxpbmRleC5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxwYXJzZXIuY29mZmVlIiwiRjpcXGRldlxcanNcXG1hcmtyaWdodFxcY29mZmVlXFxjb3JlXFxlbWl0dGVyLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29yZVxcbGFuZ3VhZ2UtcGFjay5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvcmVcXHJ1bGUtYnVpbGRlci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvcmVcXHRva2VuLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcbGFuZ1xcY29yZS5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGxhbmdcXGdmbS5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXG1hcmtyaWdodC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFNBQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLEVBQUEsbUJBQUEsR0FBQSxDQUFiOzttQkFBQTs7SUFGRixDQUFBOzs7OztBQ0FBLElBQUEsMkJBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxTQUNBLEdBQVksT0FBQSxDQUFRLGFBQVIsQ0FEWixDQUFBOztBQUFBLE1BR00sQ0FBQyxPQUFQLEdBQ007QUFDUyxFQUFBLGtCQUFBLEdBQUEsQ0FBYjs7QUFBQSxxQkFFQSxPQUFBLEdBQVMsU0FBQyxFQUFELEdBQUE7QUFDUCxXQUFPLEVBQVAsQ0FETztFQUFBLENBRlQsQ0FBQTs7a0JBQUE7O0lBTEYsQ0FBQTs7Ozs7QUNpSUEsSUFBQSxNQUFBOztBQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFUyxFQUFBLGdCQUFBLEdBQUEsQ0FBYjs7QUFBQSxtQkFLQSxLQUFBLEdBQU8sU0FBQyxHQUFELEdBQUE7QUFDTCxRQUFBLEdBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsWUFBRCxDQUFjLEdBQWQsQ0FBTixDQUFBO0FBQUEsSUFDQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLENBRE4sQ0FBQTtBQUdBLFdBQU8sR0FBUCxDQUpLO0VBQUEsQ0FMUCxDQUFBOztBQUFBLG1CQWVBLFlBQUEsR0FBYyxTQUFDLEdBQUQsR0FBQTtBQUNaLFFBQUEsMkdBQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxDQUFULENBQUE7QUFBQSxJQUNBLENBQUEsR0FBSSxHQUFHLENBQUMsTUFEUixDQUFBO0FBQUEsSUFFQSxPQUFBLEdBQVUsRUFGVixDQUFBO0FBQUEsSUFHQSxHQUFBLEdBQU0sRUFITixDQUFBO0FBS0EsV0FBTSxNQUFBLEdBQVMsQ0FBVCxJQUFjLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXJDLEdBQUE7QUFDRSxNQUFBLFVBQUEsR0FBYSxNQUFiLENBQUE7QUFBQSxNQUNBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLGtDQUFELENBQW9DLE1BQXBDLEVBQTRDLEdBQTVDLENBRGpCLENBQUE7QUFBQSxNQUVBLFNBQUEsR0FBWSxjQUFjLENBQUMsVUFGM0IsQ0FBQTtBQUdBLE1BQUEsSUFBRyxzQkFBSDtBQUNFLFFBQUEsY0FBQSxHQUFpQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsVUFBcEIsRUFBZ0MsU0FBaEMsRUFBMkMsR0FBM0MsQ0FBakIsQ0FBQTtBQUFBLFFBQ0EsT0FBMkIsSUFBQyxDQUFBLGtCQUFELENBQW9CLGNBQXBCLEVBQW9DLEdBQXBDLENBQTNCLEVBQUMsY0FBQSxNQUFELEVBQVMsc0JBQUEsY0FEVCxDQURGO09BQUEsTUFBQTtBQUlFLFFBQUEsUUFBMkIsSUFBQyxDQUFBLGtCQUFELENBQW9CLFVBQXBCLEVBQWdDLENBQWhDLEVBQW1DLEdBQW5DLENBQTNCLEVBQUMsZUFBQSxNQUFELEVBQVMsdUJBQUEsY0FBVCxDQUpGO09BSEE7QUFBQSxNQVNBLEdBQUcsQ0FBQyxJQUFKLENBQVMsY0FBVCxDQVRBLENBQUE7QUFBQSxNQVVBLEdBQUcsQ0FBQyxJQUFKLENBQVMsY0FBVCxDQVZBLENBREY7SUFBQSxDQUxBO0FBa0JBLFdBQU8sR0FBUCxDQW5CWTtFQUFBLENBZmQsQ0FBQTs7QUFBQSxtQkEwQ0EsaUNBQUEsR0FBbUMsU0FBQyxNQUFELEVBQVMsR0FBVCxHQUFBLENBMUNuQyxDQUFBOztBQUFBLG1CQWtEQSxrQkFBQSxHQUFvQixTQUFDLEtBQUQsRUFBUSxHQUFSLEVBQWEsR0FBYixHQUFBO0FBQ2xCLFFBQUEsc0NBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsS0FBbEIsRUFBeUIsR0FBekIsRUFBOEIsR0FBOUIsQ0FBUixDQUFBO0FBQUEsSUFDQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixLQUFwQixFQUEyQixLQUFLLENBQUMsVUFBTixHQUFtQixDQUE5QyxFQUFpRCxHQUFqRCxDQURsQixDQUFBO0FBQUEsSUFFQSxjQUFBLEdBQWtCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixLQUFLLENBQUMsU0FBMUIsRUFBcUMsR0FBckMsRUFBMEMsR0FBMUMsQ0FGbEIsQ0FBQTtBQUlBLFdBQU8sRUFBRSxDQUFDLE1BQUgsQ0FBVSxlQUFWLEVBQTJCLEtBQTNCLEVBQWtDLGNBQWxDLENBQVAsQ0FMa0I7RUFBQSxDQWxEcEIsQ0FBQTs7QUFBQSxtQkE4REEsa0JBQUEsR0FBb0IsU0FBQyxXQUFELEVBQWMsR0FBZCxHQUFBLENBOURwQixDQUFBOztBQUFBLG1CQXVFQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7V0FBRyxTQUFDLEtBQUQsRUFBUSxHQUFSLEVBQWEsR0FBYixHQUFBLEVBQUg7RUFBQSxDQXZFbEIsQ0FBQTs7QUFBQSxtQkE4RUEsWUFBQSxHQUFjLFNBQUMsR0FBRCxHQUFBLENBOUVkLENBQUE7O2dCQUFBOztJQUhGLENBQUE7Ozs7O0FDaklBLElBQUEsNkJBQUE7RUFBQTtpU0FBQTs7QUFBQSxNQUFRLE9BQUEsQ0FBUSxTQUFSLEVBQVAsR0FBRCxDQUFBOztBQUVBO0FBQUE7Ozs7OztHQUZBOztBQUFBLE1BU00sQ0FBQyxPQUFQLEdBQ007QUFDUyxFQUFBLGlCQUFFLFNBQUYsR0FBQTtBQUNYLElBRFksSUFBQyxDQUFBLGdDQUFBLFlBQVksRUFDekIsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxlQUFBLENBQUEsQ0FBaEIsQ0FEVztFQUFBLENBQWI7O0FBQUEsb0JBSUEsU0FBQSxHQUFXLFNBQUMsRUFBRCxFQUFLLFNBQUwsR0FBQTtXQUNMLElBQUEsR0FBQSxDQUFJLEdBQUcsQ0FBQyxTQUFSLEVBQW1CLEVBQW5CLEVBQXVCLFNBQXZCLEVBQWtDLElBQUMsQ0FBQSxTQUFuQyxFQURLO0VBQUEsQ0FKWCxDQUFBOztBQUFBLG9CQVFBLE9BQUEsR0FBUyxTQUFDLEVBQUQsRUFBSyxTQUFMLEdBQUE7V0FDSCxJQUFBLEdBQUEsQ0FBSSxHQUFHLENBQUMsT0FBUixFQUFpQixFQUFqQixFQUFxQixTQUFyQixFQUFnQyxJQUFDLENBQUEsU0FBakMsRUFERztFQUFBLENBUlQsQ0FBQTs7QUFBQSxvQkFZQSxJQUFBLEdBQU0sU0FBQyxFQUFELEVBQUssU0FBTCxHQUFBO1dBQ0EsSUFBQSxHQUFBLENBQUksR0FBRyxDQUFDLElBQVIsRUFBYyxFQUFkLEVBQWtCLFNBQWxCLEVBQTZCLElBQUMsQ0FBQSxTQUE5QixFQURBO0VBQUEsQ0FaTixDQUFBOztBQUFBLG9CQWdCQSxTQUFBLEdBQVcsU0FBQyxFQUFELEVBQUssU0FBTCxHQUFBO1dBQ0wsSUFBQSxHQUFBLENBQUksR0FBRyxDQUFDLFNBQVIsRUFBbUIsRUFBbkIsRUFBdUIsU0FBdkIsRUFBa0MsSUFBQyxDQUFBLFNBQW5DLEVBREs7RUFBQSxDQWhCWCxDQUFBOztBQUFBLG9CQW1CQSxPQUFBLEdBQVMsU0FBQSxHQUFBO1dBQ0gsSUFBQSxHQUFBLENBQUksR0FBRyxDQUFDLE9BQVIsRUFBaUIsSUFBakIsRUFBdUIsSUFBdkIsRUFBNkIsSUFBQyxDQUFBLFNBQTlCLEVBREc7RUFBQSxDQW5CVCxDQUFBOztpQkFBQTs7SUFYRixDQUFBOztBQUFBO0FBa0NFLG9DQUFBLENBQUE7O0FBQWEsRUFBQSx5QkFBQSxHQUFBO0FBQ1gsSUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhO0FBQUEsTUFBQSxRQUFBLEVBQVUsSUFBVjtLQUFiLENBRFc7RUFBQSxDQUFiOzt5QkFBQTs7R0FENEIsUUFqQzlCLENBQUE7Ozs7O0FDQUEsSUFBQSxrQ0FBQTs7QUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBQWQsQ0FBQTs7QUFBQSxPQUNBLEdBQVUsT0FBQSxDQUFRLFdBQVIsQ0FEVixDQUFBOztBQUdBO0FBQUE7O0dBSEE7O0FBQUEsTUFNTSxDQUFDLE9BQVAsR0FDTTtBQUVKLHlCQUFBLElBQUEsR0FBVSxJQUFBLE9BQUEsQ0FBQSxDQUFWLENBQUE7O0FBRWEsRUFBQSxzQkFBRSxFQUFGLEdBQUE7QUFDWCxJQURZLElBQUMsQ0FBQSxLQUFBLEVBQ2IsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLFFBQUQsR0FBZ0IsSUFBQSxXQUFBLENBQUEsQ0FBaEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQURkLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFGZixDQURXO0VBQUEsQ0FGYjs7QUFBQSx5QkFPQSxZQUFBLEdBQWMsU0FBQyxLQUFELEVBQVEsS0FBUixHQUFBO1dBQ1osSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLEtBQXZCLEVBQThCLEtBQTlCLEVBRFk7RUFBQSxDQVBkLENBQUE7O0FBQUEseUJBVUEsb0JBQUEsR0FBc0IsU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBLENBVnRCLENBQUE7O0FBQUEseUJBYUEsWUFBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxPQUFiLEdBQUE7QUFDWixRQUFBLFVBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxJQUFmLEVBQXFCLE9BQXJCLENBQWIsQ0FBQTtBQUFBLElBQ0EsVUFBVSxDQUFDLElBQVgsR0FBa0IsSUFEbEIsQ0FBQTtXQUVBLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixVQUFqQixFQUhZO0VBQUEsQ0FiZCxDQUFBOztBQUFBLHlCQWtCQSxhQUFBLEdBQWUsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE9BQWIsR0FBQTtBQUNiLFFBQUEsVUFBQTtBQUFBLElBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLElBQWYsRUFBcUIsT0FBckIsQ0FBYixDQUFBO0FBQUEsSUFDQSxVQUFVLENBQUMsSUFBWCxHQUFrQixJQURsQixDQUFBO1dBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLFVBQWxCLEVBSGE7RUFBQSxDQWxCZixDQUFBOztzQkFBQTs7SUFURixDQUFBOzs7OztBQ0FBLElBQUEsZ0JBQUE7O0FBQUEsTUFBUSxPQUFBLENBQVEsU0FBUixFQUFQLEdBQUQsQ0FBQTs7QUFBQSxNQWFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsRUFBQSxxQkFBQSxHQUFBO0FBQ1gsSUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLEVBQWIsQ0FEVztFQUFBLENBQWI7O0FBQUEsd0JBR0EsWUFBQSxHQUFjLFNBQUMsS0FBRCxFQUFRLEtBQVIsR0FBQTtXQUVaLElBQUMsQ0FBQSxTQUFVLENBQUEsS0FBQSxDQUFYLEdBQW9CLE1BRlI7RUFBQSxDQUhkLENBQUE7O0FBQUEsd0JBa0JBLGFBQUEsR0FBZSxTQUFDLENBQUQsR0FBQTtBQUNiLFFBQUEsQ0FBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLE1BQUEsQ0FBQSxDQUFKLENBQUE7QUFDQSxJQUFBLElBQUcsQ0FBQSxLQUFLLFFBQVI7QUFDRSxNQUFBLElBQUcsQ0FBQSxJQUFLLElBQUMsQ0FBQSxTQUFUO0FBQ0UsZUFBTyxJQUFDLENBQUEsU0FBVSxDQUFBLENBQUEsQ0FBbEIsQ0FERjtPQUFBO0FBR0EsYUFBTyxDQUFQLENBSkY7S0FBQSxNQUtLLElBQUcsQ0FBQSxLQUFLLFFBQUwsSUFBa0IsQ0FBQSxZQUFhLE1BQWxDO0FBQ0gsYUFBTyxDQUFDLENBQUMsTUFBVCxDQURHO0tBTkw7QUFRQSxVQUFVLElBQUEsU0FBQSxDQUFVLEVBQUEsR0FBRyxDQUFILEdBQUssOENBQWYsQ0FBVixDQVRhO0VBQUEsQ0FsQmYsQ0FBQTs7QUFBQSx3QkE2QkEsaUJBQUEsR0FBbUIsU0FBQyxVQUFELEdBQUE7QUFDakIsV0FBTyxTQUFDLElBQUQsRUFBTyxPQUFQLEdBQUE7QUFDTCxVQUFBLHFDQUFBO0FBQUE7V0FBQSxpREFBQTsyQkFBQTtBQUNFLFFBQUEsT0FBQSxHQUFVLEtBQUEsR0FBUSxPQUFRLENBQUEsQ0FBQyxDQUFDLFdBQUYsQ0FBMUIsQ0FBQTtBQUNBLFFBQUEsSUFBRyxtQkFBSDtBQUNFLFVBQUEsT0FBQSxHQUFVLENBQUMsQ0FBQyxTQUFGLENBQVksT0FBWixDQUFWLENBREY7U0FEQTtBQUFBLHNCQUlBLElBQUssQ0FBQSxDQUFDLENBQUMsRUFBRixDQUFMLEdBQWEsUUFKYixDQURGO0FBQUE7c0JBREs7SUFBQSxDQUFQLENBRGlCO0VBQUEsQ0E3Qm5CLENBQUE7O0FBQUEsd0JBMENBLElBQUEsR0FBTSxTQUFDLElBQUQsRUFBTyxXQUFQLEdBQUE7QUFDSixRQUFBLDRLQUFBO0FBQUEsSUFBQSxTQUFBLEdBQVksRUFBWixDQUFBO0FBQUEsSUFDQSxXQUFBLEdBQWMsQ0FEZCxDQUFBO0FBQUEsSUFFQSxVQUFBLEdBQWEsRUFGYixDQUFBO0FBQUEsSUFHQSxpQkFBQSxHQUFvQixLQUhwQixDQUFBO0FBQUEsSUFJQSxzQkFBQSxHQUF5QixFQUp6QixDQUFBO0FBTUEsU0FBQSxtREFBQTtrQkFBQTtBQUNFLE1BQUEsU0FBQSx5QkFBWSxXQUFhLENBQUEsQ0FBQSxHQUFJLENBQUosVUFBekIsQ0FBQTtBQUFBLE1BRUEsYUFBQSxHQUFnQixpQkFGaEIsQ0FBQTtBQUFBLE1BSUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixDQUpQLENBQUE7QUFLQSxNQUFBLElBQUcsYUFBSDtBQUNFLFFBQUEsWUFBQSxHQUFlLGlCQUFBLElBQTBCLDRCQUF6QyxDQUFBO0FBQUEsUUFDQSxpQkFBQSxHQUFvQiw4Q0FBc0IsS0FBdEIsQ0FBQSxLQUFnQyxpQkFEcEQsQ0FBQTtBQUVBLFFBQUEsSUFBRyxZQUFBLElBQWdCLGlCQUFuQjtBQUNFLFVBQUEsSUFBRyxDQUFBLGlCQUFIO0FBRUUsWUFBQSxXQUFBLEVBQUEsQ0FBQTtBQUFBLFlBQ0EsaUJBQUEsR0FBb0IsSUFEcEIsQ0FGRjtXQUFBLE1BQUE7QUFNRSxZQUFBLGlCQUFBLEdBQW9CLEtBQXBCLENBQUE7QUFBQSxZQUNBLFNBQUEsSUFBYyxHQUFBLEdBQUcsc0JBQUgsR0FBMEIsSUFEeEMsQ0FBQTtBQUFBLFlBRUEsc0JBQUEsR0FBeUIsRUFGekIsQ0FORjtXQURGO1NBRkE7QUFZQSxRQUFBLElBQUcsU0FBUyxDQUFDLElBQVYsS0FBa0IsR0FBRyxDQUFDLE9BQXpCO0FBQ0UsVUFBQSxXQUFBLEVBQUEsQ0FBQTtBQUFBLFVBQ0EsSUFBQSxHQUFRLEdBQUEsR0FBRyxJQUFILEdBQVEsR0FEaEIsQ0FBQTtBQUFBLFVBRUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBaEIsQ0FGQSxDQUFBO0FBQUEsVUFHQSxTQUFTLENBQUMsV0FBVixHQUF3QixXQUh4QixDQURGO1NBYkY7T0FBQSxNQWtCSyxJQUFHLGlCQUFIO0FBRUgsUUFBQSxpQkFBQSxHQUFvQixLQUFwQixDQUFBO0FBQUEsUUFDQSxTQUFBLElBQWMsR0FBQSxHQUFHLHNCQUFILEdBQTBCLElBRHhDLENBQUE7QUFBQSxRQUVBLHNCQUFBLEdBQXlCLEVBRnpCLENBRkc7T0F2Qkw7QUE0QkEsTUFBQSxJQUFHLGlCQUFIO0FBQ0UsUUFBQSxzQkFBQSxJQUEwQixJQUExQixDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsU0FBQSxJQUFhLElBQWIsQ0FIRjtPQTdCRjtBQUFBLEtBTkE7QUFBQSxJQXdDQSxNQUFBLEdBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBVyxJQUFBLE1BQUEsQ0FBTyxTQUFQLENBQVg7QUFBQSxNQUNBLE9BQUEsRUFBUyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsVUFBbkIsQ0FEVDtLQXpDRixDQUFBO0FBMkNBLFdBQU8sTUFBUCxDQTVDSTtFQUFBLENBMUNOLENBQUE7O3FCQUFBOztJQWZGLENBQUE7Ozs7O0FDZ0RBLElBQUEsZUFBQTs7QUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO3FCQUVKOztBQUFBLGtCQUFBLElBQUEsR0FBTSxJQUFOLENBQUE7O0FBQUEsa0JBR0EsSUFBQSxHQUFNLElBSE4sQ0FBQTs7QUFBQSxrQkFNQSxNQUFBLEdBQVEsSUFOUixDQUFBOztBQUFBLGtCQVNBLFFBQUEsR0FBVSxFQVRWLENBQUE7O0FBQUEsa0JBWUEsVUFBQSxHQUFZLElBWlosQ0FBQTs7QUFBQSxrQkFlQSxXQUFBLEdBQWEsSUFmYixDQUFBOztBQUFBLGtCQWtCQSxXQUFBLEdBQWEsSUFsQmIsQ0FBQTs7ZUFBQTs7SUFIRixDQUFBOztBQUFBLE1BeUJNLENBQUMsT0FBTyxDQUFDLEdBQWYsR0FDTTtBQUNKLEVBQUEsUUFBQyxDQUFBLFNBQUQsR0FBWSxXQUFaLENBQUE7O0FBQUEsRUFDQSxRQUFDLENBQUEsT0FBRCxHQUFVLFNBRFYsQ0FBQTs7QUFBQSxFQUVBLFFBQUMsQ0FBQSxJQUFELEdBQU8sTUFGUCxDQUFBOztBQUFBLEVBR0EsUUFBQyxDQUFBLFNBQUQsR0FBWSxXQUhaLENBQUE7O0FBQUEsRUFJQSxRQUFDLENBQUEsT0FBRCxHQUFVLFNBSlYsQ0FBQTs7QUFNYSxFQUFBLGtCQUFFLElBQUYsRUFBUyxFQUFULEVBQWMsU0FBZCxFQUF5QixTQUF6QixHQUFBO0FBQ1gsUUFBQSxVQUFBO0FBQUEsSUFEWSxJQUFDLENBQUEsT0FBQSxJQUNiLENBQUE7QUFBQSxJQURtQixJQUFDLENBQUEsS0FBQSxFQUNwQixDQUFBO0FBQUEsSUFEd0IsSUFBQyxDQUFBLFlBQUEsU0FDekIsQ0FBQTtBQUFBLElBQUEsSUFBRyxpQkFBSDtBQUNFLFdBQUEsZ0JBQUE7K0JBQUE7QUFDRSxRQUFBLElBQUUsQ0FBQSxHQUFBLENBQUYsR0FBUyxLQUFULENBREY7QUFBQSxPQURGO0tBRFc7RUFBQSxDQU5iOztrQkFBQTs7SUEzQkYsQ0FBQTs7Ozs7QUNoREEsSUFBQSxrQkFBQTtFQUFBO2lTQUFBOztBQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsdUJBQVIsQ0FBZixDQUFBOztBQUFBLE1BRU0sQ0FBQyxPQUFQLEdBQ007QUFDSix5QkFBQSxDQUFBOztBQUFhLEVBQUEsY0FBQSxHQUFBO0FBQ1gsSUFBQSxzQ0FBTSxNQUFOLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLEVBQXdCLFdBQXhCLENBRkEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLEVBQXdCLEdBQXhCLENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLEVBQXdCLEtBQXhCLENBSkEsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLEVBQXdCLFNBQXhCLENBTEEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxPQUFkLEVBQXdCLGdCQUF4QixDQU5BLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxZQUFELENBQWMsS0FBZCxFQUF3QixVQUF4QixDQVBBLENBQUE7QUFBQSxJQVFBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBZCxFQUF3QixhQUF4QixDQVJBLENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxZQUFELENBQWMsS0FBZCxFQUF3QixVQUF4QixDQVRBLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixHQUF0QixFQUEyQixHQUEzQixDQVhBLENBQUE7QUFBQSxJQVlBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixHQUF0QixFQUEyQixHQUEzQixDQVpBLENBQUE7QUFBQSxJQWFBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixHQUF0QixFQUEyQixHQUEzQixDQWJBLENBQUE7QUFBQSxJQWNBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixHQUF0QixFQUEyQixHQUEzQixDQWRBLENBQUE7QUFBQSxJQWVBLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixLQUF0QixDQWZBLENBQUE7QUFBQSxJQWlCQSxJQUFDLENBQUEsWUFBRCxDQUFjLE9BQWQsRUFBdUIsQ0FBQyxHQUFELEVBQU0sT0FBTixFQUFlLEdBQWYsQ0FBdkIsQ0FqQkEsQ0FBQTtBQUFBLElBbUJBLElBQUMsQ0FBQSxZQUFELENBQWMsWUFBZCxFQUE0QixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixTQUFoQixFQUEyQixHQUEzQixDQUE1QixFQUNFO0FBQUEsTUFBQSxDQUFBLEVBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLENBQWdCLE9BQWhCLEVBQXlCLFNBQUMsSUFBRCxHQUFBO2VBQVUsSUFBSSxDQUFDLE9BQWY7TUFBQSxDQUF6QixDQUFIO0FBQUEsTUFDQSxDQUFBLEVBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQWdCLE9BQWhCLENBREg7S0FERixDQW5CQSxDQUFBO0FBQUEsSUF1QkEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxlQUFkLEVBQStCLENBQUMsR0FBRCxFQUFNLGFBQU4sRUFBcUIsS0FBckIsRUFBNEIsR0FBNUIsQ0FBL0IsRUFDRTtBQUFBLE1BQUEsQ0FBQSxFQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFnQixPQUFoQixDQUFIO0FBQUEsTUFDQSxDQUFBLEVBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLENBQWdCLE9BQWhCLEVBQXlCLFNBQUMsQ0FBRCxHQUFBO0FBQU8sUUFBQSxJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUYsS0FBUSxHQUFYO2lCQUFvQixFQUFwQjtTQUFBLE1BQUE7aUJBQTJCLEVBQTNCO1NBQVA7TUFBQSxDQUF6QixDQURIO0tBREYsQ0F2QkEsQ0FBQTtBQUFBLElBMkJBLElBQUMsQ0FBQSxZQUFELENBQWMsZUFBZCxFQUErQixDQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsR0FBZixDQUEvQixFQUNFO0FBQUEsTUFBQSxDQUFBLEVBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQWdCLEtBQWhCLENBQUg7S0FERixDQTNCQSxDQUFBO0FBQUEsSUE4QkEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxhQUFkLEVBQTZCLENBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxHQUFiLEVBQWtCLFFBQWxCLEVBQTRCLEdBQTVCLEVBQWlDLEtBQWpDLEVBQXdDLEdBQXhDLENBQTdCLEVBQ0U7QUFBQSxNQUFBLENBQUEsRUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBZ0IsS0FBaEIsQ0FBSDtLQURGLENBOUJBLENBQUE7QUFBQSxJQWlDQSxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFBc0IsRUFBdEIsQ0FqQ0EsQ0FBQTtBQUFBLElBbUNBLElBQUMsQ0FBQSxZQUFELENBQWMsVUFBZCxFQUEwQixFQUExQixDQW5DQSxDQUFBO0FBQUEsSUFxQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxXQUFkLEVBQTJCLEVBQTNCLENBckNBLENBQUE7QUFBQSxJQXVDQSxJQUFDLENBQUEsWUFBRCxDQUFjLFlBQWQsRUFBNEIsRUFBNUIsQ0F2Q0EsQ0FBQTtBQUFBLElBK0NBLElBQUMsQ0FBQSxZQUFELENBQWMsV0FBZCxFQUEyQixFQUEzQixDQS9DQSxDQUFBO0FBQUEsSUFpREEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxrQkFBZixFQUFtQyxFQUFuQyxDQWpEQSxDQUFBO0FBQUEsSUFtREEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxRQUFmLEVBQXlCLEVBQXpCLENBbkRBLENBQUE7QUFBQSxJQXFEQSxJQUFDLENBQUEsYUFBRCxDQUFlLFdBQWYsRUFBNEIsRUFBNUIsQ0FyREEsQ0FEVztFQUFBLENBQWI7O2NBQUE7O0dBRGlCLGFBSG5CLENBQUE7Ozs7O0FDQUEsSUFBQSxpQkFBQTtFQUFBO2lTQUFBOztBQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsdUJBQVIsQ0FBZixDQUFBOztBQUFBLE1BRU0sQ0FBQyxPQUFQLEdBQ007QUFDSix3QkFBQSxDQUFBOztBQUFhLEVBQUEsYUFBQSxHQUFBO0FBQ1gsSUFBQSxxQ0FBTSxLQUFOLENBQUEsQ0FEVztFQUFBLENBQWI7O2FBQUE7O0dBRGdCLGFBSGxCLENBQUE7Ozs7O0FDQUEsSUFBQSw4QkFBQTs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FBWCxDQUFBOztBQUFBLElBRUEsR0FBTyxPQUFBLENBQVEsYUFBUixDQUZQLENBQUE7O0FBQUEsR0FHQSxHQUFNLE9BQUEsQ0FBUSxZQUFSLENBSE4sQ0FBQTs7QUFBQSxJQUtBLEdBQVcsSUFBQSxJQUFBLENBQUEsQ0FMWCxDQUFBOztBQUFBLEdBTUEsR0FBVSxJQUFBLEdBQUEsQ0FBQSxDQU5WLENBQUE7O0FBQUEsUUFRUSxDQUFDLE9BQVQsR0FBdUIsSUFBQSxRQUFBLENBQVMsQ0FBQyxJQUFELEVBQU8sR0FBUCxDQUFULENBUnZCLENBQUE7O0FBQUEsTUFVTSxDQUFDLE9BQVAsR0FBaUIsUUFWakIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBHZW5lcmF0b3JcbiAgY29uc3RydWN0b3I6IC0+XG4iLCJQYXJzZXIgPSByZXF1aXJlICcuL3BhcnNlcidcbkdlbmVyYXRvciA9IHJlcXVpcmUgJy4vZ2VuZXJhdG9yJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDb21waWxlclxuICBjb25zdHJ1Y3RvcjogLT5cblxuICBjb21waWxlOiAobWQpIC0+XG4gICAgcmV0dXJuIG1kXG4iLCIjIFRoZSBwYXJzZXIgcHJvY2Vzc2VzIGlucHV0IE1hcmtkb3duIHNvdXJjZSBhbmQgZ2VuZXJhdGVzIEFTVFxuIyAoYWJhc3RyYWN0IHN5bnRheCB0cmVlKSBmb3IgdGhlIGdlbmVyYXRvciB0byBjb25zdW1lLlxuI1xuIyAjIyBUZXJtaW5vbG9neVxuI1xuIyAqICoqRG9jdW1lbnRzKiogYXJlIHRvcCBsZXZlbCByZXByZXNlbnRhdGlvbnMgb2YgcGFyc2VkIE1hcmtkb3duIGZpbGVzLlxuIyAqICoqU29saWQgYmxvY2tzKiogYXJlIGNvbnRpbnVvdXMgZG9jdW1lbnQgcGFydHMgY29uc2lzdCBvZiBvbmx5IGxlYWYgYmxvY2tzLlxuIyAqICoqRmx1aWQgYmxvY2tzKiogYXJlIGNvbnRpbnVvdXMgZG9jdW1lbnQgcGFydHMgdGhhdCBjb250YWlucyBjb250ZW50cyBvZlxuIyAgIGNvbnRhaW5lciBibG9ja3Mgd2l0aCBjbG9zaW5nIGVsZW1lbnRzIHlldCB0byBiZSBkZXRlcm1pbmVkLlxuI1xuIyBTZWUge0xhbmd1YWdlUGFja30gZm9yIGxhbmd1YWdlIHNwZWMgcmVsYXRlZCB0ZXJtaW5vbG9neS5cbiNcbiMgIyMgUGFyc2luZyBTdHJhdGVneVxuI1xuIyBUaGUgcGFyc2VyIGFwcGxpZXMgcnVsZXMgaW4gYSBkZXRlcm1pbmVkIG9yZGVyIChhLmsuYS4gcHJlY2VkZW5jZSkgdG8gYXZvaWRcbiMgYW55IGFtYmlndWl0eS4gVGhlIGVsZW1lbnRzIHRha2UgdGhlaXIgcHJlY2VkZW5jZSBpbiBmb2xsb3dpbmcgb3JkZXI6XG4jXG4jIDEuIENvbnRhaW5lciBibG9ja3NcbiMgMi4gTGVhZiBibG9ja3NcbiMgMy4gSW5saW5lIGVsZW1lbnRzXG4jXG4jIFRoZSBwYXJzZXIgcHJvY2Vzc2VzIGEgZG9jdW1lbnQgaW4gMiBwYXNzZXM6XG4jXG4jIDEuIERldGVybWluZSBibG9jayBzdHJ1Y3R1cmVzIGFuZCBhc3NpZ24gdW4tcGFyc2VkIHNvdXJjZSB0byBlYWNoIGJsb2NrIHRva2Vuc1xuIyAyLiBQYXJzZSBpbmxpbmUgdG9rZW5zIG9mIGVhY2ggYmxvY2tzXG4jXG4jICMjIyBCbG9jayBQYXJzaW5nXG4jXG4jIEJsb2NrIHBhcnNpbmcgaXMgaW1wbGVtZW50ZWQgaW4ge1BhcnNlciNfcGFyc2VCbG9ja3N9LlxuIyBVbmxpa2Ugb3RoZXIgTWFya2Rvd24gcGFyc2VyIGltcGxlbWVudGF0aW9ucywgTWFya1JpZ2h0IHBhcnNlciBkb2VzXG4jIG5vdCByZXF1aXJlIG1hdGNoZWQgcnVsZXMgdG8gYmUgYW5jaG9yZWQgYXQgdGhlIGJlZ2luaW5nIG9mIHRoZSBzdHJlYW0uXG4jIEluc3RlYWQsIHtQYXJzZXIjX19fcGFyc2VPbmVCbG9ja30gYXBwbGllcyBydWxlcyBmcm9tIGhpZ2hlc3QgcHJlY2VkZW5jZSB0b1xuIyBsb3dlc3QgYW5kIHJldHVybnMgdGhlIGZpcnN0IG1hdGNoIG5vIG1hdHRlciB3aGVyZSB0aGUgbWF0Y2gncyBsb2NhdGlvbiBpcy5cbiNcbiMgSXQgaXMgZXhwZWNlZCB0aGF0IHRoZSBmaXJzdCBtYXRjaCB1c3VhbGx5IG9jY3VycyBpbiB0aGUgbWlkZGxlIHRodXMgc3BsaXRpbmdcbiMgdGhlIHN0cmVhbSBpbnRvIHRocmVlIHBhcnRzOlxuI1xuIyBgYGBcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgRG9jdW1lbnQgQmVnaW5cbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgUGFyc2VkICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgT2Zmc2V0XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgUmVzaWR1YWwgQmVmb3JlICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgRmlyc3QgTWF0Y2ggICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgUmVzaWR1YWwgQWZ0ZXIgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIERvY3VtZW50IEVuZFxuIyBgYGBcbiNcbiMgSWYgdGhlIGBGaXJzdCBNYXRjaGAgaXMgYSBsZWFmIGJsb2NrLCB0aGUgcGFyc2VyIGNhbiBzYWZlbHkgYXNzdW1lIHRoYXQgdGhlXG4jIGVudGlyZSBzdHJlYW0gaXMgb25lIHNvbGlkIGJsb2NrLiBIZW5jZSBib3RoIHJlc2lkdWFsIGJsb2NrcyBhcmUgc29saWQgdG9vLlxuIyBUaHVzIHRoZSBwYXJzaW5nIGNhbiBiZSBhY2hpdmVkIGJ5IHJlY3VzaXZlbHkgcGFyc2UgYW5kIHNwbGl0IHRoZSBzdHJlYW0gaW50b1xuIyBzbWFsbGVyIGFuZCBzbWFsbGVyIGJsb2NrcyB1bnRpbCB0aGUgZW50aXJlIHN0cmVhbSBpcyBwYXJzZWQuXG4jIFRoaXMgaXMgZG9uZSBieSB7UGFyc2VyI19fcGFyc2VTb2xpZEJsb2Nrc30uXG4jXG4jIElmIHRoZSBgRmlyc3QgTWF0Y2hgIGlzIGEgY29udGFpbmVyIGJsb2NrIHN0YXJ0IHRva2VuLCB0aGUgYFJlc2lkdWFsIEJlZm9yZWBcbiMgaXMga25vd24gdG8gYmUgYSBzb2xpZCBibG9jayBhbmQgY2FuIGJlIHBhcnNlZCB3aXRoXG4jIHtQYXJzZXIjX19wYXJzZVNvbGlkQmxvY2tzfS5cbiMgVGhlIGBSZXNpZHVhbCBBZnRlcmAgd291bGQgYmUgYSBmbHVpZCBibG9jazpcbiNcbiMgYGBgXG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgRmlyc3QgTWF0Y2ggICAgICAgICB8IDwtLS0rIENvbnRhaW5lciBibG9jayBzdGFydCB0b2tlblxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAoZS5nLiAnPiAnIGZvciBhIGJsb2NrcXVvdGUpXG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jIFggICAgICAgQ29udGVudCBvZiAgICAgICAgICBYIDwtLS0rIFJlc2lkdWFsIEFmdGVyIChGbHVpZCBCbG9jaylcbiMgWCAgICAgICBDb250YWluZXIgQmxvY2sgICAgIFhcbiMgWCAgICAgICAgICAgICAgICAgICAgICAgICAgIFhcbiMgWC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVggLS0tLT4gTmV3IG9mZnNldCBmb3IgbmV4dCBpdGVyYXRpb25cbiMgWCAgICAgICAgICAgICAgICAgICAgICAgICAgIFhcbiMgWCAgICAgICBVbi1wYXJzZWQgICAgICAgICAgIFhcbiMgWCAgICAgICAgICAgICAgICAgICAgICAgICAgIFhcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgRG9jdW1lbnQgRW5kXG4jIGBgYFxuI1xuIyBBIGZsdWlkIGJsb2NrIGlzIHBhcnNlZCBieSB7UGFyc2VyI19fcGFyc2VGbHVpZEJsb2Nrc30uIEl0IHBhcnNlcyB0aGUgZmx1aWRcbiMgYmxvY2sgbGluZWFybHkgYW5kIGxvb2tzIGZvciBsaW5lcyBzdGFydCB3aXRoIGNvbnRlbnQgYmxvY2sgZGVsaW1pdGVyIChlLmcuXG4jICc+ICcgZm9yIGJsb2NrcXVvdGVzIG9yIGNvcnJlY3QgbGV2ZWwgb2YgaW5kZW50YXRpb24gZm9yIGxpc3QgaXRlbXMpLlxuIyBEZWxpbWl0ZXJzIGFyZSBzdHJpcHBlZCBiZWZvcmUgdGhlIGNvbnRlbnRzIGFyZSBhZ2dyZWdhdGVkIGludG8gb25lIG5ldyBibG9ja1xuIyBmb3IgbGF0ZXIgcGFyc2luZy4gQSBuZXcgbGluZSB3aXRob3V0IGEgY29udGFpbmVyIGJsb2NrIGRlbGltaXRlciBjYW4gZWl0aGVyXG4jIGJlIHRoZSBlbmQgb2YgY3VycmVudCBjb250YWluZXIgYmxvY2sgb3Igc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBjb250YWluZXJcbiMgYWNjcm9kaW5nIHRvICdsYXppbmVzcycgcnVsZS4gVGhlIHBhcnNpbmcgaXMgbm90IGNvbXBsZXRlIHVudGlsIGVpdGhlciB0aGUgZW5kXG4jIG9mIGNvbnRhaW5lciBibG9jayBvciB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudCBpcyBlbmNvdW50ZXJlZC5cbiNcbiMgYGBgXG4jICstLS0rLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiMgfCAgIHwgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICogfCBDb250ZW50ICAgICAgICAgICAgICB8XG4jIHwgICB8ICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLSstLS0tLS0tLS0tLS0tLS0tLS0tLS0tKyA8LS0rIFBvc3NpYmxlIGVuZCBvZiBjb250ZW50IGJsb2NrXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgTmV4dCBlbGVtZW50IHdpdGhvdXQgfFxuIyB8ICAgICBkZWxpbWl0ZXIgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgIFVuLXBhcnNlZCAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jXG4jICogQ29udGFpbmVyIGJsb2NrIGRlbGltaXRlclxuIyBgYGBcbiNcbiMgQWZ0ZXIgZWFjaCBpdGVyYXRpb24sIHRoZSBgb2Zmc2V0YCBpcyBhZHZhbmNlZCBhbmQgdGhlIHdob2xlIHByb2Nlc3Mgc3RhcnRzXG4jIGFnYWluIHVudGlsIHRoZSBlbmQgb2YgdGhlIGRvY3VtZW50LlxuI1xuIyAjIyMgSW5saW5lIEVsZW1lbnQgUGFyc2luZ1xuI1xuIyBJbmxpbmUgZWxlbWVudCBwYXJzaW5nICh7UGFyc2VyI19wYXJzZUlubGluZX0pIGlzIHRyaXZhbC5cbiMgVGhlIHN0YXRlZ3kgaXMgZXhhY3RseSB0aGUgc2FtZSBhcyBzb2xpZCBibG9jayBwYXJzaW5nLlxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUGFyc2VyXG4gICMgQ3JlYXRlIGEge1BhcnNlcn0gaW5zdGFuY2VcbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgIyBQYXJzZSBNYXJrZG93biBzb3VyY2UgaW50byBBU1RcbiAgIyBAcGFyYW0ge3N0cmluZ30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4ge0FycmF5fSBBU1RcbiAgcGFyc2U6IChzcmMpIC0+XG4gICAgYXN0ID0gQF9wYXJzZUJsb2NrcyhzcmMpXG4gICAgYXN0ID0gQF9wYXJzZUlubGluZShhc3QpXG5cbiAgICByZXR1cm4gYXN0XG5cbiAgIyBAcHJpdmF0ZVxuICAjIFBhcnNlIGJsb2NrIHN0cnVjdHVyZXNcbiAgIyBAcGFyYW0ge3N0cmluZ30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4ge0FycmF5fSBBU1RcbiAgX3BhcnNlQmxvY2tzOiAoc3JjKSAtPlxuICAgIG9mZnNldCA9IDBcbiAgICBuID0gc3JjLmxlbmd0aFxuICAgIHBlbmRpbmcgPSBbXVxuICAgIGFzdCA9IFtdXG5cbiAgICB3aGlsZSBvZmZzZXQgPCBuIG9yIHBlbmRpbmcubGVuZ3RoID4gMFxuICAgICAgc3RhcnRJbmRleCA9IG9mZnNldFxuICAgICAgY2Jfc3RhcnRfdG9rZW4gPSBAX190cnlQYXJzZUNvbnRhaW5lckJsb2NrU3RhcnRUb2tlbihvZmZzZXQsIHNyYylcbiAgICAgIGxhc3RJbmRleCA9IGNiX3N0YXJ0X3Rva2VuLnN0YXJ0SW5kZXhcbiAgICAgIGlmIGNiX3N0YXJ0X3Rva2VuP1xuICAgICAgICBhc3Rfc29saWRfcGFydCA9IEBfX3BhcnNlU29saWRCbG9ja3Moc3RhcnRJbmRleCwgbGFzdEluZGV4LCBzcmMpXG4gICAgICAgIHtvZmZzZXQsIGFzdF9mbHVpZF9wYXJ0fSA9IEBfX3BhcnNlRmx1aWRCbG9ja3MoY2Jfc3RhcnRfdG9rZW4sIHNyYylcbiAgICAgIGVsc2VcbiAgICAgICAge29mZnNldCwgYXN0X3NvbGlkX3BhcnR9ID0gQF9fcGFyc2VTb2xpZEJsb2NrcyhzdGFydEluZGV4LCBuLCBzcmMpXG5cbiAgICAgIGFzdC5wdXNoIGFzdF9zb2xpZF9wYXJ0XG4gICAgICBhc3QucHVzaCBhc3RfZmx1aWRfcGFydFxuXG4gICAgcmV0dXJuIGFzdFxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSB0aGUgc291cmNlIHN0YXJ0aW5nIGZyb20gZ2l2ZW4gb2Zmc2V0IGFuZCB0cmllcyB0byBmaW5kIHRoZSBmaXJzdFxuICAjIGNvbnRhaW5lciBibG9jayBzdGFydCB0b2tlblxuICAjIEBwYXJhbSB7aW50fSBvZmZzZXQgT2Zmc2V0IHZhbHVlXG4gICMgQHBhcmFtIHtzdHJpbmd9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtUb2tlbn0gTWF0Y2hlZCB0b2tlbiAobnVsbGFibGUpXG4gIF90cnlQYXJzZUNvbnRhaW5lckJsb2NrU3RhcnRUb2tlbjogKG9mZnNldCwgc3JjKSAtPlxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSB0aGUgc3BlY2lmaWVkIGRvY3VtZW50IHJlZ2lvbiBhcyBhIHNvbGlkIGJsb2NrXG4gICMgQHBhcmFtIHtpbnR9IGJlZ2luIFN0YXJ0IGluZGV4IG9mIHRoZSByZWdpb25cbiAgIyBAcGFyYW0ge2ludH0gZW5kIExhc3QgaW5kZXggb2YgdGhlIHJlZ2lvblxuICAjIEBwYXJhbSB7c3JjfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiBbQXJyYXk8VG9rZW4+XSBBU1Qgb2Ygc3BlY2lmaWVkIHJlZ2lvblxuICBfX3BhcnNlU29saWRCbG9ja3M6IChiZWdpbiwgZW5kLCBzcmMpIC0+XG4gICAgYmxvY2sgPSBAX19fcGFyc2VPbmVCbG9jayhiZWdpbiwgZW5kLCBzcmMpXG4gICAgYXN0X3BhcnRfYmVmb3JlID0gQF9fcGFyc2VTb2xpZEJsb2NrcyhiZWdpbiwgYmxvY2suc3RhcnRJbmRleCAtIDEsIHNyYylcbiAgICBhc3RfcGFydF9hZnRlciAgPSBAX19wYXJzZVNvbGlkQmxvY2tzKGJsb2NrLmxhc3RJbmRleCwgZW5kLCBzcmMpXG5cbiAgICByZXR1cm4gW10uY29uY2F0KGFzdF9wYXJ0X2JlZm9yZSwgYmxvY2ssIGFzdF9wYXJ0X2FmdGVyKVxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSB0aGUgc3BlY2lmaWVkIGRvY3VtZW50IHJlZ2lvbiBhcyBhIGZsdWlkIGJsb2NrXG4gICMgQHBhcmFtIHtUb2tlbn0gc3RhcnRfdG9rZW4gVGhlIHN0YXJ0IHRva2VuIG9mIGEgY29udGFpbmVyIGJsb2NrXG4gICMgQHBhcmFtIHtzdHJpbmd9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIFtBcnJheTxUb2tlbj5dIEFTVCBvZiBzcGVjaWZpZWQgcmVnaW9uXG4gIF9fcGFyc2VGbHVpZEJsb2NrczogKHN0YXJ0X3Rva2VuLCBzcmMpIC0+XG5cbiAgIyBAcHJpdmF0ZVxuICAjIE1hdGNoIGJsb2NrIHJ1bGVzIGZyb20gaGlnaGVzdCBwcmVjZWRlbmNlIHRvIGxvd2VzdCBhZ2FpbnN0IHRoZSBzcGVjaWZpZWRcbiAgIyBkb2N1bWVudCByZWdpb24gYW5kIHJldHVybnMgaW1tZWRpYXRlbHkgb24gdGhlIGZpcnN0IG1hdGNoLlxuICAjIEBwYXJhbSB7aW50fSBiZWdpbiBTdGFydCBpbmRleCBvZiB0aGUgcmVnaW9uXG4gICMgQHBhcmFtIHtpbnR9IGVuZCBMYXN0IGluZGV4IG9mIHRoZSByZWdpb25cbiAgIyBAcGFyYW0ge3NyY30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4ge1Rva2VufSBUaGUgZmlyc3QgbWF0Y2hcbiAgX19fcGFyc2VPbmVCbG9jazogLT4gKGJlZ2luLCBlbmQsIHNyYykgLT5cblxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSBpbmxpbmUgZWxlbWVudHNcbiAgIyBAcGFyYW0ge0FycmF5fSBhc3QgQVNUIHdpdGggdW4tcGFyc2VkIGJsb2NrIG5vZGVzIG9ubHlcbiAgIyBAcmV0dXJuIHtBcnJheX0gRnVsbHkgcGFyc2VkIEFTVFxuICBfcGFyc2VJbmxpbmU6IChhc3QpIC0+XG4iLCJ7RGVmfSA9IHJlcXVpcmUgJy4vdG9rZW4nXG5cbiMjI1xuVXNlZCB3aGVuIGRlZmluaW5nIGxhbmd1YWdlIHJ1bGVzIHdpdGgge0xhbmd1YWdlUGFja30gQVBJcy5cblxuQW4gZW1pdHRlciBtZXRob2QgZG9lcyBub3QgYWN0dWFsbHkgZW1pdCBhbnkgdG9rZW5zIHdoZW4gY2FsbGVkLCBidXQgY3JlYXRpbmdcbmEgZGVmaW5pdGlvbiBvciBjb250cmFjdCBvZiB0b2tlbnMgdGhhdCB3aWxsIGJlIGVtaXR0ZWQgb25jZSB0aGUgY29ycmVzcG9uZGluZ1xucnVsZSBpcyBtYXRjaGVkLlxuIyMjXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBFbWl0dGVyXG4gIGNvbnN0cnVjdG9yOiAoQG1vZGlmaWVycyA9IHt9KSAtPlxuICAgIEBvcHRpb25hbCA9IG5ldyBPcHRpb25hbEVtaXR0ZXIoKVxuXG4gICMgQHJldHVybiB7VG9rZW4uRGVmfSBBIHRva2VuIGRlZmluaXRpb25cbiAgYXR0cmlidXRlOiAoaWQsIHRyYW5zZm9ybSkgLT5cbiAgICBuZXcgRGVmKERlZi5BdHRyaWJ1dGUsIGlkLCB0cmFuc2Zvcm0sIEBtb2RpZmllcnMpXG5cbiAgIyBAcmV0dXJuIHtUb2tlbi5EZWZ9IEEgdG9rZW4gZGVmaW5pdGlvblxuICBjb250ZW50OiAoaWQsIHRyYW5zZm9ybSkgLT5cbiAgICBuZXcgRGVmKERlZi5Db250ZW50LCBpZCwgdHJhbnNmb3JtLCBAbW9kaWZpZXJzKVxuXG4gICMgQHJldHVybiB7VG9rZW4uRGVmfSBBIHRva2VuIGRlZmluaXRpb25cbiAgdGV4dDogKGlkLCB0cmFuc2Zvcm0pIC0+XG4gICAgbmV3IERlZihEZWYuVGV4dCwgaWQsIHRyYW5zZm9ybSwgQG1vZGlmaWVycylcblxuICAjIEByZXR1cm4ge1Rva2VuLkRlZn0gQSB0b2tlbiBkZWZpbml0aW9uXG4gIGRlbGltaXRlcjogKGlkLCB0cmFuc2Zvcm0pIC0+XG4gICAgbmV3IERlZihEZWYuRGVsaW1pdGVyLCBpZCwgdHJhbnNmb3JtLCBAbW9kaWZpZXJzKVxuXG4gIG5vdGhpbmc6IC0+XG4gICAgbmV3IERlZihEZWYuTm90aGluZywgbnVsbCwgbnVsbCwgQG1vZGlmaWVycylcblxuY2xhc3MgT3B0aW9uYWxFbWl0dGVyIGV4dGVuZHMgRW1pdHRlclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAbW9kaWZpZXJzID0gb3B0aW9uYWw6IHRydWVcbiIsIlJ1bGVCdWlsZGVyID0gcmVxdWlyZSAnLi9ydWxlLWJ1aWxkZXInXG5FbWl0dGVyID0gcmVxdWlyZSAnLi9lbWl0dGVyJ1xuXG4jIyNcbkJhc2UgY2xhc3MgZm9yIGxhbmd1YWdlIHBhY2tzXG4jIyNcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExhbmd1YWdlUGFja1xuICAjIEBwcm9wZXJ0eSBbRW1pdHRlcl0gQW4ge0VtaXR0ZXJ9IGluc3RhbmNlXG4gIGVtaXQ6IG5ldyBFbWl0dGVyKClcblxuICBjb25zdHJ1Y3RvcjogKEBucykgLT5cbiAgICBAX2J1aWxkZXIgPSBuZXcgUnVsZUJ1aWxkZXIoKVxuICAgIEBibG9ja1J1bGVzID0gW11cbiAgICBAaW5saW5lUnVsZXMgPSBbXVxuXG4gIGRlY2xhcmVBbGlhczogKGFsaWFzLCByZWdleCkgLT5cbiAgICBAX2J1aWxkZXIuZGVjbGFyZUFsaWFzKGFsaWFzLCByZWdleClcblxuICBkZWNsYXJlRGVsaW1pdGVyUGFpcjogKG9wZW4sIGNsb3NlKSAtPlxuICAgICMgVE9ETzogdXNlZCBmb3IgaG90IHVwZGF0ZSBtb2RlLCBpbXBsZW1lbnQgbGF0ZXJcblxuICBhZGRCbG9ja1J1bGU6IChuYW1lLCBydWxlLCBlbWl0dGVyKSAtPlxuICAgIGJ1aWx0X3J1bGUgPSBAX2J1aWxkZXIubWFrZShydWxlLCBlbWl0dGVyKVxuICAgIGJ1aWx0X3J1bGUubmFtZSA9IG5hbWVcbiAgICBAYmxvY2tSdWxlcy5wdXNoIGJ1aWx0X3J1bGVcblxuICBhZGRJbmxpbmVSdWxlOiAobmFtZSwgcnVsZSwgZW1pdHRlcikgLT5cbiAgICBidWlsdF9ydWxlID0gQF9idWlsZGVyLm1ha2UocnVsZSwgZW1pdHRlcilcbiAgICBidWlsdF9ydWxlLm5hbWUgPSBuYW1lXG4gICAgQGlubGluZVJ1bGVzLnB1c2ggYnVpbHRfcnVsZVxuIiwie0RlZn0gPSByZXF1aXJlICcuL3Rva2VuJ1xuIyB7UnVsZUJ1aWxkZXJ9IGlzIHVzZWQgYnkge0xhbmd1YWdlUGFja30gaW50ZXJuYWxseSB0byBjb21waWxlIHJ1bGVzIGZvciBwYXJzZXJcbiMgdG8gZXhlY3V0ZS5cbiNcbiMgIyMgVGVybWlub2xvZ3lcbiNcbiMgKiAqKlJ1bGUgZGVjbGVyYXRpb24qKnMgYXJlIG1hZGUgd2l0aCBBUEkgY2FsbHMgaW4ge0xhbmd1YWdlUGFja30gdG8gc3BlY2lmeVxuIyAgIHRoZSBzeWFudGF4IG9mIGEgbGFuZ3VhZ2UgZmVhdHVyZSB3aXRoIHJlZ2V4IGFzIHdlbGwgYXMgaG93IHJlbGV2ZW50IGRhdGEgaXNcbiMgICBjYXB0dXJlZCBhbmQgZW1pdHRlZCBpbnRvIHRva2Vucy5cbiMgKiAqKlJ1bGUqKnMgYXJlIGNvbXBpbGVkIGRlY2xhcmF0aW9ucyBlYWNoIG9mIHdoaWNoIGNvbnNpc3RzIG9mIGEgcmVnZXggYW5kIGFcbiMgICBoYW5kbGVyIGZ1bmN0aW9uLiBUaGUgbGF0dGVyIGVtaXRzIGEgdG9rZW4gb3IgbWFuaXB1bGF0ZXMgdGhlIHBhcmVudCB0b2tlbi5cbiNcbiMgRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRvIGRlY2FscmUgYSBydWxlLCBzZWUge0xhbmd1YWdlUGFja30uXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSdWxlQnVpbGRlclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2FsaWFzTWFwID0ge31cblxuICBkZWNsYXJlQWxpYXM6IChhbGlhcywgcmVnZXgpIC0+XG4gICAgIyBUT0RPOiBjaGVjayBmb3IgZHVwbGljYXRpb25cbiAgICBAX2FsaWFzTWFwW2FsaWFzXSA9IHJlZ2V4XG5cbiAgIyBAcHJpdmF0ZVxuICAjXG4gICMgR2V0IHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSByZWdleCBwYXJ0IGZvciBjb25jYXRlbmF0aWlvbi5cbiAgI1xuICAjIEBvdmVybG9hZCBfZ2V0UmVnZXhQYXJ0KGFsaWFzX29yX2xpdGVyYWwpXG4gICMgICBUaGUgYXJndW1lbnQgaXMgc2VhcmNoZWQgaW4gdGhlIGFsaWFzIG1hcCBmaXJzdC4gSWYgbm8gbWF0Y2ggaXMgZm91bmQsIGl0XG4gICMgICBpcyB0aGVuIGNvbnNpZGVyZWQgYXMgYSBsaXRlcmFsIHJlZ2V4IHNvdXJjZSBzdHJpbmcuXG4gICMgICBAcGFyYW0gW3N0cmluZ10gYWxpYXNfb3JfbGl0ZXJhbFxuICAjIEBvdmVybG9hZCBfZ2V0UmVnZXhQYXJ0KHJlZ2V4KVxuICAjICAgQHBhcmFtIFtSZWdFeHBdIHJlZ2V4XG4gICMgQHJldHVybiBbc3RyaW5nXSBSZWdleCBwYXJ0J3Mgc3RyaW5nIHNvdXJjZVxuICBfZ2V0UmVnZXhQYXJ0OiAocikgLT5cbiAgICB0ID0gdHlwZW9mIHJcbiAgICBpZiB0ID09ICdzdHJpbmcnXG4gICAgICBpZiByIG9mIEBfYWxpYXNNYXBcbiAgICAgICAgcmV0dXJuIEBfYWxpYXNNYXBbcl1cbiAgICAgICMgVE9ETzogZXNjYXBlXG4gICAgICByZXR1cm4gclxuICAgIGVsc2UgaWYgdCA9PSAnb2JqZWN0JyBhbmQgciBpbnN0YW5jZW9mIFJlZ0V4cFxuICAgICAgcmV0dXJuIHIuc291cmNlXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIiN7cn0gaXMgbm90IGEgdmFsaWQgYWxpYXMgbmFtZSwgc3RyaW5nIG9yIFJlZ0V4cFwiKVxuXG4gIF9tYWtlTWF0Y2hIYW5kbGVyOiAodG9rZW5fZGVmcykgLT5cbiAgICByZXR1cm4gKG5vZGUsIG1hdGNoZXMpIC0+XG4gICAgICBmb3IgZCBpbiB0b2tlbl9kZWZzXG4gICAgICAgIHBheWxvYWQgPSBtYXRjaCA9IG1hdGNoZXNbZC5ncm91cF9pbmRleF1cbiAgICAgICAgaWYgZC50cmFuc2Zvcm0/XG4gICAgICAgICAgcGF5bG9hZCA9IGQudHJhbnNmb3JtKHBheWxvYWQpXG5cbiAgICAgICAgbm9kZVtkLmlkXSA9IHBheWxvYWRcbiAgICAgICAgIyBUT0RPOiB1c2Ugbm9kZS5hdHRhY2hYeHggYWNjcm9kaW5nIHRvIGQudHlwZSBmaWVsZFxuXG5cbiAgIyBAcGFyYW0ge1JlZ0V4cH0gcnVsZVxuICAjIEBwYXJhbSB7T2JqZWN0fSBjYXB0dXJlX21hcFxuICBtYWtlOiAocnVsZSwgY2FwdHVyZV9tYXApIC0+XG4gICAgcmVnZXhfc3JjID0gJydcbiAgICBncm91cF9pbmRleCA9IDBcbiAgICB0b2tlbl9kZWZzID0gW11cbiAgICBpbl9vcHRpb25hbF9ncm91cCA9IGZhbHNlXG4gICAgY3VycmVudF9vcHRpb25hbF9ncm91cCA9IFwiXCJcblxuICAgIGZvciByLCBpIGluIHJ1bGVcbiAgICAgIHRva2VuX2RlZiA9IGNhcHR1cmVfbWFwP1tpICsgMV1cblxuICAgICAgY291bGRfY2FwdHVyZSA9IHRva2VuX2RlZj9cblxuICAgICAgcGFydCA9IEBfZ2V0UmVnZXhQYXJ0KHIpXG4gICAgICBpZiBjb3VsZF9jYXB0dXJlXG4gICAgICAgIGxhenlfbGVhdmluZyA9IGluX29wdGlvbmFsX2dyb3VwIGFuZCBub3QgdG9rZW5fZGVmLm9wdGlvbmFsP1xuICAgICAgICBvcHRpb25hbF9jaGFuZ2luZyA9ICh0b2tlbl9kZWYub3B0aW9uYWwgPyBmYWxzZSkgIT0gaW5fb3B0aW9uYWxfZ3JvdXBcbiAgICAgICAgaWYgbGF6eV9sZWF2aW5nIG9yIG9wdGlvbmFsX2NoYW5naW5nXG4gICAgICAgICAgaWYgbm90IGluX29wdGlvbmFsX2dyb3VwXG4gICAgICAgICAgICAjIGZhbHNlIC0+IHRydWUsIGVudGVyaW5nIG9wdGlvbmFsIGdyb3VwXG4gICAgICAgICAgICBncm91cF9pbmRleCsrXG4gICAgICAgICAgICBpbl9vcHRpb25hbF9ncm91cCA9IHRydWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIHRydWUgLT4gZmFsc2UsIGxlYXZpbmcgb3B0aW9uYWwgZ3JvdXBcbiAgICAgICAgICAgIGluX29wdGlvbmFsX2dyb3VwID0gZmFsc2VcbiAgICAgICAgICAgIHJlZ2V4X3NyYyArPSBcIigje2N1cnJlbnRfb3B0aW9uYWxfZ3JvdXB9KT9cIlxuICAgICAgICAgICAgY3VycmVudF9vcHRpb25hbF9ncm91cCA9IFwiXCJcbiAgICAgICAgaWYgdG9rZW5fZGVmLnR5cGUgIT0gRGVmLk5vdGhpbmdcbiAgICAgICAgICBncm91cF9pbmRleCsrXG4gICAgICAgICAgcGFydCA9IFwiKCN7cGFydH0pXCJcbiAgICAgICAgICB0b2tlbl9kZWZzLnB1c2ggdG9rZW5fZGVmXG4gICAgICAgICAgdG9rZW5fZGVmLmdyb3VwX2luZGV4ID0gZ3JvdXBfaW5kZXhcbiAgICAgIGVsc2UgaWYgaW5fb3B0aW9uYWxfZ3JvdXBcbiAgICAgICAgIyB0cnVlIC0+IGZhbHNlLCBsZWF2aW5nIG9wdGlvbmFsIGdyb3VwXG4gICAgICAgIGluX29wdGlvbmFsX2dyb3VwID0gZmFsc2VcbiAgICAgICAgcmVnZXhfc3JjICs9IFwiKCN7Y3VycmVudF9vcHRpb25hbF9ncm91cH0pP1wiXG4gICAgICAgIGN1cnJlbnRfb3B0aW9uYWxfZ3JvdXAgPSBcIlwiXG4gICAgICBpZiBpbl9vcHRpb25hbF9ncm91cFxuICAgICAgICBjdXJyZW50X29wdGlvbmFsX2dyb3VwICs9IHBhcnRcbiAgICAgIGVsc2VcbiAgICAgICAgcmVnZXhfc3JjICs9IHBhcnRcblxuICAgIHJlc3VsdCA9XG4gICAgICByZWdleDogbmV3IFJlZ0V4cChyZWdleF9zcmMpXG4gICAgICBoYW5kbGVyOiBAX21ha2VNYXRjaEhhbmRsZXIodG9rZW5fZGVmcylcbiAgICByZXR1cm4gcmVzdWx0XG4iLCIjIFRva2VucyBhcmUgYnVpbGRpbmcgYmxvY2tzIG9mIHBhcnNlZCBkb2N1bWVudHMuIEVhY2ggcnVsZSBpcyBldmFsdWF0ZWQgYW5kXG4jIGNhcHR1cmUgZ3JvdXBzIGFyZSB0cmFuc2Zvcm1lZCBpbnRvIHRva2Vucy4gRm9yIGluZm9ybWF0aW9uIG9uIGhvdyB0b2tlbnNcbiMgYXJlIGVtaXR0ZWQgZnJvbSBsYW5ndWFnZSBydWxlcywgc2VlIHtMYW5ndWFnZVBhY2t9LlxuI1xuIyBBIHRva2VuIGNvbnRhaW5zIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byByZXByZXNlbnQgYSBNYXJrZG93biBlbGVtZW50LFxuIyBpbmNsdWRpbmcgaXRzIGxvY2F0aW9uIGluIHNvdXJjZSBjb2RlLCBkYXRhIGZpZWxkcyBhbmQgZXRjLiBGb3Igc2ltcGxpY2l0eSxcbiMgTWFya1JpZ2h0IHVzZXMgdG9rZW5zIGFzIEFTVCBub2RlcyBkaXJlY3RseSBpbnN0ZWFkIG9mIGNyZWF0aW5nIG5ldyBvbmVzLlxuI1xuIyAjIyBUb2tlbiBIaWVyYXJjaGllc1xuI1xuIyBUb2tlbnMgYXJlIGNvbm5lY3RlZCB3aXRoIGVhY2ggb3RoZXIgaW4gYSBmZXcgZGlmZnJlbnQgd2F5cyB0byBmb3JtIGRpZmZyZW50XG4jIHJlcHJlc2VudGF0aW9ucyBvZiB0aGUgc2FtZSBkb2N1bWVudC5cbiNcbiMgIyMjIExpbmVhciBMaXN0XG4jXG4jIFRva2VucyBhcmUgY2hhaW5lZCB0b2dldGhlciBpbiBhIGRvdWJsZS1saW5rZWQgbGlzdCBmYXNpb24gZm9yIGxpbmVhciBhY2Nlc3MuXG4jIEVhY2ggdG9rZW4gaG9sZHMgYSB7VG9rZW4jcHJldn0gYW5kIHtUb2tlbiNuZXh0fSBmaWVsZHMgbGlua2luZyB0byB0b2tlbnNcbiMgYmVmb3JlIGFuZCBhZnRlci5cbiNcbiMgVGhlIG9yZGVyIGlzIGRldGVybWluZWQgYnkgdG9rZW4ncyBwb3NpdGlvbiBpbiB0aGUgZG9jdW1lbnQuIEFuIGVsZW1lbnQgbWF5XG4jIGNvcnJlc3BvbmQgdG8gb25lIHBhcmVudCB0b2tlbiBmb3IgdGhlIHdob2xlIGVsZW1lbnQgYXMgd2VsbCBhcyBhIGZld1xuIyBkZWxpbWl0ZXIgY2hpbGRyZW4gdG9rZW5zIHRvIGluZGljYXRlIGJvdW5kYXJpZXMuIEluIHN1Y2ggY2FzZSwgdGhlIHBhcmVudFxuIyB0b2tlbiBjb21lcyBiZXR3ZWVuIHRoZSBmaXJzdCBwYWlyIG9mIG1hdGNoZWQgZGVsaW1pdGVycy5cbiNcbiMgIyMjIEFTVFxuI1xuIyBUb2tlbnMgY2FuIGFsc28gYnVpbGQgYW4gYWJhc3RyYWN0IHN5bnRheCB0cmVlLCB3aXRoIHtUb2tlbiNwYXJlbnR9IGZpZWxkXG4jIHBvaW50aW5nIHRvIG9uZSdzIGRpcmVjdCBwYXJlbnQgYW5kIHtUb2tlbiNjaGlsZHJlbn0gaG9sZHMgYW4gYXJyYXkgb2ZcbiMgY2hpbGRyZW4uIENoaWxkcmVuIGFyZSBhbHNvIGNoYWluZWQgdG9nZXRoZXIgaW4gYSBkb3VibGUtbGlua2VkIGxpc3Qgd2l0aFxuIyB7VG9rZW4jcHJldlNpYmxpbmd9IGFuZCB7VG9rZW4jbmV4dFNpYmxpbmd9LiBBIHNpbmdsZSBkb2N1bWVudCB0b2tlbiBpcyB1c2VkXG4jIGFzIHRoZSBwYXJlbnQgZm9yIGFsbCB0b3AgbGV2ZWwgdG9rZW5zIHRvIGZvcm0gYSBzaW5nbGUtcm9vdCBzdHJ1Y3R1cmUuXG4jXG4jICMjIyBPdXRsaW5lXG4jXG4jIEhlYWRpbmcgdG9rZW5zIGFyZSBsaW5rZWQgaW50byBhIHRyZWUgdG8gcmVwcmVzZW50IHRoZSBsb2dpYyBzdHJ1Y3R1cmUgb2YgYVxuIyBkb2N1bWVudC4gRWFjaCBoZWFkaW5nIGdvdmVybnMgYSBzZWN0aW9uIHVuZGVyIGl0c2VsZiBhbmQgaG9sZHMgZWxlbWVudHMgYXNcbiMgc2VjdGlvbiBjb250ZW50LiAoTm90IGltcGxlbWVudGVkKVxuI1xuIyBAVE9ETyBPdXRsaW5lIHByb3BlcnRpZXNcbiNcbiMgIyMjIFF1YWR0cmVlXG4jXG4jIFRva2VucyBhcmUgYWxzbyBpbmRleGVkIHNwYXRpYWxseSB3aXRoIHF1YWR0cmVlLiBJdCBpcyB1c2VmdWxseSBmb3IgZWRpdG9yXG4jIGRldmVsb3BlcnMgdG8gbG9vayB1cCB0b2tlbiBieSBjdXJzb3IgbG9jYXRpb25zLlxuI1xuIyBAVE9ETyBRdWFkdHJlZSBpbXBsZW1lbnRhdGlvblxuI1xuIyBAVE9ETyBUb2tlbiBMb2NhdGlvblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVG9rZW5cbiAgIyBAcHJvcGVydHkge1Rva2VufSBUaGUgcHJldmlvdXMgdG9rZW4gaW4gZG9jdW1lbnRcbiAgcHJldjogbnVsbFxuXG4gICMgQHByb3BlcnR5IHtUb2tlbn0gVGhlIG5leHQgdG9rZW4gaW4gZG9jdW1lbnRcbiAgbmV4dDogbnVsbFxuXG4gICMgQHByb3BlcnR5IHtUb2tlbn0gVGhlIHBhcmVudCB0b2tlblxuICBwYXJlbnQ6IG51bGxcblxuICAjIEBwcm9wZXJ0eSB7QXJyYXk8VG9rZW4+fSBUaGUgY2hpbHJlblxuICBjaGlsZHJlbjogW11cblxuICAjIEBwcm9wZXJ0eSB7VG9rZW59IFRoZSBmaXJzdCBjaGlsZFxuICBmaXJzdENoaWxkOiBudWxsXG5cbiAgIyBAcHJvcGVydHkge1Rva2VufSBUaGUgcHJldmlvdXMgdG9rZW4gdW5kZXIgdGhlIHNhbWUgcGFyZW50XG4gIHByZXZTaWJsaW5nOiBudWxsXG5cbiAgIyBAcHJvcGVydHkge1Rva2VufSBUaGUgbmV4dCB0b2tlbiB1bmRlciB0aGUgc2FtZSBwYXJlbnRcbiAgbmV4dFNpYmxpbmc6IG51bGxcblxuI1xuIyBAdG9kbyBBZGQgZG9jdW1lbnRhdGlvblxubW9kdWxlLmV4cG9ydHMuRGVmID1cbmNsYXNzIFRva2VuRGVmXG4gIEBBdHRyaWJ1dGU6ICdhdHRyaWJ1dGUnXG4gIEBDb250ZW50OiAnY29udGVudCdcbiAgQFRleHQ6ICd0ZXh0J1xuICBARGVsaW1pdGVyOiAnZGVsaW1pdGVyJ1xuICBATm90aGluZzogJ25vdGhpbmcnXG4gIFxuICBjb25zdHJ1Y3RvcjogKEB0eXBlLCBAaWQsIEB0cmFuc2Zvcm0sIG1vZGlmaWVycykgLT5cbiAgICBpZiBtb2RpZmllcnM/XG4gICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBtb2RpZmllcnNcbiAgICAgICAgQFtrZXldID0gdmFsdWVcbiIsIkxhbmd1YWdlUGFjayA9IHJlcXVpcmUgJy4uL2NvcmUvbGFuZ3VhZ2UtcGFjaydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29yZSBleHRlbmRzIExhbmd1YWdlUGFja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlciAnY29yZSdcblxuICAgIEBkZWNsYXJlQWxpYXMgJ14nLCAgICAgIC9eXFwgezAsIDN9L1xuICAgIEBkZWNsYXJlQWxpYXMgJyQnLCAgICAgIC8kL1xuICAgIEBkZWNsYXJlQWxpYXMgJyAnLCAgICAgIC9cXHMrL1xuICAgIEBkZWNsYXJlQWxpYXMgJyMnLCAgICAgIC8jezEsIDZ9L1xuICAgIEBkZWNsYXJlQWxpYXMgJy0gLSAtJywgIC8oWyorLV1cXHM/KXszLH0vXG4gICAgQGRlY2xhcmVBbGlhcyAnPT09JywgICAgL1stPV17Myx9L1xuICAgIEBkZWNsYXJlQWxpYXMgJy0+JywgICAgIC9eKFxcdHxcXCB7NH0pL1xuICAgIEBkZWNsYXJlQWxpYXMgJ2BgYCcsICAgIC9bfmBdezMsfS9cblxuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnKCcsICcpJ1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnWycsICddJ1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAneycsICd9J1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnPCcsICc+J1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnYGBgJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAncnVsZXMnLCBbJ14nLCAnLSAtIC0nLCAnJCddXG5cbiAgICBAYWRkQmxvY2tSdWxlICdhdHhfaGVhZGVyJywgWydeJywgJyMnLCAnICcsIC8oLiopXFxzKi8sICckJ10sXG4gICAgICAxOiBAZW1pdC5hdHRyaWJ1dGUgJ2xldmVsJywgKGhhc2gpIC0+IGhhc2gubGVuZ3RoXG4gICAgICAzOiBAZW1pdC5jb250ZW50ICAgJ3RpdGxlJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnc2V0ZXh0X2hlYWRlcicsIFsnXicsIC8oW15cXHNdLiopXFxuLywgJz09PScsICckJ10sXG4gICAgICAxOiBAZW1pdC5jb250ZW50ICAgJ3RpdGxlJ1xuICAgICAgMjogQGVtaXQuYXR0cmlidXRlICdsZXZlbCcsIChyKSAtPiBpZiByWzBdID09ICctJyB0aGVuIDEgZWxzZSAyXG5cbiAgICBAYWRkQmxvY2tSdWxlICdpbmRlbnRlZF9jb2RlJywgWyctPicsIC8oLiopLywgJyQnXSxcbiAgICAgIDE6IEBlbWl0LnRleHQgICAgICAnc3JjJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnZmVuY2VkX2NvZGUnLCBbJ14nLCAnYGBgJywgJyQnLCAvKFteXSopLywgJ14nLCAnYGBgJywgJyQnXSxcbiAgICAgIDM6IEBlbWl0LnRleHQgICAgICAnc3JjJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnaHRtbCcsIFtdXG5cbiAgICBAYWRkQmxvY2tSdWxlICdsaW5rX3JlZicsIFtdXG5cbiAgICBAYWRkQmxvY2tSdWxlICdwYXJhZ3JhcGgnLCBbXVxuXG4gICAgQGFkZEJsb2NrUnVsZSAnYmxhbmtfbGluZScsIFtdXG5cbiAgICAjIFRCRDogYWdncmVnYXRlIGBsaXN0X2l0ZW1gIGludG8gb25lIGAqX2xpc3RgIGVsZW1lbnQgbGF0ZXJcbiAgICAjICAgICAgb3IgZW1pdCBkaXJlY3RseVxuICAgICMgQGFkZEJsb2NrUnVsZSAnb3JkZXJlZF9saXN0J1xuICAgICNcbiAgICAjIEBhZGRCbG9ja1J1bGUgJ3Vub3JkZXJlZF9saXN0J1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnbGlzdF9pdGVtJywgW11cblxuICAgIEBhZGRJbmxpbmVSdWxlICdiYWNrc2xhc2hfZXNjYXBlJywgW11cblxuICAgIEBhZGRJbmxpbmVSdWxlICdlbnRpdHknLCBbXVxuXG4gICAgQGFkZElubGluZVJ1bGUgJ2NvZGVfc3BhbicsIFtdXG4iLCJMYW5ndWFnZVBhY2sgPSByZXF1aXJlICcuLi9jb3JlL2xhbmd1YWdlLXBhY2snXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdGTSBleHRlbmRzIExhbmd1YWdlUGFja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlciAnZ2ZtJ1xuIiwiQ29tcGlsZXIgPSByZXF1aXJlICcuL2NvbXBpbGVyJ1xuXG5Db3JlID0gcmVxdWlyZSAnLi9sYW5nL2NvcmUnXG5HRk0gPSByZXF1aXJlICcuL2xhbmcvZ2ZtJ1xuXG5jb3JlID0gbmV3IENvcmUoKVxuZ2ZtID0gbmV3IEdGTSgpXG5cbkNvbXBpbGVyLkRlZmF1bHQgPSBuZXcgQ29tcGlsZXIoW2NvcmUsIGdmbV0pXG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcGlsZXJcbiJdfQ==
