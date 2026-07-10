import sys

file_path = 'gestionale_ricerca_locale/frontend/src/App.jsx'
with open(file_path, 'r', encoding='utf-8', newline='') as f:
    content = f.read()

# 1. Locate DATI ANNUNCIO tab start
dati_tab_start = content.find("{/* TAB 1: DATI ANNUNCIO */}")
if dati_tab_start == -1:
    print("Could not find TAB 1: DATI ANNUNCIO marker!")
    sys.exit(1)

# 2. Find {!selectedAnnuncio ? (
ternary_start_key = "{!selectedAnnuncio ? ("
ternary_start_idx = content.find(ternary_start_key, dati_tab_start)
if ternary_start_idx == -1:
    print("Could not find ternary start!")
    sys.exit(1)

# 3. Find ) : (
else_idx = content.find(") : (", ternary_start_idx)
if else_idx == -1:
    print("Could not find else branch!")
    sys.exit(1)

# 4. Find the end pattern of the second branch
# Let's search for the marker first
end_marker = "{/* TAB 1: PIPELINE CANDIDATI */}"
end_marker_idx = content.find(end_marker, else_idx)
if end_marker_idx == -1:
    print("Could not find TAB 1: PIPELINE CANDIDATI marker!")
    sys.exit(1)

# We search backwards from the end_marker_idx to find the end of the second branch
# The second branch ends before </>\n                )}
# Let's look for "</>\r\n                )}" or "</>\n                )}" backwards from the marker
# Since we opened with newline='', carriage returns are preserved as \r\n
search_area = content[else_idx : end_marker_idx]
end_pat = ")\r\n                  </>\r\n                )}"
end_pos_in_area = search_area.rfind(end_pat)
if end_pos_in_area == -1:
    end_pat_n = ")\n                  </>\n                )}"
    end_pos_in_area = search_area.rfind(end_pat_n)

if end_pos_in_area == -1:
    # Try more relaxed search
    end_pat_relaxed = "</>\r\n                )}"
    end_pos_in_area = search_area.rfind(end_pat_relaxed)
    if end_pos_in_area == -1:
        end_pat_relaxed_n = "</>\n                )}"
        end_pos_in_area = search_area.rfind(end_pat_relaxed_n)
        
if end_pos_in_area == -1:
    print("Could not find closing pattern of the second branch!")
    sys.exit(1)

# Convert end_pos_in_area to absolute position
end_idx = else_idx + end_pos_in_area
print("Found end_idx:", end_idx)

# Extract first branch content (list of ads)
list_branch = content[ternary_start_idx + len(ternary_start_key) : else_idx].strip()

# Extract second branch content (management form and report)
# We want to exclude the closing brackets of the ternary from the management_branch
# So we slice from else_idx + 5 to end_idx (before the closing brackets)
management_branch = content[else_idx + 5 : end_idx].strip()

# Clean up trailing closing elements from management_branch if any
if management_branch.endswith(")"):
    management_branch = management_branch[:-1].strip()

print("List branch size:", len(list_branch))
print("Management branch size:", len(management_branch))

# 5. Form the new Tab 1 content without ternary
new_tab1 = """                {/* TAB 1: DATI ANNUNCIO */}
                {activeTab === 'dati' && (
                  <>
                    """ + list_branch + """
                  </>
                )}"""

# Replace the entire old Tab 1 block in content
# Old Tab 1 starts from DATI ANNUNCIO marker down to the end of the Tab 1 panel
# We find where activeTab === 'dati' ends by searching for the closing marker
tab_end_pos = content.find("</>\r\n                )}", else_idx)
if tab_end_pos == -1:
    tab_end_pos = content.find("</>\n                )}", else_idx)

if tab_end_pos == -1:
    print("Could not find tab closing index!")
    sys.exit(1)

old_full_tab1 = content[dati_tab_start : tab_end_pos + len("</>\r\n                )}")]
content = content.replace(old_full_tab1, new_tab1)

# 6. Inject the new modal overlay above the timeline modal
timeline_marker = "{/* 9. SUBJECT TIMELINE LOG MODAL */}"
timeline_idx = content.find(timeline_marker)

if timeline_idx != -1:
    annuncio_modal_code = """      {/* 14. DIALOGO GESTIONE ANNUNCIO IN MODALE ELEGANTE (QUASI TUTTO SCHERMO) */}
      {selectedAnnuncio && (
        <div className="modal-overlay" style={{ zIndex: 1080 }}>
          <div className="modal-container" style={{ maxWidth: '1000px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>⚙️ GESTIONE ANNUNCIO DI LAVORO ({selectedAnnuncio.id})</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedAnnuncio(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              """ + management_branch + """
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedAnnuncio(null)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      """
    content = content[:timeline_idx] + annuncio_modal_code + content[timeline_idx:]
    print("Annuncio modal injected successfully!")
    
    with open(file_path, 'w', encoding='utf-8', newline='') as f:
        f.write(content)
    print("App.jsx successfully patched with newline safety!")
else:
    print("Could not find timeline marker!")
    sys.exit(1)
