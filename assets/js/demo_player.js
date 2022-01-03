var GlobalVideo = "//tvpeer.github.io/assets/open_movie/index.m3u8";
var CostumConfig= {
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
};
function waitForGlobalObject(objectName, objectNextName) {
	return new Promise((resolve) => {
		function check() {
			if (
				window[objectName] !== undefined &&
				(objectNextName === undefined || window[objectName][objectNextName] !== undefined)
			) {
				resolve();
			} else {
				setTimeout(check, 200);
			}
		}

		check();
	});
}

function waitForModule(moduleName) {
	return new Promise((resolve) => {
		function check() {
			try {
				resolve(require(moduleName));
			} catch (e) {
				setTimeout(check, 200);
			}
		}

		check();
	});
}

function loadScript(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.type = "text/javascript";
		script.onload = () => {
			resolve();
		};
		script.onerror = () => {
			console.log("Failed to load script", src);
			reject();
		};
		script.src = src;
		document.head.appendChild(script);
	});
}



class DemoApp {
	async init() {
		await waitForGlobalObject("p2pml", "core");

		this.isP2PSupported = p2pml.core.HybridLoader.isSupported();
		if (!this.isP2PSupported) {
			document.querySelector("#error-webrtc-data-channels").classList.remove("hide");
		}
		this.liveSyncDurationCount = 7;

		this.initForm();

		this.videoUrl = GlobalVideo;
		this.playerType = 'clappr';
		this.videoContainer = document.getElementById("video_container");

		this.loadSpeedTimespan = 10; // seconds

		const P2PGraphClass = await waitForModule("p2p-graph");
		this.graph = new P2PGraphClass("#graph");
		this.graph.add({
			id: "me",
			name: "You",
			me: true
		});

		await waitForGlobalObject("Rickshaw");
		this.initChart();

		this.restartDemo();
	}

	initForm() {
		var form = document.getElementById("videoUrlForm");
		var params = new URLSearchParams(document.location.search);

		var value = GlobalVideo;
		if (value) {
			value = value;
		}
	}

	async restartDemo() {
		this.downloadStats = [];
		this.downloadTotals = {
			http: 0,
			p2p: 0
		};
		this.uploadStats = [];
		this.uploadTotal = 0;

		while (this.videoContainer.hasChildNodes()) {
			this.videoContainer.removeChild(this.videoContainer.lastChild);
		}

		const config = {
			segments: {
				swarmId: this.swarmId,
			},
			loader: CostumConfig,
		};

		if (this.trackers) {
			config.loader.trackerAnnounce = this.trackers;
		}

		switch (this.playerType) {
			case "clappr":
			case "plyr":
				await loadScript("//cdnjs.cloudflare.com/ajax/libs/hls.js/8.0.0-beta.3/hls.min.js");

				if (!Hls.isSupported()) {
					document.querySelector("#error-hls-js").classList.remove("hide");
				}

				await loadScript(URL_P2P_MEDIA_LOADER_HLSJS);
				this.engine = this.isP2PSupported ? new p2pml.hlsjs.Engine(config) : undefined;
				break;
			default:
				console.error("Unexpected player type: ", this.playerType);
				return;
		}

		switch (this.playerType) {
			case "clappr":
				this.initClapprPlayer();
				break;

		}

		if (this.isP2PSupported) {
			this.engine.on(p2pml.core.Events.PieceBytesDownloaded, this.onBytesDownloaded.bind(this));
			this.engine.on(p2pml.core.Events.PieceBytesUploaded, this.onBytesUploaded.bind(this));

			var trackerAnnounce = this.engine.getSettings().loader.trackerAnnounce;
			if (Array.isArray(trackerAnnounce)) {
				document.getElementById("announce").innerHTML = trackerAnnounce.join("<br />");
			}
		}

		this.refreshChart();
		this.refreshGraph();
	}

