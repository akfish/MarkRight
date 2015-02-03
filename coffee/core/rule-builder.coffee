# {RuleBuilder} is used by {LanguagePack} internally to compile rules for parser
# to execute.
#
# ## Terminology
#
# * **Rule decleration**s are made with API calls in {LanguagePack} to specify
#   the syantax of a language feature with regex as well as how relevent data is
#   captured and emitted into tokens.
# * **Rule**s are compiled declarations each of which consists of a regex and a
#   handler function. The latter emits a token or manipulates the parent token.
#
# For more information on how to decalre a rule, see {LanguagePack}.
module.exports =
class RuleBuilder
  constructor: ->
    @_aliasMap = {}

  declareAlias: (alias, regex) ->
    # TODO: check for duplication
    @_aliasMap[alias] = regex

  # @private
  #
  # Get the string representation of a regex part for concatenatiion.
  #
  # @overload _getRegexPart(alias_or_literal)
  #   The argument is searched in the alias map first. If no match is found, it
  #   is then considered as a literal regex source string.
  #   @param [string] alias_or_literal
  # @overload _getRegexPart(regex)
  #   @param [RegExp] regex
  # @return [string] Regex part's string source
  _getRegexPart: (r) ->
    t = typeof r
    if t == 'string'
      if r of @_aliasMap
        return @_aliasMap[r]
      # TODO: escape
      return r
    else if t == 'object' and r instanceof RegExp
      return r.source
    throw new TypeError("#{r} is not a valid alias name, string or RegExp")

  _makeMatchHandler: (token_defs) ->
    return (node, matches) ->
      for d in token_defs
        payload = match = matches[d.group_index]
        if d.transform?
          payload = d.transform(payload)

        node[d.id] = payload
        # TODO: use node.attachXxx accroding to d.type field


  make: (rule, emitter) ->
    regex_src = ''
    group_index = 0
    token_defs = []
    for r, i in rule
      token_def = emitter[i + 1]
      should_capture = token_def?

      part = @_getRegexPart(r)
      if should_capture
        part = "(#{part})"
        group_index++
        token_def.group_index = group_index
        token_defs.push token_def
      regex_src += part

    result =
      regex: new RegExp(regex_src)
      handler: @_makeMatchHandler(token_defs)
    return result
