const express = require('express');
const router = express.Router();

const keyUtils = require('@evnotify/utils').key;

const authorizationController = require('../controllers/authorization');

const attachKey = (req, _res, next) => {
    req.authKey = req.params.key || keyUtils.extractKey(req);
    next();
};

/**
 * @api {get} /authorization Retrieve information about current authorization
 * @apiName GetAuthorization
 * @apiGroup Authorization
 * 
 * @apiHeader {String} authorization The authorization key as a Bearer Token
 * 
 * @apiSuccess {String} key The authorization key
 * @apiSuccess {Number} quota The amount of requests allowed in a month
 * @apiSuccess {Number} usage The amount of already used quota
 * @apiSuccess {String} hostname The hostname where key is valid for
 * 
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *      "key": "TestKey",
 *      "quota": "100",
 *      "usage": "12",
 *      "hostname": "example.com"
 *  }
 */
router.get('/:key', attachKey, authorizationController.getKey);
router.post('/', authorizationController.createKey);
router.post('/:key', attachKey, authorizationController.useKey);

module.exports = router;