require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'employee_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(() => console.log('Connected to MySQL database'))
  .catch((err) => console.error('Database connection failed:', err.message));

// --- Employee Endpoints ---

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    res.status(500).json({ error: 'Failed to fetch employees: ' + error.message });
  }
});

// Get single employee
app.get('/api/employees/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error.message);
    res.status(500).json({ error: 'Failed to fetch employee: ' + error.message });
  }
});

// Add new employee
app.post('/api/employees', async (req, res) => {
  console.log("Received POST request for employee:", req.body);
  const { name, email, role, department, position, joinedDate, phone, address, profilePicture, emergencyContact, salary } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const id = Date.now().toString();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      'INSERT INTO employees (id, name, email, role, department, position, joinedDate, phone, address, profilePicture, emergencyContact, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, role || 'employee', department, position, joinedDate, phone, address, profilePicture, emergencyContact, salary]
    );
    await connection.commit();
    console.log("Employee added with ID:", id);
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding employee:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to add employee: ' + error.message });
  } finally {
    connection.release();
  }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const setClause = Object.keys(fields).map(field => `${field} = ?`).join(', ');
  const values = Object.values(fields);
  values.push(id);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(`UPDATE employees SET ${setClause} WHERE id = ?`, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    await connection.commit();
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating employee:', error.message);
    res.status(500).json({ error: 'Failed to update employee: ' + error.message });
  } finally {
    connection.release();
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    await connection.commit();
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting employee:', error.message);
    res.status(500).json({ error: 'Failed to delete employee: ' + error.message });
  } finally {
    connection.release();
  }
});

// --- Task Endpoints ---

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ error: 'Failed to fetch tasks: ' + error.message });
  }
});

// Get single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error.message);
    res.status(500).json({ error: 'Failed to fetch task: ' + error.message });
  }
});

// Get tasks for an employee
app.get('/api/tasks/employee/:employeeId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE assignedTo = ?', [req.params.employeeId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employee tasks:', error.message);
    res.status(500).json({ error: 'Failed to fetch employee tasks: ' + error.message });
  }
});

// Add new task
app.post('/api/tasks', async (req, res) => {
  console.log("Received POST request for task:", req.body);
  const { title, description, assignedTo, assignedBy, dueDate, priority, status, notes, progress } = req.body;
  if (!title || !description || !assignedTo || !assignedBy || !dueDate || !priority || !status) {
    console.log("Missing fields:", { title, description, assignedTo, assignedBy, dueDate, priority, status });
    return res.status(400).json({ error: 'Title, description, assignedTo, assignedBy, dueDate, priority, and status are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [assignedToCheck] = await connection.query('SELECT id FROM employees WHERE id = ?', [assignedTo]);
    if (assignedToCheck.length === 0) {
      return res.status(400).json({ error: 'AssignedTo employee does not exist' });
    }
    const [assignedByCheck] = await connection.query('SELECT id FROM employees WHERE id = ?', [assignedBy]);
    if (assignedByCheck.length === 0) {
      return res.status(400).json({ error: 'AssignedBy employee does not exist' });
    }

    const id = Date.now().toString();
    const createdAt = new Date().toISOString().split('T')[0];
    await connection.query(
      'INSERT INTO tasks (id, title, description, assignedTo, assignedBy, createdAt, dueDate, priority, status, notes, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, assignedTo, assignedBy, createdAt, dueDate, priority, status, notes, progress || 0]
    );
    await connection.commit();
    console.log("Task added with ID:", id);
    res.status(201).json({ id, createdAt, ...req.body });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding task:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Task ID already exists' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'AssignedTo or AssignedBy employee does not exist' });
    }
    res.status(500).json({ error: 'Failed to add task: ' + error.message });
  } finally {
    connection.release();
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (fields.assignedTo) {
      const [assignedToCheck] = await connection.query('SELECT id FROM employees WHERE id = ?', [fields.assignedTo]);
      if (assignedToCheck.length === 0) {
        return res.status(400).json({ error: 'AssignedTo employee does not exist' });
      }
    }
    if (fields.assignedBy) {
      const [assignedByCheck] = await connection.query('SELECT id FROM employees WHERE id = ?', [fields.assignedBy]);
      if (assignedByCheck.length === 0) {
        return res.status(400).json({ error: 'AssignedBy employee does not exist' });
      }
    }

    const setClause = Object.keys(fields).map(field => `${field} = ?`).join(', ');
    const values = Object.values(fields);
    values.push(id);

    const [result] = await connection.query(`UPDATE tasks SET ${setClause} WHERE id = ?`, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await connection.commit();
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating task:', error.message);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'AssignedTo or AssignedBy employee does not exist' });
    }
    res.status(500).json({ error: 'Failed to update task: ' + error.message });
  } finally {
    connection.release();
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await connection.commit();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting task:', error.message);
    res.status(500).json({ error: 'Failed to delete task: ' + error.message });
  } finally {
    connection.release();
  }
});

// --- Leave Request Endpoints ---

// Get all leave requests (admin) or employee-specific
app.get('/api/leave-requests', async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (employeeId) {
      const [rows] = await pool.query('SELECT * FROM leave_requests WHERE employeeId = ?', [employeeId]);
      res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM leave_requests');
      res.json(rows);
    }
  } catch (error) {
    console.error('Error fetching leave requests:', error.message);
    res.status(500).json({ error: 'Failed to fetch leave requests: ' + error.message });
  }
});

