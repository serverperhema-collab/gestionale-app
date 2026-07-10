with open("gestionale_ricerca_locale/frontend/src/App.jsx", "rb") as f:
    data = f.read()

# Replace \r\r\n with \r\n or \n
print("Original size:", len(data))
cleaned_data = data.replace(b"\r\r\n", b"\n")
cleaned_data = cleaned_data.replace(b"\r\n", b"\n")

with open("gestionale_ricerca_locale/frontend/src/App.jsx", "wb") as out:
    out.write(cleaned_data)

print("Cleaned size:", len(cleaned_data))
