class Form {
    constructor(emitter) {
        this.emitter = emitter;
        this.containerElem = document.querySelector('.js-data-entry-container')
        const removedBtnElem = document.querySelector('.js-btn-removed');
        this.removedBtn = new StatusBtn(removedBtnElem, 'removed', emitter);
        const presentBtnElem = document.querySelector('.js-btn-present');
        this.presentBtn = new StatusBtn(presentBtnElem, 'present', emitter);
        const inoperableBtnElem = document.querySelector('.js-btn-inoperable');
        this.inoperableBtn = new StatusBtn(inoperableBtnElem, 'inoperable', emitter);
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
        const lobbyNote = document.querySelector('.collection-box-lobby-note');
        lobbyNote.classList.add('collection-box-lobby-note--hidden')
        if (properties.BUSNAME == 'USPS COLLECTION BOX - PO LOBBY') {
            lobbyNote.classList.remove('collection-box-lobby-note--hidden');
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
        this.containerElem.classList.add('data-entry-container--hidden');
    }

}

class StatusBtn {
    constructor(elem, status, emitter) {
        this.data;
        this.emitter = emitter;
        this.status = status;
        this.elem = elem;
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
            status: this.status
        }
        this.emitter.emit('data-update', data)
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
