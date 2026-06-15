const router = require('express').Router();
const ctrl = require('../controllers/community.controller');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.use(protect);
router.post('/', uploadImage.array('images', 3), ctrl.createPost);
router.get('/', ctrl.getPosts);
router.get('/trending', ctrl.getTrending);
router.get('/:id', ctrl.viewPost);
router.post('/:id/like', ctrl.likePost);
router.post('/:id/comment', ctrl.addComment);
router.post('/:postId/comment/:commentId/reply', ctrl.addReply);

module.exports = router;
