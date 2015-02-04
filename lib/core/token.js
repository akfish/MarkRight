var Token, TokenDef;

module.exports = Token = (function() {
  function Token() {}

  Token.prototype.prev = null;

  Token.prototype.next = null;

  Token.prototype.parent = null;

  Token.prototype.children = [];

  Token.prototype.firstChild = null;

  Token.prototype.prevSibling = null;

  Token.prototype.nextSibling = null;

  return Token;

})();

module.exports.Def = TokenDef = (function() {
  TokenDef.Attribute = 'attribute';

  TokenDef.Content = 'content';

  TokenDef.Text = 'text';

  TokenDef.Delimiter = 'delimiter';

  function TokenDef(type, id, transform) {
    this.type = type;
    this.id = id;
    this.transform = transform;
  }

  return TokenDef;

})();

//# sourceMappingURL=../../map/core/token.js.map