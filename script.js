/* =========================================================
   Jupre Salon and Cosmetic — script.js
   Hero video cycling · GSAP animations
   Packages panel switcher · Testimonials carousel · Counters
   ========================================================= */

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.normalizeScroll(false);
ScrollTrigger.defaults({ scroller: window });

(function initHeroVideo() {
  const video = document.getElementById("heroVideo");
  const nav   = document.getElementById("heroVideoNav");
  if (!video) return;

  const clips = [
    { src: "https://videos.pexels.com/video-files/3209211/3209211-hd_1280_720_25fps.mp4",  label: "Hair Styling"  },
    { src: "https://videos.pexels.com/video-files/4498172/4498172-hd_1280_720_25fps.mp4",  label: "Skincare"      },
    { src: "https://videos.pexels.com/video-files/5935742/5935742-hd_1280_720_25fps.mp4",  label: "Nail Art"      },
    { src: "https://videos.pexels.com/video-files/3879491/3879491-hd_1280_720_25fps.mp4",  label: "Spa & Wellness"},
  ];

  let current = 0;
  let cycleTimer = null;

  // Build nav dots
  if (nav) {
    clips.forEach((clip, i) => {
      const btn = document.createElement("button");
      btn.className = "hvdot" + (i === 0 ? " active" : "");
      btn.setAttribute("aria-label", clip.label);
      btn.addEventListener("click", () => go(i));
      nav.appendChild(btn);
    });
  }

  function updateDots() {
    if (!nav) return;
    nav.querySelectorAll(".hvdot").forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function go(index) {
    current = ((index % clips.length) + clips.length) % clips.length;
    video.style.opacity = "0";
    clearTimeout(cycleTimer);
    setTimeout(() => {
      video.src = clips[current].src;
      video.load();
      video.play().catch(() => {});
      video.style.opacity = "1";
      cycleTimer = setTimeout(() => go(current + 1), 12000);
    }, 600);
    updateDots();
  }

  // Pause/resume on visibility
  const heroEl = document.getElementById("home");
  if (heroEl) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { video.play().catch(() => {}); }
        else { video.pause(); }
      });
    }, { threshold: 0.1 }).observe(heroEl);
  }

  // Kick off
  go(0);
  video.addEventListener("ended", () => go(current + 1));
})();

