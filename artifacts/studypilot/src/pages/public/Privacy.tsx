import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-serif mb-8">Datenschutzerklärung</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="lead">Zuletzt aktualisiert: 15. Oktober 2023</p>
        <p>Bei StudyPilot nehmen wir deinen Datenschutz ernst. Diese Richtlinie beschreibt, welche personenbezogenen Daten wir sammeln und wie wir sie verwenden.</p>
        
        <h3>Datenerfassung</h3>
        <p>Wir erfassen Informationen, die du uns direkt zur Verfügung stellst, wenn du ein Konto erstellst, Lernmaterialien hochlädst oder mit uns kommunizierst. Dies kann deinen Namen, deine E-Mail-Adresse, Schulinformationen und den Inhalt der von dir zum Lernen hochgeladenen Dokumente umfassen.</p>
        
        <h3>Wie wir deine Informationen verwenden</h3>
        <p>Wir verwenden die erfassten Informationen, um:</p>
        <ul>
          <li>Unsere Dienste bereitzustellen, zu pflegen und zu verbessern</li>
          <li>KI-gestützte Lernmaterialien aus deinen Dokumenten zu generieren</li>
          <li>Deine Lernerfahrung zu personalisieren</li>
          <li>Dir technische Hinweise, Updates, Sicherheitswarnungen und Support-Nachrichten zu senden</li>
        </ul>

        <h3>Datensicherheit</h3>
        <p>Wir setzen angemessene technische und organisatorische Maßnahmen ein, um die Sicherheit deiner personenbezogenen Daten zu schützen. Bitte beachte jedoch, dass keine Methode der Übertragung über das Internet oder Methode der elektronischen Speicherung zu 100 % sicher ist.</p>
        
      </div>
    </div>
  );
}
