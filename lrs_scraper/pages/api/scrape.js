// pages/api/scrape.js
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
    });
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Get members list
    await page.goto('https://www.lrs.lt/sip/portal.show?p_r=35299&p_k=1&filtertype=0', {
      waitUntil: 'networkidle0'
    });

    // Extract member links and names
    const members = await page.evaluate(() => {
      const memberElements = document.querySelectorAll('.sn-list-name a');
      return Array.from(memberElements).map(element => ({
        name: element.getAttribute('title'),
        profileUrl: element.href
      }));
    });

    console.log(`Found ${members.length} members`);

    // Process each member
    const results = [];
    for (const member of members) {
      try {
        // Navigate to member's profile
        await page.goto(member.profileUrl, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        // Wait for email elements to be available
        await page.waitForSelector('a[href^="mailto:"], a[title="Telefono numeris"], a.link[href^="mailto:"]', {
          timeout: 5000
        }).catch(() => console.log('No email elements found immediately'));

        // Extract email
        const email = await page.evaluate(() => {
          // Try multiple selectors
          const emailSelectors = [
            'a[href^="mailto:"]',
            'a[title="Telefono numeris"]',
            'a.link[href^="mailto:"]'
          ];

          for (const selector of emailSelectors) {
            const element = document.querySelector(selector);
            if (element && element.href) {
              return element.href.replace('mailto:', '');
            }
          }

          // Try finding in text content
          const textContent = document.body.innerText;
          const emailRegex = /[A-Za-z0-9._%+-]+@lrs\.lt/g;
          const matches = textContent.match(emailRegex);
          return matches ? matches[0] : null;
        });

        results.push({
          name: member.name,
          email: email || ''
        });

        console.log(`Processed ${member.name}: ${email || 'No email found'}`);
      } catch (error) {
        console.error(`Error processing ${member.name}:`, error);
        results.push({
          name: member.name,
          email: ''
        });
      }
    }

    await browser.close();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('Scraping error:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({ success: false, error: error.message });
  }
}