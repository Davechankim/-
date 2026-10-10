"""Cloud lifecycle behavior without installing packages or reading real keys."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import unittest
from unittest import mock

spec = importlib.util.spec_from_file_location("cloud", Path(__file__).resolve().parents[1] / "scripts/cloud.py")
cloud = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cloud)


class CloudTests(unittest.TestCase):
    def test_local_start_does_not_install(self):
        with mock.patch.dict(os.environ, {"CLAUDE_CODE_REMOTE": "false"}), mock.patch.object(cloud, "ensure_runtime") as install:
            with mock.patch("sys.argv", ["cloud.py", "session-start"]):
                self.assertEqual(cloud.main(), 0)
            install.assert_not_called()

    def test_cloud_start_prepares_runtime(self):
        with mock.patch.dict(os.environ, {"CLAUDE_CODE_REMOTE": "true"}), mock.patch.object(cloud, "ensure_runtime") as install:
            with mock.patch("sys.argv", ["cloud.py", "session-start"]):
                self.assertEqual(cloud.main(), 0)
            install.assert_called_once()

    def test_install_failure_does_not_block_cloud_session_but_explicit_setup_fails(self):
        with mock.patch.dict(os.environ, {"CLAUDE_CODE_REMOTE": "true"}), mock.patch.object(cloud, "ensure_runtime", side_effect=RuntimeError("offline")):
            for command, expected in [("session-start", 0), ("setup", 1), ("playwright", 1)]:
                stdout, stderr = io.StringIO(), io.StringIO()
                with mock.patch("sys.argv", ["cloud.py", command]), contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                    self.assertEqual(cloud.main(), expected)
                self.assertEqual(stdout.getvalue(), "")
                self.assertIn("Guides remain usable", stderr.getvalue())

    def test_doctor_reports_presence_without_disclosing_key(self):
        output = io.StringIO()
        with mock.patch.dict(os.environ, {"API_KEY_21ST": "fake-private-test-value"}), mock.patch.object(cloud, "runtime_ready", return_value=False), contextlib.redirect_stdout(output):
            self.assertEqual(cloud.doctor(), 0)
        self.assertTrue(json.loads(output.getvalue())["api_key_environment_present"])
        self.assertNotIn("fake-private-test-value", output.getvalue())


if __name__ == "__main__":
    unittest.main()
