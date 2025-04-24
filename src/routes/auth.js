const express = require('express');
const router = express.Router();
const pool = require('../database/todolist.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const { access } = require('fs');


const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = +process.env.BCRYPT_ROUND;
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TTL_MS = (process.env.REFRESG_EXPIRES_DAYS || 7) * 24 * 60 * 60 * 1000;


router.post('/register', 
    [
        body('username')
        .trim()
        .isLength({min: 3})
        .withMessage('Username nust be at least 3 characters'),
        body('email')
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage('Invalid email'),
        body('password')
        .isLength({min: 4})
        .withMessage('Password must be at least 4 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req).formatWith(({msg, param}) => ({
            field: param,
            message: msg
        }));
        if(!errors.isEmpty()){
            res.status(422).json({errors: errors.array()});
        }

        const {username, email, password} = req.body;
        try {
            const hashed = await bcrypt.hash(password, SALT_ROUNDS);

            const {rows} = await pool.query(
                `INSERT INTO users (username, email, password)
                VALUES ($1, $2, $3)
                RETURNING id, username, email`,
                [username, email, hashed]
            )

            res.status(201).json(rows[0]);
        }
        catch (error){

            if (error.code === '23505') {
                return res
                .status(409)
                .json({message: 'username or email already exist'});
                
            }

            console.error(error.message);
            res.status(500).send({message: 'Server error'});
        }
    }
)


router.post('/login',
    [
        body('email')
        .isEmail()
        .withMessage('Enter a valid email'),
        body('password')
        .notEmpty()
        .withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;

        try {
            const userResult = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email],
            );

            if (userResult.rowCount === 0) {
                return res.status(401).json({error: 'Invalid email or password'});
            }

            const user = userResult.rows[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({error: 'Invalid email or password'});
            }

            res.json({message: 'Login successful', userId: user.id});
        }
        catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;