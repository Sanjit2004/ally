# Ally Project Policies

This document defines the core rules, development standards, and organizational policies for maintaining the Ally codebase.

## 1. Repository Structure

* **frontend/** – All UI/UX code including screens, components, hooks, stores, assets, navigation.
* **docs/** – All documentation files such as guides, summaries, implementation notes, and checklists.
* **backend/** (upcoming) – REST/WebSocket API, routing, controllers, authentication, and integration with model services.
* **model/** (upcoming) – ML training scripts, inference servers, evaluation code, notebooks, and model exports.
* **scripts/** – Project automation scripts.

## 2. Ownership

* **Frontend:** Adnan
* **Backend:** Sanjit
* **Model:** Sanjit
* **Documentation & Policies:** Shared responsibility

Architecture or folder-structure changes must be discussed beforehand.

## 3. Development Principles

### Stability

* `master` must always be stable, tested, and deployable.

### Clarity

* Keep modules small and focused.
* Maintain clean separation between frontend, backend, and model.

### Documentation

* Every major feature must include documentation stored in `docs/`.
* When adding a new module, include a README explaining structure and usage.

### Privacy and Sensitive Data

* Do not log sensitive user content.
* Memory and chat logs must follow privacy-safe handling rules.
* All collected data must serve an explicit purpose.

## 4. Code Quality

* Write readable, maintainable code.
* Use descriptive variable and function names.
* Avoid deeply nested logic—extract to helper functions.
* Backend and model code must contain in-line comments explaining complex logic.
* Use linting tools defined in the project.

## 5. Testing Requirements

* Backend: unit tests for routes, controllers, and service layers.
* Model: tests for inference outputs, pipeline flow, and validation samples.
* Frontend: UI behavior tests where possible.
* All tests must pass before merging.

## 6. Security Policies

* Never commit API keys or credentials.
* Use `.env.example` to define required environment variables.
* Sensitive configuration belongs only in local `.env` files.
* Data files and training datasets must remain out of version control.

## 7. Documentation Standards

* Use Markdown for all official documentation.
* Follow consistent heading structure across files.
* Keep all guides up to date when relevant features change.
* Major updates should be accompanied by changes to the main project README.

## 8. Branch Protection Rules

* Direct commits to `master` are prohibited.
* Merges require PR reviews.
* Large PRs should be broken into smaller submissions.
* CI/CD checks must pass before merging.

## 9. Versioning and Release Process

* Every release must have:

  * Updated docs in `docs/`
  * A stable build of `frontend/`
  * Compatible backend and model APIs
* Deployment bundles must not include sensitive or local-only files.

## 10. Future Expansion Policies

* Adding `backend/` will require defining consistent API contracts.
* Adding `model/` will require defining:

  * Model architecture documentation
  * Training data description (without including data itself)
  * Export/inference conventions
* Additional modules (like CI config or dockerization) must follow the structure defined here.

---

These policies will evolve as Ally expands. All changes must be approved through a PR and kept in sync with the system architecture.
