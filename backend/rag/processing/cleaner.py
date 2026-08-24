import re

class TextCleaner:
    @staticmethod
    def clean(text: str) -> str:
        if not text:
            return ""
        # Normalize whitespace and strip zero-width spaces/nulls
        text = text.replace("\x00", "").replace("\u200b", "")
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n\s*\n+', '\n\n', text)
        return text.strip()
