expect = require 'expect.js'
path = require 'path'
RuleBuilder = require '../lib/core/rule-builder'
Emitter = require '../lib/core/emitter'

describe 'Language Rule Builder', ->
  emit = new Emitter()
  builder = new RuleBuilder()
  builder.declareAlias 'alias_1', 'foo'
  heading_rule = null
  link_rule = null

  it "should build rule", ->
    heading_rule = builder.make [/#{1,6}/, /\s/, /.*/],
      1: emit.attribute 'level', (h) -> h.length
      3: emit.content 'title'
    expect(heading_rule.regex).to.be.a(RegExp)
    expect(heading_rule.handler).to.be.a('function')

  it "should support alias", ->
    r_1 = builder._getRegexPart 'alias_1'
    r_2 = builder._getRegexPart 'not_an_alias'
    r_3 = builder._getRegexPart /regex/

    expect(r_1).to.be 'foo'
    expect(r_2).to.be 'not_an_alias'
    expect(r_3).to.be 'regex'

  it "shoud support sub rules"#, ->
    # builder.addSubRule 'LINK_DESC', [/[^\s]*/, /\s"/, '.*', /"/],
    #   1: emit.attribute 'src'
    #   2: emit.optional.nothing()
    #   3: emit.optional.attribute 'title'
    #   4: emit.optional.nothing()

  it "should support optional group", ->
    expected_source = '\\[(.*)\\]\\(([^\\s]*)(\\s"(.*)")?\\)'
    r = ['[', /.*/, ']', '(', /[^\s]*/, /\s"/, /.*/, '"', ')']
    link_rule = builder.make r,
      2: emit.text 'text'
      5: emit.attribute 'src'
      6: emit.optional.nothing()
      7: emit.optional.attribute 'title'
      8: emit.optional.nothing()

    expect(link_rule.regex).to.be.a(RegExp)
    expect(link_rule.handler).to.be.a('function')
    expect(link_rule.regex.source).to.be(expected_source)

  it "should support alternative rules"
  it "should handle delimiter pair"

  describe 'Built rule', ->
    it "should work", ->
      heading_text = '#### This is a heading'
      m = heading_rule.regex.exec(heading_text)
      expect(m).not.to.be(null)
      node = {}
      heading_rule.handler(node, m)
      expect(node).to.have.property('level')
      expect(node).to.have.property('title')
      expect(node.level).to.equal(4)
      expect(node.title).to.equal('This is a heading')

    it "should work with optional group", ->
      link_text = '[CatX](http://catx.me)'
      link_text_with_optional = '[CatX](http://catx.me "AKFish\'s blog")'

      m1 = link_rule.regex.exec(link_text)
      m2 = link_rule.regex.exec(link_text_with_optional)

      link = {}
      link_with_optional = {}

      link_rule.handler(link, m1)
      link_rule.handler(link_with_optional, m2)

      expect(link).to.have.property('text')
      expect(link).to.have.property('src')
      expect(link).to.have.property('title')

      expect(link_with_optional).to.have.property('text')
      expect(link_with_optional).to.have.property('src')
      expect(link_with_optional).to.have.property('title')

      expect(link.text).to.be('CatX')
      expect(link.src).to.be('http://catx.me')
      expect(link.title).to.be(undefined)

      expect(link_with_optional.text).to.be('CatX')
      expect(link_with_optional.src).to.be('http://catx.me')
      expect(link_with_optional.title).to.be("AKFish's blog")
