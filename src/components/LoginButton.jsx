import { Link } from 'react-router-dom';

const LoginButton = () => {
  return (
    <Link
      to="/login"
      className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md text-sm font-medium"
    >
      Login
    </Link>
  );
};

export default LoginButton;
