const { expect } = require('chai');
const request = require('supertest');
const app = require('../../index');

describe('Update Task Unit Test', () => {
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

        // Create a task for testing update
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

    it('should update a specific task and return a success message', async () => {
        const response = await request(app)
            .put(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `${authToken}`)
            .send({
                title: 'Updated Task',
                status: 'Completed'
            });

        console.log("Updated task :",response.body);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message').to.equal('Task updated successfully!');
        expect(response.body).to.have.property('task');
    });

});
