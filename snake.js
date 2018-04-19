
class Snake {

    /**
     * @param {Number} x
     * @param {Number} y
     * @param {Heading} heading
     * @param {Number} length
     */
    constructor (x, y, heading, length) {
        /** @type {Point} head position */
        this.position = [x, y];
        this.heading = heading;
        this.length = length;
        this.body = [];
        this.resetBody();
    }

    getIntendedNextPosition() {
        const dx = this.deltaXFromHeading();
        const dy = this.deltaYFromHeading();
        const head = this.body[this.body.length - 1];
        return [head[0] + dx, head[1] + dy];
    }

    deltaXFromHeading() {
        return this.heading === Heading.EAST ? +1 : this.heading === Heading.WEST ? -1 : 0;
    }

    deltaYFromHeading() {
        return this.heading === Heading.NORTH ? -1 : this.heading === Heading.SOUTH ? +1 : 0;
    }

    resetBody() {
        const x = this.position[0];
        const y = this.position[1];
        const dx = this.deltaXFromHeading();
        const dy = this.deltaYFromHeading();

        // the head will always be the last element in the array
        for (let i = 0; i < this.length; i++) {
            this.body.unshift([x - i * dx, y - i * dy]);
        }
    }

    step() {
        const head = this.body[this.body.length - 1];
        const dx = this.deltaXFromHeading();
        const dy = this.deltaYFromHeading();
        this.body.push([head[0] + dx, head[1] + dy]);  // move head
        this.body.shift();  // remove tail
    }
}
