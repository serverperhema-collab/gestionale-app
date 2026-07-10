with open("gestionale_ricerca_locale/frontend/src/App.jsx", "rb") as f:
    data = f.read()

print("File size:", len(data))

# Try decoding
try:
    data.decode("utf-8")
    print("Decoded successfully!")
except UnicodeDecodeError as e:
    print("Decode error at index:", e.start)
    print("Surrounding bytes:", data[max(0, e.start - 50) : min(len(data), e.start + 50)])
    
    # We can write a clean UTF-8 file by decoding with errors='ignore' or 'replace'
    clean_text = data.decode("utf-8", errors="ignore")
    with open("gestionale_ricerca_locale/frontend/src/App.jsx", "w", encoding="utf-8") as out:
        out.write(clean_text)
    print("Wrote clean UTF-8 file.")
