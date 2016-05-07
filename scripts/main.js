var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var keys = [];
var jump = 0;

var world = new Box2D.b2World( new Box2D.b2Vec2(0.0, 500.0) );
var debugDraw = getCanvasDebugDraw();
var e_shapeBit = 0x0001;
debugDraw.SetFlags(e_shapeBit);
world.SetDebugDraw(debugDraw);

var iteration = 0;
var timeStep = 1/60;

var player = createCircle(20,400,10);

console.log(player);
initControls();
function createCircle(x,y,r) {
  var bd = new Box2D.b2BodyDef();
  bd.set_type(Module.b2_dynamicBody);
  bd.set_position(new Box2D.b2Vec2(x, y));

  var body = world.CreateBody(bd);

  var cshape = new Box2D.b2CircleShape();
  cshape.set_m_radius(r);
  var fix = body.CreateFixture(cshape, 1.0);
  fix.SetRestitution(0.8);

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
  context.fillStyle="#000";
  context.fillRect(0,0,600,480);
  draw(context);
  iteration++;
  if(player.GetPosition().get_y() > 500) {
    player.SetTransform(new b2Vec2(20,400), 0);
  }
  //37-40 = left up right down
  var speed = 100000;
  if(keys[37]) player.ApplyForce(new Box2D.b2Vec2(-speed,0), player.GetWorldCenter());
  if(keys[39]) player.ApplyForce(new Box2D.b2Vec2(speed,0), player.GetWorldCenter());
  if(keys[40])player.ApplyForce(new Box2D.b2Vec2(0,speed), player.GetWorldCenter());
  //console.log(player.GetLinearVelocity().get_x());
  if(keys[38]){
    if(jump == 0) {
      console.log("runn");
      player.SetLinearVelocity(new Box2D.b2Vec2(player.GetLinearVelocity().get_x(),-200));
      jump = 1;
    }
  }
  if(player.GetPosition().get_y() > 444)jump = 0;
}

function draw(context){
  context.save();
  drawAxes(context);
  context.fillStyle = 'rgb(255,255,0)';
  world.DrawDebugData();
  context.restore();
}

function mouseSquare(e) {
  createCircle(e.clientX,e.clientY,20);
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


createRectangle(100,480,200,50); //bottome ground
createRectangle(350,480,100,50);
createRectangle(600,480,200,50);
//createGround(450,120,50,50); //right box
//createGround(150,120,50,50); //left box
//createGround(300,280,50,50); //center box
createRectangle(610,240,20,480); //right wall
createRectangle(-25,240,20,480); //left wall
createRectangle(600,-50,600,50); //top wall
//createCircle(310,60, 20);

setInterval(mainLoop, 1000/60);
document.addEventListener("click", mouseSquare);
document.addEventListener("keydown", keyDetect);
document.addEventListener("keyup", keyUp);
