/**
 * @typedef {[Number, Number]} Point
 */

class Heading {
    static get EAST() { return 0; }
    static get NORTH() { return 1; }
    static get WEST() { return 2; }
    static get SOUTH() { return 3; }
}

class Game {

    constructor () {
        /** @typedef {Fruit[]} */
        this.fruits = [];
        /** @typedef {Snake[]} */
        this.snakes = [];

        this.nextStepTime = Date.now() + Game.STEP_IN_MILLIS;
        this.stepCount = 3;

        /** @typedef {Object[][]} matrix of tiles */
        this.board = Array.from(Array(Game.MAP_WIDTH), () => Array(Game.MAP_HEIGHT));

        this.app = new PIXI.Application(Game.CANVAS_WIDTH, Game.CANVAS_HEIGHT, { antialias: true });
        document.querySelector("#body").appendChild(this.app.view);
        this.app.stage.interactive = true;

        this.backgroundLayer = new PIXI.Graphics();
        this.fruitsLayer = new PIXI.Graphics();
        this.snakesLayer = new PIXI.Graphics();

        this.prepareBoard();

        this.app.stage.addChild(this.backgroundLayer);
        this.app.stage.addChild(this.fruitsLayer);
        this.app.stage.addChild(this.snakesLayer);
        this.app.ticker.add(this.drawFrame.bind(this));
    }

    prepareBoard() {
        const backgroundLayer = this.backgroundLayer;

        backgroundLayer.beginFill(Game.BACKGROUND_COLOR_LIGHT)
            .drawRect(0, 0, Game.CANVAS_WIDTH, Game.CANVAS_HEIGHT)
            .endFill();

        // draw checkers pattern
        backgroundLayer.beginFill(Game.BACKGROUND_COLOR_DARK);
        for (let y = 0; y < Game.MAP_HEIGHT; y++) {
            let shouldFill = y % 2 === 0;
            for (let x = 0; x < Game.MAP_WIDTH; x++) {
                if (shouldFill) {
                    backgroundLayer.drawRect(Game.screenX(x), Game.screenY(y), Game.TILE_SIZE_IN_PIXELS,
                        Game.TILE_SIZE_IN_PIXELS);
                }
                shouldFill = !shouldFill;
            }
        }
        backgroundLayer.endFill();

        // FRUITS ----------------------------------

        this.addFruit(Math.trunc((2/3) * Game.MAP_WIDTH), Math.trunc(Game.MAP_HEIGHT / 2));
        this.addSnake(Math.trunc((1/3) * Game.MAP_WIDTH), Math.trunc(Game.MAP_HEIGHT / 2), Heading.EAST, 2);
    }

    addFruit(x, y) {
        const fruit = new Fruit(x, y);
        this.fruits.push(fruit);
        this.board[x][y] = fruit;
        this.drawFruit(fruit);
    }

    addSnake(x, y, heading, length) {
        const snake = new Snake(x, y, heading, length);
        this.snakes.push(snake);
        this.board[x][y] = snake;
        this.drawSnake(snake);
    }

    /**
     * @param {Fruit} fruit
     */
    drawFruit(fruit) {
        const layer = this.fruitsLayer;

        const [x, y] = Game.pointToScreen(fruit.point);

        layer.beginFill(Game.FRUIT_COLOR)
            .drawCircle(x + Game.HALF_TILE_SIZE_IN_PIXELS, y + Game.HALF_TILE_SIZE_IN_PIXELS,
                Game.HALF_TILE_SIZE_IN_PIXELS)
            .endFill();
    }

    /**
     * @param {Snake} snake
     */
    drawSnake(snake) {
        const layer = this.snakesLayer;

        layer.beginFill(Game.SNAKE_COLOR);
        for (const position of snake.body) {
            const [x, y] = Game.pointToScreen(position);
            layer.drawRect(x, y, Game.TILE_SIZE_IN_PIXELS, Game.TILE_SIZE_IN_PIXELS);
        }
        layer.endFill();
    }

    updateSnakes() {
        if (this.stepCount-- === 0) {
            return;
        }

        this.snakesLayer.clear().beginFill(Game.SNAKE_COLOR);
        this.snakes.forEach(snake => {
            const intendedPosition = snake.getIntendedNextPosition();
            if (!Game.checkBounds(intendedPosition)) {
                // ToDo reset snake
                this.drawSnake(snake);  // let's just redraw it where it was the last time
                return;
            }

            snake.step();
            this.drawSnake(snake);
        });
        this.snakesLayer.endFill();
    }

    static checkBounds(position) {
        const [x, y] = position;
        return x >= 0 && y >= 0 && x < Game.MAP_WIDTH && y < Game.MAP_HEIGHT;
    }

    drawFrame() {
        const now = Date.now();
        if (now > this.nextStepTime) {
            this.updateSnakes();
            this.nextStepTime = now + Game.STEP_IN_MILLIS;
        }
    }

    /**
     * @param {Point} point
     * @return {Point}
     */
    static pointToScreen(point) {
        return [Game.screenX(point[0]), Game.screenY(point[1])];
    }

    static screenX(x) {
        return x * Game.TILE_SIZE_IN_PIXELS;
    }

    static screenY(y) {
        return y * Game.TILE_SIZE_IN_PIXELS;
    }

    static getCssVariable(variable) {
        return window.getComputedStyle(document.body).getPropertyValue(variable);
    }

    static getCssVariableAsNumber(variable) {
        return parseInt(Game.getCssVariable(variable), 10);
    }

    /**
     * Reads CSS variable `variable` as color in the form `#000000`.
     * @param {String} variable
     * @return {Number} a numeric representation of the color
     */
    static getCssVariableAsHexColor(variable) {
        return parseInt(Game.getCssVariable(variable).replace(/.*?([\da-fA-F]+).*?/, "$1"), 16);
    }
}

// class' pre-computed static constants
Game.MAP_WIDTH = Game.getCssVariableAsNumber("--map-width");
Game.MAP_HEIGHT = Game.getCssVariableAsNumber("--map-height");
Game.TILE_SIZE_IN_PIXELS = Game.getCssVariableAsNumber("--tile-size");
Game.HALF_TILE_SIZE_IN_PIXELS = Math.trunc(Game.TILE_SIZE_IN_PIXELS / 2);
Game.CANVAS_WIDTH = Game.TILE_SIZE_IN_PIXELS * Game.MAP_WIDTH;
Game.CANVAS_HEIGHT = Game.TILE_SIZE_IN_PIXELS * Game.MAP_HEIGHT;
Game.BACKGROUND_COLOR_LIGHT = Game.getCssVariableAsHexColor("--background-color-light");
Game.BACKGROUND_COLOR_DARK = Game.getCssVariableAsHexColor("--background-color-dark");
Game.FRUIT_COLOR = Game.getCssVariableAsHexColor("--fruit-color");
Game.SNAKE_COLOR = Game.getCssVariableAsHexColor("--snake-color");
Game.STEP_IN_MILLIS = 60;

window.addEventListener("load", () => {
    new Game();
});
