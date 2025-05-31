const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'app', 'routes', 'admin.users.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

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
fs.writeFileSync(filePath, content, 'utf8');

console.log('Role options updated successfully in admin.users.tsx');
