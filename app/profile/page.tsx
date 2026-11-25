'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { UserProfile, RoleId } from '@/lib/types';
import {
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
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { ROLE_HOME_PATHS } from '@/context/AuthContext';

export default function ProfilePage() {
  const { userProfiles, updateUserProfile, currentRole, showToast } = useAppStore();
  const { user: authUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveRole: RoleId = (authUser?.role as RoleId) || currentRole || 'manager';
  const profile: UserProfile = userProfiles[effectiveRole] || userProfiles.manager;

  const [name, setName] = useState(profile.name || authUser?.name || 'SiteFlow User');
  const [phone, setPhone] = useState(profile.phone || '');
  const [radioChannel, setRadioChannel] = useState(profile.radioChannel || '');
  const [cscsNumber, setCscsNumber] = useState(profile.cscsNumber || '');
  const [vehicleReg, setVehicleReg] = useState(profile.vehicleReg || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || authUser?.name || '');
      setPhone(profile.phone || '');
      setRadioChannel(profile.radioChannel || '');
      setCscsNumber(profile.cscsNumber || '');
      setVehicleReg(profile.vehicleReg || '');
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile, effectiveRole, authUser]);

  const homePath = ROLE_HOME_PATHS[effectiveRole] || '/';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        updateUserProfile(effectiveRole, { avatarUrl: dataUrl });
        showToast('Profile picture updated.');
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
    showToast('Profile & credentials saved successfully.');
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="flex-1 max-w-[720px] w-full mx-auto px-4 py-8 space-y-6">
      <Link
        href={homePath}
        className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#14171A] font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white border border-[#E7E5E0] rounded-[20px] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#E7E5E0] bg-white">
          <h1 className="text-xl font-bold text-[#14171A]">SiteFlow User Profile</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Operational profile card, induction verification & contact details
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 text-xs">
          {/* Profile Card */}
          <div className="flex items-center gap-5 p-5 bg-[#F8F8F6] rounded-2xl border border-[#E7E5E0]">
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
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#14171A] text-white flex items-center justify-center text-2xl font-bold cursor-pointer border-2 border-white shadow-md relative group-hover:opacity-90 transition-opacity"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span>{name.charAt(0)}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#14171A] text-[#F5B301] border-2 border-white flex items-center justify-center shadow-xs cursor-pointer"
                title="Change photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#14171A] truncate">{name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#14171A] text-white uppercase tracking-wider">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                <span className="truncate">{authUser?.organization || profile.organization}</span>
              </p>
              <p className="text-[11px] text-[#4B5563] font-medium">
                {profile.jobTitle || 'Site Operational Handler'}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3.5">
            <span className="font-semibold text-xs text-[#14171A] uppercase tracking-wider block">
              Contact & Comms Channels
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
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#14171A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  Mobile Contact
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-mono font-medium text-[#14171A]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={authUser?.email || profile.email}
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
                    value={radioChannel}
                    onChange={(e) => setRadioChannel(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#14171A]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Induction */}
          <div className="space-y-3.5 pt-2 border-t border-[#E7E5E0]">
            <span className="font-semibold text-xs text-[#14171A] uppercase tracking-wider block">
              Site Compliance & Credentials
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  CSCS / CPCS SmartCard Number
                </label>
                <div className="relative">
                  <IdCard className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cscsNumber}
                    onChange={(e) => setCscsNumber(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-mono font-medium text-[#14171A]"
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
                    className="w-full h-9 pl-8 pr-3 bg-white border border-[#E7E5E0] rounded-lg text-xs font-mono font-bold text-[#14171A]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#E7E5E0] flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#6B7280] hover:text-[#14171A] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change Profile Picture</span>
            </button>

            <button
              type="submit"
              className="h-10 px-6 bg-[#14171A] hover:bg-[#2A2F35] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Saved Successfully!</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

