"""Bridge manual upstream generators to committed DOMStack Markdown pages.

A temporary flat source tree lets existing editorial logic retain ownership rules.
Only the final Node importer writes page.md files and metadata to the website.
"""
from __future__ import annotations
import subprocess
from pathlib import Path


def stage_collection(site: Path, collection: str, dest: Path) -> None:
    subprocess.run(['node', str(site / 'tools' / 'import-public.ts'), '--export',
                    collection, str(dest), str(site)], check=True, cwd=site)


def import_collection(site: Path, collection: str, source: Path) -> None:
    subprocess.run(['node', str(site / 'tools' / 'import-public.ts'),
                    collection, str(source), str(site)], check=True, cwd=site)


def preserve_fences(text: str, transform) -> str:
    import re
    fences = []
    lines = text.splitlines(keepends=True)
    protected = []
    i = 0
    while i < len(lines):
        opening = re.match(r'^ {0,3}(`{3,}|~{3,})([^\n]*)', lines[i])
        if not opening or (opening[1][0] == '`' and '`' in opening[2]):
            protected.append(lines[i])
            i += 1
            continue
        start = i
        marker = opening[1]
        i += 1
        while i < len(lines):
            closing = re.match(r'^ {0,3}(' + re.escape(marker[0]) + r'{'+str(len(marker))+r',})[ \t]*$', lines[i].rstrip('\n'))
            i += 1
            if closing:
                break
        fences.append(''.join(lines[start:i]))
        protected.append(f'OROFENCE{len(fences)-1}END\n')
    return re.sub(r'OROFENCE(\d+)END\n?', lambda m: fences[int(m.group(1))], transform(''.join(protected)))