// Apply for a new leave
app.post('/api/leave-requests', async (req, res) => {
  console.log("Received POST request for leave request:", req.body);
  const { employeeId, startDate, endDate, type, reason } = req.body;
  if (!employeeId || !startDate || !endDate || !type || !reason) {
    console.log("Missing fields:", { employeeId, startDate, endDate, type, reason });
    return res.status(400).json({ error: 'employeeId, startDate, endDate, type, and reason are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [employeeCheck] = await connection.query('SELECT id FROM employees WHERE id = ?', [employeeId]);
    if (employeeCheck.length === 0) {
      return res.status(400).json({ error: 'Employee does not exist' });
    }

    const id = Date.now().toString();
    const appliedDate = new Date().toISOString().split('T')[0];
    await connection.query(
      'INSERT INTO leave_requests (id, employeeId, startDate, endDate, type, reason, status, appliedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, employeeId, startDate, endDate, type, reason, 'pending', appliedDate]
    );
    await connection.commit();
    console.log("Leave request added with ID:", id);
    res.status(201).json({ id, status: 'pending', appliedDate, ...req.body });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding leave request:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Leave request ID already exists' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Employee does not exist' });
    }
    res.status(500).json({ error: 'Failed to add leave request: ' + error.message });
  } finally {
    connection.release();
  }
});

// Approve a leave request
app.put('/api/leave-requests/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { adminId, comments, version } = req.body;
  if (!adminId) {
    return res.status(400).json({ error: 'adminId is required' });
  }
  if (version === undefined) {
    return res.status(400).json({ error: 'Version is required for optimistic locking' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [adminCheck] = await connection.query('SELECT id FROM employees WHERE id = ?', [adminId]);
    if (adminCheck.length === 0) {
      return res.status(400).json({ error: 'Admin does not exist' });
    }

    const reviewDate = new Date().toISOString().split('T')[0];
    const [result] = await connection.query(
      'UPDATE leave_requests SET status = ?, reviewedBy = ?, reviewDate = ?, comments = ?, version = version + 1 WHERE id = ? AND version = ?',
      ['approved', adminId, reviewDate, comments || null, id, version]
    );
    if (result.affectedRows === 0) {
      const [current] = await connection.query('SELECT version FROM leave_requests WHERE id = ?', [id]);
      if (current.length === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      return res.status(409).json({ error: 'Conflict: Leave request was modified by another user', currentVersion: current[0].version });
    }
    await connection.commit();
    res.json({ message: 'Leave request approved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error approving leave request:', error.message);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Admin does not exist' });
    }
    res.status(500).json({ error: 'Failed to approve leave request: ' + error.message });
  } finally {
    connection.release();
  }
});

// Reject a leave request
app.put('/api/leave-requests/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { adminId, comments, version } = req.body;
  if (!adminId) {
    return res.status(400).json({ error: 'adminId is required' });
  }
  if (version === undefined) {
    return res.status(400).json({ error: 'Version is required for optimistic locking' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [adminCheck] = await connection.query('SELECT id FROM employees WHERE id = ?', [adminId]);
    if (adminCheck.length === 0) {
      return res.status(400).json({ error: 'Admin does not exist' });
    }

    const reviewDate = new Date().toISOString().split('T')[0];
    const [result] = await connection.query(
      'UPDATE leave_requests SET status = ?, reviewedBy = ?, reviewDate = ?, comments = ?, version = version + 1 WHERE id = ? AND version = ?',
      ['rejected', adminId, reviewDate, comments || null, id, version]
    );
    if (result.affectedRows === 0) {
      const [current] = await connection.query('SELECT version FROM leave_requests WHERE id = ?', [id]);
      if (current.length === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      return res.status(409).json({ error: 'Conflict: Leave request was modified by another user', currentVersion: current[0].version });
    }
    await connection.commit();
    res.json({ message: 'Leave request rejected successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error rejecting leave request:', error.message);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Admin does not exist' });
    }
    res.status(500).json({ error: 'Failed to reject leave request: ' + error.message });
  } finally {
    connection.release();
  }
});

// --- Attendance Endpoints ---

// Get all attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendance');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching attendance records:', error.message);
    res.status(500).json({ error: 'Failed to fetch attendance records: ' + error.message });
  }
});

// Get attendance records for an employee
app.get('/api/attendance/employee/:employeeId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendance WHERE employeeId = ?', [req.params.employeeId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employee attendance:', error.message);
    res.status(500).json({ error: 'Failed to fetch employee attendance: ' + error.message });
  }
});

