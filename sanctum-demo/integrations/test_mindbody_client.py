"""Offline tests; Mindbody is never called."""
import unittest
from datetime import date
from unittest.mock import patch
from mindbody_client import MindbodySettings, MindbodyConfigurationError, MindbodyReadOnly, summarise_class_capacity


class ReadOnlyTest(unittest.TestCase):
    def test_no_credentials(self):
        with patch.dict("os.environ", {}, clear=True):
            with self.assertRaises(MindbodyConfigurationError):
                MindbodySettings.from_environment()

    def test_forbidden_mutation(self):
        api = MindbodyReadOnly(MindbodySettings("123", "dummy"))
        with self.assertRaises(ValueError):
            api.get("client/updateclient")

    def test_date_bounds(self):
        api = MindbodyReadOnly(MindbodySettings("123", "dummy"))
        with self.assertRaises(ValueError):
            api.classes(date(2026, 1, 1), date(2026, 4, 1))

    def test_aggregation_strips_pii(self):
        out = summarise_class_capacity({
            "Classes": [
                {"MaxCapacity": 12, "TotalBooked": 9, "Name": "Do Not Return"},
                {"MaxCapacity": 7, "TotalBooked": 4, "Client": {"Phone": "PRIVATE"}}
            ]
        })
        self.assertEqual(out["potential_open_places"], 6)
        self.assertNotIn("PRIVATE", str(out))
        self.assertNotIn("Do Not Return", str(out))
        self.assertFalse(out["verified_against_provider"])


if __name__ == "__main__":
    unittest.main()
