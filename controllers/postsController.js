const db = require('../models/index');
const errorController = require('./errorController');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');
dotenv.config();

const removeFile = async (files) => {
   try {
      if (files.images && files.images.length !== 0) {
         const result = await cloudinary.api.delete_resources(
            files.images.map((file) => file.filename),
            { resource_type: 'image' },
         );
         // console.log(result);
      }
      if (files.videos && files.videos.length !== 0) {
         const result = await cloudinary.api.delete_resources(
            files.videos.map((file) => file.filename),
            { resource_type: 'video' },
         );
         // console.log(result);
      }
   } catch (error) {
      console.log('error:', error);
   }
};

// get all post
module.exports.getAllPostsHandler = async (req, res, next) => {
   try {
      const feedPosts = await db.posts.findAll({
         attributes: {
            exclude: ['user_posts'],
            include: [
               [
                  Sequelize.literal(
                     '(SELECT COUNT(*) FROM likeds WHERE likeds.posts_id = posts.posts_id)',
                  ),
                  'like_count',
               ],
               [
                  Sequelize.literal(
                     '(SELECT COUNT(*) FROM comments WHERE comments.posts_id = posts.posts_id)',
                  ),
                  'comment_count',
               ],
               [
                  Sequelize.literal(`
                    EXISTS (
                      SELECT 1
                      FROM likeds
                      WHERE likeds.posts_id = posts.posts_id
                        AND likeds.user_liked_posts = '${req.user.user_name}'
                    )`),
                  'status_liked',
               ],
            ],
         },
         include: [
            {
               model: db.users,
               attributes: ['user_name', 'full_name', 'relationship', 'avatar', 'about'],
               as: 'user',
            },
            { model: db.posts_image, as: 'images' },
            { model: db.posts_video, as: 'videos' },
            {
               model: db.blocked_posts,
               as: 'block_posts',
            },
         ],
         where: {
            [Op.and]: [
               { audience: { [Op.not]: 'private' } },
               { ban: { [Op.not]: true } },
               {
                  [Op.or]: [
                     {
                        '$block_posts.user_blocked_posts$': { [Op.eq]: null },
                     },
                     {
                        '$block_posts.user_blocked_posts$': { [Op.not]: req.user.user_name },
                     },
                  ],
               },
            ],
         },
         subQuery: false,
         limit: parseInt(req.query.limit) || 15,
         offset: parseInt(req.query.offset) || 0,
         order: [['createdAt', 'DESC']],
      });

      next(
         res.status(200).json({
            feedPosts,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
// new posts
module.exports.newPostsHandler = async (req, res, next) => {
   try {
      let formData = {
         ...req.body,
         ...req.files,
      };
      console.log('formData:', formData);
      // check user
      if (req.body.userPost !== req.user.user_name) {
         req.files && removeFile(req.files);
         return next(
            errorController.errorHandler(res, 'You are not allowed to create this post', 403),
         );
      }
      const newPosts = await db.posts.create({
         audience: formData?.audience || 'public',
         content: formData?.content,
         user_posts: req.user.user_name,
      });
      if (req.files.images || req.files.videos) {
         if (formData.images && formData.images.length !== 0) {
            const listImages = formData.images.map((image) => {
               return { url: image.path, filename: image.filename, posts_id: newPosts.posts_id };
            });
            await db.posts_image.bulkCreate(listImages);
         }
         if (formData.videos && formData.videos.length !== 0) {
            const listVideo = formData.videos.map((video) => {
               return { url: video.path, filename: video.filename, posts_id: newPosts.posts_id };
            });
            await db.posts_video.bulkCreate(listVideo);
         }
      }

      next(
         res.status(201).json({
            formData,
            mes: 'create new posts is success!',
         }),
      );
   } catch (error) {
      removeFile(req.files);
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get posts by id
module.exports.getPostsByIdHandler = async (req, res, next) => {
   try {
      const result = await db.posts.findOne({
         where: { posts_id: req.params.id },
         include: [
            { model: db.posts_image, as: 'images' },
            { model: db.posts_video, as: 'videos' },
            { model: db.comments, as: 'comments' },
            { model: db.liked, as: 'likes' },
         ],
      });
      if (result.audience === 'private' && req.user.user_name !== result.user_posts)
         return next(
            errorController.errorHandler(
               res,
               'You do not have permission to view this posts!',
               403,
            ),
         );
      if (result === null)
         return next(errorController.errorHandler(res, 'This post could not be found', 404));
      next(
         res.status(200).json({
            result,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// update posts by id
module.exports.updatePostsByIdHandler = async (req, res, next) => {
   try {
      const formData = { ...req.body, ...req.files };
      const { old_images, old_videos } = formData;
      const oldImagesParse = old_images && JSON.parse(old_images);
      const oldVideosParse = old_videos && JSON.parse(old_videos);

      // find post before update
      const result = await db.posts.findOne({ where: { posts_id: req.params.id } });
      if (result.user_posts !== req.user.user_name) {
         req.files && removeFile(req.files);
         return next(
            errorController.errorHandler(res, 'You are not allowed to create this post', 403),
         );
      }

      let removeObj = {};
      let imageFilter = []; // lọc và lấy ra tất cả ảnh bị gỡ
      if (oldImagesParse && oldImagesParse.length !== 0) {
         const images = await db.posts_image.findAll({ where: { posts_id: req.params.id } });
         if (images.length !== 0) {
            imageFilter = images.filter((image) => {
               return !oldImagesParse.map((img) => img.id).includes(image.id);
            });
            removeObj = { ...removeObj, images: imageFilter };
         }
      }

      //
      let videoFilter = []; // lọc và lấy ra tất cả video bị gỡ
      if (oldVideosParse && oldVideosParse.length !== 0) {
         const videos = await db.posts_image.findAll({ where: { posts_id: req.params.id } });
         if (videos.length !== 0) {
            videoFilter = videos.filter((video) => {
               return !oldVideosParse.map((vd) => vd.id).includes(video.id);
            });
            removeObj = { ...removeObj, videos: videoFilter };
         }
      }
      await removeFile(removeObj); // remove file trên cloud

      if (imageFilter.length !== 0)
         await db.posts_image.destroy({
            where: { id: imageFilter.map((item) => item.id) },
            focus: true,
         });
      if (videoFilter.length !== 0)
         await db.posts_video.destroy({
            where: { id: imageFilter.map((item) => item.id) },
            focus: true,
         });

      // //check post exists?
      if (result === null)
         return next(errorController.errorHandler(res, 'This post could not be found', 404));

      result.audience = formData?.audience || 'public';
      result.content = formData?.content;
      await result.save();
      //save images and videos to the database
      if (req.files) {
         if (formData.images && formData.images.length !== 0) {
            const listImages = formData.images.map((image) => {
               return { url: image.path, filename: image.filename, posts_id: req.params.id };
            });
            await db.posts_image.bulkCreate(listImages);
         }
         if (formData.videos && formData.videos.length !== 0) {
            const listVideo = formData.videos.map((video) => {
               return { url: video.path, filename: video.filename, posts_id: req.params.id };
            });
            await db.posts_video.bulkCreate(listVideo);
         }
      }

      next(
         res.status(200).json({
            formData,
            mes: 'Update is success!',
         }),
      );
   } catch (error) {
      removeFile(req.files);
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// delete posts by id
module.exports.deletePostsByIdHandler = async (req, res, next) => {
   try {
      const images = await db.posts_image.findAll({ where: { posts_id: req.params.id } });
      const videos = await db.posts_video.findAll({ where: { posts_id: req.params.id } });

      await removeFile({
         images: images.map((vid) => vid.dataValues),
         videos: videos.map((vid) => vid.dataValues),
      }); // remove file trên cloud
      const deletePosts = await db.posts.destroy({
         where: { posts_id: req.params.id },
         focus: true,
      });
      if (deletePosts === 0)
         return next(errorController.errorHandler(res, 'This post could not be found', 404));
      next(res.status(200).json({ mes: 'delete posts is success' }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get all posts blocked
module.exports.getAllPostsBlockedHandler = async (req, res, next) => {
   try {
      if (!req.body.user_name)
         return next(errorController.errorHandler(res, 'Username field not found!', 404));
      if (req.body.user_name !== req.user.user_name)
         return next(errorController.errorHandler(res, 'You can not see these posts!', 403));
      const results = await db.blocked_posts.findAll({
         where: {
            user_blocked_posts: req.body.user_name,
         },
         include: [
            {
               model: db.posts,
               as: 'posts',
               attributes: { exclude: ['user_posts'] },
               include: [
                  {
                     model: db.users,
                     as: 'user',
                     attributes: ['user_name', 'full_name', 'avatar', 'about'],
                  },
               ],
            },
         ],
      });
      if (results === null)
         return next(errorController.errorHandler(res, 'This post could not be found', 404));
      // const blocked_posts = result.map((item) => {
      //    return item.posts;
      // });
      next(
         res.status(200).json({
            results,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// get posts blocked by id
module.exports.getPostsBlockedByIdHandler = async (req, res, next) => {
   try {
      const result = await db.blocked_posts.findOne({
         where: {
            [Op.and]: [{ user_blocked_posts: req.user.user_name }, { posts_id: req.params.id }],
         },
         attributes: { exclude: ['user_blocked_posts'] },
         include: [
            {
               model: db.posts,
               as: 'posts',
               attributes: { exclude: ['user_posts'] },
               include: [
                  {
                     model: db.users,
                     as: 'user',
                     attributes: ['user_name', 'full_name', 'avatar', 'about'],
                  },
               ],
            },
         ],
      });
      if (result === null)
         return next(errorController.errorHandler(res, 'This post could not be found!', 404));
      next(res.status(200).json({ result }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// block posts
module.exports.blockPostsHandler = async (req, res, next) => {
   try {
      const [posts_id, user_blocked_posts] = [req.params.id, req.user.user_name];
      const [blockPosts, created] = await db.blocked_posts.findOrCreate({
         where: { posts_id, user_blocked_posts },
         defaults: {
            posts_id,
            user_blocked_posts,
         },
      });
      if (!created)
         return next(errorController.errorHandler(res, 'This post has been blocked!', 404));
      next(
         res.status(201).json({
            mes: 'blocked posts is success!',
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

// delete posts blocked by id
module.exports.deletePostsBlockedHandler = async (req, res, next) => {
   try {
      const remove = await db.blocked_posts.destroy({ where: { id: req.params.id }, focus: true });
      if (!remove)
         return next(
            errorController.errorHandler(
               res,
               'This post could not be found in blocked posts!',
               404,
            ),
         );
      return next(
         res.status(200).json({
            mes: 'remove is success!',
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.likedPostsHandler = async (req, res, next) => {
   try {
      const posts_id = req.params.posts_id;
      const [result, created] = await db.liked.findOrCreate({
         where: { [Op.and]: [{ posts_id }, { user_liked_posts: req.user.user_name }] },
         defaults: {
            posts_id,
            user_liked_posts: req.user.user_name,
         },
      });
      const resultPosts = await db.posts.findOne({
         where: { posts_id },
      });
      if (!created) {
         await db.notification.destroy({
            where: Sequelize.literal(`JSON_EXTRACT(related, '$.posts_id') = '${posts_id}'`),
            focus: true,
         });
         await db.liked.destroy({
            where: { id: result.id },
            focus: true,
         });
         return next(
            res.status(200).json({
               mes: 'unliked is success!',
               created: false,
            }),
         );
      }
      const personLiked = req.user.user_name;
      const owner_posts = resultPosts.user_posts;
      if (personLiked !== owner_posts) {
         await db.notification.create({
            sender: personLiked,
            receiver: owner_posts,
            title: 'New Liked',
            content: `liked your post.`,
            type: 'LIKE',
            related: {
               posts_id: posts_id,
               owner_posts: owner_posts,
               person_liked: personLiked,
            },
         });
      }
      return next(
         res.status(201).json({
            mes: 'liked is success!',
            created: true,
            resultPosts,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.getCommentPostsHandler = async (req, res, next) => {
   try {
      const results = await db.comments.findAll({
         where: { posts_id: req.params.posts_id },
         include: [
            {
               model: db.users,
               as: 'user_info',
               attributes: ['user_name', 'full_name', 'avatar', 'about'],
            },
         ],
         limit: parseInt(req.query.limit) || 15,
         offset: parseInt(req.query.offset) || 0,
         order: [['createdAt', 'DESC']],
      });
      return next(
         res.status(200).json({
            results,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
module.exports.deleteCommentPostsHandler = async (req, res, next) => {
   try {
      await db.comments.destroy({
         where: { id: req.params.posts_id },
         focus: true,
      });
      return next(
         res.status(200).json({
            mes: 'Delete is success!',
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.commentPostsHandler = async (req, res, next) => {
   try {
      const { posts_id, content, img, commentator, name_commentator, owner_posts } = req.body;
      const result = await db.comments.create({
         content,
         img,
         posts_id,
         user_comment: req.user.user_name,
      });
      const user = await db.users.findOne({
         where: { user_name: result.user_comment },
         attributes: ['user_name', 'full_name', 'avatar', 'about'],
      });
      if (commentator !== owner_posts) {
         await db.notification.create({
            sender: commentator,
            receiver: owner_posts,
            title: 'New Comment',
            content: `commented on your post.`,
            type: 'COMMENT',
            related: {
               posts_id: posts_id,
               owner_posts: owner_posts,
               commentator: commentator,
            },
         });
      }
      return next(
         res.status(201).json({
            mes: 'create is success!',
            result: { ...result.dataValues, user_info: { ...user.dataValues } },
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.getPostUserHandler = async (req, res, next) => {
   try {
      if (!req.params.user_name)
         return next(
            errorController.errorHandler(res, `params user_name cannot be left blank!`, 404),
         );
      let condition;
      if (req.params.user_name === req.user.user_name) {
         condition = {
            [Op.and]: [
               { user_posts: req.params.user_name },
               {
                  [Op.or]: [
                     {
                        '$block_posts.user_blocked_posts$': { [Op.eq]: null },
                     },
                     {
                        '$block_posts.user_blocked_posts$': { [Op.not]: req.user.user_name },
                     },
                  ],
               },
            ],
         };
      } else {
         condition = {
            [Op.and]: [
               { audience: { [Op.not]: 'private' } },
               { user_posts: req.params.user_name },
               {
                  [Op.or]: [
                     {
                        '$block_posts.user_blocked_posts$': { [Op.eq]: null },
                     },
                     {
                        '$block_posts.user_blocked_posts$': { [Op.not]: req.user.user_name },
                     },
                  ],
               },
            ],
         };
      }
      const results = await db.posts.findAll({
         attributes: {
            exclude: ['user_posts'],
            include: [
               [
                  Sequelize.literal(
                     '(SELECT COUNT(*) FROM likeds WHERE likeds.posts_id = posts.posts_id)',
                  ),
                  'like_count',
               ],
               [
                  Sequelize.literal(
                     '(SELECT COUNT(*) FROM comments WHERE comments.posts_id = posts.posts_id)',
                  ),
                  'comment_count',
               ],
               [
                  Sequelize.literal(`
                    EXISTS (
                      SELECT 1
                      FROM likeds
                      WHERE likeds.posts_id = posts.posts_id
                        AND likeds.user_liked_posts = '${req.user.user_name}'
                    )`),
                  'status_liked',
               ],
            ],
         },
         include: [
            {
               model: db.users,
               attributes: ['user_name', 'full_name', 'relationship', 'avatar', 'about'],
               as: 'user',
            },
            { model: db.posts_image, as: 'images' },
            { model: db.posts_video, as: 'videos' },
            {
               model: db.blocked_posts,
               as: 'block_posts',
            },
         ],
         where: condition,
         subQuery: false,
         limit: parseInt(req.query.limit) || 15,
         offset: parseInt(req.query.offset) || 0,
         order: [['createdAt', 'DESC']],
      });
      return next(
         res.status(200).json({
            results,
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};

module.exports.getAllVideoHandler = async (req, res, next) => {
   try {
      const results = await db.posts_video.findAll({
         include: [
            {
               model: db.posts,
               as: 'posts',
            },
         ],
         subQuery: false,
         limit: parseInt(req.query.limit) || 15,
         offset: parseInt(req.query.offset) || 0,
         // order: [['createdAt', 'DESC']],
      });
      next(res.status(200).json({ results }));
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
