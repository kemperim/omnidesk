const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organizations');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, orgController.create);
router.get('/getAll', authMiddleware,orgController.getAll);


router.get('/:id', authMiddleware, orgController.getOne);
router.put('/:id', authMiddleware, orgController.update);
router.delete('/:id',authMiddleware, orgController.delete);
module.exports = router;