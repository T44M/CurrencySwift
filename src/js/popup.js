document.addEventListener("DOMContentLoaded", function () {
  const convertButton = document.getElementById("convertButton");
  const amountInput = document.getElementById("amountInput");
  const resultDiv = document.getElementById("result");

  convertButton.addEventListener("click", function () {
    const amount = amountInput.value;
    chrome.runtime.sendMessage(
      { action: "convertCurrency", text: amount },
      function (response) {
        resultDiv.textContent = response.result;
      }
    );
  });
});document.addEventListener('DOMContentLoaded', function() {
  const convertButton = document.getElementById('convertButton');
  const amountInput = document.getElementById('amountInput');
  const resultDiv = document.getElementById('result');

  convertButton.addEventListener('click', function() {
    const amount = amountInput.value;
    if (!amount || isNaN(amount)) {
      resultDiv.textContent = "有効な数値を入力してください";
      resultDiv.style.color = "red";
      return;
    }

    chrome.runtime.sendMessage({
      action: "convertCurrency",
      amount: amount,
      from: 'USD', // オプションから取得するように更新可能
      to: 'EUR'    // オプションから取得するように更新可能
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("メッセージングエラー:", chrome.runtime.lastError);
        resultDiv.textContent = "内部エラーが発生しました";
        resultDiv.style.color = "red";
      } else if (response.success) {
        resultDiv.textContent = `${amount} USD = ${response.result} EUR`;
        resultDiv.style.color = "green";
      } else {
        resultDiv.textContent = `エラー: ${response.error}`;
        resultDiv.style.color = "red";
      }
    });
  });
});
