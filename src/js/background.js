chrome.runtime.onInstalled.addListener(function () {
  console.log("CurrencySwift extension installed");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "convertCurrency") {
    // ここに通貨変換ロジックを追加します（後で実装）
    sendResponse({ result: "Conversion logic not implemented yet" });
  }
  return true;
});
