import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Phone, 
  Mail, 
  Loader2, 
  Save, 
  AlertCircle,
  Building,
  MapPin,
  FileText,
  Globe,
  Percent,
  FileSignature,
  Lock,
  Palette,
  Check,
  RotateCcw,
  Sparkles
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import BASE_URL from "@/config/BaseUrl";
import { THEME_PRESETS, applyTheme, getSavedTheme, resetTheme, generateThemeFromHex } from "@/utils/theme";

const CompanySetting = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingBranch, setUpdatingBranch] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Theme State
  const [currentTheme, setCurrentTheme] = useState(() => getSavedTheme());
  const [customHex, setCustomHex] = useState(() => getSavedTheme()?.primary || "#2563eb");

  const handlePresetSelect = (preset) => {
    setCurrentTheme(preset);
    setCustomHex(preset.primary);
    applyTheme(preset);
    toast({
      title: "Theme Applied",
      description: `Switched to ${preset.name} theme`,
    });
  };

  const handleCustomColorChange = (e) => {
    const hex = e.target.value;
    setCustomHex(hex);
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      const newTheme = generateThemeFromHex(hex, "Custom Brand");
      setCurrentTheme(newTheme);
      applyTheme(newTheme);
    }
  };

  const handleSaveTheme = () => {
    const themeToSave = generateThemeFromHex(customHex, currentTheme?.name || "Custom Brand");
    applyTheme(themeToSave);
    toast({
      title: "Success",
      description: "Brand theme color saved successfully",
    });
  };

  const handleResetDefaultTheme = () => {
    const def = resetTheme();
    setCurrentTheme(def);
    setCustomHex(def.primary);
    toast({
      title: "Theme Reset",
      description: "Reset to default Corporate Blue theme",
    });
  };
  
  // Profile Data
  const [originalProfileData, setOriginalProfileData] = useState({
    name: "",
    mobile: "",
    email: ""
  });
  
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    mobile: "",
    email: ""
  });
  
  const [profileErrors, setProfileErrors] = useState({});
  
  // Branch Data
  const [originalBranchData, setOriginalBranchData] = useState({
    branch_name: "",
    branch_address: "",
    branch_gst: "",
    branch_mobile_no: "",
    branch_email_id: "",
    branch_currency: "INR",
    branch_tax_rate: "",
    branch_footer: ""
  });
  
  const [branchFormData, setBranchFormData] = useState({
    branch_name: "",
    branch_address: "",
    branch_gst: "",
    branch_mobile_no: "",
    branch_email_id: "",
    branch_currency: "INR",
    branch_tax_rate: "",
    branch_footer: ""
  });
  
  const [branchErrors, setBranchErrors] = useState({});
  
  // Password Data
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchBranchDetails()]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to load settings data");
      toast({
        title: "Error",
        description: "Failed to load settings data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const token = Cookies.get("token");
      const response = await axios.get(`${BASE_URL}/api/panel-fetch-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.profile) {
        const { name, mobile, email } = response.data.profile;
        const profileData = { name, mobile, email };
        setProfileFormData(profileData);
        setOriginalProfileData(profileData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchBranchDetails = async () => {
    try {
      setBranchLoading(true);
      const token = Cookies.get("token");
      const response = await axios.get(`${BASE_URL}/api/panel-fetch-branch`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.data) {
        const branchData = response.data.data;
        setBranchFormData(branchData);
        setOriginalBranchData(branchData);
      }
    } catch (error) {
      console.error("Error fetching branch details:", error);
      throw error;
    } finally {
      setBranchLoading(false);
    }
  };

  // Profile Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileFormData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(profileFormData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    if (!profileFormData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isProfileDirty = () => {
    return profileFormData.mobile !== originalProfileData.mobile || 
           profileFormData.email !== originalProfileData.email;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    try {
      setUpdatingProfile(true);
      setError("");
      
      const token = Cookies.get("token");
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-profile`,
        {
          mobile: profileFormData.mobile,
          email: profileFormData.email
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data?.code === 200) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setOriginalProfileData(profileFormData);
        await fetchProfile(); // Refresh data
      } else {
        throw new Error(response.data?.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Branch Handlers
  const handleBranchChange = (e) => {
    const { name, value } = e.target;
    setBranchFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (branchErrors[name]) {
      setBranchErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateBranchForm = () => {
    const newErrors = {};

    if (!branchFormData.branch_name) {
      newErrors.branch_name = "Branch name is required";
    }

    if (!branchFormData.branch_address) {
      newErrors.branch_address = "Branch address is required";
    }

    if (!branchFormData.branch_mobile_no) {
      newErrors.branch_mobile_no = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(branchFormData.branch_mobile_no)) {
      newErrors.branch_mobile_no = "Please enter a valid 10-digit mobile number";
    }

    if (!branchFormData.branch_email_id) {
      newErrors.branch_email_id = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(branchFormData.branch_email_id)) {
      newErrors.branch_email_id = "Please enter a valid email address";
    }

    if (!branchFormData.branch_tax_rate) {
      newErrors.branch_tax_rate = "Tax rate is required";
    } else if (isNaN(branchFormData.branch_tax_rate) || parseFloat(branchFormData.branch_tax_rate) < 0) {
      newErrors.branch_tax_rate = "Please enter a valid tax rate";
    }

    setBranchErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isBranchDirty = () => {
    return JSON.stringify(branchFormData) !== JSON.stringify(originalBranchData);
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBranchForm()) {
      return;
    }

    try {
      setUpdatingBranch(true);
      setError("");
      
      const token = Cookies.get("token");
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-branch`,
        branchFormData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data?.code === 200) {
        toast({
          title: "Success",
          description: "Branch details updated successfully",
        });
        setOriginalBranchData(branchFormData);
        await fetchBranchDetails(); // Refresh data
      } else {
        throw new Error(response.data?.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating branch:", error);
      setError(error.response?.data?.message || "Failed to update branch details");
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update branch details",
        variant: "destructive"
      });
    } finally {
      setUpdatingBranch(false);
    }
  };

  // Password Handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordError) setPasswordError("");
  };

  const validatePasswordForm = () => {
    if (!passwordFormData.currentPassword) {
      setPasswordError("Current password is required");
      return false;
    }
    if (!passwordFormData.newPassword) {
      setPasswordError("New password is required");
      return false;
    }
    if (passwordFormData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return false;
    }
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setUpdatingPassword(true);
      setPasswordError("");
      
      const token = Cookies.get("token");
      const username = profileFormData.name || originalProfileData.name || Cookies.get("name") || "";
      const response = await axios.post(
        `${BASE_URL}/api/panel-change-password`,
        {
          username: username,
          old_password: passwordFormData.currentPassword,
          new_password: passwordFormData.newPassword
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const isSuccess =
        (response.status >= 200 && response.status < 300) &&
        (response.data?.code == 200 ||
          response.data?.code == 201 ||
          response.data?.message === "Password Changed" ||
          response.data?.msg === "Password Changed" ||
          !response.data?.code);

      if (isSuccess && response.data?.code != 400 && response.data?.code != 401 && response.data?.code != 422) {
        toast({
          title: "Success",
          description: response.data?.message || response.data?.msg || "Password changed successfully",
        });
        setPasswordFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setPasswordError("");
      } else {
        throw new Error(response.data?.message || response.data?.msg || "Password change failed");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMsg = error.response?.data?.msg || error.response?.data?.message || error.message || "Failed to change password";
      setPasswordError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Skeleton Loaders
  const MobileSkeleton = () => (
    <div className="p-4 space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  const DesktopSkeleton = () => (
    <div className="max-w-340 mx-auto ">
      <Skeleton className="h-8 w-48 mb-6" />
      <Skeleton className="h-12 w-full mb-6" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full">
        <div className="sm:hidden">
          <MobileSkeleton />
        </div>
        <div className="hidden sm:block">
          <DesktopSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen ">
    
      <div className="sm:hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Company Settings</h1>
          </div>

        
          <div className="flex space-x-2 border-b">
            <button
              className={`pb-2 px-3 text-sm font-medium ${activeTab === "company" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("company")}
            >
              Company Details
            </button>
            <button
              className={`pb-2 px-3 text-sm font-medium ${activeTab === "login" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("login")}
            >
              Login Details
            </button>
            <button
              className={`pb-2 px-3 text-sm font-medium ${activeTab === "password" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("password")}
            >
              Change Password
            </button>
            <button
              className={`pb-2 px-3 text-sm font-medium ${activeTab === "theme" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("theme")}
            >
              Theme Color
            </button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

       
          {activeTab === "company" && (
            <form onSubmit={handleBranchSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="branch_name" className="text-sm font-medium flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  Branch Name
                </Label>
                <Input
                  id="branch_name"
                  name="branch_name"
                  value={branchFormData.branch_name}
                  onChange={handleBranchChange}
                  placeholder="Enter branch name"
                  className={`h-10 ${branchErrors.branch_name ? "border-red-300 focus:ring-red-200" : ""}`}
                />
                {branchErrors.branch_name && (
                  <p className="text-xs text-red-600 mt-1">{branchErrors.branch_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch_address" className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  Branch Address
                </Label>
                <Input
                  id="branch_address"
                  name="branch_address"
                  value={branchFormData.branch_address}
                  onChange={handleBranchChange}
                  placeholder="Enter branch address"
                  className={`h-10 ${branchErrors.branch_address ? "border-red-300 focus:ring-red-200" : ""}`}
                />
                {branchErrors.branch_address && (
                  <p className="text-xs text-red-600 mt-1">{branchErrors.branch_address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch_gst" className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  GST Number
                </Label>
                <Input
                  id="branch_gst"
                  name="branch_gst"
                  value={branchFormData.branch_gst}
                  onChange={handleBranchChange}
                  placeholder="Enter GST number"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch_mobile_no" className="text-sm font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  Mobile Number
                </Label>
                <Input
                  id="branch_mobile_no"
                  name="branch_mobile_no"
                  type="tel"
                  value={branchFormData.branch_mobile_no}
                  onChange={handleBranchChange}
                  placeholder="Enter 10-digit mobile number"
                  className={`h-10 ${branchErrors.branch_mobile_no ? "border-red-300 focus:ring-red-200" : ""}`}
                />
                {branchErrors.branch_mobile_no && (
                  <p className="text-xs text-red-600 mt-1">{branchErrors.branch_mobile_no}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch_email_id" className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  Email Address
                </Label>
                <Input
                  id="branch_email_id"
                  name="branch_email_id"
                  type="email"
                  value={branchFormData.branch_email_id}
                  onChange={handleBranchChange}
                  placeholder="Enter email address"
                  className={`h-10 ${branchErrors.branch_email_id ? "border-red-300 focus:ring-red-200" : ""}`}
                />
                {branchErrors.branch_email_id && (
                  <p className="text-xs text-red-600 mt-1">{branchErrors.branch_email_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch_currency" className="text-sm font-medium flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-gray-500" />
                  Currency
                </Label>
                <Input
                  id="branch_currency"
                  name="branch_currency"
                  value={branchFormData.branch_currency}
                  onChange={handleBranchChange}
                  placeholder="Enter currency"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch_tax_rate" className="text-sm font-medium flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-gray-500" />
                  Tax Rate (%)
                </Label>
                <Input
                  id="branch_tax_rate"
                  name="branch_tax_rate"
                  type="number"
                  step="0.01"
                  value={branchFormData.branch_tax_rate}
                  onChange={handleBranchChange}
                  placeholder="Enter tax rate"
                  className={`h-10 ${branchErrors.branch_tax_rate ? "border-red-300 focus:ring-red-200" : ""}`}
                />
                {branchErrors.branch_tax_rate && (
                  <p className="text-xs text-red-600 mt-1">{branchErrors.branch_tax_rate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch_footer" className="text-sm font-medium flex items-center">
                  <FileSignature className="h-4 w-4 mr-2 text-gray-500" />
                  Invoice Footer
                </Label>
                <Input
                  id="branch_footer"
                  name="branch_footer"
                  value={branchFormData.branch_footer}
                  onChange={handleBranchChange}
                  placeholder="Enter invoice footer text"
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={updatingBranch || !isBranchDirty()}
              >
                {updatingBranch ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          )}

         
          {activeTab === "login" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={profileFormData.name}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Name cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  Mobile Number
                </Label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={profileFormData.mobile}
                  onChange={handleProfileChange}
                  placeholder="Enter 10-digit mobile number"
                  className={`h-10 ${profileErrors.mobile ? "border-red-300 focus:ring-red-200" : ""}`}
                />
                {profileErrors.mobile && (
                  <p className="text-xs text-red-600 mt-1">{profileErrors.mobile}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileFormData.email}
                  onChange={handleProfileChange}
                  placeholder="Enter email address"
                  className={`h-10 ${profileErrors.email ? "border-red-300 focus:ring-red-200" : ""}`}
                />
                {profileErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{profileErrors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={updatingProfile || !isProfileDirty()}
              >
                {updatingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          )}

          
          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordFormData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className="h-10"
                />
              </div>

              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={updatingPassword}
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          )}

          {activeTab === "theme" && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-blue-600" />
                    Brand Color & Theme
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Select a preset or pick a custom hex color to match your brand.
                  </p>
                </div>

                {/* Presets Grid */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">Preset Brand Palettes</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {THEME_PRESETS.map((preset) => {
                      const isSelected = currentTheme?.primary?.toLowerCase() === preset.primary.toLowerCase();
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePresetSelect(preset)}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 shadow-sm font-semibold"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-inner"
                            style={{ backgroundColor: preset.primary }}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                          </div>
                          <div className="truncate">
                            <div className="text-xs text-gray-800 leading-tight truncate">{preset.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono leading-none">{preset.primary}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Hex Color Picker */}
                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    Custom Brand Hex Code
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customHex.startsWith("#") && customHex.length === 7 ? customHex : "#2563eb"}
                      onChange={handleCustomColorChange}
                      className="w-9 h-9 rounded cursor-pointer border border-gray-300 p-0.5 bg-white shrink-0"
                    />
                    <Input
                      type="text"
                      value={customHex}
                      onChange={handleCustomColorChange}
                      placeholder="#2563EB"
                      maxLength={7}
                      className="w-28 font-mono uppercase text-xs h-9"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="p-3 rounded-lg border border-gray-200 bg-white space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">Live UI Preview</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                      Primary
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs h-8">
                      Outline
                    </Button>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 flex items-center">
                      Active Status
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    onClick={handleSaveTheme}
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4" />
                    Save Brand Theme
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetDefaultTheme}
                    className="w-full gap-2 text-gray-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    
      <div className="hidden sm:block">
        <div className="max-w-340 mx-auto ">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Company Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your company information and profile settings
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="company">Company Details</TabsTrigger>
              <TabsTrigger value="login">Login Details</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
              <TabsTrigger value="theme">Theme & Branding</TabsTrigger>
            </TabsList>

           
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Update your company branch details and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBranchSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="desktop-branch_name" className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          Branch Name
                        </Label>
                        <Input
                          id="desktop-branch_name"
                          name="branch_name"
                          value={branchFormData.branch_name}
                          onChange={handleBranchChange}
                          placeholder="Enter branch name"
                          className={`h-10 ${branchErrors.branch_name ? "border-red-300 focus:ring-red-200" : ""}`}
                        />
                        {branchErrors.branch_name && (
                          <p className="text-sm text-red-600">{branchErrors.branch_name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="desktop-branch_gst" className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          GST Number
                        </Label>
                        <Input
                          id="desktop-branch_gst"
                          name="branch_gst"
                          value={branchFormData.branch_gst}
                          onChange={handleBranchChange}
                          placeholder="Enter GST number"
                          className="h-10"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="desktop-branch_address" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          Branch Address
                        </Label>
                        <Input
                          id="desktop-branch_address"
                          name="branch_address"
                          value={branchFormData.branch_address}
                          onChange={handleBranchChange}
                          placeholder="Enter branch address"
                          className={`h-10 ${branchErrors.branch_address ? "border-red-300 focus:ring-red-200" : ""}`}
                        />
                        {branchErrors.branch_address && (
                          <p className="text-sm text-red-600">{branchErrors.branch_address}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="desktop-branch_mobile_no" className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          Mobile Number
                        </Label>
                        <Input
                          id="desktop-branch_mobile_no"
                          name="branch_mobile_no"
                          type="tel"
                          value={branchFormData.branch_mobile_no}
                          onChange={handleBranchChange}
                          placeholder="Enter 10-digit mobile number"
                          className={`h-10 ${branchErrors.branch_mobile_no ? "border-red-300 focus:ring-red-200" : ""}`}
                        />
                        {branchErrors.branch_mobile_no && (
                          <p className="text-sm text-red-600">{branchErrors.branch_mobile_no}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="desktop-branch_email_id" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          Email Address
                        </Label>
                        <Input
                          id="desktop-branch_email_id"
                          name="branch_email_id"
                          type="email"
                          value={branchFormData.branch_email_id}
                          onChange={handleBranchChange}
                          placeholder="Enter email address"
                          className={`h-10 ${branchErrors.branch_email_id ? "border-red-300 focus:ring-red-200" : ""}`}
                        />
                        {branchErrors.branch_email_id && (
                          <p className="text-sm text-red-600">{branchErrors.branch_email_id}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="desktop-branch_currency" className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          Currency
                        </Label>
                        <Input
                          id="desktop-branch_currency"
                          name="branch_currency"
                          value={branchFormData.branch_currency}
                          onChange={handleBranchChange}
                          placeholder="Enter currency"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="desktop-branch_tax_rate" className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-gray-500" />
                          Tax Rate (%)
                        </Label>
                        <Input
                          id="desktop-branch_tax_rate"
                          name="branch_tax_rate"
                          type="number"
                          step="0.01"
                          value={branchFormData.branch_tax_rate}
                          onChange={handleBranchChange}
                          placeholder="Enter tax rate"
                          className={`h-10 ${branchErrors.branch_tax_rate ? "border-red-300 focus:ring-red-200" : ""}`}
                        />
                        {branchErrors.branch_tax_rate && (
                          <p className="text-sm text-red-600">{branchErrors.branch_tax_rate}</p>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="desktop-branch_footer" className="flex items-center gap-2">
                          <FileSignature className="h-4 w-4 text-gray-500" />
                          Invoice Footer
                        </Label>
                        <Input
                          id="desktop-branch_footer"
                          name="branch_footer"
                          value={branchFormData.branch_footer}
                          onChange={handleBranchChange}
                          placeholder="Enter invoice footer text"
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="gap-2"
                        disabled={updatingBranch || !isBranchDirty()}
                      >
                        {updatingBranch ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login Details</CardTitle>
                  <CardDescription>
                    Update your personal login information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="desktop-name" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          Name
                        </Label>
                        <Input
                          id="desktop-name"
                          name="name"
                          value={profileFormData.name}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">Name cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="desktop-mobile" className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          Mobile Number
                        </Label>
                        <Input
                          id="desktop-mobile"
                          name="mobile"
                          type="tel"
                          value={profileFormData.mobile}
                          onChange={handleProfileChange}
                          placeholder="Enter 10-digit mobile number"
                          className={`h-10 ${profileErrors.mobile ? "border-red-300 focus:ring-red-200" : ""}`}
                        />
                        {profileErrors.mobile && (
                          <p className="text-sm text-red-600">{profileErrors.mobile}</p>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="desktop-email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          Email Address
                        </Label>
                        <Input
                          id="desktop-email"
                          name="email"
                          type="email"
                          value={profileFormData.email}
                          onChange={handleProfileChange}
                          placeholder="Enter email address"
                          className={`h-10 ${profileErrors.email ? "border-red-300 focus:ring-red-200" : ""}`}
                        />
                        {profileErrors.email && (
                          <p className="text-sm text-red-600">{profileErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="gap-2"
                        disabled={updatingProfile || !isProfileDirty()}
                      >
                        {updatingProfile ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

 
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your account password for security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2  space-y-2">
                        <Label htmlFor="desktop-currentPassword" className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          Current Password
                        </Label>
                        <Input
                          id="desktop-currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordFormData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="desktop-newPassword" className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          New Password
                        </Label>
                        <Input
                          id="desktop-newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordFormData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="desktop-confirmPassword" className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          Confirm Password
                        </Label>
                        <Input
                          id="desktop-confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordFormData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className="h-10"
                        />
                      </div>
                    </div>

                    {passwordError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="gap-2"
                        disabled={updatingPassword}
                      >
                        {updatingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-blue-600" />
                    Brand Theme & Color
                  </CardTitle>
                  <CardDescription>
                    Customize your CRM primary brand color to match your company branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Presets */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-800 mb-3 block">
                      Curated Brand Palettes
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {THEME_PRESETS.map((preset) => {
                        const isSelected = currentTheme?.primary?.toLowerCase() === preset.primary.toLowerCase();
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetSelect(preset)}
                            className={`flex flex-col items-center p-3.5 rounded-xl border-2 transition-all text-left cursor-pointer ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-600/20"
                                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                            }`}
                          >
                            <div
                              className="w-10 h-10 rounded-full mb-2.5 flex items-center justify-center shadow-inner relative"
                              style={{ backgroundColor: preset.primary }}
                            >
                              {isSelected && <Check className="h-5 w-5 text-white stroke-[3]" />}
                            </div>
                            <span className="font-semibold text-xs text-gray-800 text-center">{preset.name}</span>
                            <span className="text-[11px] text-gray-500 font-mono mt-0.5">{preset.primary}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Input */}
                  <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                    <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Custom Brand Hex Code
                    </Label>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customHex.startsWith("#") && customHex.length === 7 ? customHex : "#2563eb"}
                          onChange={handleCustomColorChange}
                          className="w-11 h-11 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white"
                        />
                        <Input
                          type="text"
                          value={customHex}
                          onChange={handleCustomColorChange}
                          placeholder="#2563EB"
                          maxLength={7}
                          className="w-36 font-mono uppercase text-sm h-11"
                        />
                      </div>
                      <p className="text-xs text-gray-500 max-w-md">
                        Pick any custom hex color. Hover shades, light backgrounds, and borders are generated automatically.
                      </p>
                    </div>
                  </div>

                  {/* Live Preview Panel */}
                  <div className="p-5 rounded-xl border border-gray-200 bg-white space-y-3">
                    <Label className="text-sm font-semibold text-gray-800">
                      Live UI Preview
                    </Label>
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex flex-wrap items-center gap-4">
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      >
                        Primary Action
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Outline Button
                      </Button>
                      <div className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        Active Status Pill
                      </div>
                      <div className="px-3.5 py-1.5 rounded-lg border border-blue-200 bg-white text-xs font-medium text-gray-700 shadow-2xs">
                        Border Badge Sample
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetDefaultTheme}
                      className="gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset to Default (Blue)
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveTheme}
                      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-sm"
                    >
                      <Save className="h-4 w-4" />
                      Save Brand Theme
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        
        </div>
      </div>
    </div>
  );
};

export default CompanySetting;