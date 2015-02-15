RuleBuilder = require './rule-builder'
Emitter = require './emitter'
{OrderedMap} = require './util'

###
Base class for language packs
###
module.exports =
class LanguagePack
  # @property [Emitter] An {Emitter} instance
  emit: new Emitter()

  constructor: (@ns) ->
    @_builder = new RuleBuilder()
    @blockRules = new OrderedMap((r) -> r.name)
    @inlineRules = new OrderedMap((r) -> r.name)

  declareAlias: (alias, regex) ->
    @_builder.declareAlias(alias, regex)

  declareDelimiterPair: (open, close) ->
    # TODO: used for hot update mode, implement later

  addBlockRule: (name, rule, emitter) ->
    built_rule = @_builder.make(rule, emitter)
    built_rule.name = name
    built_rule.type = 'block'
    @blockRules.push built_rule

  addInlineRule: (name, rule, emitter) ->
    built_rule = @_builder.make(rule, emitter)
    built_rule.name = name
    built_rule.type = 'inline'
    @inlineRules.push built_rule
