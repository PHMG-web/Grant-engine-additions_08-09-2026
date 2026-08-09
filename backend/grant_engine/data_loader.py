import json
import os

class DataLoader:
    """
    Loads organizational, program, budget, and staffing data
    from JSON files in a given directory.
    """

    def __init__(self, base_path):
        self.base_path = base_path

    def load_all(self):
        """
        Load all JSON files in base_path into a dict.
        """
        data = {}
        for filename in os.listdir(self.base_path):
            if filename.endswith(".json"):
                path = os.path.join(self.base_path, filename)
                with open(path, "r", encoding="utf-8") as f:
                    try:
                        data[filename.replace(".json", "")] = json.load(f)
                    except json.JSONDecodeError:
                        data[filename.replace(".json", "")] = {}
        return data

