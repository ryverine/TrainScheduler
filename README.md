# Train Scheduler 

A train schedule application that incorporates Google's Firebase to host arrival and departure data. 

App will retrieve and manipulate this information with Moment.js. 

Simulates a service that would be used to provide up-to-date information about various trains, namely their arrival times and how many minutes remain until they arrive at their station.

[Deployed App](https://ryverine.github.io/TrainScheduler)

## Technologies

 * HTML
 * CSS, CSS Reset, Bootstrap
 * JavaScript, jQuery, Moment JS
 * Firebase Realtime Database
 * Google Authentication

## Sign In

User can sign-in with Google or access the site without signing in.

### Sign In With Google

If the user signs in with their Google account their profile picture, name, and email address will be reflected in the header of the app.

![Google Sign-In](/documentation/google_signin.gif)

### Proceed Without Google

A Google account is not neccessary to access the site. The header will display dummy information where it would otherwise show Google account info.

![No Google Sign-In](/documentation/no_google_signin.gif)

## Current Train Schedule

Train data is stored in Firebase to maintain data persistnce. You can see all current trains, the `Destination` of each train, the `Frequency` of the train's route, the expected `Next Arrival` of the train, and the amount of time it will take for the train to arrive via `Minutes Away`.

## Add/Update Train

This section allows the user to interact with train data. 

### Add A New Train

Enter values for `Train Name`, `Destination`,  `First Train Time`, and train arrival `Freqency`, then add the train to the schedule by clicking the `Add New Train` button.

![Add Train](/documentation/add_train.gif)

### Update Train

Click on the row of a train in the table that you want to update. This will add the train's data to the input fileds and the `selectedExistingTrain` object. Make your changes in the input fields, then click the `Update Existing Train` button to send the new information to the database.

![Update Train](/documentation/update_train.gif)

### Remove Train From Schedule

Click on the row of a train in the table that you want to remove, then click the "Remove Existing Train" button.

Use the `Clear Stored Data` button to ensure that train's data is removed from the `selectedExistingTrain` object.

![Remove Train](/documentation/remove_train.gif)

### Clone Train

This is not defined functionality, but you can select an exisitng train, make changes to its data, and then use `Add New Train` button.

### Clear Stored Data

You may forget what train you have recently selected, so the `Cleared Stored Data` button allows to reset the `selectedExistingTrain` object to reduce unintented changes to train data.

## Last Train Added

This displays the information on the last train whose data was modified in some way, either via `Add New Train` or `Update Existing Train`.