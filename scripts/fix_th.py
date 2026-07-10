file_path = 'gestionale_ricerca_locale/frontend/src/App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's inspect the lines around 4995 to 5005
lines = content.split('\n')
for idx, line in enumerate(lines[4990:5010]):
    real_idx = idx + 4990
    if 'width: \'150px\'' in line:
        print(f"Found at line {real_idx+1}: {line}")
        # Replace the next two lines to close the tags
        lines[real_idx] = "                                    <th style={{ width: '150px' }}>Attività</th>"
        lines[real_idx+1] = "                                    <th>Dettagli Operazione</th>"
        print("Fixed th tags!")
        break

content = '\n'.join(lines)
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished fix_th.py.")
