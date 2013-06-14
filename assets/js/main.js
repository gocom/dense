requirejs.config({
    paths:
    {
        'jquery'  : '//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min',
        'webfont' : '//ajax.googleapis.com/ajax/libs/webfont/1.4.6/webfont'
    },
    shim:
    {
        'tooltipster' : ['jquery']
    }
});

require(['jquery', 'dense'], function ($, dense)
{
    $('.ratio').text($(window).dense('devicePixelRatio'));
});

require(['jquery', 'thar'], function ($, thar)
{
    var toggle = $('<div id="toggle"><i class="icon-reorder icon-large"></i></div>'),
        nav = $('nav'),
        body = $('body');

    $('h2, h3').thar();
    $('main > h2').slice(0, -1).thar('getContentList', {target : nav});

    nav.find('ul').prepend('<li><a href="#"><i class="icon-home"></i></a></li>');
    nav.addClass('fadeIn');
    body.append(toggle);

    toggle.click(function()
	{
		nav.toggleClass('toggled');
        body.toggleClass('noscroll');
	});

    $('nav').find('a').click(function ()
    {
        if (nav.is('.toggled'))
        {
		    nav.toggleClass('toggled');
            body.toggleClass('noscroll');
        }
    });
});

require(['prism'], function ()
{
    Prism.highlightAll();
});

require(['jquery'], function ($)
{
    var docs = $('.docs');

    var renderParams = function (parameters)
    {
        var out = [];

        $.each(parameters, function (key, param)
        {
            if (param.name.indexOf('.') === -1)
            {
                out.push(
                    (param.optional ? '[' : '') +
                        param.type + ' ' + param.name + (param.default ? '=' + param.default : '') +
                    (param.optional ? ']' : '')
                );
            }
        });

        return out.join(', ');
    };

    $.ajax({
        url : '/content/docs.json'
    })
        .done(function (data, textStatus, jqXHR)
        {
            var basename = data.classes[0].name + '.' + data.classes[0].classes[0].name + '.' +
                data.classes[0].classes[0].classes[0].name, 
                constructor = data.classes[0].classes[0].classes[0].constructor, dl, dt, dd, params,
                plugin = data.classes[0].classes[0].classes[0].name, elementType;

            var addElement = function (key, value)
            {
                var code;
                params = renderParams(value.parameters);

                if (elementType === 'event')
                {
                    code = '$(window).on(\'' + value.name + '\', fn' + (params ? ' (' + params + ')' : '') + ')';
                }
                else
                {
                    code = basename + '(\'' + value.name + '\'' + (params ? ', ' + params : '') + ')';
                }

                docs
                    .append($('<h3 />').text(value.name))
                    .append($('<pre'+(value.returns ? ' class="signature" ' : '')+' />').html($('<code class="language-javascript" />').text(code)));

                if (value.returns)
                {
                    var returns = $('<p class="returns" />').html($('<span />').text(value.returns.description));

                    if ($.type(value.returns.type) === 'array')
                    {
                        $.each(value.returns.type, function (key, type)
                        {
                            returns.prepend(' ').prepend($('<b class="badge" />').text(type));
                        });
                    }
                    else
                    {
                        returns.prepend(' ').prepend($('<b class="badge" />').text(value.returns.type));
                    }

                    returns.prepend(' ').prepend('<i class="icon-chevron-right"></i>');
                    docs.append(returns);
                }

                docs.append('<p>' + value.description.split("\n\n").join("</p><p>") + '</p>');

                if (value.parameters.length)
                {
                    docs.append('<h4>Options</h4>');
                    dl = $('<dl />');

                    $.each(value.parameters, function (key, param)
                    {
                        dt = $('<dt />');
                        dd = $('<dd />');

                        if (param.name.indexOf('.') !== -1)
                        {
                            dt
                                .text(param.name.split('.').slice(1).join('.'))
                                .append(' ')
                                .append($('<span class="badge" />').text(param.type));

                            if (param.optional)
                            {
                                dt.append(' ').append($('<span class="badge" />').text('Optional'));
                            }

                            dd
                                .html(param.description)
                                .append(
                                    $('<pre />')
                                        .append($('<span class="badge" />').text('Default'))
                                        .append($('<code />').text(param.default))
                                );

                            dl.append(dt).append(dd);
                        }
                    });

                    docs.append(dl);
                }

                if (value.examples.length)
                {
                    docs.append('<h4>Example' + (value.examples.length > 1 ? 's' : '') + '</h4>');

                    $.each(value.examples, function (key, value)
                    {
                        docs.append($('<pre />').html($('<code class="language-javascript" />').text(value)));
                    });
                }
            };

            docs.append(
                $('<pre />')
                    .html($('<code class="language-javascript" />').text(basename + '(' + renderParams(constructor.parameters) + ')'))
            );

            docs.append($('<p />').html(constructor.description));
            
            if (data.classes[0].classes[0].classes[0].functions.length)
            {
                docs.append('<h2>Methods</h2>');
                $.each(data.classes[0].classes[0].classes[0].functions, addElement);
            }

            if (data.classes[0].classes[0].classes[0].events.length)
            {
                docs.append('<h2>Events</h2>');
                elementType = 'event';
                $.each(data.classes[0].classes[0].classes[0].events, addElement);
            }

            require(['prism'], function ()
            {
                Prism.highlightAll();
            });

            require(['thar'], function ()
            {
                docs.find('h2, h3').thar();
            });
        });
});

