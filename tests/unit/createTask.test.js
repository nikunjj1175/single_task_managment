const { expect } = require('chai');
const request = require('supertest');
const app = require('../../index');

describe('Create Task Unit Test', () => {
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
    });

    it('should create a new task and return a success message', async () => {
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

        expect(createTaskResponse.status).to.equal(201);
        expect(createTaskResponse.body).to.have.property('message').to.equal('Task created successfully!');
        expect(createTaskResponse.body).to.have.property('task');
        createdTaskId = createTaskResponse.body.task._id;
    });
});
