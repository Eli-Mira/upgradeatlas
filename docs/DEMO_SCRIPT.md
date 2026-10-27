# UpgradeAtlas — internal RC demo script

A safe, fully synthetic walkthrough of the guest browsing and staff
review/publish flows against a **disposable** database. No real
manufacturer data, no real retailer offers, no production systems.

## Prerequisites

- Docker (for the disposable PostgreSQL container `upgradeatlas_pg`)
- PHP 8.3 + Composer, Node 24 (repo toolchain as documented in README)
- The container from the V3 work (or create it):

```
docker run -d --name upgradeatlas_pg -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=ua-local-only-disposable -e POSTGRES_DB=postgres \
  -p 127.0.0.1:5434:5432 postgres:16-alpine
docker exec upgradeatlas_pg psql -U postgres -c "CREATE ROLE upgradeatlas_app LOGIN PASSWORD 'ua-dev-change-me'"
```

## The walkthrough

### 1. Fresh disposable demo database

```bash
docker exec upgradeatlas_pg psql -U postgres -c "DROP DATABASE IF EXISTS upgradeatlas_demo"
docker exec upgradeatlas_pg psql -U postgres -c "CREATE DATABASE upgradeatlas_demo OWNER upgradeatlas_app"

cd services/api
DB_PORT=5434 DB_DATABASE=upgradeatlas_demo php artisan migrate --force
DB_PORT=5434 DB_DATABASE=upgradeatlas_demo php artisan db:seed --class=RcBrowserFixtureSeeder --force
```

### 2. Serve the API (isolated demo DB)

```bash
DB_PORT=5434 DB_DATABASE=upgradeatlas_demo php artisan serve --host=127.0.0.1 --port=8000
```

### 3. Guest browsing (no account, ever)

```bash
curl -s http://127.0.0.1:8000/api/v1/laptops | python -m json.tool
# -> total: 1, the published synthetic demo SKU (RC-EX-C15-01-DEMO)

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/api/v1/laptops/RC-EX-C15-02-DRAFT
# -> 404: the draft is indistinguishable from a missing SKU. No leak.

curl -s -X POST http://127.0.0.1:8000/api/v1/admin/skus -H "Content-Type: application/json" -d "{}"
# -> 401: anonymous mutation is refused outright.
```

### 4. Staff review/publish flow

```bash
# Token issuance (rate-limited; wrong password answers the same 401 as
# unknown email - no account enumeration).
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/v1/admin/token \
  -H "Content-Type: application/json" \
  -d '{"email":"rc-admin@example.test","password":"rc-demo-password","device_name":"demo"}' \
  | python -c "import json,sys; print(json.load(sys.stdin)['token'])")

# Staff sees everything the guests cannot:
curl -s http://127.0.0.1:8000/api/v1/admin/skus -H "Authorization: Bearer $TOKEN" | python -m json.tool
# -> total: 2 (published + draft)

# Fail-closed publication: create a draft and try to publish it with no
# verified evidence attached.
VARIANT_ID=$(curl -s http://127.0.0.1:8000/api/v1/admin/skus -H "Authorization: Bearer $TOKEN" \
  | python -c "import json,sys; print(json.load(sys.stdin)['data'][0]['variant_id'])")
NEW=$(curl -s -X POST http://127.0.0.1:8000/api/v1/admin/skus \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"variant_id\":$VARIANT_ID,\"manufacturer_part_number\":\"DEMO-UNVERIFIED-01\",\"display_name\":\"Demo unverified draft\"}")
NEW_ID=$(echo $NEW | python -c "import json,sys; print(json.load(sys.stdin)['id'])")

curl -s -X POST http://127.0.0.1:8000/api/v1/admin/skus/$NEW_ID/publish -H "Authorization: Bearer $TOKEN"
# -> 409 with blocked_by reasons: no verified evidence. Intake and admin
#    can never publish around the evidence gate.

# Retire the published fixture: it disappears from the public API.
PUB_ID=$(curl -s http://127.0.0.1:8000/api/v1/admin/skus?status=published -H "Authorization: Bearer $TOKEN" \
  | python -c "import json,sys; print(json.load(sys.stdin)['data'][0]['id'])")
curl -s -X POST http://127.0.0.1:8000/api/v1/admin/skus/$PUB_ID/retire -H "Authorization: Bearer $TOKEN"
curl -s http://127.0.0.1:8000/api/v1/laptops | python -c "import json,sys; print('public total:', json.load(sys.stdin)['total'])"
# -> public total: 0
```

### 5. Manual intake dry-run (never writes by default)

```bash
DB_PORT=5434 DB_DATABASE=upgradeatlas_demo php artisan laptops:intake tests/Fixtures/intake/valid.json
# -> dry-run report, zero writes. Add --commit to apply (requires the
#    owner permit; without it the commit is refused).
```

### 6. Clean up

```bash
docker exec upgradeatlas_pg psql -U postgres -c "DROP DATABASE upgradeatlas_demo"
```

Everything above ran during RC verification; the full-artifact browser
matrix (30/30 journeys) is in `C:\Users\emadg\upgradeatlas-evidence\browser\`.
