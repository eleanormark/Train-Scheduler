
// Initialize Firebase
var config = {
  apiKey: "AIzaSyCpjYrqFlKPACTIcFzdo_A0nysnb4kJINE",
  authDomain: "skytrain-e7b1f.firebaseapp.com",
  databaseURL: "https://skytrain-e7b1f.firebaseio.com",
  storageBucket: "skytrain-e7b1f.appspot.com",
  messagingSenderId: "242261402778"
};

firebase.initializeApp(config);

// Initial Values
var trainName = "";
var destination = "";
var firstTime = "";
var frequency = 0;
var count = 0;

//snapshop value for trains
var sv = [];
var svArr = [];

// Create a variable to reference the database.
var database = firebase.database();

  database.ref('tCheck').set({
    updateMin: count
  });


// Capture Button Click
$("#submit").on("click", function(event) {
  event.preventDefault();

  // Grabbed values from text boxes
  trainName = $("#inputTrainName").val().trim();
  destination = $("#inputDestination").val().trim();
  firstTime = $("#inputFirstTrainTime").val().trim();
  frequency = $("#inputFrequency").val().trim();


  // Code for handling the push
  database.ref('trains').push({
    trainName: trainName,
    destination: destination,
    firstTime: firstTime,
    frequency: frequency
  });

});

// Capture Button Click


 $(document).on('click', '.remove', function() { 

    event.preventDefault();
  
      var key = $(this).data("id");
  database.ref('trains').child(key).remove();

});


// Firebase watcher user input + initial loader HINT: .on("value")
database.ref('trains').on("value", function(snapshot) {

  // storing the snapshot.val() in a variable for convenience
  sv = snapshot.val();
  
  // Getting an array of each key In the snapshot object
  svArr = Object.keys(sv);

  writeHTML(sv, svArr);

  // Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});


// Firebase watcher for real minute update + initial loader HINT: .on("value")
database.ref('tCheck').on("value", function() {

  writeHTML(sv, svArr);

  // Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});

setInterval(checkTime, 500);

function checkTime() {

  var d = new Date();
  var seconds = d.getSeconds();

  if ( seconds === 0) {
    database.ref('tCheck').update({
    updateMin: count++
    });
  }
}

function writeHTML(sv, svArr) {
    $( "tbody" ).empty();
  console.log("length: " + svArr.length)

  for (var index = 0; index < svArr.length; index++) { 

    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(sv[svArr[index]].firstTime, "hh:mm").subtract(1, "years");
    console.log(firstTimeConverted);

    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm a"));

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)
    var tRemainder = diffTime % sv[svArr[index]].frequency;
    console.log(tRemainder);

    // Minute Until Train
    var tMinutesTillTrain = sv[svArr[index]].frequency - tRemainder;
    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm a"));
    console.log(Object.keys(sv));
    var objKeyArr = Object.keys(sv);
    console.log(objKeyArr[index]);



    $("tbody").append( "<tr>" + 
    "<td>" + sv[svArr[index]].trainName + "</td>" +
    "<td>" + sv[svArr[index]].destination + "</td>" +
    "<td>" + sv[svArr[index]].frequency + "</td>" +
    "<td>" + moment(nextTrain).format("hh:mm a") + "</td>" +
    "<td>" + tMinutesTillTrain + "</td>" +
    "<td>" + "<button class='remove' data-id=" + objKeyArr[index] + "> Remove </button>" + "</td>" +
    "</tr>");
  }
}





