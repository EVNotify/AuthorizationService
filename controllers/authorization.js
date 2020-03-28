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
    // check if dynamic URL parameters have been passed to the parsed request URL
    if (req.body.referer.params != null && typeof req.body.referer.params === 'object' && Object.keys(req.body.referer.params).length) {
        if (!(features.some((feature) => {
            let isValid = false;
            const originalParts = req.body.referer.path.split('/');
            const featureParts = feature.path.split('/');

            /*
            Experimental new way to check
            GET /users/Max/log/123

            (GET /users/:username/log/:id)

            GET /users/:username/station/:id
            */
            originalParts.forEach((originalPart, currentIdX) => {
                const featurePart = featureParts[currentIdX];

                if (featurePart) {
                    if (featurePart === originalPart) {
                        // good
                    } else if (featurePart.includes(':') && Object.keys(req.body.referer.params).includes(featurePart.substr(1)) && req.body.referer.params[featurePart.substr(1)] === originalPart) {
                        // good
                    }
                }
            });

            /**
                GET /users/:username/log/:id

                GET /users/:username/station/:id

                This check works for parameters check, but does not care about the rest (critical!)
             */
            
            // // ensure that path includes dynamic parameter identifier
            // if (feature.path.includes(':')) {
            //     // ensure that every dynamic parameter is used in our request
            //     return Object.keys(req.body.referer.params).every((key) => feature.path.includes(`/:${key}`));
            // }
            return isValid;
        }))) return next(errors.FORBIDDEN);
    } else {
        // check if feature is allowed
        if (!(features.some((feature) => feature.path === req.body.referer.path && feature.method === req.body.referer.method))) return next(errors.FORBIDDEN);
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
    useKey
};