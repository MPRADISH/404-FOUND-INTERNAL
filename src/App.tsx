import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ShieldAlert, Users, ArrowRight, ChevronLeft, UserCircle, ShieldCheck, FilePenLine, ListOrdered, Search, CheckCircle, XCircle, AlertCircle, Upload, LogOut, Camera, ImagePlus, Trash2, ScanLine, Image as ImageIcon, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const AuthContext = React.createContext<{ isAuthenticated: boolean; currentUser: FirebaseUser | null; login: () => Promise<void>; logout: () => Promise<void>; loading: boolean } | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Create user doc if not exists (simplified write)
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            createdAt: serverTimestamp() // This might overwrite, but rules allow it if it matches request.time and we're just syncing
          }, { merge: true });
        } catch (e) {
          console.error("Error setting user doc", e);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!currentUser, currentUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return React.useContext(AuthContext)!;
}

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/customer/login" replace />;
  return <Outlet />;
}

function CustomerNavbar() {
  const { logout } = useAuth();
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--surface-solid)] text-[var(--accent)] border border-[var(--border)]' : 'text-[var(--text-2)] hover:text-[var(--accent)]'}`}>
        <Icon size={18} />
        <span className="hidden md:inline font-medium text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[var(--navbar-bg)] border-b border-[var(--border)] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
      <Link to="/customer/dashboard" className="flex items-center gap-2 text-[var(--text-1)]">
        <ShieldAlert className="text-[var(--accent)]" size={24} />
        <span className="font-serif font-bold text-xl hidden sm:inline">Consumer Portal</span>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
        <NavItem to="/customer/dashboard" icon={ShieldAlert} label="Dashboard" />
        <NavItem to="/customer/check-compliance" icon={ShieldCheck} label="Check Compliance" />
        <NavItem to="/customer/file-complaint" icon={FilePenLine} label="File Complaint" />
        <NavItem to="/customer/track-complaints" icon={ListOrdered} label="Track Status" />
      </div>
      <button onClick={logout} className="flex items-center gap-2 text-[var(--text-2)] hover:text-red-500 transition-colors">
        <LogOut size={20} />
        <span className="hidden sm:inline font-medium text-sm">Sign Out</span>
      </button>
    </nav>
  );
}

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[var(--surface)] font-sans text-[var(--text-1)]">
      <CustomerNavbar />
      <Outlet />
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--surface)] font-sans">
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-8">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-1)] animate-fade-in-up-1">
            National Consumer Protection Portal
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-2)] max-w-2xl mx-auto animate-fade-in-up-2">
            A secure gateway for citizens to report grievances and for government officers to process and resolve consumer rights violations.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-8 animate-fade-in-up-3">
          
          {/* Customer / Consumer Card */}
          <Link 
            to="/customer/login"
            className="group flex flex-col p-8 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 items-start text-left space-y-4 hover:shadow-[0_4px_30px_var(--accent-dim)]"
          >
            <div className="p-4 rounded-full bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--accent)] group-hover:scale-110 transition-transform duration-300">
              <Users size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-[var(--text-1)] mb-2">Customer / Consumer</h2>
              <p className="text-[var(--text-3)]">
                File a new complaint, track the status of your existing grievances, and access consumer rights resources.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-[var(--accent)] font-medium">
              <span>Access Portal</span>
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Officer Login Card */}
          <a 
            href="https://sih-nnfh-ivory.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col p-8 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 items-start text-left space-y-4 hover:shadow-[0_4px_30px_var(--accent-dim)]"
          >
            <div className="p-4 rounded-full bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--accent)] group-hover:scale-110 transition-transform duration-300">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-[var(--text-1)] mb-2">Officer Login</h2>
              <p className="text-[var(--text-3)]">
                Secure access for authorized government officials to review, investigate, and resolve consumer complaints.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-[var(--accent)] font-medium">
              <span>Secure Login</span>
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

        </div>

      </div>
    </div>
  );
}

function CustomerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login();
      navigate('/customer/dashboard');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--surface)] font-sans">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] space-y-6 text-center shadow-[0_4px_30px_var(--border-subtle)] animate-fade-in-up-1">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--text-1)] mb-4">
          <Users size={32} />
        </div>
        <h1 className="text-3xl font-bold font-serif text-[var(--text-1)]">Customer Login</h1>
        <p className="text-[var(--text-3)] pb-4 border-b border-[var(--border-subtle)]">
          Sign in to access your consumer dashboard and track your complaints.
        </p>
        <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <div className="pt-4">
          <Link 
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--text-3)] transition-colors w-full"
          >
            <ChevronLeft size={18} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function CustomerDashboard() {
  return (
    <>
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        <div className="space-y-4 animate-fade-in-up-1">
          <h1 className="text-4xl md:text-5xl font-bold font-serif">Welcome, Citizen</h1>
          <p className="text-lg text-[var(--text-2)]">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up-2">
          {/* Check Compliance Card */}
          <Link 
            to="/customer/check-compliance"
            className="group flex flex-col p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 items-start text-left space-y-4 hover:shadow-[0_4px_30px_var(--accent-dim)]"
          >
            <div className="p-3 rounded-full bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--accent)] group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[var(--text-1)] mb-2">Check Compliance</h2>
              <p className="text-[var(--text-3)] text-sm">
                Verify if a business or service provider is compliant with national consumer standards.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-[var(--accent)] text-sm font-medium">
              <span>Verify Now</span>
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* File Complaint Card */}
          <Link 
            to="/customer/file-complaint"
            className="group flex flex-col p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 items-start text-left space-y-4 hover:shadow-[0_4px_30px_var(--accent-dim)]"
          >
            <div className="p-3 rounded-full bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--accent)] group-hover:scale-110 transition-transform duration-300">
              <FilePenLine size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[var(--text-1)] mb-2">File a Complaint</h2>
              <p className="text-[var(--text-3)] text-sm">
                Report a grievance or consumer rights violation securely for official review.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-[var(--accent)] text-sm font-medium">
              <span>Start Report</span>
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Track Complaints Card */}
          <Link 
            to="/customer/track-complaints"
            className="group flex flex-col p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 items-start text-left space-y-4 hover:shadow-[0_4px_30px_var(--accent-dim)]"
          >
            <div className="p-3 rounded-full bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--accent)] group-hover:scale-110 transition-transform duration-300">
              <ListOrdered size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[var(--text-1)] mb-2">Track Complaints</h2>
              <p className="text-[var(--text-3)] text-sm">
                View the real-time status, updates, and officer remarks on your existing grievances.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-[var(--accent)] text-sm font-medium">
              <span>View Status</span>
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}

type ProductStatus = 'compliant' | 'non-compliant' | 'pending';

interface ProductData {
  id: string;
  name: string;
  barcode: string;
  weight: string;
  mrp: string;
  manufacturer: string;
  status: ProductStatus;
  reason?: string;
}

