(function($)
{
    var image = $('<img id="image" src="resources/images/image.jpg" />'), loaded = 0;
    $('body').append(image).append('<img id="image2" src="resources/images/image.jpg" />');
    $('#image').dense('updateDimensions');
    $('#image2').dense();

    var nonExistant = $('<img src="nonexistant.jpg" />').dense('updateDimensions').dense();

    test("init:chainable", function()
    {
        var image = $('<div />').dense();
        ok(image.addClass('test').hasClass('test'), 'test class found');
    });

    test("updateDimensions:chainable", function()
    {
        var image = $('<div />').dense('updateDimensions');
        ok(image.addClass('test').hasClass('test'), 'test class found');
    });

    test("devicePixelRatio", function()
    {
        equal($(window).dense('devicePixelRatio') >= 1, true, 'returned device pixel ratio');
    });

    $(document).ready(function ()
    {
        test("updateDimensions:DOM", function()
        {
            equal($('#image').attr('width'), '5', 'image width was set to 5');
        });

        test("updateDimensions:widthNonexistantImage", function()
        {
            var width = nonExistant.attr('width');
            ok(width === undefined || width === 0, 'image width is undefined, or zero');
        });

        test('init:nonExistantNoChange', function ()
        {
            equal(nonExistant.attr('data-jquery-dense-original'), undefined, 'image not changed');
        });

        test('init:imagedone', function ()
        {
            equal($('.dense-loading').length, 0, 'image processed successfully');
        });
    });

}(window.jQuery || window.Zepto));