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
  if (d.readyState !== 'loading') reveal();
  else d.addEventListener('DOMContentLoaded', reveal);
})();
