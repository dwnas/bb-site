const tooltip = document.querySelector(".tooltip");
const tooltipOffset = 10;
// const lastfm_api = "http://127.0.0.1:3000";
const lastfm_api = "https://lastfm.mayu.amy.rip";
const lastfm_fetch_interval = 10000; // 10 seconds

let last_song_name = "";
let currentMinutes = 0;
let currentSeconds = 0;
let songLengthMinutes = 0;
let songLengthSeconds = 0;

async function formatTimeAgo(ago) {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDifference = currentTime - ago;

  if (timeDifference < 0) {
    return "0 seconds ago";
  }

  if (timeDifference < 60) {
    return `${timeDifference} second${timeDifference === 1 ? "" : "s"} ago`;
  } else if (timeDifference < 3600) {
    return `${Math.floor(timeDifference / 60)} minute${Math.floor(timeDifference / 60) === 1 ? "" : "s"} ago`;
  } else if (timeDifference < 86400) {
    return `${Math.floor(timeDifference / 3600)} hour${Math.floor(timeDifference / 3600) === 1 ? "" : "s"} ago`;
  } else {
    return `${Math.floor(timeDifference / 86400)} day${Math.floor(timeDifference / 86400) === 1 ? "" : "s"} ago`;
  }
}

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
  setInterval(updateMusicInfo, lastfm_fetch_interval);
});

async function updateMusicInfo() {
  try {
    const response = await fetch(lastfm_api);
    if (!response.ok) {
      throw new Error(`Music API returned ${response.status}`);
    }

    const musicData = await response.json();
    const musicElement = document.querySelector(".music");
    const songNameElement = musicElement.querySelector(".song_name");
    const pulserElement = document.getElementById("pulser");
    const nowPlayingTextElement =
      musicElement.querySelector(".now_playing_text");

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

    musicElement.querySelector(".album_art").src = musicData.images?.[3]?.[
      "#text"
    ]
      ? musicData.images[3]["#text"]
      : "img/default_album_art.jpg";

    if (musicData.url && musicData.url !== "") {
      musicElement.querySelector(".artist_info").innerHTML =
        `<a href="${musicData.url.split("/_/")[0]}" target="_blank" rel="noopener noreferrer">${musicData.artist}</a>`; // - ${musicData.album}`;
    } else {
      musicElement.querySelector(".artist_info").textContent =
        `${musicData.artist} - ${musicData.album}`;
    }

    if (musicData.nowplaying) {
      pulserElement.classList.replace("pulser_off", "pulser_on");
      nowPlayingTextElement.textContent = "now playing";
    } else {
      pulserElement.classList.replace("pulser_on", "pulser_off");
      if (musicData.lastplaytime) {
        const timeAgo = await formatTimeAgo(parseInt(musicData.lastplaytime));
        nowPlayingTextElement.textContent = `played ${timeAgo}`;
      }
      else {
        nowPlayingTextElement.textContent = "played some time ago";
      }
    }

    if (songChanged) {
      songNameElement.classList.remove("marquee");
      if (songNameElement.scrollWidth > songNameElement.clientWidth) {
        songNameElement.classList.add("marquee");
      }
    }
  } catch (error) {
    console.error("Unable to update music info:", error);
  }
}
