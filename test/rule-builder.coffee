expect = require 'expect.js'
path = require 'path'
RuleBuilder = require '../lib/core/rule-builder'

describe 'Language Rule Builder', ->
  builder = new RuleBuilder()
  builder.declareAlias 'alias_1', 'foo'
  regex = null
  handler = null
  it "should build rule", ->
    {regex, handler} = builder.make ['#{1,6}', '\\s', '.*'],
      1:
        type: 'attribute'
        id: 'level'
        transform: (h) -> h.length
      3:
        type: 'content'
        id: 'title'
    expect(regex).to.be.a(RegExp)
    expect(handler).to.be.a('function')

  it "should handle alias", ->
    r_1 = builder._getRegexPart 'alias_1'
    r_2 = builder._getRegexPart 'not_an_alias'
    r_3 = builder._getRegexPart /regex/

    expect(r_1).to.be 'foo'
    expect(r_2).to.be 'not_an_alias'
    expect(r_3).to.be 'regex'

  it "should handle optional group"
  it "should handle delimiter pair"
  
  describe 'Built rule', ->
    it "should work", ->
      heading_text = '#### This is a heading'
      m = regex.exec(heading_text)
      expect(m).not.to.be(null)
      node = {}
      handler(node, m)
      expect(node).to.have.property('level')
      expect(node).to.have.property('title')
      expect(node.level).to.equal(4)
      expect(node.title).to.equal('This is a heading')
