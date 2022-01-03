const ParseVid = new URLSearchParams(window.location.search)

Country = ParseVid.get("id"),
	Player = ParseVid.get("player"),

	GetUrlParam = Country;

if (GetUrlParam == null) {
	CategoriesCode = 'animation';
} else {
	CategoriesCode = GetUrlParam;
}

fetch('//tvpeer.github.io/assets/json/categories_list/' + CategoriesCode + '.json')
	.then(function(response) {
		return response.json();
	})
	.then(function(myJson) {
		const jsonData = JSON.parse(JSON.stringify(myJson));
		const arr2 = jsonData.filter(d => d.path_name === Player);
		GetValue = JSON.stringify(arr2)

		if (GetValue == '[]') {
			var UrlPlay = '//tvpeer.github.io/assets/offline_playback/playback.m3u8';
			var LogoChannel = '';
			var NmChannel = '';
			var Cat = '';
		} else {
			const Hasil = JSON.stringify(arr2)
			var UrlPlay = JSON.parse(Hasil)[0].url
			var NmChannel = JSON.parse(Hasil)[0].name
			var CtChannel = JSON.parse(Hasil)[0].categories.name
			var LogoChannel = '//tvpeer.github.io/assets/image/logo/' + JSON.parse(Hasil)[0].path_name + '.png?q=60';
			var Cat = 'Category : ' + '<a href="//tvpeer.github.io/iptv/categories/view/?id=' + CtChannel['slug'] + '"><span class="tag is-primary">' + CtChannel['name'] + '</span></a>';
		}
		document.getElementById("video_player").innerHTML = '<video data-setup=' + "'" + '{"poster":"' + LogoChannel + '"}' + "'" + ' id="video"  width="640" height="360" crossorigin="*" class="video-js vjs-default-skin" data-id="' + UrlPlay + '" preload="none" autoplay controls></video>';
		//logo
		document.getElementById("cn_logo").innerHTML = '<img src="' + LogoChannel + '&w=40&h=40" alt="Placeholder image">';
		//channel name

		document.getElementById("cn_name").innerHTML = NmChannel;
		//kategori
		document.getElementById("cn_category").innerHTML = Cat;

		//LogoChannel
		//
		const script = document.createElement('script');
		script.src = '//tvpeer.github.io/assets/js/playback.js';

		// Append to the `head` element
		document.body.appendChild(script);
	});