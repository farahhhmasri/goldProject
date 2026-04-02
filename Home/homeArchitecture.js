function displayDiff(newPrice, prevPrice) {
  let changeOfPrice = document.getElementById("changeOfPrice");
  let diff = newPrice - prevPrice;
  if (diff > 0) {
    changeOfPrice.style.color = "green";
    changeOfPrice.style.borderRadius = "20px";
    changeOfPrice.style.backgroundColor = "#eaf3de";
    changeOfPrice.style.padding = "5px";
    changeOfPrice.style.margin = "10px";
    changeOfPrice.style.fontSize = "medium";
    changeOfPrice.innerText = "▲ " + Number(diff).toFixed(2);
  } else {
    changeOfPrice.style.color = "red";
    changeOfPrice.style.borderRadius = "20px";
    changeOfPrice.style.backgroundColor = "#f3dede";
    changeOfPrice.style.padding = "5px";
    changeOfPrice.style.margin = "10px";
    changeOfPrice.style.fontSize = "medium";
    changeOfPrice.innerText = "▼ " + Number(diff).toFixed(2);
  }
}

function fetchcurrentPrice() {
  // Getting current price
  let symbol = "XAU";
  let currency = "USD";
  let currentPriceAPI = `https://api.gold-api.com/price/${symbol}/${currency}`;
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
      console.error(
        "Error while fetching current price - func fetchcurrentPrice " +
          `${err}`,
      );
    });

  if (localStorage.getItem("currentPrice") != null) {
    let currentPriceCard = document.getElementById("currentPriceCard");
    currentPriceCard.innerText =
      Number(localStorage.getItem("currentPrice")).toFixed(2) +
      " $ / oz (31.1g)";
  }
  console.log(localStorage.getItem("priceHistory"));
  if (localStorage.getItem("priceHistory") != null) {
    let priceHist = JSON.parse(localStorage.getItem("priceHistory"));
    let newPrice = priceHist[priceHist.length - 1]["max_price"];
    let prevPrice = priceHist[priceHist.length - 2]["max_price"];
    displayDiff(newPrice, prevPrice);
  }
}
fetchcurrentPrice();
setInterval(fetchcurrentPrice, 300000);

const TEN_MINUTES = 10 * 60 * 1000;
function fetchPriceHistory() {
  // Getting Price History
  let api_key =
    "2a0f00f979858ffb360e58ef8a32b285c055963a1a596a3210590e4fa72dbbd7";
  let groupBy = "day";
  let symbol = "XAU";
  const endTimestamp = Math.floor(Date.now() / 1000);
  const startTimestamp = endTimestamp - 20 * 24 * 60 * 60;
  let priceHistoryAPI = `https://api.gold-api.com/history?symbol=${symbol}&groupBy=${groupBy}&startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}`;
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
      console.error(
        "Error while fetching price history - func fetchPriceHistory: " + err,
      );
    });
}
fetchPriceHistory();
setInterval(fetchPriceHistory, TEN_MINUTES);

function calculatedPrices() {
  let currentPrice = Number(localStorage.getItem("currentPrice")).toFixed(2);
  let pricePerGram = currentPrice / 31.1035;
  let priceHistoryUS = JSON.parse(localStorage.getItem("priceHistory"));
  let priceHistoryJO = JSON.parse(localStorage.getItem("priceHistory")).map(
    (obj) => ({
      day: obj["day"],
      max_price: Number(obj["max_price"]) * 0.71,
    }),
  );

  let result = {
    USD: {
      current: currentPrice + " $",
      priceHistory: priceHistoryUS,
      per24k: pricePerGram.toFixed(2) + " $",
      per21k: (pricePerGram * (21 / 24)).toFixed(2) + " $",
      per18k: (pricePerGram * (18 / 24)).toFixed(2) + " $",
      bar: (pricePerGram * 10).toFixed(2) + " $",
      rashadi: (pricePerGram * 7.216 * (21.6 / 24)).toFixed(2) + " $",
      english: (pricePerGram * 7.9881 * (22 / 24)).toFixed(2) + " $",
    },
    JOD: {
      current: (currentPrice * 0.71).toFixed(2) + " JD",
      priceHistory: priceHistoryJO,
      per24k: (pricePerGram * 0.71).toFixed(2) + " JD",
      per21k: (pricePerGram * (21 / 24) * 0.71).toFixed(2) + " JD",
      per18k: (pricePerGram * (18 / 24) * 0.71).toFixed(2) + " JD",
      bar: (pricePerGram * 10 * 0.71).toFixed(2) + " JD",
      rashadi: (pricePerGram * 7.216 * (21.6 / 24) * 0.71).toFixed(2) + " JD",
      english: (pricePerGram * 7.9881 * (22 / 24) * 0.71).toFixed(2) + " JD",
    },
  };
  console.log("inside calculatedPricess func: " + result["USD"].priceHistory);
  return result;
}

function fillPrices(prices, currency = "USD") {
  let barPrice = document.getElementById("barPrice");
  let rashadiPrice = document.getElementById("rashadiPrice");
  let englishPrice = document.getElementById("EnglishPrice");
  let twentyFourPrice = document.getElementById("twentyFourPrice");
  let twentyOnePrice = document.getElementById("twentyOnePrice");
  let eighteenPrice = document.getElementById("eighteenPrice");

  barPrice.innerText = prices[currency].bar + "/ 10g";
  rashadiPrice.innerText = prices[currency].rashadi + " / coin";
  englishPrice.innerText = prices[currency].english + " / coin";
  twentyFourPrice.innerText = prices[currency].per24k + " / g";
  twentyOnePrice.innerText = prices[currency].per21k + " / g";
  eighteenPrice.innerText = prices[currency].per18k + " / g";
  console.log("inside fillPrices func - works fine!");
}
fillPrices(calculatedPrices());

