const canvas = document.querySelector("canvas");
const _c = canvas.getContext("2d");
const offsetX = 30;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

_c.fillStyle = "black";
_c.fillRect(0, 0, canvas.width, canvas.height);

class Player {
  constructor({position, velocity, color }) {
    this.position = position; // object
    this.velocity = velocity;
    this.color = color;
  }

  draw() {
    _c.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);
    _c.fillStyle = this.color;
    _c.fill();

    _c.moveTo(this.position.x + offsetX, this.position.y);
    _c.lineTo(this.position.x - 10, this.position.y - 10);
    _c.lineTo(this.position.x - 10, this.position.y + 10);
    _c.closePath();
    _c.strokeStyle = 'white';
    _c.stroke();
  }
}

const player = new Player({
    position: {x: canvas.width / 2, y: canvas.height / 2},
    velocity: {x: 0, y: 0},
    color: 'blue'
});
player.draw();