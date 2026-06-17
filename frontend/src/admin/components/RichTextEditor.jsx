import React, { useRef, useState, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Write something amazing..." }) => {
  const editorRef = useRef(null);
  const [isSourceView, setIsSourceView] = useState(false);
  const [sourceCode, setSourceCode] = useState(value || '');

  // Synchronize internal state with initial value once
  useEffect(() => {
    if (editorRef.current && !isSourceView) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setSourceCode(value || '');
  }, [value]);

  const executeCommand = (command, argument = null) => {
    document.execCommand(command, false, argument);
    handleEditorChange();
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setSourceCode(html);
      if (onChange) {
        onChange(html);
      }
    }
  };

  const handleSourceChange = (e) => {
    const html = e.target.value;
    setSourceCode(html);
    if (onChange) {
      onChange(html);
    }
  };

  const toggleSourceView = () => {
    if (isSourceView) {
      // Switching from source code back to visual editor
      setIsSourceView(false);
      // We must wait a tiny tick for the ref to render
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = sourceCode;
        }
      }, 0);
    } else {
      // Switching from visual editor to source code
      setIsSourceView(true);
    }
  };

  const createLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  return (
    <div style={{
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '350px'
    }}>
      {/* Editor Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '8px',
        background: '#f8fafc',
        borderBottom: '1px solid #cbd5e1',
        alignItems: 'center'
      }}>
        <button type="button" onClick={() => executeCommand('bold')} style={btnStyle} title="Bold"><b>B</b></button>
        <button type="button" onClick={() => executeCommand('italic')} style={btnStyle} title="Italic"><i>I</i></button>
        <button type="button" onClick={() => executeCommand('underline')} style={btnStyle} title="Underline"><u>U</u></button>
        <button type="button" onClick={() => executeCommand('strikeThrough')} style={btnStyle} title="Strikethrough"><strike>S</strike></button>
        
        <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px' }} />

        <button type="button" onClick={() => executeCommand('formatBlock', '<h2>')} style={btnStyle} title="Heading 2">H2</button>
        <button type="button" onClick={() => executeCommand('formatBlock', '<h3>')} style={btnStyle} title="Heading 3">H3</button>
        <button type="button" onClick={() => executeCommand('formatBlock', '<p>')} style={btnStyle} title="Paragraph">P</button>

        <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px' }} />

        <button type="button" onClick={() => executeCommand('insertUnorderedList')} style={btnStyle} title="Bullet List">• List</button>
        <button type="button" onClick={() => executeCommand('insertOrderedList')} style={btnStyle} title="Numbered List">1. List</button>

        <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px' }} />

        <button type="button" onClick={() => executeCommand('justifyLeft')} style={btnStyle} title="Align Left">←</button>
        <button type="button" onClick={() => executeCommand('justifyCenter')} style={btnStyle} title="Align Center">↔</button>
        <button type="button" onClick={() => executeCommand('justifyRight')} style={btnStyle} title="Align Right">→</button>

        <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px' }} />

        <button type="button" onClick={createLink} style={btnStyle} title="Insert Link">🔗</button>
        <button type="button" onClick={() => executeCommand('unlink')} style={btnStyle} title="Remove Link">🔗❌</button>
        <button type="button" onClick={() => executeCommand('removeFormat')} style={btnStyle} title="Clear Formatting">🧹</button>

        <div style={{ flexGrow: 1 }} />

        <button 
          type="button" 
          onClick={toggleSourceView} 
          style={{
            ...btnStyle,
            background: isSourceView ? '#64748b' : '#f1f5f9',
            color: isSourceView ? '#fff' : '#475569',
            fontWeight: '600',
            width: 'auto',
            padding: '4px 10px'
          }}
          title="Toggle HTML Source Code View"
        >
          {isSourceView ? 'Visual Editor' : 'HTML Source'}
        </button>
      </div>

      {/* Editor Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {isSourceView ? (
          <textarea
            value={sourceCode}
            onChange={handleSourceChange}
            placeholder="Write HTML code here..."
            style={{
              width: '100%',
              flexGrow: 1,
              padding: '16px',
              border: 'none',
              fontFamily: 'monospace',
              fontSize: '14px',
              outline: 'none',
              resize: 'none',
              background: '#0f172a',
              color: '#f8fafc',
              minHeight: '300px'
            }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorChange}
            style={{
              flexGrow: 1,
              padding: '16px',
              outline: 'none',
              minHeight: '300px',
              overflowY: 'auto',
              color: '#1e293b',
              fontSize: '15px',
              lineHeight: '1.6'
            }}
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
};

const btnStyle = {
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#334155',
  transition: 'all 0.15s ease-in-out',
  outline: 'none'
};

export default RichTextEditor;
