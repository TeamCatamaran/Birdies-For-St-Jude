var services = pledgeit.services;
var views = birdiesforstjude.views;

birdiesforstjude.views.MainView = (function () {
    function MainView() {
        this._initialize();
        this._attachEvents();
    }

    MainView.prototype = {
        _$golferLeaderboard: null,
        _leaderboardService: null,
        _itemsPerPage: 10,


        // --------------------------------------------
        // Initialization
        // --------------------------------------------

        _initialize: function () {
            this._$golferLeaderboard = $('[bd-leaderboard]');

            this._leaderboardService = new services.LeaderboardService();

            // Retrieve all leaderboards via the API
            this._getStats();
            this._getGolfers();

            // Set up selectize
            if (window.Selectize) {
                $('select[selectize]').each($.proxy(function (index, select) {
                    $(select).selectize({
                        onChange: $.proxy(this._handleSortChange, this, select)
                    });
                }, this));
            }
        },

        _attachEvents: function () {
            $('[bd-show-more').on('click', $.proxy(this._handleShowMoreClick, this));
            $('[bd-sort]').on('change', $.proxy(this._handleSortChange, this));
            $('[bd-search]').on('keyup search', $.proxy(this._handleSearchKeyup, this));
        },

        // --------------------------------------------
        // Private Methods
        // --------------------------------------------

        _getStats: function () {
            this._leaderboardService.getTemplate("birdiesforstjude", {
                onSuccess: $.proxy(function (response) {
                    $('[bd-total-stats]')
                        .text(this._getValue(response.amountRaised))
                        .removeClass("-preload");
                }, this)
            })
        },

        _getGolfers: function () {
            birdies = 0;
            promises = [];

            this._$golferLeaderboard.find('[bd-slug]').each($.proxy(function (index, golfer) {
                promises.push(new Promise($.proxy(function (resolve, reject) {
                    this._leaderboardService.getCampaign(golfer.getAttribute("bd-slug"), {
                        onSuccess: $.proxy(function (response) {
                            $target = $(golfer);
                            $target.find("[bd-amount]")
                                .text(this._getValue(response.amountRaised))
                                .removeClass("-preload");

                            $target.find("[bd-performance]")
                                .text(response.performanceTotal)
                                .removeClass("-preload");

                            $target.find("[bd-donate]")
                                .attr("href", response.url + "/pledge")
                                .removeClass("-preload");

                            birdies += response.performanceTotal;
                            resolve();
                        }, this)
                    });
                }, this)))
            }, this));

            Promise.all(promises)
                .then($.proxy(function () {
                    $('[bd-birdie-stats]')
                        .text(birdies)
                        .removeClass("-preload");
                    this._$golferLeaderboard.find('[bd-slug]')
                        .reOrder(this._getSort('rank', this._$golferLeaderboard.find('[bd-slug]')), this._$golferLeaderboard, true)
                    this._$golferLeaderboard.find('[bd-slug]')
                        .filter(':hidden')
                        .slice(0, this._itemsPerPage)
                        .removeClass("-preload");
                    this._$golferLeaderboard
                        .removeClass('-preload')
                }, this));
        },

        _getFilter: function (search, $list) {
            search = search.toLowerCase();
            var items = this._mapItems($list).filter(function (index, item) {
                return item.name.toLowerCase().indexOf(search) > -1;
            });

            return items.map(function (i, r) {
                return r.name;
            });
        },

        _getSort: function (sort, $list) {
            var items = this._mapItems($list);

            items.sort(function (a, b) {
                var x = a.name.toLowerCase();
                var y = b.name.toLowerCase();
                return x < y ? -1 : x > y ? 1 : 0;
            });

            switch (sort) {
                case "birdies":
                    items.sort(function (a, b) {
                        return b.birdies - a.birdies;
                    });
                    break;
                case "rank":
                    items.sort(function (a, b) {
                        return b.amount - a.amount;
                    });
                    break;
            }

            return items.map(function (i, r) {
                return r.name;
            });
        },

        _getValue: function (amount) {
            return "$" + Number(parseFloat(amount.replace(/[,\$]/g, '')).toFixed(0)).toLocaleString();
        },

        _mapItems: function ($list) {
            return $list.map(function (index, golfer) {
                var $golfer = $(golfer);
                return {
                    amount: parseFloat($golfer.find('[bd-amount]').text().replace(/[,\$]/g, '')),
                    birdies: parseFloat($golfer.find('[bd-performance]').text()),
                    name: $golfer.attr("bd-name")
                }
            });
        },

        // --------------------------------------------
        // Event Handlers
        // --------------------------------------------

        _handleGolferSuccess: function (response, $target) {
            $target.find("[bd-amount]")
                .text("$" + response.amountRaised)
                .removeClass("-preload");
        },

        _handleStatSuccess: function (response, $target) {
            $target
                .text("$" + response.amountRaised)
                .removeClass("-preload");
        },

        _handleSearchKeyup: function (e) {
            $target = $(e.currentTarget);

            if ($target.val().length === 0) {
                this._$golferLeaderboard.find('[bd-slug]')
                    .filter(':hidden')
                    .slice(0, this._itemsPerPage)
                    .removeClass("-preload");
                $('[bd-show-more]').removeClass('-preload');
                $target.addClass('empty');
                return;
            }

            var items = this._getFilter($target.val(), this._$golferLeaderboard.find('[bd-slug]'));
            this._$golferLeaderboard.find('[bd-slug]')
                .addClass('-preload')

            for (var i = 0; i < items.length; i++) {
                $('[bd-name="' + items[i] + '"]')
                    .removeClass('-preload');
            }
            $('[bd-show-more]').addClass('-preload');
            $target.removeClass('empty');
        },

        _handleSortChange: function (e) {
            $target = $(e.currentTarget);
            this._$golferLeaderboard.find('[bd-slug]')
                .reOrder(this._getSort($target.find('option:selected').val(), this._$golferLeaderboard.find('[bd-slug]')), this._$golferLeaderboard, false);
            this._$golferLeaderboard.find('[bd-slug]')
                .filter(':hidden')
                .removeClass("-preload")
            $('[bd-show-more]').addClass('-preload');
        },

        _handleShowMoreClick: function (e) {
            e.preventDefault();
            this._$golferLeaderboard.find('[bd-slug]')
                .filter(':hidden')
                .removeClass("-preload")
            $(e.currentTarget).addClass('-preload');
        }
    };

    return MainView;
})();

$(function () {
    new birdiesforstjude.views.MainView();
});