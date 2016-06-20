function GameObject(params,image) {
  this.region = image;
  function createBody(params) {
    var bd = new Box2D.b2BodyDef();
    bd.set_type(params.static ? Module.b2_staticBody : Module.b2_dynamicBody);
    bd.set_position(new Box2D.b2Vec2(params.x || 0, params.y || 0));
    var body = world.CreateBody(bd);
    var shape;
    if(params.shape == "circle") {
      shape = new Box2D.b2CircleShape();
      shape.set_m_radius(params.r || 1);
    } else if(params.shape == "rect") {
      var verts = [];
      var w = params.w || 1;
      var h = params.h || 1;
      verts.push( new Box2D.b2Vec2(-w/2,-h/2) );
      verts.push( new Box2D.b2Vec2(w/2,-h/2) );
      verts.push( new Box2D.b2Vec2(w/2,h/2) );
      verts.push( new Box2D.b2Vec2(-w/2,h/2) );
      shape = createPolygonShape(verts);
    } else if(params.shape == "poly") {
      shape = createPolygonShape(params.verts);
    } else {
    }
    var fix = body.CreateFixture(shape, 1.0);
    if(params.shape == "circle") {
      fix.SetFriction(params.friction | 10);
      fix.SetRestitution(params.restitution | 0);
    }
    fix.SetSensor(params.sensor | false);
    if(!params.static) {
      body.SetAwake(1);
      body.SetActive(1);
    }
    body.type = params.type /*| ""*/;
    body.shape = params.shape /*| ""*/;
    return body;
  }
  this.draw = function(context){
    if(!this.region) {console.log("SADFSFDAFSDF"); return;}
    var x = this.body.GetPosition().get_x();
    var y = this.body.GetPosition().get_y();
    var rotation = this.body.GetAngle();
    context.save();
    context.translate(x,y);
    context.rotate(rotation);
    if(this.body.shape == "circle") {
      var shape = this.body.GetFixtureList().GetShape();
      var r = shape.get_m_radius();
      context.drawImage(this.region,-r,-r,2*r,2*r);
    }
    if(this.body.shape == "rect") {
      var shape = this.body.GetFixtureList().GetAABB().GetExtents();
      var width = shape.get_x();
      var height = shape.get_y();
      context.drawImage(this.region,-width,-height,2*width,2*height);
    }
    context.restore();
  }
  this.body = createBody(params);
}

function TextureRegion() {
  this.image;
}
