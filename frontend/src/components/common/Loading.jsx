const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white text-slate-600">
      <div className="w-16 sm:w-20 aspect-square border-4 border-blue-100 border-t-4 border-t-blue-600 rounded-full animate-spin shadow-lg" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Loading;
