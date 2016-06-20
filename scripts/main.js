var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var game = new Game();
//lel
var worldWidth = 30;
var worldHeight = 24;
var canvasWidth = 600;
var canvasHeight = 480;

var keys = [];
function initControls() {
  for (var i = 0; i < 222; i++) {
    keys.push(false);
  }
}
function keyUp(e) {
  var key = e.keyCode;
  keys[key] = false;
}
function keyDetect(e) {
  var key = e.keyCode;
  keys[key] = true;
}z
document.addEventListener("keydown", keyDetect);
document.addEventListener("keyup", keyUp);

var world = new Box2D.b2World( new Box2D.b2Vec2(0.0, -9.8) );
var debugDraw = getCanvasDebugDraw();
var e_shapeBit = 0x0001;
debugDraw.SetFlags(e_shapeBit);
world.SetDebugDraw(debugDraw);

var iteration = 0;
var timeStep = 1/60;

var gameObjects = [];

initControls();

function createCar(x,y) {
  var wheel1 = new GameObject({
    static: false,
    x: x+1.5,
    y: y,
    r: 0.7,
    friction: 10,
    restitution: 3/4,
    sensor: false,
    type: "wheel",
    shape: "circle"
  },trump);
  var wheel2 = new GameObject({
    static: false,
    x: x-1.5,
    y: y,
    r: 0.7,
    friction: 10,
    restitution: 3/4,
    sensor: false,
    type: "wheel",
    shape: "circle"
  },trump);
  var body = new GameObject({
    static: false,
    x: x,
    y: y,
    w: 3,
    h: 1,
    friction: 10,
    restitution: 3/4,
    sensor: false,
    type: "cartop",
    shape: "rect"
  },banana);
  gameObjects.push(wheel1,wheel2,body);
  //var body = createDynamicRectangle(x,y+1/10,2,1,"cartop");

  var joint1 = new b2RevoluteJointDef();
  var joint2 = new b2RevoluteJointDef();

  joint1.Initialize(wheel1.body,body.body,wheel1.body.GetWorldCenter());
  joint2.Initialize(wheel2.body,body.body,wheel2.body.GetWorldCenter());

  this.world.CreateJoint(joint1);
  this.world.CreateJoint(joint2);
}

function mainLoop(){
  world.Step(timeStep,iteration);
  draw(context);
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

function draw(context){
	context.fillStyle="#000";
	context.fillRect(0,0,canvasWidth,canvasHeight);
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
}

function handleClick(e) {
	var mouseX = e.clientX/(canvasWidth/worldWidth);
	var mouseY = (canvasHeight-e.clientY)/(canvasHeight/worldHeight);
  game.handleMouse(mouseX,mouseY);
}



function getOther(contactPtr) {
    var contact = Box2D.wrapPointer( contactPtr, b2Contact );
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    var other;
    if(fixtureA.GetBody() == player.body) other = fixtureB.GetBody();
    else if(fixtureB.GetBody() == player.body) other = fixtureA.GetBody();
    else return null;
    return other;
    //console.log(other.type);
}
listener = new Box2D.JSContactListener();
listener.BeginContact = function (contactPtr) {
    var other = getOther(contactPtr);
    if(other == null) return;
    if(other.type == undefined) return;
    game.playerContact(other);
}
listener.EndContact = function(contactPtr) {
  var other = getOther(contactPtr);
  if(other == null)return;
  game.playerEndContact(other);
};
listener.PreSolve = function() {};
listener.PostSolve = function() {};
world.SetContactListener( listener );

function levelInit() {
  weWon = false;
  for(var i = 0;i < gameObjects.length;i ++) {
    world.DestroyBody(gameObjects[i].body);
  }
  destroyCoins();
  gameObjects = [];
  if(level < levels.length && level >= 0) {
    var levelData = levels[level];
    for(var i = 0;i < levelData.length;i ++) {
      var body;
      if(levelData[i].shape=="circle" && levelData[i].type.substring(0,4) != "coin") {
        //body = createCircle(levelData[i].x,levelData[i].y,levelData[i].size,levelData[i].type,trump);
        body = new GameObject({
          static: false,
          x: levelData[i].x,
          y: levelData[i].y,
          r: levelData[i].size,
          friction: 10,
          restitution: 3/4,
          sensor: false,
          type: levelData[i].type,
          shape: levelData[i].shape
        },trump);
        gameObjects.push(body);
        if(levelData[i].type == "player") player=body;
        if(levelData[i].type == "goal") goal=body;
      }
      if(levelData[i].shape=="rect") {
        //body = createRectangle(levelData[i].x,levelData[i].y,levelData[i].w,levelData[i].h,levelData[i].type,banana);
        body = new GameObject({
          static: true,
          x: levelData[i].x,
          y: levelData[i].y,
          w: levelData[i].w,
          h: levelData[i].h,
          friction: 10,
          restitution: 3/4,
          sensor: false,
          type: levelData[i].type,
          shape: levelData[i].shape
        },banana);
        gameObjects.push(body);
      }
    }
    initCoins();
  }
}

function initCoins() {
  var levelData = levels[level];
  for(var i = 0;i < levelData.length;i ++) {
    var body;
    if(levelData[i].shape=="circle" && levelData[i].type.substring(0,4) == "coin") {
      body = new GameObject({
        static: true,
        x: levelData[i].x,
        y: levelData[i].y,
        r: levelData[i].size,
        friction: 10,
        restitution: 3/4,
        sensor: true,
        type: levelData[i].type,
        shape: levelData[i].shape
      },trump);
      levelCoins.push(body);
    }
  }

}

function destroyCoins() {
  for(var i = 0; i < levelCoins.length; i++) {
    world.DestroyBody(levelCoins[i].body);
  }
  levelCoins = [];
}

function destroyCoin(type) {
  if(type.substring(0,4) != "coin") return;
  coinDestroy = 0;
  for(var i = 0;i < levelCoins.length;i ++) {
    if(levelCoins[i].body.type == type) {
      levelCoins[i].body.SetAwake(1);
      world.DestroyBody(levelCoins[i].body);
      levelCoins.splice(i,1);
      return;
    }
  }
}
levelInit();
j
document.addEventListener("click", handleClick);
setInterval(mainLoop, 1000/60);
