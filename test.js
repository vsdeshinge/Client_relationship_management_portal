import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server'; // Import your app

const { expect } = chai;
chai.use(chaiHttp);

describe('Authentication Tests', () => {
    it('should log in with valid credentials', (done) => {
        chai.request(app) // Use the imported app
            .post('/login')
            .send({ email: 'test@example.com', password: 'password123' })
            .end((err, res) => {
                if (err) return done(err);

                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token');
                done();
            });
    });
});
