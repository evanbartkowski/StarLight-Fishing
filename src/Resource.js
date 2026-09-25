class Resources {
    constructor() {
        this.toLoad = {
            background: "/sprites/underwater.jpg",
            intro: "/sprites/intro.jpg",
            start: "/sprites/startscreen.jpg",
            blueglow: "/sprites/blueglow.png",
            intro2: "/sprites/intro2.jpg",
            whitepage: "/sprites/whitepage.jpg",
            hook: "/sprites/hook.png",
            hook2: "/sprites/hook2.png",
            redglow: "/sprites/redglow.png",


        };

        // Bucket containing images
        this.images = {};

        // Load each image
        Object.keys(this.toLoad).forEach((key) => {
            const img = new Image();
            img.src = this.toLoad[key];
            this.images[key] = {
                image: img,
                isLoaded: false,
            };

            img.onload = () => {
                this.images[key].isLoaded = true;
            };

            img.onerror = () => {
                console.warn(`Could not load resource: ${this.toLoad[key]}`);
                this.images[key].isLoaded = true; // Mark as resolved so app won't hang
            };
        });
    }

    isAllLoaded() {
        return Object.values(this.images).every((res) => res.isLoaded);
    }
}

export const resources = new Resources();
