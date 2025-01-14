import React, { useState } from 'react';

// Dynamically load ReactQuill to prevent SSR issues
const ReactQuill = typeof window === "object" ? require("react-quill") : () => false


// Import ReactQuill styles
import 'react-quill/dist/quill.snow.css'; // Ensure the CSS is bundled correctly
import 'react-quill/dist/quill.core.css'; // Ensure the CSS is bundled correctly
import 'react-quill/dist/quill.bubble.css'; // Ensure the CSS is bundled correctly

const MyComponent = () => {
    const [value, setValue] = useState('');

    // Toolbar and editor configurations
    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'], // Clear formatting button
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link', 'image',
    ];

    return (
        <div>
            <h1>Rich Text Editor</h1>
            <ReactQuill

                theme="snow"
                value={value}
                onChange={setValue}
                modules={modules}
                formats={formats}
                placeholder="Start typing here..."
            />
        </div>
    );
};

export default MyComponent;
