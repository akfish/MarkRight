expect = require('./get-expect')()
RuleManager = require '../lib/core/rule-manager'
Core = require '../lib/lang/core'
Parser = require '../lib/compiler/parser'

describe "Parser (testing with `core` language pack)", ->
  rules = new RuleManager()
  core = new Core()
  rules.addLanguagePack(core)
  parser = new Parser(rules)

  it "should parse inline elements"
  it "should parse solid block elements"
  it "should parse fluid block elements"
  it "should parse a document"
