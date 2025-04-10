// Jake Morgan
// triangle sampler thing.

box.message("size", 300, 300);


inlets = 1;
outlets = 3;

//
mgraphics.init();
mgraphics.relative_coords = 1;
mgraphics.autofill = 0;

//
var hoverColor = [0,0,0,0.65];
var bgColor = [1,1,1,1];
var red = [1,0,0,1];
var green = [0,1,0,1];
var blue = [0,0,1,1];
var colorIDS = [red,green,blue];
var TWO_PI = Math.PI * 2;
function squared(num){
  return num * num;
}


//
var timeline = 0;
var deltaTimeLine = 0;

var timeTask = new Task(timescale, this);
var playhead = new Buffer("playhead");

//
//creating buffers to access inside gen.
var samples = [];
samples[0] = new Buffer("x00");
samples[1] = new Buffer("x01");
samples[2] = new Buffer("x02");

var bufLength = [];
bufLength[0] = new Buffer("rLength");
bufLength[1] = new Buffer("gLength");
bufLength[2] = new Buffer("bLength");

var circlePos = [];
circlePos[0] = new Buffer("rPos");
circlePos[1] = new Buffer("gPos");
circlePos[2] = new Buffer("bPos");

var circleCoord = [];
circleCoord[0] = new Buffer("rDistance");
circleCoord[1] = new Buffer("gDistance");
circleCoord[2] = new Buffer("bDistance");

//
var circleSpeed = 0.01;
var newSpeed = 0.073;
var newestSpeed = 0.002;

//
class vertex{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}

class shared_vertex{
  constructor(vertex1,vertex2){
    this.v1 = vertex1;
    this.v2 = vertex2;
  }

  updateVertex(x,y){
    this.v1.x = x;
    this.v2.x = x;
    this.v1.y = y;
    this.v2.y = y;
  }
}

//
function vectorMult(v1,v2){
  var vOut = new vertex(v1.x * v2.x,v1.y * v2.y);
  return vOut;
}

function vectorDiv(v1,v2){
  var vOut = new vertex(v1.x / v2.x,v1.y / v2.y);
  return vOut;
}

function vectorAdd(v1,v2){
  var vOut = new vertex(v1.x + v2.x,v1.y + v2.y);
  return vOut;
}

function vectorSub(v1,v2){
  var vOut = new vertex(v1.x - v2.x,v1.y - v2.y);
  return vOut;
}

//
function clip(value, min, max){
  return Math.min(Math.max(value,min),max);
}

function scale(num, min1, max1, min2, max2) {
  return ((num - min1) * (max2 - min2)) / (max1 - min1) + min2;
}

function scaleToRelative(val,min,max){
  const normalized = (val - min) / (max-min);
  return (normalized*2) - 1;
}

//
var hover_vertex = function(id, shared_vertex, size){
  this.id = id;
  this.current_pos = new vertex(shared_vertex.v1.x,shared_vertex.v1.y);
  this.shared = shared_vertex;
  this.w = size;
  this.h = size;
  this.idle;
  this.corner = new vertex(this.current_pos.x + this.w, this.current_pos.y + this.h);
  this.clicked = false; 

  this.onclick = function(x,y,but){
    var mousePos = new vertex(x,y);
    var box_width,box_height;
    box_width = box.rect[2] - box.rect[0];
    box_height = box.rect[3] - box.rect[1];
    var scaled_x,scaled_y;
    scaled_x = scaleToRelative(x,0,box_width);
    scaled_y = scaleToRelative(y,0,box_height) * -1;
    if(
      scaled_x > this.current_pos.x - this.w / 2 && 
      scaled_x < this.current_pos.x + this.w / 2 && 
      scaled_y > this.current_pos.y - this.h / 2 && 
      scaled_y < this.current_pos.y + this.h / 2 && but
    ){
      this.clicked = true;
    }else{
      this.clicked = false;
    }
  }
  this.onidle = function(x,y){ 
    var box_width,box_height;
    box_width = box.rect[2] - box.rect[0];
    box_height = box.rect[3] - box.rect[1];
    var scaled_x,scaled_y;
    scaled_x = scaleToRelative(x,0,box_width);
    scaled_y = scaleToRelative(y,0,box_height) * -1;
    if(
      scaled_x > this.current_pos.x - this.w / 2 && 
      scaled_x < this.current_pos.x + this.w / 2 && 
      scaled_y > this.current_pos.y - this.h / 2 && 
      scaled_y < this.current_pos.y + this.h / 2)
    { 
      this.idle = 1; 
    }else {
      this.idle = 0;
    }
  }

  this.drag = function(x,y){
    // dealing with click here since actually interactivity comes from drag.
    if(this.clicked){
      var box_width,box_height;
      box_width = box.rect[2] - box.rect[0];
      box_height = box.rect[3] - box.rect[1];
      var scaled_x,scaled_y;
      scaled_x = scaleToRelative(x,0,box_width);
      scaled_y = scaleToRelative(y,0,box_height) * -1;
      this.shared.updateVertex(scaled_x,scaled_y);
    }
  }

  this.paint = function(){
    var aspect = calcAspect();
    if(this.idle == 1){
      with(mgraphics){
        set_source_rgba(hoverColor);
        arc(this.current_pos.x * aspect,this.current_pos.y * aspect,this.w/2*aspect,0,50);
        stroke();
      }
    }
  }
  this.update = function(shared_vertex){
    this.current_pos = shared_vertex.v1;
  }
}

