import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")
TIMEOUT = 30


def test_clinical_document_generation_with_ai_support():
    headers = {
        "Content-Type": "application/json"
    }

    # Step 1: Create clinical document with AI assistance (automatic generation)
    create_auto_payload = {
        "type": "automatic",
        "ai_assistance": True,
        "content": None  # Content not needed, AI generates it
    }
    try:
        create_auto_resp = requests.post(
            f"{BASE_URL}/api/clinical-documents",
            json=create_auto_payload,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert create_auto_resp.status_code == 201, f"Auto generation creation failed: {create_auto_resp.text}"
        auto_doc = create_auto_resp.json()
        assert "id" in auto_doc and isinstance(auto_doc["id"], (int, str)), "Auto document ID missing or invalid"
        assert auto_doc.get("content"), "AI generated content should not be empty"
        doc_id_auto = auto_doc["id"]

        # Verify document is editable by fetching it
        get_auto_resp = requests.get(
            f"{BASE_URL}/api/clinical-documents/{doc_id_auto}",
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert get_auto_resp.status_code == 200, f"Fetching auto generated document failed: {get_auto_resp.text}"
        fetched_auto_doc = get_auto_resp.json()
        assert fetched_auto_doc.get("content") == auto_doc.get("content"), "Fetched document content mismatch"

        # Try to update the document content (manual edit)
        updated_content_auto = fetched_auto_doc["content"] + "\nEdited manually."
        update_auto_payload = {
            "content": updated_content_auto
        }
        update_auto_resp = requests.put(
            f"{BASE_URL}/api/clinical-documents/{doc_id_auto}",
            json=update_auto_payload,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert update_auto_resp.status_code == 200, f"Updating auto generated document failed: {update_auto_resp.text}"
        updated_doc_auto = update_auto_resp.json()
        assert updated_doc_auto.get("content") == updated_content_auto, "Document content was not updated properly"

    finally:
        # Cleanup auto generated document if created
        if 'doc_id_auto' in locals():
            requests.delete(
                f"{BASE_URL}/api/clinical-documents/{doc_id_auto}",
                headers=headers,
                auth=AUTH,
                timeout=TIMEOUT,
            )

    # Step 2: Create clinical document manually with AI assistance (manual creation + AI support on demand)
    try:
        create_manual_payload = {
            "type": "manual",
            "ai_assistance": True,
            "content": "Initial manual clinical notes."
        }
        create_manual_resp = requests.post(
            f"{BASE_URL}/api/clinical-documents",
            json=create_manual_payload,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert create_manual_resp.status_code == 201, f"Manual creation failed: {create_manual_resp.text}"
        manual_doc = create_manual_resp.json()
        assert "id" in manual_doc and isinstance(manual_doc["id"], (int, str)), "Manual document ID missing or invalid"
        doc_id_manual = manual_doc["id"]
        assert manual_doc.get("content") == "Initial manual clinical notes.", "Initial content mismatch"

        # Trigger AI enhancement/support on the manual document (simulate AI assistance endpoint)
        ai_support_payload = {
            "document_id": doc_id_manual,
            "action": "enhance"
        }
        ai_support_resp = requests.post(
            f"{BASE_URL}/api/clinical-documents/ai-support",
            json=ai_support_payload,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert ai_support_resp.status_code == 200, f"AI support enhancement failed: {ai_support_resp.text}"
        ai_supported_doc = ai_support_resp.json()
        assert "content" in ai_supported_doc and len(ai_supported_doc["content"]) > len(manual_doc["content"]), "AI support did not enhance content"

        # Verify document is still editable after AI enhancement
        update_manual_payload = {
            "content": ai_supported_doc["content"] + "\nManual edit after AI support."
        }
        update_manual_resp = requests.put(
            f"{BASE_URL}/api/clinical-documents/{doc_id_manual}",
            json=update_manual_payload,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert update_manual_resp.status_code == 200, f"Updating manual document failed: {update_manual_resp.text}"
        updated_manual_doc = update_manual_resp.json()
        assert updated_manual_doc.get("content") == update_manual_payload["content"], "Manual document content was not updated properly"

    finally:
        # Cleanup manual created document if created
        if 'doc_id_manual' in locals():
            requests.delete(
                f"{BASE_URL}/api/clinical-documents/{doc_id_manual}",
                headers=headers,
                auth=AUTH,
                timeout=TIMEOUT,
            )


test_clinical_document_generation_with_ai_support()