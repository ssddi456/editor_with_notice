var assert = require('assert');
var req = require('./helper/req');
var mongodb = require('mongodb');
var async = require('async');
var conf = require("../conf/conf.json");

describe('editor with note', function () {
    var base_url = 'http://localhost:37001/notes';


    before(function (done) {
        this.timeout(4000);

        console.log('\nclear up');
        var tag = '--  '
        mongodb.MongoClient.connect('mongodb://' + conf.mongo.host + ':' + conf.mongo.port +'/' + conf.mongo.db, {
            server: {
                poolSize: 10,
            }
        }, function (err, db) {
            if (err) {
                throw err;
            } else {
                console.log(tag, 'connection created');

                db.authenticate(conf.mongo.user, conf.mongo.pass, function () {
                    console.log(tag, 'db authenticated');
                    async.parallel([
                        function (done) {
                            db.collection('notes').remove({}, done);
                        },
                        function (done) {
                            db.collection('sections').remove({}, done);
                        }], function () {
                            console.log(tag, 'collection cleared');
                            db.close();
                            console.log('clear up ok\n');
                            done()
                        })
                });
            }
        });
    });

    describe('note management', function () {
        it('insert a note', function (done) {
            req.post({
                url: `${base_url}/add`,
                form: {
                    title: 'test',
                    url: 'http://some.com/test.html',
                    content: 'string\r\nsome notes',
                }
            }, function (err, resp, body) {

                body = JSON.parse(body);

                assert.equal(body.err, 0, 'unexcepted error info');

                done()
            })

        });
    });

    describe('word cuts', function () {
        it('cut a sentence', function (done) {
            req.get({
                url: `${base_url}/cut_words`,
                qs: {
                    content: '一些中文内容'
                }
            }, function (err, resp, body) {

                body = JSON.parse(body);
                console.log(body);
                assert.equal(body.err, 0, 'unexcepted error info');

                done()
            })

        });

        it('cut a sentence with comma', function (done) {
            req.get({
                url: `${base_url}/cut_words`,
                qs: {
                    content: '一些中文内容，包含各种符号&……'
                }
            }, function (err, resp, body) {

                body = JSON.parse(body);
                console.log(body);
                assert.equal(body.err, 0, 'unexcepted error info');

                done()
            })

        });
    });
});