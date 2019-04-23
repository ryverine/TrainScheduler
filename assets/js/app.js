 
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


*/

// Create GUID / UUID in JavaScript?
// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript

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

	// DISPLAY INFO ON LAST TRAIN ADDED
	// $("#lastTrainName").val().trim();
	// $("#lastTrainNameDestination").val().trim();
	// $("#lastTrainStart").val().trim();
	// $("#lastTrainFreqency").val().trim();

	// SUBMIT BUTTON
	var allow = false;
    $("#btn-submit").on("click", function() 
    {
        // prevent form from submitting
        event.preventDefault();
        
        console.log("SUBMIT BUTTON CLICKED");

        if(allow)
        {
			trainName_input = $("#trainNameInput").val().trim();
			trainDestination_input = $("#trainDestinationInput").val().trim();
			firstTrainTime_input = $("#trainInitalTimeInput").val().trim();
			trainFrequency_input = $("#trainFreqencyInput").val().trim();

			// add new object to firebase 
	        database.ref().push(
	        {
	            name: trainName_input,
	            destinaton: trainDestination_input,
	            start: firstTrainTime_input,
	            frequency: trainFrequency_input
	        });
		}
    });



    database.ref().on("child_added", function(childSnapshot) 
    {
		// Log everything that's coming out of snapshot
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
 });




