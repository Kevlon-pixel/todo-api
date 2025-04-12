const express = require('express')
const router = express.Router()


router.get('/phrase', (req, res) => {
    res.status(200).json({message : "Sosal"});
});

module.exports = router;