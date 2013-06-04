/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/

(function($)
{
    var nonExistant = $('<img src="nonexistent.jpg" />').dense('updateDimensions');
    $('#image').dense('updateDimensions');

    test("init:chainable", function()
    {
        var image = $('<div />').dense();

        equal(image.addClass('test').hasClass('test'), true, 'test class found');
    });

    test("updateDimensions:chainable", function()
    {
        var image = $('<div />').dense('updateDimensions');
        equal(image.addClass('test').hasClass('test'), true, 'test class found');
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
    });

}(jQuery));