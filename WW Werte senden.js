on({id: '0_userdata.0.Waterkotte.Autostatus_WW', change: "ne"}, function (obj) {
    let status = obj.state.val;
    let sollTemp = 50; // Default

    switch(status) {
        case 1: sollTemp = 45; break;
        case 2: sollTemp = 50; break;
        case 3: sollTemp = 55; break;
        default: return; // ungültig
    }

    // Lesescript stoppen
    stopScript('script.js.Skripte.Waterkotte.Abfrage_Rohdaten');
	console.log('Lesescript gestopt');

    setTimeout(() => {
        // Befehl auswählen
        let buffer = null;
        if (sollTemp === 45) {
            buffer = Buffer.from([0x10,0x02,0x01,0x13,0x01,0x3b,0x00,0x00,0x34,0x42,0x10,0x03,0xC8,0x72]);
        } else if (sollTemp === 50) {
            buffer = Buffer.from([0x10,0x02,0x01,0x13,0x01,0x3b,0x00,0x00,0x48,0x42,0x10,0x03,0xC0,0x74]);
        } else if (sollTemp === 55) {
            buffer = Buffer.from([0x10,0x02,0x01,0x13,0x01,0x3b,0x00,0x00,0x5C,0x42,0x10,0x03,0xB8,0x74]);
        }

        const net = require('net');
        const client = new net.Socket();

        client.connect(4001, '192.168.3.241', function() {
            console.log('Verbunden mit Moxa');
            client.write(buffer);
            console.log('Befehl gesendet: '+ buffer.toString('hex'));
        });

        client.once('data', function(data) {
            console.log('Antwort: '+ data.toString('hex'));

            // Lesescript sofort wieder starten
            startScript('script.js.Skripte.Waterkotte.Abfrage_Rohdaten');
            console.log('Lesescript wieder gestartet');

            client.destroy();

            // Erfolgskontrolle nach 65 Sekunden
            setTimeout(() => {
                getState('0_userdata.0.Waterkotte.Daten.Temp_WW_Soll', function(err, state) {
                    if (err || !state) {
                        console.error('level error: Temp_WW_Soll konnte nicht gelesen werden');
                        setState('0_userdata.0.Waterkotte.Abfrage_Error', true);
                        return;
                    }

                    if (state.val !== sollTemp) {
                        setState('0_userdata.0.Waterkotte.Abfrage_Error', true);
                        setState('0_userdata.0.Waterkotte.Sendelog', ('Abfrage Error: Soll:'+ sollTemp +'°'+' Ist:'+ state.val+'°'));
                        console.error('Abfrage Error: Soll:'+ sollTemp +'°'+' Ist:'+ state.val+'°');
                    } else {
                        setState('0_userdata.0.Waterkotte.Abfrage_Error', false);
                        setState('0_userdata.0.Waterkotte.Sendelog', ('Moxa Sendebefehl erfolgreich umgesetzt: WW-Soll='+ sollTemp+'°'));
                        console.log('Moxa Sendebefehl erfolgreich umgesetzt: WW-Soll='+ sollTemp+'°')
                    }
                });
            }, 65000);
        });

        client.on('error', function(err) {
            console.error('Moxa Sende error: '+ err.message);
            client.destroy();
            // Lesescript wieder starten, auch bei Fehler
            startScript('script.js.Skripte.Waterkotte.Abfrage_Rohdaten');
        });

    }, 2000);
});