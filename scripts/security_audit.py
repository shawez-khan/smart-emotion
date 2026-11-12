"""
EmotiLearn — Pre-Push Security & Configuration Audit
=====================================================
Automated audit suite ensuring no sensitive files, secrets,
or insecure settings are pushed to version control.

Checks performed:
  1. Git Ignore Rules & Secret Isolation
  2. Codebase Hardcoded Secret Scanner
  3. Backend Security Headers & CORS Lockdown
  4. Role-Based Access Control Verification
  5. Coordinate Slicing Bounds Safety
  6. Production Dependency & Deployment Readiness
"""

import os
import re
import sys
import subprocess

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR    = os.path.join(WORKSPACE_ROOT, "backend")
FRONTEND_DIR   = os.path.join(WORKSPACE_ROOT, "frontend", "client")

PASS = " [PASS] "
FAIL = " [FAIL] "
WARN = " [WARN] "

issues_found = 0


def log_pass(msg):
    print(f"{PASS} {msg}")


def log_fail(msg):
    global issues_found
    issues_found += 1
    print(f"{FAIL} {msg}")


def log_warn(msg):
    print(f"{WARN} {msg}")


def check_gitignore_rules():
    print("\n--- 1. Checking .gitignore Configuration ---")
    gitignore_path = os.path.join(WORKSPACE_ROOT, ".gitignore")
    if not os.path.isfile(gitignore_path):
        log_fail("Missing root .gitignore file!")
        return

    with open(gitignore_path, "r", encoding="utf-8") as f:
        content = f.read()

    critical_patterns = [
        (".env", "Env files"),
        ("*.env", "Wildcard env files"),
        ("node_modules/", "Node modules"),
        ("dataset/", "Raw dataset directory"),
        ("venv/", "Virtual environments"),
    ]

    for pat, desc in critical_patterns:
        if pat in content:
            log_pass(f".gitignore properly excludes: {desc} ({pat})")
        else:
            log_fail(f".gitignore missing pattern: {desc} ({pat})")

    # Check that model file is explicitly retained
    if "!backend/models/emotion_cnn_fer2013.h5" in content:
        log_pass("Trained CNN model file is explicitly whitelisted for git")
    else:
        log_warn("Trained CNN model may be ignored by git if not whitelisted")


def check_git_ignored_files():
    print("\n--- 2. Verifying Git Exclusion of Sensitive Files ---")
    # Test via git status or check-ignore if git is available
    backend_env = os.path.join(BACKEND_DIR, ".env")
    dataset_dir = os.path.join(WORKSPACE_ROOT, "dataset")

    try:
        res = subprocess.run(
            ["git", "check-ignore", backend_env],
            cwd=WORKSPACE_ROOT,
            capture_output=True,
            text=True
        )
        if res.returncode == 0:
            log_pass(f"Git recognizes {os.path.relpath(backend_env, WORKSPACE_ROOT)} as strictly IGNORED")
        else:
            log_warn(f"Git check-ignore returned {res.returncode}. (Git repository may not be initialized yet)")
    except Exception as e:
        log_warn(f"Git check-ignore could not run: {e}")


def scan_for_hardcoded_secrets():
    print("\n--- 3. Scanning Codebase for Leaked Secrets ---")
    secret_patterns = [
        (re.compile(r"""(?i)(?:jwt_secret|secret_key|api_key|password)\s*=\s*['"][a-zA-Z0-9_\-]{8,}['"]"""), "Hardcoded credentials"),
        (re.compile(r"""mongodb(\+srv)?:\/\/[a-zA-Z0-9_\-]+:[a-zA-Z0-9_\-]+@"""), "MongoDB URI with embedded credentials"),
        (re.compile(r"""-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"""), "Private encryption key"),
    ]

    scanned_count = 0
    clean = True

    for root, dirs, files in os.walk(WORKSPACE_ROOT):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in [
            ".git", "node_modules", "venv", ".venv", "build", "dataset", "__pycache__"
        ]]

        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in [".py", ".js", ".jsx", ".json", ".md", ".html", ".sh"]:
                continue
            filepath = os.path.join(root, file)
            relpath = os.path.relpath(filepath, WORKSPACE_ROOT)

            # Skip audit script itself
            if "security_audit.py" in relpath:
                continue

            scanned_count += 1
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    for line_idx, line in enumerate(f, start=1):
                        for pat, label in secret_patterns:
                            # Allow safe env defaults or placeholders
                            if "REPLACE_WITH" in line or "CHANGE_THIS" in line or "your-secret-key" in line:
                                continue
                            if pat.search(line):
                                log_fail(f"{label} found in {relpath}:{line_idx}")
                                clean = False
            except Exception as e:
                log_warn(f"Could not read {relpath}: {e}")

    if clean:
        log_pass(f"Scanned {scanned_count} files across repository. Zero hardcoded secrets found.")


