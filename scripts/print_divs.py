with open("gestionale_ricerca_locale/frontend/src/App.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx in range(7568, 7760):
    line = lines[idx]
    if "<div" in line or "</div" in line:
        print(f"{idx+1:4}: {line.rstrip()}")
