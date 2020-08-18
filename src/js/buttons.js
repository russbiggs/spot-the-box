class BackBtn {
    constructor(emitter) {
        this.emitter = emitter
        this.elem = document.querySelector('.js-btn-back');
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.onClick = this.onClick.bind(this);
        this.elem.addEventListener('click', this.onClick);
    }
    
    onClick() {
        this.emitter.emit('show-map');
        this.hide();
    }

    show() {
        this.elem.classList.remove('btn-back--hidden');
    }

    hide() {
        this.elem.classList.add('btn-back--hidden');
    }
}

export {BackBtn};