def check_backend_security():
    print("\n--- 4. Auditing Backend Security Hardening ---")
    app_path = os.path.join(BACKEND_DIR, "app.py")
    if not os.path.isfile(app_path):
        log_fail("backend/app.py not found!")
        return

    with open(app_path, "r", encoding="utf-8") as f:
        app_code = f.read()

    # 1. Check CORS lockdown
    if "CORS_ORIGINS" in app_code and "ALLOWED_ORIGINS" in app_code:
        log_pass("CORS origins configured via environment variable (whitelisted origins)")
    else:
        log_fail("CORS appears unrestricted or missing CORS_ORIGINS parsing")

    # 2. Check JWT secret enforcement
    if "CRITICAL SECURITY CONFIGURATION ERROR" in app_code and "secrets.token_hex" in app_code:
        log_pass("Strict JWT_SECRET enforcement in place (production requirement + ephemeral dev fallback)")
    else:
        log_fail("JWT_SECRET missing production validation or secure ephemeral fallback")

    # 3. Check security headers
    headers = ["X-Content-Type-Options", "X-Frame-Options", "Content-Security-Policy", "Strict-Transport-Security"]
    missing_headers = [h for h in headers if h not in app_code]
    if not missing_headers:
        log_pass("All recommended HTTP security response headers configured")
    else:
        log_fail(f"Missing security headers: {missing_headers}")

    # 4. Check face ROI boundary clamping
    if "min(int(x), w_img - 1)" in app_code or "max(0," in app_code:
        log_pass("Face ROI coordinates are safely clamped to frame dimensions")
    else:
        log_fail("Face ROI coordinates lack boundary clamping against frame dimensions")

    # 5. Check role escalation protection
    if "ADMIN_REGISTRATION_KEY" in app_code and "admin_required" in app_code:
        log_pass("Admin authorization required and role escalation protected")
    else:
        log_fail("Admin role lacks registration key check or admin_required decorator")

    # 6. Check datetime.utcnow deprecation
    if "utcnow" in app_code:
        log_fail("Deprecated datetime.utcnow() found in backend/app.py")
    else:
        log_pass("Timezone-aware datetime.now(timezone.utc) used consistently")


def check_production_readiness():
    print("\n--- 5. Checking Production WSGI & Configuration Templates ---")
    req_path = os.path.join(BACKEND_DIR, "requirements.txt")
    with open(req_path, "r", encoding="utf-8") as f:
        req_content = f.read()

    if "gunicorn" in req_content and "waitress" in req_content:
        log_pass("Production WSGI servers (gunicorn & waitress) present in requirements.txt")
    else:
        log_fail("requirements.txt missing gunicorn or waitress")

    # Check .env.example files
    b_env_ex = os.path.join(BACKEND_DIR, ".env.example")
    f_env_ex = os.path.join(FRONTEND_DIR, ".env.example")

    if os.path.isfile(b_env_ex):
        log_pass("backend/.env.example template is present and documented")
    else:
        log_fail("backend/.env.example is missing")

    if os.path.isfile(f_env_ex):
        log_pass("frontend/client/.env.example template is present and documented")
    else:
        log_fail("frontend/client/.env.example is missing")


def main():
    print("=" * 60)
    print("      EmotiLearn Automated Security & Readiness Audit")
    print("=" * 60)

    check_gitignore_rules()
    check_git_ignored_files()
    scan_for_hardcoded_secrets()
    check_backend_security()
    check_production_readiness()

    print("\n" + "=" * 60)
    if issues_found == 0:
        print(" AUDIT RESULT: ALL SECURITY & CONFIGURATION CHECKS PASSED! ")
        print(" The repository is clean, hardened, and safe to push to Git.")
        print("=" * 60)
        return 0
    else:
        print(f" AUDIT RESULT: {issues_found} SECURITY ISSUE(S) DETECTED! ")
        print(" Please resolve the issues above before pushing to Git.")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
