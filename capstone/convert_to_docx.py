"""
Convert PA3-draft.md to a properly formatted APA 7 Word document.
APA 7: 12pt Times New Roman, double-spaced, 1" margins, running head, page numbers.
"""

import re
from docx import Document
from docx.shared import Pt, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

import sys

# Default to PA4; pass a different basename as CLI arg if needed
_base = sys.argv[1] if len(sys.argv) > 1 else "PA4-draft"
INPUT_FILE = f"{_base}.md"
OUTPUT_FILE = f"{_base}.docx"

FONT_NAME = "Times New Roman"
FONT_SIZE = Pt(12)
LINE_SPACING = Pt(24)  # double-spaced at 12pt = 24pt
MARGIN = Inches(1)

# ── helpers ──────────────────────────────────────────────────────────────────

def set_apa_paragraph_format(para, space_before=Pt(0), space_after=Pt(0)):
    fmt = para.paragraph_format
    fmt.line_spacing_rule = WD_LINE_SPACING.EXACTLY
    fmt.line_spacing = LINE_SPACING
    fmt.space_before = space_before
    fmt.space_after = space_after
    fmt.left_indent = Inches(0)
    fmt.first_line_indent = Inches(0)


def apply_run_font(run, bold=False, italic=False, size=None):
    run.font.name = FONT_NAME
    run.font.size = size or FONT_SIZE
    run.font.bold = bold
    run.font.italic = italic


def add_apa_paragraph(doc, text="", bold=False, italic=False, indent_half=False, first_line=False):
    """Add a normal body paragraph with APA formatting."""
    para = doc.add_paragraph()
    set_apa_paragraph_format(para)
    if indent_half:
        para.paragraph_format.left_indent = Inches(0.5)
    if first_line:
        para.paragraph_format.first_line_indent = Inches(0.5)
    if text:
        run = para.add_run(text)
        apply_run_font(run, bold=bold, italic=italic)
    return para


def add_heading(doc, text, level):
    """APA-style headings: Level 1 = centered bold, Level 2 = left-aligned bold,
    Level 3 = left-aligned bold italic."""
    para = doc.add_paragraph()
    set_apa_paragraph_format(para, space_before=Pt(0), space_after=Pt(0))
    if level == 1:
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = para.add_run(text)
        apply_run_font(run, bold=True)
    elif level == 2:
        para.alignment = WD_ALIGN_PARAGRAPH.LEFT
        run = para.add_run(text)
        apply_run_font(run, bold=True)
    elif level == 3:
        para.alignment = WD_ALIGN_PARAGRAPH.LEFT
        run = para.add_run(text)
        apply_run_font(run, bold=True, italic=True)
    return para


def add_running_head_and_page_numbers(doc, short_title="AI PORTAL BUSINESS CASE"):
    """Insert running head (left) and page number (right) in the header."""
    section = doc.sections[0]
    header = section.header
    header.is_linked_to_previous = False

    # Clear default header content
    for para in header.paragraphs:
        for run in para.runs:
            run.text = ""

    if not header.paragraphs:
        header_para = header.add_paragraph()
    else:
        header_para = header.paragraphs[0]

    header_para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    header_para.paragraph_format.space_before = Pt(0)
    header_para.paragraph_format.space_after = Pt(0)

    # Tab stop at right margin for page number
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    pPr = header_para._p.get_or_add_pPr()
    tabs = OxmlElement("w:tabs")
    tab = OxmlElement("w:tab")
    tab.set(qn("w:val"), "right")
    tab.set(qn("w:pos"), "9360")  # 6.5" content width in twips (1" = 1440)
    tabs.append(tab)
    pPr.append(tabs)

    run_title = header_para.add_run(short_title)
    run_title.font.name = FONT_NAME
    run_title.font.size = FONT_SIZE

    run_tab = header_para.add_run("\t")
    run_tab.font.name = FONT_NAME
    run_tab.font.size = FONT_SIZE

    # Add PAGE field
    run_pg = header_para.add_run()
    run_pg.font.name = FONT_NAME
    run_pg.font.size = FONT_SIZE
    fldChar1 = OxmlElement("w:fldChar")
    fldChar1.set(qn("w:fldCharType"), "begin")
    instrText = OxmlElement("w:instrText")
    instrText.text = "PAGE"
    fldChar2 = OxmlElement("w:fldChar")
    fldChar2.set(qn("w:fldCharType"), "end")
    run_pg._r.append(fldChar1)
    run_pg._r.append(instrText)
    run_pg._r.append(fldChar2)


