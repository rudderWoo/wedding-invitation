(() => {
  const messages = {
    ko: {
      title:'종규 ♥ 해빈 — 결혼합니다', accountsTitle:'마음 전하실 곳(계좌 정보)',
      countdown:'종규와 해빈의 결혼식이 {days}일 남았습니다', today:'오늘, 저희 결혼합니다', thanks:'함께해 주셔서 감사합니다',
      photoStatus:'사진 {index} / {total}', photoOpen:'사진 {index} / {total}, 크게보기', photoAlt:'종규와 해빈의 웨딩 사진 {index}',
      copy:'복사하기', copied:'복사 완료', copiedMessage:'계좌번호를 복사했습니다', copyFailed:'자동 복사가 되지 않았습니다. 선택된 계좌번호를 길게 눌러 복사해 주세요'
    },
    en: {
      title:"Jonggyu ♥ Haebin — We're getting married", accountsTitle:'With Love (Bank Details)',
      countdown:'{days} days until Jonggyu & Haebin’s wedding', today:'Today is our wedding day', thanks:'Thank you for celebrating with us',
      photoStatus:'Photo {index} of {total}', photoOpen:'Photo {index} of {total}, open full size', photoAlt:'Jonggyu and Haebin’s wedding photo {index}',
      copy:'Copy', copied:'Copied', copiedMessage:'Account number copied', copyFailed:'Unable to copy automatically. Please press and hold the selected account number to copy it.'
    }
  };
  let language = 'ko';
  try { language = new URL(location.href).searchParams.get('lang') || localStorage.getItem('wedding-language') || 'ko'; } catch {}
  if (!messages[language]) language = 'ko';
  const textEntries = [
    ['.cover h1', 'Jonggyu & Haebin are getting married'],
    ['.message p:nth-child(1)', 'From colleagues to a couple, and now partners for life.'],
    ['.message p:nth-child(2)', 'Together, we are beginning a new chapter as a family, built on love.'],
    ['.message p:nth-child(3)', 'Please join us as we celebrate the start of our life together.'],
    ['.families p:nth-child(1) span', 'Myeongcheol Woo · Jeongseon Lee'],
    ['.families p:nth-child(1) small', 'eldest son'],
    ['.families p:nth-child(1) strong', 'Jonggyu'],
    ['.families p:nth-child(2) span', 'Seongdae Choi · Eungyeong Lee'],
    ['.families p:nth-child(2) small', 'eldest daughter'],
    ['.families p:nth-child(2) strong', 'Haebin'],
    ['#date-heading', 'Sun, Jan 24, 2027 · 12:30 PM'],
    ['.location h3', 'Apelgamo Gwanghwamun'],
    ['.venue-address', 'Tower A, LL Floor, The K Twin Towers, 50 Jong-ro 1-gil, Jongno-gu, Seoul'],
    ['.map-links a:nth-child(1)', 'Naver Map ↗'], ['.map-links a:nth-child(2)', 'Kakao Map ↗'],
    ['.gift-note', 'Your love and warm wishes are more than enough. Thank you from the bottom of our hearts.'],
    ['[data-side="groom"] h3', 'Groom'], ['[data-side="bride"] h3', 'Bride'],
    ['[data-side="groom"] .account-bank', 'IBK Industrial Bank of Korea'],
    ['[data-side="bride"] .account-bank', 'Hana Bank']
  ].map(([selector,en]) => {const el=document.querySelector(selector); return {el,ko:el.textContent,en};});
  const attrs = [
    ['.language-toggle','aria-label','Choose language'],
    ['.down','aria-label','Read our invitation'],
    ['.calendar','aria-label','January 2027 calendar. Our wedding is on Sunday, January 24.'],
    ['.gallery','aria-label','Wedding photo gallery'],
    ['#prev','aria-label','Previous photo'],['#next','aria-label','Next photo'],
    ['#photo-viewer','aria-label','Full-size wedding photos'],
    ['.viewer-close','aria-label','Close photo viewer'],
    ['#viewer-track','aria-label','Full-size photos. Swipe left or right to browse.'],
    ['.gift-section','aria-label','With love and bank details'],
    ['[data-side="groom"] .copy-account','aria-label','Copy groom’s account number'],
    ['[data-side="bride"] .copy-account','aria-label','Copy bride’s account number'],
    ['.cover-photo img','alt','Jonggyu and Haebin smiling and holding hands'],
    ['.venue-map','alt','Apelgamo Gwanghwamun at The K Twin Towers, Tower A, LL floor. Near Gyeongbokgung Station Exit 6 and Gwanghwamun Station Exit 2.']
  ].map(([selector,attr,en])=>{const el=document.querySelector(selector);return {el,attr,ko:el.getAttribute(attr),en};});
  const map=document.querySelector('.venue-map');
  const koreanMap=map.getAttribute('src');
  const englishMap=koreanMap.replace('venue-map-light.png','venue-map-en.svg');
  function t(key, values={}) {
    return (messages[language][key] || key).replace(/\{(\w+)\}/g, (_,name)=>values[name] ?? '');
  }
  function applyLanguage(next) {
    language = messages[next] ? next : 'ko';
    document.documentElement.lang=language;
    document.title=t('title');
    for (const entry of textEntries) entry.el.textContent=entry[language];
    for (const entry of attrs) entry.el.setAttribute(entry.attr,entry[language]);
    document.querySelector('[data-i18n="accountsTitle"]').textContent=t('accountsTitle');
    document.querySelectorAll('.copy-account').forEach(el=>el.textContent=t('copy'));
    document.querySelectorAll('#track img').forEach((el,index)=>{el.alt=t('photoAlt',{index:index+1});});
    map.src=language==='en'?englishMap:koreanMap;
    document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
    try {localStorage.setItem('wedding-language',language);} catch {}
    const url=new URL(location.href);
    if(language==='en') url.searchParams.set('lang','en'); else url.searchParams.delete('lang');
    try {history.replaceState(null,'',url);} catch {}
    window.dispatchEvent(new Event('wedding-language-change'));
  }
  window.weddingI18n={t, get language(){return language;},setLanguage:applyLanguage};
  document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>applyLanguage(button.dataset.language)));
  applyLanguage(language);
})();
