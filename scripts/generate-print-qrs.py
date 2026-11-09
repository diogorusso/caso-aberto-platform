#!/usr/bin/env python3
"""Generate real scannable SVG QR codes for published kits. Authoring helper only.
Usage:
    python3 -m pip install qrcode
    python3 scripts/generate-print-qrs.py
No backend, image service, database, or environment variable is required.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "data" / "print-kits.json"


def main() -> None:
    try:
        import qrcode
        import qrcode.image.svg
    except ImportError:
        raise SystemExit("Install authoring dependency with: python3 -m pip install qrcode")
    model = json.loads(DATA.read_text(encoding="utf-8"))
    origin = model["public_url_origin"].rstrip("/")
    cases = {c["id"]: c for c in json.loads((ROOT / "src/data/casos.json").read_text(encoding="utf-8"))}
    for kit in model["cases"]:
        if not kit["published"]:
            continue
        case = cases.get(kit["case_id"])
        if not case:
            raise SystemExit("Missing case: " + kit["case_id"])
        target = origin + "/casos/" + case["slug"] + "/"
        relative = kit["qr_svg"]
        if not relative.startswith("/media/print/") or ".." in relative:
            raise SystemExit("QR path must stay in /media/print/: " + relative)
        destination = ROOT / "public" / relative.lstrip("/")
        destination.parent.mkdir(parents=True, exist_ok=True)
        qr = qrcode.QRCode(
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4
        )
        qr.add_data(target)
        qr.make(fit=True)
        image = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
        image.save(str(destination))
        print(f"{kit['case_id']}: {target} -> {destination.relative_to(ROOT)}")
    print("Complete. Open the SVG with a QR scanner, then commit the generated files.")


if __name__ == "__main__":
    main()
