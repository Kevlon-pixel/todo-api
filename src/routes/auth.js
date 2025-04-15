const express = require('express');
const router = express.Router();
const pool = require('../database/todolist.js');
const bcrypt = require('bcrypt');
const {body, validationResult} = require('express-validator');


router.post(
    '/register',
    [
        body('username')
        .length({min:3})
        .withMessage('Username must be at least 3 characters'),
        body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email'),
        body('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 3 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {username, email, password} = req.body;

        try {
            const existingUser = await pool.query(
                'SELECT * FROM users WHERE username = $1 OR email = $2',
                [username, email]
            );

            if (existingUser.rowCount > 0) {
                return res
                .status(400)
                .json({error: 'User with that username or email already exists'});
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await pool.query(
                `INSERT INTO users (username, email, password)
                VALUES ($1, $2, $3) RETURNING id, username, email`,
                [username, email, hashedPassword]
            );

            res.status(201).json({
                user: newUser.rows[0],
                message: 'Regisration successful',
            });
        }
        catch (error) {
            console.error(error.message);
            res.status('500').send('Server error');
        }
    }
)

module.exports = router;