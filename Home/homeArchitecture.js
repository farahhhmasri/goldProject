// Getting current price
let symbol = "XAU";
let currency = "USD";
let currentPriceAPI = `https://api.gold-api.com/price/${symbol}/${currency}`;

function fetchcurrentPrice() {
  fetch(currentPriceAPI)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("currentPrice", JSON.stringify(data["price"]));
      localStorage.setItem(
        "currentPriceDate",
        JSON.stringify(data["updatedAt"]),
      );
    })
    .catch((err) => {
      console.error("Error while fetching current price " + `${err}`);
    });

  if (localStorage.getItem("currentPrice") != null) {
    let currentPriceCard = document.getElementById("currentPriceCard");
    currentPriceCard.innerText =
      Number(localStorage.getItem("currentPrice")).toFixed(2) + " $ / oz";
  }

  console.log(localStorage.getItem("priceHistory"));
  if (localStorage.getItem("priceHistory") != null) {
    let priceHist = JSON.parse(localStorage.getItem("priceHistory"));
    let diff =
      priceHist[priceHist.length - 1]["max_price"] -
      priceHist[priceHist.length - 2]["max_price"];
    let changeOfPrice = document.getElementById("changeOfPrice");

    if (diff > 0) {
      changeOfPrice.style.color = "green";
      changeOfPrice.style.borderRadius = "20px";
      changeOfPrice.style.backgroundColor = "#eaf3de";
      changeOfPrice.innerText = "▲ " + Number(diff).toFixed(2);
    } else {
      changeOfPrice.style.color = "red";
      changeOfPrice.style.borderRadius = "20px";
      changeOfPrice.style.backgroundColor = "#f3dede";
      changeOfPrice.innerText = "▼ " + Number(diff).toFixed(2);
    }
  }
}
fetchcurrentPrice();
setInterval(fetchcurrentPrice, 300000);

// // Getting Price History
let api_key =
  "2a0f00f979858ffb360e58ef8a32b285c055963a1a596a3210590e4fa72dbbd7";
let groupBy = "day";
const endTimestamp = Math.floor(Date.now() / 1000);
const startTimestamp = endTimestamp - 20 * 24 * 60 * 60;
let priceHistoryAPI = `https://api.gold-api.com/history?symbol=${symbol}&groupBy=${groupBy}&startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}`;
const TEN_MINUTES = 10 * 60 * 1000;

function fetchPriceHistory() {
  const lastFetched = localStorage.getItem("priceHistoryLastFetched");
  const now = Date.now();

  if (lastFetched && now - parseInt(lastFetched) < TEN_MINUTES) {
    console.log("Using cached price history");
    console.log(
      `Using the previously fetched data ${localStorage.getItem("priceHistoryLastFetched")}`,
    );
    return;
  }

  fetch(priceHistoryAPI, {
    method: "GET",
    headers: {
      "x-api-key": `${api_key}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("priceHistory", JSON.stringify(data));
      localStorage.setItem("priceHistoryLastFetched", now.toString());
      console.log(
        `New data is just fetched ${localStorage.getItem("priceHistoryLastFetched")}`,
      );
    })
    .catch((err) => {
      console.error("Error while fetching price history: " + err);
    });
}
fetchPriceHistory();
setInterval(fetchPriceHistory, TEN_MINUTES);

function calculatedPrices() {
  let currentPrice = Number(localStorage.getItem("currentPrice")).toFixed;
  let pricePerGram = currentPrice / 31.1035;
  let priceHistoryJO = JSON.parse(localStorage.getItem("priceHistory")).map(
    (obj) => ({
      day: obj["day"],
      max_price: Number(obj["max_price"]) * 0.71,
    }),
  );

  let result = {
    USD: {
      current: currentPrice.toFixed(2),
      priceHistory: localStorage.getItem("priceHistory"),
      per24k: pricePerGram.toFixed(2),
      per21k: (pricePerGram * (21 / 24)).toFixed(2),
      per18k: (pricePerGram * (18 / 24)).toFixed(2),
      bar: (pricePerGram * 10).toFixed(2),
      rashadi: (pricePerGram * 7.216 * (21.6 / 24)).toFixed(2),
      english: (pricePerGram * 7.9881 * (22 / 24)).toFixed(2),
    },
    JOD: {
      current: (currentPrice * 0.71).toFixed(2),
      priceHistory: priceHistoryJO,
      per24k: (pricePerGram * 0.71).toFixed(2),
      per21k: (pricePerGram * (21 / 24) * 0.71).toFixed(2),
      per18k: (pricePerGram * (18 / 24) * 0.71).toFixed(2),
      bar: (pricePerGram * 10 * 0.71).toFixed(2),
      rashadi: (pricePerGram * 7.216 * (21.6 / 24) * 0.71).toFixed(2),
      english: (pricePerGram * 7.9881 * (22 / 24) * 0.71).toFixed(2),
    },
  };
  return result;
}

// creating the price history chart
const chart = echarts.init(document.getElementById("chart"));
const option = {
  title: { text: "Price Over Time" },
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu"],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      name: "Price",
      type: "line",
      data: [120, 132, 101, 134],
    },
  ],
};

chart.setOption(option);

// modifying the currency
