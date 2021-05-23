$("#dropzone").on("drag dragstart dragend dragover dragenter dragleave drop", function (e) {
  e.preventDefault();
  e.stopPropagation();
})
  .on("dragover dragenter", function () {
    $(this).addClass("is-dragover");
  })
  .on("dragleave dragend drop", function () {
    $(this).removeClass("is-dragover");
  })
  .on("drop", function (e) {
    $('#uploadinput')[0].files = e.originalEvent.dataTransfer.files;
    processUpload(e.originalEvent.dataTransfer.files[0]);
  });
$('#uploadinput').change(function() {
  processUpload(this.files[0])
});

function processUpload(file) {
  let img = document.getElementById('preview');
  img.title = file.name;
  let reader = new FileReader();

  reader.onload = function(e) {
    img.src = e.target.result;

    $('#formend').show();

    img.onload = function(e) {
      let w0 = img.naturalWidth;
      let h0 = img.naturalHeight;
      let r = w0 / h0;
      $('#dimchoices').append(`Your image is ${w0}&times;${h0} pixels. Here are some recommended puzzle dimensions:<br>`);
      let dims = [];
      for (let w of [10, 20, 25, 40, 50, 100, 200, 250]) {
        let h = Math.round(w / r);
        if (w0 / w < 25 || h0 / h < 25) break;
        dims.push([w, h]);
      }

      for (let h of [10, 20, 25, 40, 50, 100, 200, 250]) {
        let w = Math.round(h * r);
        if (w == h) continue;
        if (w0 / w < 25 || h0 / h < 25) break;
        dims.push([w, h]);
      }

      dims.sort((a, b) => a[0] * a[1] - b[0] * b[1]);

      for (let [w, h] of dims) {
        $('#dimchoices').append(`<input type="radio" name="dim" value="${w},${h}"> ${w}&times;${h}`);
      }

      if (dims.length < 2) {
        $('#dimchoices').append('<p>Your image may be too low resolution to be good for a puzzle :(</p>');
      }

      document.getElementById('widthinput').max = Math.round(w0 / 20);
      document.getElementById('heightinput').max = Math.round(h0 / 20);
    }
  }

  reader.readAsDataURL(file);
}