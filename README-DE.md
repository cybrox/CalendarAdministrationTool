Calendar Administration Tool - Fachübergreifende Projekte HST/INF Technische Berufsschule Zürich, 5. Semester

Weitere Dokumente wie Pflichtenheft, Zeitplan, Schnittstellendokumentation und Bedienungsanleitung finden sich im .docx Format unter http://goo.gl/KfXqcS

Projektvorschlag
===
Bei dem angestrebten Projekt handelt es sich um einen Serverbasierenden Terminkalender zur Verwaltung und automatischen Auswertung von Aufgaben und Prüfungsterminen so wie den dazugehörigen Noten.
Es handelt sich dabei um eine sog. Webanwendung, welche ohne Installation direkt im Browser ausgeführt werden kann.

Funktionsbeschreibung
===
Die Anwendung basiert auf einem Nutzersystem, welches es ermöglicht mehrere Benutzergruppen mit verschiedenen Rechten zu verwalten.
Man unterscheidet dabei zwischen den normalen Benutzern und den Administratoren, dabei könnte es sich beispielsweise um Lernende und den verantwortlichen Ausbildner eines Betriebes handeln.
Normale Benutzer können in ihrem Kalender Termine erstellen, bearbeiten, kommentieren oder löschen und absolvierten Prüfungsterminen eine Note zuweisen. Benutzer können zusätzlich durch Datumsangaben ein Semester definieren um eine Zusammenfassung aller Noten inklusive grafischer Darstellung dieses Semesters zu erhalten.
Der Administrator kann auf die Terminkalender aller normalen Benutzer zugreifen und kann so die Aktivität des betreffenden Nutzers einfach mitverfolgen. Zudem kann er Termine für einen Benutzer erstellen, kommentieren, bearbeiten oder löschen.

Verwendete Technologien
===
Die Anwendung selbst wird per HTML und CSS dargestellt und per Javascript auf die Datenbankschnittstelle zugreifen, zusätzlich wird für effektiveres Arbeiten mit Javascript das jQuery und das jQuery UI Framework verwendet.
Das System besteht aus einer MySQL Datenbank und einer per PHP verwalteten JSON Schnittstelle auf welche die Anwendung per AJAX zugreifen kann. Dabei wird jedem Nutzer ein Berechtigungsschlüssel (sog. Token) zugeteilt um zu verhindern, dass unerlaubt Daten von anderen Nutzern abgefragt werden können.
Zur Entwicklung werden ausschliesslich das Programm Notepad++ so wie der Google Chrome Browser verwendet. Zusätzlich wird GitHub zur Versionsverwaltung genutzt, um den Entwicklungsablauf einfach nachvollziehbar zu gestalten.

Dokumentation
===
Der Quellcode der gesamten Anwendung wird normgemäss Dateiintern dokumentiert, zudem wird eine externe Dokumentation in Form eines Textdokumentes erstellt. Die Schnittstelle und ihre Funktionen werden ausserdem detailliert extern dokumentiert um eine einfache Erweiterbarkeit zu ermöglichen, so könnte zum Beispiel auch eine Mobile Applikation auf die Schnittstelle zugreifen.


Arbeitseinteilung
===
Es handelt sich bei diesem Projekt um eine persönliche Arbeit, Programmierung, Design, Dokumentation und Prüfung werden vom verantwortlichen Lernenden durchgeführt.

Projektverantwortlicher: Gehring Sven
