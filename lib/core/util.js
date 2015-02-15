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

//# sourceMappingURL=../../map/core/util.js.map