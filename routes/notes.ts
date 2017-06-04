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
router.get('/analyze_words', async function( req, resp ){
    let query = <CutReq>req.query
    let result =  await wsApp.do_analyze(query.content);
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
    origin_content: string,
    tag : string[],
}


interface SectionRecord {
    parent_id: ObjectID,
    content: string,
    tag : string[],
}

class AddNotesResp {
    err : 0 | 1 =  0;
    note_id : string = '';
    section_ids : string[] = [];
}

router.post('/add', async function (req, resp) {

    let addNotesReq = <AddNotesReq>req.body;

    const addNotesResp = new AddNotesResp();

    let record = await notes.insertOne(<NoteRecord>{
        title: addNotesReq.title,
        url: addNotesReq.url,
        origin_content: addNotesReq.content,
        tag:[],
    });

    addNotesResp.note_id = record.insertedId + '';

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
                        const section_record = await sections.insertOne(<SectionRecord>{
                            ...task,
                            tag:[],
                            parent_id: record.insertedId
                        })

                        addNotesResp.section_ids.push(section_record.insertedId + '');
                    } catch (e) { }

                    done();
                }, function (err) {
                    err ? reject(err) : resolve();
                });
    });

    resp.json(addNotesResp);

});

interface AddTagReq {
    id : string,
    tag : string
}

router.post('/add_tag', async function( req, resp ){
    
    const body = <AddTagReq>req.body;

    const notes_query = {_id : new ObjectID(body.id)};
    const origin_record = await notes.findOne(notes_query);

    const update_record = await notes.updateOne(notes_query, { $addToSet : { tag : body.tag }});

    resp.json({
        err : 0
    });
});

router.post('/section_add_tag', async function( req, resp ){
    
    const body = <AddTagReq>req.body;

    const section_query = {_id : new ObjectID(body.id)};
    const origin_record = await sections.findOne(section_query);

    const update_record = await sections.updateOne(section_query, { $addToSet : { tag : body.tag }});

    resp.json({
        err : 0
    });
});