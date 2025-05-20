document.addEventListener('DOMContentLoaded', () => {
    getQuote();
    dogStat();
    reddit();
    startListen();
});

async function getQuote() {
    try {
        const res = await fetch('https://zenquotes.io/api/quotes');
        const data = await res.json();
        const { q: quote, a: author } = data[0];
        document.getElementById('quote').innerText = `"${quote}" - ${author}`;
    } catch (error) {
        console.error("Error fetching quote:", error);
        document.getElementById('quote').innerText = "Could not fetch quote. Please try again later.";
    }
}

async function dogStat() {
    await dogImage();
    await dogTypes();
}

async function dogImage() {
    try {
        const res = await fetch("https://dog.ceo/api/breeds/image/random/10");
        const { message: images } = await res.json();
        const carousel = document.getElementById("dogCarousel");
        images.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            carousel.appendChild(img);
        });

        simpleslider.getSlider({ container: carousel, show: 1 });
    } catch (error) {
        console.error("Error fetching dog images:", error);
    }
}

async function dogTypes() {
    try {
        const res = await fetch("https://dog.ceo/api/breeds/list/all");
        const { message } = await res.json();
        const dogButtons = document.getElementById("dogButtons");

        Object.keys(message).forEach(type => {
            const btn = document.createElement("button");
            btn.textContent = type;
            btn.addEventListener("click", () => dogStats(type));
            dogButtons.appendChild(btn);
        });
    } catch (error) {
        console.error("Error fetching dog breeds:", error);
    }
}

function dogStats(type) {
    const dogInfo = {
        name: type,
        description: `Description for ${type}`,
        minLife: 10,
        maxLife: 14
    };
    document.getElementById("typeName").textContent = dogInfo.name;
    document.getElementById("dogDescription").textContent = dogInfo.description;
    document.getElementById("minLife").textContent = dogInfo.minLife;
    document.getElementById("maxLife").textContent = dogInfo.maxLife;
    document.getElementById("dogInfo").style.display = "block";
    const audio = new Audio(`https://api.voicerss.org/?key=your-api-key&hl=en-us&src=Load%20Dog%20Breed%20${dogInfo.name}`);
    audio.play();
}
// Stocks
let chartInstance; 
function getStocks() {
    const ticker = document.getElementById('chart').value.toUpperCase();
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
    const commands = {
        'hello': () => alert('Hello world!'),
        'change the color to :color': color => {
            document.body.style.backgroundColor = color;
        },
        'navigate to :page': page => {
            const p = page.toLowerCase();
            if (p === 'home') window.location = 'home.html';
            else if (p === 'stocks') window.location = 'stocks.html';
            else if (p === 'dogs') window.location = 'dogs.html';
            else alert("Page not found.");
        },
        'lookup :stock': stock => {
            document.getElementById('chart').value = stock.toUpperCase();
            getStocks();
        },
        'load dog breed :breed': breed => {
            loadDogInfo(breed.toLowerCase());
        }

    };

    annyang.addCommands(commands);
    annyang.start();
}


// Start listening when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (annyang) {
        annyang.start();
    }
});


// Start/Stop voice
function startListen() {
    if (annyang) annyang.start();
}

function stopListen() {
    if (annyang) annyang.abort();
}
