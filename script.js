document.addEventListener('DOMContentLoaded', () => {
const el = {
  input: document.getElementById('qr-input'),
  container: document.getElementById('qr-container'),
  langToggleBtn: document.getElementById('langToggleBtn'),
  langFlag: document.getElementById('langFlag'),
  clearBtn: document.getElementById('clearBtn'),
  downloadPNGBtn: document.getElementById('downloadPNGBtn'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  fullscreenView: document.getElementById('fullscreen-view'),
  fullscreenImg: document.getElementById('fullscreen-img'),
  // Đã loại bỏ fullscreenLogo
  title: document.getElementById('title'),
  placeholder: document.getElementById('placeholder')
};

let qrcodeInstance = null;
let currentLang = 'jp';

const translations = {
  vi: { title: 'Tạo mã QR', placeholder: 'QR sẽ hiển thị ở đây', clear: 'Xóa', download: 'Tải PNG', fullscreen: 'Phóng to', inputPlaceholder: 'Dán link hoặc nhập nội dung', flag: 'images/jp.webp' },
    jp: { title: 'QRコード作成', placeholder: 'ここにQRコードが表示されます', clear: 'クリア', download: 'PNGを保存', fullscreen: '全画面表示', inputPlaceholder: 'リンクまたは内容を入力', flag: 'images/vn.png' }
};

function applyLanguage(lang) {
  el.title.textContent = translations[lang].title;
  el.placeholder.textContent = translations[lang].placeholder;
  el.clearBtn.textContent = translations[lang].clear;
  el.downloadPNGBtn.textContent = translations[lang].download;
  el.fullscreenBtn.textContent = translations[lang].fullscreen;
  el.input.placeholder = translations[lang].inputPlaceholder;
  el.langFlag.src = translations[lang].flag;
}

function clearQR() {
  el.container.innerHTML = `<span id="placeholder" class="text-slate-400">${translations[currentLang].placeholder}</span>`;
  el.downloadPNGBtn.disabled = true;
  el.fullscreenBtn.disabled = true;
  qrcodeInstance = null;
}

function createQR(text) {
  if (!text) text = el.input.value.trim();
  if (!text) { clearQR(); return; }
  el.container.innerHTML = '';
  qrcodeInstance = new QRCode(el.container, {
    text,
    width: 256,
    height: 256,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
  // Tạo canvas ẩn 512x512 để lấy ảnh chất lượng cao khi fullscreen
  el._hiddenCanvas = document.createElement('canvas');
  el._hiddenCanvas.width = 512;
  el._hiddenCanvas.height = 512;
  const ctx = el._hiddenCanvas.getContext('2d');
  // Vẽ lại QR lên canvas lớn
  setTimeout(() => {
    const smallCanvas = el.container.querySelector('canvas');
    if (smallCanvas) {
      ctx.drawImage(smallCanvas, 0, 0, 512, 512);
    }
  }, 100);
  // Không thêm logo vào QR code
  el.downloadPNGBtn.disabled = false;
  el.fullscreenBtn.disabled = false;
}

function downloadPNG() {
  if (!qrcodeInstance) return;
  const canvas = el.container.querySelector('canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

function enterFullscreen(elm) {
  if (elm.requestFullscreen) return elm.requestFullscreen();
  if (elm.webkitRequestFullscreen) return elm.webkitRequestFullscreen();
  if (elm.msRequestFullscreen) return elm.msRequestFullscreen();
}
function exitFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen();
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  if (document.msExitFullscreen) return document.msExitFullscreen();
}

function fullscreenQR() {
  if (!qrcodeInstance) return;
  // Lấy ảnh chất lượng cao từ canvas ẩn
  if (el._hiddenCanvas) {
    el.fullscreenImg.src = el._hiddenCanvas.toDataURL('image/png');
    el.fullscreenView.classList.remove('hidden');
    el.fullscreenView.classList.add('flex');
    enterFullscreen(el.fullscreenView);
    document.documentElement.classList.add('overflow-hidden');
    el.fullscreenView.focus();
  }
}

function closeFullscreenQR() {
  el.fullscreenView.style.display = 'none';
  document.documentElement.style.overflow = '';
  exitFullscreen();
}

el.fullscreenView.addEventListener('click', closeFullscreenQR);
el.fullscreenView.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeFullscreenQR();
});
el.container.addEventListener('click', () => {
  if (qrcodeInstance) fullscreenQR();
});

el.langToggleBtn.addEventListener('click', () => {
  currentLang = currentLang === 'vi' ? 'jp' : 'vi';
  applyLanguage(currentLang);
  clearQR();
  createQR();
});
el.input.addEventListener('input', () => createQR());
el.clearBtn.addEventListener('click', () => { el.input.value = ''; clearQR(); el.input.focus(); });
el.downloadPNGBtn.addEventListener('click', downloadPNG);
el.fullscreenBtn.addEventListener('click', fullscreenQR);

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && el.fullscreenView.style.display !== 'none') {
    el.fullscreenView.classList.add('hidden');
    el.fullscreenView.classList.remove('flex');
    document.documentElement.classList.remove('overflow-hidden');
  }
});

applyLanguage(currentLang);
el.input.value = 'https://example.com';
createQR();
el.input.select();
});