"""Behavior checks for selection, installation and preserving Codex configuration."""
import argparse
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest import mock

BASE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("toolbox", BASE / "scripts/toolbox.py")
toolbox = importlib.util.module_from_spec(spec)
spec.loader.exec_module(toolbox)


def args(preset=None, use=None, exclude=None):
    return argparse.Namespace(preset=preset, use=use, exclude=exclude)


class ToolboxTests(unittest.TestCase):
    def test_all_presets_resolve_to_present_guides(self):
        for preset in toolbox.PRESETS:
            plan = toolbox.plan(args(preset=preset))
            for guide in plan["guides"]:
                self.assertTrue(Path(guide["path"]).is_file(), guide)
        self.assertEqual(toolbox.verify_assets(), [])

    def test_explicit_selection_replaces_preset_and_excludes_family(self):
        plan = toolbox.plan(args(preset="app", use="emil,taste,playwright,framer-motion", exclude="taste,motion"))
        self.assertEqual(plan["selected"], ["emil:emil-design-eng", "playwright"])
        self.assertFalse(plan["automatic"])

    def test_ecc_is_bounded_and_unknown_names_fail(self):
        self.assertEqual(toolbox.plan(args(use="ecc"))["selected"], ["ecc:coding-standards", "ecc:verification-loop"])
        with self.assertRaises(ValueError):
            toolbox.plan(args(use="imaginary-plugin"))
        with self.assertRaises(ValueError):
            toolbox.plan(args(use="emil", exclude="imaginary-plugin"))

    def test_saved_selection_applies_only_without_explicit_override(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "registry.json").write_bytes((BASE / "registry.json").read_bytes())
            (root / "preferences.json").write_text(json.dumps({"preset": "app", "use": None, "exclude": ["emil"]}))
            with mock.patch.object(toolbox, "BASE", root):
                self.assertEqual(toolbox.plan(args())["preset"], "app")
                self.assertNotIn("emil:emil-design-eng", toolbox.plan(args())["selected"])
                self.assertEqual(toolbox.plan(args(preset="writing"))["selected"], ["humanizer"])
                self.assertEqual(toolbox.plan(args(use="emil"))["selected"], ["emil:emil-design-eng"])
                (root / "preferences.json").write_text(json.dumps({"preset": "auto", "use": ["emil"], "exclude": []}))
                selected = toolbox.plan(args())
                self.assertEqual(selected["selected"], ["emil:emil-design-eng"])
                self.assertFalse(selected["automatic"])

    def test_no_extra_skill_entrypoints_are_discovered(self):
        skills = [x.relative_to(BASE).as_posix() for x in BASE.rglob("SKILL.md") if "node_modules" not in x.parts]
        self.assertEqual(skills, ["SKILL.md"])

    def test_mcp_append_preserves_existing_config_and_is_idempotent(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.dict(os.environ, {"CODEX_HOME": tmp}):
            path = Path(tmp) / "config.toml"
            original = 'model = "existing-model"\n\n[mcp_servers.user-server]\nurl = "https://example.invalid/mcp"\n'
            path.write_text(original)
            with mock.patch.object(toolbox, "mcp_list", return_value=([], None)), mock.patch.object(toolbox, "key_exists", return_value=False):
                toolbox.setup_mcp()
                first = path.read_text()
                toolbox.setup_mcp()
                self.assertEqual(path.read_text(), first)
            self.assertTrue(first.startswith(original))
            self.assertEqual(first.count("[mcp_servers.design-toolbox-playwright]"), 1)
            self.assertEqual(first.count("enabled = false"), 2)
            self.assertEqual(first.count("enabled = true"), 1)
            backups = list(Path(tmp).glob("config.toml.design-toolbox-backup-*"))
            self.assertEqual(len(backups), 1)
            self.assertEqual(backups[0].read_text(), original)
            self.assertEqual(backups[0].stat().st_mode & 0o777, 0o600)

    def test_enable_changes_only_owned_server(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.dict(os.environ, {"CODEX_HOME": tmp}):
            path = Path(tmp) / "config.toml"
            with mock.patch.object(toolbox, "mcp_list", return_value=([], None)), mock.patch.object(toolbox, "key_exists", return_value=False):
                toolbox.setup_mcp()
            before = path.read_text()
            toolbox.enable_owned("design-toolbox-21st")
            after = path.read_text()
            self.assertEqual(after.count("enabled = true"), 2)
            self.assertEqual(after.count("enabled = false"), 1)
            self.assertEqual(before.split("[mcp_servers.design-toolbox-21st]")[0], after.split("[mcp_servers.design-toolbox-21st]")[0])

    def test_install_is_portable_and_never_overwrites_existing_skill(self):
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / "installed"
            options = argparse.Namespace(dest=str(dest), with_mcp=False, no_runtime=True)
            with contextlib.redirect_stdout(io.StringIO()):
                toolbox.install(options)
            self.assertTrue((dest / "SKILL.md").is_file())
            self.assertFalse((dest / "runtime/node_modules").exists())
            self.assertEqual(len(list((dest / "library").rglob("GUIDE.md"))), 326)
            marker = dest / "user-file.txt"
            marker.write_text("keep me")
            with self.assertRaises(ValueError):
                toolbox.install(options)
            self.assertEqual(marker.read_text(), "keep me")


if __name__ == "__main__":
    unittest.main()
