const express = require('express');
const { route } = require('express/lib/router');
const conversationController = require('../controllers/conversationController');
const authenToken = require('../controllers/middlewareController');

const router = express.Router();

router
   .route('/checked/:conversationId')
   .get([authenToken], conversationController.checkedConversation);
router
   .route('/by-user-name/:userName')
   .get([authenToken], conversationController.getConversationByUserName);
router.route('/:conversationId').delete([authenToken], conversationController.removeConversation);
router.route('/').post([authenToken], conversationController.createConversation);
router.route('/').get([authenToken], conversationController.getConversation);
// router.route('/').post([authenToken], conversationController.loginHandler);

module.exports = router;
