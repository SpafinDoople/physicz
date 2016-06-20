var jump = 0;
var level = 0;
var totalCoins = 0;
var currentCoins = 0;
var coinDestroy = 0;
var deaths = 0;

var levelBodies = [];
var levelCoins = [];
var player;
var goal;
var weWon = false;

var trump = new Image();
var banana = new Image();
trump.src = "trump.png";
banana.src = "banana.jpg";

function Game() {

  this.init = function() {

  }
  this.draw = function () {

  }
  this.mainLoop = function() {

  }
  this.playerContact = function(other) {
    if(other.type == "ground") {
      jump = 0;
    }
    if(other.type == "goal"){
      level++;
      weWon = true;
    }
    if(other.type == "cartop") {
      jump = 0;
    }
    if(typeof other.type == "string") if(other.type.substring(0,4) == "coin"){
      currentCoins++;
      coinDestroy = other.type;
    }
  }
  this.playerEndContact = function(other) {
    if(other.type == "ground") {
      jump = 1;
    }
  }
  this.handleMouse = function(x,y) {
    createCar(x,y)
  }
}
