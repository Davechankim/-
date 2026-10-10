#!/usr/bin/env python3
"""Smoke-test the actual project MCP transport against a local button fixture."""
import asyncio
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import tempfile
from threading import Thread

ROOT = Path(__file__).resolve().parents[4]


class Fixture(BaseHTTPRequestHandler):
    def do_GET(self):
        page = b'''<!doctype html><title>Toolbox fixture</title>
<button onclick="document.getElementById('status').textContent='clicked'">Test</button>
<p id="status">ready</p>'''
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(page)

    def log_message(self, *args):
        pass


async def check():
    config = json.loads((ROOT / ".mcp.json").read_text())["mcpServers"]["design-toolbox-playwright"]
    env = os.environ.copy()
    env["CLAUDE_PROJECT_DIR"] = str(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", 0), Fixture)
    Thread(target=server.serve_forever, daemon=True).start()
    proc = None
    try:
        # Launch outside the repository to prove that project path resolution works.
        proc = await asyncio.create_subprocess_exec(config["command"], *config["args"],
            cwd=tempfile.gettempdir(), env=env, stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.DEVNULL)
        request_id = 0

        async def request(method, params):
            nonlocal request_id
            request_id += 1
            proc.stdin.write((json.dumps({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params})+"\n").encode())
            await proc.stdin.drain()
            async def receive():
                while True:
                    raw = await proc.stdout.readline()
                    if not raw:
                        raise RuntimeError("MCP exited before responding")
                    reply = json.loads(raw)
                    if reply.get("id") == request_id:
                        if "error" in reply or reply.get("result", {}).get("isError"):
                            raise RuntimeError("MCP request failed: " + method)
                        return reply["result"]
            return await asyncio.wait_for(receive(), 60)

        await request("initialize", {"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"toolbox-smoke","version":"1"}})
        proc.stdin.write(b'{"jsonrpc":"2.0","method":"notifications/initialized"}\n')
        await proc.stdin.drain()
        listed = await request("tools/list", {})
        names = {t["name"] for t in listed["tools"]}
        assert {"browser_navigate", "browser_snapshot", "browser_evaluate", "browser_click", "browser_close"} <= names
        await request("tools/call", {"name":"browser_navigate","arguments":{"url":f"http://127.0.0.1:{server.server_port}/"}})
        page = await request("tools/call", {"name":"browser_snapshot","arguments":{}})
        snapshot = "\n".join(item.get("text", "") for item in page.get("content", []))
        assert 'Test' in snapshot, "Test button missing from snapshot"
        await request("tools/call", {"name":"browser_click","arguments":{"element":"Test button","target":"button"}})
        result = await request("tools/call", {"name":"browser_evaluate","arguments":{"function":"() => document.getElementById('status').textContent"}})
        assert "clicked" in json.dumps(result)
        await request("tools/call", {"name":"browser_close","arguments":{}})
        print(json.dumps({"mcp_initialize":True,"tools_list":True,"browser_navigation":True,"button_interaction":True,"non_project_cwd":True}))
    finally:
        server.shutdown()
        server.server_close()
        if proc is not None and proc.returncode is None:
            proc.terminate()
            try:
                await asyncio.wait_for(proc.wait(), 5)
            except asyncio.TimeoutError:
                proc.kill()
                await proc.wait()


if __name__ == "__main__":
    asyncio.run(check())
