(function ($) {

    $.fn.reOrder = function (array, $parent, updateRank) {
        if (array) {
            for (var i = 0; i < array.length; i++) {
                array[i] = $('[bd-name="' + array[i] + '"]');
                if (updateRank) {
                    array[i].find('[bd-rank]').text(i + 1);
                }
                $parent.append(array[i]);
            }
        }
    }
})(jQuery);