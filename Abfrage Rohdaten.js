createState('0_userdata.0.Waterkotte.Abfrage_Rohdaten', '');
createState('0_userdata.0.Waterkotte.Abfrage_Error', false);

const net = require('net');

const buffer1 = Buffer.from([
    0x10, 0x02, 0x01, 0x15,
    0x00, 0x00, 0x00, 0xf3,
    0x10, 0x03, 0x7c, 0x32
]);

const buffer2 = Buffer.from([
    0x10, 0x02, 0x01, 0x15,
    0x00, 0xf3, 0x00, 0x83,
    0x10, 0x03, 0xf1, 0xed
]);

const REQUEST_INTERVAL = 15000;

let stopped = false;
let timeoutHandle = null;

// 🔹 Funktion für EINEN Request
function sendRequest(buffer, callback) {
    const client = new net.Socket();

    client.connect(4001, '192.168.3.241', function() {
        client.write(buffer);
    });

    client.once('data', function(data) {
        const hex = data.toString('hex');
        client.destroy();
        callback(null, hex);
    });

    client.on('error', function(err) {
        client.destroy();
        callback(err, null);
    });
}

// 🔹 Hauptlogik (2 getrennte Verbindungen!)
function requestWaterkotteData() {
    if (stopped) return;

    console.log('--- Neue Abfrage ---');

    // Anfrage 1
    sendRequest(buffer1, function(err1, res1) {

        if (err1) {
            console.log('Fehler Anfrage 1:', err1.message);
            setState('0_userdata.0.Waterkotte.Abfrage_Error', true);
            scheduleNext();
            return;
        }

        console.log('Antwort 1: '+ res1);

        // kleine Pause wichtig!
        setTimeout(() => {

            // Anfrage 2 (NEUE Verbindung!)
            sendRequest(buffer2, function(err2, res2) {

                if (err2) {
                    console.log('Fehler Anfrage 2: '+ err2.message);
                    setState('0_userdata.0.Waterkotte.Abfrage_Error', true);
                    scheduleNext();
                    return;
                }

				// Antwort 2
					console.log('Antwort 2 (raw)  : '+ res2);

					// Header entfernen (erste 9 Bytes = 18 Zeichen)
					const res2_clean = res2.substring(18);

				console.log('Antwort 2 (clean): '+ res2_clean);

					// Kombinieren
					const combined = res1 + res2_clean;

				setState('0_userdata.0.Waterkotte.Abfrage_Rohdaten', combined, true);
                set// Waterkotte Abfrage per TCP direkt an Moxa DE-311 (stabil & robust)

createState('0_userdata.0.Waterkotte.Abfrage_Rohdaten', '');
createState('0_userdata.0.Waterkotte.Abfrage_Error', false);

const net = require('net');

// Anfrage 1
const buffer1 = Buffer.from([
    0x10, 0x02, 0x01, 0x15,
    0x00, 0x00, 0x00, 0xf3,
    0x10, 0x03, 0x7c, 0x32
]);

// Anfrage 2
const buffer2 = Buffer.from([
    0x10, 0x02, 0x01, 0x15,
    0x00, 0xf3, 0x00, 0x83,
    0x10, 0x03, 0xf1, 0xed
]);

const REQUEST_INTERVAL = 60000;

let stopped = false;
let timeoutHandle = null;

// 🔹 TCP Request Funktion mit Retry + Timeout
function sendRequest(buffer, callback, retry = 0) {
    const client = new net.Socket();

    let finished = false;

    // ⏱ Timeout gegen „Hängen“
    const timeout = setTimeout(() => {
        if (!finished) {
            finished = true;
            console.log('[Moxa] Timeout');
            client.destroy();
            callback(new Error('Timeout'), null);
        }
    }, 5000);

    client.connect(4001, '192.168.3.241', function() {
        client.write(buffer);
    });

    client.once('data', function(data) {
        if (finished) return;
        finished = true;

        clearTimeout(timeout);

        const hex = data.toString('hex');
        client.destroy();
        callback(null, hex);
    });

    client.on('error', function(err) {
        if (finished) return;
        finished = true;

        clearTimeout(timeout);

        client.destroy();

        // Retry bei ECONNREFUSED
        if (err.code === 'ECONNREFUSED' && retry < 3) {
            console.log('[Moxa] Retry Verbindung... ' + (retry + 1));
            setTimeout(() => {
                sendRequest(buffer, callback, retry + 1);
            }, 2000);
        } else {
            callback(err, null);
        }
    });
}

// 🔹 Hauptlogik
function requestWaterkotteData() {
    if (stopped) return;

    console.log('[Moxa] --- Neue Abfrage ---');

    // Anfrage 1
    sendRequest(buffer1, function(err1, res1) {

        if (err1) {
            console.log('[Moxa] Fehler Anfrage 1: ' + err1.message);
            setState('0_userdata.0.Waterkotte.Abfrage_Error', true);
            scheduleNext();
            return;
        }

        console.log('[Moxa] Antwort 1: ' + res1);

        // kurze Pause (wichtig!)
        setTimeout(() => {

            // Anfrage 2
            sendRequest(buffer2, function(err2, res2) {

                if (err2) {
                    console.log('[Moxa] Fehler Anfrage 2: ' + err2.message);
                    setState('0_userdata.0.Waterkotte.Abfrage_Error', true);
                    scheduleNext();
                    return;
                }

                console.log('[Moxa] Antwort 2 raw  : ' + res2);

                // 🔹 Header entfernen (erste 9 Bytes = 18 Zeichen)
                const res2_clean = res2.substring(18);

                console.log('[Moxa] Antwort 2 clean: ' + res2_clean);

                // 🔹 Kombinieren
                const combined = res1 + res2_clean;

                setState('0_userdata.0.Waterkotte.Abfrage_Rohdaten', combined, true);
                setState('0_userdata.0.Waterkotte.Abfrage_Error', false);

                scheduleNext();
            });

        }, 500);
    });
}

// 🔹 nächste Abfrage planen
function scheduleNext() {
    if (!stopped) {
        timeoutHandle = setTimeout(requestWaterkotteData, REQUEST_INTERVAL);
    }
}

// 🔹 Start mit Verzögerung (wichtig!)
setTimeout(requestWaterkotteData, 3000);

// 🔹 sauberes Stoppen
onStop(function (callback) {
    stopped = true;

    if (timeoutHandle) {
        clearTimeout(timeoutHandle);
    }

    console.log('[Moxa] Script sauber beendet');
    callback();
}, 2000);State('0_userdata.0.Waterkotte.Abfrage_Error', false);

                scheduleNext();
            });

        }, 500); // etwas mehr Pause für Stabilität
    });
}

function scheduleNext() {
    if (!stopped) {
        timeoutHandle = setTimeout(requestWaterkotteData, REQUEST_INTERVAL);
    }
}

// Start
requestWaterkotteData();

// Stop sauber behandeln
onStop(function (callback) {
    stopped = true;

    if (timeoutHandle) {
        clearTimeout(timeoutHandle);
    }

    console.log('Script sauber beendet');
    callback();
}, 2000);