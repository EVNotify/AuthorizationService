const asyncHandler = require('../utils/asyncHandler');
const KeyModel = require('../models/Key');

const getKey = asyncHandler(async (req, res, next) => {
    res.json(await KeyModel.findOne({
        key: req.authKey
    }).select(['-_id']));
});

const useKey = asyncHandler(async (req, res, next) => {
    res.json(await KeyModel.create({
        key: 'Test'
    }));
});

module.exports = {
    getKey,
    useKey
};