module.exports = (io) => {
  var express = require('express');
  var router = express.Router();
  var Room = require('../models/room');

  router.get('/', async (req, res) => {
    res.render('roomshome', { rooms: await Room.find() });
  });

  router.get('/:id', (req, res) => {
    res.render('room', { layout: 'room' });
  });

  return router;
};