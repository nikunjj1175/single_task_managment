const { expect } = require('chai');
const request = require('supertest');
const app = require('../../index');

describe('Retrieve Tasks Unit Test', () => {
    let authToken;

    before(async () => {
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: 'test@example.com',
                password: 'testpassword'
            });

        authToken = loginResponse.body.token;
    });

    it('should retrieve all tasks for a user', async () => {
        const response = await request(app)
            .get('/api/tasks')
            .set('Authorization', `${authToken}`);

        console.log("Retrive task :",response.body);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
    });
});
