import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorInfo, setErrorInfo] = useState('');
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");

    return () => {
      // Cleanup on unmount
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleStartScan = async () => {
    setErrorInfo('');
    try {
      const hasCameras = await Html5Qrcode.getCameras();
      if (!hasCameras || hasCameras.length === 0) {
        setErrorInfo('No cameras found on your device.');
        return;
      }
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scannerRef.current.stop().catch(console.error);
          setIsScanning(false);
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore general scan errors (happens continuously until QR is found)
        }
      );
      setIsScanning(true);
    } catch (err) {
      setErrorInfo('Failed to access camera. Please allow permissions.');
      setIsScanning(false);
    }
  };

  const handleStopScan = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.error("Stop failed", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setErrorInfo('');
    if (isScanning) {
      await handleStopScan();
    }

    try {
      const decodedText = await scannerRef.current.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err) {
      setErrorInfo('Invalid or unreadable QR code image.');
    }
    
    // Reset file input so same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleClose = async () => {
    await handleStopScan();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface-lowest rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.15)] relative border border-surface-container">
        
        {/* Header */}
        <div className="p-4 border-b border-surface-container flex justify-between items-center bg-surface-lowest relative z-20">
          <h3 className="text-on-surface font-headline font-bold text-lg flex items-center gap-2">
            <span className="material-icons text-secondary">qr_code_scanner</span>
            Scan to Pay
          </h3>
          <button onClick={handleClose} className="text-on-surface-variant hover:text-error transition-colors">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {/* Viewer Area */}
        <div className="bg-[#050505] min-h-[300px] relative flex flex-col items-center justify-center p-6">
          
          {/* Native HTML5Qrcode Container */}
          <div id="qr-reader" className={`w-full max-w-[280px] mx-auto rounded-xl overflow-hidden ${isScanning ? 'border-2 border-primary/50 shadow-neon-primary' : ''}`}></div>

          {/* Placeholder Overlay when Camera is Off */}
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] p-6 z-10 pointer-events-none">
              <div className="w-24 h-24 mx-auto border-2 border-dashed border-surface-container rounded-2xl flex items-center justify-center mb-6 relative">
                <span className="material-icons text-5xl text-on-surface-variant">photo_camera</span>
                {/* Cyberpunk Crosshairs */}
                <div className="absolute top-[-2px] left-[-2px] w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-xl"></div>
                <div className="absolute top-[-2px] right-[-2px] w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-xl"></div>
                <div className="absolute bottom-[-2px] left-[-2px] w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-xl"></div>
                <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-xl"></div>
              </div>
              
              <p className="text-on-surface-variant font-body mb-2 text-sm text-center max-w-[250px]">
                Initiate the camera to scan a CampusChain QR, or pick an image from your gallery.
              </p>
              
              {errorInfo && (
                <p className="mt-4 text-error text-xs font-bold font-body bg-error/10 py-2 px-3 rounded-lg border border-error/20 inline-block text-center">
                  {errorInfo}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="p-4 bg-surface-lowest border-t border-surface-container flex gap-3 relative z-20">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary flex-1 flex justify-center items-center gap-2 group hover:text-white"
          >
            <span className="material-icons text-xl group-hover:text-primary transition-colors">image</span>
            Upload
          </button>
          
          {isScanning ? (
            <button 
              onClick={handleStopScan}
              className="px-4 py-3 bg-error/10 text-error rounded-xl font-headline font-semibold flex-1 flex justify-center items-center gap-2 hover:bg-error hover:text-white transition-colors"
            >
              <span className="material-icons text-xl">stop_circle</span>
              Stop
            </button>
          ) : (
            <button 
              onClick={handleStartScan}
              className="btn-primary flex-1 flex justify-center items-center gap-2"
            >
              <span className="material-icons text-xl">camera_alt</span>
              Camera
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default QRScanner;
