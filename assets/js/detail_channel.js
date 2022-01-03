   const ParseVid=new URLSearchParams(window.location.search)
    
   Player=ParseVid.get("player"),
   
   GetUrlParam=Player;

if(GetUrlParam==null){
   CountryCode='ID';
}else{
   CountryCode=GetUrlParam;
}

fetch('//tvpeer.github.io/assets/json/channel_list/allchannel.json')
.then(function(response) {
 return response.json();
})
.then(function(myJson) {
 const jsonData = JSON.parse(JSON.stringify(myJson));
const arr2 = jsonData.filter(d => d.path_name === Player);
GetValue=JSON.stringify(arr2)


if(GetValue=='[]'){
 
var UrlPlay='//tvpeer.github.io/assets/offline_playback/playback.m3u8';
var LogoChannel='';
var NmChannel='';
var Cat = '';

}else{
 const Hasil = JSON.stringify(arr2)
 var UrlPlay=JSON.parse(Hasil)[0].url
 var NmChannel=JSON.parse(Hasil)[0].name
 var CountryChannel=JSON.parse(Hasil)[0].countries

 var LogoChannel='//i0.wp.com/tvpeer.github.io/assets/image/logo/'+JSON.parse(Hasil)[0].path_name+'.png?q=60';


 const ValCategory = JSON.parse(JSON.stringify(JSON.parse(Hasil)[0].categories));

 

 let text_country = "";
let i_country;
 for (i_country = 0; i_country < CountryChannel.length; i_country++) {

   text_country += ' <a href="/iptv/country/view/?id='+CountryChannel[i_country]['code']+'"><span class="tag is-primary">'+CountryChannel[i_country]['name']+'</span></a>';

}

var Country = 'Avaliable Country : '+text_country;
var Cat = 'Category : <a href="/iptv/categories/view/?id='+ValCategory['slug']+'"><span class="tag is-primary">'+ValCategory['name']+'</span></a>';


}




 document.getElementById("video_player").innerHTML = '<video data-setup='+"'"+'{"poster":"'+LogoChannel+'"}'+"'"+' id="video"  width="640" height="360" crossorigin="*" class="video-js vjs-default-skin" data-id="'+UrlPlay+'" preload="none" autoplay controls></video>';
 //logo
 document.getElementById("cn_logo").innerHTML ='<img src="'+LogoChannel+'&w=40&h=40" alt="Placeholder image">';
  //channel name
  
  document.getElementById("cn_name").innerHTML =NmChannel;
  //kategori
  document.getElementById("cn_category").innerHTML =Cat;
//country
document.getElementById("cn_country").innerHTML =Country;

 //LogoChannel
 //
 const script = document.createElement('script');
script.src = '/assets/js/playback.js';

// Append to the `head` element
document.body.appendChild(script);
 

});