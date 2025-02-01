//pages/api/scrape.js
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new"
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await page.goto('https://www.lrs.lt/sip/portal.show?p_r=35299&p_k=1&filtertype=0', {
      waitUntil: 'networkidle0'
    });

    const members = await page.evaluate(() => {
      const memberElements = document.querySelectorAll('.sn-list-name a');
      return Array.from(memberElements).map(element => ({
        name: element.getAttribute('title'),
        profileUrl: element.href
      }));
    });

    console.log(`Found ${members.length} members`);

    const results = [];
    for (const member of members) {
      try {
        console.log(`\nProcessing member: ${member.name}`);
        
        // Get member's main profile and email
        await page.goto(member.profileUrl, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });

        const email = await page.evaluate(() => {
          const emailElement = document.querySelector('a[href^="mailto:"]');
          return emailElement ? emailElement.href.replace('mailto:', '') : null;
        });

        if (email) {
          console.log(`Found email: ${email}`);
          results.push({
            role: 'Member',
            committee: '',
            name: member.name,
            email: email
          });
        }

        // Get Consultants/Assistants
        console.log('Looking for Consultants/Assistants...');
        const consultantsLink = await page.$('a[title="Patarėjai, padėjėjai"]');
        if (consultantsLink) {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            consultantsLink.click()
          ]);

          const assistants = await page.evaluate(() => {
            const results = [];
            const table = document.querySelector('#pad-lentele');
            if (table) {
              const rows = table.querySelectorAll('tr:not(.group-head)');
              rows.forEach(row => {
                const nameCell = row.querySelector('.asm-name');
                const emailCell = row.querySelector('.mail');
                if (nameCell && emailCell) {
                  results.push({
                    name: nameCell.textContent.trim(),
                    email: emailCell.href.replace('mailto:', '')
                  });
                }
              });
            }
            return results;
          });

          console.log(`Found ${assistants.length} consultants/assistants:`);
          assistants.forEach(a => console.log(`- ${a.name}: ${a.email}`));

          assistants.forEach(assistant => {
            results.push({
              role: 'Consultant / Assistant',
              committee: '',
              name: assistant.name,
              email: assistant.email
            });
          });
        }

        // Get Public Consultants
        console.log('Looking for Public Consultants...');
        await page.goto(member.profileUrl, { waitUntil: 'networkidle0' });
        
        const publicConsultantsLink = await page.$('a[title="Visuomeniniai konsultantai"]');
        if (publicConsultantsLink) {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            publicConsultantsLink.click()
          ]);

          const publicConsultants = await page.evaluate(() => {
            const results = [];
            const container = document.querySelector('.document-text-container');
            if (container) {
              const paragraphs = container.querySelectorAll('p');
              let currentName = null;

              paragraphs.forEach(p => {
                const text = p.textContent.trim();
                if (text.startsWith('Visuomeninis patarėjas')) {
                  currentName = text.replace('Visuomeninis patarėjas', '').trim();
                } else if (text.startsWith('El. p.') && currentName) {
                  const emailLink = p.querySelector('a');
                  if (emailLink) {
                    results.push({
                      name: currentName,
                      email: emailLink.href.replace('mailto:', '')
                    });
                  }
                  currentName = null;
                }
              });
            }
            return results;
          });

          console.log(`Found ${publicConsultants.length} public consultants:`);
          publicConsultants.forEach(c => console.log(`- ${c.name}: ${c.email}`));

          publicConsultants.forEach(consultant => {
            results.push({
              role: 'Public consultant',
              committee: '',
              name: consultant.name,
              email: consultant.email
            });
          });
        }

      } catch (error) {
        console.error(`Error processing ${member.name}:`, error);
      }
    }

    await browser.close();
    console.log('Processing completed. Total entries:', results.length);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('Scraping error:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({ success: false, error: error.message });
  }
}