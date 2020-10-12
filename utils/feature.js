const defaultFeatures = () => {
    // TODO create default features to allow for default user (non-paid)
    return [{
        method: 'POST',
        path: '/authentication/:akey/verify'
    }, {
        method: 'POST',
        path: '/authentication/:akey/login'
    }];
};

module.exports = {
    defaultFeatures
};
