from pathlib import Path
from PIL import Image
import subprocess, json, re, shutil, sys


def slugify_file(name: str) -> str:
    stem = Path(name).stem.lower()
    stem = re.sub(r'[^a-z0-9]+', '-', stem).strip('-')
    ext = Path(name).suffix.lower()
    if ext in {'.mov', '.m4v'}:
        ext = '.mp4'
    if stem == 'hero':
        return 'hero.jpg' if ext in {'.jpeg', '.jpg'} else f'hero{ext}'
    return f'{stem}{ext}'


def build_manifest(source_dir: Path, target_dir: Path, project_slug: str):
    target_dir.mkdir(parents=True, exist_ok=True)
    items = []
    hero_repo = None
    for p in sorted(source_dir.iterdir()):
        if not p.is_file():
            continue
        ext = p.suffix.lower()
        if ext not in {'.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.m4v'}:
            continue
        repo_name = slugify_file(p.name)
        repo_path = target_dir / repo_name
        kind = 'image' if ext in {'.jpg', '.jpeg', '.png', '.webp'} else 'video'
        if kind == 'image':
            shutil.copy2(p, repo_path)
            w, h = Image.open(p).size
        else:
            if ext in {'.mov', '.m4v'}:
                subprocess.run(['ffmpeg', '-y', '-i', str(p), '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-vcodec', 'libx264', '-acodec', 'aac', str(repo_path)], check=True, capture_output=True)
            else:
                shutil.copy2(p, repo_path)
            cmd = ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', str(repo_path)]
            data = json.loads(subprocess.run(cmd, capture_output=True, text=True, check=True).stdout)
            w = int(data['streams'][0]['width'])
            h = int(data['streams'][0]['height'])
        orientation = 'horizontal' if w > h else 'vertical' if h > w else 'square'
        item = {
            'name': p.name,
            'repo_name': repo_name,
            'kind': kind,
            'src': f'assets/projects/{project_slug}/{repo_name}',
            'width': w,
            'height': h,
            'orientation': orientation,
            'colSpan': 2 if orientation == 'horizontal' else 1,
        }
        if Path(p).stem.lower() == 'hero':
            hero_repo = item['src']
        else:
            items.append(item)

    h_items = [x for x in items if x['colSpan'] == 2]
    v_items = [x for x in items if x['colSpan'] == 1]
    ordered = []
    row_units = 0
    while h_items or v_items:
        remaining = 3 - row_units
        if remaining in (3, 2):
            pick = h_items.pop(0) if h_items else v_items.pop(0)
        else:
            pick = v_items.pop(0) if v_items else h_items.pop(0)
        ordered.append(pick)
        row_units += pick['colSpan']
        if row_units >= 3:
            row_units = 0

    manifest = {'project': project_slug, 'columns': 3, 'hero': hero_repo, 'items': ordered}
    (target_dir / 'gallery-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    return manifest


if __name__ == '__main__':
    if len(sys.argv) != 4:
        raise SystemExit('usage: python tools/sync_project_gallery.py <source_dir> <target_dir> <project_slug>')
    manifest = build_manifest(Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3])
    print(json.dumps(manifest, indent=2))
