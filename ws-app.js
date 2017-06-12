var io = require('socket.io');
var debug = require('debug')('editor_with_notice:ws-app');
var child_process = require('child_process');






function handle(http) {
    var app = new io(http, {
        path: '/ws',
        serveClient: true
    });

    app.on('connection', function (client) {
        var TAG = 'client ' + client.id;
        client.join('/');

        debug(TAG, 'client.request.url', client.request.url, client.rooms);

        for(var name in callback_map){
            if( callback_map.hasOwnProperty(name) ){
                client.on(name, function (e) {
                    cut_queue[e.seq].resolve(e.result);
                    cut_queue[e.seq] = undefined;
                });
            }
        }

    });

    service = app;
}


var service;
var cut_seq = 0;
var cut_queue = {};
var callback_map = {};

var regist_event = function ( callto_name, callback_name ) {
    callback_map[callback_name] = 1;

    return function (content) {
        return new Promise(function (resolve, reject) {
            var seq = cut_seq++;
            var info = {
                seq: seq,
                content: content
            };
            debug(info);
            service.to('/').emit(callto_name, info);
            info.resolve = resolve;
            cut_queue[seq] = info;
        });
    }
}


module.exports.handle = handle;
module.exports.do_cut = regist_event('cut_words', 'cut_result');
module.exports.do_analyze = regist_event('analyze_words', 'analyze_result');
module.exports.do_tokenize = regist_event('tokenize_words', 'tokenize_result');
