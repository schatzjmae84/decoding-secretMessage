import { load } from 'cheerio';

// Main function to fetch and decode the message
async function fetchDecodedMessage(url) {

    try {
        // Fetch the published Google Doc
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); 
        }

        // Load the HTML into cheerio for parsing
        const html = await response.text();
        const $ = load(html);

        // Initialize variables to track max coordinates and entries
        let maxX = 0;
        let maxY = 0;
        const entries = [];  // Array to hold {x, y, char} objects

        // Parse table rows for entries
        $("table tr").each((_i, row) => {
            const cells = $(row).find("td");

            // Ensure there are exactly 3 cells in each row (x, y, char)
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

        // Populate the grid with characters from entries (considering y=0 at bottom)
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

const url = 'https://docs.google.com/document/d/e/2PACX-1vRPzbNQcx5UriHSbZ-9vmsTow_R6RRe7eyAU60xIF9Dlz-vaHiHNO2TKgDi7jy4ZpTpNqM7EvEcfr_p/pub';
fetchDecodedMessage(url);

