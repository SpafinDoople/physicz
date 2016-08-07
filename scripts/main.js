var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var game = new Game();
//lel
var play = 0;
var worldWidth = 30;
var worldHeight = 24;
var canvasWidth = 600;
var canvasHeight = 480;

var keys = [];
var direction = "right";
var mario = new Image();
mario.src = "mario.png";

document.getElementById("bgmusic").loop = true;
document.getElementById("bgmusic").autoplay = true;


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
  keys[key] = true;v
}

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

function createTriangleCar(x,y,size) {
  var triangle = new GameObject({
    static: false,
    x: x,
    y: y,
    friction: 10,
    restitution: 3/4,
    sensor: false,
    type: "triangle",
    shape: "poly",
    verts: [
      new Box2D.b2Vec2(Math.sin(60)*size,-Math.cos(60)*size),
      new Box2D.b2Vec2(-Math.sin(60)*size,-Math.cos(60)*size),
      new Box2D.b2Vec2(0,size+1)
    ]
  },undefined);
  var wheel1 = new GameObject({
    static: false,
    x: x,
    y: y + size + 1,
    r: size/5,
    friction: 10,
    restitution: 3/4,
    sensor: false,
    type: "wheel",
    shape: "circle",
  }, trump);
  var wheel2 = new GameObject({
    static: false,
    x: x - Math.sin(60)*size,
    y: y - Math.cos(60)*size,
    r: size/5,
    friction: 10,
    restitution: 3/4,
    sensor: false,
    type: "wheel",
    shape: "circle",
  }, trump);
  var wheel3 = new GameObject({
    static: false,
    x: x + Math.sin(60)*size,
    y: y - Math.cos(60)*size,
    r: size/5,
    friction: 10,
    restitution: 3/4,
    sensor: false,
    type: "wheel",
    shape: "circle",
  }, trump);
  gameObjects.push(wheel1, wheel2, wheel3, triangle);
  var joint1 = new Box2D.b2RevoluteJointDef();
  var joint2 = new Box2D.b2RevoluteJointDef();
  var joint3 = new Box2D.b2RevoluteJointDef();

  joint1.Initialize(wheel1.body, triangle.body, wheel1.body.GetWorldCenter());
  joint2.Initialize(wheel2.body, triangle.body, wheel2.body.GetWorldCenter());
  joint3.Initialize(wheel3.body, triangle.body, wheel3.body.GetWorldCenter());
}

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

  joint1.Initialize(wheel1.body, body.body, wheel1.body.GetWorldCenter());
  joint2.Initialize(wheel2.body, body.body, wheel2.body.GetWorldCenter());

  this.world.CreateJoint(joint1);
  this.world.CreateJoint(joint2);
}

function handleClick(e) {
	var mouseX = e.clientX/(canvasWidth/worldWidth);
	var mouseY = (canvasHeight-e.clientY)/(canvasHeight/worldHeight);
  console.log(play);
  if(play) {
    game.handleMouse(mouseX,mouseY);
  }
  if ((mouseX <= 355) && (mouseX >= 295) && (mouseY >= 215) && (mouseY <= 265)) {
    buttonClicked = true;
  }
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

function cleanupLevel() {
  for(var i = 0;i < gameObjects.length;i ++) {
    world.DestroyBody(gameObjects[i].body);
  }
  destroyCoins();
  gameObjects = [];
}

function levelInit() {
  weWon = false;
  cleanupLevel();
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
        },block);
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
      },coin);
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

function destroyCoin(tplayype) {
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

setInterval(function() {
  if(startNow) play = 1;
  if(play) game.mainLoop();
}, 1000/60);
document.addEventListener("click", handleClick);