//
var circle = function(id, vertices, speed){
  
  this.id = id;
  this.speed = speed;
  this.vertices = vertices;

  // capped between 0,1
  var u = 0;
  // u will keep track of where we are on the line.
  //
  var velocity = new vertex(speed,speed);

  var width = 0.03;
  // init will be changed after the first animate function
  // keeps it from going off the line at first.
  var init = 0;
  //
  // again, which vertex you choose from the shared vertex doesn't matter.
  // would probably be better to have it so that the shared class has its own vertex to reference
  var currentPos = new vertex(vertices[0].v1.x, vertices[0].v1.y);
  var dir = 1;
  var counter = 0;
  //
  this.getRelativeLength = function(){
    //getting the length between currentPos and vertex destination.
    var d = Math.sqrt(Math.abs(squared((vertices[dir].v1.x - currentPos.x)) + squared((vertices[dir].v1.y - currentPos.y))));
    return d;
  }
  // a better way to do this... 
  // notes for converting to c++
  // create a shared vertex class that is able to just be overloaded via =
  // it'll save so much time.
  // and don't call it a vertex. 
  // becomes confusing.
  this.linearAnimate = function(shared1, shared2){
    var v1 = new vertex(shared1.v1.x,shared1.v1.y);
    var v2 = new vertex(shared2.v1.x,shared2.v1.y);
    //in theory this should just increment all the way to 1 via the speed.
    //when it hits the vertex.... it should theoretically switch its velocity.
    if(u == 1 || u == 0 && init != 0){
      speed *= -1;
    }
    init = 1;
    u = clip((u+(speed)),0,1);
    //
    circlePos[id].poke(0,0,u);
    
    var d = Math.sqrt(Math.abs(squared((vertices[0].v1.x - currentPos.x)) + squared((vertices[0].v1.y - currentPos.y))));
    var vertexDistance = Math.sqrt(Math.abs(squared((vertices[0].v1.x - vertices[1].v1.x)) + squared((vertices[0].v1.y - vertices[1].v1.y)))); 
    d = clip(scale(d,0,vertexDistance,0,1),0,1);
    circleCoord[id].poke(0,0,d);
    //post("id: ", id, "relative distance: ", d, '\n');

    // technically this is fine.
    // next time make it a vector ahead of time.
    var uVec = new vertex(u,u);
    currentPos = vectorAdd(v1,vectorMult(uVec,vectorSub(v2,v1)));
  }
  this.getVectorDistance = function(){
    var d = vectorSub(currentPos, vertices[dir]);
    return d;
  }
  this.changeDirection = function(){
    dir = Math.abs(dir - 1);
  }
  // using p1+(p2-p1)*mag does NOT return a linear movement function
  // need linear movement;

  this.paint = function(){
    var aspect = calcAspect();
    with(mgraphics){
      arc(currentPos.x * aspect,currentPos.y * aspect,width*aspect,0,50);
      set_line_width(width*aspect);
      set_source_rgba(colorIDS[id]);
      stroke();
    }
  }
}

