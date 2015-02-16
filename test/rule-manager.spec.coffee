expect = require('./get-expect')()
RuleManager = require '../lib/core/rule-manager'
Core = require '../lib/lang/core'

describe "Rule Manager", ->
  rules = new RuleManager()
  core = new Core()
  rules.addLanguagePack(core)

  it "should be configuable", ->
    rules.enable 'core'
    expect(rules.blockRules.length).to.equal(core.blockRules.length)
    expect(rules.inlineRules.length).to.equal(core.inlineRules.length)
    rules.disable 'core'
    expect(rules.blockRules.length).to.equal(0)
    expect(rules.inlineRules.length).to.equal(0)
    rules.enable 'core', ['rules', 'atx_header', 'code_span']
    expect(rules.blockRules.length).to.equal(2)
    expect(rules.inlineRules.length).to.equal(1)
