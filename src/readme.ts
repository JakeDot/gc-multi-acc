export const readmeCode = `# Geocaching Power Tools (Multi-Account & Cache Manager)

A powerful, all-in-one Tampermonkey userscript to easily switch between multiple Geocaching.com accounts and manage multiple unpublished caches in a tabbed workspace.

## Features

- 👥 **Quick Switcher UI**: A floating button in the bottom right corner gives you access to your saved accounts.
- 🔐 **Local Storage**: Credentials are saved locally in your browser via Tampermonkey's secure storage (\`GM_setValue\`).
- ⚡ **Auto-Login**: Automatically logs you out of your current account and logs into the selected account.
- 🗺️ **Unpublished Cache Manager**: A built-in, full-screen tabbed workspace to open multiple caches side-by-side.
- 🔄 **Seamless Account Switching**: Switch accounts directly from the Cache Manager top bar. The workspace state is saved and will automatically reopen after the login redirect finishes!
- 🛡️ **Bypasses X-Frame-Options**: Because the Cache Manager is injected directly into Geocaching.com via the userscript, the iframes load on the same domain. This naturally bypasses the \`X-Frame-Options: SAMEORIGIN\` restriction without needing any additional browser extensions!

## Installation

1. Install a userscript manager extension for your browser:
   - **Chrome/Edge**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - **Firefox**: [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) or Tampermonkey
2. Create a new script in your userscript manager.
3. Copy the contents of \`gc-power-tools.user.js\` and paste it into the new script editor.
4. Save the script.

## Usage

1. Navigate to [geocaching.com](https://www.geocaching.com).
2. You will see a new green floating button (🛠️) in the bottom right corner.
3. Click the button to open the Power Tools panel.
4. Click **+ Add Account** to store your Geocaching username and password.
5. Click **🗺️ Open Cache Manager** to launch the full-screen tabbed workspace.
6. In the workspace, enter a GC code (e.g., \`GC12345\`) and click **Add Tab** to open it.
7. Use the dropdown in the top right of the workspace to seamlessly switch accounts while keeping your tabs open!

## Security Note

Your passwords are saved locally in your browser's extension storage. They are not transmitted anywhere except to the official Geocaching.com login endpoint during the auto-login process. However, anyone with access to your browser profile could potentially extract them. Use this script on trusted, personal devices only.

## Disclaimer

This script is not affiliated with, maintained, authorized, endorsed, or sponsored by Groundspeak, Inc. or Geocaching.com.
`;
