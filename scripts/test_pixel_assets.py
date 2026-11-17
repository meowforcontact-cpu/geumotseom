import json
import tempfile
import unittest
from pathlib import Path
from PIL import Image
from check_pixel_assets import inspect


class PixelTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.path = self.root / "sprite.png"

    def make(self, pixels, size=(2, 2)):
        im = Image.new("RGBA", size)
        im.putdata(pixels)
        im.save(self.path)

    def test_transparency_and_dimensions(self):
        self.make([(0, 0, 0, 0), (1, 2, 3, 255), (4, 5, 6, 255), (7, 8, 9, 255)])
        self.assertEqual(inspect(self.path, "sprite", (2, 2), palette=["#010203", "#040506", "#070809"])["status"], "PASS_NUMERIC")
        self.assertEqual(inspect(self.path, "sprite", (32, 32))["status"], "FAIL")

    def test_partial_alpha_strict_and_legacy(self):
        self.make([(0, 0, 0, 0), (1, 2, 3, 120), (4, 5, 6, 255), (7, 8, 9, 255)])
        self.assertEqual(inspect(self.path, "sprite", (2, 2))["status"], "FAIL")
        self.assertEqual(inspect(self.path, "sprite", (2, 2), legacy=True)["status"], "REVIEW")

    def test_sprite_and_ui_require_approved_palette(self):
        self.make([(255, 0, 255, 0), (1, 2, 3, 255), (4, 5, 6, 255), (1, 2, 3, 255)])
        for kind in ("sprite", "ui"):
            self.assertEqual(inspect(self.path, kind, (2, 2))["status"], "REVIEW")
            self.assertEqual(inspect(self.path, kind, (2, 2), palette=["#010203", "#040506"])["status"], "PASS_NUMERIC")
            self.assertEqual(inspect(self.path, kind, (2, 2), palette=["#010203"])["status"], "FAIL")
            with self.assertRaises(ValueError):
                inspect(self.path, kind, (2, 2), palette=["#XYZ123"])

    def test_transparent_mask_is_not_accepted(self):
        self.make([(0, 0, 0, 0), (1, 2, 3, 255), (4, 5, 6, 255), (7, 8, 9, 255)])
        mask = Image.new("RGBA", (2, 2))
        mask.putdata([(0, 0, 0, 255), (255, 255, 255, 0), (255, 255, 255, 255), (255, 255, 255, 255)])
        mask.save(self.root / "mask.png")
        spec = self.root / "materials.json"
        spec.write_text(json.dumps({"materials":[{"name":"wood","mask":"mask.png"}]}), encoding="utf8")
        self.assertEqual(inspect(self.path, "furniture", (2, 2), spec)["status"], "FAIL")

    def test_material_colors_are_not_global(self):
        pixels = [(10, 1, 1, 255), (20, 1, 1, 255), (30, 1, 1, 255),
                  (40, 1, 1, 255), (50, 1, 1, 255), (0, 0, 0, 0)]
        self.make(pixels, (3, 2))
        for name, indices in [("cloth", {0, 1}), ("wood", {2, 3}), ("edge", {4})]:
            mask = Image.new("L", (3, 2))
            mask.putdata([255 if i in indices else 0 for i in range(6)])
            mask.save(self.root / f"{name}.png")
        spec = self.root / "materials.json"
        data = {"materials": [{"name": "cloth", "mask": "cloth.png"},
                              {"name": "wood", "mask": "wood.png"},
                              {"name": "edge", "mask": "edge.png", "outline": True}]}
        spec.write_text(json.dumps(data), encoding="utf8")
        result = inspect(self.path, "furniture", (3, 2), spec)
        self.assertEqual(result["opaque_rgb_count_info_only"], 5)
        self.assertEqual(result["status"], "PASS_NUMERIC")
        self.assertEqual(inspect(self.path, "furniture", (3, 2))["status"], "REVIEW")
        data["materials"][1]["mask"] = "cloth.png"
        spec.write_text(json.dumps(data), encoding="utf8")
        self.assertEqual(inspect(self.path, "furniture", (3, 2), spec)["status"], "FAIL")


if __name__ == "__main__":
    unittest.main()
