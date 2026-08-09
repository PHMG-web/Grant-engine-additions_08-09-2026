import json
import os
import logging

logger = logging.getLogger(__name__)

class DataLoader:
    """
    Loads organizational, program, budget, and staffing data
    from JSON files in a given directory.
    Includes directory existence checking and rich parsing error reporting.
    """

    def __init__(self, base_path):
        if not base_path:
            raise ValueError("Loader base path cannot be empty or None.")
        
        self.base_path = base_path

    def load_all(self):
        """
        Load all JSON files in base_path into a dict.
        Raises FileNotFoundError if the directory does not exist.
        Logs and reports exact filename and parsing errors on JSONDecodeError.
        """
        if not os.path.exists(self.base_path):
            raise FileNotFoundError(f"Data directory '{self.base_path}' does not exist.")
            
        if not os.path.isdir(self.base_path):
            raise ValueError(f"Data path '{self.base_path}' is not a directory.")

        data = {}
        for filename in os.listdir(self.base_path):
            if filename.endswith(".json"):
                path = os.path.join(self.base_path, filename)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data[filename.replace(".json", "")] = json.load(f)
                except json.JSONDecodeError as decode_err:
                    err_msg = f"JSON parsing failed for file '{filename}' at '{path}': {str(decode_err)}"
                    logger.error(err_msg)
                    # Propagate or raise explicit exception for hardening as requested
                    raise ValueError(err_msg) from decode_err
                except Exception as file_err:
                    err_msg = f"Failed to read file '{filename}' at '{path}': {str(file_err)}"
                    logger.error(err_msg)
                    raise RuntimeError(err_msg) from file_err
        return data

