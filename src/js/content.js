let logoElement = null;
let conversionPopup = null;

// 安全に要素を削除する関数
function safeRemoveElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

document.addEventListener('mouseup', function() {
  console.log("Mouse up event triggered");

  // 既存の要素を安全に削除
  safeRemoveElement(logoElement);
  safeRemoveElement(conversionPopup);

  let selectedText = window.getSelection().toString().trim();
  console.log("Selected text:", selectedText);

  if (selectedText && !isNaN(selectedText)) {
    console.log("Valid number selected, showing logo");
    showLogo(selectedText);
  }
});

function showLogo(selectedText) {
  console.log("showLogo function called");
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  console.log("Logo position:", rect.left, rect.top);

  logoElement = document.createElement("div");
  logoElement.style.position = "absolute";
  logoElement.style.left = `${rect.left + window.scrollX}px`;
  logoElement.style.top = `${rect.top + window.scrollY - 30}px`;
  logoElement.style.width = "24px";
  logoElement.style.height = "24px";

  const logoUrl = chrome.runtime.getURL("images/logo.png");
  console.log("Logo URL:", logoUrl);
  logoElement.style.backgroundImage = `url('${logoUrl}')`;

  logoElement.style.backgroundSize = "cover";
  logoElement.style.cursor = "pointer";
  logoElement.style.zIndex = "10000";

  logoElement.addEventListener('click', function() {
    convertAndShowPopup(selectedText);
  });

  document.body.appendChild(logoElement);
  console.log("Logo element appended to body");
}

function convertAndShowPopup(amount) {
  console.log("convertAndShowPopup called with amount:", amount);
  chrome.storage.sync.get(["fromCurrency", "toCurrency"], function(items) {
    const fromCurrency = items.fromCurrency || "USD";
    const toCurrency = items.toCurrency || "EUR";
    console.log("Converting from", fromCurrency, "to", toCurrency);

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
      showConversionPopup(amount, response, fromCurrency, toCurrency);
      saveToHistory(amount, response.result, fromCurrency, toCurrency);
    });
  });
}

function showConversionPopup(original, result, fromCurrency, toCurrency) {
  console.log("showConversionPopup called");
  safeRemoveElement(conversionPopup);

  conversionPopup = document.createElement("div");
  conversionPopup.style.position = "absolute";
  conversionPopup.style.left = `${logoElement.offsetLeft}px`;
  conversionPopup.style.top = `${logoElement.offsetTop + 30}px`;
  conversionPopup.style.backgroundColor = "white";
  conversionPopup.style.border = "1px solid #ccc";
  conversionPopup.style.borderRadius = "5px";
  conversionPopup.style.padding = "10px";
  conversionPopup.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  conversionPopup.style.zIndex = "10001";

  if (result.success) {
    conversionPopup.textContent = `${original} ${fromCurrency} = ${result.result} ${toCurrency}`;
  } else {
    conversionPopup.textContent = `変換エラー: ${result.error}`;
    conversionPopup.style.color = 'red';
  }

  document.body.appendChild(conversionPopup);
  console.log("Conversion popup displayed");
}

function saveToHistory(original, converted, fromCurrency, toCurrency) {
  console.log("Saving to history:", original, converted, fromCurrency, toCurrency);
  chrome.storage.local.get({conversionHistory: []}, function(data) {
    let history = data.conversionHistory;
    history.unshift({
      original: original,
      converted: converted,
      fromCurrency: fromCurrency,
      toCurrency: toCurrency,
      date: new Date().toISOString()
    });
    if (history.length > 10) {
      history.pop();
    }
    chrome.storage.local.set({conversionHistory: history}, function() {
      if (chrome.runtime.lastError) {
        console.error("Error saving to history:", chrome.runtime.lastError);
      } else {
        console.log("History saved successfully");
      }
    });
  });
}