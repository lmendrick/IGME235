// 1
window.onload = (e) => {document.querySelector("#search").onclick = searchButtonClicked};
	
// 2
let displayTerm = "";

let steamValue = 0;

// get checkbox
let checkbox = document.querySelector('input[name=steamBox]');

// Change steam value if checkbox is checked or not
// function steamCheckbox(e) {
//     if (this.checked) {
//         steamValue = "1";
//         console.log("CHECKBOX CHECKED" + " Value: " + steamValue)
//     }
//     else {
//         steamValue = "0";
//         console.log("CHECKBOX NOT CHECKED" + " Value: " + steamValue)
//     }
// }

// // Add event listener to steam checkbox
// checkbox.addEventListener('change', steamCheckbox);

checkbox.onchange = e=>{
    if (steamValue == 1) {
        steamValue = 0;
    }
    else {
        steamValue = 1;
    }
}

// 3
function searchButtonClicked(){
    console.log("searchButtonClicked() called");

    // 1 
    const CHEAPSHARK_URL = "https://www.cheapshark.com/api/1.0/deals?";


    // // 2 
    // let GIPHY_KEY = "5PuWjWVnwpHUQPZK866vd7wQ2qeCeqg7";

    // // 3 - Build URL String
    let url = CHEAPSHARK_URL;
    // No api key needed
    // url += "api_key=" + GIPHY_KEY;

    // 4 - parse the user entered term we wish to search
    let term = document.querySelector("#searchterm").value;
    displayTerm = term;

    // 5 - get rid of any leading or trailing spaces
    term = term.trim();

    // 6 - encode spaces and special characters
    term = encodeURIComponent(term);

    // 7 - if there's no term to search then bail out of the function
    // if(term.length < 1) return;

    // 8 - append the search term to the URL - the parameter name is "q"
    url += "&title=" + term;

    // 9 - grab the user chosen search 'limit' from the <select> and append it to the URL
        let limit = document.querySelector("#pageSize").value;
        url += "&pageSize=" + limit;



    ///////////////////////////////

    // get minimum price
    let lowerPrice = document.querySelector("#lowerPrice").value;
    url += "&lowerPrice=" + lowerPrice;

    // get maximum price
    let upperPrice = document.querySelector("#upperPrice").value;
    url += "&upperPrice=" + upperPrice;

    // get minimum metacritic rating
    let metacritic = document.querySelector("#metacritic").value;
    url += "&metacritic=" + metacritic;

    // 9.5 get the user chosen sort option and add it to url
    let sortBy = document.querySelector('#sortBy').value;
    url += "&sortBy=" + sortBy;

    console.log(steamValue);
    if (steamValue == 1) {
        url += "&storeID=1";
    }
    

    /////////////////////////

    // 10 - update the UI 
    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    // 11 - see what the URL looks like
    console.log(url);

    // 12 Request data!
    getData(url);
    
}

function getData(url){

    // 1 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 2 - set the onload handler
    xhr.onload = dataLoaded;

    // 3 - set the onerror handler
    xhr.onerror = dataError;

    // 4 - open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

// Called when the data is successfully loaded
function dataLoaded(e){

    const DEAL_URL = "https://www.cheapshark.com/redirect?dealID=";


    // 5 - event.target is the xhr object 
    let xhr = e.target;

    // 6 xhr.responseText is the JSON file we just downloaded
    // console.log(xhr.responseText);
    // console.log(typeof xhr.responseText);
  
    // 7 - turn the text into a parsable JavaScript object 
    let obj = JSON.parse(xhr.responseText);


    // 8 if there are no results, print a message and return
    if (!obj || obj.length == 0) {
    document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>"; 
    return; // Bail out
    }

    // 9 Start building an HTML string we will display to the user
    let results = obj
    console.log("results.length = " + results.length);
    let bigString = "";

    // 10 loop through the array of results
    for (let i = 0; i < results.length; i++) {
        let result = results[i];

        // 11 get the URL to the GIF
        let smallURL = result.thumb;
        console.log(smallURL);
        if (!smallURL) smallURL = "images/no-image-found.png";

        // 12 get the URL to the GIPHY Page
        let url = result.url;

        // 13 Build a <div> to hold each result
        // ES6 String Templating
        let dealURL = DEAL_URL + result.dealID;
        let line = `<div class='result'><img src='${smallURL}' title='${result.id}' />`;
        line += 
            `<span>
                <p>Title: ${result.title.toUpperCase()}</p>
            </span>
            <p>
            Deal Rating: ${result.dealRating}
            <br>
            Normal Price: $${result.normalPrice}
            <br>
            Sale Price: $${result.salePrice}
            <br>
            Savings: ${Math.round(result.savings * 100) / 100}%
            <br>
            Metacritic Score: ${result.metacriticScore}
            </p>
            <a target='_blank' href='${dealURL}'>Buy Now</a>
            </div>`;

        // 14 another way of doing the same thing above
        // Replaces this:
        // var line = "<div class='result'>";
        //		line += "<img src="";
        // 		line smallURL;
        // 		line += " title="";
        // 		line result.id;
        // 		line += />";
        //		line += "<span><a target='_blank' href='" + url + "'>View on Giphy</a></span>"; 
        //		line+"</div>";


        // 15 add the <div> to bigString and loop
        bigString += line;
    }

    // 16 - all done building the HTML show it to the user! 
    document.querySelector("#content").innerHTML = bigString;

    // 17 update the status
    document.querySelector("#status").innerHTML = "<b>Success! </b> <p><i>Here are " + results.length + " results for '" + displayTerm + "'</i></p>";
}

function dataError(e){
    console.log("An error occurred");
}
