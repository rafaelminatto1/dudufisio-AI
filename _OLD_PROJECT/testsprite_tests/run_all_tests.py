import json
import subprocess
import time
from datetime import datetime

from mock_backend import start_mock_server, stop_mock_server

print("Iniciando servidor mock TestSprite...")
mock_server = start_mock_server()
time.sleep(1)

test_cases = [
    "TC001_get_all_patients_endpoint_should_return_list_of_patients.py",
    "TC002_create_new_patient_endpoint_should_create_patient_successfully.py",
    "TC003_get_patient_by_id_endpoint_should_return_patient_details.py",
    "TC004_get_appointments_endpoint_should_return_filtered_appointments.py",
    "TC005_create_new_appointment_endpoint_should_create_appointment_successfully.py",
    "TC006_get_medical_records_endpoint_should_return_list_of_records.py",
    "TC007_generate_clinical_report_endpoint_should_return_generated_report.py",
    "TC008_add_pain_point_endpoint_should_add_pain_point_successfully.py",
    "TC009_get_exercises_endpoint_should_return_filtered_exercises.py",
    "TC010_user_login_endpoint_should_authenticate_user_successfully.py"
]

results = {
    "timestamp": datetime.now().isoformat(),
    "total_tests": len(test_cases),
    "passed": 0,
    "failed": 0,
    "errors": [],
    "test_details": []
}

print("Executando testes TestSprite...\n")
print("=" * 80)

try:
    for i, test_case in enumerate(test_cases, 1):
        test_id = test_case.split("_")[0]
        print(f"\n[{i}/{len(test_cases)}] Executando {test_id}...")
        print("-" * 80)
        
        try:
            result = subprocess.run(
                ["python", test_case],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            test_detail = {
                "test_id": test_id,
                "test_file": test_case,
                "status": "PASSED" if result.returncode == 0 else "FAILED",
                "exit_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
            
            if result.returncode == 0:
                results["passed"] += 1
                print(f"[OK] {test_id}: PASSOU")
            else:
                results["failed"] += 1
                print(f"[FALHA] {test_id}: FALHOU")
                error_msg = result.stderr if result.stderr else result.stdout
                # Extract the most relevant error information
                if "AssertionError" in error_msg:
                    error_lines = [line for line in error_msg.split('\n') if 'AssertionError' in line or 'assert' in line.lower()]
                    test_detail["error_summary"] = "\n".join(error_lines[:3])
                elif "ConnectionError" in error_msg or "ConnectionRefusedError" in error_msg:
                    test_detail["error_summary"] = "Erro de conexão: Servidor não está respondendo"
                else:
                    error_lines = error_msg.split('\n')
                    test_detail["error_summary"] = "\n".join([l for l in error_lines if l.strip()][-3:])
                
                results["errors"].append({
                    "test_id": test_id,
                    "error": test_detail.get("error_summary", "Erro desconhecido")
                })
                
                print(f"   Erro: {test_detail.get('error_summary', 'Ver log completo')}")
            
            results["test_details"].append(test_detail)
            
        except subprocess.TimeoutExpired:
            results["failed"] += 1
            print(f"[TIMEOUT] {test_id}: TIMEOUT (>30s)")
            results["test_details"].append({
                "test_id": test_id,
                "test_file": test_case,
                "status": "TIMEOUT",
                "error_summary": "Teste excedeu tempo limite de 30 segundos"
            })
            results["errors"].append({
                "test_id": test_id,
                "error": "Timeout - teste excedeu 30 segundos"
            })
        except Exception as e:
            results["failed"] += 1
            print(f"[ERRO] {test_id}: ERRO DE EXECUCAO - {str(e)}")
            results["test_details"].append({
                "test_id": test_id,
                "test_file": test_case,
                "status": "ERROR",
                "error_summary": str(e)
            })
            results["errors"].append({
                "test_id": test_id,
                "error": f"Erro de execução: {str(e)}"
            })
finally:
    print("\nEncerrando servidor mock...")
    stop_mock_server(mock_server)

# Print summary
print("\n" + "=" * 80)
print("RESUMO DOS TESTES")
print("=" * 80)
print(f"Total de testes: {results['total_tests']}")
print(f"Passou: {results['passed']}")
print(f"Falhou: {results['failed']}")
print(f"Taxa de sucesso: {(results['passed']/results['total_tests']*100):.1f}%")

if results["errors"]:
    print(f"\nERROS ENCONTRADOS ({len(results['errors'])}):")
    for error in results["errors"]:
        print(f"   - {error['test_id']}: {error['error']}")

# Save results to JSON
output_file = "test_results_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\nResultados salvos em: {output_file}")
print("=" * 80)

