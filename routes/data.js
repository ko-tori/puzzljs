var express = require('express');
var router = express.Router();

const path = __dirname.split('/').slice(0, -1).join('/');

router.get('/img/:id', (req, res) => {
  res.sendFile(`${path}/data/imgs/${req.params.id}`);
});

router.get('/map/:id', (req, res) => {
  res.sendFile(`${path}/data/maps/${req.params.id}`);
});

module.exports = router;