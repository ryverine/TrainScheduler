
$(document).ready(function() 
{
	/*** GLOBAL ***/

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

	var trainTableData = $("#trainDataArea");

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

	/*** FUNCTIONS ***/

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
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().useDeviceLanguage();

		provider.addScope("profile");
		provider.addScope("email");

		return firebase.auth().signInWithPopup(provider).then(function(result)
		{
			googleUser = result.user;

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
 		var nextArrival = trainStartHH + ":" + trainStartMM;

 		var now = moment();

 		var trainStartTime = moment();
 		trainStartTime.hour(trainStartHH);
 		trainStartTime.minute(trainStartMM);

 		if(now.diff(trainStartTime) > 0)
 		{
 			var theDuration = moment.duration(Number.parseInt(trainFrequency), "minutes");

 			var difference = now.diff(trainStartTime);

 			var numberOfArrivalsSiceStart = Math.floor(difference/theDuration);  

 			var millisecondsToNextArrival = (numberOfArrivalsSiceStart + 1) * theDuration;

 			nextArrival = trainStartTime.add(millisecondsToNextArrival, "ms").format("HH:mm");
 		}

 		return nextArrival;
 	}


 	function findMinutesToNextArrival(nextArrival)
 	{
 		var now = moment();

 		var timeUnits = nextArrival.split(":");

 		var arrival = moment();
 		arrival.hour(timeUnits[0]);
		arrival.minute(timeUnits[1]);
		 
		if(now >= arrival)
		{
			return now.diff(arrival, 'minutes');
		}
		else
		{
			return arrival.diff(now, 'minutes');
		}
 	}


 	function getExistingTrainData(name, dest, freq)
	{
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
  			}
		});

 		return tmpTrain;
	}


	function populateLastTrainArea(theChild)
	{
		$("#lastTrainName").text(theChild.child("name").val());
		$("#lastTrainNameDestination").text(theChild.child("destination").val());

		$("#lastTrainStart").text(theChild.child("start").val() + " (24-hour time)");
		$("#lastTrainFreqency").text(theChild.child("frequency").val() + " minutes");

		$("#lastTrainUpdated").text(theChild.child("updated").val());
		$("#lastTrainUpdateBy").html(theChild.child("updateBy_name").val() + "<br>" + "(" + theChild.child("updateBy_email").val() + ")");
	} 


	function addTrainToTable(childObj)
	{
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

		trainTableData.append(newTableRow);
	}


	/*** PAGE EVENTS ***/

    $("#btn-add").on("click", function() 
    {
        event.preventDefault();

  		$("#submitErrorMessage").text("");

		trainName_input = $("#trainNameInput").val().trim();
		trainDestination_input = $("#trainDestinationInput").val().trim();
		firstTrainTimeHH_input = $("#trainInitalTimeHHInput").val().trim();
		firstTrainTimeMM_input = $("#trainInitalTimeMMInput").val().trim();
		trainFrequency_input = $("#trainFreqencyInput").val().trim();

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
		event.preventDefault();

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
			}
			else
			{
				$("#submitErrorMessage").text(inputError);
			}
		}
	 });

	 
	$("#btn-remove").on("click", function() 
	{
		event.preventDefault();
		console.log("REMOVE BUTTON CLICKED");

		if(selectedExistingTrain.key !== "")
		{
			trainName_input = $("#trainNameInput").val().trim();
			trainDestination_input = $("#trainDestinationInput").val().trim();
			firstTrainTimeHH_input = $("#trainInitalTimeHHInput").val().trim();
			firstTrainTimeMM_input = $("#trainInitalTimeMMInput").val().trim();
			trainFrequency_input = $("#trainFreqencyInput").val().trim();

			var inputError = validateInput(trainName_input, trainDestination_input , firstTrainTimeHH_input, firstTrainTimeMM_input, trainFrequency_input);

			if(inputError === "")
			{
				database.ref(selectedExistingTrain.key).remove();

				$("#trainNameInput").val("");
				$("#trainDestinationInput").val("");
				$("#trainInitalTimeHHInput").val("");
				$("#trainInitalTimeMMInput").val("");
				$("#trainFreqencyInput").val("");

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

			}
			else
			{
				$("#submitErrorMessage").text(inputError);
			}
		}
		{
			$("#submitErrorMessage").text("You did not select a train to remove!");
		}

	});


	$(document).on("click", "tr.trainData", function() 
	{
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
	
	});
 
 
	$("#btn-googleSignIn").on("click", function()
	{
		var tmp = googleSignIn();
	});


	$("#btn-noSignIn").on("click", function()
	{	
		signInArea.hide();
		trainSchedulerArea.show();
		$("#userProfileArea").show();
		updateUserInfo(defaultGoogleUser);
	});

 
	$("#btn-googleSignOut").on("click", function()
	{	
		googleSignOut();
	});


	$("#btn-clear").on("click", function()
	{	
		$("#trainNameInput").val("");
		$("#trainDestinationInput").val("");
		$("#trainInitalTimeHHInput").val("");
		$("#trainInitalTimeMMInput").val("");
		$("#trainFreqencyInput").val("");

		$("#submitErrorMessage").text("");

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
	});

	/*** DATABASE LISTENERS ***/
	
	database.ref().on("child_removed", function(childSnapshot) 
	{
		var tableRows = trainTableData.children();

		for(var i = 0; i < tableRows.length; i++)
		{
			var rowData = $(tableRows[i]).children();

    		var rowNameValue = rowData[0].innerText;
    		var rowDestValue = rowData[1].innerText;
			var rowFreqValue = rowData[2].innerText;
			
    		if (rowNameValue.toUpperCase() === childSnapshot.child("name").val().toUpperCase() &&
    			rowDestValue.toUpperCase() === childSnapshot.child("destination").val().toUpperCase() &&
    			rowFreqValue.toUpperCase() === childSnapshot.child("frequency").val().toUpperCase())
    		{
				$(tableRows[i]).remove();
    		}
		}

	}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
	});


	database.ref().on("child_added", function(childSnapshot) 
	{
		addTrainToTable(childSnapshot);
		populateLastTrainArea(childSnapshot);

	}, function(errorObject) {
	console.log("Errors handled: " + errorObject.code);
	});


	database.ref().on("child_changed", function(childSnapshot) 
	{
		var tableRows = trainTableData.children();

		for(var i = 0; i < tableRows.length; i++)
		{
			var rowData = $(tableRows[i]).children();

    		var rowNameValue = rowData[0].innerText;
    		var rowDestValue = rowData[1].innerText;
			var rowFreqValue = rowData[2].innerText;
			
    		if (rowNameValue.toUpperCase() === selectedExistingTrain.name.toUpperCase() &&
    			rowDestValue.toUpperCase() === selectedExistingTrain.destination.toUpperCase() &&
    			rowFreqValue.toUpperCase() === selectedExistingTrain.frequency.toUpperCase())
    		{
    			$(rowData[0]).text(childSnapshot.child("name").val());
    			$(rowData[1]).text(childSnapshot.child("destination").val());
				$(rowData[2]).text(childSnapshot.child("frequency").val());
				
				var startTimeUnits = childSnapshot.child("start").val().split(":");
				
    			var arrival = findNextArrival(startTimeUnits[0], startTimeUnits[1], childSnapshot.frequency);
    			$(rowData[3]).text(arrival);
				$(rowData[4]).text(findMinutesToNextArrival(arrival));
				
				populateLastTrainArea(childSnapshot);
    		}
		}

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


	

 });




