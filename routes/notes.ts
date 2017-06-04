import * as express from "express";
import { notes, sections } from "../lib/storage";
import { ObjectID } from "mongodb";
import * as async from "async";
import wsApp = require('../ws-app');
const debug = require('debug')('editor_with_notice:notes');
export const router = express.Router();


router.get('/list', function (req, resp) {

});


router.get('/find', function (req, resp) {

});



interface CutReq{
    content : string
}

router.get('/cut_words', async function( req, resp ){
    let query = <CutReq>req.query
    let result =  await wsApp.do_cut(query.content);
    resp.json({
        err : 0,
        result
    });
});



interface AddNotesReq {
    title: string
    url: string
    content: string
}

interface NoteRecord {
    title: string
    url: string
    origin_content: string
}


interface SectionRecord {
    parent_id: ObjectID,
    content: string
}

router.post('/add', async function (req, resp) {

    let addNotesReq = <AddNotesReq>req.body;


    let record = await notes.insertOne(<NoteRecord>{
        title: addNotesReq.title,
        url: addNotesReq.url,
        origin_content: addNotesReq.content
    });

    await new Promise(function (resolve, reject) {
        async.eachLimit(
            addNotesReq.content
                .split('\n')
                .filter(Boolean)
                .map((a, i) => {
                    return { content: a, indext: i };
                }), 
                5, 
                async function (task, done) {

                    try {
                        await sections.insertOne(<SectionRecord>{
                            ...task,
                            parent_id: record.insertedId
                        })
                    } catch (e) { }

                    done();
                }, function (err) {
                    err ? reject(err) : resolve();
                });
    });

    resp.json({
        err: 0
    });

});