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
                constructor = data.classes[0].classes[0].classes[0].constructor, dl;

            docs.append(
                $('<pre class="language-javascript" />')
                    .html($('<code />').text(basename + '(' + renderParams(constructor.parameters) + ')'))
            );

            docs.append($('<p />').html(constructor.description));

            $.each(data.classes[0].classes[0].classes[0].functions, function (key, value)
            {
                docs
                    .append($('<h3 />').text(value.name))
                    .append(
                        $('<pre class="language-javascript" />')
                            .html($('<code />').text(basename + '(' + renderParams(value.parameters) + ')'))
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
                            dl.append($('<dt />').text(param.name.split('.').pop()));
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