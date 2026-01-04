const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');

const btn = document.querySelector('button');
const overlay = document.querySelector('.overlay');

/* Declaring the array of image filenames */
const images = ['images/pic6.jpg','images/pic7.jpg','images/pic8.jpg','images/pic9.jpg','images/pic10.jpg',]

/* Declaring the alternative text for each image file */
const altText = {
  'images/pic6.jpg': 'Golden oyster mushrooms',
  'images/pic7.jpg': 'Rock climber\'s perspective',
  'images/pic8.jpg': 'Closeup of cute dog',
  'images/pic9.jpg': 'Disc golf action shot',
  'images/pic10.jpg': 'Street art on wall'
} 

/* Looping through images */
for (let i = 0; i < images.length; i++) {
  const newImage = document.createElement('img');

  if (i === 0){
    newImage.style.borderRadius = '0 0 0 5px';
  } else if (i === images.length - 1) {
    newImage.style.borderRadius = '0 0 5px 0';
  } else {
    newImage.style.borderRadius = '0';
  }

  newImage.setAttribute('src', images[i]);
  newImage.setAttribute('alt', altText[i]);
  thumbBar.appendChild(newImage);

  newImage.addEventListener('click', e => {
    displayedImage.src = e.target.src;
    displayedImage.alt = e.target.alt;
  });
}

/* Wiring up the Darken/Lighten button */
btn.addEventListener('click', () => {
  const btnClass = btn.getAttribute('class');
  if (btnClass === 'dark') {
    btn.setAttribute('class','light');
    btn.textContent = 'Lighten';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
  } else {
    btn.setAttribute('class','dark');
    btn.textContent = 'Darken';
    overlay.style.backgroundColor = 'rgba(0,0,0,0)';
  }
});
