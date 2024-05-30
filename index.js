const canvas = document.querySelector("canvas");
const _c = canvas.getContext("2d");
const offsetX = 30;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

_c.fillStyle = "black";
_c.fillRect(0, 0, canvas.width, canvas.height);

class Player {
  constructor({ position, velocity, color, rotation = 0 }) {
    this.position = position; // object
    this.velocity = velocity;
    this.color = color;
    this.rotation = rotation;
    this.speed = 3;
    this.rotationalSpeed = 0.05;
    this.friction = 0.97;
  }

  draw() {
    _c.save();
    //needed for rotation
    _c.translate(this.position.x, this.position.y);
    _c.rotate(this.rotation);
    _c.translate(-this.position.x, -this.position.y);

    _c.beginPath();
    _c.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);
    _c.fillStyle = this.color;
    _c.fill();
    _c.closePath();

    _c.beginPath();
    _c.moveTo(this.position.x + offsetX, this.position.y);
    _c.lineTo(this.position.x - 10, this.position.y - 10);
    _c.lineTo(this.position.x - 10, this.position.y + 10);
    _c.closePath();
    _c.strokeStyle = "white";
    _c.stroke();
    _c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  getVertices() {
    const cos = Math.cos(this.rotation)
    const sin = Math.sin(this.rotation)

    return [
      {
        x: this.position.x + cos * 30 - sin * 0,
        y: this.position.y + sin * 30 + cos * 0,
      },
      {
        x: this.position.x + cos * -10 - sin * 10,
        y: this.position.y + sin * -10 + cos * 10,
      },
      {
        x: this.position.x + cos * -10 - sin * -10,
        y: this.position.y + sin * -10 + cos * -10,
      },
    ]
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }

  draw() {
    _c.beginPath();
    _c.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    _c.closePath();
    _c.fillStyle = "white";
    _c.fill();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Asteroid {
  constructor({ position, velocity, radius }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
  }

  draw() {
    _c.beginPath();
    _c.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    _c.closePath();
    _c.strokeStyle = "white";
    _c.stroke();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const player = new Player({
  position: { x: canvas.width / 2, y: canvas.height / 2 },
  velocity: { x: 0, y: 0 },
  color: "blue",
});
player.draw();

const keys = {
  w: { pressed: false },
  a: { pressed: false },
  d: { pressed: false },
};

const projectiles = [];
const asteroids = [];

const asteroidIntervalId = window.setInterval(() => {
  const index = Math.floor(Math.random() * 4);
  let x,y = 0;
  let vx,vy = 0;
  let radius = Math.random() * 50 + 10;

  switch (index) {
    case 0: // left side of the screen
      x = 0 - radius;
      y = Math.random() * canvas.height;
      vx = 1;
      vy = 0;
      break;
    case 1: // bottom side of the screen
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
      vx = 0;
      vy = -1;
      break;
    case 2: // right side of the screen
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
      vx = -1;
      vy = 0;
      break;
    case 3: // top side of the screen
      x = Math.random() * canvas.width;
      y = 0 - radius;
      vx = 0;
      vy = 1;
      break;
  }

  asteroids.push(
    new Asteroid({
      position: {
        x: x,
        y: y
      },
      velocity: {
        x: vx,
        y: vy
      },
      radius
    })
  );
}, 1000);

function circleCollision(circle1, circle2) {
  const xDiff = circle2.position.x - circle1.position.x;
  const yDiff = circle2.position.y - circle1.position.y;
  const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  if (circle1.radius + circle2.radius >= distance) {
    return true;
  }
  return false;
}

function circleTriangleCollision(circle, triangle) {
  // Check if the circle is colliding with any of the triangle's edges
  for (let i = 0; i < 3; i++) {
    let start = triangle[i]
    let end = triangle[(i + 1) % 3]

    let dx = end.x - start.x
    let dy = end.y - start.y
    let length = Math.sqrt(dx * dx + dy * dy)

    let dot =
      ((circle.position.x - start.x) * dx +
        (circle.position.y - start.y) * dy) /
      Math.pow(length, 2)

    let closestX = start.x + dot * dx
    let closestY = start.y + dot * dy

    if (!isPointOnLineSegment(closestX, closestY, start, end)) {
      closestX = closestX < start.x ? start.x : end.x
      closestY = closestY < start.y ? start.y : end.y
    }

    dx = closestX - circle.position.x
    dy = closestY - circle.position.y

    let distance = Math.sqrt(dx * dx + dy * dy)

    if (distance <= circle.radius) {
      return true
    }
  }

  // No collision
  return false
}

function isPointOnLineSegment(x, y, start, end) {
  return (
    x >= Math.min(start.x, end.x) &&
    x <= Math.max(start.x, end.x) &&
    y >= Math.min(start.y, end.y) &&
    y <= Math.max(start.y, end.y)
  )
}

function animate() {
  const animationId = window.requestAnimationFrame(animate);
  _c.fillStyle = "black";
  _c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

  //projectile management
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.update();

    if (projectile.position.x + projectile.radius < 0 ||
      projectile.position.x - projectile.radius > canvas.width ||
      projectile.position.y - projectile.radius > canvas.height ||
      projectile.position.y + projectile.radius < 0
    ) {
      projectiles.splice(i, 1);
    }
  }

  //asteroids management
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    asteroid.update();

    if (circleTriangleCollision(asteroid, player.getVertices())) {
      console.log('GAME OVER');
      window.cancelAnimationFrame(animationId);
      clearInterval(asteroidIntervalId);
    }

    if (asteroid.position.x + asteroid.radius < 0 ||
      asteroid.position.x - asteroid.radius > canvas.width ||
      asteroid.position.y - asteroid.radius > canvas.height ||
      asteroid.position.y + asteroid.radius < 0
    ) {
      asteroids.splice(i, 1);
    }

    for (let j = projectiles.length - 1; j >= 0; j--) {
      const projectile = projectiles[j];
      if (circleCollision(asteroid, projectile)) {
        projectiles.splice(j, 1);
        asteroids.splice(i, 1);
      }
    }
  }

  if (keys.w.pressed) {
    player.velocity.x = Math.cos(player.rotation) * player.speed;
    player.velocity.y = Math.sin(player.rotation) * player.speed;
  } else if (!keys.w.pressed) {
    player.velocity.x *= player.friction;
    player.velocity.y *= player.friction;
  }

  if (keys.d.pressed) {
    player.rotation += player.rotationalSpeed;
  } else if (keys.a.pressed) {
    player.rotation -= player.rotationalSpeed;
  }
}
animate();

window.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "KeyW":
      keys.w.pressed = true;
      break;
    case "KeyA":
      keys.a.pressed = true;
      break;
    case "KeyD":
      keys.d.pressed = true;
      break;
    case "Space":
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + Math.cos(player.rotation) * offsetX,
            y: player.position.y + Math.sin(player.rotation) * offsetX,
          },
          velocity: {
            x: Math.cos(player.rotation) * player.speed,
            y: Math.sin(player.rotation) * player.speed,
          },
        })
      );
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "KeyW":
      keys.w.pressed = false;
      break;
    case "KeyA":
      keys.a.pressed = false;
      break;
    case "KeyD":
      keys.d.pressed = false;
      break;
  }
});
