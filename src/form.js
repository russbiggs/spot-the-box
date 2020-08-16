class Form {
    constructor(emitter) {
        this.data;
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
            outlet : this.outletId,
            status: 'present'
        }
        this.emitter.emit('data-update', data);
    }
}


class SaveBtn {
    constructor(emitter) {
        this.elem = document.querySelector('.js-btn-save');
        this.emitter = emitter;
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

    async update(data) {
        this.data = data;
    }
}

export default Form;