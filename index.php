<!DOCTYPE html>
<html>
<head>
<title>Audio Player</title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimal-ui">
<meta name="author" content="Pritesh Pindoria">
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<script src="js/audio.js" type="text/javascript"></script>
 
<link rel="stylesheet" type="text/css" href="css/style.css" />
<link rel="stylesheet" type="text/css" href="/wp-content/themes/insert/css/main.css" /> 

</head>
<body>
<div id="outer-wrapper">
	<div id="main-player">
		<div id="main-player-inner">
			<div id="controls">
				<div id="actionBtns">
					<p id="audio-prev" class="icon previous">Prev</p>
					<p id="audio-play" class="icon play">Play</p>
					<p id="audio-pause" class="icon pause">Pause</p>
					<!--p id="audio-stop">Stop</p-->
					<p id="audio-next" class="icon next">Next</p>
					<div id="ct-track-desc"></div>
				</div>
				<!-- ProgressContainer is appended here --> 
			</div>
			
			<div id="subcontrollers">
				<p id="audio-repeat" class="icon repeat">
					Repeat
					<span class="indictor" id="audiorepeat">0</span>
				</p>
				<p class="icon download downloadSingle" data-url="">Download</p>
				<p class="icon toggleplaylist" style="margin-right: 0;">
					Show/Hide playlist
					<span class="indictor" id="playlistTotal">0</span>
				</p>
			</div>
			<div style="clear:both"></div>
			<a href="#" class="stop_close_player icon close"></a>
		</div>
	</div>
	<div id="audioplaylist">
		<div id="audioplaylist-inner">
			<ul id="playlist"></ul>
			<p id="downloadAll">Download Playlist (zip) <span class="icon download"></span></p>
		</div>
	</div>
</div>

<script type="text/javascript">
	var audioplayer = new AudioPlayer;
	audioplayer.initializeAudioPlayerPlaylist("#playlist");	
</script>
</body>

</html>