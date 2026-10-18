"""Freeze/verify production source; never copy source or secrets."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys

LAB = Path(__file__).resolve().parents[1]
PROJECT = LAB.parents[1]
BASELINE = LAB / 'evidence' / 'source-baseline.json'
ROOTS = ('apps/web/src', 'apps/web/public', 'apps/web/test', 'services/api/app',
         'services/api/routes', 'services/api/database', 'services/api/tests', 'services/api/config')
FILES = ('apps/web/package.json', 'apps/web/package-lock.json', 'apps/web/vite.config.js',
         'services/api/composer.json', 'services/api/composer.lock', 'services/api/phpunit.xml')


def inventory():
    paths = [p for root in ROOTS for p in (PROJECT / root).rglob('*') if p.is_file()]
    paths += [PROJECT / name for name in FILES if (PROJECT / name).is_file()]
    return {p.relative_to(PROJECT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(set(paths))}


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'verify'
    if mode == 'capture':
        if BASELINE.exists():
            raise SystemExit('Refusing to overwrite original source baseline')
        BASELINE.parent.mkdir(parents=True, exist_ok=True)
        state = subprocess.run(['git', '-C', str(PROJECT), 'status', '--short'],
                               text=True, capture_output=True, encoding='utf-8', errors='replace', check=True)
        result = {'files': inventory(), 'pre_existing_git_status': state.stdout,
                  'scope': {'roots': ROOTS, 'files': FILES}, 'source_content_copied': False}
        BASELINE.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps({'captured_files': len(result['files']), 'baseline': str(BASELINE)}))
    elif mode == 'verify':
        before = json.loads(BASELINE.read_text(encoding='utf-8'))['files']
        after = inventory()
        result = {'unchanged': before == after, 'files_checked': len(before),
                  'changed': [k for k in before.keys() & after.keys() if before[k] != after[k]],
                  'removed': sorted(before.keys() - after.keys()), 'added': sorted(after.keys() - before.keys())}
        (BASELINE.parent / 'source-preservation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
        print(json.dumps(result))
        if not result['unchanged']:
            raise SystemExit(1)
    else:
        raise SystemExit('Use capture or verify')


if __name__ == '__main__':
    main()
