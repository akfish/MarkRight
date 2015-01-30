var LanguagePack, RuleBuilder;

RuleBuilder = require('./rule-builder');


/*
Base class for language packs
 */

module.exports = LanguagePack = (function() {
  function LanguagePack(ns) {
    this.ns = ns;
    this._builder = new RuleBuilder();
  }

  LanguagePack.prototype.declareAlias = function(alias, regex) {
    return this._builder.declareAlias(alias, regex);
  };

  LanguagePack.prototype.declareDelimiterPair = function(open, close) {};

  LanguagePack.prototype.addBlockRule = function(name, rule, emitter) {};

  LanguagePack.prototype.addInlineRule = function(name, rule, emitter) {};

  LanguagePack.prototype.emitAttribute = function(name, transform) {};

  LanguagePack.prototype.emitContent = function(name, transform) {};

  LanguagePack.prototype.emitText = function(name, transform) {};

  return LanguagePack;

})();

//# sourceMappingURL=../../map/core/language-pack.js.map