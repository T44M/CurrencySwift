chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertCurrency") {
    const { amount, from, to } = request;
    fetch(`${BASE_URL}${API_KEY}/pair/${from}/${to}/${amount}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
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
        sendResponse({ success: false, error: "変換中にエラーが発生しました。後でもう一度お試しください。" });
      });
    return true; // 非同期レスポンスのために必要
  }
});