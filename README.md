# Himoya 🛡️

**Browser extension protecting Uzbek speakers from online financial scams**

Himoya (Uzbek for "protection") detects and flags suspicious content in real-time using 150+ keyword pattern matching across social media and websites.

## The Problem

Uzbek-speaking communities are increasingly targeted by localized social media scams—fake investment schemes, lottery frauds, and phishing attempts that prey on users unfamiliar with digital security. After witnessing family members nearly lose savings to Telegram investment scams, I built this tool to help protect vulnerable users.

## Impact

Within weeks of sharing Himoya with my local tech community, three users reported it had stopped their parents from losing money to online scams. This validated the critical need for scam protection tools in underserved language communities.

## How It Works

Himoya continuously monitors web pages and flags posts containing multiple fraud indicators:

- **150+ suspicious keywords** organized across 10 scam categories
- **Real-time detection** as you browse social media
- **Visual warnings** with blurred content that reveals on click
- **Low false positives** requiring 2+ keyword matches to trigger alerts

### Scam Categories Detected

1. Money/income schemes (30 patterns)
2. Investment fraud (25 patterns)
3. Urgency/FOMO tactics (20 patterns)
4. Personal information phishing (20 patterns)
5. Prize/lottery scams (15 patterns)
6. Platform/contact requests (15 patterns)
7. Payment/registration fraud (15 patterns)
8. Job scams (10 patterns)
9. False guarantees (10 patterns)
10. Trust manipulation (10 patterns)

## Installation

### From Source

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the folder containing the extension files
6. Himoya is now active!

### Supported Browsers

- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Brave
- ✅ Any Chromium-based browser

<img width="1016" height="400" alt="image" src="https://github.com/user-attachments/assets/25b70d9a-cbc5-4ed0-a853-4cb98125ff53" />
<img width="952" height="155" alt="image" src="https://github.com/user-attachments/assets/6280bf08-2438-4b2c-ad6d-50405512bbe8" />
<img width="1154" height="734" alt="image" src="https://github.com/user-attachments/assets/5b4dca5d-d21b-46b2-9134-ac998e55009f" />


## Technical Details

**Tech Stack:**
- Vanilla JavaScript (no dependencies)
- Chrome Extension Manifest V3
- Regular expression pattern matching
- MutationObserver API for dynamic content

**Performance Optimizations:**
- WeakSet tracking to prevent duplicate scans
- Batch processing (50 elements per cycle)
- Debounced scanning with 1-second delay
- Selective element targeting for efficiency

**Privacy:**
- No data collection
- No external API calls
- All processing happens locally in your browser
- No user tracking or analytics

## Supported Platforms

Himoya works on any website but is optimized for:
- Facebook
- Instagram
- Twitter/X
- Telegram Web
- WhatsApp Web
- Forums and news sites

## Screenshots

*Coming soon: Examples of detected scam posts*

## Future Improvements

- [ ] Machine learning integration for adaptive detection
- [ ] Crowdsourced scam reporting
- [ ] Multi-language support (Russian, Kazakh)
- [ ] Chrome Web Store publication
- [ ] Statistics dashboard showing scams blocked
- [ ] User-customizable sensitivity settings

## Contributing

Found new scam patterns? Encountered false positives? Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Add your scam keywords to `content.js`
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Author

Built with the goal of protecting vulnerable communities from digital fraud.

---

**Note:** This extension provides warnings about suspicious content but cannot guarantee 100% scam detection. Always exercise caution when sharing personal information or money online.
