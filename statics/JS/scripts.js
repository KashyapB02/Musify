import songlist from "./songs.js";

const totalSong = songlist.length;
var currentPlayingIndex = 0;
var currentPlayingSong = songlist[currentPlayingIndex];
var audioElement = new Audio(currentPlayingSong.trackurl);
var playerActive = false;
var songChanged = false;
var repeatSong = true;

var playPauseButton = document.getElementById("playPause");
var volume = document.getElementById("volume");
var repeat = document.getElementById("repeat");
var playerSongTimer = document.getElementById("player--songTimer");
const rangeInput = document.querySelector('input[type="range"]');
var activeElement = null;
var activeElementSelectors = { gif: null, icon: null, timestamp: null }
var currentSongSelectors = {
    cover: document.querySelectorAll(".currentSongCover"),
    name: document.querySelectorAll(".currentSongName"),
    description: document.querySelectorAll(".currentSongDescription")
}


const songListContainer = document.getElementById("songlistContainer");
const songChangeButton = document.querySelectorAll(".songChangeButton");

songlist.forEach((song) => {
    var songList = `<div class="app_song--songlist_songs flex flex-1 align-center cursor-pointer"><img src="${song.trackcover}" alt="${song.trackname}" class="object-cover"><div class="flex-1"><p>${song.trackname}</p><p>${song.trackdescription}</p></div><img src="../../assets/playing.gif" alt="" class="object-cover playingGif" style="width: 0;"><span class="songlist_songs_timestamp flex align-center"><p>${song.tracklength.minute}:${song.tracklength.second}</p><i role="button" class="fa-solid fa-circle-play icons"></i></span></div>`

    songListContainer.innerHTML += songList;
});

const songlistDivs = document.querySelectorAll(".app_song--songlist_songs");
playerSongTimer.innerText = `00:00 | ${currentPlayingSong.tracklength.minute}:${currentPlayingSong.tracklength.second}`;

const updateActiveElement = () => {
    activeElement = songlistDivs[currentPlayingIndex];

    activeElementSelectors.gif = activeElement.querySelector(".playingGif");
    activeElementSelectors.icon = activeElement.querySelector(".icons");
    activeElementSelectors.timestamp = (activeElement.querySelector(".songlist_songs_timestamp")).firstChild;

    if (!activeElement.classList.contains("app_song--nowPlaying")) {
        activeElement.classList.add("app_song--nowPlaying");
    }
}

const updateCurrentPlayingSong = () => {
    (currentSongSelectors.cover).forEach((item) => {
        item.src = `${currentPlayingSong.trackcover}`;
    });
    (currentSongSelectors.name).forEach((item) => {
        item.innerText = `${currentPlayingSong.trackname}`;
    });
    (currentSongSelectors.description).forEach((item) => {
        item.innerText = `${currentPlayingSong.trackdescription}`;
    });
}

const resetSonglistStyle = () => {
    songlistDivs.forEach((element, index) => {
        if (element.classList.contains("app_song--nowPlaying")) {
            element.classList.remove("app_song--nowPlaying");
        }

        element.querySelector(".playingGif").style.width = 0;
        element.querySelector(".icons").classList.remove("fa-circle-pause");
        element.querySelector(".icons").classList.add("fa-circle-play");

        let timeText = `${songlist[index].tracklength.minute}:${songlist[index].tracklength.second}`;
        (element.querySelector(".songlist_songs_timestamp")).firstChild.innerText = timeText;
    });
}

const styleActiveElement = () => {
    if (playerActive || audioElement.ended) {
        (activeElementSelectors.gif).style.width = 0;
        (activeElementSelectors.icon).classList.remove("fa-circle-pause");
        (activeElementSelectors.icon).classList.add("fa-circle-play");
    } else {
        (activeElementSelectors.gif).style.width = "50px";
        (activeElementSelectors.icon).classList.remove("fa-circle-play");
        (activeElementSelectors.icon).classList.add("fa-circle-pause");
    }
}

