const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/invite');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

router.post('/',authMiddleware,roleMiddleware('admin','manager'),inviteController.create)
router.post('/accept', inviteController.accept);
module.exports = router;