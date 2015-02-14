{Def} = require './token'
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
    @_subRules = {}

  declareAlias: (alias, regex) ->
    # TODO: check for duplication
    @_aliasMap[alias] = regex

  declareSubRule: (name, rule, capture_map) ->
    # TODO: check for name duplication
    compiled = @_compileRule(rule, capture_map)
    @_subRules[name] = compiled

  # @private
  #
  # Get the string representation of a regex part for concatenatiion.
  #
  # @overload _getRegexPart(alias_or_literal)
  #   The argument is searched in the alias map first, then in the sub-rule map.
  #   If no match is found, it
  #   is then considered as a literal regex source string.
  #   The literal string will be escaped. For example, `'^[()]'` is processed to
  #   `/\^\[\(\)\]/`.
  #   @param [string] alias_or_literal
  # @overload _getRegexPart(alternatives)
  #   @param [Array<string>] alternatives An array of sub-rule names
  # @overload _getRegexPart(regex)
  #   @param [RegExp] regex
  # @return [string] Regex part's string source
  _getRegexPart: (r) ->
    escape_r = /[-\/\\^$*+?.()|[\]{}]/g
    t = typeof r
    if t == 'string'
      if r of @_aliasMap
        # Alias
        return {type: 'alias', rule: @_aliasMap[r]}
      if r of @_subRules
        # Sub-rule
        return {type: 'sub', rule: @_subRules[r]}
      # Literal
      return {type: 'literal', rule: r.replace(escape_r, '\\$&')}
    else if t == 'object'
      if r instanceof RegExp
        return {type: 'regex', rule: r.source}
      else if Array.isArray(r)
        rules = []
        sources = []
        for alt in r
          if not alt of @_subRules
            throw new TypeError("'alt' is not a valid sub-rule name.")
          rule = @_subRules[alt]
          rules.push rule
          sources.push rule.regex.source
        return {type: 'alt', rules: rules, sources: sources}
    throw new TypeError("'#{r}' is not a valid alias name, string or RegExp")

  _makeMatchHandler: (token_defs) ->
    return (node, matches) ->
      for d in token_defs
        payload = match = matches[d.group_index]
        if d.transform?
          payload = d.transform(payload)

        node[d.id] = payload
        # TODO: use node.attachXxx accroding to d.type field

  # @private
  # Compile rules
  # @param {Array<RegExp|string>} rule
  # @param {Object} capture_map
  # @return {Object}
  _compileRule: (rule, capture_map) ->
    regex_src = ''
    group_index = 0
    token_defs = []
    in_optional_group = false
    current_optional_group = ""

    for r, i in rule
      token_def = capture_map?[i + 1]

      could_capture = token_def?

      part = @_getRegexPart(r)
      part_src = part.rule

      if part.type == 'alt'
        if could_capture
          err = new TypeError("Alternative rules cannot be re-captured")
          err.ruleName = r
          err.ruleIndex = i
          throw err

        regex_src += "(?:#{part.sources.join('|')})"
        for alt_rule in part.rules
          base_group_index = group_index
          for alt_def in alt_rule.token_defs
            copied = Def.clone(alt_def)
            current_group_index = base_group_index + alt_def.group_index
            copied.group_index = current_group_index
            group_index = current_group_index
            token_defs.push copied

      else if part.type == 'sub'
        if could_capture
          err = new TypeError("Sub-rules cannot be re-captured")
          err.ruleName = r
          err.ruleIndex = i
          throw err
        regex_src += part.rule.regex.source
        # Flatten part.token_defs
        base_group_index = group_index
        for sub_def in part.rule.token_defs
          copied = Def.clone(sub_def)
          current_group_index = base_group_index + sub_def.group_index
          copied.group_index = current_group_index
          group_index = current_group_index
          token_defs.push copied
      else
        if could_capture
          lazy_leaving = in_optional_group and not token_def.optional?
          optional_changing = (token_def.optional ? false) != in_optional_group
          if lazy_leaving or optional_changing
            if not in_optional_group
              # false -> true, entering optional group
              # group_index++
              in_optional_group = true
            else
              # true -> false, leaving optional group
              in_optional_group = false
              # TODO: make capture/not-capture configuable
              regex_src += "(?:#{current_optional_group})?"
              current_optional_group = ""
          if token_def.type != Def.Nothing
            group_index++
            part_src = "(#{part.rule})"
            token_defs.push token_def
            token_def.group_index = group_index
        else if in_optional_group
          # true -> false, leaving optional group
          in_optional_group = false
          regex_src += "(?:#{current_optional_group})?"
          current_optional_group = ""
        # Accumulate source
        if in_optional_group
          current_optional_group += part_src
        else
          regex_src += part_src

    compiled =
      regex: new RegExp(regex_src)
      token_defs: token_defs

    return compiled

  # @param {Array<RegExp|string>} rule
  # @param {Object} capture_map
  make: (rule, capture_map) ->
    compiled = @_compileRule(rule, capture_map)

    result =
      regex: compiled.regex
      handler: @_makeMatchHandler(compiled.token_defs)
    return result
