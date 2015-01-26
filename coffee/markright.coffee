Compiler = require './compiler'

Core = require './lang/core'
GFM = require './lang/gfm'

core = new Core()
gfm = new GFM()

module.exports = new Compiler([core, gfm])
