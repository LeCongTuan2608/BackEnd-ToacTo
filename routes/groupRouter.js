const express = require('express');
const router = express.Router();
const { route } = require('express/lib/router');
const marketController = require('../controllers/post');

router.route('/').get(); // get all group
router.route('/new_group').post();
router.route('/get_group/:id').get().put().delete();

module.exports = router;
