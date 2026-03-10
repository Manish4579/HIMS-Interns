import con from "../db.js";

/* ===============================
  PASSWORD GENERATOR
================================ */
function generatePassword(length = 8) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/* ===============================
  GET ALL EMPLOYEES
================================ */
export const getEmployees = async (req, res) => {
  try {
    const result = await con.query(`
      SELECT 
        employee_id,
        employee_name,
        gender,
        TO_CHAR(dob, 'YYYY-MM-DD') AS dob,
        email,
        contact_number,
        department,
        designation,
        qualification,
        experience_years,
        status,
        TO_CHAR(date_of_joining, 'YYYY-MM-DD') AS date_of_joining,
        created_at
      FROM employee
      ORDER BY employee_id DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get Employees Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* ===============================
  REGISTER EMPLOYEE
================================ */
export const registerEmployee = async (req, res) => {
  try {
    const {
      employee_name,
      gender,
      dob,
      email,
      contact_number,
      department,
      designation,
      qualification,
      experience_years,
      status,
    } = req.body;

    if (
      !employee_name?.trim() ||
      !gender?.trim() ||
      !dob ||
      !email?.trim() ||
      !contact_number?.trim() ||
      !department?.trim() ||
      !designation?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    /* Generate Random Password */
    const password = generatePassword();

    const query = `
      INSERT INTO employee
      (employee_name, gender, dob, email, contact_number,
      department, designation, qualification,
      experience_years, status, password)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING 
        employee_id,
        employee_name,
        gender,
        TO_CHAR(dob, 'YYYY-MM-DD') AS dob,
        email,
        contact_number,
        department,
        designation,
        qualification,
        experience_years,
        status;
    `;

    const result = await con.query(query, [
      employee_name.trim(),
      gender.trim(),
      dob,
      email.trim(),
      contact_number.trim(),
      department.trim(),
      designation.trim(),
      qualification ?? null,
      experience_years ?? null,
      status ?? "Active",
      password,
    ]);

    return res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      data: result.rows[0],
      generated_password: password,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* ===============================
  UPDATE EMPLOYEE
================================ */
export const updateEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;

    if (isNaN(employee_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const {
      employee_name,
      gender,
      dob,
      email,
      contact_number,
      department,
      designation,
      qualification,
      experience_years,
      status,
    } = req.body;

    const query = `
      UPDATE employee
      SET
        employee_name = COALESCE($1, employee_name),
        gender = COALESCE($2, gender),
        dob = COALESCE($3, dob),
        email = COALESCE($4, email),
        contact_number = COALESCE($5, contact_number),
        department = COALESCE($6, department),
        designation = COALESCE($7, designation),
        qualification = COALESCE($8, qualification),
        experience_years = COALESCE($9, experience_years),
        status = COALESCE($10, status)
      WHERE employee_id = $11
      RETURNING 
        employee_id,
        employee_name,
        gender,
        TO_CHAR(dob, 'YYYY-MM-DD') AS dob,
        email,
        contact_number,
        department,
        designation,
        qualification,
        experience_years,
        status;
    `;

    const result = await con.query(query, [
      employee_name ?? null,
      gender ?? null,
      dob ?? null,
      email ?? null,
      contact_number ?? null,
      department ?? null,
      designation ?? null,
      qualification ?? null,
      experience_years ?? null,
      status ?? null,
      employee_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* ===============================
  DELETE EMPLOYEE
================================ */
export const deleteEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;

    if (isNaN(employee_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const result = await con.query(
      "DELETE FROM employee WHERE employee_id = $1 RETURNING *",
      [employee_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};