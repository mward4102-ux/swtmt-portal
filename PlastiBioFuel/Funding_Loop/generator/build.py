#!/usr/bin/env python3
"""Build the PlastiBioFuel funding-package documents.

Every narrative document is written once as a list of blocks in a run's
content.py, then rendered to .docx (house fonts) and .pdf (companion) from
that single source, so the two never drift.

    python3 generator/build.py <run-directory>

The run directory must contain a content.py exposing DOCS: {name: blocks}.
It may also expose UPLOADS: {alias: doc-name}, for portals that restrict upload
filenames; each alias is rendered to PDF from its source document's blocks.
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pdf_renderer, docx_renderer  # noqa: E402


def load(path):
    spec = importlib.util.spec_from_file_location("run_content", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main(run_dir):
    content = load(os.path.join(run_dir, "content.py"))
    for name, blocks in content.DOCS.items():
        pdf_renderer.build(blocks, os.path.join(run_dir, name + ".pdf"), name)
        docx_renderer.build(blocks, os.path.join(run_dir, name + ".docx"))
        print("built", name)

    for alias, source in getattr(content, "UPLOADS", {}).items():
        pdf_renderer.build(content.DOCS[source], os.path.join(run_dir, alias + ".pdf"), alias)
        print("built", alias, "(upload copy of", source + ")")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
