#!/usr/bin/env python3
"""
Análise Completa de Nomenclatura do Banco de Dados
Script para analisar a nomenclatura real das 30+ tabelas do Supabase
"""

import json
from typing import Dict, List, Any

class DatabaseNomenclatureAnalyzer:
    """Analisador de nomenclatura do banco de dados"""
    
    def __init__(self):
        self.tables_info = []
        self.nomenclature_analysis = {}
        
    def analyze_real_database(self, tables_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analisa a estrutura real do banco de dados"""
        print(f"📊 Analisando {len(tables_data)} tabelas do banco de dados...")
        
        total_tables = len(tables_data)
        total_columns = sum(len(table.get('columns', [])) for table in tables_data)
        
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
                'consistency_percentage': (consistent_tables / total_tables * 100) if total_tables > 0 else 0,
                'analysis_date': '2024-01-15'
            },
            'naming_patterns': {
                'table_patterns': naming_patterns,
                'column_patterns': column_patterns
            },
            'tables_analysis': tables_analysis,
            'recommendations': self._generate_comprehensive_recommendations(tables_analysis, naming_patterns, column_patterns)
        }
        
        return report
    
    def analyze_table_structure(self, table_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analisa a estrutura e nomenclatura de uma tabela"""
        table_name = table_data['name']
        columns = table_data.get('columns', [])
        
        analysis = {
            'table_name': table_name,
            'naming_pattern': self._detect_naming_pattern(table_name),
            'columns_analysis': [],
            'total_columns': len(columns),
            'naming_consistency': 'consistent',
            'issues': [],
            'has_timestamps': False,
            'has_soft_delete': False,
            'has_primary_key': False,
            'foreign_keys_count': 0
        }
        
        # Análise de colunas
        for column in columns:
            column_analysis = self._analyze_column(column, table_name)
            analysis['columns_analysis'].append(column_analysis)
            
            # Verifica tipos especiais
            if column_analysis['is_primary_key']:
                analysis['has_primary_key'] = True
            if column_analysis['is_foreign_key']:
                analysis['foreign_keys_count'] += 1
            if column_analysis['is_timestamp']:
                analysis['has_timestamps'] = True
            if column['name'] == 'deleted_at':
                analysis['has_soft_delete'] = True
            
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
            'is_primary_key': 'id' in column_name.lower() and column_name == 'id',
            'is_foreign_key': '_id' in column_name.lower() and column_name != 'id',
            'is_timestamp': any(term in data_type.lower() for term in ['timestamp', 'date', 'time']),
            'is_boolean': any(term in data_type.lower() for term in ['boolean', 'bool']),
            'is_json': 'json' in data_type.lower(),
            'is_text': any(term in data_type.lower() for term in ['text', 'varchar', 'char']),
            'is_numeric': any(term in data_type.lower() for term in ['int', 'float', 'decimal', 'numeric'])
        }
    
    def _detect_column_pattern(self, column_name: str) -> str:
        """Detecta o padrão de nomenclatura da coluna"""
        if column_name == 'id':
            return 'primary_key'
        elif column_name.endswith('_id'):
            return 'foreign_key'
        elif column_name.startswith('is_'):
            return 'boolean_flag'
        elif column_name.startswith('has_'):
            return 'boolean_possession'
        elif column_name.endswith('_at') or column_name.endswith('_date'):
            return 'timestamp'
        elif column_name.endswith('_count') or column_name.endswith('_total'):
            return 'counter'
        elif '_' in column_name:
            return 'snake_case'
        elif column_name.islower():
            return 'simple_lower'
        elif column_name.isupper():
            return 'upper_case'
        else:
            return 'other'
    
    def _is_consistent_naming(self, column_name: str, table_name: str) -> bool:
        """Verifica se a nomenclatura é consistente com o padrão da tabela"""
        # Regras básicas de consistência
        if '_' in table_name and '_' not in column_name and len(column_name) > 10:
            return False
        if column_name.startswith('is_') and not any(term in column_name for term in ['active', 'deleted', 'visible', 'enabled']):
            return True  # Padrão correto para booleanos
        return True
    
    def _generate_comprehensive_recommendations(self, tables_analysis: List[Dict], table_patterns: Dict, column_patterns: Dict) -> List[str]:
        """Gera recomendações abrangentes baseadas na análise"""
        recommendations = []
        
        # Análise de padrões de tabelas
        if len(table_patterns) > 3:
            recommendations.append("📋 Padronize os padrões de nomenclatura das tabelas (use snake_case preferencialmente)")
        
        if 'multi_palavras_snake_case' not in table_patterns and len(tables_analysis) > 20:
            recommendations.append("🐍 Considere usar snake_case para nomes de tabelas com múltiplas palavras")
        
        # Análise de padrões de colunas
        if 'foreign_key' not in column_patterns:
            recommendations.append("🔑 Use o padrão 'tabela_id' para chaves estrangeiras")
        
        if 'boolean_flag' not in column_patterns:
            recommendations.append("✅ Use o prefixo 'is_' para colunas booleanas (ex: is_active, is_deleted)")
        
        # Análise de timestamps
        tables_without_timestamps = sum(1 for t in tables_analysis if not t['has_timestamps'])
        if tables_without_timestamps > len(tables_analysis) * 0.3:
            recommendations.append("⏰ Adicione campos de timestamp (created_at, updated_at) às tabelas")
        
        # Análise de soft delete
        tables_with_soft_delete = sum(1 for t in tables_analysis if t['has_soft_delete'])
        if tables_with_soft_delete < len(tables_analysis) * 0.2:
            recommendations.append("🗑️ Considere implementar soft delete com campo 'deleted_at'")
        
        # Análise de chaves primárias
        tables_without_pk = sum(1 for t in tables_analysis if not t['has_primary_key'])
        if tables_without_pk > 0:
            recommendations.append(f"⚠️ {tables_without_pk} tabelas não têm chave primária definida")
        
        # Análise de consistência
        inconsistent_tables = [t for t in tables_analysis if t['naming_consistency'] == 'inconsistent']
        if inconsistent_tables:
            recommendations.append(f"⚠️ {len(inconsistent_tables)} tabelas têm nomenclatura inconsistente")
        
        # Análise de relacionamentos
        avg_foreign_keys = sum(t['foreign_keys_count'] for t in tables_analysis) / len(tables_analysis)
        if avg_foreign_keys < 1:
            recommendations.append("🔗 Considere adicionar mais relacionamentos entre tabelas")
        
        return recommendations
    
    def print_comprehensive_report(self, report: Dict[str, Any]):
        """Imprime relatório abrangente"""
        summary = report['summary']
        
        print("\n" + "="*80)
        print("📊 RELATÓRIO COMPLETO DE NOMENCLATURA DO BANCO DE DADOS")
        print("="*80)
        
        print(f"\n📈 Estatísticas Gerais:")
        print(f"   • Total de tabelas: {summary['total_tables']}")
        print(f"   • Total de colunas: {summary['total_columns']}")
        print(f"   • Tabelas consistentes: {summary['consistent_tables']}/{summary['total_tables']}")
        print(f"   • Taxa de consistência: {summary['consistency_percentage']:.1f}%")
        print(f"   • Data da análise: {summary['analysis_date']}")
        
        print(f"\n📋 Padrões de Nomenclatura (Tabelas):")
        for pattern, count in report['naming_patterns']['table_patterns'].items():
            percentage = (count / summary['total_tables'] * 100) if summary['total_tables'] > 0 else 0
            print(f"   • {pattern}: {count} tabelas ({percentage:.1f}%)")
        
        print(f"\n🔤 Padrões de Nomenclatura (Colunas):")
        column_patterns = report['naming_patterns']['column_patterns']
        for pattern, count in sorted(column_patterns.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / summary['total_columns'] * 100) if summary['total_columns'] > 0 else 0
            print(f"   • {pattern}: {count} colunas ({percentage:.1f}%)")
        
        print(f"\n💡 Recomendações:")
        for i, rec in enumerate(report['recommendations'], 1):
            print(f"   {i}. {rec}")
        
        print("\n" + "="*80)
    
    def print_tables_summary(self, report: Dict[str, Any]):
        """Imprime resumo por tabelas"""
        print(f"\n📋 Resumo por Tabelas:")
        print("-" * 100)
        
        # Contadores
        with_timestamps = sum(1 for t in report['tables_analysis'] if t['has_timestamps'])
        with_soft_delete = sum(1 for t in report['tables_analysis'] if t['has_soft_delete'])
        with_pk = sum(1 for t in report['tables_analysis'] if t['has_primary_key'])
        
        print(f"📊 Estatísticas de Tabelas:")
        print(f"   • Com timestamps: {with_timestamps}/{len(report['tables_analysis'])} ({with_timestamps/len(report['tables_analysis'])*100:.1f}%)")
        print(f"   • Com soft delete: {with_soft_delete}/{len(report['tables_analysis'])} ({with_soft_delete/len(report['tables_analysis'])*100:.1f}%)")
        print(f"   • Com chave primária: {with_pk}/{len(report['tables_analysis'])} ({with_pk/len(report['tables_analysis'])*100:.1f}%)")
        
        print(f"\n🔍 Top 10 Tabelas por Número de Colunas:")
        sorted_tables = sorted(report['tables_analysis'], key=lambda x: x['total_columns'], reverse=True)
        
        for i, table in enumerate(sorted_tables[:10], 1):
            consistency = "✅" if table['naming_consistency'] == 'consistent' else "⚠️"
            timestamps = "⏰" if table['has_timestamps'] else ""
            soft_delete = "🗑️" if table['has_soft_delete'] else ""
            fk_count = table['foreign_keys_count']
            
            print(f"   {i:2d}. {consistency} {table['table_name']:<25} "
                  f"({table['total_columns']:2d} cols) "
                  f"{timestamps}{soft_delete} "
                  f"{'🔗' * min(fk_count, 3) if fk_count > 0 else ''}")

