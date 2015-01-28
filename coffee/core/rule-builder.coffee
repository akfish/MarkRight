module.exports =
class RuleBuilder
  constructor: ->
    @_aliasMap = {}

  declareAlias: (alias, regex) ->
    # TODO: check for duplication
    @_aliasMap[alias] = regex

  _getRegexPart: (alias_or_literal) ->
    # TODO: fetch regex part from alias map or parse from literal

  _makeMatchHandler: (token_defs) ->
    return (node, matches) ->
      for d in token_defs
        payload = match = matches[d.group_index]
        if d.transform?
          payload = d.transform(payload)

        # TODO: attach payload to node

        
  make: (rule, emitter) ->
    regex_src = ''
    group_index = 0
    token_defs = []
    for r, i in rule
      token_def = emitter[i]
      should_capture = token_def?

      part = _getRegexPart(r)
      if should_capture
        part = "(#{part})"
      regex_src += part
      group_index++

      token_def.group_index = group_index
      token_defs.push token_def

    return regex: new Regexp(regex_src)
      handler: @_makeMatchHandler(token_defs)
