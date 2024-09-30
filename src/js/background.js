// config.js から設定を読み込む
const { API_KEY, BASE_URL } = config;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertCurrency") {
    const { amount, from, to } = request;
    fetch(`${BASE_URL}${API_KEY}/pair/${from}/${to}/${amount}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.result === "success") {
          sendResponse({ result: data.conversion_result });
        } else {
          sendResponse({ error: "Conversion failed" });
        }
      })
      .catch((error) => {
        sendResponse({ error: "API request failed" });
      });
    return true; // 非同期レスポンスのために必要
  }
});
