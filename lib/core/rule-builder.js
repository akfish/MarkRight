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

//# sourceMappingURL=../../map/core/rule-builder.js.map