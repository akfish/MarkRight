path        = require 'path'
gulp        = require 'gulp'
gutil       = require 'gulp-util'
coffee      = require 'gulp-coffee'
map         = require 'gulp-sourcemaps'
watch       = require 'gulp-watch'
plumber     = require 'gulp-plumber'
browserify  = require 'gulp-browserify'
mocha       = require 'gulp-mocha'
del         = require 'del'

# Config
# config = require './config'

# Sources
coffee_src    = './coffee/**/*.coffee'
tests_src     = './tests/**/*.coffee'

# Destinations
lib_dst       = 'lib/'
browser_dst   = 'dist/'
map_dst       = 'maps/'

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

gulp.task 'test', ->
  gulp.src tests_src, read: false
    .pipe mocha(reporter: 'spec')

gulp.task 'browser', ['coffee'], ->
  gulp.src 'lib/markright.js'
    .pipe browserify()
    .pipe gulp.dest(browser_dst)

gulp.task 'default', ['coffee', 'test']
