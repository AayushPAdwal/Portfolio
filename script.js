(function () {
  var reduce = false;

  try {
    reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  } catch (e) {}

  /* Ticker: duplicate the track for a seamless loop */
  var track = document.getElementById("track");

  if (track && !reduce) {
    var copy = track.cloneNode(true);

    [].slice.call(copy.children).forEach(function (n) {
      n.setAttribute("aria-hidden", "true");
      track.appendChild(n);
    });
  }

  /* Rotating words in the headline */
  var words = [].slice.call(
    document.querySelectorAll(".rot span")
  );

  if (words.length > 1 && !reduce) {
    var i = 0;

    setInterval(function () {
      var cur = words[i];

      i = (i + 1) % words.length;

      var next = words[i];

      cur.classList.remove("on");
      cur.classList.add("off");

      next.classList.remove("off");
      next.classList.add("on");

      setTimeout(function () {
        cur.classList.remove("off");
      }, 600);

    }, 2600);
  }

  /* Typing terminal */
  var cmds = [].slice.call(
    document.querySelectorAll("#term .cmd")
  );

  var outs = [].slice.call(
    document.querySelectorAll("#term .t-out")
  );

  function showAll() {
    cmds.forEach(function (c) {
      c.textContent = c.getAttribute("data-text");
      c.classList.add("vis");
    });

    outs.forEach(function (o) {
      o.classList.add("vis");
    });
  }

  if (reduce) {
    showAll();
  } else {
    var step = 0;

    var typeNext = function () {
      if (step >= cmds.length) return;

      var el = cmds[step];
      var text = el.getAttribute("data-text");
      var n = 0;

      el.classList.add("vis");

      var t = setInterval(function () {
        n++;

        el.textContent = text.slice(0, n);

        if (n >= text.length) {
          clearInterval(t);

          setTimeout(function () {
            outs[step].classList.add("vis");

            step++;

            setTimeout(typeNext, 320);
          }, 220);
        }
      }, 38);
    };

    setTimeout(typeNext, 400);
  }

  /* Scroll reveal */
  var items = [].slice.call(
    document.querySelectorAll(".rv, .l")
  );

  if (!reduce && "IntersectionObserver" in window) {
    var vh = window.innerHeight;

    items.forEach(function (el) {
      var r = el.getBoundingClientRect();

      if (r.top > vh * 0.95) {
        el.classList.add("pre");
      }
    });

    var lineIndex = 0;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;

        var el = e.target;

        var d = parseInt(
          el.getAttribute("data-d") || "0",
          10
        );

        if (el.classList.contains("l")) {
          d = lineIndex * 70;
          lineIndex = (lineIndex + 1) % 12;
        }

        el.style.transitionDelay = d + "ms";

        el.classList.remove("pre");

        setTimeout(function () {
          el.style.transitionDelay = "";
        }, d + 900);

        io.unobserve(el);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px"
    });

    items.forEach(function (el) {
      if (el.classList.contains("pre")) {
        io.observe(el);
      }
    });

    setTimeout(function () {
      items.forEach(function (el) {
        el.classList.remove("pre");
      });
    }, 9000);
  }

  /* Spotlight on project cards */
  [].slice.call(
    document.querySelectorAll(".card")
  ).forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();

      card.style.setProperty(
        "--mx",
        (e.clientX - r.left) + "px"
      );

      card.style.setProperty(
        "--my",
        (e.clientY - r.top) + "px"
      );
    });
  });

  /* Hero glow follows the pointer */
  var hero = document.getElementById("hero");

  if (hero && !reduce) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();

      hero.style.setProperty(
        "--gx",
        (e.clientX - r.left) + "px"
      );

      hero.style.setProperty(
        "--gy",
        (e.clientY - r.top) + "px"
      );
    });
  }

  /* Photo tilt: pointer devices only */
  var tilt = document.getElementById("tilt");
  var canHover = false;

  try {
    canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
  } catch (e) {}

  if (tilt && canHover && !reduce) {
    var box = tilt.parentNode;

    box.addEventListener("pointermove", function (e) {
      var r = box.getBoundingClientRect();

      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;

      tilt.style.transform =
        "perspective(900px) rotateY(" +
        (x * 7).toFixed(2) +
        "deg) rotateX(" +
        (-y * 7).toFixed(2) +
        "deg)";
    });

    box.addEventListener("pointerleave", function () {
      tilt.style.transform = "";
    });
  }

  /* Scroll progress */
  var bar = document.getElementById("bar");
  var ticking = false;

  function onScroll() {
    ticking = false;

    var h =
      document.documentElement.scrollHeight -
      window.innerHeight;

    var p = h > 0
      ? Math.min(1, Math.max(0, window.scrollY / h))
      : 0;

    bar.style.setProperty("--p", p.toFixed(4));
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, {
    passive: true
  });

  onScroll();

  /* Current section navigation */
  var links = [].slice.call(
    document.querySelectorAll(".topbar nav a")
  );

  var secs = [
    "projects",
    "skills",
    "education",
    "contact"
  ].map(function (id) {
    return document.getElementById(id);
  });

  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;

        links.forEach(function (a) {
          if (
            a.getAttribute("href") ===
            "#" + e.target.id
          ) {
            a.setAttribute("aria-current", "true");
          } else {
            a.removeAttribute("aria-current");
          }
        });
      });
    }, {
      rootMargin: "-40% 0px -55% 0px"
    });

    secs.forEach(function (s) {
      if (s) so.observe(s);
    });
  }

  /* Network canvas in the hero */
  var c = document.getElementById("net");

  if (c && c.getContext) {
    var ctx = c.getContext("2d");

    var W = 0;
    var H = 0;
    var nodes = [];

    var mouse = {
      x: -999,
      y: -999
    };

    var visible = true;
    var raf = 0;

    var RGB = "111,207,195";

    var resize = function () {
      var r = c.parentNode.getBoundingClientRect();

      var dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      W = r.width;
      H = r.height;

      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var n = Math.round(
        Math.min(
          70,
          Math.max(22, (W * H) / 16000)
        )
      );

      nodes = [];

      for (var k = 0; k < n; k++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28
        });
      }
    };

    var draw = function (move) {
      ctx.clearRect(0, 0, W, H);

      var a, b, dx, dy, d;

      for (var m = 0; m < nodes.length; m++) {
        a = nodes[m];

        if (move) {
          a.x += a.vx;
          a.y += a.vy;

          if (a.x < 0 || a.x > W) {
            a.vx *= -1;
          }

          if (a.y < 0 || a.y > H) {
            a.vy *= -1;
          }
        }

        for (var q = m + 1; q < nodes.length; q++) {
          b = nodes[q];

          dx = a.x - b.x;
          dy = a.y - b.y;

          d = Math.sqrt(dx * dx + dy * dy);

          if (d < 130) {
            ctx.strokeStyle =
              "rgba(" +
              RGB +
              "," +
              (0.16 * (1 - d / 130)).toFixed(3) +
              ")";

            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        dx = a.x - mouse.x;
        dy = a.y - mouse.y;

        d = Math.sqrt(dx * dx + dy * dy);

        if (d < 150) {
          ctx.strokeStyle =
            "rgba(" +
            RGB +
            "," +
            (0.45 * (1 - d / 150)).toFixed(3) +
            ")";

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(" + RGB + ",0.55)";

        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.6, 0, 6.2832);
        ctx.fill();
      }
    };

    var loop = function () {
      if (visible) {
        draw(true);
      }

      raf = requestAnimationFrame(loop);
    };

    resize();
    draw(false);

    window.addEventListener("resize", function () {
      resize();
      draw(false);
    });

    if (!reduce) {
      hero.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();

        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });

      hero.addEventListener("pointerleave", function () {
        mouse.x = -999;
        mouse.y = -999;
      });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          visible = es[0].isIntersecting;
        }).observe(hero);
      }

      raf = requestAnimationFrame(loop);
    }
  }

  /* Copy email */
  var btn = document.getElementById("copy-btn");
  var status = document.getElementById("copy-status");
  var emailText = document.getElementById("email-text");

  function selectText() {
    try {
      var range = document.createRange();

      range.selectNodeContents(emailText);

      var sel = window.getSelection();

      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {}
  }

  btn.addEventListener("click", function () {
    var value = emailText.textContent.trim();

    var done = function () {
      status.textContent = "Copied";

      setTimeout(function () {
        status.textContent = "";
      }, 2000);
    };

    var fallback = function () {
      selectText();
      status.textContent = "Press Ctrl/Cmd+C to copy";
    };

    try {
      navigator.clipboard.writeText(value).then(
        done,
        fallback
      );
    } catch (e) {
      fallback();
    }
  });

})();