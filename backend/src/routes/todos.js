const router = require('express').Router();
const ctrl = require('../controllers/todos.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getTodos);
router.post('/generate-ai', ctrl.generateAI);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