const MOCK_PRODUCTS: ProductData[] = [
  { id: 'PRD-001', name: 'AquaPure Filter', barcode: '8901234567890', weight: '250g', mrp: '$15.99', manufacturer: 'Aqua Systems Inc.', status: 'compliant' },
  { id: 'PRD-002', name: 'Brand XYZ Rice', barcode: '8901234567891', weight: '5kg', mrp: '$22.50', manufacturer: 'XYZ AgriCorp', status: 'compliant' },
  { id: 'PRD-003', name: 'Generic LED Bulb 9W', barcode: '8901234567892', weight: '100g', mrp: '$4.99', manufacturer: 'BrightLight Electronics', status: 'non-compliant', reason: 'Fails energy efficiency standards' },
  { id: 'PRD-004', name: 'Fake Brand Headphones', barcode: '8901234567893', weight: '150g', mrp: '$12.00', manufacturer: 'Unknown', status: 'non-compliant', reason: 'Counterfeit product detected' },
  { id: 'PRD-005', name: 'Green Valley Organic Honey', barcode: '8901234567894', weight: '500g', mrp: '$9.99', manufacturer: 'Green Valley Farms', status: 'pending', reason: 'Awaiting lab test results for organic certification' },
  { id: 'PRD-006', name: 'SuperClean Detergent', barcode: '8901234567895', weight: '2kg', mrp: '$14.50', manufacturer: 'HomeCare Brands', status: 'compliant' },
  { id: 'PRD-007', name: 'TastePlus Spices Mix', barcode: '8901234567896', weight: '100g', mrp: '$3.50', manufacturer: 'TastePlus Ltd.', status: 'non-compliant', reason: 'Contains unapproved artificial food colors' },
  { id: 'PRD-008', name: 'PowerMax AA Batteries (4 Pack)', barcode: '8901234567897', weight: '100g', mrp: '$5.00', manufacturer: 'PowerMax Energy', status: 'compliant' },
  { id: 'PRD-009', name: 'DailyFresh Milk 1L', barcode: '8901234567898', weight: '1L', mrp: '$2.00', manufacturer: 'DailyFresh Dairies', status: 'compliant' },
  { id: 'PRD-010', name: 'ActiveWear Fitness Tracker', barcode: '8901234567899', weight: '45g', mrp: '$49.99', manufacturer: 'ActiveWear Tech', status: 'pending', reason: 'Software compliance review in progress' },
  { id: 'PRD-011', name: 'PureLife Mineral Water', barcode: '8901234567900', weight: '1L', mrp: '$1.50', manufacturer: 'PureLife Springs', status: 'compliant' },
  { id: 'PRD-012', name: 'SweetTreat Chocolate Bar', barcode: '8901234567901', weight: '50g', mrp: '$1.25', manufacturer: 'SweetTreat Confections', status: 'non-compliant', reason: 'Declared weight does not match verified weight' },
];

