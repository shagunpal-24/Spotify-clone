
console.log('Let\'s start!'); // Output: "Let's start!"
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`./${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    
    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
    let cleanName =  decodeURIComponent(song)
    .replace(".mp3", "")
    .replace(/[-_]/g, " ")                // Replace dashes and underscores with space
    .replace(/\s{2,}/g, " ")              // Remove extra spaces
    .trim();        
    songUL.innerHTML += `
    <li data-file="${song}">
        <img class="invert" width="34" src="img/music.svg" alt="">
        <div class="info">
            <div>${cleanName}</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="">
        </div>
    </li>`;
}



     // ✅ Attach event listener after list is created
    Array.from(songUL.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => {
            const track = li.dataset.file;
            playMusic(track);
        });
    });

    return songs;


}


const playMusic = (track, pause = false) => {
    currentSong.src = `./${currFolder}/` + track;
    let cleanName = decodeURIComponent(track)
        .replace(".mp3", "")
        .replace(/[-_]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
document.querySelector(".songinfo").innerText = cleanName;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`./songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let href = e.getAttribute("href");
    let parts = href.split("/").filter(part => part.length > 0);
    let folder = parts.length > 1 ? parts[parts.length - 1] : null;
    if (!folder || folder === "songs") continue; // skip root folder or invalid

        console.log("Loading album folder:", folder); // helpful log
            // Get the metadata of the folder
            try {
            let res = await fetch(`./songs/${folder}/info.json`);
            let data = await res.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="./songs/${folder}/cover.jpg" alt="">
            <h2>${data.title}</h2>
            <p>${data.description}</p>
        </div>`
        } catch (err) {
            console.warn(`❌ Failed to load info.json for ${folder}`, err);
    }}}

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Display all the albums on the page
    await displayAlbums()
    

//Attach an event listener to play next and previous
document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) {
        currentSong.play();
    } else {
        currentSong.pause();
    }
    play.src = currentSong.paused ? "img/play.svg" : "img/pause.svg";
});


// Format time from seconds to mm:ss
function formatTime(seconds) {
let mins = Math.floor(seconds / 60);
let secs = Math.floor(seconds % 60);
return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
}

// Update the song time display as the song plays
currentSong.addEventListener("timeupdate", () => {
const current = formatTime(currentSong.currentTime);
const total = formatTime(currentSong.duration || 0);
document.querySelector(".songtime").innerText = `${current} / ${total}`;
  document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration) * 100 + "%";
});

currentSong.addEventListener("ended", () => {
  document.getElementById("play").src = "play.svg"; // reset icon
document.querySelector(".songtime").innerText = "00:00 / 00:00";
});

//Add an event listener to seekbar
document.querySelector(".seekbar").addEventListener("click", e=>{
let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
document.querySelector(".circle").style.left = percent + "%";
currentSong.currentTime = ((currentSong.duration) * percent)/100;
})

//Add an event listener for hamburger
document.querySelector(".hamburger").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "0";
})

//Add an event listener for close button
document.querySelector(".close").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "-120%";
})

//Add an event listener for previous
previous.addEventListener("click", ()=>{
    console.log("Previous clicked")
    console.log(currentSong)
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if((index-1) >= 0){
    playMusic(songs[index-1])
    }
} )

//Add an event listener for next
next.addEventListener("click", ()=>{
    console.log("Next clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if((index+1) < songs.length){
    playMusic(songs[index+1])
    }
} )

//Add an event to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

//Add event listener to mute the track
document.querySelector(".volume>img").addEventListener("click", e=>{
    console.log("changing", e.target.src)
    if(e.target.src.includes("img/volume.svg")){
        e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }else{
        e.target.src = e.target.src.replace( "img/mute.svg", "img/volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10
    }



})
}

main(); 
// Output the response from the fetch request
