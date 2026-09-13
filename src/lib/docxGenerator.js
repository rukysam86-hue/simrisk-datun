import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';

/**
 * Parses markdown text into docx Paragraph objects.
 * Supports: headings (#, ##, ###), bullet list (- or *), numbered list (1. 2.),
 * bold (**text**), italic (*text*), horizontal rule (---), and plain paragraphs.
 */
function parseMarkdownToParagraphs(markdown) {
  const lines = markdown.split('\n');
  const paragraphs = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Blank line → spacer paragraph
    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }

    // Horizontal rule ---
    if (/^---+$/.test(line.trim())) {
      paragraphs.push(
        new Paragraph({
          border: {
            bottom: { color: 'AAAAAA', space: 1, value: BorderStyle.SINGLE, size: 6 },
          },
          text: '',
        })
      );
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      paragraphs.push(new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 100 } }));
      continue;
    }
    if (line.startsWith('## ')) {
      paragraphs.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 120 } }));
      continue;
    }
    if (line.startsWith('# ')) {
      paragraphs.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 160 } }));
      continue;
    }

    // Bullet list
    if (/^[-*] /.test(line)) {
      const content = line.slice(2);
      paragraphs.push(
        new Paragraph({
          children: parseInlineRuns(content),
          bullet: { level: 0 },
          spacing: { before: 60, after: 60 },
        })
      );
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(line)) {
      const content = line.replace(/^\d+\. /, '');
      paragraphs.push(
        new Paragraph({
          children: parseInlineRuns(content),
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { before: 60, after: 60 },
        })
      );
      continue;
    }

    // Regular paragraph with inline formatting
    paragraphs.push(
      new Paragraph({
        children: parseInlineRuns(line),
        spacing: { before: 80, after: 80 },
      })
    );
  }

  return paragraphs;
}

/**
 * Parse inline markdown: **bold**, *italic*, `code`
 */
function parseInlineRuns(text) {
  const runs = [];
  // Split by bold, italic, code patterns
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Plain text before match
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.slice(lastIndex, match.index) }));
    }

    const m = match[0];
    if (m.startsWith('**')) {
      runs.push(new TextRun({ text: m.slice(2, -2), bold: true }));
    } else if (m.startsWith('*')) {
      runs.push(new TextRun({ text: m.slice(1, -1), italics: true }));
    } else if (m.startsWith('`')) {
      runs.push(new TextRun({ text: m.slice(1, -1), font: 'Courier New', size: 18 }));
    }
    lastIndex = match.index + m.length;
  }

  // Remaining plain text
  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.slice(lastIndex) }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
}

/**
 * Downloads AI analysis as a Word (.docx) file.
 * @param {string} title - Document title / filename prefix
 * @param {string} projectName - Name of the project for the header
 * @param {string} markdownText - The AI analysis in markdown format
 * @param {string} reportLabel - Label for the report (e.g. "Data Awal", "Laporan #1")
 */
export async function downloadAnalysisAsDocx(title, projectName, markdownText, reportLabel = '') {
  const now = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          // Header
          new Paragraph({
            children: [new TextRun({ text: 'SARAN RISIKO PROYEK', bold: true, size: 28, color: '1899d6' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Kejaksaan Tinggi Nusa Tenggara Timur', bold: true, size: 22, color: '333333' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Bidang Perdata dan Tata Usaha Negara (Datun)', size: 20, color: '666666' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Info table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Proyek / Kegiatan', bold: true })] })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, color: 'E8F4FD', fill: 'E8F4FD' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: projectName || title })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Laporan', bold: true })] })],
                    shading: { type: ShadingType.CLEAR, color: 'E8F4FD', fill: 'E8F4FD' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: reportLabel || 'Data Awal' })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Tanggal', bold: true })] })],
                    shading: { type: ShadingType.CLEAR, color: 'E8F4FD', fill: 'E8F4FD' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: now })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // Content heading
          new Paragraph({
            children: [new TextRun({ text: 'HASIL ANALISIS RISIKO (AI GEMINI – JPN)', bold: true, size: 24, color: '5b2c6f' })],
            spacing: { before: 200, after: 200 },
          }),

          // Main content
          ...parseMarkdownToParagraphs(markdownText),

          new Paragraph({ text: '', spacing: { after: 600 } }),

          // Footer
          new Paragraph({
            children: [new TextRun({ text: '___________________________', color: '999999' })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 800 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Kepala Seksi Datun', color: '333333' })],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Kejaksaan Tinggi NTT', color: '666666', italics: true })],
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `Saran_Risiko_${(title || 'Proyek').replace(/\s+/g, '_').slice(0, 40)}_${reportLabel.replace(/\s+/g, '_')}.docx`;
  saveAs(blob, filename);
}
