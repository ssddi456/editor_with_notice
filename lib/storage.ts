import * as mongodb from "mongodb";
const conf = require("../conf/conf.json");



let note_db: mongodb.Db = undefined;

export let notes: mongodb.Collection;
export let sections: mongodb.Collection;

export const ready = new Promise(function (resolve, reject) {

    mongodb.MongoClient.connect(`mongodb://${conf.mongo.host}:${conf.mongo.port}/${conf.mongo.db}`, {
        server: {
            poolSize: 10,
        }
    }, async function (err, db) {
        if (err) {
            throw err;
        } else {
            note_db = db;

            await db.authenticate(conf.mongo.user, conf.mongo.pass)

            notes = db.collection('notes');
            sections = db.collection('sections');

            resolve();
        }
    });
})
