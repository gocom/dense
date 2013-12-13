Dense.js
=====

[Homepage](http://dense.rah.pw) | [Issues](https://github.com/gocom/dense/issues) | [![Build Status](https://travis-ci.org/gocom/dense.png?branch=master)](https://travis-ci.org/gocom/dense)

Dense is a jQuery plugin for serving retina-ready, high pixel ratio images with ease. Small, ease-to-adapt, yet very customizable and works cross-browser. With Dense, your content images get support for ```data-ratiox``` attributes and Apple's retina image naming convention.

Install
-----

[Download package](http://dense.rah.pw/download) or using [Bower](http://bower.io):

    $ bower install dense

Usage
-----

Using Dense is simple. Include the plugin and initialize its method:

```html
<script src="jquery.js"></script>
<script src="dense.js"></script>
<script>
    $('img').dense();
</script>
```

For more instructions and options see the [documentation](http://dense.rah.pw).

Build
-----

Dense uses [Grunt](http://gruntjs.com) to run tasks. First make sure that you have all base dependencies installed by running npm in the repository's directory:

    $ cd dense
    $ npm install

After you have installed all dependencies, you will be able to run tasks using Grunt, like releasing, building, publishing and testing:

    $ grunt [task]

Where the ```[task]``` is one of ```test```, ```build```, ```jsdoc``` or ```release```. Tasks ```jsdoc``` and ```release:[major|minor|patch]``` require Java in addition to the Node.js due to the use of JSDoc3.
