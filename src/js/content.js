document.addEventListener("mouseup", function () {
  let selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    chrome.runtime.sendMessage(
      { action: "convertCurrency", text: selectedText },
      function (response) {
        console.log("Conversion result:", response.result);
        // ここにポップアップ表示ロジックを追加します（後で実装）
      }
    );
  }
});
