import { API_KEY, BASE_URL } from '../config.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertCurrency") {
    const { amount, from, to } = request;
    fetch(`${BASE_URL}${API_KEY}/pair/${from}/${to}/${amount}`)
      .then(response => response.json())
      .then(data => {
        if (data.result === "success") {
          sendResponse({ success: true, result: data.conversion_result });
        } else {
          sendResponse({ success: false, error: "API返答エラー: " + data.error });
        }
      })
      .catch(error => {
        console.error("通貨変換エラー:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // 非同期レスポンスのために必要
  }
});