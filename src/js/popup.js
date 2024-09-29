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
});
