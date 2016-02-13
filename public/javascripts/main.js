/**
 * LoadImageErrorOverride (v1.12)
 * by GoToLoop (2015/Jul/09)
 *
 * forum.Processing.org/two/discussion/11608/
 * i-can-t-display-images-dynamically-loaded-from-web-
 * with-p5-js-always-a-cross-domain-issue
 */
 
var url = 'http://192.168.24.130:8080/stream?topic=/camera/depth/image_raw&width=640&height=360';
 
var img;
 
function loadImageErrorOverride(errEvt) {
  const pic = errEvt.target;
 
  if (!pic.crossOrigin)  return print('Failed to reload ' + pic.src + '!');
 
  print('Attempting to reload it as a tainted image now...');
  pic.crossOrigin = null, pic.src = pic.src;
}
 
function setup() {
  createCanvas(800, 600);

  img = loadImage(url);
        //    function (pic) { print(img = pic), redraw(); },
        //    loadImageErrorOverride);
}
 
function draw() {
  background(250);
  img.loadPixels();
  for (i=0; i<img.width; i++) {
    for (j=0; j<img.height; j++) {
      img.set(i, j, color(0, 90, 102, i%img.width * 2));
    }
  }
  img.updatePixels();
  image(img, 20, 20);
}
