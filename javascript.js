document.addEventListener('DOMContentLoaded', async () => {
    await dogStat();
});

document.addEventListener('DOMContentLoaded', () => {
    fetchQuote();
    reddit();
    startListen();
});

// Get Quote
async function fetchQuote() {
    try {
        const response = await fetch("https://zenquotes.io/api/quotes");
        const data = await response.json();
        const quote = data[0].q;
        const author = data[0].a;

        document.getElementById('text').innerText = `"${quote}"`;
        document.getElementById('name').innerText = `– ${author}`;
    } catch (error) {
        console.error("Failed to load quote:", error);
        document.getElementById('text').innerText = "Could not load quote. Try again later.";
        document.getElementById('name').innerText = "";
    }
}

async function dogStat() {
    await dogImage();
    await dogTypes();
}

// Dog Images
async function dogImage() {
        const res = await fetch("https://dog.ceo/api/breeds/image/random/10");
        const { message: images } = await res.json();
        const carousel = document.getElementById("dogCarousel");
        images.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            carousel.appendChild(img);
        });

        simpleslider.getSlider({container: carousel, show: 1});
 
}

// Dog Breed Information and Buttons
let breedInfoMap = {};
function dogTypes() {
    fetch("https://dogapi.dog/api/v2/breeds")
        .then(res => res.json())
        .then(data => {
            const breeds = data.data;
            const dogButtons = document.getElementById("dogButtons");

            breeds.forEach(breed => {
                const name = breed.attributes.name;
                breedInfoMap[name.toLowerCase()] = breed.attributes;

                const btn = document.createElement("button");
                btn.textContent = name;
                btn.setAttribute("class", "button-5");
                btn.addEventListener("click", () => showDogInfo(name.toLowerCase()));
                dogButtons.appendChild(btn);
            });
        })
        .catch(error => {
            console.error("Error loading dog breeds:", error);
        });
}

function showDogInfo(breedName) {
    const info = breedInfoMap[breedName];
    if (!info) return;
    document.getElementById("typeName").textContent = `Name: ${info.name}`;
    document.getElementById("dogDescription").textContent = `Description: ${info.description || "No description!"}`;
    document.getElementById("minLife").textContent = `Min Life: ${info.life?.min || "None!"}`;
    document.getElementById("maxLife").textContent = `Max Life: ${info.life?.max || "None!"}`;
    document.getElementById("dogInfo").style.display = "block";
}


// Stocks
let chartInstance; 
function getStocks() {
    const ticker = document.getElementById('inputName').value.toUpperCase();
    const days = parseInt(document.getElementById('days').value);
    const apiKey = '8Y9UMiWQip4CnpgwA5pgI2DQH3owajNz';

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${start}/${end}?adjusted=true&sort=asc&apiKey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const dates = data.results.map(item => new Date(item.t).toLocaleDateString());
                const prices = data.results.map(item => item.c);
                const ctx = document.getElementById('graph').getContext('2d');

                if (chartInstance) {
                    chartInstance.destroy();
                }

                chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: `${ticker} Stock Price`,
                            data: prices,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top'
                            },
                            title: {
                                display: true,
                                text: `Stock Chart for ${ticker}`
                            }
                        }
                    }
                });
            } else {
                alert("No data found!");
            }
        })
        .catch(error => {
            console.error("Error fetching stock data!", error);
        });
}

// Reddit
async function reddit() {
    try {
        const res = await fetch(`https://tradestie.com/api/v1/apps/reddit?date=2022-04-03`);
        const data = await res.json();
        const stockTable = document.getElementById('reddit');
        stockTable.innerHTML = '';

        data.slice(0, 5).forEach(stock => {
            const row = document.createElement('tr');
            const tickerCell = document.createElement('td');
            const link = document.createElement('a');
            link.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
            link.textContent = stock.ticker;
            link.target = "_blank";
            tickerCell.appendChild(link);

            const commentCell = document.createElement('td');
            commentCell.textContent = stock.no_of_comments;

            const sentimentCell = document.createElement('td');
            const img = document.createElement('img');
            img.style.width = "40px";
            img.alt = stock.sentiment;

            if (stock.sentiment.toLowerCase() === "bullish") {
                img.src = "https://static.vecteezy.com/system/resources/previews/005/425/999/non_2x/a-silhouette-of-the-bull-with-an-increased-chart-behind-for-bullish-trend-illustration-free-vector.jpg";
            } else if (stock.sentiment.toLowerCase() === "bearish") {
                img.src = "https://cdn-icons-png.freepik.com/256/2207/2207344.png";
            }
            sentimentCell.appendChild(img);
            row.append(tickerCell, commentCell, sentimentCell);
            stockTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading stocks", error);
    }
}

if (annyang) {
    var commands = {

    'Hello.': () => {
        alert('Hello world!');
    },

    'change the color to *color': (color) => {
        const colorCheck = color.trim().toLowerCase().replace(/[^\w\s]/g, '');
        document.body.style.backgroundColor = colorCheck;
    },

    'navigate to *page': (page) => {
        if (page.toLowerCase().includes("home")) 
            window.location.href = "home.html";
        else if (page.toLowerCase().includes("stock")) 
            window.location.href = "stocks.html";
        else if (page.toLowerCase().includes("dog")) 
            window.location.href = "dogs.html";
    },

    // For lookup
    'lookup *stock': (stock) => {
        const ticker = stock.trim().toUpperCase().replace(/[^A-Z]/g, '');
        document.getElementById("inputName").value = ticker;
        document.getElementById("days").value = "30"; 
        getStocks();
    },

    //For look up
    'look up *stock': (stock) => {
        const ticker = stock.trim().toUpperCase().replace(/[^A-Z]/g, '');
        document.getElementById("inputName").value = ticker;
        document.getElementById("days").value = "30";
        getStocks();
    },

    'load dog breed *breed': (breed) => {
        const dogLook = breed.trim().toLowerCase().replace(/[^\w\s]/g, '');
            showDogInfo(dogLook);
    }
    };
    annyang.addCommands(commands);
    annyang.start();
}

function startListen() {
    if (annyang) annyang.start();
    
}

function stopListen() {
    if (annyang) annyang.abort();
}
