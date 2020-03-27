const asyncHandler = require('@evnotify/utils').asyncHandler;
const KeyModel = require('../models/Key');
const errors = require('../errors.json');

const getKey = asyncHandler(async (req, res, next) => {
    if (!req.authKey) return next(errors.MISSING_KEY);
    const key = await KeyModel.findOne({
        key: req.authKey
    }).select(['-_id']);

    if (!key) return next(errors.UNKNOWN_KEY);
    if (key.hostname !== '*' && key.hostname !== req.hostname.toLowerCase()) return next(errors.FORBIDDEN);
    res.json(key);
});

const useKey = asyncHandler(async (req, res, next) => {
    if (!req.authKey) return next(errors.MISSING_KEY);
    const key = await KeyModel.findOne({
        key: req.authKey
    }).select(['usage', 'quota', 'hostname', 'features']);

    if (!key) return next(errors.UNKNOWN_KEY);
    if (key.hostname !== '*' && key.hostname !== req.hostname.toLowerCase()) return next(errors.FORBIDDEN);
    
    const features = Array.isArray(key.features) ? key.features : [];

    if (req.body.referer == null || typeof req.body.referer.method !== 'string' || typeof req.body.referer.path !== 'string') return next(errors.FORBIDDEN);
    // check if feature is allowed
    if (!(features.some((feature) => feature.path === req.body.referer.path && feature.method === req.body.referer.method))) return next(errors.FORBIDDEN);
    // quota / usage
    if ((++key.usage || 0) > (key.quota || 0)) {
        res.setHeader('Retry-After', 10);
        return next(errors.QUOTA_EXCEEDED);
    }
    await KeyModel.updateOne({
        key: req.authKey
    }, {
        $inc: {
            usage: 1
        }
    });
    res.json({
        usage: key.usage,
        quota: key.quota
    });
});

module.exports = {
    getKey,
    useKey
};