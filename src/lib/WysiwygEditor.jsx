import { useRef, useEffect, useCallback } from 'react';

/**
 * A lightweight WYSIWYG editor built with contenteditable.
 * Fully compatible with React 19 (no findDOMNode dependency).
 *
 * Props:
 *  - value: HTML string (controlled)
 *  - onChange: function(htmlString)
 *  - placeholder: string
 */
function WysiwygEditor({ value, onChange, placeholder = 'Tulis di sini...' }) {
  const editorRef = useRef(null);
  const isComposing = useRef(false);

  // Sync external value to DOM only when focus is not inside the editor
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    // Avoid re-setting innerHTML while user is typing (causes cursor jump)
    if (document.activeElement !== el && el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const execCmd = useCallback((cmd, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
  }, []);

  const handleInput = useCallback(() => {
    if (isComposing.current) return;
    onChange(editorRef.current?.innerHTML || '');
  }, [onChange]);

  const handlePaste = useCallback((e) => {
    // Paste as plain text to keep it clean
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const toolbarBtn = (label, title, action) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); action(); }}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem',
        fontWeight: 700, color: '#4b4b4b', lineHeight: 1,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#e5e5e5'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'white' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '6px 8px', borderBottom: '2px solid var(--color-border)', background: '#fafafa' }}>
        {toolbarBtn('B', 'Bold', () => execCmd('bold'))}
        {toolbarBtn('I', 'Italic', () => execCmd('italic'))}
        {toolbarBtn('U', 'Underline', () => execCmd('underline'))}
        <span style={{ width: '1px', background: 'var(--color-border)', margin: '2px 4px' }} />
        {toolbarBtn('UL', 'Bullet List', () => execCmd('insertUnorderedList'))}
        {toolbarBtn('OL', 'Ordered List', () => execCmd('insertOrderedList'))}
        <span style={{ width: '1px', background: 'var(--color-border)', margin: '2px 4px' }} />
        {toolbarBtn('H1', 'Heading 1', () => execCmd('formatBlock', 'h3'))}
        {toolbarBtn('P', 'Paragraph', () => execCmd('formatBlock', 'p'))}
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => {
          isComposing.current = false;
          onChange(editorRef.current?.innerHTML || '');
        }}
        data-placeholder={placeholder}
        style={{
          minHeight: '130px',
          padding: '0.75rem 1rem',
          outline: 'none',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          color: 'var(--color-text-main)',
        }}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--color-text-muted);
          pointer-events: none;
        }
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 1.5rem;
        }
        [contenteditable] h3 {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}

export default WysiwygEditor;
