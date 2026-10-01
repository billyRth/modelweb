const fs = require('fs');
const http = require('http');
const path = require('path');
const { pathToFileURL } = require('url');
(async () => {
  const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end(fs.readFileSync('index.html')); }).listen(8765, '127.0.0.1');
  const puppeteer = require('C:/Users/billy/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core');
  const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--ignore-certificate-errors'],userDataDir:path.resolve('.perf-browser')});
  try {
    const page = await browser.newPage();
    for (const [name, width, reduce] of []) {
      await page.setViewport({width,height:844});
      await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:reduce?'reduce':'no-preference'}]);
      const errors=[];
      const onError=e=>errors.push(e.message); page.on('pageerror',onError);
      await page.goto('http://127.0.0.1:8765',{waitUntil:'networkidle0',timeout:60000});
      await new Promise(r=>setTimeout(r,5000));
      console.log(name,await page.evaluate(()=>({gsap:!!window.gsap,scrollTrigger:!!window.ScrollTrigger,lenis:document.documentElement.classList.contains('lenis'),motion:document.documentElement.classList.contains('motion'),hiddenReveals:[...document.querySelectorAll('[data-reveal]')].filter(e=>getComputedStyle(e).opacity==='0').length})),errors);
      await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
      await new Promise(r=>setTimeout(r,1600));
      page.off('pageerror',onError);
    }
    const {default:lighthouse}=await import(pathToFileURL('C:/Users/billy/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/lighthouse/core/index.js'));
    const result=await lighthouse('http://127.0.0.1:8765',{port:Number(new URL(browser.wsEndpoint()).port),disableStorageReset:true,onlyCategories:['performance'],output:'json',formFactor:'mobile',throttlingMethod:'simulate',throttling:{cpuSlowdownMultiplier:4},screenEmulation:{mobile:true,width:390,height:844,deviceScaleFactor:1,disabled:false}});
    fs.writeFileSync('lighthouse-mobile.json',JSON.stringify(result.lhr,null,2));
    console.log('Lighthouse mobile 4x',JSON.stringify(Object.fromEntries(['total-blocking-time','first-contentful-paint','largest-contentful-paint','bootup-time'].map(k=>[k,result.lhr.audits[k].numericValue]))));
  } finally { await browser.close();server.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
