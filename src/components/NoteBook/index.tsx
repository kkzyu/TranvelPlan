import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 

function RichTextEditor() {
    const [value, setValue] = useState('');
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'image'],
            ['clean']
        ],
        };

  return (
      <ReactQuill
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
        placeholder='开始记录你的旅游笔记吧~'
        />
  );
}

export default RichTextEditor;