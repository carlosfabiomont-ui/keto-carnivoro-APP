import React from 'react';
import { UploadIcon, CameraIcon } from './Icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  imageUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imageUrl }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
    // Redefine o valor do input para permitir a seleção do mesmo arquivo novamente
    event.target.value = '';
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-brand-gray-light mb-2">1. Envie uma Foto</label>
      
      {/* Inputs ocultos para câmera e upload de arquivo */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        capture="environment"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="relative w-full aspect-video bg-brand-gray rounded-lg border-2 border-dashed border-brand-gray-light flex flex-col justify-center items-center transition-colors duration-300">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Pré-visualização da refeição" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-4">
                     <button
                        onClick={handleCameraClick}
                        className="flex items-center gap-2 bg-brand-primary text-brand-dark font-semibold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors"
                    >
                        <CameraIcon className="w-5 h-5" />
                        Tirar Outra
                    </button>
                    <button
                        onClick={handleGalleryClick}
                        className="flex items-center gap-2 bg-brand-light text-brand-dark font-semibold py-2 px-4 rounded-lg hover:bg-brand-light/80 transition-colors"
                    >
                        <UploadIcon className="w-5 h-5" />
                        Escolher Outra
                    </button>
                </div>
            </div>
          </>
        ) : (
          <div className="w-full p-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button
                onClick={handleCameraClick}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors"
            >
                <CameraIcon className="w-5 h-5" />
                Tirar Foto
            </button>
            <button
                onClick={handleGalleryClick}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-gray text-brand-gray-light font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-colors"
            >
                <UploadIcon className="w-5 h-5" />
                Carregar da Galeria
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;