(function() {
  var video = document.getElementById("hero-video");
  var soundButton = document.querySelector(".hero-sound");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var saveData = navigator.connection && navigator.connection.saveData;

  if (!video || !soundButton) return;

  if (reduceMotion.matches || saveData) {
    video.pause();
    video.removeAttribute("autoplay");
    soundButton.hidden = true;
    return;
  }

  soundButton.addEventListener("click", function() {
    var icon = soundButton.querySelector(".icon");
    video.muted = !video.muted;
    soundButton.setAttribute("aria-pressed", String(!video.muted));
    soundButton.setAttribute("aria-label", video.muted ? "영상 소리 켜기" : "영상 소리 끄기");
    soundButton.setAttribute("title", video.muted ? "영상 소리 켜기" : "영상 소리 끄기");
    icon.classList.toggle("fa-volume-mute", video.muted);
    icon.classList.toggle("fa-volume-up", !video.muted);

    if (video.paused) video.play();
  });
})();
