Function::property = (prop, desc) ->
  Object.defineProperty @prototype, prop, desc

module.exports.OrderedMap =
class OrderedMap
  constructor: (@key_getter) ->
    @_map = {}
    @_keys = []
    @_values = []

  has: (key) ->
    return key of @_map

  get: (key) ->
    # TODO: throw error
    return @_values[@_map[key]]

  # set: (key, value) ->

  push: (elem) ->
    key = @key_getter(elem)
    @_keys.push key
    @_values.push elem
    @_map[key] = @_values.length - 1

  # pop: () ->

  remove: (key) ->
    throw new Error("Too lazy. Not implemented.")

  each: (iterator) ->
    for v, i in @_values
      iterator? v, i

  filter: (f) ->
    filtered = []
    for v, i in @_values
      if f? v, i
        filtered.push v
    return filtered

  @property 'values',
    get: -> @_values

  @property 'keys',
    get: -> @_keys

  @property 'length',
    get: -> @_values.length
