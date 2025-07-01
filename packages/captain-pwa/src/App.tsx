import React, { useState, useEffect } from 'react';
import './App.css';

// Types
interface User {
  id: string;
  email: string;
  assignedRoles: string[];
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('captain_auth_token');
    if (token) {
      // In a real implementation, verify the token with the API
      setIsAuthenticated(true);
      setUser({
        id: 'captain_demo',
        email: 'captain@example.com',
        assignedRoles: ['CAPTAIN'],
        profile: {
          firstName: 'Maria',
          lastName: 'Rodriguez',
          phone: '+1-555-CAPTAIN',
        },
      });
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, accept any email/password (password validation would be done server-side)
    if (password) {
      localStorage.setItem('captain_auth_token', 'demo_token');
      setIsAuthenticated(true);
      setUser({
        id: 'captain_demo',
        email: email,
        assignedRoles: ['CAPTAIN'],
        profile: {
          firstName: 'Maria',
          lastName: 'Rodriguez',
          phone: '+1-555-CAPTAIN',
        },
      });
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('captain_auth_token');
    setIsAuthenticated(false);
    setUser(null);
    setActiveView('dashboard');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} isLoading={isLoading} />;
  }

  return (
    <div className='captain-app'>
      <Header user={user} onLogout={handleLogout} />
      <main className='main-content'>
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'transactions' && <TransactionsView />}
        {activeView === 'cash' && <CashView />}
        {activeView === 'receipts' && <ReceiptsView />}
      </main>
      <BottomNavigation activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
}

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <div className='loading-screen'>
    <div className='loading-content'>
      <div className='loading-spinner'></div>
      <h2>⚓ YachtCash Captain</h2>
      <p>Loading your maritime dashboard...</p>
    </div>
  </div>
);

// Login Screen Component
interface LoginScreenProps {
  onLogin: (_email: string, _password: string) => Promise<void>;
  isLoading: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (_e: React.FormEvent) => {
    _e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      await onLogin(email, password);
    } catch (_err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className='login-screen'>
      <div className='login-content'>
        <div className='login-header'>
          <div className='app-icon'>⚓</div>
          <h1>YachtCash Captain</h1>
          <p>Maritime Cash Management</p>
        </div>

        <form onSubmit={handleSubmit} className='login-form'>
          {error && <div className='error-message'>{error}</div>}

          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='captain@yacht.com'
              required
              disabled={isLoading}
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='Your password'
              required
              disabled={isLoading}
            />
          </div>

          <button
            type='submit'
            className='login-button'
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className='login-footer'>
          <p>🛥️ Secure maritime petty cash management</p>
        </div>
      </div>
    </div>
  );
};

// Header Component
interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => (
  <header className='app-header'>
    <div className='header-left'>
      <div className='app-icon'>⚓</div>
      <div className='header-text'>
        <h1>YachtCash</h1>
        <span className='user-role'>Captain</span>
      </div>
    </div>
    <div className='header-right'>
      <div className='user-info'>
        <span className='user-name'>
          {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email}
        </span>
      </div>
      <button onClick={onLogout} className='logout-button'>
        Logout
      </button>
    </div>
  </header>
);

