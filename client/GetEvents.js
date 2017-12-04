var TMApi = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=MESb62ZJGuVGsMwaZmB8aopNFTNlGe4A&classificationName=Music'
var venueApi = 'https://app.ticketmaster.com/discovery/v2/venues/'
var venueApi2 = '.json?apikey=MESb62ZJGuVGsMwaZmB8aopNFTNlGe4A'
var geo = 'https://cors-anywhere.herokuapp.com/http://geohash.org?q='
var geo2 = '&format=url&maxlen=9'

function getEvents(radius, size, longlat){
    $.ajax({
        type: 'GET', // or POST, etc
        url: geo+longlat+geo2, // server being contacted
        success: function(data) {
        // You use this function in the case of success of the data exchange btw
        // your client(web browser running your jquery code) and the server
        var res = data.split(".org/");
        var result = res[1]
        //generate geoHash of given longtitude and latitude
        findEvents(radius, size, longlat,result);
        },
        error: function(xhr, error) {
        console.log("Something went wrong: ", error)
        }
    });
}
function findEvents(radius, size, longlat, geoHash){
    //this needs to use the result from getLoc(longlat)

    var Pradius = "&radius="+radius
    var Preturnsize = "&size="+size
    var Plocation = "&geoPoint="+geoHash
    var result = []
    $.ajax({
    type: 'GET', // or POST, etc
    url: TMApi+Pradius+Plocation+Preturnsize, // server being contacted
    success: function(data) {
    // You use this function in the case of success of the data exchange btw
    // your client(web browser running your jquery code) and the server
    var fullData = data;
    if(typeof  fullData["_embedded"] == 'undefined'){
      alert("No Events Found \nYou live in uncultured neighborhood");
      return 0;
    }
    var lengthData = Object.keys(fullData["_embedded"]["events"]).length;
    //console.log("Here is a list of ",lengthData,"events")
    for (count =0 ; count <lengthData; count++){
        var name = fullData["_embedded"]["events"][count]['name']
        var ticketLink = fullData["_embedded"]["events"][count]['url']

        var thumbNail = fullData["_embedded"]["events"][count]['images'][0]['url']
        var date = fullData["_embedded"]["events"][count]['dates']['start']['localDate']
        var time = fullData["_embedded"]["events"][count]['dates']['start']['localTime']
        var distance = fullData["_embedded"]["events"][count]['distance'] //in miles
        var venue = fullData["_embedded"]["events"][count]["_links"]['venues'][0]['href'].split("/")

        var venueid = venue[4].split("?")
        var real_id = venueid[0]
        var artist = fullData["_embedded"]["events"][count]['_embedded']['attractions'][0]['name']
        // The attributes of the event are stored in this nested list
        result.push([name,ticketLink,thumbNail,date,time,distance,real_id,artist])
    }
    
    populateVerticalList(result);
    return result

  },
    error: function(xhr, error) {
    console.log("Something went wrong: ", error)
    }
    });
}

function getVenue(id){
    $.ajax({
    type: 'GET', // or POST, etc
    url: venueApi+id+venueApi2, // server being contacted
    success: function(data) {
    // You use this function in the case of success of the data exchange btw
    // your client(web browser running your jquery code) and the server
    var fullData = data
    var venueName = fullData["name"]
    var venueLoc = fullData["location"]["longitude"].concat(" ").concat(fullData["location"]["latitude"])
    //console.log([venueName,venueLoc])
    return ([venueName,venueLoc])
    },
    error: function(xhr, error) {
    console.log("Something went wrong: ", error)
    }
    });
}

  function populateVerticalList(event_list){
    console.log("WASSup");
    var vertical_menu = document.getElementById('vmenu')
    $(vertical_menu).empty(); //reset list item from the list to prevent list items to keep appending
    $("#vmenu").append('<a href="#" class="list-group-item list-group-item-action active">Getting Artists...</a>"');
    $(vertical_menu).empty(); //reset list item from the list to prevent list items to keep appending
    for (var x =0; x<event_list.length;x++){
      $("#vmenu").append("<a href = #artistData class='list-group-item list-group-item-action' id = #" + x + ">"+event_list[x][0]+"</a>");
        // console.log(templist[x][0]);
    }

    displayArtist(event_list);
}

