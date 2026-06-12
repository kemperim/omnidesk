const express = require('express');
const router = express.Router();
const userController = require("../controllers/user");
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

router.get('/', authMiddleware,roleMiddleware('admin','manager'), userController.getAll);
router.get('/:id', authMiddleware,roleMiddleware('admin','manager'), userController.getOne);
router.patch('/:id', authMiddleware,roleMiddleware('admin','manager'), userController.update);
router.delete('/:id', authMiddleware,roleMiddleware('admin','manager'), userController.delete);
module.exports = router;