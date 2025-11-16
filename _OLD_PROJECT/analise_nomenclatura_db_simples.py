#!/usr/bin/env python3
"""
Análise de Nomenclatura do Banco de Dados - Versão Simplificada
Script para analisar e documentar a nomenclatura utilizada no banco de dados PostgreSQL
"""

import json
from typing import Dict, List, Any

class DatabaseNomenclatureAnalyzer:
    """Analisador de nomenclatura do banco de dados"""
    
    def __init__(self):
        self.tables_info = []
        self.nomenclature_analysis = {}
        
    def analyze_table_structure(self, table_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analisa a estrutura e nomenclatura de uma tabela"""
        table_name = table_data['name']
        columns = table_data['columns']
        
        analysis = {
            'table_name': table_name,
            'naming_pattern': self._detect_naming_pattern(table_name),
            'columns_analysis': [],
            'total_columns': len(columns),
            'naming_consistency': 'consistent',
            'issues': []
        }
        
        # Análise de colunas
        for column in columns:
            column_analysis = self._analyze_column(column, table_name)
            analysis['columns_analysis'].append(column_analysis)
            
            # Verifica consistência
            if not self._is_consistent_naming(column['name'], table_name):
                analysis['naming_consistency'] = 'inconsistent'
                analysis['issues'].append(f"Coluna '{column['name']}' não segue padrão consistente")
        
        return analysis
    
    def _detect_naming_pattern(self, table_name: str) -> str:
        """Detecta o padrão de nomenclatura usado"""
        if '_' in table_name:
            parts = table_name.split('_')
            if len(parts) == 2:
                return 'prefixo_sufixo'
            elif len(parts) > 2:
                return 'multi_palavras_snake_case'
        elif table_name.islower():
            return 'simples_minuscula'
        elif table_name.istitle():
            return 'title_case'
        else:
            return 'outro'
    
    def _analyze_column(self, column: Dict[str, Any], table_name: str) -> Dict[str, Any]:
        """Analisa uma coluna individual"""
        column_name = column['name']
        data_type = column['data_type']
        
        return {
            'name': column_name,
            'data_type': data_type,
            'naming_pattern': self._detect_column_pattern(column_name),
            'is_primary_key': 'id' in column_name.lower(),
            'is_foreign_key': '_id' in column_name.lower() and column_name != 'id',
            'is_timestamp': 'timestamp' in data_type.lower() or 'date' in data_type.lower(),
            'is_boolean': 'boolean' in data_type.lower() or 'bool' in data_type.lower(),
            'is_json': 'json' in data_type.lower()
        }
    
    def _detect_column_pattern(self, column_name: str) -> str:
        """Detecta o padrão de nomenclatura da coluna"""
        if column_name.endswith('_id'):
            return 'foreign_key'
        elif column_name.startswith('is_'):
            return 'boolean_flag'
        elif column_name.startswith('has_'):
            return 'boolean_possession'
        elif '_at' in column_name:
            return 'timestamp'
        elif '_' in column_name:
            return 'snake_case'
        elif column_name.islower():
            return 'simple_lower'
        else:
            return 'other'
    
    def _is_consistent_naming(self, column_name: str, table_name: str) -> bool:
        """Verifica se a nomenclatura é consistente com o padrão da tabela"""
        # Regras básicas de consistência
        if '_' in table_name and '_' not in column_name:
            return False
        if column_name.startswith('is_') and 'boolean' not in column_name:
            return True  # Padrão correto para booleanos
        return True
    
    def generate_report(self, tables_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Gera relatório completo de nomenclatura"""
        print("🔍 Analisando nomenclatura do banco de dados...")
        
        total_tables = len(tables_data)
        total_columns = sum(len(table['columns']) for table in tables_data)
        
        # Análise por tabela
        tables_analysis = []
        naming_patterns = {}
        column_patterns = {}
        
        for table in tables_data:
            table_analysis = self.analyze_table_structure(table)
            tables_analysis.append(table_analysis)
            
            # Contagem de padrões
            pattern = table_analysis['naming_pattern']
            naming_patterns[pattern] = naming_patterns.get(pattern, 0) + 1
            
            # Análise de padrões de colunas
            for col_analysis in table_analysis['columns_analysis']:
                col_pattern = col_analysis['naming_pattern']
                column_patterns[col_pattern] = column_patterns.get(col_pattern, 0) + 1
        
        # Estatísticas gerais
        consistent_tables = sum(1 for t in tables_analysis if t['naming_consistency'] == 'consistent')
        
        report = {
            'summary': {
                'total_tables': total_tables,
                'total_columns': total_columns,
                'consistent_tables': consistent_tables,
                'consistency_percentage': (consistent_tables / total_tables * 100) if total_tables > 0 else 0
            },
            'naming_patterns': {
                'table_patterns': naming_patterns,
                'column_patterns': column_patterns
            },
            'tables_analysis': tables_analysis,
            'recommendations': self._generate_recommendations(tables_analysis, naming_patterns, column_patterns)
        }
        
        return report
    
    def _generate_recommendations(self, tables_analysis: List[Dict], table_patterns: Dict, column_patterns: Dict) -> List[str]:
        """Gera recomendações baseadas na análise"""
        recommendations = []
        
        # Verifica padrões de nomenclatura
        if len(table_patterns) > 2:
            recommendations.append("📋 Padronize os padrões de nomenclatura das tabelas (use snake_case preferencialmente)")
        
        if 'snake_case' not in table_patterns:
            recommendations.append("🐍 Considere usar snake_case para nomes de tabelas")
        
        # Verifica padrões de colunas
        if 'foreign_key' not in column_patterns:
            recommendations.append("🔑 Use o padrão 'tabela_id' para chaves estrangeiras")
        
        if 'boolean_flag' not in column_patterns:
            recommendations.append("✅ Use o prefixo 'is_' para colunas booleanas (ex: is_active, is_deleted)")
        
        # Verifica consistência
        inconsistent_tables = [t for t in tables_analysis if t['naming_consistency'] == 'inconsistent']
        if inconsistent_tables:
            recommendations.append(f"⚠️ {len(inconsistent_tables)} tabelas têm nomenclatura inconsistente")
        
        # Verifica timestamps
        timestamp_cols = sum(1 for t in tables_analysis for c in t['columns_analysis'] if c['is_timestamp'])
        if timestamp_cols == 0:
            recommendations.append("⏰ Adicione campos de timestamp (created_at, updated_at) às tabelas")
        
        # Verifica soft delete
        has_deleted_at = any('deleted_at' in [c['name'] for c in t['columns_analysis']] for t in tables_analysis)
        if not has_deleted_at:
            recommendations.append("🗑️ Considere implementar soft delete com campo 'deleted_at'")
        
        return recommendations
    
    def print_summary_report(self, report: Dict[str, Any]):
        """Imprime relatório resumido"""
        summary = report['summary']
        
        print("\n" + "="*60)
        print("📊 RELATÓRIO DE NOMENCLATURA DO BANCO DE DADOS")
        print("="*60)
        
        print(f"\n📈 Estatísticas Gerais:")
        print(f"   • Total de tabelas: {summary['total_tables']}")
        print(f"   • Total de colunas: {summary['total_columns']}")
        print(f"   • Tabelas consistentes: {summary['consistent_tables']}/{summary['total_tables']}")
        print(f"   • Taxa de consistência: {summary['consistency_percentage']:.1f}%")
        
        print(f"\n📋 Padrões de Nomenclatura (Tabelas):")
        for pattern, count in report['naming_patterns']['table_patterns'].items():
            percentage = (count / summary['total_tables'] * 100) if summary['total_tables'] > 0 else 0
            print(f"   • {pattern}: {count} tabelas ({percentage:.1f}%)")
        
        print(f"\n🔤 Padrões de Nomenclatura (Colunas):")
        for pattern, count in report['naming_patterns']['column_patterns'].items():
            percentage = (count / summary['total_columns'] * 100) if summary['total_columns'] > 0 else 0
            print(f"   • {pattern}: {count} colunas ({percentage:.1f}%)")
        
        print(f"\n💡 Recomendações:")
        for i, rec in enumerate(report['recommendations'], 1):
            print(f"   {i}. {rec}")
        
        print("\n" + "="*60)
    
    def print_detailed_analysis(self, report: Dict[str, Any]):
        """Imprime análise detalhada por tabela"""
        print(f"\n🔍 Análise Detalhada por Tabela:")
        print("-" * 80)
        
        for table_analysis in report['tables_analysis']:
            table_name = table_analysis['table_name']
            consistency = "✅" if table_analysis['naming_consistency'] == 'consistent' else "⚠️"
            
            print(f"\n{consistency} {table_name.upper()}")
            print(f"   Padrão: {table_analysis['naming_pattern']}")
            print(f"   Colunas: {table_analysis['total_columns']}")
            
            if table_analysis['issues']:
                print(f"   Problemas:")
                for issue in table_analysis['issues']:
                    print(f"     - {issue}")
            
            # Mostra exemplos de colunas
            sample_columns = table_analysis['columns_analysis'][:5]
            print(f"   Exemplos de colunas:")
            for col in sample_columns:
                icon = "🔑" if col['is_primary_key'] else "🔗" if col['is_foreign_key'] else "📄"
                print(f"     {icon} {col['name']} ({col['data_type']}) - {col['naming_pattern']}")
            
            if len(table_analysis['columns_analysis']) > 5:
                print(f"     ... e mais {len(table_analysis['columns_analysis']) - 5} colunas")

def main():
    """Função principal"""
    print("🚀 Iniciando análise de nomenclatura do banco de dados...")
    
    # Simula dados das tabelas (em produção, isso viria do banco real)
    # Aqui usamos os dados que já temos da consulta anterior
    
    analyzer = DatabaseNomenclatureAnalyzer()
    
    # Para este exemplo, vamos criar dados simulados baseados na estrutura real
    # Em produção, substitua pelos dados reais do banco
    mock_tables = [
        {
            "name": "users",
            "columns": [
                {"name": "id", "data_type": "uuid"},
                {"name": "email", "data_type": "text"},
                {"name": "full_name", "data_type": "text"},
                {"name": "created_at", "data_type": "timestamp"},
                {"name": "updated_at", "data_type": "timestamp"}
            ]
        },
        {
            "name": "patients",
            "columns": [
                {"name": "id", "data_type": "uuid"},
                {"name": "user_id", "data_type": "uuid"},
                {"name": "full_name", "data_type": "text"},
                {"name": "birth_date", "data_type": "date"},
                {"name": "is_active", "data_type": "boolean"}
            ]
        }
    ]
    
    # Gera relatório com dados simulados
    report = analyzer.generate_report(mock_tables)
    
    # Imprime relatórios
    analyzer.print_summary_report(report)
    analyzer.print_detailed_analysis(report)
    
    # Salva relatório em JSON
    with open('nomenclatura_db_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Análise concluída! Relatório salvo em 'nomenclatura_db_report.json'")
    
    return report

if __name__ == "__main__":
    main()