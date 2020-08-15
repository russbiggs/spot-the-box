import { set, get } from 'idb-keyval';

class Form {
    constructor(emitter) {
        this.data;
        this.emitter = emitter;
        this.containerElem = document.querySelector('.js-data-entry-container')
        this.removedBtn = new RemovedBtn(emitter);
        this.presentBtn = new PresentBtn(emitter);
        this.saveBtn = new SaveBtn()
        this.collectionBoxInfo = document.querySelector('.js-collection-box-info');

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.update = this.update.bind(this);
        
    }


    update(data) {
        this.data = {
            outletId: data.outletId
        }
        this.removedBtn.outletId = data.OUTLETID;
        this.presentBtn.outletId = data.OUTLETID;
        this.collectionBoxInfo.innerHTML = `<p>Address:${data.ADDR1}</p><p>Outlet ID:${data.OUTLETID}</p>`
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
        this.outletId;
        this.emitter = emitter;
        this.elem = document.querySelector('.js-btn-removed');
        this.onClick = this.onClick.bind(this);

        this.elem.addEventListener('click', this.onClick);
    }

    onClick() {
        const data = {
            outletId : this.outletId,
            status: 'removed'
        }
        this.emitter.emit('data-update', data)

    }

}

class PresentBtn {
    constructor(emitter) {
        this.outletId;
        this.emitter = emitter;
        this.elem = document.querySelector('.js-btn-present');
        this.onClick = this.onClick.bind(this);

        this.elem.addEventListener('click', this.onClick);
    }

    onClick() {
        const data = {
            outletId : this.outletId,
            status: 'present'
        }
        this.emitter.emit('data-update', data)
    }

}


class SaveBtn {
    constructor() {
        this.elem = document.querySelector('.js-btn-save')
        this.data = [];
        this.update = this.update.bind(this);
        this.onClick = this.onClick.bind(this)

        this.elem.addEventListener('click', this.onClick)
    }

    async onClick() {
        let collectionBoxes = await get('collection-boxes');
        if (!collectionBoxes) {
            collectionBoxes = [];
        }
        collectionBoxes.push(...this.data);
        this.data = [];
        await set('collection-boxes', collectionBoxes);
    }

    async update(data) {
        let collectionBoxes = await get('collection-boxes');
        if (!collectionBoxes) {
            collectionBoxes = [];
        }
        const index = collectionBoxes.findIndex(x => x.outletId == data.outletId)
        if (index == -1) {
            this.data.push(data);
        } else {
            this.data[index] = data;
        }
    }
}

export default Form;