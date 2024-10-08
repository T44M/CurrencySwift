let logoElement = null;
let conversionBar = null;
let clickListenerAdded = false;
let ignoreNextClick = false;

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

function convertAndShowBar(amount) {
  console.log("convertAndShowBar called with amount:", amount);
  chrome.storage.sync.get(["fromCurrency", "toCurrency"], function(items) {
    const fromCurrency = items.fromCurrency || "USD";
    const toCurrency = items.toCurrency || "EUR";

    chrome.runtime.sendMessage({
      action: "convertCurrency",
      amount: amount,
      from: fromCurrency,
      to: toCurrency
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error in sendMessage:", chrome.runtime.lastError);
        return;
      }
      console.log("Conversion response:", response);
      animateLogoToBar(amount, response.result, toCurrency);
    });
  });
}

function animateLogoToBar(originalAmount, convertedAmount, toCurrency) {
  console.log("animateLogoToBar called");
  if (!logoElement) {
    console.error("Logo element not found");
    return;
  }

  const rect = logoElement.getBoundingClientRect();
  const startLeft = rect.left;
  const startTop = rect.top;

  conversionBar = document.createElement("div");
  conversionBar.style.position = "fixed";
  conversionBar.style.left = `${startLeft}px`;
  conversionBar.style.top = `${startTop}px`;
  conversionBar.style.width = "24px";
  conversionBar.style.height = "24px";
  conversionBar.style.backgroundColor = "#333";
  conversionBar.style.color = "#fff";
  conversionBar.style.borderRadius = "12px";
  conversionBar.style.display = "flex";
  conversionBar.style.alignItems = "center";
  conversionBar.style.justifyContent = "center";
  conversionBar.style.overflow = "hidden";
  conversionBar.style.transition = "all 0.3s ease-in-out";
  conversionBar.style.zIndex = "10001";
  conversionBar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  conversionBar.style.opacity = "0";

  document.body.appendChild(conversionBar);

  // アニメーション
  setTimeout(() => {
    conversionBar.style.width = "180px";
    conversionBar.style.height = "36px";
    conversionBar.style.borderRadius = "18px";
    conversionBar.style.opacity = "1";
    conversionBar.innerHTML = `
      <div style="font-size: 14px; white-space: nowrap; padding: 0 10px;">
        ${convertedAmount} ${toCurrency}
      </div>
    `;
    console.log("Conversion bar expanded");
  }, 50);

  // 画面のどこかをクリックしたらバーを閉じる
  document.addEventListener('click', closeConversionBar);
}

function closeLogoAndBar(event) {
  if (ignoreNextClick) {
    console.log("Ignoring click event");
    return;
  }

  if ((logoElement && !logoElement.contains(event.target)) || 
      (conversionBar && !conversionBar.contains(event.target))) {
    console.log("Closing logo and bar");
    if (conversionBar) {
      conversionBar.style.width = "24px";
      conversionBar.style.height = "24px";
      conversionBar.style.borderRadius = "12px";
      conversionBar.style.opacity = "0";
      conversionBar.innerHTML = "";

      setTimeout(() => {
        if (conversionBar && conversionBar.parentNode) {
          conversionBar.parentNode.removeChild(conversionBar);
          conversionBar = null;
        }
      }, 300);
    }

    if (logoElement) {
      logoElement.style.opacity = "0";
      setTimeout(() => {
        if (logoElement && logoElement.parentNode) {
          logoElement.parentNode.removeChild(logoElement);
          logoElement = null;
        }
      }, 300);
    }

    if (clickListenerAdded) {
      document.removeEventListener('click', closeLogoAndBar);
      clickListenerAdded = false;
    }
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
    } else if (logoElement) {
      closeLogoAndBar(event);
    }
  } catch (error) {
    console.error("Error in mouseup event:", error);
  }
});

// 初期化時にロゴ画像をプリロード
const logoImg = new Image();
logoImg.src = chrome.runtime.getURL("images/logo.png");