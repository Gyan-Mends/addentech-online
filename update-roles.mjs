import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the file
const filePath = join(__dirname, 'app', 'routes', 'admin.users.tsx');

// Read the file
let content = readFileSync(filePath, 'utf8');

// Replace HOD with Department Head and Manager in the edit form
content = content.replace(
  '{ key: "hod", value: "hod", display_name: "HOD" },',
  '{ key: "department_head", value: "department_head", display_name: "Department Head" },\n                                    { key: "manager", value: "manager", display_name: "Manager" },'
);

// Replace HOD with Department Head and Manager in the create form
content = content.replace(
  '{ key: "hod", value: "hod", display_name: "HOD" },',
  '{ key: "department_head", value: "department_head", display_name: "Department Head" },\n                                { key: "manager", value: "manager", display_name: "Manager" },'
);

// Write the changes back to the file
writeFileSync(filePath, content, 'utf8');

console.log('Role options updated successfully in admin.users.tsx');
