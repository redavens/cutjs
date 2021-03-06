/*
 * CutJS
 * Copyright (c) 2013-2015 Ali Shakiba, Piqnt LLC
 * Available under the MIT license
 * @license
 */

var Cut = require('./core');

DEBUG = typeof DEBUG === 'undefined' || DEBUG;

/**
 * Default loader for web.
 */

window.addEventListener('load', function() {
  DEBUG && console.log('On load.');
  Cut.start({
    'app-loader' : AppLoader,
    'image-loader' : ImageLoader,
  });
}, false);

function AppLoader(app, configs) {
  configs = configs || {};
  var canvas = configs.canvas, context = null, full = false;
  var width = 0, height = 0, ratio = 1;

  if (typeof canvas === 'string') {
    canvas = document.getElementById(canvas);
  }

  if (!canvas) {
    canvas = document.getElementById('cutjs');
  }

  if (!canvas) {
    full = true;
    DEBUG && console.log('Creating element...');
    canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    var body = document.body;
    body.insertBefore(canvas, body.firstChild);
  }

  context = canvas.getContext('2d');

  var devicePixelRatio = window.devicePixelRatio || 1;
  var backingStoreRatio = context.webkitBackingStorePixelRatio
      || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio
      || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
  ratio = devicePixelRatio / backingStoreRatio;

  var requestAnimationFrame = window.requestAnimationFrame
      || window.msRequestAnimationFrame || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame
      || function(callback) {
        return window.setTimeout(callback, 1000 / 60);
      };

  DEBUG && console.log('Creating root...');
  var root = new Cut.Root(requestAnimationFrame, function() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    this.render(context);
  });

  app(root, canvas);

  resize();
  window.addEventListener('resize', resize, false);

  function resize() {

    if (full) {
      width = (window.innerWidth > 0 ? window.innerWidth : screen.width);
      height = (window.innerHeight > 0 ? window.innerHeight : screen.height);

      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

    } else {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
    }

    width *= ratio;
    height *= ratio;

    canvas.width = width;
    canvas.height = height;

    DEBUG && console.log('Resize: ' + width + ' x ' + height + ' / ' + ratio);

    root.viewport(width, height, ratio);
  }

  return root;
}

function ImageLoader(src, handleComplete, handleError) {
  var image = new Image();
  DEBUG && console.log('Loading image: ' + src);
  image.onload = handleComplete;
  image.onerror = handleError;
  image.src = src;
  return image;
}
