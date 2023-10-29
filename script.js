// TODO: hide this token
mapboxgl.accessToken = 'pk.eyJ1Ijoib21hcmRlbGVuIiwiYSI6ImNsbzZpeG5yYjBpb2Eyc2w1anppaDlocGYifQ.SBcWKapQ0NVF-_buwduEJQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-77.04, 38.907],
    zoom: 3.15,
    pitch: 7, // tilt the map (0-60 degrees)
    projection: 'globe' // set to 'globe' for globe view
});

const TIERS = {
    NONE: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3
};

const weapons = {
        "ALL" : {
            "url": "https://sites.breakingmedia.com/uploads/sites/3/2019/05/Spice_1000_on_F-16-1.jpg",
            "tier1": [],
            "tier2": [],
            "passAll": true
        },
        "GBU-39": {
            "url": "https://sites.breakingmedia.com/uploads/sites/3/2019/05/Spice_1000_on_F-16-1.jpg",
            "tier1": [0,1],
            "tier2": [2],
            "passAll": false
        },
        "GBU-12": {
            "url": "https://sites.breakingmedia.com/uploads/sites/3/2019/05/Spice_1000_on_F-16-1.jpg",
            "tier1": [2],
            "tier2": [],
            "passAll": false
        },
        "GBU-15": {
            "url": "https://sites.breakingmedia.com/uploads/sites/3/2019/05/Spice_1000_on_F-16-1.jpg",
            "tier1": [],
            "tier2": [0,2,999],
            "passAll": false
        }
};

const companies = {
    'Boeing': {
      'logo': 'https://ih1.redbubble.net/image.2576669469.4038/st,small,507x507-pad,600x600,f8f8f8.jpg',
    },
    'Lockheed Martin' : {
      'logo': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR01KmnwT-DGqmpmZlzOqbbUkMzXafHTzTotPDQPITQXW_R5xzIajlY9xFtZh1uh1YKZlQ&usqp=CAU',
    },
    'Northrop Grumman': {
      'logo': 'https://pbs.twimg.com/profile_images/1216857653491785728/vqsAjWIj_400x400.jpg',
    },
    'Raytheon': {
      'logo': 'https://1000logos.net/wp-content/uploads/2020/09/Raytheon-Emblem.jpg',
    },
    'General Dynamics': {
      'logo': 'https://logos-world.net/wp-content/uploads/2022/07/General-Dynamics-Symbol.png',
    },
    'BAE Systems': {
      'logo': 'https://companieslogo.com/img/orig/BA.L-af80160a.png?t=1654568987',
    },
}

const sites = {
        '0': 
            {
              'type': 'Feature',
              'properties': {
                  'company': 'Boeing',
              },
              'geometry': {
                  'type': 'Point',
                  'latitude': 38.86452622261379,
                  'longitude': -77.05033050066464
              }
            },
          "1" :
            {
              'type': 'Feature',
              'properties': {
                  'company': 'Lockheed Martin',
              },
              'geometry': {
                  'type': 'Point',
                  'latitude': 32.86452622261379,
                  'longitude': -110.05033050066464
              }
            },
          "2" :
            {
              'type': 'Feature',
              'properties': {
                  'company': 'Northrop Grumman',
              },
              'geometry': {
                  'type': 'Point',
                  'latitude': 31.86452622261379,
                  'longitude': -90.05033050066464              }
            },
          "3" :
            {
              'type': 'Feature',
              'properties': {
                  'company': 'Raytheon',
              },
              'geometry': {
                  'type': 'Point',
                  'latitude': 37.86452622261379,
                  'longitude': -90.05033050066464
              }
            }
      };
   
/* START SCRIPT */


map.on('style.load', () => {
    map.setFog({
        color: 'rgb(186, 210, 235)', // Lower atmosphere
        'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        'space-color': 'rgb(11, 11, 25)', // Background color
        'star-intensity': 0.6 // Background star brightness (default 0.35 at low zooms )
    });
});
const currentMarkers = [];
setAllMarkers();

// Reference the image-gallery div
const imageGallery = document.querySelector('.image-gallery');

// Loop through the weapons in the weaponsData
for (const weaponName in weapons) {
    const weapon = weapons[weaponName];

    // Create a new image element
    const img = document.createElement('img');
    img.src = weapon.url;
    img.setAttribute('weaponName', weaponName);
    img.alt = weaponName;

    // Append the image to the image-gallery div
    imageGallery.appendChild(img);
}

// Handle click on the filter images
document.querySelector(".image-gallery").addEventListener('click', function(e) {
    if(e.target && e.target.nodeName == "IMG") {
        const weaponName = e.target.getAttribute("weaponName");
        filterMarkersByWeapon(weaponName);
    }
});

/* START METHODS */

function setAllMarkers() {
  for (const siteId in sites) {
    setMarker(siteId, TIERS.NONE);
  }
}

// Function to clear all markers
function clearAllMarkers() {
    for (const marker of currentMarkers) {
        marker.remove();
    }
    currentMarkers.length = 0;
}

function setMarker(siteId, tier) {
    // TODO: error handling for all reads into json objects with unchecked keys
    const site = sites[siteId];
    const el = document.createElement('div');
    const width = 20; 
    const height = 20;
    const latitude = site.geometry.latitude;
    const longitude = site.geometry.longitude;
    const company = site.properties.company;
    const companyLogoUrl = companies[company].logo;
    
    el.className = 'marker';
    el.style.backgroundImage = 'url(' + companyLogoUrl + ')';
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.backgroundSize = '100%';

    const mapsURL = 'http://maps.google.com/maps?q=' + latitude + ',' + longitude + '&ll=' + latitude + ',' + longitude + '&z=17';
    const html = '<img src="' + companyLogoUrl + '" alt="" width="320"/>' + '<br><strong>' + company + '\t\t</strong><a href="' + mapsURL + '" target="_blank">Google Maps Link</a>';

    const popup = new mapboxgl.Popup({offset: 25, maxWidth: '1000px'}).setHTML(html);

    const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);

    currentMarkers.push(mapboxMarker);
}

function filterMarkersByWeapon(weaponName) {
    clearAllMarkers();
    const weapon = weapons[weaponName];
    const tierOneSites = weapon.tier1;
    const tierTwoSites = weapon.tier2;
    for (const siteId in sites) {
        const site = sites[siteId];
        const siteIdInt = parseInt(siteId, 10);  
      if (tierOneSites.includes(siteIdInt)) {
            setMarker(siteId, TIERS.ONE);
      } else if (tierTwoSites.includes(siteIdInt)) {
            setMarker(siteId, TIERS.TWO);
      } else if (weapon.passAll) {
            setMarker(siteId, TIERS.NONE);
      }
    }
    // TODO: logs if weaponName is not understood
}
