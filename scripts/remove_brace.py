file_path = 'gestionale_ricerca_locale/frontend/src/App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific block of text
target_str = """{/* TAB 2: CANDIDATI */}
                {
                {/* TAB 1: PIPELINE CANDIDATI */}"""

# We can search for the exact lines around 5038-5040
content = content.replace(target_str, "{/* TAB 1: PIPELINE CANDIDATI */}")

# Let's search if the brace is still there or if the replace succeeded
if "{/* TAB 2: CANDIDATI */}" in content:
    content = content.replace("{/* TAB 2: CANDIDATI */}\n                {\n                {/* TAB 1: PIPELINE CANDIDATI */}", "{/* TAB 1: PIPELINE CANDIDATI */}")
    content = content.replace("{/* TAB 2: CANDIDATI */}\n{\n                {/* TAB 1: PIPELINE CANDIDATI */}", "{/* TAB 1: PIPELINE CANDIDATI */}")

# Let's just do a clean line-by-line replacement using indices or split
lines = content.split('\n')
for idx, line in enumerate(lines[:5100]):
    if 'TAB 2: CANDIDATI' in line:
        print(f"Found TAB 2: CANDIDATI at line {idx+1}")
        # Let's print subsequent lines
        print("Line + 1:", lines[idx+1])
        print("Line + 2:", lines[idx+2])
        if lines[idx+1].strip() == '{':
            # Remove the brace line
            lines.pop(idx+1)
            print("Removed stray brace!")
            # Also remove the TAB 2 line since we don't need it
            lines.pop(idx)
            print("Removed TAB 2 comment!")
            break

content = '\n'.join(lines)
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished remove_brace.py.")
