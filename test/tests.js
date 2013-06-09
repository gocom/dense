(function($)
{
    var image = $('<img id="image" src="resources/images/image.jpg" />'), loaded = 0;
    $('body').append(image);
    $('#image').dense('updateDimensions');

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
            equal(nonExistant.attr('width'), undefined, 'image width is undefined');
        });

        test('init:nonExistantNoChange', function ()
        {
            equal(nonExistant.attr('data-jquery-dense-original'), undefined, 'image not changed');
        });
    });

}(window.jQuery || window.Zepto));