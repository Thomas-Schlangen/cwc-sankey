# Projektstatus

## CWC-Sankey

Status: **funktioniert einwandfrei**, vom Nutzer in der echten WinCC Unified
V21 Runtime (Windows) getestet und bestätigt.

Zwei getrennte, beide verifizierte Erkenntnisse aus diesem Test (gelten
vermutlich für jedes CWC, nicht nur Sankey):

1. **Zugriffspfad:** `Screen.Items(...).X = wert` (ohne `.Properties.`)
   wirft in WinCC Unified einen Fehler — und zwar bei **jeder** Property,
   auch beim einfachen `string`-Property `Title`. Erforderlich ist immer
   `Screen.Items(...).Properties.X = wert`.
2. **Keine nativen Arrays:** Selbst mit korrektem `.Properties.`-Zugriff
   führte das Zuweisen eines JS-Arrays an eine als Array-of-Object
   deklarierte Property (`Nodes`/`Links`) zu `PROPERTY_SET Invoke failed`
   (COM-Fehler `0x80000005`), unabhängig von Array-Größe/Inhalt.

Fix (Commit `c47f6fd`): `Nodes`/`Links` im Manifest auf Typ `string`
umgestellt, Daten werden per `JSON.stringify(...)` übertragen und im
Control (`control/sankey.js`) per `JSON.parse()` wieder in Arrays
umgewandelt; alle Property-Zuweisungen im Beispielcode nutzen durchgängig
`.Properties.X`. Details siehe [README.md](README.md).
