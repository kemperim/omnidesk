const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', ticketController.create);
router.get('/', authMiddleware, roleMiddleware('admin','manager','operator'), ticketController.getAll);
router.get('/:id', authMiddleware, roleMiddleware('admin','manager','operator'), ticketController.getOne);
router.patch('/:id', authMiddleware, roleMiddleware('admin','manager','operator'), ticketController.update);
module.exports = router;