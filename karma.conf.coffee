# Karma configuration
# Generated on Mon Feb 16 2015 13:35:36 GMT+0800 (China Standard Time)

module.exports = (config) ->
  config.set

    # base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: ''


    # frameworks to use
    # available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['commonjs', 'mocha']


    # list of files / patterns to load in the browser
    files: [
      {pattern: 'spec/*.js', include: false},
      {pattern: 'node_modules/chai/chai.js', include: true},
      {pattern: 'lib/**/*.js', include: true},
      {pattern: 'test/*.coffee', include: true},
    ]


    # list of files to exclude
    exclude: [
    ]


    # preprocess matching files before serving them to the browser
    # available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'spec/*.js': ['commonjs']
      'lib/**/*.js': ['commonjs']
      'test/*.coffee': ['coffee', 'commonjs']
    }

    commonjsPreprocessor: {
      modulesRoot: 'test'
    }
    # test results reporter to use
    # possible values: 'dots', 'progress'
    # available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha']


    # web server port
    port: 9876


    # enable / disable colors in the output (reporters and logs)
    colors: true


    # level of logging
    # possible values:
    # - config.LOG_DISABLE
    # - config.LOG_ERROR
    # - config.LOG_WARN
    # - config.LOG_INFO
    # - config.LOG_DEBUG
    logLevel: config.LOG_INFO


    # enable / disable watching file and executing tests whenever any file changes
    autoWatch: true


    # start these browsers
    # available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox', 'IE']


    # Continuous Integration mode
    # if true, Karma captures browsers, runs the tests and exits
    singleRun: false
