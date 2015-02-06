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

//# sourceMappingURL=../../map/core/emitter.js.map