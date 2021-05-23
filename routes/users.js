var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Room = require('../models/room');

router.get('/', async (req, res) => {
  res.render('users', { users: await User.find() });
});

router.get('/:id', async (req, res) => {
  let profileUser;
  if (req.params.id == req.user._id) {
    profileUser = req.user;
    rooms = await Room.find().where('_id').in(req.user.rooms).exec();
  } else {
    profileUser = await User.findById(req.params.id).exec();
    rooms = [];
  }

  res.render('profile', { profileUser, rooms });
});

module.exports = router;