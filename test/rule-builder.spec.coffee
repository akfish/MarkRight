expect = require('./get-expect')()
RuleBuilder = require '../lib/core/rule-builder'
Emitter = require '../lib/core/emitter'

# Consts
link_rule_expected_source = '\\[(.*)\\]\\(([^\\s]*)(?:\\s"(.*)")?\\)'
link_text = '[CatX](http://catx.me)'
link_text_with_optional = '[CatX](http://catx.me "AKFish\'s blog")'
link_text_by_ref = '[CatX][catx_me]'
link_expected =
  text: 'CatX'
  src: 'http://catx.me'
  title: undefined
link_with_optional_expected =
  text: 'CatX'
  src: 'http://catx.me'
  title: 'AKFish\'s blog'

link_alt_expected =
  ref: undefined
  text: 'CatX'
  src: 'http://catx.me'
  title: undefined
link_alt_by_ref_expected =
  ref: 'catx_me'
  text: 'CatX'
  src: undefined
  title: undefined
link_alt_with_optional_expected =
  ref: undefined
  text: 'CatX'
  src: 'http://catx.me'
  title: 'AKFish\'s blog'

heading_text = '#### This is a heading'
heading_expected =
  level: 4
  title: 'This is a heading'

describe 'Rule Builder', ->
  emit = new Emitter()
  builder = new RuleBuilder()
  builder.declareAlias 'alias_1', 'foo'
  heading_rule = null
  link_rule = null
  link_sub_rule = null
  link_rule_alt = null

  it "should build rule", ->
    heading_rule = builder.make [/#{1,6}/, /\s/, /.*/],
      1: emit.attribute 'level', (h) -> h.length
      3: emit.content 'title'
    expect(heading_rule.regex).to.be.an.instanceof(RegExp)
    expect(heading_rule.handler).to.be.a('function')

  it "should support alias", ->
    r_1 = builder._getRegexPart 'alias_1'
    r_2 = builder._getRegexPart 'not_an_alias'
    r_3 = builder._getRegexPart /regex/

    expect(r_1.rule).to.equal 'foo'
    expect(r_1.type).to.equal 'alias'
    expect(r_2.rule).to.equal 'not_an_alias'
    expect(r_2.type).to.equal 'literal'
    expect(r_3.rule).to.equal 'regex'
    expect(r_3.type).to.equal 'regex'

  it "should support sub rules", ->
    builder.declareSubRule 'LINK_LABEL', ['[', /.*/, ']'],
      2: emit.text 'text'

    builder.declareSubRule 'LINK_DESC', ['(', /[^\s]*/, /\s"/, /.*/, /"/, ')'],
      2: emit.attribute 'src'
      3: emit.optional.nothing()
      4: emit.optional.attribute 'title'
      5: emit.optional.nothing()

    part = builder._getRegexPart 'LINK_DESC'
    rule = part.rule

    expect(part.type).to.equal 'sub'
    expect(rule).to.be.an 'object'
    expect(rule).to.have.property 'regex'
      .that.is.an.instanceof RegExp
    expect(rule).to.have.property 'token_defs'
      .that.is.an 'array'

    # link_sub_rule = builder.make ['[', /.*/, ']', 'LINK_DESC'],
      # 2: emit.text 'text'

    link_sub_rule = builder.make ['LINK_LABEL', 'LINK_DESC']

    expect(link_sub_rule.regex).to.be.an.instanceof(RegExp)
    expect(link_sub_rule.handler).to.be.a('function')
    expect(link_sub_rule.regex.source).to.equal(link_rule_expected_source)

  it "should support optional group", ->
    r = ['[', /.*/, ']', '(', /[^\s]*/, /\s"/, /.*/, '"', ')']
    link_rule = builder.make r,
      2: emit.text 'text'
      5: emit.attribute 'src'
      6: emit.optional.nothing()
      7: emit.optional.attribute 'title'
      8: emit.optional.nothing()

    expect(link_rule.regex).to.be.an.instanceof(RegExp)
    expect(link_rule.handler).to.be.a('function')
    expect(link_rule.regex.source).to.equal(link_rule_expected_source)

  it "should support alternative rules", ->
    builder.declareSubRule 'LINK_ID', ['[', /[^\s]*/, ']'],
      2: emit.attribute 'ref'

    link_rule_alt = builder.make ['[', /.*/, ']',['LINK_ID', 'LINK_DESC']],
      2: emit.attribute 'text'

    expect(link_rule_alt.regex).to.be.an.instanceof(RegExp)
    expect(link_rule_alt.handler).to.be.a('function')

  it "should handle delimiter pair"

  describe 'Built rule', ->
    it "should work", ->
      m = heading_rule.regex.exec(heading_text)
      expect(m).not.to.equal(null)
      heading = {}
      heading_rule.handler(heading, m)
      expect(heading).to.eql(heading_expected)

    it "should work with optional group", ->
      m1 = link_rule.regex.exec(link_text)
      m2 = link_rule.regex.exec(link_text_with_optional)

      link = {}
      link_with_optional = {}

      link_rule.handler(link, m1)
      link_rule.handler(link_with_optional, m2)

      expect(link).to.eql(link_expected)
      expect(link_with_optional).to.eql(link_with_optional_expected)

    it "should work with sub rule", ->
      m1 = link_sub_rule.regex.exec(link_text)
      m2 = link_sub_rule.regex.exec(link_text_with_optional)

      link = {}
      link_with_optional = {}

      link_sub_rule.handler(link, m1)
      link_sub_rule.handler(link_with_optional, m2)

      expect(link).to.eql(link_expected)
      expect(link_with_optional).to.eql(link_with_optional_expected)

    it "should work with alternative rule", ->
      m1 = link_rule_alt.regex.exec(link_text)
      m2 = link_rule_alt.regex.exec(link_text_with_optional)
      m3 = link_rule_alt.regex.exec(link_text_by_ref)

      link = {}
      link_with_optional = {}
      link_by_ref = {}

      link_rule_alt.handler(link, m1)
      link_rule_alt.handler(link_with_optional, m2)
      link_rule_alt.handler(link_by_ref, m3)

      expect(link).to.eql(link_alt_expected)
      expect(link_with_optional).to.eql(link_alt_with_optional_expected)
      expect(link_by_ref).to.eql(link_alt_by_ref_expected)
