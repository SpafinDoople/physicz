var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var worldWidth = 30;
var worldHeight = 24;

var canvasWidth = 600;
var canvasHeight = 480;

var keys = [];
var jump = 0;
var level = 0;

var world = new Box2D.b2World( new Box2D.b2Vec2(0.0, -9.8) );
var debugDraw = getCanvasDebugDraw();
var e_shapeBit = 0x0001;
debugDraw.SetFlags(e_shapeBit);
world.SetDebugDraw(debugDraw);

var iteration = 0;
var timeStep = 1/60;

var levelBodies = [];
var player;
var goal;
var weWon = false;
//hi

initControls();
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
  if(type != "wall") {
    levelBodies.push(body);
  }
  return body;
}

function mainLoop(){
  world.Step(timeStep,iteration);
  draw(context);
  iteration++;
  if(player.GetPosition().get_y() < 0) {
    player.SetTransform(new b2Vec2(levels[level][0].x,levels[level][0].y), 0);
		player.SetLinearVelocity(new b2Vec2(0,0));
    player.SetAngularVelocity(0);
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
  if(weWon) levelInit();
  //if(player.GetPosition().get_y() <= 2.1)jump = 0;
}

function draw(context){
	context.fillStyle="#000";
	context.fillRect(0,0,canvasWidth,canvasHeight);
  context.font = "30px Verdana";
  context.fillStyle = "#fff";
  context.fillText("Level: " + (level+1), 10,30);

  context.save();
	context.translate(0, canvasHeight);
	context.scale(1, -1);
	context.scale(canvasWidth/worldWidth, canvasHeight/worldHeight);
	context.lineWidth = worldWidth/canvasWidth;
  drawAxes(context);
  context.fillStyle = 'rgb(255,255,0)';
  world.DrawDebugData();
  context.restore();
}

function mouseSquare(e) {
	var mouseX = e.clientX/(canvasWidth/worldWidth);
	var mouseY = (canvasHeight-e.clientY)/(canvasHeight/worldHeight);
  createCircle(mouseX,mouseY,1);
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
    if(other.type == "ground") {
      jump = 0;
    }
    if(other.type == "goal"){
      level++;
      weWon = true;
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
    {shape:"rect",x:2,y:0,w:4,h:3, type:"ground"},
    {shape:"rect",x:13,y:4,w:8,h:1.5, type:"ground"},
    {shape:"rect",x:25,y:8,w:10,h:1.5, type:"ground"},
    {shape:"rect",x:13,y:12,w:8,h:1.5, type:"ground"},
    {shape:"rect",x:2,y:16,w:9,h:2, type:"ground"},
    {shape:"rect",x:27,y:20,w:8,h:1.5, type:"ground"}
  ],

  [
    {shape:"circle",x:4,y:4,size:.5, type:"player"},
    {shape:"circle",x:5,y:9,size:.5, type:"goal"},
    {shape:"rect",x:13,y:0,w:29,h:3, type:"ground"},
    {shape:"rect",x:24,y:4,w:8,h:1.5, type:"ground"},
    {shape:"rect",x:5,y:8,w:10,h:1.5, type:"ground"}
  ],

  [
    {shape:"circle",x:1,y:4,size:.5, type:"player"},
    {shape:"circle",x:15,y:5,size:.5, type:"goal"},
    {shape:"rect",x:13,y:0,w:29,h:3, type:"ground"}
  ]
];
function levelInit() {
  weWon = false;
  for(var i = 0;i < levelBodies.length;i ++) {
    world.DestroyBody(levelBodies[i]);
  }
  levelBodies = [];
  if(level < levels.length && level >= 0) {
    var levelData = levels[level];
    for(var i = 0;i < levelData.length;i ++) {
      if(levelData[i].shape=="circle") {
        var circle = createCircle(levelData[i].x,levelData[i].y,levelData[i].size,levelData[i].type);
        if(levelData[i].type == "player") player=circle;
        if(levelData[i].type == "goal") goal=circle;
      }
      if(levelData[i].shape=="rect") {
        createRectangle(levelData[i].x,levelData[i].y,levelData[i].w,levelData[i].h,levelData[i].type);
      }
    }
  }
}
createRectangle(31,12,2,24,"wall"); //right wall
createRectangle(-1,12,2,24,"wall"); //left wall
createRectangle(15,25,30,2,"wall");; //top wall
levelInit();

function cheat() {
  level++;
  levelInit();
  return "-1 karma";
}
setInterval(mainLoop, 1000/60);
document.addEventListener("click", mouseSquare);
document.addEventListener("keydown", keyDetect);
document.addEventListener("keyup", keyUp);
world.SetContactListener( listener );
