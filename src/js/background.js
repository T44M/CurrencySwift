let CONFIG = {};

async function loadConfig() {
  try {
    const response = await fetch(chrome.runtime.getURL('config.js'));
    const text = await response.text();
    const configText = text.replace(/const\s+CONFIG\s*=\s*/, '').replace(/;$/, '').trim();
    console.log('解析前の設定テキスト:', configText);
    CONFIG = JSON.parse(configText);
    console.log('設定を読み込みました:', CONFIG);
    
    if (!CONFIG.API_KEY || !CONFIG.BASE_URL) {
      throw new Error('必要な設定が見つかりません');
    }
  } catch (error) {
    console.error('設定の読み込みに失敗しました:', error);
    console.error('エラーが発生した設定テキスト:', configText);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await loadConfig();
  console.log('拡張機能が正常に初期化されました');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertCurrency") {
    const { amount, from, to } = request;
    
    if (!CONFIG.BASE_URL || !CONFIG.API_KEY) {
      console.error('設定が正しく読み込まれていません');
      sendResponse({ success: false, error: "設定エラー" });
      return true;
    }

    const url = `${CONFIG.BASE_URL}${CONFIG.API_KEY}/pair/${from}/${to}/${amount}`;
    console.log('リクエストURL:', url);

    fetch(url, { mode: 'cors' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API レスポンス:', data);
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

    return true;
  }
});