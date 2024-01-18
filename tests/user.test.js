const { expect } = require('chai');
const request = require('supertest');
const app = require('../index');

describe('User Routes', () => {
    let authToken;

    it('should create a new user and return a success message on signup', async () => {
        const signupResponse = await request(app)
            .post('/api/users/signup')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'testpassword'
            });

        expect(signupResponse.status).to.equal(201);
        expect(signupResponse.body).to.have.property('message').to.equal('User created successfully!');
    });

    it('should log in a user and return a token on login', async () => {
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: 'test@example.com',
                password: 'testpassword'
            });

        expect(loginResponse.status).to.equal(200);
        expect(loginResponse.body).to.have.property('token');
        authToken = loginResponse.body.token;
    });

    it('should return the user profile for a valid token on profile', async () => {
        const profileResponse = await request(app)``
            .get('/api/users/profile')
            .set('Authorization', `${authToken}`);

        expect(profileResponse.status).to.equal(200);
        expect(profileResponse.body).to.have.property('username');
    });
});
