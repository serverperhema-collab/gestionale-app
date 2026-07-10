with open("gestionale_ricerca_locale/frontend/src/App.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Locate the modals
start_int = content.find("{/* 12. DIALOGO GESTIONE COLLOQUIO IN MODALE ELEGANTE (QUASI TUTTO SCHERMO) */}")
end_tr = content.find("{/* 9. SUBJECT TIMELINE LOG MODAL */}")

modal_block = content[start_int:end_tr]
print("Modal block size:", len(modal_block))

# Find references to "timeline" that are not "adTimeline", "pipeCandTimeline", or "subjectTimeline"
import re
matches = re.finditer(r'(?<![a-zA-Z0-9_])timeline(?![a-zA-Z0-9_])', modal_block)
for m in matches:
    start_pos = max(0, m.start() - 100)
    end_pos = min(len(modal_block), m.end() + 100)
    print(f"Match found at position {m.start()}:")
    print(repr(modal_block[start_pos:end_pos]))
    print("-" * 50)
