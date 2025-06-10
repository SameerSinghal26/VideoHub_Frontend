import {
    UserRound,
    LogOut,
    Settings,
    HelpCircle,
    Globe,
    Keyboard,
    Moon,
    Languages,
    ShieldOff,
    ShoppingCart,
    LayoutDashboard,
    UserCog,
    MessageSquare
  } from "lucide-react";
  import { Link } from "react-router-dom";
  
  const Profile = ({ user }) => {
    return (
      <div className="absolute right-3 top-13 w-80 bg-neutral-900 text-white rounded-xl shadow-lg z-60">
        {/* Header */}
        <div className="p-4 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || '/download.webp'} alt="avatar" className="w-11 h-11 rounded-full border-2" />
            <div>
              <p className="font-semibold">{user?.fullName || `Login / Register`}</p>
              <Link to={`/@${user?.username}`}><p className="text-sm text-gray-400">@{user?.username || `Default`}</p>
              <button className="text-blue-400 text-sm mt-1 hover:underline">
                View your channel
              </button>
              </Link>
            </div>
          </div>
        </div>
  
        {/* Menu */}
        <ul className="py-2">
          <MenuItem icon={<UserCog size={18} />} label="Google Account" />
          <MenuItem icon={<UserRound size={18} />} label="Switch account" />
          <MenuItem icon={<LogOut size={18} />} label="Sign out" />
          <Divider />
  
          <MenuItem icon={<LayoutDashboard size={18} />} label="YouTube Studio" />
          <MenuItem icon={<ShoppingCart size={18} />} label="Purchases and memberships" />
          <MenuItem icon={<ShieldOff size={18} />} label="Your data in VideoHub" />
          <MenuItem icon={<Moon size={18} />} label="Appearance: Device theme" />
          <MenuItem icon={<Languages size={18} />} label="Language: English" />
          <MenuItem icon={<ShieldOff size={18} />} label="Restricted Mode: Off" />
          <MenuItem icon={<Globe size={18} />} label="Location: India" />
          <MenuItem icon={<Keyboard size={18} />} label="Keyboard shortcuts" />
          <Divider />
  
          <MenuItem icon={<Settings size={18} />} label="Settings" />
          <MenuItem icon={<HelpCircle size={18} />} label="Help" />
          <MenuItem icon={<MessageSquare size={18} />} label="Send feedback" />
        </ul>
      </div>
    );
  };
  
  const MenuItem = ({ icon, label }) => (
    <li className="px-4 py-2 flex items-center gap-3 hover:bg-neutral-800 cursor-pointer">
      {icon}
      <span>{label}</span>
    </li>
  );
  
  const Divider = () => <hr className="my-2 border-neutral-700" />;
  
  export default Profile;
  