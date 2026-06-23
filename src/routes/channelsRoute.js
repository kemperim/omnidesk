const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('admin', 'manager'), channelController.getAll);
router.post('/', authMiddleware, roleMiddleware('admin'), channelController.create);
router.patch('/:id', authMiddleware, roleMiddleware('admin'), channelController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), channelController.delete);
module.exports = router;
