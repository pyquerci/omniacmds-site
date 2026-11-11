/* Every .carousel on the page. The strip slides sideways and never runs back
   through the pictures: after the last one it keeps going and the first comes
   round again, because a copy of it waits at the end. Click the right half of
   a picture to go on and the left half to go back, pick one from the dots, use
   the arrow keys, or swipe. Without this file the pictures are simply there,
   one after the other. */
(function () {
  "use strict";

  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GLIDE = 600;

  function wake(box) {
    var stage = box.querySelector(".stage");
    var track = box.querySelector(".track");
    var slides = Array.prototype.slice.call(track.children);
    var dots = Array.prototype.slice.call(
      box.querySelectorAll(".dots button:not(.hold)"));
    var said = box.querySelector(".said");
    var hold = box.querySelector(".hold");
    var held = false;
    var every = Number(box.dataset.every || 6000);
    var last = slides.length - 1;
    var at = 0;
    var timer = null;
    var busy = false;

    if (slides.length < 2) { return; }

    var copy = slides[0].cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.appendChild(copy);

    function place(index, glide) {
      track.style.transition = glide && !still
        ? "transform " + GLIDE + "ms cubic-bezier(0.3, 0.8, 0.35, 1)" : "none";
      track.style.transform = "translateX(" + (-index * 100) + "%)";
    }

    function mark() {
      if (said) { said.textContent = slides[at].dataset.caption || ""; }
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-current", i === at ? "true" : "false");
      });
      slides.forEach(function (one, i) {
        one.setAttribute("aria-hidden", i === at ? "false" : "true");
      });
    }

    function on() {
      if (busy) { return; }
      if (at < last) { at += 1; place(at, true); mark(); return; }
      /* Onto the copy, then back onto the real first picture once still. */
      busy = true;
      at = 0;
      mark();
      place(slides.length, true);
      setTimeout(function () { place(0, false); busy = false; },
                 still ? 0 : GLIDE + 20);
    }

    function back() {
      if (busy) { return; }
      if (at > 0) { at -= 1; place(at, true); mark(); return; }
      /* Stand on the copy without a sound, then glide onto the last picture. */
      busy = true;
      at = last;
      mark();
      place(slides.length, false);
      track.offsetWidth;
      place(last, true);
      setTimeout(function () { busy = false; }, still ? 0 : GLIDE + 20);
    }

    function play() {
      if (still || held) { return; }
      stop();
      timer = setInterval(on, every);
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    function step(way) { stop(); if (way > 0) { on(); } else { back(); } play(); }

    /* the left half goes back, the right half goes on */
    function half(event) {
      var size = stage.getBoundingClientRect();
      return event.clientX < size.left + size.width / 2 ? -1 : 1;
    }

    function keep(on) {
      held = on;
      box.classList.toggle("held", held);
      if (hold) { hold.setAttribute("aria-pressed", held ? "true" : "false"); }
      if (held) { stop(); } else { step(1); }
    }

    stage.addEventListener("click", function (event) { step(half(event)); });
    stage.addEventListener("mousemove", function (event) {
      var side = half(event);
      box.classList.toggle("to-left", side < 0);
      box.classList.toggle("to-right", side > 0);
    });
    stage.addEventListener("mouseleave", function () {
      box.classList.remove("to-left", "to-right");
    });

    var from = null;
    stage.addEventListener("touchstart", function (event) {
      from = event.touches[0].clientX;
    }, {passive: true});
    stage.addEventListener("touchend", function (event) {
      if (from === null) { return; }
      var moved = event.changedTouches[0].clientX - from;
      from = null;
      if (Math.abs(moved) > 40) { step(moved < 0 ? 1 : -1); }
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (busy) { return; }
        stop();
        at = i;
        place(at, true);
        mark();
        play();
      });
    });
    if (hold) {
      hold.addEventListener("click", function (event) {
        event.stopPropagation();
        keep(!held);
      });
    }
    box.addEventListener("pointerenter", stop);
    box.addEventListener("pointerleave", play);
    box.addEventListener("focusin", stop);
    box.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") { step(1); }
      if (event.key === "ArrowLeft") { step(-1); }
    });

    box.classList.add("ready");
    place(0, false);
    mark();
    play();
  }

  Array.prototype.forEach.call(document.querySelectorAll(".carousel"), wake);
})();
