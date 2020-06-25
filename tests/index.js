const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../index');
const should = chai.should();
const errors = require('../errors.json');

const keyModel = require('../models/Key');

// variables to hold information
let createdAPIKey;

chai.use(chaiHttp);

before((done) => {
    server.on('server_ready', async () => {
        await keyModel.deleteOne({
            key: 'Test1'
        });
        await keyModel.deleteOne({
            key: 'Test2'
        });
        await keyModel.deleteOne({
            key: 'Test3'
        });
        await keyModel.deleteOne({
            key: 'Test4'
        });
        await keyModel.deleteOne({
            key: 'Test5'
        });
        await keyModel.deleteOne({
            key: 'Test6'
        });
        await keyModel.deleteOne({
            key: 'Test7'
        });
        await keyModel.create({
            key: 'Test1',
            hostname: '127.0.0.1',
            quota: 1
        });
        await keyModel.create({
            key: 'Test2',
            hostname: '*',
            features: [{
                method: 'GET',
                path: '/something'
            }],
            quota: 1
        });
        await keyModel.create({
            key: 'Test3',
            hostname: 'example.com',
            quota: 1
        });
        await keyModel.create({
            key: 'Test4',
            hostname: '127.0.0.1',
            features: [{
                method: 'POST',
                path: '/authorization'
            }],
            quota: 1
        });
        await keyModel.create({
            key: 'Test5',
            hostname: '*',
            scopes: ['123456'],
            features: [{
                method: 'GET',
                path: '/authorization'
            }],
            quota: 1
        });
        done();
    });
});

