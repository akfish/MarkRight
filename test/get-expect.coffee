module.exports = ->
  if chai? then chai.expect else require('chai').expect
