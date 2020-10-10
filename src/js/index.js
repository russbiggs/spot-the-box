
import mitt from 'mitt';

import Form from './form';
import {BackBtn} from './buttons';
import Snack from './snack';
import Modal from './modal';
import HowTo from './how-to';

const colors = {
    present: '#004B87',
    removed: '#d7191c',
    inoperable: '#fdae61'
}

{
    const emitter = mitt();

    let userLocation = false;

    const modal = new Modal(emitter);
    const form = new Form(emitter);
    const howTo = new HowTo(emitter)
    const backBtn = new BackBtn(emitter);

    const snack = new Snack(emitter);

    function hideMap() {
        const overviewContainer = document.querySelector('.js-overview-container');
        overviewContainer.classList.add('overview-container--hidden');
    }

    function showMap() {
        const overviewContainer = document.querySelector('.js-overview-container');
        overviewContainer.classList.remove('overview-container--hidden');
        howTo.hide();
    }

    function setPopupClickListeners(emitter, features) {
        const listItems = document.querySelectorAll('.popup-list-item');
        for (let i = 0; i< listItems.length; i++) {
            const li = listItems[i];
            const feature = features.find(x => x.properties.OUTLETID === parseInt(li.textContent))
            li.addEventListener('click', () => {
                emitter.emit('point-select', feature);
            });
        }
    }

    emitter.on('point-select', form.show);
    emitter.on('point-select', hideMap);
    emitter.on('point-select', backBtn.show);
    emitter.on('how-to', hideMap);
    emitter.on('how-to', backBtn.show);
    emitter.on('data-update', form.saveBtn.update);
    emitter.on('show-map', showMap);
    emitter.on('show-map', form.hide);
    emitter.on('data-save', showMap);
    emitter.on('data-save', form.hide);
    emitter.on('data-save', snack.showSnack);
    emitter.on('data-save', backBtn.hide);
    emitter.on('data-save', () => {
        refreshData();
    });
    emitter.on('modal-close', getUserLocation);

    mapboxgl.accessToken = 'pk.eyJ1IjoicnVzc2JpZ2dzIiwiYSI6ImNrZHg2am55ejE3aHYyeWtqOGtocjh4ejgifQ.Qg_LH8LUNchJZBPsqDme9g';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-98.5795,39.8283] ,
        zoom: 5 ,
        hash: true
    });

    function setMapLocation(position) {
        map.flyTo({
            center: [position.coords.longitude,position.coords.latitude],
            zoom: 12
        });
    }

    function getUserLocation(){
        if (!userLocation) {
            if (navigator.geolocation){
                navigator.geolocation.getCurrentPosition(setMapLocation);
            }
        }
        userLocation = true;
    }


    map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
        })
    );

    map.addControl(new mapboxgl.NavigationControl());

    map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        })
    );

    function refreshData() {
        fetch('https://khab7rvd6c.execute-api.us-east-1.amazonaws.com/dev/mailbox').then(res => res.json()).then(data=> {
            map.getSource('collection-box-surveyed-src').setData(data);
        })
    }

    function findFeatureStatus(feature, fc) {
        const outletId = feature.properties.OUTLETID;
        const index = fc.features.findIndex(p => p.properties.outlet == outletId);
        if (index > -1) {
            return fc.features[index].properties.status;
        } else {
            return 'unsurveyed';
        }
    }
  
    map.on('load', function() {

        // USPS postbox locations

        map.addSource('collection-box-src', {
            type: 'vector',
            url: 'mapbox://mikelmaron.3ws9y5k1'
        });

        map.addLayer({
            'id': 'collection-boxes',
            'type': 'circle',
            'source': 'collection-box-src',
            'source-layer': 'collection_box_trim_valid-0tbyft',
            paint: {
                'circle-stroke-color': colors.present,
                'circle-stroke-width': [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    4, 0.1,
                    9, 0.5,
                    14, 1,
                    16, 4
                ],
                'circle-stroke-opacity': [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    4, 0.6,
                    7, 0.8,
                    14, 0.9
                ],
                'circle-opacity': 0,
                'circle-radius': [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10, 1,
                    14, 6,
                    18, 30
                ]
            }
        });

        // Surveyed postbox locations

        let surveyedGeoJSON;

        fetch('https://spot-the-box.s3.amazonaws.com/reports.json').then(res => res.json()).then(data=> {


            surveyedGeoJSON = data;
            map.addSource('collection-box-surveyed-src', {
                type: 'geojson',
                data: data
            });

            const expression = [
                'match',
                ['get', 'status'],
                'removed',
                colors.removed,
                'inoperable',
                colors.inoperable,
                colors.present
            ]

            map.addLayer({
                'id': 'collection-boxes-surveyed',
                'type': 'circle',
                'source': 'collection-box-surveyed-src',
                paint: {
                    'circle-color': expression,
                    'circle-radius': [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        7, 4,
                        14, 6,
                        18, 30
                    ]
                },
                layout: {
                    'circle-sort-key': [
                        'match',
                        ['get', 'status'],
                        'removed',
                        2,
                        'present',
                        1,
                        0
                    ]
                }
            });

        });


        map.on('mouseenter', 'collection-boxes-surveyed', function() {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'collection-boxes-surveyed', function() {
            map.getCanvas().style.cursor = '';
        });

        map.on('mouseenter', 'collection-boxes', function() {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'collection-boxes', function() {
            map.getCanvas().style.cursor = '';
        });

        map.on('click', function(e) {
            let f = map.queryRenderedFeatures(e.point, { layers: ['collection-boxes'] });
            if (f.length) {
                if (f.length > 1) {
                    const feature = f[0]
                    const coordinates = feature.geometry.coordinates.slice();
                    let list = '';
                    for (const feature of f) {      
                        const featureStatus = findFeatureStatus(feature, surveyedGeoJSON);
                        const marker = `<div class="marker marker--${featureStatus}"></div>`;
                        list += `<li class="popup-list-item">${marker} ${feature.properties.OUTLETID}</li>`;
                    }
                    new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`${f.length} collection boxes at this point<br>Select one:<br><ul class="multi-point-list">${list}</ul>`)
                    .addTo(map);

                    setPopupClickListeners(emitter, f);
                    return;
                } else {
                    emitter.emit('point-select', f[0]);
                    return;
                }

            } 
            f = map.queryRenderedFeatures(e.point, { layers: ['collection-boxes-surveyed'] });
            if (f.length) {
                const feature = f[0]
                const coordinates = feature.geometry.coordinates.slice();
                const status = feature.properties.status;
                const outlet = feature.properties.outlet;
                const createdAt = parseFloat(feature.properties.createdAt);
                const d = new Date(createdAt * 1000); // python time in seconds, multiply by 1000 for milliseconds
                const dateSurveyed = `${(d.getMonth()+1)}-${d.getDate()}-${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`<strong>Outlet ID: ${outlet}</strong><p>Status: ${status}</p><p>Surveyed on: ${dateSurveyed}</p>`)
                    .addTo(map);

                return;
            }
            return;
        });

    });


    let cookie = false;
    const cookies = document.cookie.split('; ');
    for (const c of cookies) {
      if (c == 'visited=True') {
        cookie = true;
      }
    }
  if (!cookie) {
    modal.open();
    document.cookie = `visited=True; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
  } else {
      getUserLocation();
  }

    const mediaSupported = 'mediaDevices' in navigator;
    if (mediaSupported) {
        console.log('media supported')
    }

}
