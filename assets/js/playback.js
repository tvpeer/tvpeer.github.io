
        const GetVidData = document.getElementById('video').getAttribute('data-id');
        const urlParams = new URLSearchParams(window.location.search).get("debug");
        const ShowDebug = (urlParams=="true"||urlParams==0) ? true : false;

        const OfflinePlayback = "//tvpeer.github.io/assets/offline_playback/playback.m3u8";
     
 function p2pmlConfig(url){
         if (p2pml.hlsjs.Engine.isSupported()) {
          const config = {
              loader: {
                  trackerAnnounce:["wss://spacetradersapi-chatbox.herokuapp.com/announce","wss://tracker.openwebtorrent.com","wss://tracker.openwebtorrent.com:443/announce","wss://tracker.openwebtorrent.com", "wss://tracker.files.fm:7073/announce", "wss://tracker.btorrent.xyz", "wss://spacetradersapi-chatbox.herokuapp.com:443/announce", "ws://tracker.files.fm:7072/announce"]
                  ,
                  rtcConfig: {
                      iceServers: [{
                              urls: "stun:stun.l.google.com:19302"
                          },
                          {
                              urls: "stun:global.stun.twilio.com:3478?transport=udp"
                          },
                          {
                         urls: "stun:stun.powerpbx.org:3478"
                     }
                      ]
                  }
              }
          };
      
          const engine = new p2pml.hlsjs.Engine(config);
      
          if(ShowDebug==true){
            engine.on("peer_connect", peer => console.log("peer_connect", peer.id, peer.remoteAddress));
            engine.on("peer_close", peerId => console.log("peer_close", peerId));
            engine.on("segment_loaded", (segment, peerId) => console.log("segment_loaded from", peerId ? `peer ${peerId}` : "HTTP", segment.url));  
          }
      
          var player = videojs("video", {
              html5: {
                  hlsjsConfig: {
                      liveSyncDurationCount: 7, // To have at least 7 segments in queue
                      loader: engine.createLoaderClass(),
                  },
              },
          });
      
          p2pml.hlsjs.initVideoJsContribHlsJsPlayer(player);
      
          player.src({
              src: url,
              type: "application/x-mpegURL",
          });
      
          player.ready(function() {
              player.volume(1); // 1%
          });
      } else {
          document.write("Not supported :(");
      }
    };
 
 
    if (GetVidData.endsWith('.m3u8') == true||GetVidData!=null) {
     
     
     async function fetchAsync() {
         let response = await fetch(GetVidData);
         let data = await response.text();
         return data;
     }
 
 
     const UGs = fetchAsync().then(data => {
         const beverage = (data.search("EXTM3U") == 1) ? GetVidData : OfflinePlayback;
         p2pmlConfig(beverage)
     });
 } else {
     p2pmlConfig(OfflinePlayback)
 }
 