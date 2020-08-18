class Form {
    constructor(emitter) {
        this.emitter = emitter;
        this.containerElem = document.querySelector('.js-data-entry-container')
        this.removedBtn = new RemovedBtn(emitter);
        this.presentBtn = new PresentBtn(emitter);
        this.saveBtn = new SaveBtn(emitter)
        this.collectionBoxInfo = document.querySelector('.js-collection-box-info');

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.update = this.update.bind(this);
        
    }


    update(feature) {
        const properties = feature.properties;
        const data = { 
            outlet:properties.OUTLETID, 
            lat: feature.geometry.coordinates[1], 
            lng: feature.geometry.coordinates[0]
        }
        const active = document.querySelector('.btn-status--active');
        if (active) {
            active.classList.remove('btn-status--active');
        }
        this.removedBtn.data = data;
        this.presentBtn.data = data;
        this.collectionBoxInfo.innerHTML = `<p>Outlet ID: ${properties.OUTLETID}</p><p>Type: ${properties.BUSNAME}</p><p>Address: ${properties.ADDR1}</p>`
    }

    show(data) {
        this.containerElem.classList.remove('data-entry-container--hidden');
        this.update(data)
    }

    hide() {
        this.containerElem.classList.remove('data-entry-container--hidden');
    }

}


class RemovedBtn {
    constructor(emitter) {
        this.data;
        this.emitter = emitter;
        this.elem = document.querySelector('.js-btn-removed');
        this.onClick = this.onClick.bind(this);

        this.elem.addEventListener('click', this.onClick);
    }

    onClick() {
        const active = document.querySelector('.btn-status--active');
        if (active) {
            active.classList.remove('btn-status--active');
        }
        this.elem.classList.add('btn-status--active')
        const data = {
            ...this.data,
            status: 'removed'
        }
        this.emitter.emit('data-update', data)
    }

}

class PresentBtn {
    constructor(emitter) {
        this.data;
        this.emitter = emitter;
        this.elem = document.querySelector('.js-btn-present');
        this.onClick = this.onClick.bind(this);

        this.elem.addEventListener('click', this.onClick);
    }

    onClick() {
        const active = document.querySelector('.btn-status--active');
        if (active) {
            active.classList.remove('btn-status--active');
        }
        this.elem.classList.add('btn-status--active')
        const data = {
            ...this.data,
            status: 'present'
        }
        this.emitter.emit('data-update', data);
    }
}


class SaveBtn {
    constructor(emitter) {
        this.elem = document.querySelector('.js-btn-save');
        this.emitter = emitter;
        this.active = false;
        this.data = [];
        this.update = this.update.bind(this);
        this.onClick = this.onClick.bind(this)

        this.elem.addEventListener('click', this.onClick)
    }

    async onClick() {
        const url = 'https://khab7rvd6c.execute-api.us-east-1.amazonaws.com/dev/mailbox';
        await fetch(url, {method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.data) 
        })
        this.data = {};
        this.emitter.emit('data-save')
    }

    update(data) {
        if (!this.active) {
            this.active = true;
            this.elem.disabled = false;
        }
        this.data = data;
    }
}

export default Form;