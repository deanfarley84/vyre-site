"""Read-only Mindbody Public API v6 adapter for a future private Sanctum portal.
NOT DEPLOYED, NOT CONNECTED. No credentials are stored here.
"""
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import date
from typing import Any, Mapping

BASE_URL = "https://api.mindbodyonline.com/public/v6"
RESOURCES = frozenset({
    "client/clients",
    "client/clientvisits",
    "client/clientcontracts",
    "client/clientservices",
    "class/classes",
    "class/classvisits",
    "sale/sales",
    "appointment/staffappointments",
})

class MindbodyConfigurationError(RuntimeError): pass
class MindbodyReadError(RuntimeError): pass

@dataclass(frozen=True)
class MindbodySettings:
    site_id: str
    api_key: str
    authorization: str | None = None

    @classmethod
    def from_environment(cls):
        site_id = os.getenv("SANCTUM_MINDBODY_SITE_ID", "").strip()
        api_key = os.getenv("SANCTUM_MINDBODY_API_KEY", "").strip()
        auth = os.getenv("SANCTUM_MINDBODY_AUTHORIZATION", "").strip() or None
        if not site_id or not api_key:
            raise MindbodyConfigurationError(
                "Approved Mindbody Site ID and API key must be configured "
                "in the private server environment, not in browser code."
            )
        return cls(site_id, api_key, auth)

class MindbodyReadOnly:
    """Bounded GET-only API wrapper. It never writes or sends customer data."""
    def __init__(self, settings: MindbodySettings, timeout_seconds: int = 12):
        self.settings = settings
        self.timeout_seconds = timeout_seconds

    def get(self, resource: str, params: Mapping[str, Any] | None = None) -> dict:
        if resource not in RESOURCES:
            raise ValueError("Resource not allowed for read-only Sanctum integration")
        query = urllib.parse.urlencode(dict(params or {}))
        url = BASE_URL + "/" + resource + ("?" + query if query else "")
        headers = {
            "Accept": "application/json",
            "Api-Key": self.settings.api_key,
            "SiteId": self.settings.site_id,
            "User-Agent": "Sanctum-Adelante-ReadOnly/0.1",
        }
        if self.settings.authorization:
            headers["Authorization"] = self.settings.authorization
        req = urllib.request.Request(url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as res:
                data = res.read(5_000_001)
                if len(data) > 5_000_000:
                    raise MindbodyReadError("Response exceeds configured limit")
                obj = json.loads(data.decode("utf-8"))
                if not isinstance(obj, dict):
                    raise MindbodyReadError("Unexpected API response type")
                return obj
        except urllib.error.HTTPError as exc:
            raise MindbodyReadError(
                f"Mindbody returned HTTP {exc.code}; check access and rate limits"
            ) from None
        except (urllib.error.URLError, TimeoutError):
            raise MindbodyReadError("Mindbody connection failed") from None
        except (ValueError, UnicodeError):
            raise MindbodyReadError("Mindbody returned invalid JSON") from None

    def clients_page(self, offset: int = 0, limit: int = 100) -> dict:
        if offset < 0 or not 1 <= limit <= 100:
            raise ValueError("Invalid pagination")
        return self.get("client/clients", {"Limit": limit, "Offset": offset})

    def classes(self, start: date, end: date) -> dict:
        if end < start or (end - start).days > 31:
            raise ValueError("Class query must be within 31 days")
        return self.get("class/classes", {
            "StartDateTime": start.isoformat(),
            "EndDateTime": end.isoformat(),
        })

    @staticmethod
    def check_client_id(client_id: str):
        if not client_id or len(client_id) > 64 or not all(
            c.isalnum() or c in "-_" for c in client_id
        ):
            raise ValueError("Invalid client identifier")

    def visits_for_client(self, client_id: str) -> dict:
        self.check_client_id(client_id)
        return self.get("client/clientvisits", {"ClientId": client_id})

    def contracts_for_client(self, client_id: str) -> dict:
        self.check_client_id(client_id)
        return self.get("client/clientcontracts", {"ClientId": client_id})

    def services_for_client(self, client_id: str) -> dict:
        self.check_client_id(client_id)
        return self.get("client/clientservices", {"ClientId": client_id})


def summarise_class_capacity(api_response: Mapping[str, Any]) -> dict:
    """Aggregate numeric class counts only; never return names, IDs or PII.

    Response field names must be validated against approved Sanctum data.
    """
    classes = api_response.get("Classes", [])
    if not isinstance(classes, list):
        raise ValueError("Unexpected classes data")
    capacity = booked = matched = 0
    for item in classes:
        if not isinstance(item, dict):
            continue
        cap = item.get("MaxCapacity")
        used = item.get("TotalBooked")
        if any(not isinstance(n, (int, float)) or isinstance(n, bool) for n in (cap, used)):
            continue
        matched += 1
        capacity += max(0, int(cap))
        booked += max(0, int(used))
    return {
        "classes_with_capacity_data": matched,
        "capacity": capacity,
        "booked": booked,
        "potential_open_places": max(0, capacity - booked),
        "verified_against_provider": False,
    }


if __name__ == "__main__":
    settings = MindbodySettings.from_environment()
    print("Mindbody adapter configured for site " + settings.site_id)
    print("No data fetched; connect through a private authenticated worker.")
