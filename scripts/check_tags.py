import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("gestionale_ricerca_locale/frontend/src/App.jsx", "r", encoding="utf-8") as f:
    text = f.read()

# Let's slice the dati tab content
start_idx = text.find("{activeTab === 'dati' && (")
end_idx = text.find("{/* TAB 1: PIPELINE CANDIDATI */}")

tab_content = text[start_idx:end_idx]
print("Tab content size:", len(tab_content))

# Let's do a simple count of standard HTML tags
tags = ['div', 'form', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'button', 'label', 'select', 'textarea', 'input', 'strong', 'span']

for tag in tags:
    open_count = tab_content.count(f"<{tag}")
    close_count = tab_content.count(f"</{tag}>")
    print(f"Tag {tag:8}: opened {open_count:3}, closed {close_count:3} -> diff {open_count - close_count}")
