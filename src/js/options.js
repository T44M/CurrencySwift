function saveOptions() {
  const fromCurrency = document.getElementById('fromCurrency').value;
  const toCurrency = document.getElementById('toCurrency').value;
  
  chrome.storage.sync.set({
    fromCurrency: fromCurrency,
    toCurrency: toCurrency
  }, function() {
    const status = document.getElementById('status');
    if (chrome.runtime.lastError) {
      status.textContent = '設定の保存中にエラーが発生しました。';
      status.style.color = 'red';
    } else {
      status.textContent = '設定が保存されました。';
      status.style.color = 'green';
    }
    setTimeout(function() {
      status.textContent = '';
    }, 3000);
  });
}

function restoreOptions() {
  chrome.storage.sync.get(
    {
      fromCurrency: "USD",
      toCurrency: "EUR",
    },
    function (items) {
      document.getElementById("fromCurrency").value = items.fromCurrency;
      document.getElementById("toCurrency").value = items.toCurrency;
    }
  );
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);