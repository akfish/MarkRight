RuleBuilder = require './rule-builder'
Emitter = require './emitter'

###
Base class for language packs
###
module.exports =
class LanguagePack
  # @property [Emitter] An {Emitter} instance
  emit: new Emitter()

  constructor: (@ns) ->
    @_builder = new RuleBuilder()

  declareAlias: (alias, regex) ->
    @_builder.declareAlias(alias, regex)

  declareDelimiterPair: (open, close) ->
    # TODO: used for hot update mode, implement later

  addBlockRule: (name, rule, emitter) ->

  addInlineRule: (name, rule, emitter) ->
