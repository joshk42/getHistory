const BrowserHistory = require('node-browser-history');
const Json2csvParser = require('json2csv').Parser;
const fsu = require('fsu');

const fields = [{  //Define custom column names for CSV conversion
    label: 'Webpage Title',
    value: 'title'
}, {
    label: 'Date & Time Accessed',
    value: 'utc_time'
}, {
    label: 'URL',
    value: 'url'
}, {
    label: 'Browser Used',
    value: 'browser'
}];

/**
 * Gets the history for all browsers.
 * Returns an array of browser records.
 * @returns {Promise<array>}
 */
function getHistory() {
    const maxHistoryLength = 50 * 365 * 24 * 60;// minutes

    BrowserHistory.getAllHistory(maxHistoryLength).then(function (history) {
        //Populate CSV from JSON using custom field names.
        try {
            const parser = new Json2csvParser({fields: fields, delimiter: '\t', quote: ''}); //Must specify delimiter else "," is used, thus breaking column naming.
            history = history.sort(function (a, b) {
                return new Date(a.utc_time) - new Date(b.utc_time);
            });

            const csv = parser.parse(history);
            writeToDisk(csv);
        } catch (err) {
            console.error(err);
        }
    })
}

//Write output file to disk
function writeToDisk(dataToWrite) {
    fsu.writeFileUnique(__dirname + '/fullHistory{_###}.csv', dataToWrite, function (err) { //Unique Naming Scheme. Will not overwrite previous file, will auto-increment filename
        if (err) {
            console.log('An error has occurred - file was either not saved or a corrupted file has been saved.');
        } else {
            console.log('File Output Complete!');
        }
    });
}

module.exports = {
    "getHistory": getHistory
};