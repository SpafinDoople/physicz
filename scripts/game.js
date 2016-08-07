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
var block = new Image();
var background = new Image();
var coin = new Image();
coin.src = "coin.png"
trump.src = "trump.png";
banana.src = "banana.jpg";
block.src = "block.png";
background.src = "background.png";

function Game() {
  var t = this;
  this.init = function() {

  }
  this.draw = function () {
    context.drawImage(background,0,0,canvasWidth,canvasHeight);
    context.font = "30px Verdana";
    context.fillStyle = "#fff";
    context.fillText("Level: " + (level+1) + "  " + "Coins: " + (totalCoins+currentCoins) + " Deaths:" + deaths, 10,30);

    context.save();
  	context.translate(0, canvasHeight);
  	context.scale(1, -1);
  	context.scale(canvasWidth/worldWidth, canvasHeight/worldHeight);
  	context.lineWidth = worldWidth/canvasWidth;
    context.fillStyle = 'rgb(255,255,0)';
    world.DrawDebugData();
    for(var i = 0;i < gameObjects.length;i ++) {
      gameObjects[i].draw(context);
    }
    for(var i = 0;i < levelCoins.length;i ++) {
      levelCoins[i].draw(context);
    }
    context.restore();
    context.drawImage(mario,0,0,50,80,0,0,62.5,100);
  }
  this.mainLoop = function() {
    world.Step(timeStep,iteration);
    t.draw(context);
    iteration++;
    var killMe = [];
    for(var i = 0; i < gameObjects.length;i ++) {
      if(gameObjects[i].body.GetPosition().get_y() < -5) {
        killMe.push(gameObjects[i]);
      }
    }
    for(var i = 0; i < killMe.length;i ++) {;
      gameObjects.splice(gameObjects.indexOf(killMe[i]),1);
      world.DestroyBody(killMe[i].body);
    }
    if(player.body.GetPosition().get_y() < -2) {
      player.body.SetTransform(new b2Vec2(levels[level][0].x,levels[level][0].y), 0);
      player.body.SetLinearVelocity(new b2Vec2(0,0));
      player.body.SetAngularVelocity(0);
      currentCoins = 0;
      destroyCoins();
      initCoins();
      deaths++;
    }
    //37-40 = left up right down
    var speed = 10 * player.body.GetMass();
    if(keys[37]) player.body.ApplyForce(new Box2D.b2Vec2(-speed,0), player.body.GetWorldCenter());
    if(keys[39]) player.body.ApplyForce(new Box2D.b2Vec2(speed,0), player.body.GetWorldCenter());
    if(keys[40])player.body.ApplyForce(new Box2D.b2Vec2(0,-speed), player.body.GetWorldCenter());
    if(keys[38]){
      if(jump == 0) {
        player.body.SetLinearVelocity(new Box2D.b2Vec2(player.body.GetLinearVelocity().get_x(),8));
        jump = 1;
      }
    }
    if(weWon) {
      totalCoins += currentCoins;
      currentCoins = 0;
      levelInit();
    }
    if(coinDestroy) {
      destroyCoin(coinDestroy);
    }
    for(var i = 0; i < gameObjects.length; i++) {
      if(gameObjects[i].body.type == "wheel") {
        if(keys[68]) {
          gameObjects[i].body.SetAngularVelocity(-10);
        }
        if(keys[65]) {
          gameObjects[i].body.SetAngularVelocity(10);
        }
      }
    }
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
