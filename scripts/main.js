var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var worldWidth = 30;
var worldHeight = 24;

var canvasWidth = 600;
var canvasHeight = 480;

var keys = [];
var jump = 0;
var level = 0;
var totalCoins = 0;
var currentCoins = 0;
var coinDestroy = 0;

var world = new Box2D.b2World( new Box2D.b2Vec2(0.0, -9.8) );
var debugDraw = getCanvasDebugDraw();
var e_shapeBit = 0x0001;
debugDraw.SetFlags(e_shapeBit);
world.SetDebugDraw(debugDraw);

var iteration = 0;
var timeStep = 1/60;

var levelBodies = [];
var levelCoins = [];
var player;
var goal;
var weWon = false;

var trump = new Image();
var banana = new Image();
trump.src = "trump.png";
banana.src = "banana.jpg";

initControls();
function createCoin(x,y,r,type) {
  var bd = new Box2D.b2BodyDef();
  bd.set_type(Module.b2_staticBody);
  bd.set_position(new Box2D.b2Vec2(x, y));
  var body = world.CreateBody(bd);
  var cshape = new Box2D.b2CircleShape();
  cshape.set_m_radius(r);
  var fix = body.CreateFixture(cshape, 1.0);
  fix.SetFriction(10);
  fix.SetRestitution(0);
  fix.SetSensor(true);
  body.type = type;
  body.img = trump;
  levelCoins.push(body);
  return body;
}
function createCircle(x,y,r,type) {
  var bd = new Box2D.b2BodyDef();
  bd.set_type(Module.b2_dynamicBody);
  bd.set_position(new Box2D.b2Vec2(x, y));

  var body = world.CreateBody(bd);

  var cshape = new Box2D.b2CircleShape();
  cshape.set_m_radius(r);
  var fix = body.CreateFixture(cshape, 1.0);
  fix.SetFriction(10);
  fix.SetRestitution(0);
  body.SetAwake(1);
  body.SetActive(1);
  body.type = type;
  body.img = trump;
  body.shape = "circle";
  levelBodies.push(body);
  return body;
}

function createRectangle(x,y,w,h,type) {
  var bd = new Box2D.b2BodyDef();
  bd.set_type(Module.b2_staticBody);
  bd.set_position(new Box2D.b2Vec2(x, y));

  var body = world.CreateBody(bd);
  var verts = [];
  verts.push( new Box2D.b2Vec2(-w/2,-h/2) );
  verts.push( new Box2D.b2Vec2(w/2,-h/2) );
  verts.push( new Box2D.b2Vec2(w/2,h/2) );
  verts.push( new Box2D.b2Vec2(-w/2,h/2) );
  var rshape = createPolygonShape(verts);

  body.CreateFixture(rshape, 1.0);
  body.type = type;
  body.img = banana;
  if(type != "wall") {
    levelBodies.push(body);
  }
  return body;
}

function createDynamicRectangle(x,y,w,h,type) {
  var bd = new Box2D.b2BodyDef();
  bd.set_type(Module.b2_dynamicBody);
  bd.set_position(new Box2D.b2Vec2(x, y));

  var body = world.CreateBody(bd);
  var verts = [];
  verts.push( new Box2D.b2Vec2(-w/2,-h/2) );
  verts.push( new Box2D.b2Vec2(w/2,-h/2) );
  verts.push( new Box2D.b2Vec2(w/2,h/2) );
  verts.push( new Box2D.b2Vec2(-w/2,h/2) );
  var rshape = createPolygonShape(verts);

  body.CreateFixture(rshape, 1.0);
  body.type = type;
  body.img = banana;
  //body.shape="rect";
  if(type != "wall") {
    levelBodies.push(body);
  }
  return body;
}

function createCar(x,y) {
  var wheel1 = createCircle(x+1.5,y,7/10,"wheel")
  var wheel2 = createCircle(x-1.5,y,7/10,"wheel");
  var body = createDynamicRectangle(x,y+1/10,2,1,"cartop");

  var joint1 = new b2RevoluteJointDef();
  var joint2 = new b2RevoluteJointDef();

  joint1.Initialize(wheel1,body,wheel1.GetWorldCenter());
  joint2.Initialize(wheel2,body,wheel2.GetWorldCenter());

  this.world.CreateJoint(joint1);
  this.world.CreateJoint(joint2);
}

