const crypto = require('crypto');
const asyncHandler = require('@evnotify/utils').asyncHandler;
const KeyModel = require('../models/Key');
const errors = require('../errors.json');
const defaultFeatures = require('../utils/feature').defaultFeatures();

const createKey = asyncHandler(async (req, res, next) => {
    if (!Array.isArray(req.body.scopes) || !req.body.scopes.every((scope) => typeof scope === 'string' && scope.length === 6)) return next(errors.INVALID_SCOPES);

    const randomKey = crypto.randomBytes(8).toString('hex');

    await KeyModel.create({
        key: randomKey,
        hostname: '*',
        quota: 10000,
        scopes: req.body.scopes,
        features: defaultFeatures
    });

    res.json(await KeyModel.findOne({
        key: randomKey
    }).select('-_id -createdAt -updatedAt'));
});

const getKey = asyncHandler(async (req, res, next) => {
    if (!req.authKey) return next(errors.MISSING_KEY);
    const key = await KeyModel.findOne({
        key: req.authKey
    }).select(['-_id']);

    if (!key) return next(errors.UNKNOWN_KEY);
    res.json(key);
});

const useKey = asyncHandler(async (req, res, next) => {
    if (!req.authKey) return next(errors.MISSING_KEY);
    const key = await KeyModel.findOne({
        key: req.authKey
    }).select(['usage', 'quota', 'hostname', 'features', 'scopes']);

    if (!key) return next(errors.UNKNOWN_KEY);
    if (key.hostname !== '*' && key.hostname !== req.hostname.toLowerCase()) return next(errors.FORBIDDEN);
    
    const features = Array.isArray(key.features) ? key.features : [];
    const scopes = Array.isArray(key.scopes) ? key.scopes : [];

    console.info('Use key', req.body.referer);
    if (req.body.referer == null || typeof req.body.referer.method !== 'string' || typeof req.body.referer.path !== 'string' || typeof req.body.referer.akey !== 'string') return next(errors.FORBIDDEN);
    if (!scopes.includes(req.body.referer.akey)) return next(errors.FORBIDDEN);
    // check if dynamic URL parameters have been passed to the parsed request URL
    if (req.body.referer.params != null && typeof req.body.referer.params === 'object' && Object.keys(req.body.referer.params).length) {
        if (!(features.some((feature) => {
            if (feature.method !== req.body.referer.method) return;
            const validParts = [];
            const originalParts = req.body.referer.path.split('/').filter((part) => part);
            const featureParts = feature.path.split('/').filter((part) => part);
            const originalParamKeys = Object.keys(req.body.referer.params);

            // ensure that url and parameters parts are equal
            if (originalParts.length !== featureParts.length) return;
            if (originalParamKeys.length !== featureParts.filter((part) => part.startsWith(':')).length) return;

            originalParts.forEach((originalPart, currentIdX) => {
                const featurePart = featureParts[currentIdX];

                if (featurePart) {
                    // check if the part is equal, if not, check if it is the same, but as the correct dynamic parameter
                    if (featurePart === originalPart) {
                        validParts.push(featurePart);
                    } else if (featurePart.includes(':') && originalParamKeys.includes(featurePart.substr(1)) && req.body.referer.params[featurePart.substr(1)] === originalPart) {
                        validParts.push(featurePart);
                    }
                }
            });

            return validParts.length === originalParts.length;
        }))) {
            console.error(`Forbidden action called: [${req.body.referer.method}] ${req.body.referer.path}`);
            return next(errors.FORBIDDEN);
        }
    } else {
        // check if feature is allowed
        if (!(features.some((feature) => feature.path === req.body.referer.path && feature.method === req.body.referer.method))) {
            console.error(`Forbidden action called: [${req.body.referer.method}] ${req.body.referer.path}`);
            return next(errors.FORBIDDEN);
        }
    }

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
    createKey,
    useKey
};
