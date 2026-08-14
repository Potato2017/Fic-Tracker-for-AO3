function downloadFics(pairs, folder) { // Each pair contains the ID and the title
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let failures = [];
  for (var i = 0; i < pairs.length; i++) {
    let [id, title] = pairs[i];
    let success = false;
    while (!success) {
      success = true;
      try {
        let url = `https://download.archiveofourown.org/downloads/${id}/fic.html`;
        let response = UrlFetchApp.fetch(url, {muteHttpExceptions: true}); //
        let code = response.getResponseCode();
        if (code != 200 && code != 404) {
          ss.toast(`Error on fic ${i+1}/${pairs.length}, trying again in 5 seconds...`, title);
          Utilities.sleep(5000);
          response = UrlFetchApp.fetch(url, {muteHttpExceptions: true}); //
          code = response.getResponseCode();
        }
        if (code != 200) {
          ss.toast(`Failed to download fic ${i+1}/${pairs.length} - Error Code: ${code}`, title);
          console.log(`Error ${code}: ${response.getContentText()}`);
          failures.push(`${title} - ID ${id} - Error ${code}`);
          continue;
        }

        let fileBlob = response.getBlob().setName(`${title}.html`);
        folder.createFile(fileBlob);

        ss.toast(`Successfully downloaded fic ${i+1}/${pairs.length}`, title);

        Utilities.sleep(1000);
      } catch(error) {
        success = false;
        ss.toast(`Error on fic ${i+1}/${pairs.length}, trying again in 5 seconds...`, title);
        Utilities.sleep(5000);
      }
    }
  }

  return failures;

}


function quickDownload() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let fics = ss.getSheetByName('fics');
  let rows = new Set();

  let activeRanges = SpreadsheetApp.getActiveRangeList().getRanges();
  for (var i = 0; i < activeRanges.length; i++) {
    let startrow = activeRanges[i].getRow();
    let rowcount = activeRanges[i].getNumRows();
    rows = rows.union(new Set([...Array(rowcount).keys()].map(i => i + startrow)));
  }

  let count = fics.getRange("A2:A").getValues().filter(String).length;
  let ids = fics.getRange(2, 1, count).getValues().map(function(str) {return parseInt(str);});
  let titles = fics.getRange(2, 2, count).getValues();

  let pairs = [];
  for (var i = 0; i < count; i++) {
    if (rows.has(i + 2)) {
      pairs.push([ids[i], titles[i]]);
    }
  }

  let ui = SpreadsheetApp.getUi();
  let response = ui.alert("Are you sure you want to download?", `You will be downloading ${pairs.length} fic(s).`, ui.ButtonSet.YES_NO)
  if (response == ui.Button.NO) return;
  if (pairs.length > 50) {
    let ui = SpreadsheetApp.getUi();
    let response = ui.alert("Potential Timeout", `You are downloading a lot (${pairs.length}) of fics! Google Apps Script has a maximum runtime of 6 minutes for each script. If the script times out, then only some of the fics will be downloaded to the folder, and you will have to go into your Google Drive to find the download folder. You will have to manually downloaded the remaining fics with the \"Download Selected Fic(s)\" button. Are you still sure you want to continue?`, ui.ButtonSet.YES_NO)
    if (response == ui.Button.NO) return;
  }

  let date = new Date();
  let folder = DriveApp.createFolder(`AO3 Fic Tracker Download ${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`);
  
  failures = downloadFics(pairs, folder);

  let htmlOutput = HtmlService.createHtmlOutput(`Your download is available in the folder of your Google Drive titled <u>AO3 Fic Tracker Download ${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}</u>. Alternatively, you can open the following link: <a href="https://drive.google.com/drive/folders/${folder.getId()}" target="_blank" rel="noopener noreferrer">link</a>. You can delete the folder afterwards if you want.<p><b>Fics that failed to download:</b></p><p>${failures.join('</p><p>')}</p>`);
SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Download Complete');
}

function downloadAllFics() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let fics = ss.getSheetByName('fics');
  let count = fics.getRange("A2:A").getValues().filter(String).length;
  let ui = SpreadsheetApp.getUi();
  let response = ui.alert("Are you sure you want to download?", `You will be downloading ${count} fic(s).`, ui.ButtonSet.YES_NO)
  if (response == ui.Button.NO) return;
  if (count > 50) {
    let ui = SpreadsheetApp.getUi();
    let response = ui.alert("Potential Timeout", `You are downloading a lot (${count}) of fics! Google Apps Script has a maximum runtime of 6 minutes for each script. If the script times out, then only some of the fics will be downloaded to the folder, and you will have to go into your Google Drive to find the download folder. You will have to manually downloaded the remaining fics with the \"Download Selected Fic(s)\" button. Are you still sure you want to continue?`, ui.ButtonSet.YES_NO)
    if (response == ui.Button.NO) return;
  }
  let ids = fics.getRange(2, 1, count).getValues().map(function(str) {return parseInt(str);});
  let titles = fics.getRange(2, 2, count).getValues();

  let pairs = ids.map(function(id, i) {return [id, titles[i]];});

  let date = new Date();
  let folder = DriveApp.createFolder(`AO3 Fic Tracker Download ${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`);
  
  failures = downloadFics(pairs, folder);

  let htmlOutput = HtmlService.createHtmlOutput(`Your download is available in the folder of your Google Drive titled <u>AO3 Fic Tracker Download ${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}</u>. Alternatively, you can open the following link: <a href="https://drive.google.com/drive/folders/${folder.getId()} target="_blank" rel="noopener noreferrer"">link</a>. You can delete the folder afterwards if you want.<p><b>Fics that failed to download:</b></p><p>${failures.join('</p><p>')}</p>`);
SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Download Complete');

}
