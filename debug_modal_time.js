// Debug do problema do modal mostrando 00:00
import { format } from 'date-fns';

// Simular o cenário do clique
function simulateSlotClick() {
  // Simular clique no slot de 09:00
  const day = new Date('2024-10-22'); // quarta-feira, 22 de outubro
  const time = '09:00';
  const therapistId = 'therapist1';
  
  console.log('=== Simulação do clique ===');
  console.log('day:', day);
  console.log('time:', time);
  console.log('therapistId:', therapistId);
  
  // Simular handleSlotClick
  const [hour = '0', minute = '0'] = time.split(':');
  const clickedDate = new Date(day);
  clickedDate.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
  
  console.log('\n=== Após handleSlotClick ===');
  console.log('hour:', hour);
  console.log('minute:', minute);
  console.log('clickedDate:', clickedDate);
  console.log('clickedDate.getHours():', clickedDate.getHours());
  console.log('clickedDate.getMinutes():', clickedDate.getMinutes());
  
  // Simular initialData
  const initialData = { date: clickedDate, therapistId };
  console.log('\n=== initialData ===');
  console.log('initialData:', initialData);
  
  // Simular o cálculo do slotTime no modal
  const slotTime = format(initialData.date, 'HH:mm');
  console.log('\n=== Cálculo do slotTime no modal ===');
  console.log('format(initialData.date, "HH:mm"):', slotTime);
  
  return { initialData, slotTime };
}

// Testar diferentes horários
const testTimes = ['07:00', '08:30', '09:00', '10:15', '11:30', '12:00'];

console.log('Testando diferentes horários:');
console.log('============================');

testTimes.forEach(time => {
  console.log(`\n--- Testando ${time} ---`);
  const [hour, minute] = time.split(':');
  const testDate = new Date('2024-10-22');
  testDate.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
  
  const formattedTime = format(testDate, 'HH:mm');
  console.log(`Input: ${time} -> Output: ${formattedTime}`);
  
  if (time === formattedTime) {
    console.log('✅ Correto');
  } else {
    console.log('❌ Incorreto');
  }
});

// Simular o cenário completo
console.log('\n\n=== Simulação completa ===');
const result = simulateSlotClick();
console.log('\nResultado final:');
console.log('slotTime:', result.slotTime);