function mainLoop(){
  world.Step(timeStep,iteration);
  draw(context);
  iteration++;
  var killMe = [];
  for(var i = 0; i < levelBodies.length;i ++) {
    if(levelBodies[i].GetPosition().get_y() < -5) {
      killMe.push(levelBodies[i]);
    }
  }
  for(var i = 0; i < killMe.length;i ++) {;
    levelBodies.splice(levelBodies.indexOf(killMe[i]),1);
    world.DestroyBody(killMe[i]);
  }
  if(player.GetPosition().get_y() < -2) {
    player.SetTransform(new b2Vec2(levels[level][0].x,levels[level][0].y), 0);
    player.SetLinearVelocity(new b2Vec2(0,0));
    player.SetAngularVelocity(0);
    currentCoins = 0;
    destroyCoins();
    initCoins();
  }
  //37-40 = left up right down
  var speed = 10 * player.GetMass();
  if(keys[37]) player.ApplyForce(new Box2D.b2Vec2(-speed,0), player.GetWorldCenter());
  if(keys[39]) player.ApplyForce(new Box2D.b2Vec2(speed,0), player.GetWorldCenter());
  if(keys[40])player.ApplyForce(new Box2D.b2Vec2(0,-speed), player.GetWorldCenter());
  if(keys[38]){
    if(jump == 0) {
      player.SetLinearVelocity(new Box2D.b2Vec2(player.GetLinearVelocity().get_x(),8));
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
  for(var i = 0; i < levelBodies.length; i++) {
    if(levelBodies[i].type == "wheel") {
      if(keys[68]) {
        levelBodies[i].SetAngularVelocity(-10);
      }
      if(keys[65]) {
        levelBodies[i].SetAngularVelocity(10);
      }
    }
  }
}

function draw(context){
	context.fillStyle="#000";
	context.fillRect(0,0,canvasWidth,canvasHeight);
  context.font = "30px Verdana";
  context.fillStyle = "#fff";
  context.fillText("Level: " + (level+1) + "  " + "Coins: " + (totalCoins+currentCoins), 10,30);

  context.save();
	context.translate(0, canvasHeight);
	context.scale(1, -1);
	context.scale(canvasWidth/worldWidth, canvasHeight/worldHeight);
	context.lineWidth = worldWidth/canvasWidth;
  context.fillStyle = 'rgb(255,255,0)';
  world.DrawDebugData();
  for(var i = 0;i < levelBodies.length;i ++) {
    drawImageForBody(levelBodies[i],context);
  }
  for(var i = 0; i < levelCoins.length; i++) {
    drawImageForBody(levelCoins[i],context);
  }
  context.restore();
}

function mouseSquare(e) {
	var mouseX = e.clientX/(canvasWidth/worldWidth);
	var mouseY = (canvasHeight-e.clientY)/(canvasHeight/worldHeight);
  createCar(mouseX,mouseY);
}

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
}

function getOther(contactPtr) {
    var contact = Box2D.wrapPointer( contactPtr, b2Contact );
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    var other;
    if(fixtureA.GetBody() == player) other = fixtureB.GetBody();
    else if(fixtureB.GetBody() == player) other = fixtureA.GetBody();
    else return null;
    return other;
    //console.log(other.type);
}
listener = new Box2D.JSContactListener();
listener.BeginContact = function (contactPtr) {
    var other = getOther(contactPtr);
    if(other == null) return;
    if(other.type == undefined) return;
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
    if(other.type.substring(0,4) == "coin"){
      currentCoins++;
      coinDestroy = other.type;
    }
}
listener.EndContact = function(contactPtr) {
  var other = getOther(contactPtr);
  if(other == null)return;
  if(other.type == "ground") {
    jump = 1;
  }
};
listener.PreSolve = function() {};
listener.PostSolve = function() {};

var levels = [
  [
    {shape:"circle",x:1,y:4,size:0.5, type:"player"},
    {shape:"circle",x:28,y:21,size:0.5, type:"goal"},
    {shape:"rect",x:2,y:0,w:4,h:1.5, type:"ground"},
    {shape:"rect",x:13,y:4,w:8,h:1.5, type:"ground"},
    {shape:"rect",x:25,y:8,w:10,h:1.5, type:"ground"},
    {shape:"rect",x:13,y:12,w:8,h:1.5, type:"ground"},
    {shape:"rect",x:2,y:16,w:9,h:2, type:"ground"},
    {shape:"rect",x:27,y:20,w:8,h:1.5, type:"ground"},
    {shape:"circle",x:13, y:14,size:1/4,type:"coin1"},
    {shape:"circle",x:4,y:18,size:1/4,type:"coin2"}
  ],

  [
    {shape:"circle",x:1,y:4,size:.5, type:"player"},
    {shape:"circle",x:15,y:5,size:.5, type:"goal"},
    {shape:"rect",x:13,y:0,w:29,h:3, type:"ground"}
  ],

  [
    {shape:"circle",x:4,y:4,size:.5, type:"player"},
    {shape:"circle",x:5,y:9,size:.5, type:"goal"},
    {shape:"rect",x:0,y:0,w:10,h:3, type:"ground"},
    {shape:"rect",x:27,y:4,w:2.5,h:1.5, type:"ground"},
    {shape:"rect",x:4,y:8,w:9.4,h:1.5, type:"ground"},
    {shape:"circle",x:24,y:6,size:1/4,type:"coin1"}
  ]
];
function levelInit() {
  weWon = false;
  for(var i = 0;i < levelBodies.length;i ++) {
    world.DestroyBody(levelBodies[i]);
  }
  destroyCoins();
  levelBodies = [];
  if(level < levels.length && level >= 0) {
    var levelData = levels[level];
    for(var i = 0;i < levelData.length;i ++) {
      var body;
      if(levelData[i].shape=="circle" && levelData[i].type.substring(0,4) != "coin") {
        body = createCircle(levelData[i].x,levelData[i].y,levelData[i].size,levelData[i].type);
        if(levelData[i].type == "player") player=body;
        if(levelData[i].type == "goal") goal=body;
        body.shape = levelData[i].shape;
      }
      if(levelData[i].shape=="rect") {
        body = createRectangle(levelData[i].x,levelData[i].y,levelData[i].w,levelData[i].h,levelData[i].type);
        body.shape = levelData[i].shape;
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
      body = createCoin(levelData[i].x,levelData[i].y,levelData[i].size,levelData[i].type);
      body.shape = levelData[i].shape;
    }
  }

}

function destroyCoins() {
  for(var i = 0; i < levelCoins.length; i++) {
    world.DestroyBody(levelCoins[i]);
  }
  levelCoins = [];
}

function destroyCoin(type) {
  if(type.substring(0,4) != "coin") return;
  coinDestroy = 0;
  for(var i = 0;i < levelCoins.length;i ++) {
    if(levelCoins[i].type == type) {
      levelCoins[i].SetAwake(1);
      world.DestroyBody(levelCoins[i]);
      levelCoins.splice(i,1);
      return;
    }
  }
}
function drawImageForBody(body,context) {
  var x = body.GetPosition().get_x();
  var y = body.GetPosition().get_y();
  var rotation = body.GetAngle();
  context.save();
  context.translate(x,y);
  context.rotate(rotation);
  if(body.shape == "circle") {
    var shape = body.GetFixtureList().GetShape();
    var r = shape.get_m_radius();
    context.drawImage(body.img,-r,-r,2*r,2*r);
  }
  if(body.shape == "rect") {
    var shape = body.GetFixtureList().GetAABB().GetExtents();
    var width = shape.get_x();
    var height = shape.get_y();
    context.drawImage(body.img,-width,-height,2*width,2*height);
  }
  context.restore();
}
createRectangle(31,12,2,24,"wall"); //right wall
createRectangle(-1,12,2,24,"wall"); //left wall
createRectangle(15,25,30,2,"wall");; //top wall
levelInit();

function cheat() {
  totalCoins = -Math.pow(2,100);
  level++;
  levelInit();
  return "-1 karma";
}
setInterval(mainLoop, 1000/60);
document.addEventListener("click", mouseSquare);
document.addEventListener("keydown", keyDetect);
document.addEventListener("keyup", keyUp);
world.SetContactListener( listener );
