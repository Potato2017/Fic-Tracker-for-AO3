function showWork(workid, chapterid) {
  let ui = SpreadsheetApp.getUi();
  let response = UrlFetchApp.fetch(`https://www.archiveofourown.org/works/${workid}${chapterid === "" ? "?view_full_work=true" : `/chapters/${chapterid}`}`);
  let fichtml = response.getContentText();
  let html = HtmlService.createHtmlOutput(fichtml);
  ui.showModalDialog(html, workid);
}

function displayWorkByID() {
  let ui = SpreadsheetApp.getUi();
  let workidres = ui.prompt('Work ID of fic? (Leave empty to cancel)');
  let workid = workidres.getResponseText();
  if (workid === "") return;
  let chapteridres = ui.prompt('Chapter ID? (Leave empty for full fic)')
  let chapterid = chapteridres.getResponseText();
  showWork(workid, chapterid);
}


function quickDisplayLatest() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let fics = ss.getSheetByName('fics');
  let currentCell = ss.getActiveSheet().getCurrentCell();
  let row = currentCell.getRow();
  let workid = fics.getRange(row, 1).getValue();
  let chapterid = fics.getRange(row, 9).getValue();
  showWork(workid, chapterid);
}

function quickDisplayFull() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let fics = ss.getSheetByName('fics');
  let currentCell = ss.getActiveSheet().getCurrentCell();
  let row = currentCell.getRow();
  let workid = fics.getRange(row, 1).getValue();
  showWork(workid, "");
}
