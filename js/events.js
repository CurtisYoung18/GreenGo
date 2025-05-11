// Initialize the map
const map = L.map('map').setView([-27.470125, 153.021072], 12); // Centered on Brisbane

// Load and display tile layer on the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Sample events data
const eventsData = [
    {
        title: "Enoggera Creek Cranking",
        description: "Travel the Enoggera Creek Bikeway west to Ashgrove. Ride alongside the famous Breakfast Creek...",
        date: "Sun 15 Sept, 2024, 9:00am",
        location: "Windsor Park, Windsor",
        coords: [-27.4357, 153.0311]
    },
    {
        title: "BMX skills sessions",
        description: "Open BMX skills session. Suitable for all ability levels, this session will build your confidence...",
        date: "Tue 17 Sept, 2024, 10:00am",
        location: "Nudgee Recreation Reserve",
        coords: [-27.3644, 153.0675]
    },
    {
        title: "Wheely Fun",
        description: "Riding's more fun on two wheels - in just one session our friendly trainer will help your young one...",
        date: "Wed 18 Sept, 2024, 8:00am",
        location: "Heiner Park, Keperra",
        coords: [-27.4097, 152.9581]
    },
    {
        title: "Junior bike riding skills",
        description: "This course is suitable for young riders who can ride confidently on two wheels...",
        date: "Thu 19 Sept, 2024, 9:00am",
        location: "New Farm Park, New Farm",
        coords: [-27.4688, 153.0496]
    },
    {
        title: "Learn to maintain your bike for free - basic (women only)",
        description: "This popular course will teach you how to change a tyre and keep your bike rolling...",
        date: "Sat 5 Oct, 2024, 7:30am",
        location: "Bill Brown Sports Reserve, Fitzgibbon",
        coords: [-27.3292, 153.0305]
    },
];

// Function to populate the events list
function populateEvents() {
    const eventsContainer = document.getElementById('events-container');
    eventsData.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.classList.add('event-item');
        eventElement.innerHTML = `
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <p><strong>${event.date}</strong></p>
            <p>${event.location}</p>
            <button onclick="focusOnEvent(${event.coords[0]}, ${event.coords[1]}, '${event.title}', '${event.location}')">More Info</button>
        `;
        eventsContainer.appendChild(eventElement);

        // Add markers to the map
        L.marker(event.coords).addTo(map).bindPopup(`<b>${event.title}</b><br>${event.location}`).openPopup();
    });
}

// Function to focus on a specific event on the map
function focusOnEvent(lat, lng, title, location) {
    map.setView([lat, lng], 14); // Focus on the selected event
    const eventInfo = document.getElementById('event-info');
    eventInfo.innerHTML = `
        <h3>${title}</h3>
        <p>Location: ${location}</p>
        <p>Distance: 7 miles</p>
        <p>Estimated Time: 2.5 hours</p>
        <p>Difficulty: Easy</p>
        <button>More</button>
    `;
    eventInfo.style.display = 'block'; // Show the event info
}

// Call the function to populate events on page load
document.addEventListener('DOMContentLoaded', populateEvents);
