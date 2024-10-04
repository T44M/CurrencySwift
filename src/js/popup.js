document.addEventListener('DOMContentLoaded', function() {
  const convertButton = document.getElementById('convertButton');
  const amountInput = document.getElementById('amountInput');
  const resultDiv = document.getElementById('result');
  const fromCurrencySelect = document.getElementById('fromCurrency');
  const toCurrencySelect = document.getElementById('toCurrency');
  const historyDiv = document.getElementById('history');

  loadConversionHistory();

  convertButton.addEventListener('click', function() {
    const amount = amountInput.value;
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (!amount || isNaN(amount)) {
      resultDiv.textContent = "有効な数値を入力してください";
      resultDiv.style.color = "red";
      return;
    }

    chrome.runtime.sendMessage({
      action: "convertCurrency",
      amount: amount,
      from: fromCurrency,
      to: toCurrency
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("メッセージングエラー:", chrome.runtime.lastError);
        resultDiv.textContent = "内部エラーが発生しました";
        resultDiv.style.color = "red";
      } else if (response.success) {
        resultDiv.textContent = `${amount} ${fromCurrency} = ${response.result} ${toCurrency}`;
        resultDiv.style.color = "green";
        saveToHistory(amount, response.result, fromCurrency, toCurrency);
        loadConversionHistory();
      } else {
        resultDiv.textContent = `エラー: ${response.error}`;
        resultDiv.style.color = "red";
      }
    });
  });
});

function loadConversionHistory() {
  chrome.storage.local.get({conversionHistory: []}, function(data) {
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '<h3>変換履歴</h3>';
    data.conversionHistory.forEach(function(item) {
      const historyItem = document.createElement('div');
      historyItem.textContent = `${item.original} ${item.fromCurrency} = ${item.converted} ${item.toCurrency} (${new Date(item.date).toLocaleString()})`;
      historyDiv.appendChild(historyItem);
    });
  });
}

function saveToHistory(original, converted, fromCurrency, toCurrency) {
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
    chrome.storage.local.set({conversionHistory: history});
  });
}