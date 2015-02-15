expect = require 'expect.js'
path = require 'path'
RuleManager = require '../lib/core/rule-manager'
Core = require '../lib/lang/core'

describe "Rule Manager", ->
  rules = new RuleManager()
  core = new Core()
  rules.addLanguagePack(core)

  it "should be configuable", ->
    rules.enable 'core'
    expect(rules.blockRules.length).to.be(core.blockRules.length)
    expect(rules.inlineRules.length).to.be(core.inlineRules.length)
    rules.disable 'core'
    expect(rules.blockRules.length).to.be(0)
    expect(rules.inlineRules.length).to.be(0)
    rules.enable 'core', ['rules', 'atx_header', 'code_span']
    expect(rules.blockRules.length).to.be(2)
    expect(rules.inlineRules.length).to.be(1)
