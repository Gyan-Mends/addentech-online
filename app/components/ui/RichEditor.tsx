import { LinksFunction } from '@remix-run/node';
import React, { useEffect, useState } from 'react';
export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" }];
};
// This is a simpler implementation that works with Remix SSR
interface RichEditorProps {
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  isDisabled?: boolean;
  className?: string;
}

const RichEditor: React.FC<RichEditorProps> = ({
  name,
  label,
  placeholder = 'Enter text here...',
  defaultValue = '',
  isDisabled = false,
  className = '',
}) => {
  const [isClient, setIsClient] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  // Detect client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load the editor dynamically only on client-side
  useEffect(() => {
    if (isClient && !editorLoaded) {
      // Dynamically import the editor
      import('react-quill').then((ReactQuill) => {
        setEditorInstance(() => ReactQuill.default);
        setEditorLoaded(true);
      });
    }
  }, [isClient, editorLoaded]);

  // When on server or editor not loaded yet, render a textarea
  if (!isClient || !editorLoaded || !editorInstance) {
    return (
      <div className={`w-full ${className}`}>
        {label && <label className="block text-sm font-medium mb-1">{label}</label>}
        <textarea
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          disabled={isDisabled}
          className={`w-full min-h-[200px] p-2 rounded-md border ${
            isDisabled ? 'bg-gray-100 opacity-75' : 'bg-white'
          }`}
        />
      </div>
    );
  }

  // Client-side with loaded editor
  const QuillEditor = editorInstance;
  
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <QuillEditor
        theme="snow"
        modules={modules}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={isDisabled}
        className="h-[50vh] mb-10"
      />
      <input type="hidden" name={name} value={defaultValue} />
    </div>
  );
};

export default RichEditor;