//
var line = function(id, vertex1, vertex2){

  this.id = id;
  this.vertex1 = vertex1;
  this.vertex2 = vertex2;

  // techincally this is all you need. adding hover in and out animations would be cool
  // would be really hard to do in c++


  // creating template functions for later use...
  // thinking we need a way to get length, change verteces' pos, change length,
  // to allow one line to affect another, need to be able to return verteces.
  this.getVertex1 = function(){
    return vertex1;
  }
  this.getVertex2 = function(){
    return vertex2;
  }
  this.getLength = function(){
    var d = Math.sqrt(Math.abs(squared((vertex2.x - vertex1.x)) + squared((vertex2.y - vertex1.y))));
    return d;
  } 
  this.paint = function(){
    var aspect = calcAspect();
    with(mgraphics){
      set_line_width(0.03);
      set_line_cap("round");
      set_source_rgba(colorIDS[id]);
      move_to(vertex1.x * aspect,vertex1.y * aspect);
      line_to(vertex2.x * aspect, vertex2.y * aspect);
      stroke();
    }
  }
  this.edges = function(){
    vertex1.x = clip(vertex1.x,-1,1);
    vertex1.y = clip(vertex1.y,-1,1);
    vertex2.x = clip(vertex2.x,-1,1);
    vertex2.y = clip(vertex2.y,-1,1);
  }
};

function outputLineLength(line){
  outlet(line.id, line.getLength());
  //very important: poke inside js is (channel, index, value)
  //inside gen~ (buffer, value, index, channel(optional))
  bufLength[line.id].poke(0,0,line.getLength()/2);
}

// from max9 documentation.
function calcAspect() {
  var width = this.box.rect[2] - this.box.rect[0]
  var height = this.box.rect[3] - this.box.rect[1]
  return width / height
}

//
var lineR = new line(0, new vertex(-0.5,-0.73), new vertex(0.8,0.5));
var lineG = new line(1, new vertex(0.8,0.5), new vertex(0.2,0.8));
var lineB = new line(2, new vertex(0.2,0.8), new vertex(-0.5,-0.73));

let rgVertex = new shared_vertex(lineR.vertex2, lineG.vertex1);
let gbVertex = new shared_vertex(lineG.vertex2, lineB.vertex1);
let brVertex = new shared_vertex(lineB.vertex2, lineR.vertex1);

var circleR = new circle(0, [rgVertex, brVertex], circleSpeed);
var circleG = new circle(1, [gbVertex, rgVertex], circleSpeed);
var circleB = new circle(2, [brVertex, gbVertex], circleSpeed);

var rgHover = new hover_vertex(0,rgVertex,0.2);
var gbHover = new hover_vertex(1,gbVertex,0.2);
var brHover = new hover_vertex(2,brVertex,0.2);

//
function paint(){
  with(mgraphics){
    lineR.paint();
    lineG.paint();
    lineB.paint();
    circleR.paint();
    circleG.paint();
    circleB.paint();
    rgHover.paint();
    gbHover.paint();
    brHover.paint();
  }
}

//
var initialized = 0;
function init(){
  if(initialized == 1){
    return initialized;
  }else{
    // do all the setup here::::
    initialized = 1;
    return initialized;
  }
}





function rotateVertex(shared_vertex){
  var angle = 0.02;
  // technically doesn't matter what vertex you take from since they are the same. 
  var x = shared_vertex.v1.x;
  var y = shared_vertex.v1.y;
  shared_vertex.updateVertex(((x*Math.cos(angle)) - (y*Math.sin(angle))),((y*Math.cos(angle)) + (x*Math.sin(angle))));
}

function update(){
  rotateVertex(rgVertex);
  rotateVertex(gbVertex);
  rotateVertex(brVertex);
  rgHover.update(rgVertex);
  gbHover.update(gbVertex);
  brHover.update(brVertex);
  outputLineLength(lineR);
  outputLineLength(lineG);
  outputLineLength(lineB);
  circleR.linearAnimate(rgVertex,brVertex);
  circleG.linearAnimate(gbVertex,rgVertex);
  circleB.linearAnimate(brVertex,gbVertex);
  lineR.edges();
  lineG.edges();
  lineB.edges();
  mgraphics.redraw();
}

//
//reset to 50
timeTask.interval = 50;
timeTask.repeat();
timeTask.execute();

function timescale(){
  deltaTimeline = timeline;

  timeline = playhead.peek(0,0);
  deltaTimeLine = timeline - deltaTimeLine;

  if(deltaTimeLine > 0){

  }
  update();
}

function onclick(x,y,but){
  rgHover.onclick(x,y,but);
  gbHover.onclick(x,y,but);
  brHover.onclick(x,y,but);
  mgraphics.redraw();
}
onclick.local = 1;

function ondrag(x,y,but){
  rgHover.drag(x,y,but);
  gbHover.drag(x,y,but);
  brHover.drag(x,y,but);
  mgraphics.redraw();
}

function onidle(x,y){
  rgHover.onidle(x,y);
  gbHover.onidle(x,y);
  brHover.onidle(x,y);
  mgraphics.redraw();
}
