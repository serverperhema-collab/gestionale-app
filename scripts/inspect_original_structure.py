import sqlite3

db_path = 'C:/Users/maggi/.gemini/antigravity/conversations/906381d9-103f-414d-b73f-6771502cf4d6.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get step 5298 payload
cursor.execute("SELECT step_payload FROM steps WHERE idx=5298")
row = cursor.fetchone()
data = row[0]
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

found_code = None

def parse_message(msg_data):
    global found_code
    if found_code:
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
                        found_code = chunk.decode("utf-8")
                        return
                parse_message(chunk)
                pos += length
            elif wire_type == 5:
                pos += 4
            else:
                break
        except Exception as e:
            break

parse_message(data)

if found_code:
    print("Found clean step 5298 code!")
    
    # Print lines of Tab 3
    colloquio_idx = found_code.find("TAB 3: INSERISCI COLLOQUIO")
    prova_idx = found_code.find("TAB 4: PROVE")
    assunzione_idx = found_code.find("activeTab === 'assunzione'")
    
    print("\n--- ORIGINAL TAB 3 RANGE ---")
    if colloquio_idx != -1 and prova_idx != -1:
        print(found_code[colloquio_idx : colloquio_idx + 600])
    
    print("\n--- ORIGINAL TAB 4 RANGE ---")
    if prova_idx != -1 and assunzione_idx != -1:
        print(found_code[prova_idx : prova_idx + 600])
else:
    print("Failed to find step 5298 code.")
