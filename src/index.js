
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


    mapboxgl.accessToken = 'pk.eyJ1IjoicnVzc2JpZ2dzIiwiYSI6ImNpZXQ0andwaDAwNDhzcG0ycmp6YzlyZ3UifQ.NM3xVtCXK72k6Lg9o2DEMg';
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-106.65, 35.08],
    zoom: 9 
    });
    
    map.on('load', function() {
            map.addSource('points', {
                'type': 'geojson',
                'data': 'https://russbiggs.github.io/usps-collection-box-app/data/abq_po_box.geojson'
            });
        
            map.addLayer({
                id: 'points',
                type: 'circle',
                source: 'points',
                paint: {
                    'circle-color': '#004B87',
                    'circle-radius': 10
                }
            });
        
            map.on('click', 'points', function(e) {
                emitter.emit('point-select', e.features[0].properties)
            });
        });

    const mediaSupported = 'mediaDevices' in navigator;
    if (mediaSupported) {
        console.log('media supported')
    }

}