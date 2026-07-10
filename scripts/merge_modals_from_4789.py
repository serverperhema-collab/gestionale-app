import sqlite3
import sys

db_path = 'C:/Users/maggi/.gemini/antigravity/conversations/906381d9-103f-414d-b73f-6771502cf4d6.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get step 4789 payload
cursor.execute("SELECT step_payload FROM steps WHERE idx=4789")
row_4789 = cursor.fetchone()
data_4789 = row_4789[0]
conn.close()

def read_varint(data, pos):
    val = 0
    shift = 0
    while True:
        b = data[pos]
        val |= (b & 0x7F) << shift
        pos += 1
        if not (b & 0x80):
            break
        shift += 7
    return val, pos

code_4789 = None

def parse_message(msg_data):
    global code_4789
    if code_4789:
        return
        
    pos = 0
    while pos < len(msg_data):
        try:
            tag, pos = read_varint(msg_data, pos)
            field_num = tag >> 3
            wire_type = tag & 0x07
            
            if wire_type == 0:
                _, pos = read_varint(msg_data, pos)
            elif wire_type == 1:
                pos += 8
            elif wire_type == 2:
                length, pos = read_varint(msg_data, pos)
                chunk = msg_data[pos : pos + length]
                if len(chunk) > 300000:
                    if b"import React" in chunk:
                        code_4789 = chunk.decode("utf-8")
                        return
                parse_message(chunk)
                pos += length
            elif wire_type == 5:
                pos += 4
            else:
                break
        except Exception as e:
            break

parse_message(data_4789)

if not code_4789:
    print("Failed to find step 4789 code!")
    sys.exit(1)

print("Found step 4789 code.")

# Extract state2_inv (Interview management form)
colloquio_start = code_4789.find("{/* TAB 3: INSERISCI COLLOQUIO */}")
check_inv = "selectedInterviewForManagement ? ("
check_inv_idx = code_4789.find(check_inv, colloquio_start)
else_inv = ") : ("
else_inv_idx = code_4789.find(else_inv, check_inv_idx)

if check_inv_idx != -1 and else_inv_idx != -1:
    state2_inv = code_4789[check_inv_idx + len(check_inv) : else_inv_idx].strip()
    print("Extracted state2_inv from 4789! Size:", len(state2_inv))
else:
    print("Failed to extract state2_inv!")
    sys.exit(1)

# Extract state2_tr (Trial management form)
prova_start = code_4789.find("{/* TAB 4: PROVE */}")
check_tr = "selectedTrialForManagement ? ("
check_tr_idx = code_4789.find(check_tr, prova_start)
else_tr = ") : ("
else_tr_idx = code_4789.find(else_tr, check_tr_idx)

if check_tr_idx != -1 and else_tr_idx != -1:
    state2_tr = code_4789[check_tr_idx + len(check_tr) : else_tr_idx].strip()
    print("Extracted state2_tr from 4789! Size:", len(state2_tr))
else:
    print("Failed to extract state2_tr!")
    sys.exit(1)

# Read current file on disk
file_path = 'gestionale_ricerca_locale/frontend/src/App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace empty bodies in App.jsx
inv_body_target = """            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              
            </div>"""

# Since both targets are identical, we must replace them precisely using find/slice and specific markers
interview_modal_marker = "{/* 12. DIALOGO GESTIONE COLLOQUIO IN MODALE ELEGANTE (QUASI TUTTO SCHERMO) */}"
interview_idx = content.find(interview_modal_marker)

trial_modal_marker = "{/* 13. DIALOGO GESTIONE PROVA IN MODALE ELEGANTE (QUASI TUTTO SCHERMO) */}"
trial_idx = content.find(trial_modal_marker)

if interview_idx != -1 and trial_idx != -1:
    # Modify interview modal body
    int_body_start = content.find(inv_body_target, interview_idx, trial_idx)
    if int_body_start != -1:
        inv_body_replacement = """            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              """ + state2_inv + """
            </div>"""
        content = content[:int_body_start] + inv_body_replacement + content[int_body_start + len(inv_body_target):]
        print("Merged interview form into modal body!")
    
    # Recalculate trial modal index because content size changed
    trial_idx = content.find(trial_modal_marker)
    tr_body_start = content.find(inv_body_target, trial_idx)
    if tr_body_start != -1:
        tr_body_replacement = """            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              """ + state2_tr + """
            </div>"""
        content = content[:tr_body_start] + tr_body_replacement + content[tr_body_start + len(inv_body_target):]
        print("Merged trial form into modal body!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modal merge complete!")
