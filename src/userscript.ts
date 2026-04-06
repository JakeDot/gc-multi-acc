export const userscriptCode = `// ==UserScript==
// @name         Geocaching Multi-Account Switcher
// @namespace    https://github.com/yourusername/gc-multi-account
// @version      1.1.0
// @description  Easily switch between multiple geocaching.com accounts. Inspiration from GC little helper.
// @author       You
// @match        https://*.geocaching.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const ACCOUNTS_KEY = 'gc_switcher_accounts';
    const SWITCH_INTENT_KEY = 'gc_switcher_intent';

    // Load accounts from storage
    let accounts = GM_getValue(ACCOUNTS_KEY, []);

    // Save accounts to storage
    function saveAccounts(accs) {
        GM_setValue(ACCOUNTS_KEY, accs);
        accounts = accs;
    }

    // --- Create UI Elements ---
    
    // 1. Main Container
    const container = document.createElement('div');
    container.id = 'gc-account-switcher-container';
    container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 999999; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;';

    // 2. Toggle Button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'gc-switcher-toggle';
    toggleBtn.innerHTML = '👥';
    toggleBtn.title = 'Account Switcher';
    toggleBtn.style.cssText = 'background-color: #02874d; color: white; border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 24px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.2s, background-color 0.2s;';
    
    toggleBtn.onmouseover = () => {
        toggleBtn.style.transform = 'scale(1.05)';
        toggleBtn.style.backgroundColor = '#026b3d';
    };
    toggleBtn.onmouseout = () => {
        toggleBtn.style.transform = 'scale(1)';
        toggleBtn.style.backgroundColor = '#02874d';
    };

    // 3. Panel
    const panel = document.createElement('div');
    panel.id = 'gc-switcher-panel';
    panel.style.cssText = 'position: absolute; bottom: 60px; right: 0; background: white; border: 1px solid #ccc; border-radius: 8px; width: 250px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden;';

    container.appendChild(panel);
    container.appendChild(toggleBtn);
    document.body.appendChild(container);

    // 4. Modal Dialog for Add/Edit Account
    const dialog = document.createElement('dialog');
    dialog.id = 'gc-switcher-dialog';
    dialog.style.cssText = 'padding: 20px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-family: sans-serif; background: white; width: 300px; color: #333;';
    dialog.innerHTML = \`
        <h3 style="margin-top: 0; color: #02874d; font-size: 18px;">Add Account</h3>
        <form id="gc-switcher-form" method="dialog" style="display: flex; flex-direction: column; gap: 12px;">
            <label style="font-size: 14px; font-weight: bold; display: flex; flex-direction: column; gap: 4px;">
                Username
                <input type="text" id="gc-username" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 14px;">
            </label>
            <label style="font-size: 14px; font-weight: bold; display: flex; flex-direction: column; gap: 4px;">
                Password
                <input type="password" id="gc-password" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 14px;">
            </label>
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                <button type="button" id="gc-cancel-btn" style="padding: 8px 12px; border: 1px solid #ccc; background: #f9f9f9; border-radius: 4px; cursor: pointer; font-size: 14px; color: #333;">Cancel</button>
                <button type="submit" style="padding: 8px 12px; border: none; background: #02874d; color: white; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px;">Save</button>
            </div>
        </form>
    \`;
    document.body.appendChild(dialog);

    document.getElementById('gc-cancel-btn').onclick = () => {
        dialog.close();
        document.getElementById('gc-switcher-form').reset();
    };

    document.getElementById('gc-switcher-form').onsubmit = () => {
        const username = document.getElementById('gc-username').value.trim();
        const password = document.getElementById('gc-password').value;
        if (username && password) {
            const existingIndex = accounts.findIndex(a => a.username.toLowerCase() === username.toLowerCase());
            if (existingIndex >= 0) {
                accounts[existingIndex].password = password;
            } else {
                accounts.push({ username, password });
            }
            saveAccounts(accounts);
            renderPanel();
        }
        document.getElementById('gc-switcher-form').reset();
    };

    // Render Panel Content
    function renderPanel() {
        panel.innerHTML = '';

        const header = document.createElement('div');
        header.style.cssText = 'background: #02874d; color: white; padding: 10px 15px; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; align-items: center;';
        header.innerHTML = '<span>Switch Account</span>';
        panel.appendChild(header);

        const list = document.createElement('div');
        list.style.cssText = 'max-height: 300px; overflow-y: auto; padding: 10px;';

        if (accounts.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'text-align: center; color: #777; font-size: 12px; padding: 10px 0;';
            empty.textContent = 'No accounts saved.';
            list.appendChild(empty);
        } else {
            accounts.forEach((acc, index) => {
                const item = document.createElement('div');
                item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; margin-bottom: 5px; background: #f9f9f9; border: 1px solid #eee; border-radius: 4px; cursor: pointer; transition: background 0.2s;';
                
                item.onmouseover = () => item.style.background = '#e9e9e9';
                item.onmouseout = () => item.style.background = '#f9f9f9';
                
                const name = document.createElement('span');
                name.style.cssText = 'font-size: 14px; color: #333; font-weight: 500; flex-grow: 1;';
                name.textContent = acc.username;
                name.onclick = () => switchAccount(acc);
                
                const del = document.createElement('span');
                del.innerHTML = '&times;';
                del.title = 'Remove account';
                del.style.cssText = 'color: #d9534f; cursor: pointer; font-size: 16px; padding: 0 5px;';
                
                del.onmouseover = () => del.style.color = '#c9302c';
                del.onmouseout = () => del.style.color = '#d9534f';
                
                del.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm(\`Remove account: \${acc.username}?\`)) {
                        accounts.splice(index, 1);
                        saveAccounts(accounts);
                        renderPanel();
                    }
                };

                item.appendChild(name);
                item.appendChild(del);
                list.appendChild(item);
            });
        }
        panel.appendChild(list);

        const footer = document.createElement('div');
        footer.style.cssText = 'padding: 10px; border-top: 1px solid #eee; background: #fafafa;';
        
        const addBtn = document.createElement('button');
        addBtn.textContent = '+ Add Account';
        addBtn.style.cssText = 'width: 100%; padding: 8px; background: #02874d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: bold; transition: background 0.2s;';
        
        addBtn.onmouseover = () => addBtn.style.background = '#026b3d';
        addBtn.onmouseout = () => addBtn.style.background = '#02874d';
        
        addBtn.onclick = () => {
            dialog.showModal();
        };
        
        footer.appendChild(addBtn);
        panel.appendChild(footer);
    }

    toggleBtn.onclick = () => {
        panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    };

    renderPanel();

    // --- Core Switching Logic ---

    function switchAccount(acc) {
        GM_setValue(SWITCH_INTENT_KEY, acc);
        
        // 1. Check if logged in by looking for user profile link or logout link
        const logoutLink = document.querySelector('a[href*="/account/logout"], a[href*="/play/logout"], a[href*="/login/default.aspx?Wiz=out"]');
        const isLoggedIn = document.querySelector('.user-menu, .profile-avatar') || logoutLink;

        if (isLoggedIn) {
            // Need to log out first
            if (logoutLink) {
                window.location.href = logoutLink.href;
            } else {
                window.location.href = 'https://www.geocaching.com/play/logout';
            }
        } else {
            // Already logged out, go to sign in
            window.location.href = 'https://www.geocaching.com/account/signin';
        }
    }

    // --- Auto-Login Logic ---

    const currentUrl = window.location.href.toLowerCase();
    const intent = GM_getValue(SWITCH_INTENT_KEY, null);

    if (intent) {
        // 1. If we are on a logout page or just logged out, go to sign in
        if (currentUrl.includes('/account/logout') || currentUrl.includes('/play/logout') || document.body.textContent.includes('You have been logged out')) {
            console.log('GC Switcher: Logged out, redirecting to sign-in...');
            window.location.href = 'https://www.geocaching.com/account/signin';
            return;
        }

        // 2. If we are on the homepage but not logged in (and have intent), go to sign in
        const isLoggedIn = document.querySelector('.user-menu, .profile-avatar, a[href*="/account/logout"], a[href*="/play/logout"]');
        if (!isLoggedIn && !currentUrl.includes('login') && !currentUrl.includes('signin') && !currentUrl.includes('identity')) {
             console.log('GC Switcher: Not logged in, redirecting to sign-in...');
             window.location.href = 'https://www.geocaching.com/account/signin';
             return;
        }

        // 3. If we are on the sign-in page (identity.geocaching.com or similar)
        if (currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl.includes('identity')) {
            console.log('GC Switcher: Attempting to auto-login as', intent.username);
            
            const checkForm = setInterval(() => {
                // Identity Server uses #username and #password
                const userField = document.querySelector('input[name="Username"], input[id="Username"], input[id="username"], input[name="username"], input[id="signInName"]');
                const passField = document.querySelector('input[name="Password"], input[id="Password"], input[id="password"], input[name="password"]');
                const submitBtn = document.querySelector('button[type="submit"], input[type="submit"], button[id="next"], button[value="login"], button[name="button"]');
                
                if (userField && passField && submitBtn) {
                    clearInterval(checkForm);
                    
                    // Fill credentials
                    userField.value = intent.username;
                    passField.value = intent.password;
                    
                    // Dispatch events to trigger React/Angular/Vue bindings
                    userField.dispatchEvent(new Event('input', { bubbles: true }));
                    userField.dispatchEvent(new Event('change', { bubbles: true }));
                    passField.dispatchEvent(new Event('input', { bubbles: true }));
                    passField.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Clear intent so we don't loop if login fails
                    GM_deleteValue(SWITCH_INTENT_KEY);
                    
                    // Submit form with a slight delay to allow framework state to update
                    setTimeout(() => {
                        submitBtn.click();
                    }, 500);
                }
            }, 500);

            // Timeout after 10 seconds
            setTimeout(() => clearInterval(checkForm), 10000);
        }
    }

})();
`;;
