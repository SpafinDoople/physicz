var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var world = Box2D.b2World( Box2D.b2Vec2(0.0, -10.0) );

var iteration = 0;
var timeStep = 1/60;

var player = createDefaultCircle(25,400);


function createDefaultCircle(x,y) {
	//Figure out how to make a circle body
}

function createGround(x,y,w,h) {
	//Figure out how to create a rectangle body
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
    player.ApplyForce(new Box2D.b2Vec2(-speed,0), player.GetOriginPosition());
  }
  if(key == 38) {
    player.ApplyImpulse(new Box2D.b2Vec2(0,-100000), player.GetCenterPosition());
  }
  if(key == 39) {
    player.ApplyForce(new Box2D.b2Vec2(speed,0), player.GetCenterPosition());
  }
   if(key== 40) {
     player.ApplyForce(new Box2D.b2Vec2(0,speed), player.GetCenterPosition());
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
