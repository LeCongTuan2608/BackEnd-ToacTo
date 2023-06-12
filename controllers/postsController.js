const db = require('../models/index');
const errorController = require('./errorController');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');
dotenv.config();

const removeFile = async (files) => {
   try {
      if (files.images) {
         const result = await cloudinary.api.delete_resources(
            files.images.map((file) => file.filename),
            { resource_type: 'image' },
         );
         console.log(result);
      }
      if (files.videos) {
         const result = await cloudinary.api.delete_resources(
            files.videos.map((file) => file.filename),
            { resource_type: 'video' },
         );
         console.log(result);
      }
   } catch (error) {
      console.log('error:', error);
   }
};

// get all post
module.exports.getAllPostsHandler = async (req, res, next) => {
   try {
      const feedPosts = await db.Posts.findAll({
         attributes: { exclude: ['user_posts'] },
         include: [
            {
               model: db.Users,
               attributes: ['user_name', 'full_name', 'relationship', 'avatar', 'about'],
               as: 'user',
            },
            { model: db.Posts_image, as: 'images' },
            { model: db.Posts_video, as: 'videos' },
            { model: db.Comments, as: 'comments' },
            { model: db.Liked, as: 'likes' },
            {
               model: db.Blocked_posts,
               as: 'block_posts',
            },
         ],
         where: {
            [Op.and]: [
               { audience: { [Op.not]: 'private' } },
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
         // offset: 2,
         // limit: 2,
         // order: Sequelize.literal('rand()'),
      });
      // const results = feedPosts.filter((posts) => {
      //    if (!posts.block_posts) return false;
      //    return !posts.block_posts.some((item) => item.user_blocked_posts === req.user.user_name);
      // });
      next(
         res.status(200).json({
            user: req.user.user_name,
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
      const newPosts = await db.Posts.create({
         audience: formData?.audience || 'public',
         content: formData?.content,
         user_posts: req.user.user_name,
      });
      if (req.files.images || req.files.videos) {
         if (formData.images && formData.images.length !== 0) {
            const listImages = formData.images.map((image) => {
               return { url: image.path, filename: image.filename, posts_id: newPosts.posts_id };
            });
            await db.Posts_image.bulkCreate(listImages);
         }
         if (formData.videos && formData.videos.length !== 0) {
            const listVideo = formData.videos.map((video) => {
               return { url: video.path, filename: video.filename, posts_id: newPosts.posts_id };
            });
            await db.Posts_video.bulkCreate(listVideo);
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
      const result = await db.Posts.findOne({
         where: { posts_id: req.params.id },
         include: [
            { model: db.Posts_image, as: 'images' },
            { model: db.Posts_video, as: 'videos' },
            { model: db.Comments, as: 'comments' },
            { model: db.Liked, as: 'likes' },
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
      if (req.body.userUpdate !== req.user.user_name) {
         req.files && removeFile(req.files);
         return next(
            errorController.errorHandler(res, 'You are not allowed to create this post', 403),
         );
      }
      // find post before update
      const result = await db.Posts.findOne({ where: { posts_id: req.params.id } });
      //check post exists?
      if (result === null)
         return next(errorController.errorHandler(res, 'This post could not be found', 404));

      await db.Posts.update(
         {
            audience: formData?.audience || 'public',
            content: formData?.content,
            user_posts: req.user.user_name,
         },
         {
            where: {
               posts_id: req.params.id,
            },
         },
      );
      // delete image in cloud
      const imageResult = await db.Posts_image.findAll({
         where: {
            posts_id: req.params.id,
         },
      });
      const videoResult = await db.Posts_video.findAll({
         where: {
            posts_id: req.params.id,
         },
      });
      await removeFile({ images: imageResult, videos: videoResult });

      //delete all images and videos
      await db.Posts_image.destroy({
         where: {
            posts_id: req.params.id,
         },
         force: true,
      });
      await db.Posts_video.destroy({
         where: {
            posts_id: req.params.id,
         },
         force: true,
      });

      //save images and videos to the database
      if (req.files) {
         if (formData.images && formData.images.length !== 0) {
            const listImages = formData.images.map((image) => {
               return { url: image.path, filename: image.filename, posts_id: req.params.id };
            });
            await db.Posts_image.bulkCreate(listImages);
         }
         if (formData.videos && formData.videos.length !== 0) {
            const listVideo = formData.videos.map((video) => {
               return { url: video.path, filename: video.filename, posts_id: req.params.id };
            });
            await db.Posts_video.bulkCreate(listVideo);
         }
      }

      next(
         res.status(201).json({
            formData,
            imageResult,
            videoResult,
            video: formData.videos,
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
      const deletePosts = await db.Posts.destroy({
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
      const results = await db.Blocked_posts.findAll({
         where: {
            user_blocked_posts: req.body.user_name,
         },
         include: [
            {
               model: db.Posts,
               as: 'posts',
               attributes: { exclude: ['user_posts'] },
               include: [
                  {
                     model: db.Users,
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
      const result = await db.Blocked_posts.findOne({
         where: {
            [Op.and]: [{ user_blocked_posts: req.user.user_name }, { posts_id: req.params.id }],
         },
         attributes: { exclude: ['user_blocked_posts'] },
         include: [
            {
               model: db.Posts,
               as: 'posts',
               attributes: { exclude: ['user_posts'] },
               include: [
                  {
                     model: db.Users,
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
      const [blockPosts, created] = await db.Blocked_posts.findOrCreate({
         where: { posts_id, user_blocked_posts },
         default: {
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
      const remove = await db.Blocked_posts.destroy({ where: { id: req.params.id }, focus: true });
      if (!remove)
         return next(
            errorController.errorHandler(
               res,
               'This post could not be found in blocked posts!',
               404,
            ),
         );
      next(
         res.status(200).json({
            mes: 'remove is success!',
         }),
      );
   } catch (error) {
      console.log('error', error);
      errorController.serverErrorHandle(error, res);
   }
};
