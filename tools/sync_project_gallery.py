from pathlib import Path
import subprocess, json, re, shutil, sys
from PIL import Image


def ffprobe_dims(path: Path):
    cmd = ['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height:stream_side_data=rotation','-of','json',str(path)]
    data = json.loads(subprocess.run(cmd, capture_output=True, text=True, check=True).stdout)
    s = data['streams'][0]
    w = int(s['width']); h = int(s['height'])
    rotation = 0
    for sd in s.get('side_data_list', []):
        if 'rotation' in sd:
            rotation = int(sd['rotation']); break
    if rotation % 180 != 0:
        w, h = h, w
    return w, h


def sanitize_stem(name: str):
    return re.sub(r'[^a-z0-9]+', '-', Path(name).stem.lower()).strip('-')


def normalize_image(path: Path, dest_dir: Path, stem: str):
    ext = path.suffix.lower()
    if ext in {'.jpg','.jpeg','.png','.webp'}:
        dest = dest_dir / f'{stem}{ext if not (stem == "hero" and ext in {".jpg", ".jpeg"}) else ".jpg"}'
        shutil.copy2(path, dest)
    elif ext == '.heic':
        dest = dest_dir / f'{stem}.jpg'
        subprocess.run(['ffmpeg','-y','-i',str(path),'-frames:v','1','-q:v','2',str(dest)], check=True, capture_output=True)
    else:
        raise ValueError(f'Unsupported image format: {path}')
    w, h = Image.open(dest).size
    return dest.name, w, h


def normalize_video(path: Path, dest_dir: Path, stem: str):
    dest = dest_dir / f'{stem}.mp4'
    subprocess.run(['ffmpeg','-y','-i',str(path),'-movflags','+faststart','-pix_fmt','yuv420p','-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2','-vcodec','libx264','-acodec','aac',str(dest)], check=True, capture_output=True)
    w, h = ffprobe_dims(dest)
    return dest.name, w, h


def build_manifest(source_dir: Path, target_dir: Path, project_slug: str, include_hero_in_gallery: bool = False):
    target_dir.mkdir(parents=True, exist_ok=True)
    items = []
    hero_src = None
    for p in sorted(source_dir.iterdir()):
        if not p.is_file():
            continue
        ext = p.suffix.lower()
        if ext not in {'.jpg','.jpeg','.png','.webp','.heic','.mp4','.mov','.m4v'}:
            continue
        stem = sanitize_stem(p.name)
        is_hero = stem == 'hero'
        base = 'hero' if is_hero else stem
        if ext in {'.jpg','.jpeg','.png','.webp','.heic'}:
            repo_name, w, h = normalize_image(p, target_dir, base)
            kind = 'image'
        else:
            repo_name, w, h = normalize_video(p, target_dir, base)
            kind = 'video'
        item = {
            'name': p.name, 'repo_name': repo_name, 'kind': kind,
            'src': f'assets/projects/{project_slug}/{repo_name}',
            'width': w, 'height': h,
        }
        item['orientation'] = 'horizontal' if w > h else 'vertical' if h > w else 'square'
        item['colSpan'] = 2 if item['orientation'] == 'horizontal' else 1
        if is_hero:
            hero_src = item['src']
            if include_hero_in_gallery:
                items.append(item)
        else:
            items.append(item)
    manifest = {'project': project_slug, 'columns': 3, 'hero': hero_src, 'items': items}
    (target_dir / 'gallery-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    if len(sys.argv) < 4:
        raise SystemExit('usage: python tools/sync_project_gallery.py <source_dir> <target_dir> <project_slug> [--include-hero]')
    build_manifest(Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3], include_hero_in_gallery=('--include-hero' in sys.argv[4:]))
