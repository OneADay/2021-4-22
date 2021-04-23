import * as seedrandom from 'seedrandom';
import { BaseRenderer } from './baseRenderer';
import gsap from 'gsap';
import P5 from 'p5';

const srandom = seedrandom('b');

let particles = [];

let image;
let warpedImage;
let dw = 0, dh = 0;
let freq;
let minSize;
let px = [];
let offset;

export default class P5Renderer implements BaseRenderer{

    colors = ['#D9308D', '#EFEB8C', '#2C1D75', '#5E8C18', '#A7F205'];
    backgroundColor = '#FFFFFF';

    canvas: HTMLCanvasElement;
    s: any;

    completeCallback: any;
    delta = 0;
    animating = true;

    width: number = 1920 / 2;
    height: number = 1080 / 2;

    constructor(w, h) {

        this.width = w;
        this.height = h;

        const sketch = (s) => {
            this.s = s;
            s.pixelDensity(1);
            s.setup = () => this.setup(s)
            s.draw = () => this.draw(s)
        }

        new P5(sketch);

    }

    protected setup(s) {
        freq = s.createVector(1, 1);
        minSize = s.createVector(.7, .7);//image min size (width and height)

        let renderer = s.createCanvas(this.width, this.height);
        this.canvas = renderer.canvas;

        let scale = 3;
        image = s.createGraphics(this.width * scale, this.height * scale);
        warpedImage = s.createGraphics(this.width * scale, this.height * scale);

        image.strokeCap(s.PROJECT);
        for (let i = 0; i < image.width; i++) {
            image.strokeWeight(10 + srandom() * 20);
            image.line(-image.width + (i * 10), image.height, image.width, -image.height + (i * 10));
            image.stroke(this.colors[Math.floor(srandom() * this.colors.length)]);
        }
        
        //this.animating = false;
        //s.image(image, 0, 0, s.width, s.height);
        
        if (this.width * this.height > 0)
        {
          image.loadPixels();
          px = [...image.pixels];
          image.updatePixels();
          offset = this.width / 2 + this.height / 2;//in order to center the image but not in JS :'(
        }

    }

    protected draw(s) {

        if (this.animating) { 
            s.background(0, 0, 0, 255);

            dw += s.map(100, 0, s.width, .16, -0.16);  //oscilation speed
            dh += s.map(100, 0, s.height, .16, -0.16); //oscilation speed
            
            warpedImage.loadPixels();
            
            for (let i = 0; i < image.width; i++)
            {
              for (let j = 0; j < image.height; j++)
              {
                  //warp
                let w = ((s.map(1 + s.sin((s.TWO_PI * j * freq.x) / image.height + dh), 0, 2, minSize.x, 1) * image.width));
                let h = ((s.map(1 + s.sin((s.TWO_PI * i * freq.y) / image.width + dw), 0, 2, minSize.y, 1) * image.height));

                //map
                if ((image.width - w) / 2 <= i 
                && i < (image.width + w) / 2
                && ((image.height - h) / 2 <= j 
                && j < (image.height + h) / 2)) //check that pixels are within the new frame
                {
                    let mapX = Math.round(s.map(i, (image.width - w) / 2, (image.width + w) / 2, 0, image.width - 1));
                    let mapY = Math.round(s.map(j, (image.height - h) / 2, (image.height + h) / 2, 0, image.height - 1));

                    let index = 4 * (warpedImage.width * j + i);
                    let index2 = 4 * (image.width * mapY + mapX);

                    warpedImage.pixels[index] = px[index2];
                    warpedImage.pixels[index + 1] = px[index2 + 1];
                    warpedImage.pixels[index + 2] = px[index2 + 2];
                    warpedImage.pixels[index + 3] = px[index2 + 3];
                }
              }
            }
            
            warpedImage.updatePixels();

            let scale = 2;
            s.translate(-s.width / scale, -s.height / scale);
            s.scale(scale);
            s.image(warpedImage, 0, 0, s.width, s.height);

        }
    }

    public render() {

    }

    public play() {
        this.animating = true;
        setTimeout(() => {
            console.log('go');
            if (this.completeCallback) {
                this.completeCallback();
            }
        }, 1000);
    }

    public stop() {
        this.animating = false;
    }

    public setCompleteCallback(completeCallback: any) {
        this.completeCallback = completeCallback;
    }

    public resize() {
        this.s.resizeCanvas(window.innerWidth, window.innerHeight);
        this.s.background(0, 0, 0, 255);
    }
}