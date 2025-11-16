import jwt from 'jsonwebtoken';
import fs from 'fs';

// Dados do Apple Developer
const teamId = 'G7FDW933SF';
const clientId = 'br.com.moocafisio.web';
const keyId = '7MP3DKQ7Q3';
const privateKey = fs.readFileSync('./AuthKey_7MP3DKQ7Q3.p8');

// Gerar o token JWT
const token = jwt.sign(
  {
    iss: teamId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 6 meses
    aud: 'https://appleid.apple.com',
    sub: clientId,
  },
  privateKey,
  {
    algorithm: 'ES256',
    header: {
      kid: keyId,
    },
  }
);

console.log('\n✅ Client Secret gerado com sucesso!\n');
console.log('='.repeat(80));
console.log(token);
console.log('='.repeat(80));
console.log('\n📋 Copie este token e use no Supabase!\n');
console.log('📝 Configuração no Supabase:');
console.log('   - Client ID: br.com.moocafisio.web');
console.log('   - Client Secret: (cole o token acima)');
console.log('   - Redirect URL: https://[SEU_PROJECT_ID].supabase.co/auth/v1/callback\n');

