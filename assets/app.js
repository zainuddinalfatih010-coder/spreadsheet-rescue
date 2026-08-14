(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SR_STATE = window.__SR_STATE__ = window.__SR_STATE__ || {report:null,quote:null,intake:null,branding:{client:'',project:'',preparedBy:'Spreadsheet Rescue'}};
  const SR_BUILD='10.0.0';
  window.__SR_BUILD__=SR_BUILD;
  window.__SR_QA__={ready:false,lastError:null};
  addEventListener('error',e=>{window.__SR_QA__.lastError=String(e?.message||'runtime error').slice(0,300)});
  addEventListener('unhandledrejection',e=>{window.__SR_QA__.lastError=String(e?.reason?.message||e?.reason||'unhandled rejection').slice(0,300)});

  const wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));

  // Punchier scroll reveals with natural staggering inside each section.
  const obs = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const siblings = [...(el.parentElement?.querySelectorAll(':scope > .reveal') || [])];
    const idx = Math.max(0, siblings.indexOf(el));
    if (!reduced) el.style.transitionDelay = `${Math.min(idx * 55, 220)}ms`;
    el.classList.add('show');
    obs.unobserve(el);
  }), {threshold:.11, rootMargin:'0px 0px -3% 0px'});
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Hero Rescue Machine — same UI, significantly richer motion.
  const machine = document.querySelector('[data-machine]');
  const run = document.querySelector('[data-run]');
  const status = document.querySelector('[data-machine-status]');
  const mRows = [...machine.querySelectorAll('.data-row')];
  const clean = document.querySelector('[data-r-clean]');
  const review = document.querySelector('[data-r-review]');
  const pass = document.querySelector('[data-r-pass]');
  const originalMachineRows = mRows.map(r => [...r.children].map(c => c.textContent));
  let machineBusy = false;

  function restoreMachine(){
    mRows.forEach((r,i) => {
      [...r.children].forEach((c,j) => c.textContent = originalMachineRows[i][j]);
      r.classList.remove('good','anim-scan');
    });
    clean.textContent='—'; review.textContent='—'; pass.textContent='READY';
    status.textContent='waiting'; status.classList.remove('safe');
    machine.classList.remove('is-running','anim-punch');
  }

  async function runMachine(){
    if(machineBusy) return;
    machineBusy = true;
    restoreMachine();
    void machine.offsetWidth;
    machine.classList.add('is-running','anim-punch');
    status.textContent='scanning';
    pass.textContent='...';

    for(let i=0;i<mRows.length;i++){
      mRows[i].classList.remove('anim-scan'); void mRows[i].offsetWidth; mRows[i].classList.add('anim-scan');
      await wait(120);
    }

    await wait(80);
    // Animate first two provable rows into canonical values.
    const canonical = [
      ['2026-08-12','Kopi Pagi 200g','28,000','clean'],
      ['2026-08-12','Mi Gurih Ayam','3,500','clean']
    ];
    for(let i=0;i<2;i++){
      if(!reduced) await mRows[i].animate([
        {opacity:1,transform:'translateX(0) scale(1)'},
        {opacity:.22,transform:'translateX(-7px) scale(.985)'},
        {opacity:1,transform:'translateX(0) scale(1)'}
      ],{duration:360,easing:'cubic-bezier(.2,.8,.2,1)'}).finished;
      canonical[i].forEach((v,j)=>mRows[i].children[j].textContent=v);
      mRows[i].classList.add('good');
    }

    await wait(130);
    clean.textContent='332';
    if(!reduced) clean.animate([{transform:'scale(.65)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:430,easing:'cubic-bezier(.2,.8,.2,1)'});
    await wait(130);
    review.textContent='116';
    if(!reduced) review.animate([{transform:'scale(.65)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:430,easing:'cubic-bezier(.2,.8,.2,1)'});
    await wait(180);
    pass.textContent='PASS'; status.textContent='reconciled'; status.classList.add('safe');
    if(!reduced) pass.animate([{transform:'scale(.7) rotate(-3deg)'},{transform:'scale(1.2) rotate(1deg)'},{transform:'scale(1)'}],{duration:560,easing:'cubic-bezier(.2,.8,.2,1)'});
    machineBusy = false;
  }
  run.addEventListener('click', runMachine);

  // Auto-play exactly once when the machine first becomes visible.
  if(!reduced){
    const machineObs = new IntersectionObserver(entries => entries.forEach(async e => {
      if(!e.isIntersecting) return;
      machineObs.disconnect();
      await wait(520);
      runMachine();
    }), {threshold:.5});
    machineObs.observe(machine);
  }

  // Interactive demo — same four tabs/data, transitions now communicate each state.
  const buttons = [...document.querySelectorAll('.stage-btn[data-stage]')];
  const rows = [...document.querySelectorAll('.demo-r')];
  const revC = document.querySelector('[data-review="c"]');
  const revD = document.querySelector('[data-review="d"]');
  const eqClean = document.querySelector('[data-eq-clean]');
  const eqExc = document.querySelector('[data-eq-exc]');
  const eqStatus = document.querySelector('[data-eq-status]');
  const eqPills = [...document.querySelectorAll('.eq-pill')];

  const raw = [
    ['12/08/26','kopi  PAGI 200g','Rp28.000'],
    ['Aug 12 2026','MI GURIH AYAM','3,500'],
    ['31/02/2026','Wafer Gembira','Rp??'],
    ['2026-08-14','Mi Gurih','3,800']
  ];
  const normalized = [
    ['2026-08-12','Kopi Pagi 200g','28,000'],
    ['2026-08-12','Mi Gurih Ayam','3,500'],
    ['31/02/2026','Wafer Gembira','Rp??'],
    ['2026-08-14','Mi Gurih','3,800']
  ];

  async function pulseRow(row, delay=0){
    await wait(delay);
    row.classList.remove('anim-change'); void row.offsetWidth; row.classList.add('anim-change');
  }

  function resetDemoBase(n){
    buttons.forEach((b,i)=>b.classList.toggle('active',i===n));
    rows.forEach((r,i)=>{
      const values = n>=1 ? normalized[i] : raw[i];
      r.querySelector('[data-date]').textContent=values[0];
      r.querySelector('[data-prod]').textContent=values[1];
      r.querySelector('[data-amt]').textContent=values[2];
      r.classList.remove('cleaned','muted','anim-change');
      r.querySelector('[data-state]').textContent='raw';
    });
    revC.classList.add('hidden'); revD.classList.add('hidden');
    revC.classList.remove('anim-in'); revD.classList.remove('anim-in');
    eqClean.textContent='—'; eqExc.textContent='—'; eqStatus.textContent='PENDING'; eqStatus.classList.remove('pass','anim-pass');
    eqPills.forEach(p=>p.classList.remove('anim-eq'));
  }

  async function setStage(n){
    resetDemoBase(n);
    buttons[n]?.animate?.([{transform:'scale(.93)'},{transform:'scale(1.04)'},{transform:'scale(1)'}],{duration:300,easing:'cubic-bezier(.2,.8,.2,1)'});

    if(n>=1){
      rows[0].classList.add('cleaned'); rows[1].classList.add('cleaned');
      rows[0].querySelector('[data-state]').textContent='clean';
      rows[1].querySelector('[data-state]').textContent='clean';
      rows[2].querySelector('[data-state]').textContent='review';
      rows[3].querySelector('[data-state]').textContent='review';
      pulseRow(rows[0],0); pulseRow(rows[1],70); pulseRow(rows[2],140); pulseRow(rows[3],210);
    }
    if(n>=2){
      await wait(100);
      rows[2].classList.add('muted'); rows[3].classList.add('muted');
      revC.classList.remove('hidden'); revD.classList.remove('hidden');
      void revC.offsetWidth; revC.classList.add('anim-in');
      await wait(80); void revD.offsetWidth; revD.classList.add('anim-in');
    }
    if(n>=3){
      await wait(120);
      eqClean.textContent='332'; eqExc.textContent='116';
      eqPills.forEach((p,i)=>setTimeout(()=>{p.classList.add('anim-eq')}, reduced?0:i*75));
      await wait(290);
      eqStatus.textContent='PASS'; eqStatus.classList.add('pass','anim-pass');
    }
  }
  buttons.forEach(b=>b.addEventListener('click',()=>setStage(Number(b.dataset.stage))));

  // Proof numbers count up once on entry. Final UI is unchanged.
  const numberTargets = [...document.querySelectorAll('.proof-big .num, .proof-small b')].filter(el => /^\d+$/.test(el.textContent.trim()));
  const proofObs = new IntersectionObserver(entries => entries.forEach(e => {
    if(!e.isIntersecting) return;
    proofObs.disconnect();
    numberTargets.forEach((el,idx)=>{
      const target = Number(el.textContent.trim());
      if(reduced){el.textContent=target;return;}
      el.textContent='0';
      const delay=idx*85;
      setTimeout(()=>{
        const start=performance.now(),duration=700;
        const tick=now=>{
          const p=Math.min(1,(now-start)/duration), eased=1-Math.pow(1-p,3);
          el.textContent=Math.round(target*eased).toString();
          if(p<1) requestAnimationFrame(tick);
          else el.animate([{transform:'scale(.96)'},{transform:'scale(1.04)'},{transform:'scale(1)'}],{duration:260});
        };
        requestAnimationFrame(tick);
      },delay);
    });
  }), {threshold:.32});
  const proof = document.querySelector('.proof-layout'); if(proof) proofObs.observe(proof);


  // V6.1 DATA X-RAY — CSV + XLSX multi-sheet scan + deterministic safe-clean copies.
  const xray = document.querySelector('[data-xray]');
  if (xray) {
    const drop = xray.querySelector('[data-dropzone]');
    const input = xray.querySelector('[data-file-input]');
    const browse = xray.querySelector('[data-browse]');
    const sample = xray.querySelector('[data-sample]');
    const errorBox = xray.querySelector('[data-xray-error]');
    const resultBox = xray.querySelector('[data-xray-results]');
    const issueList = xray.querySelector('[data-issue-list]');
    const previewTable = xray.querySelector('[data-preview-table]');
    const reportBtn = xray.querySelector('[data-download-report]');
    const cleanBtn = xray.querySelector('[data-safe-clean]');
    const cleanStatus = xray.querySelector('[data-clean-status]');
    const nameEl = xray.querySelector('[data-xray-name]');
    const scoreEl = xray.querySelector('[data-health-score]');
    const scoreNum = xray.querySelector('[data-health-number]');
    let latestReport = null;
    let latestSource = null;
    const rescueControls = xray.querySelector('[data-rescue-controls]');
    const ruleInputs = [...xray.querySelectorAll('[data-rule]')];
    const ruleSummary = xray.querySelector('[data-rule-summary]');
    const quoteEngine = xray.querySelector('[data-quote-engine]');

    const esc = value => String(value ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'","&#039;");

    function showXrayError(msg='') {
      errorBox.textContent = msg;
      errorBox.classList.toggle('show', Boolean(msg));
    }

    function showCleanStatus(html='') {
      cleanStatus.innerHTML = html;
      cleanStatus.hidden = !html;
    }

    function detectDelimiter(text) {
      const candidates = [',',';','\t','|'];
      const sampleText = text.slice(0, 12000);
      let best = ',', bestScore = -Infinity;
      for (const d of candidates) {
        let counts = [], count = 0, quote = false, rows = 0;
        for (let i=0;i<sampleText.length && rows<8;i++) {
          const ch = sampleText[i];
          if (ch === '"') {
            if (quote && sampleText[i+1] === '"') { i++; continue; }
            quote = !quote;
          } else if (!quote && ch === d) count++;
          else if (!quote && ch === '\n') { if (count>0) counts.push(count); count=0; rows++; }
        }
        if (!counts.length) continue;
        const mean = counts.reduce((a,b)=>a+b,0)/counts.length;
        const variance = counts.reduce((a,b)=>a+Math.pow(b-mean,2),0)/counts.length;
        const score = mean * 3 - variance;
        if (score > bestScore) { bestScore = score; best = d; }
      }
      return best;
    }

    function parseCSV(text, delimiter) {
      const rows = [];
      let row = [], field = '', quote = false;
      for (let i=0;i<text.length;i++) {
        const ch = text[i];
        if (quote) {
          if (ch === '"' && text[i+1] === '"') { field += '"'; i++; }
          else if (ch === '"') quote = false;
          else field += ch;
        } else {
          if (ch === '"') quote = true;
          else if (ch === delimiter) { row.push(field); field=''; }
          else if (ch === '\n') { row.push(field.replace(/\r$/,'')); rows.push(row); row=[]; field=''; }
          else field += ch;
        }
      }
      if (field.length || row.length) { row.push(field.replace(/\r$/,'')); rows.push(row); }
      while (rows.length && rows[rows.length-1].every(v => !String(v).trim())) rows.pop();
      return rows;
    }

    function csvEscape(value, delimiter=',') {
      const s = String(value ?? '');
      if (s.includes('"') || s.includes('\n') || s.includes('\r') || s.includes(delimiter)) return `"${s.replaceAll('"','""')}"`;
      return s;
    }

    function normalizeHeader(v, idx) {
      const s = String(v ?? '').trim().replace(/\s+/g,' ');
      return s || `column_${idx+1}`;
    }

    function validateDate(y,m,d) {
      const dt = new Date(Date.UTC(y,m-1,d));
      return dt.getUTCFullYear()===y && dt.getUTCMonth()===m-1 && dt.getUTCDate()===d;
    }

    function dateInfo(value) {
      const s = String(value ?? '').trim();
      let m;
      if ((m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return validateDate(+m[1],+m[2],+m[3]) ? {fmt:'YMD',iso:`${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`} : {fmt:'YMD',invalid:true};
      if ((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/))) {
        let y=+m[3]; if(y<100)y+=2000;
        return validateDate(y,+m[2],+m[1]) ? {fmt:'DMY_SLASH',iso:`${y}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`} : {fmt:'DMY_SLASH',invalid:true};
      }
      if ((m=s.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/))) {
        let y=+m[3]; if(y<100)y+=2000;
        return validateDate(y,+m[2],+m[1]) ? {fmt:'DMY_DASH',iso:`${y}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`} : {fmt:'DMY_DASH',invalid:true};
      }
      const months={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
      if ((m=s.match(/^([A-Za-z]{3,9})\s+(\d{1,2})[,]?\s+(\d{4})$/))) {
        const mo=months[m[1].slice(0,3).toLowerCase()], d=+m[2], y=+m[3];
        if(mo) return validateDate(y,mo,d) ? {fmt:'MDY_TEXT',iso:`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`} : {fmt:'MDY_TEXT',invalid:true};
      }
      return null;
    }

    function moneyNumber(value) {
      let s = String(value ?? '').trim();
      if (!s) return null;
      s = s.replace(/rp/ig,'').replace(/\s+/g,'');
      if (!/^-?[\d.,]+$/.test(s)) return null;
      if (s.includes(',') && s.includes('.')) {
        const last = Math.max(s.lastIndexOf(','),s.lastIndexOf('.'));
        const frac = s.slice(last+1);
        if (frac.length<=2) return Number(s.slice(0,last).replace(/[.,]/g,'')+'.'+frac);
        return Number(s.replace(/[.,]/g,''));
      }
      const sep = s.includes(',') ? ',' : s.includes('.') ? '.' : null;
      if (sep) {
        const parts=s.split(sep);
        if(parts.at(-1).length===3) return Number(parts.join(''));
        if(parts.length===2 && parts.at(-1).length<=2) return Number(parts[0]+'.'+parts[1]);
        return Number(parts.join(''));
      }
      return Number(s);
    }

    function classify(value) {
      const s=String(value??'').trim();
      if(!s) return 'empty';
      if(dateInfo(s)) return 'date';
      if(moneyNumber(s)!==null && /^[-+]?((rp\s*)?[\d.,\s]+)$/i.test(s)) return 'number';
      return 'text';
    }

    function safeFix(value, header='', allowedRules=null) {
      const original=String(value??'');
      const trimmed=original.trim().replace(/\s+/g,' ');
      const h=String(header).toLowerCase();
      const allow = key => !allowedRules || allowedRules.has(key);

      const d=dateInfo(trimmed);
      const dateHeader=/date|tanggal|tgl|created|updated|time/i.test(h);
      if(allow('date') && dateHeader && d && !d.invalid && d.iso !== trimmed) {
        return {value:d.iso,reason:'date → ISO',type:'s',rule:'date'};
      }

      const numericHeader=/price|harga|total|amount|nominal|revenue|cost|biaya|subtotal|payment|paid/i.test(h);
      if(allow('money') && numericHeader) {
        const n=moneyNumber(trimmed);
        if(n!==null && String(n)!==trimmed) {
          return {value:n,reason:'currency → number',type:'n',rule:'money'};
        }
      }

      if(allow('trim') && trimmed!==original) {
        return {value:trimmed,reason:'trim / whitespace',type:'s',rule:'trim'};
      }
      return null;
    }

    function scanSheet(rowsInput, sheetName, fileName, formatLabel) {
      if(!rowsInput.length) return null;
      const parsed = rowsInput.map(r => Array.isArray(r) ? r.map(v=>v??'') : []);
      const width = Math.max(1,...parsed.map(r=>r.length));
      const rawHeader = parsed[0] || [];
      const headers = Array.from({length:width},(_,i)=>normalizeHeader(rawHeader[i],i));
      const dupHeaders = headers.length - new Set(headers.map(h=>h.toLowerCase())).size;
      const sourceRows = parsed.slice(1,20001);

      let malformed=0;
      const rows=sourceRows.map(r=>{
        if(r.length!==width) malformed++;
        return Array.from({length:width},(_,i)=>r[i]??'');
      });

      const totalCells=Math.max(1,rows.length*width);
      let missing=0, whitespace=0, invalidDates=0, safeChanges=0;
      const ruleCounts={trim:0,date:0,money:0};
      const duplicateMap=new Map();
      const dateFormats=Array.from({length:width},()=>new Set());
      const typeSets=Array.from({length:width},()=>new Set());
      const casingMap=Array.from({length:width},()=>new Map());
      const changes=[];

      rows.forEach((row,ri)=>{
        const sig=row.map(v=>String(v).trim().toLowerCase()).join('\u241f');
        duplicateMap.set(sig,(duplicateMap.get(sig)||0)+1);
        row.forEach((v,ci)=>{
          const raw=String(v??'');
          const trimmed=raw.trim();
          if(!trimmed){missing++;return;}
          if(raw!==trimmed || /\s{2,}/.test(raw)) whitespace++;

          const di=dateInfo(trimmed);
          if(di){ if(di.invalid) invalidDates++; else dateFormats[ci].add(di.fmt); }
          typeSets[ci].add(classify(trimmed));

          if(classify(trimmed)==='text'){
            const norm=trimmed.replace(/\s+/g,' ').toLowerCase();
            if(!casingMap[ci].has(norm)) casingMap[ci].set(norm,new Set());
            casingMap[ci].get(norm).add(trimmed);
          }

          const fix=safeFix(v,headers[ci]);
          if(fix && changes.length<12){
            changes.push({
              sheet:sheetName,column:headers[ci],row:ri+2,col:ci,
              raw:String(v??''),clean:String(fix.value),cleanValue:fix.value,reason:fix.reason,type:fix.type
            });
          }
          if(fix){safeChanges++; if(fix.rule) ruleCounts[fix.rule]=(ruleCounts[fix.rule]||0)+1;}
        });
      });

      const duplicates=[...duplicateMap.values()].reduce((a,n)=>a+Math.max(0,n-1),0);
      const mixedDateCols=dateFormats.filter(s=>s.size>1).length;
      let casingVariants=0;
      casingMap.forEach(m=>m.forEach(set=>{if(set.size>1)casingVariants+=set.size-1}));
      const mixedTypeCols=typeSets.filter(s=>new Set([...s].filter(x=>x!=='empty')).size>1).length;

      const lower=headers.map(h=>h.toLowerCase());
      const findCol = patterns => lower.findIndex(h=>patterns.some(p=>p.test(h)));
      const qIdx=findCol([/^qty$/, /quantity/, /jumlah/]);
      const pIdx=findCol([/unit.?price/, /^price$/, /harga/]);
      const tIdx=findCol([/^total$/, /line.?total/, /amount/]);
      let suspiciousTotals=0;
      if(qIdx>=0 && pIdx>=0 && tIdx>=0){
        rows.forEach(r=>{
          const q=moneyNumber(r[qIdx]),p=moneyNumber(r[pIdx]),t=moneyNumber(r[tIdx]);
          if(q!==null&&p!==null&&t!==null&&Math.abs(q*p-t)>.51)suspiciousTotals++;
        });
      }

      const missingRate=missing/totalCells;
      const malformedRate=malformed/Math.max(1,rows.length);
      const duplicateRate=duplicates/Math.max(1,rows.length);
      const consistencyIssues=whitespace+casingVariants+(mixedDateCols*4)+(mixedTypeCols*3);
      const consistencyRate=consistencyIssues/Math.max(1,totalCells);
      const validityIssues=invalidDates+suspiciousTotals;
      const validityRate=validityIssues/Math.max(1,rows.length);

      const scores={
        structure:Math.round(Math.max(0,100-malformedRate*100-dupHeaders*12)),
        completeness:Math.round(Math.max(0,100-missingRate*100)),
        consistency:Math.round(Math.max(0,100-Math.min(.65,consistencyRate*2.4)*100)),
        duplicates:Math.round(Math.max(0,100-Math.min(.8,duplicateRate*2.2)*100)),
        validity:Math.round(Math.max(0,100-Math.min(.8,validityRate*2.2)*100))
      };
      const overall=Math.round(scores.structure*.20+scores.completeness*.20+scores.consistency*.22+scores.duplicates*.16+scores.validity*.22);

      return {
        sheetName,fileName,formatLabel,rows:rows.length,columns:width,scores:{...scores,overall},
        findings:{
          missingValues:missing,duplicateRows:duplicates,invalidDates,mixedDateColumns:mixedDateCols,
          whitespaceAndCasing:whitespace+casingVariants,malformedRows:malformed,duplicateHeaders:dupHeaders,
          mixedTypeColumns:mixedTypeCols,suspiciousTotals,safeFixCandidates:safeChanges
        },
        changes,ruleCounts
      };
    }

    function aggregateReport(sheetReports,fileName,formatLabel){
      if(!sheetReports.length) throw new Error('Tidak ada sheet/data yang bisa discan.');
      const totalRows=sheetReports.reduce((a,s)=>a+s.rows,0);
      const maxCols=Math.max(...sheetReports.map(s=>s.columns));
      const weight=s=>Math.max(1,s.rows);
      const wTotal=sheetReports.reduce((a,s)=>a+weight(s),0);
      const scoreKey=k=>Math.round(sheetReports.reduce((a,s)=>a+s.scores[k]*weight(s),0)/wTotal);
      const scores={
        structure:scoreKey('structure'),completeness:scoreKey('completeness'),
        consistency:scoreKey('consistency'),duplicates:scoreKey('duplicates'),
        validity:scoreKey('validity')
      };
      scores.overall=Math.round(scores.structure*.20+scores.completeness*.20+scores.consistency*.22+scores.duplicates*.16+scores.validity*.22);

      const keys=['missingValues','duplicateRows','invalidDates','mixedDateColumns','whitespaceAndCasing','malformedRows','duplicateHeaders','mixedTypeColumns','suspiciousTotals','safeFixCandidates'];
      const findings=Object.fromEntries(keys.map(k=>[k,sheetReports.reduce((a,s)=>a+(s.findings[k]||0),0)]));
      const ruleCounts={
        trim:sheetReports.reduce((a,s)=>a+(s.ruleCounts?.trim||0),0),
        date:sheetReports.reduce((a,s)=>a+(s.ruleCounts?.date||0),0),
        money:sheetReports.reduce((a,s)=>a+(s.ruleCounts?.money||0),0)
      };
      const issues=[
        {label:'Missing values',count:findings.missingValues,severity:findings.missingValues?'medium':'good'},
        {label:'Duplicate rows (flag only)',count:findings.duplicateRows,severity:findings.duplicateRows?'medium':'good'},
        {label:'Invalid dates',count:findings.invalidDates,severity:findings.invalidDates?'high':'good'},
        {label:'Mixed date-format columns',count:findings.mixedDateColumns,severity:findings.mixedDateColumns?'medium':'good'},
        {label:'Whitespace / casing variants',count:findings.whitespaceAndCasing,severity:findings.whitespaceAndCasing?'low':'good'},
        {label:'Malformed row widths',count:findings.malformedRows,severity:findings.malformedRows?'high':'good'},
        {label:'Suspicious qty × price totals',count:findings.suspiciousTotals,severity:findings.suspiciousTotals?'high':'good'}
      ];
      return {
        version:'Data X-Ray v1.1',fileName,format:formatLabel,localProcessing:true,scannedAt:new Date().toISOString(),
        rows:totalRows,columns:maxCols,sheets:sheetReports.length,
        sheetNames:sheetReports.map(s=>s.sheetName),scores,findings,issues,
        changes:sheetReports.flatMap(s=>s.changes).slice(0,20),ruleCounts,sheetReports
      };
    }

    function renderReport(report){
      latestReport=report;
      SR_STATE.report=report;
      nameEl.textContent=report.fileName;
      scoreEl.style.setProperty('--score',String(report.scores.overall));
      scoreNum.textContent=String(report.scores.overall);
      ['structure','completeness','consistency','duplicates','validity'].forEach(key=>{
        xray.querySelector(`[data-health-bar="${key}"]`).style.width=`${report.scores[key]}%`;
        xray.querySelector(`[data-health-value="${key}"]`).textContent=report.scores[key];
      });
      xray.querySelector('[data-meta-rows]').textContent=report.rows.toLocaleString('id-ID');
      xray.querySelector('[data-meta-cols]').textContent=report.columns;
      xray.querySelector('[data-meta-sheets]').textContent=report.sheets;
      xray.querySelector('[data-meta-delim]').textContent=report.format;

      issueList.innerHTML =
        `<div style="margin-bottom:10px">${report.sheetNames.map(n=>`<span class="sheet-badge">${esc(n)}</span>`).join('')}</div>` +
        report.issues.map(issue=>`
          <div class="issue-item ${issue.severity==='good'?'good':issue.severity==='low'?'low':''}">
            <span class="issue-mark"></span><strong>${esc(issue.label)}</strong><b>${issue.count.toLocaleString('id-ID')}</b>
          </div>`).join('');

      if(report.changes.length){
        previewTable.innerHTML=`
          <div class="preview-head"><span>COLUMN</span><span>RAW</span><span></span><span>SAFE PREVIEW</span></div>
          ${report.changes.slice(0,8).map(c=>`<div class="preview-row" title="${esc(c.sheet)} • row ${c.row} • ${esc(c.reason)}"><span>${esc(c.sheet)} / ${esc(c.column)}</span><span class="raw">${esc(c.raw)}</span><span class="arrow">→</span><span class="clean">${esc(c.clean)}</span></div>`).join('')}`;
      }else{
        previewTable.innerHTML='<div class="preview-empty">Tidak ada deterministic safe-fix sederhana yang perlu diterapkan. Issue yang tersisa kemungkinan butuh review manusia / aturan bisnis.</div>';
      }

      rescueControls.hidden=false;
      ['trim','date','money'].forEach(rule=>{
        const count=report.ruleCounts?.[rule]||0;
        const el=xray.querySelector(`[data-rule-count="${rule}"]`);
        if(el)el.textContent=count.toLocaleString('id-ID');
      });
      xray.querySelector('[data-review-count="duplicates"]').textContent=(report.findings.duplicateRows||0).toLocaleString('id-ID');
      xray.querySelector('[data-review-count="invalidDates"]').textContent=(report.findings.invalidDates||0).toLocaleString('id-ID');
      xray.querySelector('[data-review-count="suspiciousTotals"]').textContent=(report.findings.suspiciousTotals||0).toLocaleString('id-ID');

      resultBox.classList.add('is-ready');
      reportBtn.disabled=false;
      const clientReportButton=document.querySelector('[data-build-report]');
      if(clientReportButton)clientReportButton.disabled=false;
      cleanBtn.disabled=report.findings.safeFixCandidates===0;
      showCleanStatus(
        `<strong>${report.findings.safeFixCandidates.toLocaleString('id-ID')} safe-fix candidate(s).</strong> `+
        `Duplicate rows, formula cells, dan data ambigu tidak akan dihapus/diubah otomatis.`
      );
      updateControlSummary();
      renderQuote(report);
      saveScanHistory(report, SR_STATE.quote);
      renderHistory();
      resultBox.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});
    }

    function computeQuote(report){
      const rows=Math.max(1,report.rows||0);
      const sheets=Math.max(1,report.sheets||1);
      const f=report.findings||{};
      const allIssues=(f.missingValues||0)+(f.duplicateRows||0)+(f.invalidDates||0)+
        (f.mixedDateColumns||0)+(f.whitespaceAndCasing||0)+(f.malformedRows||0)+(f.suspiciousTotals||0);
      const reviewIssues=(f.duplicateRows||0)+(f.invalidDates||0)+(f.suspiciousTotals||0)+(f.malformedRows||0);
      const density=allIssues/rows;
      const reviewDensity=reviewIssues/rows;

      let score=0;
      let volumeText='',shapeText='',densityText='',reviewText='';

      if(rows<=500){score+=0;volumeText=`${rows.toLocaleString('id-ID')} rows • light`;}
      else if(rows<=3000){score+=1;volumeText=`${rows.toLocaleString('id-ID')} rows • moderate`;}
      else if(rows<=10000){score+=2;volumeText=`${rows.toLocaleString('id-ID')} rows • sizeable`;}
      else{score+=3;volumeText=`${rows.toLocaleString('id-ID')} rows • large`;}

      if(sheets===1){score+=0;shapeText='1 sheet • simple';}
      else if(sheets<=3){score+=1;shapeText=`${sheets} sheets • multi-sheet`;}
      else{score+=2;shapeText=`${sheets} sheets • workbook-wide`;}

      if(density<.03){score+=0;densityText=`${(density*100).toFixed(1)}% • low`;}
      else if(density<.10){score+=1;densityText=`${(density*100).toFixed(1)}% • moderate`;}
      else if(density<.25){score+=2;densityText=`${(density*100).toFixed(1)}% • high`;}
      else{score+=3;densityText=`${(density*100).toFixed(1)}% • very high`;}

      if(reviewIssues===0){score+=0;reviewText='0 review blockers';}
      else if(reviewIssues<=10 && reviewDensity<.05){score+=1;reviewText=`${reviewIssues} flagged • light review`;}
      else if(reviewIssues<=75 && reviewDensity<.18){score+=2;reviewText=`${reviewIssues} flagged • manual review`;}
      else{score+=3;reviewText=`${reviewIssues} flagged • heavy review`;}

      // Structural risk deserves an extra point because it is not a cosmetic cleanup.
      if((f.malformedRows||0)>0 || (f.duplicateHeaders||0)>0) score+=1;

      score=Math.min(12,score);

      let level,packageName,range,manual=false;
      if(score<=2){
        level='LOW'; packageName='Quick Fix'; range='Rp75–150k';
      }else if(score<=5){
        level='MEDIUM'; packageName='Data Rescue'; range='Rp150–300k';
      }else if(score<=8){
        level='HIGH'; packageName='Data Rescue+'; range='Rp300–500k';
      }else if(score<=10){
        level='HEAVY'; packageName='Advanced Rescue'; range='Rp500–750k';
      }else{
        level='MANUAL'; packageName='Manual Scope Review'; range='Rp750k+'; manual=true;
      }

      return {score,level,packageName,range,manual,volumeText,shapeText,densityText,reviewText,allIssues,reviewIssues};
    }

    function renderQuote(report){
      const q=computeQuote(report);
      SR_STATE.quote=q;
      quoteEngine.hidden=false;
      xray.querySelector('[data-quote-level]').textContent=q.level;
      xray.querySelector('[data-quote-package]').textContent=q.packageName;
      xray.querySelector('[data-quote-range]').textContent=q.range;
      xray.querySelector('[data-quote-score]').textContent=`${q.score} / 12`;
      xray.querySelector('[data-quote-meter]').style.width=`${Math.round(q.score/12*100)}%`;
      xray.querySelector('[data-quote-volume]').textContent=q.volumeText;
      xray.querySelector('[data-quote-shape]').textContent=q.shapeText;
      xray.querySelector('[data-quote-density]').textContent=q.densityText;
      xray.querySelector('[data-quote-review]').textContent=q.reviewText;

      const foot=xray.querySelector('[data-quote-foot]');
      foot.classList.toggle('manual',q.manual);
      if(q.manual){
        foot.innerHTML='<strong>Manual quote required.</strong> Complexity terlalu tinggi untuk diberi harga otomatis yang jujur. Perlu lihat sample + business rules dulu.';
      }else{
        foot.innerHTML=`<strong>Scope estimate only.</strong> Range ini berdasarkan file yang discan. Business rules, deadline, dan kebutuhan output final bisa mengubah quote.`;
      }
    }

    function selectedRules(){
      return new Set(ruleInputs.filter(i=>i.checked).map(i=>i.dataset.rule));
    }

    function updateControlSummary(){
      if(!latestReport)return;
      const selected=selectedRules();
      const total=[...selected].reduce((sum,r)=>sum+(latestReport.ruleCounts?.[r]||0),0);
      ruleSummary.innerHTML=`Selected safe fixes: <b>${total.toLocaleString('id-ID')}</b> candidate(s).`;
      cleanBtn.disabled=total===0;
      if(latestReport && quoteEngine && !quoteEngine.hidden){
        const foot=xray.querySelector('[data-quote-foot]');
        const base=computeQuote(latestReport);
        if(!base.manual){
          foot.innerHTML=`<strong>Scope estimate only.</strong> ${total.toLocaleString('id-ID')} selected safe-fix candidate(s). Harga final tetap tergantung business rules, deadline, dan output yang diminta.`;
        }
      }
      previewTable.querySelectorAll('.preview-row').forEach(row=>{
        const title=(row.getAttribute('title')||'').toLowerCase();
        let rule='trim';
        if(title.includes('date → iso'))rule='date';
        else if(title.includes('currency → number'))rule='money';
        row.classList.toggle('is-disabled',!selected.has(rule));
      });
    }

    ruleInputs.forEach(i=>i.addEventListener('change',updateControlSummary));

    async function analyzeCSVText(text,name='sample.csv'){
      if(!text.trim()) throw new Error('File kosong.');
      const delimiter=detectDelimiter(text);
      const parsed=parseCSV(text,delimiter);
      const hasData=parsed.slice(1).some(row=>row.some(v=>String(v??'').trim()));
      if(parsed.length<2 || !hasData) throw new Error('CSV harus punya header + minimal 1 data row.');
      const sr=scanSheet(parsed,'CSV',name,delimiter===','?'CSV ,':delimiter===';'?'CSV ;':delimiter==='\t'?'CSV TAB':'CSV');
      latestSource={kind:'csv',name,text,delimiter,parsed};
      renderReport(aggregateReport([sr],name,delimiter===','?'CSV ,':delimiter===';'?'CSV ;':delimiter==='\t'?'CSV TAB':'CSV'));
    }

    async function analyzeXLSX(file){
      if(!globalThis.XLSX) throw new Error('XLSX engine tidak tersedia. Coba reload halaman atau gunakan CSV sementara.');
      const ab=await file.arrayBuffer();
      const wb=XLSX.read(ab,{cellDates:false,cellNF:true,cellStyles:true});
      const reports=[];
      for(const sheetName of wb.SheetNames){
        const ws=wb.Sheets[sheetName];
        const aoa=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false,blankrows:false});
        if(!aoa.length) continue;
        const sr=scanSheet(aoa,sheetName,file.name,'XLSX');
        if(sr) reports.push(sr);
      }
      latestSource={kind:'xlsx',name:file.name,arrayBuffer:ab,workbook:wb};
      renderReport(aggregateReport(reports,file.name,'XLSX'));
    }

    async function analyzeFile(file){
      showXrayError(''); showCleanStatus('');
      if(!file) return;
      if(file.size>8*1024*1024) throw new Error('File terlalu besar. Batas prototype X-Ray V6.1: 8 MB.');
      if(/\.xlsx$/i.test(file.name)) return analyzeXLSX(file);
      if(/\.csv$/i.test(file.name) || file.type==='text/csv') return analyzeCSVText(await file.text(),file.name);
      throw new Error('V6.1 saat ini menerima CSV atau XLSX.');
    }

    function downloadBlob(blob,filename){
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),700);
    }

    function cleanCSV(){
      const {parsed,delimiter,name}=latestSource;
      const rules=selectedRules();
      if(!parsed?.length)return;
      const headers=parsed[0].map(normalizeHeader);
      const log=[['row','column','raw','clean','reason']];
      const cleaned=parsed.map((row,ri)=>{
        if(ri===0) return row.map((v,i)=>normalizeHeader(v,i));
        return row.map((v,ci)=>{
          const fix=safeFix(v,headers[ci]||`column_${ci+1}`,rules);
          if(!fix)return v;
          log.push([ri+1,headers[ci],String(v??''),String(fix.value),fix.reason]);
          return fix.value;
        });
      });
      const csv=cleaned.map(row=>row.map(v=>csvEscape(v,delimiter)).join(delimiter)).join('\r\n');
      const baseName=name.replace(/\.csv$/i,'');
      downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),`${baseName}_SAFE_CLEAN.csv`);
      downloadBlob(new Blob([log.map(r=>r.map(v=>csvEscape(v,',')).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),`${baseName}_RESCUE_LOG.csv`);
      showCleanStatus(`<strong>Safe clean copy dibuat.</strong> ${log.length-1} cell normalization(s) diterapkan. Original file tidak disentuh; duplicate rows tetap dipertahankan.`);
    }

    function cleanXLSX(){
      if(!globalThis.XLSX) throw new Error('XLSX engine tidak tersedia.');
      const rules=selectedRules();
      // Re-read source so the scan workbook is never mutated.
      const wb=XLSX.read(latestSource.arrayBuffer,{cellDates:false,cellNF:true,cellStyles:true});
      const log=[['sheet','cell','raw','clean','reason']];
      let fixes=0, skippedFormula=0;

      for(const sheetName of wb.SheetNames){
        if(sheetName==='RESCUE_LOG') continue;
        const ws=wb.Sheets[sheetName];
        if(!ws || !ws['!ref']) continue;
        const range=XLSX.utils.decode_range(ws['!ref']);
        const headers=[];
        for(let c=range.s.c;c<=range.e.c;c++){
          const addr=XLSX.utils.encode_cell({r:range.s.r,c});
          headers[c]=normalizeHeader(ws[addr]?.w ?? ws[addr]?.v ?? '',c);
        }
        for(let r=range.s.r+1;r<=Math.min(range.e.r,range.s.r+20000);r++){
          for(let c=range.s.c;c<=range.e.c;c++){
            const addr=XLSX.utils.encode_cell({r,c});
            const cell=ws[addr];
            if(!cell || cell.v==null) continue;
            if(cell.f){ skippedFormula++; continue; }
            const shown=cell.w ?? cell.v;
            const fix=safeFix(shown,headers[c],rules);
            if(!fix) continue;
            log.push([sheetName,addr,String(shown),String(fix.value),fix.reason]);
            cell.v=fix.value;
            cell.t=fix.type;
            delete cell.w;
            fixes++;
          }
        }
      }

      const logWS=XLSX.utils.aoa_to_sheet(log);
      if(wb.SheetNames.includes('RESCUE_LOG')) delete wb.Sheets['RESCUE_LOG'];
      else wb.SheetNames.push('RESCUE_LOG');
      wb.Sheets['RESCUE_LOG']=logWS;

      const out=XLSX.write(wb,{bookType:'xlsx',type:'array',cellStyles:true});
      const baseName=latestSource.name.replace(/\.xlsx$/i,'');
      downloadBlob(new Blob([out],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`${baseName}_SAFE_CLEAN.xlsx`);
      showCleanStatus(
        `<strong>Safe XLSX copy dibuat.</strong> ${fixes.toLocaleString('id-ID')} plain cell(s) dinormalisasi; `+
        `${skippedFormula.toLocaleString('id-ID')} formula cell(s) sengaja dilewati. Duplicate rows tidak dihapus. RESCUE_LOG ditambahkan ke copy.`
      );
    }

    browse.addEventListener('click',()=>input.click());
    input.addEventListener('change',async()=>{try{await analyzeFile(input.files?.[0])}catch(e){showXrayError(String(e?.message||'File tidak dapat diproses.').slice(0,240))}});

    drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click()}});
    ['dragenter','dragover'].forEach(type=>drop.addEventListener(type,e=>{e.preventDefault();drop.classList.add('is-over')}));
    ['dragleave','drop'].forEach(type=>drop.addEventListener(type,e=>{e.preventDefault();drop.classList.remove('is-over')}));
    drop.addEventListener('drop',async e=>{try{await analyzeFile(e.dataTransfer?.files?.[0])}catch(err){showXrayError(String(err?.message||'File tidak dapat diproses.').slice(0,240))}});

    const messySample=`order_id,order_date,customer,product,qty,unit_price,total
ORD-001,12/08/26,"  Ayu Pratama  ","kopi  PAGI 200g",2,Rp28.000,56000
ORD-002,Aug 12 2026,BIMA SANTOSO,MI GURIH AYAM,3,"3,500",10500
ORD-003,31/02/2026,Citra Lestari,Wafer Gembira,2,Rp??,19000
ORD-004,2026-08-14,Dimas Putra,Mi Gurih,2,3800,7600
ORD-004,2026-08-14,Dimas Putra,Mi Gurih,2,3800,7600
ORD-005,14-08-26,,Kopi Pagi 200g,1,28000,28000
ORD-006,2026-08-15,Eka Rahma,Kopi Pagi 200g,3,28000,85000
ORD-007,2026-08-16, Farah Utami ,MI GURIH AYAM,1,3500,3500`;
    sample.addEventListener('click',async()=>{try{await analyzeCSVText(messySample,'messy_orders_sample.csv')}catch(e){showXrayError(e.message)}});

    reportBtn.addEventListener('click',()=>{
      if(!latestReport)return;
      downloadBlob(new Blob([JSON.stringify(latestReport,null,2)],{type:'application/json'}),
        `data-xray-${latestReport.fileName.replace(/[^a-z0-9._-]+/gi,'-')}.json`);
    });

    cleanBtn.addEventListener('click',()=>{
      try{
        if(!latestSource)return;
        if(latestSource.kind==='csv') cleanCSV();
        else if(latestSource.kind==='xlsx') cleanXLSX();
      }catch(e){showXrayError(e.message)}
    });
  }


  // V7.1 — CLIENT INTAKE WIZARD
  const intake = document.querySelector('[data-intake]');
  if(intake){
    const steps=[...intake.querySelectorAll('[data-intake-step]')];
    const prevBtn=intake.querySelector('[data-intake-prev]');
    const nextBtn=intake.querySelector('[data-intake-next]');
    const finishBtn=intake.querySelector('[data-intake-finish]');
    const result=intake.querySelector('[data-intake-result]');
    const progress=intake.querySelector('[data-intake-progress]');
    const progressLabel=intake.querySelector('[data-intake-progress-label]');
    const briefBox=intake.querySelector('[data-scope-brief]');
    const copyBtn=intake.querySelector('[data-copy-brief]');
    const downloadBtn=intake.querySelector('[data-download-brief]');
    const editBtn=intake.querySelector('[data-edit-brief]');
    let intakeStep=0;

    function selectedValue(name){
      return intake.querySelector(`input[name="${name}"]:checked`)?.value || '';
    }

    function currentAnswers(){
      return {
        frequency:selectedValue('frequency'),
        deadline:selectedValue('deadline'),
        output:selectedValue('output'),
        rules:selectedValue('rules'),
        sensitivity:selectedValue('sensitivity'),
        handoff:selectedValue('handoff')
      };
    }

    function updateSummary(){
      const a=currentAnswers();
      Object.entries(a).forEach(([key,val])=>{
        const el=intake.querySelector(`[data-intake-summary="${key}"]`);
        if(el)el.textContent=val || '—';
      });

      const xraySummary=intake.querySelector('[data-intake-summary="xray"]');
      if(xraySummary){
        if(SR_STATE.report){
          const report=SR_STATE.report;
          xraySummary.textContent=`${report.fileName} • ${report.rows.toLocaleString('id-ID')} rows • health ${report.scores.overall}/100`;
        }else{
          xraySummary.textContent='Not scanned';
        }
      }
    }

    function showStep(n){
      intakeStep=Math.max(0,Math.min(steps.length-1,n));
      steps.forEach((s,i)=>s.classList.toggle('active',i===intakeStep));
      prevBtn.disabled=intakeStep===0;
      nextBtn.hidden=intakeStep===steps.length-1;
      finishBtn.hidden=intakeStep!==steps.length-1;
      progressLabel.textContent=`${intakeStep+1} / ${steps.length}`;
      progress.style.width=`${((intakeStep+1)/steps.length)*100}%`;
      updateSummary();
    }

    intake.querySelectorAll('input[type="radio"]').forEach(i=>i.addEventListener('change',updateSummary));
    prevBtn.addEventListener('click',()=>showStep(intakeStep-1));
    nextBtn.addEventListener('click',()=>showStep(intakeStep+1));

    function parseRangeText(rangeText){
      if(!rangeText || rangeText.includes('+')) return null;
      const nums=[...rangeText.matchAll(/(\d+)(?:k)/gi)].map(m=>Number(m[1]));
      if(nums.length>=2)return {low:nums[0],high:nums[1]};
      return null;
    }

    function formatRpK(n){
      return `Rp${Math.round(n)}k`;
    }

    function buildIntakeRecommendation(){
      const a=currentAnswers();

      let basePackage='Quick Fix';
      let baseRange='Rp75–150k';
      let manual=false;
      let notes=[];

      if(SR_STATE.quote){
        const q=SR_STATE.quote;
        basePackage=q.packageName;
        baseRange=q.range;
        manual=q.manual;
      }else{
        notes.push('No X-Ray scan attached — estimate is broader.');
      }

      if(a.sensitivity==='Regulated / high-stakes'){
        manual=true;
        notes.push('Regulated/high-stakes data requires manual scope review.');
      }
      if(a.rules==='Many manual decisions'){
        manual=true;
        notes.push('Many manual decisions make automatic pricing unreliable.');
      }
      if(a.deadline==='Same day'){
        manual=true;
        notes.push('Same-day delivery depends on availability and scope.');
      }

      let recurring = a.frequency==='Weekly' || a.frequency==='Monthly';
      let automationRequested = a.output==='Repeatable automation';
      if(recurring || automationRequested){
        notes.push('Recurring workflow / automation should be quoted separately from one-time rescue.');
      }

      let range=parseRangeText(baseRange);
      let multiplier=1;
      let addLow=0,addHigh=0;

      if(a.deadline==='3–7 days') multiplier*=1.05;
      if(a.deadline==='24–48 hours') multiplier*=1.22;

      if(a.output==='Cleaned file + dashboard'){addLow+=75;addHigh+=150;}
      if(a.handoff==='Detailed audit trail'){addLow+=25;addHigh+=75;}
      if(a.handoff==='Documentation / SOP'){addLow+=75;addHigh+=150;}
      if(a.handoff==='Walkthrough / explanation'){addLow+=25;addHigh+=75;}
      if(a.rules==='Some ambiguity'){multiplier*=1.12;}
      if(a.sensitivity==='Contains personal/customer data'){multiplier*=1.08;}

      let finalPackage=basePackage;
      let finalRange=baseRange;

      if(manual){
        finalPackage='Manual Scope Review';
        finalRange='Manual quote';
      }else if(automationRequested){
        finalPackage='Automation Audit';
        finalRange='One-time rescue + separate automation quote';
      }else if(range){
        const low=range.low*multiplier+addLow;
        const high=range.high*multiplier+addHigh;
        finalRange=`${formatRpK(low)}–${formatRpK(high)}`;
        if(a.output==='Cleaned file + dashboard' && !finalPackage.includes('Dashboard')) finalPackage+=' + Dashboard';
      }

      return {answers:a,finalPackage,finalRange,manual,recurring,automationRequested,notes};
    }

    function buildBrief(rec){
      const a=rec.answers;
      const report = SR_STATE.report || null;
      const lines=[
        'SPREADSHEET RESCUE — CLIENT SCOPE BRIEF',
        '----------------------------------------',
        '',
        `Frequency: ${a.frequency}`,
        `Deadline: ${a.deadline}`,
        `Requested output: ${a.output}`,
        `Business-rule clarity: ${a.rules}`,
        `Data sensitivity: ${a.sensitivity}`,
        `Preferred handoff: ${a.handoff}`,
        ''
      ];

      if(report){
        lines.push(
          'DATA X-RAY',
          `File: ${report.fileName}`,
          `Format: ${report.format}`,
          `Rows scanned: ${report.rows}`,
          `Sheets: ${report.sheets}`,
          `Data health: ${report.scores.overall}/100`,
          `Missing values: ${report.findings.missingValues}`,
          `Duplicate rows flagged: ${report.findings.duplicateRows}`,
          `Invalid dates: ${report.findings.invalidDates}`,
          `Suspicious totals: ${report.findings.suspiciousTotals}`,
          `Safe-fix candidates: ${report.findings.safeFixCandidates}`,
          ''
        );
      }else{
        lines.push('DATA X-RAY: Not run yet', '');
      }

      lines.push(
        'PRELIMINARY ESTIMATE',
        `Recommended route: ${rec.finalPackage}`,
        `Estimated range: ${rec.finalRange}`,
        ''
      );

      if(rec.notes.length){
        lines.push('NOTES');
        rec.notes.forEach(n=>lines.push(`- ${n}`));
        lines.push('');
      }

      lines.push(
        'SAFETY / DELIVERY EXPECTATIONS',
        '- Original file should remain untouched.',
        '- Deterministic safe fixes may be automated.',
        '- Ambiguous data, suspicious duplicates, and business-rule decisions require review.',
        '- Final scope and price are confirmed after sample review.',
        ''
      );

      return lines.join('\n');
    }

    function finishIntake(){
      const rec=buildIntakeRecommendation();
      intake.querySelector('[data-intake-package]').textContent=rec.finalPackage;
      intake.querySelector('[data-intake-price]').textContent=rec.finalRange;
      const note=intake.querySelector('[data-intake-price-note]');
      note.textContent=rec.manual
        ? 'Manual review diperlukan sebelum harga final.'
        : 'Estimasi awal. Final quote tetap tergantung sample, business rules, dan kapasitas deadline.';
      briefBox.value=buildBrief(rec);
      SR_STATE.intake={recommendation:rec,brief:briefBox.value,answers:rec.answers};
      result.classList.add('is-ready');
      result.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});
    }

    finishBtn.addEventListener('click',finishIntake);

    copyBtn.addEventListener('click',async()=>{
      try{
        await navigator.clipboard.writeText(briefBox.value);
        const old=copyBtn.textContent;
        copyBtn.textContent='COPIED ✓';
        setTimeout(()=>copyBtn.textContent=old,1300);
      }catch{
        briefBox.select();
        document.execCommand('copy');
      }
    });

    downloadBtn.addEventListener('click',()=>{
      const blob=new Blob([briefBox.value],{type:'text/plain;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download='spreadsheet-rescue-scope-brief.txt';
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),500);
    });

    editBtn.addEventListener('click',()=>{
      result.classList.remove('is-ready');
      showStep(0);
      intake.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
    });

    showStep(0);
  }


  // V8 — CLIENT RESCUE REPORT GENERATOR
  const buildReportBtn=document.querySelector('[data-build-report]');
  const reportDialog=document.querySelector('[data-report-dialog]');
  const reportArticle=document.querySelector('[data-client-report]');
  const reportPrintBtn=document.querySelector('[data-report-print]');
  const reportDownloadBtn=document.querySelector('[data-report-download]');
  const reportCloseBtn=document.querySelector('[data-report-close]');

  function reportEsc(value){
    return String(value??'')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'","&#039;");
  }

  function reportDate(iso){
    try{
      return new Intl.DateTimeFormat('id-ID',{
        dateStyle:'medium',timeStyle:'short'
      }).format(new Date(iso));
    }catch{return String(iso||'')}
  }

  function reportIssueSeverity(issue){
    if(!issue.count)return 'CLEAR';
    if(issue.label.toLowerCase().includes('invalid') || issue.label.toLowerCase().includes('malformed') || issue.label.toLowerCase().includes('suspicious')) return 'REVIEW';
    return 'CHECK';
  }

  function buildReportHTML(){
    const r=SR_STATE.report;
    if(!r)return '';

    const q=SR_STATE.quote || null;
    const intake=SR_STATE.intake;
    const scores=r.scores||{};
    const rules=r.ruleCounts||{trim:0,date:0,money:0};

    const issueRows=(r.issues||[]).map(issue=>`
      <tr>
        <td>${reportEsc(issue.label)}</td>
        <td>${reportIssueSeverity(issue)}</td>
        <td>${Number(issue.count||0).toLocaleString('id-ID')}</td>
      </tr>`).join('');

    const intakeBrief=intake?.brief
      ? `<section class="report-section">
          <div class="report-section-head"><h3>Client scope brief</h3><span>intake wizard</span></div>
          <pre class="report-brief">${reportEsc(intake.brief)}</pre>
        </section>`
      : `<section class="report-section">
          <div class="report-section-head"><h3>Client scope brief</h3><span>not completed</span></div>
          <div class="report-safety"><div>Intake Wizard belum diisi. Estimasi di report ini hanya memakai struktur dan kualitas file.</div><div>Isi Intake Wizard untuk menambahkan deadline, business rules, sensitivity, output, dan handoff ke report berikutnya.</div></div>
        </section>`;

    const packageName=intake?.recommendation?.finalPackage || q?.packageName || 'Manual Scope Review';
    const range=intake?.recommendation?.finalRange || q?.range || 'Manual quote';
    const complexity=q?.level || '—';

    return `
      <header class="report-masthead">
        <div class="report-brand">
          <div class="report-brand-mark">SR</div>
          <div><strong>Spreadsheet Rescue</strong><span>Data X-Ray / Client Rescue Report</span></div>
        </div>
        <div class="report-meta">
          Generated locally<br>
          ${reportEsc(reportDate(r.scannedAt))}<br>
          Report engine: ${reportEsc(r.version||'Data X-Ray')}
        </div>
      </header>

      <h1 class="report-title">Your data isn't just messy.<br>It's measurable.</h1>
      <p class="report-subtitle">Diagnostic summary untuk <strong>${reportEsc(r.fileName)}</strong>. File diproses di browser; report ini merangkum issue yang terdeteksi, safe-fix opportunity, dan preliminary rescue scope.</p>

      <div class="report-hero-grid">
        <div class="report-score-card">
          <small>Overall data health</small>
          <b>${Number(scores.overall||0)}</b>
          <span>/100 health score</span>
        </div>
        <div class="report-summary-card">
          <small>Recommended route</small>
          <h2>${reportEsc(packageName)}</h2>
          <div class="report-price">${reportEsc(range)}</div>
          <div class="report-disclaimer">Complexity: ${reportEsc(complexity)} • estimate only, not a final invoice. Business rules, deadline, sensitivity, and requested deliverables can change final scope.</div>
        </div>
      </div>

      <section class="report-section">
        <div class="report-section-head"><h3>File profile</h3><span>scan scope</span></div>
        <div class="report-health-grid">
          <div class="report-health-item"><small>Rows scanned</small><b>${Number(r.rows||0).toLocaleString('id-ID')}</b></div>
          <div class="report-health-item"><small>Max columns</small><b>${Number(r.columns||0)}</b></div>
          <div class="report-health-item"><small>Sheets</small><b>${Number(r.sheets||1)}</b></div>
          <div class="report-health-item"><small>Format</small><b style="font-size:17px">${reportEsc(r.format||'CSV')}</b></div>
          <div class="report-health-item"><small>Local processing</small><b style="font-size:17px">${r.localProcessing?'YES':'—'}</b></div>
        </div>
      </section>

      <section class="report-section">
        <div class="report-section-head"><h3>Health dimensions</h3><span>0–100</span></div>
        <div class="report-health-grid">
          <div class="report-health-item"><small>Structure</small><b>${Number(scores.structure||0)}</b></div>
          <div class="report-health-item"><small>Completeness</small><b>${Number(scores.completeness||0)}</b></div>
          <div class="report-health-item"><small>Consistency</small><b>${Number(scores.consistency||0)}</b></div>
          <div class="report-health-item"><small>Duplicates</small><b>${Number(scores.duplicates||0)}</b></div>
          <div class="report-health-item"><small>Validity</small><b>${Number(scores.validity||0)}</b></div>
        </div>
      </section>

      <section class="report-section">
        <div class="report-section-head"><h3>Detected issues</h3><span>diagnostic counts</span></div>
        <table class="report-issue-table">
          <thead><tr><th>Finding</th><th>Handling</th><th>Count</th></tr></thead>
          <tbody>${issueRows}</tbody>
        </table>
      </section>

      <section class="report-section">
        <div class="report-section-head"><h3>Deterministic safe-fix opportunities</h3><span>no guessing</span></div>
        <div class="report-rule-grid">
          <div class="report-rule"><small>Trim whitespace</small><b>${Number(rules.trim||0).toLocaleString('id-ID')}</b></div>
          <div class="report-rule"><small>Normalize dates</small><b>${Number(rules.date||0).toLocaleString('id-ID')}</b></div>
          <div class="report-rule"><small>Normalize currency</small><b>${Number(rules.money||0).toLocaleString('id-ID')}</b></div>
        </div>
      </section>

      ${intakeBrief}

      <section class="report-section">
        <div class="report-section-head"><h3>Safety model</h3><span>how the rescue should behave</span></div>
        <div class="report-safety">
          <div><strong>Original stays untouched.</strong><br>Safe cleaning should generate a copy rather than overwrite source data.</div>
          <div><strong>No silent guessing.</strong><br>Ambiguous mappings, invalid business data, and suspicious totals should require review.</div>
          <div><strong>Duplicates are evidence.</strong><br>Exact/suspected duplicates should be logged before deletion decisions are made.</div>
          <div><strong>Traceability matters.</strong><br>Changes should be logged so output can be reconciled back to the input.</div>
        </div>
      </section>

      <footer class="report-footer">
        <span>Spreadsheet Rescue • Synthetic portfolio tooling / client diagnostic</span>
        <span>Your file is processed locally by this browser tool.</span>
      </footer>
    `;
  }

  function openClientReport(){
    if(!SR_STATE.report)return;
    reportArticle.innerHTML=buildReportHTML();
    reportDialog.showModal();
  }

  // Report button state is updated explicitly by scan/history/share flows.
  if(buildReportBtn)buildReportBtn.disabled=!SR_STATE.report;

  buildReportBtn?.addEventListener('click',openClientReport);
  reportCloseBtn?.addEventListener('click',()=>reportDialog.close());

  reportPrintBtn?.addEventListener('click',()=>{
    document.body.classList.add('report-print-mode');
    const cleanup=()=>document.body.classList.remove('report-print-mode');
    addEventListener('afterprint',cleanup,{once:true});
    print();
    setTimeout(cleanup,1200);
  });

  function standaloneReportDocument(){
    const reportBody=buildReportHTML();
    return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Spreadsheet Rescue — Client Rescue Report</title>
<style>
:root{--ink:#101828;--cream:#F7F3EA;--lime:#C8F44B;--blue-soft:#DDE5FF;--coral-soft:#FFE0DC}
*{box-sizing:border-box}body{margin:0;background:#ece8df;color:var(--ink);font-family:Segoe UI,system-ui,-apple-system,sans-serif}
.client-report{width:min(940px,calc(100% - 24px));margin:24px auto;background:#FBFAF6;padding:44px;border:3px solid var(--ink);border-radius:24px}
.report-masthead{display:flex;justify-content:space-between;gap:30px;padding-bottom:24px;border-bottom:3px solid var(--ink)}
.report-brand{display:flex;align-items:center;gap:12px}.report-brand-mark{width:54px;height:54px;display:grid;place-items:center;border:3px solid var(--ink);border-radius:17px;background:var(--lime);box-shadow:3px 3px 0 var(--ink);font-weight:950}.report-brand strong{display:block;font-size:18px}.report-brand span{display:block;margin-top:2px;color:#667085;font-size:8px;font-weight:900;text-transform:uppercase}.report-meta{text-align:right;font-size:9px;line-height:1.55;color:#667085}
.report-client-label{display:inline-flex;margin:18px 0 0;padding:7px 10px;border:2px solid var(--ink);border-radius:999px;background:var(--blue-soft);font-size:8px;font-weight:950;text-transform:uppercase}.report-title{margin:34px 0 10px;font-size:64px;line-height:.9;letter-spacing:-.06em}.report-subtitle{max-width:720px;color:#667085;font-size:13px;line-height:1.6}
.report-hero-grid{display:grid;grid-template-columns:.65fr 1.35fr;gap:14px;margin:30px 0}.report-score-card,.report-summary-card{border:3px solid var(--ink);border-radius:24px;box-shadow:4px 4px 0 var(--ink)}.report-score-card{padding:22px;background:var(--lime);display:grid;align-content:space-between;min-height:220px}.report-score-card small,.report-summary-card small{font-size:8px;font-weight:950;text-transform:uppercase}.report-score-card b{font-size:84px;line-height:.8}.report-score-card span{font-size:10px;font-weight:900}.report-summary-card{padding:22px;background:white}.report-summary-card h2{font-size:30px;margin:5px 0 10px}.report-price{font-size:36px;font-weight:950;margin:18px 0 6px}.report-disclaimer{color:#667085;font-size:8px}
.report-section{margin-top:32px}.report-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:12px;padding-bottom:8px;border-bottom:3px solid var(--ink)}.report-section-head h3{margin:0;font-size:22px}.report-section-head span{color:#667085;font-size:8px;font-weight:900;text-transform:uppercase}
.report-health-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.report-health-item{padding:12px;border:2px solid var(--ink);border-radius:14px;background:white}.report-health-item small{display:block;color:#667085;font-size:7px;font-weight:950;text-transform:uppercase}.report-health-item b{display:block;margin-top:4px;font-size:24px}
.report-issue-table{width:100%;border-collapse:separate;border-spacing:0;border:3px solid var(--ink);border-radius:18px;overflow:hidden;background:white}.report-issue-table th,.report-issue-table td{padding:10px 12px;border-bottom:2px solid var(--ink);text-align:left;font-size:9px}.report-issue-table th{background:var(--ink);color:white;font-size:7px;text-transform:uppercase}.report-issue-table tr:last-child td{border-bottom:0}.report-issue-table td:last-child{text-align:right;font-weight:950}
.report-rule-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.report-rule{padding:12px;border:2px solid var(--ink);border-radius:14px;background:var(--blue-soft)}.report-rule small{display:block;color:#667085;font-size:7px;font-weight:950;text-transform:uppercase}.report-rule b{display:block;margin-top:4px;font-size:22px}
.report-brief{white-space:pre-wrap;padding:16px;border:3px solid var(--ink);border-radius:17px;background:white;font:700 9px/1.55 ui-monospace,Consolas,monospace}.report-safety{display:grid;grid-template-columns:1fr 1fr;gap:8px}.report-safety div{padding:12px;border:2px solid var(--ink);border-radius:13px;background:#FFF8E6;font-size:9px;line-height:1.45}.report-footer{display:flex;justify-content:space-between;gap:20px;margin-top:34px;padding-top:14px;border-top:3px solid var(--ink);color:#667085;font-size:8px}
@media(max-width:700px){.client-report{padding:22px 14px}.report-masthead,.report-footer{flex-direction:column}.report-meta{text-align:left}.report-hero-grid{grid-template-columns:1fr}.report-health-grid{grid-template-columns:1fr 1fr}.report-rule-grid,.report-safety{grid-template-columns:1fr}.report-title{font-size:46px}}
@media print{body{background:white}.client-report{width:100%;margin:0;padding:0;border:0;border-radius:0}.report-score-card,.report-summary-card,.report-health-item,.report-rule,.report-safety div{break-inside:avoid}@page{size:A4;margin:13mm}}
</style>
</head><body><article class="client-report">${reportBody}</article></body></html>`;
  }

  reportDownloadBtn?.addEventListener('click',()=>{
    if(!SR_STATE.report)return;
    const doc=standaloneReportDocument();
    const blob=new Blob([doc],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    const safe=(SR_STATE.report.fileName||'report').replace(/[^a-z0-9._-]+/gi,'-');
    a.href=url;a.download=`rescue-report-${safe}.html`;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),700);
  });


  // V9 — BRANDED SHARE HANDOFF + LOCAL HISTORY
  const HISTORY_KEY='spreadsheet_rescue_scan_history_v1';
  const brandClient=document.querySelector('[data-brand-client]');
  const brandProject=document.querySelector('[data-brand-project]');
  const brandBy=document.querySelector('[data-brand-by]');
  const shareBtn=document.querySelector('[data-report-share]');
  const shareTray=document.querySelector('[data-report-share-tray]');
  const shareInput=document.querySelector('[data-report-share-link]');
  const shareCopyBtn=document.querySelector('[data-report-copy-link]');
  const shareWarning=document.querySelector('[data-share-warning]');
  const qrWrap=document.querySelector('[data-qr-wrap]');

  function compactReport(r){
    if(!r)return null;
    return {
      version:r.version,fileName:r.fileName,format:r.format,localProcessing:!!r.localProcessing,scannedAt:r.scannedAt,
      rows:r.rows,columns:r.columns,sheets:r.sheets,sheetNames:(r.sheetNames||[]).slice(0,20),scores:r.scores,
      findings:r.findings,issues:(r.issues||[]).map(i=>({label:i.label,count:i.count,severity:i.severity})),ruleCounts:r.ruleCounts||{}
    };
  }

  function compactQuote(q){
    if(!q)return null;
    return {score:q.score,level:q.level,packageName:q.packageName,range:q.range,manual:!!q.manual,
      volumeText:q.volumeText,shapeText:q.shapeText,densityText:q.densityText,reviewText:q.reviewText};
  }

  function currentBranding(){
    return {
      client:(brandClient?.value||'').trim().slice(0,80),
      project:(brandProject?.value||'').trim().slice(0,80),
      preparedBy:(brandBy?.value||'Spreadsheet Rescue').trim().slice(0,80) || 'Spreadsheet Rescue'
    };
  }

  function syncBranding(){SR_STATE.branding=currentBranding()}
  [brandClient,brandProject,brandBy].forEach(el=>el?.addEventListener('input',syncBranding));

  function issueTotal(r){
    return (r?.issues||[]).reduce((sum,i)=>sum+Number(i.count||0),0);
  }

  function loadHistory(){
    try{
      const parsed=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');
      return Array.isArray(parsed)?parsed:[];
    }catch{return []}
  }

  function writeHistory(items){
    try{localStorage.setItem(HISTORY_KEY,JSON.stringify(items.slice(0,12)))}catch{}
  }

  function saveScanHistory(report,quote){
    if(!report)return;
    const items=loadHistory();
    const snapshot={
      id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,
      savedAt:new Date().toISOString(),
      report:compactReport(report),
      quote:compactQuote(quote)
    };
    // Avoid obvious double-save if the same file/scan was just rendered again in < 3 sec.
    const prev=items[0];
    if(prev && prev.report?.fileName===snapshot.report.fileName && prev.report?.scannedAt===snapshot.report.scannedAt)return;
    items.unshift(snapshot);writeHistory(items);
  }

  function historyEsc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
  const historyRoot=document.querySelector('[data-history]');
  const historyList=document.querySelector('[data-history-list]');
  const historyCompare=document.querySelector('[data-history-compare]');
  const compareContent=document.querySelector('[data-compare-content]');
  let compareIds=[];

  function renderHistory(){
    if(!historyRoot)return;
    const items=loadHistory();
    const count=items.length;
    const avg=count?Math.round(items.reduce((a,x)=>a+Number(x.report?.scores?.overall||0),0)/count):null;
    const low=count?Math.min(...items.map(x=>Number(x.report?.scores?.overall||0))):null;
    const rows=items.reduce((a,x)=>a+Number(x.report?.rows||0),0);
    historyRoot.querySelector('[data-history-stat="count"]').textContent=count;
    historyRoot.querySelector('[data-history-stat="avg"]').textContent=avg==null?'—':`${avg}/100`;
    historyRoot.querySelector('[data-history-stat="low"]').textContent=low==null?'—':`${low}/100`;
    historyRoot.querySelector('[data-history-stat="rows"]').textContent=rows.toLocaleString('id-ID');

    compareIds=compareIds.filter(id=>items.some(x=>x.id===id)).slice(0,2);
    if(!items.length){
      historyList.innerHTML='<div class="history-empty">Belum ada scan yang tersimpan. Jalankan Data X-Ray; summary-nya otomatis muncul di sini.</div>';
      historyCompare.classList.remove('is-ready');return;
    }

    historyList.innerHTML=items.map(item=>{
      const r=item.report||{}, health=Number(r.scores?.overall||0), issues=issueTotal(r);
      const date=new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(item.savedAt));
      return `<div class="history-row" data-history-id="${historyEsc(item.id)}">
        <input class="history-check" type="checkbox" aria-label="Compare ${historyEsc(r.fileName)}" data-history-check="${historyEsc(item.id)}" ${compareIds.includes(item.id)?'checked':''}>
        <div class="history-file"><strong>${historyEsc(r.fileName||'Untitled scan')}</strong><span>${historyEsc(date)} • ${historyEsc(r.format||'')}</span></div>
        <div class="history-metric"><small>rows</small><b>${Number(r.rows||0).toLocaleString('id-ID')}</b></div>
        <div class="history-metric"><small>issues</small><b>${issues.toLocaleString('id-ID')}</b></div>
        <div><span class="health-pill">${health}/100</span></div>
        <div class="history-actions"><button class="history-mini-btn" type="button" data-history-open="${historyEsc(item.id)}">REPORT</button><button class="history-mini-btn danger" type="button" data-history-delete="${historyEsc(item.id)}">×</button></div>
      </div>`;
    }).join('');

    historyList.querySelectorAll('[data-history-check]').forEach(cb=>cb.addEventListener('change',()=>{
      const id=cb.dataset.historyCheck;
      if(cb.checked){
        if(compareIds.length>=2){cb.checked=false;return}
        compareIds.push(id);
      }else compareIds=compareIds.filter(x=>x!==id);
      renderComparison();
    }));
    historyList.querySelectorAll('[data-history-open]').forEach(btn=>btn.addEventListener('click',()=>openHistoryReport(btn.dataset.historyOpen)));
    historyList.querySelectorAll('[data-history-delete]').forEach(btn=>btn.addEventListener('click',()=>deleteHistory(btn.dataset.historyDelete)));
    renderComparison();
  }

  function compareCard(item){
    const r=item.report||{}, s=r.scores||{};
    return `<div class="compare-card"><small>${historyEsc(r.format||'SCAN')}</small><h4>${historyEsc(r.fileName||'Untitled')}</h4><div class="compare-big">${Number(s.overall||0)}</div>
      <div class="compare-dims">
        <div class="compare-dim">Structure<b>${Number(s.structure||0)}</b></div><div class="compare-dim">Complete<b>${Number(s.completeness||0)}</b></div>
        <div class="compare-dim">Consistent<b>${Number(s.consistency||0)}</b></div><div class="compare-dim">Validity<b>${Number(s.validity||0)}</b></div>
      </div><div class="compare-delta">${Number(r.rows||0).toLocaleString('id-ID')} rows • ${issueTotal(r).toLocaleString('id-ID')} detected issue count</div></div>`;
  }

  function renderComparison(){
    const items=loadHistory();
    if(compareIds.length!==2){historyCompare.classList.remove('is-ready');return}
    const a=items.find(x=>x.id===compareIds[0]), b=items.find(x=>x.id===compareIds[1]);
    if(!a||!b){historyCompare.classList.remove('is-ready');return}
    const delta=Number(b.report?.scores?.overall||0)-Number(a.report?.scores?.overall||0);
    compareContent.innerHTML=`<div class="compare-grid">${compareCard(a)}<div class="compare-vs">VS<br><small>${delta>0?'+':''}${delta} HEALTH</small></div>${compareCard(b)}</div>`;
    historyCompare.classList.add('is-ready');
  }

  function openHistoryReport(id){
    const item=loadHistory().find(x=>x.id===id);if(!item)return;
    SR_STATE.report=item.report;SR_STATE.quote=item.quote;SR_STATE.intake=null;
    const clientReportButton=document.querySelector('[data-build-report]');if(clientReportButton)clientReportButton.disabled=false;
    openClientReport();
  }

  function deleteHistory(id){
    writeHistory(loadHistory().filter(x=>x.id!==id));compareIds=compareIds.filter(x=>x!==id);renderHistory();
  }

  document.querySelector('[data-history-clear]')?.addEventListener('click',()=>{
    if(!loadHistory().length)return;
    if(confirm('Hapus semua scan history di browser ini? Source files tidak pernah disimpan.')){writeHistory([]);compareIds=[];renderHistory()}
  });

  function utf8ToB64url(str){
    const bytes=new TextEncoder().encode(str);let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));
    return btoa(bin).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  }
  function b64urlToUtf8(str){
    let s=str.replaceAll('-','+').replaceAll('_','/');while(s.length%4)s+='=';
    const bin=atob(s),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return new TextDecoder().decode(bytes);
  }

  function makeShareState(){
    syncBranding();
    const r=SR_STATE.report||{},s=r.scores||{},f=r.findings||{},rc=r.ruleCounts||{},q=SR_STATE.quote||{};
    const intake=SR_STATE.intake||null,a=intake?.answers||null,rec=intake?.recommendation||null,b=SR_STATE.branding||{};
    return {v:3,r:{n:r.fileName||'',f:r.format||'',t:r.scannedAt||'',R:r.rows||0,C:r.columns||0,S:r.sheets||1,
      s:{o:s.overall||0,t:s.structure||0,c:s.completeness||0,i:s.consistency||0,d:s.duplicates||0,v:s.validity||0},
      x:{m:f.missingValues||0,d:f.duplicateRows||0,i:f.invalidDates||0,f:f.mixedDateColumns||0,w:f.whitespaceAndCasing||0,r:f.malformedRows||0,h:f.duplicateHeaders||0,y:f.mixedTypeColumns||0,t:f.suspiciousTotals||0,s:f.safeFixCandidates||0},
      c:{w:rc.trim||0,d:rc.date||0,m:rc.money||0}},
      q:SR_STATE.quote?{s:q.score||0,l:q.level||'',p:q.packageName||'',r:q.range||'',m:!!q.manual}:null,
      i:intake?{a:a?{f:a.frequency||'',d:a.deadline||'',o:a.output||'',r:a.rules||'',s:a.sensitivity||'',h:a.handoff||''}:null,
        r:rec?{p:rec.finalPackage||'',v:rec.finalRange||'',m:!!rec.manual}:null}:null,
      b:{c:b.client||'',p:b.project||'',y:b.preparedBy||'Spreadsheet Rescue'}};
  }

  function makeShareLink(){
    if(!SR_STATE.report)return '';
    const payload=utf8ToB64url(JSON.stringify(makeShareState()));
    return `${location.href.split('#')[0]}#sr=${payload}`;
  }

  async function renderQR(link){
    qrWrap.innerHTML='';
    if(link.length>1800){
      qrWrap.innerHTML='<div class="qr-fallback">Share link terlalu panjang untuk QR yang reliable. Gunakan COPY LINK atau DOWNLOAD HTML.</div>';
      return;
    }
    if(typeof globalThis.QRCode==='function'){
      try{
        new QRCode(qrWrap,{text:link,width:158,height:158,colorDark:'#101828',colorLight:'#FFFFFF',correctLevel:QRCode.CorrectLevel.M});
        return;
      }catch(e){ console.warn('QR render failed',e); }
    }
    qrWrap.innerHTML='<div class="qr-fallback">QR engine tidak tersedia. Share link tetap bisa dicopy.</div>';
  }

  async function openShareTray(){
    if(!SR_STATE.report)return;
    syncBranding();
    // Re-render so client/project labels are immediately reflected in the report.
    reportArticle.innerHTML=buildReportHTML();
    const link=makeShareLink();shareInput.value=link;shareTray.classList.add('is-open');
    shareWarning.textContent=location.protocol==='file:'
      ? 'LOCAL PREVIEW: link/QR ini menunjuk ke file path di device ini. Setelah website di-host, mekanisme yang sama menjadi cross-device share link.'
      : 'Link menyimpan summary report di URL fragment. Server hosting tidak menerima fragment, tetapi siapa pun yang memiliki link dapat membaca summary tersebut. Source spreadsheet rows tidak disertakan.';
    await renderQR(link);
  }
  shareBtn?.addEventListener('click',()=>shareTray.classList.contains('is-open')?shareTray.classList.remove('is-open'):openShareTray());
  shareCopyBtn?.addEventListener('click',async()=>{
    const link=shareInput.value;if(!link)return;
    try{await navigator.clipboard.writeText(link)}catch{shareInput.select();document.execCommand('copy')}
    const old=shareCopyBtn.textContent;shareCopyBtn.textContent='COPIED ✓';setTimeout(()=>shareCopyBtn.textContent=old,1100);
  });

  function applySharedHash(){
    const m=location.hash.match(/^#sr=([A-Za-z0-9_-]+)$/);if(!m)return;
    try{
      const state=JSON.parse(b64urlToUtf8(m[1]));if(!state?.report && !state?.r)return;
      if(state.v===3 && state.r){
        const z=state.r,ss=z.s||{},x=z.x||{},c=z.c||{};
        const findings={missingValues:x.m||0,duplicateRows:x.d||0,invalidDates:x.i||0,mixedDateColumns:x.f||0,whitespaceAndCasing:x.w||0,malformedRows:x.r||0,duplicateHeaders:x.h||0,mixedTypeColumns:x.y||0,suspiciousTotals:x.t||0,safeFixCandidates:x.s||0};
        SR_STATE.report={version:'Shared Report v3',fileName:z.n||'Shared report',format:z.f||'',localProcessing:true,scannedAt:z.t||new Date().toISOString(),rows:z.R||0,columns:z.C||0,sheets:z.S||1,
          scores:{overall:ss.o||0,structure:ss.t||0,completeness:ss.c||0,consistency:ss.i||0,duplicates:ss.d||0,validity:ss.v||0},findings,
          issues:[{label:'Missing values',count:findings.missingValues},{label:'Duplicate rows (flag only)',count:findings.duplicateRows},{label:'Invalid dates',count:findings.invalidDates},{label:'Mixed date-format columns',count:findings.mixedDateColumns},{label:'Whitespace / casing variants',count:findings.whitespaceAndCasing},{label:'Malformed row widths',count:findings.malformedRows},{label:'Suspicious qty × price totals',count:findings.suspiciousTotals}],
          ruleCounts:{trim:c.w||0,date:c.d||0,money:c.m||0}};
        SR_STATE.quote=state.q?{score:state.q.s||0,level:state.q.l||'',packageName:state.q.p||'',range:state.q.r||'',manual:!!state.q.m}:null;
        SR_STATE.intake=state.i?{answers:state.i.a?{frequency:state.i.a.f||'',deadline:state.i.a.d||'',output:state.i.a.o||'',rules:state.i.a.r||'',sensitivity:state.i.a.s||'',handoff:state.i.a.h||''}:null,recommendation:state.i.r?{finalPackage:state.i.r.p||'',finalRange:state.i.r.v||'',manual:!!state.i.r.m}:null}:null;
        SR_STATE.branding=state.b?{client:state.b.c||'',project:state.b.p||'',preparedBy:state.b.y||'Spreadsheet Rescue'}:SR_STATE.branding;
      }else{
        SR_STATE.report=state.report;SR_STATE.quote=state.quote||null;SR_STATE.intake=state.intake||null;SR_STATE.branding=state.branding||SR_STATE.branding;
      }
      if(SR_STATE.intake?.answers && !SR_STATE.intake.brief){
        const a=SR_STATE.intake.answers;
        SR_STATE.intake.brief=['SHARED INTAKE SUMMARY',
          `Frequency: ${a.frequency||'—'}`,`Deadline: ${a.deadline||'—'}`,`Output: ${a.output||'—'}`,
          `Business rules: ${a.rules||'—'}`,`Sensitivity: ${a.sensitivity||'—'}`,`Handoff: ${a.handoff||'—'}`
        ].join('\n');
      }
      if(brandClient)brandClient.value=SR_STATE.branding.client||'';if(brandProject)brandProject.value=SR_STATE.branding.project||'';if(brandBy)brandBy.value=SR_STATE.branding.preparedBy||'Spreadsheet Rescue';
      const clientReportButton=document.querySelector('[data-build-report]');if(clientReportButton)clientReportButton.disabled=false;
      setTimeout(()=>openClientReport(),80);
    }catch(e){console.warn('Invalid shared report payload',e)}
  }

  // Add client branding to the existing report renderer without changing the base visual language.
  const originalBuildReportHTML=buildReportHTML;
  buildReportHTML=function(){
    syncBranding();
    let markup=originalBuildReportHTML();
    const b=SR_STATE.branding||{};
    const labels=[];
    if(b.client)labels.push(`Prepared for: ${reportEsc(b.client)}`);
    if(b.project)labels.push(`Project: ${reportEsc(b.project)}`);
    if(labels.length){
      markup=markup.replace('<h1 class="report-title">',`<div class="report-client-label">${labels.join(' • ')}</div><h1 class="report-title">`);
    }
    if(b.preparedBy){
      markup=markup.replace('Spreadsheet Rescue • Synthetic portfolio tooling / client diagnostic',`${reportEsc(b.preparedBy)} • Spreadsheet Rescue diagnostic`);
    }
    return markup;
  };

  // Ensure branding is captured when opening a normal report.
  const originalOpenClientReport=openClientReport;
  openClientReport=function(){syncBranding();originalOpenClientReport()};

  renderHistory();
  applySharedHash();
  window.__SR_QA__.ready=true;

})();
