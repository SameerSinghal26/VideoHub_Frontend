function Toast({ message, type = "info", onClose }) {
    return (
      <div className="fixed top-20 right-2 z-50 animate-slide-in shadow-lg px-4 py-2 text-gray-800 border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 rounded-md"
      >
        {message}
      </div>
    );
  }
  
  export default Toast;
  