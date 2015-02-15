(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Generator;

module.exports = Generator = (function() {
  function Generator() {}

  return Generator;

})();



},{}],2:[function(require,module,exports){
var Compiler, Generator, Parser, RuleManager;

Parser = require('./parser');

Generator = require('./generator');

RuleManager = require('../core/rule-manager');

module.exports = Compiler = (function() {
  function Compiler() {
    this.rules = new RuleManager();
    this.parser = new Parser(this.rules);
  }

  Compiler.prototype.compile = function(md) {
    return md;
  };

  return Compiler;

})();



},{"../core/rule-manager":7,"./generator":1,"./parser":3}],3:[function(require,module,exports){
var Parser;

module.exports = Parser = (function() {
  function Parser(rules) {
    this.rules = rules;
  }

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



},{"./token":8}],5:[function(require,module,exports){
var Emitter, LanguagePack, OrderedMap, RuleBuilder;

RuleBuilder = require('./rule-builder');

Emitter = require('./emitter');

OrderedMap = require('./util').OrderedMap;


/*
Base class for language packs
 */

module.exports = LanguagePack = (function() {
  LanguagePack.prototype.emit = new Emitter();

  function LanguagePack(ns) {
    this.ns = ns;
    this._builder = new RuleBuilder();
    this.blockRules = new OrderedMap(function(r) {
      return r.name;
    });
    this.inlineRules = new OrderedMap(function(r) {
      return r.name;
    });
  }

  LanguagePack.prototype.declareAlias = function(alias, regex) {
    return this._builder.declareAlias(alias, regex);
  };

  LanguagePack.prototype.declareDelimiterPair = function(open, close) {};

  LanguagePack.prototype.addBlockRule = function(name, rule, emitter) {
    var built_rule;
    built_rule = this._builder.make(rule, emitter);
    built_rule.name = name;
    built_rule.type = 'block';
    return this.blockRules.push(built_rule);
  };

  LanguagePack.prototype.addInlineRule = function(name, rule, emitter) {
    var built_rule;
    built_rule = this._builder.make(rule, emitter);
    built_rule.name = name;
    built_rule.type = 'inline';
    return this.inlineRules.push(built_rule);
  };

  return LanguagePack;

})();



},{"./emitter":4,"./rule-builder":6,"./util":9}],6:[function(require,module,exports){
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
    var alt, escape_r, rule, rules, sources, t, _i, _len;
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
    } else if (t === 'object') {
      if (r instanceof RegExp) {
        return {
          type: 'regex',
          rule: r.source
        };
      } else if (Array.isArray(r)) {
        rules = [];
        sources = [];
        for (_i = 0, _len = r.length; _i < _len; _i++) {
          alt = r[_i];
          if (!alt in this._subRules) {
            throw new TypeError("'alt' is not a valid sub-rule name.");
          }
          rule = this._subRules[alt];
          rules.push(rule);
          sources.push(rule.regex.source);
        }
        return {
          type: 'alt',
          rules: rules,
          sources: sources
        };
      }
    }
    throw new TypeError("'" + r + "' is not a valid alias name, string or RegExp");
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
    var alt_def, alt_rule, base_group_index, compiled, copied, could_capture, current_group_index, current_optional_group, err, group_index, i, in_optional_group, lazy_leaving, optional_changing, part, part_src, r, regex_src, sub_def, token_def, token_defs, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
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
      if (part.type === 'alt') {
        if (could_capture) {
          err = new TypeError("Alternative rules cannot be re-captured");
          err.ruleName = r;
          err.ruleIndex = i;
          throw err;
        }
        regex_src += "(?:" + (part.sources.join('|')) + ")";
        _ref = part.rules;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          alt_rule = _ref[_j];
          base_group_index = group_index;
          _ref1 = alt_rule.token_defs;
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            alt_def = _ref1[_k];
            copied = Def.clone(alt_def);
            current_group_index = base_group_index + alt_def.group_index;
            copied.group_index = current_group_index;
            group_index = current_group_index;
            token_defs.push(copied);
          }
        }
      } else if (part.type === 'sub') {
        if (could_capture) {
          err = new TypeError("Sub-rules cannot be re-captured");
          err.ruleName = r;
          err.ruleIndex = i;
          throw err;
        }
        regex_src += part.rule.regex.source;
        base_group_index = group_index;
        _ref2 = part.rule.token_defs;
        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
          sub_def = _ref2[_l];
          copied = Def.clone(sub_def);
          current_group_index = base_group_index + sub_def.group_index;
          copied.group_index = current_group_index;
          group_index = current_group_index;
          token_defs.push(copied);
        }
      } else {
        if (could_capture) {
          lazy_leaving = in_optional_group && (token_def.optional == null);
          optional_changing = ((_ref3 = token_def.optional) != null ? _ref3 : false) !== in_optional_group;
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



},{"./token":8}],7:[function(require,module,exports){
var OrderedMap, RuleManager;

OrderedMap = require('./util').OrderedMap;

module.exports = RuleManager = (function() {
  function RuleManager() {
    this._isDirty = false;
    this._packs = new OrderedMap(function(p) {
      return p.ns;
    });
    this._cached_blocks = [];
    this._cached_inlines = [];
  }

  RuleManager.prototype._updateCache = function() {
    if (!this._isDirty) {
      return;
    }
    this._cached_blocks = [];
    this._cached_inlines = [];
    this._packs.each((function(_this) {
      return function(pack) {
        var blocks, inlines;
        blocks = pack.blockRules.filter(function(r) {
          return r.enabled;
        });
        inlines = pack.inlineRules.filter(function(r) {
          return r.enabled;
        });
        _this._cached_blocks = _this._cached_blocks.concat(blocks);
        return _this._cached_inlines = _this._cached_inlines.concat(inlines);
      };
    })(this));
    return this._isDirty = false;
  };

  RuleManager.property('blockRules', {
    get: function() {
      this._updateCache();
      return this._cached_blocks;
    }
  });

  RuleManager.property('inlineRules', {
    get: function() {
      this._updateCache();
      return this._cached_inlines;
    }
  });

  RuleManager.prototype.addLanguagePack = function(pack) {
    pack.blockRules.each(function(r) {
      return r.enabled = true;
    });
    pack.inlineRules.each(function(r) {
      return r.enabled = true;
    });
    this._packs.push(pack);
    return this._isDirty = true;
  };

  RuleManager.prototype.removeLanguagePack = function(ns) {
    return this._packs.remove(ns);
  };

  RuleManager.prototype.toggle = function(ns, enabled, features) {
    var f, pack, _i, _len;
    pack = this._packs.get(ns);
    if (pack == null) {
      throw new ReferenceError("Unknown language pack '" + ns + "'");
    }
    if ((features != null) && !Array.isArray(features)) {
      throw new TypeError('Expect an Array of feature names');
      return;
    }
    if ((features == null) || features.length === 0) {
      pack.blockRules.each(function(r) {
        return r.enabled = enabled;
      });
      pack.inlineRules.each(function(r) {
        return r.enabled = enabled;
      });
    } else {
      pack.blockRules.each(function(r) {
        return r.enabled = !enabled;
      });
      pack.inlineRules.each(function(r) {
        return r.enabled = !enabled;
      });
      for (_i = 0, _len = features.length; _i < _len; _i++) {
        f = features[_i];
        if (pack.blockRules.has(f)) {
          pack.blockRules.get(f).enabled = enabled;
        } else if (pack.inlineRules.has(f)) {
          pack.inlineRules.get(f).enabled = enabled;
        }
      }
    }
    return this._isDirty = true;
  };

  RuleManager.prototype.enable = function(ns, features) {
    return this.toggle(ns, true, features);
  };

  RuleManager.prototype.disable = function(ns, features) {
    return this.toggle(ns, false, features);
  };

  return RuleManager;

})();



},{"./util":9}],8:[function(require,module,exports){
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



},{}],9:[function(require,module,exports){
var OrderedMap;

Function.prototype.property = function(prop, desc) {
  return Object.defineProperty(this.prototype, prop, desc);
};

module.exports.OrderedMap = OrderedMap = (function() {
  function OrderedMap(key_getter) {
    this.key_getter = key_getter;
    this._map = {};
    this._keys = [];
    this._values = [];
  }

  OrderedMap.prototype.has = function(key) {
    return key in this._map;
  };

  OrderedMap.prototype.get = function(key) {
    return this._values[this._map[key]];
  };

  OrderedMap.prototype.push = function(elem) {
    var key;
    key = this.key_getter(elem);
    this._keys.push(key);
    this._values.push(elem);
    return this._map[key] = this._values.length - 1;
  };

  OrderedMap.prototype.remove = function(key) {
    throw new Error("Too lazy. Not implemented.");
  };

  OrderedMap.prototype.each = function(iterator) {
    var i, v, _i, _len, _ref, _results;
    _ref = this._values;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      v = _ref[i];
      _results.push(typeof iterator === "function" ? iterator(v, i) : void 0);
    }
    return _results;
  };

  OrderedMap.prototype.filter = function(f) {
    var filtered, i, v, _i, _len, _ref;
    filtered = [];
    _ref = this._values;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      v = _ref[i];
      if (typeof f === "function" ? f(v, i) : void 0) {
        filtered.push(v);
      }
    }
    return filtered;
  };

  OrderedMap.property('values', {
    get: function() {
      return this._values;
    }
  });

  OrderedMap.property('keys', {
    get: function() {
      return this._keys;
    }
  });

  OrderedMap.property('length', {
    get: function() {
      return this._values.length;
    }
  });

  return OrderedMap;

})();



},{}],10:[function(require,module,exports){
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



},{"../core/language-pack":5}],11:[function(require,module,exports){
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



},{"../core/language-pack":5}],12:[function(require,module,exports){
var Compiler, Core, GFM, core, gfm;

Compiler = require('./compiler');

Core = require('./lang/core');

GFM = require('./lang/gfm');

core = new Core();

gfm = new GFM();

Compiler.Default = new Compiler([core, gfm]);

module.exports = Compiler;



},{"./compiler":2,"./lang/core":10,"./lang/gfm":11}]},{},[12])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXG5vZGVfbW9kdWxlc1xcZ3VscC1icm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29tcGlsZXJcXGdlbmVyYXRvci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxpbmRleC5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvbXBpbGVyXFxwYXJzZXIuY29mZmVlIiwiRjpcXGRldlxcanNcXG1hcmtyaWdodFxcY29mZmVlXFxjb3JlXFxlbWl0dGVyLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29yZVxcbGFuZ3VhZ2UtcGFjay5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvcmVcXHJ1bGUtYnVpbGRlci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvcmVcXHJ1bGUtbWFuYWdlci5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGNvcmVcXHRva2VuLmNvZmZlZSIsIkY6XFxkZXZcXGpzXFxtYXJrcmlnaHRcXGNvZmZlZVxcY29yZVxcdXRpbC5jb2ZmZWUiLCJGOlxcZGV2XFxqc1xcbWFya3JpZ2h0XFxjb2ZmZWVcXGxhbmdcXGNvcmUuY29mZmVlIiwiRjpcXGRldlxcanNcXG1hcmtyaWdodFxcY29mZmVlXFxsYW5nXFxnZm0uY29mZmVlIiwiRjpcXGRldlxcanNcXG1hcmtyaWdodFxcY29mZmVlXFxtYXJrcmlnaHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxTQUFBOztBQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxFQUFBLG1CQUFBLEdBQUEsQ0FBYjs7bUJBQUE7O0lBRkYsQ0FBQTs7Ozs7QUNBQSxJQUFBLHdDQUFBOztBQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUFULENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSxhQUFSLENBRFosQ0FBQTs7QUFBQSxXQUVBLEdBQWMsT0FBQSxDQUFRLHNCQUFSLENBRmQsQ0FBQTs7QUFBQSxNQUlNLENBQUMsT0FBUCxHQUNNO0FBQ1MsRUFBQSxrQkFBQSxHQUFBO0FBQ1gsSUFBQSxJQUFDLENBQUEsS0FBRCxHQUFhLElBQUEsV0FBQSxDQUFBLENBQWIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE1BQUEsQ0FBTyxJQUFDLENBQUEsS0FBUixDQURkLENBRFc7RUFBQSxDQUFiOztBQUFBLHFCQUtBLE9BQUEsR0FBUyxTQUFDLEVBQUQsR0FBQTtBQUNQLFdBQU8sRUFBUCxDQURPO0VBQUEsQ0FMVCxDQUFBOztrQkFBQTs7SUFORixDQUFBOzs7OztBQ2lJQSxJQUFBLE1BQUE7O0FBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUdTLEVBQUEsZ0JBQUUsS0FBRixHQUFBO0FBQVUsSUFBVCxJQUFDLENBQUEsUUFBQSxLQUFRLENBQVY7RUFBQSxDQUFiOztBQUFBLG1CQUtBLEtBQUEsR0FBTyxTQUFDLEdBQUQsR0FBQTtBQUNMLFFBQUEsR0FBQTtBQUFBLElBQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxZQUFELENBQWMsR0FBZCxDQUFOLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsWUFBRCxDQUFjLEdBQWQsQ0FETixDQUFBO0FBR0EsV0FBTyxHQUFQLENBSks7RUFBQSxDQUxQLENBQUE7O0FBQUEsbUJBZUEsWUFBQSxHQUFjLFNBQUMsR0FBRCxHQUFBO0FBQ1osUUFBQSwyR0FBQTtBQUFBLElBQUEsTUFBQSxHQUFTLENBQVQsQ0FBQTtBQUFBLElBQ0EsQ0FBQSxHQUFJLEdBQUcsQ0FBQyxNQURSLENBQUE7QUFBQSxJQUVBLE9BQUEsR0FBVSxFQUZWLENBQUE7QUFBQSxJQUdBLEdBQUEsR0FBTSxFQUhOLENBQUE7QUFLQSxXQUFNLE1BQUEsR0FBUyxDQUFULElBQWMsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBckMsR0FBQTtBQUNFLE1BQUEsVUFBQSxHQUFhLE1BQWIsQ0FBQTtBQUFBLE1BQ0EsY0FBQSxHQUFpQixJQUFDLENBQUEsa0NBQUQsQ0FBb0MsTUFBcEMsRUFBNEMsR0FBNUMsQ0FEakIsQ0FBQTtBQUFBLE1BRUEsU0FBQSxHQUFZLGNBQWMsQ0FBQyxVQUYzQixDQUFBO0FBR0EsTUFBQSxJQUFHLHNCQUFIO0FBQ0UsUUFBQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixVQUFwQixFQUFnQyxTQUFoQyxFQUEyQyxHQUEzQyxDQUFqQixDQUFBO0FBQUEsUUFDQSxPQUEyQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsY0FBcEIsRUFBb0MsR0FBcEMsQ0FBM0IsRUFBQyxjQUFBLE1BQUQsRUFBUyxzQkFBQSxjQURULENBREY7T0FBQSxNQUFBO0FBSUUsUUFBQSxRQUEyQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsVUFBcEIsRUFBZ0MsQ0FBaEMsRUFBbUMsR0FBbkMsQ0FBM0IsRUFBQyxlQUFBLE1BQUQsRUFBUyx1QkFBQSxjQUFULENBSkY7T0FIQTtBQUFBLE1BU0EsR0FBRyxDQUFDLElBQUosQ0FBUyxjQUFULENBVEEsQ0FBQTtBQUFBLE1BVUEsR0FBRyxDQUFDLElBQUosQ0FBUyxjQUFULENBVkEsQ0FERjtJQUFBLENBTEE7QUFrQkEsV0FBTyxHQUFQLENBbkJZO0VBQUEsQ0FmZCxDQUFBOztBQUFBLG1CQTBDQSxpQ0FBQSxHQUFtQyxTQUFDLE1BQUQsRUFBUyxHQUFULEdBQUEsQ0ExQ25DLENBQUE7O0FBQUEsbUJBa0RBLGtCQUFBLEdBQW9CLFNBQUMsS0FBRCxFQUFRLEdBQVIsRUFBYSxHQUFiLEdBQUE7QUFDbEIsUUFBQSxzQ0FBQTtBQUFBLElBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixLQUFsQixFQUF5QixHQUF6QixFQUE4QixHQUE5QixDQUFSLENBQUE7QUFBQSxJQUNBLGVBQUEsR0FBa0IsSUFBQyxDQUFBLGtCQUFELENBQW9CLEtBQXBCLEVBQTJCLEtBQUssQ0FBQyxVQUFOLEdBQW1CLENBQTlDLEVBQWlELEdBQWpELENBRGxCLENBQUE7QUFBQSxJQUVBLGNBQUEsR0FBa0IsSUFBQyxDQUFBLGtCQUFELENBQW9CLEtBQUssQ0FBQyxTQUExQixFQUFxQyxHQUFyQyxFQUEwQyxHQUExQyxDQUZsQixDQUFBO0FBSUEsV0FBTyxFQUFFLENBQUMsTUFBSCxDQUFVLGVBQVYsRUFBMkIsS0FBM0IsRUFBa0MsY0FBbEMsQ0FBUCxDQUxrQjtFQUFBLENBbERwQixDQUFBOztBQUFBLG1CQThEQSxrQkFBQSxHQUFvQixTQUFDLFdBQUQsRUFBYyxHQUFkLEdBQUEsQ0E5RHBCLENBQUE7O0FBQUEsbUJBdUVBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTtXQUFHLFNBQUMsS0FBRCxFQUFRLEdBQVIsRUFBYSxHQUFiLEdBQUEsRUFBSDtFQUFBLENBdkVsQixDQUFBOztBQUFBLG1CQThFQSxZQUFBLEdBQWMsU0FBQyxHQUFELEdBQUEsQ0E5RWQsQ0FBQTs7Z0JBQUE7O0lBSkYsQ0FBQTs7Ozs7QUNqSUEsSUFBQSw2QkFBQTtFQUFBO2lTQUFBOztBQUFBLE1BQVEsT0FBQSxDQUFRLFNBQVIsRUFBUCxHQUFELENBQUE7O0FBRUE7QUFBQTs7Ozs7O0dBRkE7O0FBQUEsTUFTTSxDQUFDLE9BQVAsR0FDTTtBQUNTLEVBQUEsaUJBQUUsU0FBRixHQUFBO0FBQ1gsSUFEWSxJQUFDLENBQUEsZ0NBQUEsWUFBWSxFQUN6QixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLGVBQUEsQ0FBQSxDQUFoQixDQURXO0VBQUEsQ0FBYjs7QUFBQSxvQkFJQSxTQUFBLEdBQVcsU0FBQyxFQUFELEVBQUssU0FBTCxHQUFBO1dBQ0wsSUFBQSxHQUFBLENBQUksR0FBRyxDQUFDLFNBQVIsRUFBbUIsRUFBbkIsRUFBdUIsU0FBdkIsRUFBa0MsSUFBQyxDQUFBLFNBQW5DLEVBREs7RUFBQSxDQUpYLENBQUE7O0FBQUEsb0JBUUEsT0FBQSxHQUFTLFNBQUMsRUFBRCxFQUFLLFNBQUwsR0FBQTtXQUNILElBQUEsR0FBQSxDQUFJLEdBQUcsQ0FBQyxPQUFSLEVBQWlCLEVBQWpCLEVBQXFCLFNBQXJCLEVBQWdDLElBQUMsQ0FBQSxTQUFqQyxFQURHO0VBQUEsQ0FSVCxDQUFBOztBQUFBLG9CQVlBLElBQUEsR0FBTSxTQUFDLEVBQUQsRUFBSyxTQUFMLEdBQUE7V0FDQSxJQUFBLEdBQUEsQ0FBSSxHQUFHLENBQUMsSUFBUixFQUFjLEVBQWQsRUFBa0IsU0FBbEIsRUFBNkIsSUFBQyxDQUFBLFNBQTlCLEVBREE7RUFBQSxDQVpOLENBQUE7O0FBQUEsb0JBZ0JBLFNBQUEsR0FBVyxTQUFDLEVBQUQsRUFBSyxTQUFMLEdBQUE7V0FDTCxJQUFBLEdBQUEsQ0FBSSxHQUFHLENBQUMsU0FBUixFQUFtQixFQUFuQixFQUF1QixTQUF2QixFQUFrQyxJQUFDLENBQUEsU0FBbkMsRUFESztFQUFBLENBaEJYLENBQUE7O0FBQUEsb0JBbUJBLE9BQUEsR0FBUyxTQUFBLEdBQUE7V0FDSCxJQUFBLEdBQUEsQ0FBSSxHQUFHLENBQUMsT0FBUixFQUFpQixJQUFqQixFQUF1QixJQUF2QixFQUE2QixJQUFDLENBQUEsU0FBOUIsRUFERztFQUFBLENBbkJULENBQUE7O2lCQUFBOztJQVhGLENBQUE7O0FBQUE7QUFrQ0Usb0NBQUEsQ0FBQTs7QUFBYSxFQUFBLHlCQUFBLEdBQUE7QUFDWCxJQUFBLElBQUMsQ0FBQSxTQUFELEdBQWE7QUFBQSxNQUFBLFFBQUEsRUFBVSxJQUFWO0tBQWIsQ0FEVztFQUFBLENBQWI7O3lCQUFBOztHQUQ0QixRQWpDOUIsQ0FBQTs7Ozs7QUNBQSxJQUFBLDhDQUFBOztBQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FBZCxDQUFBOztBQUFBLE9BQ0EsR0FBVSxPQUFBLENBQVEsV0FBUixDQURWLENBQUE7O0FBQUEsYUFFZSxPQUFBLENBQVEsUUFBUixFQUFkLFVBRkQsQ0FBQTs7QUFJQTtBQUFBOztHQUpBOztBQUFBLE1BT00sQ0FBQyxPQUFQLEdBQ007QUFFSix5QkFBQSxJQUFBLEdBQVUsSUFBQSxPQUFBLENBQUEsQ0FBVixDQUFBOztBQUVhLEVBQUEsc0JBQUUsRUFBRixHQUFBO0FBQ1gsSUFEWSxJQUFDLENBQUEsS0FBQSxFQUNiLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsV0FBQSxDQUFBLENBQWhCLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsVUFBQSxDQUFXLFNBQUMsQ0FBRCxHQUFBO2FBQU8sQ0FBQyxDQUFDLEtBQVQ7SUFBQSxDQUFYLENBRGxCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsVUFBQSxDQUFXLFNBQUMsQ0FBRCxHQUFBO2FBQU8sQ0FBQyxDQUFDLEtBQVQ7SUFBQSxDQUFYLENBRm5CLENBRFc7RUFBQSxDQUZiOztBQUFBLHlCQU9BLFlBQUEsR0FBYyxTQUFDLEtBQUQsRUFBUSxLQUFSLEdBQUE7V0FDWixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsS0FBdkIsRUFBOEIsS0FBOUIsRUFEWTtFQUFBLENBUGQsQ0FBQTs7QUFBQSx5QkFVQSxvQkFBQSxHQUFzQixTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUEsQ0FWdEIsQ0FBQTs7QUFBQSx5QkFhQSxZQUFBLEdBQWMsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE9BQWIsR0FBQTtBQUNaLFFBQUEsVUFBQTtBQUFBLElBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLElBQWYsRUFBcUIsT0FBckIsQ0FBYixDQUFBO0FBQUEsSUFDQSxVQUFVLENBQUMsSUFBWCxHQUFrQixJQURsQixDQUFBO0FBQUEsSUFFQSxVQUFVLENBQUMsSUFBWCxHQUFrQixPQUZsQixDQUFBO1dBR0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLFVBQWpCLEVBSlk7RUFBQSxDQWJkLENBQUE7O0FBQUEseUJBbUJBLGFBQUEsR0FBZSxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsT0FBYixHQUFBO0FBQ2IsUUFBQSxVQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsSUFBZixFQUFxQixPQUFyQixDQUFiLENBQUE7QUFBQSxJQUNBLFVBQVUsQ0FBQyxJQUFYLEdBQWtCLElBRGxCLENBQUE7QUFBQSxJQUVBLFVBQVUsQ0FBQyxJQUFYLEdBQWtCLFFBRmxCLENBQUE7V0FHQSxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBa0IsVUFBbEIsRUFKYTtFQUFBLENBbkJmLENBQUE7O3NCQUFBOztJQVZGLENBQUE7Ozs7O0FDQUEsSUFBQSxnQkFBQTs7QUFBQSxNQUFRLE9BQUEsQ0FBUSxTQUFSLEVBQVAsR0FBRCxDQUFBOztBQUFBLE1BYU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxFQUFBLHFCQUFBLEdBQUE7QUFDWCxJQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsRUFBYixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLEVBRGIsQ0FEVztFQUFBLENBQWI7O0FBQUEsd0JBSUEsWUFBQSxHQUFjLFNBQUMsS0FBRCxFQUFRLEtBQVIsR0FBQTtXQUVaLElBQUMsQ0FBQSxTQUFVLENBQUEsS0FBQSxDQUFYLEdBQW9CLE1BRlI7RUFBQSxDQUpkLENBQUE7O0FBQUEsd0JBUUEsY0FBQSxHQUFnQixTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsV0FBYixHQUFBO0FBRWQsUUFBQSxRQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLEVBQW9CLFdBQXBCLENBQVgsQ0FBQTtXQUNBLElBQUMsQ0FBQSxTQUFVLENBQUEsSUFBQSxDQUFYLEdBQW1CLFNBSEw7RUFBQSxDQVJoQixDQUFBOztBQUFBLHdCQTZCQSxhQUFBLEdBQWUsU0FBQyxDQUFELEdBQUE7QUFDYixRQUFBLGdEQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsd0JBQVgsQ0FBQTtBQUFBLElBQ0EsQ0FBQSxHQUFJLE1BQUEsQ0FBQSxDQURKLENBQUE7QUFFQSxJQUFBLElBQUcsQ0FBQSxLQUFLLFFBQVI7QUFDRSxNQUFBLElBQUcsQ0FBQSxJQUFLLElBQUMsQ0FBQSxTQUFUO0FBRUUsZUFBTztBQUFBLFVBQUMsSUFBQSxFQUFNLE9BQVA7QUFBQSxVQUFnQixJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQVUsQ0FBQSxDQUFBLENBQWpDO1NBQVAsQ0FGRjtPQUFBO0FBR0EsTUFBQSxJQUFHLENBQUEsSUFBSyxJQUFDLENBQUEsU0FBVDtBQUVFLGVBQU87QUFBQSxVQUFDLElBQUEsRUFBTSxLQUFQO0FBQUEsVUFBYyxJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQVUsQ0FBQSxDQUFBLENBQS9CO1NBQVAsQ0FGRjtPQUhBO0FBT0EsYUFBTztBQUFBLFFBQUMsSUFBQSxFQUFNLFNBQVA7QUFBQSxRQUFrQixJQUFBLEVBQU0sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxRQUFWLEVBQW9CLE1BQXBCLENBQXhCO09BQVAsQ0FSRjtLQUFBLE1BU0ssSUFBRyxDQUFBLEtBQUssUUFBUjtBQUNILE1BQUEsSUFBRyxDQUFBLFlBQWEsTUFBaEI7QUFDRSxlQUFPO0FBQUEsVUFBQyxJQUFBLEVBQU0sT0FBUDtBQUFBLFVBQWdCLElBQUEsRUFBTSxDQUFDLENBQUMsTUFBeEI7U0FBUCxDQURGO09BQUEsTUFFSyxJQUFHLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFIO0FBQ0gsUUFBQSxLQUFBLEdBQVEsRUFBUixDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsRUFEVixDQUFBO0FBRUEsYUFBQSx3Q0FBQTtzQkFBQTtBQUNFLFVBQUEsSUFBRyxDQUFBLEdBQUEsSUFBVyxJQUFDLENBQUEsU0FBZjtBQUNFLGtCQUFVLElBQUEsU0FBQSxDQUFVLHFDQUFWLENBQVYsQ0FERjtXQUFBO0FBQUEsVUFFQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFNBQVUsQ0FBQSxHQUFBLENBRmxCLENBQUE7QUFBQSxVQUdBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUhBLENBQUE7QUFBQSxVQUlBLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUF4QixDQUpBLENBREY7QUFBQSxTQUZBO0FBUUEsZUFBTztBQUFBLFVBQUMsSUFBQSxFQUFNLEtBQVA7QUFBQSxVQUFjLEtBQUEsRUFBTyxLQUFyQjtBQUFBLFVBQTRCLE9BQUEsRUFBUyxPQUFyQztTQUFQLENBVEc7T0FIRjtLQVhMO0FBd0JBLFVBQVUsSUFBQSxTQUFBLENBQVcsR0FBQSxHQUFHLENBQUgsR0FBSywrQ0FBaEIsQ0FBVixDQXpCYTtFQUFBLENBN0JmLENBQUE7O0FBQUEsd0JBd0RBLGlCQUFBLEdBQW1CLFNBQUMsVUFBRCxHQUFBO0FBQ2pCLFdBQU8sU0FBQyxJQUFELEVBQU8sT0FBUCxHQUFBO0FBQ0wsVUFBQSxxQ0FBQTtBQUFBO1dBQUEsaURBQUE7MkJBQUE7QUFDRSxRQUFBLE9BQUEsR0FBVSxLQUFBLEdBQVEsT0FBUSxDQUFBLENBQUMsQ0FBQyxXQUFGLENBQTFCLENBQUE7QUFDQSxRQUFBLElBQUcsbUJBQUg7QUFDRSxVQUFBLE9BQUEsR0FBVSxDQUFDLENBQUMsU0FBRixDQUFZLE9BQVosQ0FBVixDQURGO1NBREE7QUFBQSxzQkFJQSxJQUFLLENBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBTCxHQUFhLFFBSmIsQ0FERjtBQUFBO3NCQURLO0lBQUEsQ0FBUCxDQURpQjtFQUFBLENBeERuQixDQUFBOztBQUFBLHdCQXVFQSxZQUFBLEdBQWMsU0FBQyxJQUFELEVBQU8sV0FBUCxHQUFBO0FBQ1osUUFBQSw4VEFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFjLENBRGQsQ0FBQTtBQUFBLElBRUEsVUFBQSxHQUFhLEVBRmIsQ0FBQTtBQUFBLElBR0EsaUJBQUEsR0FBb0IsS0FIcEIsQ0FBQTtBQUFBLElBSUEsc0JBQUEsR0FBeUIsRUFKekIsQ0FBQTtBQU1BLFNBQUEsbURBQUE7a0JBQUE7QUFDRSxNQUFBLFNBQUEseUJBQVksV0FBYSxDQUFBLENBQUEsR0FBSSxDQUFKLFVBQXpCLENBQUE7QUFBQSxNQUVBLGFBQUEsR0FBZ0IsaUJBRmhCLENBQUE7QUFBQSxNQUlBLElBQUEsR0FBTyxJQUFDLENBQUEsYUFBRCxDQUFlLENBQWYsQ0FKUCxDQUFBO0FBQUEsTUFLQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBTGhCLENBQUE7QUFPQSxNQUFBLElBQUcsSUFBSSxDQUFDLElBQUwsS0FBYSxLQUFoQjtBQUNFLFFBQUEsSUFBRyxhQUFIO0FBQ0UsVUFBQSxHQUFBLEdBQVUsSUFBQSxTQUFBLENBQVUseUNBQVYsQ0FBVixDQUFBO0FBQUEsVUFDQSxHQUFHLENBQUMsUUFBSixHQUFlLENBRGYsQ0FBQTtBQUFBLFVBRUEsR0FBRyxDQUFDLFNBQUosR0FBZ0IsQ0FGaEIsQ0FBQTtBQUdBLGdCQUFNLEdBQU4sQ0FKRjtTQUFBO0FBQUEsUUFNQSxTQUFBLElBQWMsS0FBQSxHQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFiLENBQWtCLEdBQWxCLENBQUQsQ0FBSixHQUE0QixHQU4xQyxDQUFBO0FBT0E7QUFBQSxhQUFBLDZDQUFBOzhCQUFBO0FBQ0UsVUFBQSxnQkFBQSxHQUFtQixXQUFuQixDQUFBO0FBQ0E7QUFBQSxlQUFBLDhDQUFBO2dDQUFBO0FBQ0UsWUFBQSxNQUFBLEdBQVMsR0FBRyxDQUFDLEtBQUosQ0FBVSxPQUFWLENBQVQsQ0FBQTtBQUFBLFlBQ0EsbUJBQUEsR0FBc0IsZ0JBQUEsR0FBbUIsT0FBTyxDQUFDLFdBRGpELENBQUE7QUFBQSxZQUVBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLG1CQUZyQixDQUFBO0FBQUEsWUFHQSxXQUFBLEdBQWMsbUJBSGQsQ0FBQTtBQUFBLFlBSUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsTUFBaEIsQ0FKQSxDQURGO0FBQUEsV0FGRjtBQUFBLFNBUkY7T0FBQSxNQWlCSyxJQUFHLElBQUksQ0FBQyxJQUFMLEtBQWEsS0FBaEI7QUFDSCxRQUFBLElBQUcsYUFBSDtBQUNFLFVBQUEsR0FBQSxHQUFVLElBQUEsU0FBQSxDQUFVLGlDQUFWLENBQVYsQ0FBQTtBQUFBLFVBQ0EsR0FBRyxDQUFDLFFBQUosR0FBZSxDQURmLENBQUE7QUFBQSxVQUVBLEdBQUcsQ0FBQyxTQUFKLEdBQWdCLENBRmhCLENBQUE7QUFHQSxnQkFBTSxHQUFOLENBSkY7U0FBQTtBQUFBLFFBS0EsU0FBQSxJQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BTDdCLENBQUE7QUFBQSxRQU9BLGdCQUFBLEdBQW1CLFdBUG5CLENBQUE7QUFRQTtBQUFBLGFBQUEsOENBQUE7OEJBQUE7QUFDRSxVQUFBLE1BQUEsR0FBUyxHQUFHLENBQUMsS0FBSixDQUFVLE9BQVYsQ0FBVCxDQUFBO0FBQUEsVUFDQSxtQkFBQSxHQUFzQixnQkFBQSxHQUFtQixPQUFPLENBQUMsV0FEakQsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLFdBQVAsR0FBcUIsbUJBRnJCLENBQUE7QUFBQSxVQUdBLFdBQUEsR0FBYyxtQkFIZCxDQUFBO0FBQUEsVUFJQSxVQUFVLENBQUMsSUFBWCxDQUFnQixNQUFoQixDQUpBLENBREY7QUFBQSxTQVRHO09BQUEsTUFBQTtBQWdCSCxRQUFBLElBQUcsYUFBSDtBQUNFLFVBQUEsWUFBQSxHQUFlLGlCQUFBLElBQTBCLDRCQUF6QyxDQUFBO0FBQUEsVUFDQSxpQkFBQSxHQUFvQixnREFBc0IsS0FBdEIsQ0FBQSxLQUFnQyxpQkFEcEQsQ0FBQTtBQUVBLFVBQUEsSUFBRyxZQUFBLElBQWdCLGlCQUFuQjtBQUNFLFlBQUEsSUFBRyxDQUFBLGlCQUFIO0FBR0UsY0FBQSxpQkFBQSxHQUFvQixJQUFwQixDQUhGO2FBQUEsTUFBQTtBQU1FLGNBQUEsaUJBQUEsR0FBb0IsS0FBcEIsQ0FBQTtBQUFBLGNBRUEsU0FBQSxJQUFjLEtBQUEsR0FBSyxzQkFBTCxHQUE0QixJQUYxQyxDQUFBO0FBQUEsY0FHQSxzQkFBQSxHQUF5QixFQUh6QixDQU5GO2FBREY7V0FGQTtBQWFBLFVBQUEsSUFBRyxTQUFTLENBQUMsSUFBVixLQUFrQixHQUFHLENBQUMsT0FBekI7QUFDRSxZQUFBLFdBQUEsRUFBQSxDQUFBO0FBQUEsWUFDQSxRQUFBLEdBQVksR0FBQSxHQUFHLElBQUksQ0FBQyxJQUFSLEdBQWEsR0FEekIsQ0FBQTtBQUFBLFlBRUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBaEIsQ0FGQSxDQUFBO0FBQUEsWUFHQSxTQUFTLENBQUMsV0FBVixHQUF3QixXQUh4QixDQURGO1dBZEY7U0FBQSxNQW1CSyxJQUFHLGlCQUFIO0FBRUgsVUFBQSxpQkFBQSxHQUFvQixLQUFwQixDQUFBO0FBQUEsVUFDQSxTQUFBLElBQWMsS0FBQSxHQUFLLHNCQUFMLEdBQTRCLElBRDFDLENBQUE7QUFBQSxVQUVBLHNCQUFBLEdBQXlCLEVBRnpCLENBRkc7U0FuQkw7QUF5QkEsUUFBQSxJQUFHLGlCQUFIO0FBQ0UsVUFBQSxzQkFBQSxJQUEwQixRQUExQixDQURGO1NBQUEsTUFBQTtBQUdFLFVBQUEsU0FBQSxJQUFhLFFBQWIsQ0FIRjtTQXpDRztPQXpCUDtBQUFBLEtBTkE7QUFBQSxJQTZFQSxRQUFBLEdBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBVyxJQUFBLE1BQUEsQ0FBTyxTQUFQLENBQVg7QUFBQSxNQUNBLFVBQUEsRUFBWSxVQURaO0tBOUVGLENBQUE7QUFpRkEsV0FBTyxRQUFQLENBbEZZO0VBQUEsQ0F2RWQsQ0FBQTs7QUFBQSx3QkE2SkEsSUFBQSxHQUFNLFNBQUMsSUFBRCxFQUFPLFdBQVAsR0FBQTtBQUNKLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsWUFBRCxDQUFjLElBQWQsRUFBb0IsV0FBcEIsQ0FBWCxDQUFBO0FBQUEsSUFFQSxNQUFBLEdBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxRQUFRLENBQUMsS0FBaEI7QUFBQSxNQUNBLE9BQUEsRUFBUyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsUUFBUSxDQUFDLFVBQTVCLENBRFQ7S0FIRixDQUFBO0FBS0EsV0FBTyxNQUFQLENBTkk7RUFBQSxDQTdKTixDQUFBOztxQkFBQTs7SUFmRixDQUFBOzs7OztBQ0FBLElBQUEsdUJBQUE7O0FBQUEsYUFBZSxPQUFBLENBQVEsUUFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxNQVVNLENBQUMsT0FBUCxHQUNNO0FBQ1MsRUFBQSxxQkFBQSxHQUFBO0FBQ1gsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBQVosQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLFVBQUEsQ0FBVyxTQUFDLENBQUQsR0FBQTthQUFPLENBQUMsQ0FBQyxHQUFUO0lBQUEsQ0FBWCxDQURkLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxjQUFELEdBQWtCLEVBRmxCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxlQUFELEdBQW1CLEVBSG5CLENBRFc7RUFBQSxDQUFiOztBQUFBLHdCQU1BLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixJQUFBLElBQUcsQ0FBQSxJQUFLLENBQUEsUUFBUjtBQUNFLFlBQUEsQ0FERjtLQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsY0FBRCxHQUFrQixFQUhsQixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsZUFBRCxHQUFtQixFQUpuQixDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxJQUFELEdBQUE7QUFDWCxZQUFBLGVBQUE7QUFBQSxRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQWhCLENBQXVCLFNBQUMsQ0FBRCxHQUFBO2lCQUFPLENBQUMsQ0FBQyxRQUFUO1FBQUEsQ0FBdkIsQ0FBVCxDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFqQixDQUF3QixTQUFDLENBQUQsR0FBQTtpQkFBTyxDQUFDLENBQUMsUUFBVDtRQUFBLENBQXhCLENBRFYsQ0FBQTtBQUFBLFFBRUEsS0FBQyxDQUFBLGNBQUQsR0FBa0IsS0FBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixDQUF1QixNQUF2QixDQUZsQixDQUFBO2VBR0EsS0FBQyxDQUFBLGVBQUQsR0FBbUIsS0FBQyxDQUFBLGVBQWUsQ0FBQyxNQUFqQixDQUF3QixPQUF4QixFQUpSO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYixDQU5BLENBQUE7V0FZQSxJQUFDLENBQUEsUUFBRCxHQUFZLE1BYkE7RUFBQSxDQU5kLENBQUE7O0FBQUEsRUFxQkEsV0FBQyxDQUFBLFFBQUQsQ0FBVSxZQUFWLEVBQ0U7QUFBQSxJQUFBLEdBQUEsRUFBSyxTQUFBLEdBQUE7QUFDSCxNQUFBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBTyxJQUFDLENBQUEsY0FBUixDQUZHO0lBQUEsQ0FBTDtHQURGLENBckJBLENBQUE7O0FBQUEsRUEwQkEsV0FBQyxDQUFBLFFBQUQsQ0FBVSxhQUFWLEVBQ0U7QUFBQSxJQUFBLEdBQUEsRUFBSyxTQUFBLEdBQUE7QUFDSCxNQUFBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBTyxJQUFDLENBQUEsZUFBUixDQUZHO0lBQUEsQ0FBTDtHQURGLENBMUJBLENBQUE7O0FBQUEsd0JBaUNBLGVBQUEsR0FBaUIsU0FBQyxJQUFELEdBQUE7QUFDZixJQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBaEIsQ0FBcUIsU0FBQyxDQUFELEdBQUE7YUFBTyxDQUFDLENBQUMsT0FBRixHQUFZLEtBQW5CO0lBQUEsQ0FBckIsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQWpCLENBQXNCLFNBQUMsQ0FBRCxHQUFBO2FBQU8sQ0FBQyxDQUFDLE9BQUYsR0FBWSxLQUFuQjtJQUFBLENBQXRCLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsSUFBYixDQUZBLENBQUE7V0FHQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBSkc7RUFBQSxDQWpDakIsQ0FBQTs7QUFBQSx3QkF5Q0Esa0JBQUEsR0FBb0IsU0FBQyxFQUFELEdBQUE7V0FDbEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsRUFBZixFQURrQjtFQUFBLENBekNwQixDQUFBOztBQUFBLHdCQWlEQSxNQUFBLEdBQVEsU0FBQyxFQUFELEVBQUssT0FBTCxFQUFjLFFBQWQsR0FBQTtBQUNOLFFBQUEsaUJBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxFQUFaLENBQVAsQ0FBQTtBQUNBLElBQUEsSUFBTyxZQUFQO0FBQ0UsWUFBVSxJQUFBLGNBQUEsQ0FBZ0IseUJBQUEsR0FBeUIsRUFBekIsR0FBNEIsR0FBNUMsQ0FBVixDQURGO0tBREE7QUFHQSxJQUFBLElBQUcsa0JBQUEsSUFBYyxDQUFBLEtBQVMsQ0FBQyxPQUFOLENBQWMsUUFBZCxDQUFyQjtBQUNFLFlBQVUsSUFBQSxTQUFBLENBQVUsa0NBQVYsQ0FBVixDQUFBO0FBQ0EsWUFBQSxDQUZGO0tBSEE7QUFPQSxJQUFBLElBQU8sa0JBQUosSUFBaUIsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBdkM7QUFDRSxNQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBaEIsQ0FBcUIsU0FBQyxDQUFELEdBQUE7ZUFBTyxDQUFDLENBQUMsT0FBRixHQUFZLFFBQW5CO01BQUEsQ0FBckIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQWpCLENBQXNCLFNBQUMsQ0FBRCxHQUFBO2VBQU8sQ0FBQyxDQUFDLE9BQUYsR0FBWSxRQUFuQjtNQUFBLENBQXRCLENBREEsQ0FERjtLQUFBLE1BQUE7QUFJRSxNQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBaEIsQ0FBcUIsU0FBQyxDQUFELEdBQUE7ZUFBTyxDQUFDLENBQUMsT0FBRixHQUFZLENBQUEsUUFBbkI7TUFBQSxDQUFyQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBakIsQ0FBc0IsU0FBQyxDQUFELEdBQUE7ZUFBTyxDQUFDLENBQUMsT0FBRixHQUFZLENBQUEsUUFBbkI7TUFBQSxDQUF0QixDQURBLENBQUE7QUFFQSxXQUFBLCtDQUFBO3lCQUFBO0FBQ0UsUUFBQSxJQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBaEIsQ0FBb0IsQ0FBcEIsQ0FBSDtBQUNFLFVBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFoQixDQUFvQixDQUFwQixDQUFzQixDQUFDLE9BQXZCLEdBQWlDLE9BQWpDLENBREY7U0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFqQixDQUFxQixDQUFyQixDQUFIO0FBQ0gsVUFBQSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQWpCLENBQXFCLENBQXJCLENBQXVCLENBQUMsT0FBeEIsR0FBa0MsT0FBbEMsQ0FERztTQUhQO0FBQUEsT0FORjtLQVBBO1dBa0JBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FuQk47RUFBQSxDQWpEUixDQUFBOztBQUFBLHdCQTBFQSxNQUFBLEdBQVEsU0FBQyxFQUFELEVBQUssUUFBTCxHQUFBO1dBQ04sSUFBQyxDQUFBLE1BQUQsQ0FBUSxFQUFSLEVBQVksSUFBWixFQUFrQixRQUFsQixFQURNO0VBQUEsQ0ExRVIsQ0FBQTs7QUFBQSx3QkFpRkEsT0FBQSxHQUFTLFNBQUMsRUFBRCxFQUFLLFFBQUwsR0FBQTtXQUNQLElBQUMsQ0FBQSxNQUFELENBQVEsRUFBUixFQUFZLEtBQVosRUFBbUIsUUFBbkIsRUFETztFQUFBLENBakZULENBQUE7O3FCQUFBOztJQVpGLENBQUE7Ozs7O0FDZ0RBLElBQUEsZUFBQTs7QUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO3FCQUVKOztBQUFBLGtCQUFBLElBQUEsR0FBTSxJQUFOLENBQUE7O0FBQUEsa0JBR0EsSUFBQSxHQUFNLElBSE4sQ0FBQTs7QUFBQSxrQkFNQSxNQUFBLEdBQVEsSUFOUixDQUFBOztBQUFBLGtCQVNBLFFBQUEsR0FBVSxFQVRWLENBQUE7O0FBQUEsa0JBWUEsVUFBQSxHQUFZLElBWlosQ0FBQTs7QUFBQSxrQkFlQSxXQUFBLEdBQWEsSUFmYixDQUFBOztBQUFBLGtCQWtCQSxXQUFBLEdBQWEsSUFsQmIsQ0FBQTs7ZUFBQTs7SUFIRixDQUFBOztBQUFBLE1BeUJNLENBQUMsT0FBTyxDQUFDLEdBQWYsR0FDTTtBQUNKLEVBQUEsUUFBQyxDQUFBLFNBQUQsR0FBWSxXQUFaLENBQUE7O0FBQUEsRUFDQSxRQUFDLENBQUEsT0FBRCxHQUFVLFNBRFYsQ0FBQTs7QUFBQSxFQUVBLFFBQUMsQ0FBQSxJQUFELEdBQU8sTUFGUCxDQUFBOztBQUFBLEVBR0EsUUFBQyxDQUFBLFNBQUQsR0FBWSxXQUhaLENBQUE7O0FBQUEsRUFJQSxRQUFDLENBQUEsT0FBRCxHQUFVLFNBSlYsQ0FBQTs7QUFBQSxFQU1BLFFBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxPQUFELEdBQUE7QUFDTixRQUFBLGtCQUFBO0FBQUEsSUFBQSxNQUFBLEdBQWEsSUFBQSxRQUFBLENBQVMsT0FBTyxDQUFDLElBQWpCLEVBQXVCLE9BQU8sQ0FBQyxFQUEvQixFQUFtQyxPQUFPLENBQUMsU0FBM0MsQ0FBYixDQUFBO0FBQ0EsU0FBQSxjQUFBOzJCQUFBO0FBQ0UsTUFBQSxJQUFHLE9BQU8sQ0FBQyxjQUFSLENBQXVCLEdBQXZCLENBQUg7QUFDRSxRQUFBLE1BQU8sQ0FBQSxHQUFBLENBQVAsR0FBYyxLQUFkLENBREY7T0FERjtBQUFBLEtBREE7QUFJQSxXQUFPLE1BQVAsQ0FMTTtFQUFBLENBTlIsQ0FBQTs7QUFhYSxFQUFBLGtCQUFFLElBQUYsRUFBUyxFQUFULEVBQWMsU0FBZCxFQUF5QixTQUF6QixHQUFBO0FBQ1gsUUFBQSxVQUFBO0FBQUEsSUFEWSxJQUFDLENBQUEsT0FBQSxJQUNiLENBQUE7QUFBQSxJQURtQixJQUFDLENBQUEsS0FBQSxFQUNwQixDQUFBO0FBQUEsSUFEd0IsSUFBQyxDQUFBLFlBQUEsU0FDekIsQ0FBQTtBQUFBLElBQUEsSUFBRyxpQkFBSDtBQUNFLFdBQUEsZ0JBQUE7K0JBQUE7QUFDRSxRQUFBLElBQUUsQ0FBQSxHQUFBLENBQUYsR0FBUyxLQUFULENBREY7QUFBQSxPQURGO0tBRFc7RUFBQSxDQWJiOztrQkFBQTs7SUEzQkYsQ0FBQTs7Ozs7QUNoREEsSUFBQSxVQUFBOztBQUFBLFFBQVEsQ0FBQSxTQUFFLENBQUEsUUFBVixHQUFxQixTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7U0FDbkIsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsSUFBQyxDQUFBLFNBQXZCLEVBQWtDLElBQWxDLEVBQXdDLElBQXhDLEVBRG1CO0FBQUEsQ0FBckIsQ0FBQTs7QUFBQSxNQUdNLENBQUMsT0FBTyxDQUFDLFVBQWYsR0FDTTtBQUNTLEVBQUEsb0JBQUUsVUFBRixHQUFBO0FBQ1gsSUFEWSxJQUFDLENBQUEsYUFBQSxVQUNiLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsRUFBUixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBRFQsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUZYLENBRFc7RUFBQSxDQUFiOztBQUFBLHVCQUtBLEdBQUEsR0FBSyxTQUFDLEdBQUQsR0FBQTtBQUNILFdBQU8sR0FBQSxJQUFPLElBQUMsQ0FBQSxJQUFmLENBREc7RUFBQSxDQUxMLENBQUE7O0FBQUEsdUJBUUEsR0FBQSxHQUFLLFNBQUMsR0FBRCxHQUFBO0FBRUgsV0FBTyxJQUFDLENBQUEsT0FBUSxDQUFBLElBQUMsQ0FBQSxJQUFLLENBQUEsR0FBQSxDQUFOLENBQWhCLENBRkc7RUFBQSxDQVJMLENBQUE7O0FBQUEsdUJBY0EsSUFBQSxHQUFNLFNBQUMsSUFBRCxHQUFBO0FBQ0osUUFBQSxHQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLENBQU4sQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksR0FBWixDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FGQSxDQUFBO1dBR0EsSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQU4sR0FBYSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsR0FBa0IsRUFKM0I7RUFBQSxDQWROLENBQUE7O0FBQUEsdUJBc0JBLE1BQUEsR0FBUSxTQUFDLEdBQUQsR0FBQTtBQUNOLFVBQVUsSUFBQSxLQUFBLENBQU0sNEJBQU4sQ0FBVixDQURNO0VBQUEsQ0F0QlIsQ0FBQTs7QUFBQSx1QkF5QkEsSUFBQSxHQUFNLFNBQUMsUUFBRCxHQUFBO0FBQ0osUUFBQSw4QkFBQTtBQUFBO0FBQUE7U0FBQSxtREFBQTtrQkFBQTtBQUNFLHFEQUFBLFNBQVUsR0FBRyxZQUFiLENBREY7QUFBQTtvQkFESTtFQUFBLENBekJOLENBQUE7O0FBQUEsdUJBNkJBLE1BQUEsR0FBUSxTQUFDLENBQUQsR0FBQTtBQUNOLFFBQUEsOEJBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxFQUFYLENBQUE7QUFDQTtBQUFBLFNBQUEsbURBQUE7a0JBQUE7QUFDRSxNQUFBLDhCQUFHLEVBQUcsR0FBRyxXQUFUO0FBQ0UsUUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLENBQWQsQ0FBQSxDQURGO09BREY7QUFBQSxLQURBO0FBSUEsV0FBTyxRQUFQLENBTE07RUFBQSxDQTdCUixDQUFBOztBQUFBLEVBb0NBLFVBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFFBQUo7SUFBQSxDQUFMO0dBREYsQ0FwQ0EsQ0FBQTs7QUFBQSxFQXVDQSxVQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFDRTtBQUFBLElBQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxNQUFKO0lBQUEsQ0FBTDtHQURGLENBdkNBLENBQUE7O0FBQUEsRUEwQ0EsVUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBQ0U7QUFBQSxJQUFBLEdBQUEsRUFBSyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVo7SUFBQSxDQUFMO0dBREYsQ0ExQ0EsQ0FBQTs7b0JBQUE7O0lBTEYsQ0FBQTs7Ozs7QUNBQSxJQUFBLGtCQUFBO0VBQUE7aVNBQUE7O0FBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSx1QkFBUixDQUFmLENBQUE7O0FBQUEsTUFFTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHlCQUFBLENBQUE7O0FBQWEsRUFBQSxjQUFBLEdBQUE7QUFDWCxJQUFBLHNDQUFNLE1BQU4sQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsWUFBRCxDQUFjLEdBQWQsRUFBd0IsV0FBeEIsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsWUFBRCxDQUFjLEdBQWQsRUFBd0IsR0FBeEIsQ0FIQSxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsWUFBRCxDQUFjLEdBQWQsRUFBd0IsS0FBeEIsQ0FKQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsWUFBRCxDQUFjLEdBQWQsRUFBd0IsU0FBeEIsQ0FMQSxDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsWUFBRCxDQUFjLE9BQWQsRUFBd0IsZ0JBQXhCLENBTkEsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxLQUFkLEVBQXdCLFVBQXhCLENBUEEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLEVBQXdCLGFBQXhCLENBUkEsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxLQUFkLEVBQXdCLFVBQXhCLENBVEEsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLG9CQUFELENBQXNCLEdBQXRCLEVBQTJCLEdBQTNCLENBWEEsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLG9CQUFELENBQXNCLEdBQXRCLEVBQTJCLEdBQTNCLENBWkEsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLG9CQUFELENBQXNCLEdBQXRCLEVBQTJCLEdBQTNCLENBYkEsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLG9CQUFELENBQXNCLEdBQXRCLEVBQTJCLEdBQTNCLENBZEEsQ0FBQTtBQUFBLElBZUEsSUFBQyxDQUFBLG9CQUFELENBQXNCLEtBQXRCLENBZkEsQ0FBQTtBQUFBLElBaUJBLElBQUMsQ0FBQSxZQUFELENBQWMsT0FBZCxFQUF1QixDQUFDLEdBQUQsRUFBTSxPQUFOLEVBQWUsR0FBZixDQUF2QixDQWpCQSxDQUFBO0FBQUEsSUFtQkEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxZQUFkLEVBQTRCLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLFNBQWhCLEVBQTJCLEdBQTNCLENBQTVCLEVBQ0U7QUFBQSxNQUFBLENBQUEsRUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sQ0FBZ0IsT0FBaEIsRUFBeUIsU0FBQyxJQUFELEdBQUE7ZUFBVSxJQUFJLENBQUMsT0FBZjtNQUFBLENBQXpCLENBQUg7QUFBQSxNQUNBLENBQUEsRUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBZ0IsT0FBaEIsQ0FESDtLQURGLENBbkJBLENBQUE7QUFBQSxJQXVCQSxJQUFDLENBQUEsWUFBRCxDQUFjLGVBQWQsRUFBK0IsQ0FBQyxHQUFELEVBQU0sYUFBTixFQUFxQixLQUFyQixFQUE0QixHQUE1QixDQUEvQixFQUNFO0FBQUEsTUFBQSxDQUFBLEVBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQWdCLE9BQWhCLENBQUg7QUFBQSxNQUNBLENBQUEsRUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sQ0FBZ0IsT0FBaEIsRUFBeUIsU0FBQyxDQUFELEdBQUE7QUFBTyxRQUFBLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRixLQUFRLEdBQVg7aUJBQW9CLEVBQXBCO1NBQUEsTUFBQTtpQkFBMkIsRUFBM0I7U0FBUDtNQUFBLENBQXpCLENBREg7S0FERixDQXZCQSxDQUFBO0FBQUEsSUEyQkEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxlQUFkLEVBQStCLENBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxHQUFmLENBQS9CLEVBQ0U7QUFBQSxNQUFBLENBQUEsRUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBZ0IsS0FBaEIsQ0FBSDtLQURGLENBM0JBLENBQUE7QUFBQSxJQThCQSxJQUFDLENBQUEsWUFBRCxDQUFjLGFBQWQsRUFBNkIsQ0FBQyxHQUFELEVBQU0sS0FBTixFQUFhLEdBQWIsRUFBa0IsUUFBbEIsRUFBNEIsR0FBNUIsRUFBaUMsS0FBakMsRUFBd0MsR0FBeEMsQ0FBN0IsRUFDRTtBQUFBLE1BQUEsQ0FBQSxFQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFnQixLQUFoQixDQUFIO0tBREYsQ0E5QkEsQ0FBQTtBQUFBLElBaUNBLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBZCxFQUFzQixFQUF0QixDQWpDQSxDQUFBO0FBQUEsSUFtQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxVQUFkLEVBQTBCLEVBQTFCLENBbkNBLENBQUE7QUFBQSxJQXFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLFdBQWQsRUFBMkIsRUFBM0IsQ0FyQ0EsQ0FBQTtBQUFBLElBdUNBLElBQUMsQ0FBQSxZQUFELENBQWMsWUFBZCxFQUE0QixFQUE1QixDQXZDQSxDQUFBO0FBQUEsSUErQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxXQUFkLEVBQTJCLEVBQTNCLENBL0NBLENBQUE7QUFBQSxJQWlEQSxJQUFDLENBQUEsYUFBRCxDQUFlLGtCQUFmLEVBQW1DLEVBQW5DLENBakRBLENBQUE7QUFBQSxJQW1EQSxJQUFDLENBQUEsYUFBRCxDQUFlLFFBQWYsRUFBeUIsRUFBekIsQ0FuREEsQ0FBQTtBQUFBLElBcURBLElBQUMsQ0FBQSxhQUFELENBQWUsV0FBZixFQUE0QixFQUE1QixDQXJEQSxDQURXO0VBQUEsQ0FBYjs7Y0FBQTs7R0FEaUIsYUFIbkIsQ0FBQTs7Ozs7QUNBQSxJQUFBLGlCQUFBO0VBQUE7aVNBQUE7O0FBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSx1QkFBUixDQUFmLENBQUE7O0FBQUEsTUFFTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdCQUFBLENBQUE7O0FBQWEsRUFBQSxhQUFBLEdBQUE7QUFDWCxJQUFBLHFDQUFNLEtBQU4sQ0FBQSxDQURXO0VBQUEsQ0FBYjs7YUFBQTs7R0FEZ0IsYUFIbEIsQ0FBQTs7Ozs7QUNBQSxJQUFBLDhCQUFBOztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUFYLENBQUE7O0FBQUEsSUFFQSxHQUFPLE9BQUEsQ0FBUSxhQUFSLENBRlAsQ0FBQTs7QUFBQSxHQUdBLEdBQU0sT0FBQSxDQUFRLFlBQVIsQ0FITixDQUFBOztBQUFBLElBS0EsR0FBVyxJQUFBLElBQUEsQ0FBQSxDQUxYLENBQUE7O0FBQUEsR0FNQSxHQUFVLElBQUEsR0FBQSxDQUFBLENBTlYsQ0FBQTs7QUFBQSxRQVFRLENBQUMsT0FBVCxHQUF1QixJQUFBLFFBQUEsQ0FBUyxDQUFDLElBQUQsRUFBTyxHQUFQLENBQVQsQ0FSdkIsQ0FBQTs7QUFBQSxNQVVNLENBQUMsT0FBUCxHQUFpQixRQVZqQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdlbmVyYXRvclxuICBjb25zdHJ1Y3RvcjogLT5cbiIsIlBhcnNlciA9IHJlcXVpcmUgJy4vcGFyc2VyJ1xuR2VuZXJhdG9yID0gcmVxdWlyZSAnLi9nZW5lcmF0b3InXG5SdWxlTWFuYWdlciA9IHJlcXVpcmUgJy4uL2NvcmUvcnVsZS1tYW5hZ2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDb21waWxlclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAcnVsZXMgPSBuZXcgUnVsZU1hbmFnZXIoKVxuICAgIEBwYXJzZXIgPSBuZXcgUGFyc2VyKEBydWxlcylcbiAgICAjIEBnZW5lcmF0b3IgPSBuZXcgR2VuZXJhdG9yKEBydWxlcylcblxuICBjb21waWxlOiAobWQpIC0+XG4gICAgcmV0dXJuIG1kXG4iLCIjIFRoZSBwYXJzZXIgcHJvY2Vzc2VzIGlucHV0IE1hcmtkb3duIHNvdXJjZSBhbmQgZ2VuZXJhdGVzIEFTVFxuIyAoYWJhc3RyYWN0IHN5bnRheCB0cmVlKSBmb3IgdGhlIGdlbmVyYXRvciB0byBjb25zdW1lLlxuI1xuIyAjIyBUZXJtaW5vbG9neVxuI1xuIyAqICoqRG9jdW1lbnRzKiogYXJlIHRvcCBsZXZlbCByZXByZXNlbnRhdGlvbnMgb2YgcGFyc2VkIE1hcmtkb3duIGZpbGVzLlxuIyAqICoqU29saWQgYmxvY2tzKiogYXJlIGNvbnRpbnVvdXMgZG9jdW1lbnQgcGFydHMgY29uc2lzdCBvZiBvbmx5IGxlYWYgYmxvY2tzLlxuIyAqICoqRmx1aWQgYmxvY2tzKiogYXJlIGNvbnRpbnVvdXMgZG9jdW1lbnQgcGFydHMgdGhhdCBjb250YWlucyBjb250ZW50cyBvZlxuIyAgIGNvbnRhaW5lciBibG9ja3Mgd2l0aCBjbG9zaW5nIGVsZW1lbnRzIHlldCB0byBiZSBkZXRlcm1pbmVkLlxuI1xuIyBTZWUge0xhbmd1YWdlUGFja30gZm9yIGxhbmd1YWdlIHNwZWMgcmVsYXRlZCB0ZXJtaW5vbG9neS5cbiNcbiMgIyMgUGFyc2luZyBTdHJhdGVneVxuI1xuIyBUaGUgcGFyc2VyIGFwcGxpZXMgcnVsZXMgaW4gYSBkZXRlcm1pbmVkIG9yZGVyIChhLmsuYS4gcHJlY2VkZW5jZSkgdG8gYXZvaWRcbiMgYW55IGFtYmlndWl0eS4gVGhlIGVsZW1lbnRzIHRha2UgdGhlaXIgcHJlY2VkZW5jZSBpbiBmb2xsb3dpbmcgb3JkZXI6XG4jXG4jIDEuIENvbnRhaW5lciBibG9ja3NcbiMgMi4gTGVhZiBibG9ja3NcbiMgMy4gSW5saW5lIGVsZW1lbnRzXG4jXG4jIFRoZSBwYXJzZXIgcHJvY2Vzc2VzIGEgZG9jdW1lbnQgaW4gMiBwYXNzZXM6XG4jXG4jIDEuIERldGVybWluZSBibG9jayBzdHJ1Y3R1cmVzIGFuZCBhc3NpZ24gdW4tcGFyc2VkIHNvdXJjZSB0byBlYWNoIGJsb2NrIHRva2Vuc1xuIyAyLiBQYXJzZSBpbmxpbmUgdG9rZW5zIG9mIGVhY2ggYmxvY2tzXG4jXG4jICMjIyBCbG9jayBQYXJzaW5nXG4jXG4jIEJsb2NrIHBhcnNpbmcgaXMgaW1wbGVtZW50ZWQgaW4ge1BhcnNlciNfcGFyc2VCbG9ja3N9LlxuIyBVbmxpa2Ugb3RoZXIgTWFya2Rvd24gcGFyc2VyIGltcGxlbWVudGF0aW9ucywgTWFya1JpZ2h0IHBhcnNlciBkb2VzXG4jIG5vdCByZXF1aXJlIG1hdGNoZWQgcnVsZXMgdG8gYmUgYW5jaG9yZWQgYXQgdGhlIGJlZ2luaW5nIG9mIHRoZSBzdHJlYW0uXG4jIEluc3RlYWQsIHtQYXJzZXIjX19fcGFyc2VPbmVCbG9ja30gYXBwbGllcyBydWxlcyBmcm9tIGhpZ2hlc3QgcHJlY2VkZW5jZSB0b1xuIyBsb3dlc3QgYW5kIHJldHVybnMgdGhlIGZpcnN0IG1hdGNoIG5vIG1hdHRlciB3aGVyZSB0aGUgbWF0Y2gncyBsb2NhdGlvbiBpcy5cbiNcbiMgSXQgaXMgZXhwZWNlZCB0aGF0IHRoZSBmaXJzdCBtYXRjaCB1c3VhbGx5IG9jY3VycyBpbiB0aGUgbWlkZGxlIHRodXMgc3BsaXRpbmdcbiMgdGhlIHN0cmVhbSBpbnRvIHRocmVlIHBhcnRzOlxuI1xuIyBgYGBcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgRG9jdW1lbnQgQmVnaW5cbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgUGFyc2VkICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgT2Zmc2V0XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgUmVzaWR1YWwgQmVmb3JlICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgRmlyc3QgTWF0Y2ggICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgUmVzaWR1YWwgQWZ0ZXIgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rIERvY3VtZW50IEVuZFxuIyBgYGBcbiNcbiMgSWYgdGhlIGBGaXJzdCBNYXRjaGAgaXMgYSBsZWFmIGJsb2NrLCB0aGUgcGFyc2VyIGNhbiBzYWZlbHkgYXNzdW1lIHRoYXQgdGhlXG4jIGVudGlyZSBzdHJlYW0gaXMgb25lIHNvbGlkIGJsb2NrLiBIZW5jZSBib3RoIHJlc2lkdWFsIGJsb2NrcyBhcmUgc29saWQgdG9vLlxuIyBUaHVzIHRoZSBwYXJzaW5nIGNhbiBiZSBhY2hpdmVkIGJ5IHJlY3VzaXZlbHkgcGFyc2UgYW5kIHNwbGl0IHRoZSBzdHJlYW0gaW50b1xuIyBzbWFsbGVyIGFuZCBzbWFsbGVyIGJsb2NrcyB1bnRpbCB0aGUgZW50aXJlIHN0cmVhbSBpcyBwYXJzZWQuXG4jIFRoaXMgaXMgZG9uZSBieSB7UGFyc2VyI19fcGFyc2VTb2xpZEJsb2Nrc30uXG4jXG4jIElmIHRoZSBgRmlyc3QgTWF0Y2hgIGlzIGEgY29udGFpbmVyIGJsb2NrIHN0YXJ0IHRva2VuLCB0aGUgYFJlc2lkdWFsIEJlZm9yZWBcbiMgaXMga25vd24gdG8gYmUgYSBzb2xpZCBibG9jayBhbmQgY2FuIGJlIHBhcnNlZCB3aXRoXG4jIHtQYXJzZXIjX19wYXJzZVNvbGlkQmxvY2tzfS5cbiMgVGhlIGBSZXNpZHVhbCBBZnRlcmAgd291bGQgYmUgYSBmbHVpZCBibG9jazpcbiNcbiMgYGBgXG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgICAgRmlyc3QgTWF0Y2ggICAgICAgICB8IDwtLS0rIENvbnRhaW5lciBibG9jayBzdGFydCB0b2tlblxuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAoZS5nLiAnPiAnIGZvciBhIGJsb2NrcXVvdGUpXG4jICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jIFggICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4jIFggICAgICAgQ29udGVudCBvZiAgICAgICAgICBYIDwtLS0rIFJlc2lkdWFsIEFmdGVyIChGbHVpZCBCbG9jaylcbiMgWCAgICAgICBDb250YWluZXIgQmxvY2sgICAgIFhcbiMgWCAgICAgICAgICAgICAgICAgICAgICAgICAgIFhcbiMgWC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVggLS0tLT4gTmV3IG9mZnNldCBmb3IgbmV4dCBpdGVyYXRpb25cbiMgWCAgICAgICAgICAgICAgICAgICAgICAgICAgIFhcbiMgWCAgICAgICBVbi1wYXJzZWQgICAgICAgICAgIFhcbiMgWCAgICAgICAgICAgICAgICAgICAgICAgICAgIFhcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSsgRG9jdW1lbnQgRW5kXG4jIGBgYFxuI1xuIyBBIGZsdWlkIGJsb2NrIGlzIHBhcnNlZCBieSB7UGFyc2VyI19fcGFyc2VGbHVpZEJsb2Nrc30uIEl0IHBhcnNlcyB0aGUgZmx1aWRcbiMgYmxvY2sgbGluZWFybHkgYW5kIGxvb2tzIGZvciBsaW5lcyBzdGFydCB3aXRoIGNvbnRlbnQgYmxvY2sgZGVsaW1pdGVyIChlLmcuXG4jICc+ICcgZm9yIGJsb2NrcXVvdGVzIG9yIGNvcnJlY3QgbGV2ZWwgb2YgaW5kZW50YXRpb24gZm9yIGxpc3QgaXRlbXMpLlxuIyBEZWxpbWl0ZXJzIGFyZSBzdHJpcHBlZCBiZWZvcmUgdGhlIGNvbnRlbnRzIGFyZSBhZ2dyZWdhdGVkIGludG8gb25lIG5ldyBibG9ja1xuIyBmb3IgbGF0ZXIgcGFyc2luZy4gQSBuZXcgbGluZSB3aXRob3V0IGEgY29udGFpbmVyIGJsb2NrIGRlbGltaXRlciBjYW4gZWl0aGVyXG4jIGJlIHRoZSBlbmQgb2YgY3VycmVudCBjb250YWluZXIgYmxvY2sgb3Igc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBjb250YWluZXJcbiMgYWNjcm9kaW5nIHRvICdsYXppbmVzcycgcnVsZS4gVGhlIHBhcnNpbmcgaXMgbm90IGNvbXBsZXRlIHVudGlsIGVpdGhlciB0aGUgZW5kXG4jIG9mIGNvbnRhaW5lciBibG9jayBvciB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudCBpcyBlbmNvdW50ZXJlZC5cbiNcbiMgYGBgXG4jICstLS0rLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbiMgfCAgIHwgICAgICAgICAgICAgICAgICAgICAgfFxuIyB8ICogfCBDb250ZW50ICAgICAgICAgICAgICB8XG4jIHwgICB8ICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLSstLS0tLS0tLS0tLS0tLS0tLS0tLS0tKyA8LS0rIFBvc3NpYmxlIGVuZCBvZiBjb250ZW50IGJsb2NrXG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgfCAgICAgTmV4dCBlbGVtZW50IHdpdGhvdXQgfFxuIyB8ICAgICBkZWxpbWl0ZXIgICAgICAgICAgICB8XG4jIHwgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiMgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuIyB8ICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4jIHwgICAgIFVuLXBhcnNlZCAgICAgICAgICAgIHxcbiMgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuIyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4jXG4jICogQ29udGFpbmVyIGJsb2NrIGRlbGltaXRlclxuIyBgYGBcbiNcbiMgQWZ0ZXIgZWFjaCBpdGVyYXRpb24sIHRoZSBgb2Zmc2V0YCBpcyBhZHZhbmNlZCBhbmQgdGhlIHdob2xlIHByb2Nlc3Mgc3RhcnRzXG4jIGFnYWluIHVudGlsIHRoZSBlbmQgb2YgdGhlIGRvY3VtZW50LlxuI1xuIyAjIyMgSW5saW5lIEVsZW1lbnQgUGFyc2luZ1xuI1xuIyBJbmxpbmUgZWxlbWVudCBwYXJzaW5nICh7UGFyc2VyI19wYXJzZUlubGluZX0pIGlzIHRyaXZhbC5cbiMgVGhlIHN0YXRlZ3kgaXMgZXhhY3RseSB0aGUgc2FtZSBhcyBzb2xpZCBibG9jayBwYXJzaW5nLlxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUGFyc2VyXG4gICMgQ3JlYXRlIGEge1BhcnNlcn0gaW5zdGFuY2VcbiAgIyBAcGFyYW0ge1J1bGVNYW5hZ2VyfSBydWxlcyBBIHtSdWxlTWFuYWdlcn0gaW5zdGFuY2VcbiAgY29uc3RydWN0b3I6IChAcnVsZXMpIC0+XG5cbiAgIyBQYXJzZSBNYXJrZG93biBzb3VyY2UgaW50byBBU1RcbiAgIyBAcGFyYW0ge3N0cmluZ30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4ge0FycmF5fSBBU1RcbiAgcGFyc2U6IChzcmMpIC0+XG4gICAgYXN0ID0gQF9wYXJzZUJsb2NrcyhzcmMpXG4gICAgYXN0ID0gQF9wYXJzZUlubGluZShhc3QpXG5cbiAgICByZXR1cm4gYXN0XG5cbiAgIyBAcHJpdmF0ZVxuICAjIFBhcnNlIGJsb2NrIHN0cnVjdHVyZXNcbiAgIyBAcGFyYW0ge3N0cmluZ30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4ge0FycmF5fSBBU1RcbiAgX3BhcnNlQmxvY2tzOiAoc3JjKSAtPlxuICAgIG9mZnNldCA9IDBcbiAgICBuID0gc3JjLmxlbmd0aFxuICAgIHBlbmRpbmcgPSBbXVxuICAgIGFzdCA9IFtdXG5cbiAgICB3aGlsZSBvZmZzZXQgPCBuIG9yIHBlbmRpbmcubGVuZ3RoID4gMFxuICAgICAgc3RhcnRJbmRleCA9IG9mZnNldFxuICAgICAgY2Jfc3RhcnRfdG9rZW4gPSBAX190cnlQYXJzZUNvbnRhaW5lckJsb2NrU3RhcnRUb2tlbihvZmZzZXQsIHNyYylcbiAgICAgIGxhc3RJbmRleCA9IGNiX3N0YXJ0X3Rva2VuLnN0YXJ0SW5kZXhcbiAgICAgIGlmIGNiX3N0YXJ0X3Rva2VuP1xuICAgICAgICBhc3Rfc29saWRfcGFydCA9IEBfX3BhcnNlU29saWRCbG9ja3Moc3RhcnRJbmRleCwgbGFzdEluZGV4LCBzcmMpXG4gICAgICAgIHtvZmZzZXQsIGFzdF9mbHVpZF9wYXJ0fSA9IEBfX3BhcnNlRmx1aWRCbG9ja3MoY2Jfc3RhcnRfdG9rZW4sIHNyYylcbiAgICAgIGVsc2VcbiAgICAgICAge29mZnNldCwgYXN0X3NvbGlkX3BhcnR9ID0gQF9fcGFyc2VTb2xpZEJsb2NrcyhzdGFydEluZGV4LCBuLCBzcmMpXG5cbiAgICAgIGFzdC5wdXNoIGFzdF9zb2xpZF9wYXJ0XG4gICAgICBhc3QucHVzaCBhc3RfZmx1aWRfcGFydFxuXG4gICAgcmV0dXJuIGFzdFxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSB0aGUgc291cmNlIHN0YXJ0aW5nIGZyb20gZ2l2ZW4gb2Zmc2V0IGFuZCB0cmllcyB0byBmaW5kIHRoZSBmaXJzdFxuICAjIGNvbnRhaW5lciBibG9jayBzdGFydCB0b2tlblxuICAjIEBwYXJhbSB7aW50fSBvZmZzZXQgT2Zmc2V0IHZhbHVlXG4gICMgQHBhcmFtIHtzdHJpbmd9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIHtUb2tlbn0gTWF0Y2hlZCB0b2tlbiAobnVsbGFibGUpXG4gIF90cnlQYXJzZUNvbnRhaW5lckJsb2NrU3RhcnRUb2tlbjogKG9mZnNldCwgc3JjKSAtPlxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSB0aGUgc3BlY2lmaWVkIGRvY3VtZW50IHJlZ2lvbiBhcyBhIHNvbGlkIGJsb2NrXG4gICMgQHBhcmFtIHtpbnR9IGJlZ2luIFN0YXJ0IGluZGV4IG9mIHRoZSByZWdpb25cbiAgIyBAcGFyYW0ge2ludH0gZW5kIExhc3QgaW5kZXggb2YgdGhlIHJlZ2lvblxuICAjIEBwYXJhbSB7c3JjfSBzcmMgTWFya2Rvd24gc291cmNlXG4gICMgQHJldHVybiBbQXJyYXk8VG9rZW4+XSBBU1Qgb2Ygc3BlY2lmaWVkIHJlZ2lvblxuICBfX3BhcnNlU29saWRCbG9ja3M6IChiZWdpbiwgZW5kLCBzcmMpIC0+XG4gICAgYmxvY2sgPSBAX19fcGFyc2VPbmVCbG9jayhiZWdpbiwgZW5kLCBzcmMpXG4gICAgYXN0X3BhcnRfYmVmb3JlID0gQF9fcGFyc2VTb2xpZEJsb2NrcyhiZWdpbiwgYmxvY2suc3RhcnRJbmRleCAtIDEsIHNyYylcbiAgICBhc3RfcGFydF9hZnRlciAgPSBAX19wYXJzZVNvbGlkQmxvY2tzKGJsb2NrLmxhc3RJbmRleCwgZW5kLCBzcmMpXG5cbiAgICByZXR1cm4gW10uY29uY2F0KGFzdF9wYXJ0X2JlZm9yZSwgYmxvY2ssIGFzdF9wYXJ0X2FmdGVyKVxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSB0aGUgc3BlY2lmaWVkIGRvY3VtZW50IHJlZ2lvbiBhcyBhIGZsdWlkIGJsb2NrXG4gICMgQHBhcmFtIHtUb2tlbn0gc3RhcnRfdG9rZW4gVGhlIHN0YXJ0IHRva2VuIG9mIGEgY29udGFpbmVyIGJsb2NrXG4gICMgQHBhcmFtIHtzdHJpbmd9IHNyYyBNYXJrZG93biBzb3VyY2VcbiAgIyBAcmV0dXJuIFtBcnJheTxUb2tlbj5dIEFTVCBvZiBzcGVjaWZpZWQgcmVnaW9uXG4gIF9fcGFyc2VGbHVpZEJsb2NrczogKHN0YXJ0X3Rva2VuLCBzcmMpIC0+XG5cbiAgIyBAcHJpdmF0ZVxuICAjIE1hdGNoIGJsb2NrIHJ1bGVzIGZyb20gaGlnaGVzdCBwcmVjZWRlbmNlIHRvIGxvd2VzdCBhZ2FpbnN0IHRoZSBzcGVjaWZpZWRcbiAgIyBkb2N1bWVudCByZWdpb24gYW5kIHJldHVybnMgaW1tZWRpYXRlbHkgb24gdGhlIGZpcnN0IG1hdGNoLlxuICAjIEBwYXJhbSB7aW50fSBiZWdpbiBTdGFydCBpbmRleCBvZiB0aGUgcmVnaW9uXG4gICMgQHBhcmFtIHtpbnR9IGVuZCBMYXN0IGluZGV4IG9mIHRoZSByZWdpb25cbiAgIyBAcGFyYW0ge3NyY30gc3JjIE1hcmtkb3duIHNvdXJjZVxuICAjIEByZXR1cm4ge1Rva2VufSBUaGUgZmlyc3QgbWF0Y2hcbiAgX19fcGFyc2VPbmVCbG9jazogLT4gKGJlZ2luLCBlbmQsIHNyYykgLT5cblxuXG4gICMgQHByaXZhdGVcbiAgIyBQYXJzZSBpbmxpbmUgZWxlbWVudHNcbiAgIyBAcGFyYW0ge0FycmF5fSBhc3QgQVNUIHdpdGggdW4tcGFyc2VkIGJsb2NrIG5vZGVzIG9ubHlcbiAgIyBAcmV0dXJuIHtBcnJheX0gRnVsbHkgcGFyc2VkIEFTVFxuICBfcGFyc2VJbmxpbmU6IChhc3QpIC0+XG4iLCJ7RGVmfSA9IHJlcXVpcmUgJy4vdG9rZW4nXG5cbiMjI1xuVXNlZCB3aGVuIGRlZmluaW5nIGxhbmd1YWdlIHJ1bGVzIHdpdGgge0xhbmd1YWdlUGFja30gQVBJcy5cblxuQW4gZW1pdHRlciBtZXRob2QgZG9lcyBub3QgYWN0dWFsbHkgZW1pdCBhbnkgdG9rZW5zIHdoZW4gY2FsbGVkLCBidXQgY3JlYXRpbmdcbmEgZGVmaW5pdGlvbiBvciBjb250cmFjdCBvZiB0b2tlbnMgdGhhdCB3aWxsIGJlIGVtaXR0ZWQgb25jZSB0aGUgY29ycmVzcG9uZGluZ1xucnVsZSBpcyBtYXRjaGVkLlxuIyMjXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBFbWl0dGVyXG4gIGNvbnN0cnVjdG9yOiAoQG1vZGlmaWVycyA9IHt9KSAtPlxuICAgIEBvcHRpb25hbCA9IG5ldyBPcHRpb25hbEVtaXR0ZXIoKVxuXG4gICMgQHJldHVybiB7VG9rZW4uRGVmfSBBIHRva2VuIGRlZmluaXRpb25cbiAgYXR0cmlidXRlOiAoaWQsIHRyYW5zZm9ybSkgLT5cbiAgICBuZXcgRGVmKERlZi5BdHRyaWJ1dGUsIGlkLCB0cmFuc2Zvcm0sIEBtb2RpZmllcnMpXG5cbiAgIyBAcmV0dXJuIHtUb2tlbi5EZWZ9IEEgdG9rZW4gZGVmaW5pdGlvblxuICBjb250ZW50OiAoaWQsIHRyYW5zZm9ybSkgLT5cbiAgICBuZXcgRGVmKERlZi5Db250ZW50LCBpZCwgdHJhbnNmb3JtLCBAbW9kaWZpZXJzKVxuXG4gICMgQHJldHVybiB7VG9rZW4uRGVmfSBBIHRva2VuIGRlZmluaXRpb25cbiAgdGV4dDogKGlkLCB0cmFuc2Zvcm0pIC0+XG4gICAgbmV3IERlZihEZWYuVGV4dCwgaWQsIHRyYW5zZm9ybSwgQG1vZGlmaWVycylcblxuICAjIEByZXR1cm4ge1Rva2VuLkRlZn0gQSB0b2tlbiBkZWZpbml0aW9uXG4gIGRlbGltaXRlcjogKGlkLCB0cmFuc2Zvcm0pIC0+XG4gICAgbmV3IERlZihEZWYuRGVsaW1pdGVyLCBpZCwgdHJhbnNmb3JtLCBAbW9kaWZpZXJzKVxuXG4gIG5vdGhpbmc6IC0+XG4gICAgbmV3IERlZihEZWYuTm90aGluZywgbnVsbCwgbnVsbCwgQG1vZGlmaWVycylcblxuY2xhc3MgT3B0aW9uYWxFbWl0dGVyIGV4dGVuZHMgRW1pdHRlclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAbW9kaWZpZXJzID0gb3B0aW9uYWw6IHRydWVcbiIsIlJ1bGVCdWlsZGVyID0gcmVxdWlyZSAnLi9ydWxlLWJ1aWxkZXInXG5FbWl0dGVyID0gcmVxdWlyZSAnLi9lbWl0dGVyJ1xue09yZGVyZWRNYXB9ID0gcmVxdWlyZSAnLi91dGlsJ1xuXG4jIyNcbkJhc2UgY2xhc3MgZm9yIGxhbmd1YWdlIHBhY2tzXG4jIyNcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExhbmd1YWdlUGFja1xuICAjIEBwcm9wZXJ0eSBbRW1pdHRlcl0gQW4ge0VtaXR0ZXJ9IGluc3RhbmNlXG4gIGVtaXQ6IG5ldyBFbWl0dGVyKClcblxuICBjb25zdHJ1Y3RvcjogKEBucykgLT5cbiAgICBAX2J1aWxkZXIgPSBuZXcgUnVsZUJ1aWxkZXIoKVxuICAgIEBibG9ja1J1bGVzID0gbmV3IE9yZGVyZWRNYXAoKHIpIC0+IHIubmFtZSlcbiAgICBAaW5saW5lUnVsZXMgPSBuZXcgT3JkZXJlZE1hcCgocikgLT4gci5uYW1lKVxuXG4gIGRlY2xhcmVBbGlhczogKGFsaWFzLCByZWdleCkgLT5cbiAgICBAX2J1aWxkZXIuZGVjbGFyZUFsaWFzKGFsaWFzLCByZWdleClcblxuICBkZWNsYXJlRGVsaW1pdGVyUGFpcjogKG9wZW4sIGNsb3NlKSAtPlxuICAgICMgVE9ETzogdXNlZCBmb3IgaG90IHVwZGF0ZSBtb2RlLCBpbXBsZW1lbnQgbGF0ZXJcblxuICBhZGRCbG9ja1J1bGU6IChuYW1lLCBydWxlLCBlbWl0dGVyKSAtPlxuICAgIGJ1aWx0X3J1bGUgPSBAX2J1aWxkZXIubWFrZShydWxlLCBlbWl0dGVyKVxuICAgIGJ1aWx0X3J1bGUubmFtZSA9IG5hbWVcbiAgICBidWlsdF9ydWxlLnR5cGUgPSAnYmxvY2snXG4gICAgQGJsb2NrUnVsZXMucHVzaCBidWlsdF9ydWxlXG5cbiAgYWRkSW5saW5lUnVsZTogKG5hbWUsIHJ1bGUsIGVtaXR0ZXIpIC0+XG4gICAgYnVpbHRfcnVsZSA9IEBfYnVpbGRlci5tYWtlKHJ1bGUsIGVtaXR0ZXIpXG4gICAgYnVpbHRfcnVsZS5uYW1lID0gbmFtZVxuICAgIGJ1aWx0X3J1bGUudHlwZSA9ICdpbmxpbmUnXG4gICAgQGlubGluZVJ1bGVzLnB1c2ggYnVpbHRfcnVsZVxuIiwie0RlZn0gPSByZXF1aXJlICcuL3Rva2VuJ1xuIyB7UnVsZUJ1aWxkZXJ9IGlzIHVzZWQgYnkge0xhbmd1YWdlUGFja30gaW50ZXJuYWxseSB0byBjb21waWxlIHJ1bGVzIGZvciBwYXJzZXJcbiMgdG8gZXhlY3V0ZS5cbiNcbiMgIyMgVGVybWlub2xvZ3lcbiNcbiMgKiAqKlJ1bGUgZGVjbGVyYXRpb24qKnMgYXJlIG1hZGUgd2l0aCBBUEkgY2FsbHMgaW4ge0xhbmd1YWdlUGFja30gdG8gc3BlY2lmeVxuIyAgIHRoZSBzeWFudGF4IG9mIGEgbGFuZ3VhZ2UgZmVhdHVyZSB3aXRoIHJlZ2V4IGFzIHdlbGwgYXMgaG93IHJlbGV2ZW50IGRhdGEgaXNcbiMgICBjYXB0dXJlZCBhbmQgZW1pdHRlZCBpbnRvIHRva2Vucy5cbiMgKiAqKlJ1bGUqKnMgYXJlIGNvbXBpbGVkIGRlY2xhcmF0aW9ucyBlYWNoIG9mIHdoaWNoIGNvbnNpc3RzIG9mIGEgcmVnZXggYW5kIGFcbiMgICBoYW5kbGVyIGZ1bmN0aW9uLiBUaGUgbGF0dGVyIGVtaXRzIGEgdG9rZW4gb3IgbWFuaXB1bGF0ZXMgdGhlIHBhcmVudCB0b2tlbi5cbiNcbiMgRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRvIGRlY2FscmUgYSBydWxlLCBzZWUge0xhbmd1YWdlUGFja30uXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSdWxlQnVpbGRlclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2FsaWFzTWFwID0ge31cbiAgICBAX3N1YlJ1bGVzID0ge31cblxuICBkZWNsYXJlQWxpYXM6IChhbGlhcywgcmVnZXgpIC0+XG4gICAgIyBUT0RPOiBjaGVjayBmb3IgZHVwbGljYXRpb25cbiAgICBAX2FsaWFzTWFwW2FsaWFzXSA9IHJlZ2V4XG5cbiAgZGVjbGFyZVN1YlJ1bGU6IChuYW1lLCBydWxlLCBjYXB0dXJlX21hcCkgLT5cbiAgICAjIFRPRE86IGNoZWNrIGZvciBuYW1lIGR1cGxpY2F0aW9uXG4gICAgY29tcGlsZWQgPSBAX2NvbXBpbGVSdWxlKHJ1bGUsIGNhcHR1cmVfbWFwKVxuICAgIEBfc3ViUnVsZXNbbmFtZV0gPSBjb21waWxlZFxuXG4gICMgQHByaXZhdGVcbiAgI1xuICAjIEdldCB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcmVnZXggcGFydCBmb3IgY29uY2F0ZW5hdGlpb24uXG4gICNcbiAgIyBAb3ZlcmxvYWQgX2dldFJlZ2V4UGFydChhbGlhc19vcl9saXRlcmFsKVxuICAjICAgVGhlIGFyZ3VtZW50IGlzIHNlYXJjaGVkIGluIHRoZSBhbGlhcyBtYXAgZmlyc3QsIHRoZW4gaW4gdGhlIHN1Yi1ydWxlIG1hcC5cbiAgIyAgIElmIG5vIG1hdGNoIGlzIGZvdW5kLCBpdFxuICAjICAgaXMgdGhlbiBjb25zaWRlcmVkIGFzIGEgbGl0ZXJhbCByZWdleCBzb3VyY2Ugc3RyaW5nLlxuICAjICAgVGhlIGxpdGVyYWwgc3RyaW5nIHdpbGwgYmUgZXNjYXBlZC4gRm9yIGV4YW1wbGUsIGAnXlsoKV0nYCBpcyBwcm9jZXNzZWQgdG9cbiAgIyAgIGAvXFxeXFxbXFwoXFwpXFxdL2AuXG4gICMgICBAcGFyYW0gW3N0cmluZ10gYWxpYXNfb3JfbGl0ZXJhbFxuICAjIEBvdmVybG9hZCBfZ2V0UmVnZXhQYXJ0KGFsdGVybmF0aXZlcylcbiAgIyAgIEBwYXJhbSBbQXJyYXk8c3RyaW5nPl0gYWx0ZXJuYXRpdmVzIEFuIGFycmF5IG9mIHN1Yi1ydWxlIG5hbWVzXG4gICMgQG92ZXJsb2FkIF9nZXRSZWdleFBhcnQocmVnZXgpXG4gICMgICBAcGFyYW0gW1JlZ0V4cF0gcmVnZXhcbiAgIyBAcmV0dXJuIFtzdHJpbmddIFJlZ2V4IHBhcnQncyBzdHJpbmcgc291cmNlXG4gIF9nZXRSZWdleFBhcnQ6IChyKSAtPlxuICAgIGVzY2FwZV9yID0gL1stXFwvXFxcXF4kKis/LigpfFtcXF17fV0vZ1xuICAgIHQgPSB0eXBlb2YgclxuICAgIGlmIHQgPT0gJ3N0cmluZydcbiAgICAgIGlmIHIgb2YgQF9hbGlhc01hcFxuICAgICAgICAjIEFsaWFzXG4gICAgICAgIHJldHVybiB7dHlwZTogJ2FsaWFzJywgcnVsZTogQF9hbGlhc01hcFtyXX1cbiAgICAgIGlmIHIgb2YgQF9zdWJSdWxlc1xuICAgICAgICAjIFN1Yi1ydWxlXG4gICAgICAgIHJldHVybiB7dHlwZTogJ3N1YicsIHJ1bGU6IEBfc3ViUnVsZXNbcl19XG4gICAgICAjIExpdGVyYWxcbiAgICAgIHJldHVybiB7dHlwZTogJ2xpdGVyYWwnLCBydWxlOiByLnJlcGxhY2UoZXNjYXBlX3IsICdcXFxcJCYnKX1cbiAgICBlbHNlIGlmIHQgPT0gJ29iamVjdCdcbiAgICAgIGlmIHIgaW5zdGFuY2VvZiBSZWdFeHBcbiAgICAgICAgcmV0dXJuIHt0eXBlOiAncmVnZXgnLCBydWxlOiByLnNvdXJjZX1cbiAgICAgIGVsc2UgaWYgQXJyYXkuaXNBcnJheShyKVxuICAgICAgICBydWxlcyA9IFtdXG4gICAgICAgIHNvdXJjZXMgPSBbXVxuICAgICAgICBmb3IgYWx0IGluIHJcbiAgICAgICAgICBpZiBub3QgYWx0IG9mIEBfc3ViUnVsZXNcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInYWx0JyBpcyBub3QgYSB2YWxpZCBzdWItcnVsZSBuYW1lLlwiKVxuICAgICAgICAgIHJ1bGUgPSBAX3N1YlJ1bGVzW2FsdF1cbiAgICAgICAgICBydWxlcy5wdXNoIHJ1bGVcbiAgICAgICAgICBzb3VyY2VzLnB1c2ggcnVsZS5yZWdleC5zb3VyY2VcbiAgICAgICAgcmV0dXJuIHt0eXBlOiAnYWx0JywgcnVsZXM6IHJ1bGVzLCBzb3VyY2VzOiBzb3VyY2VzfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInI3tyfScgaXMgbm90IGEgdmFsaWQgYWxpYXMgbmFtZSwgc3RyaW5nIG9yIFJlZ0V4cFwiKVxuXG4gIF9tYWtlTWF0Y2hIYW5kbGVyOiAodG9rZW5fZGVmcykgLT5cbiAgICByZXR1cm4gKG5vZGUsIG1hdGNoZXMpIC0+XG4gICAgICBmb3IgZCBpbiB0b2tlbl9kZWZzXG4gICAgICAgIHBheWxvYWQgPSBtYXRjaCA9IG1hdGNoZXNbZC5ncm91cF9pbmRleF1cbiAgICAgICAgaWYgZC50cmFuc2Zvcm0/XG4gICAgICAgICAgcGF5bG9hZCA9IGQudHJhbnNmb3JtKHBheWxvYWQpXG5cbiAgICAgICAgbm9kZVtkLmlkXSA9IHBheWxvYWRcbiAgICAgICAgIyBUT0RPOiB1c2Ugbm9kZS5hdHRhY2hYeHggYWNjcm9kaW5nIHRvIGQudHlwZSBmaWVsZFxuXG4gICMgQHByaXZhdGVcbiAgIyBDb21waWxlIHJ1bGVzXG4gICMgQHBhcmFtIHtBcnJheTxSZWdFeHB8c3RyaW5nPn0gcnVsZVxuICAjIEBwYXJhbSB7T2JqZWN0fSBjYXB0dXJlX21hcFxuICAjIEByZXR1cm4ge09iamVjdH1cbiAgX2NvbXBpbGVSdWxlOiAocnVsZSwgY2FwdHVyZV9tYXApIC0+XG4gICAgcmVnZXhfc3JjID0gJydcbiAgICBncm91cF9pbmRleCA9IDBcbiAgICB0b2tlbl9kZWZzID0gW11cbiAgICBpbl9vcHRpb25hbF9ncm91cCA9IGZhbHNlXG4gICAgY3VycmVudF9vcHRpb25hbF9ncm91cCA9IFwiXCJcblxuICAgIGZvciByLCBpIGluIHJ1bGVcbiAgICAgIHRva2VuX2RlZiA9IGNhcHR1cmVfbWFwP1tpICsgMV1cblxuICAgICAgY291bGRfY2FwdHVyZSA9IHRva2VuX2RlZj9cblxuICAgICAgcGFydCA9IEBfZ2V0UmVnZXhQYXJ0KHIpXG4gICAgICBwYXJ0X3NyYyA9IHBhcnQucnVsZVxuXG4gICAgICBpZiBwYXJ0LnR5cGUgPT0gJ2FsdCdcbiAgICAgICAgaWYgY291bGRfY2FwdHVyZVxuICAgICAgICAgIGVyciA9IG5ldyBUeXBlRXJyb3IoXCJBbHRlcm5hdGl2ZSBydWxlcyBjYW5ub3QgYmUgcmUtY2FwdHVyZWRcIilcbiAgICAgICAgICBlcnIucnVsZU5hbWUgPSByXG4gICAgICAgICAgZXJyLnJ1bGVJbmRleCA9IGlcbiAgICAgICAgICB0aHJvdyBlcnJcblxuICAgICAgICByZWdleF9zcmMgKz0gXCIoPzoje3BhcnQuc291cmNlcy5qb2luKCd8Jyl9KVwiXG4gICAgICAgIGZvciBhbHRfcnVsZSBpbiBwYXJ0LnJ1bGVzXG4gICAgICAgICAgYmFzZV9ncm91cF9pbmRleCA9IGdyb3VwX2luZGV4XG4gICAgICAgICAgZm9yIGFsdF9kZWYgaW4gYWx0X3J1bGUudG9rZW5fZGVmc1xuICAgICAgICAgICAgY29waWVkID0gRGVmLmNsb25lKGFsdF9kZWYpXG4gICAgICAgICAgICBjdXJyZW50X2dyb3VwX2luZGV4ID0gYmFzZV9ncm91cF9pbmRleCArIGFsdF9kZWYuZ3JvdXBfaW5kZXhcbiAgICAgICAgICAgIGNvcGllZC5ncm91cF9pbmRleCA9IGN1cnJlbnRfZ3JvdXBfaW5kZXhcbiAgICAgICAgICAgIGdyb3VwX2luZGV4ID0gY3VycmVudF9ncm91cF9pbmRleFxuICAgICAgICAgICAgdG9rZW5fZGVmcy5wdXNoIGNvcGllZFxuXG4gICAgICBlbHNlIGlmIHBhcnQudHlwZSA9PSAnc3ViJ1xuICAgICAgICBpZiBjb3VsZF9jYXB0dXJlXG4gICAgICAgICAgZXJyID0gbmV3IFR5cGVFcnJvcihcIlN1Yi1ydWxlcyBjYW5ub3QgYmUgcmUtY2FwdHVyZWRcIilcbiAgICAgICAgICBlcnIucnVsZU5hbWUgPSByXG4gICAgICAgICAgZXJyLnJ1bGVJbmRleCA9IGlcbiAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgcmVnZXhfc3JjICs9IHBhcnQucnVsZS5yZWdleC5zb3VyY2VcbiAgICAgICAgIyBGbGF0dGVuIHBhcnQudG9rZW5fZGVmc1xuICAgICAgICBiYXNlX2dyb3VwX2luZGV4ID0gZ3JvdXBfaW5kZXhcbiAgICAgICAgZm9yIHN1Yl9kZWYgaW4gcGFydC5ydWxlLnRva2VuX2RlZnNcbiAgICAgICAgICBjb3BpZWQgPSBEZWYuY2xvbmUoc3ViX2RlZilcbiAgICAgICAgICBjdXJyZW50X2dyb3VwX2luZGV4ID0gYmFzZV9ncm91cF9pbmRleCArIHN1Yl9kZWYuZ3JvdXBfaW5kZXhcbiAgICAgICAgICBjb3BpZWQuZ3JvdXBfaW5kZXggPSBjdXJyZW50X2dyb3VwX2luZGV4XG4gICAgICAgICAgZ3JvdXBfaW5kZXggPSBjdXJyZW50X2dyb3VwX2luZGV4XG4gICAgICAgICAgdG9rZW5fZGVmcy5wdXNoIGNvcGllZFxuICAgICAgZWxzZVxuICAgICAgICBpZiBjb3VsZF9jYXB0dXJlXG4gICAgICAgICAgbGF6eV9sZWF2aW5nID0gaW5fb3B0aW9uYWxfZ3JvdXAgYW5kIG5vdCB0b2tlbl9kZWYub3B0aW9uYWw/XG4gICAgICAgICAgb3B0aW9uYWxfY2hhbmdpbmcgPSAodG9rZW5fZGVmLm9wdGlvbmFsID8gZmFsc2UpICE9IGluX29wdGlvbmFsX2dyb3VwXG4gICAgICAgICAgaWYgbGF6eV9sZWF2aW5nIG9yIG9wdGlvbmFsX2NoYW5naW5nXG4gICAgICAgICAgICBpZiBub3QgaW5fb3B0aW9uYWxfZ3JvdXBcbiAgICAgICAgICAgICAgIyBmYWxzZSAtPiB0cnVlLCBlbnRlcmluZyBvcHRpb25hbCBncm91cFxuICAgICAgICAgICAgICAjIGdyb3VwX2luZGV4KytcbiAgICAgICAgICAgICAgaW5fb3B0aW9uYWxfZ3JvdXAgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICMgdHJ1ZSAtPiBmYWxzZSwgbGVhdmluZyBvcHRpb25hbCBncm91cFxuICAgICAgICAgICAgICBpbl9vcHRpb25hbF9ncm91cCA9IGZhbHNlXG4gICAgICAgICAgICAgICMgVE9ETzogbWFrZSBjYXB0dXJlL25vdC1jYXB0dXJlIGNvbmZpZ3VhYmxlXG4gICAgICAgICAgICAgIHJlZ2V4X3NyYyArPSBcIig/OiN7Y3VycmVudF9vcHRpb25hbF9ncm91cH0pP1wiXG4gICAgICAgICAgICAgIGN1cnJlbnRfb3B0aW9uYWxfZ3JvdXAgPSBcIlwiXG4gICAgICAgICAgaWYgdG9rZW5fZGVmLnR5cGUgIT0gRGVmLk5vdGhpbmdcbiAgICAgICAgICAgIGdyb3VwX2luZGV4KytcbiAgICAgICAgICAgIHBhcnRfc3JjID0gXCIoI3twYXJ0LnJ1bGV9KVwiXG4gICAgICAgICAgICB0b2tlbl9kZWZzLnB1c2ggdG9rZW5fZGVmXG4gICAgICAgICAgICB0b2tlbl9kZWYuZ3JvdXBfaW5kZXggPSBncm91cF9pbmRleFxuICAgICAgICBlbHNlIGlmIGluX29wdGlvbmFsX2dyb3VwXG4gICAgICAgICAgIyB0cnVlIC0+IGZhbHNlLCBsZWF2aW5nIG9wdGlvbmFsIGdyb3VwXG4gICAgICAgICAgaW5fb3B0aW9uYWxfZ3JvdXAgPSBmYWxzZVxuICAgICAgICAgIHJlZ2V4X3NyYyArPSBcIig/OiN7Y3VycmVudF9vcHRpb25hbF9ncm91cH0pP1wiXG4gICAgICAgICAgY3VycmVudF9vcHRpb25hbF9ncm91cCA9IFwiXCJcbiAgICAgICAgIyBBY2N1bXVsYXRlIHNvdXJjZVxuICAgICAgICBpZiBpbl9vcHRpb25hbF9ncm91cFxuICAgICAgICAgIGN1cnJlbnRfb3B0aW9uYWxfZ3JvdXAgKz0gcGFydF9zcmNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlZ2V4X3NyYyArPSBwYXJ0X3NyY1xuXG4gICAgY29tcGlsZWQgPVxuICAgICAgcmVnZXg6IG5ldyBSZWdFeHAocmVnZXhfc3JjKVxuICAgICAgdG9rZW5fZGVmczogdG9rZW5fZGVmc1xuICAgIFxuICAgIHJldHVybiBjb21waWxlZFxuXG4gICMgQHBhcmFtIHtBcnJheTxSZWdFeHB8c3RyaW5nPn0gcnVsZVxuICAjIEBwYXJhbSB7T2JqZWN0fSBjYXB0dXJlX21hcFxuICBtYWtlOiAocnVsZSwgY2FwdHVyZV9tYXApIC0+XG4gICAgY29tcGlsZWQgPSBAX2NvbXBpbGVSdWxlKHJ1bGUsIGNhcHR1cmVfbWFwKVxuXG4gICAgcmVzdWx0ID1cbiAgICAgIHJlZ2V4OiBjb21waWxlZC5yZWdleFxuICAgICAgaGFuZGxlcjogQF9tYWtlTWF0Y2hIYW5kbGVyKGNvbXBpbGVkLnRva2VuX2RlZnMpXG4gICAgcmV0dXJuIHJlc3VsdFxuIiwie09yZGVyZWRNYXB9ID0gcmVxdWlyZSAnLi91dGlsJ1xuXG4jIE1hbmFnZSBsYW5ndWFnZSBydWxlcyBmb3IgYSBjb21waWxlciBpbnN0YW5jZVxuI1xuIyBSdWxlcyBhcmUgZ3JvdXBlZCBpbnRvIHtMYW5ndWFnZVBhY2t9cyBhbmQgYWRkZWQgaW4gYmF0Y2guXG4jIFRoZSBvcmRlcnMgYXJlIHBlcnNldmVyZWQgZm9yIHBhcnNlcnMgdG8gaGFuZGxlIHByZWNlZGVuY2UuXG4jIEFsbCBydWxlcyBhcmUgZW5hYmxlZCBieSBkZWZhdWx0LiBIb3dldmVyIHVzZXJzIGNhbiBlbmFibGUvZGlzYWJsZSBhIHNwZWNpZmljXG4jIHNldCBvZiBydWxlcy5cbiMgRW5hYmxlZCBydWxlIGxpc3RzIGFyZSB1cGRhdGVkIGxhemlseSBqdXN0IGJlZm9yZSB0aGUgY29tcGlsZXIgYXNrcyBmb3IgdGhlXG4jIHJ1bGVzLlxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUnVsZU1hbmFnZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9pc0RpcnR5ID0gZmFsc2VcbiAgICBAX3BhY2tzID0gbmV3IE9yZGVyZWRNYXAoKHApIC0+IHAubnMpXG4gICAgQF9jYWNoZWRfYmxvY2tzID0gW11cbiAgICBAX2NhY2hlZF9pbmxpbmVzID0gW11cblxuICBfdXBkYXRlQ2FjaGU6IC0+XG4gICAgaWYgbm90IEBfaXNEaXJ0eVxuICAgICAgcmV0dXJuXG5cbiAgICBAX2NhY2hlZF9ibG9ja3MgPSBbXVxuICAgIEBfY2FjaGVkX2lubGluZXMgPSBbXVxuXG4gICAgQF9wYWNrcy5lYWNoIChwYWNrKSA9PlxuICAgICAgYmxvY2tzID0gcGFjay5ibG9ja1J1bGVzLmZpbHRlciAocikgLT4gci5lbmFibGVkXG4gICAgICBpbmxpbmVzID0gcGFjay5pbmxpbmVSdWxlcy5maWx0ZXIgKHIpIC0+IHIuZW5hYmxlZFxuICAgICAgQF9jYWNoZWRfYmxvY2tzID0gQF9jYWNoZWRfYmxvY2tzLmNvbmNhdCBibG9ja3NcbiAgICAgIEBfY2FjaGVkX2lubGluZXMgPSBAX2NhY2hlZF9pbmxpbmVzLmNvbmNhdCBpbmxpbmVzXG5cbiAgICBAX2lzRGlydHkgPSBmYWxzZVxuXG4gIEBwcm9wZXJ0eSAnYmxvY2tSdWxlcycsXG4gICAgZ2V0OiAtPlxuICAgICAgQF91cGRhdGVDYWNoZSgpXG4gICAgICByZXR1cm4gQF9jYWNoZWRfYmxvY2tzXG5cbiAgQHByb3BlcnR5ICdpbmxpbmVSdWxlcycsXG4gICAgZ2V0OiAtPlxuICAgICAgQF91cGRhdGVDYWNoZSgpXG4gICAgICByZXR1cm4gQF9jYWNoZWRfaW5saW5lc1xuXG4gICMgQWRkIHJ1bGVzIGZyb20gYSB7TGFuZ3VhZ2VQYWNrfVxuICAjIEBwYXJhbSB7TGFuZ3VhZ2VQYWNrfSBwYWNrXG4gIGFkZExhbmd1YWdlUGFjazogKHBhY2spIC0+XG4gICAgcGFjay5ibG9ja1J1bGVzLmVhY2ggKHIpIC0+IHIuZW5hYmxlZCA9IHRydWVcbiAgICBwYWNrLmlubGluZVJ1bGVzLmVhY2ggKHIpIC0+IHIuZW5hYmxlZCA9IHRydWVcbiAgICBAX3BhY2tzLnB1c2ggcGFja1xuICAgIEBfaXNEaXJ0eSA9IHRydWVcblxuICAjIFJlbW92ZSBydWxlcyBmcm9tIGEge0xhbmd1YWdlUGFja31cbiAgIyBAcGFyYW0ge3N0cmluZ30gbnMgbmFtZXNwYWNlIG9mIHRoZSB7TGFuZ3VhZ2VQYWNrfSB0byBiZSByZW1vdmVkXG4gIHJlbW92ZUxhbmd1YWdlUGFjazogKG5zKSAtPlxuICAgIEBfcGFja3MucmVtb3ZlIG5zXG5cbiAgIyBUb2dnbGUgYWxsIG9yIHNvbWUgb2YgdGhlIHJ1bGVzIGluIGEge0xhbmd1YWdlUGFja30uIElmIHRoZSBzZWNvbmQgYXJndW1lbnRcbiAgIyBpcyBgbnVsbGAgb3IgZW1wdHksIGFsbCBydWxlcyB3aWxsIGJlIHRvZ2dsZWQuXG4gICMgQHBhcmFtIHtzdHJpbmd9IG5zIG5hbWVzcGFjZSBvZiBhIHtMYW5ndWFnZVBhY2t9XG4gICMgQHBhcmFtIHtib29sZWFufSBlbmFibGVkIHRvZ2dsZSBzcGVjaWZpZWQgZmVhdHVyZXMgdG8gdGhpcyB2YWx1ZVxuICAjIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gZmVhdHVyZXMgbmFtZXMgb2YgZmVhdHVyZXMgdG8gYmUgdG9nZ2xlZC5cbiAgdG9nZ2xlOiAobnMsIGVuYWJsZWQsIGZlYXR1cmVzKSAtPlxuICAgIHBhY2sgPSBAX3BhY2tzLmdldChucylcbiAgICBpZiBub3QgcGFjaz9cbiAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIlVua25vd24gbGFuZ3VhZ2UgcGFjayAnI3tuc30nXCIpXG4gICAgaWYgZmVhdHVyZXM/IGFuZCBub3QgQXJyYXkuaXNBcnJheShmZWF0dXJlcylcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdCBhbiBBcnJheSBvZiBmZWF0dXJlIG5hbWVzJylcbiAgICAgIHJldHVyblxuXG4gICAgaWYgbm90IGZlYXR1cmVzPyBvciBmZWF0dXJlcy5sZW5ndGggPT0gMFxuICAgICAgcGFjay5ibG9ja1J1bGVzLmVhY2ggKHIpIC0+IHIuZW5hYmxlZCA9IGVuYWJsZWRcbiAgICAgIHBhY2suaW5saW5lUnVsZXMuZWFjaCAocikgLT4gci5lbmFibGVkID0gZW5hYmxlZFxuICAgIGVsc2VcbiAgICAgIHBhY2suYmxvY2tSdWxlcy5lYWNoIChyKSAtPiByLmVuYWJsZWQgPSBub3QgZW5hYmxlZFxuICAgICAgcGFjay5pbmxpbmVSdWxlcy5lYWNoIChyKSAtPiByLmVuYWJsZWQgPSBub3QgZW5hYmxlZFxuICAgICAgZm9yIGYgaW4gZmVhdHVyZXNcbiAgICAgICAgaWYgcGFjay5ibG9ja1J1bGVzLmhhcyhmKVxuICAgICAgICAgIHBhY2suYmxvY2tSdWxlcy5nZXQoZikuZW5hYmxlZCA9IGVuYWJsZWRcbiAgICAgICAgZWxzZSBpZiBwYWNrLmlubGluZVJ1bGVzLmhhcyhmKVxuICAgICAgICAgIHBhY2suaW5saW5lUnVsZXMuZ2V0KGYpLmVuYWJsZWQgPSBlbmFibGVkXG4gICAgQF9pc0RpcnR5ID0gdHJ1ZVxuXG4gICMgRW5hYmxlIGFsbCBvciBzb21lIG9mIHRoZSBydWxlcyBpbiBhIHtMYW5ndWFnZVBhY2t9LiBJZiB0aGUgc2Vjb25kIGFyZ3VtZW50XG4gICMgaXMgYG51bGxgIG9yIGVtcHR5LCBhbGwgcnVsZXMgd2lsbCBiZSBlbmFibGVkLlxuICAjIEBwYXJhbSB7c3RyaW5nfSBucyBuYW1lc3BhY2Ugb2YgYSB7TGFuZ3VhZ2VQYWNrfVxuICAjIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gZmVhdHVyZXMgbmFtZXMgb2YgZmVhdHVyZXMgdG8gYmUgZW5hYmxlZC5cbiAgZW5hYmxlOiAobnMsIGZlYXR1cmVzKSAtPlxuICAgIEB0b2dnbGUgbnMsIHRydWUsIGZlYXR1cmVzXG5cbiAgIyBEaXNhYmxlIGFsbCBvciBzb21lIG9mIHRoZSBydWxlcyBpbiBhIHtMYW5ndWFnZVBhY2t9LiBJZiB0aGUgc2Vjb25kIGFyZ3VtZW50XG4gICMgaXMgYG51bGxgIG9yIGVtcHR5LCBhbGwgcnVsZXMgd2lsbCBiZSBkaXNhYmxlLlxuICAjIEBwYXJhbSB7c3RyaW5nfSBucyBuYW1lc3BhY2Ugb2YgYSB7TGFuZ3VhZ2VQYWNrfVxuICAjIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gZmVhdHVyZXMgbmFtZXMgb2YgZmVhdHVyZXMgdG8gYmUgZGlzYWJsZS5cbiAgZGlzYWJsZTogKG5zLCBmZWF0dXJlcykgLT5cbiAgICBAdG9nZ2xlIG5zLCBmYWxzZSwgZmVhdHVyZXNcbiIsIiMgVG9rZW5zIGFyZSBidWlsZGluZyBibG9ja3Mgb2YgcGFyc2VkIGRvY3VtZW50cy4gRWFjaCBydWxlIGlzIGV2YWx1YXRlZCBhbmRcbiMgY2FwdHVyZSBncm91cHMgYXJlIHRyYW5zZm9ybWVkIGludG8gdG9rZW5zLiBGb3IgaW5mb3JtYXRpb24gb24gaG93IHRva2Vuc1xuIyBhcmUgZW1pdHRlZCBmcm9tIGxhbmd1YWdlIHJ1bGVzLCBzZWUge0xhbmd1YWdlUGFja30uXG4jXG4jIEEgdG9rZW4gY29udGFpbnMgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIHRvIHJlcHJlc2VudCBhIE1hcmtkb3duIGVsZW1lbnQsXG4jIGluY2x1ZGluZyBpdHMgbG9jYXRpb24gaW4gc291cmNlIGNvZGUsIGRhdGEgZmllbGRzIGFuZCBldGMuIEZvciBzaW1wbGljaXR5LFxuIyBNYXJrUmlnaHQgdXNlcyB0b2tlbnMgYXMgQVNUIG5vZGVzIGRpcmVjdGx5IGluc3RlYWQgb2YgY3JlYXRpbmcgbmV3IG9uZXMuXG4jXG4jICMjIFRva2VuIEhpZXJhcmNoaWVzXG4jXG4jIFRva2VucyBhcmUgY29ubmVjdGVkIHdpdGggZWFjaCBvdGhlciBpbiBhIGZldyBkaWZmcmVudCB3YXlzIHRvIGZvcm0gZGlmZnJlbnRcbiMgcmVwcmVzZW50YXRpb25zIG9mIHRoZSBzYW1lIGRvY3VtZW50LlxuI1xuIyAjIyMgTGluZWFyIExpc3RcbiNcbiMgVG9rZW5zIGFyZSBjaGFpbmVkIHRvZ2V0aGVyIGluIGEgZG91YmxlLWxpbmtlZCBsaXN0IGZhc2lvbiBmb3IgbGluZWFyIGFjY2Vzcy5cbiMgRWFjaCB0b2tlbiBob2xkcyBhIHtUb2tlbiNwcmV2fSBhbmQge1Rva2VuI25leHR9IGZpZWxkcyBsaW5raW5nIHRvIHRva2Vuc1xuIyBiZWZvcmUgYW5kIGFmdGVyLlxuI1xuIyBUaGUgb3JkZXIgaXMgZGV0ZXJtaW5lZCBieSB0b2tlbidzIHBvc2l0aW9uIGluIHRoZSBkb2N1bWVudC4gQW4gZWxlbWVudCBtYXlcbiMgY29ycmVzcG9uZCB0byBvbmUgcGFyZW50IHRva2VuIGZvciB0aGUgd2hvbGUgZWxlbWVudCBhcyB3ZWxsIGFzIGEgZmV3XG4jIGRlbGltaXRlciBjaGlsZHJlbiB0b2tlbnMgdG8gaW5kaWNhdGUgYm91bmRhcmllcy4gSW4gc3VjaCBjYXNlLCB0aGUgcGFyZW50XG4jIHRva2VuIGNvbWVzIGJldHdlZW4gdGhlIGZpcnN0IHBhaXIgb2YgbWF0Y2hlZCBkZWxpbWl0ZXJzLlxuI1xuIyAjIyMgQVNUXG4jXG4jIFRva2VucyBjYW4gYWxzbyBidWlsZCBhbiBhYmFzdHJhY3Qgc3ludGF4IHRyZWUsIHdpdGgge1Rva2VuI3BhcmVudH0gZmllbGRcbiMgcG9pbnRpbmcgdG8gb25lJ3MgZGlyZWN0IHBhcmVudCBhbmQge1Rva2VuI2NoaWxkcmVufSBob2xkcyBhbiBhcnJheSBvZlxuIyBjaGlsZHJlbi4gQ2hpbGRyZW4gYXJlIGFsc28gY2hhaW5lZCB0b2dldGhlciBpbiBhIGRvdWJsZS1saW5rZWQgbGlzdCB3aXRoXG4jIHtUb2tlbiNwcmV2U2libGluZ30gYW5kIHtUb2tlbiNuZXh0U2libGluZ30uIEEgc2luZ2xlIGRvY3VtZW50IHRva2VuIGlzIHVzZWRcbiMgYXMgdGhlIHBhcmVudCBmb3IgYWxsIHRvcCBsZXZlbCB0b2tlbnMgdG8gZm9ybSBhIHNpbmdsZS1yb290IHN0cnVjdHVyZS5cbiNcbiMgIyMjIE91dGxpbmVcbiNcbiMgSGVhZGluZyB0b2tlbnMgYXJlIGxpbmtlZCBpbnRvIGEgdHJlZSB0byByZXByZXNlbnQgdGhlIGxvZ2ljIHN0cnVjdHVyZSBvZiBhXG4jIGRvY3VtZW50LiBFYWNoIGhlYWRpbmcgZ292ZXJucyBhIHNlY3Rpb24gdW5kZXIgaXRzZWxmIGFuZCBob2xkcyBlbGVtZW50cyBhc1xuIyBzZWN0aW9uIGNvbnRlbnQuIChOb3QgaW1wbGVtZW50ZWQpXG4jXG4jIEBUT0RPIE91dGxpbmUgcHJvcGVydGllc1xuI1xuIyAjIyMgUXVhZHRyZWVcbiNcbiMgVG9rZW5zIGFyZSBhbHNvIGluZGV4ZWQgc3BhdGlhbGx5IHdpdGggcXVhZHRyZWUuIEl0IGlzIHVzZWZ1bGx5IGZvciBlZGl0b3JcbiMgZGV2ZWxvcGVycyB0byBsb29rIHVwIHRva2VuIGJ5IGN1cnNvciBsb2NhdGlvbnMuXG4jXG4jIEBUT0RPIFF1YWR0cmVlIGltcGxlbWVudGF0aW9uXG4jXG4jIEBUT0RPIFRva2VuIExvY2F0aW9uXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBUb2tlblxuICAjIEBwcm9wZXJ0eSB7VG9rZW59IFRoZSBwcmV2aW91cyB0b2tlbiBpbiBkb2N1bWVudFxuICBwcmV2OiBudWxsXG5cbiAgIyBAcHJvcGVydHkge1Rva2VufSBUaGUgbmV4dCB0b2tlbiBpbiBkb2N1bWVudFxuICBuZXh0OiBudWxsXG5cbiAgIyBAcHJvcGVydHkge1Rva2VufSBUaGUgcGFyZW50IHRva2VuXG4gIHBhcmVudDogbnVsbFxuXG4gICMgQHByb3BlcnR5IHtBcnJheTxUb2tlbj59IFRoZSBjaGlscmVuXG4gIGNoaWxkcmVuOiBbXVxuXG4gICMgQHByb3BlcnR5IHtUb2tlbn0gVGhlIGZpcnN0IGNoaWxkXG4gIGZpcnN0Q2hpbGQ6IG51bGxcblxuICAjIEBwcm9wZXJ0eSB7VG9rZW59IFRoZSBwcmV2aW91cyB0b2tlbiB1bmRlciB0aGUgc2FtZSBwYXJlbnRcbiAgcHJldlNpYmxpbmc6IG51bGxcblxuICAjIEBwcm9wZXJ0eSB7VG9rZW59IFRoZSBuZXh0IHRva2VuIHVuZGVyIHRoZSBzYW1lIHBhcmVudFxuICBuZXh0U2libGluZzogbnVsbFxuXG4jXG4jIEB0b2RvIEFkZCBkb2N1bWVudGF0aW9uXG5tb2R1bGUuZXhwb3J0cy5EZWYgPVxuY2xhc3MgVG9rZW5EZWZcbiAgQEF0dHJpYnV0ZTogJ2F0dHJpYnV0ZSdcbiAgQENvbnRlbnQ6ICdjb250ZW50J1xuICBAVGV4dDogJ3RleHQnXG4gIEBEZWxpbWl0ZXI6ICdkZWxpbWl0ZXInXG4gIEBOb3RoaW5nOiAnbm90aGluZydcblxuICBAY2xvbmU6IChhbm90aGVyKSAtPlxuICAgIGNvcGllZCA9IG5ldyBUb2tlbkRlZihhbm90aGVyLnR5cGUsIGFub3RoZXIuaWQsIGFub3RoZXIudHJhbnNmb3JtKVxuICAgIGZvciBrZXksIHZhbHVlIG9mIGFub3RoZXJcbiAgICAgIGlmIGFub3RoZXIuaGFzT3duUHJvcGVydHkoa2V5KVxuICAgICAgICBjb3BpZWRba2V5XSA9IHZhbHVlXG4gICAgcmV0dXJuIGNvcGllZFxuXG4gIGNvbnN0cnVjdG9yOiAoQHR5cGUsIEBpZCwgQHRyYW5zZm9ybSwgbW9kaWZpZXJzKSAtPlxuICAgIGlmIG1vZGlmaWVycz9cbiAgICAgIGZvciBrZXksIHZhbHVlIG9mIG1vZGlmaWVyc1xuICAgICAgICBAW2tleV0gPSB2YWx1ZVxuIiwiRnVuY3Rpb246OnByb3BlcnR5ID0gKHByb3AsIGRlc2MpIC0+XHJcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIGRlc2NcclxuXHJcbm1vZHVsZS5leHBvcnRzLk9yZGVyZWRNYXAgPVxyXG5jbGFzcyBPcmRlcmVkTWFwXHJcbiAgY29uc3RydWN0b3I6IChAa2V5X2dldHRlcikgLT5cclxuICAgIEBfbWFwID0ge31cclxuICAgIEBfa2V5cyA9IFtdXHJcbiAgICBAX3ZhbHVlcyA9IFtdXHJcblxyXG4gIGhhczogKGtleSkgLT5cclxuICAgIHJldHVybiBrZXkgb2YgQF9tYXBcclxuXHJcbiAgZ2V0OiAoa2V5KSAtPlxyXG4gICAgIyBUT0RPOiB0aHJvdyBlcnJvclxyXG4gICAgcmV0dXJuIEBfdmFsdWVzW0BfbWFwW2tleV1dXHJcblxyXG4gICMgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cclxuXHJcbiAgcHVzaDogKGVsZW0pIC0+XHJcbiAgICBrZXkgPSBAa2V5X2dldHRlcihlbGVtKVxyXG4gICAgQF9rZXlzLnB1c2gga2V5XHJcbiAgICBAX3ZhbHVlcy5wdXNoIGVsZW1cclxuICAgIEBfbWFwW2tleV0gPSBAX3ZhbHVlcy5sZW5ndGggLSAxXHJcblxyXG4gICMgcG9wOiAoKSAtPlxyXG5cclxuICByZW1vdmU6IChrZXkpIC0+XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUb28gbGF6eS4gTm90IGltcGxlbWVudGVkLlwiKVxyXG5cclxuICBlYWNoOiAoaXRlcmF0b3IpIC0+XHJcbiAgICBmb3IgdiwgaSBpbiBAX3ZhbHVlc1xyXG4gICAgICBpdGVyYXRvcj8gdiwgaVxyXG5cclxuICBmaWx0ZXI6IChmKSAtPlxyXG4gICAgZmlsdGVyZWQgPSBbXVxyXG4gICAgZm9yIHYsIGkgaW4gQF92YWx1ZXNcclxuICAgICAgaWYgZj8gdiwgaVxyXG4gICAgICAgIGZpbHRlcmVkLnB1c2ggdlxyXG4gICAgcmV0dXJuIGZpbHRlcmVkXHJcblxyXG4gIEBwcm9wZXJ0eSAndmFsdWVzJyxcclxuICAgIGdldDogLT4gQF92YWx1ZXNcclxuXHJcbiAgQHByb3BlcnR5ICdrZXlzJyxcclxuICAgIGdldDogLT4gQF9rZXlzXHJcblxyXG4gIEBwcm9wZXJ0eSAnbGVuZ3RoJyxcclxuICAgIGdldDogLT4gQF92YWx1ZXMubGVuZ3RoXHJcbiIsIkxhbmd1YWdlUGFjayA9IHJlcXVpcmUgJy4uL2NvcmUvbGFuZ3VhZ2UtcGFjaydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29yZSBleHRlbmRzIExhbmd1YWdlUGFja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlciAnY29yZSdcblxuICAgIEBkZWNsYXJlQWxpYXMgJ14nLCAgICAgIC9eXFwgezAsIDN9L1xuICAgIEBkZWNsYXJlQWxpYXMgJyQnLCAgICAgIC8kL1xuICAgIEBkZWNsYXJlQWxpYXMgJyAnLCAgICAgIC9cXHMrL1xuICAgIEBkZWNsYXJlQWxpYXMgJyMnLCAgICAgIC8jezEsIDZ9L1xuICAgIEBkZWNsYXJlQWxpYXMgJy0gLSAtJywgIC8oWyorLV1cXHM/KXszLH0vXG4gICAgQGRlY2xhcmVBbGlhcyAnPT09JywgICAgL1stPV17Myx9L1xuICAgIEBkZWNsYXJlQWxpYXMgJy0+JywgICAgIC9eKFxcdHxcXCB7NH0pL1xuICAgIEBkZWNsYXJlQWxpYXMgJ2BgYCcsICAgIC9bfmBdezMsfS9cblxuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnKCcsICcpJ1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnWycsICddJ1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAneycsICd9J1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnPCcsICc+J1xuICAgIEBkZWNsYXJlRGVsaW1pdGVyUGFpciAnYGBgJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAncnVsZXMnLCBbJ14nLCAnLSAtIC0nLCAnJCddXG5cbiAgICBAYWRkQmxvY2tSdWxlICdhdHhfaGVhZGVyJywgWydeJywgJyMnLCAnICcsIC8oLiopXFxzKi8sICckJ10sXG4gICAgICAxOiBAZW1pdC5hdHRyaWJ1dGUgJ2xldmVsJywgKGhhc2gpIC0+IGhhc2gubGVuZ3RoXG4gICAgICAzOiBAZW1pdC5jb250ZW50ICAgJ3RpdGxlJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnc2V0ZXh0X2hlYWRlcicsIFsnXicsIC8oW15cXHNdLiopXFxuLywgJz09PScsICckJ10sXG4gICAgICAxOiBAZW1pdC5jb250ZW50ICAgJ3RpdGxlJ1xuICAgICAgMjogQGVtaXQuYXR0cmlidXRlICdsZXZlbCcsIChyKSAtPiBpZiByWzBdID09ICctJyB0aGVuIDEgZWxzZSAyXG5cbiAgICBAYWRkQmxvY2tSdWxlICdpbmRlbnRlZF9jb2RlJywgWyctPicsIC8oLiopLywgJyQnXSxcbiAgICAgIDE6IEBlbWl0LnRleHQgICAgICAnc3JjJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnZmVuY2VkX2NvZGUnLCBbJ14nLCAnYGBgJywgJyQnLCAvKFteXSopLywgJ14nLCAnYGBgJywgJyQnXSxcbiAgICAgIDM6IEBlbWl0LnRleHQgICAgICAnc3JjJ1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnaHRtbCcsIFtdXG5cbiAgICBAYWRkQmxvY2tSdWxlICdsaW5rX3JlZicsIFtdXG5cbiAgICBAYWRkQmxvY2tSdWxlICdwYXJhZ3JhcGgnLCBbXVxuXG4gICAgQGFkZEJsb2NrUnVsZSAnYmxhbmtfbGluZScsIFtdXG5cbiAgICAjIFRCRDogYWdncmVnYXRlIGBsaXN0X2l0ZW1gIGludG8gb25lIGAqX2xpc3RgIGVsZW1lbnQgbGF0ZXJcbiAgICAjICAgICAgb3IgZW1pdCBkaXJlY3RseVxuICAgICMgQGFkZEJsb2NrUnVsZSAnb3JkZXJlZF9saXN0J1xuICAgICNcbiAgICAjIEBhZGRCbG9ja1J1bGUgJ3Vub3JkZXJlZF9saXN0J1xuXG4gICAgQGFkZEJsb2NrUnVsZSAnbGlzdF9pdGVtJywgW11cblxuICAgIEBhZGRJbmxpbmVSdWxlICdiYWNrc2xhc2hfZXNjYXBlJywgW11cblxuICAgIEBhZGRJbmxpbmVSdWxlICdlbnRpdHknLCBbXVxuXG4gICAgQGFkZElubGluZVJ1bGUgJ2NvZGVfc3BhbicsIFtdXG4iLCJMYW5ndWFnZVBhY2sgPSByZXF1aXJlICcuLi9jb3JlL2xhbmd1YWdlLXBhY2snXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdGTSBleHRlbmRzIExhbmd1YWdlUGFja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlciAnZ2ZtJ1xuIiwiQ29tcGlsZXIgPSByZXF1aXJlICcuL2NvbXBpbGVyJ1xuXG5Db3JlID0gcmVxdWlyZSAnLi9sYW5nL2NvcmUnXG5HRk0gPSByZXF1aXJlICcuL2xhbmcvZ2ZtJ1xuXG5jb3JlID0gbmV3IENvcmUoKVxuZ2ZtID0gbmV3IEdGTSgpXG5cbkNvbXBpbGVyLkRlZmF1bHQgPSBuZXcgQ29tcGlsZXIoW2NvcmUsIGdmbV0pXG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcGlsZXJcbiJdfQ==
