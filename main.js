document.getElementById('site-header').innerHTML = `
  <header>
    <div class="header-eyebrow"><span></span> Open Source Project</div>
    <h1>
      <span class="h1-line1">Make Your First</span>
      <span class="h1-line2">Contribution</span>
    </h1>
    <p>Add your card with a pull request and join fellow contributors from around the world.</p>
    <div class="search-wrap">
      <svg class="search-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" id="search-input" placeholder="Search by name..." autocomplete="off" />
    </div>
    <div id="contributor-count"></div>
  </header>
`;

document.getElementById('site-footer').innerHTML = `
  <footer>
    Built with ❤️ by the community &nbsp;·&nbsp;
    <a href="https://github.com/your-username/your-repo" target="_blank">Contribute on GitHub</a>
  </footer>
`;

const suits = ['♠','♥','♦','♣'];
const grid = document.getElementById('card-grid');
const allWraps = Array.from(grid.querySelectorAll('.card-wrap'));
const allCards = allWraps.map(w => w.querySelector('.card'));
const countEl = document.getElementById('contributor-count');

allCards.forEach((card, i) => {
  card.querySelector('.card-number').textContent = `#${String(i + 1).padStart(3, '0')}`;
  card.querySelector('.card-suit').textContent = suits[i % 4];

  const avatarEl = card.querySelector('.avatar');
  const imgUrl = card.dataset.avatar;
  const name = card.querySelector('.card-name')?.textContent.trim() || '';
  const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (imgUrl) {
    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = name;
    img.onerror = () => { img.remove(); avatarEl.textContent = initials; };
    avatarEl.appendChild(img);
  } else {
    avatarEl.textContent = initials;
  }
});

function updateCount(n) {
  countEl.innerHTML = `<span class="count-num">${n}</span> contributor${n !== 1 ? 's' : ''}`;
}

updateCount(allCards.length);

allCards.forEach(card => {
  const shine = card.querySelector('.card-shine');
  const holo = card.querySelector('.card-holo');

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;

    const rotX = dy * -14;
    const rotY = dx * 14;

    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    card.style.boxShadow = `
      ${-dx * 20}px ${-dy * 20}px 50px rgba(0,0,0,0.6),
      0 0 60px rgba(139,119,255,${0.1 + Math.abs(dx) * 0.15})
    `;

    const pctX = Math.round((x / rect.width) * 100);
    const pctY = Math.round((y / rect.height) * 100);

    shine.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
    shine.style.opacity = '1';

    holo.style.background = `
      linear-gradient(
        ${105 + dx * 30}deg,
        rgba(139,119,255,0) 0%,
        rgba(139,119,255,${0.08 + Math.abs(dx) * 0.1}) ${20 + dy * 10}%,
        rgba(255,111,216,${0.1 + Math.abs(dy) * 0.1}) 50%,
        rgba(100,200,255,${0.08 + Math.abs(dx) * 0.08}) ${80 + dy * 10}%,
        rgba(139,119,255,0) 100%
      )
    `;
    holo.style.opacity = '1';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
    shine.style.opacity = '0';
    holo.style.opacity = '0';
  });
});

const PAGE_SIZE = 8;
let visibleWraps = [];
let rendered = 0;

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelector('.card').classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function showWrap(wrap) {
  wrap.style.display = 'block';
  observer.observe(wrap);
}

function renderNext() {
  const next = visibleWraps.slice(rendered, rendered + PAGE_SIZE);
  next.forEach((wrap, i) => setTimeout(() => showWrap(wrap), i * 100));
  rendered += next.length;
}

function applySearch(query) {
  const q = query.trim().toLowerCase();
  allWraps.forEach(wrap => {
    wrap.style.display = 'none';
    wrap.querySelector('.card').classList.remove('visible');
  });
  visibleWraps = q
    ? allWraps.filter(w => {
        const visibleName = (w.querySelector('.card-name')?.textContent || '').toLowerCase();
        return visibleName.includes(q);
      })
    : [...allWraps];
  rendered = 0;
  renderNext();

  let noResults = document.getElementById('no-results');
  if (!noResults) {
    noResults = document.createElement('div');
    noResults.id = 'no-results';
    noResults.textContent = 'No contributors found.';
    grid.appendChild(noResults);
  }
  noResults.style.display = visibleWraps.length === 0 ? 'block' : 'none';
  updateCount(visibleWraps.length);
}

allWraps.forEach(w => w.style.display = 'none');
visibleWraps = [...allWraps];
renderNext();

document.getElementById('search-input').addEventListener('input', e => applySearch(e.target.value));

window.addEventListener('scroll', () => {
  if (rendered >= visibleWraps.length) return;
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 400) {
    renderNext();
  }
}, { passive: true });