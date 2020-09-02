class HowTo {
    constructor(emitter) {
        this.emitter = emitter
        this.containerElem = document.querySelector('.js-how-to-container')
        this.howToBtn = document.querySelector('.js-btn-how-to');
  
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.addEventListeners = this.addEventListeners.bind(this);
        
        this.addEventListeners();
    }
  
    addEventListeners() {
      this.howToBtn.addEventListener('click', this.show);
    }

    show() {
        this.containerElem.classList.remove('how-to-container--hidden');
        this.howToBtn.classList.add('btn-how-to--hidden');
        this.emitter.emit('how-to');
    }

    hide() {
        this.containerElem.classList.add('how-to-container--hidden');
        this.howToBtn.classList.remove('btn-how-to--hidden');
    }
}

export default HowTo