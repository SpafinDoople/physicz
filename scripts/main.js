var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var worldWidth = 30;
var worldHeight = 24;

var canvasWidth = 600;
var canvasHeight = 480;

var keys = [];
var jump = 0;

var world = new Box2D.b2World( new Box2D.b2Vec2(0.0, -9.8) );
var debugDraw = getCanvasDebugDraw();
var e_shapeBit = 0x0001;
debugDraw.SetFlags(e_shapeBit);
world.SetDebugDraw(debugDraw);

var iteration = 0;
var timeStep = 1/60;

var player = createCircle(1,4,.5);

initControls();
function createCircle(x,y,r) {
  var bd = new Box2D.b2BodyDef();
  bd.set_type(Module.b2_dynamicBody);
  bd.set_position(new Box2D.b2Vec2(x, y));

  var body = world.CreateBody(bd);

  var cshape = new Box2D.b2CircleShape();
  cshape.set_m_radius(r);
  var fix = body.CreateFixture(cshape, 1.0);
  fix.SetRestitution(0.5);

  body.SetAwake(1);
  body.SetActive(1);
  return body;
}

function createRectangle(x,y,w,h) {
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
  return body;
}

function mainLoop(){
  world.Step(timeStep,iteration);
  draw(context);
  iteration++;
  if(player.GetPosition().get_y() < 0) {
    player.SetTransform(new b2Vec2(1,4), 0);
		player.SetLinearVelocity(new b2Vec2(0,0));
  }
  //37-40 = left up right down
  var speed = 10 * player.GetMass();
  if(keys[37]) player.ApplyForce(new Box2D.b2Vec2(-speed,0), player.GetWorldCenter());
  if(keys[39]) player.ApplyForce(new Box2D.b2Vec2(speed,0), player.GetWorldCenter());
  if(keys[40])player.ApplyForce(new Box2D.b2Vec2(0,-speed), player.GetWorldCenter());
  if(keys[38]){
    if(jump == 0) {
      player.SetLinearVelocity(new Box2D.b2Vec2(player.GetLinearVelocity().get_x(),5));
      jump = 1;
    }
  }
  //if(player.GetPosition().get_y() <= 2.1)jump = 0;
}

function draw(context){
	context.fillStyle="#000";
	context.fillRect(0,0,canvasWidth,canvasHeight);

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

listener = new Box2D.JSContactListener();
listener.BeginContact = function (contactPtr) {
    var contact = Box2D.wrapPointer( contactPtr, b2Contact );
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    var other;
    if(fixtureA.GetBody() == player) other = fixtureB.GetBody();
    else if(fixtureB.GetBody() == player) other = fixtureA.GetBody();
    else return;
    if(other.type == "ground") {
      jump = 0;
    }
    //console.log(other.type);
}
listener.EndContact = function() {jump = 1};
listener.PreSolve = function() {};
listener.PostSolve = function() {};

createRectangle(2,0,4,3).type = "ground"; //bottom ground
createRectangle(13,0,8,3).type = "ground"; //bottom ground
createRectangle(25,0,10,3).type = "ground"; //bottom ground

createRectangle(31,12,2,24).type = "wall"; //right wall
createRectangle(-1,12,2,24).type = "wall"; //left wall
createRectangle(15,25,30,2).type = "wall"; //top wall

setInterval(mainLoop, 1000/60);
document.addEventListener("click", mouseSquare);
document.addEventListener("keydown", keyDetect);
document.addEventListener("keyup", keyUp);
world.SetContactListener( listener );
