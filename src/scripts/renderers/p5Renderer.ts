import * as seedrandom from 'seedrandom';
import { BaseRenderer } from './baseRenderer';
import gsap from 'gsap';
import P5 from 'p5';

const srandom = seedrandom('b');

let particles = [];

let image;
let dw = 0, dh = 0;
let freq;
let minSize;
let px = [];
let offset;

export default class P5Renderer implements BaseRenderer{

    colors = ['#fcb54c', '#dfded2', '#f4415d', '#1eaaa9', '#f39092', '#2d3168'];
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

        image = s.createGraphics(this.width, this.height);

        /*
        image.strokeCap(s.PROJECT);
        for (let i = 0; i < 10; i++) {
            image.strokeWeight(10 + srandom() * 20);
            image.line(-image.width + (i * 10), image.height, image.width, -image.height + (i * 10));
            image.stroke(this.colors[Math.floor(srandom() * this.colors.length)]);
        }
        */
        image.fill(255, 0, 0);
        image.rect(0, 20, this.width, 20);
        image.circle(this.width / 2, this.height / 2, 100);

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
            
            s.loadPixels();
            
            for (let i = 0; i < image.width; i++)
            {
              for (let j = 0; j < image.height; j++)
              {
                let w = ((s.map(1 + s.sin((s.TWO_PI * j * freq.x) / image.height + dh), 0, 2, minSize.x, 1) * image.width));
                let h = ((s.map(1 + s.sin((s.TWO_PI * i * freq.y) / image.width + dw), 0, 2, minSize.y, 1) * image.height));

                if ((image.width - w) / 2 <= i 
                && i < (image.width + w) / 2
                && ((image.height - h) / 2 <= j 
                && j < (image.height + h) / 2)) //check that pixels are within the new frame
                {
                    let mapX = Math.round(s.map(i, (image.width - w) / 2, (image.width + w) / 2 - 1, 0, image.width - 1));
                    let mapY = Math.round(s.map(j, (image.height - h) / 2, (image.height + h) / 2 - 1, 0, image.height - 1));

                    let index = 4 * (s.width * j + i);
                    let index2 = 4 * (image.width * mapY + mapX);

                    s.pixels[index] = px[index2];
                    s.pixels[index + 1] = px[index2 + 1];
                    s.pixels[index + 2] = px[index2 + 2];
                    s.pixels[index + 3] = px[index2 + 3];
                }
              }
            }
            
            s.updatePixels();
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
        }, 10000);
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