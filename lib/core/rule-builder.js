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

//# sourceMappingURL=../../map/core/rule-builder.js.map