// creating the chart
const chart = echarts.init(document.getElementById("chart"));
function renderChart(historyData) {
  const sortedData = [...historyData].reverse();
  const days = sortedData.map((item) => item.day.split(" ")[0]);
  const prices = sortedData.map((item) => Number(item.max_price).toFixed(2));
  const option = {
    backgroundColor: "#2c3341",
    title: {
      text: "Gold Price the past 20 days",
      textStyle: {
        color: "#EFC227",
        fontFamily: "Segoe UI",
        fontSize: 14,
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1e2330",
      borderColor: "#EF9F27",
      borderWidth: 1,
      textStyle: { color: "#f5f5f7" },
      formatter: function (params) {
        const p = params[0];
        return `${p.axisValue}<br/>Price: ${p.data}`;
      },
    },
    xAxis: {
      type: "category",
      data: days,
      axisLine: { lineStyle: { color: "#414450" } },
      axisLabel: { color: "#6b7280", fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      min: function (value) {
        return Math.floor((value.min - 200) / 100) * 100;
      },
      max: function (value) {
        return Math.ceil((value.max + 200) / 100) * 100;
      },
      axisLine: { lineStyle: { color: "#414450" } },
      axisLabel: { color: "#6b7280", fontSize: 11 },
      splitLine: { lineStyle: { color: "#414450", type: "dashed" } },
    },
    series: [
      {
        name: "Max Price",
        type: "line",
        data: prices,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#EF9F27", width: 2 },
        itemStyle: { color: "#EF9F27" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(239, 159, 39, 0.3)" },
              { offset: 1, color: "rgba(239, 159, 39, 0)" },
            ],
          },
        },
      },
    ],
  };
  chart.setOption(option);
}
renderChart(JSON.parse(localStorage.getItem("priceHistory")));

// modifying currency based on click
let pricecardmain = document.getElementById("pricecardmain");
pricecardmain.addEventListener("click", (event) => {
  let target = event.target;
  let result = calculatedPrices();
  let currentPriceCard = document.getElementById("currentPriceCard");
  let usCurrency = document.getElementById("usCurrency");
  let joCurrency = document.getElementById("joCurrency");

  if (target.name === "usCurrency") {
    usCurrency.classList.add("clicked");
    joCurrency.classList.remove("clicked");
    //changing current price
    currentPriceCard.innerText = result["USD"].current + " / oz";

    // changing price difference
    let priceHist = result["USD"].priceHistory;
    let newPrice = priceHist[priceHist.length - 1]["max_price"];
    let prevPrice = priceHist[priceHist.length - 2]["max_price"];
    displayDiff(newPrice, prevPrice);

    // refilling the prices
    fillPrices(calculatedPrices(), (currency = "USD"));

    // recreating the chart
    renderChart(priceHist);
  } else if (target.name === "joCurrency") {
    joCurrency.classList.add("clicked");
    usCurrency.classList.remove("clicked");
    //changing current price
    currentPriceCard.innerText = result["JOD"].current + " / oz";

    // changing price difference
    let priceHist = result["JOD"].priceHistory;
    let newPrice = priceHist[priceHist.length - 1]["max_price"];
    let prevPrice = priceHist[priceHist.length - 2]["max_price"];
    displayDiff(newPrice, prevPrice);

    // refilling the prices
    fillPrices(calculatedPrices(), (currency = "JOD"));

    // recreating the chart
    renderChart(priceHist);
  }
});



      let news = document.getElementById("news");

      let savednews = JSON.parse(localStorage.getItem("news")) || [];
      let lastFetch = parseInt(localStorage.getItem("newsTime"));

      let now = Date.now();

      // ⏱️ 10 minutes = 600000 ms
      if (savednews.length > 0 && lastFetch && now - lastFetch < 600000) {
        displayNews(savednews);
      } else {
        fetch(
          "https://newsdata.io/api/1/latest?apikey=pub_8cdfe34522554af9bab8604d4a8294f9&q=economy OR politics&language=en",
        )
          .then((res) => res.json())
          .then((data) => {
            let articles = data.results.slice(0, 4);

            localStorage.setItem("news", JSON.stringify(articles));
            localStorage.setItem("newsTime", now);

            displayNews(articles);
          })
          .catch(() => {
            console.log("API Error");

            // fallback
            if (savednews.length > 0) {
              displayNews(savednews);
            }
          });
      }

      function displayNews(articles) {
        news.innerHTML = ""; // clear old slides

        articles.forEach((article) => {
          let div = document.createElement("div");
          div.classList.add("swiper-slide");

          div.innerHTML = `
            <div class="content">
                <h3> <label class="lable"> Latest News | </label> ${article.title}</h3>
            </div>
        `;

          // make slide clickable
          div.addEventListener("click", () => {
            if (article.link) {
              window.open(article.link, "_blank");
            }
          });

          news.appendChild(div);
        });

        new Swiper(".swiper", {
          loop: true,
slidesPerView: "auto",
  spaceBetween: 50,
  speed: 4000,
  


          autoplay: {
            delay: 4000,
            disableOnInteraction: false,
          },

          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },

          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
        });
      }

let authLink = document.getElementById("authLink");
let user = sessionStorage.getItem("currentUser");

if (user) {
    //  مسجل دخول
    authLink.innerText = "Logout";

    authLink.addEventListener("click", (e) => {
        e.preventDefault(); //  يمنع الانتقال
        sessionStorage.removeItem("currentUser");
        window.location.href = "../Login and Register Pages/Login.html";
    });

} else {
    // مش مسجل
    authLink.innerText = "Login";
    authLink.href = "../Login and Register Pages/Login.html"; //  هون عادي
}