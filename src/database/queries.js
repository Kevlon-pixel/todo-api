const pool = require('./database.js');
const Express = require('express');
const router = Express.Router();

// база данных
router.get('/todos', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM todos');
      res.json(result.rows);
    }
    catch (error) {
      console.error(error.message);
      res.status(500).send('Server error!');
    }
  });
  
router.post('/todos', async (req, res) => {
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
      res.status(500).send('Server error!');
    }
  });

module.exports = router;