const updateNowPlaying = () => {
    currentPlayingSong = songlist[currentPlayingIndex];
    audioElement.src = currentPlayingSong.trackurl;
    
    if (!currentPlayingIndex) {
        songChangeButton[0].classList.add("disabled");
        if (songChangeButton[1].classList.contains("disabled")) { songChangeButton[1].classList.remove("disabled"); }
    } else if (!repeatSong && currentPlayingIndex === 9) {
        songChangeButton[1].classList.add("disabled");
        if (songChangeButton[0].classList.contains("disabled")) { songChangeButton[0].classList.remove("disabled"); }
    } else {
        for (let button of songChangeButton) {
            if (button.classList.contains("disabled")) { button.classList.remove("disabled"); }
        }
    }

    updateCurrentPlayingSong();
}

const handleInputChange = (event) => {
    const value = event.target.value;
    audioElement.currentTime = ((value * audioElement.duration) / 100);
    (event.target).style.backgroundSize = value + '% 100%'
}

const updateTimeStamp = () => {
    let currentTime = parseInt(audioElement.currentTime);
    let mins = ('0' + parseInt(currentTime / 60)).slice(-2);
    let sec = ('0' + parseInt(currentTime % 60)).slice(-2);

    let timeText = `${mins}:${sec} | ${currentPlayingSong.tracklength.minute}:${currentPlayingSong.tracklength.second}`;
    (activeElementSelectors.timestamp).innerText = timeText;
    playerSongTimer.innerText = timeText;
    if (songChanged) { songChanged = false; }

    let stepSize = (1 / audioElement.duration);
    rangeInput.setAttribute("step", stepSize);
}

const playPauseHandler = () => {
    playerActive = (!audioElement.paused);
    if (playerActive || audioElement.ended) {
        if (!audioElement.ended) { audioElement.pause(); }
        playPauseButton.classList.add("fa-circle-play");
        playPauseButton.classList.remove("fa-circle-pause");
    } else {
        audioElement.play();
        playPauseButton.classList.remove("fa-circle-play");
        playPauseButton.classList.add("fa-circle-pause");
    }

    styleActiveElement();
}

playPauseButton.onclick = () => playPauseHandler();

for (let button of songChangeButton) {
    button.onclick = function () {
        songChanged = true;

        if (button.id === "forward") {
            if (!repeatSong && currentPlayingIndex === 9) { button.setAttribute("disabled", ""); }
            else { currentPlayingIndex += 1; currentPlayingIndex %= totalSong; }
        }
        else {
            if (!currentPlayingIndex) { button.setAttribute("disabled", ""); }
            else { currentPlayingIndex -= 1; }
        }

        updateNowPlaying();
        resetSonglistStyle();
        updateActiveElement();
        playPauseHandler();
    }
}

volume.onclick = function () {
    audioElement.muted = !audioElement.muted;
    if (audioElement.muted) {
        volume.classList.remove("fa-volume-high");
        volume.classList.add("fa-volume-xmark");
    } else {
        volume.classList.remove("fa-volume-xmark");
        volume.classList.add("fa-volume-high");
    }
}

repeat.onclick = function () {
    repeatSong = !repeatSong;

    if (repeatSong) {
        repeat.style.color = "hsl(var(--clr-spotifygreen))";
        if (songChangeButton[1].classList.contains("disabled")) { songChangeButton[1].classList.remove("disabled"); }
    }
    else {
        repeat.style.color = "hsl(var(--clr-spotifygreen) / 0.5)";
        if (currentPlayingIndex === 9) { songChangeButton[1].classList.add("disabled"); }
    }
}

audioElement.ontimeupdate = function () {
    if (songChanged) { var progress = 0; }
    else { var progress = (audioElement.currentTime / audioElement.duration) * 100; }

    rangeInput.value = progress;
    rangeInput.style.backgroundSize = progress + '% 100%';
    updateTimeStamp();
}

audioElement.onended = function () {
    if (repeatSong) {
        songChangeButton[1].click();
    } else {
        if (currentPlayingIndex < 9) {
            songChangeButton[1].click();
        } else { playPauseHandler(); }
    }
}

rangeInput.addEventListener('input', handleInputChange);
songlistDivs.forEach((element, index) => {
    element.onclick = function () {
        if (currentPlayingIndex === index) { playPauseHandler(); }
        else {
            currentPlayingIndex = index;
            songChanged = true;
            updateNowPlaying();
            resetSonglistStyle();
            updateActiveElement();
            playPauseHandler();
        }
    }
})

updateActiveElement();
updateCurrentPlayingSong();