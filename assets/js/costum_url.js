
function CopyText(){
      var copyTextareaBtn = document.querySelector('.js-textareacopybtn');
   
      copyTextareaBtn.addEventListener('click', function(event) {
        var copyTextarea = document.querySelector('.js-copytextarea');
        copyTextarea.focus();
        copyTextarea.select();
      
        try {
          var successful = document.execCommand('copy');
          var msg = successful ? 'successful' : 'unsuccessful';
          console.log('Copying text command was ' + msg);
        } catch (err) {
          console.log('Oops, unable to copy');
        }
      });
   };
   

   GetUrlParam = window.location.href;
const UrlPlay="";
   let FormTemplate='<form action="">'+
   '<div class="field is-grouped">'+
   '<div class="control has-icons-left has-icons-right is-expanded">'+
   '<input id="u"  name="u" type="text" class="input is-info is-large" placeholder="paste m3u8 Link Here" value="'+UrlPlay+'">'+
   '<span class="icon is-medium is-left">'+
   '<i class="fa fa-film"></i>'+
   '</span>'+
   '</div>'+
   '<p class="control">'+
   '<button type="submit" class="button is-info is-large">PLAY</button>'+
   '</p>'+
   '</div>'+
    '</form>';

    let CopyTemplate='<hr><h1 class="has-text-centered">Embbed Code</h1><textarea class="js-copytextarea textarea" readonly></textarea><button class="js-textareacopybtn" style="vertical-align:top;">Copy Textarea</button>';

   if(GetUrlParam.endsWith('.m3u8') == true){
      
      

   
   const UrlPlay=decodeURIComponent(GetUrlParam.split("?u=")[1]);
   const LogoChannel='/assets/image/icon/tvpeer_logo.svg';

   
   document.getElementById("video_player").innerHTML = '<video data-setup='+"'"+'{"poster":"'+LogoChannel+'"}'+"'"+' id="video"  width="640" height="360" crossorigin="*" class="video-js vjs-default-skin vjs-4-3" data-id="'+UrlPlay+'" preload="none" autoplay controls></video>';

   document.getElementById("is-null").innerHTML =FormTemplate+CopyTemplate;
   document.querySelector("#u").value=UrlPlay;

   CopyText()
   document.querySelector("#is-null > textarea").value='<iframe width="560" height="315" src="http://tvpeer.github.io/embed/?u='+UrlPlay+'" title="TVpeer Video Player" frameborder="0" allowfullscreen></iframe>';

   const script = document.createElement('script');
   script.src = '/assets/js/playback.js';
   // Append to the `head` element
   document.body.appendChild(script);

   }else{
      history.replaceState('', '', '/iptv/costum-url/');
      console.log('asd '+GetUrlParam);
      document.getElementById("is-null").innerHTML ='<h1 class="has-text-centered">Paste Link Here</h1>'+FormTemplate;

      
   }
