import { Editor, Extension, Mark, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import FindAndReplace from '@tiptap/extension-find-and-replace';

/**
 * Custom Mark: TextColor
 * Mengubah warna teks (misal warna khas PMII #51A0D8 atau warna lainnya)
 */
export const TextColor = Mark.create({
  name: 'textColor',
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.style.color || element.getAttribute('data-color'),
        renderHTML: attributes => {
          if (!attributes.color) return {};
          return {
            style: `color: ${attributes.color};`,
            'data-color': attributes.color
          };
        }
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span[style*=color]',
      },
      {
        tag: 'span[data-color]',
      }
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setColor: color => ({ chain }) => {
        return chain().setMark(this.name, { color }).run();
      },
      unsetColor: () => ({ chain }) => {
        return chain().unsetMark(this.name).run();
      }
    };
  }
});

/**
 * Custom Extension: Indent
 * Menambah / mengurangi indentasi teks paragraf dan heading
 */
export const Indent = Extension.create({
  name: 'indent',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const left = element.style.marginLeft;
              if (left && left.includes('rem')) {
                return Math.round(parseFloat(left) / 2);
              }
              return 0;
            },
            renderHTML: attributes => {
              if (!attributes.indent) return {};
              return {
                style: `margin-left: ${attributes.indent * 2}rem;`
              };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent < 8) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: currentIndent + 1
              });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent > 0) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: currentIndent - 1
              });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      'Shift-Tab': () => {
        if (this.editor.isActive('table')) return false;
        return this.editor.commands.outdent();
      }
    };
  }
});

/**
 * Custom Extension: TabKey
 * Tombol Tab tidak membuang fokus keluar editor, melainkan menyisipkan tab (\t)
 */
export const TabKey = Extension.create({
  name: 'tabKey',
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive('table')) {
          return false; // Tetap biarkan navigasi sel tabel bawaan
        }
        return this.editor.commands.insertContent('\t');
      }
    };
  }
});

/**
 * Custom Extension: LineHeight
 * Mengatur jarak spasi baris per paragraf atau heading yang dipilih
 */
export const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => {
              return element.style.lineHeight || element.getAttribute('data-line-height') || null;
            },
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {};
              return {
                style: `line-height: ${attributes.lineHeight};`,
                'data-line-height': attributes.lineHeight
              };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight) => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        let updated = false;
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              lineHeight: String(lineHeight)
            });
            updated = true;
          }
        });
        if (dispatch && updated) dispatch(tr);
        return updated;
      },
      unsetLineHeight: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        let updated = false;
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              lineHeight: null
            });
            updated = true;
          }
        });
        if (dispatch && updated) dispatch(tr);
        return updated;
      }
    };
  }
});

/**
 * Custom Extension: ParagraphSpacing
 * Mengatur space / jarak antar paragraf (0 pt space / Hilangkan Space)
 */
export const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          noSpacing: {
            default: false,
            parseHTML: element => {
              return (
                element.getAttribute('data-no-spacing') === 'true' ||
                element.classList.contains('no-spacing') ||
                element.style.marginBottom === '0px' ||
                element.style.marginBottom === '0'
              );
            },
            renderHTML: attributes => {
              if (!attributes.noSpacing) return {};
              return {
                'data-no-spacing': 'true',
                class: 'no-spacing'
              };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setNoSpacing: (enabled = true) => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        let updated = false;
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            const newAttrs = {
              ...node.attrs,
              noSpacing: Boolean(enabled)
            };
            if (enabled) {
              newAttrs.lineHeight = '1.0';
            }
            tr = tr.setNodeMarkup(pos, undefined, newAttrs);
            updated = true;
          }
        });
        if (dispatch && updated) dispatch(tr);
        return updated;
      },
      unsetNoSpacing: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        let updated = false;
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              noSpacing: false
            });
            updated = true;
          }
        });
        if (dispatch && updated) dispatch(tr);
        return updated;
      },
      toggleNoSpacing: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        let hasNoSpacing = false;
        state.doc.nodesBetween(selection.from, selection.to, (node) => {
          if (['paragraph', 'heading'].includes(node.type.name) && node.attrs.noSpacing) {
            hasNoSpacing = true;
          }
        });
        const targetState = !hasNoSpacing;
        let updated = false;
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            const newAttrs = {
              ...node.attrs,
              noSpacing: targetState
            };
            if (targetState) {
              newAttrs.lineHeight = '1.0';
            }
            tr = tr.setNodeMarkup(pos, undefined, newAttrs);
            updated = true;
          }
        });
        if (dispatch && updated) dispatch(tr);
        return updated;
      }
    };
  }
});

window.TipTap = {
  Editor,
  StarterKit,
  Underline,
  TextAlign,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  Image,
  FindAndReplace,
  TextColor,
  Indent,
  TabKey,
  LineHeight,
  ParagraphSpacing
};

