expect = require 'expect.js'
path = require 'path'
RuleBuilder = require '../lib/core/rule-builder'
Emitter = require '../lib/core/emitter'

# Consts
link_rule_expected_source = '\\[(.*)\\]\\(([^\\s]*)(?:\\s"(.*)")?\\)'
link_text = '[CatX](http://catx.me)'
link_text_with_optional = '[CatX](http://catx.me "AKFish\'s blog")'

describe 'Language Rule Builder', ->
  emit = new Emitter()
  builder = new RuleBuilder()
  builder.declareAlias 'alias_1', 'foo'
  heading_rule = null
  link_rule = null
  link_sub_rule = null

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

    expect(r_1.rule).to.be 'foo'
    expect(r_1.type).to.be 'alias'
    expect(r_2.rule).to.be 'not_an_alias'
    expect(r_2.type).to.be 'literal'
    expect(r_3.rule).to.be 'regex'
    expect(r_3.type).to.be 'regex'

  it "shoud support sub rules", ->
    builder.declareSubRule 'LINK_LABEL', ['[', /.*/, ']'],
      2: emit.text 'text'

    builder.declareSubRule 'LINK_DESC', ['(', /[^\s]*/, /\s"/, /.*/, /"/, ')'],
      2: emit.attribute 'src'
      3: emit.optional.nothing()
      4: emit.optional.attribute 'title'
      5: emit.optional.nothing()

    part = builder._getRegexPart 'LINK_DESC'
    rule = part.rule

    expect(part.type).to.be 'sub'
    expect(rule).to.be.an 'object'
    expect(rule).to.have.property 'regex'
    expect(rule).to.have.property 'token_defs'
    expect(rule.regex).to.be.a RegExp
    expect(rule.token_defs).to.be.an 'array'

    # link_sub_rule = builder.make ['[', /.*/, ']', 'LINK_DESC'],
      # 2: emit.text 'text'

    link_sub_rule = builder.make ['LINK_LABEL', 'LINK_DESC']

    expect(link_sub_rule.regex).to.be.a(RegExp)
    expect(link_sub_rule.handler).to.be.a('function')
    expect(link_sub_rule.regex.source).to.be(link_rule_expected_source)

  it "should support optional group", ->
    r = ['[', /.*/, ']', '(', /[^\s]*/, /\s"/, /.*/, '"', ')']
    link_rule = builder.make r,
      2: emit.text 'text'
      5: emit.attribute 'src'
      6: emit.optional.nothing()
      7: emit.optional.attribute 'title'
      8: emit.optional.nothing()

    expect(link_rule.regex).to.be.a(RegExp)
    expect(link_rule.handler).to.be.a('function')
    expect(link_rule.regex.source).to.be(link_rule_expected_source)

  it "should support alternative rules", ->
    builder.declareSubRule 'LINK_ID', ['[', /[^\s]*/, ']'],
      2: emit.attribute 'ref'

    link_rule_alt = builder.make ['[', /.*/, ']',['LINK_ID', 'LINK_DESC']],
      1: emit.attribute 'src'

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

    it "should work with sub rule", ->
      m1 = link_sub_rule.regex.exec(link_text)
      m2 = link_sub_rule.regex.exec(link_text_with_optional)

      link = {}
      link_with_optional = {}

      link_sub_rule.handler(link, m1)
      link_sub_rule.handler(link_with_optional, m2)

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
