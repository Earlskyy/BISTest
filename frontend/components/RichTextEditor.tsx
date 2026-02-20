'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

type Props = {
  value: string;
  onChange: (html: string) => void;
  onInsertToken?: (insert: (token: string) => void) => void;
};

export function RichTextEditor({ value, onChange, onInsertToken }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    immediatelyRender: false, // ✅ FIX FOR SSR
    editorProps: {
      attributes: {
        class: 'editor-content min-h-[420px] focus:outline-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // ✅ Prevent running on every render
  useEffect(() => {
    if (!editor || !onInsertToken) return;

    const insertToken = (token: string) => {
      editor.chain().focus().insertContent(token).run();
    };

    onInsertToken(insertToken);
  }, [editor, onInsertToken]);

  // ✅ Sync external value changes safely
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="border rounded-md p-4">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          Underline
        </button>
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullets
        </button>
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Numbered
        </button>
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          Left
        </button>
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          Center
        </button>
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          Right
        </button>
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </button>
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </button>
      </div>

      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}