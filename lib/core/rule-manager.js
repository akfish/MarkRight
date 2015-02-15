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

//# sourceMappingURL=../../map/core/rule-manager.js.map