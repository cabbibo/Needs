  

      var SOCIAL_MEDIA = [
        ["TWITTER" ,"twitter_1.png" , "http://twitter.com/share?text=New%20interactive%20EP%20from%20@JJ_VERNE%20coded%20by%20@cabbibo%20&url=http://cabbibo.github.io/needs"],
        ["FACEBOOK", "facebook_1.png" , 'http://www.facebook.com/sharer.php?u=http://cabbibo.github.io/needs'],
        ["SOUNDCLOUD" ,"soundcloud_1.png" , "https://soundcloud.com/jj-verne"],
        ["CABBIBO" , "cabbibo_1.png" , "http://cabbibo.com"],
      ]
      

  function addSocialMedia( smArray ){

      this.social = document.createElement('div');
      this.social.id = 'social';
      document.body.appendChild( this.social );

      window.titleEP  = document.createElement('a');
      window.titleEP.href = 'https://soundcloud.com/pinknoiseordinance';
      window.titleEP.target = '_blank';
      window.titleEP.id = 'titleEP';
      window.titleEP.innerHTML = 'JJ VERNE';


      this.social.appendChild( window.titleEP  );

      for( var i  = 0; i < smArray.length; i ++ ){

        var a = document.createElement('a');

        if( i != smArray.length -1 ){
          a.href = smArray[i][2];
          if( i != 0 )
            a.target = '_blank';
        }else{
          a.onClick = "function(){ console.log('hello')}";
          a.id = "information"
        }



        a.style.background = 'url( icons/'+smArray[i][1]+')';
        a.style.backgroundSize = '100%';
        a.style.backgroundSize ="25px";
        a.style.backgroundPosition="center";
        a.style.backgroundRepeat="no-repeat";
        a.classList.add( 'social' );
        a.INFO_TEXT = smArray[i][0];

        this.social.appendChild( a );

      }


      $('.social').hover( function( e ){
        console.log( 'mouseasdasd');
        if( e.type == 'mouseenter' ){
          console.log('asfasfdddssddssd');
          titleEP.innerHTML = e.toElement.INFO_TEXT;
        }else{
          titleEP.innerHTML = 'JJ VERNE';
        }
      });
}