require(['jquery'], function ($)
{
    $('.clikhi').click(function ()
    {
        var copy, $this = $(this), region = $this.find('.clikhi-region');

        if (region.length)
        {
            copy = region.get(0);
        }
        else
        {
            copy = $this.get(0);
        }

        if ($.type(document.selection) !== 'undefined')
        {
            var range = document.body.createTextRange();
            range.moveToElementText(copy);
            range.select();
        }
        else if ($.type(window.getSelection) !== 'undefined')
        {
            var range = document.createRange();
            range.selectNode(copy);
            window.getSelection().addRange(range);
        }
	});
});

require(['jquery'], function ($)
{
    var w = $('#download-widget'), lastmod, time;

    if (w.length)
    {
        $.ajax({url : '/content/package.json'})
            .done(function (data, textStatus, jqXHR)
            {
                if ($.type(data) === 'object' && $.type(data.name) === 'string')
                {
                    lastmod = jqXHR.getResponseHeader('Last-Modified');

                    w.find('h1 b').text(data.title);
                    w.append('<p>Found package meta&hellip;</p>');
                    w.append($('<p>Version <b></b>&hellip;</p>').find('b').text(data.version).end());

                    if (lastmod)
                    {
                        time = new Date(lastmod);

                        if (time.toString() !== 'Invalid Date')
                        {
                            w.append($('<p>Updated on <b></b>&hellip;</p>').find('b').text(time.getFullYear() + '/' + time.getMonth() + '/' + time.getDate()).end());
                        }
                    }

                    var download = '/download/' + data.name + '.v' + data.version + '.zip';

                    w.append($('<p>Starting <a>download</a> in 2 seconds&hellip;</p>').find('a').attr('href', download).end());

                    window.setTimeout(function ()
                    {
                        window.location = download;
                        w.append('<p>Download starting&hellip;</p>');
                    }, 2000);
                }
                else
                {
                    w.append('<p>Unable to find package meta.</p>');
                }
            })
            .fail(function ()
            {
                w.append('<p>Unable to retrieve package meta. Please try again.</p>');
            });
    }
});

require(['jquery', 'tooltipster'], function ($)
{
    var button = $('.download .button'), time, tooltip = [];

    if (button.length === 0)
    {
        return;
    }

    $.ajax({url : '/content/package.json'})
        .done(function (data, textStatus, jqXHR)
        {
            if ($.type(data) !== 'object')
            {
                return;
            }

            tooltip.push('Version ' + data.version);

            if (time = jqXHR.getResponseHeader('Last-Modified'))
            {
                time = new Date(time);

                if (time.toString() !== 'Invalid Date')
                {
                    tooltip.push([time.getFullYear(), time.getMonth(), time.getDate()].join('/'));
                }
            }

            tooltip.push('<a href="#">Changes</a>');

            button
                .attr('href', '/download/' + data.name + '.v' + data.version + '.zip')
                .attr('title', tooltip.join(', '))
                .attr('download', 'download')
                .tooltipster();
        });
});

require(['webfont'], function ()
{
    WebFont.load({
        google:
        {
            families: ['Inconsolata:400,700', 'Oleo Script Swash Caps']
        }
    });
});

require(['tooltipster'], function ()
{
    $('.social [title], main > [title]').tooltipster();
});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-41593502-1']);
_gaq.push(['_gat._anonymizeIp']);
_gaq.push(['_setDomainName', 'none']);
_gaq.push(['_setVisitorCookieTimeout', 0]);
_gaq.push(['_setSessionCookieTimeout', 0]);
_gaq.push(['_setCampaignCookieTimeout', 0]);
_gaq.push(['_setCampaignTrack', false]);
_gaq.push(['_setClientInfo', false]);
_gaq.push(['_setDetectFlash', false]);
_gaq.push(['_trackPageview']);

require(['http://www.google-analytics.com/ga.js']);