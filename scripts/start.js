var startNow = false;
var buttonClicked = false;

function Start() {
  this.startButton = new Image();
  this.word = "Buper Sario World"
  this.img = new Image();
  this.buttonClicked = false;

  this.init = function() {
    this.img.src = "play.png";
  }

  this.loop = function() {
    if (buttonClicked) {
      startNow = true;
      clearInterval(interval);
      document.removeEventListener("click", checkButton)
    }
  }

  this.draw = function() {
    context.drawImage(this.img, 295, 215, 50, 50);
    context.fillStyle = "black";
    context.font = "30px Arial";
    var metrics = context.measureText(this.word);
    context.fillText(this.word, 320 - metrics.width / 2, 120)
  }
}

var start = new Start();
start.init();

function checkButton(e) {
  var x = e.clientX;
  var y = e.clientY;
  if ((x <= 355) && (x >= 295) && (y >= 215) && (y <= 265)) {
    buttonClicked = true;
  }
}

var interval = setInterval(function() {
  start.loop();
  start.draw();
});
document.addEventListener("click", checkButton);
