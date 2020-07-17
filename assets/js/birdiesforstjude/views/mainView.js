var services = pledgeit.services;
var views = birdiesforstjude.views;

birdiesforstjude.views.MainView = (function () {
    function MainView() {
        this._initialize();
    }

    MainView.prototype = {
        _$stats: null,
        _leaderboardService: null,

        // --------------------------------------------
        // Initialization
        // --------------------------------------------

        _initialize: function () {
            this._$stats = $('[bd-stats]');

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

        // --------------------------------------------
        // Private Methods
        // --------------------------------------------

        _getStats: function () {
            this._leaderboardService.getTemplate("birdiesforstjude", {
                onSuccess: $.proxy(function (response) {
                    this._$stats
                        .find('[bd-total-stats]')
                        .text(this._getValue(response.amountRaised))
                        .removeClass("-preload");
                }, this)
            })
        },

        _getGolfers: function () {
            birdies = 0;

            $("[bd-slug]").each($.proxy(function (index, golfer) {
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
                        this._$stats
                            .find('[bd-birdie-stats]')
                            .text(birdies)
                            .removeClass("-preload");
                    }, this)
                });
            }, this))
        },

        _getSort: function (sort, $list) {
            var items = $list.find("[bd-name]").map(function (index, golfer) {
                var $golfer = $(golfer);
                return {
                    amount: parseFloat($golfer.find('[bd-amount]').text().replace(/[,\$]/g, '')),
                    name: $golfer.attr("bd-name")
                }
            });

            items.sort(function (a, b) {
                var x = a.name.toLowerCase();
                var y = b.name.toLowerCase();
                return x < y ? -1 : x > y ? 1 : 0;
            });

            switch (sort) {
                case "high":
                    items.sort(function (a, b) {
                        return b.amount - a.amount;
                    });
                    break;
                case "low":
                    items.sort(function (a, b) {
                        return a.amount - b.amount;
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

        _handleSortChange: function (target, sort) {
            $list = $(target).closest("section").find("[bd-golfers]");
            $list.reOrder(this._getSort(sort, $list));
        }
    };

    return MainView;
})();

$(function () {
    new birdiesforstjude.views.MainView();
});