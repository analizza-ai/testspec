# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-25

### Added
- `testspec init` — setup wizard for SDD framework + AI agent detection
- `testspec generate` (alias `pags-tests`) — reads OpenSpec artifacts → writes `tests.md` + stubs
- `testspec validate` — maps test run results back to CT-01..N pass/fail
- `testspec report` — CT coverage/gap report
- OpenSpec adapter (full implementation)
- SpecKit adapter (stub, not yet implemented)
- Claude Code agent adapter (print-to-chat + `--api` mode)
- GitHub Copilot agent adapter (print-to-chat)
- Unit test stub templates: Vitest, Jest, Pytest, JUnit
- Integration test stub templates: Node.js + PostgreSQL, Node.js + PostgreSQL + Kafka, Spring Boot + PostgreSQL + Kafka
- `tests.md` canonical structure with CT tables, load profile hints, chaos scenarios
- Agent instruction templates: CLAUDE.md, copilot.md, AGENTS.md
