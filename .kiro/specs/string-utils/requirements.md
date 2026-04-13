# Requirements: String Utilities — Text Sanitization

## User Story
As a system rendering user-provided text, I want emojis to be safely stripped from strings, so that exported documents and PDF renders display cleanly without encoding artifacts.

## Acceptance Criteria

### removeEmojis Function
1. WHEN `removeEmojis()` receives a string with emojis THE SYSTEM SHALL return the string with all emoji characters removed.
2. WHEN `removeEmojis()` receives a string without emojis THE SYSTEM SHALL return the string unchanged.
3. WHEN `removeEmojis()` receives an empty string THE SYSTEM SHALL return an empty string.
4. WHEN `removeEmojis()` receives `null` or `undefined` THE SYSTEM SHALL return an empty string.
5. WHEN a string contains multiple consecutive emojis THE SYSTEM SHALL remove all of them.
6. WHEN a string contains emojis mixed with text THE SYSTEM SHALL preserve the text and remove only emoji characters.
7. WHEN emojis are removed THE SYSTEM SHALL trim the resulting string to avoid leading/trailing whitespace.
8. THE SYSTEM SHALL handle Unicode emoji ranges including: Dingbats (U+2700-U+27BF), Private Use Area (U+E000-U+F8FF), Emoticons (U+1F600-U+1F64F), Transport/Map (U+1F680-U+1F6FF), Supplemental (U+1F900-U+1F9FF), Miscellaneous Symbols (U+2600-U+26FF).
