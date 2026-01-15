import * as XLSX from 'xlsx';
import * as fs from 'fs';

const data = [
    { ID: 1, Product: "Widget A", Category: "Gadgets", Date: "2023-01-01", Revenue: 1000, Cost: 500 },
    { ID: 2, Product: "Widget B", Category: "Gadgets", Date: "2023-01-02", Revenue: 1200, Cost: 600 },
    { ID: 3, Product: "Tool X", Category: "Tools", Date: "2023-01-03", Revenue: 800, Cost: 300 },
    { ID: 4, Product: "Widget A", Category: "Gadgets", Date: "2023-01-04", Revenue: 1100, Cost: 550 },
    { ID: 5, Product: "Tool Y", Category: "Tools", Date: "2023-01-05", Revenue: 1500, Cost: 800 },
    { ID: 6, Product: "Widget C", Category: "Gadgets", Date: "2023-01-06", Revenue: 950, Cost: 400 },
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Data");

XLSX.writeFile(workbook, "sample_data.xlsx");
console.log("Created sample_data.xlsx");