	async initHlsJsPlayer() {
		if (!Hls.isSupported()) {
			return;
		}
		var video = document.createElement("video");
		video.id = "video";
		video.volume = 0;
		video.setAttribute("playsinline", "");
		video.setAttribute("muted", "");
		video.setAttribute("autoplay", "");
		video.setAttribute("controls", "");
		this.videoContainer.appendChild(video);

		var level = document.createElement("select");
		level.id = "level";
		level.classList.add("form-control");
		this.videoContainer.appendChild(level);

		var hls = new Hls({
			liveSyncDurationCount: this.liveSyncDurationCount,
			loader: this.isP2PSupported ? this.engine.createLoaderClass() : Hls.DefaultConfig.loader,
		});

		if (this.isP2PSupported) {
			p2pml.hlsjs.initHlsJsPlayer(hls);
		}

		hls.loadSource(this.videoUrl);
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED, () => {
			this.hlsLevelSwitcher.init(hls, level);
		});
	}

	async initClapprPlayer(isShaka) {
		const scriptsPromise = (async () => {
			await loadScript("https://cdn.jsdelivr.net/npm/clappr@latest");
			await loadScript(
				"https://cdn.jsdelivr.net/gh/clappr/clappr-level-selector-plugin@latest/dist/level-selector.min.js"
			);
		})();

		var outer = document.createElement("div");
		outer.className = "embed-responsive embed-responsive-16by9";
		var video = document.createElement("div");
		video.id = "video";
		video.className = "embed-responsive-item";
		outer.appendChild(video);
		this.videoContainer.appendChild(outer);

		var setup = {
			parentId: "#video",
			plugins: [],
			source: this.videoUrl,
			width: "100%",
			height: "100%",
			muted: false,
			mute: false,
			autoPlay: false,
			playback: {
				playInline: false,
			},
		};

		if (isShaka) {
			await scriptsPromise;
			await loadScript(
				"https://cdn.jsdelivr.net/gh/clappr/dash-shaka-playback@latest/dist/dash-shaka-playback.external.js"
			);
			setup.plugins.push(DashShakaPlayback);
			setup.shakaOnBeforeLoad = (shakaPlayerInstance) => {
				if (this.isP2PSupported) {
					this.engine.initShakaPlayer(shakaPlayerInstance);
				}
			};
		} else {
			setup.playback.hlsjsConfig = {
				liveSyncDurationCount: this.liveSyncDurationCount,
				loader: this.isP2PSupported ?
					this.engine.createLoaderClass() :
					Hls.DefaultConfig.loader,
			};
		}

		await scriptsPromise;

		setup.plugins.push(LevelSelector);

		var player = new Clappr.Player(setup);

		if (!isShaka && this.isP2PSupported) {
			p2pml.hlsjs.initClapprPlayer(player);
		}
	}
	initChart() {
		var chartConf = {
			element: document.querySelector("#chart"),
			renderer: "multi",
			interpolation: "basis",
			stack: false,
			min: "auto",
			strokeWidth: 1,
			series: [{
					name: "Upload P2P",
					color: "#88eab9",
					data: [],
					renderer: "area"
				},
				{
					name: " - P2P",
					color: "#88b9ea",
					data: [],
					renderer: "area"
				},
				{
					name: " - HTTP",
					color: "#eae288",
					data: [],
					renderer: "area"
				},
				{
					name: "Download",
					color: "#f64",
					data: [],
					renderer: "line"
				},
			],
		};

		this.chart = new Rickshaw.Graph(chartConf);

		new Rickshaw.Graph.Axis.X({
			graph: this.chart,
			tickFormat: () => "",
		});

		new Rickshaw.Graph.Axis.Y({
			graph: this.chart,
			orientation: "left",
			element: document.getElementById("y_axis"),
		});

		this.legend = new Rickshaw.Graph.Legend({
			graph: this.chart,
			element: document.getElementById("legend"),
		});

		this.legendTotals = new Rickshaw.Graph.Legend({
			graph: this.chart,
			element: document.getElementById("legend-totals"),
		});

		this.chart.render();
		setInterval(this.updateChartData.bind(this), 500);

		var chartResize = () => {
			chartConf.width = this.chart.element.clientWidth;
			this.chart.configure(chartConf);
			this.chart.render();
		};

		chartResize();
		window.addEventListener("resize", chartResize);
	}

	refreshChart() {
		if (!this.chart) {
			return;
		}

		var data0 = this.chart.series[0].data;
		var data1 = this.chart.series[1].data;
		var data2 = this.chart.series[2].data;
		var data3 = this.chart.series[3].data;
		var lastX = data0.length > 0 ? data0[data0.length - 1].x : -1;

		var seriesDataMapper = (currentValue, index) => ({
			x: index + lastX + 1,
			y: 0
		});

		data0.length = 0;
		data1.length = 0;
		data2.length = 0;
		data3.length = 0;

		var stubData = Array.apply(null, Array(200)).map(seriesDataMapper);
		data0.push.apply(data0, stubData.slice(0));
		data1.push.apply(data1, stubData.slice(0));
		data2.push.apply(data2, stubData.slice(0));
		data3.push.apply(data3, stubData.slice(0));

		this.chart.update();
	}

	updateChartData() {
		var downloadSpeed = this.getDownloadSpeed();
		var http = Number(((downloadSpeed.http * 8) / 1000000).toFixed(2));
		var p2p = Number(((downloadSpeed.p2p * 8) / 1000000).toFixed(2));
		var total = Number((http + p2p).toFixed(2));
		var upload = Number((this.getUploadSpeed() * 8) / 1000000).toFixed(2);

		var data0 = this.chart.series[0].data;
		var data1 = this.chart.series[1].data;
		var data2 = this.chart.series[2].data;
		var data3 = this.chart.series[3].data;
		var x = data0.length > 0 ? data0[data0.length - 1].x + 1 : 0;

		data0.shift();
		data1.shift();
		data2.shift();
		data3.shift();
		data0.push({
			x: x,
			y: -upload
		});
		data1.push({
			x: x,
			y: total
		});
		data2.push({
			x: x,
			y: http
		});
		data3.push({
			x: x,
			y: total
		});
		this.chart.update();

		this.formatChartLegendLine(0, total);
		this.formatChartLegendLine(1, http);
		this.formatChartLegendLine(2, p2p);
		this.formatChartLegendLine(3, upload);

		this.updateLegendTotals();
	}

	formatChartLegendLine(index, speed) {
		if (this.legend) {
			var line = this.legend.lines[index];
			line.element.childNodes[1].textContent = line.series.name + " - " + speed + " Mbit/s";
		}
	}

	updateLegendTotals() {
		if (!this.legendTotals) {
			return;
		}

		var httpMb = this.downloadTotals.http / 1048576;
		var p2pMb = this.downloadTotals.p2p / 1048576;
		var totalMb = httpMb + p2pMb;
		var uploadMb = this.uploadTotal / 1048576;

		if (totalMb != 0) {
			this.legendTotals.lines[0].element.childNodes[1].textContent =
				"Download - " + Number(totalMb).toFixed(1) + " MiB";

			this.legendTotals.lines[1].element.childNodes[1].textContent =
				" - HTTP - " +
				Number(httpMb).toFixed(1) +
				" MiB - " +
				Number((httpMb * 100) / totalMb).toFixed(0) +
				"%";

			this.legendTotals.lines[2].element.childNodes[1].textContent =
				" - P2P - " +
				Number(p2pMb).toFixed(1) +
				" MiB - " +
				Number((p2pMb * 100) / totalMb).toFixed(0) +
				"%";

			this.legendTotals.lines[3].element.childNodes[1].textContent =
				"Upload P2P - " + Number(uploadMb).toFixed(1) + " MiB";
		}
	}

	getDownloadSpeed() {
		var startingPoint = performance.now() - this.loadSpeedTimespan * 1000;
		var httpSize = 0;
		var p2pSize = 0;

		var i = this.downloadStats.length;
		while (i--) {
			var stat = this.downloadStats[i];
			if (stat.timestamp < startingPoint) {
				break;
			}

			if (stat.method === "p2p") {
				p2pSize += stat.size;
			} else if (stat.method === "http") {
				httpSize += stat.size;
			}
		}

		this.downloadStats.splice(0, i + 1);

		return {
			p2p: p2pSize / this.loadSpeedTimespan,
			http: httpSize / this.loadSpeedTimespan
		};
	}

	getUploadSpeed() {
		var startingPoint = performance.now() - this.loadSpeedTimespan * 1000;
		var size = 0;

		var i = this.uploadStats.length;
		while (i--) {
			var stat = this.uploadStats[i];
			if (stat.timestamp < startingPoint) {
				break;
			}

			size += stat.size;
		}

		this.uploadStats.splice(0, i + 1);

		return size / this.loadSpeedTimespan;
	}

	onBytesDownloaded(method, size) {
		this.downloadStats.push({
			method: method,
			size: size,
			timestamp: performance.now()
		});
		this.downloadTotals[method] += size;
	}

	onBytesUploaded(method, size) {
		this.uploadStats.push({
			size: size,
			timestamp: performance.now()
		});
		this.uploadTotal += size;
	}

	refreshGraph(p2pLoader) {
		if (!this.graph) {
			return;
		}

		var nodes = this.graph.list();
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].id !== "me") {
				this.graph.disconnect("me", nodes[i].id);
				this.graph.remove(nodes[i].id);
			}
		}

		if (this.isP2PSupported) {
			this.engine.on(p2pml.core.Events.PeerConnect, this.onPeerConnect.bind(this));
			this.engine.on(p2pml.core.Events.PeerClose, this.onPeerClose.bind(this));
		}
	}

	onPeerConnect(peer) {
		if (!this.graph.hasPeer(peer.id)) {
			this.graph.add({
				id: peer.id,
				name: peer.remoteAddress || "Unknown"
			});
			this.graph.connect("me", peer.id);
		}
	}

	onPeerClose(id) {
		if (this.graph.hasPeer(id)) {
			this.graph.disconnect("me", id);
			this.graph.remove(id);
		}
	}

	constructor() {
		this.hlsLevelSwitcher = {
			auto: "Auto",
			hls: undefined,
			select: undefined,

			init: function(hls, select) {
				if (hls.levelController.levels.length < 2) {
					select.style.display = "none";
					return;
				} else {
					select.style.display = "block";
				}

				this.hls = hls;
				this.select = select;

				this._clearOptions();
				this._addOption(this.auto);
				hls.levelController.levels.forEach((e, i) => {
					var name = [];
					if (e.height) {
						name.push(e.height + "p");
					}
					if (e.bitrate) {
						name.push(Math.round(e.bitrate / 1000) + "k");
					}
					if (name.length === 0) {
						name.push("Quality #" + i);
					}
					this._addOption(name.join(" / "), i);
				});

				hls.on(Hls.Events.LEVEL_SWITCHED, this._hlsLevelSwitch.bind(this));

				this.select.addEventListener("change", (event) => {
					hls.nextLevel = event.target.selectedIndex - 1;
					this._hlsLevelSwitch();
				});
			},

			_hlsLevelSwitch: function() {
				var auto = this.select.querySelector("option:not([data-index])");
				var curr = this.select.querySelector(
					"option[data-index='" + this.hls.currentLevel + "']"
				);
				if (this.hls.autoLevelEnabled || this.hls.currentLevel === -1) {
					auto.selected = true;
					auto.text = curr ? curr.text + " (" + this.auto + ")" : this.auto;
				} else {
					curr.selected = true;
					auto.text = this.auto;
				}
			},

			_clearOptions: function() {
				while (this.select.options.length) {
					this.select.remove(0);
				}
			},

			_addOption: function(text, index) {
				var option = document.createElement("option");
				option.text = text;
				if (index !== undefined) {
					option.dataset.index = index;
				}
				this.select.add(option);
			},
		};

		this.shakaLevelSwitcher = {
			auto: "Auto",
			player: undefined,
			select: undefined,

			init: function(player, select) {
				this.player = player;
				this.select = select;

				player.addEventListener("trackschanged", () => {
					this._clearOptions();
					this._addOption(this.auto);
					this.player.getVariantTracks().forEach((e, i) => {
						var name = [];

						if (e.height) {
							name.push(e.height + "p");
						}

						if (e.bandwidth) {
							name.push(Math.round(e.bandwidth / 1000) + "k");
						}

						if (e.label) {
							name.push(e.label);
						} else if (e.language) {
							name.push(e.language);
						}

						if (name.length === 0) {
							name.push("Variant #" + i);
						}

						this._addOption(name.join(" / "), e.id);
					});
				});

				player.addEventListener("adaptation", () => {
					var variantId = this.player.getVariantTracks().find((i) => i.active === true).id;
					var curr = this.select.querySelector("option[data-variant-id='" + variantId + "']");
					var auto = this.select.querySelector("option:not([data-variant-id])");
					auto.text = curr ? curr.text + " (" + this.auto + ")" : this.auto;
				});

				select.addEventListener("change", () => {
					var variantId = this.select.selectedOptions[0].dataset.variantId;
					if (variantId) {
						var variant = this.player.getVariantTracks().find((i) => i.id == variantId);
						this.player.configure({
							abr: {
								enabled: false
							}
						});
						this.player.selectVariantTrack(variant);
						var auto = this.select.querySelector("option:not([data-variant-id])");
						auto.text = this.auto;
					} else {
						this.player.configure({
							abr: {
								enabled: true
							}
						});
					}
				});
			},

			_clearOptions: function() {
				while (this.select.options.length) {
					this.select.remove(0);
				}
			},

			_addOption: function(text, variantId) {
				var option = document.createElement("option");
				option.text = text;
				if (variantId) {
					option.dataset.variantId = variantId;
				}
				this.select.add(option);
			},
		};
	}
}

window.demo = new DemoApp();
window.demo.init();