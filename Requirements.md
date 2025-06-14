The target users of this app are the following:
Matatu Crew(known as makangas) - these are the matatu crew who manage the matatu while it is on trips.
They will be using the app to request traffic updates from the spotters via voice or via text chats. 
They will also use the app to view their assigned routes(by the stage marshals) and trip data history
Create chats where they can share text messages, voice notes and have live spaces about their work.
Stage marshals - these are Sacco employees who manage and control activities at the stage of the matatu. 
Their main job is to monitor passenger queues, assign matatus to routes based on passenger numbers
 Maintain a board showing the matatu trip records.
Traffic Spotters - these are independent individuals who position themselves strategically along the matatu routes.
 Their main job is to pass the real-time traffic information to the matatu crew and advise the matatu crew on which route to take based on the traffic situation to save time.


Features of the App.

The app will have 2 main pages/tabs with the navigation positioned at the bottom.
Outlined below are the pages and their features.


A) Requests page tap on the left:
This page has two views- The list view and map view, which the user can switch between using a toggler on the right of the top app bar - there is a list and a pin location icon.
The Requests  page top app bar contains the following:
-Title of the app on the left
- On the right are the search and options toggle buttons. The options toggle button, when clicked, opens a menu with the following options: profile, contact list and settings. Clicking on these items opens their respective pages
The list view page has the following interactions and items:
All the requests(listed as items) that a user has made or received over time, with newer requests appearing at the top. Each request shows the number plate of the vehicle, eg KBZ 432J,sacco, the name of the requestor, their phone number, time of requesting, start and destination
Clicking and opening a request converts it into a chat and opens the chat view page, which shows texts and voice notes shared with their timestamps.
If it is empty, it has a faded icon at the centre showing that the chat is empty
The title of the chat is at the top app bar.
Clicking on the top app bar while on this chat window opens the stats page of this chat, which includes: The chat Title, all the details on the request item, the creation day and time, creator,  total number of members, the list of chat members and their destination, an indicator showing whether there is an ongoing live space.
Clicking on an individual member on this chat list opens the map view that shows their current live location.
Each member has an options button, which has options of making them an admin or removing them from the chat.
Clicking on a text message or voice note further opens a modal bottom sheet half page from the bottom that shows further details of the message, such as the location(with a scrollable map view) and time stamp when the update was asked and given.
The user can long-press on one or multiple items on the requests page, and this selects them and updates the top app bar conditionally as follows:
-If the user is a normal matatu crew and selects multiple items/requests, update the app bar with the delete button.
-If the user is a stage marshal or traffic spotter and selects multiple individual requests, these requests are highlighted, and an update and delete button appears on the right of the top app bar.
Clicking the update button collapses and combines the multiple selected requests and combines them into one, and opens the chats page with the requestors as the chat participants.
A single request can be added to an existing chat by selecting the two and clicking on update.

Selecting multiple chats updates the top app bar only with the delete button, no update button.

The delete button deletes the selected items and has a confirmation dialog box before the item is deleted.

This chat page has a floating button with a live icon, and when clicked, it will initiate a live/space session where all chat participants can join and listen to live audio updates.
When the live button is clicked, the users in the chat get a prompt to accept or cancel the space invite.
On this chat page, only the creators and admins of a chat can start a live space that can cascade and prompt all the users in the chat.
Once a user joins a live a sticky snackbar with the title of the chat/space, the amount of time in hours and minutes that the space has been running and an exit button is placed on the top of all the pages. Clicking the exit button on the snackbar exits the space. 
Clicking on this snackbar opens the chat where this live space session was started.

For the Stage marshal and traffic spotter, this snack bar does not appear when they join or start a space. They can join or start multiple spaces at a time because they can be in multiple spaces at once.
On the requests page, if an item/request has an ongoing live space, it is indicated by a glowing green indicator and a counter beside it showing how long the space has been live. These indicators are below the start-destination indicator.

If a chat receiver receives a new message, it is pushed to the top of the list and has a badge showing the number of unread notifications

Action Button
There is a floating action button on the requests page with two actions:
Action1- Create request -Any user can create a request for a traffic update to the spotter or a request seeking to be assigned a route to the stage marshal using a floating action button on the main request page, and this request will appear as the top item on the requests page of the involved parties.

Action 2 - Start a live space and select participants from your maintained contact list. The contact list shows their name, phone number, vehicle number plate and sacco.
Once the live space ends, the users can continue communicating on this chat until it is deleted.



Contact List 
The contact list page is populated with data from the user's phone contact list - get permissions for this.
Each entry on the contact list contains the user's saved name, vehicle registration and sacco, where applicable.
User who are not registered on Ma3pass have an invite button on their entry.

