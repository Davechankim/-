/* BEST 생태계 — 사이트 인터랙션
   모든 동작은 점진적 향상입니다. JS가 꺼져 있어도 내용은 전부 보입니다. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 관찰 도우미 ---------- */
  function onVisible(el, cb, opts) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(el); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); }
      });
    }, opts || { threshold: 0.25 });
    io.observe(el);
  }

  /* ---------- 테마 ---------- */
  var THEME_KEY = 'best-theme';
  function applyTheme(t, persist) {
    if (t === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    var tb = $('#themeBtn'); if (tb) tb.setAttribute('aria-pressed', String(t === 'dark'));
    if (persist) { try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* 저장 불가 환경 */ } }
  }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    if (saved === 'light' || saved === 'dark') applyTheme(saved, false);
  })();
  function toggleTheme() {
    var isDark = root.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark', true);
  }
  var themeBtn = $('#themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  /* ---------- 히어로 로드 시퀀스 ---------- */
  $$('.hero-title .w').forEach(function (w, i) { w.style.setProperty('--i', i); });
  function markLoaded() {
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('loaded'); }); });
  }
  if (document.fonts && document.fonts.ready) {
    var done = false;
    var go = function () { if (!done) { done = true; markLoaded(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 400); /* 폰트가 늦어도 0.4초 뒤에는 시작 */
  } else { markLoaded(); }

  /* ---------- 상단바 · 진행 바 · 메뉴 ---------- */
  var topbar = $('#topbar');
  var progressBar = $('#progressBar');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (topbar) topbar.classList.toggle('scrolled', y > 10);
    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
      /* 포커스가 메뉴 밖(버튼 제외)으로 나가면 닫는다 */
      var to = e.relatedTarget;
      if (nav.classList.contains('open') && to && !nav.contains(to) && to !== menuBtn) closeMenu(false);
    });
    /* 메뉴 밖을 탭하면 닫기만 한다: 그 탭의 click은 한 번 삼켜 아래에 깔린 버튼·링크가 눌리지 않게 한다 (상단바 안의 버튼은 통과) */
    var dismissTap = false;
    document.addEventListener('pointerdown', function (e) {
      dismissTap = false;
      if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMenu(false);
        dismissTap = !(topbar && topbar.contains(e.target));
      }
    });
    document.addEventListener('pointercancel', function () { dismissTap = false; });
    document.addEventListener('click', function (e) {
      if (dismissTap) { dismissTap = false; e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ---------- 섹션 목록 · 점 내비 · 활성 링크 ---------- */
  var sections = $$('main > .section');
  var dots = $('#dots');
  if (dots) {
    sections.forEach(function (s, i) {
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.innerHTML = '<span>ST.' + (i < 10 ? '0' + i : i) + ' ' + (s.getAttribute('data-title') || s.id) + '</span>';
      a.setAttribute('aria-label', s.getAttribute('data-title') || s.id);
      a.tabIndex = -1;
      dots.appendChild(a);
    });
  }
  var navIds = $$('.nav a').map(function (a) { return a.getAttribute('href').slice(1); });
  function setActive(id) {
    /* 상단 내비에 없는 섹션이면 가장 가까운 앞 섹션의 링크를 활성으로 유지 */
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
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revIO.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function (el) { revIO.observe(el); });
    window.setTimeout(function () {
      revealEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
      });
    }, 1200);
  }
  onVisible($('#contact'), function (el) { el.classList.add('in'); }, { threshold: 0.2 });

  /* ---------- 노선도 ---------- */
  var STATIONS = {
    base: { line: 'base', lineName: '환승역', title: '공통 기반', who: '모든 서비스가 함께 쓰는 레일',
      body: '계정·사업자·점포·상품 기준·파일·거래 연결·재고 연동·배송/픽업·권한·알림·감사기록. 하나의 로그인으로 들어오지만, 어떤 회사·점포의 자료를 볼 수 있는지는 요청마다 따로 검사합니다.',
      tags: ['하나의 계정', '점포별 격리', '감사기록'] },
    bestmarket: { line: 'consumer', lineName: '소비자선', title: '베스트마켓', who: '개인 고객 ↔ 본사 직영 판매',
      body: '본사가 직접 판매하는 상품을 사는 곳. 본사 상품 구성·판매가격·주문·고객 응대·판매 운영을 독립적으로 책임집니다. 플랫폼 운영 권한과는 분리합니다.',
      tags: ['본사 직영', '픽업점 연계', '독립 운영'] },
    bestmart: { line: 'consumer', lineName: '소비자선', title: '베스트마트 온라인몰', who: '개인 고객 ↔ 기존 마트·협력사',
      body: '내가 이용하는 동네 마트의 상품을 사는 곳. 기존 상호를 유지하는 매장별 온라인몰로, 매장별 상품·가격·판매 가능 수량·배송/픽업 조건·고객 응대를 점주가 정합니다. 간판과 POS를 바꾸지 않습니다.',
      tags: ['간판 유지', 'POS 교체 없음', '매장별 조건'] },
    hub: { line: 'business', lineName: '사업자선', title: '베스트마켓 운영허브 (가칭)', who: '점주·판매점 ↔ 다른 점주·공급사',
      body: '점주들이 거래하는 공간. 상품자료 공유·공급 제안·구매 요청·사업자 거래·공동구매를 다루며, 일반 마트·판매점·반무인 픽업전문점이 참여합니다. 본사 직원만 쓰는 관리자 화면이 아닙니다.',
      tags: ['상품자료 공유', '공동구매', '픽업전문점'] },
    erp: { line: 'work', lineName: '업무선', title: 'ERP', who: '각 사업체의 내부 업무 기록',
      body: '재고·매입·매출·근태·정산 등 확정된 정보를 관리합니다. 거래 상대와 연결되더라도 판매점의 매출과 구매점의 매입은 각자의 ERP에 따로 기록합니다.',
      tags: ['확정 기록', '공식 업무 API', '회사별 분리'] },
    messenger: { line: 'work', lineName: '업무선', title: '메신저', who: '사람이 쓰는 공통 창구',
      body: '직원 간 업무, 거래처 상담, 주문 확인, 명령·승인. 매장 내부 대화, 점포·거래처 간 대화, 소비자 상담은 같은 기술 위에서도 접근 범위와 AI 권한을 다르게 둡니다.',
      tags: ['업무카드', '승인함', '외부 공유'] },
    argos: { line: 'work', lineName: '업무선 · 사업자선 환승', title: 'ARGOS', who: '서비스와 AI 에이전트의 조정',
      body: '허용된 범위에서 여러 서비스의 상태를 모으고, 확인할 사항을 제안하며, 승인된 실행을 연결합니다. 서비스 정의서와 관계도를 함께 관리해 어떤 서비스가 무엇에 의존하는지 보여줍니다.',
      tags: ['상태 수집', 'AI 제안', '승인된 실행'] },
    next: { line: 'next', lineName: '예정', title: '다음 서비스', who: '기존 레일 위에 역을 추가',
      body: '픽업 전용 서비스, 배달매장 OS 같은 새 서비스는 계정·점포·주문을 처음부터 만들지 않고 기존 기반을 연결받아 고유한 업무 규칙과 화면을 개발합니다. 서비스 정의서로 이용자·역할·책임·연결 규칙을 먼저 정합니다.',
      tags: ['서비스 정의서', '기반 재사용', '독립 추가'] }
  };
  var metro = $('#metro');
  var panel = $('#mapPanel');
  function showStation(id) {
    var d = STATIONS[id];
    if (!d || !panel) return;
    $$('.station', metro).forEach(function (s) { var on = s.getAttribute('data-id') === id; s.classList.toggle('is-active', on); s.setAttribute('aria-pressed', String(on)); });
    panel.setAttribute('data-line', d.line);
    $('#panelLine').textContent = d.lineName;
    $('#panelTitle').textContent = d.title;
    $('#panelWho').textContent = d.who;
    $('#panelBody').textContent = d.body;
    var tags = $('#panelTags');
    tags.innerHTML = '';
    d.tags.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; tags.appendChild(li); });
    panel.classList.remove('swap');
    void panel.offsetWidth;
    panel.classList.add('swap');
    /* 한 열 배치(<960px)에서는 설명이 노선도 아래에 있어, 제목이 화면 밖이면 최소한만 끌어올린다 */
    if (window.matchMedia && window.matchMedia('(max-width: 959.98px)').matches) {
      var title = $('#panelTitle');
      if (title && title.getBoundingClientRect().bottom > window.innerHeight) title.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    }
  }
  if (metro) {
    onVisible(metro, function () { metro.classList.add('drawn'); }, { threshold: 0.3 });
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

  /* ---------- 탭 ---------- */
  $$('.tabs').forEach(function (tabs) {
    var btns = $$('[role="tab"]', tabs);
    var panels = $$('[role="tabpanel"]', tabs);
    panels.forEach(function (p) { $$('.chain li', p).forEach(function (li, i) { li.style.setProperty('--i', i); }); });
    function activate(btn) {
      btns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) {
        var on = p.id === btn.getAttribute('aria-controls');
        p.hidden = !on;
        p.classList.toggle('is-active', on);
      });
    }
    activate(btns.filter(function (b) { return b.classList.contains('is-active'); })[0] || btns[0]);
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { activate(b); });
      b.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = btns[(i + 1) % btns.length];
        if (e.key === 'ArrowLeft') n = btns[(i - 1 + btns.length) % btns.length];
        if (e.key === 'Home') n = btns[0];
        if (e.key === 'End') n = btns[btns.length - 1];
        if (n) { e.preventDefault(); e.stopPropagation(); n.focus(); activate(n); }
      });
    });
  });

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
  /* 승인 카드가 나타난 뒤에는 카드 상단을 기준으로 고정해, 시연이 끝났을 때 승인 장면이 온전히 보이게 한다 */
  var chatPin = null;
  function scrollChat() {
    if (!chatBody) return;
    if (chatPin) chatBody.scrollTop += (chatPin.getBoundingClientRect().top - chatBody.getBoundingClientRect().top) - 48;
    else chatBody.scrollTop = chatBody.scrollHeight;
  }
  function addMsg(kind, html) {
    var m = el('div', 'msg' + (kind === 'me' ? ' me' : ''));
    var who = el('span', 'who', kind === 'me' ? '농산팀 담당자' : '<i>A</i>ARGOS');
    var b = el('div', 'bubble', html);
    m.appendChild(who); m.appendChild(b);
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
      '<div class="ccard-head"><span>우장산점 · 농산팀 · 오늘 발주</span><span class="code">조회 결과</span></div>' +
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
      '<div class="ccard-head"><span>발주 승인 요청</span><span class="code">승인 대기</span></div>' +
      '<div class="ccard-body">' +
      '<div class="ccard-row"><span>매장 · 팀</span><b>우장산점 · 농산팀</b></div>' +
      '<div class="ccard-row"><span>내용</span><b>대파 추가 발주 50단</b></div>' +
      '<div class="ccard-row"><span>승인권자</span><b>점주</b></div>' +
      '<div class="ccard-row"><span>실행</span><span>승인하면 ERP에 발주 전달</span></div>' +
      '</div>' +
      '<div class="ccard-actions"><button type="button" class="btn btn-primary ok">승인</button><button type="button" class="btn btn-secondary no">거절</button></div>';
    m.appendChild(c);
    chatBody.appendChild(m); scrollChat();
    var ok = $('.ok', c), no = $('.no', c), done = false, auto;
    function finish(approved) {
      if (done || run !== chatRun) return;
      done = true; clearTimeout(auto);
      ok.disabled = true; no.disabled = true;
      c.classList.remove('pending');
      c.classList.add(approved ? 'approved' : 'rejected');
      $('.ccard-head .code', c).textContent = approved ? '승인됨' : '거절됨';
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
    var stopBtn = $('#chatStop');
    if (stopBtn) stopBtn.addEventListener('click', stopChat);
  }

  /* ---------- 로드맵 진행선 ---------- */
  var road = $('#road');
  if (road) {
    var stages = $$('.stage', road);
    function updateRoad() {
      var last = -1;
      stages.forEach(function (s, i) { if (s.classList.contains('is-on')) last = i; });
      if (last < 0) { road.style.setProperty('--p', '0%'); return; }
      var s = stages[last];
      var mid = s.offsetTop + s.offsetHeight / 2;
      road.style.setProperty('--p', Math.min(100, (mid / road.offsetHeight) * 100) + '%');
    }
    if (reduced || !('IntersectionObserver' in window)) {
      stages.forEach(function (s) { s.classList.add('is-on'); });
      updateRoad();
    } else {
      var roadIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-on'); roadIO.unobserve(e.target); updateRoad(); }
        });
      }, { threshold: 0.6 });
      stages.forEach(function (s) { roadIO.observe(s); });
      window.addEventListener('resize', updateRoad);
    }
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
    var onControl = t && t.closest && t.closest('button, a, summary, [role="button"], [role="tab"]');
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
    $$('.faq details').forEach(function (d) { if (!d.open) { d.open = true; printOpened.push(d); } });
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
