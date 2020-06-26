
function openForm() {
    document.getElementById('add-event').style.display = 'block';
}

function closeForm() {
    document.getElementById('add-event').style.display = 'none';
}

async function renderEvents() {
    const eventsResponse = await fetch('/update-event');
    const events = await eventsResponse.json();

    events.forEach((event) => {
        let eventElement = createEventElement (event.id, event.name, 
            event.address, event.duration, event.preferredTime);
        document.getElementById('events').appendChild(eventElement);
    });
}

function createEventElement(id, name, address, duration, preferredTime) {
    const eventElement = document.createElement('div');
    eventElement.setAttribute("class", "card");
    eventElement.innerHTML = 
        `<div class="card-content">
          <span class="card-title">` + name + `</span>
          <p>` + address +`</p>
        </div>
        <div class="card-action">
          <a>` + duration + ` hours </a>
          <a>` + preferredTime + `</a>
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
    // const eventsResponse = await fetch('/update-event');
    // const events = await eventsResponse.json();
}

function timeToString(totalMinutes) {
    const hours = totalMinutes / 60;
    const minutes = totalMinutes % 60;

    const hoursString = hours < 10 ? ('0' + hours) : hours;
    const minutesString = minutes < 10 ? ('0' + minutes) : minutes;
    return hoursString + ':' + minutesString;
}


document.addEventListener('DOMContentLoaded', function() {
    let elems = document.querySelectorAll('select');
    let instances = M.FormSelect.init(elems, {});
});

