# Contributing

## Workflow

```text
Issue → Branch → Implement → Test → Pull Request → Review → Merge → Close Issue
```

1. Every task starts as a **GitHub Issue** with an assignee (tracked on GitHub Projects).
2. Create a branch from `main` for that issue.
3. Implement and test locally.
4. Open a **Pull Request** and link the issue (`Closes #12`).
5. At least **one other developer reviews** before merging.
6. Merge into `main` → the issue closes automatically.

**Never push directly to `main`.**

## Branch Names

```text
<type>/<short-description>
```

| Type | Use for | Example |
|---|---|---|
| `feature/` | new functionality | `feature/signup-email-verification` |
| `fix/` | bug fixes | `fix/seat-count-negative` |
| `docs/` | documentation only | `docs/api-spec-rides` |
| `chore/` | setup, config, dependencies | `chore/flask-project-setup` |

## Commit Messages

```text
<type>: <what changed>
```

Examples:
- `feat: add POST /rides endpoint`
- `fix: prevent booking when ride is full`
- `docs: add booking endpoints to API spec`
- `chore: add .gitignore and requirements.txt`

Keep commits small and focused. Make sure `git config user.email` matches your GitHub email so commits show on your profile.

## Pull Requests

- Keep PRs small — one feature or fix per PR.
- Fill in the PR template (what / why / how to test).
- Reviewer checks: it runs, it does what the issue says, no secrets committed.
- Author merges after approval.

## Issues

- Use the **Feature** or **Bug** template.
- Labels: `backend`, `frontend`, `docs`, `bug`, `design`, `nice-to-have`
- Every issue should have clear **Done Criteria**.

## Secrets

- Never commit `.env`, API keys, or passwords.
- Add new config keys to `.env.example` (with fake values) so others know what's needed.
