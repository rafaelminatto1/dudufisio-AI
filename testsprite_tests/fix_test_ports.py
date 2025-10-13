#!/usr/bin/env python3
"""
Script para corrigir automaticamente a porta nos testes TestSprite
Altera de 5174 para 5175 em todos os arquivos de teste
"""

import glob
import os

def fix_port_in_file(file_path):
    """Corrige a porta em um arquivo específico"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Substituir todas as ocorrências de porta 5174 por 5175
        content = content.replace('localhost:5174', 'localhost:5175')
        content = content.replace('"http://localhost:5174"', '"http://localhost:5175"')
        content = content.replace("'http://localhost:5174'", "'http://localhost:5175'")
        
        # Verificar se houve mudança
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    
    except Exception as e:
        print(f'ERRO ao processar {file_path}: {e}')
        return False

def main():
    print('=' * 80)
    print('SCRIPT DE CORRECAO AUTOMATICA DE PORTA - TestSprite')
    print('=' * 80)
    print('Alterando porta de 5174 para 5175 em todos os testes...\n')
    
    # Encontrar todos os arquivos de teste
    test_pattern = 'TC*.py'
    test_files = glob.glob(test_pattern)
    
    if not test_files:
        print(f'ERRO: Nenhum arquivo de teste encontrado com padrao {test_pattern}')
        print('Certifique-se de executar este script do diretorio testsprite_tests/')
        return
    
    print(f'Encontrados {len(test_files)} arquivos de teste:\n')
    
    fixed_count = 0
    unchanged_count = 0
    
    for file_path in sorted(test_files):
        file_name = os.path.basename(file_path)
        
        if fix_port_in_file(file_path):
            print(f'[OK] Corrigido: {file_name}')
            fixed_count += 1
        else:
            print(f'[--] Sem alteracao: {file_name}')
            unchanged_count += 1
    
    print('\n' + '=' * 80)
    print('RESUMO')
    print('=' * 80)
    print(f'Total de arquivos: {len(test_files)}')
    print(f'Arquivos corrigidos: {fixed_count}')
    print(f'Arquivos sem alteracao: {unchanged_count}')
    
    if fixed_count > 0:
        print('\n[OK] Todos os arquivos foram corrigidos com sucesso!')
        print('Agora voce pode executar os testes com: python run_all_tests.py')
    else:
        print('\n[INFO] Nenhum arquivo precisou ser corrigido.')
        print('Todos ja estavam com a porta correta (5175).')
    
    print('=' * 80)

if __name__ == '__main__':
    main()

