import { Pool } from "pg";
import "dotenv/config";

const con = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

/* DATABASE CONNECT */
con
  .connect()
  .then(async () => {
    console.log("Database connected");
    console.log("Tables Created");
    await createTables();
  })
  .catch((err) => console.log("DB Error:", err));

/* =============================
   CREATE TABLES IF NOT EXIST
============================= */

async function createTables() {
  try {
    /* complaint_master */
    await con.query(`
      CREATE TABLE IF NOT EXISTS complaint_master (
        complaint_id SERIAL PRIMARY KEY,

        ticket_number VARCHAR(50) UNIQUE NOT NULL,

        raised_by_type VARCHAR(30) NOT NULL,
        raised_by_name VARCHAR(100) NOT NULL,

        category VARCHAR(50),
        sub_category VARCHAR(100),

        department VARCHAR(50) NOT NULL,

        priority VARCHAR(10) NOT NULL 
        CHECK (priority IN ('LOW','MEDIUM','HIGH')),

        status VARCHAR(15) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED')),

        complaint_description TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);


    /* complaint_assignment */
    await con.query(`
      CREATE TABLE IF NOT EXISTS complaint_assignment (
        assignment_id SERIAL PRIMARY KEY,
        complaint_id INT NOT NULL,
        assigned_department VARCHAR(100) NOT NULL,
        assigned_employee_id INT NOT NULL,
        assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_assignment_complaint
        FOREIGN KEY (complaint_id)
        REFERENCES complaint_master(complaint_id)
        ON DELETE CASCADE
      );
    `);


    /* complaint_status_history */
    await con.query(`
      CREATE TABLE IF NOT EXISTS complaint_status_history (
        history_id SERIAL PRIMARY KEY,
        complaint_id INT NOT NULL,
        old_status VARCHAR(50) NOT NULL,
        new_status VARCHAR(50) NOT NULL,
        changed_by INT NOT NULL,
        remarks TEXT,
        changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_status_complaint
        FOREIGN KEY (complaint_id)
        REFERENCES complaint_master(complaint_id)
        ON DELETE CASCADE
      );
    `);

    /* complaint_attachment */
    await con.query(`
      CREATE TABLE IF NOT EXISTS complaint_attachment (
        attachment_id SERIAL PRIMARY KEY,

        complaint_id INT NOT NULL
        REFERENCES complaint_master(complaint_id)
        ON DELETE CASCADE,

        file_type VARCHAR(20) NOT NULL,
        file_name TEXT NOT NULL,
        description TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);


    await con.query(`
CREATE TABLE IF NOT EXISTS patient_feedback (
  feedback_id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL,
  patient_name VARCHAR(150) NOT NULL,
  admission_id INT,
  service_type VARCHAR(50) NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  feedback_comments TEXT,
  feedback_mode VARCHAR(50) NOT NULL,
  consent_flag BOOLEAN DEFAULT false,
  created_date TIMESTAMP DEFAULT NOW()
);`);

    await con.query(`
  CREATE TABLE IF NOT EXISTS feedback_module_ratings (
  module_rating_id SERIAL PRIMARY KEY,
  feedback_id INT NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_date TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_feedback
    FOREIGN KEY (feedback_id)
    REFERENCES patient_feedback(feedback_id)
    ON DELETE CASCADE
);`);
  } catch (error) {
    console.error("Table Creation Error:", error);
  }
}

export default con;
