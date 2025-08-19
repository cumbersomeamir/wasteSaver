const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Connect to the in-memory database
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Disconnect and stop mongod
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

// Global test utilities
global.createTestUser = async (User, userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.730610] // NYC coordinates
    }
  };

  const user = new User({ ...defaultUser, ...userData });
  return await user.save();
};

global.createTestBusiness = async (Business, businessData = {}) => {
  const defaultBusiness = {
    name: 'Test Bakery',
    category: 'bakery',
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.730610]
    },
    address: {
      street: '123 Test St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    }
  };

  const business = new Business({ ...defaultBusiness, ...businessData });
  return await business.save();
};

global.createTestRescueBag = async (RescueBag, businessId, bagData = {}) => {
  const defaultBag = {
    businessId,
    title: 'Test Rescue Bag',
    description: 'A test rescue bag',
    category: 'bakery',
    price: 5.99,
    originalValue: 15.99,
    pickupWindow: {
      start: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      end: new Date(Date.now() + 4 * 60 * 60 * 1000)   // 4 hours from now
    },
    quantity: {
      available: 10,
      reserved: 0
    },
    status: 'active'
  };

  const bag = new RescueBag({ ...defaultBag, ...bagData });
  return await bag.save();
};
