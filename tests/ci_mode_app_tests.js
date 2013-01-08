var CiModeApp = require('../lib/ci_mode_app')
  , Config = require('../lib/config')
  , Server = require('../lib/server')
  , test = require('./testutils.js')
  , async = require('async')
  , expect = test.expect

describe.only('ci_mode_app', function() {

    // Setup
    (function() {
        var server_start = Server.prototype.start

        before(function() {
            // Short-circuit Server::start
            Server.prototype.start = function() {
                this.emit('server-start')
            }
        })

        after(function() {
            Server.prototype.start = server_start
        })
    }())


    // Helpers
    var TIMEOUT = 0.5 // seconds

    var tests = ['description']

    function createLauncher(sleep, output) {
        return {
            command: "sleep " + (sleep/1000) +
                     " && echo " + JSON.stringify(output),
            type: "process"
        }
    }

    function createApp(launchers) {

        function createConfig(options) {
            return {
                get: function(key) {
                    return options[key]
                },
                getLaunchers: function (app, cb) {
                    cb(options.launchers)
                }
            }
        }

        var launch_in_ci = []
        for(var name in launchers) {
            launch_in_ci.push(name)
        }

        var app = new CiModeApp(createConfig({
            timeout: TIMEOUT,
            launchers: launchers,
            launch_in_ci: launch_in_ci
        }))

        // Disable app.quit
        app.quit = function() {}

        return app
    }


    function createLaunchers() {
        return {
            launcher1: createLauncher(10, '1..2\nok 1 - A\nok 2 - B\n'),
            launcher2: createLauncher(10, '1..2\nok 1 - A\nnot ok 2 - B\n')
        }
    }

    it('should launch in parallel', function() {
        var launchers = createLaunchers()
        var app = createApp(launchers)
        for(var name in launchers) {
            expect(launchers[name].runner).to.be.ok
        }
    })


    // Exit Conditions
    it('should not stop when all runners finished but #runners < #launchers', function() {
        expect(true).to.be.ok
        expect(false).to.be.ok
    })

    it('should not stop when #runners >= #launchers but not all runners finished ', function() {

    })

    it('should stop when #runners >= #launchers AND all runners finished ', function() {

    })

    it('stops after timeout, even if runners are not finished', function() {

    })


    // Results
    it('writes test results to stdout when complete', function() {

    })

})
