// config.js の内容をインラインで定義
const API_KEY = "あなたのAPIキー";
const BASE_URL = "https://v6.exchangerate-api.com/v6/";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertCurrency") {
    const { amount, from, to } = request;
    fetch(`${BASE_URL}${API_KEY}/pair/${from}/${to}/${amount}`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();  // まずテキストとして読み込む
  })
  .then(text => {
    try {
      return JSON.parse(text);  // JSONとしてパースを試みる
    } catch (e) {
      console.error('Failed to parse response as JSON:', text);
      throw new Error('Invalid response from server');
    }
  })
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