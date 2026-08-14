# Fic-Tracker-for-AO3
Spreadsheet with associated Google Apps Script for tracking update emails from AO3.

## Setup
Create a copy of the attached Google Sheet: [insert link once it's ready.] Make sure to copy the attached Apps Script.

Open the sheet and enter Extensions > Apps Script. Go to the Triggers tab and create a trigger running addUpdateMenu, with the event source as "From Spreadsheet" and type as "On Open."

Create a trigger running updateFics, with the event source as "Time-based." Choose an interval at which updates should be tracked. Be mindful of your daily quota of 90 minutes of runtime through Google Apps Script.

Within the spreadsheet itself, you may manually input the details of any works you would like into the "fics" sheet. _**Make sure to fill from top to bottom and that the ID column is filled.**_ The work ID for a given work is the number found after /works/ in its URL. If there are multiple authors, each author should be separated by a comma and a space (the two-character string "`, `").

### Discord Integration
The tracker can send messages to a Discord channel on each update through a webhook. Once you have created the webhook, you can paste the webhook URL into the corresponding field in the "config" sheet and tick the adjacent checkbox.


### Permissions
The first time you run the tracker, you will be asked to give permissions. **This tracker accesses your emails. Do not give permissions unless you are absolutely sure you can trust me/my code not to use this permission for nefarious purposes.** I promise this is just a fic tracker. Other permissions you can grant are for mass-downloading to your Google Drive and for sending Discord webhooks.

## Usage
### Spreadsheet
The tracker will automatically scrape your email for unread emails from AO3, input them into the spreadsheet, and subsequently mark the emails as read. **This means that if you read an email before the tracker sees it, it will be ignored.** The tracker will also ignore non-update emails from AO3 such as comments and kudos, leaving them unread. The list of fics in the "fics" sheet will be continually updated with these updates, and each individual update will be logged in the "history" sheet. 

You can use the "Read To" column in the "fics" sheet to keep track of reading progress across works. When the chapter count of a fic does not match the number of chapters read (typically indicating that new unread chapters have been posted), the cell with the chapter count will become green. 

The "fics sorter" and "graphs" sheets are self-explanatory. You can edit the sort key in the top right of the "fics sorter" sheet.

The "update filter" sheet is used by typing search terms into the gray boxes in the top middle, which will filter the updates to only those that match the query exactly.

The "stats" sheet displays various fun statistics. A fic is defined to be completed when the current chapter count equals the maximum chapter count. A fic is defined to be a oneshot when it has exactly one chapter and is completed. The longest drought is the largest temporal gap between two updates.

### Menu bar
#### Manage Tracker
_Update Fics_: Immediately check for unread emails and update accordingly.

_Clear History_: Clear all update history. You can ctrl+Z to undo if you did this on accident.

_Remove Consecutive Duplicate Updates_: Deduplicates logs in the "updates" tab, in case one email was logged multiple times.

#### Display Work
_Quick-Display Selected Work Latest Chapter_: Select a cell of a work in the "fics" sheet (any cell in the row will do). This button displays the latest chapter as a popup in the Google Sheet (assuming it is logged, which is the case if the "Last Update Chapter ID" column is nonzero).

_Quick-Display Selected Work Full Text_: Select a cell of a work in the "fics" sheet (any cell in the row will do). This button displays the entire text. Does not work if the text is too long.

_Display Work By ID_: Input a work ID (and, optionally, a chapter ID) to display the corresponding work.

#### Download Works
Note that these functions take a long time to run, and GAS scripts time out after six minutes.

_Quick-Download Selected Fic(s)_: Select a group of cells of works in the "fics" sheet (any cells in their rows will do). This button downloads their full texts to a Google Drive folder.

_Download All Fics_: Download the full texts of all works in the "fics" sheet to a Google Drive folder.
