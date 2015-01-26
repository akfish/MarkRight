Compiler = require './compiler'

Core = require './lang/core'
GFM = require './lang/gfm'

core = new Core()
gfm = new GFM()

Compiler.Default = new Compiler([core, gfm])

module.exports = Compiler
