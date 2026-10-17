import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import FindAndReplace from '@tiptap/extension-find-and-replace';

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
  FindAndReplace
};
