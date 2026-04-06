export const userscriptCode = `// ==UserScript==
// @name         Geocaching Power Tools (Multi-Account & Cache Manager)
// @namespace    https://github.com/yourusername/gc-power-tools
// @version      2.0.0
// @description  Easily switch between multiple accounts and manage unpublished caches in a tabbed workspace.
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
    const WORKSPACE_TABS_KEY = 'gc_workspace_tabs';
    const WORKSPACE_OPEN_KEY = 'gc_workspace_open';
    const WORKSPACE_ACTIVE_TAB_KEY = 'gc_workspace_active_tab';

    // Load state from storage
    let accounts = GM_getValue(ACCOUNTS_KEY, []);
    let workspaceTabs = GM_getValue(WORKSPACE_TABS_KEY, []);
    let isWorkspaceOpen = GM_getValue(WORKSPACE_OPEN_KEY, false);
    let activeTabId = GM_getValue(WORKSPACE_ACTIVE_TAB_KEY, null);

    function saveAccounts(accs) {
        GM_setValue(ACCOUNTS_KEY, accs);
        accounts = accs;
    }

    // ==========================================
    // UI: Main Container & Toggle Button
    // ==========================================
    const container = document.createElement('div');
    container.id = 'gc-power-tools-container';
    container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 2147483646; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;';

    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '🛠️';
    toggleBtn.title = 'GC Power Tools';
    toggleBtn.style.cssText = 'background-color: #02874d; color: white; border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 24px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.2s, background-color 0.2s;';
    
    toggleBtn.onmouseover = () => {
        toggleBtn.style.transform = 'scale(1.05)';
        toggleBtn.style.backgroundColor = '#026b3d';
    };
    toggleBtn.onmouseout = () => {
        toggleBtn.style.transform = 'scale(1)';
        toggleBtn.style.backgroundColor = '#02874d';
    };

    // ==========================================
    // UI: Mini Panel (Account Switcher)
    // ==========================================
    const panel = document.createElement('div');
    panel.style.cssText = 'position: absolute; bottom: 60px; right: 0; background: white; border: 1px solid #ccc; border-radius: 8px; width: 250px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden;';

    container.appendChild(panel);
    container.appendChild(toggleBtn);
    document.body.appendChild(container);

    // ==========================================
    // UI: Add Account Dialog
    // ==========================================
    const dialog = document.createElement('dialog');
    dialog.style.cssText = 'padding: 20px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-family: sans-serif; background: white; width: 300px; color: #333; z-index: 2147483647;';
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
            renderWorkspace(); // Update workspace dropdown if open
        }
        document.getElementById('gc-switcher-form').reset();
    };

    // ==========================================
    // UI: Workspace (Cache Manager)
    // ==========================================
    const workspace = document.createElement('div');
    workspace.style.cssText = 'position: fixed; inset: 0; z-index: 2147483647; background: #f0f0f0; display: none; flex-direction: column; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;';

    const wsHeader = document.createElement('div');
    wsHeader.style.cssText = 'height: 50px; background: #02874d; display: flex; align-items: center; padding: 0 15px; gap: 15px; color: white; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 2;';

    // Workspace: Add Cache Form
    const addForm = document.createElement('form');
    addForm.style.cssText = 'display: flex; gap: 5px; margin: 0;';
    addForm.innerHTML = \`
        <input type="text" id="gc-ws-input" placeholder="GC Code or URL..." style="padding: 6px 10px; border-radius: 4px; border: none; font-size: 13px; width: 150px; outline: none;">
        <button type="submit" style="padding: 6px 12px; background: #015c34; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: bold;">Add Tab</button>
    \`;
    
    addForm.onsubmit = (e) => {
        e.preventDefault();
        const input = document.getElementById('gc-ws-input');
        const val = input.value.trim();
        if (!val) return;

        let finalUrl = val;
        let title = val;

        if (/^GC[0-9A-Z]+$/i.test(val)) {
            finalUrl = \`https://www.geocaching.com/geocache/\${val.toUpperCase()}\`;
            title = val.toUpperCase();
        } else if (val.includes('geocaching.com')) {
            try {
                const urlObj = new URL(val);
                title = urlObj.pathname.split('/').pop() || 'Cache';
            } catch (e) {
                title = 'Cache';
            }
        } else {
            // Fallback search
            finalUrl = \`https://www.geocaching.com/play/search?q=\${encodeURIComponent(val)}\`;
            title = val;
        }

        const newTab = { id: Date.now().toString(), title, url: finalUrl };
        workspaceTabs.push(newTab);
        GM_setValue(WORKSPACE_TABS_KEY, workspaceTabs);
        activeTabId = newTab.id;
        GM_setValue(WORKSPACE_ACTIVE_TAB_KEY, activeTabId);
        input.value = '';
        renderWorkspace();
    };

    // Workspace: Tabs Container
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = 'display: flex; flex-grow: 1; overflow-x: auto; gap: 5px; height: 100%; align-items: flex-end; padding-top: 10px; scrollbar-width: none;';

    // Workspace: Account Selector
    const accountSelect = document.createElement('select');
    accountSelect.style.cssText = 'padding: 6px 10px; border-radius: 4px; border: none; background: white; color: #333; font-size: 13px; cursor: pointer; outline: none; font-weight: bold;';
    accountSelect.onchange = (e) => {
        const username = e.target.value;
        if (!username) return;
        const acc = accounts.find(a => a.username === username);
        if (acc) {
            // Ensure workspace reopens after login redirect
            GM_setValue(WORKSPACE_OPEN_KEY, true);
            switchAccount(acc);
        }
    };

    // Workspace: Close Button
    const closeWsBtn = document.createElement('button');
    closeWsBtn.innerHTML = '&times;';
    closeWsBtn.title = 'Close Workspace';
    closeWsBtn.style.cssText = 'background: transparent; color: white; border: none; font-size: 24px; cursor: pointer; padding: 0 5px; line-height: 1;';
    closeWsBtn.onclick = () => {
        isWorkspaceOpen = false;
        GM_setValue(WORKSPACE_OPEN_KEY, false);
        renderWorkspace();
    };

    wsHeader.appendChild(addForm);
    wsHeader.appendChild(tabsContainer);
    wsHeader.appendChild(accountSelect);
    wsHeader.appendChild(closeWsBtn);
    workspace.appendChild(wsHeader);

    // Workspace: Iframe Container
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = 'flex-grow: 1; position: relative; background: #fff; display: flex; flex-direction: column;';

    // Workspace: Warning Banner
    const warningBanner = document.createElement('div');
    warningBanner.style.cssText = 'background: #fff3cd; color: #856404; padding: 10px 15px; font-size: 13px; border-bottom: 1px solid #ffeeba; display: flex; justify-content: space-between; align-items: center;';
    warningBanner.innerHTML = \`
        <span><strong>Note:</strong> If cache pages fail to load, Geocaching.com might be blocking iframes via X-Frame-Options. You may need a browser extension like "Ignore X-Frame Headers" to bypass this.</span>
        <button style="background: none; border: none; color: #856404; cursor: pointer; font-size: 16px; font-weight: bold; padding: 0 5px;">&times;</button>
    \`;
    warningBanner.querySelector('button').onclick = () => warningBanner.style.display = 'none';
    
    iframeContainer.appendChild(warningBanner);

    // Workspace: Iframe Wrapper (to hold the actual iframes below the banner)
    const iframeWrapper = document.createElement('div');
    iframeWrapper.style.cssText = 'flex-grow: 1; position: relative;';
    iframeContainer.appendChild(iframeWrapper);

    workspace.appendChild(iframeContainer);
    document.body.appendChild(workspace);

    // ==========================================
    // Render Functions
    // ==========================================
    function renderPanel() {
        panel.innerHTML = '';

        // Open Workspace Button
        const wsBtnContainer = document.createElement('div');
        wsBtnContainer.style.cssText = 'padding: 10px; border-bottom: 1px solid #eee; background: #fafafa;';
        const openWsBtn = document.createElement('button');
        openWsBtn.textContent = '🗺️ Open Cache Manager';
        openWsBtn.style.cssText = 'width: 100%; padding: 10px; background: #02874d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold; transition: background 0.2s;';
        openWsBtn.onmouseover = () => openWsBtn.style.background = '#026b3d';
        openWsBtn.onmouseout = () => openWsBtn.style.background = '#02874d';
        openWsBtn.onclick = () => {
            isWorkspaceOpen = true;
            GM_setValue(WORKSPACE_OPEN_KEY, true);
            panel.style.display = 'none';
            renderWorkspace();
        };
        wsBtnContainer.appendChild(openWsBtn);
        panel.appendChild(wsBtnContainer);

        const header = document.createElement('div');
        header.style.cssText = 'background: #333; color: white; padding: 8px 15px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;';
        header.innerHTML = '<span>Accounts</span>';
        panel.appendChild(header);

        const list = document.createElement('div');
        list.style.cssText = 'max-height: 250px; overflow-y: auto; padding: 10px;';

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
                        renderWorkspace();
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
        addBtn.style.cssText = 'width: 100%; padding: 8px; background: white; color: #02874d; border: 1px solid #02874d; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: bold; transition: all 0.2s;';
        
        addBtn.onmouseover = () => {
            addBtn.style.background = '#02874d';
            addBtn.style.color = 'white';
        };
        addBtn.onmouseout = () => {
            addBtn.style.background = 'white';
            addBtn.style.color = '#02874d';
        };
        
        addBtn.onclick = () => dialog.showModal();
        
        footer.appendChild(addBtn);
        panel.appendChild(footer);
    }

    function renderWorkspace() {
        workspace.style.display = isWorkspaceOpen ? 'flex' : 'none';
        if (!isWorkspaceOpen) return;

        // 1. Update Account Select Dropdown
        accountSelect.innerHTML = '<option value="" disabled selected>Switch Account...</option>';
        
        // Try to find currently logged in user to show it
        const loggedInUserEl = document.querySelector('.user-menu .username, .profile-avatar');
        const loggedInUser = loggedInUserEl ? loggedInUserEl.textContent.trim() : null;

        accounts.forEach(acc => {
            const opt = document.createElement('option');
            opt.value = acc.username;
            opt.textContent = acc.username;
            if (loggedInUser && loggedInUser.toLowerCase() === acc.username.toLowerCase()) {
                opt.textContent = \`✓ \${acc.username}\`;
                opt.selected = true;
            }
            accountSelect.appendChild(opt);
        });

        // 2. Render Tabs
        tabsContainer.innerHTML = '';
        workspaceTabs.forEach(tab => {
            const isActive = tab.id === activeTabId;
            const tabEl = document.createElement('div');
            tabEl.style.cssText = \`padding: 8px 15px; background: \${isActive ? '#fff' : '#015c34'}; color: \${isActive ? '#333' : '#fff'}; border-radius: 6px 6px 0 0; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: \${isActive ? 'bold' : 'normal'}; transition: background 0.2s; max-width: 200px;\`;
            
            if (!isActive) {
                tabEl.onmouseover = () => tabEl.style.background = '#026b3d';
                tabEl.onmouseout = () => tabEl.style.background = '#015c34';
            }

            tabEl.onclick = () => {
                activeTabId = tab.id;
                GM_setValue(WORKSPACE_ACTIVE_TAB_KEY, activeTabId);
                renderWorkspace();
            };

            const title = document.createElement('span');
            title.textContent = tab.title;
            title.style.cssText = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';

            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.cssText = \`cursor: pointer; font-size: 16px; line-height: 1; opacity: \${isActive ? '0.5' : '0.8'};\`;
            closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
            closeBtn.onmouseout = () => closeBtn.style.opacity = isActive ? '0.5' : '0.8';
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                workspaceTabs = workspaceTabs.filter(t => t.id !== tab.id);
                GM_setValue(WORKSPACE_TABS_KEY, workspaceTabs);
                if (activeTabId === tab.id) {
                    activeTabId = workspaceTabs.length > 0 ? workspaceTabs[workspaceTabs.length - 1].id : null;
                    GM_setValue(WORKSPACE_ACTIVE_TAB_KEY, activeTabId);
                }
                renderWorkspace();
            };

            tabEl.appendChild(title);
            tabEl.appendChild(closeBtn);
            tabsContainer.appendChild(tabEl);
        });

        // 3. Render Iframes
        const existingIframes = Array.from(iframeWrapper.children);
        const currentTabIds = workspaceTabs.map(t => t.id);

        // Remove deleted tabs
        existingIframes.forEach(ifr => {
            if (ifr.id !== 'gc-ws-empty' && !currentTabIds.includes(ifr.dataset.id)) {
                ifr.remove();
            }
        });

        // Add or update iframes
        if (workspaceTabs.length === 0) {
            // Show empty state
            let emptyState = iframeWrapper.querySelector('#gc-ws-empty');
            if (!emptyState) {
                emptyState = document.createElement('div');
                emptyState.id = 'gc-ws-empty';
                emptyState.style.cssText = 'position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #777; font-size: 16px;';
                emptyState.innerHTML = '<div style="font-size: 48px; margin-bottom: 10px;">🗺️</div><p>No active tabs. Add a GC code above to start.</p>';
                iframeWrapper.appendChild(emptyState);
            }
            emptyState.style.display = 'flex';
        } else {
            const emptyState = iframeWrapper.querySelector('#gc-ws-empty');
            if (emptyState) emptyState.style.display = 'none';

            workspaceTabs.forEach(tab => {
                let ifr = iframeWrapper.querySelector(\`iframe[data-id="\${tab.id}"]\`);
                if (!ifr) {
                    ifr = document.createElement('iframe');
                    ifr.dataset.id = tab.id;
                    ifr.src = tab.url;
                    ifr.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; border: none; background: white;';
                    iframeWrapper.appendChild(ifr);
                }
                ifr.style.display = tab.id === activeTabId ? 'block' : 'none';
            });
        }
    }

    toggleBtn.onclick = () => {
        panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    };

    // Initialize UI
    renderPanel();
    if (isWorkspaceOpen) {
        renderWorkspace();
    }

    // ==========================================
    // Core Switching Logic
    // ==========================================
    function switchAccount(acc) {
        GM_setValue(SWITCH_INTENT_KEY, acc);
        
        const logoutLink = document.querySelector('a[href*="/account/logout"], a[href*="/play/logout"], a[href*="/login/default.aspx?Wiz=out"]');
        const isLoggedIn = document.querySelector('.user-menu, .profile-avatar') || logoutLink;

        if (isLoggedIn) {
            if (logoutLink) {
                window.location.href = logoutLink.href;
            } else {
                window.location.href = 'https://www.geocaching.com/play/logout';
            }
        } else {
            window.location.href = 'https://www.geocaching.com/account/signin';
        }
    }

    // ==========================================
    // Auto-Login Logic
    // ==========================================
    const currentUrl = window.location.href.toLowerCase();
    const intent = GM_getValue(SWITCH_INTENT_KEY, null);

    if (intent) {
        if (currentUrl.includes('/account/logout') || currentUrl.includes('/play/logout') || document.body.textContent.includes('You have been logged out')) {
            console.log('GC Power Tools: Logged out, redirecting to sign-in...');
            window.location.href = 'https://www.geocaching.com/account/signin';
            return;
        }

        const isLoggedIn = document.querySelector('.user-menu, .profile-avatar, a[href*="/account/logout"], a[href*="/play/logout"]');
        if (!isLoggedIn && !currentUrl.includes('login') && !currentUrl.includes('signin') && !currentUrl.includes('identity')) {
             console.log('GC Power Tools: Not logged in, redirecting to sign-in...');
             window.location.href = 'https://www.geocaching.com/account/signin';
             return;
        }

        if (currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl.includes('identity')) {
            console.log('GC Power Tools: Attempting to auto-login as', intent.username);
            
            const checkForm = setInterval(() => {
                const userField = document.querySelector('input[name="Username"], input[id="Username"], input[id="username"], input[name="username"], input[id="signInName"]');
                const passField = document.querySelector('input[name="Password"], input[id="Password"], input[id="password"], input[name="password"]');
                const submitBtn = document.querySelector('button[type="submit"], input[type="submit"], button[id="next"], button[value="login"], button[name="button"]');
                
                if (userField && passField && submitBtn) {
                    clearInterval(checkForm);
                    
                    userField.value = intent.username;
                    passField.value = intent.password;
                    
                    userField.dispatchEvent(new Event('input', { bubbles: true }));
                    userField.dispatchEvent(new Event('change', { bubbles: true }));
                    passField.dispatchEvent(new Event('input', { bubbles: true }));
                    passField.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    GM_deleteValue(SWITCH_INTENT_KEY);
                    
                    setTimeout(() => {
                        submitBtn.click();
                    }, 500);
                }
            }, 500);

            setTimeout(() => clearInterval(checkForm), 10000);
        }
    }

})();
`;
