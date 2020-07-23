(function ($) {

    $.fn.reOrder = function (array, $parent) {
        if (array) {
            for (var i = 0; i < array.length; i++) {
                array[i] = $('[bd-name="' + array[i] + '"]');
                array[i].find('[bd-rank]').text(i + 1);
                $parent.append(array[i]);
            }
        }
    }
})(jQuery);