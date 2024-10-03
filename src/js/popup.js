document.addEventListener('DOMContentLoaded', function() {
  const convertButton = document.getElementById('convertButton');
  const amountInput = document.getElementById('amountInput');
  const resultDiv = document.getElementById('result');
  const fromCurrencySelect = document.getElementById('fromCurrency');
  const toCurrencySelect = document.getElementById('toCurrency');

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
      } else {
        resultDiv.textContent = `エラー: ${response.error}`;
        resultDiv.style.color = "red";
      }
    });
  });
});