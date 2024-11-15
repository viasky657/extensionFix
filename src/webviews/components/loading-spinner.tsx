const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center h-full p-4">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-600">Downloading and starting Sota PR Assistant...</p>
            </div>
        </div>
    );
}

export default LoadingSpinner;