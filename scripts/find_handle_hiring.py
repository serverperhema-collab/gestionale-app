with open("gestionale_ricerca_locale/frontend/src/App.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "handleOpenHiringForm" in line:
        print(f"Line {idx+1:4}: {line.strip()}")
        # Print surrounding lines
        print("\n--- SURROUNDING ---")
        for k in range(max(0, idx - 5), min(len(lines), idx + 25)):
            print(f"  {k+1:4}: {lines[k]}", end="")
        print("-" * 50)
