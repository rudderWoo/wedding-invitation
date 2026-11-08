const eventDate = new Date('2027-01-24T12:30:00+09:00');
const days = document.querySelector('#days');
const firstWeekday = new Date(Date.UTC(2027, 0, 18)).getUTCDay();
for (let i = 0; i < firstWeekday; i++) days.append(document.createElement('span'));
for (let day = 18; day <= 31; day++) {
  const el = document.createElement('span');
  el.textContent = day;
  if (day === 24) el.className = 'wedding-day';
  days.append(el);
}
function updateCountdown() {
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const remaining = Math.round((Date.parse('2027-01-24T00:00:00+09:00') - Date.parse(today+'T00:00:00+09:00')) / 86400000);
  document.querySelector('#countdown-text').textContent = remaining > 0 ? `종규와 해빈의 결혼식이 ${remaining}일 남았습니다` : remaining === 0 ? '오늘, 저희 결혼합니다' : '함께해 주셔서 감사합니다';
}
updateCountdown();
setInterval(updateCountdown, 60000);
const track = document.querySelector('#track');
const slides = [...track.children];
let current = 0;
function update(index) {
  current=index;
  document.querySelector('#gallery-count').textContent = (index+1) + ' / ' + slides.length;
  document.querySelector('#photo-status').textContent=`사진 ${index+1} / ${slides.length}`;
}
function show(index) {
  index=(index+slides.length)%slides.length;
  track.scrollTo({left:slides[index].offsetLeft-slides[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
track.addEventListener('scroll',()=>update(Math.max(0, Math.min(slides.length-1, Math.round(track.scrollLeft/(slides[1].offsetLeft-slides[0].offsetLeft))))),{passive:true});
document.querySelector('#prev').addEventListener('click',()=>show(current-1));
document.querySelector('#next').addEventListener('click',()=>show(current+1));
document.querySelector('.gallery').addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));}
});
new ResizeObserver(()=>track.scrollTo({left:slides[current].offsetLeft-slides[0].offsetLeft,behavior:'instant'})).observe(track);
update(0);

track.addEventListener('dblclick', event => event.preventDefault());

const lettering = document.querySelector('.lettering-fallback');
const letteringScene = document.querySelector('.cover-scene');
const letteringMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (lettering && letteringScene) {
  let hasStarted = false;
  const finishLettering = () => letteringScene.classList.remove('lettering-running');
  const startLettering = () => {
    if (hasStarted || letteringMotion.matches || !lettering.naturalWidth) return;
    hasStarted = true;
    letteringScene.classList.add('lettering-running');
  };
  const lastStroke = document.querySelector('.lettering-strokes path:last-child');
  lastStroke.addEventListener('animationend', finishLettering);
  letteringMotion.addEventListener('change', event => { if (event.matches) finishLettering(); });
  if (lettering.complete) startLettering();
  else lettering.addEventListener('load', startLettering, { once: true });
}