def parse_inline(para, text):
    """Parse inline bold (**text**) and italic (*text*) markers and add styled runs."""
    pattern = re.compile(r"(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)")
    last = 0
    for m in pattern.finditer(text):
        # plain text before match
        if m.start() > last:
            r = para.add_run(text[last:m.start()])
            apply_run_font(r)
        if m.group(2):  # bold+italic
            r = para.add_run(m.group(2))
            apply_run_font(r, bold=True, italic=True)
        elif m.group(3):  # bold
            r = para.add_run(m.group(3))
            apply_run_font(r, bold=True)
        elif m.group(4):  # italic
            r = para.add_run(m.group(4))
            apply_run_font(r, italic=True)
        elif m.group(5):  # code — render as bold in APA doc
            r = para.add_run(m.group(5))
            apply_run_font(r, bold=True)
        last = m.end()
    if last < len(text):
        r = para.add_run(text[last:])
        apply_run_font(r)


def add_table(doc, rows):
    """Build a docx table from a list of row-lists (strings)."""
    if not rows:
        return
    col_count = max(len(r) for r in rows)
    table = doc.add_table(rows=len(rows), cols=col_count)
    table.style = "Table Grid"

    for i, row_data in enumerate(rows):
        for j, cell_text in enumerate(row_data):
            if j >= col_count:
                break
            cell = table.cell(i, j)
            para = cell.paragraphs[0]
            para.paragraph_format.space_before = Pt(0)
            para.paragraph_format.space_after = Pt(0)
            para.paragraph_format.line_spacing_rule = WD_LINE_SPACING.EXACTLY
            para.paragraph_format.line_spacing = LINE_SPACING

            # Header row: bold
            is_bold = (i == 0)
            # Strip markdown bold markers from cell text
            cell_text = re.sub(r"\*\*(.+?)\*\*", r"\1", cell_text.strip()).strip()

            run = para.add_run(cell_text)
            run.font.name = FONT_NAME
            run.font.size = FONT_SIZE
            run.font.bold = is_bold


# ── main conversion ───────────────────────────────────────────────────────────

