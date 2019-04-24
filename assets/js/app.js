 
/*

Train Scheduler 

Instructions

Make sure that your app suits this basic spec:


When adding trains, administrators should be able to submit the following:
Train Name
Destination 
First Train Time -- in military time
Frequency -- in minutes
Code this app to calculate when the next train will arrive; this should be relative to the current time.
Users from many different machines must be able to view same train times.
Styling and theme are completely up to you. Get Creative!


Bonus (Extra Challenges)

Consider updating your "minutes to arrival" and "next train time" text once every minute. 
This is significantly more challenging; only attempt this if you've completed the actual activity and committed it 
somewhere on GitHub for safekeeping (and maybe create a second GitHub repo).

Try adding update and remove buttons for each train. Let the user edit the row's elements-- 
allow them to change a train's Name, Destination and Arrival Time (and then, by relation, minutes to arrival).

As a final challenge, make it so that only users who log into the site with their Google or GitHub accounts can use your site. 
You'll need to read up on Firebase authentication for this bonus exercise.
// https://firebase.google.com/docs/auth/web/google-signin
// https://firebase.google.com/docs/auth/web/github-auth
// https://howtofirebase.com/firebase-authentication-for-web-d58aad62cf6d
// https://www.youtube.com/watch?v=9kRgVxULbag

*/

// Create GUID / UUID in JavaScript?
// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript

