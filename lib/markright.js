var Compiler, Core, GFM, core, gfm;

Compiler = require('./compiler');

Core = require('./lang/core');

GFM = require('./lang/gfm');

core = new Core();

gfm = new GFM();

module.exports = new Compiler([core, gfm]);

//# sourceMappingURL=../maps/markright.js.map