file_path = 'gestionale_ricerca_locale/frontend/src/App.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """                      </div>
                    )
                  </>
                )}"""

replacement = """                      </div>
                    )}
                  </>
                )}"""

if target in content:
    content = content.replace(target, replacement)
    print("Brace replaced successfully!")
else:
    # Alternative
    content = content.replace(")\n                  </>\n                )}", ")}\n                  </>\n                )}")
    print("Alternative brace replaced!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished add_brace.py.")
