
var LINKS = [];

function Link( params ){


  this.params = _.defaults( params || {} , {

    title:"TITLE",
    description:"This is the area where the description goes",
    videoLink:"https://www.youtube.com/watch?v=-8mzWkuOxz8",

  });



  LINKS.push( this );

}


Link.prototype.updatePhysics = function(){



}

Link.prototype.updatePositions = function(){


}

Link.prototype.onHoverOver = function(){

  this.hovered = true;



}


Link.prototype.onHoverOut = function(){

  this.hovered = false;



}


Link.prototype.onSelected





