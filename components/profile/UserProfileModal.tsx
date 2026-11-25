'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { UserProfile, RoleId } from '@/lib/types';
import {
  X,
  Camera,
  Upload,
  User,
  Building,
  Mail,
  Phone,
  Radio,
  ShieldCheck,
  Check,
  Truck,
  IdCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userProfiles, updateUserProfile, currentRole } = useAppStore();
  const { user: authUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active role determines profile
  const effectiveRole: RoleId = (authUser?.role as RoleId) || currentRole || 'manager';
  const profile: UserProfile = userProfiles[effectiveRole] || userProfiles.manager;

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [radioChannel, setRadioChannel] = useState(profile.radioChannel || '');
  const [cscsNumber, setCscsNumber] = useState(profile.cscsNumber || '');
  const [vehicleReg, setVehicleReg] = useState(profile.vehicleReg || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setRadioChannel(profile.radioChannel || '');
      setCscsNumber(profile.cscsNumber || '');
      setVehicleReg(profile.vehicleReg || '');
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile, effectiveRole]);

  if (!isOpen) return null;

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        updateUserProfile(effectiveRole, { avatarUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(effectiveRole, {
      name: name.trim(),
      phone: phone.trim(),
      radioChannel: radioChannel.trim(),
      cscsNumber: cscsNumber.trim(),
      vehicleReg: vehicleReg.trim() ? vehicleReg.trim().toUpperCase() : undefined,
      avatarUrl,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#14171A]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E7E5E0] rounded-[20px] shadow-2xl w-full max-w-lg my-6 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E7E5E0] flex items-center justify-between bg-[#FFFFFF]">
          <div>
            <h2 className="text-base font-semibold text-[#14171A]">SiteFlow User Profile</h2>
            <p className="text-xs text-[#6B7280]">
              Account holder credentials, site induction & contact details
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#9CA3AF] hover:text-[#14171A] hover:bg-[#F7F7F5] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          {/* Profile Photo & Primary Identification Card */}
          <div className="flex items-center gap-4 p-4 bg-[#F8F8F6] rounded-2xl border border-[#E7E5E0]">
            {/* Avatar Circle with Upload Trigger */}
            <div className="relative shrink-0 group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#14171A] text-white flex items-center justify-center text-xl font-bold cursor-pointer border-2 border-white shadow-md relative group-hover:opacity-90 transition-opacity"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span>{name.charAt(0)}</span>
                )}

                {/* Camera overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#14171A] text-[#F5B301] border-2 border-white flex items-center justify-center shadow-xs cursor-pointer"
                title="Upload profile photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            {/* Basic Info Header */}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base text-[#14171A] truncate">
                  {name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#14171A] text-white uppercase tracking-wider">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                <span className="truncate">{profile.organization}</span>
              </p>
              <p className="text-[11px] text-[#4B5563] truncate font-medium">
                {profile.jobTitle || 'Construction Operations'}
              </p>
            </div>
          </div>

          {/* Form Fields: Editable Contact Details */}
          <div className="space-y-3.5">
            <span className="font-semibold text-xs text-[#14171A] uppercase tracking-wider block">
              Contact & Site Communications
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  Mobile Phone
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-mono font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full h-9 pl-8 pr-3 bg-[#F8F8F6] border border-[#E7E5E0] rounded-lg text-xs text-[#6B7280] cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  Site Radio Call Sign / Channel
                </label>
                <div className="relative">
                  <Radio className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. VHF Ch 4 - Gate Checkpoint"
                    value={radioChannel}
                    onChange={(e) => setRadioChannel(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operational Accreditations & Site Compliance */}
          <div className="space-y-3.5 pt-2 border-t border-[#E7E5E0]">
            <span className="font-semibold text-xs text-[#14171A] uppercase tracking-wider block">
              Safety Compliance & Induction
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  CSCS / CPCS Card Reference
                </label>
                <div className="relative">
                  <IdCard className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cscsNumber}
                    onChange={(e) => setCscsNumber(e.target.value)}
                    placeholder="e.g. CSCS-00984214"
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-mono font-medium text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  Primary Site Affiliation
                </label>
                <div className="h-9 px-3 bg-[#F8F8F6] border border-[#E7E5E0] rounded-lg flex items-center justify-between text-xs text-[#14171A]">
                  <span className="font-medium">Chatham Capstone</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#DCFCE7] text-[#16A34A]">
                    Inducted
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Assigned Vehicle if Driver */}
            {profile.role === 'driver' && (
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  Assigned Heavy Vehicle Registration
                </label>
                <div className="relative">
                  <Truck className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    placeholder="e.g. KX68 VKF"
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-mono font-bold text-[#14171A] focus:outline-none focus:ring-1 focus:ring-[#14171A]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E7E5E0] flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#6B7280] hover:text-[#14171A] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 bg-white hover:bg-[#F8F8F6] text-[#14171A] border border-[#E7E5E0] rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

