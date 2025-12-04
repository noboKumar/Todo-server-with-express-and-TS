dotenv.config();
import express, { Request, Response } from "express";
import { Pool } from "pg";
import dotenv from "dotenv";

const app = express();
const port = 3000;

// middlewares parser
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.CONNECT_STR,
});

const initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);

  await pool.query(`
            CREATE TABLE IF NOT EXISTS todos (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT false,
            due_date DATE,
            created_at TIMESTAMP DEFAULT NOW(),
            UPDATED_AT TIMESTAMP DEFAULT NOW()
            )
            `);
};
initDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/users", async (req: Request, res: Response) => {
  console.log(req.body);
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users(name, email) VALUES($1, $2) RETURNING *`,
      [name, email]
    );

    res.status(201).json({
      success: true,
      message: { message: "Data inserted successfully..." },
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }

  res.status(201).json({
    success: true,
    message: "API is Working...",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
