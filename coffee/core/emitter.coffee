{Def} = require './token'

###
Used when defining language rules with {LanguagePack} APIs.

An emitter method does not actually emit any tokens when called, but creating
a definition or contract of tokens that will be emitted once the corresponding
rule is matched.
###
module.exports =
class Emitter
  # @return {Token.Def} A token definition
  attribute: (id, transform) ->
    new Def(Def.Attribute, id, transform)

  # @return {Token.Def} A token definition
  content: (id, transform) ->
    new Def(Def.Content, id, transform)

  # @return {Token.Def} A token definition
  text: (id, transform) ->
    new Def(Def.Text, id, transform)

  # @return {Token.Def} A token definition
  delimiter: (id, transform) ->
    new Def(Def.Delimiter, id, transform)
