const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');



router.post('/whatsapp/:channelId', webhookController.whatsapp);

router.post('/test', (req, res) => {
  console.log('Webhook получен:', JSON.stringify(req.body, null, 2));
  res.status(200).json({ message: 'ok', body: req.body });
});


module.exports = router;