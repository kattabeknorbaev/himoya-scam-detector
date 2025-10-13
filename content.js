// Suspicious keyword patterns in Uzbek - 150+ patterns
const suspiciousPatterns = [
  // Money/income scams (30 patterns)
  'pul ishlash', 'tez boyish', 'million', 'dollar', 'pulni ikki barobar',
  'daromad', 'ishonchli daromad', 'uyda ishlash', 'oson pul', 'ko\'p pul',
  'boylik', 'passiv daromad', 'qo\'shimcha daromad', 'yuqori maosh',
  'pul topish', 'daromad olish', 'katta pul', 'boy bo\'lish',
  'pul toplash', 'mablag\'', 'katta mablag\'', 'moliyaviy erkinlik',
  'boy odamlar', 'millioner', 'sermaoya', 'boy bo\'ling',
  'daromad oling', 'pul qozonish', 'katta foyda', 'yuqori daromad',
  
  // Investment scams (25 patterns)
  'investitsiya', 'invest', 'foiz', 'kuniga', 'foyda', 'kafolat',
  'kafolatlangan', 'ishonchli investitsiya', 'crypto', 'kripto', 
  'bitkoin', 'bitcoin', 'trading', 'treyd', 'forex', 'valyuta',
  'binance', 'USDT', 'ETH', 'kriptovalyuta', 'NFT',
  'trading signal', 'trading bot', 'auto trading', 'bozor',
  
  // Urgency and FOMO tactics (20 patterns)
  'tezroq', 'oxirgi imkoniyat', 'bugun', 'hozir', 'shoshiling',
  'shoshilinmasa', 'cheklangan', 'faqat', 'bir necha kishi',
  'yakunda', 'oxirgi kun', 'vaqt tugayapti', 'ulgurish',
  'darhol', 'zudlik bilan', 'o\'tib ketmang', 'imkoniyat',
  'noyob imkoniyat', 'boshqalarda yo\'q', 'maxsus taklif',
  
  // Personal info requests (20 patterns)
  'karta raqami', 'parol', 'kod', 'tasdiqlash', 'PIN',
  'shaxsiy ma\'lumot', 'pasport', 'telefon raqam', 'telefon',
  'SMS kod', 'bank karti', 'plastik karta', 'karta ma\'lumot',
  'login', 'akkaunt', 'raqam yuboring', 'ma\'lumot yuboring',
  'tasdiqlash kodi', 'ID raqam', 'passport seriya',
  
  // Prize/lottery scams (15 patterns)
  'yutib oldingiz', 'yutuq', 'sovrin', 'mukofot', 'sovg\'a',
  'bepul', 'tekin', 'lotereya', 'tanlov', 'g\'olib',
  'siz tanlandingiz', 'tasodifiy tanlash', 'omadli odam',
  'sizga tushdi', 'oldingi g\'olib',
  
  // Platform/contact methods (15 patterns)
  'WhatsApp', 'Telegram', 'admin', 'rasmiy bot', 'bot',
  'lichka', 'direct', 'DM', 'link', 'havola',
  'telegram kanal', 'guruhga qo\'shiling', 'obuna bo\'ling',
  'botga yozing', 'admin bilan bog\'laning',
  
  // Registration/payment (15 patterns)
  'ro\'yxatdan o\'tish', 'ro\'yxatdan o\'ting', 'registratsiya',
  'to\'lov qiling', 'to\'lash', 'oldindan to\'lov', 'depozit',
  'boshlang\'ich to\'lov', 'birinchi to\'lov', 'avans',
  'pul o\'tkazing', 'o\'tkazmalar', 'to\'lov amalga oshiring',
  'karta orqali', 'click', 
  
  // Job/work scams (10 patterns)
  'ish', 'vakansiya', 'xodim', 'ishchi', 'online ish',
  'masofaviy ish', 'part-time', 'to\'liq ish kuni yo\'q',
  'malaka talab qilinmaydi', 'tajriba shart emas',
  
  // Guarantee/promise words (10 patterns)
  '100%', 'garantiya', 'albatta', 'shubhasiz', 'ishonch',
  'halol', 'vijdon', 'to\'g\'ri', 'haqiqiy', 'real',
  
  // Common scam phrases (10 patterns)
  'firibgarlik emas', 'aldamaydi', 'ishonchli kompaniya',
  'litsenziyali', 'rasmiy', 'legal', 'qonuniy',
  'hukumat tasdiqlagan', 'xalqaro kompaniya', 'brendli'
];

