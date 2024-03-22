let currentSong = new Audio();
let currFoler;
let songs;

// This function covert seconds to minutes
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Here we are getting songs from the folder
async function getSongs(folder) {
  currFoler = folder;
  let res = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await res.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  // Adding all songs in Songs[] array
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Showing songs in list
  let songUl = document
    .querySelector(".song-list")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = ``;
  for (song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li><img class="invert" src="./Assets/music.svg" alt="">
                            <div class="song-info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <p>Artist Name</p>
                            </div>
                            <i class="fa-regular fa-circle-play"></i>
                        </li>`;
  }

  // Add click event listiner on each song in song list to play the song
  let songList = Array.from(
    document.querySelector(".song-list").getElementsByTagName("li")
  );
  songList.forEach((ele) => {
    ele.addEventListener("click", () => {
      playMusic(
        ele.querySelector(".song-info").firstElementChild.innerHTML.trim()
      );
    });
  });
}

// This function is used to display Album card on home Page
let displayAlbum = async () => {
  let res = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await res.text();

  let container = document.querySelector(".cardContainer");

  let div = document.createElement("div");
  div.innerHTML = response;
  let array = Array.from(div.getElementsByTagName("a"));
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    // Here we gettings all a tag which contains /songs Href
    if (e.href.includes("/songs/")) {
      let folders = e.href.split("/");
      let foldersLenth = folders.length;
      // Here we geting the Folder name
      let folderNames = folders[foldersLenth - 1];
      let res = await fetch(
        `http://127.0.0.1:5500/songs/${folderNames}/info.json`
      );
      let response = await res.json();
      container.innerHTML =
        container.innerHTML +
        `
      <div data-folder="${folderNames}" class="card rounded">
                        <div class="playbtn">
                            <i class='fas fa-play'></i>
                        </div>
                        <img class="rounded" src="https://i.scdn.co/image/ab67616d00001e02e787cffec20aa2a396a61647"
                            alt="">
                        <h2 class="m-1">${response.name}</h2>
                        <p class="m-1">${response.description}</p>
                    </div>

      
      
      `;
    }
  }

  // When we click on card we want to load songs from that card
  let allCards = document.querySelectorAll(".card");
  allCards.forEach((ele) => {
    ele.addEventListener("click", async (card) => {
      songs = await getSongs(`songs/${card.currentTarget.dataset.folder}`);
    });
  });
};

let main = async () => {
  //Get all the Songs
  await getSongs(`songs/youtube`);

  // Display all the Albums
  displayAlbum();

  // Attach event listener to Play Music
  document.querySelector("#play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
    } else {
      currentSong.pause();
    }
  });

  // Here we are showing Song Time duration
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `
      ${secondsToMinutesSeconds(
        currentSong.currentTime
      )}/${secondsToMinutesSeconds(currentSong.duration)} 
      `;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Move the seek bar when we click on the time line
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    // Now change the song duration when we click on seek bar

    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add event listner to Hamburger Icon
  document.querySelector(".handburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0 + "%";
  });
  document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = -100 + "%";
  });

  let songCount = 0;
  // Adding Next Previous functionality
  document.querySelector("#previous").addEventListener("click", () => {
    songCount = songCount - 1;
    if (songCount <= 0) {
      songCount = 0;
    }
    playMusic(
      songList[songCount]
        .querySelector(".song-info")
        .firstElementChild.innerHTML.trim()
    );
  });
  document.querySelector("#next").addEventListener("click", () => {
    if (songCount === songList.length) {
      songCount = 0;
    }
    playMusic(
      songList[songCount]
        .querySelector(".song-info")
        .firstElementChild.innerHTML.trim()
    );
    songCount = songCount + 1;
  });

  //Adding Volume feature
  document.querySelector("#range").addEventListener("change", (e) => {
    // console.log(currentSong.volume);
    currentSong.volume = parseInt(e.target.value) / 100;
  });
};

main();

let playMusic = (songName) => {
  currentSong.src = `/${currFoler}/${songName}`;

  currentSong.play();

  document.querySelector(".songinfo").innerHTML = songName;
};
