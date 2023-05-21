import fs from 'fs'
import path from 'path'
import * as cheerio from 'cheerio'

const HTML_FILE_PATH = path.join(__dirname, './files/buildspace-so-demoday.html');
const OUTPUT_FILE_PATH = path.join(__dirname, "./files/buildspace-nw-s3-grads.csv");
const GRID_ITEM_SELECTOR = ".framer-3qm0wm > .framer-1wkjeqj-container";
// selector based on `GRID_ITEM_SELECTOR`
const TITLE_SELECTOR = "> div > div > div.framer-1ucpvsp > div.framer-1kvm7p8 > div.framer-1i5kbww > p";
const CATEGORY_SELECTOR = "> div > div > div.framer-1ucpvsp > div.framer-1kvm7p8 > div.framer-nebym4 > div > p";
const HOUSE_SELECTOR = "> div > div > div.framer-1ucpvsp > div.framer-1u9uqzl > div.framer-s9gdz4 > div > p";
const PROJECT_LINK_SELECTOR = "> div > div > div.framer-1ucpvsp > div.framer-1u9uqzl > div.framer-1etal6g > a.framer-1ut5wmu.framer-10sms40";
const TWITTER_LINK_SELECTOR = "> div > div > div.framer-1ucpvsp > div.framer-1u9uqzl > div.framer-1etal6g > a.framer-1jrlt0f.framer-10sms40";

const CSV_FIRST_ROW = [
  "title",
  "category",
  "house",
  "link",
  "twitter",
];

const main = () => {
  console.log(`> start extracting projects info from ${HTML_FILE_PATH}`);

  // Read the HTML file
  const html = fs.readFileSync(HTML_FILE_PATH, 'utf-8');
  
  // Load the HTML into Cheerio
  const $ = cheerio.load(html);
  
  // Use a CSS selector to target the grid items
  const items = $(GRID_ITEM_SELECTOR);

  const projects: string[][] = [CSV_FIRST_ROW];

  // Loop through the items and extract the desired data
  items.each((_, element) => {
    // Access and manipulate the element as needed
    const title = $(element).find(TITLE_SELECTOR).text().trim();
    const category = $(element).find(CATEGORY_SELECTOR).text().trim();
    const house = $(element).find(HOUSE_SELECTOR).text().trim();
    const projectLink = $(element).find(PROJECT_LINK_SELECTOR).attr('href')?.trim() || "";
    const twitterLink = $(element).find(TWITTER_LINK_SELECTOR).attr('href')?.trim() || "";
    projects.push([
      title,
      category.replace(/,/g, '-'),
      house,
      encodeURI(projectLink.replace("./", "https://buildspace.so/")),
      twitterLink,
    ]);
  });

  console.log(`> extracted ${items.length} projects`);

  const csvContent = projects
    .map(row => row.map(text => `"${text}"`).join(','))
    .join('\n');

  fs.writeFileSync(
    OUTPUT_FILE_PATH,
    csvContent,
    { encoding: "utf-8" }
  )

  console.log(`> done saving extracted data in ${OUTPUT_FILE_PATH}`);
}

main();
