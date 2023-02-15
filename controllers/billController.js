const conn = require('../services/db');
const AppError = require('../utils/appError');

//get all bill
//get all bill with status: processing
//get all bill with status: delivering
//get all bill with status: delivered
//cancel order when status processing
