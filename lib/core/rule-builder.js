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

//# sourceMappingURL=../../map/core/rule-builder.js.map