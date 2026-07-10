with open("gestionale_ricerca_locale/frontend/src/App.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Extract lines from 7570 to 7760
modal_content = "".join(lines[7568:7758])

open_divs = modal_content.count("<div")
close_divs = modal_content.count("</div>")
print("Opened divs:", open_divs)
print("Closed divs:", close_divs)
print("Difference (opened - closed):", open_divs - close_divs)

# Let's count open/close brackets of other elements
for tag in ['form', 'table', 'thead', 'tbody', 'tr', 'td']:
    open_count = modal_content.count(f"<{tag}")
    close_count = modal_content.count(f"</{tag}>")
    print(f"Tag {tag:8}: opened {open_count:3}, closed {close_count:3} -> diff {open_count - close_count}")
