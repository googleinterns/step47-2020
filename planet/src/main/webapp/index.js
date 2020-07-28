// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** Constructor for TypeWriter object */
const TypeWriter = function(element, words, period = 2000) {
    this.element = element;
    this.words = words;
    this.text = ''; 
    this.wordIndex = 0;
    this.period = parseInt(period, 10);
    this.type(); 
    this.isDeleting = false;
}

/** Typewriter method */
TypeWriter.prototype.type =  function() {
    // Find current index of word
    const index = this.wordIndex % this.words.length; 

    const fullText = this.words[index];

    // Check if word is deleting
    if (this.isDeleting) {
        // Remove character
        this.text = fullText.substring(0,this.text.length -1);

    }
    else {
        // Add character
        this.text = fullText.substring(0,this.text.length +1);
    }

    // Add text to HTML
    this.element.innerHTML = '<span class="text">' + this.text + '</span>';

    let typeSpeed = 200; 
    if (this.isDeleting) {
        // Cut type speed in half
        typeSpeed /= 2; 
    }

    // Check if word is complete
    if (!this.isDeleting && this.text === fullText) {
        // Create pause for wait time at end of word
        typeSpeed = this.period;
        this.isDeleting = true; 
    }
    else if (this.isDeleting && this.text === '') {
        this.isDeleting = false; 
        // Move to next word
        this.wordIndex++; 
        // Create pause before next word
        typeSpeed = 500; 
    }

    // Call recursion every half a second
    setTimeout(() => this.type(), typeSpeed);
}

/** Init on DOM load */
document.addEventListener('DOMContentLoaded', init); 

/** Init Home Page */
function init() {
    const txtElement = document.querySelector('.txt-rotate');
    const words = JSON.parse(txtElement.getAttribute('data-words'));
    const period = txtElement.getAttribute('data-period');

    // Init TypeWriter
    new TypeWriter(txtElement, words, period);
}