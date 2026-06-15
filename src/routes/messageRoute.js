const express = require('express');
const router = express.Router({mergeParams:true});
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('admin', 'manager','operator'),messageController.getAll);
router.post('/', authMiddleware, roleMiddleware('admin', 'manager','operator'),messageController.create);
module.exports = router;