
function openForm() {
    document.getElementById('add-event').style.display = 'block';
}

function closeForm() {
    document.getElementById('add-event').style.display = 'none';
}

function handleHotelChange() {
    if (typeof(Storage) !== "undefined") {
        sessionStorage.hotel = document.getElementById('hotel-address').value;
    } else {
        alert ('Please update your browser'); 
    }
}

function renderHotel() {
    if (sessionStorage.hotel) {
        document.getElementById('hotel-address').value = sessionStorage.hotel;
    }
}

async function renderEvents() {
    const eventsResponse = await fetch('/update-event');
    const events = await eventsResponse.json();

    events.forEach((event) => {
        let eventElement = createEventElement (event.id, event.name, 
            event.address, event.duration);
        document.getElementById('events').appendChild(eventElement);
    });
}

function createEventElement(id, name, address, duration) {
    const eventElement = document.createElement('div');
    eventElement.setAttribute("class", "card event");
    eventElement.innerHTML = 
        `<div class="card-content">
          <span class="card-title">` + name + `</span>
          <p>` + address +`</p>
        </div>
        <div class="card-action">
          <a>` + duration + ` hours </a>
        </div>
        <div>
          <button onclick="deleteEvent(` + id + `)"> Delete </button>
        </div>`;
    return eventElement;
}

async function deleteEvent(id) {
    await fetch('/update-event?id=' + id, {method: 'DELETE'});
    window.location.reload(true); 
}

async function generateItinerary() {
    if (!sessionStorage.hotel) {
        alert('Please input a valid hotel address');
        return;
    }
    const params = new URLSearchParams();
    params.append("hotel-address", sessionStorage.hotel);
    const itineraryResponse = await fetch('/generate-itinerary', {method: 'POST', body: params});
    const itinerary = await itineraryResponse.json();
    createItinerary(itinerary);
}

function timeToString(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const hoursString = hours < 10 ? ('0' + hours) : hours;
    const minutesString = minutes < 10 ? ('0' + minutes) : minutes;
    return hoursString + ':' + minutesString;
}

function createItinerary(items) {
    const itineraryContainer = document.getElementById('itinerary');
    itineraryContainer.innerHTML = '';

    items.forEach((item) => {
        // Only show one time stamp for hotel.
        if (item.when.start === item.when.end) {
            itineraryContainer.innerHTML += '<li>' + item.name + ', ' + item.address + ', ' + 
                                timeToString(item.when.start) + '</li>';
        }else {
            itineraryContainer.innerHTML += '<li>' + item.name + ', ' + item.address + ', ' + 
                timeToString(item.when.start) + ' - ' + timeToString(item.when.end) + '</li>';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    let elems = document.querySelectorAll('select');
    let instances = M.FormSelect.init(elems, {});
});


// jQuery function that reorders the events
$(function() { 
    $( "#events" ).sortable({
    update: function(event, ui) { 
        reorderEvents(ui); 
    }       
    }); 
}); 
          
function reorderEvents(ui) { 
    $('.event').each(function (i) {
        console.log('order is ' + i + ' for ' + this.innerHTML);
    });
} 
