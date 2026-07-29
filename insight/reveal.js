/* POFACT — 스크롤 리빌 (progressive enhancement) */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('js'); /* head에서 즉시 실행 → 첫 페인트 전 숨김 상태 적용(깜빡임 방지) */
  function reveal() {
    var els = [].slice.call(d.querySelectorAll('.post, .ccard, .feat'));
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
    /* 안전장치: 2.5초 뒤 남은 요소 모두 표시 */
    setTimeout(function () { els.forEach(function (e) { e.classList.add('in'); }); }, 2500);
  }
  function tilt() {
    if (window.matchMedia('(hover:none)').matches || window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    [].slice.call(d.querySelectorAll('.ccard, .feat')).forEach(function (c) {
      c.style.transition = 'transform .16s cubic-bezier(.2,.7,.2,1), box-shadow .2s';
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(800px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 7).toFixed(2) + 'deg) translateY(-5px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }
  function start() { reveal(); tilt(); }
  if (d.readyState !== 'loading') start();
  else d.addEventListener('DOMContentLoaded', start);
})();
