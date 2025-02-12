var Fire = function () {
  this.canvas = document.getElementById('fire');
  this.ctx = this.canvas.getContext('2d');
  this.canvas.height = window.innerHeight;
  this.canvas.width = window.innerWidth;

  this.aFires = [];
  this.aSpark = [];
  this.aSpark2 = [];

  this.center = {
    x: this.canvas.width * 0.5,
    y: this.canvas.height * 0.9,
  };

  // Load the background image
  this.backgroundImage = new Image();
  this.backgroundImage.src = 'goddessillyria_lillith.png';
  this.backgroundImage.onload = () => {
    this.drawBackground();
  };

  this.init();
};

Fire.prototype.init = function () {
  // No glitter background
};

Fire.prototype.run = function () {
  this.update();
  this.draw();

  if (this.bRuning) requestAnimationFrame(this.run.bind(this));
};

Fire.prototype.start = function () {
  this.bRuning = true;
  this.run();
};

Fire.prototype.stop = function () {
  this.bRuning = false;
};

Fire.prototype.drawBackground = function () {
  const img = this.backgroundImage;
  const canvas = this.canvas;

  // Define the desired width and height for the background image
  const desiredWidth = canvas.width * 0.8; // Reduce image size to 80% of canvas width
  const desiredHeight = img.height * (desiredWidth / img.width); // Maintain aspect ratio

  // Calculate the position to center the image
  const offsetX = (canvas.width - desiredWidth) / 2;
  const offsetY = (canvas.height - desiredHeight) / 2;

  // Draw the image centered and scaled down
  this.ctx.drawImage(img, offsetX, offsetY, desiredWidth, desiredHeight);
};

Fire.prototype.update = function () {
  // Spawn flames around the border
  if (this.aFires.length < 300) {
    const side = Math.floor(rand(0, 4)); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (side) {
      case 0: x = rand(0, this.canvas.width); y = 0; break;
      case 1: x = this.canvas.width; y = rand(0, this.canvas.height); break;
      case 2: x = rand(0, this.canvas.width); y = this.canvas.height; break;
      case 3: x = 0; y = rand(0, this.canvas.height); break;
    }

    this.aFires.push(new Flame({ x, y }, this.center));
  }

  // Add more sparks for intensity
  for (let i = 0; i < 10; i++) {
    this.aSpark.push(new Spark(this.center));
    this.aSpark2.push(new Spark(this.center));
  }

  for (let i = this.aFires.length - 1; i >= 0; i--) {
    if (this.aFires[i].alive) this.aFires[i].update();
    else this.aFires.splice(i, 1);
  }

  for (let i = this.aSpark.length - 1; i >= 0; i--) {
    if (this.aSpark[i].alive) this.aSpark[i].update();
    else this.aSpark.splice(i, 1);
  }

  for (let i = this.aSpark2.length - 1; i >= 0; i--) {
    if (this.aSpark2[i].alive) this.aSpark2[i].update();
    else this.aSpark2.splice(i, 1);
  }
};

Fire.prototype.draw = function () {
  // Clear the canvas
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Draw the background image
  this.drawBackground();

  // Draw flames and sparks
  this.ctx.globalCompositeOperation = 'lighter'; // Ensure flames are bright and visible

  for (let i = this.aFires.length - 1; i >= 0; i--) {
    this.aFires[i].draw(this.ctx);
  }

  this.ctx.globalCompositeOperation = 'soft-light';

  for (let i = this.aSpark.length - 1; i >= 0; i--) {
    if (i % 2 === 0) this.aSpark[i].draw(this.ctx);
  }

  this.ctx.globalCompositeOperation = 'color-dodge';

  for (let i = this.aSpark2.length - 1; i >= 0; i--) {
    this.aSpark2[i].draw(this.ctx);
  }
};

Fire.prototype.drawHalo = function () {
  const r = rand(300, 350);
  this.ctx.globalCompositeOperation = 'lighter';
  this.grd = this.ctx.createRadialGradient(
    this.center.x,
    this.center.y,
    r,
    this.center.x,
    this.center.y,
    0
  );
  this.grd.addColorStop(0, 'transparent');
  this.grd.addColorStop(1, 'rgba(150, 40, 0, 0.8)'); // Deep red halo
  this.ctx.fillStyle = this.grd;
  this.ctx.fill();
};

var Flame = function (startPos, targetPos) {
  this.startPos = startPos;
  this.targetPos = targetPos;
  this.x = startPos.x;
  this.y = startPos.y;
  this.lx = this.x;
  this.ly = this.y;
  this.vy = rand(1, 3);
  this.vx = rand(-1, 1);
  this.r = rand(40, 60); // Larger flames
  this.life = rand(2, 7);
  this.alive = true;
  this.c = {
    h: Math.floor(rand(10, 30)), // Warmer hue
    s: 100,
    l: rand(90, 100), // Brighter flames
    a: 0,
    ta: rand(0.9, 1), // Higher opacity
  };
};

