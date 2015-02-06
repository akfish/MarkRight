# Tokens are building blocks of parsed documents. Each rule is evaluated and
# capture groups are transformed into tokens. For information on how tokens
# are emitted from language rules, see {LanguagePack}.
#
# A token contains necessary information to represent a Markdown element,
# including its location in source code, data fields and etc. For simplicity,
# MarkRight uses tokens as AST nodes directly instead of creating new ones.
#
# ## Token Hierarchies
#
# Tokens are connected with each other in a few diffrent ways to form diffrent
# representations of the same document.
#
# ### Linear List
#
# Tokens are chained together in a double-linked list fasion for linear access.
# Each token holds a {Token#prev} and {Token#next} fields linking to tokens
# before and after.
#
# The order is determined by token's position in the document. An element may
# correspond to one parent token for the whole element as well as a few
# delimiter children tokens to indicate boundaries. In such case, the parent
# token comes between the first pair of matched delimiters.
#
# ### AST
#
# Tokens can also build an abastract syntax tree, with {Token#parent} field
# pointing to one's direct parent and {Token#children} holds an array of
# children. Children are also chained together in a double-linked list with
# {Token#prevSibling} and {Token#nextSibling}. A single document token is used
# as the parent for all top level tokens to form a single-root structure.
#
# ### Outline
#
# Heading tokens are linked into a tree to represent the logic structure of a
# document. Each heading governs a section under itself and holds elements as
# section content. (Not implemented)
#
# @TODO Outline properties
#
# ### Quadtree
#
# Tokens are also indexed spatially with quadtree. It is usefully for editor
# developers to look up token by cursor locations.
#
# @TODO Quadtree implementation
#
# @TODO Token Location
module.exports =
class Token
  # @property {Token} The previous token in document
  prev: null

  # @property {Token} The next token in document
  next: null

  # @property {Token} The parent token
  parent: null

  # @property {Array<Token>} The chilren
  children: []

  # @property {Token} The first child
  firstChild: null

  # @property {Token} The previous token under the same parent
  prevSibling: null

  # @property {Token} The next token under the same parent
  nextSibling: null

#
# @todo Add documentation
module.exports.Def =
class TokenDef
  @Attribute: 'attribute'
  @Content: 'content'
  @Text: 'text'
  @Delimiter: 'delimiter'
  @Nothing: 'nothing'
  
  constructor: (@type, @id, @transform, modifiers) ->
    if modifiers?
      for key, value of modifiers
        @[key] = value
