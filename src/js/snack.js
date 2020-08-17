class Snack {
    constructor() {
      this.timeOut;
      this.elem = document.querySelector('.snack');
      this.showSnack = this.showSnack.bind(this);
    }
  
    showSnack() {
      clearTimeout(this.timeOut);
      this.elem.classList.remove('snack--hidden');
      this.elem.classList.add('snack--visible');
      this.timeOut = setTimeout(() => {
        this.elem.classList.remove('snack--visible');
        setTimeout(() => {
          this.elem.classList.add('snack--hidden');
        }, 500);
      }, 2500);
    }
  }
  
  export default Snack;