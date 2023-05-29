const express = require('express');
const { route } = require('express/lib/router');
const messageController = require('../controllers/messageController');
const authenToken = require('../controllers/middlewareController');

const router = express.Router();

router.route('/:conversationId').get([authenToken], messageController.getMessages);
router.route('/').post([authenToken], messageController.createMessages);

// router.route('/').post([authenToken], messageController.loginHandler);

module.exports = router;
