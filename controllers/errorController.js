module.exports.serverErrorHandle = (err, res) => {
   console.log(err);
   res.status(500).json(err);
};

module.exports.errorHandler = (res, message, statusCode) => {
   res.status(statusCode).json({ mes: message });
};
