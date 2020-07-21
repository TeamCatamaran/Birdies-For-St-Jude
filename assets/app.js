(function () {
    window.pledgeit = window.pledgeit || {};

    window.pledgeit.services = window.pledgeit.services || {};

    window.birdiesforstjude = window.birdiesforstjude || {};

    window.birdiesforstjude.views = window.birdiesforstjude.views || {};
}).call(this);

pledgeit.services.LeaderboardService = (function () {

    // --------------------------------------------
    // Constructor
    // --------------------------------------------

	/**
 	* Constructor for the leaderboard services class
	* @constructor
	*/
    function LeaderboardService() {
        this._initialize();
    }


    LeaderboardService.prototype = {

        // --------------------------------------------
        // Properties
        // --------------------------------------------

        _campaignEndpoint: "https://pledgeit.org/api-public/widgets/campaigns",
        _templateEndpoint: "https://pledgeit.org/api-public/widgets/templates",


        // --------------------------------------------
        // Initialization
        // --------------------------------------------

        _initialize: function () {
            if (!String.prototype.endsWith) {
                String.prototype.endsWith = function (searchString, position) {
                    var subjectString = this.toString();
                    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                        position = subjectString.length;
                    }
                    position -= searchString.length;
                    var lastIndex = subjectString.indexOf(searchString, position);
                    return lastIndex !== -1 && lastIndex === position;
                };
            }
        },


        // --------------------------------------------
        // Public Methods
        // --------------------------------------------

		/**
		 * Get the campaign using the PledgeIt widget API
		 * @param {string}   slug - The campaign slug
		 * @param {function} requestParams - Request parameters object
		 * @param {string}	 requestParams.onSuccess - Callback for when the API call finishes successfully
		 */
        getCampaign: function (slug, requestParams) {
            this._makeRequest(this._campaignEndpoint + "/" + slug, requestParams);
        },

        /**
		 * Get the template using the PledgeIt widget API
		 * @param {string}   slug - The campaign slug
		 * @param {function} requestParams - Request parameters object
		 * @param {string}	 requestParams.onSuccess - Callback for when the API call finishes successfully
		 */
        getTemplate: function (slug, requestParams) {
            this._makeRequest(this._templateEndpoint + "/" + slug, requestParams);
        },

        // --------------------------------------------
        // Private Methods
        // --------------------------------------------

		/**
		 * Get the weekly leaderboard based on the week specified
		 * @param {string} 	 endpoint 					- Endpoint URL for the AJAX request
         * @param {function} requestParams 				- Request parameters object
		 * @param {function} requestParams.onSuccess	- Callback for when the API call finishes successfully
		 */
        _makeRequest: function (endpoint, requestParams) {
            $.ajax({
                crossDomain: true,
                dataType: "json",
                method: "GET",
                contentType: "text/plain",
                url: endpoint,
                success: function (response) {
                    var items = response;

                    if (requestParams.onSuccess) {
                        requestParams.onSuccess(items);
                    }
                }
            });
        }
    };

    return LeaderboardService;
})();

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
        _itemsPerPage: 1,

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
                    this._showMore();
                }, this));
        },

        _getSort: function (sort, $list) {
            var items = $list.map(function (index, golfer) {
                var $golfer = $(golfer);
                return {
                    amount: parseFloat($golfer.find('[bd-amount]').text().replace(/[,\$]/g, '')),
                    birdies: parseFloat($golfer.find('[bd-performance]').text()),
                    name: $golfer.attr("bd-name")
                }
            });

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

        _showMore: function () {
            this._$golferLeaderboard.find('[bd-slug]')
                .filter(':hidden')
                .slice(0, this._itemsPerPage)
                .removeClass("-preload")
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

        _handleSortChange: function (e) {
            $target = $(e.currentTarget);
            this._$golferLeaderboard.find('[bd-slug]')
                .reOrder(this._getSort($target.find('option:selected').val(), this._$golferLeaderboard.find('[bd-slug]')), this._$golferLeaderboard, false);

        },

        _handleShowMoreClick: function (e) {
            e.preventDefault();
            this._showMore();
            $(e.currentTarget).toggle(this._$golferLeaderboard.find('[bd-slug]').filter(':hidden').length !== 0);
        }
    };

    return MainView;
})();

$(function () {
    new birdiesforstjude.views.MainView();
});