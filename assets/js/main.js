/* BEST 생태계 — 사이트 인터랙션 (v4)
   모든 동작은 점진적 향상입니다. JS가 꺼져 있어도 내용은 전부 보입니다. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function onVisible(el, cb, opts) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(el); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); } });
    }, opts || { threshold: 0.25 });
    io.observe(el);
  }

  /* ---------- 히어로 로드 시퀀스 ---------- */
  $$('.hero .say .w').forEach(function (w, i) { w.style.setProperty('--i', i); });
  function markLoaded() {
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('loaded'); }); });
  }
  if (document.fonts && document.fonts.ready) {
    var done = false;
    var go = function () { if (!done) { done = true; markLoaded(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 400); /* 폰트가 늦어도 0.4초 뒤에는 시작 */
  } else { markLoaded(); }

  /* ---------- 상단바: 스크롤 상태 · 아래 막의 톤 따라가기 · 진행 바 ---------- */
  var topbar = $('#topbar');
  var progressBar = $('#progressBar');
  var sections = $$('main > .section');
  function toneAt() {
    /* 상단바 바로 아래 1px에 있는 막의 톤을 따른다(앵커 이동 뒤 상단바가 이전 막의 끝자락을 덮고 있어도 새 막의 톤) */
    var probe = (topbar ? topbar.getBoundingClientRect().height : 56) + 1;
    for (var i = sections.length - 1; i >= 0; i--) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) return sections[i].getAttribute('data-tone') || 'dark';
    }
    return sections.length ? (sections[sections.length - 1].getAttribute('data-tone') || 'dark') : 'dark';
  }
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (topbar) {
      topbar.classList.toggle('scrolled', y > 10);
      var t = toneAt();
      if (topbar.getAttribute('data-tone') !== t) topbar.setAttribute('data-tone', t);
    }
    if (progressBar) {
      var max = root.scrollHeight - window.innerHeight;
      progressBar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- 모바일 메뉴 ---------- */
  var menuBtn = $('#menuBtn');
  var nav = $('#nav');
  function closeMenu(returnFocus) {
    if (!nav) return;
    var wasOpen = nav.classList.contains('open');
    nav.classList.remove('open');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', '메뉴 열기');
      if (returnFocus && wasOpen) menuBtn.focus();
    }
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(false); });
    nav.addEventListener('focusout', function (e) {
      var to = e.relatedTarget;
      if (nav.classList.contains('open') && to && !nav.contains(to) && to !== menuBtn) closeMenu(false);
    });
    /* 메뉴 밖을 탭하면 닫기만 한다: 그 탭의 click은 한 번 삼켜 아래 버튼이 눌리지 않게 (상단바 안은 통과) */
    var dismissTap = false;
    document.addEventListener('pointerdown', function (e) {
      dismissTap = false;
      if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMenu(false);
        dismissTap = !(topbar && topbar.contains(e.target));
      }
    });
    document.addEventListener('pointercancel', function () { dismissTap = false; });
    document.addEventListener('click', function (e) { if (dismissTap) { dismissTap = false; e.preventDefault(); e.stopPropagation(); } }, true);
  }

  /* ---------- 점 내비 · 활성 링크 ---------- */
  var dots = $('#dots');
  if (dots) {
    sections.forEach(function (s, i) {
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.innerHTML = '<span>' + (s.getAttribute('data-title') || s.id) + '</span>';
      a.setAttribute('aria-label', s.getAttribute('data-title') || s.id);
      a.tabIndex = -1;
      dots.appendChild(a);
    });
  }
  var navIds = $$('.nav a').map(function (a) { return a.getAttribute('href').slice(1); });
  function setActive(id) {
    var navId = id, idx = sections.map(function (s) { return s.id; }).indexOf(id);
    while (idx > 0 && navIds.indexOf(navId) < 0) { idx -= 1; navId = sections[idx].id; }
    $$('.nav a').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + navId); });
    $$('.dots a').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
  }
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { secIO.observe(s); });
  }

  /* ---------- 스크롤 등장 (1회) ---------- */
  $$('[data-stagger]').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i); });
  });
  var revealEls = $$('[data-reveal], [data-stagger]');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revIO.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revIO.observe(el); });
    window.setTimeout(function () {
      revealEls.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in'); });
    }, 1200);
  }
  onVisible($('#contact'), function (el) { el.classList.add('in'); }, { threshold: 0.2 });

  /* ---------- 노선도 ---------- */
  var STATIONS = {
    base: { title: '공통 기반', who: '모든 서비스가 함께 쓰는 레일',
      body: '계정·사업자·점포·상품 기준·파일·거래 연결·재고 연동·배송/픽업·권한·알림·감사기록. 하나의 로그인으로 들어오지만, 어떤 회사·점포의 자료를 볼 수 있는지는 요청마다 따로 검사합니다.' },
    bestmarket: { title: '베스트마켓', who: '개인 고객 ↔ 본사 직영 판매',
      body: '본사가 직접 판매하는 상품을 사는 곳. 본사 상품 구성·판매가격·주문·고객 응대·판매 운영을 독립적으로 책임집니다. 플랫폼 운영 권한과는 분리합니다.' },
    bestmart: { title: '베스트마트 온라인몰', who: '개인 고객 ↔ 기존 마트·협력사',
      body: '내가 이용하는 동네 마트의 상품을 사는 곳. 기존 상호를 유지하는 매장별 온라인몰로, 매장별 상품·가격·판매 가능 수량·배송/픽업 조건·고객 응대를 점주가 정합니다. 간판과 POS를 바꾸지 않습니다.' },
    hub: { title: '베스트마켓 운영허브 (가칭)', who: '점주·판매점 ↔ 다른 점주·공급사',
      body: '점주들이 거래하는 공간. 상품자료 공유·공급 제안·구매 요청·사업자 거래·공동구매를 다루며, 일반 마트·판매점·반무인 픽업전문점이 참여합니다. 본사 직원만 쓰는 관리자 화면이 아닙니다.' },
    erp: { title: 'ERP', who: '각 사업체의 내부 업무 기록',
      body: '재고·매입·매출·근태·정산 등 확정된 정보를 관리합니다. 거래 상대와 연결되더라도 판매점의 매출과 구매점의 매입은 각자의 ERP에 따로 기록합니다.' },
    messenger: { title: '메신저', who: '사람이 쓰는 공통 창구',
      body: '직원 간 업무, 거래처 상담, 주문 확인, 명령·승인. 매장 내부 대화, 점포·거래처 간 대화, 소비자 상담은 같은 기술 위에서도 접근 범위와 AI 권한을 다르게 둡니다.' },
    argos: { title: 'ARGOS', who: '서비스와 AI 에이전트의 조정',
      body: '허용된 범위에서 여러 서비스의 상태를 모으고, 확인할 사항을 제안하며, 승인된 실행을 연결합니다. 서비스 정의서와 관계도를 함께 관리해 어떤 서비스가 무엇에 의존하는지 보여줍니다.' },
    next: { title: '다음 서비스', who: '기존 레일 위에 역을 추가',
      body: '픽업 전용 서비스, 배달매장 OS 같은 새 서비스는 계정·점포·주문을 처음부터 만들지 않고 기존 기반을 연결받아 고유한 업무 규칙과 화면을 개발합니다. 서비스 정의서로 이용자·역할·책임·연결 규칙을 먼저 정합니다.' }
  };
  var metro = $('#metro');
  var panel = $('#mapPanel');
  function showStation(id) {
    var d = STATIONS[id];
    if (!d || !panel) return;
    $$('.station', metro).forEach(function (s) { var on = s.getAttribute('data-id') === id; s.classList.toggle('is-active', on); s.setAttribute('aria-pressed', String(on)); });
    $('#panelTitle').textContent = d.title;
    $('#panelWho').textContent = d.who;
    $('#panelBody').textContent = d.body;
    panel.classList.remove('swap');
    void panel.offsetWidth;
    panel.classList.add('swap');
    /* 설명이 화면 밖이면 최소한만 끌어올린다 */
    var t = $('#panelTitle');
    if (t && t.getBoundingClientRect().bottom > window.innerHeight) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  }
  if (metro) {
    /* 노선도는 무대 등장이 거의 끝난 뒤에 긋는다 */
    onVisible(metro, function () { setTimeout(function () { metro.classList.add('drawn'); }, reduced ? 0 : 300); }, { threshold: 0.3 });
    var stage = $('.map-stage');
    function centerStage() { if (stage && stage.scrollWidth > stage.clientWidth) stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2; }
    centerStage();
    window.addEventListener('resize', centerStage);
    $$('.station', metro).forEach(function (s) {
      s.addEventListener('click', function () { showStation(s.getAttribute('data-id')); });
      s.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showStation(s.getAttribute('data-id')); }
      });
    });
  }

  /* ---------- 채팅 시연 ---------- */
  var chatBody = $('#chatBody');
  var chatRun = 0;
  var chatTimers = [];
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  /* 승인 카드가 나타난 뒤에는 카드 상단을 기준으로 고정해, 시연이 끝났을 때 승인 장면이 온전히 보이게 한다 (안쪽 스크롤이 있는 폭에서만 의미) */
  var chatPin = null;
  function scrollChat() {
    if (!chatBody) return;
    if (chatPin) chatBody.scrollTop += (chatPin.getBoundingClientRect().top - chatBody.getBoundingClientRect().top) - 48;
    else chatBody.scrollTop = chatBody.scrollHeight;
  }
  function addMsg(kind, html) {
    var m = el('div', 'msg' + (kind === 'me' ? ' me' : ''));
    m.appendChild(el('span', 'who', kind === 'me' ? '농산팀 담당자' : '<i>A</i>ARGOS'));
    m.appendChild(el('div', 'bubble', html));
    chatBody.appendChild(m); scrollChat();
    return m;
  }
  function addSys(cls, text) {
    var s = el('div', 'sys' + (cls ? ' ' + cls : ''), text);
    chatBody.appendChild(s); scrollChat();
    return s;
  }
  function addTyping() {
    var m = el('div', 'msg');
    m.setAttribute('aria-hidden', 'true');
    m.appendChild(el('span', 'who', '<i>A</i>ARGOS'));
    m.appendChild(el('div', 'bubble typing', '<i></i><i></i><i></i>'));
    chatBody.appendChild(m); scrollChat();
    return m;
  }
  function dataCard() {
    var m = el('div', 'msg');
    m.appendChild(el('span', 'who', '<i>A</i>ARGOS'));
    var c = el('div', 'ccard');
    c.innerHTML =
      '<div class="ccard-head"><span>우장산점 · 농산팀 · 오늘 발주</span><span class="tag">조회 결과</span></div>' +
      '<div class="ccard-body">' +
      '<div class="ccard-row"><span>대파</span><b>100단</b></div>' +
      '<div class="ccard-row"><span>양파</span><b>20망</b></div>' +
      '<div class="ccard-row"><span>배추</span><b>30망</b></div>' +
      '<div class="ccard-warn">대파 재고가 기준 이하입니다.</div>' +
      '</div>';
    m.appendChild(c);
    chatBody.appendChild(m); scrollChat();
  }
  function approveCard(run) {
    var m = el('div', 'msg');
    chatPin = m;
    m.appendChild(el('span', 'who', '<i>A</i>ARGOS'));
    addSys('', '시연: 여기부터 점주 화면입니다');
    var c = el('div', 'ccard pending');
    c.innerHTML =
      '<div class="ccard-head"><span>발주 승인 요청</span><span class="tag">승인 대기</span></div>' +
      '<div class="ccard-body">' +
      '<div class="ccard-row"><span>매장 · 팀</span><b>우장산점 · 농산팀</b></div>' +
      '<div class="ccard-row"><span>내용</span><b>대파 추가 발주 50단</b></div>' +
      '<div class="ccard-row"><span>승인권자</span><b>점주</b></div>' +
      '<div class="ccard-row"><span>실행</span><span>승인하면 ERP에 발주 전달</span></div>' +
      '</div>' +
      '<div class="ccard-actions"><button type="button" class="btn btn-primary ok">승인</button><button type="button" class="btn btn-ghost no">거절</button></div>';
    m.appendChild(c);
    chatBody.appendChild(m); scrollChat();
    var ok = $('.ok', c), no = $('.no', c), done = false, auto;
    function finish(approved) {
      if (done || run !== chatRun) return;
      done = true; clearTimeout(auto);
      ok.disabled = true; no.disabled = true;
      c.classList.remove('pending');
      c.classList.add(approved ? 'approved' : 'rejected');
      $('.ccard-head .tag', c).textContent = approved ? '승인됨' : '거절됨';
      if (approved) {
        addSys('ok', '승인자·시각 기록 → ERP 발주 전달 → 감사기록 저장');
        setTimeout(function () { if (run === chatRun) addMsg('bot', 'ERP에 발주를 전달했습니다. 입고 결과는 이 대화로 알려드립니다.'); }, reduced ? 0 : 600);
      } else {
        addSys('no', '거절 기록 · 데이터 변경 없음');
        setTimeout(function () { if (run === chatRun) addMsg('bot', '발주 요청이 거절되었습니다. ERP는 바뀌지 않았습니다.'); }, reduced ? 0 : 600);
      }
    }
    ok.addEventListener('click', function () { finish(true); });
    no.addEventListener('click', function () { finish(false); });
    auto = setTimeout(function () {
      if (done || run !== chatRun) return;
      addSys('', '시연: 점주가 승인을 누릅니다');
      setTimeout(function () { finish(true); }, 600);
    }, 6000);
  }
  function playChat() {
    if (!chatBody) return;
    var run = ++chatRun;
    chatTimers.forEach(clearTimeout); chatTimers = [];
    if (chatBody.offsetHeight) chatBody.style.minHeight = chatBody.offsetHeight + 'px'; /* 재생 중 높이 유지 */
    chatBody.innerHTML = '';
    chatPin = null;
    var t = 0;
    var d = function (ms) { return reduced ? 0 : ms; };
    function at(ms, fn) { t += d(ms); chatTimers.push(setTimeout(function () { if (run === chatRun) fn(); }, t)); }
    var typing;
    at(200, function () { addMsg('me', '오늘 우장산점 농산팀 발주 상황 확인해줘.'); });
    at(500, function () { typing = addTyping(); });
    at(700, function () { typing.remove(); addMsg('bot', 'ERP에서 발주 정보를 조회하겠습니다.'); });
    at(500, function () { typing = addTyping(); });
    at(800, function () { typing.remove(); dataCard(); });
    at(1100, function () { addMsg('me', '대파 50단 추가 발주해.'); });
    at(500, function () { typing = addTyping(); });
    at(700, function () { typing.remove(); approveCard(run); });
  }
  var chat = $('#chat');
  function stopChat() { chatRun++; chatTimers.forEach(clearTimeout); chatTimers = []; $$('.typing', chatBody).forEach(function (t) { t.parentNode.remove(); }); }
  if (chat && chatBody) {
    onVisible(chat, function () { playChat(); }, { threshold: 0.35 });
    var replay = $('#chatReplay');
    if (replay) replay.addEventListener('click', playChat);
    window.addEventListener('resize', function () { chatBody.style.minHeight = ''; });
    var stopBtn = $('#chatStop');
    if (stopBtn) stopBtn.addEventListener('click', stopChat);
  }

  /* ---------- 키보드 섹션 이동 (프레젠테이션) ---------- */
  var targetIdx = null, settleTimer = 0;
  function clearTarget() { targetIdx = null; }
  function currentIndex() {
    if (targetIdx !== null) return targetIdx;
    var y = (window.scrollY || window.pageYOffset) + 80;
    var idx = 0;
    sections.forEach(function (s, i) { if (s.offsetTop <= y) idx = i; });
    return idx;
  }
  function goTo(i) {
    i = Math.max(0, Math.min(sections.length - 1, i));
    targetIdx = i;
    sections[i].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    clearTimeout(settleTimer);
    settleTimer = setTimeout(clearTarget, 1200);
  }
  window.addEventListener('scroll', function () {
    if (targetIdx === null) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(clearTarget, 160);
  }, { passive: true });
  ['wheel', 'touchstart', 'pointerdown'].forEach(function (ev) { window.addEventListener(ev, clearTarget, { passive: true }); });
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    var tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    var onControl = t && t.closest && t.closest('button, a, summary, [role="button"]');
    if ((e.key === ' ' || e.key === 'Enter') && onControl) return;
    switch (e.key) {
      case 'PageDown': case ' ': {
        if (e.shiftKey) return;
        var cur = sections[currentIndex()];
        if (targetIdx === null && cur && cur.getBoundingClientRect().bottom > window.innerHeight + 8) return;
        e.preventDefault(); goTo(currentIndex() + 1); break;
      }
      case 'ArrowRight':
        e.preventDefault(); goTo(currentIndex() + 1); break;
      case 'PageUp': {
        var prevCur = sections[currentIndex()];
        if (targetIdx === null && prevCur && prevCur.getBoundingClientRect().top < -8) return;
        e.preventDefault(); goTo(currentIndex() - 1); break;
      }
      case 'ArrowLeft':
        e.preventDefault(); goTo(currentIndex() - 1); break;
      case 'Escape':
        closeMenu(true); break;
    }
  });

  /* ---------- 인쇄: 접힌 항목을 펼치고 등장 상태를 모두 보이게 ---------- */
  var printOpened = [];
  window.addEventListener('beforeprint', function () {
    root.classList.add('loaded');
    revealEls.forEach(function (el) { el.classList.add('in'); });
    if (metro) metro.classList.add('drawn');
    $$('.acc details').forEach(function (d) { if (!d.open) { d.open = true; printOpened.push(d); } });
  });
  window.addEventListener('afterprint', function () {
    printOpened.forEach(function (d) { d.open = false; });
    printOpened = [];
  });

  /* ---------- 히어로 노선 불빛 일시정지 ---------- */
  var railSvg = $('.rail svg'), railPause = $('#railPause');
  if (railPause && railSvg) {
    if (reduced || typeof railSvg.pauseAnimations !== 'function') railPause.hidden = true;
    railPause.addEventListener('click', function () {
      var paused = railSvg.animationsPaused();
      if (paused) railSvg.unpauseAnimations(); else railSvg.pauseAnimations();
      railPause.setAttribute('aria-pressed', String(!paused));
      railPause.textContent = paused ? '불빛 멈춤' : '불빛 재생';
    });
  }

  /* ---------- 동작 줄이기 환경 ---------- */
  if (reduced) {
    root.classList.add('loaded');
    $$('animateMotion').forEach(function (a) { a.parentNode.removeChild(a); });
  }
})();
