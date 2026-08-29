import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseconfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Mail, Eye, EyeOff, Droplets, ArrowRight } from 'lucide-react';

export default function BloodBankLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: 'email' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '' };

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Real Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );
      const user = userCredential.user;

      // Verify Role in Firestore
      let userRole = 'bloodbank';
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        userRole = userDoc.data().role;
      }

      localStorage.setItem('userType', userRole);
      localStorage.setItem('uid', user.uid);

      toast({
        title: 'Welcome Back!',
        description: 'Successfully authenticated to Blood Bank portal.',
      });

      navigate('/bloodbank-dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMsg = 'Invalid email or password. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed login attempts. Please reset your password or try later.';
      }

      toast({
        title: 'Login Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: 'Enter Registered Email',
        description: 'Please type your official email in the email field first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email.trim());
      toast({
        title: 'Password Reset Link Sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.message || 'Could not send reset link.',
        variant: 'destructive',
      });
    }
  };

  const portalFeatures = [
    'Update real-time units across all 8 blood groups (A+, O-, etc.)',
    'Manage hospital and patient emergency blood reservations',
    'View voluntary donors registered in your local jurisdiction',
    'Broadcast shortage alerts for rare blood types',
    'Publish upcoming community donation camps and drives',
  ];

  return (
    <div className="min-h-screen py-10 bg-gray-50 flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Portal Details & Security */}
          <div className="space-y-6">
            <div>
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-5 shadow-xs">
                <Droplets className="h-7 w-7 fill-red-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Blood Bank Portal
              </h1>
              <p className="text-base text-gray-600 leading-relaxed">
                Authorized staff access to update blood inventory, coordinate life-saving transfusions, and dispatch urgent units.
              </p>
            </div>

            <Card className="border border-red-100 bg-white shadow-xs">
              <CardHeader className="pb-3 bg-red-50/40 border-b border-red-100/50">
                <CardTitle className="text-base font-bold text-gray-900">
                  Staff Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {portalFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start text-xs sm:text-sm text-gray-600">
                      <div className="bg-red-600 w-1.5 h-1.5 rounded-full mt-2 mr-3 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-semibold block mb-0.5">Authorized Healthcare Access Only</span>
                All inventory edits are timestamped and reflected immediately across public search cards.
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div>
            <Card className="shadow-md border border-gray-200 bg-white max-w-md mx-auto">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Staff Sign In</CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                  Enter registered staff credentials to manage stock
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Official Email</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="bloodbank@facility.org"
                        className={`pl-9 ${errors.email ? 'border-red-500' : ''}`}
                        value={formData.email}
                        onChange={handleInputChange('email')}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`pl-9 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        value={formData.password}
                        onChange={handleInputChange('password')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 text-gray-500 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                      <span>Remember login</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-red-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-11 font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>Access Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}