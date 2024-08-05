var map = L.map('map').setView([47.5, -122.3], 10);

/*
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
*/

// ifr low
//const MAP_TYPE = 'ifrlc';
// vfr combined
const MAP_TYPE = 'vfrc';

L.tileLayer('https://vfrmap.com/20240711/tiles/' + MAP_TYPE  + '/{z}/{y}/{x}.jpg', {
    maxZoom: 11,
    attribution: '&copy; <a href="https://vfrmap.com/about.html">VFRMap</a>',
    tms: true,
}).addTo(map);

