const ROOM_LIFETIME = 3600000;

module.exports = (io) => {
  const formidable = require('formidable');
  const Jimp = require('jimp');
  var Room = require('../models/room');
  var User = require('../models/user');
  var Puzzle = require('./puzzle');

  var activeRooms = {};

  class RoomManager {
    static async getRoom(id) {
      if (!(id in activeRooms)) {
        await this.loadRoom(id);
      }
      return activeRooms[id];
    }

    static async loadRoom(id) {
      try {
        let room = await Room.findById(id).exec();
        activeRooms[id] = {
          lastActive: Date.now(),
          room
        };
      } catch (e) {
        console.log('failed to load room', id);
      }
    }

    static async saveRoom(id) {
      if (!activeRooms[id]) {
        return;
      }

      activeRooms[id].room.save();
    }

    static async unloadRoom(id) {
      if (!activeRooms[id]) {
        return;
      }

      await this.saveRoom(id);

      delete activeRooms[id];
    }

    static async getRoomJSON(id) {
      if (!activeRooms[id]) {
        console.log('room not active', id);
        return {};
      }

      return await activeRooms[id].room.toJSON();
    }

    static async initializeRoomState(room) {
      let puzzleState = { pieces: [] };
      for (let piece of room.puzzleState.pieces) {
        puzzleState.pieces.push({
          curX: piece.curX,
          curY: piece.curY,
          mapX: piece.mapX,
          mapY: piece.mapY,
          srcX: piece.srcX,
          srcY: piece.srcY,
          width: piece.width,
          height: piece.height
        });
      }
      return [
        {

        },
        {
          pieces,
          widthPieces: puzzleState.widthPieces,
          heightPieces: puzzleState.heightPieces
        }
      ];
    }

    static async createRoom(roomName, puzzle, user) {
      let room = await Room.create({ roomName, puzzleState: puzzle.serialize(), users: [user] });
      user.rooms.push(room._id);
      user.save();
      activeRooms[room._id] = {
        lastActive: Date.now(),
        room
      };

      return room._id;
    }

    static async createRoomHandler(req, res) {
      if (!req.isAuthenticated()) {
        return res.send('must be signed in to make room');
      }
      const form = formidable({ multiples: true, uploadDir: `${__dirname}/../data/imgs` });

      form.parse(req, async (err, fields, files) => {
        let w, h;
        if (fields.w && fields.h) {
          w = fields.w;
          h = fields.h;
        } else if (fields.dim) {
          let dim = fields.dim.split(',');
          w = parseInt(dim[0]);
          h = parseInt(dim[1]);
        }

        if (!w || !h) {
          console.log('bad dimensions', w, h);
          return res.send('bad dimensions');
        }

        if (!Object.values(files)[0]) {
          console.log('no img');
          return res.send('bad image');
        }

        let file = Object.values(files)[0];
        let splitFileName = file.name.split('.');
        let origName;
        if (splitFileName.length > 1) {
          origName = splitFileName.slice(0, -1).join('.');
        } else {
          origName = file.name;
        }
        let path = file.path;
        let temp = path.split('/');
        let filename = temp[temp.length - 1];
        let puzzle = new Puzzle(path, `${__dirname}/../data/maps/${filename}`, { width: w, height: h });
        await puzzle.init();
        let id = await RoomManager.createRoom(origName, puzzle, req.user);

        res.redirect('/r/' + id);
      });
    }
  }

  io.on('connection', async socket => {
    let username = socket.request.session.passport.user;

    let user;
    if (username) {
      user = await User.findOne({ 'username': username });
    }

    socket.on('join', async roomId => {
      console.log(`joining ${roomId}`);
      let room = await RoomManager.getRoom(roomId);
      if (room) {
        socket.join(roomId);

        socket.emit('init', await RoomManager.getRoomJSON(roomId));
      } else {
        // room not found
      }
    });
  });

  setInterval(function() {
    let time = Date.now();
    for (let [id, room] of Object.entries(activeRooms)) {
      if (time - room.lastActive > ROOM_LIFETIME) {
        RoomManager.unloadRoom(id);
      } else {
        RoomManager.saveRoom(id);
      }
    }
  }, 60000);

  return RoomManager;
};