def main():
    """Função principal"""
    print("🚀 Iniciando análise completa de nomenclatura do banco de dados...")
    
    analyzer = DatabaseNomenclatureAnalyzer()
    
    # Aqui vamos usar os dados reais que obtivemos do Supabase
    # Substitua pelos dados reais da consulta anterior
    
    # Dados simulados baseados na estrutura real observada
    real_tables_data = [
        {"name": "users", "columns": [{"name": "id", "data_type": "uuid"}, {"name": "email", "data_type": "text"}, {"name": "full_name", "data_type": "text"}, {"name": "created_at", "data_type": "timestamp"}, {"name": "updated_at", "data_type": "timestamp"}]},
        {"name": "patients", "columns": [{"name": "id", "data_type": "uuid"}, {"name": "user_id", "data_type": "uuid"}, {"name": "full_name", "data_type": "text"}, {"name": "birth_date", "data_type": "date"}, {"name": "is_active", "data_type": "boolean"}]},
        {"name": "therapists", "columns": [{"name": "id", "data_type": "uuid"}, {"name": "user_id", "data_type": "uuid"}, {"name": "specialization", "data_type": "text"}, {"name": "license_number", "data_type": "text"}, {"name": "created_at", "data_type": "timestamp"}]},
        {"name": "appointments", "columns": [{"name": "id", "data_type": "uuid"}, {"name": "patient_id", "data_type": "uuid"}, {"name": "therapist_id", "data_type": "uuid"}, {"name": "appointment_date", "data_type": "timestamp"}, {"name": "status", "data_type": "text"}, {"name": "created_at", "data_type": "timestamp"}, {"name": "updated_at", "data_type": "timestamp"}]},
        {"name": "exercises", "columns": [{"name": "id", "data_type": "uuid"}, {"name": "name", "data_type": "text"}, {"name": "description", "data_type": "text"}, {"name": "category", "data_type": "text"}, {"name": "is_active", "data_type": "boolean"}, {"name": "created_at", "data_type": "timestamp"}]},
        {"name": "notifications", "columns": [{"name": "id", "data_type": "uuid"}, {"name": "user_id", "data_type": "uuid"}, {"name": "type", "data_type": "text"}, {"name": "message", "data_type": "text"}, {"name": "is_read", "data_type": "boolean"}, {"name": "created_at", "data_type": "timestamp"}]},
        {"name": "financial_transactions", "columns": [{"name": "id", "data_type": "uuid"}, {"name": "patient_id", "data_type": "uuid"}, {"name": "amount", "data_type": "decimal"}, {"name": "type", "data_type": "text"}, {"name": "payment_method", "data_type": "text"}, {"name": "transaction_date", "data_type": "timestamp"}, {"name": "created_at", "data_type": "timestamp"}]},
        {"name": "teleconsultas", "columns": [{"name": "id", "data_type": "uuid"}, {"name": "patient_id", "data_type": "uuid"}, {"name": "therapist_id", "data_type": "uuid"}, {"name": "scheduled_at", "data_type": "timestamp"}, {"name": "duration_minutes", "data_type": "integer"}, {"name": "status", "data_type": "text"}, {"name": "meeting_link", "data_type": "text"}, {"name": "created_at", "data_type": "timestamp"}]},
        {"name": "whatsapp_messages_log", "columns": [{"name": "id", "data_type": "uuid"}, {"name": "patient_id", "data_type": "uuid"}, {"name": "message_type", "data_type": "text"}, {"name": "content", "data_type": "text"}, {"name": "status", "data_type": "text"}, {"name": "sent_at", "data_type": "timestamp"}, {"name": "created_at", "data_type": "timestamp"}]},
        {"name": "push_notification_tokens", "columns": [{"name": "id", "data_type": "uuid"}, {"name": "user_id", "data_type": "uuid"}, {"name": "token", "data_type": "text"}, {"name": "device_type", "data_type": "text"}, {"name": "is_active", "data_type": "boolean"}, {"name": "created_at", "data_type": "timestamp"}, {"name": "updated_at", "data_type": "timestamp"}]}
    ]
    
    # Gera relatório com dados simulados (em produção, use os dados reais do Supabase)
    report = analyzer.analyze_real_database(real_tables_data)
    
    # Imprime relatórios
    analyzer.print_comprehensive_report(report)
    analyzer.print_tables_summary(report)
    
    # Salva relatório em JSON
    with open('nomenclatura_db_completo.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Análise completa concluída! Relatório salvo em 'nomenclatura_db_completo.json'")
    
    return report

if __name__ == "__main__":
    main()