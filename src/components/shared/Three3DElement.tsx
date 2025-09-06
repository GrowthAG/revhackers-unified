const SimpleThree3DElement = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-revgreen/20 to-green-400/20 rounded-full blur-xl animate-pulse" 
           style={{ animationDelay: '0s', animationDuration: '4s' }} />
      <div className="absolute bottom-1/3 right-1/5 w-24 h-24 bg-gradient-to-br from-green-600/20 to-revgreen/20 rounded-full blur-lg animate-pulse" 
           style={{ animationDelay: '2s', animationDuration: '5s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-revgreen/15 to-green-500/15 rounded-full blur-md animate-pulse" 
           style={{ animationDelay: '1s', animationDuration: '3s' }} />
    </div>
  );
};

export default SimpleThree3DElement;