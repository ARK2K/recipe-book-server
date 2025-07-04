const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({ message: 'Backend is awake and healthy!' });
});

module.exports = router;