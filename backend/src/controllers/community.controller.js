const Post = require('../models/Post');
const Notification = require('../models/Notification');

exports.createPost = async (req, res) => {
  try {
    const { content, category, tags } = req.body;
    const post = await Post.create({
      author: req.user._id,
      content,
      category: category || 'general',
      tags: tags ? JSON.parse(tags) : [],
      images: req.files?.map(f => f.path) || []
    });
    await post.populate('author', 'fullName avatar');
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    const query = { isApproved: true };
    if (category && category !== 'all') query.category = category;
    if (search) query.$text = { $search: search };
    
    const posts = await Post.find(query)
      .populate('author', 'fullName avatar')
      .populate('comments.author', 'fullName avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Post.countDocuments(query);
    res.json({ success: true, posts, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const posts = await Post.find({ isApproved: true, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
      .populate('author', 'fullName avatar')
      .sort({ views: -1, 'likes': -1 }).limit(5);
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes.pull(req.user._id);
    else {
      post.likes.push(req.user._id);
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({ user: post.author, type: 'community', title: 'Post Liked', message: `${req.user.fullName} liked your post` });
      }
    }
    await post.save();
    res.json({ success: true, liked: !liked, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    post.comments.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('comments.author', 'fullName avatar');
    
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({ user: post.author, type: 'community', title: 'New Comment', message: `${req.user.fullName} commented on your post` });
    }
    
    res.json({ success: true, comment: post.comments[post.comments.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    
    comment.replies.push({ author: req.user._id, content: req.body.content });
    await post.save();
    res.json({ success: true, reply: comment.replies[comment.replies.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.viewPost = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    const post = await Post.findById(req.params.id)
      .populate('author', 'fullName avatar bio')
      .populate('comments.author', 'fullName avatar');
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