// Dashboard Component
const Dashboard: React.FC = () => (
  <div className='dashboard'>
    <div className='dashboard-header'>
      <h2>🏴‍☠️ Captain&apos;s Dashboard</h2>
      <span className='status-badge live'>Live Data</span>
    </div>

    <div className='stats-grid'>
      <div className='stat-card'>
        <div className='stat-icon'>💰</div>
        <div className='stat-content'>
          <h3>Cash on Hand</h3>
          <div className='stat-value'>$25,000</div>
          <div className='stat-detail'>USD Primary</div>
        </div>
      </div>

      <div className='stat-card'>
        <div className='stat-icon'>📋</div>
        <div className='stat-content'>
          <h3>Today&apos;s Transactions</h3>
          <div className='stat-value'>12</div>
          <div className='stat-detail'>$2,450 spent</div>
        </div>
      </div>

      <div className='stat-card'>
        <div className='stat-icon'>🧾</div>
        <div className='stat-content'>
          <h3>Receipts</h3>
          <div className='stat-value'>8</div>
          <div className='stat-detail'>4 pending upload</div>
        </div>
      </div>

      <div className='stat-card'>
        <div className='stat-icon'>⚠️</div>
        <div className='stat-content'>
          <h3>Alerts</h3>
          <div className='stat-value'>2</div>
          <div className='stat-detail'>Low cash EUR</div>
        </div>
      </div>
    </div>

    <div className='recent-section'>
      <h3>Recent Transactions</h3>
      <div className='transaction-list'>
        <div className='transaction-item'>
          <div className='transaction-info'>
            <span className='transaction-vendor'>Marina Fuel</span>
            <span className='transaction-date'>Today, 2:30 PM</span>
          </div>
          <span className='transaction-amount'>-$450.00</span>
        </div>
        <div className='transaction-item'>
          <div className='transaction-info'>
            <span className='transaction-vendor'>Crew Provisions</span>
            <span className='transaction-date'>Today, 11:15 AM</span>
          </div>
          <span className='transaction-amount'>-$127.50</span>
        </div>
        <div className='transaction-item'>
          <div className='transaction-info'>
            <span className='transaction-vendor'>Port Fees</span>
            <span className='transaction-date'>Yesterday</span>
          </div>
          <span className='transaction-amount'>-$89.00</span>
        </div>
      </div>
    </div>

    <div className='quick-actions'>
      <h3>Quick Actions</h3>
      <div className='action-buttons'>
        <button className='action-button'>
          <span className='action-icon'>💳</span>
          New Transaction
        </button>
        <button className='action-button'>
          <span className='action-icon'>📸</span>
          Scan Receipt
        </button>
        <button className='action-button'>
          <span className='action-icon'>📊</span>
          Cash Report
        </button>
        <button className='action-button'>
          <span className='action-icon'>🔄</span>
          Currency Exchange
        </button>
      </div>
    </div>
  </div>
);

// Placeholder Views
const TransactionsView: React.FC = () => (
  <div className='view-placeholder'>
    <div className='placeholder-icon'>💳</div>
    <h2>Transactions</h2>
    <p>Complete transaction history and management</p>
    <div className='feature-list'>
      <div>✅ Record new expenses</div>
      <div>✅ View transaction history</div>
      <div>✅ Categorize expenses</div>
      <div>✅ Multi-currency support</div>
    </div>
  </div>
);

const CashView: React.FC = () => (
  <div className='view-placeholder'>
    <div className='placeholder-icon'>💰</div>
    <h2>Cash Management</h2>
    <p>Monitor and manage yacht cash balances</p>
    <div className='feature-list'>
      <div>✅ Real-time cash balances</div>
      <div>✅ Currency exchange rates</div>
      <div>✅ Low balance alerts</div>
      <div>✅ Cash flow analytics</div>
    </div>
  </div>
);

const ReceiptsView: React.FC = () => (
  <div className='view-placeholder'>
    <div className='placeholder-icon'>🧾</div>
    <h2>Receipt Management</h2>
    <p>Digital receipt storage and organization</p>
    <div className='feature-list'>
      <div>✅ Camera receipt scanning</div>
      <div>✅ Cloud storage sync</div>
      <div>✅ Receipt categorization</div>
      <div>✅ Expense reconciliation</div>
    </div>
  </div>
);

// Bottom Navigation Component
interface BottomNavigationProps {
  activeView: string;
  onViewChange: (_view: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeView, onViewChange }) => (
  <nav className='bottom-navigation'>
    <button
      className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
      onClick={() => onViewChange('dashboard')}
    >
      <span className='nav-icon'>🏠</span>
      <span className='nav-label'>Dashboard</span>
    </button>
    <button
      className={`nav-item ${activeView === 'transactions' ? 'active' : ''}`}
      onClick={() => onViewChange('transactions')}
    >
      <span className='nav-icon'>💳</span>
      <span className='nav-label'>Transactions</span>
    </button>
    <button
      className={`nav-item ${activeView === 'cash' ? 'active' : ''}`}
      onClick={() => onViewChange('cash')}
    >
      <span className='nav-icon'>💰</span>
      <span className='nav-label'>Cash</span>
    </button>
    <button
      className={`nav-item ${activeView === 'receipts' ? 'active' : ''}`}
      onClick={() => onViewChange('receipts')}
    >
      <span className='nav-icon'>🧾</span>
      <span className='nav-label'>Receipts</span>
    </button>
  </nav>
);

export default App;
