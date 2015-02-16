path        = require 'path'
gulp        = require 'gulp'
gutil       = require 'gulp-util'
coffee      = require 'gulp-coffee'
map         = require 'gulp-sourcemaps'
watch       = require 'gulp-watch'
plumber     = require 'gulp-plumber'
browserify  = require 'gulp-browserify'
mocha       = require 'gulp-mocha'
rename      = require 'gulp-rename'
del         = require 'del'
karma       = require('karma').server
expect      = require 'expect.js'

# Source map support
require('source-map-support').install()

# Config
# config = require './config'

# Sources
coffee_src    = './coffee/**/*.coffee'
test_src     = './test/**/*.spec.coffee'

# Destinations
lib_dst       = 'lib/'
browser_dst   = 'dist/'
map_dst       = 'map/'

watch_sources = ->
  gulp.watch coffee_src, ['coffee']

compile_coffee = ->
  gulp.src coffee_src
    .pipe plumber()
    .pipe map.init()
    .pipe coffee(bare: true)
    .pipe map.write('../' + map_dst)
    .on 'error', gutil.log
    .pipe gulp.dest(lib_dst)

gulp.task 'clean', (cb) ->
  del [lib_dst, browser_dst, map_dst], cb

gulp.task 'coffee', ->
  compile_coffee()

gulp.task 'watch', ->
  watch_sources()

gulp.task 'test', ['prepare-spec', 'coffee', 'browser'], ->
  gulp.src test_src, read: false
    .pipe mocha(
      reporter: 'spec'
      globals: ['expect']
    )

gulp.task 'test-browser', ['prepare-spec', 'coffee', 'browser'], (done) ->
  karma.start
    configFile: __dirname + '/karma.conf.coffee'
    singleRun: true
    , done

gulp.task 'browser', ['coffee'], ->
  gulp.src 'coffee/markright.coffee', read: false
    .pipe browserify(
      transform: ['coffeeify']
      extensions: ['.coffee']
      debug: true
    )
    .pipe rename('markright.js')
    .pipe gulp.dest(browser_dst)

spec_src = 'node_modules/commonmark/test/spec.txt'
spec_dst = './spec/commonmark.js'

gulp.task 'prepare-spec', (done) ->
  {loadAndSave} = require './dev-util/spec-loader'
  loadAndSave spec_src, spec_dst, done
  
gulp.task 'default', ['coffee', 'browser', 'test']
