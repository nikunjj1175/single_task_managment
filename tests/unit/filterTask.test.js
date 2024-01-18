const { expect } = require('chai');
const request = require('supertest');
const app = require('../../index');

describe('Filter Tasks Unit Test', () => {
    let authToken;
    let createdTaskId;

    before(async () => {
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: 'test@example.com',
                password: 'testpassword'
            });

        authToken = loginResponse.body.token;

        // Create a task for testing filter
        const createTaskResponse = await request(app)
            .post('/api/tasks')
            .set('Authorization', `${authToken}`)
            .send({
                title: 'Test Task',
                description: 'This is a test task',
                dueDate: '2024-01-11T12:00:00.000Z',
                priority: 'High',
                category: 'Work'
            });

        createdTaskId = createTaskResponse.body.task._id;
    });

    it('should retrieve tasks with filtering functionality', async () => {
        const response = await request(app)
            .get('/api/tasks/filter')
            .set('Authorization', `${authToken}`)
            .query({
                title: 'Test Task',
                status: 'Pending',
                priority: 'High'
            });

        console.log("Filter task :",response.body);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
    });

});
