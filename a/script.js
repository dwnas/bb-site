const tooltip = document.querySelector(".tooltip");
const tooltipOffset = 10;
//const lastfm_api = "https://lastfm.mayu.amy.rip";
const lastfm_api = "http://127.0.0.1:3000";

let last_song_name = "";
let currentMinutes = 0;
let currentSeconds = 0;
let songLengthMinutes = 0;
let songLengthSeconds = 0;

document.querySelectorAll("a").forEach((a) => {
  a.addEventListener("mouseover", (e) => {
    if (a.hasAttribute("_title")) {
      tooltip.textContent = a.getAttribute("_title");
      tooltip.style.visibility = "visible";
      tooltip.style.left = e.pageX + "px";
      tooltip.style.top = e.pageY - tooltipOffset + "px";

      tooltip.style.transform = "translate(-50%, -100%)";
    } 
  });

  a.addEventListener("mouseout", (e) => {
    tooltip.style.visibility = "hidden";
  });
});

document.addEventListener("mousemove", (e) => {
  if (tooltip.style.visibility === "visible") {
    tooltip.style.left = e.pageX + "px";
    tooltip.style.top = e.pageY - tooltipOffset + "px";
  }
});

//////////////////

document.addEventListener("DOMContentLoaded", () => {
  // caitlyn told me to do random images so i did this
  const ch = document.querySelector(".ch");
  const chImg = ch.querySelector("img");

  const chImages = {
    "img/ch/mayura_bg.png": 300,
    "img/ch/mishiro_bg.png": 400,
    "img/ch/momoka_bg.png": 300,
  };
  const randomImage =
    Object.keys(chImages)[
      Math.floor(Math.random() * Object.keys(chImages).length)
    ];

  chImg.style.width = chImages[randomImage] + "px";
  ch.style.right = "calc(-" + chImages[randomImage] + "px - 20px)";

  chImg.src = randomImage;
  chImg.alt = randomImage.split("/").pop().split("_")[0];

  ////////////////

  updateMusicInfo();
  setInterval(updateMusicInfo, 10000);
  setInterval(updateDisplayedPlaytime, 1000);
});

function updateDisplayedPlaytime() {
  const playtimeElement = document.querySelector(".playtime");
  if (playtimeElement.style.visibility !== "visible") {
    return;
  }

  if (
    currentMinutes > songLengthMinutes ||
    (currentMinutes === songLengthMinutes && currentSeconds >= songLengthSeconds)
  ) {
    return;
  }

  currentSeconds++;
  if (currentSeconds >= 60) {
    currentSeconds = 0;
    currentMinutes++;
  }

  document.querySelector(".current_time").textContent =
    `${currentMinutes}:${currentSeconds.toString().padStart(2, "0")}`;
}

async function updateMusicInfo() {
  try {
    const response = await fetch(lastfm_api);
    if (!response.ok) {
      throw new Error(`Music API returned ${response.status}`);
    }

    const musicData = await response.json();
    const musicElement = document.querySelector(".music");
    const songNameElement = musicElement.querySelector(".song_name");

    if (!musicData || !musicData.name) {
      musicElement.querySelector(".album_art").src = "img/default_album_art.jpg";
      songNameElement.textContent = "Not Listening";
      document.querySelector(".artist_info").textContent = "No Artist";
      document.querySelector(".playtime").style.visibility = "hidden";
      last_song_name = "";
      return;
    }

  const songChanged = musicData.name !== last_song_name;
  if (songChanged) {
    last_song_name = musicData.name;

    const marqueeTrack = document.createElement("span");
    marqueeTrack.className = "marquee_track";
    songNameElement.textContent = "";
    songNameElement.appendChild(marqueeTrack);

    if (musicData.url && musicData.url !== "") {
      marqueeTrack.innerHTML = `<a href="${musicData.url}" target="_blank" rel="noopener noreferrer">${musicData.name}</a>`;
    } else {
      marqueeTrack.textContent = musicData.name;
    }
  }

  if (musicData) {
    musicElement.querySelector(".album_art").src =
      musicData.images?.[3]?.["#text"]
        ? musicData.images[3]["#text"]
        : "img/default_album_art.jpg";

    if (musicData.url && musicData.url !== "") {
      musicElement.querySelector(".artist_info").innerHTML =
        `<a href="${musicData.url.split("/_/")[0]}" target="_blank" rel="noopener noreferrer">${musicData.artist}</a> - ${musicData.album}`;
    } else {
      musicElement.querySelector(".artist_info").textContent =
        `${musicData.artist} - ${musicData.album}`;
    }

    if (musicData.playtime) {
      // musicElement.querySelector(".playtime").textContent = Math.floor(musicData.playtime.listening_time) + "/" + musicData.playtime.song_length;
      currentMinutes = Math.floor(musicData.playtime.listening_time / 60);
      currentSeconds = Math.floor(musicData.playtime.listening_time % 60);
      songLengthMinutes = Math.floor(musicData.playtime.song_length / 60);
      songLengthSeconds = Math.floor(musicData.playtime.song_length % 60);

      musicElement.querySelector(".current_time").textContent =
        `${currentMinutes}:${currentSeconds.toString().padStart(2, "0")}`;
      musicElement.querySelector(".total_time").textContent =
        `${songLengthMinutes}:${songLengthSeconds.toString().padStart(2, "0")}`;

      document.querySelector(".playtime").style.visibility = "visible";
    } else {
      document.querySelector(".playtime").style.visibility = "hidden";
    }
  }

  if (songChanged) {
    songNameElement.classList.remove("marquee");
    if (songNameElement.scrollWidth > songNameElement.clientWidth) {
      songNameElement.classList.add("marquee");
    }
  }

  // update song duration for 10s until next update
  // for (let i = 0; i < 10; i++) {
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  //   currentSeconds++;
  //   if (currentSeconds >= 60) {
  //     currentSeconds = 0;
  //     currentMinutes++;
  //   }

  //   if (currentMinutes > songLengthMinutes || (currentMinutes === songLengthMinutes && currentSeconds > songLengthSeconds)) {
  //     break;
  //   }

  //   musicElement.querySelector(".current_time").textContent =
  //     `${currentMinutes}:${currentSeconds.toString().padStart(2, "0")}`;
  // }

  } catch (error) {
    console.error("Unable to update music info:", error);
  }
}

