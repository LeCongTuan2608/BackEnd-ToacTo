const express = require('express');
const morgan = require('morgan');
const connectDB = require('./database/db');
const db = require('./models/index');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
// parse json
const bodyParser = require('body-parser');
const multer = require('multer');
const forms = multer();
// router
const authRouter = require('./routes/authRouter');
const refreshTokenRouter = require('./routes/refreshTokenRouter');
const userRouter = require('./routes/userRouter');
const postRouter = require('./routes/postsRouter');
const { sequelize } = require('./models');

const hashingPassword = (password) => {
   return bcrypt.hashSync(password, saltRounds);
};
const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan('combined'));

// dùng để parse json req body
app.use(bodyParser.json({ limit: '100mb' }));
app.use(
   bodyParser.urlencoded({
      limit: '100mb',
      extended: true,
   }),
);
// app.use(forms.array());

// tao db
sequelize
   .sync()
   .then(async (result) => {
      const roles = await db.Roles.findAll();
      // default roles and user
      if (roles.length === 0) {
         const newRoles = [{ role_name: 'ADMIN' }, { role_name: 'USER' }];
         await db.Roles.bulkCreate(newRoles);

         await db.Users.findOrCreate({
            where: { user_name: '@congtuan' },
            defaults: {
               user_name: '@congtuan',
               email: 'tuancnttk61@gmail.com',
               full_name: 'Le Cong Tuan',
               gender: 'male',
               pwd: hashingPassword('dinhmenh123'),
               role_id: 1,
            },
         });
      }
      console.log('create db is success');
   })
   .catch((err) => {
      console.log(err);
   });

// get: xác định route, use: là apply middleware
app.get('/', (req, res) => {
   return res.send('hello word!!');
});
app.use('/auth', authRouter); // (login, register, ..)
app.use('/users', userRouter);
app.use('/token', refreshTokenRouter);
app.use('/feed-posts', postRouter);

connectDB(); // connect to db

app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT}`));
