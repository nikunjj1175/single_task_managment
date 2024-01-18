const { expect } = require('chai');
const request = require('supertest');
const app = require('../../index');

describe('Subtask Unit Test', () => {
    let authToken;
    let parentTaskId;
    let subtaskId;

    before(async () => {
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: 'test@example.com',
                password: 'testpassword'
            });

        authToken = loginResponse.body.token;

        // Create a parent task for testing subtasks
        const createParentTaskResponse = await request(app)
            .post('/api/tasks')
            .set('Authorization', `${authToken}`)
            .send({
                title: 'Parent Task',
                description: 'This is a parent task',
                dueDate: '2024-01-11T12:00:00.000Z',
                priority: 'High',
                category: 'Work'
            });

            console.log("parent :----",createParentTaskResponse.body);
        parentTaskId = createParentTaskResponse.body.task._id;
    });

    it('should create a subtask under a parent task and return a success message', async () => {
        const createSubtaskResponse = await request(app)
            .post(`/api/tasks/${parentTaskId}/subtasks`)
            .set('Authorization', `${authToken}`)
            .send({
                title: 'Subtask',
                description: 'This is a subtask',
            });

        expect(createSubtaskResponse.status).to.equal(201);
        expect(createSubtaskResponse.body).to.have.property('message').to.equal('Subtask created successfully!');
        expect(createSubtaskResponse.body).to.have.property('subtask');
    });

    it('should retrieve all subtasks for a parent task', async () => {
        const response = await request(app)
            .get(`/api/tasks/${parentTaskId}/subtasks`)
            .set('Authorization', `${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        subtaskId = response.body.map(subtask => subtask._id)
    });

    it('should update a specific subtask and return a success message', async () => {
        const response = await request(app)
            .put(`/api/tasks/${parentTaskId}/subtasks/${subtaskId}`)
            .set('Authorization', `${authToken}`)
            .send({
                title: 'Updated Subtask',
                status: 'Completed'
            });
 
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message').to.equal('Subtask updated successfully!');
        expect(response.body).to.have.property('subtask');
    });

    it('should retrieve all subtasks for a parent task', async () => {
        const response = await request(app)
            .get(`/api/tasks/${parentTaskId}/subtasks`)
            .set('Authorization', `${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        subtaskId = response.body.map(subtask => subtask._id)
    });

    it('should delete a specific subtask and return a success message', async () => {
        const response = await request(app)
            .delete(`/api/tasks/${parentTaskId}/subtasks/${subtaskId}`)
            .set('Authorization', `${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message').to.equal('Subtask deleted successfully!');
    });
});
