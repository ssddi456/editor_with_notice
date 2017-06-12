var fs = require('fs');
var path = require('path');
var debug = require('debug')('onsave');

if (require.main == module) {
    process.env.DEBUG = 'onsave';
}

var watchr = require('watchr');
var request = require('request');
var req = request.defaults({});
var _ = require('underscore');

var reload = _.throttle(function ( fullPath ) {
    req.get({
        url: 'http://localhost:35729/reload',
        qs: {
            liveCSS: true,
            path: path.basename(fullPath),
            command: 'reload'
        }
    }, function ( err, resp, body ) {
        console.log('send reload', body);
    });
});

var listener = function (changeType, fullPath, currentStat, previousStat) {
    reload(fullPath);
};

var noop = function (e) {
    console.log(e);
};


[
    path.join(__dirname, '../public'),
    path.join(__dirname, '../views')
].forEach(function (path) {
    watchr.open(path, listener, noop);
});