// Add new attendance record (clock-in)
app.post('/api/attendance', async (req, res) => {
  console.log("Received POST request for attendance:", req.body);
  const { employeeId, date, clockIn, status, notes } = req.body;
  if (!employeeId || !date || !clockIn || !status) {
    console.log("Missing fields:", { employeeId, date, clockIn, status });
    return res.status(400).json({ error: 'employeeId, date, clockIn, and status are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [employeeCheck] = await connection.query('SELECT id FROM employees WHERE id = ?', [employeeId]);
    if (employeeCheck.length === 0) {
      return res.status(400).json({ error: 'Employee does not exist' });
    }

    const [existingRecord] = await connection.query(
      'SELECT id FROM attendance WHERE employeeId = ? AND date = ?',
      [employeeId, date]
    );
    if (existingRecord.length > 0) {
      return res.status(400).json({ error: 'Attendance record already exists for this employee on this date' });
    }

    const id = Date.now().toString();
    await connection.query(
      'INSERT INTO attendance (id, employeeId, date, clockIn, clockOut, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, employeeId, date, clockIn, null, status, notes || null]
    );
    await connection.commit();
    console.log("Attendance record added with ID:", id);
    res.status(201).json({ id, clockOut: null, ...req.body });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding attendance record:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Attendance record ID already exists' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Employee does not exist' });
    }
    res.status(500).json({ error: 'Failed to add attendance record: ' + error.message });
  } finally {
    connection.release();
  }
});

// Update attendance record (clock-out or edit)
app.put('/api/attendance/:id', async (req, res) => {
  const { id } = req.params;
  const { clockOut, status, notes } = req.body;

  const fields = {};
  if (clockOut !== undefined) fields.clockOut = clockOut;
  if (status) fields.status = status;
  if (notes !== undefined) fields.notes = notes;

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const setClause = Object.keys(fields).map(field => `${field} = ?`).join(', ');
  const values = Object.values(fields);
  values.push(id);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(`UPDATE attendance SET ${setClause} WHERE id = ?`, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    await connection.commit();
    res.json({ message: 'Attendance record updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating attendance record:', error.message);
    res.status(500).json({ error: 'Failed to update attendance record: ' + error.message });
  } finally {
    connection.release();
  }
});

// --- Login Log Endpoints ---

// Log authentication event
app.post('/api/login-logs', async (req, res) => {
  console.log("Received POST request for login log:", req.body);
  const { employeeId, action } = req.body;
  if (!employeeId || !action) {
    return res.status(400).json({ error: 'employeeId and action are required' });
  }
  if (!['login', 'logout'].includes(action)) {
    return res.status(400).json({ error: 'Action must be "login" or "logout"' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [employeeCheck] = await connection.query('SELECT id FROM employees WHERE id = ?', [employeeId]);
    if (employeeCheck.length === 0) {
      return res.status(400).json({ error: 'Employee does not exist' });
    }

    const id = `${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await connection.query(
      'INSERT INTO login_logs (id, employeeId, action, timestamp) VALUES (?, ?, ?, ?)',
      [id, employeeId, action, timestamp]
    );
    await connection.commit();
    console.log("Login log added with ID:", id);
    res.status(201).json({ id, employeeId, action, timestamp });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding login log:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Login log ID already exists' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Employee does not exist' });
    }
    res.status(500).json({ error: 'Failed to add login log: ' + error.message });
  } finally {
    connection.release();
  }
});

// Get login logs (for admin review)
app.get('/api/login-logs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM login_logs');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching login logs:', error.message);
    res.status(500).json({ error: 'Failed to fetch login logs: ' + error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});