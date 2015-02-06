var Emitter, LanguagePack, RuleBuilder;

RuleBuilder = require('./rule-builder');

Emitter = require('./emitter');


/*
Base class for language packs
 */

module.exports = LanguagePack = (function() {
  LanguagePack.prototype.emit = new Emitter();

  function LanguagePack(ns) {
    this.ns = ns;
    this._builder = new RuleBuilder();
    this.blockRules = [];
    this.inlineRules = [];
  }

  LanguagePack.prototype.declareAlias = function(alias, regex) {
    return this._builder.declareAlias(alias, regex);
  };

  LanguagePack.prototype.declareDelimiterPair = function(open, close) {};

  LanguagePack.prototype.addBlockRule = function(name, rule, emitter) {
    var built_rule;
    built_rule = this._builder.make(rule, emitter);
    built_rule.name = name;
    return this.blockRules.push(built_rule);
  };

  LanguagePack.prototype.addInlineRule = function(name, rule, emitter) {
    var built_rule;
    built_rule = this._builder.make(rule, emitter);
    built_rule.name = name;
    return this.inlineRules.push(built_rule);
  };

  return LanguagePack;

})();

//# sourceMappingURL=../../map/core/language-pack.js.map