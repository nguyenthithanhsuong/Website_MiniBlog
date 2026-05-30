const { Pool } = require("pg");
require("dotenv").config();

const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

// Tự động bật SSL nếu dùng DATABASE_URL (như Neon.tech) hoặc DB_SSL=true
if (process.env.DATABASE_URL || process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

// Xử lý lỗi kết nối nhàn rỗi (idle client error) để tránh crash ứng dụng khi database đóng kết nối đột ngột (như Neon scale-to-zero)
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle PostgreSQL client:", err.message || err);
});

module.exports = pool;

