import sys
import os

sys.path.insert(0, 'playstore-service')
os.environ['JWT_SECRET_KEY'] = 'test_secret_key_32_chars_exactly_here'
os.environ['MONGODB_URI'] = 'mongodb://localhost:27017'

from enterprise.auth.service import hash_password, verify_password, issue_access_token, decode_token
from enterprise.auth.models import Role, UserCreate, TokenPair
from enterprise.models.organization import OrganizationCreate, BusinessUnitCreate
from enterprise.models.asset import AssetCreate, AssetType, Criticality, DataSensitivity
from enterprise.models.business_service import BusinessServiceCreate
from enterprise.models.evidence import EvidenceCreate, Severity
from enterprise.models.control import ControlCreate, ControlStatus
from enterprise.models.scenario import ScenarioCreate
from enterprise.models.assessment import AssessmentCreate
from enterprise.models.job import JobCreate, JobType, JobStatus
from enterprise.demo.fixtures import get_demo_fixture_bundle

# Verify password hashing
pw = hash_password('TestPassword123!')
assert verify_password('TestPassword123!', pw)
assert not verify_password('WrongPass', pw)

# Verify JWT issue and decode
token = issue_access_token(user_id='test-user-123', org_id='demo-org-123', role='admin')
token_data = decode_token(token)
assert token_data is not None
assert token_data.user_id == 'test-user-123'
assert token_data.role == Role.admin
assert token_data.org_id == 'demo-org-123'

# Verify demo fixtures
bundle = get_demo_fixture_bundle()
org_name = bundle["org"]["name"]
assets_count = len(bundle["assets"])
services_count = len(bundle["services"])
evidence_count = len(bundle["evidence"])
scenarios_count = len(bundle["scenarios"])

print(f"M1 Verification Succeeded! Org: {org_name}, Assets: {assets_count}, Services: {services_count}, Evidence: {evidence_count}, Scenarios: {scenarios_count}")
