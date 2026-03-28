# :sunny: Wärmepumpe mit iobroker steuern

![status](https://img.shields.io/badge/status-alpha-orange)
![version](https://img.shields.io/badge/version-0.1-orange)
![license](https://img.shields.io/badge/license-Public%20Domain-lightgrey)

Ich nütze eine ältere Wärmepumpe von 2005 die nur einen RS232 Anschluss. Über dieses kann man Werte auslesen und schreiben.
Dieser [thread](https://forum.iobroker.net/topic/11059/script-hilfe-f%C3%BCr-abfrage-serielle-kommunikation-gesucht/161) im iobroker Forum hat mich inspiriert 
meine Wärmepumpe intelligent zu steuern.
Vielen Dank für die Vorarbeit der damaligen Diskutanten!!!
Unterstützt von ChatGPT habe ich die scripte angepasst, korrigiert und ausgebaut.
Die Wärmepumpe liefert nun die Werte in iobroker.
Ich habe eine kleine PV. 
Mit Überschuss wird das EAuto geladen im Sommer. Im Keller stehen 2 HM 1920 AC Batterien.
Wenn das alles voll geladen ist, regele ich nun das Brauchwasser hoch von 50° auf 55° um noch etwas Energie zu speichern. Gesteuert wird dies durch EVCC
Ausserdem senke ich die Temperatur auf 45° wenn mein dynamischer Strompreis sehr teuer ist.



## System
-Hardware
  - Waterkotte Wärmepumpe Ai1 DS 5008.4 Baujahr2005
  - Steuerung Resümat CD4 Version 8126
  - Moxa DE-311 serial to LAN
  - Nullmodemkabel

  
## Changelog



### 0.1 alpha (2026-03-28)

	- initial release


## Todo
Fehler der Adressen korrigieren
  


  
  