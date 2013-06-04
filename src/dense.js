/**
 * Dense - Device pixel ratio aware images
 *
 * @link    https://github.com/gocom/dense
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
     * Default options.
     */

    var defaults =
    {
        ping       : true,
        dimensions : 'preserve'
    },

    /**
     * An array of checked image URLs.
     */

    pathStack = [],

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
     * Renders a pixel-ratio-aware image.
     *
     * Dense defaults to the init method if no
     * method is specified.
     *
     * The method should be used to select the images that
     * should display retina-size images on high pixel ratio
     * devices.
     *
     * The correct image variation is selected based on the
     * device's pixel ratio. If the image element defines
     * data-{ratio}x (e.g. data-1x, data-2x, data-3x) attributes,
     * the most appropriate of those is selected.
     *
     * If no data-ratio attributes are defined, the retina image is
     * constructed from the specified <code>src</code> attribute.
     * The searched high pixel ratio images follow
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
     * This method can also be used to load image in semi-lazy fashion.
     * If the selector targets a element that isn't an image, an
     * image is appended to that location. The image is constructed
     * using the specified data-{ratio}x attributes like with normal
     * images.
     *
     * @param    {Object}  [options={}]                  Options
     * @param    {Boolean} [options.ping=true]           A prefix added to the generated links
     * @param    {String}  [options.dimensions=preserve] Whether to do with the 'width' and 'height'. Either "update", "remove" or "preserve"
     * @return   {Object}  this
     * @method   init
     * @memberof jQuery.fn.dense
     * @example
     * $('img.retina').dense({
     *  'ping'      : false,
     *  'dimension' : true
     * });
     */

    methods.init = function (options)
    {
        $.extend(defaults, options);

        return this.not('.jquery-dense-active').each(function ()
        {
            var $this = $(this),
                target,
                image = methods.getImageAttribute.call(this),
                originalImage = $this.attr('src'),
                ping = false,
                ext;

            if (image)
            {
                if ($this.not('img'))
                {
                    target = $this.siblings('img.jquery-dense-active').eq(0);

                    if (!target.length)
                    {
                        target = $('<img class="jquery-dense-active" />');
                        $this.append(target);
                    }

                    $this = target;
                }
            }
            else
            {
                if (!originalImage || devicePixelRatio == 1)
                {
                    return;
                }

                ext = image.split('.').pop().split(/[\?\#]/).shift();

                if ($.inArray(ext, skipExtensions))
                {
                    return;
                }

                image = originalImage.replace(regexSuffix, function (extension)
                {
                    return '_' + devicePixelRatio + 'x' + extension;
                });

                ping = options.ping && $.inArray(image, pathStack) === -1 && (regexProtocol.test(image) === false || image.indexOf('://' + document.domain) !== -1);
            }

            if (ping)
            {
                $.ajax({
                    url  : image,
                    type : 'HEAD'
                })
                    .done(function (data, textStatus, jqXHR)
                    {
                       var type = jqXHR.getResponseHeader('Content-type').split(';').shift();

                       if (jqXHR.status === 200 && (type === null || $.inArray(type, acceptedTypes) !== -1))
                       {
                           pathStack.push(image);

                           $this
                               .attr('src', image)
                               .data('jquery-dense-original', originalImage);

                            if (options.dimensions === 'update')
                            {
                                methods.updateDimensions.call($this.get(0));
                            }
                            else if (options.dimensions === 'remove')
                            {
                                $this.removeAttr('width').removeAttr('height');
                            }
                       }
                    });
            }
            else
            {
                $this
                    .attr('src', image)
                    .data('jquery-dense-original', originalImage);

                if (options.dimensions === 'update')
                {
                    methods.updateDimensions.call($this.get(0));
                }
                else if (options.dimensions === 'remove')
                {
                    $this.removeAttr('width').removeAttr('height');
                }
            }
        }).addClass('jquery-dense-active');
    };

    /**
     * Sets an image's width and height attributes to its native values.
     *
     * Updates an img element's dimensions to the source image's
     * real values. If the image doesn't exists, the width and the
     * height are set to 0.
     *
     * @return   {Object} this
     * @method   updateDimensions
     * @memberof jQuery.fn.dense
     * @example
     * var image = $('img').dense('updateDimensions');
     * alert(image.attr('width'));
     */

    methods.updateDimensions = function ()
    {
        return this.each(function ()
        {
            var img = new Image(), $this = $(this);
            img.src = $this.attr('src');
            $this.attr('width', img.width).attr('height', img.height);
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
     * Selects the most appropriate 'data-{ratio}x' attribute from
     * the given element's attributes.
     *
     * If the devices pixel ratio is greater than the largest specified image,
     * the largest one of the available is used.
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
            url = $(this).attr('data-' + i + 'x');

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
     * has a 'dense-retina' class.
     */

    $(document).ready(function ()
    {
        $('body.dense-retina img').dense();
    });
}));