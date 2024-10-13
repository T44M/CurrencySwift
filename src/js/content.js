// スタイルの定義（content.jsの先頭に追加）
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');

  .currency-swift-bar {
    font-family: 'Roboto', sans-serif;
    background: linear-gradient(135deg, rgba(44, 62, 80, 0.85), rgba(52, 73, 94, 0.85));
    color: #ffffff;
    border-radius: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .currency-swift-bar-content {
    padding: 0 15px;
    white-space: nowrap;
    font-size: 16px;
    font-weight: 500;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
`;

let logoElement = null;
let conversionBar = null;
let clickListenerAdded = false;

function applyStyles() {
  if (!document.getElementById('currency-swift-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'currency-swift-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}

function showLogo(selectedText) {
  try {
    console.log("showLogo function called");
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    console.log("Logo position:", rect.left, rect.top);

    if (logoElement) {
      document.body.removeChild(logoElement);
    }

    logoElement = document.createElement("div");
    logoElement.style.position = "fixed";
    logoElement.style.left = `${rect.left + window.scrollX}px`;
    logoElement.style.top = `${rect.top + window.scrollY - 30}px`;
    logoElement.style.width = "24px";
    logoElement.style.height = "24px";
    logoElement.style.borderRadius = "12px";
    logoElement.style.backgroundImage = `url(${chrome.runtime.getURL("images/logo.png")})`;
    logoElement.style.backgroundSize = "cover";
    logoElement.style.cursor = "pointer";
    logoElement.style.zIndex = "10000";
    logoElement.style.transition = "all 0.3s ease-in-out";

    logoElement.addEventListener('click', function(event) {
      event.stopPropagation();
      console.log("Logo clicked");
      convertAndShowBar(selectedText);
    });

    document.body.appendChild(logoElement);
    console.log("Logo element appended to body");

    // 直後のクリックイベントを無視するフラグを立てる
    ignoreNextClick = true;
    setTimeout(() => {
      ignoreNextClick = false;
    }, 100);

    if (!clickListenerAdded) {
      document.addEventListener('click', closeLogoAndBar);
      clickListenerAdded = true;
    }
  } catch (error) {
    console.error("Error in showLogo:", error);
  }
}

// バーの作成と表示を行う関数
function createAndShowBar(startLeft, startTop) {
  applyStyles();

  conversionBar = document.createElement("div");
  conversionBar.className = 'currency-swift-bar';
  conversionBar.style.position = "fixed";
  conversionBar.style.left = `${startLeft}px`;
  conversionBar.style.top = `${startTop}px`;
  conversionBar.style.width = "40px";
  conversionBar.style.height = "40px";
  conversionBar.style.opacity = "0";

  const content = document.createElement("div");
  content.className = 'currency-swift-bar-content';
  conversionBar.appendChild(content);

  document.body.appendChild(conversionBar);

  // 初期アニメーション
  requestAnimationFrame(() => {
    conversionBar.style.opacity = "1";
  });
}

function convertAndShowBar(amount) {
  console.log("convertAndShowBar called with amount:", amount);
  chrome.storage.sync.get(["fromCurrency", "toCurrency"], function(items) {
    const fromCurrency = items.fromCurrency || "USD";
    const toCurrency = items.toCurrency || "EUR";

    // バーの初期表示を即座に行う
    const rect = logoElement.getBoundingClientRect();
    animateLogoToBar(rect.left, rect.top);

    chrome.runtime.sendMessage({
      action: "convertCurrency",
      amount: amount,
      from: fromCurrency,
      to: toCurrency
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error in sendMessage:", chrome.runtime.lastError);
        updateBarContent("Error: Conversion failed");
        return;
      }
      console.log("Conversion response:", response);
      updateBarContent(formatAmount(response.result, toCurrency));
    });
  });
}

// バーの内容を更新する関数
function updateBarContent(text) {
  if (conversionBar) {
    const content = conversionBar.querySelector('.currency-swift-bar-content');
    content.textContent = text;

    // テキストの幅に基づいてバーの幅を調整
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.font = window.getComputedStyle(content).font;
    tempSpan.textContent = text;
    document.body.appendChild(tempSpan);
    
    const textWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);

    const newWidth = Math.max(180, textWidth + 40); // 最小幅は180px
    
    requestAnimationFrame(() => {
      conversionBar.style.width = `${newWidth}px`;
    });
  }
}

function formatAmount(amount, currency) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
}

function animateLogoToBar(startLeft, startTop) {
  console.log("animateLogoToBar called");
  if (!logoElement) {
    console.error("Logo element not found");
    return;
  }

  // ロゴを非表示にするアニメーション
  logoElement.style.transition = "opacity 0.2s ease-in-out";
  logoElement.style.opacity = "0";

  createAndShowBar(startLeft, startTop);
  updateBarContent("Converting...");

  // ロゴ要素を完全に削除
  setTimeout(() => {
    if (logoElement && logoElement.parentNode) {
      logoElement.parentNode.removeChild(logoElement);
      logoElement = null;
    }
  }, 200);

  // バーが表示された後にクリックリスナーを追加
  if (!clickListenerAdded) {
    document.addEventListener('click', closeLogoAndBar);
    clickListenerAdded = true;
  }
}

function closeLogoAndBar(event) {
  console.log("closeLogoAndBar called");
  if (conversionBar && !conversionBar.contains(event.target)) {
    console.log("Closing bar");
    conversionBar.style.width = "40px";
    conversionBar.style.opacity = "0";

    setTimeout(() => {
      if (conversionBar && conversionBar.parentNode) {
        conversionBar.parentNode.removeChild(conversionBar);
        conversionBar = null;
      }
      if (clickListenerAdded) {
        document.removeEventListener('click', closeLogoAndBar);
        clickListenerAdded = false;
      }
    }, 300);
  }
}

document.addEventListener('mouseup', function(event) {
  if (!event || !event.target) return;

  console.log("Mouse up event triggered");
  try {
    let selectedText = window.getSelection().toString().trim();
    console.log("Selected text:", selectedText);

    if (selectedText && !isNaN(selectedText)) {
      console.log("Valid number selected, showing logo");
      showLogo(selectedText);
    }
  } catch (error) {
    console.error("Error in mouseup event:", error);
  }
});

// 初期化時にロゴ画像をプリロード
const logoImg = new Image();
logoImg.src = chrome.runtime.getURL("images/logo.png");