const customName = document.getElementById('customname');
const randomize = document.querySelector('.randomize');
const story = document.querySelector('.story');

function randomValueFromArray(array){
  const random = Math.floor(Math.random()*array.length);
  return array[random];
}

const storyText = 'It was a crisp 75 fahrenheit outside, so :insertx: decided to go out for a rip on their Hellys. When they got to :inserty:, they stared in disbelief as a dog on a unicycle welcomed them, and then :insertz:. Bob would never be the same after that. They fainted as their heart was filled with immense joy. :insertx: was forced to carry them home - which was quite tiring as Bob now has a heart that weighs 300 pounds.';
const insertX = ['Willy the Goblin', 'Big Daddy', 'Father Christmas'];
const insertY = ['the soup kitchen', 'Disneyland', 'the White House'];
const insertZ = [
  'spontaneously combusted',
  'melted into a puddle on the sidewalk',
  'turned into a slug and crawled away'
];

randomize.addEventListener('click', result);

function result() {

  let newStory = storyText;
  
  let xItem = randomValueFromArray(insertX);
  let yItem = randomValueFromArray(insertY);
  let zItem = randomValueFromArray(insertZ);

  newStory = newStory.replaceAll(':insertx:', xItem);
  newStory = newStory.replace(':inserty:', yItem);
  newStory = newStory.replace(':insertz:', zItem);

  if(customName.value !== '') {
    const name = customName.value;
    newStory = newStory.replaceAll('Bob', name);

  }

  if(document.getElementById("uk").checked) {
    const weight = Math.round(300/14);
    let newWeight = weight.toString() + ' stone';
    const temperature =  Math.round((94-32)*(5/9));
    let newTemp = temperature.toString() + ' centigrade';
    newStory = newStory.replace('300 pounds', newWeight);
    newStory = newStory.replace('94 fahrenheit', newTemp);

  }
  
  story.textContent = newStory;
  story.style.visibility = 'visible';
};