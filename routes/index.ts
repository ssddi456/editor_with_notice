var express = require('express');
var router = express.Router();



var notes = require('./notes');

router.use('/notes',notes.router);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * 搞一个服务用于提供文本解析的api
 * 
 * 解析包含多个部分
 * 
 * 关键字
 * 
 * 概念的相关信息
 * 
 * 外部信息：百度百科 wiki百科
 * 
 * 角色信息
 * 
 * 事件信息
 * 
 * 类似桥段
 * 
 * 自己写的桥段
 * 
 * 
 * 可扩展的纯文本编辑器？
 * 
 */


/**
 * 
 * 同时提供小说文本的存储与索引
 * 
 */

router.use(function (err:Error ,req, resp, next) {
    if( err ){
      let error_info = {
        error : 1,
        msg : err.message,
        stack : err.stack
      };

      if( req.xhr ){
        resp.json(error_info)
      } else {
        resp.render('error', error_info);
      }
    }
});


module.exports = router;
