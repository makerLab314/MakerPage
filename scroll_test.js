const page = arguments[0];
await page.evaluate(() => {
    window.scrollTo(0, document.querySelector('#projects').offsetTop);
});
