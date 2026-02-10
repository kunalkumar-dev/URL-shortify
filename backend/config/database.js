const { Sequelize } = require('sequelize');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL;

if (!databaseUrl) {
  throw new Error(
    'PostgreSQL connection string not set. Define DATABASE_URL (or POSTGRES_URL/POSTGRESQL_URL).'
  );
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');
    await sequelize.sync();
  } catch (error) {
    console.error('DB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
