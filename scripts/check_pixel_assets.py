"""Read-only PNG checks for Geumotseom. Requires Pillow; no game/DB access."""
import argparse
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def inspect(path, kind, size=None, materials=None, legacy=False):
    errors, review = [], []
    with Image.open(path) as image:
        if image.format != "PNG":
            errors.append("PNG 포맷이 아님")
        if getattr(image, "n_frames", 1) != 1:
            errors.append("단일 PNG 프레임이 아님")
        rgba = image.convert("RGBA")
    w, h = rgba.size
    pixels = list(rgba.get_flattened_data())
    visible = [p for p in pixels if p[3] != 0]
    opaque = {p[:3] for p in pixels if p[3] == 255}
    partial = sum(0 < p[3] < 255 for p in pixels)
    transparent = len(pixels) - len(visible)
    if not visible:
        errors.append("전체가 투명함")
    if size and (w, h) != tuple(size):
        errors.append(f"기대 크기 {size[0]}x{size[1]} 불일치")
    if kind == "background" and w * 3 != h * 4:
        errors.append("4:3 비율 불일치")
    if kind in {"sprite", "furniture"} and not transparent:
        errors.append("투명 배경 없음")
    if partial:
        (review if legacy else errors).append(f"반투명 픽셀 {partial}개")
    if not size and kind != "background" and not legacy:
        review.append("승인된 이미지 크기 미지정")
    if not legacy and kind == "furniture" and not materials:
        review.append("소재별 마스크 미제공: 색상 규칙 검증 보류")
    if materials:
        spec = json.loads(Path(materials).read_text(encoding="utf-8"))
        sections = spec["materials"]
        if not sections or not isinstance(sections, list):
            raise ValueError("materials 목록이 비어 있거나 잘못됨")
        covered = set()
        outlines = 0
        for section in sections:
            mask_path = Path(materials).parent / section["mask"]
            with Image.open(mask_path) as m:
                if m.size != rgba.size:
                    errors.append(f"{section['name']}: 마스크 크기 불일치")
                    continue
                mask = list(m.convert("L").get_flattened_data())
            if any(value not in (0, 255) for value in mask):
                errors.append(f"{section['name']}: 이진 마스크 필요")
                continue
            idx = {i for i, value in enumerate(mask) if value == 255}
            outline = section.get("outline", False)
            if outline:
                outlines += 1
            limit = 1 if outline else section.get("max_colors", 2)
            if limit not in ((1,) if outline else (2, 3)):
                errors.append(f"{section['name']}: 올바른 색수 제한 필요")
                continue
            if not idx or any(pixels[i][3] != 255 for i in idx):
                errors.append(f"{section['name']}: 비어 있거나 불투명하지 않은 영역")
            if covered & idx:
                errors.append(f"{section['name']}: 마스크 중복")
            covered.update(idx)
            colors = {pixels[i][:3] for i in idx}
            if len(colors) > limit:
                errors.append(f"{section['name']}: {len(colors)}색 (허용 {limit}색)")
        if outlines > 1:
            errors.append("공통 외곽선 마스크를 하나로 통합해야 함")
        if kind == "furniture" and outlines == 0:
            review.append("공통 외곽선 마스크 미제공")
        if covered != {i for i, p in enumerate(pixels) if p[3] == 255}:
            errors.append("마스크가 모든 불투명 픽셀을 정확히 포함하지 않음")
    return {
        "file": str(path), "kind": kind, "size": [w, h],
        "opaque_rgb_count_info_only": len(opaque), "transparent_pixels": transparent,
        "partial_alpha_pixels": partial, "errors": errors, "review": review,
        "status": "FAIL" if errors else "REVIEW" if review else "PASS_NUMERIC",
    }


def baseline():
    base = ROOT / "src/assets/selected-room-20261112"
    original = ROOT / "src/assets/cat-Q-original-20261112"
    directions = ("east", "north-east", "north-west", "north", "south-east",
                  "south-west", "south", "west")
    rows = [inspect(base / "room.png", "background", (1024, 768), legacy=True)]
    rows.extend(inspect(original / f"{d}.png", "sprite", (64, 64), legacy=True) for d in directions)
    rows.extend(inspect(base / "cat" / f"{d}.png", "sprite", (96, 96), legacy=True) for d in directions)
    rows.extend(inspect(p, "furniture", legacy=True) for p in sorted((base / "furniture").glob("*.png")))
    return rows


def changed(base_ref):
    # Git path names are data, not shell arguments. Only tracked game-art PNGs are checked.
    proc = subprocess.run(
        ["git", "diff", "--name-only", "-z", "--diff-filter=AMR", base_ref, "HEAD", "--",
         "src/art", "src/assets"], cwd=ROOT, check=True, capture_output=True
    )
    profiles = json.loads((ROOT / "scripts/pixel-profiles.json").read_text(encoding="utf-8"))
    rows = []
    for name in proc.stdout.decode("utf-8").split("\0"):
        if not name.lower().endswith(".png"):
            continue
        profile = profiles.get(name)
        if not profile:
            rows.append({"file": name, "status": "REVIEW", "errors": [],
                         "review": ["신규/변경 PNG에 승인된 검사 프로필 미등록"]})
            continue
        row = inspect(ROOT / name, profile["kind"], profile["size"],
                      ROOT / profile["materials"] if profile.get("materials") else None)
        row["file"] = name
        rows.append(row)
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--baseline", action="store_true")
    mode.add_argument("--changed", metavar="BASE_COMMIT")
    mode.add_argument("--file", type=Path)
    parser.add_argument("--kind", choices=["sprite", "furniture", "background"])
    parser.add_argument("--size", nargs=2, type=int, metavar=("W", "H"))
    parser.add_argument("--materials", type=Path)
    args = parser.parse_args()
    if args.file and not args.kind:
        parser.error("--file requires --kind")
    try:
        rows = baseline() if args.baseline else changed(args.changed) if args.changed else [
            inspect(args.file, args.kind, args.size, args.materials)
        ]
    except (OSError, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as exc:
        print(f"검사 오류: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(rows, ensure_ascii=False, indent=2))
    if any(r["errors"] for r in rows):
        return 1
    # Existing assets with partial alpha are reported, never silently replaced.
    return 2 if not args.baseline and any(r["review"] for r in rows) else 0


if __name__ == "__main__":
    sys.exit(main())
