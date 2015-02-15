{OrderedMap} = require './util'

# Manage language rules for a compiler instance
#
# Rules are grouped into {LanguagePack}s and added in batch.
# The orders are persevered for parsers to handle precedence.
# All rules are enabled by default. However users can enable/disable a specific
# set of rules.
# Enabled rule lists are updated lazily just before the compiler asks for the
# rules.
module.exports =
class RuleManager
  constructor: ->
    @_isDirty = false
    @_packs = new OrderedMap((p) -> p.ns)
    @_cached_blocks = []
    @_cached_inlines = []

  _updateCache: ->
    if not @_isDirty
      return

    @_cached_blocks = []
    @_cached_inlines = []

    @_packs.each (pack) =>
      blocks = pack.blockRules.filter (r) -> r.enabled
      inlines = pack.inlineRules.filter (r) -> r.enabled
      @_cached_blocks = @_cached_blocks.concat blocks
      @_cached_inlines = @_cached_inlines.concat inlines

    @_isDirty = false

  @property 'blockRules',
    get: ->
      @_updateCache()
      return @_cached_blocks

  @property 'inlineRules',
    get: ->
      @_updateCache()
      return @_cached_inlines

  # Add rules from a {LanguagePack}
  # @param {LanguagePack} pack
  addLanguagePack: (pack) ->
    pack.blockRules.each (r) -> r.enabled = true
    pack.inlineRules.each (r) -> r.enabled = true
    @_packs.push pack
    @_isDirty = true

  # Remove rules from a {LanguagePack}
  # @param {string} ns namespace of the {LanguagePack} to be removed
  removeLanguagePack: (ns) ->
    @_packs.remove ns

  # Toggle all or some of the rules in a {LanguagePack}. If the second argument
  # is `null` or empty, all rules will be toggled.
  # @param {string} ns namespace of a {LanguagePack}
  # @param {boolean} enabled toggle specified features to this value
  # @param {Array<string>} features names of features to be toggled.
  toggle: (ns, enabled, features) ->
    pack = @_packs.get(ns)
    if not pack?
      throw new ReferenceError("Unknown language pack '#{ns}'")
    if features? and not Array.isArray(features)
      throw new TypeError('Expect an Array of feature names')
      return

    if not features? or features.length == 0
      pack.blockRules.each (r) -> r.enabled = enabled
      pack.inlineRules.each (r) -> r.enabled = enabled
    else
      pack.blockRules.each (r) -> r.enabled = not enabled
      pack.inlineRules.each (r) -> r.enabled = not enabled
      for f in features
        if pack.blockRules.has(f)
          pack.blockRules.get(f).enabled = enabled
        else if pack.inlineRules.has(f)
          pack.inlineRules.get(f).enabled = enabled
    @_isDirty = true

  # Enable all or some of the rules in a {LanguagePack}. If the second argument
  # is `null` or empty, all rules will be enabled.
  # @param {string} ns namespace of a {LanguagePack}
  # @param {Array<string>} features names of features to be enabled.
  enable: (ns, features) ->
    @toggle ns, true, features

  # Disable all or some of the rules in a {LanguagePack}. If the second argument
  # is `null` or empty, all rules will be disable.
  # @param {string} ns namespace of a {LanguagePack}
  # @param {Array<string>} features names of features to be disable.
  disable: (ns, features) ->
    @toggle ns, false, features
