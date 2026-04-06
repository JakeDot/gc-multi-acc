export interface Account {
  id: string;
  name: string;
  token: string;
  avatar: string;
}

const IS_EXTENSION = typeof chrome !== 'undefined' && !!chrome.cookies;

export const AccountEngine = {
  // Get accounts from Chrome Storage or LocalStorage
  async fetchAccounts(): Promise<Account[]> {
    if (IS_EXTENSION) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['accounts'], (result) => {
          resolve(result.accounts || []);
        });
      });
    } else {
      const stored = localStorage.getItem('gcpro_accounts');
      return stored ? JSON.parse(stored) : [];
    }
  },

  // Save accounts
  async saveAccounts(accounts: Account[]): Promise<void> {
    if (IS_EXTENSION) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ accounts }, () => resolve());
      });
    } else {
      localStorage.setItem('gcpro_accounts', JSON.stringify(accounts));
    }
  },

  // Add a new account
  async addAccount(account: Account): Promise<void> {
    const accounts = await this.fetchAccounts();
    accounts.push(account);
    await this.saveAccounts(accounts);
  },

  // Remove an account
  async removeAccount(id: string): Promise<void> {
    const accounts = await this.fetchAccounts();
    const filtered = accounts.filter(acc => acc.id !== id);
    await this.saveAccounts(filtered);
  },

  // Switch account (Extension mode only)
  async switchAccount(account: Account): Promise<void> {
    if (!IS_EXTENSION) {
      throw new Error('Account switching requires extension mode');
    }

    // Set the cookie for gartic.io
    return new Promise((resolve, reject) => {
      chrome.cookies.set({
        url: 'https://gartic.io',
        name: 'session',
        value: account.token,
        domain: '.gartic.io',
        path: '/',
        secure: true,
        httpOnly: false,
      }, (cookie) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          // Reload the active tab
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
              chrome.tabs.reload(tabs[0].id);
            }
            resolve();
          });
        }
      });
    });
  },

  // Get current session token from cookies (Extension mode only)
  async getCurrentSession(): Promise<string | null> {
    if (!IS_EXTENSION) {
      return null;
    }

    return new Promise((resolve) => {
      chrome.cookies.get({
        url: 'https://gartic.io',
        name: 'session'
      }, (cookie) => {
        resolve(cookie?.value || null);
      });
    });
  }
};
