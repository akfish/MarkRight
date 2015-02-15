var Compiler, Generator, Parser, RuleManager;

Parser = require('./parser');

Generator = require('./generator');

RuleManager = require('../core/rule-manager');

module.exports = Compiler = (function() {
  function Compiler() {
    this.rules = new RuleManager();
    this.parser = new Parser(this.rules);
  }

  Compiler.prototype.compile = function(md) {
    return md;
  };

  return Compiler;

})();

//# sourceMappingURL=../../map/compiler/index.js.map