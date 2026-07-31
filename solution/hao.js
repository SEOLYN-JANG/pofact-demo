/* ============================================================
   하오커뮤니케이션 — main.js
   - Canvas 히어로 애니메이션 (영상 대체)
   - 헤더 스크롤 / 모바일 메뉴 / 스크롤 리빌 / 카운터 / 폼
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. HERO CANVAS (광택 3D 오브가 떠다니는 히어로) ---------- */
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, orbs;
    let mx = 0, my = 0, tmx = 0, tmy = 0; // 마우스 패럴랙스

    // 광택 구(球) 색상 세트: [하이라이트, 본색, 그림자]
    const PALETTE = [
      [[255, 158, 120], [234, 67, 36], [120, 24, 8]],   // 오렌지
      [[255, 190, 150], [255, 122, 69], [150, 52, 18]],  // 코랄
      [[255, 255, 255], [238, 238, 242], [140, 140, 152]], // 화이트
      [[96, 96, 108], [26, 26, 32], [4, 4, 8]],          // 블랙
    ];

    function rand(a, b) { return a + Math.random() * (b - a); }
    function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    }

    function init() {
      const count = Math.max(9, Math.min(18, Math.floor(w / 110)));
      orbs = [];
      for (let i = 0; i < count; i++) {
        const depth = rand(0.4, 1); // 원근감 (클수록 앞·큰·빠름)
        orbs.push({
          x: rand(0, w), y: rand(0, h),
          r: rand(16, 92) * depth,
          depth: depth,
          vx: rand(-0.18, 0.18) * depth,
          vy: rand(-0.14, 0.14) * depth,
          bob: rand(0, Math.PI * 2),
          bobSpeed: rand(0.4, 0.9),
          color: PALETTE[(Math.random() * PALETTE.length) | 0],
        });
      }
      // 앞쪽(큰) 오브가 뒤에 그려지도록 정렬 → 겹침 자연스럽게
      orbs.sort(function (a, b) { return a.depth - b.depth; });
    }

    function drawOrb(o, t) {
      const px = (tmx * 26) * o.depth;
      const py = (tmy * 20) * o.depth + Math.sin(t * o.bobSpeed + o.bob) * 6 * o.depth;
      const x = o.x + px, y = o.y + py, r = o.r;
      const hx = x - r * 0.34, hy = y - r * 0.38; // 하이라이트 위치(좌상단)

      // 바닥 그림자
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = r * 0.55;
      ctx.shadowOffsetY = r * 0.28;
      const base = ctx.createRadialGradient(hx, hy, r * 0.04, x, y, r * 1.05);
      base.addColorStop(0, rgba(o.color[0], 1));
      base.addColorStop(0.4, rgba(o.color[1], 1));
      base.addColorStop(1, rgba(o.color[2], 1));
      ctx.fillStyle = base;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // 림 라이트(하단 가장자리 살짝 반사)
      const rim = ctx.createRadialGradient(x, y + r * 0.5, r * 0.2, x, y, r);
      rim.addColorStop(0, "rgba(255,255,255,0)");
      rim.addColorStop(0.82, "rgba(255,255,255,0)");
      rim.addColorStop(1, rgba(o.color[0], 0.18));
      ctx.fillStyle = rim;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

      // 스페큘러 하이라이트(반짝)
      const spec = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.42);
      spec.addColorStop(0, "rgba(255,255,255,0.9)");
      spec.addColorStop(0.5, "rgba(255,255,255,0.18)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spec;
      ctx.beginPath(); ctx.arc(hx, hy, r * 0.42, 0, Math.PI * 2); ctx.fill();
    }

    function draw(now) {
      const t = now / 1000;
      // 배경: 다크 네이비
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#12182a");
      bg.addColorStop(1, "#0a0e18");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // 마우스 패럴랙스 부드럽게 추종
      tmx += (mx - tmx) * 0.04;
      tmy += (my - tmy) * 0.04;

      orbs.forEach(function (o) {
        o.x += o.vx; o.y += o.vy;
        const m = o.r + 40;
        if (o.x < -m) o.x = w + m; if (o.x > w + m) o.x = -m;
        if (o.y < -m) o.y = h + m; if (o.y > h + m) o.y = -m;
        drawOrb(o, t);
      });

      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    resize();
    requestAnimationFrame(draw);
  }

  /* ---------- 2. HEADER scroll state ---------- */
  const header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll);
  onScroll();

  /* ---------- 2b. ACTIVE nav (현재 페이지 강조) ---------- */
  const curPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".gnb a").forEach((a) => {
    if (a.getAttribute("href") === curPage) a.classList.add("active");
  });

  /* ---------- 3. MOBILE menu ---------- */
  const toggle = document.getElementById("menuToggle");
  const gnb = document.getElementById("gnb");
  if (toggle && gnb) {
    toggle.addEventListener("click", () => gnb.classList.toggle("open"));
    gnb.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => gnb.classList.remove("open"))
    );
  }

  /* ---------- 3b. STORY — HAO 글자 빌드업 ---------- */
  const story = document.getElementById("story");
  if (story) {
    const stage = story.querySelector(".story-stage");
    const col = story.querySelector(".story-col");
    const word = story.querySelector(".hao-word");
    const logo = story.querySelector(".hao-logo");
    const finalEl = document.getElementById("haoFinal");
    const items = Array.prototype.slice
      .call(story.querySelectorAll(".hao-char, .hao-logo"))
      .sort((a, b) => +a.dataset.i - +b.dataset.i);
    const STOPS = items.length + 1; // 글자 빌드 + 마지막 문구
    const sub = document.getElementById("haoSub");
    function layoutCaption() {
      if (!col || !word) return;
      const colR = col.getBoundingClientRect();
      const wordBottom = word.getBoundingClientRect().bottom - colR.top;
      // 구름 중심 X (col 기준) — 구름 아래로 정렬
      let cx = colR.width / 2;
      if (logo && logo.classList.contains("on")) {
        const lr = logo.getBoundingClientRect();
        cx = lr.left + lr.width / 2 - colR.left;
      }
      if (sub) {
        sub.style.left = cx + "px";
        sub.style.top = (wordBottom + 8) + "px";
      }
      if (finalEl) {
        const subH = sub ? sub.offsetHeight : 24;
        finalEl.style.left = cx + "px";
        finalEl.style.top = (wordBottom + 8 + subH + 30) + "px";
      }
    }
    let sTicking = false;
    function storyUpdate() {
      sTicking = false;
      const total = story.offsetHeight - window.innerHeight;
      let p = (window.scrollY - story.offsetTop) / (total || 1);
      p = Math.min(Math.max(p, 0), 0.9999);
      const stop = Math.floor(p * STOPS); // 0..items.length
      stage.classList.toggle("lit", p > 0.004);
      items.forEach((el, i) => el.classList.toggle("on", i <= stop));
      stage.classList.toggle("word-done", stop >= items.length - 1);
      stage.classList.toggle("show-final", stop >= items.length);
      layoutCaption();
    }
    window.addEventListener("scroll", () => {
      if (!sTicking) { sTicking = true; requestAnimationFrame(storyUpdate); }
    }, { passive: true });
    window.addEventListener("resize", storyUpdate);
    storyUpdate();
  }

  /* ---------- 4. SCROLL reveal ---------- */
  const revealEls = document.querySelectorAll(
    ".section-head, .about-lead, .stat, .svc-info, .svc-visual, .contact-form, .s-card, .why-card, .vch-step, .vch-prod, .vch-amt, .vch-table-wrap, .vch-example, .webaeo-card, .webaeo-q"
  );
  revealEls.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- 4b. STAGGERED PLAY (프로세스·비교표) ---------- */
  const playEls = document.querySelectorAll(".ac-proc-grid, .ac-cmp-table, .htl");
  playEls.forEach((el) => el.classList.add("anim"));
  const pio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("play");
          pio.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  playEls.forEach((el) => pio.observe(el));

  /* ---------- 5. COUNTER ---------- */
  const counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    const raw = el.dataset.count || "0";
    const decimals = (raw.split(".")[1] || "").length; // 소수 자릿수 (54.5 → 1)
    const target = parseFloat(raw) || 0;
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const fmt = (v) => v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    if (el._raf) cancelAnimationFrame(el._raf);
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min((now - start) / 2000, 1);
      el.textContent = fmt(ease(t) * target);
      if (t < 1) el._raf = requestAnimationFrame(frame);
    };
    el._raf = requestAnimationFrame(frame);
  }
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const el = e.target;
        if (e.isIntersecting) {
          runCount(el); // 화면에 들어올 때마다 다시 카운팅
        } else {
          if (el._raf) cancelAnimationFrame(el._raf);
          el.textContent = "0"; // 나가면 리셋 → 재진입 시 처음부터
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => cio.observe(el));

  /* ---------- 5b. 학원 등록 목록 (관리자 화면 빠른 스크롤 영상 느낌) ---------- */
  const acFeed = document.getElementById("acFeed");
  if (acFeed) {
    const track = document.getElementById("acFeedTrack");
    if (track) {
      const fams = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "전", "홍", "고", "문", "양", "손"];
      const gens = ["준", "서", "윤", "우", "아", "은", "현", "민", "지", "호", "연", "율", "하", "성", "빈", "경", "원", "희", "규", "찬"];
      const courses = ["초등 수학 정규반", "중등 영어 심화반", "고1 수학 내신반", "초등 종합반", "중등 과학 실험반", "예비중 국어반", "고등 영어 수능반", "초등 영어 파닉스", "중3 수학 집중반", "논술·독서토론반", "초등 사고력 수학", "고2 화학 내신반", "중등 수학 개념반", "초등 코딩반", "고3 수학 파이널", "중등 국어 문법반"];
      const pick = (a) => a[Math.floor(Math.random() * a.length)];
      const mask = () => pick(fams) + "O" + pick(gens);
      const pad = (n) => String(n).padStart(2, "0");
      const fmt = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
      const N = 48;
      let d = new Date();
      let html = "";
      for (let i = 0; i < N; i++) {
        html +=
          '<div class="ac-feed-row">' +
          '<span class="ac-feed-name">' + mask() + "</span>" +
          '<span class="ac-feed-course">' + pick(courses) + "</span>" +
          '<span class="ac-feed-time">' + fmt(d) + "</span>" +
          '<span class="ac-feed-badge"><i></i>등록완료</span>' +
          "</div>";
        d = new Date(d.getTime() - (20 + Math.floor(Math.random() * 400)) * 60000);
      }
      track.innerHTML = html + html; // 이음새 없는 무한 루프용 복제
      // 화면 밖이면 애니메이션 정지 (성능)
      const fio = new IntersectionObserver((entries) => {
        entries.forEach((e) => acFeed.classList.toggle("paused", !e.isIntersecting));
      }, { threshold: 0 });
      fio.observe(acFeed);
    }
  }

  /* ---------- 6. CONTACT form ---------- */
  const form = document.getElementById("contactForm");
  const msg = document.getElementById("formMsg");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        msg.textContent = "필수 항목을 모두 입력해주세요.";
        msg.style.color = "#ff8a3d";
        return;
      }
      // 실제 전송 연동 전 임시 처리 (이메일/백엔드 연동 자리)
      msg.textContent = "상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다!";
      msg.style.color = "#7CFC9B";
      form.reset();
    });
  }

  /* ---------- 6a. 병원 AI 검색 타이핑 목업 ---------- */
  const aiType = document.getElementById("aiType");
  const aiMock = document.getElementById("aiMock");
  const aiAnswer = document.getElementById("aiAnswer");
  if (aiType && aiMock) {
    const text = aiType.dataset.text || "";
    let typing = false, timer = null;
    function startType() {
      if (typing) return;
      typing = true;
      if (aiAnswer) aiAnswer.classList.remove("show");
      let i = 0;
      (function step() {
        aiType.textContent = text.slice(0, i);
        i++;
        if (i <= text.length) timer = setTimeout(step, 65);
        else if (aiAnswer) timer = setTimeout(() => aiAnswer.classList.add("show"), 450);
      })();
    }
    function resetType() {
      typing = false;
      if (timer) clearTimeout(timer);
      aiType.textContent = "";
      if (aiAnswer) aiAnswer.classList.remove("show");
    }
    const tio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) startType(); else resetType(); });
    }, { threshold: 0.4 });
    tio.observe(aiMock);
  }

  /* ---------- 6b. 상담폼 '기타' 입력 토글 ---------- */
  document.querySelectorAll("[data-etc]").forEach((cb) => {
    cb.addEventListener("change", () => {
      const field = cb.closest(".cf-field");
      const etc = field && field.querySelector(".cf-etc-input");
      if (!etc) return;
      etc.hidden = !cb.checked;
      if (cb.checked) etc.focus();
      else etc.value = "";
    });
  });

  /* ---------- 6c. 빠른 상담 팝업 ---------- */
  const quickc = document.getElementById("quickc");
  if (quickc) {
    const qToggle = document.getElementById("quickcToggle");
    const qClose = document.getElementById("quickcClose");
    const qForm = document.getElementById("quickcForm");
    const qMsg = document.getElementById("quickcMsg");
    if (qToggle) qToggle.addEventListener("click", () => quickc.classList.toggle("open"));
    if (qClose) qClose.addEventListener("click", () => quickc.classList.remove("open"));
    quickc.querySelectorAll(".qc-chip input").forEach((cb) => {
      cb.addEventListener("change", () => cb.closest(".qc-chip").classList.toggle("on", cb.checked));
    });
    if (qForm) qForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!qForm.checkValidity()) { qMsg.textContent = "브랜드명과 연락처를 입력해주세요."; return; }
      qMsg.textContent = "신청이 접수되었습니다. 빠르게 연락드리겠습니다!";
      qForm.reset();
      quickc.querySelectorAll(".qc-chip.on").forEach((c) => c.classList.remove("on"));
    });
  }

  /* ---------- 7. CUSTOM CURSOR ---------- */
  const ring = document.getElementById("cursorRing");
  const dot = document.getElementById("cursorDot");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (ring && dot && fine) {
    const label = ring.querySelector(".cursor-label");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    // 링은 살짝 늦게 따라오는 부드러운 움직임
    (function follow() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();

    // 카테고리(네비) — 색다른 모양 + 라벨
    document.querySelectorAll(".gnb a, .footer-nav a").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-nav"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-nav"));
    });

    // 일반 클릭 요소 — 링 확대
    document
      .querySelectorAll(
        ".btn, .header-cta, .svc-arrow, .svc-link, .s-card, .why-card, .logo, input, select, textarea, label, button"
      )
      .forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
        el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
      });

    // 클릭 시 살짝 눌림 효과
    window.addEventListener("mousedown", () => (dot.style.opacity = "0.4"));
    window.addEventListener("mouseup", () => (dot.style.opacity = "1"));
  }

  /* ---------- 8. PORTFOLIO 그리드 필터 + 페이지네이션 ---------- */
  const pfGrid = document.querySelector(".pf-grid");
  if (pfGrid) {
    const PER_PAGE = 9; // 3열 × 3줄
    const pager = document.querySelector(".pf-pager");
    const filters = document.querySelector(".pf-filters");
    const pills = Array.from(document.querySelectorAll(".pf-pill"));
    const cards = Array.from(pfGrid.querySelectorAll(".pf-card"));
    let filter = "all";
    let page = 0;

    const pool = () =>
      cards.filter((c) => filter === "all" || c.dataset.cat === filter);

    function render() {
      const list = pool();
      const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
      if (page > pages - 1) page = pages - 1;
      const start = page * PER_PAGE;
      const shown = new Set(list.slice(start, start + PER_PAGE));
      cards.forEach((c) => c.classList.toggle("is-hidden", !shown.has(c)));
      renderPager(pages);
    }

    function renderPager(pages) {
      pager.innerHTML = "";
      if (pages <= 1) return;
      const btn = (label, cls, disabled, onClick) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "pf-page" + (cls ? " " + cls : "");
        b.innerHTML = label;
        if (disabled) b.disabled = true;
        else b.addEventListener("click", onClick);
        pager.appendChild(b);
      };
      btn("&#8249;", "pf-nav", page === 0, () => go(page - 1));
      for (let i = 0; i < pages; i++) {
        btn(i + 1, i === page ? "is-active" : "", false, () => go(i));
      }
      btn("&#8250;", "pf-nav", page === pages - 1, () => go(page + 1));
    }

    function go(n) {
      page = n;
      render();
      const top = filters.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        filter = pill.dataset.filter;
        page = 0;
        render();
      });
    });

    render();
  }

  /* ---------- 9. HOSPITAL 검색→AI 가로 스크롤 (인디케이터 + 오토플레이) ---------- */
  const hx = document.querySelector(".hx-carousel");
  if (hx) {
    const sec = hx.closest(".hx-sec");
    const track = hx.querySelector(".hx-track");
    const prev = hx.querySelector(".hx-prev");
    const next = hx.querySelector(".hx-next");
    const cards = Array.prototype.slice.call(track.querySelectorAll(".hx-card"));
    const dots = Array.prototype.slice.call((sec || hx).querySelectorAll(".hx-dot"));
    const DELAY = 2800;
    let timer = null;

    const activeIndex = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bd = Infinity;
      cards.forEach((c, i) => {
        const cc = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(cc - mid);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    };

    const goTo = (i) => {
      i = (i + cards.length) % cards.length;
      cards[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    };

    const syncDots = () => {
      const idx = activeIndex();
      cards.forEach((c, i) => c.classList.toggle("is-active", i === idx));
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.classList.toggle("is-disabled", track.scrollLeft <= 2);
      next.classList.toggle("is-disabled", track.scrollLeft >= max);
    };

    const stop = () => { if (timer) { clearInterval(timer); timer = null; } if (sec) sec.classList.add("is-paused"); };
    const play = () => { stop(); if (sec) sec.classList.remove("is-paused"); timer = setInterval(() => goTo(activeIndex() + 1), DELAY); };

    prev.addEventListener("click", () => { goTo(activeIndex() - 1); play(); });
    next.addEventListener("click", () => { goTo(activeIndex() + 1); play(); });
    dots.forEach((d) => d.addEventListener("click", () => { goTo(+d.dataset.i); play(); }));

    let ticking = false;
    track.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; syncDots(); }); }
    }, { passive: true });
    window.addEventListener("resize", syncDots);

    // 마우스 올리면 정지, 벗어나면 재생
    hx.addEventListener("mouseenter", stop);
    hx.addEventListener("mouseleave", play);

    // 화면에 보일 때만 오토플레이
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) play(); else stop(); });
      }, { threshold: 0.25 }).observe(hx);
    } else { play(); }

    syncDots();
  }
})();
