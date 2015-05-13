/*
API name: Audio player
Author: Pritesh Pindoria

Description: Audio Player allows your audio to play .MP3 or .OGG seamlessy while browsering through your site. It is mobile friendly. It uses FRAMESETs to do this and the api allows you to add tracks to the player at any time, appending to an existing playlist. It has a progress Bar, Buffer bar, Play, Pause, Next, Prev, and Repeat functionality. The player's look and feel can be customised to your sites stylesheet and allows you to pull thorugh your stylesheet to the player.
Version: 1
License:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

AudioPlayer = function (){
	 
	 $downloadZippedTracks = [];
	 
	 $myPlaylist = [];
	 
	 $PlayerBaseHeight = 47;
	  
	 /* $animationSlide is boolean to either animate the frame resize action - toggle Frame functions */
	 $animationSlide = false;
	 $animationScrollingTitle = false;
	 
	 /*
	 *	repeatType 0 = repeat nothing
	 *	repeatType 1 = current track
	 *	repeatType 2 = current playlist
	 */
	 repeatArray = [0,1,2];
	 
	 /* set initial repeat mode and hide repear indictor */
	 var repeatType = repeatArray[0];
	 $(".indictor#audiorepeat").hide();
	 
	 /* Initial Playerlist on after page has loaded */
	 this.initializeAudioPlayerPlaylist = function(playlist_id){
		 	if ($myPlaylist.length <=0){
		 		/* Load tracks that are hard-coded on the audioplayer/index.php
		 		 * Not rarely used
		 		 */
			 	$(playlist_id + " li").each(function(){
					var song = new Object;
					song.url = $(this).attr("data-url");
					song.name = $(this).text();
					
					$myPlaylist.push(song);
				});
			}else{
				var song = new Object;
					song.url = $("#playlist li:last").attr("data-url");
					song.name = $("#playlist li:last").text();
					$myPlaylist.push(song);
		 	}
		 	
		 	/* if player is not initialised then request it now */
			if (typeof $myPlayer == 'undefined'){
				this.initializeAudioPlayer($myPlaylist);
			}
	}
	
	this.initializeAudioPlayer = function ($myPlaylist){

		/*  New Audio Global variable */ 
		$myPlayer = new Audio ();
		$myPlayer.src = $myPlaylist[0].url;
		$myPlayer.currentTrack = 0;
		$myPlayer.load();
		
		/* Apply listener when current playing track ends */
		$myPlayer.addEventListener("ended", function() 
		{
		  /* set top window title */
		  if (top.document.title.indexOf("\u25B6") > -1){
				top.document.title = top.document.title.substring(2, top.document.title.length);
		  }
		  
		  /* What happens when track finishes - Act accordingly to what the repeat mode is */
		  if ($myPlayer.currentTrack < ($myPlaylist.length-1)){
		  		if (repeatType == 0 || repeatType == 2)
		  			audioplayer.playNextTrack(String(Number($myPlayer.currentTrack)+1), $myPlayer, $myPlaylist);
		  		if (repeatType == 1)
		  			audioplayer.playNextTrack(String(Number($myPlayer.currentTrack)), $myPlayer, $myPlaylist);
		  }else{
		  	  if (repeatType == 1){
		  			audioplayer.playNextTrack(String(Number($myPlayer.currentTrack)), $myPlayer, $myPlaylist);
		  	  }else{
		  	  	  if (repeatType == 2) {
			  	  	  audioplayer.playNextTrack("0", $myPlayer, $myPlaylist);
		  	  	  }else{
		  	  	  	/* Do nothing if repeat is off and no further tracks to play */
			  	  	//console.log("No more tracks to play");
			  	  }
		  	  }
			  
		  }
		}, false);
		
		/* 
		* Add listener to start buffer and create progress tracker function as soon as audio meta data is loaded 
		* Auto play track as soon as possible	
		*/
		$myPlayer.addEventListener("loadedmetadata", function(){
			audioplayer.createProgressBar();
			audioplayer.runBufferBar();
			audioplayer.runProgressBar();
			
			audioplayer.autoPlay($myPlayer, $myPlaylist);
			
			if($myPlayer.paused){
				//console.log("Current track:" + $myPlaylist[$myPlayer.currentTrack].name + " (" + $myPlaylist[$myPlayer.currentTrack].url + ") - Stopped");
				if (top.document.title.indexOf("\u25B6") > -1){
					top.document.title = top.document.title.substring(2, top.document.title.length);
				}
			}
			//else{
				//console.log("Playing next track: " + $myPlaylist[$myPlayer.currentTrack].name + " (" + $myPlaylist[$myPlayer.currentTrack].url + ") - Duration: " + $myPlayer.duration);	
			//}
			
		}, false);
		
		/* Add listener to when track is playing */
		$myPlayer.addEventListener("playing", function(){
			$("#audio-play").hide();
			$("#audio-pause").show();
			audioplayer.runBufferBar();
			audioplayer.runProgressBar();
		});
		
		/* Add listener to when track is paused */
		$myPlayer.addEventListener("pause", function(){
			$("#audio-pause").hide();
			$("#audio-play").show();
		});
		
	}
	
	this.generate_random_id = function(){
		return "audio_player_" + new Date().getTime();
	}
	
	this.check_or_assign_audio_id_cookie = function (){
	  $audio_player_cookie = getCookie("audio_player_id");
	  if ($audio_player_cookie == ""){
	  	setCookie("audio_player_id",this.generate_random_id(),1);
	  }	
	}
	
	this.check_other_audio_player_cookie = function (){
		$audio_player_cookie = getCookie("audio_player_status");
		if ($audio_player_cookie == "playing"){
			console.log("Player already playing.");
		}
	}
	
	/* Centralised play function */
	this.trackPlay = function ($myPlayer){
		$myPlayer.play();
		$("#playlist li").removeClass("current");
		$("#playlist li").eq($myPlayer.currentTrack).addClass("current");
		$("#ct-track-desc").html("<p>"+$myPlaylist[$myPlayer.currentTrack].name+"</p>");
			// Check if music title is overflowing - start scrolling accordingly
			if(isEllipsisActive($("#ct-track-desc p")[0])){
				if($animationScrollingTitle== true){
					$("#ct-track-desc p").removeClass("showEllipsis");
					setTimeout(function(){
						var max = $("#ct-track-desc").width();
						var num = String($("#ct-track-desc p").css("left")).replace("px","");
						var min = Number("-"+$("#ct-track-desc p")[0].scrollWidth);
						var scroll_text = setInterval(function(){
							num--;
							$("#ct-track-desc p").css("left", String(num)+"px");
							if (num < min){
								num = max;
								$("#ct-track-desc p").css("left", num+"px");
							}
							// Stop scrolling if music title is not overflown
							if (isEllipsisActive($("#ct-track-desc p")[0]) == false){
							   window.clearInterval(scroll_text);
							   $("#ct-track-desc p").css("left", "0px");
							};
						// 100th of a sec scrolling speed
						},100);
					// 1 sec pause before scrolling function starts
					},2000);
				}else{
					$("#ct-track-desc p").addClass("showEllipsis");
				}
			}
		// Set the download of current track property
		$("#subcontrollers .download").attr("data-url", $myPlaylist[$myPlayer.currentTrack].download_url);
		
		if (top.document.title.indexOf("\u25B6") == -1){		
			var currentTitleText = String("\u25B6 "+top.document.title);
			top.document.title = currentTitleText;
		}
	}
	
	
	this.autoPlay = function ($myPlayer, $myPlaylist){
		this.trackPlay($myPlayer);
	}
	
	this.playNextTrack = function (index, $myPlayer , $myPlaylist){
		$myPlayer.src = $myPlaylist[index].url;
		$myPlayer.currentTrack = index;
		this.trackPlay($myPlayer);
	}
	
	this.fastforwardTrack = function (sec, $myPlayer){
		$myPlayer.currentTime = sec;
		//console.log("FastForward Track to " + $myPlayer.buffered);
	}
	
	this.addTrackHTML = function (url, name){
		/* 
		 * Check what audio file is supported on current browser
		 * First check ogg then mp3
		 * Append file type to the url param
		 */
		 
		var should_be_zip_dwl = ($downloadZippedTracks.indexOf(url) > -1) ? true : false ;
		var download_url = ""
		
		if (should_be_zip_dwl == true){
			download_url = url + ".zip";
		}
		
		if($myPlayer.canPlayType){
			if ($myPlayer.canPlayType('audio/ogg')){
				url+=".ogg";
			}else if ($myPlayer.canPlayType('audio/mp3')){
				url+=".mp3";
			}
		}
		
		if (should_be_zip_dwl != true){
			download_url = url;
		}
		
		/* Check for duplicate tracks */
		var duplicateSong, duplicateSongNumber
		for (var i = 0; i < $myPlaylist.length; i++){
			if ($myPlaylist[i].url == url){
				duplicateSong = true;
				duplicateSongNumber = i;
				audioplayer.playNextTrack(Number(duplicateSongNumber), $myPlayer , $myPlaylist);
				break;
			}else{
				duplicateSong = false
			}
		}
		if (duplicateSong != true){
		    /* Track is not duplicate so start procces of:
		     * appending HTML and 
		     * push to playlist array 
		     * Open player frame is not open
		     * Initial player if not
		     * Update Playlist total indictor
		     */
			$("#playlist").append("<li data-url=\""+url+"\"><span class=\"playme\">"+name+"</span><span class=\"icon remove\" id=\""+($myPlaylist.length)+"\"></span><span class=\"icon download downloadSingle\" data-url=\""+download_url+"\"></span></li>");
			var song = new Object;
			song.url = url; 
			song.name = name;
			song.download_url = download_url;
			$myPlaylist.push(song);
			
			if ($("#audioplaylist").hasClass("open")){
				togglePlayerlistFrame("open");
			};
			
			//console.log("New track added - " + song.name + " (" + song.url + ")");
			if($myPlayer.src == ""){
				audioplayer.initializeAudioPlayer($myPlaylist);
			}else{
				if ($myPlayer.paused){
					audioplayer.playNextTrack(Number($myPlaylist.length-1), $myPlayer , $myPlaylist);
				}
			}
			
			updatePlaylistTotal();
			
		}else{
			//console.log("Track already exists");
			/* If double click on duplicate track, play track now */
			if($myPlayer.currentTrack != duplicateSongNumber || $myPlayer.paused){
				audioplayer.playNextTrack(duplicateSongNumber, $myPlayer , $myPlaylist);
			}
		
		}
		
		if (getCurrentPlayerFrameHeight() < 1){
			togglePlayerFrame("open");	
		}
		
		showDownloadAll();
		// Page Buttons
		for (var i=0; i < $(top.frames["main"].document.getElementsByClassName("add_to_playlist")).length; i++){
			var check_url = $(top.frames["main"].document.getElementsByClassName("add_to_playlist"))[i].getAttribute("data-url")
			 $(top.frames["main"].document.getElementsByClassName("add_to_playlist"))[i].innerHTML = "<span class=\"icon sml add-track\"></span> <span>Add to playlist</span>";
			for(var o=0; o < $myPlaylist.length; o++ ){
				if ( $myPlaylist[o].url.indexOf(check_url) > -1 ){
			       $(top.frames["main"].document.getElementsByClassName("add_to_playlist"))[i].innerHTML = "<span class=\"icon sml listen\"></span> <span>Play</span>";
			       break;
				}
			}
				
        } 
		
	}
	
	
	$("#audio-play").on("click", function(){
		var playaudio = ($myPlayer.paused) ? audioplayer.trackPlay($myPlayer) : false;
	});
	$("#audio-pause").on("click", function(){
		var pauseaudio = (!$myPlayer.paused) ? $myPlayer.pause() : false;
		if (top.document.title.indexOf("\u25B6") > -1){
			top.document.title = top.document.title.substring(2, top.document.title.length);
		}

	});
	$("#audio-stop").on("click", function(){
			$myPlayer.pause();
			$myPlayer.src = $myPlaylist[$myPlayer.currentTrack].url;
	});
	$("#audio-next").on("click", function(){
		if ($myPlayer.currentTrack < ($myPlaylist.length-1)){
			$myPlayer.pause();
			$myPlayer.currentTrack = Number($myPlayer.currentTrack) + 1;
			$myPlayer.src = $myPlaylist[$myPlayer.currentTrack].url;
			audioplayer.trackPlay($myPlayer)
		}else{
			//console.log("No more tracks to move on to.")
		}
	});
	$("#audio-prev").on("click", function(){
		if ($myPlayer.currentTrack > 0){
			$myPlayer.pause();
			$myPlayer.currentTrack = Number($myPlayer.currentTrack) - 1;
			$myPlayer.src = $myPlaylist[$myPlayer.currentTrack].url;
			audioplayer.trackPlay($myPlayer)
		}else{
			//console.log("No more tracks to move on to.");
		}
	});
	
	$("#audio-repeat").on("click", function(){
		repeatType = audioplayer.repeatAudio();
		switch(repeatType)
		{
		case 1:
		  $("#audio-repeat").css("color", "red");
		  $(".indictor#audiorepeat").text("1");
		  $(".indictor#audiorepeat").show();
		  break;
		case 2:
		  $("#audio-repeat").css("color", "red");
		  $(".indictor#audiorepeat").text("All");
		  $(".indictor#audiorepeat").show();
		  break;
		default:
		  $("#audio-repeat").css("color", "black");
		  $(".indictor#audiorepeat").text("0");
		  $(".indictor#audiorepeat").hide();
		}
	});
	
	$("#playlist").delegate("li .playme","click", function(){
		var listIndex = $("#playlist li").index($(this).parent());
		if (!($myPlayer.currentTrack === listIndex)){
			audioplayer.playNextTrack(listIndex, $myPlayer , $myPlaylist);	
		}
	});
	
	$(".toggleplaylist").on("click", function(){
		if ($("#audioplaylist li").length > 0){
			if (!$("#audioplaylist").hasClass("open")){
				$("#audioplaylist").addClass("open");
				togglePlayerlistFrame("open");
			}else{
				$("#audioplaylist").removeClass("open");
				togglePlayerlistFrame("close");
			}
		}
		
	});
	
	$("body").delegate(".download.downloadSingle","click",function(){
		var url = String($(this).attr("data-url"));
		url = url.substring(0, url.length-3)+"mp3";
		url = url.substring(url.indexOf("/downloads/")+11, url.length);
		window.open("http://weareinsert.com/wp-content/downloads/download.php?file="+url, "_blank");
	});
	
	$("body").delegate(".remove","click",function(){
		//var index = Number($(this).attr("id"));
	
		var index = $( "li" ).index($(this).parent());
		$myPlaylist.splice(index,1);
		$(this).closest("li").remove();
		togglePlayerlistFrame("resize");
		updatePlaylistTotal();
		showDownloadAll();
		var url = $(this).parent().attr("data-url");
		for (var i=0; i < $(top.frames["main"].document.getElementsByClassName("add_to_playlist")).length; i++){
			var link_url = $(top.frames["main"].document.getElementsByClassName("add_to_playlist"))[i].getAttribute("data-url");
	       	if (url.indexOf(link_url) > -1){
			       $(top.frames["main"].document.getElementsByClassName("add_to_playlist"))[i].innerHTML = "<span>Add to playlist</span>";
	       	}
        }
       
	});
	
	$("body").delegate(".stop_close_player","click",function(){
		$("#audio-pause").trigger("click");
		$myPlaylist = [];
		$("#audioplaylist-inner ul#playlist li").remove();
		updatePlaylistTotal();
		showDownloadAll();
		togglePlayerFrame("close");
		for (var i=0; i < $(top.frames["main"].document.getElementsByClassName("add_to_playlist")).length; i++){
			$(top.frames["main"].document.getElementsByClassName("add_to_playlist"))[i].innerHTML = "<span class=\"icon sml listen\"></span> <span>Play</span>";
        }
	});
	
	$("#downloadAll").click(function(){
		var params = "?files=";
		$.each($myPlaylist, function( index, value ) {
			var url = value.url;
			url = url.substring(url.lastIndexOf("/")+1, url.length);
			if (url.indexOf(".ogg") > 0){
				url = url.replace(".ogg", ".mp3");
			}
			params += url + ",";
		});
		params = params.substring(0, params.length-1);
		var zipme_url = "/wp-content/downloads/zipme.php" + params;
		//console.log("Download playlist request: " + zipme_url);
		var win = window.open(zipme_url, "_self");
	});
	

	this.createProgressBar = function (){
		if ($("#controls #progressBar").length == 0)
			$("#controls").append("<div id=\"duration\"><div id=\"progressContainer\"><div id=\"bufferBar\"></div><div id=\"progressBar\"></div></div><span id=\"progressTime\"></span><span id=\"progressTotalTime\"></span></div>");	
			
		/*
		* Set ProgressTotalTime to duration, however this is not being pushed to UI. var currentTimeformatted is what holds duration time so you can push this to UI.
		*/
					
		var currentTimeUnformatted = secondsToTime(Number($myPlayer.duration));
		var currentTimeHour = (Number(currentTimeUnformatted.h) < 10) ? "0" + String(currentTimeUnformatted.h) : currentTimeUnformatted.h;
		var currentTimeMinute = (Number(currentTimeUnformatted.m) < 10) ? "0" + String(currentTimeUnformatted.m) : currentTimeUnformatted.m;
		var currentTimeSecond = (Number(currentTimeUnformatted.s) < 10) ? "0" + String(currentTimeUnformatted.s) : currentTimeUnformatted.s;
		var currentTimeformatted = String(currentTimeHour) + ":" + String(currentTimeMinute) + ":" + currentTimeSecond;
		//$("#controls #progressTotalTime").text(currentTimeformatted);
		
		
		/*
			Apply on click listener to excute fast forward function
		*/
		$("#controls").delegate("#progressContainer", "click", function(e){
			var offset = $(this).offset();
			var ctclick_x = (e.clientX - offset.left);
			var ctclick_x_percentage = (ctclick_x / Number($(this).width()) * 100);
			var track_time_via_percentage = ((ctclick_x_percentage / 100) * $myPlayer.duration);
			audioplayer.fastforwardTrack(track_time_via_percentage, $myPlayer);
		});
	}
	
	/*
	*	The Progress Bar and Buffer Bar will automatically resize to ProgressContainer
	*/
			
	this.runProgressBar = function(){
		var setProgressWidget = setInterval(function(){
			var basewidth = $("#progressContainer").width();
			var currentProgressPercentage = Number(($myPlayer.currentTime / $myPlayer.duration) * 100);
			$currentBarWidth = String(Number((currentProgressPercentage/100)*basewidth))+"px";
			$("#controls #progressBar").css("width",$currentBarWidth);
			var currentTimeUnformatted = secondsToTime(Number($myPlayer.currentTime));
			var currentTimeHour = (Number(currentTimeUnformatted.h) < 10) ? "0" + String(currentTimeUnformatted.h) : currentTimeUnformatted.h;
			var currentTimeMinute = (Number(currentTimeUnformatted.m) < 10) ? "0" + String(currentTimeUnformatted.m) : currentTimeUnformatted.m;
			var currentTimeSecond = (Number(currentTimeUnformatted.s) < 10) ? "0" + String(currentTimeUnformatted.s) : currentTimeUnformatted.s;
			var currentTimeformatted = String(currentTimeHour) + ":" + String(currentTimeMinute) + ":" + currentTimeSecond;
			$("#controls #progressTime").text(currentTimeformatted);
			
			/*
			* Set ProgressTotalTime which is duration - current time
			*/
			var currentTimeLeftUnformatted = secondsToTime(Number($myPlayer.duration - $myPlayer.currentTime));
			var currentTimeLeftHour = (Number(currentTimeLeftUnformatted.h) < 10) ? "0" + String(currentTimeLeftUnformatted.h) : currentTimeLeftUnformatted.h;
			var currentTimeLeftMinute = (Number(currentTimeLeftUnformatted.m) < 10) ? "0" + String(currentTimeLeftUnformatted.m) : currentTimeLeftUnformatted.m;
			var currentTimeLeftSecond = (Number(currentTimeLeftUnformatted.s) < 10) ? "0" + String(currentTimeLeftUnformatted.s) : currentTimeLeftUnformatted.s;
			var currentTimeLeftformatted = String(currentTimeLeftHour) + ":" + String(currentTimeLeftMinute) + ":" + currentTimeLeftSecond;
			
			$("#controls #progressTotalTime").text("-"+currentTimeLeftformatted);
			
			if (currentProgressPercentage >= 99.9){
				window.clearInterval(setProgressWidget);
			}
		},100);
	}
	
	this.runBufferBar = function(){
		var setProgressWidget = setInterval(function(){
			var basewidth = $("#progressContainer").width();//Number(window.outerWidth);
			var currentProgressPercentage = Number(($myPlayer.buffered.end($myPlayer.buffered.length-1) / $myPlayer.duration) * 100);
			$currentBarWidth = String(Number((currentProgressPercentage/100)*basewidth))+"px";
			$("#controls #bufferBar").css("width",$currentBarWidth);
			if (currentProgressPercentage >= 99){
				window.clearInterval(setProgressWidget);
				//$("#controls #bufferBar").fadeOut();
			}
			
		},10);
	}
	
	this.repeatAudio = function(){
		var num = Number(repeatType);
		num+=1;
		if (num > 2){
			num = 0;
		}
		return repeatArray[num];
	}
	
	/*
	* This is called from your site header.php. This is outside scope of audio player
	*/
	this.changeStyleSheet = function(url){
		var mainStyle = url;//top.frames["main"].$mainContentcss;
		if(mainStyle && mainStyle != undefined || mainStyle != null){
			var html = "<link rel=\"stylesheet\" type=\"text/css\" href="+mainStyle+" id=\"importedStyleSheet\" />";
			if ($("head link#importedStyleSheet").length > 0){
				$('head #importedStyleSheet').attr("href", mainStyle);
			}else{
				$('head').append(html);
			}
		};
		
	}
	/*
	* Both togglePlayerFrame and togglePlayerlistFrame contain animated slide option to resize frame. 
	* When changing the speed and sum amount be aware that the faster the loop is run and the more you minus/plus by > the greater the risk of bypassing the limit, resulting in frame size that is either too big or too small 
	*/
	
	function togglePlayerFrame(action){
		var currentHeight = getCurrentPlayerFrameHeight();
		var limit;
		if (action == "open"){
			limit = $PlayerBaseHeight;
		}
		if (action == "close"){
			limit = 0;
		}
		if ( limit != undefined || limit !=null ){
			if ($animationSlide == true){
				if (action == "open"){
					var act = setInterval(function(){
						if (currentHeight > limit){
							window.clearInterval(act);
						}
						// amount to add to height each loop
						currentHeight += 1; 
						top.document.getElementById("myiframe").setAttribute("rows", currentHeight+",*");
					// how frequent to run loop
					},1);
				}
				if (action == "close"){
					var act = setInterval(function(){
						if (limit > currentHeight){
							window.clearInterval(act);
						}
						// amount to minus to height each loop
						currentHeight -= 1;
						top.document.getElementById("myiframe").setAttribute("rows", currentHeight+",*");
					// how frequent to run loop
					},1);
				}
			}else{
				currentHeight = limit
				top.document.getElementById("myiframe").setAttribute("rows", currentHeight+",*");
			}
		}
		
	}
	
	function togglePlayerlistFrame(action){
		var limit;
		var currentHeight = getCurrentPlayerFrameHeight();
		if (action == "open"){
			limit = ($PlayerBaseHeight+$("#audioplaylist-inner").height()+30);
		}
		if (action == "close"){
			limit = $PlayerBaseHeight+3;
		}
		if (action == "resize"){
			if ($myPlaylist.length > 0){
				limit = ($PlayerBaseHeight+$("#audioplaylist-inner").height()+30);
			}else{
				limit = $PlayerBaseHeight+3;	
			}
		}
		
		if ( limit != undefined || limit !=null ){
			if ($animationSlide == true){
				if (action == "open"){
					var act = setInterval(function(){
						if (currentHeight > limit){
							window.clearInterval(act);
						}
						// amount to add from the height on each loop
						currentHeight += 1;
						window.parent.document.getElementById("myiframe").setAttribute("rows", currentHeight+",*");
					// how frequent to run loop
					},1);
				}
				if (action == "close"){
					var act = setInterval(function(){
						if (limit >= currentHeight){
							window.clearInterval(act);
						}
						// amount to minus from the height on each loop
						currentHeight -= 1;
						window.parent.document.getElementById("myiframe").setAttribute("rows", currentHeight+",*");
					// how frequent to run loop
					},1);
				}
				if (action == "resize"){
					if (currentHeight > limit){
						var act = setInterval(function(){
							if (currentHeight < limit){
								window.clearInterval(act);
							}
							// amount to minus from the height on each loop
							currentHeight -= 1;
							window.parent.document.getElementById("myiframe").setAttribute("rows", currentHeight+",*");
						// how frequent to run loop
						},1);
					}
				}
			}else{
				currentHeight = limit;
				window.parent.document.getElementById("myiframe").setAttribute("rows", currentHeight+",*");
		    }
		}
		
	}
	
	function showDownloadAll(){
		var playlist_length = (typeof $myPlaylist != 'undefined') ? $myPlaylist.length : 0;
		if (playlist_length < 2){
			$("#downloadAll").css("visibility","hidden");
		}else{
			$("#downloadAll").css("visibility","visible");
		}
	}
	
	function isEllipsisActive(e) {
     return (e.offsetWidth < e.scrollWidth);
	}


	function updatePlaylistTotal(){
		$("#playlistTotal").text($myPlaylist.length);
	}
	
	function getCurrentPlayerFrameHeight(){
		var currentplayerFrameHeight = top.document.getElementById("myiframe").getAttribute("rows");
		currentplayerFrameHeight = currentplayerFrameHeight.split(",");
		currentplayerFrameHeight  = Number(currentplayerFrameHeight[0].replace("px",""))
		return currentplayerFrameHeight;
	}
	
	function secondsToTime(secs)
	{
	    var hours = Math.floor(secs / (60 * 60));
	   
	    var divisor_for_minutes = secs % (60 * 60);
	    var minutes = Math.floor(divisor_for_minutes / 60);
	 
	    var divisor_for_seconds = divisor_for_minutes % 60;
	    var seconds = Math.ceil(divisor_for_seconds);
	   
	    var obj = {
	        "h": hours,
	        "m": minutes,
	        "s": seconds
	    };
	    return obj;
	}
	
	function add_and_play_multi_list(){
		var current_tracklist_size = $myPlaylist.length;
		$(top.frames["main"].document.getElementsByClassName("multi-list")).find("tr").each(function(){
			var ele = $(this).find(".track-btns a");
			var url = $(ele).attr("data-url");
			var name = $(ele).attr("title");
			top.frames["player"].audioplayer.addTrackHTML(url,name);
		});
		$myPlayer.pause();
		$myPlayer.currentTrack = current_tracklist_size;	
		$myPlayer.src = $myPlaylist[(current_tracklist_size)].url;
		audioplayer.trackPlay($myPlayer);
	}
		
	top.document.getElementById('content_frame').onload= function() {
		
		
		if (getCurrentPlayerFrameHeight() != 0){
			// Free download category page
        	$(top.frames["main"].document.getElementsByClassName("add_to_playlist")).html("<span>Add to playlist</span>");
		}
        for (var i=0; i < $(top.frames["main"].document.getElementsByClassName("add_to_playlist")).length; i++){
	       	var current_url = $(top.frames["main"].document.getElementsByClassName("add_to_playlist"))[i].getAttribute("data-url");
	       	for (var o = 0; o < $myPlaylist.length; o++){
		       	if ($myPlaylist[o].url.indexOf(current_url) > -1){
			       $(top.frames["main"].document.getElementsByClassName("add_to_playlist"))[o].innerHTML = "<span>Listen</span>";
		       	}
	       	}
        }
        
        $(top.frames["main"].document.getElementsByClassName("add_to_playlist")).click(function(){
	        var url = $(this).attr("data-url");
			var name = $(this).attr("title");
			top.frames["player"].audioplayer.addTrackHTML(url,name);
        });
        
        //Play all 
        $(top.frames["main"].document.getElementById("playall")).click(function(){
        	add_and_play_multi_list();
        });
        
        //On load of frame Download if download all exist - amend the href url to zip me incl params
        if ($(top.frames["main"].document.getElementById("downloadall")).length > 0){
	        var params = "?files=";
	        $(top.frames["main"].document.getElementsByClassName("multi-list")).find("tr").each(function(){
				var ele = $(this).find(".track-btns a");
				var url = $(ele).attr("mp3");
				url = url.substring(url.lastIndexOf("/")+1, url.length);
				params += url + ",";
			});
			params = params.substring(0, params.length-1);
			var zipme_url = "/wp-content/downloads/zipme.php" + params;
			//console.log("Download Post Track request: " + zipme_url);
			$(top.frames["main"].document.getElementById("downloadall")).attr("href",zipme_url);
		};
        
    };
    
}


function setCookie(cname,cvalue,exdays)
{
var d = new Date();
d.setTime(d.getTime()+(exdays*24*60*60*1000));
var expires = "expires="+d.toGMTString();
document.cookie = cname+"="+cvalue+"; "+expires;
}

function getCookie(cname)
{
var name = cname + "=";
var ca = document.cookie.split(';');
for(var i=0; i<ca.length; i++) 
  {
  var c = ca[i].trim();
  if (c.indexOf(name)==0) return c.substring(name.length,c.length);
  }
return "";
}
