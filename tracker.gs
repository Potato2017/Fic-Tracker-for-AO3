function updateFics() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let threads = GmailApp.search('is:unread from:do-not-reply@archiveofourown.org'); // TODO: Do something about other emails like replies to comments so they don't show up here, maybe process them earlier idk.
  threads.reverse();
  if (threads.length === 0) {
    let info = ss.getSheetByName('info');
    let currentTime = info.getRange("B2").getValue();
    info.getRange("A2").setValue(currentTime);
    ss.toast(`0 updates were tracked.`, "Update Complete", 10);
    return;
  }
  let info = ss.getSheetByName('info');
  if (info.getRange("A6").getValue() == "Yes") return;
  ss.toast('Checking email for updates.', 'Updating...');
  let fics = ss.getSheetByName('fics');
  let history = ss.getSheetByName('history');
  let config = ss.getSheetByName('config');
  let discordWebhookActive = config.getRange("E3").getValue();
  let otherWebhookActive = config.getRange("E5").getValue();
  let initialUpdateCount = history.getRange("A2:A").getValues().filter(String).length;
  let total = 0;
  for (var i = 0; i < threads.length; i++) {
    const validRe = /^\[AO3\] .+ posted Chapter \d+ of .+$/gm;
    const validReNewWork = /^\[AO3\] .+ posted .+$/gm;
    let idVals = fics.getRange(2, 1, fics.getRange("A2:A").getValues().filter(String).length).getValues().map(function(str) {return parseInt(str);});
    let subj = threads[i].getMessages()[threads[i].getMessages().length-1].getSubject();
    let updateType = 0; // Update Type: 0 = New Chapter (matches validRe), 1 = New Work (matches validReNewWork but not validRe)
    if (!validRe.test(subj)) {
      if (!validReNewWork.test(subj)) {
        continue; // Not an update email
      }
      updateType = 1; // Update, but not a new chapter, therefore new work
    };
    let body = threads[i].getMessages()[threads[i].getMessages().length-1].getBody();
    /* ss.getSheetByName('config').getRange("G1").setValue(body);
    return; // FOR DEBUG when AO3 changes their email format */
    let extractedData = extractData(body, updateType);
    let id = extractedData[0];
    let title = extractedData[1];
    let authorsarray = extractedData[2];
    let author = authorsarray.join(", ");
    let chapters = extractedData[3];
    let chaptercount = extractedData[4];
    let chaptertotal = extractedData[5];
    let wordcount = extractedData[6];
    let complete = chaptercount === chaptertotal;
    date = threads[i].getMessages()[threads[i].getMessages().length-1].getDate();
    datestr = (date.getMonth()+1).toString() + "/" + date.getDate().toString() + "/" + date.getFullYear().toString() + " " + (date.getHours().toString().length == 2 ? date.getHours().toString() : "0" + date.getHours().toString()) + ":" + (date.getMinutes().toString().length == 2 ? date.getMinutes().toString() : "0" + date.getMinutes().toString()) + ":" + (date.getSeconds().toString().length == 2 ? date.getSeconds().toString() : "0" + date.getSeconds().toString());
    if (idVals.includes(id)) {
      fics.getRange(idVals.indexOf(id)+2, 2).setValue(title);
      fics.getRange(idVals.indexOf(id)+2, 3).setValue(author);
      fics.getRange(idVals.indexOf(id)+2, 6).setValue(chaptercount);
      fics.getRange(idVals.indexOf(id)+2, 7).setValue(complete);
      fics.getRange(idVals.indexOf(id)+2, 10).setValue(wordcount);
    } else {
      if (fics.getMaxRows() - 5 < idVals.length) fics.insertRows(fics.getMaxRows(), 5)
      fics.getRange(idVals.length+2, 1).setValue(id);
      fics.getRange(idVals.length+2, 2).setValue(title);
      fics.getRange(idVals.length+2, 3).setValue(author);
      fics.getRange(idVals.length+2, 5).setValue(0);
      fics.getRange(idVals.length+2, 6).setValue(chaptercount);
      fics.getRange(idVals.length+2, 7).setValue(complete);
      fics.getRange(idVals.length+2, 10).setValue(wordcount);
    }
    for (var j = 0; j < chapters.length; j++) {
      let chapternumber = chapters[j][0];
      let chapterid = chapters[j][1];
      console.log(chapterid);
      history.appendRow([datestr, id, title, author, chapternumber, chapterid]);
      history.getRange("A2:A").setNumberFormat("M/d/yyyy h:mm:ss");
      ss.toast(`Chapter ${chapternumber} of ${title}`, 'Update Tracked');
      let discordWebhookUrl = config.getRange("A3").getValue();
      let otherWebhookUrl = config.getRange("A5").getValue();
      if (discordWebhookActive && discordWebhookUrl) {
        let embed = {
          "title": `Chapter ${chapternumber} • ${title}`,
          "description": `Update email received at <t:${Math.floor(date/1000)}:f>, <t:${Math.floor(date/1000)}:R>`,
          "author": {
            "name": `${authorsarray[0]}${authorsarray.length >= 2 ? (` and ${authorsarray.length - 1} other${authorsarray.length >= 3 ? "s" : ""}`) : ""}`,
            "url": `https://www.archiveofourown.org/users/${authorsarray[0].split(" ").length === 1 ? authorsarray[0] : authorsarray[0].split(" ")[0] + "/pseuds/" + authorsarray[0].split(" ")[1].slice(1, -1)}`, // Checking for pseuds
            "icon_url": `https://archiveofourown.org/images/ao3_logos/logo_42.png`
          },
          "url": `https://www.archiveofourown.org/works/${id}${chapterid === 0 ? "" : `/chapters/${chapterid}`}`,
          "color": Math.floor(Math.random()*16777216),
          "footer": {
            "text": `Total Chapters: ${chaptercount} • Work ID: ${id}`
          },
          "timestamp": (new Date()).toISOString()
        };
        messageDiscord(discordWebhookUrl, "", embed=embed);
      }
      if (otherWebhookActive && otherWebhookUrl) {
        sendWebhook(otherWebhookUrl, Math.floor(date/1000), Math.floor((new Date()).getTime() / 1000), id, title, authorsarray, chapternumber, chapterid, chaptercount, chaptertotal);
      }
      if (history.getMaxRows() - 5 < history.getLastRow()) history.insertRows(history.getMaxRows(), 5);
      total++;
    }
    GmailApp.markThreadRead(threads[i]);
  }
  history.getRange("A2:F").sort(1);
  rows = history.getRange("A2:F").getValues();
  newrows = [];
  if (initialUpdateCount === 0) newrows.push(rows[0]);
  out = 0;
  for (var row = Math.max(initialUpdateCount, 1); row < rows.length; row++) {
    if (rows[row][0] === "") break;
    if (!rows[row].every((element, index) => element.toString() === rows[row-1][index].toString())) newrows.push(rows[row]);
    else out++;
  }
  for (var i = 0; i < out; i++) newrows.push(Array(history.getLastColumn()).fill(""));
  if (newrows.length > 0) history.getRange(initialUpdateCount + 2, 1, newrows.length, history.getLastColumn()).setValues(newrows);
  let currentTime = info.getRange("B2").getValue();
  info.getRange("A2").setValue(currentTime);
  ss.toast(total !== 1 ? `${total} updates were tracked.` : `${total} update was tracked.`, "Update Complete", 10)
}