// Military Time Chart
// http://militarytimechart.com/


 $(document).ready(function() 
 {

	// Initialize Firebase
	var config = {	apiKey: "AIzaSyCZt_ec1cn1ETdIsj7mEtNAfrcepQNT4Ng",
					authDomain: "train-scheduler-232b7.firebaseapp.com",
					databaseURL: "https://train-scheduler-232b7.firebaseio.com",
					projectId: "train-scheduler-232b7",
					storageBucket: "train-scheduler-232b7.appspot.com",
					messagingSenderId: "497660980971"};

	firebase.initializeApp(config);

	var database = firebase.database();

	var trainName_input = "";
	var trainDestination_input = "";
	var trainFrequency_input = 0;
	var firstTrainTime_input = moment();

	var trainTableData = $("#trainDataArea");



	// user signs-in with google account
	$("#btn-googleSignIn").on("click", function()
	{
		console.log("SIGN IN CLICKED");

		var signIn = googleSignIn();

		console.log("googleSignIn: " + "\n" + signIn);

		console.log("firebase.auth().currentUser: " + "\n" +
			firebase.auth().currentUser);

	});

	function googleSignIn()
	{
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().useDeviceLanguage();

		provider.addScope("profile");
		provider.addScope("email");

		
		return firebase.auth().signInWithPopup(provider).catch(function(error)
		{
			console.log("Google sign-in error: " + "\n" +  error);
		});

	}

	function googleSignOut()
	{
		firebase.auth().signOut();
	}

	/*



	





firebase.auth().signInWithRedirect(provider);


firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // ...
  }
  // The signed-in user info.
  var user = result.user;
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});
		*/
		



	// DISPLAY INFO ON LAST TRAIN ADDED
	// $("#lastTrainName").val().trim();
	// $("#lastTrainNameDestination").val().trim();
	// $("#lastTrainStart").val().trim();
	// $("#lastTrainFreqency").val().trim();

	// SUBMIT BUTTON
	
    $("#btn-submit").on("click", function() 
    {
        // prevent form from submitting
        event.preventDefault();
        console.log("SUBMIT BUTTON CLICKED");
  		$("#submitErrorMessage").text("");

		trainName_input = $("#trainNameInput").val().trim();
		trainDestination_input = $("#trainDestinationInput").val().trim();
		firstTrainTimeHH_input = $("#trainInitalTimeHHInput").val().trim();
		firstTrainTimeMM_input = $("#trainInitalTimeMMInput").val().trim();
		trainFrequency_input = $("#trainFreqencyInput").val().trim();


		// is this a train that we already have in the database?

		var inputError = validateInput(trainName_input, trainDestination_input , firstTrainTimeHH_input, firstTrainTimeMM_input, trainFrequency_input);

		if(inputError === "")
		{
			var startTime = firstTrainTimeHH_input + ":" + firstTrainTimeMM_input;

			// add new object to firebase 
	        database.ref().push(
	        {
	            name: trainName_input,
	            destination: trainDestination_input,
	            start: startTime,
	            frequency: trainFrequency_input
	        });

			$("#trainNameInput").val("");
			$("#trainDestinationInput").val("");
			$("#trainInitalTimeHHInput").val("");
			$("#trainInitalTimeMMInput").val("");
			$("#trainFreqencyInput").val("");
		}
		else
		{
			$("#submitErrorMessage").text(inputError);
		}
		
    });

 	function validateInput(name, dest, hh, mm, freq)
 	{
 		if(name != "" && dest != "" && hh != "" && mm != "" && freq != "")
 		{
 			if(hh < 0 || hh > 23)
 			{
 				return "Hours must be between 0 and 23!";
 			}
 			else if(mm < 0 || mm > 59)
 			{
 				return "Minutes must be between 0 and 59!";
 			}
 			else if(freq < 1 || freq > 1440)
 			{
 				return "Frequency must be between 1 and 1440!";
 			}
 			else
 			{
 				return "";
 			}
 		}
 		else
 		{
 			return "You must provide all requested data before submiting!";
 		}
 	}

	database.ref().on("child_added", function(childSnapshot) 
	{
		// var trainTableData = $("#trainDataArea");

		// get data from snapshot
		var name = childSnapshot.val().name;
		var destination = childSnapshot.val().destination;
		var frequency = childSnapshot.val().frequency;
		var start = childSnapshot.val().start;

		if(start.charAt(2) === ":")
		{
			var timeValue = start.split(":");
			findNextArrival(timeValue[0], timeValue[1], frequency);
		}

		// create elements for new table row
		var newTableRow = $("<tr>");
		newTableRow.attr("class", "trainData");

		var newTableRow_name = $("<td>");
		var newTableRow_destination = $("<td>");
		var newTableRow_frequency = $("<td>");
		var newTableRow_arrival = $("<td>");
		var newTableRow_minutes = $("<td>");

		// put data into row
		newTableRow_name.text(name);
		newTableRow_destination.text(destination);
		newTableRow_frequency.text(frequency);

		newTableRow.append(newTableRow_name);
		newTableRow.append(newTableRow_destination);
		newTableRow.append(newTableRow_frequency);
		newTableRow.append(newTableRow_arrival);
		newTableRow.append(newTableRow_minutes);


		// moment js
		// find next arrival
		// find min


		// add row to table
		trainTableData.append(newTableRow);

		//Add info to last train added area
		$("#lastTrainName").text(name);
		$("#lastTrainNameDestination").text(destination);
		$("#lastTrainStart").text(start);
		$("#lastTrainFreqency").text(frequency);


	// Handle the errors
	}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
	});


 	function findNextArrival(trainStartHH, trainStartMM, trainFrequency)
 	{
 		// https://momentjs.com/docs/#/get-set/
 		// https://www.tutorialspoint.com/momentjs/momentjs_durations.htm

 		var now = moment();

 		var trainStartTime = moment();
 		trainStartTime.hour(trainStartHH);
 		trainStartTime.minute(trainStartMM);

 		var theDuration = moment.duration(Number.parseInt(trainFrequency));
 		

 		console.log(	"findNextArrival(" + trainStartHH + ", " +trainStartMM  + ")" + "\n" +
 						"trainStartTime: " + trainStartTime);

 	}

 	function findMinutes(nextArrival)
 	{

 	}


    $(document).on("click", "tr.trainData", function() 
    {
    	console.log("trainData clicked!");

    	var children = $(this).children();

    	var selectedTrain_name = children[0].innerText;
    	var selectedTrain_dest = children[1].innerText;
    	var selectedTrain_freq = children[2].innerText;
    	// var selectedTrain_next = children[3].innerText;
    	// var selectedTrain_mins = children[4].innerText;


    	for(var i = 0; i < children.length; i++)
    	{
    		console.log("children["+i+"].innerText: " + children[i].innerText);
    	}

    	// https://firebase.google.com/docs/reference/js/firebase.database.Reference

    	// console.log("database.ref(): " + "\n" + database.ref());

    	// https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot

		// JSON.parse(localStorage.getItem('userFavorites'));


		// trying to find child with matching name
		// need to get that child's "first train time" value
		// split that value in ":"
		// put [0] into HH input
		// put [1] into MM input
		/*
    	database.ref().once("value")
  			.then(function(snapshot) {
  				console.log("snapshot: " + snapshot.child("name").val());
    			var key = snapshot.key; // null
    			var childKey = snapshot.child(selectedTrain_name).key; // "ada"
    			console.log("key: " + key + "\n" + "childKey: " + childKey)
  			});
		*/
    });


// https://firebase.google.com/docs/database/admin/retrieve-data
// https://firebase.google.com/docs/reference/js/firebase.database.Reference
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#once
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#tojson
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#on
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#update
// https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot
// https://firebase.google.com/docs/reference/js/firebase.database.Query

// https://www.youtube.com/watch?v=F6UWb9FNnj4

 /*

    // Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
    dataRef.ref().on("child_added", function(childSnapshot) {

      // Log everything that's coming out of snapshot
      console.log(childSnapshot.val().name);
      console.log(childSnapshot.val().name);
      console.log(childSnapshot.val().email);
      console.log(childSnapshot.val().age);
      console.log(childSnapshot.val().comment);
      console.log(childSnapshot.val().joinDate);

      // full list of items to the well
      $("#full-member-list").append("<div class='well'><span class='member-name'> " +
        childSnapshot.val().name +
        " </span><span class='member-email'> " + childSnapshot.val().email +
        " </span><span class='member-age'> " + childSnapshot.val().age +
        " </span><span class='member-comment'> " + childSnapshot.val().comment +
        " </span></div>");

      // Handle the errors
    }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);

    });






    dataRef.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
      // Change the HTML to reflect
      $("#name-display").text(snapshot.val().name);
      $("#email-display").text(snapshot.val().email);
      $("#age-display").text(snapshot.val().age);
      $("#comment-display").text(snapshot.val().comment);
    });

 */




 	/* MOMENT JS

	var randomDate = "02/23/1999";
	var randomFormat = "MM/DD/YYYY";
	var convertedDate = moment(randomDate, randomFormat);

	// Using scripts from moment.js write code below to complete each of the following.
	// Console.log to confirm the code changes you made worked.

	// 1 ...to convert the randomDate into three other date formats
	console.log(convertedDate.format("MM/DD/YY"));
	console.log(convertedDate.format("MMM Do, YYYY hh:mm:ss"));
	console.log(convertedDate.format("X"));
	console.log("----------------------------------------");

	// 2 ...to determine the time in years, months, days between today and the randomDate
	console.log(convertedDate.toNow());
	console.log(convertedDate.diff(moment(), "years"));
	console.log(convertedDate.diff(moment(), "months"));
	console.log(convertedDate.diff(moment(), "days"));
	console.log("----------------------------------------");

	// 3 ...to determine the number of days between the randomDate and 02/14/2001
	var newDate = moment("02/14/2001", randomFormat);
	console.log(convertedDate.diff(newDate, "days"));

	// 4 ...to convert the randomDate to unix time (be sure to look up what unix time even is!!!)
	console.log(convertedDate.format("X"));
	console.log("----------------------------------------");

	// 5 ...to determine what day of the week and what week of the year this randomDate falls on.
	console.log(convertedDate.format("DDD"));
	console.log(convertedDate.format("dddd"));

	*/





	/*

	


	*/
 });




