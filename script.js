var Fire = function () {
  this.canvas = document.getElementById('fire');
  this.ctx = this.canvas.getContext('2d');
  this.canvas.height = window.innerHeight;
  this.canvas.width = window.innerWidth;

  this.aFires = [];
  this.aSpark = [];
  this.aSpark2 = [];

  this.center = {
    x: this.canvas.width * 0.5, // Center X
    y: this.canvas.height * 0.9, // Bottom center Y
  };

  this.init();
};

Fire.prototype.init = function () {
  this.imageObj = new Image();
  this.imageObj.src = 'https://assets.codepen.io/13471/silver-glitter-background.png';
  this.pattern = this.ctx.createPattern(this.imageObj, 'repeat');
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

Fire.prototype.update = function () {
  // Spawn flames around the border
  if (this.aFires.length < 100) {
    const side = Math.floor(rand(0, 4)); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (side) {
      case 0: // Top
        x = rand(0, this.canvas.width);
        y = 0;
        break;
      case 1: // Right
        x = this.canvas.width;
        y = rand(0, this.canvas.height);
        break;
      case 2: // Bottom
        x = rand(0, this.canvas.width);
        y = this.canvas.height;
        break;
      case 3: // Left
        x = 0;
        y = rand(0, this.canvas.height);
        break;
    }

    this.aFires.push(new Flame({ x, y }, this.center));
  }

  this.aSpark.push(new Spark(this.center));
  this.aSpark2.push(new Spark(this.center));

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
  this.clearCanvas();
  this.drawHalo();

  this.ctx.globalCompositeOperation = 'overlay';

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

Fire.prototype.clearCanvas = function () {
  this.ctx.globalCompositeOperation = 'source-over';
  this.ctx.fillStyle = 'rgba(15, 5, 2, 1)';
  this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  this.ctx.globalCompositeOperation = 'lighter';
  this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.fillStyle = this.pattern;
  this.ctx.fill();
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
  this.grd.addColorStop(1, 'rgb(50, 2, 0)');
  this.ctx.beginPath();
  this.ctx.arc(this.center.x, this.center.y - 100, r, 0, 2 * Math.PI);
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
  this.r = rand(30, 40);
  this.life = rand(2, 7);
  this.alive = true;
  this.c = {
    h: Math.floor(rand(2, 40)),
    s: 100,
    l: rand(80, 100),
    a: 0,
    ta: rand(0.8, 0.9),
  };
};

Flame.prototype.update = function () {
  this.lx = this.x;
  this.ly = this.y;

  // Move toward the target position (bottom center)
  const dx = this.targetPos.x - this.x;
  const dy = this.targetPos.y - this.y;
  const angle = Math.atan2(dy, dx);

  this.x += Math.cos(angle) * 2;
  this.y += Math.sin(angle) * 2;

  this.r -= 0.3;
  if (this.r <= 0) this.r = 0;

  this.life -= 0.12;

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

  // Stop the fire animation after 5 seconds and reveal the links
  setTimeout(() => {
    oCanvas.stop();
    document.getElementById('link-container').classList.remove('hidden');
    document.getElementById('link-container').classList.add('visible');
  }, 5000);
};

window.onload = init;
window.onresize = onresize;
