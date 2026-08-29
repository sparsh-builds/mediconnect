import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Heart, UserPlus, Calendar, Phone, MapPin, User, Mail, ShieldCheck } from 'lucide-react';

interface DonorFormData {
  name: string;
  age: string;
  bloodGroup: string;
  contact: string;
  city: string;
  lastDonationDate: string;
  email: string;
  address: string;
}

const bloodGroupsList = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorRegistration() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<DonorFormData>({
    name: '',
    age: '',
    bloodGroup: '',
    contact: '',
    city: '',
    lastDonationDate: '',
    email: '',
    address: ''
  });
  const [errors, setErrors] = useState<Partial<DonorFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof DonorFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSelectChange = (field: keyof DonorFormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DonorFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 65) {
      newErrors.age = 'Age must be between 18 and 65';
    }
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact is required';
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid phone number';
    }
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the highlighted fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save directly to Firestore 'donors' collection
      await addDoc(collection(db, 'donors'), {
        name: formData.name.trim(),
        age: parseInt(formData.age, 10),
        bloodGroup: formData.bloodGroup,
        contact: formData.contact.trim(),
        city: formData.city.trim().toLowerCase(),
        lastDonationDate: formData.lastDonationDate || null,
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim(),
        isAvailable: true,
        createdAt: serverTimestamp()
      });

      toast({
        title: '❤️ Registration Successful!',
        description: 'Thank you for volunteering as a blood donor. Your details are now active.',
      });

      // Reset form
      setFormData({
        name: '',
        age: '',
        bloodGroup: '',
        contact: '',
        city: '',
        lastDonationDate: '',
        email: '',
        address: ''
      });
    } catch (error) {
      console.error('Error saving donor:', error);
      toast({
        title: 'Registration Failed',
        description: 'Could not connect to database. Please check your network and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eligibilityRequirements = [
    'Age between 18-65 years',
    'Weight at least 50 kg (110 lbs)',
    'Good general health and feeling well',
    'No recent severe illness or active infection',
    'At least 8-12 weeks since last full donation'
  ];

  return (
    <div className="min-h-screen py-8 bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Heart className="h-8 w-8 fill-red-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Become a Blood Donor
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Join our community of verified voluntary life-savers. Your single donation can save up to three lives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border">
              <CardHeader className="bg-red-50/40 border-b pb-4">
                <CardTitle className="flex items-center text-lg text-gray-900">
                  <UserPlus className="mr-2 h-5 w-5 text-red-600" />
                  Donor Registration Form
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-500" />
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g. Rahul Sharma"
                          value={formData.name}
                          onChange={handleInputChange('name')}
                        />
                        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="age">Age (18-65) *</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="e.g. 24"
                          value={formData.age}
                          onChange={handleInputChange('age')}
                        />
                        {errors.age && <p className="text-xs text-red-600">{errors.age}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="rahul@example.com"
                          value={formData.email}
                          onChange={handleInputChange('email')}
                        />
                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label>Blood Group *</Label>
                        <Select value={formData.bloodGroup} onValueChange={handleSelectChange('bloodGroup')}>
                          <SelectTrigger className={errors.bloodGroup ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select Blood Group" />
                          </SelectTrigger>
                          <SelectContent>
                            {bloodGroupsList.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.bloodGroup && <p className="text-xs text-red-600">{errors.bloodGroup}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-gray-500" />
                      Contact & Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact">Phone Number *</Label>
                        <Input
                          id="contact"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={formData.contact}
                          onChange={handleInputChange('contact')}
                        />
                        {errors.contact && <p className="text-xs text-red-600">{errors.contact}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="city">City / District *</Label>
                        <Input
                          id="city"
                          placeholder="e.g. Mumbai, Delhi, Bengaluru"
                          value={formData.city}
                          onChange={handleInputChange('city')}
                        />
                        {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <Label htmlFor="address">Street / Area Address *</Label>
                        <Input
                          id="address"
                          placeholder="Complete area or locality details"
                          value={formData.address}
                          onChange={handleInputChange('address')}
                        />
                        {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Donation History */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      Donation History
                    </h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastDonationDate">Last Donation Date (Optional)</Label>
                      <Input
                        id="lastDonationDate"
                        type="date"
                        value={formData.lastDonationDate}
                        onChange={handleInputChange('lastDonationDate')}
                      />
                      <p className="text-xs text-gray-500">
                        Leave blank if you are donating for the first time.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Your contact details are stored securely and only accessible during verified emergency match queries.</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-11 text-base font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Saving to MediConnect...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4 fill-white" />
                        Register as Voluntary Donor
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Eligibility & Info Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-xs border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-gray-900">Eligibility Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {eligibilityRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-start text-xs text-gray-600">
                      <div className="bg-red-500 w-1.5 h-1.5 rounded-full mt-1.5 mr-2.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-sm border-none">
              <CardContent className="p-5">
                <h3 className="font-bold text-base mb-2">Why Donate?</h3>
                <ul className="space-y-2 text-xs text-red-50">
                  <li>• 1 unit of blood can save up to 3 lives.</li>
                  <li>• Vital for accident traumas, surgeries, and cancer therapy.</li>
                  <li>• Blood cannot be manufactured; it only comes from donors.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}