# Test Plan (stack update)

Backend (Laravel):
- PHPUnit/Pest: migration apply/rollback, constraints, feature tests for API.
- Validation rejects invalid budgets, negative money, unknown enum states, unauthorized admin writes.
- Audit event written on admin changes.

Frontend (React):
- Component tests + RTL/i18n layout checks (360/390/768/1440, 200% zoom).

Database:
- Reuse `upgradeatlas`/`upgradeatlas_test`; migration rollback tested.

CI:
- GitHub Actions: lint, tests, build, migration smoke.
