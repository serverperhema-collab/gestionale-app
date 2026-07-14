
(async () => {
  try {
    const res = await fetch('http://localhost:3002/api/ricerche');
    const json = await res.json();
    if (!json.success) { console.log('Failed to fetch list:', json); return; }
    console.log('Found', json.data.length, 'ricerche');
    
    for (const r of json.data) {
       const dres = await fetch('http://localhost:3002/api/ricerche/' + r.id);
       const djson = await dres.json();
       if (!djson.success) {
          console.log('FAIL on', r.id, djson);
       } else {
          console.log('OK', r.id);
       }
    }
  } catch(e) {
    console.log('Error:', e);
  }
})();
