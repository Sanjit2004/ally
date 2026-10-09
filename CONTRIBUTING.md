# Contributing to Ally

This document outlines the standard workflow and collaboration practices for contributing to the Ally project.

## 1. Branching Workflow

* **main**: Production-ready, always stable, no direct commits.
* **Feature branches** follow these naming conventions:

  * `ui/<feature-name>` for frontend work.
  * `backend/<feature-name>` for backend features.
  * `model/<feature-name>` for ML training, inference, or data work.
  * `chore/<task-name>` for cleanup, restructuring, or maintenance tasks.
* Always base new branches off `main`.

## 2. Pull Requests (PRs)

* All work must be merged through PRs.
* PR titles should clearly summarize the change.
* Descriptions must include:

  * Purpose of the change
  * Summary of what was modified
  * Screenshots (for UI changes)
* Each PR must be reviewed by at least one teammate.
* Do not merge PRs with failing checks.

## 3. Commit Message Guidelines

Commit messages should be structured as:

```
type(scope): short description
```

### Types include:

* `feat` – new feature
* `fix` – bug fix
* `refactor` – code restructuring without behavior change
* `chore` – maintenance, tooling, or non-feature work
* `docs` – documentation updates

**Examples:**

* `feat(ui): add avatar animations`
* `backend(chat): implement message routing`
* `model(memory): improve embedding logic`

## 4. Tests

* All major backend and model features must include tests.
* Frontend interaction tests should be added when possible.
* Tests must pass before merging.

## 5. Environment and Secrets

* Do not commit `.env` or API keys.
* Provide `.env.example` files when needed.
* Ensure `.gitignore` prevents sensitive files from being committed.

## 6. Documentation

* Each significant feature should include a documentation update.
* Major changes must be reflected in the appropriate markdown files under `docs/`.

## 7. Communication

* **Adnan** owns frontend/UI.
* **Sanjit** owns backend/model.
* Architecture-level changes must be discussed before implementation.

---

Following these guidelines ensures consistency, quality, and smooth collaboration across the project.
