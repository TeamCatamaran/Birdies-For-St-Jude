(function ($) {

    $.fn.reOrder = function (array) {
        return this.each(function () {

            if (array) {
                for (var i = 0; i < array.length; i++)
                    array[i] = $('[gs-name="' + array[i] + '"]');

                $(this).empty();

                for (var i = 0; i < array.length; i++)
                    $(this).append(array[i]);
            }
        });
    }
})(jQuery);