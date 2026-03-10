import con from "../db.js";
import jwt from "jsonwebtoken";

export const employeeLogin = async (req, res) => {

  try {

    const { employee_name, password } = req.body;

    if (!employee_name || !password) {
      return res.status(400).json({
        success: false,
        message: "Name and password required"
      });
    }

    const result = await con.query(
      `SELECT employee_id, employee_name, password
       FROM employee
       WHERE employee_name = $1`,
      [employee_name]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const employee = result.rows[0];

    if (password !== employee.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        employee_id: employee.employee_id,
        employee_name: employee.employee_name
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      employee: {
    employee_id: employee.employee_id,
    employee_name: employee.employee_name
  }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};