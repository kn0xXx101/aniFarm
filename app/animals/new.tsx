import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { OperationsScreen } from '@/components/operations/operations-screen';
import { OptionChips } from '@/components/operations/option-chips';
import { Card3D } from '@/components/ui/card-3d';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAnimalStore } from '@/lib/stores/animal-store';
import { useActiveFarm } from '@/hooks/useActiveFarm';
import { useToast } from '@/components/ui/toast';
import type { AnimalGender, AnimalHealthStatus, AnimalSpecies } from '@/types/domain';

const SPECIES_OPTIONS: { value: AnimalSpecies; label: string }[] = [
  { value: 'chicken', label: 'Chicken' },
  { value: 'duck', label: 'Duck' },
  { value: 'turkey', label: 'Turkey' },
  { value: 'pig', label: 'Pig' },
  { value: 'goat', label: 'Goat' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'cow', label: 'Cattle' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'fish', label: 'Fish' },
  { value: 'mixed', label: 'Mixed' },
];

const GENDER_OPTIONS: { value: AnimalGender; label: string }[] = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

const HEALTH_OPTIONS: { value: AnimalHealthStatus; label: string }[] = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'sick', label: 'Sick' },
  { value: 'quarantine', label: 'Quarantine' },
];

export default function NewAnimalScreen() {
  const router = useRouter();
  const toast = useToast();
  const { farmId } = useActiveFarm();
  const addAnimal = useAnimalStore((s) => s.addAnimal);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<AnimalSpecies>('chicken');
  const [gender, setGender] = useState<AnimalGender>('unknown');
  const [weightKg, setWeightKg] = useState('');
  const [breed, setBreed] = useState('');
  const [rfid, setRfid] = useState('');
  const [notes, setNotes] = useState('');
  const [healthStatus, setHealthStatus] = useState<AnimalHealthStatus>('healthy');

  const submit = () => {
    if (!farmId) {
      toast.toast({ title: 'Create a farm first', variant: 'destructive' });
      return;
    }
    if (!name.trim()) {
      toast.toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    const animal = addAnimal({
      farmId,
      name: name.trim(),
      species,
      breed: breed.trim() || undefined,
      gender,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      rfid: rfid.trim() || undefined,
      notes: notes.trim() || undefined,
      healthStatus,
      vaccinationStatus: 'current',
    });
    toast.toast({ title: 'Animal registered', description: animal.tagId, variant: 'success' });
    router.replace({ pathname: '/animals/[id]', params: { id: animal.id } });
  };

  return (
    <OperationsScreen title="Register animal" subtitle="Individual registration">
      <Card3D variant="glass">
        <View style={{ gap: 16 }}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Hen #12" />
          <OptionChips label="Species" options={SPECIES_OPTIONS} value={species} onChange={setSpecies} />
          <OptionChips label="Gender" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
          <OptionChips label="Health status" options={HEALTH_OPTIONS} value={healthStatus} onChange={setHealthStatus} />
          <Input label="Breed (optional)" value={breed} onChangeText={setBreed} />
          <Input label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" />
          <Input label="RFID tag (optional)" value={rfid} onChangeText={setRfid} />
          <Input label="Notes" value={notes} onChangeText={setNotes} multiline />
          <Button onPress={submit} style={{ width: '100%' }}>
            Save animal
          </Button>
        </View>
      </Card3D>
    </OperationsScreen>
  );
}
