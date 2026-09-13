/**
 * Steeped in Portland - Waitlist backend (Google Apps Script)
 * Matches the live form payload exactly. Replaces the previous Code.gs.
 *
 * The "Invalid type" errors were thrown by the old validateSubmission(), which
 * checked answers against the previous question set. This version does not do
 * schema/type validation on answer values (the form already constrains them),
 * so valid submissions stop getting rejected. It still verifies the branch and
 * logs anything that fails to an "Errors" tab.
 *
 * DEPLOY
 *   1) Open the responses spreadsheet > Extensions > Apps Script.
 *   2) Replace all code with this file. Save.
 *   3) (optional) Run setupSheets() once to pre-create the tabs/headers.
 *   4) Deploy > Manage deployments > (your web app) > Edit (pencil) >
 *      Version: "New version" > Deploy.  This keeps the SAME /exec URL,
 *      so you do NOT need to change SCRIPT_URL on the site.
 *      Web app must be: Execute as = Me, Who has access = Anyone.
 *
 * NOTE ON COLUMNS: rows are written by POSITION in the order below. Renaming a
 * header or restyling is safe. Reordering, inserting, or deleting columns will
 * misalign future rows unless this file is updated to match.
 */

// branch -> tab name
var TABS = {
  realtor:   'Realtor',
  fashion:   'Fashion',
  nonprofit: 'Nonprofit',
  everyone:  'Everyone Else'
};

// branch -> { headers: [...], keys: [...] }  (keys after the 6 identity columns)
var COLUMNS = {
  realtor: {
    headers: ['Timestamp','First Name','Last Name','Email','City','Role',
              'Q1 Zillow Flex Partner','Q2 % From Paid Leads','Q3 Biggest Lead-Gen Frustration','Q3 Other',
              'Q4 Preferred Fee Structure','Q5 Set Aside 10% GCI','Q6 Community Support Importance',
              'Q7 Volunteer For Perks','Q7 Other'],
    keys:    ['q1','q2','q3','q3_other','q4','q5','q6','q7','q7_other']
  },
  fashion: {
    headers: ['Timestamp','First Name','Last Name','Email','City','Role',
              'Q1 Primary Role','Q2 Biggest Local Challenge','Q3 Home Staging Partnership',
              'Q4 Community Support Importance','Q5 Nonprofit Discount Partnership',
              'Q6 Volunteer For Perks','Q6 Other'],
    keys:    ['q1','q2','q3','q4','q5','q6','q6_other']
  },
  nonprofit: {
    headers: ['Timestamp','First Name','Last Name','Email','City','Role',
              'Q1 Org Focus','Q2 Role','Q3 Greatest Volunteer Need','Q4 Verify Hours Commitment',
              'Q5 Sit As Judge','Q6 Docuseries Media Importance'],
    keys:    ['q1','q2','q3','q4','q5','q6']
  },
  everyone: {
    headers: ['Timestamp','First Name','Last Name','Email','City','Role',
              'Q1 Search Platforms (ranked)','Q2 Primary Goal','Q2 Other','Q3 Agent Connection Pref',
              'Q4 Reinvestment Impact','Q5 Switch Realtor Value','Q6 Volunteer For Perks','Q6 Other'],
    keys:    ['q1','q2','q2_other','q3','q4','q5','q6','q6_other']
  }
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (errLock) {
    return json_({ ok: false, error: 'busy, try again' });
  }
  var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
  try {
    if (!raw) throw new Error('empty payload');
    var data = JSON.parse(raw);
    var branch = data.branch;
    if (!TABS[branch]) throw new Error('unknown branch: ' + branch);

    var sheet = getOrCreateSheet_(branch);
    var cols = COLUMNS[branch];
    var a = data.answers || {};

    var row = [
      new Date(),
      data.firstName || '',
      data.lastName  || '',
      data.email     || '',
      data.city      || '',
      data.role      || ''
    ];
    for (var i = 0; i < cols.keys.length; i++) {
      var v = a[cols.keys[i]];
      row.push(v == null ? '' : v);
    }
    sheet.appendRow(row);
    return json_({ ok: true });

  } catch (err) {
    logError_('doPost', err && err.message ? err.message : String(err),
              err && err.stack ? err.stack : '', raw);
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Live headcount across all four tabs (use if you re-enable the counter on the site).
function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var count = 0;
  for (var b in TABS) {
    var sheet = ss.getSheetByName(TABS[b]);
    if (sheet) count += Math.max(0, sheet.getLastRow() - 1); // minus header row
  }
  return json_({ count: count });
}

function getOrCreateSheet_(branch) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = TABS[branch];
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    ss.setSpreadsheetTimeZone('America/Los_Angeles');
    sheet = ss.insertSheet(name);
    sheet.appendRow(COLUMNS[branch].headers);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('M/d/yyyy h:mm:ss AM/PM');
  }
  return sheet;
}

function logError_(source, message, stack, payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Errors');
    if (!sheet) {
      sheet = ss.insertSheet('Errors');
      sheet.appendRow(['Timestamp','Source','Message','Stack','Payload']);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date(), source, message, stack, payload]);
  } catch (ignore) {}
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run once (optional): pre-create the four branch tabs + Errors tab with headers.
function setupSheets() {
  SpreadsheetApp.getActiveSpreadsheet().setSpreadsheetTimeZone('America/Los_Angeles');
  for (var b in TABS) getOrCreateSheet_(b);
  logError_('setup', 'tabs created', '', ''); // also ensures Errors tab exists
}

// Quick self-test you can run from the editor (writes one Fashion test row).
function _selfTest() {
  doPost({ postData: { contents: JSON.stringify({
    branch: 'fashion',
    role: 'Fashion Industry Professional (Designer, Stylist, Model, Creative)',
    firstName: 'Apps', lastName: 'Script', email: 'test@example.com', city: 'Portland',
    answers: { q1: 'Model / Talent', q2: 'Funding / Not enough paid opportunity',
               q3: 'Yes, I would collaborate on styling/staging for a fee',
               q4: 'Moderately important (I donate occasionally)',
               q5: 'No, not my focus', q6: 'Other', q6_other: 'just testing' }
  })}});
}
