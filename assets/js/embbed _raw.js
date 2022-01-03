



function P2pTracker(url) {

    var IniTracker = ["wss://tracker.openwebtorrent.com", "wss://tracker.files.fm:7073/announce", "wss://tracker.btorrent.xyz", "wss://spacetradersapi-chatbox.herokuapp.com:443/announce", "ws://tracker.files.fm:7072/announce"];
    if (p2pml.hlsjs.Engine.isSupported()) {
        const a = {
            segments: {
                forwardSegmentCount: 50
            },
            loader: {
                cachedSegmentExpiration: 864e5,
                cachedSegmentsCount: 1e3,
                requiredSegmentsPriority: 3,
                httpDownloadMaxPriority: 9,
                httpDownloadProbability: .06,
                httpDownloadProbabilityInterval: 1e3,
                httpDownloadProbabilitySkipIfNoPeers: !0,
                p2pDownloadMaxPriority: 50,
                httpFailedSegmentTimeout: 1e3,
                simultaneousP2PDownloads: 20,
                simultaneousHttpDownloads: 3,
                httpDownloadInitialTimeout: 12e4,
                httpDownloadInitialTimeoutPerSegment: 17e3,
                httpUseRanges: !0,
                trackerAnnounce: IniTracker,
                rtcConfig: {
                    iceServers: [{
                        urls: "stun:stun.l.google.com:19302"
                    }, {
                        urls: "stun:global.stun.twilio.com:3478?transport=udp"
                    }, {
                        urls: "stun:stun.powerpbx.org:3478"
                    }]
                }
            }
        };
        var engine = new p2pml.hlsjs.Engine(a);
        p2pml.hlsjs.initVideoJsHlsJsPlugin();
        var player = videojs("video", {
            html5: {
                hlsjsConfig: {
                    liveSyncDurationCount: 3,
                    loader: engine.createLoaderClass()
                }
            }
        });
        player.src({
            src: url
        })
    } else document.write("Source Not Supported");
    
    
    };
    
    
    var link = document.createElement("link");
    link.href = 'http://cdnjs.cloudflare.com/ajax/libs/video.js/7.6.0/alt/video-js-cdn.min.css';
    link.type = "text/css";
    link.rel = "stylesheet";
    
    document.getElementsByTagName("head")[0].appendChild(link);
    
    
    
    function loadScript(url) {
    return new Promise(function(resolve, reject) {
        let script = document.createElement('script');
        script.src = url;
        script.async = false;
        script.onload = function() {
            resolve(url);
        };
        script.onerror = function() {
            reject(url);
        };
        document.body.appendChild(script);
    });
    }
    
    let scripts = [
    'http://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js',
    'http://cdn.jsdelivr.net/npm/p2p-media-loader-core@latest/build/p2p-media-loader-core.min.js',
    'http://cdn.jsdelivr.net/npm/p2p-media-loader-hlsjs@latest/build/p2p-media-loader-hlsjs.min.js',
    'http://cdnjs.cloudflare.com/ajax/libs/video.js/7.6.0/video.min.js'
    ];
    
    // save all Promises as array
    let promises = [];
    scripts.forEach(function(url) {
    promises.push(loadScript(url));
    });
    
    Promise.all(promises)
    .then(function() {
        console.log('all scripts loaded');
        const urlParams = new URLSearchParams(window.location.search).get("u"),
            GetUrlParam = urlParams,
            OfflinePlayback = "https://dai2.xumo.com/amagi_hls_data_xumo1212A-revryxumo/CDN/master.m3u8";
    
        const div1 = document.getElementById('video');
        const exampleAttr = div1.getAttribute('data-id');
        console.log(exampleAttr)
    
    
    
        if (exampleAttr.endsWith('.m3u8') == true) {
    
    
            async function fetchAsync() {
                let response = await fetch(exampleAttr);
                let data = await response.text();
                return data;
            }
    
    
            const UGs = fetchAsync().then(data => {
                const beverage = (data.search("EXTM3U") == 1) ? exampleAttr : OfflinePlayback;
                console.log(beverage)
                P2pTracker(beverage)
            });
    
    
    
    
        } else {
    
    
            console.log('null')
            P2pTracker(OfflinePlayback)
    
    
        }
    
    
    
    }).catch(function(script) {
        console.log(script + ' failed to load');
    });
        