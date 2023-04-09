const button = document.querySelector("#js-new-quote");
button.addEventListener('click', sunnyFetch);

const button2 = document.querySelector("#js-episode");
button2.addEventListener('click', showEpisode);


// Trivia game endpoint
// const endpoint = "https://trivia.cyberwisp.com/getrandomchristmasquestion";


// Sunny quote api json endpoint
// "http://sunnyquotes.net/q.php?random";


const url = "https://proxy.cors.sh/https://sunnyquotes.net/q.php?random";

const images = {
  'Dee Reynolds': "../assets/img/Dee.jpg",
  'Dennis Reynolds': "../assets/img/Dennis.jpg",
  'Frank Reynolds': "../assets/img/Frank.jpg",
  'Charlie Kelly': "../assets/img/Charlie.jpg",
  'Mac': "../assets/img/Mac.jpg",
  'Brianna': "../assets/img/sunny.png",
  'Cricket':"../assets/img/Cricket.jpg",
  'Waitress': "../assets/img/Waitress.jpg",
  'Artemis': "../assets/img/Artemis.jpg",
  'TV Announcer': "../assets/img/sunny.png",
  'Tommy': "../assets/img/sunny.png",
  'Bruce': "../assets/img/sunny.png",
}

async function sunnyFetch() {
  try{
    const response = await fetch(url, {
      headers: {
      'x-cors-api-key': 'temp_3b27dfd8c62b2430d44c205638e11c11'
      }
    })
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const json = await response.json();
    // console.log(json.sqQuote);
    // console.log(json.sqWho);
    // console.log(json.sqEp);
    
    displayQuote(json.sqQuote);
    displayAuthor(json.sqWho);
    displayImage(json.sqWho);
    displayEpisode(json.sqEp);

  }
  catch(err) {
    console.log(err);
    alert('Failed to fetch new quote');
  }
}

function displayQuote(quote) {
  const quoteText = document.querySelector("#js-quote-text");
    quoteText.textContent = '"'+quote+'"';
}

function displayAuthor(who) {
  const authorText = document.querySelector("#js-quote-author");
  authorText.textContent = "- " + who;
}

function displayImage(who) {
  const image = document.querySelector("#js-actor-image");
  image.src = images[who];
  image.alt = who;
}

function showEpisode() {
  // console.log('clicked');
  const epText = document.getElementById("js-episode-text");
  epText.style.display = "block";
}

function displayEpisode(episode) {
  const episodeText = document.querySelector("#js-episode-text");
  episodeText.textContent = "Season & Episode: " + episode;
}

sunnyFetch();