
// Initialize Firebase
var config = {
  apiKey: "AIzaSyCpjYrqFlKPACTIcFzdo_A0nysnb4kJINE",
  authDomain: "skytrain-e7b1f.firebaseapp.com",
  databaseURL: "https://skytrain-e7b1f.firebaseio.com",
  storageBucket: "skytrain-e7b1f.appspot.com",
  messagingSenderId: "242261402778"
};

firebase.initializeApp(config);

// Github Auth
var provider = new firebase.auth.GithubAuthProvider();

function githubSignin() {
   firebase.auth().signInWithPopup(provider)
   
   .then(function(result) {
      var token = result.credential.accessToken;
      var user = result.user;
      $(".signOut, .panel").show();
      $(".signIn, .signOutGoogle").hide();
      console.log(token)
      console.log(user)
   }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    
      console.log(error.code)
      console.log(error.message)
   });
}

function githubSignout(){
   firebase.auth().signOut()
   
   .then(function() {
      $(".signOut, .panel").hide();
      $(".signIn").show();
      console.log('Signout successful!')
   }, function(error) {
      console.log('Signout failed')
   });
}


// Google Auth 

var providerGoogle = new firebase.auth.GoogleAuthProvider();

function googleSignin() {
   firebase.auth()
   
   .signInWithPopup(providerGoogle).then(function(result) {
      var token = result.credential.accessToken;
      var user = result.user;
    
      console.log(token)
      console.log(user)
      $(".signOut, .panel").show();
      $( ".signIn, .signOutGithub" ).hide();

   }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    
      console.log(error.code)
      console.log(error.message)
   });
}

function googleSignout() {
   firebase.auth().signOut()
  
   .then(function() {
      $(".signOut, .panel").hide();
      $(".signIn" ).show();
      console.log('Signout Succesfull')
   }, function(error) {
      console.log('Signout Failed')  
   });
}


// train scheduler code
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
    frequency: frequency,
    arrivalTime: "undefined"
  });
});

// Capture Remove Button Click
$(document).on('click', '.remove', function() { 
    event.preventDefault();
    var key = $(this).data("id");
    database.ref('trains').child(key).remove();
});

// Capture Update Button Click
$(document).on('click', '.update', function() { 
    event.preventDefault();
    var key = $(this).data("id");
    var $tr = $(this).closest("tr");
    var trainName = $tr.find('td:first-child').text();
    var destination = $tr.find('td:nth-child(2)').text();
    var arrivalTime = $tr.find('td:nth-child(4)').text();

    var firstTime = moment(arrivalTime, ["hh:mm A"]).format("HH:mm");

    database.ref('trains').child(key).update({
      trainName: trainName,
      destination: destination,
      arrivalTime: arrivalTime,
      firstTime: firstTime 
    });

    // var arrivalTimeObj = moment(arrivalTime, ["hh:mm A"]).format("HH:mm");
    var arrivalTimeConverted = moment(arrivalTime, "hh:mm A").subtract(1, "years");
    var xtMinutesTillTrain = 525600 - moment().diff(moment(arrivalTimeConverted ), "minutes");
    if (xtMinutesTillTrain == 0) {
      xtMinutesTillTrain = 0;
    } 

    if (xtMinutesTillTrain < 0) {
          xtMinutesTillTrain = 1440 + xtMinutesTillTrain;
        } 
      //reset timer to use use time frequency
      setTimeout(function(){ 

        arrivalTime = 'undefined';
        database.ref('trains').child(key).update({
          arrivalTime: arrivalTime,
        });

    }, xtMinutesTillTrain * 60 * 1000 - 500 );
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
    var formattedNextTrain = moment(nextTrain).format("hh:mm a");
    console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm a"));
    console.log(Object.keys(sv));
    var objKeyArr = Object.keys(sv);
    console.log(objKeyArr[index]);

    if(sv[svArr[index]].arrivalTime !== 'undefined')
    {
      formattedNextTrain = sv[svArr[index]].arrivalTime;
      var arrivalTimeObj = moment(formattedNextTrain , ["hh:mm A"]).format("HH:mm");
      var arrivalTimeConverted = moment(sv[svArr[index]].arrivalTime, "hh:mm A").subtract(1, "years");
      var tMinutesTillTrain = 525600 - moment().diff(moment(arrivalTimeConverted ), "minutes");

      if (tMinutesTillTrain == 0) {
          tMinutesTillTrain = sv[svArr[index]].frequency;
        } 
      if (tMinutesTillTrain < 0) {
          tMinutesTillTrain = 1440 + tMinutesTillTrain;
        }        
    }
  
    console.log(Object.keys(sv));
    var objKeyArr = Object.keys(sv);
    console.log(objKeyArr[index]);

    $("tbody").append( "<tr>" + 
    "<td><div contenteditable>" + sv[svArr[index]].trainName + "</div></td>" +
    "<td> <div contenteditable>" + sv[svArr[index]].destination + "</div></td>" +
    "<td>" + sv[svArr[index]].frequency + "</td>" +
    "<td> <div contenteditable>" +  formattedNextTrain + "</div></td>" +
    "<td>" + tMinutesTillTrain + "</td>" +
    "<td>" + "<button type='submit' class='btn btn-default btn-xs update' data-id=" + objKeyArr[index] + "> update </button>" + "</td>" +
    "<td>" + "<button type='submit' class='btn btn-default btn-xs remove' data-id=" + objKeyArr[index] + "> Remove </button>" + "</td>" +
    "</tr>");
      }
  }






