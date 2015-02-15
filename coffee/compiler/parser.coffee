# The parser processes input Markdown source and generates AST
# (abastract syntax tree) for the generator to consume.
#
# ## Terminology
#
# * **Documents** are top level representations of parsed Markdown files.
# * **Solid blocks** are continuous document parts consist of only leaf blocks.
# * **Fluid blocks** are continuous document parts that contains contents of
#   container blocks with closing elements yet to be determined.
#
# See {LanguagePack} for language spec related terminology.
#
# ## Parsing Strategy
#
# The parser applies rules in a determined order (a.k.a. precedence) to avoid
# any ambiguity. The elements take their precedence in following order:
#
# 1. Container blocks
# 2. Leaf blocks
# 3. Inline elements
#
# The parser processes a document in 2 passes:
#
# 1. Determine block structures and assign un-parsed source to each block tokens
# 2. Parse inline tokens of each blocks
#
# ### Block Parsing
#
# Block parsing is implemented in {Parser#_parseBlocks}.
# Unlike other Markdown parser implementations, MarkRight parser does
# not require matched rules to be anchored at the begining of the stream.
# Instead, {Parser#___parseOneBlock} applies rules from highest precedence to
# lowest and returns the first match no matter where the match's location is.
#
# It is expeced that the first match usually occurs in the middle thus spliting
# the stream into three parts:
#
# ```
# +---------------------------+ Document Begin
# |                           |
# |                           |
# |        Parsed             |
# |                           |
# |                           |
# +---------------------------+ Offset
# |                           |
# |                           |
# |       Residual Before     |
# |                           |
# |                           |
# +---------------------------+
# |                           |
# |       First Match         |
# |                           |
# +---------------------------+
# |                           |
# |                           |
# |                           |
# |       Residual After      |
# |                           |
# |                           |
# |                           |
# |                           |
# +---------------------------+ Document End
# ```
#
# If the `First Match` is a leaf block, the parser can safely assume that the
# entire stream is one solid block. Hence both residual blocks are solid too.
# Thus the parsing can be achived by recusively parse and split the stream into
# smaller and smaller blocks until the entire stream is parsed.
# This is done by {Parser#__parseSolidBlocks}.
#
# If the `First Match` is a container block start token, the `Residual Before`
# is known to be a solid block and can be parsed with
# {Parser#__parseSolidBlocks}.
# The `Residual After` would be a fluid block:
#
# ```
# +---------------------------+
# |                           |
# |       First Match         | <---+ Container block start token
# |                           |       (e.g. '> ' for a blockquote)
# +---------------------------+
# X                           X
# X       Content of          X <---+ Residual After (Fluid Block)
# X       Container Block     X
# X                           X
# X---------------------------X ----> New offset for next iteration
# X                           X
# X       Un-parsed           X
# X                           X
# +---------------------------+ Document End
# ```
#
# A fluid block is parsed by {Parser#__parseFluidBlocks}. It parses the fluid
# block linearly and looks for lines start with content block delimiter (e.g.
# '> ' for blockquotes or correct level of indentation for list items).
# Delimiters are stripped before the contents are aggregated into one new block
# for later parsing. A new line without a container block delimiter can either
# be the end of current container block or should be added to the container
# accroding to 'laziness' rule. The parsing is not complete until either the end
# of container block or the end of the document is encountered.
#
# ```
# +---+----------------------+
# |   |                      |
# | * | Content              |
# |   |                      |
# +---+----------------------+ <--+ Possible end of content block
# |                          |
# |     Next element without |
# |     delimiter            |
# |                          |
# +--------------------------+
# |                          |
# |     Un-parsed            |
# |                          |
# +--------------------------+
#
# * Container block delimiter
# ```
#
# After each iteration, the `offset` is advanced and the whole process starts
# again until the end of the document.
#
# ### Inline Element Parsing
#
# Inline element parsing ({Parser#_parseInline}) is trival.
# The stategy is exactly the same as solid block parsing.
module.exports =
class Parser
  # Create a {Parser} instance
  # @param {RuleManager} rules A {RuleManager} instance
  constructor: (@rules) ->

  # Parse Markdown source into AST
  # @param {string} src Markdown source
  # @return {Array} AST
  parse: (src) ->
    ast = @_parseBlocks(src)
    ast = @_parseInline(ast)

    return ast

  # @private
  # Parse block structures
  # @param {string} src Markdown source
  # @return {Array} AST
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

  # @private
  # Parse the source starting from given offset and tries to find the first
  # container block start token
  # @param {int} offset Offset value
  # @param {string} src Markdown source
  # @return {Token} Matched token (nullable)
  _tryParseContainerBlockStartToken: (offset, src) ->

  # @private
  # Parse the specified document region as a solid block
  # @param {int} begin Start index of the region
  # @param {int} end Last index of the region
  # @param {src} src Markdown source
  # @return [Array<Token>] AST of specified region
  __parseSolidBlocks: (begin, end, src) ->
    block = @___parseOneBlock(begin, end, src)
    ast_part_before = @__parseSolidBlocks(begin, block.startIndex - 1, src)
    ast_part_after  = @__parseSolidBlocks(block.lastIndex, end, src)

    return [].concat(ast_part_before, block, ast_part_after)

  # @private
  # Parse the specified document region as a fluid block
  # @param {Token} start_token The start token of a container block
  # @param {string} src Markdown source
  # @return [Array<Token>] AST of specified region
  __parseFluidBlocks: (start_token, src) ->

  # @private
  # Match block rules from highest precedence to lowest against the specified
  # document region and returns immediately on the first match.
  # @param {int} begin Start index of the region
  # @param {int} end Last index of the region
  # @param {src} src Markdown source
  # @return {Token} The first match
  ___parseOneBlock: -> (begin, end, src) ->


  # @private
  # Parse inline elements
  # @param {Array} ast AST with un-parsed block nodes only
  # @return {Array} Fully parsed AST
  _parseInline: (ast) ->