const viewer = document.querySelector('#photo-viewer');
const viewerTrack = document.querySelector('#viewer-track');
let viewerIndex = 0;
let viewerOpener;
let openedWithKeyboard = false;
const viewerPhotos = slides.map(slide => {
  const frame = document.createElement('div');
  frame.className = 'viewer-slide';
  const photo = slide.querySelector('img');
  const image = document.createElement('img');
  image.alt = photo.alt;
  image.draggable = false;
  image.decoding = 'async';
  frame.append(image);
  viewerTrack.append(frame);
  return {image, source:photo.src};
});
function loadLarge(index) {
  for (const offset of [-1, 0, 1]) {
    const item = viewerPhotos[(index + offset + slides.length) % slides.length];
    if (!item.image.getAttribute('src')) item.image.src = item.source;
  }
}
function updateLarge(index) {
  viewerIndex = index;
  loadLarge(index);
  document.querySelector('#viewer-count').textContent = (index + 1) + ' / ' + slides.length;
}
function displayLarge(index, instant = false) {
  index = (index + slides.length) % slides.length;
  loadLarge(index);
  viewerTrack.scrollTo({left: index * viewerTrack.clientWidth,
    behavior: instant || letteringMotion.matches ? 'instant' : 'smooth'});
  if (instant) updateLarge(index);
}
function openLarge(index, keyboard = false) {
  viewerOpener = slides[index];
  openedWithKeyboard = keyboard;
  viewer.showModal();
  document.body.style.overflow = 'hidden';
  displayLarge(index, true);
}
slides.forEach((slide, index) => {
  slide.tabIndex = 0;
  slide.setAttribute('aria-label', '사진 ' + (index + 1) + ' / ' + slides.length + ', 크게보기');
  slide.addEventListener('click', () => openLarge(index));
  slide.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); openLarge(index, true);
    }
  });
});
viewerTrack.addEventListener('scroll', () => {
  if (viewerTrack.clientWidth) updateLarge(Math.max(0, Math.min(slides.length - 1,
    Math.round(viewerTrack.scrollLeft / viewerTrack.clientWidth))));
}, {passive:true});
new ResizeObserver(() => { if (viewer.open) displayLarge(viewerIndex, true); }).observe(viewerTrack);
// Touch uses native scrolling and snapping; mouse dragging follows the same strip.
let viewerDrag;
viewerTrack.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  viewerDrag = {x:event.clientX, left:viewerTrack.scrollLeft};
  viewerTrack.setPointerCapture(event.pointerId);
  viewerTrack.classList.add('dragging');
});
viewerTrack.addEventListener('pointermove', event => {
  if (viewerDrag) viewerTrack.scrollLeft = viewerDrag.left - (event.clientX - viewerDrag.x);
});
function finishViewerDrag(event) {
  if (!viewerDrag) return;
  const distance = event.clientX - viewerDrag.x;
  const origin = Math.round(viewerDrag.left / viewerTrack.clientWidth);
  viewerDrag = null;
  viewerTrack.classList.remove('dragging');
  displayLarge(Math.max(0, Math.min(slides.length - 1,
    origin + (Math.abs(distance) > 45 ? (distance < 0 ? 1 : -1) : 0))));
}
viewerTrack.addEventListener('pointerup', finishViewerDrag);
viewerTrack.addEventListener('pointercancel', () => {
  viewerDrag = null; viewerTrack.classList.remove('dragging');
});
viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); displayLarge(viewerIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => {
  document.body.style.overflow = '';
  viewerDrag = null;
  viewerTrack.classList.remove('dragging');
  if (viewerOpener) {
    if (openedWithKeyboard) viewerOpener.focus({preventScroll:true});
    else viewerOpener.blur();
  }
});

// One-time section reveals; content stays visible without JS or with reduced motion.
const revealSections = [...document.querySelectorAll('main > section')];
if ('IntersectionObserver' in window && !letteringMotion.matches) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.06, rootMargin:'0px 0px -6% 0px'});
  revealSections.forEach(section => {
    section.classList.add('section-reveal');
    if (section.getBoundingClientRect().top < window.innerHeight * .94) {
      section.classList.add('section-visible');
    } else sectionObserver.observe(section);
    section.addEventListener('focusin', () => section.classList.add('section-visible'));
  });
  letteringMotion.addEventListener('change', event => {
    if (event.matches) {
      sectionObserver.disconnect();
      revealSections.forEach(section => section.classList.add('section-visible'));
    }
  });
}

let snackbarTimer;
function showCopySnackbar(message, duration = 2600) {
  const snackbar = document.querySelector('#copy-status');
  clearTimeout(snackbarTimer);
  snackbar.textContent = message;
  snackbar.classList.add('is-visible');
  snackbarTimer = setTimeout(() => {
    snackbar.classList.remove('is-visible');
    snackbar.textContent = '';
  }, duration);
}
// Account data is copied only by an explicit button click.
document.querySelectorAll('.copy-account').forEach(button => {
  button.addEventListener('click', async () => {
    const number = button.dataset.account.trim();
    if (!number) return;
    try {
      await navigator.clipboard.writeText(number);
      showCopySnackbar('계좌번호를 복사했습니다');
      button.textContent = '복사 완료';
      setTimeout(() => { button.textContent = '복사하기'; }, 1800);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(button.closest('.account-card').querySelector('.account-number'));
      selection.removeAllRanges(); selection.addRange(range);
      showCopySnackbar('자동 복사가 되지 않았습니다. 선택된 계좌번호를 길게 눌러 복사해 주세요', 6000);
    }
  });
});