describe('Authorization', () => {
    describe('GET', () => {
        it('Requesting non-existing route should fail', (done) => {
            chai.request(server)
                .get('/')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(404);
                    response.body.should.have.property('error').eql(errors.UNKNOWN_ROUTE);
                    done();
                });
        });
        it('Requesting without key should fail due to missing route', (done) => {
            chai.request(server)
                .get('/authorization')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(404);
                    response.body.should.have.property('error').eql(errors.UNKNOWN_ROUTE);
                    done();
                });
        });
        it('Requesting with non-existing key should fail', (done) => {
            chai.request(server)
                .get('/authorization/1234')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(404);
                    response.body.should.have.property('error').eql(errors.UNKNOWN_KEY);
                    done();
                });
        });
        it('Requesting with valid local key should return info', (done) => {
            chai.request(server)
                .get('/authorization/Test1')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    response.body.should.not.have.property('id');
                    response.body.should.have.property('key').eql('Test1');
                    response.body.should.have.property('quota').eql(1);
                    response.body.should.have.property('usage').eql(0);
                    response.body.should.have.property('hostname').eql('127.0.0.1');
                    done();
                });
        });
        it('Requesting with valid wildcard key should return info', (done) => {
            chai.request(server)
                .get('/authorization/Test2')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    response.body.should.not.have.property('id');
                    response.body.should.have.property('key').eql('Test2');
                    response.body.should.have.property('quota').eql(1);
                    response.body.should.have.property('usage').eql(0);
                    response.body.should.have.property('hostname').eql('*');
                    done();
                });
        });
        it('Requesting info again should not increase usage', (done) => {
            chai.request(server)
                .get('/authorization/Test2')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    response.body.should.not.have.property('id');
                    response.body.should.have.property('key').eql('Test2');
                    response.body.should.have.property('quota').eql(1);
                    response.body.should.have.property('usage').eql(0);
                    response.body.should.have.property('hostname').eql('*');
                    done();
                });
        });
        it('Requesting with different hostname key should still return info', (done) => {
            chai.request(server)
                .get('/authorization/Test3')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(403);
                    response.body.should.have.property('error').eql(errors.FORBIDDEN);
                    done();
                });
        });
    });
    describe('POST', () => {
        // POST /
        it('Requesting creation of new key without scope should fail', (done) => {
            chai.request(server)
                .post('/authorization')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(400);
                    response.body.should.have.property('error').eql(errors.INVALID_SCOPES);
                    done();
                });
        });
        it('Requesting creation of new key with invalid scope should fail', (done) => {
            chai.request(server)
                .post('/authorization')
                .send({
                    scopes: ['invalid']
                })
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(400);
                    response.body.should.have.property('error').eql(errors.INVALID_SCOPES);
                    done();
                });
        });
        it('Requesting creation of new key with invalid scope should fail', (done) => {
            chai.request(server)
                .post('/authorization')
                .send({
                    scopes: ['invalid']
                })
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(400);
                    response.body.should.have.property('error').eql(errors.INVALID_SCOPES);
                    done();
                });
        });
        it('Requesting creation of new key with valid scope should return generated api key', (done) => {
            chai.request(server)
                .post('/authorization')
                .send({
                    scopes: ['123456']
                })
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    console.log(response.body);
                    response.body.should.have.property('key').to.be.a('string').to.have.lengthOf(16);
                    createdAPIKey = response.body.key;
                    response.body.should.have.property('hostname').to.be.a('string').to.eql('*');
                    response.body.should.have.property('quota').to.be.a('number').eql(10000);
                    // TODO check default features
                    response.body.should.have.property('features').to.be.an('array');
                    done();
                });
        });
        it('Check if new api key was created successfully', (done) => {
            chai.request(server)
                .get(`/authorization/${createdAPIKey}`)
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    response.body.should.not.have.property('id');
                    response.body.should.have.property('key').eql(createdAPIKey);
                    response.body.should.have.property('quota').eql(10000);
                    response.body.should.have.property('usage').eql(0);
                    response.body.should.have.property('hostname').eql('*');
                    done();
                });
        });
        // POST /:key
        it('Use key with non-existing key should fail', (done) => {
            chai.request(server)
                .post(`/authorization/nonexisting`)
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(404);
                    response.body.should.have.property('error').eql(errors.UNKNOWN_KEY);
                    done();
                });
        });
        it('Use key with valid key but invalid hostname should fail', (done) => {
            chai.request(server)
                .post(`/authorization/Test3`)
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(403);
                    response.body.should.have.property('error').eql(errors.FORBIDDEN);
                    done();
                });
        });
        it('Use key with valid key and with valid hostname but no referer should fail', (done) => {
            chai.request(server)
                .post(`/authorization/${createdAPIKey}`)
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(403);
                    response.body.should.have.property('error').eql(errors.FORBIDDEN);
                    done();
                });
        });
        it('Use key with valid key and with valid hostname but invalid referer should fail', (done) => {
            chai.request(server)
                .post(`/authorization/${createdAPIKey}`)
                .set({
                    referer: {
                        akey: 'test'
                    }
                })
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(403);
                    response.body.should.have.property('error').eql(errors.FORBIDDEN);
                    done();
                });
        });
        it('Use key with valid key and with valid hostname with valid referer but invalid scope should fail', (done) => {
            chai.request(server)
                .post(`/authorization/${createdAPIKey}`)
                .set({
                    referer: {
                        akey: '654321',
                        method: 'GET',
                        path: '/'
                    }
                })
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(403);
                    response.body.should.have.property('error').eql(errors.FORBIDDEN);
                    done();
                });
        });
        it('Use key with valid key and with valid hostname with valid referer but forbidden action should fail', (done) => {
            chai.request(server)
                .post(`/authorization/${createdAPIKey}`)
                .set({
                    referer: {
                        akey: '123456',
                        method: 'GET',
                        path: '/'
                    }
                })
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(403);
                    response.body.should.have.property('error').eql(errors.FORBIDDEN);
                    done();
                });
        });
        it('Use key with valid key and with valid hostname with valid referer and allowed action should succeed', (done) => {
            chai.request(server)
                .post(`/authorization/Test5`)
                .send({
                    referer: {
                        akey: '123456',
                        method: 'GET',
                        path: '/authorization'
                    }
                })
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    response.body.should.have.property('quota').eql(1);
                    response.body.should.have.property('usage').eql(1);
                    done();
                });
        });
        it('Check if quota increased afterwards', (done) => {
            chai.request(server)
                .get(`/authorization/Test5`)
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    response.body.should.have.property('key').eql('Test5');
                    response.body.should.have.property('quota').eql(1);
                    response.body.should.have.property('usage').eql(1);
                    done();
                });
        });
        it('Use key again should bring quota exceeded', (done) => {
            chai.request(server)
                .post(`/authorization/Test5`)
                .send({
                    referer: {
                        akey: '123456',
                        method: 'GET',
                        path: '/authorization'
                    }
                })
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(429);
                    response.body.should.have.property('error').eql(errors.QUOTA_EXCEEDED);
                    done();
                });
        });
    });
});