Profile Page
Contains the user's profile data such as:
Profile photo - editable
Username - editable
Sacco name - editable
Member since - the day of registration to the app
Routes   - editable
Trips completed - not editable


Settings Page

Contains all common and necessary user app settings
Search button
 When clicked opens a search bar on the top app bar for searching for something across the request page and the rides page






A map view :
The mapview shows different data depending on the user as follows:
Matatu Spotter - can view the current location of all the matatus making traffic update requests. 
Stage marshal - can view the current location of all matatus that belong to their sacco
Matatu crew(tout) - sees the highlighted route on the map, the position of the spotter and the destination
  In future, it will show the positioning of potential passengers to carry who are waiting along the route

B) The Rides page tab on the Right:
This page will be mainly for the stage marshal and matatu crew
It will show the history of rides that the user has taken or assigned.
Each entry will contain the trip data, such as 
Trip start location and trip destination
Trip start time
Trip end time 
Route
Assigner 
Assignee

This page has a floating action button to request a trip or assign a trip.
The assigner(stage marshal), when creating a trip, fills in all the above data and selects the assignee(tout) from the contact list.
The assignee will get a new entry at the top of their rides list that has a new badge. The new badge disappears once the trip info is read.
On the assigners' list, this new trip appears at the top of the list.
If a tout requests a ride, they fill in their desired trip start and end and wait for approval from the stage marshal. The stage marshal will get this request on their rides list with a new badge and accept or deny the request.


Based on my analysis of the Ma3pass requirements document, here are all the permissions needed:

## Essential Permissions

### 1. **Contacts Access**
- **Android:** `READ_CONTACTS`
- **iOS:** `NSContactsUsageDescription`
- **Purpose:** Populate contact list with user's phone contacts, including names and phone numbers

### 2. **Location Services**
- **Android:** `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- **iOS:** `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`
- **Purpose:** 
  - Show real-time location of matatus, spotters, and marshals on map
  - Track trip routes and destinations
  - Enable location-based request matching
  - Display user's current location for context

### 3. **Microphone Access**
- **Android:** `RECORD_AUDIO`
- **iOS:** `NSMicrophoneUsageDescription`
- **Purpose:** 
  - Record voice notes in chats
  - Enable live space audio sessions
  - Voice-based traffic update requests

### 4. **Camera Access**
- **Android:** `CAMERA`
- **iOS:** `NSCameraUsageDescription`
- **Purpose:** 
  - Capture and update profile photos
  - Potential future feature for sharing visual traffic updates

### 5. **Push Notifications**
- **Android:** `POST_NOTIFICATIONS` (Android 13+)
- **iOS:** Push notification entitlement
- **Purpose:**
  - New message alerts
  - Trip assignment notifications
  - Live space invitations
  - Traffic update alerts

### 6. **Storage Access**
- **Android:** `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`
- **iOS:** Handled through system APIs
- **Purpose:**
  - Store voice note recordings
  - Cache profile photos
  - Offline message storage

## Background & Runtime Permissions

### 7. **Background Location** (Optional but Recommended)
- **Android:** `ACCESS_BACKGROUND_LOCATION`
- **iOS:** `NSLocationAlwaysAndWhenInUseUsageDescription`
- **Purpose:** 
  - Continue tracking matatu locations during trips
  - Provide real-time updates even when app is backgrounded

### 8. **Background Audio Processing**
- **Android:** `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MICROPHONE`
- **iOS:** Background audio capability
- **Purpose:** 
  - Maintain live space audio sessions in background
  - Continue voice note recording if app is backgrounded

### 9. **Network Access**
- **Android:** `INTERNET`, `ACCESS_NETWORK_STATE`
- **iOS:** Automatic
- **Purpose:**
  - Real-time messaging and updates
  - Live space audio streaming
  - Map data and traffic information

## Permission Implementation Notes

### Critical Permissions (App won't function without):
- Contacts (for contact list feature)
- Location (core functionality)
- Microphone (voice notes and live spaces)
- Internet (real-time communication)

### Important Permissions (Reduced functionality without):
- Camera (profile management)
- Storage (offline capabilities)
- Notifications (user engagement)

### Optional Permissions (Enhanced experience):
- Background location (continuous tracking)
- Background audio (persistent live spaces)

### Permission Request Strategy:
1. **Runtime Permissions:** Request when feature is first used
2. **Onboarding:** Explain why each permission is needed
3. **Graceful Degradation:** Offer alternatives when permissions are denied
4. **Re-prompting:** Provide settings shortcuts when permissions are disabled

This comprehensive permission list ensures the app can deliver all the specified functionality while maintaining user privacy and system security requirements.