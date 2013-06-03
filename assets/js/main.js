$(document).ready(function ()
{
    $('.ratio').text($(window).dense('devicePixelRatio'));

    var docs = $('#docs');

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
        url : '/docs/docs.json'
    })
        .done(function (data, textStatus, jqXHR)
        {
            var basename = data.classes[0].name + '.' + data.classes[0].classes[0].name + '.' +
                data.classes[0].classes[0].classes[0].name, 
                constructor = data.classes[0].classes[0].classes[0].constructor, dl, params,
                plugin = data.classes[0].classes[0].classes[0].name;

            docs.append(
                $('<pre class="language-javascript" />')
                    .html($('<code />').text(basename + '(' + renderParams(constructor.parameters) + ')'))
            );

            docs.append($('<p />').html(constructor.description));

            $.each(data.classes[0].classes[0].classes[0].functions, function (key, value)
            {
                params = renderParams(value.parameters);

                docs
                    .append($('<h3 />').text(value.name))
                    .append(
                        $('<pre class="language-javascript" />')
                            .html($('<code />').text(basename + '(\'' + value.name + '\'' + (params ? ', ' + params : '') + ')'))
                    )
                    .append($('<p />').html(value.description.replace("\n\n", "</p><p>")));

                if (value.parameters.length)
                {
                    docs.append('<h4>Options</h4>');
                    dl = $('<dl />');

                    $.each(value.parameters, function (key, param)
                    {
                        if (param.name.indexOf('.') !== -1)
                        {
                            dl.append($('<dt />').text(param.name.split('.').slice(1).join('.')));
                            dl.append($('<dd />').html(param.description));
                        }
                    });

                    docs.append(dl);
                }

                if (value.examples.length)
                {
                    docs.append('<h4>Example' + (value.examples.length > 1 ? 's' : '') + '</h4>');

                    $.each(value.examples, function (key, value)
                    {
                        docs.append($('<pre class="language-javascript" />').html($('<code />').text(value)));
                    });
                }
            });

            Rainbow.color();
        });
});

/**
 * Click to select.
 */

(function ()
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
})();