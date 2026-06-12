const express = require('express');
const router = express.Router();
const ticketontroller = require('../controllers/ticket');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

router.post('/', ticketontroller.create);
router.get('/', authMiddleware, roleMiddleware('admin','manager','operator'), ticketontroller.getAll);
router.get('/:id', authMiddleware, roleMiddleware('admin','manager','operator'), ticketontroller.getOne);
router.patch('/:id', authMiddleware, roleMiddleware('admin','manager','operator'), ticketontroller.update);
module.exports = router;