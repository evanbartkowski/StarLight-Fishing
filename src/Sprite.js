import { Vector2 } from "./Vector2.js";

export class Sprite {
    constructor({
        resource, // Object containing the image and its loaded state
        frameSize, // Size of the crop of the image
        hFrames, // How the sprite is arranged horizontally
        vFrames, // How the sprite is arranged vertically
        frame, // Which frame to show
        scale, // How large to draw this image
        position, // Where to draw it (top left corner)
        animations,
    }) {
        this.resource = resource; // Should be { image, isLoaded }
        this.hFrames = hFrames ?? 1;
        this.vFrames = vFrames ?? 1;
        this.frame = frame ?? 0;
        this.frameMap = new Map();
        this.scale = scale ?? 1;
        this.position = position ?? new Vector2(0, 0);
        this.animations = animations ?? null;

        // Dynamically determine frameSize if not provided
        if (!frameSize && this.resource.isLoaded) {
            this.frameSize = new Vector2(
                this.resource.image.naturalWidth / this.hFrames,
                this.resource.image.naturalHeight / this.vFrames
            );
        } else {
            this.frameSize = frameSize ?? new Vector2(16, 16);
        }

        this.buildFrameMap();
    }

    buildFrameMap() {
        let frameCount = 0;
        for (let v = 0; v < this.vFrames; v++) {
            for (let h = 0; h < this.hFrames; h++) {
                this.frameMap.set(
                    frameCount,
                    new Vector2(this.frameSize.x * h, this.frameSize.y * v)
                );
                frameCount++;
            }
        }
    }

    step(delta) {
        if (!this.animations) {
            return;
        }
        this.animations.step(delta);
        this.frame = this.animations.frame;
    }

    drawImage(ctx, x, y, width, height) {
        if (!this.resource.isLoaded) return; // Ensure the resource is loaded
    
        ctx.drawImage(
            this.resource.image,              // Image resource
            0, 0,                             // Source x, y
            this.resource.image.naturalWidth, // Source width
            this.resource.image.naturalHeight,// Source height
            x, y,                             // Destination x, y
            width || this.resource.image.naturalWidth, // Destination width
            height || this.resource.image.naturalHeight // Destination height
        );
    }
    
    
}