function CheckCompliance() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    setIsScanning(true);
    setScanError(null);
    
    // allow the #reader div in the modal to mount
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            if (scannerRef.current) {
              scannerRef.current.stop().then(() => {
                scannerRef.current = null;
                setIsScanning(false);
                
                // Lookup product
                const found = MOCK_PRODUCTS.find(p => p.barcode === decodedText);
                if (found) {
                  navigate(`/customer/compliance-result?query=${encodeURIComponent(found.name)}`);
                } else {
                  // If no match found in mock DB, set error but keep them on current screen (or show alert)
                  alert(`Product not found for barcode: ${decodedText}`);
                }
              }).catch(console.error);
            }
          },
          (errorMessage) => {
            // ignore scan errors (they happen every frame a barcode isn't found)
          }
        );
      } catch (err) {
        console.error(err);
        setScanError("Failed to access camera.");
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null;
        setIsScanning(false);
      }).catch(console.error);
    } else {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate processing an uploaded image and reading barcode
      setTimeout(() => {
        navigate(`/customer/compliance-result?query=8901234567890`); // Mock successful barcode read
      }, 800);
    }
  };

  const handlePresetClick = (query: string) => {
    navigate(`/customer/compliance-result?query=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-4 animate-fade-in-up-1">
          <h1 className="text-3xl md:text-4xl font-bold font-serif">Verify Product Compliance</h1>
          <p className="text-[var(--text-2)] text-lg">
            Scan a product barcode or upload an image to instantly verify its compliance status against national databases.
          </p>
        </div>

        {/* Demo Presets */}
        <div className="animate-fade-in-up-2 space-y-3">
          <h2 className="text-sm font-medium text-[var(--text-3)] uppercase tracking-wider mb-2">Instant Demo Presets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => handlePresetClick('SunCrisp')}
              className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left flex flex-col gap-2 group shadow-sm"
            >
              <span className="font-medium text-[var(--text-1)] group-hover:text-red-500 transition-colors">SunCrisp Multigrain</span>
              <span className="text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/20 inline-flex self-start">Non-Compliant</span>
            </button>
            <button 
              onClick={() => handlePresetClick('Anand')}
              className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left flex flex-col gap-2 group shadow-sm"
            >
              <span className="font-medium text-[var(--text-1)] group-hover:text-green-500 transition-colors">Anand Premium Almonds</span>
              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded border border-green-500/20 inline-flex self-start">Compliant</span>
            </button>
            <button 
              onClick={() => handlePresetClick('ActiveWear')}
              className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all text-left flex flex-col gap-2 group shadow-sm"
            >
              <span className="font-medium text-[var(--text-1)] group-hover:text-[var(--accent)] transition-colors">ActiveWear Tracker</span>
              <span className="text-xs px-2 py-1 bg-[var(--accent-dim)] text-[var(--accent)] rounded border border-[var(--accent-border)] inline-flex self-start">Pending Review</span>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="animate-fade-in-up-3 p-6 sm:p-8 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[0_4px_30px_var(--border-subtle)] space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold font-serif text-[var(--text-1)]">Scan or Upload</h2>
            <p className="text-[var(--text-3)] text-sm">Choose an option below to analyze a product barcode or package</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer bg-[var(--surface-solid)] hover:bg-[var(--surface-card)] hover:border-[var(--accent)] transition-all group">
              <ImageIcon size={28} className="mb-3 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-colors" />
              <span className="text-sm font-medium text-[var(--text-2)] group-hover:text-[var(--text-1)] transition-colors">Browse Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer bg-[var(--surface-solid)] hover:bg-[var(--surface-card)] hover:border-[var(--accent)] transition-all group">
              <Camera size={28} className="mb-3 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-colors" />
              <span className="text-sm font-medium text-[var(--text-2)] group-hover:text-[var(--text-1)] transition-colors">Use Camera</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
            </label>

            <button 
              type="button"
              onClick={startScanner}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer bg-[var(--surface-solid)] hover:bg-[var(--surface-card)] hover:border-[var(--accent)] transition-all group"
            >
              <ScanLine size={28} className="mb-3 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-colors" />
              <span className="text-sm font-medium text-[var(--text-2)] group-hover:text-[var(--text-1)] transition-colors">Scan Barcode</span>
            </button>
          </div>
        </div>
      </main>

      {/* Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f0f0f]/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--surface-card)] rounded-2xl overflow-hidden w-full max-w-sm border border-[var(--border)] shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--surface-solid)]">
              <h3 className="font-bold text-[var(--text-1)] font-serif">Scan Product Barcode</h3>
              <button onClick={stopScanner} className="text-[var(--text-3)] hover:text-red-500 transition-colors p-1 bg-[var(--surface-card)] rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative bg-black w-full aspect-square flex items-center justify-center">
              <div id="reader" className="w-full h-full"></div>
              {scanError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 text-center">
                  <div className="text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium">
                    {scanError}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-[var(--surface-solid)] text-center">
              <p className="text-sm text-[var(--text-2)]">Point your camera at a product's barcode (EAN/UPC) to verify its compliance.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ComplianceResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [activeTab, setActiveTab] = useState<'details' | 'photo'>('details');
  
  // Create mock rule results based on query preset
  const isNonCompliant = query.toLowerCase().includes('suncrisp') || query.toLowerCase().includes('fake');
  const isPending = query.toLowerCase().includes('activewear');
  const isCompliant = !isNonCompliant && !isPending;

  const productName = isNonCompliant ? 'SunCrisp Multigrain Biscuits' : isPending ? 'ActiveWear Fitness Tracker' : 'Anand Premium Roasted Almonds';
  const productId = '890' + Math.random().toString().slice(2, 12);
  
  // Common visual variables based on verdict
  const bannerBg = isCompliant ? 'bg-green-500/10 border-green-500/20' : isPending ? 'bg-[var(--accent-dim)] border-[var(--accent-border)]' : 'bg-red-500/10 border-red-500/20';
  const bannerText = isCompliant ? 'text-green-500' : isPending ? 'text-[var(--accent)]' : 'text-red-500';
  const Icon = isCompliant ? CheckCircle : isPending ? AlertCircle : XCircle;

  const rules = [
    {
      title: 'Manufacturer Details',
      detected: isNonCompliant ? 'Only brand name listed; no verifiable address.' : 'Full address and corporate entity listed clearly.',
      passed: !isNonCompliant
    },
    {
      title: 'Net Quantity',
      detected: '250g printed in standard metric format.',
      passed: true
    },
    {
      title: 'Maximum Retail Price (MRP)',
      detected: isNonCompliant ? 'MRP printed as "$5.00" but missing the required "inclusive of all taxes" disclaimer.' : 'MRP explicitly stated inclusive of all taxes.',
      passed: !isNonCompliant
    },
    {
      title: 'Manufacture Date',
      detected: 'Manufactured 12/2023. Valid shelf life.',
      passed: true
    },
    {
      title: 'Consumer Care Contact',
      detected: isPending ? 'Customer care email provided, but no phone number found.' : isNonCompliant ? 'No customer support contact information detected on packaging.' : 'Toll-free number and support email clearly visible.',
      passed: isCompliant
    }
  ];

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-4 animate-fade-in-up-1">
        <Link to="/customer/check-compliance" className="inline-flex items-center text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors mb-4 text-sm font-medium">
          <ChevronLeft size={16} className="mr-1" /> Back to Scanner
        </Link>

        {/* Verdict Banner */}
        <div className={`p-4 sm:p-6 rounded-2xl border ${bannerBg} flex flex-col sm:flex-row items-start sm:items-center gap-4`}>
          <Icon className={bannerText} size={32} />
          <div>
            <h2 className={`text-xl font-bold font-serif ${bannerText}`}>
              {isCompliant ? 'This product looks compliant' : isPending ? 'This product is pending review' : 'This product may not be compliant'}
            </h2>
            <p className={`text-sm mt-1 opacity-90 ${bannerText}`}>
              {isCompliant 
                ? 'We found all the mandatory consumer information required by national standards.' 
                : isPending 
                ? 'Some information is present, but requires manual officer verification.'
                : 'We detected missing or incorrect mandatory information on this packaging.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-[var(--text-1)]">{productName}</h1>
            <p className="text-[var(--text-3)] font-mono text-sm mt-2">Scanned ID: {productId}</p>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up-2 border-b border-[var(--border)]">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('details')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'details' ? 'text-[var(--accent)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}
          >
            Analysis Details
            {activeTab === 'details' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('photo')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'photo' ? 'text-[var(--accent)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}
          >
            Package Photo
            {activeTab === 'photo' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full"></span>}
          </button>
        </div>
      </div>

      <div className="animate-fade-in-up-3">
        {activeTab === 'details' ? (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  {rule.passed ? <CheckCircle size={20} className="text-green-500" /> : <XCircle size={20} className="text-red-500" />}
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-1)] mb-1">{rule.title}</h3>
                  <p className="text-sm text-[var(--text-2)]">{rule.detected}</p>
                </div>
              </div>
            ))}

            <div className="pt-8">
              {!isCompliant ? (
                <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                    <ShieldAlert className="text-red-500" size={24} />
                  </div>
                  <h3 className="text-lg font-bold font-serif text-[var(--text-1)]">Help us enforce standards</h3>
                  <p className="text-[var(--text-2)] text-sm max-w-md mx-auto">
                    Because this product appears to violate consumer standards, you can submit this scan directly to enforcement officers.
                  </p>
                  <Link 
                    to={`/customer/file-complaint?product=${encodeURIComponent(productName)}`}
                    className="inline-flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors mt-4"
                  >
                    File a Complaint About This Product
                    <ArrowRight size={18} className="ml-2" />
                  </Link>
                </div>
              ) : (
                <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6 text-center">
                  <h3 className="text-lg font-medium text-green-500 mb-1">Looks good — no action needed</h3>
                  <p className="text-[var(--text-3)] text-sm">This package meets all basic mandatory labeling requirements.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center">
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
              <ImageIcon size={48} className="text-[var(--text-4)]" />
            </div>
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/70 backdrop-blur-md rounded-lg text-white/90 text-sm font-mono flex items-center justify-between">
              <span>SCAN_IMG_{productId}.JPG</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function FileComplaint() {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialProduct = searchParams.get('product') || '';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productName, setProductName] = useState(initialProduct);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const sellerName = formData.get('sellerName') as string;
    const issueCategory = formData.get('issueCategory') as string;
    const description = formData.get('description') as string;

    try {
      const docRef = await addDoc(collection(db, 'complaints'), {
        userId: currentUser.uid,
        productName,
        sellerName,
        issueCategory,
        description,
        status: "Submitted",
        photoUrl: "", // Mock photo url for now
        createdAt: serverTimestamp()
      });
      setComplaintId(docRef.id.slice(0, 8).toUpperCase());
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="max-w-3xl mx-auto px-6 py-12">
        {!isSubmitted ? (
          <div className="space-y-8">
            <div className="space-y-4 animate-fade-in-up-1">
              <h1 className="text-3xl md:text-4xl font-bold font-serif">Report an Issue</h1>
              <p className="text-[var(--text-2)] text-lg">
                Provide detailed information about the non-compliant product or service to help our officers investigate.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up-2 bg-[var(--surface-card)] p-6 md:p-8 rounded-2xl border border-[var(--border)] shadow-[0_4px_30px_var(--border-subtle)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text-2)]">Product Name *</label>
                  <input required type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Brand XYZ Rice 5kg" className="w-full bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-1)] placeholder:text-[var(--text-4)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-dim)] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text-2)]">Seller / Retailer Name *</label>
                  <input name="sellerName" required type="text" placeholder="e.g., Main Street Supermarket" className="w-full bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-1)] placeholder:text-[var(--text-4)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-dim)] transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-2)]">Issue Category *</label>
                <div className="relative">
                  <select name="issueCategory" defaultValue="" required className="w-full bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-dim)] transition-all appearance-none cursor-pointer">
                    <option value="" disabled>Select the primary issue</option>
                    <option value="mislabeling">Misleading or Incorrect Labeling</option>
                    <option value="weight">Incorrect Weight or Measurement</option>
                    <option value="mrp">Missing or Tampered MRP</option>
                    <option value="quality">Substandard Quality / Adulteration</option>
                    <option value="other">Other / General Grievance</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--text-3)]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-2)]">Detailed Description *</label>
                <textarea name="description" required rows={4} placeholder="Please describe exactly what happened and when you noticed the issue..." className="w-full bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-1)] placeholder:text-[var(--text-4)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-dim)] transition-all resize-y"></textarea>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-2)]">Supporting Evidence (Photo/Receipt)</label>
                
                {imagePreview ? (
                  <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden border border-[var(--border)] group">
                    <img src={imagePreview} alt="Evidence Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#0f0f0f]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button 
                        type="button" 
                        onClick={handleRemoveImage} 
                        className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg font-medium flex items-center gap-2 hover:bg-red-500/30 transition-colors backdrop-blur-md"
                      >
                        <Trash2 size={18} /> Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer bg-[var(--surface-solid)] hover:bg-[var(--surface-card)] hover:border-[var(--accent)] transition-all group">
                      <div className="flex flex-col items-center justify-center text-[var(--text-3)] group-hover:text-[var(--text-2)]">
                        <Camera size={24} className="mb-2 text-[var(--accent)]" />
                        <p className="text-sm font-medium">Take a Photo</p>
                      </div>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                    </label>

                    <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer bg-[var(--surface-solid)] hover:bg-[var(--surface-card)] hover:border-[var(--accent)] transition-all group">
                      <div className="flex flex-col items-center justify-center text-[var(--text-3)] group-hover:text-[var(--text-2)]">
                        <ImagePlus size={24} className="mb-2" />
                        <p className="text-sm font-medium">Choose from Gallery</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-[var(--accent)] text-[#0f0f0f] font-medium rounded-xl hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="animate-fade-in-up-1 text-center space-y-6 bg-[var(--surface-card)] p-8 md:p-16 rounded-2xl border border-[var(--border)] shadow-[0_4px_30px_var(--border-subtle)]">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 mb-2">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[var(--text-1)]">Complaint Submitted</h2>
            <p className="text-[var(--text-2)] max-w-md mx-auto text-lg">
              Thank you for reporting this issue. Our officers have been notified and will begin investigation shortly.
            </p>
            <div className="inline-block bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl px-8 py-6 mt-8">
              <p className="text-sm text-[var(--text-3)] mb-2 uppercase tracking-wider font-medium">Your Complaint ID</p>
              <p className="text-3xl font-mono font-medium text-[var(--accent)] tracking-widest">{complaintId}</p>
            </div>
            <div className="pt-8">
              <Link 
                to="/customer/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--text-1)] hover:border-[var(--text-3)] transition-colors"
              >
                <ChevronLeft size={18} className="mr-2" />
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function TrackComplaints() {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(
      collection(db, 'complaints'), 
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: 'CMP-' + doc.id.slice(0, 6).toUpperCase(),
          product: d.productName,
          date: d.createdAt?.toDate() ? d.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending...',
          status: d.status
        };
      });
      setComplaints(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching complaints:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 border border-green-500/20 text-green-500">Resolved</span>;
      case 'Under Review':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-dim)] border border-[var(--accent-border)] text-[var(--accent)]">Under Review</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-500">Rejected</span>;
      case 'Submitted':
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--text-2)]">Submitted</span>;
    }
  };

  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-4 animate-fade-in-up-1">
          <h1 className="text-3xl md:text-4xl font-bold font-serif">Your Complaints</h1>
          <p className="text-[var(--text-2)] text-lg">
            Monitor the status and progress of the grievances you have submitted.
          </p>
        </div>

        <div className="animate-fade-in-up-2 overflow-hidden rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-[0_4px_30px_var(--border-subtle)]">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-[var(--text-3)] font-medium">Loading complaints...</div>
            ) : complaints.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-3)] flex flex-col items-center">
                <ListOrdered size={48} className="mb-4 opacity-50" />
                <p className="text-lg mb-4">You haven't filed any complaints yet.</p>
                <Link to="/customer/file-complaint" className="text-[var(--accent)] hover:underline font-medium">
                  File a new complaint
                </Link>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-solid)]/50">
                    <th className="px-6 py-5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">Complaint ID</th>
                    <th className="px-6 py-5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">Product / Service</th>
                    <th className="px-6 py-5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">Date Filed</th>
                    <th className="px-6 py-5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-[var(--surface-solid)]/30 transition-colors">
                      <td className="px-6 py-5 font-mono font-medium text-[var(--text-1)] whitespace-nowrap">{c.id}</td>
                      <td className="px-6 py-5 font-medium text-[var(--text-1)] whitespace-nowrap">{c.product}</td>
                      <td className="px-6 py-5 text-[var(--text-3)] whitespace-nowrap">{c.date}</td>
                      <td className="px-6 py-5 whitespace-nowrap">{getStatusBadge(c.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<CustomerLayout />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/check-compliance" element={<CheckCompliance />} />
              <Route path="/customer/compliance-result" element={<ComplianceResult />} />
              <Route path="/customer/file-complaint" element={<FileComplaint />} />
              <Route path="/customer/track-complaints" element={<TrackComplaints />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
