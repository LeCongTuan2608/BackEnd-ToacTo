const express = require('express');
const morgan = require('morgan');
const connectDB = require('./database/db');
const db = require('./models/index');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { sequelize } = require('./models');
const dotenv = require('dotenv');
const { Op } = require('sequelize');
//
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();
// parse json
const bodyParser = require('body-parser');
// router
const authRouter = require('./routes/authRouter');
const refreshTokenRouter = require('./routes/refreshTokenRouter');
const userRouter = require('./routes/userRouter');
const postRouter = require('./routes/postsRouter');
const conversationRouter = require('./routes/conversationRouter');
const messageRouter = require('./routes/messageRouter');
const notificationRouter = require('./routes/notificationRouter');
const adminRouter = require('./routes/adminRouter');

//
const app = express();
const httpServer = createServer(app);
// ============================================================================
const saltRounds = parseInt(process.env.SALT_ROUNDS);
const hashingPassword = (password) => {
   return bcrypt.hashSync(password, saltRounds);
};

// ============================================================================

const PORT = process.env.PORT || 5000;
app.use(cors());
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
      const roles = await db.roles.findAll();
      // default roles and user
      if (roles.length === 0) {
         const newRoles = [{ role_name: 'ADMIN' }, { role_name: 'USER' }];
         await db.roles.bulkCreate(newRoles);

         await db.users.findOrCreate({
            where: { user_name: process.env.USER_NAME },
            defaults: {
               user_name: process.env.USER_NAME,
               email: process.env.EMAIL,
               full_name: process.env.FULL_NAME,
               gender: 'male',
               pwd: hashingPassword(process.env.USER_PASSWORD),
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
app.use('/conversation', conversationRouter);
app.use('/message', messageRouter);
app.use('/notification', notificationRouter);
app.use('/admin', adminRouter);

connectDB(); // connect to db

httpServer.listen(PORT, (e) => {
   console.log('Server is running on port: ', PORT);
   console.log('Go to / to see the result');
});
const io = new Server(httpServer, {
   cors: {
      origin:
         process.env.MODE === 'dev' ? [`http://localhost:3000`] : ['https://toacto.vercel.app'],
      allowEIO3: true,
      transports: ['websocket', 'polling'],
   },
});

process.on('uncaughtException', (err, origin) => {
   //code to log the errors
   console.log(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
});

// handle add and remove user online
let onlineUser = [];

const addNewUser = (userName, socketId) => {
   !onlineUser.some((user) => user.userName === userName) &&
      onlineUser.push({ userName, socketId });
};
const removeUser = (socketId) => {
   onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

// handle connect socket
io.on('connection', (socket) => {
   console.log('Client connected');
   // console.log(`A user connected ${socket.id}`);
   // Lắng nghe sự kiện mới tin nhắn từ client
   socket.on('setup', async (user) => {
      console.log(`A user connected ${user}`);
   });
   // send message
   socket.on('sendConversation', async (conver) => {
      io.emit('getConversation', conver);
   });
   socket.on('sendMessage', async (message) => {
      io.emit('getMessage', message);
   });
   socket.on('sendIdRemoveMes', async (mesId) => {
      io.emit('getIdRemoveMes', mesId);
   });
   // send notification
   socket.on('sendNotification', async (notification) => {
      io.emit('getNotification', notification);
   });
   // Lắng nghe sự kiện disconnect từ client
   socket.on('disconnect', () => {
      console.log(`A user disconnected ${socket.id}`);
   });
});