function extractData(body, type) { // Update Type: 0 = New Chapter, 1 = New Work
  let id_s = "";
  switch(type) {
    case 0:
      id_s = "new chapter of <i><b><a style=\"color:#990000\" href=\"https://archiveofourown.org/works/";
      break;
    case 1:
      id_s = "<b><a style=\"color:#990000\" href=\"https://archiveofourown.org/works/";
      break;
  }
  let bodytemp = body.slice(body.indexOf(id_s)+id_s.length);
  const id_e = "\"";
  const workid = parseInt(bodytemp.slice(0, bodytemp.indexOf(id_e)).toString());
  
  const title_s = ">";
  const title_e = "</a></b>";
  const worktitle = decodeEntities(bodytemp.slice(bodytemp.indexOf(title_s)+title_s.length, bodytemp.indexOf(title_e)));

  const words_s = "</a></b></i> (";
  const words_e = " words)"
  const workwords = parseInt(bodytemp.slice(bodytemp.indexOf(words_s)+words_s.length, bodytemp.indexOf(words_e)));

  const search5 = "<a style=\"color:#990000\" href=\"https://archiveofourown.org/users/";
  const search6 = "</p>";
  bodytemp = body.slice(body.indexOf(search5));
  let authorstring = bodytemp.slice(0, bodytemp.indexOf(search6));
  const search6_1 = "style=\"border:none;display:inline-block;font-weight:bold;height:16px;padding-right:3px;vertical-align:-3px;width:16px;\">";
  const search6_2 = "</a>";
  let workauthors = [];
  while (authorstring.indexOf(search6_1) != -1) {
    workauthors.push(authorstring.slice(authorstring.indexOf(search6_1) + search6_1.length, authorstring.indexOf(search6_2)));
    authorstring = authorstring.slice(authorstring.indexOf(search6_2) + search6_2.length);
  }
  
  const search7 = "Chapters: </b>";
  bodytemp = bodytemp.slice(bodytemp.indexOf(search7)+search7.length);
  const search8 = "/";
  const workchaptercount = parseInt(bodytemp.slice(0, bodytemp.indexOf(search8)));

  const search9 = "\r";
  let workchaptertotal = bodytemp.slice(bodytemp.indexOf(search8)+search8.length, bodytemp.indexOf(search9));
  if (workchaptertotal === "?") workchaptertotal = -1;
  else workchaptertotal = parseInt(workchaptertotal);

  const updateFinderRegex = /<b><a style="color:#990000" href="https:\/\/archiveofourown\.org\/works\/\d+\/chapters\/\d+">Chapter \d+(:|<)/gm;
  const updates = body.matchAll(updateFinderRegex);
  let matches = [];
  for (const match of updates) {
    matches.push(match[0]);
  }
  let workchapters = [];
  if (type === 1) workchapters.push([workchaptercount, 0]); // if it's a new work the email doesn't say "Chapter 1" so we add it manually
  for (var i = 0; i < matches.length; i++) {
    workchapters.push([parseInt(matches[i].split("Chapter ")[1].slice(0, -1)), parseInt(matches[i].split('/chapters/')[1].split('"')[0]) || 0]); // TODO: Test if no chapter ID works
  }

  return [workid, worktitle, workauthors, workchapters, workchaptercount, workchaptertotal, workwords]; // Work ID, Work Title, Array of Update Chapters, Chapter Total, Max Chapters, Words
}