window.addEventListener("DOMContentLoaded", () => {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to("#heroEyebrow", { opacity: 1, y: 0, duration: 0.9, delay: 0.3 })
    .to(".hero-title .line", { opacity: 1, y: 0, duration: 1.1, stagger: 0.2 }, "-=0.4")
    .to("#heroSub", { opacity: 1, y: 0, duration: 0.9 }, "-=0.5")
    .to("#heroCta", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to("#heroScroll", { opacity: 1, duration: 0.6 }, "-=0.2");

  const revealEls = document.querySelectorAll("[data-reveal]");
  const revealCards = document.querySelectorAll("[data-reveal-card]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("revealed"); observer.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  revealEls.forEach((el) => observer.observe(el));
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        setTimeout(() => { e.target.classList.add("revealed"); cardObserver.unobserve(e.target); }, (e.target.dataset.index || 0) * 80);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  revealCards.forEach((el, i) => { el.dataset.index = i % 6; cardObserver.observe(el); });

  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const target = +e.target.dataset.count;
        const suffix = "+";
        const duration = 1800;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          e.target.textContent = Math.floor(eased * target) + (progress === 1 ? suffix : "");
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => counterObserver.observe(el));

  const ritualsSection = document.querySelector(".rituals");
  const panels = document.querySelectorAll(".ritual-panel");
  const progressFill = document.getElementById("ritualsProgress");
  if (ritualsSection && panels.length) {
    let currentPanel = 0;
    let autoTimer = null;
    const DURATION = 10000;
    function showPanel(index) {
      panels.forEach((p, i) => { p.classList.remove("active", "exit-left"); if (i < index) p.classList.add("exit-left"); });
      panels[index].classList.add("active");
      currentPanel = index;
      if (progressFill) {
        progressFill.style.transition = "none";
        progressFill.style.width = "0%";
        requestAnimationFrame(() => { requestAnimationFrame(() => { progressFill.style.transition = `width ${DURATION}ms linear`; progressFill.style.width = "100%"; }); });
      }
    }
    function nextPanel() { showPanel((currentPanel + 1) % panels.length); }
    function startAuto() { stopAuto(); autoTimer = setInterval(nextPanel, DURATION); }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    const obs = new IntersectionObserver((entries) => { entries.forEach((e) => { if (e.isIntersecting) startAuto(); else stopAuto(); }); }, { threshold: 0.2 });
    obs.observe(ritualsSection);
    showPanel(0);
  }

  const tiltItems = document.querySelectorAll("[data-tilt]");
  tiltItems.forEach((item) => {
    item.addEventListener("mousemove", (e) => {
      const rect = item.getBoundingClientRect();
      const rotX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -8;
      const rotY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 8;
      item.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
      item.style.boxShadow = `${-rotY * 1.5}px ${rotX * 1.5}px 30px rgba(28,28,30,0.2)`;
    });
    item.addEventListener("mouseleave", () => { item.style.transform = ""; item.style.boxShadow = ""; });
  });

  const track = document.getElementById("testimonialsTrack");
  const dotsContainer = document.getElementById("testimonialsDots");
  if (track && dotsContainer) {
    const cards = track.querySelectorAll(".tcard");
    let currentIndex = 0;
    let cardsVisible = getCardsVisible();
    function getCardsVisible() { if (window.innerWidth <= 768) return 1; if (window.innerWidth <= 1024) return 2; return 3; }
    function buildDots() {
      dotsContainer.innerHTML = "";
      const n = Math.ceil(cards.length / cardsVisible);
      for (let i = 0; i < n; i++) {
        const dot = document.createElement("button");
        dot.className = "tdot" + (i === currentIndex ? " active" : "");
        dot.setAttribute("aria-label", `Slide ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }
    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, Math.ceil(cards.length / cardsVisible) - 1));
      const cardWidth = track.parentElement.offsetWidth / cardsVisible;
      track.style.transform = `translateX(-${currentIndex * cardWidth * cardsVisible}px)`;
      document.querySelectorAll(".tdot").forEach((d, i) => { d.classList.toggle("active", i === currentIndex); });
    }
    buildDots();
    let autoplay = setInterval(() => { goTo((currentIndex + 1) % Math.ceil(cards.length / cardsVisible)); }, 5000);
    track.closest(".testimonials-carousel").addEventListener("mouseenter", () => clearInterval(autoplay));
    track.closest(".testimonials-carousel").addEventListener("mouseleave", () => {
      autoplay = setInterval(() => { goTo((currentIndex + 1) % Math.ceil(cards.length / cardsVisible)); }, 5000);
    });
    let touchStartX = 0;
    track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", (e) => { const diff = touchStartX - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1); });
    window.addEventListener("resize", () => { cardsVisible = getCardsVisible(); buildDots(); goTo(0); });
  }

  const bookBtn = document.getElementById("bookBtn");
  if (bookBtn) {
    bookBtn.addEventListener("click", () => {
      const name = document.getElementById("bk-name")?.value.trim() || "Guest";
      const service = document.getElementById("bk-service")?.value || "";
      const date = document.getElementById("bk-date")?.value || "";
      const time = document.getElementById("bk-time")?.value || "";
      if (!service) { alert("Please select a service."); return; }
      if (!date) { alert("Please choose a preferred date."); return; }
      const msg = `Hi! I'd like to book an appointment at Jupre Salon and Cosmetic 💅\n\n` +
        `👤 Name: ${name}\n💅 Service: ${service}\n📅 Date: ${date}\n🕐 Time: ${time || "Flexible"}\n\nPlease confirm availability. Thank you!`;
      window.open(`https://wa.me/2347043470896?text=${encodeURIComponent(msg)}`, "_blank");
    });
  }

  const bkDate = document.getElementById("bk-date");
  if (bkDate) bkDate.min = new Date().toISOString().split("T")[0];

  const header = document.getElementById("header");
  window.addEventListener("scroll", () => { header.classList.toggle("scrolled", window.scrollY > 60); });

  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains("open");
      hamburger.classList.toggle("active", !isOpen);
      navMenu.classList.toggle("open", !isOpen);
      document.body.style.overflow = isOpen ? "" : "hidden";
    });
    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => { hamburger.classList.remove("active"); navMenu.classList.remove("open"); document.body.style.overflow = ""; });
    });
    document.addEventListener("click", (e) => {
      if (navMenu.classList.contains("open") && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove("active"); navMenu.classList.remove("open"); document.body.style.overflow = "";
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const headerH = document.getElementById("header")?.offsetHeight || 80;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    });
  });

  const footerYear = document.getElementById("footerYear");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  const aboutImgWrap = document.querySelector("[data-parallax]");
  if (aboutImgWrap) {
    ScrollTrigger.create({
      trigger: aboutImgWrap, start: "top bottom", end: "bottom top",
      onUpdate: (self) => { aboutImgWrap.querySelector(".about-img").style.transform = `translateY(${(self.progress - 0.5) * 40}px)`; },
    });
  }
});
