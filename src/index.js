
import mitt from 'mitt';

 import Form from './form';
import {BackBtn} from './buttons';

{
    const emitter = mitt();

    const form = new Form(emitter);
    const backBtn = new BackBtn(emitter);

    function hideMap() {
        const overviewContainer = document.querySelector('.overview-container');
        overviewContainer.classList.add('overview-container--hidden');
    }

    function showMap() {
        const overviewContainer = document.querySelector('.overview-container');
        overviewContainer.classList.remove('overview-container--hidden');
    }

    async function storeData(data) {
        let collectionBoxes = await get('collection-boxes');
        if (!collectionBoxes) {
            collectionBoxes = [];
        }
        collectionBoxes.push(data);
        await set('collection-boxes', collectionBoxes);
    }

    emitter.on('point-select', form.show)
    emitter.on('point-select', hideMap)
    emitter.on('point-select', backBtn.show)
    emitter.on('data-update', form.saveBtn.update)
    emitter.on('save-data', storeData)
    emitter.on('show-map', showMap);
    emitter.on('show-map', form.hide);


    mapboxgl.accessToken = 'pk.eyJ1IjoicnVzc2JpZ2dzIiwiYSI6ImNrZHg2am55ejE3aHYyeWtqOGtocjh4ejgifQ.Qg_LH8LUNchJZBPsqDme9g';
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-106.65, 35.08],
    zoom: 9 
    });

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

    map.on('load', function() {
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
                    'circle-radius': 6
                }
            });
        
            map.on('click', 'collection-boxes', function(e) {
                emitter.emit('point-select', e.features[0].properties)
            });
        });

    const mediaSupported = 'mediaDevices' in navigator;
    if (mediaSupported) {
        console.log('media supported')
    }

}