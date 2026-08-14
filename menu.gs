function addUpdateMenu() {
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('Manage Tracker')
      .addItem('Update Fics', 'updateFics')
      .addItem('Clear History', 'clearHistory')
      .addItem('Remove Consecutive Duplicate Updates', 'removeConsecDuplicateUpdates')
      .addToUi();
  ui.createMenu('Display Work')
      .addItem('Quick-Display Selected Work Latest Chapter', 'quickDisplayLatest')
      .addItem('Quick-Display Selected Work Full Text', 'quickDisplayFull')
      .addItem('Display Work By ID', 'displayWorkByID')
      .addToUi();
  ui.createMenu('Download Works')
      .addItem('Quick-Download Selected Fic(s)', 'quickDownload')
      .addItem('Download All Fics', 'downloadAllFics')
      .addToUi();
}