function clearHistory() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let ui = SpreadsheetApp.getUi();
  let response = ui.alert("Are you sure you want to clear the history?", "This will clear all rows in the \"history\" sheet of the tracker.", ui.ButtonSet.YES_NO)
  if (response == ui.Button.YES) {
    ss.toast("Clearing history.", "Updating...", 10)
    let history = ss.getSheetByName('history');
    let total = history.getLastRow()-1;
    history.deleteRows(2, total);
    ss.toast(`${total} rows were cleared from history.`, "Update Complete", 10)
  }
}

function removeConsecDuplicateUpdates() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let history = ss.getSheetByName('history');
  ss.toast("Removing duplicate updates.", "Updating...", 10)
  rows = history.getRange("A2:F").getValues();
  newrows = [];
  newrows.push(rows[0]);
  out = 0;
  for (var row = 1; row < rows.length; row++) {
    if (rows[row][0] === "") break;
    if (!rows[row].every((element, index) => element.toString() === rows[row-1][index].toString())) newrows.push(rows[row]);
    else out++;
  }
  for (var i = 0; i < out; i++) newrows.push(Array(history.getLastColumn()).fill(""));
  history.getRange(2, 1, newrows.length, history.getLastColumn()).setValues(newrows);
  ss.toast(`${out} duplicate updates were removed.`, "Update Complete", 10)
}

function decodeEntities(str) {
  return XmlService.parse('<d>' + str + '</d>').getRootElement().getText();
}
