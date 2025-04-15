const pool = require('../database/todolist.js');
const Express = require('express');
const router = Express.Router();

// основные запросы todo
router.get('/todo_watch', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM todos');
      res.json(result.rows);
    }
    catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  });
  
router.post('/todo_insert', async (req, res) => {
    try {
      const {title} = req.body;
      const result = await pool.query(
        'INSERT INTO todos (title) VALUES ($1) RETURNING *',
        [title]
      );
      res.status(201).json(result.rows[0]);
    }
    catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  });

router.post('/change_completed', async (req, res) => {
    try {
        const {todo_id, completed} = req.body;
        
        if (typeof todo_id != 'number' || typeof completed !== 'boolean') {
            return res.status(400).send('Invalid input');
        }

        await pool.query(
            `UPDATE "todos" SET "completed" = $1 WHERE "todo_id" = $2`,
            [completed, todo_id]
        );

        res.send('Status updated')
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

router.delete('/todo_delete', async (req, res) => {
    try {
        const {todo_id} = req.body;

        if (typeof todo_id !== 'number') {
            return res.status(400).send('Invalid input');
        }

        const result = await pool.query(
            'DELETE FROM "todos" WHERE "todo_id" = $1',
            [todo_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Todo not found');
        }

        res.send('Todo deleted');
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error')
    }
});

module.exports = router;