import React, { useState, useRef, useEffect } from 'react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiList,
  FiCode,
  FiEye,
  FiMinus,
  FiDroplet
} from 'react-icons/fi';
import { MdFormatStrikethrough, MdFormatClear, MdFormatQuote, MdFormatListNumbered } from 'react-icons/md';
import { FaHighlighter } from 'react-icons/fa6';
import './RichTextEditor.css';

const FONT_FAMILIES = [
  { label: 'Default (Inter / Sans)', value: 'Inter, system-ui, -apple-system, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Georgia (Editorial Serif)', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Courier New (Monospace)', value: '"Courier New", Courier, monospace' }
];

const FONT_SIZES = [
  { label: '12px (Small)', value: '12px' },
  { label: '14px (Normal)', value: '14px' },
  { label: '16px (Medium)', value: '16px' },
  { label: '18px (Large)', value: '18px' },
  { label: '20px (Heading 4)', value: '20px' },
  { label: '24px (Heading 3)', value: '24px' },
  { label: '28px (Heading 2)', value: '28px' },
  { label: '32px (Heading 1)', value: '32px' }
];

const TEXT_COLORS = [
  { label: 'Dark Slate', value: '#0f172a' },
  { label: 'Slate Gray', value: '#475569' },
  { label: 'Primary Red', value: '#e11d48' },
  { label: 'Crimson', value: '#dc2626' },
  { label: 'Royal Blue', value: '#2563eb' },
  { label: 'Cyan / Teal', value: '#0891b2' },
  { label: 'Emerald Green', value: '#059669' },
  { label: 'Purple / Violet', value: '#7c3aed' },
  { label: 'Amber / Gold', value: '#d97706' },
  { label: 'Rose / Pink', value: '#e11d48' }
];

const HIGHLIGHT_COLORS = [
  { label: 'No Highlight', value: 'transparent' },
  { label: 'Sunny Yellow', value: '#fef08a' },
  { label: 'Amber Pastel', value: '#fde68a' },
  { label: 'Lime / Green', value: '#bbf7d0' },
  { label: 'Cyan Glow', value: '#a5f3fc' },
  { label: 'Sky Blue', value: '#bae6fd' },
  { label: 'Pastel Pink', value: '#fbcfe8' },
  { label: 'Lavender Purple', value: '#e9d5ff' },
  { label: 'Soft Orange', value: '#fed7aa' },
  { label: 'Muted Gray', value: '#e2e8f0' }
];

const RichTextEditor = ({
  value = '',
  onChange = () => {},
  placeholder = 'Type your content here...',
  minHeight = '240px'
}) => {
  const editorRef = useRef(null);
  const colorPickerRef = useRef(null);
  const highlightPickerRef = useRef(null);

  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState('#0f172a');
  const [currentHighlightColor, setCurrentHighlightColor] = useState('transparent');
  const [currentFont, setCurrentFont] = useState(FONT_FAMILIES[0].value);
  const [currentSize, setCurrentSize] = useState('14px');

  // Convert legacy plain text to HTML paragraphs if necessary
  const formatInitialValue = (val) => {
    if (!val) return '';
    if (/<[a-z][\s\S]*>/i.test(val)) {
      return val;
    }
    return val
      .split(/\n+/)
      .map(p => p.trim() ? `<p>${p.trim()}</p>` : '')
      .join('');
  };

  // Close color popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(e.target)) {
        setShowHighlightPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync incoming value to editor content if changed externally
  useEffect(() => {
    if (!editorRef.current) return;
    const formatted = formatInitialValue(value);
    if (editorRef.current.innerHTML !== formatted && !isSourceMode) {
      editorRef.current.innerHTML = formatted;
      setSourceCode(formatted);
    }
  }, [value, isSourceMode]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setSourceCode(html);
    onChange(html);
  };

  const exec = (command, val = null) => {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleInput();
  };

  // Apply custom font size
  const handleFontSizeChange = (size) => {
    setCurrentSize(size);
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
      return;
    }
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = size;
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    } catch (e) {
      document.execCommand('fontSize', false, '3');
    }
    handleInput();
  };

  // Apply font family
  const handleFontFamilyChange = (font) => {
    setCurrentFont(font);
    exec('fontName', font);
  };

  // Apply heading format
  const handleHeadingChange = (tag) => {
    if (tag === 'p') {
      exec('formatBlock', '<p>');
    } else {
      exec('formatBlock', `<${tag}>`);
    }
  };

  // Apply font color
  const handleTextColor = (color) => {
    setCurrentTextColor(color);
    exec('foreColor', color);
    setShowColorPicker(false);
  };

  // Apply font highlight
  const handleHighlightColor = (color) => {
    setCurrentHighlightColor(color);
    if (color === 'transparent') {
      exec('removeFormat');
    } else {
      exec('hiliteColor', color);
    }
    setShowHighlightPicker(false);
  };

  // Toggle HTML source mode
  const handleToggleSourceMode = () => {
    if (isSourceMode) {
      // Switching from HTML source to visual editor
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceCode;
      }
      onChange(sourceCode);
      setIsSourceMode(false);
    } else {
      // Switching from visual editor to HTML source
      if (editorRef.current) {
        setSourceCode(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
  };

  const handleSourceCodeChange = (e) => {
    setSourceCode(e.target.value);
    onChange(e.target.value);
  };

  // Count words
  const getWordCount = () => {
    const text = isSourceMode ? sourceCode.replace(/<[^>]*>/g, ' ') : (editorRef.current ? editorRef.current.innerText : '');
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  };

  return (
    <div className="rich-text-editor-container">
      {/* Formatting Toolbar */}
      <div className="rich-text-toolbar" onClick={(e) => e.stopPropagation()}>
        {/* Headings */}
        <div className="rich-text-toolbar-group">
          <select
            className="rte-select"
            onChange={(e) => handleHeadingChange(e.target.value)}
            defaultValue="p"
            title="Text Style / Heading"
            disabled={isSourceMode}
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1 (32px)</option>
            <option value="h2">Heading 2 (28px)</option>
            <option value="h3">Heading 3 (24px)</option>
            <option value="h4">Heading 4 (20px)</option>
          </select>
        </div>

        {/* Font Family */}
        <div className="rich-text-toolbar-group">
          <select
            className="rte-select"
            style={{ maxWidth: '145px' }}
            value={currentFont}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            title="Font Family"
            disabled={isSourceMode}
          >
            {FONT_FAMILIES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="rich-text-toolbar-group">
          <select
            className="rte-select"
            style={{ maxWidth: '115px' }}
            value={currentSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            title="Font Size"
            disabled={isSourceMode}
          >
            {FONT_SIZES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Font Styles: Bold, Italic, Underline, Strikethrough */}
        <div className="rich-text-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('bold')}
            title="Bold (Ctrl+B)"
            disabled={isSourceMode}
          >
            <FiBold size={15} />
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('italic')}
            title="Italic (Ctrl+I)"
            disabled={isSourceMode}
          >
            <FiItalic size={15} />
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('underline')}
            title="Underline (Ctrl+U)"
            disabled={isSourceMode}
          >
            <FiUnderline size={15} />
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('strikeThrough')}
            title="Strikethrough"
            disabled={isSourceMode}
          >
            <MdFormatStrikethrough size={16} />
          </button>
        </div>

        {/* Font Colors & Font Highlights */}
        <div className="rich-text-toolbar-group">
          {/* Font Text Color */}
          <div className="rte-color-picker-wrapper" ref={colorPickerRef}>
            <button
              type="button"
              className="rte-btn"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              title="Font Text Color"
              disabled={isSourceMode}
            >
              <FiDroplet size={14} style={{ color: currentTextColor }} />
              <span className="rte-color-btn-indicator" style={{ background: currentTextColor }}></span>
            </button>

            {showColorPicker && (
              <div className="rte-popover">
                <div className="rte-popover-title">Font Text Color</div>
                <div className="rte-color-grid">
                  {TEXT_COLORS.map((c) => (
                    <div
                      key={c.value}
                      className="rte-color-swatch"
                      style={{ background: c.value }}
                      onClick={() => handleTextColor(c.value)}
                      title={c.label}
                    />
                  ))}
                </div>
                <div className="rte-custom-color-row">
                  <input
                    type="color"
                    className="rte-custom-color-input"
                    value={currentTextColor}
                    onChange={(e) => handleTextColor(e.target.value)}
                  />
                  <span className="rte-custom-color-label">Custom color...</span>
                </div>
              </div>
            )}
          </div>

          {/* Font Highlight Color (Background) */}
          <div className="rte-color-picker-wrapper" ref={highlightPickerRef}>
            <button
              type="button"
              className="rte-btn"
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              title="Font Highlight (Background Color)"
              disabled={isSourceMode}
            >
              <FaHighlighter size={13} style={{ color: currentHighlightColor === 'transparent' ? '#64748b' : '#d97706' }} />
              <span className="rte-color-btn-indicator" style={{ background: currentHighlightColor === 'transparent' ? '#fff' : currentHighlightColor }}></span>
            </button>

            {showHighlightPicker && (
              <div className="rte-popover">
                <div className="rte-popover-title">Font Highlight Color</div>
                <div className="rte-color-grid">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <div
                      key={c.value}
                      className="rte-color-swatch"
                      style={{
                        background: c.value === 'transparent' ? '#ffffff' : c.value,
                        border: c.value === 'transparent' ? '1px dashed #94a3b8' : '1px solid rgba(0,0,0,0.15)'
                      }}
                      onClick={() => handleHighlightColor(c.value)}
                      title={c.label}
                    >
                      {c.value === 'transparent' && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>✕</span>}
                    </div>
                  ))}
                </div>
                <div className="rte-custom-color-row">
                  <input
                    type="color"
                    className="rte-custom-color-input"
                    value={currentHighlightColor === 'transparent' ? '#fef08a' : currentHighlightColor}
                    onChange={(e) => handleHighlightColor(e.target.value)}
                  />
                  <span className="rte-custom-color-label">Custom highlight...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alignment */}
        <div className="rich-text-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('justifyLeft')}
            title="Align Left"
            disabled={isSourceMode}
          >
            <FiAlignLeft size={14} />
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('justifyCenter')}
            title="Align Center"
            disabled={isSourceMode}
          >
            <FiAlignCenter size={14} />
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('justifyRight')}
            title="Align Right"
            disabled={isSourceMode}
          >
            <FiAlignRight size={14} />
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('justifyFull')}
            title="Justify"
            disabled={isSourceMode}
          >
            <FiAlignJustify size={14} />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="rich-text-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('insertUnorderedList')}
            title="Bulleted List"
            disabled={isSourceMode}
          >
            <FiList size={14} />
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('insertOrderedList')}
            title="Numbered List"
            disabled={isSourceMode}
          >
            <MdFormatListNumbered size={16} />
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('formatBlock', '<blockquote>')}
            title="Blockquote"
            disabled={isSourceMode}
          >
            <MdFormatQuote size={16} />
          </button>
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('insertHorizontalRule')}
            title="Divider Line"
            disabled={isSourceMode}
          >
            <FiMinus size={14} />
          </button>
        </div>

        {/* Utilities: Clear Formatting, Source Toggle */}
        <div className="rich-text-toolbar-group">
          <button
            type="button"
            className="rte-btn"
            onClick={() => exec('removeFormat')}
            title="Clear Formatting (Remove Styles)"
            disabled={isSourceMode}
          >
            <MdFormatClear size={15} style={{ marginRight: 3 }} />
            <span>Clear</span>
          </button>
          <button
            type="button"
            className={`rte-btn ${isSourceMode ? 'active' : ''}`}
            onClick={handleToggleSourceMode}
            title={isSourceMode ? "Switch to Visual Editor" : "View / Edit HTML Source Code"}
          >
            {isSourceMode ? (
              <>
                <FiEye size={14} style={{ marginRight: 3 }} />
                <span>Visual</span>
              </>
            ) : (
              <>
                <FiCode size={14} style={{ marginRight: 3 }} />
                <span>HTML</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isSourceMode ? (
        <textarea
          className="rich-text-source-editor"
          value={sourceCode}
          onChange={handleSourceCodeChange}
          placeholder="Paste or write HTML markup here..."
          style={{ minHeight }}
        />
      ) : (
        <div
          ref={editorRef}
          className="rich-text-editor-content"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          data-placeholder={placeholder}
          style={{ minHeight }}
        />
      )}

      {/* Footer Word Count & Helper */}
      <div className="rich-text-footer">
        <span>{isSourceMode ? '📝 HTML Source Code Mode' : '✨ WYSIWYG Rich Text Mode'}</span>
        <span>{getWordCount()} words</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
