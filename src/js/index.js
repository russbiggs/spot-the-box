
import mitt from 'mitt';

 import Form from './form';
import {BackBtn} from './buttons';
import Snack from './snack';
import Modal from './modal';

{
    const emitter = mitt();

    let userLocation = false;

    new Modal(emitter);
    const form = new Form(emitter);
    const backBtn = new BackBtn(emitter);

    const snack = new Snack(emitter);

    function hideMap() {
        const overviewContainer = document.querySelector('.overview-container');
        overviewContainer.classList.add('overview-container--hidden');
    }

    function showMap() {
        const overviewContainer = document.querySelector('.overview-container');
        overviewContainer.classList.remove('overview-container--hidden');
    }

    emitter.on('point-select', form.show)
    emitter.on('point-select', hideMap)
    emitter.on('point-select', backBtn.show)
    emitter.on('data-update', form.saveBtn.update)
    emitter.on('show-map', showMap);
    emitter.on('show-map', form.hide);
    emitter.on('data-save', showMap);
    emitter.on('data-save', form.hide);
    emitter.on('data-save', snack.showSnack);
    emitter.on('data-save', backBtn.hide)
    emitter.on('data-save', () => {
        refreshData();
    });
    emitter.on('modal-close', getUserLocation);

    mapboxgl.accessToken = 'pk.eyJ1IjoicnVzc2JpZ2dzIiwiYSI6ImNrZHg2am55ejE3aHYyeWtqOGtocjh4ejgifQ.Qg_LH8LUNchJZBPsqDme9g';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-98.5795,39.8283] ,
        zoom: 5
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
  
    map.on('load', function() {
        fetch('https://khab7rvd6c.execute-api.us-east-1.amazonaws.com/dev/mailbox').then(res => res.json()).then(data=> {

            map.addSource('collection-box-surveyed-src', {
                type: 'geojson',
                data: data
            });

            const expression = [
                'match',
                ['get', 'status'],
                'removed',
                '#FF0000',
                'present',
                '#008000',
                '#004B87'
            ]

            map.addLayer({
                'id': 'collection-boxes-surveyed',
                'type': 'circle',
                'source': 'collection-box-surveyed-src',
                paint: {
                    'circle-color': expression,
                    'circle-radius': {
                        'base': 4,
                        'stops': [
                        [9, 4],
                        [12, 6],
                        [16, 8],
                        [18, 10],
                        [22, 180]
                        ]
                    }
                }
            });

        });
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
                'circle-color': '#004B87',
                'circle-radius': {
                    'base': 4,
                    'stops': [
                    [9, 4],
                    [12, 6],
                    [16, 8],
                    [18, 10],
                    [22, 180]
                    ]
                }
            }
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

        map.on('click', 'collection-boxes', function(e) {
            
        });



        map.on('click', function(e) {
            let f = map.queryRenderedFeatures(e.point, { layers: ['collection-boxes-surveyed'] });
            if (f.length) {
                const coordinates = f[0].geometry.coordinates.slice();
                const status = f[0].properties.status;
                const outlet = f[0].properties.outlet;

                
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`<strong>Outlet ID: ${outlet}</strong><p>Status: ${status}</p>`)
                    .addTo(map);

                return;
            }
            f = map.queryRenderedFeatures(e.point, { layers: ['collection-boxes'] });
            if (f.length) {
                emitter.emit('point-select', f[0]);
                return;
            } 
            return;
        });

    });

    const mediaSupported = 'mediaDevices' in navigator;
    if (mediaSupported) {
        console.log('media supported')
    }

}