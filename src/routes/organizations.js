const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organizations');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, orgController.create);
router.post('/:id', authMiddleware, orgController.getOne);
router.get('/getAll', authMiddleware,orgController.getAll);
module.exports =router;