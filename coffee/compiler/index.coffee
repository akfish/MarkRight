Parser = require './parser'
Generator = require './generator'
RuleManager = require '../core/rule-manager'

module.exports =
class Compiler
  constructor: ->
    @rules = new RuleManager()
    @parser = new Parser(@rules)
    # @generator = new Generator(@rules)

  compile: (md) ->
    return md
