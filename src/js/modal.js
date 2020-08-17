class Modal {
    constructor(emitter) {
        this.emitter=emitter
        this.modal = document.querySelector('.js-modal');
        this.background = document.querySelector('.js-modal__background');
        this.title = document.querySelector('.modal-title');
        this.body = document.querySelector('.js-modal__body');
        this.continueBtn = document.querySelector('.js-modal-continue-btn');
        this.aboutBtn = document.querySelector('.js-btn-about');
        this.open = this.open.bind(this); 
        this.close = this.close.bind(this);
  
        this.addEventListeners();
    }
  
    addEventListeners() {
      this.continueBtn.addEventListener('click', this.close);
      this.aboutBtn.addEventListener('click', this.open);
    }
  
    open() {
      this.modal.classList.add('modal--visible');
      this.background.classList.add('modal__background--visible');
      this.body.classList.add('modal__body--visible');
    }
  
    close() {
      this.modal.classList.remove('modal--visible');
      this.background.classList.remove('modal__background--visible');
      this.body.classList.remove('modal__body--visible');
      this.emitter.emit('modal-close');
    }
  }
  
  export default Modal;