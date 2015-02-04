var Def, Emitter;

Def = require('./token').Def;


/*
Used when defining language rules with {LanguagePack} APIs.

An emitter method does not actually emit any tokens when called, but creating
a definition or contract of tokens that will be emitted once the corresponding
rule is matched.
 */

module.exports = Emitter = (function() {
  function Emitter() {}

  Emitter.prototype.attribute = function(id, transform) {
    return new Def(Def.Attribute, id, transform);
  };

  Emitter.prototype.content = function(id, transform) {
    return new Def(Def.Content, id, transform);
  };

  Emitter.prototype.text = function(id, transform) {
    return new Def(Def.Text, id, transform);
  };

  Emitter.prototype.delimiter = function(id, transform) {
    return new Def(Def.Delimiter, id, transform);
  };

  return Emitter;

})();

//# sourceMappingURL=../../map/core/emitter.js.map