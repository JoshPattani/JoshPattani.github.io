const button = document.querySelector("#js-new-quote");
button.addEventListener('click', getQuote);

const answerButton = document.querySelector("#js-answer");
answerButton.addEventListener('click', getAnswer);

const endpoint = "https://trivia.cyberwisp.com/getrandomchristmasquestion";

async function getQuote() {
  try{
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const json = await response.json();
    // console.log(json.question);
    displayQuote(json.question);
  }
  catch(err) {
    console.log(err);
    alert('Failed to fetch new trivia question');
  }

}

function displayQuote(quote) {
  const quoteText = document.querySelector("#js-quote-text");
    quoteText.textContent = quote;

}

async function getAnswer() {
  try{
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const json = await response.json();
    // console.log(json.answer);
    displayAnswer(json.answer);
  }
  catch(err) {
    console.log(err);
    alert('Failed to fetch trivia answer');
  }

}

function displayAnswer(answer) {
  const answerText = document.querySelector("#js-answer-text");
  answerText.textContent = "The answer is: " + answer;

}

getQuote();