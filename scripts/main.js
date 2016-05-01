var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var worldAABB = new b2AABB();
worldAABB.minVertex.Set(-1000, -1000);
worldAABB.maxVertex.Set(1000, 1000);
var gravity = new b2Vec2(0, 300);
var doSleep = true;
var world = new b2World(worldAABB, gravity, doSleep);

var iteration = 0;
var timeStep = 1/60;
var player = createDefaultCircle(25,400);


function createDefaultCircle(x,y) {
  var circleSd = new b2CircleDef();
  circleSd.density = 1.0;
  circleSd.radius = 15;
  circleSd.restitution = 0.8;
  circleSd.friction = 20;
  var circleBd = new b2BodyDef();
  circleBd.AddShape(circleSd);
  circleBd.position.Set(x,y);
  var circleBody = world.CreateBody(circleBd);
  return circleBody;
}

function createGround(x,y,w,h) {
  var groundSd = new b2BoxDef();
  groundSd.extents.Set(w, h);
  groundSd.restitution = 0.2;
  var groundBd = new b2BodyDef();
  groundBd.AddShape(groundSd);
  groundBd.position.Set(x, y);
  world.CreateBody(groundBd);
}

function mainLoop(){
  player.ApplyForce(gravity, player.GetOriginPosition());
  world.Step(timeStep,iteration);
  ctx.clearRect(0,0,600,480);
  ctx.fillStyle="#000";
  ctx.fillRect(0,0,600,480)
  drawWorld(world,ctx);
  if(player.GetOriginPosition().y>520) {
    player.SetCenterPosition({x:25, y:400}, 5);
  }
  iteration++;
}

function mouseSquare(e) {
  createDefaultCircle(e.clientX,e.clientY);
}

function keyboardListener(e) {
  //37-40 = left up right down
  var key = e.keyCode;
  var speed = 1000000;
  if(key == 37) {
    player.ApplyForce(new b2Vec2(-speed,0), player.GetOriginPosition());
  }
  if(key == 38) {
    player.ApplyImpulse(new b2Vec2(0,-100000), player.GetCenterPosition());
  }
  if(key == 39) {
    player.ApplyForce(new b2Vec2(speed,0), player.GetCenterPosition());
  }
   if(key== 40) {
     player.ApplyForce(new b2Vec2(0,speed), player.GetCenterPosition());
   }
}

createGround(100,490,100,25); //bottome ground
createGround(350,490,50,25);
createGround(600,490,100,25)
//createGround(450,120,50,50); //right box
//createGround(150,120,50,50); //left box
//createGround(300,280,50,50); //center box
createGround(625,240,25,240); //right wall
createGround(-25,240,25,240); //left wall
createGround(300,-50,300,50); //top wall
//createDefaultCircle(310,60);

setInterval(mainLoop, 1000/60);
document.addEventListener("click", mouseSquare);
document.addEventListener("keydown", keyboardListener);
