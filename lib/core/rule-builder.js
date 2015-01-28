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

//# sourceMappingURL=../../map/core/rule-builder.js.map