function messageDiscord(url, message, embed=null) {
  let payload = null;
  if (embed === null) {
    payload = JSON.stringify({content: message});
  } else {
    payload = JSON.stringify({content: message, embeds: [embed]})
  }

  let params = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    payload: payload,
    muteHttpExceptions: true
  };

  let res = UrlFetchApp.fetch(url, params);
  Logger.log(res.getContentText());
}

function sendWebhook(url, emailtimestamp, trackertimestamp, id, title, authors, chapter, chapterid, chaptercount, chaptertotal) {
  payload = JSON.stringify({
    "emailtimestamp": emailtimestamp,
    "trackertimestamp": trackertimestamp,
    "id": id,
    "title": title,
    "authors": authors,
    "chapter": chapter,
    "chapterid": chapterid,
    "chaptercount": chaptercount,
    "chaptertotal": chaptertotal
  });
  let params = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    payload: payload,
    muteHttpExceptions: true
  };

  let res = UrlFetchApp.fetch(url, params);
  Logger.log(res.getContentText());
}
