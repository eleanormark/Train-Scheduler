
// Initialize Firebase
var config = {
  apiKey: "AIzaSyCjyzBUnDUtoNfp9BtzD_d2OQO6eocYGvw",
  authDomain: "sky-train.firebaseapp.com",
  databaseURL: "https://sky-train.firebaseio.com",
  storageBucket: "sky-train.appspot.com",
  messagingSenderId: "13910311656"
};

firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();

// Initial Values
var trainName = "";
var destination = "";
var firstTime = "";
var frequency = 0;

// Capture Button Click
$("#submit").on("click", function(event) {
  event.preventDefault();

  // Grabbed values from text boxes
  trainName = $("#inputTrainName").val().trim();
  destination = $("#inputDestination").val().trim();
  firstTime = $("#inputFirstTrainTime").val().trim();
  frequency = $("#inputFrequency").val().trim();

  // Code for handling the push
  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTime: firstTime,
    frequency: frequency
  });

});

// Firebase watcher + initial loader HINT: .on("value")
database.ref().on("value", function(snapshot) {

  // storing the snapshot.val() in a variable for convenience
  var sv = snapshot.val();
  
  // Getting an array of each key In the snapshot object
  var svArr = Object.keys(sv);


  $( "tbody" ).empty();

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

    $("tbody").append( "<tr>" + 
    "<td>" + sv[svArr[index]].trainName + "</td>" +
    "<td>" + sv[svArr[index]].destination + "</td>" +
    "<td>" + sv[svArr[index]].frequency + "</td>" +
    "<td>" + moment(nextTrain).format("hh:mm a") + "</td>" +
    "<td>" + tMinutesTillTrain + "</td>" +
    "</tr>");
  }


  // Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});


function update() {
    location.reload();
}
setInterval(update, 60000);



