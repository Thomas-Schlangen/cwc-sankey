# Projektstatus

## CWC-Sankey

Status: **funktioniert einwandfrei**, vom Nutzer in der echten WinCC Unified
V21 Runtime (Windows) getestet und bestätigt.

- Ursprüngliches Problem: `Nodes`/`Links` als natives Array-of-Object-Property
  gesetzt über `Screen.Items(...).Properties.X = [...]` führte zu
  `PROPERTY_SET Invoke failed` (COM-Fehler `0x80000005`), unabhängig von
  Array-Größe/Inhalt. Nur einfache String-Properties (`Title`) funktionierten.
- Fix (Commit `c47f6fd`): `Nodes`/`Links` im Manifest auf Typ `string`
  umgestellt, Daten werden per `JSON.stringify(...)` übertragen und im
  Control (`control/sankey.js`) per `JSON.parse()` wieder in Arrays
  umgewandelt. Details siehe [README.md](README.md).
