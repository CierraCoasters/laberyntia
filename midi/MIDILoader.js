// Original source (heavily modified) and dependencies: https://surikov.github.io/webaudiofont/

// Add required libraries
(function () {
	// Obtain this script's base path (Source: https://stackoverflow.com/questions/2161159/get-script-path)
	let scripts = document.getElementsByTagName('script');
	let thisBase = scripts[scripts.length-1].src.split('?')[0].split('/').slice(0, -1).join('/')+'/'; // Remove query arguments and filename

	function dynamicallyLoadScript(url) {
		var script = document.createElement("script");
		script.src = url;
		document.head.appendChild(script);
	}
	dynamicallyLoadScript(thisBase + 'WebAudioFontPlayer.js');
	dynamicallyLoadScript(thisBase + 'MIDIFile.js');
})();

// MIDI functionality (wrapped in function to control scope)
(function () {
	var loadedSongs = [];
	var currentSong = null;
	var isPlaying = false;
	const stepDuration = 44 / 1000;
	
	function startPlay(path) {
		if (currentSong != null) loadedSongs[currentSong].audioContext.suspend();
		currentSong = path;
		loadedSongs[path].player.cancelQueue(loadedSongs[path].audioContext);
		loadedSongs[path].currentSongTime = 0;
		loadedSongs[path].songStart = loadedSongs[path].audioContext.currentTime;
		loadedSongs[path].nextStepTime = loadedSongs[path].audioContext.currentTime;
		loadedSongs[path].audioContext.resume();
		isPlaying = true;
		tick(path);
	}
	function tick(path) {
		if (loadedSongs[path].audioContext.currentTime > loadedSongs[path].nextStepTime - stepDuration) {
			sendNotes(path, loadedSongs[path].songStart, loadedSongs[path].currentSongTime, loadedSongs[path].currentSongTime + stepDuration);
			loadedSongs[path].currentSongTime = loadedSongs[path].currentSongTime + stepDuration;
			loadedSongs[path].nextStepTime = loadedSongs[path].nextStepTime + stepDuration;
			if (loadedSongs[path].currentSongTime > loadedSongs[path].song.duration) {
				loadedSongs[path].currentSongTime = loadedSongs[path].currentSongTime - loadedSongs[path].song.duration;
				sendNotes(path, loadedSongs[path].songStart, 0, loadedSongs[path].currentSongTime);
				loadedSongs[path].songStart = loadedSongs[path].songStart + loadedSongs[path].song.duration;
			}
		}
		window.requestAnimationFrame(function (t) {
			tick(path);
		});
	}
	function sendNotes(path, songStart, start, end) {
		for (var t = 0; t < loadedSongs[path].song.tracks.length; t++) {
			var track = loadedSongs[path].song.tracks[t];
			for (var i = 0; i < track.notes.length; i++) {
				if (track.notes[i].when >= start && track.notes[i].when < end) {
					var when = loadedSongs[path].songStart + track.notes[i].when;
					var duration = track.notes[i].duration;
					if (duration > 3) {
						duration = 3;
					}
					var instr = track.info.variable;
					var v = track.volume / 7;
					loadedSongs[path].player.queueWaveTable(loadedSongs[path].audioContext, loadedSongs[path].input, window[instr], when, track.notes[i].pitch, duration, v, track.notes[i].slides);
				}
			}
		}
		for (var b = 0; b < loadedSongs[path].song.beats.length; b++) {
			var beat = loadedSongs[path].song.beats[b];
			for (var i = 0; i < beat.notes.length; i++) {
				if (beat.notes[i].when >= start && beat.notes[i].when < end) {
					var when = songStart + beat.notes[i].when;
					var duration = 1.5;
					var instr = beat.info.variable;
					var v = beat.volume / 2;
					loadedSongs[path].player.queueWaveTable(loadedSongs[path].audioContext, loadedSongs[path].input, window[instr], when, beat.n, duration, v);
				}
			}
		}
	}
	function startLoad(path,song, autoplay, ) {
		console.log(song);
		var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
		let audioContext = new AudioContextFunc();
		let player = new WebAudioFontPlayer();
	
		let equalizer = player.createChannel(audioContext);
		let reverberator = player.createReverberator(audioContext);
		let input = equalizer.input;
		equalizer.output.connect(reverberator.input);
		reverberator.output.connect(audioContext.destination);
	
		for (let i = 0; i < song.tracks.length; i++) {
			let nn = player.loader.findInstrument(song.tracks[i].program);
			let info = player.loader.instrumentInfo(nn);
			song.tracks[i].info = info;
			song.tracks[i].id = nn;
			player.loader.startLoad(audioContext, info.url, info.variable);
		}
		for (let i = 0; i < song.beats.length; i++) {
			let nn = player.loader.findDrum(song.beats[i].n);
			let info = player.loader.drumInfo(nn);
			song.beats[i].info = info;
			song.beats[i].id = nn;
			player.loader.startLoad(audioContext, info.url, info.variable);
		}
	
		loadedSongs[path] = {
			'song': song,
			'audioContext': audioContext,
			'player': player,
			'equalizer': equalizer,
			'reverberator': reverberator,
			'input': input,
			'songStart': 0,
			'currentSongTime': 0,
			'nextStepTime': 0,
		};
	
		player.loader.waitLoad(function () {
			resetEqualizer(path);
			if (autoplay) startPlay(path);
		});
	}
	function resetEqualizer(path){
		loadedSongs[path].equalizer.band32.gain.setTargetAtTime(2,0,0.0001);
		loadedSongs[path].equalizer.band64.gain.setTargetAtTime(2,0,0.0001);
		loadedSongs[path].equalizer.band128.gain.setTargetAtTime(1,0,0.0001);
		loadedSongs[path].equalizer.band256.gain.setTargetAtTime(0,0,0.0001);
		loadedSongs[path].equalizer.band512.gain.setTargetAtTime(-1,0,0.0001);
		loadedSongs[path].equalizer.band1k.gain.setTargetAtTime(5,0,0.0001);
		loadedSongs[path].equalizer.band2k.gain.setTargetAtTime(4,0,0.0001);
		loadedSongs[path].equalizer.band4k.gain.setTargetAtTime(3,0,0.0001);
		loadedSongs[path].equalizer.band8k.gain.setTargetAtTime(-2,0,0.0001);
		loadedSongs[path].equalizer.band16k.gain.setTargetAtTime(2,0,0.0001);
	}
	function loadMidi(path,autoplay) {
		if (path in loadedSongs) {
			if (autoplay) startPlay(path);
			return;
		}
		console.log(path);
		var xmlHttpRequest = new XMLHttpRequest();
		xmlHttpRequest.open("GET", path, true);
		xmlHttpRequest.responseType = "arraybuffer";
		xmlHttpRequest.onload = function (e) {
			var arrayBuffer = xmlHttpRequest.response;
			var midiFile = new MIDIFile(arrayBuffer);
			var song = midiFile.parseSong();
			startLoad(path,song,autoplay);
		};
		xmlHttpRequest.send(null);
	}
	function pauseResumeMidi () {
		if (isPlaying)
			pauseMidi();
		else
			resumeMidi();
	}
	function pauseMidi () {
		if (currentSong == null) return;
		loadedSongs[currentSong].audioContext.suspend();
		isPlaying = false;
	}
	function resumeMidi () {
		if (currentSong == null) return;
		loadedSongs[currentSong].audioContext.resume();
		isPlaying = true;
	}
	function stopMidi () {
		if (currentSong == null) return;
		pauseMidi();
		currentSong = null;
	}

	// Expose public functions
	window.midiLoad = loadMidi;
	window.midiPauseToggle = pauseResumeMidi;
	window.midiPause = pauseMidi;
	window.midiResume = resumeMidi;
	window.midiStop = stopMidi;
	window.currentMidi = function () {return currentSong;}
})();