def convert():
    with open(INPUT_FILE, encoding="utf-8") as f:
        lines = f.readlines()

    doc = Document()

    # Page setup: 1" margins all around
    section = doc.sections[0]
    section.top_margin = MARGIN
    section.bottom_margin = MARGIN
    section.left_margin = MARGIN
    section.right_margin = MARGIN

    # Default paragraph style
    style = doc.styles["Normal"]
    style.font.name = FONT_NAME
    style.font.size = FONT_SIZE

    add_running_head_and_page_numbers(doc)

    # Skip the format-note blockquote line(s) and HTML comments
    table_buffer = []
    in_table = False
    skip_next = False

    i = 0
    while i < len(lines):
        raw = lines[i].rstrip("\n")
        stripped = raw.strip()

        # Skip blank format-note blockquotes
        if stripped.startswith("> **Format note"):
            i += 1
            continue

        # Skip the Executive Review Checklist section (internal tracking only)
        if stripped.startswith("## Executive Review Checklist"):
            while i < len(lines) and not lines[i].strip().startswith("---"):
                i += 1
            i += 1
            continue

        # Horizontal rule → page break before major sections
        if stripped == "---":
            # Only add page break if we're between major sections
            i += 1
            continue

        # Blank line
        if not stripped:
            i += 1
            continue

        # Table rows
        if stripped.startswith("|"):
            # Accumulate table rows
            row_cells = [c.strip() for c in stripped.strip("|").split("|")]
            # Skip separator rows (---|:---:|...)
            if all(re.match(r"^[-: ]+$", c) for c in row_cells if c):
                i += 1
                continue
            table_buffer.append(row_cells)
            i += 1
            # Peek: if next non-blank line is not a table row, flush
            j = i
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j >= len(lines) or not lines[j].strip().startswith("|"):
                add_table(doc, table_buffer)
                # Add a blank paragraph after table
                p = doc.add_paragraph()
                set_apa_paragraph_format(p)
                table_buffer = []
            continue

        # ATX headings
        heading_match = re.match(r"^(#{1,4})\s+(.*)", stripped)
        if heading_match:
            level = len(heading_match.group(1))
            heading_text = heading_match.group(2).strip()
            # Strip inline formatting from heading text for plain heading
            heading_text = re.sub(r"\*\*(.+?)\*\*", r"\1", heading_text)
            add_heading(doc, heading_text, min(level, 3))
            i += 1
            continue

        # Blockquote (italicised note)
        if stripped.startswith(">"):
            content = re.sub(r"^>\s*", "", stripped)
            para = doc.add_paragraph()
            set_apa_paragraph_format(para)
            para.paragraph_format.left_indent = Inches(0.5)
            parse_inline(para, content)
            i += 1
            continue

        # Table caption lines (*Table N* or *Note.*)
        if stripped.startswith("*") and stripped.endswith("*") and not stripped.startswith("**"):
            para = doc.add_paragraph()
            set_apa_paragraph_format(para)
            content = stripped.strip("*")
            run = para.add_run(content)
            apply_run_font(run, italic=True)
            i += 1
            continue

        # Bullet / list items
        if re.match(r"^[-*]\s+", stripped):
            content = re.sub(r"^[-*]\s+", "", stripped)
            para = doc.add_paragraph()
            set_apa_paragraph_format(para)
            para.paragraph_format.left_indent = Inches(0.5)
            para.paragraph_format.first_line_indent = Inches(-0.25)
            parse_inline(para, "• " + content)
            i += 1
            continue

        # Normal paragraph (may span multiple lines — collect until blank)
        para_lines = [stripped]
        i += 1
        while i < len(lines):
            next_stripped = lines[i].strip()
            if not next_stripped:
                break
            if next_stripped.startswith("|") or next_stripped.startswith("#"):
                break
            para_lines.append(next_stripped)
            i += 1

        full_text = " ".join(para_lines)

        # References section: hanging indent (0.5" left, -0.5" first line)
        if stripped.startswith("Bureau of") or stripped.startswith("Czechowski") or \
           stripped.startswith("EDUCAUSE") or stripped.startswith("Krueger") or \
           stripped.startswith("Liu,") or stripped.startswith("Page,") or \
           stripped.startswith("Patterson") or stripped.startswith("Razma") or \
           stripped.startswith("Strubell") or stripped.startswith("U.S. Dep") or \
           stripped.startswith("Verizon") or stripped.startswith("Windiatmoko"):
            para = doc.add_paragraph()
            set_apa_paragraph_format(para)
            para.paragraph_format.left_indent = Inches(0.5)
            para.paragraph_format.first_line_indent = Inches(-0.5)
            parse_inline(para, full_text)
        else:
            # Regular body paragraph with first-line indent
            para = doc.add_paragraph()
            set_apa_paragraph_format(para)
            para.paragraph_format.first_line_indent = Inches(0.5)
            parse_inline(para, full_text)

    doc.save(OUTPUT_FILE)
    print(f"Saved: {OUTPUT_FILE}")


if __name__ == "__main__":
    convert()
