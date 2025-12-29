import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// ============= AUTH ROUTES =============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phone,
      },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Username or email already exists' });
    }
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password || (!username && !email)) {
      return res.status(400).json({ success: false, error: 'Missing credentials' });
    }

    const user = await prisma.user.findFirst({
      where: username ? { username } : { email },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// ============= CATEGORIES ROUTES =============

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, error: 'Failed to get categories' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
    });

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ success: false, error: 'Failed to get category' });
  }
});

app.get('/api/categories/:id/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { categoryId: req.params.id },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Get category services error:', error);
    res.status(500).json({ success: false, error: 'Failed to get services' });
  }
});

app.get('/api/categories/services/all', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
      include: { category: true },
    });

    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ success: false, error: 'Failed to get services' });
  }
});

// ============= COUNTRIES ROUTES =============

app.get('/api/countries', async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: countries });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ success: false, error: 'Failed to get countries' });
  }
});

app.get('/api/countries/:name', async (req, res) => {
  try {
    const country = await prisma.country.findUnique({
      where: { name: req.params.name },
      include: {
        quickFacts: true,
        traditions: true,
        cuisine: true,
        places: true,
        trends: true,
      },
    });

    if (!country) {
      return res.status(404).json({ success: false, error: 'Country not found' });
    }

    res.json({ success: true, data: country });
  } catch (error) {
    console.error('Get country error:', error);
    res.status(500).json({ success: false, error: 'Failed to get country' });
  }
});

app.get('/api/countries/id/:id', async (req, res) => {
  try {
    const country = await prisma.country.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        quickFacts: true,
        traditions: true,
        cuisine: true,
        places: true,
        trends: true,
      },
    });

    if (!country) {
      return res.status(404).json({ success: false, error: 'Country not found' });
    }

    res.json({ success: true, data: country });
  } catch (error) {
    console.error('Get country by id error:', error);
    res.status(500).json({ success: false, error: 'Failed to get country' });
  }
});

// ============= UNIVERSITIES ROUTES =============

app.get('/api/universities', async (req, res) => {
  try {
    const { country, city, program, level, search } = req.query;

    const where = {};
    if (country) where.country = { contains: country };
    if (city) where.city = { contains: city };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { specialty: { contains: search } },
      ];
    }
    if (program || level) {
      where.programs = {
        some: {
          ...(program && { name: { contains: program } }),
          ...(level && { level }),
        },
      };
    }

    const universities = await prisma.university.findMany({
      where,
      include: { programs: true },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: universities });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ success: false, error: 'Failed to get universities' });
  }
});

app.get('/api/universities/search', async (req, res) => {
  try {
    const { country, city, program, level, search, limit = '20', offset = '0' } = req.query;

    const where = {};
    if (country) where.country = { contains: country };
    if (city) where.city = { contains: city };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { specialty: { contains: search } },
      ];
    }
    if (program || level) {
      where.programs = {
        some: {
          ...(program && { name: { contains: program } }),
          ...(level && { level }),
        },
      };
    }

    const universities = await prisma.university.findMany({
      where,
      include: { programs: true },
      orderBy: { name: 'asc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    res.json({ success: true, data: universities });
  } catch (error) {
    console.error('Search universities error:', error);
    res.status(500).json({ success: false, error: 'Failed to search universities' });
  }
});

app.get('/api/universities/:id', async (req, res) => {
  try {
    const university = await prisma.university.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { programs: true },
    });

    if (!university) {
      return res.status(404).json({ success: false, error: 'University not found' });
    }

    res.json({ success: true, data: university });
  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({ success: false, error: 'Failed to get university' });
  }
});

app.get('/api/universities/countries', async (req, res) => {
  try {
    const countries = await prisma.university.findMany({
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    });

    res.json({ success: true, data: countries.map(u => u.country) });
  } catch (error) {
    console.error('Get university countries error:', error);
    res.status(500).json({ success: false, error: 'Failed to get countries' });
  }
});

app.get('/api/universities/cities/:country', async (req, res) => {
  try {
    const cities = await prisma.university.findMany({
      where: { country: req.params.country },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });

    res.json({ success: true, data: cities.map(u => u.city) });
  } catch (error) {
    console.error('Get university cities error:', error);
    res.status(500).json({ success: false, error: 'Failed to get cities' });
  }
});

app.get('/api/universities/programs', async (req, res) => {
  try {
    const programs = await prisma.universityProgram.findMany({
      select: { name: true, level: true },
      distinct: ['name', 'level'],
      orderBy: [{ name: 'asc' }, { level: 'asc' }],
    });

    res.json({ success: true, data: programs });
  } catch (error) {
    console.error('Get university programs error:', error);
    res.status(500).json({ success: false, error: 'Failed to get programs' });
  }
});

// ============= NEWS ROUTES =============

app.get('/api/news', async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });
    res.json({ success: true, data: news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ success: false, error: 'Failed to get news' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log('Database connected via Prisma');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
