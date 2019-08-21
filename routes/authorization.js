const express = require('express');
const router = express.Router();

const authorizationController = require('../controllers/authorization');

router.get('/', authorizationController.getQuota);
router.post('/', authorizationController.useQuota);

module.exports = router;