const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organizations');
const authMiddleware = require('../middleware/auth');

router.post('/', orgController.create);
module.exports =router;