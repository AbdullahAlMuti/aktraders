#!/usr/bin/env python3
"""Generate deterministic, synthetic CV fixtures without third-party packages."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "tests" / "fixtures" / "cv"


def pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def build_text_pdf(lines: list[str]) -> bytes:
    text_commands = ["BT", "/F1 11 Tf", "72 740 Td", "14 TL"]
    for index, line in enumerate(lines):
        if index:
            text_commands.append("T*")
        text_commands.append(f"({pdf_escape(line)}) Tj")
    text_commands.append("ET")
    stream = "\n".join(text_commands).encode("ascii")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        f"<< /Length {len(stream)} >>\nstream\n".encode("ascii") + stream + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]

    output = bytearray(b"%PDF-1.4\n% Synthetic test fixture\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode("ascii"))
        output.extend(obj)
        output.extend(b"\nendobj\n")

    xref_offset = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    output.extend(b"0000000000 65535 f\n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n\n".encode("ascii"))
    output.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode(
            "ascii"
        )
    )
    return bytes(output)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    lines = [
        "SYNTHETIC TEST DATA - NOT A REAL PERSON",
        "Avery Testcandidate",
        "Software Engineer",
        "avery.testcandidate@example.com | +1 202-555-0147",
        "123 Test Lane, Example City, CA 90000, United States",
        "SUMMARY",
        "Synthetic candidate fixture for automated CV parsing tests.",
        "EDUCATION",
        "BSc in Computer Science, Example University, 2020, CGPA 3.70/4.00",
        "WORK EXPERIENCE",
        "Software Engineer, Example Labs, Jan 2021 - Present",
        "Built test automation and maintained synthetic systems.",
        "SKILLS",
        "TypeScript, React, Next.js, PostgreSQL, Testing",
    ]
    destination = OUTPUT_DIR / "synthetic-basic-cv.pdf"
    destination.write_bytes(build_text_pdf(lines))
    print(f"Generated {destination.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
