const db = require('../config/database');

exports.createTask = (req, res) => {
  const { title, description, status } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const query = `
    INSERT INTO tasks (user_id, title, description, status) 
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [userId, title, description || '', status || 'To Do'], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create task' });
    }

    res.status(201).json({
      id: this.lastID,
      title,
      description,
      status: status || 'To Do'
    });
  });
};

exports.getTasks = (req, res) => {
  const userId = req.user.id;
  const query = 'SELECT * FROM tasks WHERE user_id = ?';

  db.all(query, [userId], (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }

    res.json(tasks);
  });
};

exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const userId = req.user.id;

  const query = `
    UPDATE tasks 
    SET title = ?, description = ?, status = ? 
    WHERE id = ? AND user_id = ?
  `;

  db.run(query, [title, description, status, id, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update task' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ 
      id, 
      title, 
      description, 
      status 
    });
  });
};

exports.deleteTask = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';

  db.run(query, [id, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete task' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  });
};