function getArtistInfo(searchThis){
    images = []
    var gettyURL = "https://api.gettyimages.com/v3/search/images?phrase=";

    var wikiURL = "https://en.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text&section=0&page=";
    
    artistName = searchThis;


    wikiURL += encodeURIComponent(artistName.trim()) + "&callback=?";
    gettyURL += encodeURIComponent(artistName.trim());

    var wikiImg = "";
    var gettyImg = "";

    var imgSet = 0;

    $(function() {
        $.ajax(
        {
            type: "GET",
            url: wikiURL,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data, textStatus, jqXHR) {
                console.log(typeof data.parse == 'undefined');
                if (typeof data.parse != 'undefined') {
                    for (var key in data.parse.text) {
                        var value = data.parse.text[key];
                        //console.log(key);
                        //console.log(value);
                    }
                    // TODO: This for later (simplifies it)
                    
                    // jQuery(document).ready(function(){
                    //     jQuery('#virtual_page').append(value);
                    // });
                    // newHTML = $($.parseHTML(value)[0]);
                    // $("#virtual_page").append(newHTML.html());
                    // console.log($("#virtual_page").innerHTML);
                    // $(".mw-parser-output");
                    // var e = document.createElement("div");
                    // e.setAttribute("style", "display: none");
                    // e = newHTML;
                    // console.log(e);
                    // //console.log(newHTML[0].innerHTML);
                    // console.log(newHTML[0].childNodes);

                    // Wiki Picture
                    var startIndex = value.indexOf("//upload.wikimedia.org/wikipedia/");
                    newStr = value.substring(startIndex+2);
                    var endIndex = newStr.indexOf("width") - 2;
                    finalStr = "https://" + newStr.substring(0, endIndex);
                    // finalStr = newStr.substring(5, endIndex);
                    //console.log(finalStr);

                    // Wiki Description
                    var startIndex1 = value.indexOf("<p");
                    newStr1 = value.substring(startIndex1+3);
                    // var startIndex2 = newStr1.indexOf("<b");
                    // newStr2 = newStr1.substring(startIndex2);
                    var endIndex1 = newStr1.indexOf("/p>") - 1;
                    finalStr1 = newStr1.substring(0, endIndex1);

                    console.log(finalStr1);

                    // TODO: Description hyperlinks shouldn't lead to where they do
                    // ---Add en.wikipedia.org to beginning of every link---

                    // var wikiStr = "en.wikipedia.org";
                    // var newSub = finalStr1;
                    // finalStr2 = "";

                    // var j = 0;
                    // while (j < finalStr1.length) {
                    //     aIndexS = finalStr1.indexOf("<a");
                    //     finalStr2 += newSub.substring(0, aIndexS);
                    //     aIndexE = newSub.indexOf("</a");
                    //     smallSub = newSub.substring(aIndexS, aIndexE);
                    //     newSub = newSub.substring(aIndexE);
                    //     j = newSub.length;
                    //     console.log(newSub);
                    // }



                    $(".description").html(finalStr1);

                    wikiImg = finalStr;
                    // console.log(wikiImg);
                    // console.log(wikiImg.indexOf("svg"));
                    if (wikiImg.length != 0) {
                        if (wikiImg.indexOf("svg") == -1) {
                            $("#img1")[0].src = wikiImg;
                            $("#img1").show();
                            imgSet = 1;
                        } else {
                            console.log("Image is an icon (don't want this)");
                        }
                    }
    
                    // $("#img1")[0].src = finalStr;
                    // $("#img1").show();
                }
                
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    $(function() {
        $.ajax(
        {
            type: "GET",
            url: gettyURL,
            headers: {"Api-Key":"twnczd4b3pz9bnt3vy8q84w2"},
            success: function (data) {
                if (data.images.length != 0) {
                    var newURL = data.images[0].display_sizes[0].uri;
    
                    // Instead of 2 -> min(5, Number of images)
                    for (i = 0; i < Math.min(5, data.result_count); i++) {
                        //console.log(data.images[i]);
                        images.push(data.images[i].display_sizes[0].uri);
                    }
    
                    //console.log(images);

                    // TODO: Getty images
                    // If src is "" -> display:none

                    gettyImg = newURL;
                    // console.log(gettyImg);
                    // console.log(imgSet);
                    if (imgSet != 1 && gettyImg.length != 0) {
                        // Could make it into a collection of images (more than 1)
                        // Reason why commented -> Switches switch between them
                        $("#img1")[0].src = gettyImg;
                        $("#img1").show();
                    }

                    // $("#img1")[0].src = newURL;
                    // $("#img1").show();
                } else {
                    alert("Invalid Artist Name or Song Title!");
                }

                
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
    // TODO: Make it so image doesn't alter the way it does!
    // if (($("#img1")[0].src).length != 0) {
    //     $("#img1").show();
    // } else {
    //     $("#img1").hide();
    // }
    // console.log(($("#img1")[0].src).length == 0);
    // if (($("#img1")[0].src).length == 0) {
    //     alert("Invalid Artist Name or Song Title!");
    // }

    //console.log($("#img1")[0].src);
    //TODO: Display this if src is empty
    //alert("Invalid Artist Name or Song Title!");

    // Get Wiki image

}


function onSearch() {
    $(".searchButton").click(function () {
        getArtistInfo($(".searchTerm")[0].value);

    });
}

function displayArtist(event_list){
  $(".list-group-item").click(function(event){

    var artistID = event.target.id
    var img = event_list[parseInt(artistID.charAt(1))][2]
    var link = event_list[parseInt(artistID.charAt(1))][1]
    var artistName = event_list[parseInt(artistID.charAt(1))][7]
    console.log(artistName);

    //populates artist information
    $("#artistData").empty();
    $("#artistData").append("<img class = 'card-img-top' src = '" + img + "' alt = 'Image Unavailable'>")
    $("#artistData").append("<div class = 'card-block'></div>")
    $("#artistData").append("<h4 class = 'card-title'>" + event_list[parseInt(artistID.charAt(1))][0] + "</h4>")
    $("#artistData").append("<ul class = 'list-group list-group-flush' id = 'items'></ul>")
    $("#items").append("<li class = 'list-group-item'>Date: " + event_list[parseInt(artistID.charAt(1))][3] + "</li>")
    $("#items").append("<li class = 'list-group-item'>Time:" + event_list[parseInt(artistID.charAt(1))][4] + "</li>")

    // $("#items").append("<a href = '/favband' id = 'fav-band' class = 'list-group-item'>Add " + artistName + " to Favourites" + "</a>")
    // $("#items").append("<a href = '/favevent' id = 'fav-event' class = 'list-group-item'>Add Event to Favourites" + "</a>")

    $("#artistData").append("<div class = 'card-block' id = 'linkdata'></div>")
    $("#linkdata").append("<a href = '" + link + "' class = 'card-link'> Get tickets here!</a>")
    getArtistInfo(artistName);




  });

}