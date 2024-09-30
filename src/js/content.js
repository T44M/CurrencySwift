document.addEventListener('mouseup', function() {
  let selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    chrome.runtime.sendMessage(
      { action: "convertCurrency", text: selectedText },
      function (response) {
        console.log("Conversion result:", response.result);
        // ここにポップアップ表示ロジックを追加します（後で実装）
      }
    );
    let popupDiv = null;

    document.addEventListener("mouseup", function () {
      if (popupDiv) {
        document.body.removeChild(popupDiv);
      }

      let selectedText = window.getSelection().toString().trim();
      if (selectedText && !isNaN(selectedText)) {
        chrome.storage.sync.get(
          ["fromCurrency", "toCurrency"],
          function (items) {
            chrome.runtime.sendMessage(
              {
                action: "convertCurrency",
                amount: selectedText,
                from: items.fromCurrency || "USD",
                to: items.toCurrency || "EUR",
              },
              function (response) {
                showPopup(
                  selectedText,
                  response.result,
                  items.fromCurrency,
                  items.toCurrency
                );
              }
            );
          }
        );
      }
    });

    function showPopup(original, result, fromCurrency, toCurrency) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      popupDiv = document.createElement("div");
      popupDiv.style.position = "absolute";
      popupDiv.style.left = `${rect.left + window.scrollX}px`;
      popupDiv.style.top = `${rect.bottom + window.scrollY}px`;
      popupDiv.style.backgroundColor = "white";
      popupDiv.style.border = "1px solid black";
      popupDiv.style.padding = "5px";
      popupDiv.style.zIndex = "1000";
      popupDiv.textContent = `${original} ${fromCurrency} = ${converted} ${toCurrency}`;

      document.body.appendChild(popupDiv);

      if (result.success) {
        popupDiv.textContent = `${original} ${fromCurrency} = ${result.result} ${toCurrency}`;
      } else {
        popupDiv.textContent = `変換エラー: ${result.error}`;
        popupDiv.style.backgroundColor = '#FFCCCB'; // エラー時の背景色
      }
    
      document.body.appendChild(popupDiv);
    }
    }
    if (selectedText && !isNaN(selectedText)) {
      chrome.runtime.sendMessage({
        action: "convertCurrency",
        amount: selectedText,
        from: items.fromCurrency || 'USD',
        to: items.toCurrency || 'EUR'
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error("メッセージングエラー:", chrome.runtime.lastError);
          showPopup(selectedText, { success: false, error: "内部エラーが発生しました" }, items.fromCurrency, items.toCurrency);
        } else {
          showPopup(selectedText, response, items.fromCurrency, items.toCurrency);
        }
      });
    }
  });
