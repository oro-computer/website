import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SITE / 'runtime' / 'tools'))


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, SITE / path)
    result = importlib.util.module_from_spec(spec)
    sys.modules[name] = result
    spec.loader.exec_module(result)
    return result


silk = module('silk_sync', 'silk/tools/sync-from-silk-docs.py')
runtime = module('runtime_api', 'runtime/tools/generate-js-api-reference.py')


class IngestionTests(unittest.TestCase):
    def test_silk_preserves_website_owned_pages_and_prunes_removed_imports(self):
        with tempfile.TemporaryDirectory() as folder:
            src, dst = Path(folder) / 'upstream', Path(folder) / 'staged'
            for base in (src, dst):
                (base / 'guides').mkdir(parents=True)
                (base / 'language').mkdir()
            (src / 'guides' / 'custom.md').write_text('upstream guide')
            (dst / 'guides' / 'custom.md').write_text('website guide')
            (src / 'start.md').write_text('upstream start')
            (dst / 'start.md').write_text('website start')
            (src / 'language' / 'new.md').write_text('# New\n')
            (dst / 'language' / 'removed.md').write_text('# Removed\n')
            (src / 'STATUS.md').write_text('private tracker')
            silk.sync_tree(src, dst, keep_files=silk.KEEP_DOCS_FILES,
                           keep_prefixes=silk.KEEP_DOCS_PREFIXES)
            self.assertEqual((dst / 'guides/custom.md').read_text(), 'website guide')
            self.assertEqual((dst / 'start.md').read_text(), 'website start')
            self.assertTrue((dst / 'language/new.md').exists())
            self.assertFalse((dst / 'language/removed.md').exists())
            self.assertFalse((dst / 'STATUS.md').exists())

    def test_postprocessing_leaves_website_owned_copy_untouched(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'guides').mkdir()
            page = root / 'guides/custom.md'
            text = '# Custom guide\n\nWorks today: a deliberately authored phrase.\n'
            page.write_text(text)
            silk.postprocess_tree(root, keep_files=silk.KEEP_DOCS_FILES,
                                  keep_prefixes=silk.KEEP_DOCS_PREFIXES)
            self.assertEqual(page.read_text(), text)

    def test_runtime_preserves_curated_prose_around_generated_markers(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'application.md'
            path.write_text('# Curated application\n\nKeep this example.\n\n' +
                            runtime.REF_START + '\nOld API\n' + runtime.REF_END + '\n\nKeep this footer.\n')
            declarations = "declare module 'oro:application' {\n  export function ping(): void;\n}\n"
            blocks = runtime.parse_index_d_ts(declarations)
            runtime.update_curated_page(path, 'oro:application', ['oro:application'], blocks)
            result = path.read_text()
            self.assertIn('Keep this example.', result)
            self.assertIn('Keep this footer.', result)
            self.assertIn('ping()', result)
            self.assertNotIn('Old API', result)
            self.assertEqual(result.count(runtime.REF_START), 1)
            self.assertEqual(result.count(runtime.REF_END), 1)

    def test_silk_editorial_pass_preserves_code_comments(self):
        example = '```silk\n// Works today: {{ literal }}\nlet n = 1;\n```'
        result = silk.source_pages.preserve_fences('Works today: prose\n\n' + example,
                                                   silk.normalize_shared_markdown)
        self.assertIn(example, result)


if __name__ == '__main__':
    unittest.main()
