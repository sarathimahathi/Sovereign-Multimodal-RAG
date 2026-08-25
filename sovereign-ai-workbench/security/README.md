# Security Module

## Purpose
Enforces guardrails, prompt injection detection, PII masking, cryptographic audit logs, and strict air-gap network policy validation.

## Phase Milestone
Targeted for **Phase 3: Security, Guardrails & User Isolation**.

## Subcomponents to be implemented:
- `guardrails.py`: Input/Output safety classifiers.
- `pii_redactor.py`: Entity recognition for PII and credential filtering.
- `audit.py`: Tamper-evident hash-chained audit logging.
- `airgap.py`: Network egress firewall checks.
