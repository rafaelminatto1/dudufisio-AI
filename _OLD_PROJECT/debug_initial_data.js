// Debug do initialData
import { format } from 'date-fns';

// Simular o cenário real
function simulateRealScenario() {
  console.log('=== Simulação do cenário real ===');
  
  // Simular clique no slot de 09:00
  const day = new Date('2024-10-22T00:00:00.000Z'); // quarta-feira, 22 de outubro
  const time = '09:00';
  const therapistId = 'therapist1';
  
  console.log('1. Dados do clique:');
  console.log('   day:', day);
  console.log('   time:', time);
  console.log('   therapistId:', therapistId);
  
  // Simular handleSlotClick
  const [hour = '0', minute = '0'] = time.split(':');
  const clickedDate = new Date(day);
  clickedDate.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
  
  console.log('\n2. Após handleSlotClick:');
  console.log('   hour:', hour);
  console.log('   minute:', minute);
  console.log('   clickedDate:', clickedDate);
  console.log('   clickedDate.getHours():', clickedDate.getHours());
  console.log('   clickedDate.getMinutes():', clickedDate.getMinutes());
  console.log('   clickedDate.toISOString():', clickedDate.toISOString());
  
  // Simular initialData
  const initialData = { date: clickedDate, therapistId };
  
  console.log('\n3. initialData:');
  console.log('   initialData:', initialData);
  console.log('   initialData.date:', initialData.date);
  console.log('   initialData.date.getHours():', initialData.date.getHours());
  console.log('   initialData.date.getMinutes():', initialData.date.getMinutes());
  
  // Simular o cálculo no modal
  const slotTime = format(initialData.date, 'HH:mm');
  
  console.log('\n4. Cálculo no modal:');
  console.log('   format(initialData.date, "HH:mm"):', slotTime);
  
  // Verificar se initialData?.date existe
  console.log('\n5. Verificações:');
  console.log('   initialData?.date existe:', !!initialData?.date);
  console.log('   initialData?.date é Date:', initialData?.date instanceof Date);
  console.log('   initialData?.date é válido:', !isNaN(initialData?.date.getTime()));
  
  return { initialData, slotTime };
}

// Testar diferentes cenários
console.log('Testando diferentes cenários:');
console.log('============================');

// Cenário 1: Clique normal
console.log('\n--- Cenário 1: Clique normal ---');
const result1 = simulateRealScenario();

// Cenário 2: Verificar se há problema com timezone
console.log('\n--- Cenário 2: Verificação de timezone ---');
const testDate = new Date('2024-10-22T09:00:00.000Z');
console.log('testDate:', testDate);
console.log('testDate.getHours():', testDate.getHours());
console.log('testDate.getMinutes():', testDate.getMinutes());
console.log('format(testDate, "HH:mm"):', format(testDate, 'HH:mm'));

// Cenário 3: Verificar se há problema com setHours
console.log('\n--- Cenário 3: Verificação de setHours ---');
const testDate2 = new Date('2024-10-22');
testDate2.setHours(9, 0, 0, 0);
console.log('testDate2:', testDate2);
console.log('testDate2.getHours():', testDate2.getHours());
console.log('testDate2.getMinutes():', testDate2.getMinutes());
console.log('format(testDate2, "HH:mm"):', format(testDate2, 'HH:mm'));

console.log('\n=== Resultado final ===');
console.log('slotTime calculado:', result1.slotTime);

