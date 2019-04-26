 
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
	var signInArea = $("#signInArea");
	var trainSchedulerArea = $("#trainSchedulerArea");

	var defaultGoogleUser = {	displayName: "Unknown", 
								email: "unknown@unknown.unknown", 
								photoURL: "assets/images/tmpProfileImg.png"};

	var googleUser = defaultGoogleUser;

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

	// use this object to hold as refrence 
	// check this object when adding data to database
	var selectedExistingTrain = {
		key: "",
		name: "",
		frequency: "",
		destination: "",
		start: "",
		updateBy_name: "",
		updateBy_email: "",
		updated: ""
	}


	function updateUserInfo (theUser)
	{
		$("#googleDisplayName").text(theUser.displayName);
		$("#googleEmail").text(theUser.email);

		var profileImg = $("#profileImage");
		profileImg.attr("src", theUser.photoURL);

		$("#profileImageArea").html(profileImg);
	}


	function googleSignIn()
	{
		// https://firebase.google.com/docs/reference/js/firebase.auth.GoogleAuthProvider
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().useDeviceLanguage();

		provider.addScope("profile");
		provider.addScope("email");

		// https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#signinwithpopup
		return firebase.auth().signInWithPopup(provider).then(function(result)
		{
			//var token = result.credential.accessToken;
			googleUser = result.user;
			console.log("result user display name: " + googleUser.displayName);

			signInArea.hide();
			trainSchedulerArea.show();
			$("#userProfileArea").show();
			updateUserInfo(result.user);
		
		}).catch(function(error)
		{
			console.log("Google sign-in error: " + "\n" +  error);
		});

	}


	function googleSignOut()
	{
		firebase.auth().signOut();
		updateUserInfo(defaultGoogleUser);
		signInArea.show();
		trainSchedulerArea.hide();
		//$("#userProfileArea").show();
	}


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


 	function findNextArrival(trainStartHH, trainStartMM, trainFrequency)
 	{
 		// https://momentjs.com/docs/#/get-set/
 		// https://www.tutorialspoint.com/momentjs/momentjs_durations.htm

 		var nextArrival = trainStartHH + ":" + trainStartMM; // HH:mm 24-hour format

 		var now = moment();

 		var trainStartTime = moment();
 		trainStartTime.hour(trainStartHH);
 		trainStartTime.minute(trainStartMM);

 		// if diff <= 0, next arrival is same as start time
 		if(now.diff(trainStartTime) > 0)
 		{
 			var theDuration = moment.duration(Number.parseInt(trainFrequency), "minutes");

 			var difference = now.diff(trainStartTime);

 			var numberOfArrivalsSiceStart = Math.floor(difference/theDuration);  

 			var millisecondsToNextArrival = (numberOfArrivalsSiceStart + 1) * theDuration;

 			nextArrival = trainStartTime.add(millisecondsToNextArrival, "ms").format("HH:mm");
 		}

 		/*console.log("function findNextArrival(" + trainStartHH + ", " + trainStartMM + ", " + trainFrequency + ")" + "\n" +
 			"nextArrival = " + nextArrival);*/

 		return nextArrival;
 	}


 	function findMinutesToNextArrival(nextArrival)
 	{
 		//console.log("findMinutesToNextArrival("+nextArrival+")");
 		// nextArrival = HH:mm 
 		var now = moment();

 		var timeUnits = nextArrival.split(":");

 		var arrival = moment();
 		arrival.hour(timeUnits[0]);
 		arrival.minute(timeUnits[1]);

 		return arrival.diff(now, 'minutes');
 	}


 	function getExistingTrainData(name, dest, freq)
	{
		// if name, dest, and freq are the same then we consider this the same train
		// return that train's data from firebase, or an empty object

		var tmpTrain = {
			key: "",
			name: "",
			frequency: "",
			destination: "",
			start: "",
			updateBy_name: "",
			updateBy_email: "",
			updated: ""
		}

		var ref = database.ref();

		ref.orderByKey().endAt(name).on("child_added", function(snapshot) 
		{
  			if(	snapshot.child("name").val().toUpperCase() === name.toUpperCase() && 
  				snapshot.child("destination").val().toUpperCase() === dest.toUpperCase() &&
  				snapshot.child("frequency").val().toUpperCase() === freq.toUpperCase())
  			{
				tmpTrain.key = snapshot.key;
				tmpTrain.name = snapshot.child("name").val();
				tmpTrain.frequency = snapshot.child("frequency").val();
				tmpTrain.destination = snapshot.child("destination").val();
				tmpTrain.start = snapshot.child("start").val();
				tmpTrain.updateBy_name = snapshot.child("updateBy_name").val();
				tmpTrain.updateBy_email = snapshot.child("updateBy_email").val();
				tmpTrain.updated = snapshot.child("updated").val();

				console.log("tmpTrain:" + "\n" + 
							"key: " + tmpTrain.key + "\n" + 
							"name: " + tmpTrain.name + "\n" + 
							"frequency: " + tmpTrain.frequency + "\n" + 
							"destination: " + tmpTrain.destination + "\n" + 
							"start: " + tmpTrain.start  + "\n" + 
							"updateBy_name: " + tmpTrain.updateBy_name + "\n" + 
							"updateBy_email: " + tmpTrain.updateBy_email + "\n" + 
							"updated: " + tmpTrain.updated);
  			}
		});

 		return tmpTrain;
	}


	// function populate last train section (look at  getExistingTrainData(name, dest, freq)
	// DISPLAY INFO ON LAST TRAIN ADDED
	// $("#lastTrainName").val().trim();
	// $("#lastTrainNameDestination").val().trim();
	// $("#lastTrainStart").val().trim();
	// $("#lastTrainFreqency").val().trim();


    $("#btn-add").on("click", function() 
    {
        event.preventDefault();

  		$("#submitErrorMessage").text("");

		trainName_input = $("#trainNameInput").val().trim();
		trainDestination_input = $("#trainDestinationInput").val().trim();
		firstTrainTimeHH_input = $("#trainInitalTimeHHInput").val().trim();
		firstTrainTimeMM_input = $("#trainInitalTimeMMInput").val().trim();
		trainFrequency_input = $("#trainFreqencyInput").val().trim();

		// test to see if this is a train that we already have in the database?

		var existingTrainData = getExistingTrainData(trainName_input, trainDestination_input, trainFrequency_input)

		if(existingTrainData.key === "")
		{
			var inputError = validateInput(trainName_input, trainDestination_input , firstTrainTimeHH_input, firstTrainTimeMM_input, trainFrequency_input);

			if(inputError === "")
			{
				if(firstTrainTimeHH_input.length === 1)
				{
					firstTrainTimeHH_input = "0" + firstTrainTimeHH_input;
				}

				if(firstTrainTimeMM_input.length === 1)
				{
					firstTrainTimeMM_input = "0" + firstTrainTimeMM_input;
				}

				var startTime = firstTrainTimeHH_input + ":" + firstTrainTimeMM_input;
				var updaterName = googleUser.displayName;
				var updaterEmail = googleUser.email;
				var updateTime = moment().format("MM/DD/YYYY HH:mm:ss");

				// add new object to firebase 

		        database.ref().push(
		        {
		            name: trainName_input,
		            destination: trainDestination_input,
		            start: startTime,
		            frequency: trainFrequency_input,
		            updateBy_name: updaterName,
		            updateBy_email: updaterEmail,
		            updated: updateTime
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
		}
		else
		{
			$("#submitErrorMessage").text("This train already exists in the database!");
		}
		
    });


	 $("#btn-update").on("click", function() 
	 {
		// prevent form from submitting
		event.preventDefault();
		console.log("UPDATE BUTTON CLICKED");
		$("#submitErrorMessage").text("");

		if(selectedExistingTrain.key === "")
		{
			$("#submitErrorMessage").text("You did not select a train to update!");
		}
		else
		{
			trainName_input = $("#trainNameInput").val().trim();
			trainDestination_input = $("#trainDestinationInput").val().trim();
			firstTrainTimeHH_input = $("#trainInitalTimeHHInput").val().trim();
			firstTrainTimeMM_input = $("#trainInitalTimeMMInput").val().trim();
			trainFrequency_input = $("#trainFreqencyInput").val().trim();

			var inputError = validateInput(trainName_input, trainDestination_input , firstTrainTimeHH_input, firstTrainTimeMM_input, trainFrequency_input);

			if(inputError === "")
			{
				if(firstTrainTimeHH_input.length === 1)
				{
					firstTrainTimeHH_input = "0" + firstTrainTimeHH_input;
				}

				if(firstTrainTimeMM_input.length === 1)
				{
					firstTrainTimeMM_input = "0" + firstTrainTimeMM_input;
				}

				var startTime = firstTrainTimeHH_input + ":" + firstTrainTimeMM_input;
				var updaterName = googleUser.displayName;
				var updaterEmail = googleUser.email;
				var updateTime = moment().format("MM/DD/YYYY HH:mm:ss");
			
				console.log("selectedExistingTrain:" + "\n" + 
							"key: " + selectedExistingTrain.key  + "\n" + 
							"name: " + selectedExistingTrain.name  + "\n" + 
							"frequency: " + selectedExistingTrain.frequency  + "\n" + 
							"destination: " + selectedExistingTrain.destination  + "\n" + 
							"start: " + selectedExistingTrain.start  + "\n" + 
							"updateBy_name: " + selectedExistingTrain.updateBy_name  + "\n" + 
							"updateBy_email: " + selectedExistingTrain.updateBy_email  + "\n" + 
							"updated: " + selectedExistingTrain.updated);

				// Firebase DB - How to update particular value of child in Firebase Database
				// https://stackoverflow.com/questions/40589397/firebase-db-how-to-update-particular-value-of-child-in-firebase-database

				database.ref(selectedExistingTrain.key).set({
					name: trainName_input,
					frequency: trainFrequency_input, 
					destination: trainDestination_input,
					start: startTime,
					updateBy_name: updaterName,
					updateBy_email: updaterEmail,
					updated: updateTime
				});

				$("#trainNameInput").val("");
				$("#trainDestinationInput").val("");
				$("#trainInitalTimeHHInput").val("");
				$("#trainInitalTimeMMInput").val("");
				$("#trainFreqencyInput").val("");

				// should not clear object until table has been updated
				/*
				selectedExistingTrain = {
					key: "",
					name: "",
					frequency: "",
					destination: "",
					start: "",
					updateBy_name: "",
					updateBy_email: "",
					updated: ""
				}*/
			}
			else
			{
				$("#submitErrorMessage").text(inputError);
			}
		}
	 });


	database.ref().on("child_added", function(childSnapshot) 
	{
		// var trainTableData = $("#trainDataArea");
		console.log("CHILD ADDED");
		addTrainToTable(childSnapshot);

		// get data from snapshot
		/*var name = childSnapshot.val().name;
		var destination = childSnapshot.val().destination;
		var frequency = childSnapshot.val().frequency;
		var start = childSnapshot.val().start;
		var nextArrival = "";
		var minutes = "";

		if(start.charAt(2) === ":")
		{
			var timeValue = start.split(":");
			nextArrival = findNextArrival(timeValue[0], timeValue[1], frequency);

			minutes = findMinutesToNextArrival(nextArrival);
		}

		// create elements for new table row
		var newTableRow = $("<tr>");
		newTableRow.attr("class", "trainData");

		var newTableRow_name = $("<td>");
		var newTableRow_destination = $("<td>");
		var newTableRow_frequency = $("<td>");
		newTableRow_frequency.attr("class", "centerTableData");
		var newTableRow_arrival = $("<td>");
		newTableRow_arrival.attr("class", "centerTableData");
		var newTableRow_minutes = $("<td>");
		newTableRow_minutes.attr("class", "centerTableData");

		// put data into row
		newTableRow_name.text(name);
		newTableRow_destination.text(destination);
		newTableRow_frequency.text(frequency);
		newTableRow_arrival.text(nextArrival);
		newTableRow_minutes.text(minutes);

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
		$("#lastTrainStart").text(start + " (24-hour time)");
		$("#lastTrainFreqency").text(frequency + " minutes");*/

	// Handle the errors
	}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
	});


 	// firebase. database. Reference
 	// https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#on
	database.ref().on("child_changed", function(childSnapshot) 
	{
		console.log("CHILD CHANGED");
		//updateTrainTable(childSnapshot);
		// find table row with same name, dest, and freq

		// var trainTableData = $("#trainDataArea");
		
		var tableRows = trainTableData.children();

		console.log("trainTableData.children(): " + "\n" + tableRows);

		for(var i = 0; i < tableRows.length; i++)
		{
			var rowData = tableRows[i].find("td");
			// https://api.jquery.com/children/
			// https://www.w3schools.com/jquery/jquery_traversing_descendants.asp

			console.log("tableRows.children(): " + "\n" + rowData);

    		rowNameValue = rowData[0].innerText;
    		rowDestValue = rowData[1].innerText;
    		rowFreqValue = rowData[2].innerText;
    		//rowArrivalValue = rowData[3].innerText;
    		//rowMinutesValue = rowData[4].innerText;

    		if (rowNameValue.toUpperCase() === selectedExistingTrain.name.toUpperCase() &&
    			rowDestValue.toUpperCase() === selectedExistingTrain.destination.toUpperCase() &&
    			rowFreqValue.toUpperCase() === selectedExistingTrain.frequency.toUpperCase())
    		{
    			console.log("MATCHING ROW FOUND!")
    			rowData[0].text(childSnapshot.name);
    			rowData[1].text(childSnapshot.destination);
    			rowData[2].text(childSnapshot.frequency);

    			var startTimeUnits = childSnapshot.start.split(":");

    			var arrival = findNextArrival(startTimeUnits[0], startTimeUnits[1], childSnapshot.frequency);
    			rowData[3].text(arrival);

    			rowData[4].text(findMinutesToNextArrival(arrival));
    		}
		}

		// last thing to do is clear object
		// should not clear object until table has been updated
		selectedExistingTrain = {
			key: "",
			name: "",
			frequency: "",
			destination: "",
			start: "",
			updateBy_name: "",
			updateBy_email: "",
			updated: ""
		}

	}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
	});


	function addTrainToTable(childObj)
	{
		// get data from snapshot
		var name = childObj.val().name;
		var destination = childObj.val().destination;
		var frequency = childObj.val().frequency;
		var start = childObj.val().start;

		var nextArrival = "";
		var minutes = "";

		if(start.charAt(2) === ":")
		{
			var timeValue = start.split(":");
			nextArrival = findNextArrival(timeValue[0], timeValue[1], frequency);

			minutes = findMinutesToNextArrival(nextArrival);
		}

		// create elements for new table row
		var newTableRow = $("<tr>");
		newTableRow.attr("class", "trainData");

		var newTableRow_name = $("<td>");
		var newTableRow_destination = $("<td>");
		var newTableRow_frequency = $("<td>");
		newTableRow_frequency.attr("class", "centerTableData");
		var newTableRow_arrival = $("<td>");
		newTableRow_arrival.attr("class", "centerTableData");
		var newTableRow_minutes = $("<td>");
		newTableRow_minutes.attr("class", "centerTableData");

		// put data into row
		newTableRow_name.text(name);
		newTableRow_destination.text(destination);
		newTableRow_frequency.text(frequency);
		newTableRow_arrival.text(nextArrival);
		newTableRow_minutes.text(minutes);

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
		$("#lastTrainStart").text(start + " (24-hour time)");
		$("#lastTrainFreqency").text(frequency + " minutes");
	}





    $(document).on("click", "tr.trainData", function() 
    {
    	console.log("trainData clicked!");

    	var children = $(this).children();

    	var selectedTrain_name = children[0].innerText;
    	var selectedTrain_dest = children[1].innerText;
    	var selectedTrain_freq = children[2].innerText;

    	var trainData = getExistingTrainData(selectedTrain_name, selectedTrain_dest, selectedTrain_freq);

    	if(trainData.key !== "")
    	{
			selectedExistingTrain.key = trainData.key;
			selectedExistingTrain.name = trainData.name;
			selectedExistingTrain.frequency = trainData.frequency;
			selectedExistingTrain.destination = trainData.destination;
			selectedExistingTrain.start = trainData.start;
			selectedExistingTrain.updateBy_name = trainData.updateBy_name;
			selectedExistingTrain.updateBy_email = trainData.updateBy_email;
			selectedExistingTrain.updated = trainData.updated;

			$("#trainNameInput").val(trainData.name);
			$("#trainDestinationInput").val(trainData.destination);
			$("#trainFreqencyInput").val(trainData.frequency);

			var timeUnits = trainData.start.split(":");

			$("#trainInitalTimeHHInput").val(timeUnits[0]);
			$("#trainInitalTimeMMInput").val(timeUnits[1]);
		}
		else
		{
			// do nothing
		}

		// https://firebase.google.com/docs/reference/js/firebase.database.Query
		// Find all dinosaurs whose names come before Pterodactyl lexicographically.
    });


 	// user signs-in with google account
	$("#btn-googleSignIn").on("click", function()
	{
		//console.log("SIGN IN CLICKED");
		// https://firebase.google.com/docs/reference/js/firebase.User
		var tmp = googleSignIn();
		//console.log("tmp:" + "\n" + tmp);
	});


	$("#btn-noSignIn").on("click", function()
	{	
		//console.log("NO GOOGLE CLICKED");
		signInArea.hide();
		trainSchedulerArea.show();
		$("#userProfileArea").show();
		updateUserInfo(defaultGoogleUser);
	});


	$("#btn-googleSignOut").on("click", function()
	{	
		googleSignOut();
	});


 });




