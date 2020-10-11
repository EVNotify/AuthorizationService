const express = require('express');
const router = express.Router();

const keyUtils = require('@evnotify/utils').key;

const authorizationController = require('../controllers/authorization');

const attachKey = (req, _res, next) => {
    req.authKey = ((req.params.key || keyUtils.extractKey(req)) || '').replace('Bearer', '').trim();
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
 * Note: This request is used internally and called automatically when you register (that's how you get your own API Key) and is not intend for the usage outside.
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
 * @apiSuccessExample API Key created
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
/**
 * @api {post} /authorization/:key Authorize and track usage of API-Key
 * @apiName UseAuthorizationKey
 * @apiGroup Authorization
 * 
 * @apiDescription In order to be able to communicate with the API you need a valid API key.
 * Every API key has a specific amount of quota. Each request increases the usage. If usage exceeds quota, no more requests can be made until usage is resetted again.
 * This route takes the action that you want to execute and checks if you are allowed to do that. If so, usage increases.
 * This method will be used internally for every action that you call via "normal" requests such as retrieving soc data and is not intended to be used from outside.
 * 
 * @apiParam  {String} key the API-Key to use
 * 
 * @apiParam {Object} referer the details about the current action to be executed
 * @apiParam {String} referer.method the http method from the action
 * @apiParam {String} referer.path the URL / path from the action
 * @apiParam {String} referer.akey the AKey (scope) to be used within the action
 * @apiParam {Object} [referer.params] Optional params object containing keys and values, e.g. {":id": "123"}
 * 
 * @apiSuccess {Number} quota The amount of requests allowed in a month
 * @apiSuccess {Number} usage The amount of already used quota
 * 
 * @apiSuccessExample Authorised request with increased usage
 *  HTTP/1.1 200 OK
 *  {
 *      "quota": "100",
 *      "usage": "12"
 *  }
 * 
 * @apiErrorExample {json} Key not found
 *  HTTP/1.1 404 Not Found
 *  {
 *      "code": 404,
 *      "message": "Authorization key invalid or not found. Ensure to send a Bearer Token within Authorization header or within URL if applicable"
 *  }
 * @apiErrorExample {json} Forbidden
 *  HTTP/1.1 404 Not Found
 *  {
 *      "code": 403,
 *      "message": "You are not permitted to execute this action"
 *  }
 */
router.post('/:key', attachKey, authorizationController.useKey);

module.exports = router;
