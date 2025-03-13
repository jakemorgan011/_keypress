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
var hoverColor = [0.9,0.9,0.9,1];
var bgColor = [1,1,1,1];
var red = [1,0,0,1];
var green = [0,1,0,1];
var blue = [0,0,1,1];
var colorIDS = [red,green,blue];

//
var TWO_PI = Math.PI * 2;
function squared(num){
  return num * num;
}


//
var timeline = 0;
var deltaTimeLine = 0;

var timeTask = new Task(timescale, this);
var playhead = new Buffer("playhead");
var samples = [];
samples[0] = new Buffer("x00");
samples[1] = new Buffer("x01");
samples[2] = new Buffer("x02");

//
var circleSpeed = 0.1;


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
  var vOut = new vertex(v1.x*v2.x,v1.y*v2.y);
  return vOut;
}

function vectorDiv(v1,v2){
  var vOut = new vertex(v1.x/v2.x,v1.y/v2.y);
  return vOut;
}

function vectorAdd(v1,v2){
  var vOut = new vertex(v1.x+v2.x,v1.y+v2.y);
  return vOut;
}

function vectorSub(v1,v2){
  var vOut = new vertex(v1.x-v2.x,v1.y-v2.y);
  return vOut;
}


//
var circle = function(id, vertices, speed){
  
  this.id = id;
  this.speed = speed;
  this.vertices = vertices;

  var velocity = new vertex(speed,speed);

  var width = 0.03;
  //
  // again, which vertex you choose from the shared vertex doesn't matter.
  // would probably be better to have it so that the shared class has its own vertex to reference
  var currentPos = new vertex(vertices[0].v1.x, vertices[0].v1.y);
  var dir = 1;
  var counter = 0;
  var startingPos = currentPos;
  //
  this.getRelativePos = function(){
  }
  this.changeDirection = function(){
    dir = Math.abs(dir - 1);
  }
  // using p1+(p2-p1)*mag does NOT return a linear movement function
  // need linear movement;
  this.animateAcross = function(){
    // this algo is not linear.
    // still slow speed towards the tips
    currentPos = vectorAdd(currentPos,vectorMult(vectorSub(vertices[dir].v1, currentPos),velocity));
    // hard coded for test
    // working..
    // needs to have a more concrete solution to change the direction rather than using a counter that counts the updates.
    if(counter == 25){
      dir = Math.abs(dir - 1);
      counter = 0;
    }
    counter++; 
  }
  // this needs to bind x/y to the line
  this.update = function(vertex){
    //binds to line now.
    currentPos = vectorAdd(currentPos,vectorSub(vertex,currentPos));
  } 
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
  post("id: ", id, "vertex1: ", vertex1.x,vertex1.y, "vertex2: ", vertex2.x,vertex2.y, '\n');;

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
};

function outputLineLength(line){
  outlet(line.id, line.getLength());
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
//
function paint(){
  with(mgraphics){
    lineR.paint();
    lineG.paint();
    lineB.paint();
    circleR.paint();
    circleG.paint();
    circleB.paint();
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



function moveCloser(id){
  let vertices = [rgVertex, gbVertex, brVertex];
  var scale = 0.05;
  vertices[id].updateVertex((vertices[id].v1.x - (vertices[id].v1.x * scale)),(vertices[id].v1.y - (vertices[id].v1.y * scale)));
}

// is not crossing the zero point because the of the scale factor.
//
//
// this sucks and needs to go
function moveFarther(id){
  let vertices = [rgVertex, gbVertex, brVertex];
  var scale = 0.05;
  vertices[id].updateVertex((vertices[id].v1.x + (vertices[id].v1.x * scale)),(vertices[id].v1.y + (vertices[id].v1.y * scale)));
}

function moveLeft(id){
  let vertices = [rgVertex, gbVertex, brVertex];
  var scale = 0.04;
  vertices[id].updateVertex((vertices[id].v1.x - (vertices[id].v1.x * scale)), (vertices[id].v1.y));
}

function moveRight(id){
  let vertices = [rgVertex, gbVertex, brVertex];
  var scale = 0.04;
  vertices[id].updateVertex((vertices[id].v1.x + (vertices[id].v1.x * scale)), (vertices[id].v1.y));
}

function moveUp(id){
  let vertices = [rgVertex, gbVertex, brVertex];
  var scale = 0.04;
  vertices[id].updateVertex((vertices[id].v1.x), (vertices[id].v1.y + (vertices[id].v1.y * scale)));
} 

function moveDown(id){
  let vertices = [rgVertex, gbVertex, brVertex];
  var scale = 0.04;
  vertices[id].updateVertex((vertices[id].v1.x), (vertices[id].v1.y - (vertices[id].v1.y * scale)));
}

function rotateVertex(shared_vertex){
  var angle = 0.02;
  // technically doesn't matter what vertex you take from since they are the same. 
  var x = shared_vertex.v1.x;
  var y = shared_vertex.v1.y;
  shared_vertex.updateVertex(((x*Math.cos(angle)) - (y*Math.sin(angle))),((y*Math.cos(angle)) + (x*Math.sin(angle))));
}
//


function update(){
  //rotateVertex(rgVertex);
  //rotateVertex(gbVertex);
  //rotateVertex(brVertex);
  outputLineLength(lineR);
  outputLineLength(lineG);
  outputLineLength(lineB);
  //circleR.update(rgVertex);
  //circleG.update(gbVertex);
  //circleB.update(brVertex);
  circleR.animateAcross();
  circleG.animateAcross();
  circleB.animateAcross();
  mgraphics.redraw();
}

//
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

function onidle(x,y){
}

var index = function(){
}
