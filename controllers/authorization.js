const asyncHandler = require('../utils/asyncHandler');
const KeyModel = require('../models/Key');

const getQuota = asyncHandler(async (req, res, next) => {
    res.json(await KeyModel.find().select(['-_id', 'key']));
});

const useQuota = asyncHandler(async (req, res, next) => {
    res.json(await KeyModel.create({
        key: 'Test'
    }));
});

module.exports = {
    getQuota,
    useQuota
};