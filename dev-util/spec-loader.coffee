fs = require 'fs'
mkdirp = require 'mkdirp'
path = require 'path'
test_regex = /^\.\n([\s\S]*?)^\.\n([\s\S]*?)^\.$|^#{1,6} *(.*)$/gm

parse_spec = (src) ->
  spec_src = src
    .replace(/\r\n?/g, "\n")
    .replace(/^<!-- END TESTS -->(.|[\n])*/m, '')
    .replace(/→/gm, '\t')

  current_section = ""
  test_id = 0
  test_section_id = 0
  specs = {}

  spec_src.replace test_regex, (_, md, html, section) ->
    if section?
      current_section = section
      if not specs[section]?
        specs[section] = []
      test_section_id = 0
    else
      test_section_id++
      test_id++
      specs[current_section].push
        md: md
        html: html
        section: current_section
        section_id: test_section_id
        id: test_id
  specs.count = test_id
  return specs

load = (spec_file, cb) ->
  # console.log "Loading spec from '#{spec_file}'"
  fs.readFile spec_file, 'utf8', (err, data) ->
    if err?
      cb? err

    specs = parse_spec(data)
    # console.log "Loaded #{tests.length} specs"

    cb? null, specs

loadSync = (spec_file) ->
  # console.log "Loading spec from '#{spec_file}'"
  data = fs.readFileSync spec_file, 'utf8'
  specs = parse_spec(data)
  # console.log "Loaded #{tests.length} specs"
  return specs

loadAndSave = (spec_file, dst_json, cb) ->
  load spec_file, (err, data) ->
    if err?
      cb? err
      return
    dst_dir = path.dirname(dst_json)
    mkdirp dst_dir, (err) ->
      if err?
        cb? err
        return
      fs.writeFile dst_json, "module.exports = " + JSON.stringify(data), cb

module.exports =
  load: load
  loadSync: loadSync
  loadAndSave: loadAndSave
