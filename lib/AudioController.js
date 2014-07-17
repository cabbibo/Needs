
function AudioController(){

  //if( 
 /* try {
    window.AudioContext = window.AudioContext;//||window.webkitAudioContext;
  }catch(e) {
    alert( 'WEB AUDIO API NOT SUPPORTED' );
  }*/
 
  this.ctx      = new AudioContext();

  this.mute = this.ctx.createGain();
  this.gain     = this.ctx.createGain();
  this.analyzer = this.ctx.createAnalyser();

  this.analyzer.frequencyBinCount = 1024;
  this.analyzer.array = new Uint8Array( this.analyzer.frequencyBinCount );

  this.freqByteData = new Uint8Array( this.analyzer.frequencyBinCount );

  this.audioTexture  = new AudioTexture( this );
  
  this.texture = this.audioTexture.texture;

  this.gain.connect( this.analyzer );
  this.analyzer.connect( this.mute );
  this.mute.connect( this.ctx.destination );


  this.notes = [];

}


AudioController.prototype.update = function(){

  this.analyzer.getByteFrequencyData( this.analyzer.array );
  this.analyzer.getByteFrequencyData( this.freqByteData );

  this.audioTexture.update();
  
  for( var i = 0; i < this.notes.length; i++ ){

    this.notes[i].update();

  }

}


