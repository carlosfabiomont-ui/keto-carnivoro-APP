import React from 'react';
import type { DietType, StrictnessLevel, CarnivoreStrictness, KetogenicStrictness } from '../types';

interface DietSelectorProps {
  diet: DietType;
  setDiet: (diet: DietType) => void;
  strictness: StrictnessLevel;
  setStrictness: (strictness: StrictnessLevel) => void;
}

const DietSelector: React.FC<DietSelectorProps> = ({ diet, setDiet, strictness, setStrictness }) => {
  const handleDietChange = (newDiet: DietType) => {
    setDiet(newDiet);
    // Reset strictness to default for the new diet
    if (newDiet === 'carnivore') {
      setStrictness('strict');
    } else {
      setStrictness('very_low');
    }
  };

  const carnivoreOptions: { value: CarnivoreStrictness, label: string }[] = [
    { value: 'strict', label: 'Estrita' },
    { value: 'permissive', label: 'Permissiva' },
  ];

  const ketogenicOptions: { value: KetogenicStrictness, label: string }[] = [
    { value: 'very_low', label: 'Muito Baixa (<20g)' },
    { value: 'moderate', label: 'Moderada (<50g)' },
  ];

  const strictnessOptions = diet === 'carnivore' ? carnivoreOptions : ketogenicOptions;

  return (
    <div className="w-full space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-gray-light mb-2">2. Escolha sua Dieta</label>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-brand-gray p-1">
          <button
            onClick={() => handleDietChange('carnivore')}
            className={`w-full py-2.5 text-sm font-semibold rounded-md transition-colors duration-300 ${diet === 'carnivore' ? 'bg-brand-primary text-brand-dark' : 'text-brand-gray-light hover:bg-brand-gray/60'}`}
          >
            Carnívora
          </button>
          <button
            onClick={() => handleDietChange('ketogenic')}
            className={`w-full py-2.5 text-sm font-semibold rounded-md transition-colors duration-300 ${diet === 'ketogenic' ? 'bg-brand-primary text-brand-dark' : 'text-brand-gray-light hover:bg-brand-gray/60'}`}
          >
            Cetogênica
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-gray-light mb-2">3. Defina o Rigor</label>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-brand-gray p-1">
          {strictnessOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStrictness(option.value as StrictnessLevel)}
              className={`w-full py-2.5 text-sm font-semibold rounded-md transition-colors duration-300 ${strictness === option.value ? 'bg-brand-primary text-brand-dark' : 'text-brand-gray-light hover:bg-brand-gray/60'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DietSelector;