/* Every .carousel on the page. The strip is a real scroller: drag it with a
   finger or a trackpad, or use the dots. Without this file it still scrolls,
   it simply does not move on its own. */
(function () {
  "use strict";

  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wake(box) {
    var track = box.querySelector(".track");
    var slides = Array.prototype.slice.call(track.children);
    var dots = Array.prototype.slice.call(box.querySelectorAll(".dots button"));
    var every = Number(box.dataset.every || 6000);
    var at = 0;
    var timer = null;
    var settle = null;

    function go(index) {
      at = (index + slides.length) % slides.length;
      track.scrollTo({left: slides[at].offsetLeft - slides[0].offsetLeft,
                      behavior: still ? "auto" : "smooth"});
      mark();
    }

    function mark() {
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-current", i === at ? "true" : "false");
      });
      slides.forEach(function (slide, i) {
        slide.setAttribute("aria-hidden", i === at ? "false" : "true");
      });
    }

    function play() {
      if (still || slides.length < 2) { return; }
      stop();
      timer = setInterval(function () { go(at + 1); }, every);
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    track.addEventListener("scroll", function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        var near = Math.round(track.scrollLeft / track.clientWidth);
        if (near !== at && slides[near]) { at = near; mark(); }
      }, 90);
    }, {passive: true});

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { stop(); go(i); play(); });
    });
    box.addEventListener("pointerenter", stop);
    box.addEventListener("pointerleave", play);
    box.addEventListener("pointerdown", stop);
    box.addEventListener("focusin", stop);
    box.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") { stop(); go(at + 1); }
      if (event.key === "ArrowLeft") { stop(); go(at - 1); }
    });

    box.classList.add("ready");
    mark();
    play();
  }

  Array.prototype.forEach.call(document.querySelectorAll(".carousel"), wake);
})();
