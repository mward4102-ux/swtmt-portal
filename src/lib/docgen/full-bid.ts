// Full bid document assembly
// Compiles all drafted sections into a professional Word document
// with cover page, table of contents, section content, and pricing summary.

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageBreak, Footer, Header, Table, TableRow, TableCell, WidthType,
  BorderStyle
} from 'docx';
import { createServiceClient } from '../supabase';

const NAVY = '1B3A6B';
const GOLD = 'C9A84C';
const GRAY = '666666';

function heading1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 32, font: 'Arial' })]
  });
}

function heading2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 26, font: 'Arial' })]
  });
}

function bodyPara(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: [new TextRun({ text, size: 22, font: 'Arial' })]
  });
}

function emptyLine(): Paragraph {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

/**
 * Parse markdown-style content into docx paragraphs.
 * Handles ## headers as H2, blank lines as paragraph breaks.
 */
function contentToParagraphs(content: string): Paragraph[] {
  const paras: Paragraph[] = [];
  const lines = content.split('\n');
  let buffer = '';

  function flushBuffer() {
    if (buffer.trim()) {
      paras.push(bodyPara(buffer.trim()));
      buffer = '';
    }
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushBuffer();
      paras.push(heading2(line.replace(/^## /, '').trim()));
    } else if (line.trim() === '') {
      flushBuffer();
    } else {
      buffer += (buffer ? ' ' : '') + line.trim();
    }
  }
  flushBuffer();

  return paras;
}

export async function generateFullBidDocx(bidId: string): Promise<{ buffer: Buffer; filename: string }> {
  const svc = createServiceClient();

  // Load all data
  const { data: bid } = await svc.from('bids').select('*').eq('id', bidId).single();
  if (!bid) throw new Error('Bid not found');

  const { data: company } = bid.company_id
    ? await svc.from('companies').select('*').eq('id', bid.company_id).single()
    : { data: null };

  const { data: solicitation } = await svc.from('solicitations').select('*').eq('bid_id', bidId).single();

  const { data: sections } = await svc
    .from('bid_sections')
    .select('*')
    .eq('bid_id', bidId)
    .in('status', ['draft_ready', 'approved'])
    .order('section_order', { ascending: true });

  const { data: pricingAnalysis } = await svc.from('pricing_analyses').select('*').eq('bid_id', bidId).single();

  if (!sections || sections.length === 0) {
    throw new Error('No drafted sections available for assembly.');
  }

  const companyName = company?.name || 'Offeror';
  const solNum = solicitation?.solicitation_number || 'N/A';
  const agency = solicitation?.agency || 'N/A';
  const dueDate = solicitation?.due_date
    ? new Date(solicitation.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBD';

  // ─── COVER PAGE ───
  const coverChildren: Paragraph[] = [
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: companyName.toUpperCase(), bold: true, size: 48, color: NAVY, font: 'Arial' })]
    }),
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'PROPOSAL IN RESPONSE TO', size: 24, color: GRAY, font: 'Arial' })]
    }),
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Solicitation ${solNum}`, bold: true, size: 32, color: NAVY, font: 'Arial' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: agency, size: 26, color: GOLD, font: 'Arial' })]
    }),
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Response Date: ${dueDate}`, size: 22, color: GRAY, font: 'Arial' })]
    }),
    emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: 'Service-Disabled Veteran-Owned Small Business (SDVOSB)',
        bold: true, size: 22, color: NAVY, font: 'Arial'
      })]
    }),
    emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [new TextRun({
        text: `CONFIDENTIAL — Proprietary to ${companyName}`,
        italics: true, size: 18, color: GRAY, font: 'Arial'
      })]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];

  // ─── TABLE OF CONTENTS ───
  const tocChildren: Paragraph[] = [
    heading1('Table of Contents'),
    emptyLine()
  ];

  sections.forEach((s, i) => {
    tocChildren.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({
        text: `${i + 1}. ${s.section_title}`,
        size: 22, font: 'Arial', color: NAVY
      })]
    }));
  });

  if (pricingAnalysis) {
    tocChildren.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({
        text: `${sections.length + 1}. Pricing Summary`,
        size: 22, font: 'Arial', color: NAVY
      })]
    }));
  }

  tocChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // ─── SECTION CONTENT ───
  const sectionChildren: Paragraph[] = [];
  for (const s of sections) {
    sectionChildren.push(heading1(s.section_title));
    sectionChildren.push(...contentToParagraphs(s.content || ''));
    sectionChildren.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // ─── PRICING SUMMARY (if available) ───
  const pricingChildren: (Paragraph | Table)[] = [];
  if (pricingAnalysis) {
    pricingChildren.push(heading1('Pricing Summary'));

    const priceTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['Price Point', 'Amount'].map(text =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 22, font: 'Arial', color: 'FFFFFF' })] })],
              shading: { fill: NAVY, type: 'clear' as const, color: 'auto' }
            })
          )
        }),
        ...(['Aggressive', 'Target', 'Conservative'] as const).map(label => {
          const key = `${label.toLowerCase()}_price` as 'aggressive_price' | 'target_price' | 'conservative_price';
          const val = pricingAnalysis[key];
          return new TableRow({
            children: [
              new TableCell({ children: [bodyPara(label)] }),
              new TableCell({ children: [bodyPara(val ? `$${Number(val).toLocaleString()}` : 'N/A')] })
            ]
          });
        })
      ]
    });

    pricingChildren.push(priceTable);
    pricingChildren.push(emptyLine());

    if (pricingAnalysis.pricing_methodology) {
      pricingChildren.push(heading2('Pricing Methodology'));
      pricingChildren.push(bodyPara(pricingAnalysis.pricing_methodology));
    }

    if (pricingAnalysis.fee_structure) {
      pricingChildren.push(heading2('Fee Structure'));
      pricingChildren.push(bodyPara(pricingAnalysis.fee_structure));
    }
  }

  // ─── ASSEMBLE DOCUMENT ───
  const doc = new Document({
    creator: 'SWTMT Portal',
    title: `${companyName} — Proposal for ${solNum}`,
    styles: {
      default: { document: { run: { font: 'Arial' } } }
    },
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: `CONFIDENTIAL — Proprietary to ${companyName}`,
              italics: true, size: 16, color: GRAY, font: 'Arial'
            })]
          })]
        })
      },
      children: [
        ...coverChildren,
        ...tocChildren,
        ...sectionChildren,
        ...pricingChildren
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const safeName = companyName.replace(/[^a-z0-9]+/gi, '_');
  const safeSol = (solNum || 'proposal').replace(/[^a-z0-9]+/gi, '_');
  return { buffer, filename: `${safeName}_Proposal_${safeSol}.docx` };
}
