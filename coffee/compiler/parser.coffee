module.exports =
class Parser
  constructor: ->

  parse: (src) ->
    ast = @_parseBlocks(src)
    ast = @_parseInline(ast)

    return ast

  _parseBlocks: (src) ->
    offset = 0
    n = src.length
    pending = []
    ast = []

    while offset < n or pending.length > 0
      startIndex = offset
      cb_start_token = @__tryParseContainerBlockStartToken(offset, src)
      lastIndex = cb_start_token.startIndex
      if cb_start_token?
        ast_solid_part = @__parseSolidBlocks(startIndex, lastIndex, src)
        {offset, ast_fluid_part} = @__parseFluidBlocks(cb_start_token, src)
      else
        {offset, ast_solid_part} = @__parseSolidBlocks(startIndex, n, src)

      ast.push ast_solid_part
      ast.push ast_fluid_part

    return ast

  __tryParseContainerBlockStartToken: (offset, src) ->

  __parseSolidBlocks: (begin, end, src) ->
    block = @___parseOneBlock(begin, end, src)
    ast_part_before = @__parseSolidBlocks(begin, block.startIndex - 1, src)
    ast_part_after  = @__parseSolidBlocks(block.lastIndex, end, src)

    return [].concat(ast_part_before, block, ast_part_after)

  __parseFluidBlocks: (start_token, src) ->

  ___parseOneBlock: -> (begin, end, src) ->


  _parseInline: (ast) ->
