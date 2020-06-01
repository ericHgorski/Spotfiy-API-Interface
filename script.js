Handlebars.templates = Handlebars.templates || {};

var templates = document.querySelectorAll('script[type="text/x-handlebars-template"]');

Array.prototype.slice.call(templates).forEach(function(script) {
    Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
});

///////////////////////////////////HANDELBAR SETUP CODE///////////////////////////////////////////

var baseUrl = "https://elegant-croissant.glitch.me/spotify";
var nextURL = "";

// RETURN KEY FUNCTIONALITY.
$("input").on("keydown", function(e) {
    if (e.keyCode == 13) {
        $("#submit-btn").trigger("click");
    }
});

// SUBMIT BUTTON FUNCTIONALITY.
$("#submit-btn").on("click", function() {
    $("#results-container").empty();
    $("#more-btn").css({ visibility: "visible" });
    spotifyRequest(baseUrl);
    infiniteScroll();
});

// MORE BUTTON FUNCTIONALITY.
$(document).on("click", "#more-btn", function() {
    spotifyRequest(nextURL);
    if (nextURL == null) {
        $("#more-btn").css({ visibility: "hidden" });
    }
});

// AJAX REQUEST FUNCTION
function spotifyRequest(url) {
    var userInput = $('input[name="user-input"]').val();
    var dropDownSelectVal = $("select").val();

    $.ajax({
        url: url,
        method: "GET",
        data: {
            query: userInput,
            type: dropDownSelectVal
        },
        success: function(response) {
            response = response.albums || response.artists;

            // DEFINE URL FOR 'MORE' SEARCH.
            nextURL = response.next && response.next.replace("api.spotify.com/v1/search", "elegant-croissant.glitch.me/spotify");

            var myHtml = "";
            var imgUrl = "default.png";

            // CHECK FOR NO RESULTS.
            if (response.items.length == 0) {
                $("#results-container").html("<p> <em>No Results</em> </p>");
            }
            // ELSE DISPLAY SEARCH TERM.
            else {
                $("#subheader").html("<h2> Results for <span>" + userInput.toUpperCase() + "<span/></h2>");
            }

            // BUILD RESULTS LIST WITH HANDLEBARS TEMPLATE.
            var musicItems = { items: [] };

            for (var i = 0; i < response.items.length; i++) {
                if (response.items[i].images[0]) {
                    imgUrl = response.items[i].images[0].url;
                }

                var musicItem = {
                    itemName: response.items[i].name.toUpperCase(),
                    itemURL: response.items[i].external_urls.spotify,
                    itemImgUrl: imgUrl
                };

                musicItems.items.push(musicItem);
            }
            // console.log("musicItems :", musicItems);
            myHtml = Handlebars.templates.musicResults(musicItems);
            $("#results-container").append(myHtml);
        }
    });
}

function infiniteScroll() {
    // if (location.search == "?scroll=infinitely") {
    setTimeout(function() {
        console.log("SCROLL");
        if ($(window).height() + $(document).scrollTop() + 200 >= $(document).height()) {
            $("#more-btn").css({ visibility: "hidden" });
            spotifyRequest(nextURL);
            infiniteScroll();
        } else {
            infiniteScroll();
        }
    }, 500);
}
// }
