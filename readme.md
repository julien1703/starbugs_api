# Constellarium API

Constellarium API ist das Backend der Constellarium-Webanwendung, die Sternzeichen und ihre Konstellationen visualisiert. Diese API filtert und stellt Sternendaten aus einer MongoDB-Datenbank bereit und generiert Erklärtexte zu den Sternzeichen mithilfe einer OpenAI-API.

## Funktionen

- **Datenbereitstellung:** Liefert detaillierte Informationen zu Sternzeichen und Sternkonstellationen.
- **Textgenerierung:** Erzeugt erklärende Texte zu Sternzeichen über eine OpenAI-API.
- **Datenbank:** Verwendet MongoDB zur Speicherung und Verwaltung der Sternendaten.
- **Docker:** Ermöglicht den Einsatz von Docker-Containern für eine verteilte Systemarchitektur.

## Installation

Folgen Sie diesen Schritten, um die API lokal zu installieren und auszuführen:

1. Klonen Sie das Repository:
   ```bash
   git clone https://github.com/julien1703/starbugs_api.git
2. Wechseln Sie in das Projektverzeichnis:
    cd starbugs_api
3. Installieren Sie die Abhängigkeiten:
    npm install
4. Erstellen Sie eine .env-Datei basierend auf dem .env.example-Template und fügen Sie die erforderlichen Konfigurationswerte hinzu.
5. Starten Sie die Anwendung:
    node index.js

## API-Endpunkte
- GET /api/constellations: Liefert eine Liste aller Sternzeichen und ihrer Konstellationen.
- GET /api/constellations/:id: Liefert detaillierte Informationen zu einem bestimmten Sternzeichen.
- POST /api/generate-text: Generiert einen erklärenden Text für ein Sternzeichen mithilfe der OpenAI-API.

## Technologie-Stack
- Node.js: Laufzeitumgebung für serverseitiges JavaScript.
- Express.js: Webframework für Node.js.
- MongoDB: NoSQL-Datenbank zur Speicherung von Sternendaten.
- Docker: Containerisierung für verteilte Anwendungen.
