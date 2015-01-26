var fs, load, loadSync, parse_spec, test_regex;

fs = require('fs');

test_regex = /^\.\n([\s\S]*?)^\.\n([\s\S]*?)^\.$|^#{1,6} *(.*)$/gm;

parse_spec = function(src) {
  var current_section, spec_src, specs, test_id, test_section_id;
  spec_src = src.replace(/\r\n?/g, "\n").replace(/^<!-- END TESTS -->(.|[\n])*/m, '');
  current_section = "";
  test_id = 0;
  test_section_id = 0;
  specs = {};
  spec_src.replace(test_regex, function(_, md, html, section) {
    if (section != null) {
      current_section = section;
      if (specs[section] == null) {
        specs[section] = [];
      }
      return test_section_id = 0;
    } else {
      test_section_id++;
      test_id++;
      return specs[current_section].push({
        md: md,
        html: html,
        section: current_section,
        section_id: test_section_id,
        id: test_id
      });
    }
  });
  specs.count = test_id;
  return specs;
};

load = function(spec_file, cb) {
  return fs.readFile(spec_file, 'utf8', function(err, data) {
    var specs;
    if (err != null) {
      if (typeof cb === "function") {
        cb(err);
      }
    }
    specs = parse_spec(data);
    return typeof cb === "function" ? cb(null, specs) : void 0;
  });
};

loadSync = function(spec_file) {
  var data, specs;
  data = fs.readFileSync(spec_file, 'utf8');
  specs = parse_spec(data);
  return specs;
};

module.exports = {
  load: load,
  loadSync: loadSync
};

//# sourceMappingURL=../../maps/util/spec-loader.js.map