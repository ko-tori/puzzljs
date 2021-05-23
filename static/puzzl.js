var width = $(window).width();
var height = $(window).height();

function resizeHandler(e) {
  width = $(window).width();
  height = $(window).height()
  $('#canvas').width(width);
  $('#canvas').height(height);
}

var roomId = location.pathname.substring(3);
var socket;

$(window).resize(resizeHandler);

$(document).ready(() => {
  socket = io();

  console.log('made socket');

  socket.on('connect', () => {
    console.log('connected!');
    socket.emit('join', roomId);
  });

  socket.on('init', data => {
    console.log(data);
  })
});