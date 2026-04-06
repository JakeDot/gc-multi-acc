export const readmeCode = `# Geocaching Multi-Account Switcher

A lightweight Tampermonkey userscript to easily switch between multiple Geocaching.com accounts, inspired by the account switching functionality in [GC little helper](https://github.com/2Abendsegler/gclh).

## Features

- 👥 **Quick Switcher UI**: A floating button in the bottom right corner gives you access to your saved accounts.
- 🔐 **Local Storage**: Credentials are saved locally in your browser via Tampermonkey's secure storage (\`GM_setValue\`).
- ⚡ **Auto-Login**: Automatically logs you out of your current account and logs into the selected account.
- 🛠️ **Single File**: Easy to install, review, and modify.

## Installation

1. Install a userscript manager extension for your browser:
   - **Chrome/Edge**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - **Firefox**: [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) or Tampermonkey
2. Create a new script in your userscript manager.
3. Copy the contents of \`gc-multi-account-switcher.user.js\` and paste it into the new script editor.
4. Save the script.

## Usage

1. Navigate to [geocaching.com](https://www.geocaching.com).
2. You will see a new green floating button (👥) in the bottom right corner.
3. Click the button to open the Account Switcher panel.
4. Click **+ Add Account** to store your Geocaching username and password.
5. To switch accounts, simply click on the username in the list. The script will automatically log you out and log you back in with the selected account.

## Security Note

Your passwords are saved locally in your browser's extension storage. They are not transmitted anywhere except to the official Geocaching.com login endpoint during the auto-login process. However, anyone with access to your browser profile could potentially extract them. Use this script on trusted, personal devices only.

## Disclaimer

This script is not affiliated with, maintained, authorized, endorsed, or sponsored by Groundspeak, Inc. or Geocaching.com.
`;