// Create optimized regex pattern
const pattern = new RegExp(suspiciousPatterns.join('|'), 'gi');

// Track already scanned elements to avoid re-scanning
const scannedElements = new WeakSet();

function checkText(text) {
  if (!text || text.length < 30) return { suspicious: false };
  
  const matches = text.match(pattern);
  if (matches && matches.length >= 2) {
    return {
      suspicious: true,
      matchCount: matches.length,
      keywords: [...new Set(matches.map(m => m.toLowerCase()))]
    };
  }
  return { suspicious: false };
}

function flagElement(element, result) {
  // Skip if already flagged
  if (element.querySelector('.scam-warning') || 
      element.classList.contains('scam-flagged') ||
      scannedElements.has(element)) {
    return;
  }
  
  // Mark as scanned and flagged
  scannedElements.add(element);
  element.classList.add('scam-flagged');
  
  // Create warning banner
  const warning = document.createElement('div');
  warning.className = 'scam-warning';
  warning.innerHTML = `
    <div class="scam-warning-content">
      <span class="scam-warning-icon">⚠️</span>
      <div class="scam-warning-text">
        <strong>Ehtiyot bo'ling!</strong> Bu matn shubhali kalit so'zlar o'z ichiga oladi (${result.matchCount} ta).
        <br><small>Hech kimga shaxsiy ma'lumot yoki pul bermang. Ko'rish uchun bosing.</small>
      </div>
    </div>
  `;
  
  // Add blur effect
  element.classList.add('blurred-content');
  
  // Insert warning
  try {
    element.parentNode?.insertBefore(warning, element);
  } catch (e) {
    console.log('Himoya: Could not insert warning', e);
    return;
  }
  
  // Click to reveal
  warning.addEventListener('click', () => {
    element.classList.remove('blurred-content');
    warning.style.display = 'none';
  });
}

function scanElement(element) {
  // Skip if already scanned or is a warning
  if (!element || scannedElements.has(element)) return;
  if (element.classList?.contains('scam-warning')) return;
  
  // Skip certain elements for performance
  const tagName = element.tagName;
  if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META', 'LINK'].includes(tagName)) {
    return;
  }
  
  // Get text content
  const text = element.innerText || element.textContent;
  
  // Only check elements with substantial text
  if (text && text.trim().length >= 30 && text.length < 10000) {
    const result = checkText(text);
    if (result.suspicious) {
      flagElement(element, result);
    } else {
      // Mark as scanned even if not suspicious to avoid re-checking
      scannedElements.add(element);
    }
  }
}

function scanPage() {
  // Only scan meaningful containers, not every single element
  const selectors = [
    // Social media specific
    'div[role="article"]',
    'article',
    '[data-testid="post"]',
    '.feed-shared-update-v2',
    
    // General content
    'p',
    'div.post',
    'div.comment',
    'div.message',
    'li',
    'td',
    'blockquote'
  ];
  
  const elements = document.querySelectorAll(selectors.join(','));
  
  // Limit scanning to reasonable number per batch
  const batchSize = 50;
  let count = 0;
  
  for (const element of elements) {
    if (count >= batchSize) break;
    if (!scannedElements.has(element)) {
      scanElement(element);
      count++;
    }
  }
}

// Debounced scan function
let scanTimeout;
function debouncedScan() {
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(scanPage, 1000); // Increased to 1 second
}

// Initial scan
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(scanPage, 500);
  });
} else {
  setTimeout(scanPage, 500);
}

// Observe new content with throttling
let observerActive = true;
const observer = new MutationObserver((mutations) => {
  if (!observerActive) return;
  
  // Only scan if there are actual content changes
  const hasContentChanges = mutations.some(m => 
    m.type === 'childList' && m.addedNodes.length > 0
  );
  
  if (hasContentChanges) {
    debouncedScan();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('Himoya: Active and monitoring (150+ patterns loaded)');