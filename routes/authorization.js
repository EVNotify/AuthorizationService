const express = require('express');
const router = express.Router();

const keyUtils = require('@evnotify/utils').key;

const authorizationController = require('../controllers/authorization');

const attachKey = (req, _res, next) => {
    req.authKey = req.params.key || keyUtils.extractKey(req);
    next();
};

/**
 * @api {get} /authorization/:key Retrieve API-Key information
 * @apiName GetAuthorizationKey
 * @apiGroup Authorization
 * 
 * @apiDescription In order to be able to communicate with the API you need a valid API key.
 * With this request you can retrieve information about your API key such as your current usage and quota.
 * 
 * @apiParam {String} key The API Key that is used for authorization
 * 
 * @apiSuccess {String} key The authorization key
 * @apiSuccess {Number} quota The amount of requests allowed in a month
 * @apiSuccess {Number} usage The amount of already used quota
 * @apiSuccess {String} hostname The hostname where key is valid for (* for no limitation)
 * @apiSuccess {String[]} scopes List of AKeys where the API key can be used for
 * @apiSuccess {Object[]} features List of features from HTTP routes / actions where the API key can be used for
 * 
 * @apiSuccessExample Authorization key information
 *  HTTP/1.1 200 OK
 *  {
 *      "key": "TestKey",
 *      "quota": "100",
 *      "usage": "12",
 *      "hostname": "example.com",
 *      "scopes": ["123456"],
 *      "features": [{
 *          method: 'GET',
 *          path: '/some/action'
 *      }]
 *  }
 * 
 * @apiErrorExample {json} Key not found
 *  HTTP/1.1 404 Not Found
 *  {
 *      "code": 404,
        "message": "Authorization key invalid or not found. Ensure to send a Bearer Token within Authorization header or within URL if applicable"
 *  }
 */
router.get('/:key', attachKey, authorizationController.getKey);
/**
 * @api {post} /authorization/ Create new API-Key
 * @apiName CreateAuthorizationKey
 * @apiGroup Authorization
 * 
 * @apiDescription In order to be able to communicate with the API you need a valid API key.
 * To obtain a default API key, you can use this function. However, for custom API quota, specific roles / features, a manual contact is required (info<at>evnotify.de).
 * 
 * @apiParam  {String[]} scopes the AKey list where API key should be used for
 * 
 * @apiSuccess {String} key The created authorization API key
 * @apiSuccess {Number} quota The amount of requests allowed in a month
 * @apiSuccess {Number} usage The amount of already used quota
 * @apiSuccess {String} hostname The hostname where key is valid for (* for no limitation)
 * @apiSuccess {String[]} scopes List of AKeys where the API key can be used for
 * @apiSuccess {Object[]} features List of features from HTTP routes / actions where the API key can be used for
 * 
 * @apiSuccessExample Authorization key information
 *  HTTP/1.1 200 OK
 *  {
 *      "key": "TestKey",
 *      "quota": "100",
 *      "usage": "12",
 *      "hostname": "example.com",
 *      "scopes": ["123456"],
 *      "features": [{
 *          method: 'GET',
 *          path: '/some/action'
 *      }]
 *  }
 */
router.post('/', authorizationController.createKey);
router.post('/:key', attachKey, authorizationController.useKey);

module.exports = router;