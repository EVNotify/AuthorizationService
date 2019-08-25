const asyncHandler = require('../utils/asyncHandler');
const KeyModel = require('../models/Key');
const errors = require('../errors.json');

const getKey = asyncHandler(async (req, res, next) => {
    if (!req.authKey) return next(errors.MISSING_KEY);
    const key = await KeyModel.findOne({
        key: req.authKey
    }).select(['-_id']);

    if (!key) return next(errors.UNKNOWN_KEY);
    res.json(key);
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