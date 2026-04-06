import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, RefreshCw } from 'lucide-react';
import { AccountEngine, Account } from './lib/engine';
import { cn } from './lib/utils';

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', token: '', avatar: '' });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const fetchedAccounts = await AccountEngine.fetchAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.token) {
      alert('Please fill in name and token');
      return;
    }

    const account: Account = {
      id: Date.now().toString(),
      name: newAccount.name,
      token: newAccount.token,
      avatar: newAccount.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${newAccount.name}`
    };

    try {
      await AccountEngine.addAccount(account);
      setNewAccount({ name: '', token: '', avatar: '' });
      setShowAddForm(false);
      await loadAccounts();
    } catch (error) {
      console.error('Failed to add account:', error);
      alert('Failed to add account');
    }
  };

  const handleRemoveAccount = async (id: string) => {
    if (!confirm('Are you sure you want to remove this account?')) {
      return;
    }

    try {
      await AccountEngine.removeAccount(id);
      await loadAccounts();
    } catch (error) {
      console.error('Failed to remove account:', error);
      alert('Failed to remove account');
    }
  };

  const handleSwitchAccount = async (account: Account) => {
    setSwitching(account.id);
    try {
      await AccountEngine.switchAccount(account);
    } catch (error) {
      console.error('Failed to switch account:', error);
      alert('Failed to switch account. Make sure you are using the extension on gartic.io');
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col font-sans text-white">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">GC Multi-Acc Pro</h1>
            <p className="text-sm text-slate-400">Gartic.io Account Manager</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            showAddForm
              ? "bg-slate-700 text-white"
              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
          )}
        >
          <Plus size={16} />
          Add Account
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 max-w-4xl mx-auto w-full">
        {/* Add Account Form */}
        {showAddForm && (
          <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Account Name</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="My Account"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Session Token</label>
                <input
                  type="text"
                  value={newAccount.token}
                  onChange={(e) => setNewAccount({ ...newAccount, token: e.target.value })}
                  placeholder="Your session token from cookies"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Avatar URL (Optional)</label>
                <input
                  type="text"
                  value={newAccount.avatar}
                  onChange={(e) => setNewAccount({ ...newAccount, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddAccount}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Save Account
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accounts List */}
        <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="bg-slate-900/50 border-b border-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold">Saved Accounts</h2>
            <p className="text-sm text-slate-400 mt-1">
              {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} saved
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-slate-400">Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No accounts saved yet</p>
              <p className="text-sm text-slate-500 mt-2">Click "Add Account" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 hover:bg-slate-700/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={account.avatar}
                      alt={account.name}
                      className="w-12 h-12 rounded-full bg-slate-700"
                    />
                    <div>
                      <h3 className="font-medium">{account.name}</h3>
                      <p className="text-sm text-slate-400">
                        Token: {account.token.substring(0, 20)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSwitchAccount(account)}
                      disabled={switching === account.id}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        switching === account.id
                          ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md"
                      )}
                    >
                      <RefreshCw size={16} className={switching === account.id ? 'animate-spin' : ''} />
                      {switching === account.id ? 'Switching...' : 'Switch'}
                    </button>
                    <button
                      onClick={() => handleRemoveAccount(account.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
