var services = pledgeit.services;
var views = birdiesforstjude.views;

birdiesforstjude.views.MainView = (function () {
    function MainView() {
        this._initialize();
        this._attachEvents();
    }

    MainView.prototype = {
        _leaderboardService: null,

        // --------------------------------------------
        // Initialization
        // --------------------------------------------

        _initialize: function () {
            this._leaderboardService = new services.LeaderboardService();

        },

        _attachEvents: function () {

        },

        // --------------------------------------------
        // Private Methods
        // --------------------------------------------


    };

    return MainView;
})();

$(function () {
    new birdiesforstjude.views.MainView();
});