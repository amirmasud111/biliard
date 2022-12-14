
const BALL_ORIGIN = new Vector(25, 25);
const STICK_ORIGIN = new Vector(970, 11);
const SHOOT_ORIGIN = new Vector(950, 11);
const DELTA = 0.01;



//loading assets
let sprites = {}
let assetsStillLoading = 0;

function loadSprites(fileName) {
    assetsStillLoading++;
    let spriteImage = new Image();
    spriteImage.src = "./assets/sprites/" + fileName;

    spriteImage.addEventListener("load", function () {
        assetsStillLoading--;
    })

    return spriteImage
}

function loadAssets(callBack) {
    sprites.backGround = loadSprites("background.png");
    sprites.whiteBall = loadSprites("ball.png");
    sprites.stick = loadSprites("stick.png");

    assetsLoadingLoop(callBack);
}

function assetsLoadingLoop(callBack) {
    if (assetsStillLoading) {
        requestAnimationFrame(assetsLoadingLoop.bind(this, callBack))
    } else {
        callBack();
    }
}
/////////////////////////////////////
function Vector(x = 0, y = 0) {
    this.x = x;
    this.y = y;
}

Vector.prototype.copy = function () {
    return new Vector(this.x, this.y)
}

Vector.prototype.addTo = function (vector) {
    this.x += vector.x;
    this.y += vector.y;
}

Vector.prototype.mult = function (value) {
    return new Vector(this.x * value, this.y * value)
}

Vector.prototype.length = function () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
}


// handleing mouse //

function ButtonState() {
    this.down = false; // keeping pressed
    this.pressed = false;
}

function MouseHandler() {
    this.left = new ButtonState();
    this.middle = new ButtonState();
    this.right = new ButtonState();
    this.position = new Vector();

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)
}

MouseHandler.prototype.reset = function () {
    this.left.pressed = false;
    this.middle.pressed = false;
    this.right.pressed = false;
}

function handleMouseMove(e) {
    Mouse.position.x = e.pageX;
    Mouse.position.y = e.pageY;

}
function handleMouseDown(e) {
    handleMouseMove(e);
    if (e.which == 1) {
        Mouse.left.pressed = true;
        Mouse.left.down = true;
    } else if (e.which == 2) {
        Mouse.middle.pressed = true;
        Mouse.middle.down = true;
    } else if (e.which == 3) {
        Mouse.right.pressed = true;
        Mouse.right.down = true;
    }
}
function handleMouseUp(e) {
    handleMouseMove(e);
    if (e.which == 1) {
        Mouse.left.pressed = true;
        Mouse.left.down = false;
    } else if (e.which == 2) {
        Mouse.middle.pressed = true;
        Mouse.middle.down = false;
    } else if (e.which == 3) {
        Mouse.right.pressed = true;
        Mouse.right.down = false;
    }
}

let Mouse = new MouseHandler();


////////////////////////////////////


function Canvas2D() {
    this._canvas = document.querySelector("#screen");
    this.ctx = this._canvas.getContext("2d");
}

Canvas2D.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this._canvas.clientWidth, this._canvas.clientHeight);
}

Canvas2D.prototype.drawImage = function (
    image,
    position = new Vector(),
    origin = new Vector(),
    rotation = 0
) {
    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(rotation);
    this.ctx.drawImage(image, -origin.x, -origin.y);
    this.ctx.restore();
}

let Canvas = new Canvas2D();


//ball//

function Ball(position) {
    this.position = position;
    this.velocity = new Vector();
    this.moving = false;
}

Ball.prototype.update = function (delta) {
    this.position.addTo(this.velocity.mult(delta));
    this.velocity = this.velocity.mult(0.98);
    if (this.velocity.length() < 5) {
        this.velocity = new Vector();
        this.moving = false;
    }
}
Ball.prototype.draw = function () {
    Canvas.drawImage(sprites.whiteBall, this.position, BALL_ORIGIN)
}

Ball.prototype.shoot = function (power, rotation) {

    this.velocity = new Vector(power * Math.cos(rotation), power * Math.sin(rotation));
    this.moving = true;
}


////////////////////

// stick //
function Stick(position, onShoot) {
    this.position = position;
    this.rotation = 0;
    this.origin = STICK_ORIGIN.copy();
    this.power = 0;
    this.onShoot = onShoot;
    this.shot = false;
}

Stick.prototype.draw = function () {
    Canvas.drawImage(sprites.stick, this.position, this.origin, this.rotation)
}

Stick.prototype.update = function () {
    this.updateRotation();
    if (Mouse.left.down) {
        this.inscreesePower();
    } else if (this.power > 0) {
        this.shoot();
    }
}

Stick.prototype.updateRotation = function () {
    let oposite = Mouse.position.y - this.position.y;
    let adjacent = Mouse.position.x - this.position.x;
    this.rotation = Math.atan2(oposite, adjacent)
}

Stick.prototype.inscreesePower = function () {
    this.power += 100;
    this.origin.x += 5;
}

Stick.prototype.shoot = function () {
    this.onShoot(this.power, this.rotation);
    this.power = 0;
    this.origin = SHOOT_ORIGIN.copy();
    this.shot = true;
}

Stick.prototype.reposition = function (position) {
    this.position = position.copy();
    this.origin = STICK_ORIGIN.copy();
}

/////////////////////


function GameWorld() {
    this.whiteBall = new Ball(new Vector(413, 413));
    this.stick = new Stick(new Vector(413, 413), this.whiteBall.shoot.bind(this.whiteBall))
}

GameWorld.prototype.update = function () {

    this.stick.update();
    this.whiteBall.update(DELTA);
    if (!this.whiteBall.moving && this.stick.shot) {
        this.stick.reposition(this.whiteBall.position);
    }
}

GameWorld.prototype.draw = function () {
    Canvas.drawImage(sprites.backGround);
    this.whiteBall.draw();
    this.stick.draw();
}

let gameWorld = new GameWorld();


function animate() {
    Canvas.clear();
    gameWorld.update();
    gameWorld.draw();
    requestAnimationFrame(animate);
}

loadAssets(animate);