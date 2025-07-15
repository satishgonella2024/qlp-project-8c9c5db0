{
  "code": "import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

const app = express();
const SALT_ROUNDS = 12;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = ['https://example.com', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Input validation middleware
const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  next();
};

// Create user
app.post('/users', validateInput, async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 }); // Exclude password
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
app.put('/users/:id', validateInput, async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password: hashedPassword },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
",

  "tests": "import request from 'supertest';
import app from './app';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

describe('User API', () => {
  let server;
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    server = app.listen(3000);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password', SALT_ROUNDS);
    testUser = await mongoose.models.User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    });
  });

  afterEach(async () => {
    await mongoose.models.User.deleteMany({});
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User created successfully');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('name', 'Test User');
      expect(response.body[0]).toHaveProperty('email', 'test@example.com');
      expect(response.body[0]).not.toHaveProperty('password');
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      const response = await request(app).get(`/users/${testUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existing user', async () => {
      const response = await request(app).get('/users/63f9c6f9c6f9c6f9c6f9c6f9');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const response = await request(app)
        .put(`/users/${testUser._id}`)
        .send({
          name: 'Updated User',
          email: 'updated@example.com',
          password: 'newpassword',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User updated successfully');
      expect(response.body.user).toHaveProperty('name', 'Updated User');
      expect(response.body.user).toHaveProperty('email', 'updated@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .put(`/users/${testUser._id}`)
        .send({
          name: 'Updated User',
          email: 'updated@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should return 404 for non-existing user', async () => {
      const response = await request(app)
        .put('/users/63f9c6f9c6f9c6f9c6f9c6f9')
        .send({
          name: 'Updated User',
          email: 'updated@example.com',
          password: 'newpassword',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .put(`/users/${testUser._id}`)
        .send({
          name: 'Updated User',
          email: 'test@example.com', // Duplicate email
          password: 'newpassword',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const response = await request(app).delete(`/users/${testUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });

    it('should return 404 for non-existing user', async () => {
      const response = await request(app).delete('/users/63f9c6f9c6f9c6f9c6f9c6f9');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });
});
",

  "documentation": "This is a basic CRUD API for managing users built with Express.js and MongoDB. It includes endpoints for creating, reading, updating, and deleting users. The API follows best security practices such as password hashing with bcrypt, input validation, rate limiting, secure headers, and CORS configuration. The code also includes comprehensive error handling and validation.",

  "dependencies": [
    "express",
    "bcrypt",
    "express-rate-limit",
    "helmet",
    "cors",
    "mongoose",
    "dotenv"
  ]
}