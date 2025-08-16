import { expect } from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express from 'express';
import { register, login } from '../controllers/authController.js';
import User from '../models/User.js';

const app = express();
app.use(express.json());
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

const request = supertest(app);

describe('Authentication Module', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('User Model (Unit Tests)', () => {
    it('should hash password on creation', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'client',
        phone: '+261321234567',
      };

      const userMock = {
        ...userData,
        id: 1,
        password: await bcrypt.hash('password123', 10),
        matchPassword: async (pwd) => bcrypt.compare(pwd, userMock.password),
        destroy: sinon.spy(),
      };
      sandbox.stub(User, 'create').resolves(userMock);

      const user = await User.create(userData);
      expect(user).to.have.property('id', 1);
      expect(user.password).to.not.equal('password123');
      expect(await bcrypt.compare('password123', user.password)).to.be.true;
    });

    it('should fail if phone is not Malagasy format', async () => {
      const userData = {
        email: 'invalid@example.com',
        password: 'password123',
        role: 'client',
        phone: '+123456789',
      };

      sandbox.stub(User, 'create').rejects(new Error('Format de téléphone malgache invalide (ex: +261321234567)'));

      try {
        await User.create(userData);
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err.message).to.include('Format de téléphone malgache invalide');
      }
    });

    it('should match password correctly', async () => {
      const userMock = {
        password: await bcrypt.hash('password123', 10),
        matchPassword: async (pwd) => bcrypt.compare(pwd, userMock.password),
      };
      sandbox.stub(User, 'create').resolves(userMock);

      expect(await userMock.matchPassword('password123')).to.be.true;
      expect(await userMock.matchPassword('wrong')).to.be.false;
    });
  });

  describe('Auth Controller (Unit Tests)', () => {
    describe('register', () => {
      it('should register a new user and return token', async () => {
        const req = { body: { email: 'newuser@example.com', password: 'password123', role: 'client', phone: '+261321234567' } };
        const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
        const next = sinon.spy();

        sandbox.stub(User, 'findOne').resolves(null);
        sandbox.stub(User, 'create').resolves({
          id: 1,
          email: 'newuser@example.com',
          role: 'client',
          phone: '+261321234567',
        });
        sandbox.stub(jwt, 'sign').returns('mocked-token');

        await register(req, res, next);

        expect(res.status.calledWith(400)).to.be.false;
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.args[0][0]).to.have.property('token', 'mocked-token');
        expect(res.json.args[0][0].user).to.have.property('email', 'newuser@example.com');
      });

      it('should fail if email already exists', async () => {
        const req = { body: { email: 'existing@example.com', password: 'password123', role: 'client', phone: '+261321234567' } };
        const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
        const next = sinon.spy();

        sandbox.stub(User, 'findOne').resolves({ id: 1 });

        await register(req, res, next);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.args[0][0].msg).to.equal('Utilisateur existe déjà');
      });
    });

    describe('login', () => {
      it('should login and return token', async () => {
        const req = { body: { email: 'loginuser@example.com', password: 'password123' } };
        const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
        const next = sinon.spy();

        const userMock = {
          id: 1,
          email: 'loginuser@example.com',
          role: 'client',
          phone: '+261321234567',
          matchPassword: sinon.stub().resolves(true),
        };
        sandbox.stub(User, 'findOne').resolves(userMock);
        sandbox.stub(jwt, 'sign').returns('mocked-token');

        await login(req, res, next);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.args[0][0]).to.have.property('token', 'mocked-token');
      });

      it('should fail with invalid credentials', async () => {
        const req = { body: { email: 'loginuser@example.com', password: 'wrong' } };
        const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
        const next = sinon.spy();

        const userMock = {
          matchPassword: sinon.stub().resolves(false),
        };
        sandbox.stub(User, 'findOne').resolves(userMock);

        await login(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.args[0][0].msg).to.equal('Identifiants invalides');
      });
    });
  });

  describe('API Integration Tests', () => {
    beforeEach(() => {
      // Mock database operations for integration tests
      sandbox.stub(User, 'findOne').resolves(null);
      sandbox.stub(User, 'create').resolves({
        id: 1,
        email: 'integration@example.com',
        role: 'client',
        phone: '+261321234567'
      });
    });

    it('should register a new user', async () => {
      const response = await request
        .post('/api/auth/register')
        .send({ email: 'integration@example.com', password: 'password123', role: 'client', phone: '+261321234567' });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
    });

    it('should fail with invalid phone format', async () => {
      const response = await request
        .post('/api/auth/register')
        .send({ email: 'invalid@example.com', password: 'password123', role: 'client', phone: '+123456789' });

      expect(response.status).to.equal(400);
      expect(response.body.msg).to.include('Format de téléphone malgache invalide');
    });
  });
});