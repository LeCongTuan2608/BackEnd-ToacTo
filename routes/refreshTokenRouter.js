const express = require('express');
const { route } = require('express/lib/router');
const errorController = require('../controllers/errorController');
const conn = require('../database/db');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const router = express.Router();
dotenv.config();
// refresh token
refreshToken = (req, res, next) => {
   const refreshToken = req.body.token;
   if (!refreshToken) return errorController.errorHandler(res, 'No refresh token', 404);

   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
      if (err) return res.sendStatus(403);
      delete data.iat;
      delete data.exp;
      const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
      res.status(200).json({
         accessToken,
      });
   });
};

router.route('/refresh').post(refreshToken);
module.exports = router;
