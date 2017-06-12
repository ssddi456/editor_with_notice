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
        mongodb.MongoClient.connect('mongodb://' + conf.mongo.host + ':' + conf.mongo.port + '/' + conf.mongo.db, {
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

        var insert_res;
        it('insert a note', function (done) {
            req.post({
                url: `${base_url}/add`,
                form: {
                    title: 'test',
                    url: 'http://some.com/test.html',
                    content: 'string\r\nsome notes',
                }
            }, function (err, resp, body) {

                insert_res = body = JSON.parse(body);
                console.log(body);

                assert.equal(body.err, 0, 'unexcepted error info');

                done()
            })

        });

        it('add tag for a note', function (done) {
            req.post({
                url: `${base_url}/add_tag`,
                form: {
                    id: insert_res.note_id,
                    tag: 'test'
                }
            }, function (err, resp, body) {

                body = JSON.parse(body);
                console.log(body);

                assert.equal(body.err, 0, 'unexcepted error info');

                done()
            })

        });
        it('add tag for a section', function (done) {
            req.post({
                url: `${base_url}/section_add_tag`,
                form: {
                    id: insert_res.section_ids[0],
                    tag: 'test'
                }
            }, function (err, resp, body) {

                assert(err == null, 'no request error');

                body = JSON.parse(body);
                console.log(err, body);
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

        it('analyze a paragragh', function (done) {
            this.timeout(4000);

            req.get({
                url: `${base_url}/analyze_words`,
                qs: {
                    content: ' 可直接按照分词程序命令格式运行可执行的jar包\n\
  自行编译需要安装Gradle, 然后在项目根目录执行gradle build, 生成文件在build/libs下\n\
（thulac需要模型的支持，需要将下载的模型放到当前目录下）'
                }
            }, function (err, resp, body) {

                body = JSON.parse(body);
                console.log(body);
                assert.equal(body.err, 0, 'unexcepted error info');

                done()
            })

        });

        it('tokenize a paragragh', function (done) {
            this.timeout(4000);

            req.get({
                url: `${base_url}/tokenize_words`,
                qs: {
                    content: ' 可直接按照分词程序命令格式运行可执行的jar包\n\
  自行编译需要安装Gradle, 然后在项目根目录执行gradle build, 生成文件在build/libs下\n\
（thulac需要模型的支持，需要将下载的模型放到当前目录下）'
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