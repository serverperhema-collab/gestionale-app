import re

file_path = 'gestionale_ricerca_locale/frontend/src/App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's extract the interview modal body block
# Marker: {/* 12. DIALOGO GESTIONE COLLOQUIO IN MODALE ELEGANTE (QUASI TUTTO SCHERMO) */}
start_marker = "{/* 12. DIALOGO GESTIONE COLLOQUIO IN MODALE ELEGANTE (QUASI TUTTO SCHERMO) */}"
start_idx = content.find(start_marker)
trial_marker = "{/* 13. DIALOGO GESTIONE PROVA IN MODALE ELEGANTE (QUASI TUTTO SCHERMO) */}"
trial_idx = content.find(trial_marker)

interview_modal_content = content[start_idx:trial_idx]
print("Interview modal content length:", len(interview_modal_content))

# Let's extract trial modal body block
end_marker = "{/* 9. SUBJECT TIMELINE LOG MODAL */}"
end_idx = content.find(end_marker)
trial_modal_content = content[trial_idx:end_idx]
print("Trial modal content length:", len(trial_modal_content))

# Let's find all word tokens starting with "set" or variables like "interview", "trial", "appuntamenti", "note" in the modals
# and check if they exist in the top section of App.jsx (where states are defined, lines 1 to 1000)
top_content = content[:1500]

# Let's check for some common states that might cause crashes:
# e.g., setSelectedInterviewForManagement, setSelectedTrialForManagement, etc.
# Let's print all matches of state setters used in these modals:
setters_in_inv = set(re.findall(r'set[A-Z][a-zA-Z0-9_]*', interview_modal_content))
setters_in_tr = set(re.findall(r'set[A-Z][a-zA-Z0-9_]*', trial_modal_content))

print("\nSetters in Interview Modal:", setters_in_inv)
print("Setters in Trial Modal:", setters_in_tr)

# Check if each of these setters is defined in top_content:
for s in setters_in_inv | setters_in_tr:
    if f"const [{s[3].lower() + s[4:]}, {s}]" not in content and f"function {s}" not in content:
        # Check if the setter exists at all in the file
        count = content.count(s)
        print(f"Setter {s}: total occurrences in file: {count}")
        if count <= 2:
            print(f"   => WARNING: {s} might be undefined or missing!")

# Also check for variables that are used as values but might be undefined
# Let's search for "undefined" errors by running a Node command to load App.jsx and inspect it!
