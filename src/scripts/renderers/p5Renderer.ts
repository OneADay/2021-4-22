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

    colors = ['#4EEC6C', '#FFEB34', '#00A7FF', '#FF6100', '#FF0053'];
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
        minSize = s.createVector(.2, .7);//image min size (width and height)

        let renderer = s.createCanvas(this.width, this.height);
        this.canvas = renderer.canvas;

        image = s.createGraphics(this.width, this.height);

        image.background(0, 100, 50, 255);

        image.noStroke();
        image.fill(0, 50, 100, 255);
        for (let i = 0; i < 4; i++) {
            image.rect(0, (this.height / 8) * (i * 2), this.width, this.height / 8);
        }

        //s.image(image, 0, 0, s.width, s.height);

        if (this.width * this.height > 0)
        {
          //px = new Array(this.width * this.height);
          image.loadPixels();
          px = [...image.pixels];
          //s.arrayCopy(image.pixels, px);    //store the image's pixels once and for all
          image.updatePixels();
          offset = this.width / 2 + this.height / 2;//in order to center the image but not in JS :'(
        }

    }

    protected draw(s) {

        if (this.animating) { 
            s.background(0, 0, 0, 255);

            dw += s.map(100, 0, s.width, .16, -.16);  //oscilation speed
            dh += s.map(100, 0, s.height, .16, -.16); //oscilation speed
              
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
                && j < (image.height + h) / 2))//check that pixels are within the new frame
                {
                    let mapY = s.map(j, (image.height - h) / 2, (image.height + h) / 2, 0, image.height - 1);
                    let mapX = s.map(i, (image.width - w) / 2, (image.width + w) / 2, 0, image.width - 1);
                   
                    let index = 4 * (s.width * j + i);
                    let index2 = 4 * Math.floor((image.width * mapY + mapX));

                    s.pixels[index] = px[index2];
                    s.pixels[index+1] = px[index2 + 1];
                    s.pixels[index+2] = px[index2 + 2];
                    s.pixels[index+3] = px[index2 + 3];
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