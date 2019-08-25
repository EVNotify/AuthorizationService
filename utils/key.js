const extractKey = (req) => {
    return typeof req.headers.authorization === 'string' ? req.headers.authorization.split(' ')[1] : '';
};

module.exports = {
    extractKey
};