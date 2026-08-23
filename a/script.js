const tooltip = document.querySelector(".tooltip");
const tooltipOffset = 10;

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
});
