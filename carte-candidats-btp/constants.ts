// API Keys
export const SHEETS_API_KEY = 'AIzaSyBUaKGdRT_Ti4JxudF99x9u10MsvLqGOHU';
export const MAPS_API_KEY = 'AIzaSyBQWOduSh7eE9IQJAouzWJ8w8GqgazBgfI';

export const SHEET_ID = '1kdN0hUhHf3lk6-hlS022e0nhJNZsB7RJDQhfrah_hAs';
export const SHEET_NAME = 'Candidats sélectionnés';

// Dark Mode Map Style
export const MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8a8a8a" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#373737" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3c3c3c" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{ "color": "#4e4e4e" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#3d3d3d" }]
  }
];

// Fallback coordinates from the original HTML
export const CP_COORDS: Record<string, { lat: number; lng: number }> = {
    '75': { lat: 48.8566, lng: 2.3522 },
    '77': { lat: 48.8396, lng: 2.8016 },
    '78': { lat: 48.8035, lng: 2.1266 },
    '91': { lat: 48.6319, lng: 2.4314 },
    '92': { lat: 48.8924, lng: 2.2357 },
    '93': { lat: 48.9356, lng: 2.3539 },
    '94': { lat: 48.7904, lng: 2.4556 },
    '95': { lat: 49.0347, lng: 2.0786 },
    '27': { lat: 49.0242, lng: 1.1513 },
    '28': { lat: 48.4469, lng: 1.4891 },
};

export const CP_PRECIS: Record<string, { lat: number; lng: number }> = {
    '75009': { lat: 48.8769, lng: 2.3374 },
    '75010': { lat: 48.8763, lng: 2.3616 },
    '75011': { lat: 48.8590, lng: 2.3780 },
    '75012': { lat: 48.8412, lng: 2.3876 },
    '75018': { lat: 48.8925, lng: 2.3444 },
    '91000': { lat: 48.6319, lng: 2.4314 },
    '91260': { lat: 48.7031, lng: 2.4897 },
    '91330': { lat: 48.6967, lng: 2.1633 },
    '91620': { lat: 48.5817, lng: 2.4578 },
    '91940': { lat: 48.6347, lng: 2.3756 },
    '92500': { lat: 48.8769, lng: 2.1894 },
    '93066': { lat: 48.9096, lng: 2.4401 },
    '93100': { lat: 48.8638, lng: 2.4483 },
    '93120': { lat: 48.9097, lng: 2.5058 },
    '93130': { lat: 48.9147, lng: 2.4897 },
    '93160': { lat: 48.8893, lng: 2.5267 },
    '93200': { lat: 48.9362, lng: 2.3574 },
    '93220': { lat: 48.9147, lng: 2.3834 },
    '93240': { lat: 48.9302, lng: 2.5614 },
    '93300': { lat: 48.9147, lng: 2.3834 },
    '93380': { lat: 48.9024, lng: 2.4783 },
    '93500': { lat: 48.8956, lng: 2.4075 },
    '93700': { lat: 48.9302, lng: 2.4502 },
    '94000': { lat: 48.7904, lng: 2.4556 },
    '94140': { lat: 48.8054, lng: 2.4203 },
    '94260': { lat: 48.7919, lng: 2.3361 },
    '94400': { lat: 48.7875, lng: 2.3929 },
    '94460': { lat: 48.7698, lng: 2.5097 },
    '95100': { lat: 48.9472, lng: 2.2467 },
    '95140': { lat: 48.9728, lng: 2.4014 },
    '95200': { lat: 48.9961, lng: 2.3808 },
    '95370': { lat: 49.0147, lng: 2.5267 },
    '95400': { lat: 49.0094, lng: 2.3936 },
    '95460': { lat: 49.0267, lng: 2.0631 },
    '78120': { lat: 48.8439, lng: 2.0900 },
    '78500': { lat: 48.9397, lng: 2.1581 },
    '27140': { lat: 49.1453, lng: 1.3147 },
    '28000': { lat: 48.4469, lng: 1.4891 },
};