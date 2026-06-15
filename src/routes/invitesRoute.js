const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/inviteController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/',authMiddleware,roleMiddleware('admin','manager'),inviteController.create)
router.post('/accept', inviteController.accept);
module.exports = router;