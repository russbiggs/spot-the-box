
const player = document.querySelector('.js-video-player');
const canvas = document.querySelector('.js-canvas');
const context = canvas.getContext('2d');
const captureButton = document.querySelector('btn-capture');

const constraints = {
  video: true,
};

captureButton.addEventListener('click', () => {
  context.drawImage(player, 0, 0, canvas.width, canvas.height);
});

navigator.mediaDevices.getUserMedia(constraints)
  .then((stream) => {
    player.srcObject = stream;
});


class Photo {
    constructor() {
        this.player = 
        this.canvas = 
        this.context = 
        this.captureBtn = 

        captureBtn
    }
}