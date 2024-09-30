function saveOptions() {
  const fromCurrency = document.getElementById("fromCurrency").value;
  const toCurrency = document.getElementById("toCurrency").value;
  chrome.storage.sync.set(
    {
      fromCurrency: fromCurrency,
      toCurrency: toCurrency,
    },
    function () {
      const status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 750);
    }
  );
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