Flame.prototype.update = function () {
  this.lx = this.x;
  this.ly = this.y;

  // Move toward the target position (bottom center)
  const dx = this.targetPos.x - this.x;
  const dy = this.targetPos.y - this.y;
  const angle = Math.atan2(dy, dx);

  this.x += Math.cos(angle) * 4; // Faster movement
  this.y += Math.sin(angle) * 4;

  // Stop moving once close to the center
  if (Math.abs(this.x - this.targetPos.x) < 10 && Math.abs(this.y - this.targetPos.y) < 10) {
    this.x = this.targetPos.x;
    this.y = this.targetPos.y;
  }

  this.r -= 0.15; // Slower shrinking
  if (this.r <= 0) this.r = 0;

  this.life -= 0.1;

  if (this.life <= 0) {
    this.c.a -= 0.05;
    if (this.c.a <= 0) this.alive = false;
  } else if (this.life > 0 && this.c.a < this.c.ta) {
    this.c.a += 0.08;
  }
};

Flame.prototype.draw = function (ctx) {
  this.grd1 = ctx.createRadialGradient(this.x, this.y, this.r * 3, this.x, this.y, 0);
  this.grd1.addColorStop(0.5, 'hsla(' + this.c.h + ', ' + this.c.s + '%, ' + this.c.l + '%, ' + this.c.a / 20 + ')');
  this.grd1.addColorStop(0, 'transparent');

  this.grd2 = ctx.createRadialGradient(this.x, this.y, this.r, this.x, this.y, 0);
  this.grd2.addColorStop(0.5, 'hsla(' + this.c.h + ', ' + this.c.s + '%, ' + this.c.l + '%, ' + this.c.a + ')');
  this.grd2.addColorStop(0, 'transparent');

  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r * 3, 0, 2 * Math.PI);
  ctx.fillStyle = this.grd1;
  ctx.fill();

  ctx.globalCompositeOperation = 'overlay';
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
  ctx.fillStyle = this.grd2;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(this.lx, this.ly);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = 'hsla(' + this.c.h + ', ' + this.c.s + '%, ' + this.c.l + '%, 1)';
  ctx.lineWidth = rand(1, 2);
  ctx.stroke();
  ctx.closePath();
};

var Spark = function (targetPos) {
  this.targetPos = targetPos;
  this.x = rand(targetPos.x - 40, targetPos.x + 40);
  this.y = rand(targetPos.y, targetPos.y + 5);
  this.lx = this.x;
  this.ly = this.y;
  this.vy = rand(1, 3);
  this.vx = rand(-4, 4);
  this.r = rand(0, 1);
  this.life = rand(4, 8);
  this.alive = true;
  this.c = {
    h: Math.floor(rand(2, 40)),
    s: 100,
    l: rand(40, 100),
    a: rand(0.8, 0.9),
  };
};

Spark.prototype.update = function () {
  this.lx = this.x;
  this.ly = this.y;

  this.y -= this.vy;
  this.x += this.vx;

  if (this.x < this.targetPos.x) this.vx += 0.2;
  else this.vx -= 0.2;

  this.vy += 0.08;
  this.life -= 0.1;

  if (this.life <= 0) {
    this.c.a -= 0.05;
    if (this.c.a <= 0) this.alive = false;
  }
};

Spark.prototype.draw = function (ctx) {
  ctx.beginPath();
  ctx.moveTo(this.lx, this.ly);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = 'hsla(' + this.c.h + ', ' + this.c.s + '%, ' + this.c.l + '%, ' + this.c.a / 2 + ')';
  ctx.lineWidth = this.r * 2;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(this.lx, this.ly);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = 'hsla(' + this.c.h + ', ' + this.c.s + '%, ' + this.c.l + '%, ' + this.c.a + ')';
  ctx.lineWidth = this.r;
  ctx.stroke();
  ctx.closePath();
};

var rand = function (min, max) {
  return Math.random() * (max - min) + min;
};

var onresize = function () {
  oCanvas.canvas.width = window.innerWidth;
  oCanvas.canvas.height = window.innerHeight;
};

var oCanvas;
var init = function () {
  oCanvas = new Fire();
  oCanvas.start();

  // Reveal the links after 3 seconds (faster fade-in)
  setTimeout(() => {
    document.getElementById('link-container').classList.remove('hidden');
    document.getElementById('link-container').classList.add('visible');
  }, 3000); // Changed from 5000 to 3000
};

window.onload = init;
window.onresize = onresize;