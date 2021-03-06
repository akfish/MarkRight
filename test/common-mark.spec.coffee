expect = require('./get-expect')()
specs = require ('../spec/commonmark')

Markright = require '../lib/markright'
mr = Markright.Default

describe "CommonMark Spec (Total: #{specs.count })", ->
  for name, suit of specs
    if not Array.isArray(suit) or suit.length == 0
      continue
    tests = suit
    it "#{name} (#{suit.length})" , ->
      for test in tests
        actual = mr.compile(test.md)
        try
          expect(actual).to.equal(test.html)
        catch error
          error.showDiff = true
          error.expected = test.html
          error.actual = actual
          throw error
