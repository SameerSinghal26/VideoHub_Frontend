import { Link } from 'react-router-dom';

const SignUpButton = () => {
  return (
    <Link 
      to="/register"
      className="bg-red-600 hover:bg-red-900 text-white px-4 py-2 rounded-md text-sm font-medium"
    >
      Sign Up
    </Link>
  );
};

export default SignUpButton; 