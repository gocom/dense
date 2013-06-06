/**
 * Dense - Device pixel ratio aware images
 *
 * @link    http://dense.rah.pw
 * @license MIT
 */

/*
 * Copyright (C) 2013 Jukka Svahn
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @name jQuery
 * @class
 */

/**
 * @name fn
 * @class
 * @memberOf jQuery
 */

;(function (factory)
{
	if (typeof define === 'function' && define.amd)
	{
		define(['jquery'], factory);
	}
	else
	{
		factory(jQuery);
	}
}(function ($)
{
    /**
     * An array of checked image URLs.
     */

    var pathStack = [],

    /**
     * Methods.
     */

    methods = {},

    /**
     * Regular expression to check whether the URL has a protocol.
     *
     * Is used to check whether the image URL is external.
     */

    regexProtocol = /^https?:\/\//,

    /**
     * Regular expression that split extensions from the file.
     *
     * Is used to inject the DPR suffix to the name.
     */

    regexSuffix = /\.\w+$/,

    /**
     * Device pixel ratio.
     */

    devicePixelRatio,

    /**
     * An array of accepted content-types.
     *
     * Basically contains an array of raster image formats.
     */

    acceptedTypes =
    [
        'image/jpg',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp'
    ],

    /**
     * Skipped image file extensions.
     *
     * Vectors don't need automatic pixel ratio support.
     */

    skipExtensions =
    [
        'svg'
    ];

    /**
     * Init is the default method responsible for rendering 
     * a pixel-ratio-aware images.
     *
     * This method is used to select the images that
     * should display retina-size images on high pixel ratio
     * devices. Dense defaults to the init method if no
     * method is specified.
     *
     * When attached to an image, the correct image variation is
     * selected based on the device's pixel ratio. If the image element
     * defines <code>data-{ratio}x</code> attributes (e.g. data-1x, data-2x, data-3x),
     * the most appropriate of those is selected.
     *
     * If no data-ratio attributes are defined, the retina image is
     * constructed from the <code>src</code> attribute.
     * The searched high pixel ratio images follows
     * a <code>{imageName}_{ratio}x.{ext}</code> naming convention.
     * For an image found in /path/to/images/image.jpg, the 2x retina
     * image would be looked from /path/to/images/image_2x.jpg.
     *
     * When image is constructed from the src, the image existance is
     * verified using HTTP HEAD request. The check makes sure no
     * HTTP error code is returned, and that the received content-type
     * is either <code>image/jpg</code>, <code>image/png</code>,
     * <code>image/gif</code> or <code>image/bmp</code>. Vector image
     * formats, like svg, are skipped.
     *
     * This method can also be used to load image in semi-lazy fashion,
     * and avoid larger extra HTTP requests due to retina replacements.
     * The data-1x attribute can be used to supstitute the src, making
     * sure the browser doesn't try to download the normal image variation
     * before the JavaScript driven behaviour kicks in.
     *
     * @param    {Object}  [options={}]                  Options
     * @param    {Boolean} [options.ping=true]           A prefix added to the generated links
     * @param    {String}  [options.dimensions=preserve] What to do with the <code>width</code> and <code>height</code> attributes. Either <code>update</code>, <code>remove</code> or <code>preserve</code>
     * @return   {Object}  this
     * @method   init
     * @memberof jQuery.fn.dense
     * @fires    jQuery.fn.dense#dense-retina-loaded
     * @example
     * $('img.retina').dense({
     *  'ping'      : false,
     *  'dimension' : true
     * });
     */

    methods.init = function (options)
    {
        options = $.extend({
            ping       : true,
            dimensions : 'preserve'
        }, options);

        this.filter('img').not('.dense').addClass('dense dense-loading').each(function ()
        {
            var $this = $(this),
                image = methods.getImageAttribute.call(this),
                originalImage = $this.attr('src'),
                ping = false,
                updateImage;

            if (!image)
            {
                if (!originalImage || devicePixelRatio == 1 || $.inArray(image.split('.').pop().split(/[\?\#]/).shift(), skipExtensions))
                {
                    return;
                }

                image = originalImage.replace(regexSuffix, function (extension)
                {
                    return '_' + devicePixelRatio + 'x' + extension;
                });

                ping = options.ping && $.inArray(image, pathStack) === -1 && (regexProtocol.test(image) === false || image.indexOf('://' + document.domain) !== -1);
            }

            updateImage = function ()
            {
                var readyImage = function ()
                {
                    $this.removeClass('dense-loading').addClass('dense-ready').trigger('dense-retina-loaded');
                };

                $this.attr('src', image).data('dense-original', originalImage);

                if (options.dimensions == 'update')
                {
                    $this.dense('updateDimensions').one('dense-dimensions-updated', readyImage);
                }
                else
                {
                    if (options.dimensions == 'remove')
                    {
                        $this.removeAttr('width height');
                    }

                    readyImage();
                }
            };

            if (ping)
            {
                $.ajax({
                    url  : image,
                    type : 'HEAD'
                })
                    .done(function (data, textStatus, jqXHR)
                    {
                        var type = jqXHR.getResponseHeader('Content-type');

                        if (jqXHR.status === 200 && (type === null || $.inArray(type.split(';').shift(), acceptedTypes) !== -1))
                        {
                            pathStack.push(image);
                            updateImage();
                        }
                    });
            }
            else
            {
                updateImage();
            }
        });

        return this;
    };

    /**
     * Sets an image's width and height attributes to its native values.
     *
     * Updates an img element's dimensions to the source image's
     * real values. This method is asynchronous, so you can not directly
     * return its values. Instead, use the 'dense-dimensions-updated'
     * event to detect when the action is done.
     *
     * @return   {Object} this
     * @method   updateDimensions
     * @memberof jQuery.fn.dense
     * @fires    jQuery.fn.dense#dense-dimensions-updated
     * @example
     * var image = $('img').dense('updateDimensions');
     */

    methods.updateDimensions = function ()
    {
        return this.each(function ()
        {
            var img, $this = $(this), src = $this.attr('src');

            if (src)
            {
                img = new Image();
                img.src = src;

                $(img).on('load.dense', function ()
                {
                    $this.attr('width', img.width).attr('height', img.height);
                    $this.trigger('dense-dimensions-updated');
                });
            }
        });
    };

    /**
     * Gets device pixel ratio rounded up to the closest integer.
     *
     * @return   {Integer} The pixel ratio
     * @method   devicePixelRatio
     * @memberof jQuery.fn.dense
     * @example
     * var ratio = $(window).dense('devicePixelRatio');
     * alert(ratio);
     */

    methods.devicePixelRatio = function ()
    {
        var pixelRatio = 1;

        if ($.type(window.devicePixelRatio) !== 'undefined')
        {
            pixelRatio = window.devicePixelRatio;
        }
        else if ($.type(window.matchMedia) !== 'undefined')
        {
            $.each([1.3, 1.5, 2, 3, 4, 5, 6], function (key, ratio)
            {
                var mediaQuery = [
                    '(-webkit-min-device-pixel-ratio: '+ratio+')',
                    '(min--moz-device-pixel-ratio: '+ratio+')',
                    '(-o-min-device-pixel-ratio: '+ratio+')',
                    '(min-resolution: '+ratio+'dppx)'
                ].join(',');

                if (!window.matchMedia(mediaQuery).matches)
                {
                    pixelRatio = ratio;
                    return false;
                }
            });
        }

        return Math.ceil(pixelRatio);
    };

    /**
     * Gets an appropriate URL for the pixel ratio from the data attribute list.
     *
     * Selects the most appropriate <code>data-{ratio}x</code> attribute from
     * the given element's attributes. If the devices pixel ratio is greater
     * than the largest specified image, the largest one of the available is used.
     *
     * @return   {String|Boolean} The attribute value
     * @method   getImageAttribute
     * @memberof jQuery.fn.dense
     * @example
     * var image = $('<div data-1x="image.jpg" data-2x="image_2x.jpg" />').dense('getImageAttribute');
     * $('body').css('background-image', 'url(' + image + ')');
     */

    methods.getImageAttribute = function ()
    {
        var $this = $(this).eq(0), image = false, url;

        for (var i = 1; i <= devicePixelRatio; i++)
        {
            url = $this.attr('data-' + i + 'x');

            if (url)
            {
                image = url;
            }
        }

        return image;
    };

    devicePixelRatio = methods.devicePixelRatio();

    /**
     * Dense offers few methods and options that can be used to both customize the
     * plugin's functionality and return resulting values. All interaction is done through
     * the <code>$.fn.dense()</code> method, that accepts a called method and its options
     * object as its arguments. Both arguments are optional, and either one can be omitted.
     *
     * @param    {String}  [method=init] The called method
     * @param    {Object}  [options={}]  Options passed to the method
     * @class    dense
     * @memberof jQuery.fn
     */

    $.fn.dense = function (method, options)
    {
        if ($.type(method) !== 'string' || $.type(methods[method]) !== 'function')
        {
            options = method;
            method = 'init';
        }

        return methods[method].call(this, options);
    };

    /**
     * Initialize automatically when document is ready.
     *
     * Dense is initialized automatically if the body element
     * has a <code>dense-retina</code> class.
     */

    $(document).ready(function ()
    {
        $('body.dense-retina img').dense();
    });

    /**
     * This event is invoked when an retina image has finished loading.
     *
     * @event    jQuery.fn.dense#dense-retina-loaded
     * @type     {Object}
     */

    /**
     * This event is invoked when an image's dimensions are
     * have been updated by the <code>updateDimensions</code>
     * method.
     *
     * @event    jQuery.fn.dense#dense-dimensions-updated
     * @type     {Object}
     */
}));