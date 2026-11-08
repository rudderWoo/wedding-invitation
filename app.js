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
  document.querySelector('#countdown').textContent = remaining > 0 ? `종규와 해빈의 결혼식이 ${remaining}일 남았습니다. ♥` : remaining === 0 ? '오늘, 저희 결혼합니다.' : '함께해 주셔서 감사합니다.';
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

const lettering = document.querySelector(".lettering-image");
if (lettering) {
  const revealLettering = () => lettering.classList.add("lettering-ready");
  if (lettering.complete && lettering.naturalWidth > 0) revealLettering();
  else lettering.addEventListener("load", revealLettering, { once: true });
}


const viewer = document.querySelector('#photo-viewer');
const viewerImage = document.querySelector('#viewer-image');
let viewerIndex = 0;
let viewerOpener;
function displayLarge(index) {
  viewerIndex = (index + slides.length) % slides.length;
  const photo = slides[viewerIndex].querySelector('img');
  viewerImage.src = photo.src;
  viewerImage.alt = photo.alt;
  document.querySelector('#viewer-count').textContent = (viewerIndex + 1) + ' / ' + slides.length;
}
function openLarge(index) {
  viewerOpener = document.activeElement;
  displayLarge(index);
  viewer.showModal();
  document.body.style.overflow = 'hidden';
}
slides.forEach((slide, index) => {
  slide.tabIndex = 0;
  slide.setAttribute('aria-label', '사진 ' + (index + 1) + ' / ' + slides.length + ', 크게보기');
  slide.addEventListener('click', () => openLarge(index));
  slide.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); openLarge(index);
    }
  });
});
viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
viewer.querySelector('.viewer-prev').addEventListener('click', () => displayLarge(viewerIndex - 1));
viewer.querySelector('.viewer-next').addEventListener('click', () => displayLarge(viewerIndex + 1));
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); displayLarge(viewerIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => {
  document.body.style.overflow = '';
  if (viewerOpener) viewerOpener.focus({preventScroll:true});
});
