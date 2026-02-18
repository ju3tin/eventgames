class Sprite {
    constructor(img, x, y, width, height) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Draw the sprite frame at the specified position
    draw(ctx, x, y, width, height) {
        if (width && height) {
            ctx.drawImage(
                this.img,
                this.x,
                this.y,
                this.width,
                this.height,
                x,
                y,
                width,
                height
            );
        } else {
            ctx.drawImage(
                this.img,
                this.x,
                this.y,
                this.width,
                this.height,
                x,
                y,
                this.width,
                this.height
            );
        }
    }
}
