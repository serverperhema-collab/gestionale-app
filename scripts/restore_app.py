import sqlite3
import sys

db_path = 'C:/Users/maggi/.gemini/antigravity/conversations/906381d9-103f-414d-b73f-6771502cf4d6.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT step_payload FROM steps WHERE idx=5497")
row = cursor.fetchone()
code = row[0]
conn.close()

# Decompress code
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

code_str = None

def parse_message(msg_data):
    global code_str
    if code_str:
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
                        try:
                            code_str = chunk.decode("utf-8")
                            return
                        except Exception as e:
                            pass
                try:
                    parse_message(chunk)
                except Exception as e:
                    pass
                pos += length
            elif wire_type == 5:
                pos += 4
            else:
                pos += 1
        except Exception as e:
            pos += 1

parse_message(code)

file_path = 'gestionale_ricerca_locale/frontend/src/App.jsx'
with open(file_path, 'wb') as f:
    f.write(code_str.encode('utf-8'))

print("Restored original clean App.jsx.")
