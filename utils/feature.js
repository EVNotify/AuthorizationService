const defaultFeatures = () => {
    // TODO create default features to allow for default user (non-paid)
    return [{
        method: 'POST',
        path: '/authentication/:akey/verify'
    }, {
        method: 'POST',
        path: '/authentication/:akey/login'
    }, {
        method: 'POST',
        path: '/authorization/:key'
    }, {
        method: 'GET',
        path: '/settings/:akey'
    }, {
        method: 'PATCH',
        path: '/settings/:akey'
    }, {
        method: 'DELETE',
        path: '/settings/:akey'
    }, {
        method: 'GET',
        path: '/sync/:akey'
    }, {
        method: 'POST',
        path: '/sync/:akey'
    }, {
        method: 'POST',
        path: '/logs/latest'
    }, {
        method: 'GET',
        path: '/logs'
    }, {
        method: 'GET',
        path: '/logs/:id'
    }, {
        method: 'GET',
        path: '/logs/latest'
    }, {
        method: 'GET',
        path: '/logs/current'
    }];
};

module.exports = {
    defaultFeatures
};
