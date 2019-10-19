const express = require('express');
const router = express.Router();

const keyUtils = require('@evnotify/utils').key;

const authorizationController = require('../controllers/authorization');

const attachKey = (req, _res, next) => {
    req.authKey = keyUtils.extractKey(req);
    next();
};

router.get('/', attachKey, authorizationController.getKey);
router.post('/', attachKey, authorizationController.useKey);

module.exports = router;