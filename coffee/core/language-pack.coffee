RuleBuilder = require './rule-builder'

module.exports =
class LanguagePack
  constructor: (@ns) ->
    @_builder = new RuleBuilder()

  declareAlias: (alias, regex) ->
    @_builder.declareAlias(alias, regex)

  declareDelimiterPair: (open, close) ->
    # TODO: used for hot update mode, implement later

  addBlockRule: (name, rule, emitter) ->

  addInlineRule: (name, rule, emitter) ->

  emitAttribute: (name, transform) ->

  emitContent: (name, transform) ->

  emitText: (name, transform) ->
