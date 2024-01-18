const { expect } = require('chai');
const request = require('supertest');
const app = require('../../index');

describe('Delete Task Unit Test', () => {
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

    it('should delete a specific task and return a success message', async () => {
        const response = await request(app)
            .delete(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `${authToken}`);

        console.log("Deleted Task");
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message').to.equal('Task deleted successfully!');
    });

});
