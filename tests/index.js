const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../index');
const should = chai.should();
const errors = require('../errors.json');

const keyModel = require('../models/Key');

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
        await keyModel.create({
            key: 'Test1',
            hostname: '127.0.0.1',
            quota: 1
        });
        await keyModel.create({
            key: 'Test2',
            hostname: '*',
            quota: 1
        });
        await keyModel.create({
            key: 'Test3',
            hostname: 'example.com',
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
        it('Requesting without key should fail', (done) => {
            chai.request(server)
                .get('/authorization')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(400);
                    response.body.should.have.property('error').eql(errors.MISSING_KEY);
                    done();
                });
        });
        it('Requesting with non-existing key should fail', (done) => {
            chai.request(server)
                .get('/authorization')
                .set('Authorization', 'Bearer 1234')
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
                .get('/authorization')
                .set('Authorization', 'Bearer Test1')
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
                .get('/authorization')
                .set('Authorization', 'Bearer Test2')
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
        it('Requesting with different hostname key should not return info', (done) => {
            chai.request(server)
                .get('/authorization')
                .set('Authorization', 'Bearer Test3')
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
        it('Requesting non-existing route should fail', (done) => {
            chai.request(server)
                .post('/')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(404);
                    response.body.should.have.property('error').eql(errors.UNKNOWN_ROUTE);
                    done();
                });
        });
        it('Requesting without key should fail', (done) => {
            chai.request(server)
                .post('/authorization')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(400);
                    response.body.should.have.property('error').eql(errors.MISSING_KEY);
                    done();
                });
        });
        it('Requesting with non-existing key should fail', (done) => {
            chai.request(server)
                .post('/authorization')
                .set('Authorization', 'Bearer 1234')
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
                .post('/authorization')
                .set('Authorization', 'Bearer Test1')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    response.body.should.not.have.property('id');
                    response.body.should.have.property('quota').eql(1);
                    response.body.should.have.property('usage').eql(1);
                    done();
                });
        });
        it('Requesting with valid wildcard key should return info', (done) => {
            chai.request(server)
                .post('/authorization')
                .set('Authorization', 'Bearer Test2')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    response.body.should.not.have.property('id');
                    response.body.should.have.property('quota').eql(1);
                    response.body.should.have.property('usage').eql(1);
                    done();
                });
        });
        it('Requesting with different hostname key should not return info', (done) => {
            chai.request(server)
                .get('/authorization')
                .set('Authorization', 'Bearer Test3')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(403);
                    response.body.should.have.property('error').eql(errors.FORBIDDEN);
                    done();
                });
        });
        it('Re-checking local key should include decreased usage', (done) => {
            chai.request(server)
                .get('/authorization')
                .set('Authorization', 'Bearer Test1')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    response.body.should.not.have.property('id');
                    response.body.should.have.property('key').eql('Test1');
                    response.body.should.have.property('quota').eql(1);
                    response.body.should.have.property('usage').eql(1);
                    response.body.should.have.property('hostname').eql('127.0.0.1');
                    done();
                });
        });
        it('Re-checking wildcard key should include decreased usage', (done) => {
            chai.request(server)
                .get('/authorization')
                .set('Authorization', 'Bearer Test2')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(200);
                    response.body.should.not.have.property('id');
                    response.body.should.have.property('key').eql('Test2');
                    response.body.should.have.property('quota').eql(1);
                    response.body.should.have.property('usage').eql(1);
                    response.body.should.have.property('hostname').eql('*');
                    done();
                });
        });
        it('Re-checking different hostname key should include decreased usage', (done) => {
            chai.request(server)
                .get('/authorization')
                .set('Authorization', 'Bearer Test3')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(403);
                    response.body.should.have.property('error').eql(errors.FORBIDDEN);
                    done();
                });
        });
        it('Requesting with valid local key but exceeded quota should not return info', (done) => {
            chai.request(server)
                .post('/authorization')
                .set('Authorization', 'Bearer Test1')
                .end((err, response) => {
                    should.not.exist(err);
                    should.exist(response);
                    response.should.have.status(429);
                    response.body.should.have.property('error').eql(errors.QUOTA_EXCEEDED);
                    done();
                });
        });
        it('Requesting with valid wildcard key but exceeded quota should not return info', (done) => {
            chai.request(server)
                .post('/authorization')
                .set('Authorization', 'Bearer Test2')
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