import { load } from 'cheerio';

// Main function to fetch and decode the message
async function fetchDecodedMessage(url) {

    try {
        // Fetch the published Google Doc
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); 
        }

        // Parse the HTML content with Cheerio
        const html = await response.text();
        const $ = load(html);

        // Variables to track grid size and entries
        let maxX = 0;
        let maxY = 0;
        const entries = [];  // Array to hold {x, y, char} objects

        // Iterate over each table row to extract coordinates and characters
        $("table tr").each((i, row) => {
            const cells = $(row).find("td");

            // Ensure there are exactly 3 cells (x, y, char)
            if (cells.length === 3) {
                const x = parseInt($(cells[0]).text().trim(), 10);
                const char = $(cells[1]).text().trim();
                const y = parseInt($(cells[2]).text().trim(), 10);                

                // Only add valid entries
                if (!isNaN(x) && !isNaN(y)) {
                    entries.push({ x, y, char });

                    // Update maxX and maxY for grid dimensions
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                }
            }
        });

        // Initialize a grid with spaces based on maxX and maxY
        const grid = Array.from({ length: maxY + 1 }, () => 
            Array(maxX + 1).fill(" ")
        );

        // Place characters in the grid based on their coordinates
        entries.forEach(({ x, y, char }) => {
            grid[maxY-y][x] = char;
        });

        // Print the grid to the console 
        grid.forEach(row => {
            console.log(row.join(""));
        });

        return entries; // Return entries as an array of objects {x, y, char}
    } catch (error) {
        console.error('Error fetching or parsing document:', error); // Log any errors
        return [];
    }
}

const url = 'https://docs.google.com/document/d/e/2PACX-1vTMOmshQe8YvaRXi6gEPKKlsC6UpFJSMAk4mQjLm_u1gmHdVVTaeh7nBNFBRlui0sTZ-snGwZM4DBCT/pub';
fetchDecodedMessage(url);

